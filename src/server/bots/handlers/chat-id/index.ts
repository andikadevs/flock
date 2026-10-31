// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import type { Handler } from "../types.ts";
import { describeChat } from "./describe.ts";

export const handler: Handler = {
  label: "Chat ID",
  description: "Tells people and groups their Telegram chat ID, for use in other bots.",

  register(bot) {
    bot.command(["start", "id"], ctx =>
      ctx.reply(describeChat(ctx.chat, ctx.from), { parse_mode: "HTML" }),
    );

    // Announce the group's ID as soon as the bot is added, so nobody has to ask.
    bot.on("my_chat_member", ctx => {
      const { old_chat_member: before, new_chat_member: after } = ctx.myChatMember;
      const joined = ["left", "kicked"].includes(before.status) && after.status !== "left";
      if (!joined || ctx.chat.type === "private") return;

      return ctx.reply(describeChat(ctx.chat), { parse_mode: "HTML" });
    });
  },
};
