import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db } from "./database";

/**
 * Auth LBG Express — email + mot de passe, deux rôles :
 * - `admin` : back-office complet (contenus, commandes, factures, utilisateurs)
 * - `client` : espace client (mes commandes, mes factures)
 */
export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  secret: process.env.BETTER_AUTH_SECRET,
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "client", input: false },
      accountStatus: {
        type: "string",
        required: false,
        defaultValue: "actif",
        input: false,
      },
      phone: { type: "string", required: false, input: true },
      company: { type: "string", required: false, input: true },
      mustChangePassword: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    return origin ? [origin] : ["*"];
  },
  plugins: [bearer()],
});
