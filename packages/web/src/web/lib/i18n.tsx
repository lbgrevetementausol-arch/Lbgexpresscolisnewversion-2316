import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "fr" | "en";
/** Chaîne bilingue — le contenu vit à côté du composant qui l'affiche. */
export interface Bi {
  fr: string;
  en: string;
}

const STORAGE_KEY = "lbg-lang";

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** t({ fr: "Devis", en: "Quote" }) */
  t: (value: Bi) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function readInitial(): Lang {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "fr" || stored === "en") return stored;
  return window.navigator.language.toLowerCase().startsWith("en") ? "en" : "fr";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitial);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const t = useCallback((value: Bi) => value[lang], [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n doit être utilisé dans <I18nProvider>");
  return ctx;
}
