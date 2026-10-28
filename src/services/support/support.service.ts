/**
 * Servicios del flujo de soporte. HOY TODO ES MOCK.
 *
 * La interfaz `SupportService` es el contrato: cuando exista el backend se
 * escribe una implementación que haga HTTP con el cliente de `src/http` y se
 * cambia `supportService` por esa. La UI no se toca.
 *
 * Los puntos que el backend tiene que cubrir están marcados con BACKEND.
 */
import type {
  CodeResult,
  FaceResult,
  StoreInventory,
  Technician,
  Visit,
  VisitReport,
  VisitType,
} from './types';

export interface SupportService {
  /** BACKEND: validar el código contra los técnicos activos. */
  verifyTechnicianCode(code: string): Promise<CodeResult>;
  /**
   * BACKEND: comparar `snapshot` contra el rostro registrado del técnico.
   * La firma ya recibe la imagen para no tener que cambiarla después.
   */
  verifyFace(technicianId: string, snapshot: string | null): Promise<FaceResult>;
  /** BACKEND: la visita agendada de hoy para esta tienda. */
  getTodayVisit(storeSlug: string, storeName?: string): Promise<Visit>;
  /** BACKEND: cuántas cajas tiene la tienda. */
  getStoreInventory(storeSlug: string): Promise<StoreInventory>;
  /** BACKEND: persistir el reporte y cerrar la visita. */
  submitVisitReport(report: VisitReport): Promise<{ ok: boolean; id?: string }>;
}

/* ── Mock ────────────────────────────────────────────────────────────────── */

/** Código de prueba. Cuando haya backend esto desaparece. */
const MOCK_CODE = '4921';

const MOCK_TECHNICIAN: Technician = { id: 'T-01', name: 'Técnico T-01' };

const DEFAULT_REGISTERS = 6;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Lee un query param sin depender de Next: esto corre sólo en el navegador. */
function queryParam(name: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(name);
}

const VISIT_TYPES: VisitType[] = [
  'rutina',
  'extraordinaria',
  'instalacion',
  'desinstalacion',
  'reconfiguracion',
];

/** `&tipo=` fuerza el tipo de visita para probar los cinco sin backend. */
export function forcedVisitType(): VisitType {
  const raw = (queryParam('tipo') || '').toLowerCase();
  const match = VISIT_TYPES.find((t) => t === raw);
  return match || 'rutina';
}

/** `&cajas=` fuerza el número de cajas. */
export function forcedRegisters(): number {
  const raw = Number(queryParam('cajas'));
  return Number.isFinite(raw) && raw > 0 ? Math.min(40, Math.floor(raw)) : DEFAULT_REGISTERS;
}

/** `&dev=1` enciende los extras de calibración y el simulador sin cámara. */
export function isDevMode(): boolean {
  return queryParam('dev') === '1';
}

export const mockSupportService: SupportService = {
  async verifyTechnicianCode(code) {
    await delay(350);
    if (code !== MOCK_CODE) return { ok: false };
    return { ok: true, technician: MOCK_TECHNICIAN };
  },

  async verifyFace(technicianId, snapshot) {
    await delay(700);
    // El mock ignora la imagen, pero la recibe: el backend la va a necesitar.
    void technicianId;
    void snapshot;
    return { ok: true };
  },

  async getTodayVisit(storeSlug, storeName) {
    await delay(200);
    return {
      storeSlug,
      storeName: storeName || storeSlug,
      type: forcedVisitType(),
    };
  },

  async getStoreInventory(storeSlug) {
    await delay(200);
    void storeSlug;
    return { registers: forcedRegisters() };
  },

  async submitVisitReport(report) {
    await delay(900);
    // Mientras no haya backend, el reporte completo queda en la consola: es la
    // única forma de verificar en la tablet que se armó bien.
    // eslint-disable-next-line no-console
    console.log('[soporte] Reporte de visita', report);
    return { ok: true, id: `MOCK-${Date.now()}` };
  },
};

export const supportService: SupportService = mockSupportService;
