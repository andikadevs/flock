/**
 * Composition root: wire the database, the bot manager, the live feed and the HTTP
 * surface together, then serve. All policy lives in the modules this file imports.
 */

import { BotManager } from "./server/bots/manager.ts";
import { config } from "./server/config.ts";
import * as events from "./server/db/events.repo.ts";
import { migrate } from "./server/db/migrate.ts";
import * as sessions from "./server/db/sessions.repo.ts";
import { LiveChannel } from "./server/http/live.ts";
import { authRoutes } from "./server/http/routes/auth.routes.ts";
import { botRoutes } from "./server/http/routes/bot.routes.ts";
import { sessionRoutes } from "./server/http/routes/session.routes.ts";
import { webhookRoutes } from "./server/http/routes/webhook.routes.ts";
import dashboard from "./index.html";

const HOUSEKEEPING_INTERVAL_MS = 60 * 60 * 1000;

await migrate();

const manager = new BotManager();
const live = new LiveChannel(manager);
manager.onChange = () => void live.push();
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

const housekeeping = setInterval(() => {
  void events.prune();
  void sessions.pruneExpired();
}, HOUSEKEEPING_INTERVAL_MS);

async function shutdown(): Promise<void> {
  clearInterval(housekeeping);
  live.stop();
  await manager.stop();
  await server.stop();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());

console.log(`Telegram bot manager running at ${server.url}`);
