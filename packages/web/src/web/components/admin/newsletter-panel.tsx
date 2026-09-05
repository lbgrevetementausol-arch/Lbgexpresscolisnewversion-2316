import { useMemo, useState } from "react";
import { Download, Loader2, Mail, MailX, Search } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { dateTime, downloadCsv } from "../../lib/format";
import { Card } from "../site/section";
import { useNewsletterList, useNewsletterUnsubscribe } from "../../queries/newsletter";

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted whitespace-nowrap";
const td = "px-4 py-3 text-sm align-top";

/** Inscrits à la newsletter collectés par le popup du site : lecture, recherche, export CSV, désinscription. */
export function NewsletterPanel() {
  const { t } = useI18n();
  const list = useNewsletterList(true);
  const unsubscribe = useNewsletterUnsubscribe();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => list.data ?? [], [list.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) => row.email.toLowerCase().includes(q) || (row.name ?? "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  const active = rows.filter((row) => row.active).length;
  const last30 = rows.filter(
    (row) => new Date(row.createdAt).getTime() > Date.now() - 30 * 24 * 3600 * 1000,
  ).length;

  const exportCsv = () => {
    downloadCsv(
      `newsletter-lbg-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((row) => ({
        email: row.email,
        nom: row.name ?? "",
        source: row.source,
        langue: row.locale,
        actif: row.active ? "oui" : "non",
        inscrit_le: dateTime(row.createdAt),
      })),
    );
  };

  const stats: { label: string; value: number }[] = [
    { label: t({ fr: "Inscrits actifs", en: "Active subscribers" }), value: active },
    { label: t({ fr: "Désinscrits", en: "Unsubscribed" }), value: rows.length - active },
    { label: t({ fr: "30 derniers jours", en: "Last 30 days" }), value: last30 },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} hover={false} className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted">{stat.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card hover={false} className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-5">
          <Mail className="size-4 text-primary" />
          <h3 className="font-display text-base font-bold">
            {t({ fr: "Newsletter", en: "Newsletter" })}
            <span className="ml-2 text-muted">({filtered.length})</span>
          </h3>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
              <input
                aria-label={t({ fr: "Rechercher un inscrit", en: "Search a subscriber" })}
                placeholder={t({ fr: "E-mail ou nom…", en: "Email or name…" })}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-52 rounded-xl border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/60"
              />
            </div>
            <button
              type="button"
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold transition hover:border-primary/50 disabled:opacity-50"
            >
              <Download className="size-4 text-primary" />
              {t({ fr: "Export CSV", en: "Export CSV" })}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-surface-2/60">
              <tr>
                <th className={th}>{t({ fr: "Date", en: "Date" })}</th>
                <th className={th}>{t({ fr: "E-mail", en: "Email" })}</th>
                <th className={th}>{t({ fr: "Nom", en: "Name" })}</th>
                <th className={th}>Source</th>
                <th className={th}>{t({ fr: "Langue", en: "Language" })}</th>
                <th className={th}>{t({ fr: "Statut", en: "Status" })}</th>
                <th className={th}>
                  <span className="sr-only">{t({ fr: "Actions", en: "Actions" })}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className={`${td} whitespace-nowrap text-muted`}>{dateTime(row.createdAt)}</td>
                  <td className={td}>
                    <a className="font-medium text-primary hover:underline" href={`mailto:${row.email}`}>
                      {row.email}
                    </a>
                  </td>
                  <td className={td}>{row.name ?? "—"}</td>
                  <td className={`${td} text-muted`}>{row.source}</td>
                  <td className={`${td} uppercase text-muted`}>{row.locale}</td>
                  <td className={td}>
                    <span
                      className={
                        row.active
                          ? "rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success"
                          : "rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted"
                      }
                    >
                      {row.active
                        ? t({ fr: "Actif", en: "Active" })
                        : t({ fr: "Désinscrit", en: "Unsubscribed" })}
                    </span>
                  </td>
                  <td className={`${td} text-right`}>
                    {row.active ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await unsubscribe.mutateAsync({ email: row.email });
                          await list.refetch();
                        }}
                        disabled={unsubscribe.isPending}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-xs font-semibold transition hover:border-danger/60 hover:text-danger disabled:opacity-50"
                      >
                        <MailX className="size-3.5" />
                        {t({ fr: "Désinscrire", en: "Unsubscribe" })}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {list.isLoading ? (
                <tr>
                  <td className={`${td} text-muted`} colSpan={7}>
                    <Loader2 className="mr-2 inline size-4 animate-spin" />
                    {t({ fr: "Chargement…", en: "Loading…" })}
                  </td>
                </tr>
              ) : null}
              {!list.isLoading && filtered.length === 0 ? (
                <tr>
                  <td className={`${td} text-muted`} colSpan={7}>
                    {t({
                      fr: "Aucun inscrit pour le moment. Le popup du site s'ouvre 10 secondes après l'arrivée d'un visiteur.",
                      en: "No subscriber yet. The site popup opens 10 seconds after a visitor arrives.",
                    })}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
