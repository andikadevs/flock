import type { BotView } from "@/server/bots/types.ts";
import { TableCell, TableRow } from "@/frontend/components/ui/table.tsx";
import { formatDuration, formatRelative } from "@/frontend/lib/format.ts";
import { cn } from "@/frontend/lib/utils.ts";
import { BotEnabledSwitch } from "./bot-enabled-switch.tsx";
import { BotRowActions } from "./bot-row-actions.tsx";
import { BotStatusBadge } from "./bot-status-badge.tsx";
import { useBotActions } from "./use-bot-actions.ts";

type BotRowProps = {
  bot: BotView;
  onChanged: () => void;
  onInspect: (bot: BotView) => void;
};

export function BotRow({ bot, onChanged, onInspect }: BotRowProps) {
  const actions = useBotActions(bot, onChanged);

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{bot.name}</div>
        <div className="text-xs text-muted-foreground">
          {bot.username ? `@${bot.username}` : "No username yet"} · {bot.handlerKey} · {bot.mode}
        </div>
      </TableCell>

      <TableCell>
        <BotStatusBadge status={bot.status} />
        {bot.lastError && (
          <p className="mt-1 max-w-64 truncate text-xs text-destructive" title={bot.lastError}>
            {bot.lastError}
          </p>
        )}
      </TableCell>

      <TableCell className="tabular-nums">{formatDuration(bot.uptimeMs)}</TableCell>

      <TableCell className="tabular-nums">
        {bot.metrics.updates}
        <div className="text-xs text-muted-foreground">
          last {formatRelative(bot.metrics.lastUpdateAt)}
        </div>
      </TableCell>

      <TableCell
        className={cn(
          "tabular-nums",
          bot.metrics.errors > 0 ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {bot.metrics.errors}
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-3">
          <BotEnabledSwitch
            botId={bot.id}
            botName={bot.name}
            enabled={bot.enabled}
            onChange={enabled => void actions.setEnabled(enabled)}
          />
          <BotRowActions
            botName={bot.name}
            onInspect={() => onInspect(bot)}
            onDelete={() => void actions.remove()}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
