import { useEffect, useRef } from "react";

/**
 * Vidéo de fond du hero d'accueil (utilitaire LBG Express Colis sur l'autoroute).
 * Muette, en boucle, sans contrôle : c'est un décor, le texte reste au premier plan.
 * - 480p sur mobile, 720p au-delà (balises <source media>) ;
 * - image fixe si l'utilisateur a demandé à réduire les animations.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true; // requis par iOS pour la lecture automatique
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (reduce.matches) video.pause();
      else video.play().catch(() => {});
    };
    sync();
    reduce.addEventListener("change", sync);
    return () => reduce.removeEventListener("change", sync);
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 size-full object-cover object-[60%_center]"
      poster="/images/camion-autoroute-poster.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden
      tabIndex={-1}
    >
      <source src="/videos/camion-autoroute-480.mp4" type="video/mp4" media="(max-width: 767px)" />
      <source src="/videos/camion-autoroute-720.mp4" type="video/mp4" />
    </video>
  );
}
