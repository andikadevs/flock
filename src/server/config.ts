/**
 * Environment configuration for the control plane (parent process only).
 * Child bot processes receive everything they need over IPC and never read env.
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

function parseKey(hex: string): Buffer {
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes).");
  }
  return key;
}

export const config = {
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@127.0.0.1:5432/telegram_manager",
  port: Number(process.env.PORT ?? 3000),

  /** Public https origin Telegram can reach. Required only for webhook-mode bots. */
  publicUrl: (process.env.PUBLIC_URL ?? "").replace(/\/+$/, ""),

  tokenKey: parseKey(required("TOKEN_ENCRYPTION_KEY")),

  adminUser: process.env.ADMIN_USER ?? "admin",
  adminPasswordHash: required("ADMIN_PASSWORD_HASH"),

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
