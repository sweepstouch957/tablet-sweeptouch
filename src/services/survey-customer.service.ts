import { api } from "@/http/client";

interface CustomerMatch {
  _id: string;
  phoneNumber: string;
  countryCode?: string;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // The kiosk accepts ten-digit North American numbers.
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

/** Resolve the registered phone using the existing store customer search API. */
export async function findSurveyCustomerId(storeId: string, phone: string): Promise<string> {
  const normalized = normalizePhone(phone);
  if (!storeId || normalized.length !== 10) throw new Error("Missing survey registration details.");

  const { data } = await api.get<{ data: CustomerMatch[] }>(
    `/customers/store/${encodeURIComponent(storeId)}`,
    { params: { search: normalized, page: 1, limit: 100 } },
  );
  // Search can return partial matches: never take the first result blindly.
  const matches = (Array.isArray(data?.data) ? data.data : []).filter((customer) =>
    typeof customer._id === "string" && customer._id.length > 0 &&
    typeof customer.phoneNumber === "string" &&
    normalizePhone(customer.phoneNumber) === normalized,
  );
  const ids = [...new Set(matches.map((customer) => customer._id))];
  if (ids.length !== 1) {
    throw new Error("We couldn't find your registration. Please try again or contact staff.");
  }
  return ids[0];
}
