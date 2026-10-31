import { request } from "@/frontend/lib/http.ts";

export type BotEvent = { id: number; level: "info" | "warn" | "error"; message: string; at: string };

export const botEventsApi = {
  list: (botId: string) => request<BotEvent[]>(`/api/bots/${botId}/events`),
};
