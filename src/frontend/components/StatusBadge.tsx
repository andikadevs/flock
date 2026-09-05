import type { BotStatus } from "../../server/bots/types.ts";

const STYLES: Record<BotStatus, string> = {
  running: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  starting: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  stopped: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  error: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

export function StatusBadge({ status }: { status: BotStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
