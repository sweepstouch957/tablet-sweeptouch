import { api } from "@/http/client";

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

export const getCashiersByStore = async (storeId: string): Promise<Cashier[]> => {
  const res = await api.get(`/users/cashiers/${storeId}`);
  return res.data;
};

