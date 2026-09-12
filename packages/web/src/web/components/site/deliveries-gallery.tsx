import { useCallback, useEffect, useState } from "react";
import { Camera, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, type Bi } from "../../lib/i18n";
import { Reveal } from "./reveal";
import { Section, SectionHead } from "./section";

interface Delivery {
  src: string;
  /** Nature de la mission — sur-titre du visuel. */
  tag: Bi;
  /** Mois de la course, tel qu'horodaté sur la photo d'origine. */
  when: Bi;
  /** Phrase de preuve : ce que la photo montre réellement. */
  caption: Bi;
  alt: Bi;
  /** Emprise dans la grille éditoriale de 6 colonnes (mobile → md → lg). */
  span: string;
  /** Hauteur de la tuile. */
  height: string;
  /** Point de cadrage si le sujet n'est pas au centre. */
  focus?: string;
}

/**
 * Photos prises par nos chauffeurs sur des courses réelles (août-septembre 2026).
 * Les légendes décrivent uniquement ce que l'image montre : aucun témoignage inventé,
 * aucune ville ni client ajoutés. Les avis clients restent ceux de Trustpilot.
 */
const DELIVERIES: Delivery[] = [
  {
    src: "/images/livraisons/palette-mobilier.jpg",
    span: "col-span-6 md:col-span-3 lg:col-span-4",
    height: "h-80 md:h-[26rem]",
    tag: { fr: "Mobilier sur mesure", en: "Custom furniture" },
    when: { fr: "Août 2026", en: "August 2026" },
    caption: {
      fr: "Sortie d'atelier filmée, angles protégés, cerclage FRAGILE sur deux hauteurs et la consigne « ne pas basculer » écrite sur le colis. Elle a été respectée jusqu'à la dépose.",
      en: "Wrapped straight out of the workshop: corners protected, FRAGILE banding at two heights and a “do not tilt” instruction written on the crate. It was respected all the way to the drop-off.",
    },
    alt: {
      fr: "Meuble d'atelier emballé sous film sur un transpalette, cerclé de ruban FRAGILE",
      en: "Workshop furniture film-wrapped on a pallet truck, banded with FRAGILE tape",
    },
  },
  {
    src: "/images/livraisons/frigo-sangle.jpg",
    span: "col-span-6 md:col-span-3 lg:col-span-2",
    height: "h-80 md:h-[26rem]",
    tag: { fr: "Électroménager", en: "Home appliance" },
    when: { fr: "Septembre 2026", en: "September 2026" },
    caption: {
      fr: "Réfrigérateur sanglé debout contre la paroi du camion, posé sur couverture de déménagement. Aucun jeu, aucune rayure sur la carrosserie blanche.",
      en: "Fridge strapped upright against the van wall, resting on a moving blanket. No play, not a scratch on the white body.",
    },
    alt: {
      fr: "Réfrigérateur blanc sanglé dans un camion de livraison",
      en: "White fridge strapped inside a delivery van",
    },
  },
  {
    src: "/images/livraisons/frigo-charge.jpg",
    span: "col-span-6 md:col-span-2",
    height: "h-80 md:h-[22rem]",
    tag: { fr: "Contrôle au chargement", en: "Loading check" },
    when: { fr: "Septembre 2026", en: "September 2026" },
    caption: {
      fr: "Contrôle porte ouverte avant de partir : clayettes en verre bloquées, balconnets en place, joint intact. On note l'état de départ, pas seulement l'état d'arrivée.",
      en: "Door-open check before departure: glass shelves secured, door bins in place, seal intact. We record the condition at pickup, not just on arrival.",
    },
    alt: {
      fr: "Intérieur d'un réfrigérateur inspecté avant transport",
      en: "Inside of a fridge inspected before transport",
    },
  },
  {
    src: "/images/livraisons/frigo-installe.jpg",
    span: "col-span-6 md:col-span-2",
    height: "h-80 md:h-[22rem]",
    tag: { fr: "Livré à l'intérieur", en: "Delivered indoors" },
    when: { fr: "Septembre 2026", en: "September 2026" },
    caption: {
      fr: "Posé à sa place définitive dans la cuisine du client. Pas devant la porte, pas sur le palier : là où l'appareil doit servir.",
      en: "Set down in its final spot in the customer's kitchen. Not at the door, not on the landing: where the appliance is actually going to be used.",
    },
    alt: {
      fr: "Réfrigérateur livré et installé dans une cuisine",
      en: "Fridge delivered and installed in a kitchen",
    },
  },
  {
    src: "/images/livraisons/chargement-camion.jpg",
    span: "col-span-6 md:col-span-2",
    height: "h-80 md:h-[22rem]",
    tag: { fr: "Déménagement", en: "Moving job" },
    when: { fr: "Septembre 2026", en: "September 2026" },
    caption: {
      fr: "Table, matelas et pièces de bois chargés ensemble : sangles croisées, diable à bord, chaque élément bloqué par le suivant. Un chargement plein tient mieux qu'un chargement à moitié vide.",
      en: "Table, mattress and timber loaded together: crossed straps, hand truck on board, each item blocked by the next. A full load travels better than a half-empty one.",
    },
    alt: {
      fr: "Chargement d'un utilitaire : table, matelas et pièces de bois sanglés",
      en: "Van load: table, mattress and timber pieces strapped down",
    },
  },
  {
    src: "/images/livraisons/velo-emballe.jpg",
    span: "col-span-6",
    height: "h-80 md:h-[28rem]",
    focus: "object-[50%_62%]",
    tag: { fr: "Vélo neuf", en: "New bicycle" },
    when: { fr: "Septembre 2026", en: "September 2026" },
    caption: {
      fr: "Vélo pliant contrôlé dans son carton d'origine, guidon et fourche gainés, cadre sanglé au plancher. Les étiquettes constructeur sont restées intactes.",
      en: "Folding bike checked in its original box, handlebar and fork sleeved, frame strapped to the floor. Manufacturer labels left untouched.",
    },
    alt: {
      fr: "Vélo neuf emballé et sanglé dans un utilitaire",
      en: "New bicycle packed and strapped inside a van",
    },
  },
];

function Lightbox({ item, onClose }: { item: Delivery; onClose: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <dialog
      open
      aria-label={t(item.tag)}
      className="fixed inset-0 z-[120] m-0 flex size-full max-h-none max-w-none items-center justify-center bg-background/92 p-4 backdrop-blur-md md:p-10"
    >
      {/* fond cliquable : un bouton plein écran, focusable au clavier */}
      <button
        type="button"
        onClick={onClose}
        aria-label={t({ fr: "Fermer l'aperçu", en: "Close preview" })}
        className="absolute inset-0 cursor-zoom-out"
      />

      <span
        aria-hidden
        className="glass pointer-events-none absolute right-4 top-4 grid size-11 place-items-center rounded-full text-foreground md:right-8 md:top-8"
      >
        <X className="size-5" />
      </span>

      <figure className="pointer-events-none relative flex max-h-full w-full max-w-4xl flex-col gap-5 overflow-y-auto">
        <img
          src={item.src}
          alt={t(item.alt)}
          className="mx-auto max-h-[62vh] w-auto rounded-card object-contain shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
        />
        <figcaption className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t(item.tag)} · {t(item.when)}
          </p>
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-foreground/90">{t(item.caption)}</p>
        </figcaption>
      </figure>
    </dialog>
  );
}

/** Galerie de courses réelles : photo + phrase de preuve en surimpression. */
export function DeliveriesGallery() {
  const { t } = useI18n();
  const [open, setOpen] = useState<Delivery | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <Section id="livraisons" className="relative overflow-hidden border-t border-border">
      {/* halo cyan derrière la grille de photos, pour détacher la section du bloc précédent */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 size-[44rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/10 blur-[120px]"
      />
      <SectionHead
        align="center"
        eyebrow={t({ fr: "Nos livraisons", en: "Our deliveries" })}
        title={t({
          fr: "Ça arrive comme c'est parti",
          en: "It arrives the way it left",
        })}
        lead={t({
          fr: "Photos prises par nos chauffeurs sur des courses réelles, à l'enlèvement comme à la dépose. Pas de banque d'images : le colis que vous voyez a vraiment voyagé avec nous.",
          en: "Photos taken by our own drivers on real jobs, at pickup and at drop-off. No stock imagery: every parcel you see actually travelled with us.",
        })}
      />

      <div className="mt-12 grid grid-cols-6 gap-4 md:gap-5">
        {DELIVERIES.map((item, i) => (
          <Reveal
            key={item.src}
            delay={i * 80}
            className={item.span}
          >
            <button
              type="button"
              onClick={() => setOpen(item)}
              className="group relative block size-full overflow-hidden rounded-card border border-border text-left transition duration-500 hover:border-primary/50 hover:shadow-[0_24px_70px_-30px_rgba(57,213,255,0.55)]"
            >
              <img
                src={item.src}
                alt={t(item.alt)}
                loading="lazy"
                decoding="async"
                className={cn(
                  "w-full object-cover brightness-[1.08] contrast-[1.04] transition duration-700 group-hover:scale-[1.05] group-hover:brightness-[1.14]",
                  item.height,
                  item.focus ?? "object-center",
                )}
              />

              {/* voile de lecture : léger en haut, dense sous la légende */}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050A14] from-[8%] via-[#050A14]/60 via-[38%] to-transparent to-[72%]" />

              <span className="pointer-events-none absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-[#050A14]/70 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary backdrop-blur-sm">
                <Camera className="size-3" />
                {t(item.when)}
              </span>

              <span className="pointer-events-none absolute inset-x-0 bottom-0 block p-5 md:p-6">
                <span className="block font-display text-base font-bold text-white md:text-lg">
                  {t(item.tag)}
                </span>
                <span className="mt-2 line-clamp-3 block max-w-xl text-[0.8125rem] leading-relaxed text-white/75 md:line-clamp-none">
                  {t(item.caption)}
                </span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      <Reveal delay={160} className="mt-10">
        <p className="mx-auto flex max-w-2xl items-center justify-center gap-2.5 text-center text-sm text-muted">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          {t({
            fr: "Sur demande, nous vous envoyons la photo de votre colis à l'enlèvement et à la livraison.",
            en: "On request, we send you a photo of your parcel at pickup and at delivery.",
          })}
        </p>
      </Reveal>

      {open ? <Lightbox item={open} onClose={close} /> : null}
    </Section>
  );
}
