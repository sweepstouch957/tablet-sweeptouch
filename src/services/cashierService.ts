import axios from "axios";
import { useQuery } from "@tanstack/react-query";

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
  store?: {
    _id: string;
    name: string;
  };
}

// ===========================
// ⚙️ Cliente Axios
// ===========================
const api = axios.create({
  baseURL: "https://api2.sweepstouch.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

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
  } catch (error: any) {
    console.error("Error fetching cashiers:", error);
    throw new Error(
      error.response?.data?.message || "Error al obtener los cajeros"
    );
  }
};

// ===========================
// 🪄 Hook para React Query
// ===========================
export const useCashiersByStore = (
  storeId: string,
  limit = 50,
  page = 1
) => {
  return useQuery({
    queryKey: ["cashiers", storeId, limit, page],
    queryFn: () => getCashiersByStore(storeId, limit, page),
    enabled: !!storeId, // Solo ejecuta si hay storeId
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
