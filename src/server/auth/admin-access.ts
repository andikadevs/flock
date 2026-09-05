/**
 * Authorization. Authenticating with the identity provider proves who someone is;
 * this decides whether that person may administer bots.
 */

import { config } from "../config.ts";
import type { IdentityClaims } from "./oidc-client.ts";

export function isAdmin(identity: IdentityClaims): boolean {
  const email = identity.email?.toLowerCase();
  return (
    config.adminSubjects.includes(identity.sub.toLowerCase()) ||
    (email !== undefined && config.adminEmails.includes(email))
  );
}

/** Stable, human-readable identifier used in sessions and the audit trail. */
export function actorFor(identity: IdentityClaims): string {
  return identity.email ?? identity.sub;
}
