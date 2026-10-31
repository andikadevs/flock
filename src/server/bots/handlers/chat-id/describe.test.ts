// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import { describe, expect, test } from "bun:test";
import type { Chat, User } from "grammy/types";
import { describeChat } from "./describe.ts";

const user: User = { id: 42, is_bot: false, first_name: "Andika" };

describe("describeChat", () => {
  test("a private chat shows only the chat ID", () => {
    const chat: Chat = { id: 42, type: "private", first_name: "Andika" };
    expect(describeChat(chat, user)).toBe("Chat ID: <code>42</code>\nType: private");
  });

  test("a group also shows the sender's own ID", () => {
    const chat: Chat = { id: -1001234567890, type: "supergroup", title: "Team" };
    expect(describeChat(chat, user)).toBe(
      "Chat ID: <code>-1001234567890</code>\nType: supergroup\nYour user ID: <code>42</code>",
    );
  });

  test("without a sender, a group shows only its own ID", () => {
    const chat: Chat = { id: -42, type: "group", title: "Team" };
    expect(describeChat(chat)).toBe("Chat ID: <code>-42</code>\nType: group");
  });
});
