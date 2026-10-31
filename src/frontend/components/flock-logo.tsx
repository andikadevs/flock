// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import logoUrl from "@/frontend/assets/flock-logo.svg";
import { cn } from "@/frontend/lib/utils.ts";

export function FlockLogo({ className }: { className?: string }) {
  return <img src={logoUrl} alt="Flock" className={cn("size-7", className)} />;
}
