# Contributing

Thanks for your interest in improving Flock. This guide covers how to set up the
project, the rules every change follows, and how to get a change merged.

By taking part you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Before you start

- **Bugs and features:** open an [issue](https://github.com/andikadevs/flock/issues) first,
  so we can agree on the approach before you write code.
- **Security problems:** do not open a public issue. Follow [SECURITY.md](./SECURITY.md).
- **New bot types:** a handler that is useful to many people is welcome. One that only
  makes sense for a single deployment belongs in your fork.

## Development setup

Requirements: [Bun](https://bun.com) 1.4 or newer. No database server is needed.

```sh
git clone https://github.com/andikadevs/flock.git
cd flock
bun install
cp .env.example .env
openssl rand -hex 32   # paste into TOKEN_ENCRYPTION_KEY
bun run dev
```

The dashboard listens on <http://localhost:3000>. Signing in needs an OpenID Connect
provider; see [Authentication](./README.md#authentication).

## Project rules

- **One process per bot.** Runners talk to the parent over IPC only. A bot type never
  imports another bot type; shared code goes in `handlers/shared/`.
- **Database access through repositories.** Only `src/server/db/*-repo.ts` knows table and
  column names.
- **Config through `src/server/config.ts` only.** Never read `process.env` elsewhere on
  the server.
- **Frontend by feature.** Each folder under `src/frontend/features/` owns its `api.ts`,
  hooks and components. Only `src/frontend/lib/http.ts` calls `fetch`.
- **Strict TypeScript.** No `any`.
- **File names in kebab-case.**
- **License header.** Start every new source file with:

  ```ts
  // SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
  // SPDX-License-Identifier: MIT
  ```

## Checks

Run these before you open a pull request. CI runs the same commands.

```sh
bun run typecheck   # tsc --noEmit, must be clean
bun test            # must be green, uses an in-memory database
bun run build       # the dashboard must bundle
```

Add or update tests for every behavior change. Tests never call Telegram.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) with an imperative,
lower-case summary:

```text
feat(bots): add a poll handler
fix(manager): stop restarting a disabled bot
docs: explain webhook mode
```

Common types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`.
Keep one logical change per commit, and never commit `.env` or anything under `data/`.

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Make your change with tests, and run the checks above.
3. Add a line under `## [Unreleased]` in [CHANGELOG.md](./CHANGELOG.md) for user-facing
   changes.
4. Open the pull request and fill in the template.

## Releases

The project follows [Semantic Versioning](https://semver.org/). Maintainers cut a release
by moving the `Unreleased` changelog entries under a new version heading, bumping
`version` in `package.json`, and pushing an annotated `vX.Y.Z` tag.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](./LICENSE).
