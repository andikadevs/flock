// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/**
 * The manager owns one invariant: `bots.enabled` is the desired state, the process
 * table is the actual state, and `reconcile()` is the only thing that closes the gap.
 * Boot, admin toggles and crash recovery all funnel through it.
 */

import type { Update } from "grammy/types";
import { webhookUrl } from "../config.ts";
import { decryptToken, safeEqual } from "../crypto.ts";
import * as bots from "../db/bots-repo.ts";
import * as events from "../db/events-repo.ts";
import * as telegram from "../telegram/gateway.ts";
import { BotProcess } from "./bot-process.ts";
import { HEARTBEAT_TIMEOUT_MS } from "./ipc.ts";
import { RestartPolicy } from "./restart-policy.ts";
import { emptyMetrics, type BotRecord, type BotView } from "./types.ts";

const STALE_SWEEP_INTERVAL_MS = 5_000;

export type DeliveryResult =
  | { ok: true }
  | { ok: false; reason: "not-running" | "unauthorized" };

export class BotManager {
  private readonly processes = new Map<string, BotProcess>();
  private readonly policy = new RestartPolicy();
  private readonly pendingRestarts = new Map<string, ReturnType<typeof setTimeout>>();
  private sweeper: ReturnType<typeof setInterval> | null = null;

  /** Notified whenever runtime state changes, so the dashboard can be pushed an update. */
  onChange: () => void = () => {};

  async start(): Promise<void> {
    await this.reconcile();
    // Idempotent: a hot reload re-runs this against the same long-lived manager.
    this.sweeper ??= setInterval(() => this.killStaleProcesses(), STALE_SWEEP_INTERVAL_MS);
  }

  async stop(): Promise<void> {
    if (this.sweeper) clearInterval(this.sweeper);
    this.sweeper = null;
    for (const timer of this.pendingRestarts.values()) clearTimeout(timer);
    this.pendingRestarts.clear();
    await Promise.all([...this.processes.keys()].map(botId => this.stopBot(botId)));
  }

  /** Start everything that should run, stop everything that should not. */
  async reconcile(): Promise<void> {
    const records = bots.list();
    const shouldRun = new Set(records.filter(record => record.enabled).map(record => record.id));

    for (const botId of [...this.processes.keys()]) {
      if (!shouldRun.has(botId)) await this.stopBot(botId);
    }

    for (const record of records) {
      if (record.enabled && !this.processes.has(record.id)) await this.startBot(record);
    }

    this.onChange();
  }

  /** Restart a single bot in place, e.g. after its token or handler changed. */
  async restart(botId: string): Promise<void> {
    await this.stopBot(botId);
    const record = bots.find(botId);
    if (record?.enabled) await this.startBot(record);
    this.onChange();
  }

  /** Webhook mode: the HTTP layer has already answered Telegram; just hand it over. */
  deliver(botId: string, secret: string | null, update: Update): DeliveryResult {
    const process = this.processes.get(botId);
    if (!process || process.mode !== "webhook") return { ok: false, reason: "not-running" };
    if (!secret || !safeEqual(secret, process.webhookSecret)) {
      return { ok: false, reason: "unauthorized" };
    }
    return process.deliver(update) ? { ok: true } : { ok: false, reason: "not-running" };
  }

  snapshot(): BotView[] {
    return bots.list().map(record => this.toView(record));
  }

  private toView(record: BotRecord): BotView {
    const process = this.processes.get(record.id);
    return {
      id: record.id,
      name: record.name,
      username: process?.botUsername ?? record.username,
      handlerKey: record.handlerKey,
      mode: record.mode,
      enabled: record.enabled,
      status: record.status,
      lastError: record.lastError,
      lastErrorAt: record.lastErrorAt?.toISOString() ?? null,
      createdAt: record.createdAt.toISOString(),
      uptimeMs: process?.uptimeMs ?? null,
      metrics: process?.metrics ?? emptyMetrics(),
    };
  }

  private async startBot(record: BotRecord): Promise<void> {
    if (this.processes.has(record.id)) return;
    this.cancelPendingRestart(record.id);

    let token: string;
    try {
      token = decryptToken(record.tokenEnc);
    } catch {
      this.disable(record.id, "Stored token could not be decrypted. Re-enter it.");
      return;
    }

    try {
      await this.registerDelivery(record, token);
    } catch (err) {
      this.onFailure(record.id, `Telegram rejected setup: ${(err as Error).message}`, 0);
      return;
    }

    bots.setStatus(record.id, "starting");

    this.processes.set(
      record.id,
      new BotProcess(
        {
          botId: record.id,
          token,
          handlerKey: record.handlerKey,
          mode: record.mode,
          webhookSecret: record.webhookSecret,
        },
        {
          onReady: username => this.onReady(record.id, username),
          onError: message => this.onRunnerError(record.id, message),
          onLog: (level, message) => events.record(record.id, level, message),
          onExit: (code, uptimeMs) =>
            this.onFailure(record.id, `Runner exited with code ${code}.`, uptimeMs),
        },
      ),
    );
  }

  private async stopBot(botId: string): Promise<void> {
    this.cancelPendingRestart(botId);
    this.policy.clear(botId);

    const process = this.processes.get(botId);
    if (process) {
      this.processes.delete(botId);
      await process.stop();
      if (process.mode === "webhook") await this.unregisterDelivery(botId);
    }

    bots.setStatus(botId, "stopped");
  }

  /**
   * Telegram permits one delivery mechanism per token, so the unused one is always
   * torn down before the runner starts consuming.
   */
  private async registerDelivery(record: BotRecord, token: string): Promise<void> {
    if (record.mode === "webhook") {
      await telegram.enableWebhook(token, webhookUrl(record.id), record.webhookSecret);
    } else {
      await telegram.disableWebhook(token);
    }
  }

  private async unregisterDelivery(botId: string): Promise<void> {
    const record = bots.find(botId);
    if (!record) return;
    try {
      await telegram.disableWebhook(decryptToken(record.tokenEnc));
    } catch {
      // Best effort: the bot is stopping regardless, and a stale webhook just 503s.
    }
  }

  private onReady(botId: string, username: string | null): void {
    bots.setUsername(botId, username);
    bots.markRunning(botId);
    events.record(botId, "info", "Runner started.");
    this.onChange();
  }

  private onRunnerError(botId: string, message: string): void {
    events.record(botId, "error", message);
    bots.setFailure(botId, this.processes.has(botId) ? "running" : "error", message);
    this.onChange();
  }

  /** Retry with backoff, then disable, so a bad token cannot spawn-loop forever. */
  private onFailure(botId: string, reason: string, uptimeMs: number): void {
    this.processes.delete(botId);
    events.record(botId, "error", reason);

    const decision = this.policy.onCrash(botId, uptimeMs);
    if (decision.action === "give-up") {
      this.disable(botId, `${reason} Gave up after ${decision.attempts} restarts.`);
      return;
    }

    bots.setFailure(botId, "starting", reason);
    this.onChange();
    this.scheduleRestart(botId, decision.delayMs);
  }

  private scheduleRestart(botId: string, delayMs: number): void {
    this.cancelPendingRestart(botId);
    const timer = setTimeout(() => {
      this.pendingRestarts.delete(botId);
      const record = bots.find(botId);
      if (record?.enabled) void this.startBot(record);
    }, delayMs);
    this.pendingRestarts.set(botId, timer);
  }

  private cancelPendingRestart(botId: string): void {
    const timer = this.pendingRestarts.get(botId);
    if (timer) clearTimeout(timer);
    this.pendingRestarts.delete(botId);
  }

  /** Desired state must never stay `true` for something we refuse to run. */
  private disable(botId: string, reason: string): void {
    this.cancelPendingRestart(botId);
    this.policy.clear(botId);
    bots.setEnabled(botId, false);
    bots.setFailure(botId, "error", reason);
    events.record(botId, "error", reason);
    this.onChange();
  }

  private killStaleProcesses(): void {
    for (const process of this.processes.values()) {
      if (!process.isStale(HEARTBEAT_TIMEOUT_MS)) continue;
      events.record(process.botId, "warn", "Heartbeat timed out; restarting runner.");
      process.kill();
    }
  }
}
