/**
 * Redirection vers la page de paiement myPOS Checkout.
 * myPOS exige un POST de formulaire (pas une redirection GET) : on construit
 * le formulaire signé côté serveur, on l'injecte puis on le soumet.
 */
export function submitMyposForm(action: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.style.display = "none";
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

/** Clé de repli : les URLs de retour myPOS ne peuvent pas porter de paramètre. */
export const MYPOS_INVOICE_KEY = "lbg-mypos-invoice";

/** Mémorise la facture en cours avant de quitter le site vers myPOS. */
export function rememberMyposInvoice(number: string) {
  try {
    window.sessionStorage.setItem(MYPOS_INVOICE_KEY, number);
  } catch {
    // navigation privée : on perd juste le rappel de facture sur la page de retour
  }
}

/** Numéro de facture mémorisé avant le départ vers myPOS (chaîne vide si inconnu). */
export function rememberedMyposInvoice() {
  try {
    return window.sessionStorage.getItem(MYPOS_INVOICE_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Lance le paiement : formulaire signé si le Checkout est configuré, sinon lien myPOS générique. */
export function startMyposPayment(
  session: { mode: "form" | "link"; action: string; fields: Record<string, string> },
  invoiceNumber?: string,
) {
  if (invoiceNumber) rememberMyposInvoice(invoiceNumber);
  if (session.mode === "form" && session.action) {
    submitMyposForm(session.action, session.fields);
    return true;
  }
  const fallback = session.action || import.meta.env.VITE_MYPOS_PAYMENT_URL;
  if (!fallback) return false;
  window.open(fallback, "_blank", "noopener,noreferrer");
  return true;
}
