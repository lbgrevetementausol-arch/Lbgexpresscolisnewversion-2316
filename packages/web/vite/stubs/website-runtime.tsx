/**
 * Remplaçant vide de @runablehq/website-runtime pour les builds de production.
 *
 * L'atelier Runable a besoin de ce paquet en développement (widget d'annotation
 * visuelle activé depuis l'aperçu). Il n'a aucune utilité pour les visiteurs du
 * site : vite.config.ts redirige l'import vers ce fichier en production, ce qui
 * garantit qu'aucune ligne de code de la plateforme ne part chez le visiteur.
 */
export function AgentFeedback() {
  return null;
}
