// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/**
 * Dashboard sessions. Identity comes from the OIDC provider; this module only issues,
 * reads and revokes the cookie that represents an already-authorized admin.
 */

import type { BunRequest } from "bun";
import { config } from "../config.ts";
import { randomSecret } from "../crypto.ts";
import * as sessions from "../db/sessions-repo.ts";
import { unauthorized } from "./responses.ts";

const COOKIE_NAME = "session";

export type Session = { id: string; actor: string };

/** Session lookup needs cookies and nothing else. */
type CookieCarrier = Pick<BunRequest, "cookies">;

export function createSession(actor: string): Session {
  const id = randomSecret();
  sessions.create(id, actor, new Date(Date.now() + config.sessionTtlMs));
  return { id, actor };
}

export function currentSession(req: CookieCarrier): Session | null {
  const id = req.cookies.get(COOKIE_NAME);
  return id ? sessions.findValid(id) : null;
}

export function signOut(req: CookieCarrier): void {
  const id = req.cookies.get(COOKIE_NAME);
  if (id) sessions.remove(id);
}

export function sessionCookie(sessionId: string): string {
  return cookie(COOKIE_NAME, sessionId, Math.floor(config.sessionTtlMs / 1000));
}

export function expiredCookie(): string {
  return cookie(COOKIE_NAME, "", 0);
}

export function cookie(name: string, value: string, maxAgeSeconds: number, path = "/"): string {
  const attributes = [
    `${name}=${value}`,
    "HttpOnly",
    `Path=${path}`,
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (config.isProduction) attributes.push("Secure");
  return attributes.join("; ");
}

export type AuthedHandler<Path extends string> = (
  req: BunRequest<Path>,
  session: Session,
) => Promise<Response> | Response;

/** Wraps a handler so it only ever sees authenticated requests. */
export function authenticated<Path extends string>(handler: AuthedHandler<Path>) {
  return async (req: BunRequest<Path>): Promise<Response> => {
    const session = currentSession(req);
    return session ? await handler(req, session) : unauthorized();
  };
}
