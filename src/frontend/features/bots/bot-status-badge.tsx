// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import type { BotStatus } from "@/server/bots/types.ts";
import { Badge } from "@/frontend/components/ui/badge.tsx";
import { cn } from "@/frontend/lib/utils.ts";

const TONE: Record<BotStatus, { pill: string; dot: string }> = {
  running: { pill: "bg-success/12 text-success", dot: "bg-success" },
  starting: { pill: "bg-warning/12 text-warning", dot: "bg-warning animate-pulse" },
  stopped: { pill: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/50" },
  error: { pill: "bg-destructive/12 text-destructive", dot: "bg-destructive" },
};

export function BotStatusBadge({ status }: { status: BotStatus }) {
  const tone = TONE[status];

  return (
    <Badge className={cn("gap-1.5 capitalize", tone.pill)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", tone.dot)} />
      {status}
    </Badge>
  );
}
