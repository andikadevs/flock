import type { Handler } from "../types.ts";

export const handler: Handler = {
  label: "Ping",
  description: "Answers /ping with a timestamp.",

  register(bot) {
    bot.command("start", ctx => ctx.reply("Ping bot online. Try /ping."));
    bot.command("ping", ctx => ctx.reply(`pong (${new Date().toISOString()})`));
  },
};
