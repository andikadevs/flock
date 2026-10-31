# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Dashboard to add, enable, disable and delete Telegram bots, with live status, uptime,
  update and error counts, and a per-bot event log.
- One supervised process per bot, with restart backoff and automatic disabling after
  repeated crashes.
- Long polling and webhook delivery modes.
- Sign-in through any OpenID Connect provider, with an email or subject allowlist.
  Emails count only when the provider marks them verified.
- Light and dark themes, following the OS until the user picks one.
- SQLite storage via `bun:sqlite`, with no database server to run.
- Docker image and Compose file.
- `chat-id` bot type: replies with the chat's ID and announces a group's ID when added.
- `photo-log` bot type: logs a link to every photo posted in a group and lists them by day.
- A private data folder per bot (`BOT_DATA_DIR`), removed when the bot is deleted.
