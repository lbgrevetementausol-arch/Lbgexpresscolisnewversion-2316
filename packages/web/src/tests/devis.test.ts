/**
 * Tests du tunnel devis déménagement : grille, saisons, étages, garde-fous et
 * cohérence devis TTC → HT en base → mail → facture.  Lancer : bun run test:devis
 */
import { describe, expect, test } from "bun:test";
import { devisDetaille, needsReview, saisonDe, type DevisOptions } from "../web/lib/pricing-strategique";
import { totalsFor } from "../api/lib/invoicing";

const dem = (o: DevisOptions) => devisDetaille("demenagement", o);
const ligne = (o: DevisOptions, key: string) => dem(o).lines.find((l) => l.key === key)?.amount ?? 0;
const LUNDI_AVRIL = "2026-04-13"; // saison normale

describe("grille €/m³ selon la distance", () => {
  const cases: [number, number][] = [[20, 34], [30, 34], [31, 38], [100, 38], [101, 48], [300, 48], [301, 58], [600, 58], [601, 66], [1200, 66]];
  test.each(cases)("%p km → %p €/m³", (km, prix) => {
    expect(ligne({ distance: km, volumeM3: 20, date: LUNDI_AVRIL }, "base")).toBe(20 * prix);
  });
});

describe("suppléments", () => {
  const b = { distance: 50, volumeM3: 20, date: LUNDI_AVRIL } as const; // base 760 €
  test("3ᵉ étage sans ascenseur au départ : +15 %", () => {
    expect(ligne({ ...b, etageDepart: 3, etageArrivee: 0 }, "etages")).toBe(114);
  });
  test("étages plafonnés à +25 %", () => {
    expect(ligne({ ...b, etageDepart: 4, etageArrivee: 4 }, "etages")).toBe(190);
  });
  test("ascenseur au 5ᵉ : +2 %, pas de supplément étage ; rez-de-chaussée : rien", () => {
    expect(ligne({ ...b, etageDepart: 5, ascenseurDepart: true, etageArrivee: 0 }, "ascenseur")).toBe(15.2);
    expect(ligne({ ...b, etageDepart: 5, ascenseurDepart: true, etageArrivee: 0 }, "etages")).toBe(0);
    expect(ligne({ ...b, etageDepart: 0, ascenseurDepart: true, etageArrivee: 0 }, "ascenseur")).toBe(0);
  });
  test("accès difficile +10 %, emballage 12 €/m³, objet lourd forfaitaire", () => {
    expect(ligne({ ...b, accesDifficile: true }, "acces")).toBe(76);
    expect(ligne({ ...b, emballage: true }, "emballage")).toBe(240);
    expect(ligne({ ...b, objetsLourds: ["piano-droit"] }, "objet-piano-droit")).toBe(150);
    expect(ligne({ ...b, objetsLourds: ["inconnu"] }, "objet-inconnu")).toBe(0);
  });
  test("poids estimé 200 kg/m³ : n'influe que sur le véhicule, pas sur le prix", () => {
    const p = dem(b);
    expect(p.poidsEstimeKg).toBe(4000);
    expect(p.vehicule).toBeTruthy();
    expect(p.lines.some((l) => /poids|kg/i.test(l.label.fr))).toBe(false);
  });
});

describe("saisons", () => {
  test("haute : juillet, vendredi, samedi, fin de mois", () => {
    for (const d of ["2026-07-07", "2026-04-17", "2026-04-18", "2026-04-27"]) expect(saisonDe(d)).toBe("haute");
  });
  test("basse : mardi–jeudi d'oct. à mars hors fin de mois", () => {
    for (const d of ["2026-11-04", "2027-01-12", "2026-03-05"]) expect(saisonDe(d)).toBe("basse");
  });
  test("normale : lundi d'avril, date vide ou invalide", () => {
    for (const d of [LUNDI_AVRIL, "", undefined, "31/12/2026", "2026-13-45"]) expect(saisonDe(d)).toBe("normale");
  });
  test("haute +12 % et basse −5 % appliqués sur le sous-total", () => {
    const o = { distance: 50, volumeM3: 20 };
    expect(ligne({ ...o, date: "2026-07-07" }, "saison")).toBeCloseTo(91.2, 2);
    expect(ligne({ ...o, date: "2026-11-04" }, "saison")).toBeCloseTo(-38, 2);
  });
});

describe("minimum et total", () => {
  test("minimum de facturation 390 € TTC", () => {
    const p = dem({ distance: 10, volumeM3: 5, date: LUNDI_AVRIL });
    expect(p.total).toBe(390);
    expect(p.plancher).toBe(true);
  });
  test("le total affiché égale la somme des lignes", () => {
    const p = dem({ distance: 420, volumeM3: 33, etageDepart: 2, etageArrivee: 6, ascenseurArrivee: true, accesDifficile: true, emballage: true, objetsLourds: ["coffre-fort"], date: "2026-08-14" });
    const somme = p.lines.reduce((s, l) => s + l.amount, 0);
    expect(Math.round(somme * 100)).toBe(Math.round(p.total * 100));
  });
});

describe("garde-fous « À valider »", () => {
  test("> 2 500 € TTC", () => expect(needsReview({ totalTtc: 2600, volumeM3: 40, demenagement: true })).toBe(true));
  test("€/m³ hors 25–100", () => {
    expect(needsReview({ totalTtc: 390, volumeM3: 2, demenagement: true })).toBe(true);
    expect(needsReview({ totalTtc: 900, volumeM3: 40, demenagement: true })).toBe(true);
    expect(needsReview({ totalTtc: 900, volumeM3: 20, demenagement: true })).toBe(false);
  });
  test("écart > 15 % entre navigateur et serveur", () => {
    expect(needsReview({ totalTtc: 1000, volumeM3: 20, clientTotal: 800, demenagement: true })).toBe(true);
    expect(needsReview({ totalTtc: 1000, volumeM3: 20, clientTotal: 900, demenagement: true })).toBe(false);
  });
});

describe("cohérence devis → base HT → mail TTC → facture", () => {
  const scenarios: DevisOptions[] = [];
  for (const km of [11, 45, 180, 450, 900]) for (const vol of [8, 22, 35, 60]) scenarios.push({ distance: km, volumeM3: vol, etageDepart: vol % 5, etageArrivee: 1, ascenseurArrivee: km > 100, date: LUNDI_AVRIL });
  test.each(scenarios.map((s, i) => [i + 1, s] as const))("scénario %p : facture = devis au centime", (_i, o) => {
    const ttc = Math.round(dem(o).total * 100); // affiché au client
    const ht = Math.round(ttc / 1.2); // enregistré en base (priceCents)
    const facture = totalsFor([{ label: "Déménagement", unitPriceCents: ht }]);
    expect(facture.subtotalCents).toBe(ht);
    expect(Math.abs(facture.totalCents - ttc)).toBeLessThanOrEqual(1);
  });
});
