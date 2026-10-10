import { randomBytes } from "node:crypto";
import { api, APIError, Header, Query } from "encore.dev/api";
import { appMeta } from "encore.dev";
import { secret } from "encore.dev/config";
import log from "encore.dev/log";
import * as client from "./client";
import { TabroomError } from "./client";
import * as parse from "./parse";
import {
  SESSION_COOKIE,
  SessionData,
  clearedSessionCookie,
  readCookie,
  seal,
  sessionCookie,
  unseal,
} from "./session";

// ---------------------------------------------------------------------------
// Session plumbing

// Set with: encore secret set --type dev,prod TabroomSessionKey
const sessionKeySecret = secret("TabroomSessionKey");
let fallbackKey: string | undefined;

function sessionKey(): string {
  try {
    const k = sessionKeySecret();
    if (k) return k;
  } catch {
    /* not set */
  }
  if (!fallbackKey) {
    fallbackKey = randomBytes(32).toString("hex");
    log.warn("TabroomSessionKey secret is not set; using a random key (everyone is signed out on restart)");
  }
  return fallbackKey;
}

function secureCookies(): boolean {
  return appMeta().environment.cloud !== "local";
}

function sessionFrom(cookieHeader: string | undefined): SessionData | undefined {
  return unseal(readCookie(cookieHeader, SESSION_COOKIE), sessionKey());
}

function requireSession(cookieHeader: string | undefined): SessionData {
  const s = sessionFrom(cookieHeader);
  if (!s) throw APIError.unauthenticated("Please sign in with your Tabroom account.");
  return s;
}

function toAPIError(err: unknown): APIError {
  if (err instanceof APIError) return err;
  if (err instanceof TabroomError) {
    switch (err.kind) {
      case "auth":
      case "credentials":
        return APIError.unauthenticated(err.message);
      case "notfound":
        return APIError.notFound(err.message);
      case "profile":
        return APIError.failedPrecondition(err.message);
      default:
        return APIError.unavailable(err.message);
    }
  }
  log.error(err, "unexpected error talking to tabroom");
  return APIError.internal("Something went wrong reading Tabroom. Please try again.");
}

async function guard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw toAPIError(err);
  }
}

// Public pages are cached briefly so a room full of debaters refreshing the
// pairing doesn't hammer Tabroom.
const cache = new Map<string, { at: number; page: client.Page }>();
const CACHE_MS = 30_000;

async function publicPage(path: string, token?: string): Promise<client.Page> {
  if (token) return client.getPage(path, token).catch(() => client.getPage(path));
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.page;
  const page = await client.getPage(path);
  cache.set(path, { at: Date.now(), page });
  if (cache.size > 500) cache.delete(cache.keys().next().value!);
  return page;
}

// ---------------------------------------------------------------------------
// Auth

interface CookieParams {
  cookie?: Header<"Cookie">;
}

interface LoginParams {
  email: string;
  password: string;
}

interface LoginResponse {
  setCookie: Header<"Set-Cookie">;
  email: string;
}

/** Signs in to Tabroom with the user's email + password. The password is never stored. */
export const login = api<LoginParams, LoginResponse>(
  { expose: true, method: "POST", path: "/api/auth/login" },
  async ({ email, password }) =>
    guard(async () => {
      if (!email?.trim() || !password) {
        throw APIError.invalidArgument("Enter your Tabroom email and password.");
      }
      const { token } = await client.login(email, password);
      const value = seal({ token, email: email.trim().toLowerCase(), iat: Math.floor(Date.now() / 1000) }, sessionKey());
      return { setCookie: sessionCookie(value, secureCookies()), email: email.trim().toLowerCase() };
    }),
);

interface LogoutResponse {
  setCookie: Header<"Set-Cookie">;
}

export const logout = api<CookieParams, LogoutResponse>(
  { expose: true, method: "POST", path: "/api/auth/logout" },
  async ({ cookie }) => {
    const s = sessionFrom(cookie);
    if (s) await client.logout(s.token);
    return { setCookie: clearedSessionCookie(secureCookies()) };
  },
);

interface SessionResponse {
  signedIn: boolean;
  email?: string;
}

export const session = api<CookieParams, SessionResponse>(
  { expose: true, method: "GET", path: "/api/auth/session" },
  async ({ cookie }) => {
    const s = sessionFrom(cookie);
    return s ? { signedIn: true, email: s.email } : { signedIn: false };
  },
);

// ---------------------------------------------------------------------------
// "My stuff": competitor entries and judging assignments

interface DashboardResponse {
  name: string;
  email: string;
  current: parse.CurrentEntry[];
  upcoming: parse.UpcomingEntry[];
  judging: parse.JudgeAssignment[];
  warnings: string[];
  fetchedAt: string;
}

export const dashboard = api<CookieParams, DashboardResponse>(
  { expose: true, method: "GET", path: "/api/me" },
  async ({ cookie }) =>
    guard(async () => {
      const s = requireSession(cookie);
      const [student, judge] = await Promise.allSettled([
        client.getPage("/user/student/index.mhtml", s.token),
        client.getPage("/user/judge/panels.mhtml", s.token),
      ]);

      // A dead session fails both; surface that as a sign-in prompt.
      for (const r of [student, judge]) {
        if (r.status === "rejected" && r.reason instanceof TabroomError && r.reason.kind === "auth") throw r.reason;
      }
      if (student.status === "rejected" && judge.status === "rejected") throw student.reason;

      const warnings: string[] = [];
      let name = "";
      let current: parse.CurrentEntry[] = [];
      let upcoming: parse.UpcomingEntry[] = [];
      let judging: parse.JudgeAssignment[] = [];

      if (student.status === "fulfilled") {
        name = parse.personName(student.value.html);
        ({ current, upcoming } = parse.parseStudentDashboard(student.value.html));
      } else {
        warnings.push(student.reason instanceof Error ? student.reason.message : "Could not load your entries.");
      }
      if (judge.status === "fulfilled") {
        name ||= parse.personName(judge.value.html);
        judging = parse.parseJudgeAssignments(judge.value.html);
      } else {
        warnings.push("Could not load your judging assignments.");
      }

      return { name, email: s.email, current, upcoming, judging, warnings, fetchedAt: new Date().toISOString() };
    }),
);

// ---------------------------------------------------------------------------
// Tournaments (public, but sent with the user's session when signed in)

interface ListParams extends CookieParams {
  search?: Query<string>;
}

interface ListResponse {
  tournaments: parse.TournamentSummary[];
}

export const tournaments = api<ListParams, ListResponse>(
  { expose: true, method: "GET", path: "/api/tournaments" },
  async ({ search }) =>
    guard(async () => {
      const q = (search ?? "").trim();
      if (q) {
        const page = await publicPage(`/index/search.mhtml?search=${encodeURIComponent(q)}`);
        return { tournaments: parse.parseSearchResults(page.html) };
      }
      const page = await publicPage("/index/index.mhtml");
      return { tournaments: parse.parseTournamentList(page.html) };
    }),
);

interface TournamentParams extends CookieParams {
  id: number;
}

interface TournamentResponse {
  id: number;
  name: string;
  subtitle: string;
  tabs: string[];
  events: parse.PostedEvent[];
  tabroomUrl: string;
}

export const tournament = api<TournamentParams, TournamentResponse>(
  { expose: true, method: "GET", path: "/api/tournaments/:id" },
  async ({ id, cookie }) =>
    guard(async () => {
      const token = sessionFrom(cookie)?.token;
      const [home, postings] = await Promise.all([
        publicPage(`/index/tourn/index.mhtml?tourn_id=${id}`, token),
        publicPage(`/index/tourn/postings/index.mhtml?tourn_id=${id}`, token).catch(() => undefined),
      ]);
      const header = parse.parseTournamentHeader(home.html);
      if (!header.name) throw APIError.notFound("We couldn't find that tournament on Tabroom.");
      return {
        id,
        ...header,
        events: postings ? parse.parsePostings(postings.html) : [],
        tabroomUrl: `${client.TABROOM_BASE}/index/tourn/index.mhtml?tourn_id=${id}`,
      };
    }),
);

interface ResultsParams extends CookieParams {
  id: number;
  event?: Query<number>;
}

export const results = api<ResultsParams, parse.ResultsMenu>(
  { expose: true, method: "GET", path: "/api/tournaments/:id/results" },
  async ({ id, event, cookie }) =>
    guard(async () => {
      const token = sessionFrom(cookie)?.token;
      const qs = `tourn_id=${id}` + (event ? `&event_id=${event}` : "");
      const page = await publicPage(`/index/tourn/results/index.mhtml?${qs}`, token);
      return parse.parseResultsMenu(page.html);
    }),
);

// ---------------------------------------------------------------------------
// Generic viewer for pairings / results pages

interface ViewParams extends CookieParams {
  path: Query<string>;
}

interface ViewResponse extends parse.GenericPage {
  path: string;
  tabroomUrl: string;
}

export const view = api<ViewParams, ViewResponse>(
  { expose: true, method: "GET", path: "/api/view" },
  async ({ path, cookie }) =>
    guard(async () => {
      const safe = client.safeViewPath(path ?? "");
      if (!safe) throw APIError.invalidArgument("That isn't a Tabroom pairing or results page.");
      const token = sessionFrom(cookie)?.token;
      const page = await publicPage(safe, token);
      return { ...parse.parseGenericPage(page.html, safe), path: safe, tabroomUrl: client.TABROOM_BASE + safe };
    }),
);
