/** PKCE and anti-CSRF value generation for the authorization code flow. */

import { createHash, randomBytes } from "node:crypto";

export type LoginChallenge = {
  state: string;
  nonce: string;
  codeVerifier: string;
  codeChallenge: string;
};

const randomValue = () => randomBytes(32).toString("base64url");

export function createChallenge(): LoginChallenge {
  const codeVerifier = randomValue();
  return {
    state: randomValue(),
    nonce: randomValue(),
    codeVerifier,
    codeChallenge: createHash("sha256").update(codeVerifier).digest("base64url"),
  };
}
