import { Link } from "wouter";
import { BellRing, Check, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { dateTime, moneyCents } from "../../lib/format";
import { Card } from "../site/section";
import {
  useAdminNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "../../queries/admin";

/** Notifications back-office : chaque commande reçue sur le site apparaît ici. */
export function NotificationsPanel() {
  const { t, lang } = useI18n();
  const notifications = useAdminNotifications(true);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const rows = notifications.data ?? [];
  const unread = rows.filter((row) => !row.readAt).length;

  return (
    <Card hover={false}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">
          {t({ fr: "Notifications", en: "Notifications" })} · {rows.length}
          {unread > 0 ? (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
              {unread} {t({ fr: "non lue(s)", en: "unread" })}
            </span>
          ) : null}
        </p>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-xs text-muted">
            <RefreshCw className={notifications.isFetching ? "size-3.5 animate-spin" : "size-3.5"} />
            {t({ fr: "Temps réel (10 s)", en: "Live (10s)" })}
          </span>
          {unread > 0 ? (
            <button
              type="button"
              onClick={() => markAll.mutate({})}
              disabled={markAll.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-surface-2 disabled:opacity-60"
            >
              {markAll.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCheck className="size-3.5" />
              )}
              {t({ fr: "Tout marquer comme lu", en: "Mark all as read" })}
            </button>
          ) : null}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          {t({
            fr: "Aucune notification pour le moment. Chaque nouvelle commande passée sur le site s'affichera ici.",
            en: "No notifications yet. Every new order placed on the site will show up here.",
          })}
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className={
                row.readAt
                  ? "rounded-xl border border-border bg-surface-2/40 p-4"
                  : "rounded-xl border border-primary/40 bg-primary/5 p-4"
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    <BellRing className={row.readAt ? "size-4 text-muted" : "size-4 text-primary"} />
                    {row.title}
                  </p>
                  {row.body ? <p className="mt-1 text-sm text-muted">{row.body}</p> : null}
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span>{dateTime(row.createdAt, lang)}</span>
                    {row.orderNumber ? (
                      <span className="font-semibold text-foreground">
                        {t({ fr: "Commande n°", en: "Order no." })} {row.orderNumber}
                      </span>
                    ) : null}
                    {row.amountCents ? <span>{moneyCents(row.amountCents, lang)}</span> : null}
                    {row.customerEmail ? <span>{row.customerEmail}</span> : null}
                    {row.customerPhone ? <span>{row.customerPhone}</span> : null}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {row.quoteRef ? (
                    <Link
                      href={`/paiement/${row.quoteRef}`}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-surface-2"
                    >
                      {row.quoteRef}
                    </Link>
                  ) : null}
                  {row.readAt ? null : (
                    <button
                      type="button"
                      onClick={() => markRead.mutate({ id: row.id, read: true })}
                      disabled={markRead.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
                    >
                      <Check className="size-3.5" />
                      {t({ fr: "Marquer lu", en: "Mark read" })}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
