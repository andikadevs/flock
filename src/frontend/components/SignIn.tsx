export function SignIn() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-100">Telegram Bot Manager</h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in with your organisation account to manage bots.
        </p>
        <a
          href="/auth/login"
          className="mt-6 inline-block w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
        >
          Continue with SSO
        </a>
      </div>
    </main>
  );
}
