import type { BotView } from "@/server/bots/types.ts";
import { Card, CardDescription, CardHeader } from "@/frontend/components/ui/card.tsx";

type Stat = { label: string; value: number };

function summarize(bots: BotView[]): Stat[] {
  const sum = (pick: (bot: BotView) => number) => bots.reduce((total, bot) => total + pick(bot), 0);

  return [
    { label: "Bots", value: bots.length },
    { label: "Running", value: bots.filter(bot => bot.status === "running").length },
    { label: "Updates handled", value: sum(bot => bot.metrics.updates) },
    { label: "Errors", value: sum(bot => bot.metrics.errors) },
  ];
}

export function FleetSummary({ bots }: { bots: BotView[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {summarize(bots).map(stat => (
        <Card key={stat.label} size="sm">
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <p className="text-2xl font-semibold tabular-nums">{stat.value.toLocaleString()}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
