import { useEffect, useState } from "react";
import type { BotView } from "../../server/bots/types.ts";
import { api, type BotEvent } from "../api.ts";
import { formatTimestamp } from "../format.ts";

const LEVEL_COLOR: Record<string, string> = {
  error: "text-rose-600",
  warn: "text-amber-600",
  info: "text-ink",
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
    <>
      <button
        type="button"
        aria-label="Close event log"
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/10"
      />

      <aside className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-surface">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-medium">{bot.name}</h2>
            <p className="text-xs text-ink-muted">Recent events</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-ink-muted transition hover:text-ink"
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {events === null && <p className="text-sm text-ink-muted">Loading…</p>}
          {events?.length === 0 && <p className="text-sm text-ink-muted">Nothing logged yet.</p>}

          <ul className="space-y-4">
            {events?.map(event => (
              <li key={event.id} className="text-sm">
                <div className="text-xs text-ink-muted">{formatTimestamp(event.at)}</div>
                <div className={LEVEL_COLOR[event.level] ?? "text-ink"}>{event.message}</div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
