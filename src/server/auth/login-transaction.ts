/**
 * The short-lived state carried across the redirect to the identity provider.
 * It lives in an HttpOnly cookie rather than the database: it is worthless after
 * ten minutes and never needs to outlive the browser round trip.
 */

import type { BunRequest } from "bun";
import { cookie } from "../http/session.ts";
import type { LoginChallenge } from "./pkce.ts";

const COOKIE_NAME = "oidc_tx";
const TTL_SECONDS = 600;

export type LoginTransaction = Pick<LoginChallenge, "state" | "nonce" | "codeVerifier">;

export function beginCookie(transaction: LoginTransaction): string {
  const value = Buffer.from(JSON.stringify(transaction)).toString("base64url");
  return cookie(COOKIE_NAME, value, TTL_SECONDS, "/auth");
}

export function endCookie(): string {
  return cookie(COOKIE_NAME, "", 0, "/auth");
}

export function read(req: Pick<BunRequest, "cookies">): LoginTransaction | null {
  const raw = req.cookies.get(COOKIE_NAME);
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as LoginTransaction;
  } catch {
    return null;
  }
}
