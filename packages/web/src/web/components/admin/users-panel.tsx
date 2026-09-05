import { Loader2, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { dateTime } from "../../lib/format";
import { Card } from "../site/section";
import { useAdminUsers, useSetUserRole, useSetUserStatus } from "../../queries/admin";

const STATUSES = ["en_attente", "actif", "bloque"] as const;

/** Vérification des inscriptions, blocage, attribution des rôles. */
export function UsersPanel() {
  const { t, lang } = useI18n();
  const users = useAdminUsers(true);
  const setStatus = useSetUserStatus();
  const setRole = useSetUserRole();

  return (
    <Card hover={false}>
      <p className="font-semibold">
        {t({ fr: "Comptes", en: "Accounts" })} · {(users.data ?? []).length}
      </p>
      <p className="mt-1 text-xs text-muted">
        {t({
          fr: "Les nouveaux comptes sont actifs par défaut ; passez-les en « en_attente » ou « bloque » pour couper l'accès.",
          en: "New accounts are active by default; switch them to “en_attente” or “bloque” to cut access.",
        })}
      </p>

      <div className="mt-4 grid gap-2">
        {(users.data ?? []).map((account) => (
          <div key={account.id} className="rounded-card border border-border bg-surface-2/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold">
                  {account.role === "admin" ? <ShieldCheck className="size-4 text-primary" /> : null}
                  {account.name}
                </p>
                <p className="text-sm text-muted">{account.email}</p>
                <p className="text-xs text-muted">
                  {account.company ?? "—"} · {account.phone ?? "—"} · {dateTime(account.createdAt, lang)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label={t({ fr: "Statut du compte", en: "Account status" })}
                  value={account.accountStatus}
                  onChange={(e) =>
                    setStatus.mutate({
                      userId: account.id,
                      accountStatus: e.target.value as (typeof STATUSES)[number],
                    })
                  }
                  className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs outline-none"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={t({ fr: "Rôle", en: "Role" })}
                  value={account.role}
                  onChange={(e) => setRole.mutate({ userId: account.id, role: e.target.value as "admin" | "client" })}
                  className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs outline-none"
                >
                  <option value="client">client</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  type="button"
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ userId: account.id, accountStatus: "actif" })}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-success/15 px-3 py-2 text-xs font-semibold text-success disabled:opacity-60"
                >
                  {setStatus.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <UserCheck className="size-3.5" />}
                  {t({ fr: "Valider", en: "Approve" })}
                </button>
                <button
                  type="button"
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ userId: account.id, accountStatus: "bloque" })}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-danger/15 px-3 py-2 text-xs font-semibold text-danger disabled:opacity-60"
                >
                  <UserX className="size-3.5" />
                  {t({ fr: "Bloquer", en: "Block" })}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
