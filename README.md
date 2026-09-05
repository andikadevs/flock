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

Bot behaviour lives in code, never in the database. Each bot type owns a folder
under `src/server/bots/handlers/` and everything inside it:

```
handlers/
  index.ts        the registry: the one place that knows every bot type
  types.ts        the Handler contract
  shared/         small, opt-in helpers used verbatim by several bots
  faq/
    index.ts      exports `handler`
    topics.ts     this bot's own content, private to the folder
  feedback/
    index.ts
    inbox.ts      this bot's own state
```

A new bot is a folder with an `index.ts` that exports a `handler`, plus one line
in `index.ts`:

```ts
import type { Handler } from "../types.ts";

export const handler: Handler = {
  label: "Greeter",
  description: "Says hello.",

  register(bot) {
    bot.command("start", ctx => ctx.reply("Hello."));
  },
};
```

### Isolation

Bots are isolated twice over:

- **At runtime** — one OS process each, so a crash or a wedged handler in one bot
  cannot reach another.
- **In the code** — a bot never imports another bot. Anything genuinely common
  goes in `shared/` and is imported explicitly, so sharing stays deliberate and
  small rather than becoming a common dumping ground.

`bun test` enforces the second rule: it fails if one bot folder reaches into
another, and if a folder is missing from the registry.

Because each bot owns a process, plain module state (`feedback/inbox.ts`) is
already private to that bot. No keying by bot id, no shared cache to reason about.

### Running the same behaviour twice

A handler is a bot *type*, not a bot. Two dashboard rows can select the same
handler with different tokens, and each still gets its own process and its own
memory. If two such bots need to differ in content rather than behaviour, give
the handler its own per-bot configuration rather than forking the folder.

## Delivery modes

- **Long polling** — the runner opens its own `getUpdates` loop. No public URL, so
  it works on localhost.
- **Webhook** — Telegram posts to `/tg/:botId`, authenticated by a per-bot secret.
  The parent answers immediately and forwards the update over IPC, because a slow
  reply makes Telegram retry and deliver the update twice.

Telegram permits one mechanism per token, so the manager always tears the unused
one down before a runner starts consuming.
