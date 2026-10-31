// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/**
 * Supervises exactly one runner process: spawn it, feed it updates, shut it down.
 * It holds no policy and touches no database — those belong to the manager.
 */

import type { Subprocess } from "bun";
import type { Update } from "grammy/types";
import { HEARTBEAT_INTERVAL_MS, type ChildMessage, type ParentMessage } from "./ipc.ts";
import { emptyMetrics, type BotMetrics, type BotMode } from "./types.ts";

const RUNNER_PATH = new URL("./runner.ts", import.meta.url).pathname;
const STOP_GRACE_MS = 5_000;

export type BotProcessSpec = {
  botId: string;
  token: string;
  handlerKey: string;
  mode: BotMode;
  webhookSecret: string;
  dataDir: string;
};

export type BotProcessListener = {
  onReady: (username: string | null) => void;
  onError: (message: string, fatal: boolean) => void;
  onLog: (level: "info" | "warn" | "error", message: string) => void;
  onExit: (code: number, uptimeMs: number) => void;
};

export class BotProcess {
  readonly botId: string;
  readonly mode: BotMode;
  readonly webhookSecret: string;
  readonly startedAt = Date.now();

  private readonly process: Subprocess;
  private readonly liveness: ReturnType<typeof setInterval>;
  private metricsSnapshot = emptyMetrics();
  private lastSeenAt = Date.now();
  private username: string | null = null;
  private stopping = false;

  constructor(spec: BotProcessSpec, listener: BotProcessListener) {
    this.botId = spec.botId;
    this.mode = spec.mode;
    this.webhookSecret = spec.webhookSecret;

    this.process = Bun.spawn({
      cmd: ["bun", "run", RUNNER_PATH],
      stdout: "inherit",
      stderr: "inherit",
      serialization: "json",
      ipc: (message: ChildMessage) => this.receive(message, listener),
    });

    this.send({
      type: "init",
      token: spec.token,
      handlerKey: spec.handlerKey,
      mode: spec.mode,
      dataDir: spec.dataDir,
    });

    // Tells the runner the manager is still here; without it the runner exits.
    this.liveness = setInterval(() => this.send({ type: "ping" }), HEARTBEAT_INTERVAL_MS);

    void this.process.exited.then(code => {
      clearInterval(this.liveness);
      if (!this.stopping) listener.onExit(code, this.uptimeMs);
    });
  }

  get metrics(): BotMetrics {
    return this.metricsSnapshot;
  }

  get uptimeMs(): number {
    return Date.now() - this.startedAt;
  }

  get botUsername(): string | null {
    return this.username;
  }

  get isStopping(): boolean {
    return this.stopping;
  }

  /** True when the runner has gone quiet for longer than the caller tolerates. */
  isStale(timeoutMs: number): boolean {
    return !this.stopping && Date.now() - this.lastSeenAt > timeoutMs;
  }

  /** Webhook mode only: hand an update to the runner. False means the pipe is gone. */
  deliver(update: Update): boolean {
    return this.send({ type: "update", update });
  }

  /** Ask the runner to drain and exit, then force it if it will not. */
  async stop(): Promise<void> {
    this.stopping = true;
    clearInterval(this.liveness);
    this.send({ type: "shutdown" });

    const outcome = await Promise.race([
      this.process.exited,
      Bun.sleep(STOP_GRACE_MS).then(() => "timeout" as const),
    ]);
    if (outcome === "timeout") this.process.kill();
  }

  kill(): void {
    clearInterval(this.liveness);
    this.process.kill();
  }

  private send(message: ParentMessage): boolean {
    try {
      this.process.send(message);
      return true;
    } catch {
      return false;
    }
  }

  private receive(message: ChildMessage, listener: BotProcessListener): void {
    this.lastSeenAt = Date.now();

    switch (message.type) {
      case "ready":
        this.username = message.username;
        listener.onReady(message.username);
        break;
      case "heartbeat":
        this.metricsSnapshot = message.metrics;
        break;
      case "error":
        listener.onError(message.message, message.fatal);
        break;
      case "log":
        listener.onLog(message.level, message.message);
        break;
    }
  }
}
