// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
/** What every bot module must export. Kept separate so bots never import the registry. */

import type { Bot } from "grammy";

export type Handler = {
  /** Shown in the dashboard's handler picker. */
  label: string;
  description: string;
  /** Attach this bot's behaviour to a fresh grammy instance. */
  register: (bot: Bot) => void;
};
