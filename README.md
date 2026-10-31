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
├─ sqlite (bun:sqlite): bots, events, audit, sessions
└─ websocket: live status feed
```

`bots.enabled` in the database is the desired state, the manager's process table is
the actual state, and `reconcile()` is the only thing that closes the gap.

## Setup

```bash
bun install
cp .env.example .env
openssl rand -hex 32               # paste into TOKEN_ENCRYPTION_KEY
bun dev
```

No database server is needed. State lives in a single SQLite file
(`data/telegram-manager.sqlite` by default), created with its tables on first boot.

| Command | What it does |
| --- | --- |
| `bun dev` | Dev server with hot reload. |
| `bun start` | Production server. |
| `bun run build` | Bundles the dashboard into `dist/`. |
| `bun test` | Unit tests, against an in-memory database. |

### Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_PATH` | SQLite file path. Defaults to `data/telegram-manager.sqlite`. |
| `APP_URL` | Where a browser reaches the dashboard. Builds the OIDC redirect URI. |
| `PUBLIC_URL` | Public HTTPS origin Telegram can reach. Required only for webhook-mode bots. |
| `TOKEN_ENCRYPTION_KEY` | 64 hex characters. Bot tokens are encrypted at rest with it. |
| `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` | Identity provider credentials. |
| `OIDC_PROVIDER_NAME` | Label on the sign-in button. Defaults to `SSO`. |
| `ADMIN_EMAILS`, `ADMIN_SUBJECTS` | Who may administer bots. Empty admits nobody. |

### Authentication

Sign-in uses OpenID Connect (authorization code flow with PKCE), so any compliant
provider works: Google, Keycloak, Authentik, Authelia, Zitadel, Pocket ID, Auth0 and so on.
Create a confidential client, register `${APP_URL}/auth/callback` as its redirect URI,
and copy the issuer URL, client ID and secret into `.env`.

| Provider | `OIDC_ISSUER` |
| --- | --- |
| Google | `https://accounts.google.com` |
| Keycloak | `https://<host>/realms/<realm>` |
| Authentik | `https://<host>/application/o/<slug>/` |
| Auth0 | `https://<tenant>.auth0.com/` |

`ADMIN_EMAILS` only matches when the provider asserts `email_verified: true` in the ID
token, so a self-registered account cannot claim an admin's address. Providers that never
send that claim (Microsoft Entra ID, for example) should list admins in `ADMIN_SUBJECTS`
instead, using the `sub` value the provider issues.

### Data

The database runs in WAL mode with foreign keys enforced, and all tables are
`STRICT`. Timestamps are stored as ISO-8601 UTC text. To back it up while the app
is running, use SQLite's online backup rather than copying the file, since recent
writes may still sit in the `-wal` sidecar:

```bash
sqlite3 data/telegram-manager.sqlite ".backup backup.sqlite"
```

Bot tokens are encrypted with `TOKEN_ENCRYPTION_KEY` before they are stored, so a
leaked database file does not leak tokens, and losing the key makes them unreadable.

## Dashboard

The dashboard is React, bundled by Bun's HTML imports, built from
[shadcn/ui](https://ui.shadcn.com) components on [Base UI](https://base-ui.com)
and styled with Tailwind CSS. Code is grouped by feature, and every file and
folder name is kebab-case:

```
src/frontend/
  main.tsx, app.tsx     entry point and top-level screen switch
  lib/                  http (the only fetch), formatting, small utilities
  components/ui/        shadcn components, generated and then owned here
  features/
    auth/               session, sign-in page
    bots/               bot list, add/delete dialogs, live feed hook
    bot-events/         per-bot event log sheet
    dashboard/          page layout, header, fleet summary
    theme/              light/dark toggle
```

Each feature keeps its own `api.ts` (endpoints), hooks (data), and components
(presentation). Components never call `fetch` directly.

Add more shadcn components with `bunx shadcn@latest add <name>`. The CLI writes
`import { cn } from "cn"` in this project, so change that to
`@/frontend/lib/utils` and remove the `cn` package it adds.

The theme follows the OS preference until the user picks one with the toggle, and
the choice is remembered. Light mode uses Telegram blue on a cool slate frame; dark
mode uses Telegram's "Night Blue" palette.

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
