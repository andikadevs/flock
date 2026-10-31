// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import type { Chat, User } from "grammy/types";

/** The reply for /id: the chat's ID and, in a group, the sender's own ID too. */
export function describeChat(chat: Chat, from?: User): string {
  const lines = [`Chat ID: <code>${chat.id}</code>`, `Type: ${chat.type}`];
  if (from && chat.type !== "private") lines.push(`Your user ID: <code>${from.id}</code>`);
  return lines.join("\n");
}
