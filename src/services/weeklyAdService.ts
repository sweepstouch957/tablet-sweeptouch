import { api } from "@/http/client";

export interface ScanResult {
  _id: string;
  barcode: string;
  customerName: string;
  customerPhone: string;
  campaignProducts: Array<{
    name: string;
    price: string;
    emoji?: string;
    category?: string;
    isHero?: boolean;
  }>;
  basePointsAwarded: number;
  totalPointsThisScan: number;
  totalPointsAllTime: number;
  storeName: string;
  campaignCode: string;
  scannedAt: string;
}

export interface ConfirmResult {
  ok: boolean;
  confirmedProducts: number;
  bonusPointsAwarded: number;
  totalPointsThisScan: number;
  totalPointsAllTime: number;
}

/**
 * Send a scanned barcode to the tracking service.
 */
export async function scanWeeklyAdBarcode(
  barcode: string,
  tabletId: string = "tablet-default"
): Promise<{ ok: boolean; scan: ScanResult }> {
  const { data } = await api.post("/tracking/weekly-ad-scan/scan", {
    barcode,
    tabletId,
  });
  return data;
}

/**
 * Cashier confirms which products the customer purchased.
 */
export async function confirmPurchase(
  scanId: string,
  purchasedProducts: string[]
): Promise<ConfirmResult> {
  const { data } = await api.post(
    `/tracking/weekly-ad-scan/scan/${scanId}/confirm`,
    { purchasedProducts }
  );
  return data;
}

/**
 * Get scan history for a customer.
 */
export async function getCustomerScanHistory(
  customerId: string,
  page: number = 1
): Promise<{ ok: boolean; scans: ScanResult[]; totalPoints: number }> {
  const { data } = await api.get(
    `/tracking/weekly-ad-scan/customer/${customerId}/history`,
    { params: { page, limit: 10 } }
  );
  return data;
}
