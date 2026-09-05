/** The complete message contract between the manager and a bot runner process. */

import type { Update } from "grammy/types";
import type { BotMetrics, BotMode } from "./types.ts";

export type ParentMessage =
  | { type: "init"; token: string; handlerKey: string; mode: BotMode }
  | { type: "update"; update: Update }
  | { type: "shutdown" };

export type ChildMessage =
  | { type: "ready"; username: string | null }
  | { type: "heartbeat"; metrics: BotMetrics }
  | { type: "error"; message: string; fatal: boolean }
  | { type: "log"; level: "info" | "warn" | "error"; message: string };

export const HEARTBEAT_INTERVAL_MS = 5_000;

/** Three missed heartbeats: the runner is wedged, not merely busy. */
export const HEARTBEAT_TIMEOUT_MS = HEARTBEAT_INTERVAL_MS * 4;
