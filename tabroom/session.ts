import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// Our own session cookie. It holds the user's TabroomToken, encrypted and
// authenticated with AES-256-GCM, so the server stays stateless (no database)
// and the browser never sees the raw Tabroom token.

export const SESSION_COOKIE = "tr_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days; Tabroom's own cookie lasts ~42 days

export interface SessionData {
  token: string; // TabroomToken cookie value
  email: string;
  iat: number; // issued at, seconds
}

function key(secret: string): Buffer {
  return createHash("sha256").update("tabroom-lite-session:" + secret).digest();
}

export function seal(data: SessionData, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, body].map((b) => b.toString("base64url")).join(".");
}

export function unseal(value: string | undefined, secret: string): SessionData | undefined {
  if (!value) return undefined;
  const parts = value.split(".");
  if (parts.length !== 3) return undefined;
  try {
    const [iv, tag, body] = parts.map((p) => Buffer.from(p, "base64url"));
    const decipher = createDecipheriv("aes-256-gcm", key(secret), iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
    const data = JSON.parse(json) as SessionData;
    if (!data.token || Date.now() / 1000 - data.iat > MAX_AGE_SECONDS) return undefined;
    return data;
  } catch {
    return undefined;
  }
}

/** Reads one cookie out of a raw Cookie header. */
export function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return undefined;
}

export function sessionCookie(value: string, secure: boolean): string {
  return [
    `${SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${MAX_AGE_SECONDS}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearedSessionCookie(secure: boolean): string {
  return [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0", secure ? "Secure" : ""]
    .filter(Boolean)
    .join("; ");
}
