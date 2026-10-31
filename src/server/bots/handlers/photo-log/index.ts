// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import type { Handler } from "../types.ts";
import { formatDay, parseDay } from "./day.ts";
import { messageLink, photoList, senderName } from "./format.ts";
import { PhotoStore } from "./store.ts";

const USAGE = "Send /photos for today, or /photos YYYY-MM-DD for another day.";

export const handler: Handler = {
  label: "Photo log",
  description:
    "Keeps a link to every photo posted in a group and lists them by day. Needs privacy mode off.",

  register(bot, { dataDir }) {
    const store = PhotoStore.open(dataDir);

    bot.command("start", ctx =>
      ctx.reply(
        ctx.chat.type === "private"
          ? "Add me to a group as an admin, or turn off my privacy mode, and I will log its photos."
          : `Logging photos in this group. ${USAGE}`,
      ),
    );

    bot.command("photos", ctx => {
      const day = parseDay(ctx.match.trim() || formatDay(new Date()));
      if (!day) return ctx.reply(USAGE);

      const photos = store.between(ctx.chat.id, day.from, day.to);
      return ctx.reply(photoList(day.label, photos), {
        link_preview_options: { is_disabled: true },
      });
    });

    bot.on("message:photo", ctx => {
      const link = messageLink(ctx.chat, ctx.message.message_id);
      if (!link) return;

      store.add(ctx.chat.id, {
        link,
        sender: senderName(ctx.from, ctx.chat),
        postedAt: ctx.message.date,
      });
    });
  },
};
