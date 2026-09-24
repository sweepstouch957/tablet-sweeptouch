// services/redeem.service.ts — canje de premios del cliente en caja.
//
// El cliente gana un cupón en el Pre-RCS (por ejemplo, $10 OFF por contestar la
// encuesta) y se lleva un QR "RW-XXXXXXXX". Acá la tablet lo lee, muestra qué
// premio es, y la cajera logueada lo entrega. Es el mismo trato que la
// validación de listas: el código es el secreto y la entrega queda firmada por
// la cajera, que tiene que ser de ESTA tienda.
import { api } from "@/http/client";

export interface RewardClaim {
  _id: string;
  redeemCode: string;
  status: "pending" | "fulfilled" | "rejected" | "cancelled";
  pointsSpent: number;
  sourceType: string;
  claimantName: string;
  claimantPhone: string;
  reward: { name: string; imageUrl?: string; pointsCost?: number; priceUSD?: number; description?: string };
  createdAt: string;
  fulfilledAt?: string;
  validatedBy?: string;
}

/** Formato del QR de premios. El de listas es SL- y el de recibos SUPER-. */
export function isRewardCode(value: string) {
  return /^RW-[A-Z0-9]{4,}$/.test(value.trim().toUpperCase());
}

/** Qué premio es y si sigue disponible. No entrega nada. */
export async function lookupRewardClaim(code: string, storeSlug: string): Promise<RewardClaim> {
  const { data } = await api.get(`/tracking/rewards/redeem/${encodeURIComponent(code)}`, {
    params: { storeSlug },
  });
  return data.claim as RewardClaim;
}

/**
 * Entrega el premio. `cashierId` tiene que ser el _id real de la cajera
 * logueada: el backend rechaza cualquier otra cosa y deja su nombre en el canje.
 */
export async function redeemRewardClaim(
  code: string,
  storeSlug: string,
  cashierId: string
): Promise<RewardClaim> {
  const { data } = await api.post(`/tracking/rewards/redeem/${encodeURIComponent(code)}`, {
    storeSlug,
    cashierId,
  });
  return data.claim as RewardClaim;
}
