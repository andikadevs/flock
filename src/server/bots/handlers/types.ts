// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/** What every bot module must export. Kept separate so bots never import the registry. */

import type { Bot } from "grammy";

/** What the runner knows about the one bot it hosts. */
export type HandlerRuntime = {
  /** A folder private to this bot, for handlers that keep their own files. */
  dataDir: string;
};

export type Handler = {
  /** Shown in the dashboard's handler picker. */
  label: string;
  description: string;
  /** Attach this bot's behaviour to a fresh grammy instance. */
  register: (bot: Bot, runtime: HandlerRuntime) => void;
};
