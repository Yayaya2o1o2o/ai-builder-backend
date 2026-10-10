import * as client from "./client.js";
import { TabroomError } from "./client.js";
import * as parse from "./parse.js";
import {
  SESSION_COOKIE,
  SessionData,
  clearedSessionCookie,
  readCookie,
  seal,
  sessionCookie,
  unseal,
} from "./session.js";

// Framework-neutral endpoint logic, shared by the Encore service (api.ts) and
// the Vercel function (/api/router.ts).

export type ErrorCode =
  | "invalid_argument"
  | "unauthenticated"
  | "not_found"
  | "failed_precondition"
  | "unavailable"
  | "internal";

const STATUS: Record<ErrorCode, number> = {
  invalid_argument: 400,
  unauthenticated: 401,
  not_found: 404,
  failed_precondition: 412,
  unavailable: 503,
  internal: 500,
};

export class HttpError extends Error {
  readonly status: number;
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.status = STATUS[code];
  }
}

/** Converts anything thrown by the handlers into an HttpError with a friendly message. */
export function toHttpError(err: unknown): HttpError {
  if (err instanceof HttpError) return err;
  if (err instanceof TabroomError) {
    switch (err.kind) {
      case "auth":
      case "credentials":
        return new HttpError("unauthenticated", err.message);
      case "notfound":
        return new HttpError("not_found", err.message);
      case "profile":
        return new HttpError("failed_precondition", err.message);
      default:
        return new HttpError("unavailable", err.message);
    }
  }
  console.error("unexpected error talking to tabroom", err);
  return new HttpError("internal", "Something went wrong reading Tabroom. Please try again.");
}

export interface Ctx {
  cookie?: string; // raw Cookie request header
  sessionKey: string;
  secureCookies: boolean;
}

function sessionFrom(ctx: Ctx): SessionData | undefined {
  return unseal(readCookie(ctx.cookie, SESSION_COOKIE), ctx.sessionKey);
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

export async function login(ctx: Ctx, email: string | undefined, password: string | undefined) {
  if (!email?.trim() || !password) throw new HttpError("invalid_argument", "Enter your Tabroom email and password.");
  const { token } = await client.login(email, password);
  const normalized = email.trim().toLowerCase();
  const value = seal({ token, email: normalized, iat: Math.floor(Date.now() / 1000) }, ctx.sessionKey);
  return { setCookie: sessionCookie(value, ctx.secureCookies), email: normalized };
}

export async function logout(ctx: Ctx) {
  const s = sessionFrom(ctx);
  if (s) await client.logout(s.token);
  return { setCookie: clearedSessionCookie(ctx.secureCookies) };
}

export interface SessionResponse {
  signedIn: boolean;
  email?: string;
}

export function session(ctx: Ctx): SessionResponse {
  const s = sessionFrom(ctx);
  return s ? { signedIn: true, email: s.email } : { signedIn: false };
}

// ---------------------------------------------------------------------------
// "My stuff": competitor entries and judging assignments

export interface DashboardResponse {
  name: string;
  email: string;
  current: parse.CurrentEntry[];
  upcoming: parse.UpcomingEntry[];
  judging: parse.JudgeAssignment[];
  warnings: string[];
  fetchedAt: string;
}

export async function dashboard(ctx: Ctx): Promise<DashboardResponse> {
  const s = sessionFrom(ctx);
  if (!s) throw new HttpError("unauthenticated", "Please sign in with your Tabroom account.");
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
}

// ---------------------------------------------------------------------------
// Tournaments (public, but sent with the user's session when signed in)

export async function tournaments(search: string | undefined): Promise<{ tournaments: parse.TournamentSummary[] }> {
  const q = (search ?? "").trim();
  if (q) {
    const page = await publicPage(`/index/search.mhtml?search=${encodeURIComponent(q)}`);
    return { tournaments: parse.parseSearchResults(page.html) };
  }
  const page = await publicPage("/index/index.mhtml");
  return { tournaments: parse.parseTournamentList(page.html) };
}

export interface TournamentResponse {
  id: number;
  name: string;
  subtitle: string;
  tabs: string[];
  events: parse.PostedEvent[];
  tabroomUrl: string;
}

export async function tournament(ctx: Ctx, id: number): Promise<TournamentResponse> {
  if (!Number.isInteger(id) || id <= 0) throw new HttpError("invalid_argument", "That isn't a valid tournament.");
  const token = sessionFrom(ctx)?.token;
  const [home, postings] = await Promise.all([
    publicPage(`/index/tourn/index.mhtml?tourn_id=${id}`, token),
    publicPage(`/index/tourn/postings/index.mhtml?tourn_id=${id}`, token).catch(() => undefined),
  ]);
  const header = parse.parseTournamentHeader(home.html);
  if (!header.name) throw new HttpError("not_found", "We couldn't find that tournament on Tabroom.");
  return {
    id,
    ...header,
    events: postings ? parse.parsePostings(postings.html) : [],
    tabroomUrl: `${client.TABROOM_BASE}/index/tourn/index.mhtml?tourn_id=${id}`,
  };
}

export async function results(ctx: Ctx, id: number, event?: number): Promise<parse.ResultsMenu> {
  if (!Number.isInteger(id) || id <= 0) throw new HttpError("invalid_argument", "That isn't a valid tournament.");
  const token = sessionFrom(ctx)?.token;
  const qs = `tourn_id=${id}` + (event && Number.isInteger(event) ? `&event_id=${event}` : "");
  const page = await publicPage(`/index/tourn/results/index.mhtml?${qs}`, token);
  return parse.parseResultsMenu(page.html);
}

// ---------------------------------------------------------------------------
// Generic viewer for pairings / results pages

export interface ViewResponse extends parse.GenericPage {
  path: string;
  tabroomUrl: string;
}

export async function view(ctx: Ctx, path: string | undefined): Promise<ViewResponse> {
  const safe = client.safeViewPath(path ?? "");
  if (!safe) throw new HttpError("invalid_argument", "That isn't a Tabroom pairing or results page.");
  const token = sessionFrom(ctx)?.token;
  const page = await publicPage(safe, token);
  return { ...parse.parseGenericPage(page.html, safe), path: safe, tabroomUrl: client.TABROOM_BASE + safe };
}
