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
