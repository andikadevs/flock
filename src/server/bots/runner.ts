/**
 * Entry point of a bot runner process: one grammy instance, one bot, nothing else.
 * It talks to the manager only over IPC, so a crash or a wedged handler here cannot
 * reach the dashboard or a sibling bot.
 *
 * The token arrives in the init message rather than argv, which `ps` exposes to
 * every user on the machine.
 */

import { Bot } from "grammy";
import { handlers } from "./handlers/index.ts";
import { HEARTBEAT_INTERVAL_MS, type ChildMessage, type ParentMessage } from "./ipc.ts";
import { emptyMetrics, type BotMode } from "./types.ts";

const INIT_TIMEOUT_MS = 15_000;

const metrics = emptyMetrics();
let bot: Bot | null = null;
let heartbeat: ReturnType<typeof setInterval> | null = null;
let stopping = false;

function send(message: ChildMessage): void {
  process.send?.(message);
}

function recordError(message: string): void {
  metrics.errors += 1;
  metrics.lastError = message;
}

function abort(message: string): void {
  recordError(message);
  send({ type: "error", message, fatal: true });
  void stop(1);
}

function build(token: string, handlerKey: string): Bot | null {
  const handler = handlers[handlerKey];
  if (!handler) {
    abort(`Unknown handler "${handlerKey}".`);
    return null;
  }

  const instance = new Bot(token);

  instance.use((_ctx, next) => {
    metrics.updates += 1;
    metrics.lastUpdateAt = Date.now();
    return next();
  });

  handler.register(instance);

  instance.catch(err => {
    recordError(err.message);
    send({ type: "log", level: "error", message: `Handler error: ${err.message}` });
  });

  return instance;
}

async function connect(instance: Bot, mode: BotMode): Promise<void> {
  if (mode === "webhook") {
    // Updates are pushed in over IPC; we only need the bot's own identity.
    await instance.init();
    send({ type: "ready", username: instance.botInfo.username ?? null });
    return;
  }

  // Long polling resolves only once the bot stops, so it is deliberately not awaited.
  void instance
    .start({
      drop_pending_updates: true,
      onStart: info => send({ type: "ready", username: info.username ?? null }),
    })
    .catch((err: Error) => abort(`Polling stopped: ${err.message}`));
}

async function start(init: Extract<ParentMessage, { type: "init" }>): Promise<void> {
  const instance = build(init.token, init.handlerKey);
  if (!instance) return;

  try {
    await connect(instance, init.mode);
  } catch (err) {
    abort(`Failed to start: ${(err as Error).message}`);
    return;
  }

  bot = instance;
  heartbeat = setInterval(() => send({ type: "heartbeat", metrics }), HEARTBEAT_INTERVAL_MS);
}

function handleUpdate(message: Extract<ParentMessage, { type: "update" }>): void {
  // The parent has already answered Telegram, so a failure here is logged, not thrown.
  bot?.handleUpdate(message.update).catch((err: Error) => {
    recordError(err.message);
    send({ type: "log", level: "error", message: `Update failed: ${err.message}` });
  });
}

async function stop(code: number): Promise<void> {
  if (stopping) return;
  stopping = true;
  if (heartbeat) clearInterval(heartbeat);
  await bot?.stop().catch(() => {
    // Already stopped, or never started; there is nothing useful to report.
  });
  process.exit(code);
}

process.on("message", (message: ParentMessage) => {
  switch (message.type) {
    case "init":
      void start(message);
      break;
    case "update":
      handleUpdate(message);
      break;
    case "shutdown":
      void stop(0);
      break;
  }
});

process.on("unhandledRejection", reason => {
  const message = reason instanceof Error ? reason.message : String(reason);
  recordError(message);
  send({ type: "error", message: `Unhandled rejection: ${message}`, fatal: false });
});

process.on("SIGTERM", () => void stop(0));

// A runner that never received instructions is a leak; exit instead of lingering.
setTimeout(() => {
  if (!bot) abort("No init message received.");
}, INIT_TIMEOUT_MS).unref();
