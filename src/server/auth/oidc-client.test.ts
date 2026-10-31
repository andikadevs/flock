import { expect, test } from "bun:test";
import { toIdentity } from "./oidc-client.ts";

const claims = (extra: Record<string, unknown>) => ({
  iss: "https://idp.example.com",
  aud: "dashboard",
  exp: Math.floor(Date.now() / 1000) + 60,
  nonce: "n",
  sub: "user-1",
  email: "admin@example.com",
  ...extra,
});

test("keeps a verified email", () => {
  expect(toIdentity(claims({ email_verified: true }), "n").email).toBe("admin@example.com");
});

test("drops an unverified or unasserted email", () => {
  expect(toIdentity(claims({ email_verified: false }), "n").email).toBeNull();
  expect(toIdentity(claims({}), "n").email).toBeNull();
  expect(toIdentity(claims({ email_verified: "true" }), "n").email).toBeNull();
});

test("rejects a token for another client", () => {
  expect(() => toIdentity(claims({ aud: "other" }), "n")).toThrow("audience mismatch");
});
