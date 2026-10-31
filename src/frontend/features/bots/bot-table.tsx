// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import type { BotView } from "@/server/bots/types.ts";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table.tsx";
import { BotRow } from "./bot-row.tsx";

type BotTableProps = {
  bots: BotView[];
  onChanged: () => void;
  onInspect: (bot: BotView) => void;
};

export function BotTable({ bots, onChanged, onInspect }: BotTableProps) {
  return (
    <Table className="min-w-3xl [&_td]:py-3 [&_td:first-child]:rounded-l-2xl [&_td:first-child]:pl-3 [&_td:last-child]:rounded-r-2xl [&_td:last-child]:pr-3 [&_th]:text-xs [&_th]:font-medium [&_th]:text-muted-foreground [&_th:first-child]:pl-3 [&_th:last-child]:pr-3">
      <TableHeader>
        <TableRow>
          <TableHead>Bot</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Uptime</TableHead>
          <TableHead>Updates</TableHead>
          <TableHead>Errors</TableHead>
          <TableHead className="text-right">Enabled</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bots.map(bot => (
          <BotRow key={bot.id} bot={bot} onChanged={onChanged} onInspect={onInspect} />
        ))}
      </TableBody>
    </Table>
  );
}
