# Telegram Bot Manager

A control plane for running several Telegram bots from one dashboard: add a bot,
pick its behaviour, switch it on or off, and watch what it is doing.

## How it works

Each bot runs in its own process, supervised by a manager in the parent process.
The parent serves the React dashboard, the management API, and Telegram's webhook
endpoint; a crash or a wedged handler in one bot cannot reach the dashboard or a
sibling bot.

```
parent (Bun.serve)                   runner process (one per enabled bot)
├─ dashboard + /api/*                ├─ grammy bot
├─ POST /tg/:botId  ──── IPC ───▶    ├─ handler from the code registry
├─ manager: spawn, restart, stop     └─ heartbeat + metrics ──── IPC ───▶ parent
├─ postgres: bots, events, audit
└─ websocket: live status feed
```

`bots.enabled` in Postgres is the desired state, the manager's process table is
the actual state, and `reconcile()` is the only thing that closes the gap.

## Setup

```bash
bun install
createdb telegram_manager          # or: psql -U postgres -c 'CREATE DATABASE telegram_manager'
cp .env.example .env
openssl rand -hex 32               # paste into TOKEN_ENCRYPTION_KEY
bun dev
```

Tables are created on first boot.

### Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. |
| `APP_URL` | Where a browser reaches the dashboard. Builds the OIDC redirect URI. |
| `PUBLIC_URL` | Public HTTPS origin Telegram can reach. Required only for webhook-mode bots. |
| `TOKEN_ENCRYPTION_KEY` | 64 hex characters. Bot tokens are encrypted at rest with it. |
| `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` | Identity provider credentials. |
| `ADMIN_EMAILS`, `ADMIN_SUBJECTS` | Who may administer bots. Empty admits nobody. |

Register `${APP_URL}/auth/callback` as the client's redirect URI.

## Adding a bot type

Bot behaviour lives in code, never in the database. Add a module to
`src/server/bots/handlers/`, register it in `handlers/index.ts`, and it becomes
selectable in the dashboard:

```ts
import type { Bot } from "grammy";

export function register(bot: Bot): void {
  bot.command("start", ctx => ctx.reply("Hello."));
}
```

## Delivery modes

- **Long polling** — the runner opens its own `getUpdates` loop. No public URL, so
  it works on localhost.
- **Webhook** — Telegram posts to `/tg/:botId`, authenticated by a per-bot secret.
  The parent answers immediately and forwards the update over IPC, because a slow
  reply makes Telegram retry and deliver the update twice.

Telegram permits one mechanism per token, so the manager always tears the unused
one down before a runner starts consuming.
