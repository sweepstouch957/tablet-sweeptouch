import { promoService } from "@/services/promo.service";
import { useQuery } from "@tanstack/react-query";

export const usePromos = (
  type: "tablet" | "app" | "kiosk",
  storeId?: string
) => {
  return useQuery({
    queryKey: ["usePromoByStore", storeId],
    queryFn: () => promoService.getActivePromosByStore(storeId!, type),
    enabled: !!storeId, // solo ejecuta si storeId existe
    staleTime: 1000 * 60 * 5, // opcional: cache por 5 min,
    refetchOnWindowFocus: false, // opcional: no refetch al enfocar la ventana
    refetchOnReconnect: false, // opcional: no refetch al reconectar
    retry: 1, // opcional: reintentar una vez en caso de error
  });
};
