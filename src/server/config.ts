// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/**
 * Environment configuration for the control plane (parent process only).
 * Bot runner processes receive everything they need over IPC and never read env.
 */

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${key}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

function encryptionKey(): Buffer {
  const key = Buffer.from(required("TOKEN_ENCRYPTION_KEY"), "hex");
  if (key.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes).");
  }
  return key;
}

function commaList(key: string): string[] {
  return (process.env[key] ?? "")
    .split(",")
    .map(entry => entry.trim().toLowerCase())
    .filter(Boolean);
}

const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const config = {
  /** SQLite file, created on first boot. `:memory:` keeps everything in RAM (tests). */
  databasePath: process.env.DATABASE_PATH || "data/flock.sqlite",
  port: Number(process.env.PORT ?? 3000),

  /** Where a browser reaches this dashboard. Used to build the OIDC redirect URI. */
  appUrl,

  /** Public https origin Telegram can reach. Required only for webhook-mode bots. */
  publicUrl: (process.env.PUBLIC_URL ?? "").replace(/\/+$/, ""),

  tokenKey: encryptionKey(),

  oidc: {
    issuer: (process.env.OIDC_ISSUER ?? "").replace(/\/+$/, ""),
    clientId: process.env.OIDC_CLIENT_ID ?? "",
    clientSecret: process.env.OIDC_CLIENT_SECRET ?? "",
    scope: process.env.OIDC_SCOPE ?? "openid email profile",
    /** Shown on the sign-in button, e.g. "Google" or "Keycloak". */
    providerName: process.env.OIDC_PROVIDER_NAME || "SSO",
    redirectUri: `${appUrl}/auth/callback`,
  },

  /** Deny by default: an empty allowlist admits nobody, rather than everybody. */
  adminEmails: commaList("ADMIN_EMAILS"),
  adminSubjects: commaList("ADMIN_SUBJECTS"),

  sessionTtlMs: 1000 * 60 * 60 * 12,
  isProduction: process.env.NODE_ENV === "production",
};

export function webhookUrl(botId: string): string {
  if (!config.publicUrl) {
    throw new Error(
      "PUBLIC_URL is not set, so webhook mode is unavailable. Use polling mode or set PUBLIC_URL.",
    );
  }
  return `${config.publicUrl}/tg/${botId}`;
}

export function assertOidcConfigured(): void {
  const missing = (["issuer", "clientId", "clientSecret"] as const).filter(
    key => !config.oidc[key],
  );
  if (missing.length > 0) {
    throw new Error(`OIDC is not configured. Missing: ${missing.join(", ")}.`);
  }
}
