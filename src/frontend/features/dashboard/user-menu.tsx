import { LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar.tsx";
import { Button } from "@/frontend/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu.tsx";

const initials = (actor: string): string => actor.slice(0, 2).toUpperCase();

export function UserMenu({ actor, onSignOut }: { actor: string; onSignOut: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="size-9" aria-label="Account" />}
      >
        <Avatar className="size-9">
          <AvatarFallback>{initials(actor)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{actor}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
