// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/** The only place fetch is called. Feature api modules describe endpoints on top of it. */

export class UnauthorizedError extends Error {}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: jsonHeaders(init) });

  if (response.status === 401) throw new UnauthorizedError("Not signed in.");
  if (!response.ok) throw new Error(await errorMessage(response));
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export const jsonBody = (data: unknown): string => JSON.stringify(data);

function jsonHeaders(init?: RequestInit): HeadersInit | undefined {
  return init?.body ? { "content-type": "application/json", ...init.headers } : init?.headers;
}

async function errorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? `Request failed with status ${response.status}.`;
}
