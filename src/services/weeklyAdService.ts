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
    imageUrl?: string;
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

export interface ShoppingListResult {
  _id: string;
  qrCode: string;
  customerId: string;
  /** Nombre + inicial del apellido. Vacio si el cliente no esta en la base. */
  customerName?: string;
  /** Ultimos 4 digitos del telefono: alcanza para confirmar identidad en la caja. */
  customerPhoneMasked?: string;
  storeSlug: string;
  items: Array<{
    name: string;
    price: string;
    quantity: number;
    unit: string;
    imageUrl?: string;
    category?: string;
  }>;
  totalItems: number;
  status: string;
  /** El backend ya resuelve el vencimiento por fecha; no rehacerlo en el cliente. */
  isValidated?: boolean;
  isExpired?: boolean;
  validatedAt?: string;
  pointsAwarded?: number;
  createdAt: string;
  expiresAt: string;
}

export interface ShoppingListValidateResult {
  ok: boolean;
  confirmedProducts: number;
  pointsAwarded: number;
  totalPointsThisScan: number;
  /** Puntos que se lleva la cajera por escanear esta lista. 0 si no hay sesion. */
  cashierPointsAwarded?: number;
  validatedAt: string;
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
 * Look up a shopping list by QR code (SL-XXXXXX format).
 */
export async function fetchShoppingList(
  qrCode: string
): Promise<{ ok: boolean; shoppingList: ShoppingListResult }> {
  const { data } = await api.get(`/tracking/shopping-list/${encodeURIComponent(qrCode)}`);
  return data;
}

/**
 * Cashier validates a shopping list and awards points.
 *
 * `cashierId` tiene que ser el _id real de la cajera logueada: el backend le
 * acredita puntos por cada lista escaneada y descarta cualquier id que no sea
 * un ObjectId (el viejo "tablet-default" no cobra).
 */
export async function validateShoppingList(
  qrCode: string,
  validatedItems: string[],
  cashierId: string = "tablet-default"
): Promise<ShoppingListValidateResult> {
  const { data } = await api.post(
    `/tracking/shopping-list/${encodeURIComponent(qrCode)}/validate`,
    { validatedItems, cashierId }
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
