// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/**
 * OpenID Connect authorization code flow with PKCE against the configured issuer.
 *
 * The ID token's signature is not verified locally: it is fetched over TLS straight
 * from the token endpoint using an authenticated back channel, which OIDC Core
 * 3.1.3.7 (item 6) explicitly accepts in place of signature validation. Issuer,
 * audience, expiry and nonce are still checked.
 */

import { assertOidcConfigured, config } from "../config.ts";

type Discovery = {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint?: string;
};

export type IdentityClaims = {
  sub: string;
  /** Only an address the provider has verified; anything else is not an identity. */
  email: string | null;
  name: string | null;
};

type TokenResponse = { id_token?: string; access_token?: string; error?: string };

type IdTokenClaims = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nonce?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

let discoveryCache: Promise<Discovery> | null = null;

export function discover(): Promise<Discovery> {
  assertOidcConfigured();
  discoveryCache ??= (async () => {
    const response = await fetch(`${config.oidc.issuer}/.well-known/openid-configuration`);
    if (!response.ok) {
      discoveryCache = null;
      throw new Error(`OIDC discovery failed with status ${response.status}.`);
    }
    return (await response.json()) as Discovery;
  })();
  return discoveryCache;
}

export async function authorizationUrl(params: {
  state: string;
  nonce: string;
  codeChallenge: string;
}): Promise<string> {
  const { authorization_endpoint } = await discover();
  const url = new URL(authorization_endpoint);
  url.search = new URLSearchParams({
    client_id: config.oidc.clientId,
    redirect_uri: config.oidc.redirectUri,
    response_type: "code",
    scope: config.oidc.scope,
    state: params.state,
    nonce: params.nonce,
    code_challenge: params.codeChallenge,
    code_challenge_method: "S256",
  }).toString();
  return url.toString();
}

export async function exchangeCode(code: string, codeVerifier: string, nonce: string) {
  const { token_endpoint } = await discover();

  const credentials = btoa(`${config.oidc.clientId}:${config.oidc.clientSecret}`);
  const response = await fetch(token_endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.oidc.redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  const tokens = (await response.json()) as TokenResponse;
  if (!response.ok || !tokens.id_token) {
    throw new Error(`Token exchange failed: ${tokens.error ?? response.status}`);
  }

  return toIdentity(decodeIdToken(tokens.id_token), nonce);
}

function decodeIdToken(idToken: string): IdTokenClaims {
  const payload = idToken.split(".")[1];
  if (!payload) throw new Error("Malformed ID token.");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as IdTokenClaims;
}

export function toIdentity(claims: IdTokenClaims, expectedNonce: string): IdentityClaims {
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];

  if (claims.iss !== config.oidc.issuer) throw new Error("ID token issuer mismatch.");
  if (!audiences.includes(config.oidc.clientId)) throw new Error("ID token audience mismatch.");
  if (!claims.exp || claims.exp * 1000 <= Date.now()) throw new Error("ID token has expired.");
  if (claims.nonce !== expectedNonce) throw new Error("ID token nonce mismatch.");
  if (!claims.sub) throw new Error("ID token has no subject.");

  return {
    sub: claims.sub,
    // Many providers let users type any address; an unverified one could impersonate an admin.
    email: claims.email_verified === true ? (claims.email ?? null) : null,
    name: claims.name ?? null,
  };
}

/** Where to send the browser so the identity provider also ends its own session. */
export async function endSessionUrl(): Promise<string | null> {
  const { end_session_endpoint } = await discover();
  if (!end_session_endpoint) return null;

  const url = new URL(end_session_endpoint);
  url.searchParams.set("client_id", config.oidc.clientId);
  url.searchParams.set("post_logout_redirect_uri", config.appUrl);
  return url.toString();
}
