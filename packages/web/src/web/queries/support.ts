import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useSupportFaq(enabled = true) {
  return useQuery(orpc.support.faq.queryOptions({ enabled, staleTime: 5 * 60_000 }));
}

export function useSupportLookup() {
  return useMutation(orpc.support.lookup.mutationOptions());
}

export function useSupportLead() {
  return useMutation(orpc.support.lead.mutationOptions());
}
