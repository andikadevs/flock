import type { BotMode, BotView } from "@/server/bots/types.ts";
import { jsonBody, request } from "@/frontend/lib/http.ts";

export type HandlerInfo = { key: string; label: string; description: string };

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

export const botsApi = {
  list: () => request<BotView[]>("/api/bots"),

  listHandlers: () => request<HandlerInfo[]>("/api/handlers"),

  create: (input: CreateBotInput) =>
    request<{ id: string }>("/api/bots", { method: "POST", body: jsonBody(input) }),

  update: (botId: string, input: UpdateBotInput) =>
    request<BotView[]>(`/api/bots/${botId}`, { method: "PATCH", body: jsonBody(input) }),

  remove: (botId: string) => request<void>(`/api/bots/${botId}`, { method: "DELETE" }),
};
