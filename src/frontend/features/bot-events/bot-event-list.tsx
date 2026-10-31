import { CircleAlertIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import { Skeleton } from "@/frontend/components/ui/skeleton.tsx";
import { formatTimestamp } from "@/frontend/lib/format.ts";
import type { BotEvent } from "./api.ts";

const LEVEL_ICON: Record<string, React.ReactNode> = {
  error: <CircleAlertIcon className="size-4 text-destructive" />,
  warn: <TriangleAlertIcon className="size-4 text-warning" />,
  info: <InfoIcon className="size-4 text-info" />,
};

export function BotEventList({ events }: { events: BotEvent[] | null }) {
  if (events === null) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing logged yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {events.map(event => (
        <li key={event.id} className="flex gap-3 text-sm">
          <span className="mt-0.5 shrink-0">{LEVEL_ICON[event.level] ?? LEVEL_ICON.info}</span>
          <div className="min-w-0">
            <p className="break-words">{event.message}</p>
            <time dateTime={event.at} className="text-xs text-muted-foreground">
              {formatTimestamp(event.at)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
