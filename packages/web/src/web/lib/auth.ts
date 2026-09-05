import { createAuthClient } from "better-auth/react";

/** Client Better Auth — email + mot de passe, session bearer stockée localement. */
export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: "/api/auth",
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("lbg_bearer") ?? "",
    },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) localStorage.setItem("lbg_bearer", token);
    },
  },
});

export function getBearer() {
  return localStorage.getItem("lbg_bearer") ?? "";
}

export async function signOutAndClear() {
  await authClient.signOut();
  localStorage.removeItem("lbg_bearer");
}
