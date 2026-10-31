// SPDX-FileCopyrightText: 2026 Andika Dwi Saputra <hello@andikadevs.space>
// SPDX-License-Identifier: MIT
import { LogInIcon } from "lucide-react";
import { FlockLogo } from "@/frontend/components/flock-logo.tsx";
import { buttonVariants } from "@/frontend/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card.tsx";
import { ThemeToggle } from "@/frontend/features/theme/theme-toggle.tsx";
import { useProviderName } from "./use-provider-name.ts";

export function SignInPage() {
  const providerName = useProviderName();

  return (
    <main className="relative flex min-h-svh items-center justify-center p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <FlockLogo className="mx-auto mb-2 size-12" />
          <CardTitle className="text-lg">Flock</CardTitle>
          <CardDescription>Run your Telegram bots from one place. Sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/auth/login" className={buttonVariants({ className: "w-full" })}>
            <LogInIcon />
            Continue with {providerName}
          </a>
        </CardContent>
      </Card>
    </main>
  );
}
