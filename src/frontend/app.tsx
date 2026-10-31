// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import { Toaster } from "@/frontend/components/ui/sonner.tsx";
import { SignInPage } from "@/frontend/features/auth/sign-in-page.tsx";
import { useSession } from "@/frontend/features/auth/use-session.ts";
import { DashboardPage } from "@/frontend/features/dashboard/dashboard-page.tsx";
import { ThemeProvider, useTheme } from "@/frontend/features/theme/theme-provider.tsx";

export function App() {
  return (
    <ThemeProvider>
      <Screen />
      <ThemedToaster />
    </ThemeProvider>
  );
}

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme} position="bottom-right" />;
}

function Screen() {
  const { state, signOut } = useSession();

  switch (state.status) {
    case "loading":
      return null;
    case "anonymous":
      return <SignInPage />;
    case "signed-in":
      return <DashboardPage actor={state.actor} onSignOut={() => void signOut()} />;
  }
}
