/** Tracks who is signed in, if anyone. */

import { useCallback, useEffect, useState } from "react";
import { api } from "./api.ts";

export type SessionState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "signed-in"; actor: string };

export function useSession() {
  const [state, setState] = useState<SessionState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    api
      .whoami()
      .then(({ actor }) => {
        if (!cancelled) setState({ status: "signed-in", actor });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "anonymous" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = useCallback(async () => {
    const { providerLogoutUrl } = await api.signOut();
    setState({ status: "anonymous" });
    if (providerLogoutUrl) window.location.href = providerLogoutUrl;
  }, []);

  return { state, signOut };
}
