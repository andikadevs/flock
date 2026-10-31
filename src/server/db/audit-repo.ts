// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/** Who changed what. Written on every administrative action, never on bot traffic. */

import { db } from "./client.ts";

export type AuditAction =
  | "bot.create"
  | "bot.update"
  | "bot.delete"
  | "bot.enable"
  | "bot.disable"
  | "session.login"
  | "session.logout";

export function record(
  actor: string,
  action: AuditAction,
  botId: string | null = null,
  detail: unknown = null,
): void {
  db.query(
    "INSERT INTO audit (actor, action, bot_id, detail) VALUES ($actor, $action, $botId, $detail)",
  ).run({ actor, action, botId, detail: detail === null ? null : JSON.stringify(detail) });
}
