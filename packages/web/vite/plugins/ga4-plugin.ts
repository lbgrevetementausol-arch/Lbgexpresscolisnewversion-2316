import type { Plugin } from "vite";

/**
 * Injecte Google Analytics 4 dans index.html au moment du build.
 *
 * Remplace l'analytics managé de Runable (qui envoyait les visites à un
 * domaine tiers) : les statistiques du site appartiennent désormais à
 * l'entreprise. L'identifiant vient de VITE_GA4_MEASUREMENT_ID ; sans lui,
 * aucun script n'est injecté (utile en développement).
 *
 * RGPD : le consentement est demandé par le bandeau du site
 * (src/web/lib/consent.ts). Tant que le visiteur n'a pas accepté, GA4 reste
 * en "denied" via le Consent Mode v2 et ne dépose aucun cookie de mesure.
 */
export default function ga4Plugin(): Plugin {
  return {
    name: "lbg-ga4",
    enforce: "post",
    transformIndexHtml(html) {
      const id = process.env.VITE_GA4_MEASUREMENT_ID?.trim();
      if (!id) return html;

      const snippet = `
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());
			// Consent Mode v2 : refusé par défaut, le bandeau de cookies met à jour.
			gtag('consent', 'default', {
				ad_storage: 'denied',
				ad_user_data: 'denied',
				ad_personalization: 'denied',
				analytics_storage: 'denied',
				wait_for_update: 500
			});
			try {
				var c = JSON.parse(localStorage.getItem('lbg-cookie-consent') || 'null');
				if (c && c.value === 'accepted') {
					gtag('consent', 'update', { analytics_storage: 'granted' });
				}
			} catch (e) {}
			gtag('config', ${JSON.stringify(id)}, { anonymize_ip: true });
		</script>
		<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}"></script>
	`;

      return html.replace("</head>", `${snippet}</head>`);
    },
  };
}
