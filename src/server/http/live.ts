/**
 * Live dashboard feed. Runtime state changes are pushed immediately; metrics that
 * only arrive with the next heartbeat are picked up by a slow tick.
 */

import type { BunRequest, Server, ServerWebSocket } from "bun";
import type { BotManager } from "../bots/manager.ts";
import { currentSession } from "./session.ts";

const TOPIC = "bots";
const TICK_MS = 2_000;

export type LiveSocketData = { actor: string };

export class LiveChannel {
  private server: Server<LiveSocketData> | null = null;
  private ticker: ReturnType<typeof setInterval> | null = null;
  private subscribers = 0;

  constructor(private readonly manager: BotManager) {}

  attach(server: Server<LiveSocketData>): void {
    this.server = server;
  }

  /** Route handler: upgrade an authenticated request, reject anything else. */
  upgrade = (req: BunRequest, server: Server<LiveSocketData>): Response | undefined => {
    const session = currentSession(req);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const data: LiveSocketData = { actor: session.actor };
    if (server.upgrade(req, { data })) return undefined;
    return new Response("Expected a WebSocket upgrade.", { status: 426 });
  };

  readonly websocket = {
    open: (ws: ServerWebSocket<LiveSocketData>) => {
      ws.subscribe(TOPIC);
      this.subscribers += 1;
      this.startTicking();
      this.push();
    },
    close: (ws: ServerWebSocket<LiveSocketData>) => {
      ws.unsubscribe(TOPIC);
      this.subscribers = Math.max(0, this.subscribers - 1);
      if (this.subscribers === 0) this.stopTicking();
    },
    message: () => {
      // The feed is one-way; clients act through the REST API.
    },
  };

  push(): void {
    if (!this.server || this.subscribers === 0) return;
    const bots = this.manager.snapshot();
    this.server.publish(TOPIC, JSON.stringify({ type: "bots", bots }));
  }

  stop(): void {
    this.stopTicking();
  }

  private startTicking(): void {
    if (this.ticker) return;
    this.ticker = setInterval(() => this.push(), TICK_MS);
  }

  private stopTicking(): void {
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = null;
  }
}
