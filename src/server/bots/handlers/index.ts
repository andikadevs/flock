// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/**
 * The registry: the one place that knows every bot type. Bots are chosen by key
 * from the dashboard, so the database stores a name, never anything executable.
 *
 * Each bot owns a folder and everything inside it. Bots never import one another;
 * anything genuinely common lives in `shared/` and is imported explicitly.
 */

import { handler as echo } from "./echo/index.ts";
import { handler as faq } from "./faq/index.ts";
import { handler as feedback } from "./feedback/index.ts";
import { handler as ping } from "./ping/index.ts";
import type { Handler } from "./types.ts";

export type { Handler };

export const handlers: Record<string, Handler> = {
  echo,
  ping,
  faq,
  feedback,
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
