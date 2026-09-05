/** Schema definition. Idempotent, so it can run on every boot. */

import { sql } from "./client.ts";

export async function migrate(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS bots (
      id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name           text NOT NULL,
      username       text,
      token_enc      text NOT NULL,
      handler_key    text NOT NULL,
      mode           text NOT NULL DEFAULT 'polling' CHECK (mode IN ('webhook', 'polling')),
      webhook_secret text NOT NULL,
      enabled        boolean NOT NULL DEFAULT false,
      status         text NOT NULL DEFAULT 'stopped'
                       CHECK (status IN ('stopped', 'starting', 'running', 'error')),
      last_error     text,
      last_error_at  timestamptz,
      created_at     timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id      bigserial PRIMARY KEY,
      bot_id  uuid NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
      level   text NOT NULL,
      message text NOT NULL,
      at      timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS events_bot_at_idx ON events (bot_id, at DESC)`;

  await sql`
    CREATE TABLE IF NOT EXISTS audit (
      id     bigserial PRIMARY KEY,
      actor  text NOT NULL,
      action text NOT NULL,
      bot_id uuid,
      detail jsonb,
      at     timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id         text PRIMARY KEY,
      actor      text NOT NULL,
      expires_at timestamptz NOT NULL
    )
  `;
}
