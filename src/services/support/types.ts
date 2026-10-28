/**
 * Modelo del flujo de soporte técnico en el kiosco.
 *
 * Todo lo que el técnico registra termina en un `VisitReport`. La UI no conoce
 * otra forma de los datos: cuando exista backend, cambia la implementación de
 * `support.service.ts` y nada más.
 */

export type VisitType =
  | 'rutina'
  | 'extraordinaria'
  | 'instalacion'
  | 'desinstalacion'
  | 'reconfiguracion';

export const VISIT_TYPE_LABEL: Record<VisitType, string> = {
  rutina: 'Visita de rutina',
  extraordinaria: 'Visita extraordinaria',
  instalacion: 'Instalación',
  desinstalacion: 'Desinstalación',
  reconfiguracion: 'Reconfiguración',
};

export interface Technician {
  id: string;
  name: string;
}

export interface Visit {
  storeSlug: string;
  storeName: string;
  type: VisitType;
}

/** Las cajas se numeran 1..N: el mock no tiene nombres por caja. */
export interface StoreInventory {
  registers: number;
}

/* ── Tareas de rutina / extraordinaria ───────────────────────────────────── */

export type TaskId =
  | 'encender-tablets'
  | 'cables-tablet'
  | 'holder'
  | 'cargador'
  | 'tablet-danada'
  | 'reconfigurar-impresora'
  | 'cambiar-impresora'
  | 'cables-impresora'
  | 'cambiar-router'
  | 'reiniciar-router'
  | 'ajuste-soportes'
  | 'otro';

export interface TaskDef {
  id: TaskId;
  label: string;
}

/** Las 12 opciones del checklist, en el orden en que se muestran. */
export const TASKS: TaskDef[] = [
  { id: 'encender-tablets', label: 'Encender tablets apagadas' },
  { id: 'cables-tablet', label: 'Cambiar cables de energía de tablet' },
  { id: 'holder', label: 'Cambiar holder' },
  { id: 'cargador', label: 'Cambiar cargador' },
  { id: 'tablet-danada', label: 'Cambiar tablet dañada' },
  { id: 'reconfigurar-impresora', label: 'Reconfigurar impresora' },
  { id: 'cambiar-impresora', label: 'Cambiar impresora' },
  { id: 'cables-impresora', label: 'Cambiar cables de energía de impresora' },
  { id: 'cambiar-router', label: 'Cambiar router de internet' },
  { id: 'reiniciar-router', label: 'Conexión o reinicio de router de internet' },
  { id: 'ajuste-soportes', label: 'Ajuste de soportes' },
  { id: 'otro', label: 'Otro' },
];

/** `otro` se describe con texto; el resto, con las cajas donde se hizo. */
export interface TaskDetail {
  taskId: TaskId;
  registers: number[];
  note?: string;
}

/* ── Instalación / desinstalación ────────────────────────────────────────── */

export interface EquipmentCounts {
  printers: number;
  holders: number;
  cables: number;
  bases: number;
}

export const EMPTY_COUNTS: EquipmentCounts = { printers: 0, holders: 0, cables: 0, bases: 0 };

export const EQUIPMENT_LABEL: Record<keyof EquipmentCounts, string> = {
  printers: 'Impresoras',
  holders: 'Holders',
  cables: 'Cables',
  bases: 'Bases',
};

/* ── Cómo entró el técnico ────────────────────────────────── */

/**
 * Qué método usó para verificarse.
 *
 * Queda en el reporte porque no todos valen lo mismo: el acceso de emergencia
 * salta la biometría, y auditar una visita exige saber si hubo un rostro de por
 * medio o la aprobación de un supervisor.
 */
export type LoginMethod = 'kiosk_camera' | 'phone_qr' | 'whatsapp_code' | 'emergency_sms';

export const LOGIN_METHOD_LABEL: Record<LoginMethod, string> = {
  kiosk_camera: 'Cámara del kiosko',
  phone_qr: 'Login por celular',
  whatsapp_code: 'Login por WhatsApp',
  emergency_sms: 'Acceso de emergencia',
};

/** Datos extra según por dónde entró. */
export interface LoginDetails {
  method: LoginMethod;
  /** Método 2. */
  whatsappRequestId?: string;
  whatsappMaskedPhone?: string;
  /** Método 3. */
  emergencyRequestId?: string;
  emergencyReason?: string;
  emergencyApprovedBy?: string;
}

/* ── Reporte final ───────────────────────────────────────────────────────── */

export interface VisitReport {
  technician: Technician;
  store: { slug: string; name: string };
  visitType: VisitType;
  /** ISO. `durationMs` va aparte para no recalcularla en el backend. */
  startedAt: string;
  endedAt: string;
  durationMs: number;
  /** JPEG en dataURL del rostro al validar. El backend lo compara después.
   *  Con `phone_qr` la foto la tomó el celular, no el kiosko. */
  faceSnapshot?: string | null;
  /** Por dónde se verificó el técnico. */
  login: LoginDetails;

  /** rutina · extraordinaria */
  tasks?: TaskDetail[];
  /** instalacion */
  install?: { registers: number[]; counts: EquipmentCounts };
  /** desinstalacion: `total` es cuántas cajas tiene la tienda, para detectar faltantes. */
  uninstall?: { registers: number[]; total: number; counts: EquipmentCounts };
  /** reconfiguracion: `null` = no se preguntó. */
  reconfiguration?: { allDone: boolean | null };
}

export interface CodeResult {
  ok: boolean;
  technician?: Technician;
}

export interface FaceResult {
  ok: boolean;
  /** Mensaje para el técnico cuando `ok` es false. */
  reason?: string;
}
