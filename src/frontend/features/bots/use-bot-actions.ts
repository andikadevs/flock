// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import { toast } from "sonner";
import type { BotView } from "@/server/bots/types.ts";
import { errorMessage } from "@/frontend/lib/errors.ts";
import { botsApi } from "./api.ts";

/** Mutations on one bot. Failures surface as toasts; success refreshes the list. */
export function useBotActions(bot: BotView, onChanged: () => void) {
  const run = async (action: () => Promise<unknown>, success?: string) => {
    try {
      await action();
      if (success) toast.success(success);
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return {
    setEnabled: (enabled: boolean) => run(() => botsApi.update(bot.id, { enabled })),
    remove: () => run(() => botsApi.remove(bot.id), `Deleted ${bot.name}.`),
  };
}
