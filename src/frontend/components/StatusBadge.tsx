import type { BotStatus } from "../../server/bots/types.ts";

const DOT: Record<BotStatus, string> = {
  running: "bg-emerald-500",
  starting: "bg-amber-500",
  stopped: "bg-neutral-300",
  error: "bg-rose-500",
};

export function StatusBadge({ status }: { status: BotStatus }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink">
      <span className={`size-2 rounded-full ${DOT[status]}`} />
      {status}
    </span>
  );
}
