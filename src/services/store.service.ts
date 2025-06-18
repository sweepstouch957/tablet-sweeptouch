import { api } from "../http/client";
export interface Store {
  id: string;
  _id: string;
  name: string;
  address: string;
  zipCode: string;
  owner: string;
  ownerId: string;
  description: string;
  image: string;
  active: boolean;
  subscription: string | null;
  createdAt: string;
  updatedAt: string;
  location: {
    type: "Point";
  };
  twilioPhoneNumber: string;
  twilioPhoneNumberFriendlyName: string;
  twilioPhoneNumberSid: string;
  type: "elite" | "basic" | string;
  slug: string;
}

export const getStoreBySlug = async (slug: string): Promise<Store> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resp: any = await api.get<{ data: Store }>(`/store/slug/${slug}`);
  return resp.data;
};
