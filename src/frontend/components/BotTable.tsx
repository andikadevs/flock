import type { BotView } from "../../server/bots/types.ts";
import { BotRow } from "./BotRow.tsx";

type BotTableProps = {
  bots: BotView[];
  onChanged: () => void;
  onInspect: (bot: BotView) => void;
};

const COLUMNS = ["Bot", "Status", "Uptime", "Updates", "Errors", ""];

export function BotTable({ bots, onChanged, onInspect }: BotTableProps) {
  if (bots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line py-16 text-center">
        <p className="text-sm text-ink-muted">No bots yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface px-5">
      <table className="w-full min-w-3xl text-left">
        <thead>
          <tr>
            {COLUMNS.map((column, index) => (
              <th
                key={column || index}
                className={`py-3 text-xs font-medium text-ink-muted ${
                  index === COLUMNS.length - 1 ? "text-right" : ""
                }`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bots.map(bot => (
            <BotRow key={bot.id} bot={bot} onChanged={onChanged} onInspect={onInspect} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
