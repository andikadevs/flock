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
  const [adding, setAdding] = useState(false);
  const [inspecting, setInspecting] = useState<BotView | null>(null);

  useEffect(() => {
    void api.listHandlers().then(setHandlers);
  }, []);

  const running = bots.filter(bot => bot.status === "running").length;

  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-sm font-medium">Telegram Bot Manager</h1>
          <div className="flex items-center gap-4 text-sm text-ink-muted">
            <span>{actor}</span>
            <button type="button" onClick={onSignOut} className="transition hover:text-ink">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-5 flex items-end justify-between">
          <p className="text-sm text-ink-muted">
            {running} of {bots.length} running
          </p>
          {!adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="rounded-md border border-line bg-surface px-3.5 py-2 text-sm font-medium transition hover:border-ink-muted"
            >
              Add bot
            </button>
          )}
        </div>

        {error && (
          <p className="mb-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="space-y-5">
          {adding && (
            <AddBotForm
              handlers={handlers}
              onCancel={() => setAdding(false)}
              onAdded={() => {
                setAdding(false);
                void refresh();
              }}
            />
          )}
          <BotTable bots={bots} onChanged={refresh} onInspect={setInspecting} />
        </div>
      </main>

      {inspecting && <EventLog bot={inspecting} onClose={() => setInspecting(null)} />}
    </>
  );
}
