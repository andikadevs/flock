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
    <tr className="border-b border-slate-800/70 last:border-0">
      <td className="py-3 pr-4">
        <div className="font-medium text-slate-100">{bot.name}</div>
        <div className="text-xs text-slate-500">
          {bot.username ? `@${bot.username}` : "unknown username"} · {bot.handlerKey} · {bot.mode}
        </div>
      </td>

      <td className="py-3 pr-4">
        <StatusBadge status={bot.status} />
        {bot.lastError && (
          <div className="mt-1 max-w-xs truncate text-xs text-rose-400" title={bot.lastError}>
            {bot.lastError}
          </div>
        )}
      </td>

      <td className="py-3 pr-4 text-sm text-slate-300">{formatDuration(bot.uptimeMs)}</td>

      <td className="py-3 pr-4 text-sm text-slate-300">
        {bot.metrics.updates}
        <span className="text-slate-500"> updates</span>
        <div className="text-xs text-slate-500">last {formatRelative(bot.metrics.lastUpdateAt)}</div>
      </td>

      <td className="py-3 pr-4 text-sm text-slate-300">
        {bot.metrics.errors}
        <span className="text-slate-500"> errors</span>
      </td>

      <td className="py-3">
        <div className="flex items-center justify-end gap-3">
          <Toggle
            checked={bot.enabled}
            label={`Enable ${bot.name}`}
            onChange={enabled => void toggle(enabled)}
          />
          <button
            type="button"
            onClick={() => onInspect(bot)}
            className="text-sm text-slate-400 transition hover:text-slate-200"
          >
            Log
          </button>
          <button
            type="button"
            onClick={() => void remove()}
            className="text-sm text-slate-400 transition hover:text-rose-400"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
