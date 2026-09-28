"use client";

import { api } from "@/http/mms-client";
import { api as shopperApi } from "@/http/client";
import { useQuery } from "@tanstack/react-query";

/* ─── Types ──────────────────────────────────────────── */
export interface MmsProduct {
  _id?: string;
  name: string;
  price: string;
  sku?: string;
  unit?: string;
  originalPrice?: string;
  savings?: string;
  offerCondition?: string;
  // Oferta condicionada por total del carrito: si el pedido supera minBasketCents, el producto cuesta `price`.
  conditionalOffer?: { minBasketCents?: number; price?: string };
  category?: string;
  emoji?: string;
  imageUrl?: string;
  isHero?: boolean;
  // Identidad de producto — para mostrar marca/presentación y agrupar variantes por groupKey
  brand?: string;
  presentation?: string;
  size?: string;
  barcode?: string;
  groupKey?: string;
  // Compra forzada del flyer: "15 LB BOX ONLY" con "$7.99 LB" son 15 lb por cantidad.
  packQty?: number;
  packUnit?: string;
  /** Se despacha en el mostrador (carnicería/deli): no se puede pedir ni pagar online. */
  counterOnly?: boolean;
  /** Oferta combinable entre varios productos ("A OR B 10/$10"). */
  offerGroup?: string;
  maxPerCustomer?: number | null; // tope por cliente configurado en /productos (null = sin tope → usa el default)
  minPerCustomer?: number | null; // mínimo por cliente (ej. carnes ≥ 2; null = sin mínimo)
  outOfStock?: boolean; // stock restante 0 → se muestra "Agotado", no se puede agregar
  stock?: number | null; // stock restante (null = ilimitado) — topea la cantidad y muestra "¡Quedan N!"
  // ¿Se puede pagar con EBT/SNAP? Lo define el catálogo de la tienda porque la
  // categoría no alcanza: en `beverages` cae el alcohol y en `deli` la comida
  // caliente, y ninguno de los dos es elegible. null/undefined → decide la categoría.
  ebtEligible?: boolean | null;
}

export interface MmsTheme {
  primaryColor: string;
  primaryDark: string;
  accentColor: string;
  textOnPrimary: string;
  footerBg: string;
  logoUrl?: string;
  headerStyle?: string;
  showQr?: boolean;
  showBarcode?: boolean;
  customCss?: string;
  ctaText?: string;
  footerText?: string;
}

export interface MmsBarcodeData {
  _id: string;
  barcode: string;
  customerId: string;
  circularId: string;
  storeId: string;
  storeSlug: string;
  campaignCode: string;
  products: MmsProduct[];
  status: string;
}

export interface AiRecipe {
  name: string;
  tags: string[];
  time: string;
  savings?: string;
  ingredients: string[];
  procedure: string[];
  imageUrl?: string;
  /** Momento del día ("desayuno" | "almuerzo" | "cena" | "postre"), porciones base e ingredientes con cantidad. */
  meal?: string;
  servings?: number;
  items?: { name: string; qty: number; unit: string }[];
}

export interface CircularProductsData {
  ok: boolean;
  products: MmsProduct[];
  headline?: string;
  extractionStatus?: string;
  storeSlug?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  fileUrl?: string;
  recipes?: AiRecipe[];
}

export interface StoreThemeData {
  ok: boolean;
  theme: MmsTheme;
  store: {
    _id?: string;
    name: string;
    slug: string;
    image?: string;
    address?: string;
    phone?: string;
    countryCode?: string;
    shippingEnabled?: boolean;
    shippingCostCents?: number;
    freeShippingThresholdCents?: number;
    // Reglas de envío por código postal (costCents 0 = gratis; freeOverCents = gratis desde ese monto)
    shippingZones?: Array<{ name?: string; zips: string[]; costCents: number; freeOverCents: number }>;
    inStorePaymentEnabled?: boolean; // false → la tienda solo acepta pago en línea
    firstPurchaseIncentive?: {
      enabled: boolean;
      minSpendCents?: number; // ej. 15000 ($150)
      rewardCents?: number;   // ej. 1000 ($10)
      text?: string;
    };
  };
}

/* ─── Default theme ──────────────────────────────────── */
export const DEFAULT_THEME: MmsTheme = {
  primaryColor: "#DC1F26",
  primaryDark: "#B01820",
  accentColor: "#FFD700",
  textOnPrimary: "#FFFFFF",
  footerBg: "#333333",
  logoUrl: "",
  headerStyle: "classic",
  showQr: true,
  showBarcode: true,
  customCss: "",
  ctaText: "SHOW THIS AT CHECKOUT:",
  footerText: "Powered by Sweepstouch | Unsubscribe: Reply STOP",
};

/* ─── API calls ──────────────────────────────────────── */

export async function fetchCustomerBarcodes(
  customerId: string
): Promise<{ ok: boolean; barcodes: MmsBarcodeData[] }> {
  const { data } = await api.get(`/mms-generator/customer/${customerId}`);
  return data;
}

export async function fetchCircularProducts(
  circularId: string
): Promise<CircularProductsData> {
  const { data } = await api.get(`/circulars/${circularId}/products`);
  return data;
}

export async function fetchStoreTheme(
  storeSlug: string
): Promise<StoreThemeData> {
  const { data } = await api.get(`/mms-generator/store/${storeSlug}/theme`);
  return data;
}

/* ─── Hooks ──────────────────────────────────────────── */

export function useCustomerBarcodes(customerId?: string) {
  return useQuery({
    queryKey: ["customer-barcodes", customerId],
    queryFn: () => fetchCustomerBarcodes(customerId!),
    enabled: !!customerId,
    staleTime: 60_000,
  });
}

export function useCircularProducts(circularId?: string) {
  return useQuery({
    queryKey: ["circular-products", circularId],
    queryFn: () => fetchCircularProducts(circularId!),
    enabled: !!circularId,
    staleTime: 60_000,
  });
}

export function useStoreTheme(storeSlug?: string) {
  return useQuery({
    queryKey: ["store-theme", storeSlug],
    queryFn: () => fetchStoreTheme(storeSlug!),
    enabled: !!storeSlug,
    staleTime: 300_000, // cache theme for 5 min
  });
}

/* ─── Shopping List ────────────────────────────────────── */

export interface ShoppingListItem {
  name: string;
  price: string;
  quantity: number;
  unit: string;
  imageUrl?: string;
  category?: string;
  savings?: string;
  originalPrice?: string;
}

export interface ShoppingListResponse {
  createdAt?: string;
  expiresAt?: string;
  ok: boolean;
  shoppingListId: string;
  qrCode: string;      // text code like SL-XXXXXX
  qrImage?: string;    // data URL for QR image
  items: ShoppingListItem[];
  totalItems: number;
}

export async function createShoppingList(
  customerId: string,
  circularId: string,
  storeSlug: string,
  items: ShoppingListItem[],
  /** Ahorro que se le mostró al cliente. Viaja para que el SMS de
   *  agradecimiento le diga el mismo número que vio en pantalla. */
  estimatedSavings?: number,
  action?: "replace"
): Promise<ShoppingListResponse> {
  const { data } = await api.post(`/tracking/shopping-list`, {
    customerId,
    circularId,
    storeSlug,
    items,
    estimatedSavings,
    ...(action ? { action } : {}),
  });
  return data;
}

export interface OcrValidateResponse {
  ok: boolean;
  pointsAwarded: number;
  confirmedItems: string[];
  scannedReceiptId: string;
  message?: string;
  allProducts?: Array<{
    name: string;
    price: number;
    quantity: number;
    matched: boolean;
  }>;
}

export async function ocrValidateShoppingList(
  qrCode: string,
  images: string[],
  demoMode?: boolean,
  cartItems?: string[]
): Promise<OcrValidateResponse> {
  const { data } = await api.post(`/tracking/shopping-list/${qrCode}/ocr-validate`, {
    images,
    demoMode,
    cartItems,
  });
  return data;
}

/** Fetch an existing shopping list by its QR code (SL-XXXXXX) */
export interface ShoppingListData {
  expiresAt?: string | null;
  ok: boolean;
  qrCode: string;
  customerId: string;
  storeSlug?: string;
  circularId?: string;
  status: string;
  items: ShoppingListItem[];
  totalItems: number;
  createdAt: string;
}

/** Una lista guardada del cliente, con lo que el backend ya calculó. */
export interface CustomerShoppingList {
  daysLeft: number;
  campaignWeek?: string;
  qrCode: string;
  status: "pending" | "validated" | "expired";
  items: ShoppingListItem[];
  totalItems: number;
  estimatedSavings: number;
  /** Valor estimado de la lista (suma precio × cantidad). */
  value: number;
  estimatedPoints: number;
  pointsAwarded: number;
  validatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export async function updateShoppingListItems(qrCode: string, items: ShoppingListItem[]): Promise<CustomerShoppingList> {
  const { data } = await shopperApi.patch<{ ok: boolean; shoppingList: CustomerShoppingList }>(
    `/tracking/shopping-list/${encodeURIComponent(qrCode)}/items`, { items }
  );
  if (!data.ok || !data.shoppingList) throw new Error("Invalid shopping list update response");
  return data.shoppingList;
}

export async function deleteShoppingList(qrCode: string, customerId: string, storeSlug: string): Promise<void> {
  const response = await shopperApi.delete(`/tracking/shopping-list/${encodeURIComponent(qrCode)}`);
  if (response.data?.ok === false || response.data?.deleted === false) {
    throw new Error("Shopping list deletion was not confirmed");
  }
  if (response.status === 204 || (response.data?.ok === true && response.data?.deleted === true)) return;
  // Some successful responses omit `deleted`. Verify persisted state instead
  // of reporting failure just because an optional response field is absent.
  const latest = await fetchCustomerShoppingListsPage(customerId, storeSlug);
  if (latest.active?.qrCode === qrCode) throw new Error("Shopping list deletion was not confirmed");
}

/** Encuesta post-compra del Pre-RCS: guarda respuestas y acredita puntos reales. */
/** Optional coupon contract for a server-issued survey discount; never generated locally. */
export interface SurveyDiscountCoupon {
  redeemCode: string;
  amount: number;
  currency: string;
  status: "issued" | "redeemed" | "expired";
  terms?: string;
}

export async function submitPrercsSurvey(payload: {
  customerId: string;
  storeSlug: string;
  qrCode?: string;
  /** "quick" = 5 estrellas (25 pts) · "full" = 4 pasos (cupón de la tienda). */
  kind?: "quick" | "full";
  answers: Array<{ question: string; answer: string }>;
}): Promise<{
  ok: boolean;
  pointsAwarded: number;
  alreadyAwarded: boolean;
  nextAvailableAt?: string | null;
  /** Cupón de la encuesta completa: el QR que se muestra en caja. */
  coupon?: SurveyDiscountCoupon;
  /** Mismo cupón visto como canje (claim) — lo usa el link a Rewards. */
  reward?: { code: string; name: string; claimId: string } | null;
}> {
  const { data } = await api.post(`/tracking/shopping-list/survey`, payload);
  return data;
}

/** Catálogo de premios vigentes para shoppers de la tienda. */
export async function fetchRewardCatalog(
  storeSlug: string
): Promise<Array<{ _id: string; name: string; pointsCost: number; imageUrl?: string; description?: string }>> {
  const { data } = await api.get(`/tracking/rewards/catalog`, { params: { storeSlug } });
  return data?.rewards ?? [];
}

export interface SurveyTierStatus {
  points: number;
  /** La encuesta completa paga un cupón de la tienda, no puntos. */
  reward?: { name: string; amountUSD?: number };
  available: boolean;
  nextAvailableAt: string | null;
}

/** Qué encuesta paga esta semana (se renueva cada 7 días por tipo). */
export async function fetchSurveyStatus(customerId: string, storeSlug: string): Promise<{ quick: SurveyTierStatus; full: SurveyTierStatus }> {
  const { data } = await api.get(`/tracking/shopping-list/survey/status`, { params: { customerId, storeSlug } });
  return data;
}

/** Las listas guardadas del cliente ("Mis listas"), persistidas en el backend. */
export interface CustomerShoppingListsPage {
  active: CustomerShoppingList | null;
  history: CustomerShoppingList[];
  historyTotal: number;
  historyPage: number;
  historyPageSize: number;
  lists: CustomerShoppingList[];
}

export async function fetchCustomerShoppingListsPage(
  customerId: string,
  storeSlug?: string,
  page = 1
): Promise<CustomerShoppingListsPage> {
  const { data } = await api.get(`/tracking/shopping-list/customer/${customerId}`, {
    params: { ...(storeSlug ? { storeSlug } : {}), page },
  });
  return data;
}

export async function fetchCustomerShoppingLists(
  customerId: string,
  storeSlug?: string
): Promise<CustomerShoppingList[]> {
  const { data } = await api.get(`/tracking/shopping-list/customer/${customerId}`, {
    params: storeSlug ? { storeSlug } : undefined,
  });
  return data.lists || [];
}

export async function fetchShoppingList(qrCode: string): Promise<ShoppingListData> {
  const { data } = await api.get(`/tracking/shopping-list/${qrCode}`);
  // Backend wraps in `shoppingList` key
  return data.shoppingList || data;
}

export interface CustomerBalanceResponse {
  ok: boolean;
  customerId: string;
  earned: number;
  spent: number;
  available: number;
}

export async function fetchCustomerBalance(customerId: string): Promise<CustomerBalanceResponse> {
  const { data } = await api.get(`/tracking/rewards/balance/${customerId}`);
  return data;
}

export interface PurchaseHistoryResponse {
  ok: boolean;
  scans: Array<{
    _id: string;
    barcode: string;
    customerId: string;
    customerName: string;
    storeSlug: string;
    circularId?: string;
    basePointsAwarded: number;
    bonusPointsAwarded: number;
    totalPointsAwarded: number;
    cashierConfirmedPurchase: boolean;
    scannedAt: string;
    campaignProducts: Array<{
      name: string;
      price?: string;
      emoji?: string;
      category?: string;
      quantity?: number;
      unit?: string;
      imageUrl?: string;
    }>;
    purchasedProducts: Array<{
      name: string;
      price?: string;
      category?: string;
      quantity?: number;
      unit?: string;
      imageUrl?: string;
    }>;
    isGroup: boolean;
    groupPartyName?: string;
    groupPartyParticipants: Array<{
      customerId: string;
      name: string;
      joinedAt: string;
      isHost: boolean;
    }>;
  }>;
  totalPoints: number;
  stats: {
    totalScans: number;
    totalPoints: number;
    totalGroupScans: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export async function fetchPurchaseHistory(customerId: string): Promise<PurchaseHistoryResponse> {
  const { data } = await api.get(`/tracking/weekly-ad-scan/customer/${customerId}/history?limit=50`);
  return data;
}


export interface ActiveSweepstakeResponse {
  ok: boolean;
  sweepstake: {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    image?: string;
    description?: string;
    prize?: Array<{ name: string; description?: string; image?: string }> | string[];
    winnersCount?: number;
    bannerMobile?: string;
  } | null;
  customerTickets: number;
}

export async function fetchActiveSweepstake(
  storeSlug: string,
  customerId?: string
): Promise<ActiveSweepstakeResponse> {
  const params = customerId ? `?customerId=${customerId}` : "";
  const { data } = await api.get(`/sweepstakes/active-slug/${storeSlug}${params}`);
  return data;
}

export interface FoodPreferences {
  nationality: string;
  allergies: string[];
  householdSize: number;
}

export interface CustomerPublicData {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  language?: "es" | "en";
  foodPreferences?: FoodPreferences;
}

export async function fetchCustomerById(customerId: string): Promise<CustomerPublicData> {
  const { data } = await api.get(`/customers/${customerId}`);
  return data;
}

/** Guarda las preferencias de comida del cliente (endpoint público con capability token). */
export async function saveFoodPreferences(token: string, prefs: FoodPreferences): Promise<void> {
  await api.patch(`/customers/campaign-profile?token=${encodeURIComponent(token)}`, { foodPreferences: prefs });
}

/** Guarda el nombre del cliente (endpoint público con capability token). */
export async function saveCustomerName(token: string, firstName: string): Promise<void> {
  await api.patch(`/customers/campaign-profile?token=${encodeURIComponent(token)}`, { firstName });
}

/** Alta de datos básicos desde el Pre-RCS: el mismo endpoint, varios campos. */
export async function saveCustomerProfile(
  token: string,
  profile: { firstName?: string; lastName?: string; email?: string }
): Promise<void> {
  await api.patch(`/customers/campaign-profile?token=${encodeURIComponent(token)}`, profile);
}

