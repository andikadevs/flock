// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/** Per-bot lifecycle and error log. Bounded, because nobody reads the 10,000th line. */

import { db } from "./client.ts";

export type EventLevel = "info" | "warn" | "error";

export type BotEvent = { id: number; level: EventLevel; message: string; at: string };

const MAX_EVENTS_PER_BOT = 500;

export function record(botId: string, level: EventLevel, message: string): void {
  db.query("INSERT INTO events (bot_id, level, message) VALUES ($botId, $level, $message)").run({
    botId,
    level,
    message,
  });
}

export function listFor(botId: string, limit = 100): BotEvent[] {
  return db
    .query<BotEvent, { botId: string; limit: number }>(
      `SELECT id, level, message, at FROM events
       WHERE bot_id = $botId
       ORDER BY at DESC, id DESC
       LIMIT $limit`,
    )
    .all({ botId, limit });
}

export function prune(): void {
  db.query(
    `DELETE FROM events WHERE id IN (
       SELECT id FROM (
         SELECT id, row_number() OVER (PARTITION BY bot_id ORDER BY at DESC, id DESC) AS rank
         FROM events
       )
       WHERE rank > $max
     )`,
  ).run({ max: MAX_EVENTS_PER_BOT });
}
