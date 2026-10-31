// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/** What the dashboard needs to know about the current admin, and how to sign out. */

import type { BunRequest } from "bun";
import { endSessionUrl } from "../../auth/oidc-client.ts";
import { config } from "../../config.ts";
import * as audit from "../../db/audit-repo.ts";
import { ok, unauthorized } from "../responses.ts";
import { currentSession, expiredCookie, signOut } from "../session.ts";

export function sessionRoutes() {
  const whoami = (req: BunRequest): Response => {
    const session = currentSession(req);
    return session ? ok({ actor: session.actor }) : unauthorized();
  };

  const destroy = async (req: BunRequest): Promise<Response> => {
    const session = currentSession(req);
    signOut(req);
    if (session) audit.record(session.actor, "session.logout");

    // Offered, not followed: ending the provider session is the browser's job.
    const providerLogout = await endSessionUrl().catch(() => null);
    return Response.json(
      { providerLogoutUrl: providerLogout },
      { headers: { "Set-Cookie": expiredCookie() } },
    );
  };

  // Public: the sign-in page renders before anyone is authenticated.
  const signInOptions = (): Response => ok({ providerName: config.oidc.providerName });

  return {
    "/api/session": { GET: whoami, DELETE: destroy },
    "/api/session/options": { GET: signInOptions },
  };
}
