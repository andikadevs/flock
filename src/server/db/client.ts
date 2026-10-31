// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/** The single SQLite connection, via Bun's built-in driver. */

import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { config } from "../config.ts";

function open(path: string): Database {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });

  // strict: bind named parameters without the `$` prefix and throw on missing ones.
  const db = new Database(path, { create: true, strict: true });

  db.run("PRAGMA journal_mode = WAL"); // readers never block the writer
  db.run("PRAGMA synchronous = NORMAL"); // durable enough under WAL, far fewer fsyncs
  db.run("PRAGMA foreign_keys = ON"); // off by default; ON DELETE CASCADE depends on it
  db.run("PRAGMA busy_timeout = 5000"); // wait for a lock instead of failing at once

  return db;
}

export const db = open(config.databasePath);

/** Current time in the same ISO-8601 UTC form `Date.toISOString()` produces. */
export const NOW = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
