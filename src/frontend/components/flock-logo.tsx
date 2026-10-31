import logoUrl from "@/frontend/assets/flock-logo.svg";
import { cn } from "@/frontend/lib/utils.ts";

export function FlockLogo({ className }: { className?: string }) {
  return <img src={logoUrl} alt="Flock" className={cn("size-7", className)} />;
}
