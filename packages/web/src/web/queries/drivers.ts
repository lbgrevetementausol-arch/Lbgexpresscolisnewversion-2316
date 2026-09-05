import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useDriverLogin() {
  return useMutation(orpc.drivers.login.mutationOptions());
}

export function useDriverJobs(token: string | null, includeDone = false) {
  return useQuery(
    orpc.drivers.jobs.queryOptions({
      input: { token: token ?? "", includeDone },
      enabled: Boolean(token),
      refetchInterval: 60_000,
    }),
  );
}

export function useDriverHistory(token: string | null) {
  return useQuery(
    orpc.drivers.history.queryOptions({
      input: { token: token ?? "" },
      enabled: Boolean(token),
    }),
  );
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.drivers.updateJob.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.drivers.key() }),
    }),
  );
}

export function usePushDriverLocation() {
  return useMutation(orpc.drivers.pushLocation.mutationOptions());
}
