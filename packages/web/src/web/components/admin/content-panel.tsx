import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { dateTime } from "../../lib/format";
import { Card } from "../site/section";
import { useAdminSettings, useSaveSettings } from "../../queries/admin";

/** Contenus, tarifs et coordonnées éditables sans toucher au code. */
export function ContentPanel() {
  const { t, lang } = useI18n();
  const settings = useAdminSettings(true);
  const save = useSaveSettings();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setDraft(Object.fromEntries(settings.data.map((row) => [row.key, row.value])));
    }
  }, [settings.data]);

  const rows = settings.data ?? [];
  const groups = [...new Set(rows.map((row) => row.group ?? "general"))];

  const submit = async () => {
    setSaved(false);
    const entries = rows
      .filter((row) => draft[row.key] !== undefined && draft[row.key] !== row.value)
      .map((row) => ({
        key: row.key,
        value: draft[row.key] ?? row.value,
        group: row.group ?? "general",
        label: row.label ?? undefined,
      }));
    if (entries.length === 0) return;
    await save.mutateAsync({ entries });
    setSaved(true);
  };

  return (
    <Card hover={false}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{t({ fr: "Contenus, tarifs & coordonnées", en: "Content, pricing & contact" })}</p>
          <p className="mt-1 text-xs text-muted">
            {t({
              fr: "Ces valeurs alimentent le site (bandeau, hero, contact, multiplicateur tarifaire, TVA, lien MyPOS).",
              en: "These values feed the site (banner, hero, contact, pricing multiplier, VAT, MyPOS link).",
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={save.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {t({ fr: "Enregistrer", en: "Save" })}
        </button>
      </div>
      {saved ? <p className="mt-3 text-sm text-success">{t({ fr: "Réglages enregistrés.", en: "Settings saved." })}</p> : null}

      <div className="mt-5 grid gap-6">
        {groups.map((group) => (
          <div key={group}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{group}</p>
            <div className="mt-3 grid gap-3">
              {rows
                .filter((row) => (row.group ?? "general") === group)
                .map((row) => (
                  <label key={row.key} className="block">
                    <span className="mb-1.5 block text-sm font-medium">{row.label ?? row.key}</span>
                    <span className="mb-1.5 block text-[0.7rem] text-muted">
                      {row.key} · {dateTime(row.updatedAt, lang)}
                    </span>
                    {(draft[row.key] ?? "").length > 90 ? (
                      <textarea
                        aria-label={row.key}
                        value={draft[row.key] ?? ""}
                        onChange={(e) => setDraft((prev) => ({ ...prev, [row.key]: e.target.value }))}
                        className="min-h-24 w-full resize-y rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary/60"
                      />
                    ) : (
                      <input
                        aria-label={row.key}
                        value={draft[row.key] ?? ""}
                        onChange={(e) => setDraft((prev) => ({ ...prev, [row.key]: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary/60"
                      />
                    )}
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
