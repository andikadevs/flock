/** Who changed what. Written on every administrative action, never on bot traffic. */

import { sql } from "./client.ts";

export type AuditAction =
  | "bot.create"
  | "bot.update"
  | "bot.delete"
  | "bot.enable"
  | "bot.disable"
  | "session.login"
  | "session.logout";

export async function record(
  actor: string,
  action: AuditAction,
  botId: string | null = null,
  detail: unknown = null,
): Promise<void> {
  const payload = detail === null ? null : JSON.stringify(detail);
  await sql`
    INSERT INTO audit (actor, action, bot_id, detail)
    VALUES (${actor}, ${action}, ${botId}, ${payload}::jsonb)
  `;
}
