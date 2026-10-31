// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/**
 * Logged photos, in a SQLite file inside this bot's own data folder. Only this
 * bot's process opens it, so it needs none of the control plane's machinery.
 */

import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

export type Photo = { link: string; sender: string; postedAt: number };

export class PhotoStore {
  private readonly db: Database;

  constructor(path: string) {
    this.db = new Database(path, { create: true, strict: true });
    this.db.run("PRAGMA journal_mode = WAL");
    this.db.run(
      `CREATE TABLE IF NOT EXISTS photos (
         chat_id   INTEGER NOT NULL,
         link      TEXT    NOT NULL UNIQUE,
         sender    TEXT    NOT NULL,
         posted_at INTEGER NOT NULL
       ) STRICT`,
    );
    this.db.run("CREATE INDEX IF NOT EXISTS photos_by_chat ON photos (chat_id, posted_at)");
  }

  static open(dataDir: string): PhotoStore {
    mkdirSync(dataDir, { recursive: true });
    return new PhotoStore(join(dataDir, "photos.sqlite"));
  }

  /** Telegram may deliver an update twice; the unique link makes that harmless. */
  add(chatId: number, photo: Photo): void {
    this.db
      .query(
        `INSERT OR IGNORE INTO photos (chat_id, link, sender, posted_at)
         VALUES ($chatId, $link, $sender, $postedAt)`,
      )
      .run({ chatId, ...photo });
  }

  /** Photos posted in a chat from `from` (inclusive) to `to` (exclusive), oldest first. */
  between(chatId: number, from: number, to: number): Photo[] {
    return this.db
      .query<Photo, { chatId: number; from: number; to: number }>(
        `SELECT link, sender, posted_at AS postedAt FROM photos
         WHERE chat_id = $chatId AND posted_at >= $from AND posted_at < $to
         ORDER BY posted_at`,
      )
      .all({ chatId, from, to });
  }
}
