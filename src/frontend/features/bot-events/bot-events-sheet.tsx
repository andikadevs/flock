import type { BotView } from "@/server/bots/types.ts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/frontend/components/ui/sheet.tsx";
import { BotEventList } from "./bot-event-list.tsx";
import { useBotEvents } from "./use-bot-events.ts";

type BotEventsSheetProps = {
  bot: BotView | null;
  onClose: () => void;
};

export function BotEventsSheet({ bot, onClose }: BotEventsSheetProps) {
  return (
    <Sheet open={bot !== null} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        {bot && <BotEventsPanel bot={bot} />}
      </SheetContent>
    </Sheet>
  );
}

function BotEventsPanel({ bot }: { bot: BotView }) {
  const events = useBotEvents(bot.id);

  return (
    <>
      <SheetHeader>
        <SheetTitle>{bot.name}</SheetTitle>
        <SheetDescription>Recent events, newest first.</SheetDescription>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <BotEventList events={events} />
      </div>
    </>
  );
}
