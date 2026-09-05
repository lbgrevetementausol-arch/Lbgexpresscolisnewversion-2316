import { Link } from "wouter";
import { FileText, LogOut, Package, Receipt } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { dateTime, moneyCents } from "../lib/format";
import { Card, Section } from "../components/site/section";
import { PageHero } from "../components/site/layout";
import { ProtectedRoute } from "../components/protected-route";
import { authClient, signOutAndClear } from "../lib/auth";
import { useMyOrders } from "../queries/admin";
import { useMyInvoices } from "../queries/invoices";

function ClientArea() {
  const { t, lang } = useI18n();
  const { data: session } = authClient.useSession();
  const orders = useMyOrders(true);
  const invoices = useMyInvoices(true);

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Espace client", en: "Customer area" })}
        title={t({ fr: "Vos commandes et factures", en: "Your orders and invoices" })}
        lead={session?.user?.name ?? undefined}
      >
        <button
          type="button"
          onClick={() => void signOutAndClear().then(() => window.location.assign("/"))}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary/50"
        >
          <LogOut className="size-4" />
          {t({ fr: "Se déconnecter", en: "Sign out" })}
        </button>
      </PageHero>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card hover={false}>
            <p className="flex items-center gap-2 font-semibold">
              <Package className="size-4 text-primary" />
              {t({ fr: "Mes commandes", en: "My orders" })}
            </p>
            <div className="mt-4 grid gap-3">
              {(orders.data ?? []).length === 0 ? (
                <p className="text-sm text-muted">
                  {t({ fr: "Aucune commande pour le moment.", en: "No orders yet." })}{" "}
                  <Link to="/devis" className="font-semibold text-primary">
                    {t({ fr: "Demander un devis", en: "Request a quote" })}
                  </Link>
                </p>
              ) : null}
              {(orders.data ?? []).map((order) => (
                <div key={order.id} className="rounded-card border border-border bg-surface-2/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{order.ref}</p>
                    <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {order.fromAddress} → {order.toAddress}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-primary">{moneyCents(order.priceCents ?? 0, lang)}</span>
                    <span className="text-xs text-muted">{dateTime(order.createdAt, lang)}</span>
                  </div>
                  {order.decisionReason ? (
                    <p className="mt-2 text-xs text-muted">
                      {t({ fr: "Note LBG : ", en: "LBG note: " })}
                      {order.decisionReason}
                    </p>
                  ) : null}
                  {order.trackingNumber ? (
                    <Link to="/suivi" className="mt-2 inline-block text-xs font-semibold text-primary">
                      {order.trackingNumber}
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          <Card hover={false}>
            <p className="flex items-center gap-2 font-semibold">
              <Receipt className="size-4 text-primary" />
              {t({ fr: "Mes factures", en: "My invoices" })}
            </p>
            <div className="mt-4 grid gap-3">
              {(invoices.data ?? []).length === 0 ? (
                <p className="text-sm text-muted">{t({ fr: "Aucune facture.", en: "No invoices." })}</p>
              ) : null}
              {(invoices.data ?? []).map((invoice) => (
                <Link
                  key={invoice.id}
                  to={`/facture/${invoice.number}`}
                  className="rounded-card border border-border bg-surface-2/50 p-4 transition hover:border-primary/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-semibold">
                      <FileText className="size-4 text-primary" />
                      {invoice.number}
                    </span>
                    <span
                      className={
                        invoice.status === "payee"
                          ? "rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"
                          : "rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning"
                      }
                    >
                      {invoice.status === "payee"
                        ? t({ fr: "Payée", en: "Paid" })
                        : t({ fr: "À régler", en: "To pay" })}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-primary">{moneyCents(invoice.totalCents, lang)}</span>
                    <span className="text-xs text-muted">{dateTime(invoice.createdAt, lang)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}

export default function EspaceClientPage() {
  return (
    <ProtectedRoute>
      <ClientArea />
    </ProtectedRoute>
  );
}
