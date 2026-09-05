import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Toutes les procédures pro sont protégées par le code d'accès. */
export function useProLogin() {
  return useMutation(orpc.pro.login.mutationOptions());
}

const on = (code: string | null) => ({ input: { accessCode: code ?? "" }, enabled: Boolean(code) });

export function useProStats(code: string | null) {
  return useQuery(orpc.pro.stats.queryOptions({ ...on(code), refetchInterval: 60_000 }));
}

export function useProQuotes(code: string | null) {
  return useQuery(orpc.pro.quotes.queryOptions(on(code)));
}

export function useProTrackings(code: string | null) {
  return useQuery(orpc.pro.trackings.queryOptions(on(code)));
}

export function useProContacts(code: string | null) {
  return useQuery(orpc.pro.contacts.queryOptions(on(code)));
}

export function useProApplications(code: string | null) {
  return useQuery(orpc.pro.applications.queryOptions(on(code)));
}

export function useProDrivers(code: string | null) {
  return useQuery(orpc.pro.drivers.queryOptions(on(code)));
}

export function useProApiKeys(code: string | null) {
  return useQuery(orpc.pro.apiKeys.queryOptions(on(code)));
}

export function useProWebhooks(code: string | null) {
  return useQuery(orpc.pro.webhooks.queryOptions(on(code)));
}

export function useSetQuoteStatus() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.pro.setQuoteStatus.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.pro.key() }),
    }),
  );
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.pro.createApiKey.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.pro.apiKeys.key() }),
    }),
  );
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.pro.revokeApiKey.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.pro.apiKeys.key() }),
    }),
  );
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.pro.createWebhook.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.pro.webhooks.key() }),
    }),
  );
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.pro.deleteWebhook.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.pro.webhooks.key() }),
    }),
  );
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.pro.createDriver.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.pro.drivers.key() }),
    }),
  );
}

export function useAssignJob() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.pro.assignJob.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.pro.key() }),
    }),
  );
}
