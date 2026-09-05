import { useEffect, useState } from "react";
import type { BotView } from "../../server/bots/types.ts";
import { api, type BotEvent } from "../api.ts";
import { formatTimestamp } from "../format.ts";

const LEVEL_COLOR: Record<string, string> = {
  error: "text-rose-400",
  warn: "text-amber-400",
  info: "text-slate-400",
};

export function EventLog({ bot, onClose }: { bot: BotView; onClose: () => void }) {
  const [events, setEvents] = useState<BotEvent[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.listEvents(bot.id).then(loaded => {
      if (!cancelled) setEvents(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [bot.id]);

  return (
    <aside className="fixed inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-slate-800 bg-slate-950 shadow-2xl">
      <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{bot.name}</h2>
          <p className="text-xs text-slate-500">Recent events</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
        >
          Close
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {events === null && <p className="text-sm text-slate-500">Loading…</p>}
        {events?.length === 0 && <p className="text-sm text-slate-500">Nothing logged yet.</p>}

        <ul className="space-y-3">
          {events?.map(event => (
            <li key={event.id} className="text-sm">
              <div className="text-xs text-slate-500">{formatTimestamp(event.at)}</div>
              <div className={LEVEL_COLOR[event.level] ?? "text-slate-300"}>{event.message}</div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
