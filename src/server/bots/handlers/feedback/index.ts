import { privateChatsOnly } from "../shared/guards.ts";
import type { Handler } from "../types.ts";
import { expectMessageFrom, takeExpectation } from "./inbox.ts";

export const handler: Handler = {
  label: "Feedback",
  description: "Collects a written message, one at a time, from each person.",

  register(bot) {
    privateChatsOnly(bot);

    bot.command("start", ctx =>
      ctx.reply("Send /feedback when you would like to tell us something."),
    );

    bot.command("feedback", ctx => {
      expectMessageFrom(ctx.chat.id);
      return ctx.reply("Go ahead — your next message will be recorded.");
    });

    bot.on("message:text", async ctx => {
      if (!takeExpectation(ctx.chat.id)) {
        return ctx.reply("Send /feedback first, then write your message.");
      }

      // Whatever you would do with it: a database, an email, a forward to staff.
      console.log(`[feedback] ${ctx.from.id}: ${ctx.message.text}`);
      await ctx.reply("Thank you, that has been passed on.");
    });
  },
};
