import { cn } from "@/lib/utils";

/** Logo officiel LBG Express Colis : texte blanc en thème sombre, texte foncé en thème clair. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex", className)}>
      <img
        src="/images/logo-lbg-express.png"
        alt="LBG Express Colis"
        width={737}
        height={160}
        className="h-full w-auto light:hidden"
      />
      <img
        src="/images/logo-lbg-express-clair.png"
        alt="LBG Express Colis"
        width={737}
        height={160}
        className="hidden h-full w-auto light:block"
      />
    </span>
  );
}
