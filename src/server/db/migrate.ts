// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/** Schema definition. Idempotent, so it can run on every boot. */

import { db, NOW } from "./client.ts";

// STRICT tables enforce column types. Timestamps are ISO-8601 UTC text, which sorts
// and compares correctly as plain strings.
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS bots (
    id             TEXT PRIMARY KEY,
    name           TEXT NOT NULL,
    username       TEXT,
    token_enc      TEXT NOT NULL,
    handler_key    TEXT NOT NULL,
    mode           TEXT NOT NULL DEFAULT 'polling' CHECK (mode IN ('webhook', 'polling')),
    webhook_secret TEXT NOT NULL,
    enabled        INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0, 1)),
    status         TEXT NOT NULL DEFAULT 'stopped'
                     CHECK (status IN ('stopped', 'starting', 'running', 'error')),
    last_error     TEXT,
    last_error_at  TEXT,
    created_at     TEXT NOT NULL DEFAULT (${NOW})
  ) STRICT;

  CREATE TABLE IF NOT EXISTS events (
    id      INTEGER PRIMARY KEY,
    bot_id  TEXT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    level   TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
    message TEXT NOT NULL,
    at      TEXT NOT NULL DEFAULT (${NOW})
  ) STRICT;
  CREATE INDEX IF NOT EXISTS events_bot_at_idx ON events (bot_id, at DESC);

  CREATE TABLE IF NOT EXISTS audit (
    id     INTEGER PRIMARY KEY,
    actor  TEXT NOT NULL,
    action TEXT NOT NULL,
    bot_id TEXT,
    detail TEXT CHECK (detail IS NULL OR json_valid(detail)),
    at     TEXT NOT NULL DEFAULT (${NOW})
  ) STRICT;

  CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT PRIMARY KEY,
    actor      TEXT NOT NULL,
    expires_at TEXT NOT NULL
  ) STRICT;
`;

export function migrate(): void {
  db.transaction(() => db.run(SCHEMA))();
}
