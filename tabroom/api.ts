import { randomBytes } from "node:crypto";
import { api, APIError, ErrCode, Header, Query } from "encore.dev/api";
import { appMeta } from "encore.dev";
import { secret } from "encore.dev/config";
import log from "encore.dev/log";
import * as h from "./handlers";
import type * as parse from "./parse";

// Encore endpoints. The logic lives in handlers.ts so the same code can also
// run as a Vercel function (see /api/router.ts).

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

function ctx(cookie?: string): h.Ctx {
  return { cookie, sessionKey: sessionKey(), secureCookies: appMeta().environment.cloud !== "local" };
}

const CODES: Record<h.ErrorCode, ErrCode> = {
  invalid_argument: ErrCode.InvalidArgument,
  unauthenticated: ErrCode.Unauthenticated,
  not_found: ErrCode.NotFound,
  failed_precondition: ErrCode.FailedPrecondition,
  unavailable: ErrCode.Unavailable,
  internal: ErrCode.Internal,
};

async function guard<T>(fn: () => Promise<T> | T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const e = h.toHttpError(err);
    throw new APIError(CODES[e.code], e.message);
  }
}

interface CookieParams {
  cookie?: Header<"Cookie">;
}

interface WithSetCookie {
  setCookie: Header<"Set-Cookie">;
}

interface LoginParams {
  email: string;
  password: string;
}

/** Signs in to Tabroom with the user's email + password. The password is never stored. */
export const login = api<LoginParams, WithSetCookie & { email: string }>(
  { expose: true, method: "POST", path: "/api/auth/login" },
  async ({ email, password }) => guard(() => h.login(ctx(), email, password)),
);

export const logout = api<CookieParams, WithSetCookie>(
  { expose: true, method: "POST", path: "/api/auth/logout" },
  async ({ cookie }) => guard(() => h.logout(ctx(cookie))),
);

export const session = api<CookieParams, h.SessionResponse>(
  { expose: true, method: "GET", path: "/api/auth/session" },
  async ({ cookie }) => guard(() => h.session(ctx(cookie))),
);

export const dashboard = api<CookieParams, h.DashboardResponse>(
  { expose: true, method: "GET", path: "/api/me" },
  async ({ cookie }) => guard(() => h.dashboard(ctx(cookie))),
);

interface ListParams {
  search?: Query<string>;
}

export const tournaments = api<ListParams, { tournaments: parse.TournamentSummary[] }>(
  { expose: true, method: "GET", path: "/api/tournaments" },
  async ({ search }) => guard(() => h.tournaments(search)),
);

interface TournamentParams extends CookieParams {
  id: number;
}

export const tournament = api<TournamentParams, h.TournamentResponse>(
  { expose: true, method: "GET", path: "/api/tournaments/:id" },
  async ({ id, cookie }) => guard(() => h.tournament(ctx(cookie), id)),
);

interface ResultsParams extends CookieParams {
  id: number;
  event?: Query<number>;
}

export const results = api<ResultsParams, parse.ResultsMenu>(
  { expose: true, method: "GET", path: "/api/tournaments/:id/results" },
  async ({ id, event, cookie }) => guard(() => h.results(ctx(cookie), id, event)),
);

interface ViewParams extends CookieParams {
  path: Query<string>;
}

export const view = api<ViewParams, h.ViewResponse>(
  { expose: true, method: "GET", path: "/api/view" },
  async ({ path, cookie }) => guard(() => h.view(ctx(cookie), path)),
);
