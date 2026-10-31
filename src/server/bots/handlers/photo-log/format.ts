// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import type { Chat, User } from "grammy/types";
import { formatTime } from "./day.ts";
import type { Photo } from "./store.ts";

/** One reply stays well under Telegram's 4,096-character message limit. */
const MAX_LISTED = 50;

/**
 * A public t.me link to a message. Only supergroups and channels have one; a basic
 * group's messages cannot be linked to, so they return null.
 */
export function messageLink(chat: Chat, messageId: number): string | null {
  if ("username" in chat && chat.username) return `https://t.me/${chat.username}/${messageId}`;
  if (chat.type !== "supergroup" && chat.type !== "channel") return null;

  // Private links use the chat ID without its "-100" prefix.
  const internalId = String(chat.id).replace(/^-100/, "");
  return `https://t.me/c/${internalId}/${messageId}`;
}

/** Anonymous group admins post as the chat itself and have no `from`. */
export function senderName(from: User | undefined, chat: Chat): string {
  if (from?.username) return `@${from.username}`;
  if (from) return from.first_name;
  return ("title" in chat && chat.title) || "unknown";
}

export function photoList(dayLabel: string, photos: Photo[]): string {
  if (photos.length === 0) return `No photos on ${dayLabel}.`;

  const lines = photos
    .slice(0, MAX_LISTED)
    .map(photo => `${formatTime(photo.postedAt)} ${photo.sender}\n${photo.link}`);
  const hidden = photos.length - MAX_LISTED;
  if (hidden > 0) lines.push(`…and ${hidden} more.`);

  return [`Photos on ${dayLabel} (${photos.length}):`, ...lines].join("\n\n");
}
