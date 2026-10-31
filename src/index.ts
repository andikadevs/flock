/**
 * Composition root: wire the database, the bot manager, the live feed and the HTTP
 * surface together, then serve. All policy lives in the modules this file imports.
 */

import { BotManager } from "./server/bots/manager.ts";
import { config } from "./server/config.ts";
import * as events from "./server/db/events-repo.ts";
import { migrate } from "./server/db/migrate.ts";
import * as sessions from "./server/db/sessions-repo.ts";
import { LiveChannel } from "./server/http/live.ts";
import { authRoutes } from "./server/http/routes/auth-routes.ts";
import { botRoutes } from "./server/http/routes/bot-routes.ts";
import { sessionRoutes } from "./server/http/routes/session-routes.ts";
import { webhookRoutes } from "./server/http/routes/webhook-routes.ts";
import dashboard from "./index.html";

const HOUSEKEEPING_INTERVAL_MS = 60 * 60 * 1000;

type ControlPlane = {
  manager: BotManager;
  live: LiveChannel;
  housekeeping: ReturnType<typeof setInterval>;
};

/**
 * `bun --hot` re-evaluates this module inside the same process. A fresh manager per
 * reload would supervise a second set of runners while the first kept polling, and
 * Telegram allows one getUpdates consumer per token, so the two would fight with
 * 409 Conflict until both gave up.
 *
 * The fleet is therefore anchored on `globalThis`, which survives re-evaluation.
 * `import.meta.hot` is not available in Bun's server runtime and cannot be used.
 */
const store = globalThis as unknown as { __controlPlane?: ControlPlane };

function createControlPlane(): ControlPlane {
  const manager = new BotManager();
  return {
    manager,
    live: new LiveChannel(manager),
    housekeeping: setInterval(() => {
      events.prune();
      sessions.pruneExpired();
    }, HOUSEKEEPING_INTERVAL_MS),
  };
}

migrate();

const { manager, live } = (store.__controlPlane ??= createControlPlane());

manager.onChange = () => live.push();
await manager.start();

const server = Bun.serve({
  port: config.port,

  routes: {
    ...authRoutes(),
    ...sessionRoutes(),
    ...botRoutes(manager),
    ...webhookRoutes(manager),
    "/api/live": { GET: live.upgrade },
    "/*": dashboard,
  },

  websocket: live.websocket,

  development: !config.isProduction && { hmr: true, console: true },
});

live.attach(server);

async function shutdown(): Promise<void> {
  clearInterval(store.__controlPlane!.housekeeping);
  live.stop();
  await manager.stop();
  await server.stop();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());

console.log(`Telegram bot manager running at ${server.url}`);
