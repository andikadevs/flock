import type { BotView } from "../../server/bots/types.ts";
import { api } from "../api.ts";
import { formatDuration, formatRelative } from "../format.ts";
import { StatusBadge } from "./StatusBadge.tsx";
import { Toggle } from "./Toggle.tsx";

type BotRowProps = {
  bot: BotView;
  onChanged: () => void;
  onInspect: (bot: BotView) => void;
};

export function BotRow({ bot, onChanged, onInspect }: BotRowProps) {
  const toggle = async (enabled: boolean) => {
    await api.updateBot(bot.id, { enabled });
    onChanged();
  };

  const remove = async () => {
    if (!confirm(`Delete "${bot.name}"? This cannot be undone.`)) return;
    await api.deleteBot(bot.id);
    onChanged();
  };

  return (
    <tr className="border-t border-line">
      <td className="py-4 pr-6">
        <div className="font-medium">{bot.name}</div>
        <div className="mt-0.5 text-xs text-ink-muted">
          {bot.username ? `@${bot.username}` : "no username yet"} · {bot.handlerKey} · {bot.mode}
        </div>
      </td>

      <td className="py-4 pr-6">
        <StatusBadge status={bot.status} />
        {bot.lastError && (
          <div className="mt-1 max-w-[16rem] truncate text-xs text-rose-600" title={bot.lastError}>
            {bot.lastError}
          </div>
        )}
      </td>

      <td className="py-4 pr-6 text-sm">{formatDuration(bot.uptimeMs)}</td>

      <td className="py-4 pr-6 text-sm">
        {bot.metrics.updates}
        <div className="text-xs text-ink-muted">last {formatRelative(bot.metrics.lastUpdateAt)}</div>
      </td>

      <td className="py-4 pr-6 text-sm">
        {bot.metrics.errors > 0 ? (
          <span className="text-rose-600">{bot.metrics.errors}</span>
        ) : (
          <span className="text-ink-muted">0</span>
        )}
      </td>

      <td className="py-4">
        <div className="flex items-center justify-end gap-4">
          <Toggle
            checked={bot.enabled}
            label={`Enable ${bot.name}`}
            onChange={enabled => void toggle(enabled)}
          />
          <button
            type="button"
            onClick={() => onInspect(bot)}
            className="text-sm text-ink-muted transition hover:text-ink"
          >
            Log
          </button>
          <button
            type="button"
            onClick={() => void remove()}
            className="text-sm text-ink-muted transition hover:text-rose-600"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
