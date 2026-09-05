import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { auth } from "../auth";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  accountStatus?: string | null;
  phone?: string | null;
  company?: string | null;
  mustChangePassword?: boolean | null;
};

/** Auth optionnelle — `context.user` vaut l'utilisateur connecté ou null. */
export const withUser = base.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });
  return next({
    context: {
      user: (session?.user as SessionUser | undefined) ?? null,
      session: session?.session ?? null,
    },
  });
});

/** Procédures protégées — rejette les appels non authentifiés. */
export const authed = base.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });
  if (!session) throw new ORPCError("UNAUTHORIZED", { message: "Connexion requise" });
  const user = session.user as SessionUser;
  if (user.accountStatus === "bloque") {
    throw new ORPCError("FORBIDDEN", { message: "Compte bloqué. Contactez LBG Express." });
  }
  return next({ context: { user, session: session.session } });
});

/** Procédures back-office — réservées au rôle admin. */
export const adminOnly = base.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });
  if (!session) throw new ORPCError("UNAUTHORIZED", { message: "Connexion requise" });
  const user = session.user as SessionUser;
  if (user.role !== "admin") {
    throw new ORPCError("FORBIDDEN", { message: "Accès réservé à l'administration" });
  }
  return next({ context: { user, session: session.session } });
});
