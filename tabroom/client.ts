import * as cheerio from "cheerio";

// Low-level HTTP client for www.tabroom.com.
//
// Tabroom authenticates browsers with a "TabroomToken" cookie. To get one we
// replay what the login form does:
//   1. GET  /user/login/login.mhtml   -> form with hidden `salt` and `sha`
//      fields (the sha is tied to the caller's IP and the current hour, so the
//      POST must come from the same server shortly afterwards).
//   2. POST /user/login/login_save.mhtml with those fields + email/password.
//   3. On success Tabroom answers with a redirect and Set-Cookie: TabroomToken.
//
// The password is only forwarded to Tabroom and never stored.

export const TABROOM_BASE = (process.env.TABROOM_BASE_URL || "https://www.tabroom.com").replace(/\/+$/, "");
export const TOKEN_COOKIE = "TabroomToken";

const USER_AGENT =
  "Mozilla/5.0 (compatible; TabroomLite/1.0; +https://github.com/yayaya2o1o2o/ai-builder-backend)";
const TIMEOUT_MS = 20_000;

export class TabroomError extends Error {
  constructor(
    message: string,
    public readonly kind: "auth" | "credentials" | "upstream" | "notfound" | "profile",
  ) {
    super(message);
  }
}

export interface Page {
  html: string;
  url: string; // final URL after redirects
}

function headers(token?: string, extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "text/html,application/xhtml+xml",
    ...extra,
  };
  if (token) h["Cookie"] = `${TOKEN_COOKIE}=${token}`;
  return h;
}

async function doFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    throw new TabroomError(
      "Tabroom is not responding right now. Please try again in a moment.",
      "upstream",
    );
  }
}

/** True when Tabroom bounced us to the login page (missing/expired session). */
export function isLoginRedirect(url: string): boolean {
  return /\/user\/login\/login\.mhtml/.test(url);
}

/**
 * Fetches a Tabroom page as HTML. `path` must start with "/".
 * Pass `token` for pages that need the user to be signed in.
 */
export async function getPage(path: string, token?: string): Promise<Page> {
  const res = await doFetch(TABROOM_BASE + path, {
    method: "GET",
    headers: headers(token),
    redirect: "follow",
  });
  if (res.status >= 500) {
    throw new TabroomError("Tabroom had a problem loading that page. Please try again.", "upstream");
  }
  if (res.status === 404) {
    throw new TabroomError("That page does not exist on Tabroom.", "notfound");
  }
  const html = await res.text();
  const url = res.url || TABROOM_BASE + path;
  if (token && isLoginRedirect(url)) {
    throw new TabroomError("Your Tabroom session has ended. Please sign in again.", "auth");
  }
  if (/\/user\/login\/profile\.mhtml/.test(url) && /tz/.test(url)) {
    throw new TabroomError(
      "Tabroom needs a time zone on your profile before it will show your rounds. " +
        "Set it once at tabroom.com → Profile, then come back.",
      "profile",
    );
  }
  return { html, url };
}

function readSetCookies(res: Response): string[] {
  const h = res.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof h.getSetCookie === "function") return h.getSetCookie();
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

/** Returns the TabroomToken value from Set-Cookie headers, if a non-empty one was set. */
export function tokenFromSetCookie(setCookies: string[]): string | undefined {
  for (const c of setCookies) {
    const m = c.match(new RegExp(`(?:^|\\s)${TOKEN_COOKIE}=([^;]*)`));
    if (m && m[1] && m[1].trim() !== "") return m[1].trim();
  }
  return undefined;
}

/** Extracts all inputs of the login form so we can echo the hidden fields back. */
export function parseLoginForm(html: string): Record<string, string> {
  const $ = cheerio.load(html);
  let form = $('form[action*="login_save"]').first();
  if (!form.length) form = $("form").filter((_, f) => $(f).find('input[name="password"]').length > 0).first();
  if (!form.length) {
    throw new TabroomError("Tabroom's login page changed and could not be read.", "upstream");
  }
  const fields: Record<string, string> = {};
  form.find("input[name]").each((_, el) => {
    const name = $(el).attr("name")!;
    const type = ($(el).attr("type") || "text").toLowerCase();
    if (type === "submit" || type === "button" || type === "checkbox") return;
    fields[name] = $(el).attr("value") ?? "";
  });
  return fields;
}

/** Pulls a human-readable error out of a failed login response. */
export function loginErrorMessage(location: string | null, html: string): string {
  if (location) {
    try {
      const err = new URL(location, TABROOM_BASE).searchParams.get("err");
      if (err) return err;
    } catch {
      /* ignore */
    }
  }
  if (html) {
    const $ = cheerio.load(html);
    const msg = $(".warning, .err, .error, #err, .redtext").first().text().replace(/\s+/g, " ").trim();
    if (msg) return msg;
  }
  return "Tabroom did not accept that email and password.";
}

export interface LoginResult {
  token: string;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const formPage = await doFetch(TABROOM_BASE + "/user/login/login.mhtml", {
    method: "GET",
    headers: headers(),
    redirect: "follow",
  });
  if (!formPage.ok) {
    throw new TabroomError("Could not reach Tabroom's sign-in page. Please try again.", "upstream");
  }
  const fields = parseLoginForm(await formPage.text());
  fields["username"] = email.trim();
  fields["password"] = password;

  const res = await doFetch(TABROOM_BASE + "/user/login/login_save.mhtml", {
    method: "POST",
    headers: headers(undefined, {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: TABROOM_BASE,
      Referer: TABROOM_BASE + "/user/login/login.mhtml",
    }),
    body: new URLSearchParams(fields).toString(),
    redirect: "manual",
  });

  const token = tokenFromSetCookie(readSetCookies(res));
  if (token) return { token };

  const location = res.headers.get("location");
  const body = res.status >= 300 && res.status < 400 ? "" : await res.text().catch(() => "");
  throw new TabroomError(loginErrorMessage(location, body), "credentials");
}

export async function logout(token: string): Promise<void> {
  try {
    await doFetch(TABROOM_BASE + "/user/login/logout.mhtml", {
      method: "GET",
      headers: headers(token),
      redirect: "manual",
    });
  } catch {
    // Best effort: our own cookie is cleared regardless.
  }
}

// Pages the web app may ask us to read on its behalf (pairings and results only).
const VIEW_PATH = /^\/index\/tourn\/(postings|results)\/[a-z_]+\.mhtml$/;
const VIEW_PARAMS = ["tourn_id", "round_id", "result_id", "event_id", "entry_id", "judge_id", "jpool_id"];

/** Validates a tabroom path from the client and rebuilds it from known-safe parts. */
export function safeViewPath(raw: string): string | undefined {
  let u: URL;
  try {
    u = new URL(raw, TABROOM_BASE);
  } catch {
    return undefined;
  }
  if (u.origin !== new URL(TABROOM_BASE).origin || !VIEW_PATH.test(u.pathname)) return undefined;
  const qs = new URLSearchParams();
  for (const k of VIEW_PARAMS) {
    const v = u.searchParams.get(k);
    if (v && /^\d+$/.test(v)) qs.set(k, v);
  }
  if (!qs.get("tourn_id")) return undefined;
  return `${u.pathname}?${qs.toString()}`;
}
