import { request } from "@/frontend/lib/http.ts";

export type SignInOptions = { providerName: string };

export const authApi = {
  whoami: () => request<{ actor: string }>("/api/session"),

  signInOptions: () => request<SignInOptions>("/api/session/options"),

  signOut: () =>
    request<{ providerLogoutUrl: string | null }>("/api/session", { method: "DELETE" }),
};
