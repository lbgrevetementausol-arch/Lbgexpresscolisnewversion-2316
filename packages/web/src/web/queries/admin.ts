import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useMe(enabled: boolean) {
  return useQuery(orpc.admin.me.queryOptions({ enabled, retry: false }));
}

export function useProToken(enabled: boolean) {
  return useQuery(orpc.admin.proToken.queryOptions({ enabled, retry: false }));
}

export function useAdminStats(enabled: boolean) {
  return useQuery(orpc.admin.stats.queryOptions({ enabled, refetchInterval: 15_000 }));
}

export function useAdminOrders(
  status: "tous" | "nouveau" | "a_valider" | "accepte" | "refuse" | "paye" | "en_cours" | "livre" | "annule",
  enabled: boolean,
) {
  return useQuery(
    orpc.admin.orders.queryOptions({
      input: { status, limit: 150 },
      enabled,
      refetchInterval: 5_000,
    }),
  );
}

export function useAdminUsers(enabled: boolean) {
  return useQuery(orpc.admin.users.queryOptions({ enabled, refetchInterval: 20_000 }));
}

export function useAdminSettings(enabled: boolean) {
  return useQuery(orpc.admin.settings.queryOptions({ enabled }));
}

export function useAdminTrackings(enabled: boolean) {
  return useQuery(orpc.admin.trackings.queryOptions({ enabled, refetchInterval: 15_000 }));
}

export function useAdminDriverPositions(enabled: boolean) {
  return useQuery(orpc.admin.driverPositions.queryOptions({ enabled, refetchInterval: 15_000 }));
}

export function useAdminContacts(enabled: boolean) {
  return useQuery(orpc.admin.contacts.queryOptions({ enabled }));
}

export function useAdminApplications(enabled: boolean) {
  return useQuery(orpc.admin.applications.queryOptions({ enabled }));
}

export function useAdminLeads(enabled: boolean) {
  return useQuery(orpc.admin.leads.queryOptions({ enabled, refetchInterval: 15_000 }));
}

export function useAdminAudit(enabled: boolean) {
  return useQuery(orpc.admin.audit.queryOptions({ enabled }));
}

export function useMyOrders(enabled: boolean) {
  return useQuery(orpc.admin.myOrders.queryOptions({ enabled, refetchInterval: 20_000 }));
}

export function useDecideOrder() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.decideOrder.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.admin.key() }),
    }),
  );
}

export function useSetOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.setOrderStatus.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.admin.key() }),
    }),
  );
}

export function useSetUserStatus() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.setUserStatus.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.admin.users.key() }),
    }),
  );
}

export function useSetUserRole() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.setUserRole.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.admin.users.key() }),
    }),
  );
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.saveSettings.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.admin.settings.key() }),
    }),
  );
}

export function useAddTrackingEvent() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.addTrackingEvent.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.admin.trackings.key() }),
    }),
  );
}

export function useMarkLeadHandled() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.markLeadHandled.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.admin.leads.key() }),
    }),
  );
}
