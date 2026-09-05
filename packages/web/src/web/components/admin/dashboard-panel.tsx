import { Activity, Check, FileText, Package, TrendingUp, Users } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { dateTime, money } from "../../lib/format";
import { Card } from "../site/section";
import { useAdminAudit, useAdminLeads, useAdminStats, useMarkLeadHandled } from "../../queries/admin";

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-card border border-border bg-surface-2/50 p-4">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted">
        <Icon className="size-3.5 text-primary" />
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/** Vue d'ensemble du back-office : KPI, activité 14 jours, leads du chat, journal. */
export function DashboardPanel() {
  const { t, lang } = useI18n();
  const stats = useAdminStats(true);
  const leads = useAdminLeads(true);
  const audit = useAdminAudit(true);
  const markHandled = useMarkLeadHandled();

  const s = stats.data;
  const max = Math.max(1, ...(s?.series ?? []).map((point) => point.count));

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={Package}
          label={t({ fr: "Commandes", en: "Orders" })}
          value={String(s?.quotes ?? 0)}
          hint={t({ fr: `${s?.pendingOrders ?? 0} à traiter`, en: `${s?.pendingOrders ?? 0} to process` })}
        />
        <Kpi
          icon={TrendingUp}
          label={t({ fr: "Encaissé", en: "Collected" })}
          value={money(s?.paid ?? 0, lang)}
          hint={t({ fr: `${money(s?.pending ?? 0, lang)} en attente`, en: `${money(s?.pending ?? 0, lang)} pending` })}
        />
        <Kpi
          icon={Activity}
          label={t({ fr: "En transit", en: "In transit" })}
          value={String(s?.inTransit ?? 0)}
          hint={t({ fr: `${s?.delivered ?? 0} livrés`, en: `${s?.delivered ?? 0} delivered` })}
        />
        <Kpi
          icon={Users}
          label={t({ fr: "Comptes", en: "Accounts" })}
          value={String(s?.users ?? 0)}
          hint={t({
            fr: `${s?.pendingUsers ?? 0} à vérifier · ${s?.leads ?? 0} leads chat`,
            en: `${s?.pendingUsers ?? 0} to review · ${s?.leads ?? 0} chat leads`,
          })}
        />
      </div>

      <Card hover={false}>
        <p className="font-semibold">{t({ fr: "Commandes des 14 derniers jours", en: "Orders over the last 14 days" })}</p>
        <div className="mt-5 flex h-40 items-end gap-1.5">
          {(s?.series ?? []).map((point) => (
            <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-primary/70"
                style={{ height: `${Math.max(4, (point.count / max) * 100)}%` }}
                title={`${point.date} — ${point.count}`}
              />
              <span className="text-[0.6rem] text-muted">{point.date.slice(8)}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card hover={false}>
          <p className="flex items-center gap-2 font-semibold">
            <FileText className="size-4 text-primary" />
            {t({ fr: "Leads du chat / WhatsApp", en: "Chat / WhatsApp leads" })}
          </p>
          <div className="mt-4 grid gap-2">
            {(leads.data ?? []).length === 0 ? (
              <p className="text-sm text-muted">{t({ fr: "Aucun lead.", en: "No leads." })}</p>
            ) : null}
            {(leads.data ?? []).map((lead) => (
              <div key={lead.id} className="rounded-xl border border-border bg-surface-2/50 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {lead.name ?? "—"} {lead.phone ? `· ${lead.phone}` : ""}
                  </p>
                  <button
                    type="button"
                    disabled={markHandled.isPending}
                    onClick={() => markHandled.mutate({ id: lead.id, handled: !lead.handled })}
                    className={
                      lead.handled
                        ? "inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success disabled:opacity-60"
                        : "inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-semibold disabled:opacity-60"
                    }
                  >
                    <Check className="size-3" />
                    {lead.handled ? t({ fr: "Traité", en: "Handled" }) : t({ fr: "Marquer traité", en: "Mark handled" })}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {lead.topic} · {lead.channel} · {dateTime(lead.createdAt, lang)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card hover={false}>
          <p className="flex items-center gap-2 font-semibold">
            <Activity className="size-4 text-primary" />
            {t({ fr: "Journal des actions", en: "Audit log" })}
          </p>
          <div className="mt-4 grid gap-1.5 text-xs">
            {(audit.data ?? []).slice(0, 40).map((entry) => (
              <p key={entry.id} className="flex flex-wrap gap-2 border-b border-border/50 pb-1.5 text-muted">
                <span className="font-semibold text-foreground">{entry.action}</span>
                <span>{entry.target ?? ""}</span>
                <span>{entry.userEmail}</span>
                <span className="ml-auto">{dateTime(entry.createdAt, lang)}</span>
              </p>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
