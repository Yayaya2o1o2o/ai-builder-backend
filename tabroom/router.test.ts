import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import { afterEach, expect, test, vi } from "vitest";
import handler from "../api/router";

// Drives the Vercel function end to end with Tabroom's HTTP calls stubbed.

function call(method: string, path: string, opts: { body?: unknown; cookie?: string; query?: Record<string, string> } = {}) {
  const req = Readable.from(opts.body ? [Buffer.from(JSON.stringify(opts.body))] : []) as any;
  req.method = method;
  req.headers = opts.cookie ? { cookie: opts.cookie } : {};
  req.query = { __path: path, ...opts.query };
  const out: { status: number; headers: Record<string, string>; body: any } = { status: 0, headers: {}, body: null };
  const res: any = {
    set statusCode(v: number) { out.status = v; },
    setHeader: (k: string, v: string) => (out.headers[k.toLowerCase()] = v),
    end: (b: string) => (out.body = JSON.parse(b)),
  };
  return handler(req, res).then(() => out);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("login sets a session cookie that /auth/session accepts", async () => {
  vi.stubGlobal("fetch", async (url: string) => {
    if (url.endsWith("/user/login/login.mhtml")) {
      return new Response(readFileSync(join(__dirname, "fixtures", "login.html"), "utf8"), { status: 200 });
    }
    return new Response(null, { status: 302, headers: [["Set-Cookie", "TabroomToken=abc; path=/"], ["Location", "/user/home.mhtml"]] });
  });
  const login = await call("POST", "auth/login", { body: { email: "Me@x.org", password: "pw" } });
  expect(login.status).toBe(200);
  expect(login.body).toEqual({ email: "me@x.org" });
  const cookie = login.headers["set-cookie"].split(";")[0];
  expect(cookie).toMatch(/^tr_session=/);

  const s = await call("GET", "auth/session", { cookie });
  expect(s.body).toEqual({ signedIn: true, email: "me@x.org" });
});

test("errors come back as JSON with a status", async () => {
  expect((await call("GET", "me")).status).toBe(401);
  expect((await call("GET", "view", { query: { path: "/user/judge/ballot.mhtml?tourn_id=1" } })).status).toBe(400);
  expect((await call("GET", "nope")).status).toBe(404);
});
