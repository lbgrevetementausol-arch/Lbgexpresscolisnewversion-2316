import { Loader2, Mail, Truck } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { dateTime } from "../../lib/format";
import { Card } from "../site/section";
import { useAdminApplications, useAdminContacts } from "../../queries/admin";

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted whitespace-nowrap";
const td = "px-4 py-3 text-sm align-top";

/** Messages de contact + candidatures transporteurs — fusionné depuis l'ancien espace /pro. */
export function InboxPanel() {
  const { t } = useI18n();
  const contacts = useAdminContacts(true);
  const applications = useAdminApplications(true);

  return (
    <div className="grid gap-6">
      <Card hover={false} className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border p-5">
          <Mail className="size-4 text-primary" />
          <h3 className="font-display text-base font-bold">
            {t({ fr: "Messages reçus", en: "Messages received" })}
            <span className="ml-2 text-muted">({contacts.data?.length ?? 0})</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-surface-2/60">
              <tr>
                <th className={th}>{t({ fr: "Date", en: "Date" })}</th>
                <th className={th}>{t({ fr: "Expéditeur", en: "Sender" })}</th>
                <th className={th}>{t({ fr: "Sujet", en: "Subject" })}</th>
                <th className={th}>Message</th>
              </tr>
            </thead>
            <tbody>
              {(contacts.data ?? []).map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className={`${td} whitespace-nowrap text-muted`}>{dateTime(c.createdAt)}</td>
                  <td className={td}>
                    <p className="font-medium">{c.name}</p>
                    <a className="text-xs text-primary hover:underline" href={`mailto:${c.email}`}>
                      {c.email}
                    </a>
                    {c.phone ? <p className="text-xs text-muted">{c.phone}</p> : null}
                  </td>
                  <td className={td}>{c.subject}</td>
                  <td className={`${td} max-w-[28rem] text-muted`}>{c.message}</td>
                </tr>
              ))}
              {contacts.isLoading ? (
                <tr>
                  <td className={`${td} text-muted`} colSpan={4}>
                    <Loader2 className="mr-2 inline size-4 animate-spin" />
                    {t({ fr: "Chargement…", en: "Loading…" })}
                  </td>
                </tr>
              ) : null}
              {!contacts.isLoading && (contacts.data ?? []).length === 0 ? (
                <tr>
                  <td className={`${td} text-muted`} colSpan={4}>
                    {t({ fr: "Aucun message.", en: "No message." })}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Card hover={false} className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border p-5">
          <Truck className="size-4 text-primary" />
          <h3 className="font-display text-base font-bold">
            {t({ fr: "Candidatures transporteurs", en: "Carrier applications" })}
            <span className="ml-2 text-muted">({applications.data?.length ?? 0})</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="bg-surface-2/60">
              <tr>
                <th className={th}>{t({ fr: "Date", en: "Date" })}</th>
                <th className={th}>{t({ fr: "Transporteur", en: "Carrier" })}</th>
                <th className={th}>{t({ fr: "Ville", en: "City" })}</th>
                <th className={th}>{t({ fr: "Véhicule", en: "Vehicle" })}</th>
                <th className={th}>SIRET</th>
                <th className={th}>{t({ fr: "Statut", en: "Status" })}</th>
              </tr>
            </thead>
            <tbody>
              {(applications.data ?? []).map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className={`${td} whitespace-nowrap text-muted`}>{dateTime(a.createdAt)}</td>
                  <td className={td}>
                    <p className="font-medium">{a.name}</p>
                    <a className="text-xs text-primary hover:underline" href={`mailto:${a.email}`}>
                      {a.email}
                    </a>
                    <p className="text-xs text-muted">{a.phone}</p>
                  </td>
                  <td className={td}>{a.city}</td>
                  <td className={td}>
                    {a.vehicle}
                    {a.capacityM3 ? <span className="text-muted"> · {a.capacityM3} m³</span> : null}
                  </td>
                  <td className={`${td} font-mono text-xs text-muted`}>{a.siret ?? "—"}</td>
                  <td className={td}>{a.status}</td>
                </tr>
              ))}
              {applications.isLoading ? (
                <tr>
                  <td className={`${td} text-muted`} colSpan={6}>
                    <Loader2 className="mr-2 inline size-4 animate-spin" />
                    {t({ fr: "Chargement…", en: "Loading…" })}
                  </td>
                </tr>
              ) : null}
              {!applications.isLoading && (applications.data ?? []).length === 0 ? (
                <tr>
                  <td className={`${td} text-muted`} colSpan={6}>
                    {t({ fr: "Aucune candidature.", en: "No application." })}
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
