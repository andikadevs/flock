import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { revealFrom } from "./reveal-transition.ts";
import { applyTheme, currentTheme, type Theme } from "./theme.ts";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: (origin: Element | null) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  const toggleTheme = useCallback(async (origin: Element | null) => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    await revealFrom(origin, () => {
      applyTheme(next);
      setTheme(next);
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>.");
  return context;
}
