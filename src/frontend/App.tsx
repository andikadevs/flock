import { Dashboard } from "./components/Dashboard.tsx";
import { SignIn } from "./components/SignIn.tsx";
import { useSession } from "./useSession.ts";

export function App() {
  const { state, signOut } = useSession();

  if (state.status === "loading") {
    return <main className="p-10 text-sm text-slate-500">Loading…</main>;
  }

  if (state.status === "anonymous") return <SignIn />;

  return <Dashboard actor={state.actor} onSignOut={() => void signOut()} />;
}
