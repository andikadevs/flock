import type { Bot } from "grammy";

export function register(bot: Bot): void {
  bot.command("start", ctx => ctx.reply("Echo bot online. Send me anything."));
  bot.on("message:text", ctx => ctx.reply(ctx.message.text));
  bot.on("message", ctx => ctx.reply("I can only echo text messages."));
}
