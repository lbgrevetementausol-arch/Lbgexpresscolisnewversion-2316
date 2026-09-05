import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useNewsletterSubscribe() {
  return useMutation(orpc.newsletter.subscribe.mutationOptions());
}

export function useNewsletterUnsubscribe() {
  return useMutation(orpc.newsletter.unsubscribe.mutationOptions());
}

export function useNewsletterList(enabled = true) {
  return useQuery(orpc.newsletter.list.queryOptions({ enabled, staleTime: 30_000 }));
}
