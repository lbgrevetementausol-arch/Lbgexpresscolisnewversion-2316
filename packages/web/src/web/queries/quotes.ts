import { useMutation, useQuery } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";

export type EstimateInput = Parameters<typeof client.quotes.estimate>[0];
export type QuoteCreateInput = Parameters<typeof client.quotes.create>[0];

/** Zones et services disponibles (formulaires + page tarifs) */
export function useQuoteOptions() {
  return useQuery(orpc.quotes.options.queryOptions({ staleTime: Infinity }));
}

/** Estimation instantanée — recalculée à chaque changement du formulaire */
export function useEstimate(input: NonNullable<EstimateInput>, enabled = true) {
  return useQuery(
    orpc.quotes.estimate.queryOptions({
      input,
      enabled,
      staleTime: 60_000,
      placeholderData: (prev) => prev,
    }),
  );
}

export function useCreateQuote() {
  return useMutation(orpc.quotes.create.mutationOptions());
}

/** Formulaires specialises (covoiturage / international / demenagement) */
export function useCreateStrategicQuote() {
  return useMutation(orpc.quotes.createStrategique.mutationOptions());
}

export function useQuote(ref: string) {
  return useQuery(
    orpc.quotes.get.queryOptions({ input: { ref }, enabled: ref.length > 3, retry: false }),
  );
}

export function usePayQuote() {
  return useMutation(orpc.quotes.pay.mutationOptions());
}
