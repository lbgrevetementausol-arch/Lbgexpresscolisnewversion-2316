import { createHmac, timingSafeEqual } from "node:crypto";
import { ORPCError } from "@orpc/server";

/** Durée de vie d'une session livreur : 12 h, la durée d'une tournée. */
const TTL_MS = 12 * 60 * 60 * 1000;

function secret(): string {
  return process.env.BETTER_AUTH_SECRET ?? process.env.DRIVER_TOKEN_SECRET ?? "lbg-driver-dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Jeton signé émis à la connexion : `driverId.expiration.signature`. */
export function signDriverToken(driverId: number, now = Date.now()): string {
  const payload = `${driverId}.${now + TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

/** Vérifie le jeton et renvoie l'identifiant du livreur, ou lève une erreur oRPC. */
export function verifyDriverToken(token: string): number {
  const parts = token.split(".");
  const [rawId, rawExp, signature] = parts;
  if (parts.length !== 3 || !rawId || !rawExp || !signature) {
    throw new ORPCError("UNAUTHORIZED", { message: "Session livreur invalide, reconnectez-vous." });
  }

  const expected = sign(`${rawId}.${rawExp}`);
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new ORPCError("UNAUTHORIZED", { message: "Session livreur invalide, reconnectez-vous." });
  }

  const expiresAt = Number(rawExp);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    throw new ORPCError("UNAUTHORIZED", { message: "Session livreur expirée, reconnectez-vous." });
  }

  const driverId = Number(rawId);
  if (!Number.isInteger(driverId) || driverId <= 0) {
    throw new ORPCError("UNAUTHORIZED", { message: "Session livreur invalide, reconnectez-vous." });
  }
  return driverId;
}
