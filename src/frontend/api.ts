/** Typed wrapper around the management API. The only place fetch is called. */

import type { BotMode, BotView } from "../server/bots/types.ts";

export type HandlerInfo = { key: string; label: string; description: string };

export type BotEvent = { id: string; level: string; message: string; at: string };

export type CreateBotInput = {
  name: string;
  token: string;
  handlerKey: string;
  mode: BotMode;
};

export type UpdateBotInput = Partial<Omit<CreateBotInput, "token">> & {
  token?: string;
  enabled?: boolean;
};

export class UnauthorizedError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: jsonHeaders(init) });

  if (response.status === 401) throw new UnauthorizedError("Not signed in.");
  if (!response.ok) throw new Error(await errorMessage(response));
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

function jsonHeaders(init?: RequestInit): HeadersInit | undefined {
  return init?.body ? { "content-type": "application/json", ...init.headers } : init?.headers;
}

async function errorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? `Request failed with status ${response.status}.`;
}

export const api = {
  whoami: () => request<{ actor: string }>("/api/session"),

  signOut: () =>
    request<{ providerLogoutUrl: string | null }>("/api/session", { method: "DELETE" }),

  listBots: () => request<BotView[]>("/api/bots"),

  listHandlers: () => request<HandlerInfo[]>("/api/handlers"),

  listEvents: (botId: string) => request<BotEvent[]>(`/api/bots/${botId}/events`),

  createBot: (input: CreateBotInput) =>
    request<{ id: string }>("/api/bots", { method: "POST", body: JSON.stringify(input) }),

  updateBot: (botId: string, input: UpdateBotInput) =>
    request<BotView[]>(`/api/bots/${botId}`, { method: "PATCH", body: JSON.stringify(input) }),

  deleteBot: (botId: string) => request<void>(`/api/bots/${botId}`, { method: "DELETE" }),
};
