import { FlockLogo } from "@/frontend/components/flock-logo.tsx";
import { ThemeToggle } from "@/frontend/features/theme/theme-toggle.tsx";
import { UserMenu } from "./user-menu.tsx";

export function AppHeader({ actor, onSignOut }: { actor: string; onSignOut: () => void }) {
  return (
    <header className="sticky top-3 z-10 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex h-14 items-center justify-between rounded-full bg-card/80 pr-2.5 pl-4 shadow-float backdrop-blur-md">
        <div className="flex items-center gap-2 font-medium">
          <FlockLogo />
          Flock
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserMenu actor={actor} onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  );
}
