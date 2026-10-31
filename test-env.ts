/** Fixed environment for `bun test`, so results never depend on a developer's .env. */

Object.assign(process.env, {
  DATABASE_PATH: ":memory:",
  TOKEN_ENCRYPTION_KEY: "00".repeat(32),
  OIDC_ISSUER: "https://idp.example.com",
  OIDC_CLIENT_ID: "dashboard",
  OIDC_CLIENT_SECRET: "secret",
  ADMIN_EMAILS: "admin@example.com",
  ADMIN_SUBJECTS: "admin-subject",
});
