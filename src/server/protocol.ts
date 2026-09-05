/**
 * IPC contract between the manager (parent) and each bot runner (child), plus the
 * shared shapes the dashboard consumes.
 */

import type { Update } from "grammy/types";

export type BotMode = "webhook" | "polling";
export type BotStatus = "stopped" | "starting" | "running" | "error";

export type BotMetrics = {
  updates: number;
  errors: number;
  lastUpdateAt: number | null;
  lastError: string | null;
};

export const emptyMetrics = (): BotMetrics => ({
  updates: 0,
  errors: 0,
  lastUpdateAt: null,
  lastError: null,
});

export type ParentMessage =
  | { type: "init"; botId: string; token: string; handlerKey: string; mode: BotMode }
  | { type: "update"; update: Update }
  | { type: "shutdown" };

export type ChildMessage =
  | { type: "ready"; username: string | null }
  | { type: "heartbeat"; metrics: BotMetrics }
  | { type: "error"; message: string; fatal: boolean }
  | { type: "log"; level: "info" | "warn" | "error"; message: string };

/** A row plus its live runtime state, as sent to the dashboard. */
export type BotView = {
  id: string;
  name: string;
  username: string | null;
  handlerKey: string;
  mode: BotMode;
  enabled: boolean;
  status: BotStatus;
  tokenMask: string;
  lastError: string | null;
  lastErrorAt: string | null;
  createdAt: string;
  uptimeMs: number | null;
  metrics: BotMetrics;
};

export const HEARTBEAT_INTERVAL_MS = 5_000;
export const HEARTBEAT_TIMEOUT_MS = 20_000;
