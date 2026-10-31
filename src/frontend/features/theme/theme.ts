/**
 * Light or dark, chosen by the user and remembered; the OS preference is only the default.
 * index.html applies the same rule inline before first paint, so there is no flash.
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this visit.
  }
}
