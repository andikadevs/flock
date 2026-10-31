// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import { beforeAll, expect, test } from "bun:test";
import * as bots from "./bots-repo.ts";
import * as events from "./events-repo.ts";
import { migrate } from "./migrate.ts";
import * as sessions from "./sessions-repo.ts";

beforeAll(() => {
  migrate();
});

const newBot = (name: string): bots.NewBot => ({
  name,
  username: null,
  tokenEnc: "encrypted",
  handlerKey: "echo",
  mode: "polling",
  webhookSecret: "secret",
});

test("migrate is idempotent", () => {
  expect(() => migrate()).not.toThrow();
});

test("a created bot round-trips with real booleans and dates", () => {
  const created = bots.create(newBot("Round trip"));
  expect(created.enabled).toBe(false);
  expect(created.createdAt).toBeInstanceOf(Date);

  bots.setEnabled(created.id, true);
  bots.setFailure(created.id, "error", "boom");

  const found = bots.find(created.id)!;
  expect(found.enabled).toBe(true);
  expect(found.lastError).toBe("boom");
  expect(found.lastErrorAt).toBeInstanceOf(Date);

  bots.markRunning(created.id);
  expect(bots.find(created.id)!.lastErrorAt).toBeNull();
});

test("deleting a bot cascades to its events", () => {
  const bot = bots.create(newBot("Cascade"));
  events.record(bot.id, "info", "hello");
  expect(events.listFor(bot.id)).toHaveLength(1);

  bots.remove(bot.id);
  expect(bots.find(bot.id)).toBeNull();
  expect(events.listFor(bot.id)).toHaveLength(0);
});

test("events list newest first", () => {
  const bot = bots.create(newBot("Ordering"));
  events.record(bot.id, "info", "first");
  events.record(bot.id, "warn", "second");
  expect(events.listFor(bot.id).map(event => event.message)).toEqual(["second", "first"]);
});

test("expired sessions are not valid and get pruned", () => {
  sessions.create("live", "admin@example.com", new Date(Date.now() + 60_000));
  sessions.create("stale", "admin@example.com", new Date(Date.now() - 60_000));

  expect(sessions.findValid("live")?.actor).toBe("admin@example.com");
  expect(sessions.findValid("stale")).toBeNull();

  sessions.pruneExpired();
  expect(sessions.findValid("live")).not.toBeNull();
});
