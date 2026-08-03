/* eslint-disable @typescript-eslint/no-explicit-any */

import { api } from "@/http/client";

export interface Sweepstake {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  image: string;
}

/**
 * Obtiene el ID del sweepstake activo para una tienda específica
 */
export const getActiveSweepstakeByStore = async (
  storeId: string
): Promise<any> => {
  const resp = await api.get(
    `/sweepstakes/active/${storeId}`
  );
  return resp.data;
};

export interface CreateParticipantPayload {
  sweepstakeId: string;
  customerPhone: string;
  customerName: string;
  storeId: string;
  method: string;
  createdBy: string;
}

/**
 * Registra un participante en el sweepstake
 */
export const createSweepstake = async (data: CreateParticipantPayload) => {
  try {
    const res = await api.post("/sweepstakes/participants/register", data);
    return res.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.error || "Error al registrar participante";
    console.error("❌ createSweepstake error:", message);
    return Promise.reject(message);
  }
};

export interface CreateDefaultParticipantPayload extends CreateParticipantPayload {
  zipCode: string;
}

/** Rol elegido en el modal NSA (optinType === "nsa") tras registrarse. */
export type NsaRole = "owner_manager" | "seller_brand";

/**
 * Guarda el rol Owner/Manager | Seller/Brand del participante recién registrado.
 */
export const setParticipantNsaRole = async (
  participantId: string,
  nsaRole: NsaRole
) => {
  try {
    const res = await api.patch(
      `/sweepstakes/participants/${participantId}/nsa-role`,
      { nsaRole }
    );
    return res.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.error || "Error al guardar el rol del participante";
    console.error("❌ setParticipantNsaRole error:", message);
    return Promise.reject(message);
  }
};

