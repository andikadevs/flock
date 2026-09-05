import { useEffect, useState } from "react";
import type { BotView } from "../../server/bots/types.ts";
import { api, type HandlerInfo } from "../api.ts";
import { useBots } from "../useBots.ts";
import { AddBotForm } from "./AddBotForm.tsx";
import { BotTable } from "./BotTable.tsx";
import { EventLog } from "./EventLog.tsx";

export function Dashboard({ actor, onSignOut }: { actor: string; onSignOut: () => void }) {
  const { bots, error, refresh } = useBots(true);
  const [handlers, setHandlers] = useState<HandlerInfo[]>([]);
  const [inspecting, setInspecting] = useState<BotView | null>(null);

  useEffect(() => {
    void api.listHandlers().then(setHandlers);
  }, []);

  const running = bots.filter(bot => bot.status === "running").length;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Telegram Bot Manager</h1>
          <p className="text-sm text-slate-500">
            {running} of {bots.length} running
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{actor}</span>
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-lg border border-slate-700 px-3 py-1.5 transition hover:border-slate-500 hover:text-slate-200"
          >
            Sign out
          </button>
        </div>
      </header>

      {error && (
        <p className="mb-6 rounded-lg border border-rose-900 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="space-y-6">
        <AddBotForm handlers={handlers} onAdded={refresh} />
        <BotTable bots={bots} onChanged={refresh} onInspect={setInspecting} />
      </div>

      {inspecting && <EventLog bot={inspecting} onClose={() => setInspecting(null)} />}
    </main>
  );
}
