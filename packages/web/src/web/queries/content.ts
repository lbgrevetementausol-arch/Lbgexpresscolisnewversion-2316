import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function usePosts() {
  return useQuery(orpc.content.posts.queryOptions({ staleTime: 5 * 60_000 }));
}

export function usePost(slug: string) {
  return useQuery(
    orpc.content.post.queryOptions({ input: { slug }, enabled: slug.length > 1, retry: false }),
  );
}

export function useSendContact() {
  return useMutation(orpc.content.contact.mutationOptions());
}

export function useApplyCarrier() {
  return useMutation(orpc.content.applyCarrier.mutationOptions());
}
