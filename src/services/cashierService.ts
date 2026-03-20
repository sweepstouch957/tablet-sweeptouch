import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/http/client';

// ===========================
// 🧩 Tipos
// ===========================
export interface Cashier {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  accessCode: string;
  profileImage?: string;
  countryCode?: string;
  store?: {
    _id: string;
    name: string;
  };
}



// ===========================
// 📦 Servicio principal
// ===========================
export const getCashiersByStore = async (
  storeId: string,
  limit = 50,
  page = 1
): Promise<Cashier[]> => {
  try {
    const response = await api.get(`/auth/cashiers`, {
      params: {
        storeId,
        limit,
        page,
      },
    });

    // Ajusta según la estructura exacta del backend
    // Ejemplo: { success: true, data: [...] }
    return response.data.data || response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching cashiers:', error);
    throw new Error(
      error.response?.data?.message || 'Error al obtener los cajeros'
    );
  }
};

// ===========================
// 🪄 Hook para React Query
// ===========================
export const useCashiersByStore = (storeId: string, limit = 50, page = 1) => {
  return useQuery({
    queryKey: ['cashiers', storeId, limit, page],
    queryFn: () => getCashiersByStore(storeId, limit, page),
    enabled: !!storeId, // Solo ejecuta si hay storeId
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
