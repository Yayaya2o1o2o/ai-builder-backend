import { createHash } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import * as h from "../tabroom/handlers.js";

// Vercel serverless entry point. vercel.json rewrites every /api/* request here
// with the original path in ?__path=..., and this routes it to the same
// handlers the Encore service uses.

type Req = IncomingMessage & { query: Record<string, string | string[] | undefined>; body?: unknown };

function sessionKey(): string {
  const k = process.env.TABROOM_SESSION_KEY;
  if (k) return k;
  // Stable per project so sessions survive across serverless instances.
  // Set TABROOM_SESSION_KEY in the Vercel project for a real secret.
  console.warn("TABROOM_SESSION_KEY is not set; deriving a session key from the project id");
  return createHash("sha256")
    .update(["flow", process.env.VERCEL_PROJECT_ID, process.env.VERCEL_GIT_REPO_ID].join(":"))
    .digest("hex");
}

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function send(res: ServerResponse, status: number, body: unknown, setCookie?: string) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  if (setCookie) res.setHeader("Set-Cookie", setCookie);
  res.end(JSON.stringify(body));
}

async function readJson(req: Req): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === "object") return req.body as Record<string, unknown>;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

export default async function handler(req: Req, res: ServerResponse) {
  const path = "/" + (one(req.query.__path) ?? "").replace(/^\/+/, "");
  const method = req.method ?? "GET";
  const ctx: h.Ctx = {
    cookie: req.headers.cookie,
    sessionKey: sessionKey(),
    secureCookies: !!process.env.VERCEL_ENV,
  };

  try {
    let m: RegExpMatchArray | null;
    if (method === "POST" && path === "/auth/login") {
      const body = await readJson(req).catch(() => ({}) as Record<string, unknown>);
      const r = await h.login(ctx, body.email as string | undefined, body.password as string | undefined);
      return send(res, 200, { email: r.email }, r.setCookie);
    }
    if (method === "POST" && path === "/auth/logout") {
      const r = await h.logout(ctx);
      return send(res, 200, {}, r.setCookie);
    }
    if (method === "GET" && path === "/auth/session") return send(res, 200, h.session(ctx));
    if (method === "GET" && path === "/me") return send(res, 200, await h.dashboard(ctx));
    if (method === "GET" && path === "/tournaments") return send(res, 200, await h.tournaments(one(req.query.search)));
    if (method === "GET" && (m = path.match(/^\/tournaments\/(\d+)$/))) {
      return send(res, 200, await h.tournament(ctx, Number(m[1])));
    }
    if (method === "GET" && (m = path.match(/^\/tournaments\/(\d+)\/results$/))) {
      const ev = one(req.query.event);
      return send(res, 200, await h.results(ctx, Number(m[1]), ev ? Number(ev) : undefined));
    }
    if (method === "GET" && path === "/view") return send(res, 200, await h.view(ctx, one(req.query.path)));
    return send(res, 404, { code: "not_found", message: "No such endpoint." });
  } catch (err) {
    const e = h.toHttpError(err);
    return send(res, e.status, { code: e.code, message: e.message });
  }
}
