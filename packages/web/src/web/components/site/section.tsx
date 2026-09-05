import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-20 md:py-28", className)}>
      <div className="container-lbg">{children}</div>
    </section>
  );
}

interface SectionHeadProps {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHead({ eyebrow, title, lead, align = "left", className }: SectionHeadProps) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-bold leading-[1.1] md:text-[2.75rem]">{title}</h2>
      {lead ? <p className="mt-5 text-[1.0625rem] leading-relaxed text-muted">{lead}</p> : null}
    </Reveal>
  );
}

export function Card({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass rounded-card p-6",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_50px_-24px_rgba(57,213,255,0.5)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}
