// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/** Uniform JSON responses, so route handlers never hand-roll status codes. */

export const ok = <T>(data: T): Response => Response.json(data);

export const created = <T>(data: T): Response => Response.json(data, { status: 201 });

export const noContent = (): Response => new Response(null, { status: 204 });

export const badRequest = (message: string): Response =>
  Response.json({ error: message }, { status: 400 });

export const unauthorized = (message = "Not authenticated."): Response =>
  Response.json({ error: message }, { status: 401 });

export const notFound = (message = "Not found."): Response =>
  Response.json({ error: message }, { status: 404 });

export const conflict = (message: string): Response =>
  Response.json({ error: message }, { status: 409 });
