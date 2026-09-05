import type { Bot } from "grammy";

export function register(bot: Bot): void {
  bot.command("start", ctx => ctx.reply("Ping bot online. Try /ping."));
  bot.command("ping", ctx => ctx.reply(`pong (${new Date().toISOString()})`));
}
