import { useEffect, useState } from "react";
import { authApi } from "./api.ts";

const FALLBACK_PROVIDER_NAME = "SSO";

/** The identity provider's display name, for the sign-in button. */
export function useProviderName(): string {
  const [providerName, setProviderName] = useState(FALLBACK_PROVIDER_NAME);

  useEffect(() => {
    authApi
      .signInOptions()
      .then(options => setProviderName(options.providerName))
      .catch(() => {});
  }, []);

  return providerName;
}
