/**
 * The shared library is deliberately small: only middleware that several bots need
 * verbatim. Anything specific to one bot belongs in that bot's own folder.
 */

import type { Bot } from "grammy";

/** Ignore group and channel traffic, so a bot meant for direct messages stays quiet. */
export function privateChatsOnly(bot: Bot): void {
  bot.use((ctx, next) => (ctx.chat?.type === "private" ? next() : undefined));
}
