// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/**
 * Telegram's delivery endpoint. It authenticates with the per-bot secret rather than
 * an admin session, and answers immediately: a slow reply makes Telegram retry and
 * deliver the same update twice.
 */

import type { BunRequest } from "bun";
import type { Update } from "grammy/types";
import type { BotManager } from "../../bots/manager.ts";

const SECRET_HEADER = "x-telegram-bot-api-secret-token";

export function webhookRoutes(manager: BotManager) {
  const receive = async (req: BunRequest<"/tg/:botId">): Promise<Response> => {
    const { botId } = req.params;

    const update = (await req.json().catch(() => null)) as Update | null;
    if (!update) return new Response(null, { status: 400 });

    const result = manager.deliver(botId, req.headers.get(SECRET_HEADER), update);
    if (result.ok) return new Response(null, { status: 200 });

    // 401 is final; 503 tells Telegram to retry once the runner is back.
    return new Response(null, { status: result.reason === "unauthorized" ? 401 : 503 });
  };

  return {
    "/tg/:botId": { POST: receive },
  };
}
