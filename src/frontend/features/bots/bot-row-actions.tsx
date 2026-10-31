import { useState } from "react";
import { MoreHorizontalIcon, ScrollTextIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/frontend/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu.tsx";
import { DeleteBotDialog } from "./delete-bot-dialog.tsx";

type BotRowActionsProps = {
  botName: string;
  onInspect: () => void;
  onDelete: () => void;
};

export function BotRowActions({ botName, onInspect, onDelete }: BotRowActionsProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${botName}`} />}
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onInspect}>
            <ScrollTextIcon />
            View events
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmingDelete(true)}>
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteBotDialog
        botName={botName}
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        onConfirm={onDelete}
      />
    </>
  );
}
