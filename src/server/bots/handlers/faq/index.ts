// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import { InlineKeyboard } from "grammy";
import { privateChatsOnly } from "../shared/guards.ts";
import type { Handler } from "../types.ts";
import { findTopic, TOPICS } from "./topics.ts";

const CALLBACK_PREFIX = "faq";

function menu(): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (const topic of TOPICS) {
    keyboard.text(topic.label, `${CALLBACK_PREFIX}:${topic.id}`).row();
  }
  return keyboard;
}

export const handler: Handler = {
  label: "FAQ",
  description: "Answers common questions from a button menu.",

  register(bot) {
    privateChatsOnly(bot);

    bot.command(["start", "help"], ctx =>
      ctx.reply("What would you like to know?", { reply_markup: menu() }),
    );

    bot.callbackQuery(new RegExp(`^${CALLBACK_PREFIX}:(.+)$`), async ctx => {
      const topic = findTopic(ctx.match[1] ?? "");

      // Telegram shows a loading spinner on the button until the query is answered.
      await ctx.answerCallbackQuery();
      await ctx.reply(topic?.answer ?? "That topic is no longer available.", {
        reply_markup: menu(),
      });
    });

    bot.on("message:text", ctx =>
      ctx.reply("Pick a topic below, or send /help.", { reply_markup: menu() }),
    );
  },
};
