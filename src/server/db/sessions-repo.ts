/** Admin session storage. Kept in the database so a deploy does not log the admin out. */

import { db, NOW } from "./client.ts";

export type SessionRecord = { id: string; actor: string };

export function create(id: string, actor: string, expiresAt: Date): void {
  db.query("INSERT INTO sessions (id, actor, expires_at) VALUES ($id, $actor, $expiresAt)").run({
    id,
    actor,
    expiresAt: expiresAt.toISOString(),
  });
}

export function findValid(id: string): SessionRecord | null {
  return db
    .query<SessionRecord, { id: string }>(
      `SELECT id, actor FROM sessions WHERE id = $id AND expires_at > ${NOW}`,
    )
    .get({ id });
}

export function remove(id: string): void {
  db.query("DELETE FROM sessions WHERE id = $id").run({ id });
}

export function pruneExpired(): void {
  db.query(`DELETE FROM sessions WHERE expires_at <= ${NOW}`).run();
}
