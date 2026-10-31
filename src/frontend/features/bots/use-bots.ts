/**
 * Keeps the bot list live. The initial state comes from the API; every later change
 * arrives over the WebSocket feed, which also carries metrics between renders.
 */

import { useCallback, useEffect, useState } from "react";
import type { BotView } from "@/server/bots/types.ts";
import { errorMessage } from "@/frontend/lib/errors.ts";
import { botsApi } from "./api.ts";

const RECONNECT_DELAY_MS = 3_000;

type Feed = { type: "bots"; bots: BotView[] };

export function useBots() {
  const [bots, setBots] = useState<BotView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setBots(await botsApi.list());
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void refresh();
    return subscribeToFeed(setBots);
  }, [refresh]);

  return { bots, error, refresh };
}

/** Opens the live feed and reconnects until the returned cleanup runs. */
function subscribeToFeed(onBots: (bots: BotView[]) => void): () => void {
  let socket: WebSocket | null = null;
  let reconnect: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  const connect = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    socket = new WebSocket(`${protocol}//${window.location.host}/api/live`);

    socket.onmessage = event => {
      const payload = JSON.parse(event.data as string) as Feed;
      if (payload.type === "bots") onBots(payload.bots);
    };

    socket.onclose = () => {
      if (!closed) reconnect = setTimeout(connect, RECONNECT_DELAY_MS);
    };
  };

  connect();

  return () => {
    closed = true;
    if (reconnect) clearTimeout(reconnect);
    socket?.close();
  };
}
