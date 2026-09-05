/** The OIDC redirect dance: start at /auth/login, come back at /auth/callback. */

import type { BunRequest } from "bun";
import { actorFor, isAdmin } from "../../auth/admin-access.ts";
import * as transaction from "../../auth/login-transaction.ts";
import { authorizationUrl, exchangeCode } from "../../auth/oidc-client.ts";
import { createChallenge } from "../../auth/pkce.ts";
import * as audit from "../../db/audit.repo.ts";
import { createSession, sessionCookie } from "../session.ts";

const redirect = (location: string, cookies: string[]): Response => {
  const headers = new Headers({ Location: location });
  for (const value of cookies) headers.append("Set-Cookie", value);
  return new Response(null, { status: 302, headers });
};

const failure = (reason: string): Response =>
  new Response(`Sign-in failed: ${reason}`, {
    status: 403,
    headers: { "Set-Cookie": transaction.endCookie() },
  });

export function authRoutes() {
  const begin = async (): Promise<Response> => {
    const challenge = createChallenge();
    const url = await authorizationUrl(challenge);
    return redirect(url, [transaction.beginCookie(challenge)]);
  };

  const callback = async (req: BunRequest): Promise<Response> => {
    const params = new URL(req.url).searchParams;
    const error = params.get("error");
    if (error) return failure(error);

    const pending = transaction.read(req);
    const code = params.get("code");
    if (!pending || !code) return failure("the sign-in request expired. Try again.");
    if (params.get("state") !== pending.state) return failure("state mismatch.");

    let identity;
    try {
      identity = await exchangeCode(code, pending.codeVerifier, pending.nonce);
    } catch (err) {
      return failure((err as Error).message);
    }

    if (!isAdmin(identity)) return failure("this account is not an administrator.");

    const actor = actorFor(identity);
    const session = await createSession(actor);
    await audit.record(actor, "session.login");

    return redirect("/", [sessionCookie(session.id), transaction.endCookie()]);
  };

  return {
    "/auth/login": { GET: begin },
    "/auth/callback": { GET: callback },
  };
}
