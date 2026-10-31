import { useEffect, useState } from "react";
import { api } from "../api.ts";

export function SignIn() {
  const [providerName, setProviderName] = useState("SSO");

  useEffect(() => {
    api
      .signInOptions()
      .then(options => setProviderName(options.providerName))
      .catch(() => {});
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-base font-medium">Telegram Bot Manager</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Sign in with your organisation account to manage bots.
        </p>
        <a
          href="/auth/login"
          className="mt-8 inline-block w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Continue with {providerName}
        </a>
      </div>
    </main>
  );
}
