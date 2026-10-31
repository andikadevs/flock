// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import { describe, expect, test } from "bun:test";
import type { Chat } from "grammy/types";
import { parseDay } from "./day.ts";
import { messageLink, photoList, senderName } from "./format.ts";
import { PhotoStore } from "./store.ts";

const supergroup: Chat = { id: -1001234567890, type: "supergroup", title: "Team" };

describe("parseDay", () => {
  test("covers one local calendar day", () => {
    const day = parseDay("2024-07-15")!;
    expect(day.from).toBe(new Date(2024, 6, 15).getTime() / 1000);
    expect(day.to).toBe(new Date(2024, 6, 16).getTime() / 1000);
  });

  test.each(["", "today", "2024-7-15", "2024-02-30", "2024-13-01"])("rejects %p", text => {
    expect(parseDay(text)).toBeNull();
  });
});

describe("messageLink", () => {
  test("a public group links by username", () => {
    expect(messageLink({ ...supergroup, username: "team" }, 7)).toBe("https://t.me/team/7");
  });

  test("a private supergroup links by internal ID", () => {
    expect(messageLink(supergroup, 7)).toBe("https://t.me/c/1234567890/7");
  });

  test("a basic group has no links", () => {
    expect(messageLink({ id: -42, type: "group", title: "Old" }, 7)).toBeNull();
  });
});

describe("senderName", () => {
  test("prefers the username, then the first name, then the chat", () => {
    const user = { id: 1, is_bot: false, first_name: "Andika" };
    expect(senderName({ ...user, username: "andikadevs" }, supergroup)).toBe("@andikadevs");
    expect(senderName(user, supergroup)).toBe("Andika");
    expect(senderName(undefined, supergroup)).toBe("Team");
  });
});

describe("PhotoStore", () => {
  test("returns one chat's photos within the range, oldest first, without duplicates", () => {
    const store = new PhotoStore(":memory:");
    store.add(1, { link: "https://t.me/c/1/2", sender: "b", postedAt: 200 });
    store.add(1, { link: "https://t.me/c/1/1", sender: "a", postedAt: 100 });
    store.add(1, { link: "https://t.me/c/1/1", sender: "a", postedAt: 100 });
    store.add(1, { link: "https://t.me/c/1/3", sender: "c", postedAt: 300 });
    store.add(2, { link: "https://t.me/c/2/1", sender: "d", postedAt: 150 });

    expect(store.between(1, 100, 300).map(photo => photo.sender)).toEqual(["a", "b"]);
  });
});

describe("photoList", () => {
  test("says so when there is nothing to list", () => {
    expect(photoList("2024-07-15", [])).toBe("No photos on 2024-07-15.");
  });

  test("caps the list and counts the rest", () => {
    const photos = Array.from({ length: 52 }, (_, index) => ({
      link: `https://t.me/c/1/${index}`,
      sender: "a",
      postedAt: 0,
    }));
    const text = photoList("2024-07-15", photos);
    expect(text.startsWith("Photos on 2024-07-15 (52):")).toBe(true);
    expect(text.endsWith("…and 2 more.")).toBe(true);
  });
});
