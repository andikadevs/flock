// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/frontend/components/ui/button.tsx";
import { useTheme } from "./theme-provider.tsx";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9 bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      aria-label={label}
      title={label}
      onClick={event => void toggleTheme(event.currentTarget)}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
