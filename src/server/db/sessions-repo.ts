/** Admin session storage. Kept in Postgres so a deploy does not log the admin out. */

import { sql } from "./client.ts";

export type SessionRecord = { id: string; actor: string };

export async function create(id: string, actor: string, expiresAt: Date): Promise<void> {
  await sql`INSERT INTO sessions (id, actor, expires_at) VALUES (${id}, ${actor}, ${expiresAt})`;
}

export async function findValid(id: string): Promise<SessionRecord | null> {
  const [row]: SessionRecord[] =
    await sql`SELECT id, actor FROM sessions WHERE id = ${id} AND expires_at > now()`;
  return row ?? null;
}

export async function remove(id: string): Promise<void> {
  await sql`DELETE FROM sessions WHERE id = ${id}`;
}

export async function pruneExpired(): Promise<void> {
  await sql`DELETE FROM sessions WHERE expires_at <= now()`;
}
