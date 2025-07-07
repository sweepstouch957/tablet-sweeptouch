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

