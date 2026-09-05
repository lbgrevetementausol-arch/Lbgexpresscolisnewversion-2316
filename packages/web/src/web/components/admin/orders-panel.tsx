import { useState } from "react";
import { Link } from "wouter";
import { Check, Loader2, RefreshCw, X } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { dateTime, moneyCents } from "../../lib/format";
import { Card } from "../site/section";
import { useAdminOrders, useDecideOrder, useSetOrderStatus } from "../../queries/admin";
import { useCheckout } from "../../queries/invoices";

const FILTERS = ["tous", "nouveau", "a_valider", "accepte", "refuse", "paye", "en_cours", "livre", "annule"] as const;
type Filter = (typeof FILTERS)[number];

/** Commandes en temps réel : acceptation, refus, statut, génération de facture. */
export function OrdersPanel() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<Filter>("tous");
  const [reason, setReason] = useState<Record<string, string>>({});
  const orders = useAdminOrders(filter, true);
  const decide = useDecideOrder();
  const setStatus = useSetOrderStatus();
  const checkout = useCheckout();
  const [invoiceFor, setInvoiceFor] = useState<Record<string, string>>({});

  const rows = orders.data ?? [];

  return (
    <Card hover={false}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">
          {t({ fr: "Commandes", en: "Orders" })} · {rows.length}
        </p>
        <span className="inline-flex items-center gap-2 text-xs text-muted">
          <RefreshCw className={orders.isFetching ? "size-3.5 animate-spin" : "size-3.5"} />
          {t({ fr: "Temps réel (5 s)", en: "Live (5s)" })}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={
              filter === item
                ? "rounded-full border border-primary/60 bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary"
                : "rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary/40"
            }
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted">{t({ fr: "Aucune commande.", en: "No orders." })}</p>
        ) : null}
        {rows.map((order) => (
          <div key={order.id} className="rounded-card border border-border bg-surface-2/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">
                  {order.ref} <span className="text-xs font-normal text-muted">· {order.status}</span>
                </p>
                <p className="mt-1 text-sm">
                  {order.customerName} — {order.customerEmail}
                  {order.customerPhone ? ` — ${order.customerPhone}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {order.fromAddress} → {order.toAddress}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {order.kind} · {order.zone} · {order.service}
                  {order.weightKg ? ` · ${order.weightKg} kg` : ""}
                  {order.volumeM3 ? ` · ${order.volumeM3} m³` : ""} · {dateTime(order.createdAt, lang)}
                </p>
              </div>
              <p className="text-lg font-bold text-primary">{moneyCents(order.priceCents ?? 0, lang)}</p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                aria-label={t({ fr: "Motif (refus)", en: "Reason (refusal)" })}
                placeholder={t({ fr: "Motif / note", en: "Reason / note" })}
                value={reason[order.ref] ?? ""}
                onChange={(e) => setReason((prev) => ({ ...prev, [order.ref]: e.target.value }))}
                className="min-w-[10rem] flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs outline-none focus:border-primary/60"
              />
              <button
                type="button"
                disabled={decide.isPending}
                onClick={() =>
                  decide.mutate({ ref: order.ref, decision: "accepte", reason: reason[order.ref] || undefined })
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-success/15 px-3 py-2 text-xs font-semibold text-success disabled:opacity-60"
              >
                {decide.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                {t({ fr: "Accepter", en: "Accept" })}
              </button>
              <button
                type="button"
                disabled={decide.isPending}
                onClick={() =>
                  decide.mutate({ ref: order.ref, decision: "refuse", reason: reason[order.ref] || undefined })
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-danger/15 px-3 py-2 text-xs font-semibold text-danger disabled:opacity-60"
              >
                <X className="size-3.5" />
                {t({ fr: "Refuser", en: "Refuse" })}
              </button>
              <select
                aria-label={t({ fr: "Statut", en: "Status" })}
                value={order.status}
                onChange={(e) =>
                  setStatus.mutate({
                    ref: order.ref,
                    status: e.target.value as
                      | "nouveau"
                      | "a_valider"
                      | "accepte"
                      | "refuse"
                      | "paye"
                      | "en_cours"
                      | "livre"
                      | "annule",
                  })
                }
                className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs outline-none"
              >
                {FILTERS.filter((f) => f !== "tous").map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={checkout.isPending}
                onClick={async () => {
                  const result = await checkout.mutateAsync({ quoteRef: order.ref, locale: lang });
                  setInvoiceFor((prev) => ({ ...prev, [order.ref]: result.number }));
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/50 disabled:opacity-60"
              >
                {checkout.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {t({ fr: "Facture", en: "Invoice" })}
              </button>
              {invoiceFor[order.ref] ? (
                <Link
                  to={`/facture/${invoiceFor[order.ref]}`}
                  className="text-xs font-semibold text-primary underline"
                >
                  {invoiceFor[order.ref]}
                </Link>
              ) : null}
            </div>
            {order.decisionReason ? (
              <p className="mt-2 text-xs text-muted">
                {t({ fr: "Motif enregistré : ", en: "Saved reason: " })}
                {order.decisionReason}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
