/** Per-bot lifecycle and error log. Bounded, because nobody reads the 10,000th line. */

import { sql } from "./client.ts";

export type EventLevel = "info" | "warn" | "error";

export type BotEvent = { id: string; level: EventLevel; message: string; at: Date };

const MAX_EVENTS_PER_BOT = 500;

export async function record(botId: string, level: EventLevel, message: string): Promise<void> {
  await sql`INSERT INTO events (bot_id, level, message) VALUES (${botId}, ${level}, ${message})`;
}

export async function listFor(botId: string, limit = 100): Promise<BotEvent[]> {
  return await sql`
    SELECT id, level, message, at FROM events
    WHERE bot_id = ${botId}
    ORDER BY at DESC
    LIMIT ${limit}
  `;
}

export async function prune(): Promise<void> {
  await sql`
    DELETE FROM events WHERE id IN (
      SELECT id FROM (
        SELECT id, row_number() OVER (PARTITION BY bot_id ORDER BY at DESC) AS rank
        FROM events
      ) ranked
      WHERE rank > ${MAX_EVENTS_PER_BOT}
    )
  `;
}
