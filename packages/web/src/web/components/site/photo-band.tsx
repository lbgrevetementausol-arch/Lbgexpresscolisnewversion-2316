import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

/**
 * Grande photo terrain (camions et équipes LBG Express Colis) avec légende courte
 * posée sur un dégradé. Les puces remplacent un paragraphe : 2 à 4 mots chacune.
 */
export function PhotoBand({
  src,
  alt,
  title,
  chips,
  position = "center",
  className,
}: {
  src: string;
  alt: string;
  title: string;
  chips: { icon: LucideIcon; label: string }[];
  /** object-position CSS, pour garder le camion dans le cadre */
  position?: string;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <figure className="relative overflow-hidden rounded-card border border-border">
        <img
          src={src}
          alt={alt}
          width={1373}
          height={784}
          loading="lazy"
          className="h-[260px] w-full object-cover sm:h-[360px] lg:h-[440px]"
          style={{ objectPosition: position }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
        <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <p className="max-w-xl font-display text-xl font-extrabold leading-tight sm:text-3xl">{title}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <li
                key={c.label}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5",
                  "text-xs font-semibold backdrop-blur",
                )}
              >
                <c.icon className="size-3.5 text-primary" aria-hidden />
                {c.label}
              </li>
            ))}
          </ul>
        </figcaption>
      </figure>
    </Reveal>
  );
}
