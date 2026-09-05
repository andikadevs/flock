import type { BotView } from "../../server/bots/types.ts";
import { BotRow } from "./BotRow.tsx";

type BotTableProps = {
  bots: BotView[];
  onChanged: () => void;
  onInspect: (bot: BotView) => void;
};

const COLUMNS = ["Bot", "Status", "Uptime", "Traffic", "Errors", ""];

export function BotTable({ bots, onChanged, onInspect }: BotTableProps) {
  if (bots.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-800 p-10 text-center text-sm text-slate-500">
        No bots yet. Add one above to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 px-5">
      <table className="w-full min-w-3xl text-left">
        <thead>
          <tr className="border-b border-slate-800">
            {COLUMNS.map((column, index) => (
              <th
                key={column || index}
                className={`py-3 text-xs font-medium tracking-wide text-slate-500 uppercase ${
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
