// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/** All reads and writes of the `bots` table. Nothing else knows its column names. */

import type { BotMode, BotRecord, BotStatus } from "../bots/types.ts";
import { db, NOW } from "./client.ts";

type BotRow = {
  id: string;
  name: string;
  username: string | null;
  token_enc: string;
  handler_key: string;
  mode: BotMode;
  webhook_secret: string;
  enabled: 0 | 1;
  status: BotStatus;
  last_error: string | null;
  last_error_at: string | null;
  created_at: string;
};

function toRecord(row: BotRow): BotRecord {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    tokenEnc: row.token_enc,
    handlerKey: row.handler_key,
    mode: row.mode,
    webhookSecret: row.webhook_secret,
    enabled: row.enabled === 1,
    status: row.status,
    lastError: row.last_error,
    lastErrorAt: row.last_error_at === null ? null : new Date(row.last_error_at),
    createdAt: new Date(row.created_at),
  };
}

export type NewBot = {
  name: string;
  username: string | null;
  tokenEnc: string;
  handlerKey: string;
  mode: BotMode;
  webhookSecret: string;
};

export function list(): BotRecord[] {
  return db.query<BotRow, []>("SELECT * FROM bots ORDER BY created_at, id").all().map(toRecord);
}

export function find(id: string): BotRecord | null {
  const row = db.query<BotRow, { id: string }>("SELECT * FROM bots WHERE id = $id").get({ id });
  return row ? toRecord(row) : null;
}

export function create(bot: NewBot): BotRecord {
  const row = db
    .query<BotRow, NewBot & { id: string }>(
      `INSERT INTO bots (id, name, username, token_enc, handler_key, mode, webhook_secret)
       VALUES ($id, $name, $username, $tokenEnc, $handlerKey, $mode, $webhookSecret)
       RETURNING *`,
    )
    .get({ id: Bun.randomUUIDv7(), ...bot });
  return toRecord(row!);
}

export function remove(id: string): void {
  db.query("DELETE FROM bots WHERE id = $id").run({ id });
}

export function updateSettings(
  id: string,
  settings: { name: string; handlerKey: string; mode: BotMode },
): void {
  db.query(
    "UPDATE bots SET name = $name, handler_key = $handlerKey, mode = $mode WHERE id = $id",
  ).run({ id, ...settings });
}

export function updateToken(id: string, tokenEnc: string): void {
  db.query("UPDATE bots SET token_enc = $tokenEnc WHERE id = $id").run({ id, tokenEnc });
}

export function setEnabled(id: string, enabled: boolean): void {
  db.query("UPDATE bots SET enabled = $enabled WHERE id = $id").run({ id, enabled });
}

export function setUsername(id: string, username: string | null): void {
  db.query("UPDATE bots SET username = $username WHERE id = $id").run({ id, username });
}

export function setStatus(id: string, status: BotStatus): void {
  db.query("UPDATE bots SET status = $status WHERE id = $id").run({ id, status });
}

/** A healthy start clears the previous failure, so stale errors do not linger. */
export function markRunning(id: string): void {
  db.query(
    "UPDATE bots SET status = 'running', last_error = NULL, last_error_at = NULL WHERE id = $id",
  ).run({ id });
}

export function setFailure(id: string, status: BotStatus, error: string): void {
  db.query(
    `UPDATE bots SET status = $status, last_error = $error, last_error_at = ${NOW} WHERE id = $id`,
  ).run({ id, status, error });
}
