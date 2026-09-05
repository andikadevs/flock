/**
 * Handler registry. Behaviour lives in code and is chosen by key; the database
 * stores which handler a bot uses, never anything executable.
 */

import type { Bot } from "grammy";
import { register as echo } from "./echo.ts";
import { register as ping } from "./ping.ts";

export type Handler = {
  label: string;
  description: string;
  register: (bot: Bot) => void;
};

export const handlers: Record<string, Handler> = {
  echo: {
    label: "Echo",
    description: "Replies with whatever text it receives.",
    register: echo,
  },
  ping: {
    label: "Ping",
    description: "Answers /ping with a timestamp.",
    register: ping,
  },
};

export function isHandlerKey(key: string): boolean {
  return Object.hasOwn(handlers, key);
}

export function catalog() {
  return Object.entries(handlers).map(([key, handler]) => ({
    key,
    label: handler.label,
    description: handler.description,
  }));
}
