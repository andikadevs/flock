// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import { useEffect, useState } from "react";
import { botEventsApi, type BotEvent } from "./api.ts";

/** Recent events for one bot; null while loading. */
export function useBotEvents(botId: string): BotEvent[] | null {
  const [events, setEvents] = useState<BotEvent[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEvents(null);
    botEventsApi.list(botId).then(loaded => {
      if (!cancelled) setEvents(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [botId]);

  return events;
}
