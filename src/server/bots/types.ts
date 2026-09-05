/** Core vocabulary of the bot domain. Shared by the database, manager and dashboard. */

export type BotMode = "webhook" | "polling";

export type BotStatus = "stopped" | "starting" | "running" | "error";

export type BotMetrics = {
  updates: number;
  errors: number;
  lastUpdateAt: number | null;
  lastError: string | null;
};

export function emptyMetrics(): BotMetrics {
  return { updates: 0, errors: 0, lastUpdateAt: null, lastError: null };
}

/** A bot as stored: desired state plus last known outcome. */
export type BotRecord = {
  id: string;
  name: string;
  username: string | null;
  tokenEnc: string;
  handlerKey: string;
  mode: BotMode;
  webhookSecret: string;
  enabled: boolean;
  status: BotStatus;
  lastError: string | null;
  lastErrorAt: Date | null;
  createdAt: Date;
};

/** A bot as shown: stored state merged with live runtime state. */
export type BotView = {
  id: string;
  name: string;
  username: string | null;
  handlerKey: string;
  mode: BotMode;
  enabled: boolean;
  status: BotStatus;
  lastError: string | null;
  lastErrorAt: string | null;
  createdAt: string;
  uptimeMs: number | null;
  metrics: BotMetrics;
};
