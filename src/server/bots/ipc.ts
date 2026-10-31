// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/** The complete message contract between the manager and a bot runner process. */

import type { Update } from "grammy/types";
import type { BotMetrics, BotMode } from "./types.ts";

export type ParentMessage =
  | { type: "init"; token: string; handlerKey: string; mode: BotMode; dataDir: string }
  | { type: "update"; update: Update }
  | { type: "ping" }
  | { type: "shutdown" };

export type ChildMessage =
  | { type: "ready"; username: string | null }
  | { type: "heartbeat"; metrics: BotMetrics }
  | { type: "error"; message: string; fatal: boolean }
  | { type: "log"; level: "info" | "warn" | "error"; message: string };

export const HEARTBEAT_INTERVAL_MS = 5_000;

/** Three missed heartbeats: the runner is wedged, not merely busy. */
export const HEARTBEAT_TIMEOUT_MS = HEARTBEAT_INTERVAL_MS * 4;

/**
 * A runner whose parent has stopped pinging is an orphan. It must exit on its own:
 * Telegram allows one getUpdates consumer per token, so a forgotten runner would
 * fight the next one with 409 Conflict forever.
 */
export const PARENT_TIMEOUT_MS = HEARTBEAT_INTERVAL_MS * 4;
