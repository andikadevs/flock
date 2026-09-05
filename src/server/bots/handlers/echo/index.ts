import type { Handler } from "../types.ts";

export const handler: Handler = {
  label: "Echo",
  description: "Replies with whatever text it receives.",

  register(bot) {
    bot.command("start", ctx => ctx.reply("Echo bot online. Send me anything."));
    bot.on("message:text", ctx => ctx.reply(ctx.message.text));
    bot.on("message", ctx => ctx.reply("I can only echo text messages."));
  },
};
