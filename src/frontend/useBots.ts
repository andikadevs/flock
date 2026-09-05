/**
 * Keeps the bot list live. The initial state comes from the API; every later change
 * arrives over the WebSocket feed, which also carries metrics between renders.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { BotView } from "../server/bots/types.ts";
import { api } from "./api.ts";

const RECONNECT_DELAY_MS = 3_000;

type Feed = { type: "bots"; bots: BotView[] };

export function useBots(enabled: boolean) {
  const [bots, setBots] = useState<BotView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const refresh = useCallback(async () => {
    try {
      setBots(await api.listBots());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let closed = false;
    let reconnect: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const socket = new WebSocket(`${protocol}//${window.location.host}/api/live`);
      socketRef.current = socket;

      socket.onmessage = event => {
        const payload = JSON.parse(event.data as string) as Feed;
        if (payload.type === "bots") setBots(payload.bots);
      };

      socket.onclose = () => {
        if (!closed) reconnect = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    };

    void refresh();
    connect();

    return () => {
      closed = true;
      if (reconnect) clearTimeout(reconnect);
      socketRef.current?.close();
    };
  }, [enabled, refresh]);

  return { bots, error, refresh };
}
