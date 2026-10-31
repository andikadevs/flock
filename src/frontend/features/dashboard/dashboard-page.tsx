import { useState } from "react";
import { CircleAlertIcon } from "lucide-react";
import type { BotView } from "@/server/bots/types.ts";
import { Alert, AlertDescription, AlertTitle } from "@/frontend/components/ui/alert.tsx";
import { Card } from "@/frontend/components/ui/card.tsx";
import { Skeleton } from "@/frontend/components/ui/skeleton.tsx";
import { BotEventsSheet } from "@/frontend/features/bot-events/bot-events-sheet.tsx";
import { AddBotDialog } from "@/frontend/features/bots/add-bot-dialog.tsx";
import { BotTable } from "@/frontend/features/bots/bot-table.tsx";
import { BotsEmptyState } from "@/frontend/features/bots/bots-empty-state.tsx";
import { useBots } from "@/frontend/features/bots/use-bots.ts";
import { AppHeader } from "./app-header.tsx";
import { FleetSummary } from "./fleet-summary.tsx";

type DashboardPageProps = { actor: string; onSignOut: () => void };

export function DashboardPage({ actor, onSignOut }: DashboardPageProps) {
  const { bots, error, refresh } = useBots();
  const [inspecting, setInspecting] = useState<BotView | null>(null);
  const addBot = <AddBotDialog onAdded={() => void refresh()} />;

  return (
    <div className="min-h-svh">
      <AppHeader actor={actor} onSignOut={onSignOut} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 pt-10 pb-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Bots</h1>
            <p className="text-sm text-muted-foreground">
              Run, pause and watch every bot from one place.
            </p>
          </div>
          {addBot}
        </div>

        {error && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>Could not load bots</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {bots === null ? (
          <Skeleton className="h-64 w-full rounded-3xl" />
        ) : (
          <>
            <FleetSummary bots={bots} />
            <Card className="p-2">
              {bots.length === 0 ? (
                <BotsEmptyState action={addBot} />
              ) : (
                <BotTable bots={bots} onChanged={refresh} onInspect={setInspecting} />
              )}
            </Card>
          </>
        )}
      </main>

      <BotEventsSheet bot={inspecting} onClose={() => setInspecting(null)} />
    </div>
  );
}
