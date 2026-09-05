import { useState } from "react";
import { Copy, Loader2, Plus, Trash2, Webhook } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { dateOnly } from "../../lib/format";
import { Card } from "../site/section";
import { Field, Input } from "../site/field";
import { useProToken } from "../../queries/admin";
import {
  useCreateApiKey,
  useCreateWebhook,
  useDeleteWebhook,
  useProApiKeys,
  useProWebhooks,
  useRevokeApiKey,
} from "../../queries/pro";

/** Clés API + webhooks — fusionné depuis l'ancien espace /pro. */
export function IntegrationsPanel() {
  const { t, lang } = useI18n();
  const token = useProToken(true);
  const code = token.data?.code ?? null;

  const keys = useProApiKeys(code);
  const webhooks = useProWebhooks(code);
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();
  const createHook = useCreateWebhook();
  const deleteHook = useDeleteWebhook();

  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState("tracking.updated");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (value: string) => {
    void navigator.clipboard?.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(null), 1800);
  };

  if (!code) {
    return (
      <Card hover={false} className="text-sm text-muted">
        <Loader2 className="mr-2 inline size-4 animate-spin" />
        {t({ fr: "Chargement…", en: "Loading…" })}
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card hover={false}>
          <h3 className="font-display text-base font-bold">{t({ fr: "Clés API", en: "API keys" })}</h3>
          <p className="mt-2 text-sm text-muted">
            {t({
              fr: "Authentifiez vos appels avec l'en-tête x-lbg-api-key.",
              en: "Authenticate your calls with the x-lbg-api-key header.",
            })}
          </p>
          <form
            className="mt-5 flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              createKey.mutate({ accessCode: code, label }, { onSuccess: () => setLabel("") });
            }}
          >
            <Field label={t({ fr: "Libellé", en: "Label" })} className="min-w-[12rem] flex-1">
              <Input
                required
                minLength={2}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Boutique Shopify"
              />
            </Field>
            <button
              type="submit"
              disabled={createKey.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
            >
              {createKey.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {t({ fr: "Générer", en: "Generate" })}
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-border bg-surface-2/60 p-4 text-xs text-muted">
            <p className="font-semibold text-foreground">{t({ fr: "Comment l'utiliser", en: "How to use it" })}</p>
            <p className="mt-1.5">
              {t({
                fr: "Envoyez la clé dans l'en-tête x-lbg-api-key sur les écritures de suivi : tracking/create, tracking/addEvent, tracking/pushLocation et tracking/search. Sans cet en-tête (ou sans session admin), l'appel est refusé en 401.",
                en: "Send the key in the x-lbg-api-key header on tracking writes: tracking/create, tracking/addEvent, tracking/pushLocation and tracking/search. Without that header (or an admin session) the call is rejected with a 401.",
              })}
            </p>
            <pre className="mt-2.5 overflow-x-auto rounded-lg border border-border bg-background/60 p-3 font-mono text-[11px] leading-relaxed text-muted">{`curl -X POST ${typeof window === "undefined" ? "" : window.location.origin}/api/rpc/tracking/addEvent \\
  -H "content-type: application/json" \\
  -H "x-lbg-api-key: VOTRE_CLE" \\
  -d '{"json":{"trackingNumber":"TRK-...","status":"en_transit","location":"Hub Paris"}}'`}</pre>
          </div>

          <ul className="mt-5 grid gap-3">
            {(keys.data ?? []).map((k) => (
              <li key={k.id} className="rounded-xl border border-border bg-surface-2/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{k.label}</p>
                  {k.revoked ? (
                    <span className="rounded-full border border-danger/40 bg-danger/10 px-2.5 py-0.5 text-xs font-semibold text-danger">
                      {t({ fr: "Révoquée", en: "Revoked" })}
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={revokeKey.isPending}
                      onClick={() => revokeKey.mutate({ accessCode: code, id: k.id })}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger transition hover:underline disabled:opacity-60"
                    >
                      <Trash2 className="size-3.5" />
                      {t({ fr: "Révoquer", en: "Revoke" })}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => copy(k.key)}
                  className="mt-2 flex w-full items-center gap-2 overflow-hidden rounded-lg border border-border bg-background/60 px-3 py-2 text-left font-mono text-xs text-muted transition hover:border-primary/40"
                >
                  <Copy className="size-3.5 shrink-0" />
                  <span className="truncate">{k.key}</span>
                </button>
                <p className="mt-2 text-xs text-muted">
                  {t({ fr: "Créée le", en: "Created" })} {dateOnly(k.createdAt, lang)}
                  {copied === k.key ? ` · ${t({ fr: "copiée", en: "copied" })}` : ""}
                </p>
              </li>
            ))}
            {(keys.data ?? []).length === 0 ? (
              <li className="text-sm text-muted">{t({ fr: "Aucune clé.", en: "No key." })}</li>
            ) : null}
          </ul>
        </Card>

        <Card hover={false}>
          <h3 className="font-display text-base font-bold">Webhooks</h3>
          <p className="mt-2 text-sm text-muted">
            {t({
              fr: "Chaque appel est signé HMAC SHA-256 dans l'en-tête x-lbg-signature.",
              en: "Every call is HMAC SHA-256 signed in the x-lbg-signature header.",
            })}
          </p>
          <form
            className="mt-5 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              createHook.mutate({ accessCode: code, url, events }, { onSuccess: () => setUrl("") });
            }}
          >
            <Field label="URL">
              <Input
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://votre-app.fr/webhooks/lbg"
              />
            </Field>
            <Field label={t({ fr: "Événements", en: "Events" })}>
              <Input value={events} onChange={(e) => setEvents(e.target.value)} placeholder="tracking.updated" />
            </Field>
            {createHook.isError ? (
              <p className="text-sm text-danger">{t({ fr: "URL invalide.", en: "Invalid URL." })}</p>
            ) : null}
            <button
              type="submit"
              disabled={createHook.isPending}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
            >
              {createHook.isPending ? <Loader2 className="size-4 animate-spin" /> : <Webhook className="size-4" />}
              {t({ fr: "Ajouter le webhook", en: "Add webhook" })}
            </button>
          </form>

          <ul className="mt-5 grid gap-3">
            {(webhooks.data ?? []).map((w) => (
              <li key={w.id} className="rounded-xl border border-border bg-surface-2/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="break-all text-sm font-medium">{w.url}</p>
                  <button
                    type="button"
                    disabled={deleteHook.isPending}
                    onClick={() => deleteHook.mutate({ accessCode: code, id: w.id })}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger transition hover:underline disabled:opacity-60"
                  >
                    <Trash2 className="size-3.5" />
                    {t({ fr: "Supprimer", en: "Delete" })}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted">{w.events}</p>
                <button
                  type="button"
                  onClick={() => copy(w.secret)}
                  className="mt-2 flex w-full items-center gap-2 overflow-hidden rounded-lg border border-border bg-background/60 px-3 py-2 text-left font-mono text-xs text-muted transition hover:border-primary/40"
                >
                  <Copy className="size-3.5 shrink-0" />
                  <span className="truncate">{w.secret}</span>
                </button>
              </li>
            ))}
            {(webhooks.data ?? []).length === 0 ? (
              <li className="text-sm text-muted">{t({ fr: "Aucun webhook.", en: "No webhook." })}</li>
            ) : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
