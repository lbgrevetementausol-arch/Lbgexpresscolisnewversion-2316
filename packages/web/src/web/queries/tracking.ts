import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Suivi public d'un colis (timeline + dernière position) */
export function useTracking(number: string, enabled = true) {
  return useQuery(
    orpc.tracking.get.queryOptions({
      input: { number },
      enabled: enabled && number.trim().length > 3,
      retry: false,
      refetchInterval: 60_000,
    }),
  );
}

export function useTrackingLocations(number: string, enabled = true) {
  return useQuery(
    orpc.tracking.locations.queryOptions({
      input: { trackingNumber: number },
      enabled: enabled && number.trim().length > 3,
    }),
  );
}

export function useAddTrackingEvent() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.tracking.addEvent.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.tracking.key() }),
    }),
  );
}

export function useCreateTracking() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.tracking.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.tracking.key() });
        queryClient.invalidateQueries({ queryKey: orpc.admin.key() });
      },
    }),
  );
}
