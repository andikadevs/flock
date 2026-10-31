/** All reads and writes of the `bots` table. Nothing else knows its column names. */

import type { BotMode, BotRecord, BotStatus } from "../bots/types.ts";
import { sql } from "./client.ts";

type BotRow = {
  id: string;
  name: string;
  username: string | null;
  token_enc: string;
  handler_key: string;
  mode: BotMode;
  webhook_secret: string;
  enabled: boolean;
  status: BotStatus;
  last_error: string | null;
  last_error_at: Date | null;
  created_at: Date;
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
    enabled: row.enabled,
    status: row.status,
    lastError: row.last_error,
    lastErrorAt: row.last_error_at,
    createdAt: row.created_at,
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

export async function list(): Promise<BotRecord[]> {
  const rows: BotRow[] = await sql`SELECT * FROM bots ORDER BY created_at ASC`;
  return rows.map(toRecord);
}

export async function find(id: string): Promise<BotRecord | null> {
  const [row]: BotRow[] = await sql`SELECT * FROM bots WHERE id = ${id}`;
  return row ? toRecord(row) : null;
}

export async function create(bot: NewBot): Promise<BotRecord> {
  const [row]: BotRow[] = await sql`
    INSERT INTO bots (name, username, token_enc, handler_key, mode, webhook_secret)
    VALUES (${bot.name}, ${bot.username}, ${bot.tokenEnc},
            ${bot.handlerKey}, ${bot.mode}, ${bot.webhookSecret})
    RETURNING *
  `;
  return toRecord(row!);
}

export async function remove(id: string): Promise<void> {
  await sql`DELETE FROM bots WHERE id = ${id}`;
}

export async function updateSettings(
  id: string,
  settings: { name: string; handlerKey: string; mode: BotMode },
): Promise<void> {
  await sql`
    UPDATE bots
    SET name = ${settings.name}, handler_key = ${settings.handlerKey}, mode = ${settings.mode}
    WHERE id = ${id}
  `;
}

export async function updateToken(id: string, tokenEnc: string): Promise<void> {
  await sql`UPDATE bots SET token_enc = ${tokenEnc} WHERE id = ${id}`;
}

export async function setEnabled(id: string, enabled: boolean): Promise<void> {
  await sql`UPDATE bots SET enabled = ${enabled} WHERE id = ${id}`;
}

export async function setUsername(id: string, username: string | null): Promise<void> {
  await sql`UPDATE bots SET username = ${username} WHERE id = ${id}`;
}

export async function setStatus(id: string, status: BotStatus): Promise<void> {
  await sql`UPDATE bots SET status = ${status} WHERE id = ${id}`;
}

/** A healthy start clears the previous failure, so stale errors do not linger. */
export async function markRunning(id: string): Promise<void> {
  await sql`
    UPDATE bots
    SET status = 'running', last_error = NULL, last_error_at = NULL
    WHERE id = ${id}
  `;
}

export async function setFailure(id: string, status: BotStatus, error: string): Promise<void> {
  await sql`
    UPDATE bots
    SET status = ${status}, last_error = ${error}, last_error_at = now()
    WHERE id = ${id}
  `;
}
