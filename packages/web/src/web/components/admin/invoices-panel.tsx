import { useState } from "react";
import { Link } from "wouter";
import { Check, Loader2, Plus } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { dateTime, moneyCents } from "../../lib/format";
import { Card } from "../site/section";
import { Field, Input } from "../site/field";
import { useCreateInvoice, useInvoiceList, useSetInvoiceStatus } from "../../queries/invoices";

const FILTERS = ["tous", "en_attente_paiement", "payee", "annulee", "remboursee"] as const;
type Filter = (typeof FILTERS)[number];

/** Facturation : suivi des règlements et création manuelle de factures pro. */
export function InvoicesPanel() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<Filter>("tous");
  const list = useInvoiceList(filter, true);
  const setStatus = useSetInvoiceStatus();
  const create = useCreateInvoice();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    subject: "Prestation de transport",
    label: "Transport de colis",
    amount: "",
  });
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const amount = Number(form.amount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(t({ fr: "Montant HT invalide.", en: "Invalid amount excl. VAT." }));
      return;
    }
    try {
      await create.mutateAsync({
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim() || undefined,
        subject: form.subject.trim() || "Prestation de transport",
        items: [{ label: form.label.trim(), quantity: 1, unit: "forfait", unitPriceCents: Math.round(amount * 100) }],
      });
      setShowForm(false);
      setForm({ ...form, customerName: "", customerEmail: "", customerPhone: "", amount: "" });
    } catch {
      setError(t({ fr: "Création impossible.", en: "Could not create the invoice." }));
    }
  };

  const rows = list.data?.rows ?? [];
  const totals = list.data?.totals;

  return (
    <div className="grid gap-6">
      <Card hover={false}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold">
            {t({ fr: "Factures", en: "Invoices" })} · {rows.length}
          </p>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
          >
            <Plus className="size-4" />
            {t({ fr: "Nouvelle facture", en: "New invoice" })}
          </button>
        </div>

        {totals ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <p className="rounded-xl border border-border bg-surface-2/50 p-3 text-sm">
              <span className="block text-xs uppercase tracking-[0.12em] text-muted">
                {t({ fr: "Encaissé", en: "Collected" })}
              </span>
              <span className="mt-1 block text-lg font-bold text-success">{moneyCents(totals.paidCents, lang)}</span>
            </p>
            <p className="rounded-xl border border-border bg-surface-2/50 p-3 text-sm">
              <span className="block text-xs uppercase tracking-[0.12em] text-muted">
                {t({ fr: "En attente", en: "Pending" })}
              </span>
              <span className="mt-1 block text-lg font-bold text-warning">{moneyCents(totals.pendingCents, lang)}</span>
            </p>
            <p className="rounded-xl border border-border bg-surface-2/50 p-3 text-sm">
              <span className="block text-xs uppercase tracking-[0.12em] text-muted">
                {t({ fr: "Documents", en: "Documents" })}
              </span>
              <span className="mt-1 block text-lg font-bold">{totals.count}</span>
            </p>
          </div>
        ) : null}

        {showForm ? (
          <form onSubmit={submit} className="mt-5 grid gap-3 rounded-card border border-border bg-surface-2/40 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t({ fr: "Client", en: "Customer" })}>
                <Input required aria-label="client" value={form.customerName} onChange={set("customerName")} />
              </Field>
              <Field label={t({ fr: "Email", en: "Email" })}>
                <Input
                  required
                  type="email"
                  aria-label="email"
                  value={form.customerEmail}
                  onChange={set("customerEmail")}
                />
              </Field>
              <Field label={t({ fr: "Téléphone", en: "Phone" })}>
                <Input aria-label="phone" value={form.customerPhone} onChange={set("customerPhone")} />
              </Field>
              <Field label={t({ fr: "Objet", en: "Subject" })}>
                <Input aria-label="subject" value={form.subject} onChange={set("subject")} />
              </Field>
              <Field label={t({ fr: "Libellé de la ligne", en: "Line label" })}>
                <Input aria-label="label" value={form.label} onChange={set("label")} />
              </Field>
              <Field label={t({ fr: "Montant HT (€)", en: "Amount excl. VAT (€)" })}>
                <Input aria-label="amount" value={form.amount} onChange={set("amount")} placeholder="250" />
              </Field>
            </div>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <button
              type="submit"
              disabled={create.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {t({ fr: "Créer la facture", en: "Create invoice" })}
            </button>
          </form>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
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

        <div className="mt-4 grid gap-2">
          {rows.map((invoice) => (
            <div key={invoice.id} className="rounded-card border border-border bg-surface-2/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link to={`/facture/${invoice.number}`} className="font-semibold text-primary">
                    {invoice.number}
                  </Link>
                  <p className="text-sm">
                    {invoice.customerName} — {invoice.customerEmail}
                  </p>
                  <p className="text-xs text-muted">
                    {invoice.quoteRef ?? "—"} · {invoice.status} · {dateTime(invoice.createdAt, lang)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-bold">{moneyCents(invoice.totalCents, lang)}</span>
                  {invoice.status === "payee" ? null : (
                    <button
                      type="button"
                      disabled={setStatus.isPending}
                      onClick={() =>
                        setStatus.mutate({
                          number: invoice.number,
                          status: "payee",
                          paymentMethod: "carte_mypos",
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-success/15 px-3 py-2 text-xs font-semibold text-success disabled:opacity-60"
                    >
                      {setStatus.isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      {t({ fr: "Marquer payée", en: "Mark paid" })}
                    </button>
                  )}
                  <select
                    aria-label={t({ fr: "Statut facture", en: "Invoice status" })}
                    value={invoice.status}
                    onChange={(e) =>
                      setStatus.mutate({
                        number: invoice.number,
                        status: e.target.value as "en_attente_paiement" | "payee" | "annulee" | "remboursee",
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
