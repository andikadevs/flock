/**
 * Every call to Telegram's Bot API that the control plane makes itself. Bot traffic
 * belongs to the runner processes; this is only about registration and validation.
 */

import { Api } from "grammy";

export type BotIdentity = { id: number; username: string | null };

/** Doubles as token validation: an invalid token fails here, before anything is stored. */
export async function identify(token: string): Promise<BotIdentity> {
  const me = await new Api(token).getMe();
  return { id: me.id, username: me.username ?? null };
}

export async function enableWebhook(token: string, url: string, secret: string): Promise<void> {
  await new Api(token).setWebhook(url, {
    secret_token: secret,
    drop_pending_updates: true,
  });
}

/**
 * Also required before switching a bot to polling: Telegram refuses `getUpdates`
 * with a 409 while a webhook is registered.
 */
export async function disableWebhook(token: string): Promise<void> {
  await new Api(token).deleteWebhook({ drop_pending_updates: true });
}
