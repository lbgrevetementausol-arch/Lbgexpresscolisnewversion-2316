import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { getBearer } from "../lib/auth";

/** Téléversement d'une pièce justificative — renvoie la clé opaque à joindre à l'inscription. */
export async function uploadDriverDocument(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/driver/document", { method: "POST", body });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; key?: string; error?: string } | null;
  if (!res.ok || !data?.ok || !data.key) {
    throw new Error(data?.error ?? "Téléversement impossible");
  }
  return data.key;
}

/** Ouverture d'un document livreur depuis le back-office (session admin en Bearer). */
export async function openDriverDocument(key: string) {
  const res = await fetch(`/api/driver/document/${key}`, {
    headers: { Authorization: `Bearer ${getBearer()}` },
  });
  if (!res.ok) throw new Error("Document indisponible");
  const url = URL.createObjectURL(await res.blob());
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function useDriverRegister() {
  return useMutation(orpc.driverAccount.register.mutationOptions());
}

export function useDriverVerifyEmail() {
  return useMutation(orpc.driverAccount.verifyEmail.mutationOptions());
}

export function useDriverResendCode() {
  return useMutation(orpc.driverAccount.resendCode.mutationOptions());
}

export function useDriverPasswordLogin() {
  return useMutation(orpc.driverAccount.login.mutationOptions());
}

export function useDriverForgotPassword() {
  return useMutation(orpc.driverAccount.forgotPassword.mutationOptions());
}

export function useDriverResetPassword() {
  return useMutation(orpc.driverAccount.resetPassword.mutationOptions());
}

export function useDriverMe(token: string | null) {
  return useQuery(
    orpc.driverAccount.me.queryOptions({
      input: { token: token ?? "" },
      enabled: Boolean(token),
      retry: false,
    }),
  );
}

export function useDriverOffers(token: string | null, enabled = true) {
  return useQuery(
    orpc.driverAccount.offers.queryOptions({
      input: { token: token ?? "" },
      enabled: Boolean(token) && enabled,
      refetchInterval: 45_000,
      retry: false,
    }),
  );
}

export function useSetDriverAvailability() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.driverAccount.setAvailability.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.driverAccount.key() }),
    }),
  );
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.driverAccount.acceptOffer.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.driverAccount.key() });
        queryClient.invalidateQueries({ queryKey: orpc.drivers.key() });
      },
    }),
  );
}

/* — Back-office — */

export function useAdminDrivers() {
  return useQuery(orpc.driverAdmin.list.queryOptions());
}

export function useAdminSetApproval() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.driverAdmin.setApproval.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.driverAdmin.key() }),
    }),
  );
}

export function useAdminSetDriverActive() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.driverAdmin.setActive.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.driverAdmin.key() }),
    }),
  );
}

export function useAdminJobOffers() {
  return useQuery(orpc.driverAdmin.offers.queryOptions());
}

export function useAdminResendOffer() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.driverAdmin.resendOffer.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.driverAdmin.key() }),
    }),
  );
}

export function useAdminCancelOffer() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.driverAdmin.cancelOffer.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.driverAdmin.key() }),
    }),
  );
}
