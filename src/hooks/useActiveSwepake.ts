import { useQuery } from "@tanstack/react-query";
import { getActiveSweepstakeByStore } from "@/services/sweepstake.service";

export const useActiveSweepstake = (storeId?: string) => {
  return useQuery({
    queryKey: ["activeSweepstake", storeId],
    queryFn: () => getActiveSweepstakeByStore(storeId!),
    enabled: !!storeId, // solo ejecuta si storeId existe
    staleTime: 1000 * 60 * 5, // opcional: cache por 5 min,
    refetchOnWindowFocus: false, // opcional: no refetch al enfocar la ventana
    refetchOnReconnect: false, // opcional: no refetch al reconectar
    retry: 1, // opcional: reintentar una vez en caso de error
  });
};
