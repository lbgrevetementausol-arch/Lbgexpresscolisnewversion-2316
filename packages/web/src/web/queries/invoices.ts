import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useInvoice(number: string | null) {
  return useQuery(
    orpc.invoices.get.queryOptions({
      input: { number: number ?? "" },
      enabled: Boolean(number),
      retry: false,
    }),
  );
}

export function useCheckout() {
  return useMutation(orpc.invoices.checkout.mutationOptions());
}

/** Session myPOS Checkout : champs signés à auto-soumettre en POST. */
export function useMyposSession() {
  return useMutation(orpc.invoices.myposSession.mutationOptions());
}

export function useMyInvoices(enabled: boolean) {
  return useQuery(orpc.invoices.mine.queryOptions({ enabled, refetchInterval: 30_000 }));
}

export function useInvoiceList(
  status: "tous" | "en_attente_paiement" | "payee" | "annulee" | "remboursee",
  enabled: boolean,
) {
  return useQuery(
    orpc.invoices.list.queryOptions({ input: { status }, enabled, refetchInterval: 15_000 }),
  );
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.invoices.create.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.invoices.key() }),
    }),
  );
}

export function useSetInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.invoices.setStatus.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.invoices.key() }),
    }),
  );
}
