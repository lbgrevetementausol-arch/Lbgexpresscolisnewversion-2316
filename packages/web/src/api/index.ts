import { readFile } from "node:fs/promises";
import type { RouterClient } from "@orpc/server";
import { createAgentUIStreamResponse } from "ai";
import { createApp } from "./__core/app";
import { supportAgent } from "./agent";
import { aiConfigured } from "./agent/gateway";
import { auth } from "./auth";
import { myposConfig, verifyNotification } from "./lib/mypos";
import { settleMyposPayment } from "./services/mypos-settlement";
import { verifyUnsubscribe } from "./lib/unsubscribe-token";
import { db } from "./database";
import * as schema from "./database/schema";
import { eq } from "drizzle-orm";
import { runReviewRequests } from "./services/review-requests";
import { auth as betterAuth } from "./auth";
import { MAX_DOC_BYTES, contentTypeFor, docPath, saveDoc } from "./lib/driver-docs";
import { admin } from "./routes/admin";
import { content } from "./routes/content";
import { driverAccount } from "./routes/driver-account";
import { driverAdmin } from "./routes/driver-admin";
import { drivers } from "./routes/drivers";
import { invoices } from "./routes/invoices";
import { ping } from "./routes/ping";
import { pro } from "./routes/pro";
import { quotes } from "./routes/quotes";
import { newsletter } from "./routes/newsletter";
import { support } from "./routes/support";
import { tracking } from "./routes/tracking";

// API features are oRPC procedures, one file per feature in ./routes/,
// composed into this router — typed end-to-end via the clients
// (web: src/web/lib/api.ts, mobile: lib/api.ts).
// Keep each routes/ file under 500 lines (`bun run lint` enforces this);
// split into more feature files as they grow.
// Patterns and examples: skills/app/references/api.md
export const router = {
  ping,
  quotes,
  tracking,
  drivers,
  driverAccount,
  driverAdmin,
  pro,
  content,
  admin,
  invoices,
  support,
  newsletter,
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);
// Rare plain-HTTP endpoints (webhooks, streaming, the Better Auth handler)
// register here with full paths, e.g. app.post("/api/webhooks/example", ...)
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

/**
 * Callback serveur-à-serveur myPOS Checkout (IPCPurchaseNotify).
 * Vérifie la signature RSA, encaisse la facture, enregistre le paiement
 * puis répond "OK" en texte brut — exigence myPOS.
 */
app.post("/api/webhooks/mypos", async (c) => {
  const cfg = myposConfig();
  if (!cfg) return c.text("myPOS non configuré", 503);

  const form = await c.req.parseBody().catch(() => null);
  if (!form) return c.text("payload invalide", 400);

  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(form)) {
    if (typeof value === "string") fields[key] = value;
  }
  const signature = fields.Signature ?? "";
  delete fields.Signature;

  if (!verifyNotification(fields, signature, cfg.certificate)) {
    return c.text("signature invalide", 401);
  }

  const orderId = fields.OrderID;
  if (!orderId) return c.text("OrderID manquant", 400);

  const result = await settleMyposPayment({
    orderId,
    amount: fields.Amount,
    currency: fields.Currency,
    transactionRef: fields.IPC_Trnref ?? fields.IPCTrnRef ?? null,
  });
  if (!result.ok) return c.text(result.error, result.status);

  return c.text("OK", 200);
});

/** Entrée webhook pour une future automatisation WhatsApp externe (ManyChat, n8n, Make…). */
app.post("/api/webhooks/whatsapp-lead", async (c) => {
  const payload = await c.req.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return c.json({ ok: false, error: "payload JSON requis" }, 400);
  }
  const hook = process.env.WHATSAPP_AUTOMATION_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: "whatsapp.inbound", payload }),
      });
    } catch {
      return c.json({ ok: false, error: "relais indisponible" }, 502);
    }
  }
  return c.json({ ok: true, relayed: Boolean(hook) }, 200);
});

/** Chat IA du site — réponse en flux, donc route HTTP simple et non procédure oRPC. */
app.post("/api/agent/messages", async (c) => {
  // Sans clé OpenAI le chat ne peut pas répondre : on le dit au lieu de laisser
  // le flux échouer silencieusement côté navigateur.
  if (!aiConfigured) {
    return c.json(
      { error: "Chat indisponible : OPENAI_API_KEY absente de la configuration du serveur." },
      503,
    );
  }
  const body = await c.req.json().catch(() => null);
  if (!body || !Array.isArray(body.messages)) {
    return c.json({ error: "messages requis" }, 400);
  }
  return createAgentUIStreamResponse({ agent: supportAgent, uiMessages: body.messages });
});

/**
 * Relance d'avis Trustpilot après livraison — déclenchée par le timer systemd
 * du VPS, jamais par le navigateur. Protégée par un secret partagé.
 */
app.post("/api/cron/review-requests", async (c) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return c.json({ ok: false, error: "CRON_SECRET non configuré" }, 503);
  if (c.req.header("x-lbg-cron-key") !== secret) return c.json({ ok: false, error: "clé invalide" }, 401);
  const dryRun = c.req.query("dry") === "1";
  try {
    const result = await runReviewRequests({ dryRun });
    return c.json({ ok: true, dryRun, ...result }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "erreur inconnue";
    return c.json({ ok: false, error: message }, 500);
  }
});

/**
 * Désinscription newsletter en un clic depuis un e-mail.
 * Route HTTP simple (et non procédure oRPC) car le lien doit être cliquable
 * directement depuis une boîte mail — exigence de l'art. L34-5 CPCE.
 * Protégée par un HMAC de l'adresse pour empêcher la désinscription d'un tiers.
 */
function unsubscribePage(title: string, message: string, status: 200 | 400) {
  return { status, html: `<!doctype html><html lang="fr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><meta name="robots" content="noindex" /><title>${title} — LBG Express Colis</title></head><body style="margin:0;background:#0b1220;font-family:Arial,Helvetica,sans-serif;color:#e6edf7"><div style="max-width:560px;margin:64px auto;padding:32px;background:#111a2b;border:1px solid #1e2b45;border-radius:16px"><p style="font-size:18px;font-weight:bold;margin:0 0 20px">LBG<span style="color:#06b6d4">EXPRESS</span> COLIS</p><h1 style="font-size:20px;color:#fff;margin:0 0 12px">${title}</h1><p style="font-size:14px;line-height:1.7;color:#c3cfe2;margin:0 0 24px">${message}</p><a href="https://www.lbgexpresscolis.fr" style="display:inline-block;background:#06b6d4;color:#04151b;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">Retour au site</a></div></body></html>` };
}

app.get("/api/newsletter/unsubscribe", async (c) => {
  const email = (c.req.query("email") ?? "").trim().toLowerCase();
  const token = c.req.query("token") ?? "";
  if (!email || !token || !verifyUnsubscribe(email, token)) {
    const page = unsubscribePage("Lien invalide", "Ce lien de désinscription n'est pas valide ou a été tronqué par votre messagerie. Écrivez-nous à contact@lbgexpresscolis.fr et nous retirons votre adresse manuellement.", 400);
    return c.html(page.html, page.status);
  }
  await db
    .update(schema.newsletterSubscribers)
    .set({ active: false })
    .where(eq(schema.newsletterSubscribers.email, email));
  const page = unsubscribePage("Désinscription confirmée", `L'adresse <strong>${email.replace(/</g, "&lt;")}</strong> ne recevra plus nos actualités. Vous continuerez à recevoir les e-mails liés à vos commandes et à vos factures.`, 200);
  return c.html(page.html, page.status);
});

/**
 * Téléversement d'une pièce justificative livreur (permis, identité, carte grise).
 * Route HTTP car multipart : oRPC ne transporte pas de fichier binaire.
 * Les fichiers sont écrits hors du dossier public et ne sont jamais servis en direct.
 */
app.post("/api/driver/document", async (c) => {
  const form = await c.req.parseBody().catch(() => null);
  const file = form?.file;
  if (!(file instanceof File)) return c.json({ ok: false, error: "Aucun fichier reçu" }, 400);
  if (file.size > MAX_DOC_BYTES) return c.json({ ok: false, error: "Fichier trop lourd (8 Mo maximum)" }, 413);
  try {
    const key = await saveDoc(await file.arrayBuffer(), file.type);
    return c.json({ ok: true, key }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "erreur inconnue";
    return c.json({ ok: false, error: message }, 400);
  }
});

/** Lecture d'une pièce justificative — réservée à une session administrateur. */
app.get("/api/driver/document/:key", async (c) => {
  const session = await betterAuth.api.getSession({ headers: c.req.raw.headers });
  if (!session || (session.user as { role?: string | null }).role !== "admin") {
    return c.json({ ok: false, error: "Accès réservé à l'administration" }, 403);
  }
  const key = c.req.param("key");
  const full = docPath(key);
  if (!full) return c.json({ ok: false, error: "Clé invalide" }, 400);
  const bytes = await readFile(full).catch(() => null);
  if (!bytes) return c.json({ ok: false, error: "Document introuvable" }, 404);
  return new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": contentTypeFor(key), "Cache-Control": "private, no-store" },
  });
});

export default app;
