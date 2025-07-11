import { api } from "@/http/client";

export interface Promo {
  _id: string;
  title: string;
  imageMobile: string;
  link?: string;
  type: "tablet" | "app" | "kiosk";
  category: "custom" | "generic";
  startDate: string;
  endDate: string;
  isActive: boolean;
  sweepstakeId?: string;
  storeId?: {
    _id: string;
    name: string;
    image?: string;
  };
  status?: "pending" | "active" | "completed";
}

/**
 * Servicio para promociones
 */
export const promoService = {
  /**
   * ✅ Obtener promociones activas por tienda
   * @param storeId ID de la tienda
   * @param type Tipo de promoción (tablet, app, kiosk)
   */
  async getActivePromosByStore(
    storeId: string,
    type: "tablet" | "app" | "kiosk"
  ): Promise<Promo[]> {
    const res = await api.get(`/promos/active/${storeId}`, {
      params: { type },
    });
    return res.data;
  },
};
