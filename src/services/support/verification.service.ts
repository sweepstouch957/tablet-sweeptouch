/**
 * Métodos de respaldo del login del técnico. HOY TODO ES MOCK.
 *
 * Tres caminos cuando la cámara del kiosko no sirve:
 *   1. verificar con el celular (QR + la misma prueba de vida, en el teléfono);
 *   2. código por WhatsApp, amarrado a esta sesión del kiosko;
 *   3. código de emergencia por SMS, con aprobación de un supervisor.
 *
 * Las suscripciones devuelven una función para cortar. Están pensadas para que
 * mañana sean un WebSocket o un polling sin que las pantallas cambien: la UI no
 * sabe que hoy detrás hay un `BroadcastChannel` entre pestañas.
 *
 * Lo que tendrá que hacer el backend está marcado con BACKEND.
 */
import {
  EMERGENCY_ACCESS,
  PHONE_VERIFICATION,
  WHATSAPP_BOT_NUMBER,
  WHATSAPP_CODE,
  type EmergencyReasonId,
} from '@/libs/support/config';
import { publish, read, subscribe } from '@/libs/support/mock-channel';

/* ══════════ Tipos ══════════ */

export type PhoneVerificationStatus =
  | 'pending'
  | 'opened'
  | 'verifying'
  | 'verified'
  | 'failed'
  | 'expired';

export interface PhoneSessionState {
  status: PhoneVerificationStatus;
  expiresAt: number;
  technicianId: string;
  technicianName: string;
  storeSlug: string;
  storeName: string;
  /** La foto que tomó el celular, para el reporte. */
  snapshot?: string | null;
  reason?: string;
}

export interface PhoneSession {
  token: string;
  url: string;
  expiresAt: number;
}

export type WhatsappStatus = 'pending' | 'code_sent' | 'rejected' | 'expired';

export interface WhatsappState {
  status: WhatsappStatus;
  expiresAt: number;
  attempts: number;
  /** Enmascarado: el kiosko nunca ve el número completo. */
  maskedPhone?: string;
  reason?: string;
}

export interface WhatsappRequest {
  requestId: string;
  /** Corto y legible: el técnico lo tipea en su teléfono. */
  requestCode: string;
  waLink: string;
  expiresAt: number;
}

export type EmergencyStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface EmergencyState {
  status: EmergencyStatus;
  expiresAt: number;
  attempts: number;
  maskedPhone?: string;
  approvedBy?: string;
  reason?: string;
  otpExpiresAt?: number;
}

export interface EmergencyRequest {
  requestId: string;
  expiresAt: number;
}

export interface VerificationResult {
  ok: boolean;
  reason?: string;
}

/* ══════════ Utilidades ══════════ */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function randomId(prefix: string): string {
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rnd}`;
}

function randomCode(alphabet: string, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/**
 * Suscripción con vencimiento.
 *
 * El estado guardado no se "vence" solo: alguien tiene que mirar el reloj. Acá
 * lo hace un timer, y cuando haya backend lo hará él y este envoltorio se cae.
 */
function watch<T extends { status: string; expiresAt: number }>(
  key: string,
  cb: (state: T) => void,
  expiredState: (prev: T | null) => T
): () => void {
  let stopped = false;

  const emit = (state: T | null) => {
    if (stopped || !state) return;
    cb(state);
  };

  emit(read<T>(key));
  const off = subscribe<T>(key, emit);

  const timer = window.setInterval(() => {
    const current = read<T>(key);
    const done =
      current &&
      ['verified', 'failed', 'rejected', 'expired'].includes(current.status);
    if (done) return;
    if (current && Date.now() > current.expiresAt) {
      const next = expiredState(current);
      publish(key, next);
    }
  }, 1000);

  return () => {
    stopped = true;
    off();
    window.clearInterval(timer);
  };
}

/* ══════════ Interfaz ══════════ */

export interface VerificationService {
  /** BACKEND: crear un token de un solo uso y devolver la URL para el QR. */
  createPhoneVerificationSession(
    technicianId: string,
    storeSlug: string,
    meta?: { technicianName?: string; storeName?: string }
  ): Promise<PhoneSession>;
  /** BACKEND: WebSocket o polling del estado del token. */
  subscribePhoneVerification(token: string, cb: (s: PhoneSessionState) => void): () => void;
  /** BACKEND: leer el token desde el celular (valida vigencia y un solo uso). */
  getPhoneSession(token: string): Promise<PhoneSessionState | null>;
  /** BACKEND: marcar que el enlace se abrió en el celular. */
  markPhoneOpened(token: string): Promise<void>;
  /** BACKEND: cerrar la verificación con la foto tomada en el celular. */
  completePhoneVerification(token: string, snapshot: string | null): Promise<VerificationResult>;
  /** BACKEND: registrar el fallo (reto no cumplido, rostro perdido…). */
  failPhoneVerification(token: string, reason: string): Promise<void>;

  /** BACKEND: abrir la solicitud y devolver el código corto que el técnico envía al bot. */
  createWhatsappCodeRequest(technicianId: string, storeSlug: string): Promise<WhatsappRequest>;
  subscribeWhatsappCodeRequest(requestId: string, cb: (s: WhatsappState) => void): () => void;
  /** BACKEND: validar el código de 6 dígitos que mandó el bot. */
  verifyWhatsappCode(requestId: string, code: string): Promise<VerificationResult>;

  /** BACKEND: abrir la solicitud y avisarle al supervisor. */
  requestEmergencyAccess(
    technicianId: string,
    storeSlug: string,
    reason: { id: EmergencyReasonId; text?: string }
  ): Promise<EmergencyRequest>;
  subscribeEmergencyRequest(requestId: string, cb: (s: EmergencyState) => void): () => void;
  /** BACKEND: validar el OTP enviado por SMS. */
  verifyEmergencyOtp(requestId: string, otp: string): Promise<VerificationResult>;
  /** BACKEND: reenviar el SMS. */
  resendEmergencyOtp(requestId: string): Promise<void>;
  cancelEmergencyRequest(requestId: string): Promise<void>;
}

/* ══════════ Mock ══════════ */

/** Códigos de prueba. Desaparecen con el backend. */
export const MOCK_WHATSAPP_CODE = '654321';
export const MOCK_EMERGENCY_OTP = '123456';

const phoneKey = (token: string) => `phone.${token}`;
const waKey = (id: string) => `wa.${id}`;
const emKey = (id: string) => `em.${id}`;

export const mockVerificationService: VerificationService = {
  /* ── 1 · Celular con QR ── */

  async createPhoneVerificationSession(technicianId, storeSlug, meta) {
    await delay(200);
    const token = randomId('pv');
    const expiresAt = Date.now() + PHONE_VERIFICATION.ttlMs;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}${PHONE_VERIFICATION.path}?t=${encodeURIComponent(token)}`;

    publish<PhoneSessionState>(phoneKey(token), {
      status: 'pending',
      expiresAt,
      technicianId,
      technicianName: meta?.technicianName || technicianId,
      storeSlug,
      storeName: meta?.storeName || storeSlug,
    });

    return { token, url, expiresAt };
  },

  subscribePhoneVerification(token, cb) {
    return watch<PhoneSessionState>(phoneKey(token), cb, (prev) => ({
      ...(prev as PhoneSessionState),
      status: 'expired',
    }));
  },

  async getPhoneSession(token) {
    await delay(150);
    const state = read<PhoneSessionState>(phoneKey(token));
    if (!state) return null;
    // Un token vencido o ya usado no sirve, y el celular tiene que decirlo.
    if (Date.now() > state.expiresAt && state.status !== 'verified') {
      return { ...state, status: 'expired' };
    }
    return state;
  },

  async markPhoneOpened(token) {
    const state = read<PhoneSessionState>(phoneKey(token));
    if (!state || state.status !== 'pending') return;
    publish<PhoneSessionState>(phoneKey(token), { ...state, status: 'opened' });
  },

  async completePhoneVerification(token, snapshot) {
    const state = read<PhoneSessionState>(phoneKey(token));
    if (!state) return { ok: false, reason: 'Sesión no encontrada.' };
    if (state.status === 'verified') return { ok: false, reason: 'Este código ya se usó.' };
    if (Date.now() > state.expiresAt) {
      publish<PhoneSessionState>(phoneKey(token), { ...state, status: 'expired' });
      return { ok: false, reason: 'Este código ya no es válido.' };
    }

    publish<PhoneSessionState>(phoneKey(token), { ...state, status: 'verifying' });
    await delay(700);
    publish<PhoneSessionState>(phoneKey(token), { ...state, status: 'verified', snapshot });
    return { ok: true };
  },

  async failPhoneVerification(token, reason) {
    const state = read<PhoneSessionState>(phoneKey(token));
    if (!state) return;
    publish<PhoneSessionState>(phoneKey(token), { ...state, status: 'failed', reason });
  },

  /* ── 2 · WhatsApp ── */

  async createWhatsappCodeRequest(technicianId, storeSlug) {
    await delay(250);
    void technicianId;
    void storeSlug;
    const requestId = randomId('wa');
    const requestCode = randomCode(WHATSAPP_CODE.requestAlphabet, WHATSAPP_CODE.requestLength);
    const expiresAt = Date.now() + WHATSAPP_CODE.ttlMs;
    const waLink = `https://wa.me/${WHATSAPP_BOT_NUMBER}?text=${encodeURIComponent(
      `SOPORTE ${requestCode}`
    )}`;

    publish<WhatsappState>(waKey(requestId), { status: 'pending', expiresAt, attempts: 0 });
    return { requestId, requestCode, waLink, expiresAt };
  },

  subscribeWhatsappCodeRequest(requestId, cb) {
    return watch<WhatsappState>(waKey(requestId), cb, (prev) => ({
      ...(prev as WhatsappState),
      status: 'expired',
    }));
  },

  async verifyWhatsappCode(requestId, code) {
    await delay(400);
    const state = read<WhatsappState>(waKey(requestId));
    if (!state) return { ok: false, reason: 'Solicitud no encontrada.' };
    if (state.status === 'expired' || Date.now() > state.expiresAt) {
      publish<WhatsappState>(waKey(requestId), { ...state, status: 'expired' });
      return { ok: false, reason: 'La solicitud venció. Generá una nueva.' };
    }
    if (state.attempts >= WHATSAPP_CODE.maxAttempts) {
      return { ok: false, reason: 'Demasiados intentos. Generá una solicitud nueva.' };
    }

    if (code !== MOCK_WHATSAPP_CODE) {
      const attempts = state.attempts + 1;
      publish<WhatsappState>(waKey(requestId), { ...state, attempts });
      const left = WHATSAPP_CODE.maxAttempts - attempts;
      return {
        ok: false,
        reason: left > 0 ? `Código incorrecto. Te quedan ${left} intentos.` : 'Demasiados intentos.',
      };
    }
    return { ok: true };
  },

  /* ── 3 · Emergencia ── */

  async requestEmergencyAccess(technicianId, storeSlug, reason) {
    await delay(300);
    void technicianId;
    void storeSlug;
    void reason;
    const requestId = randomId('em');
    const expiresAt = Date.now() + EMERGENCY_ACCESS.requestTtlMs;
    publish<EmergencyState>(emKey(requestId), { status: 'pending', expiresAt, attempts: 0 });
    return { requestId, expiresAt };
  },

  subscribeEmergencyRequest(requestId, cb) {
    return watch<EmergencyState>(emKey(requestId), cb, (prev) => ({
      ...(prev as EmergencyState),
      status: 'expired',
    }));
  },

  async verifyEmergencyOtp(requestId, otp) {
    await delay(400);
    const state = read<EmergencyState>(emKey(requestId));
    if (!state) return { ok: false, reason: 'Solicitud no encontrada.' };
    if (state.status !== 'approved') return { ok: false, reason: 'La solicitud no está aprobada.' };
    if (state.otpExpiresAt && Date.now() > state.otpExpiresAt) {
      return { ok: false, reason: 'El código venció. Pedí uno nuevo.' };
    }
    if (state.attempts >= EMERGENCY_ACCESS.maxAttempts) {
      return { ok: false, reason: 'Demasiados intentos.' };
    }

    if (otp !== MOCK_EMERGENCY_OTP) {
      const attempts = state.attempts + 1;
      publish<EmergencyState>(emKey(requestId), { ...state, attempts });
      const left = EMERGENCY_ACCESS.maxAttempts - attempts;
      return {
        ok: false,
        reason: left > 0 ? `Código incorrecto. Te quedan ${left} intentos.` : 'Demasiados intentos.',
      };
    }
    return { ok: true };
  },

  async resendEmergencyOtp(requestId) {
    const state = read<EmergencyState>(emKey(requestId));
    if (!state) return;
    publish<EmergencyState>(emKey(requestId), {
      ...state,
      otpExpiresAt: Date.now() + EMERGENCY_ACCESS.otpTtlMs,
      attempts: 0,
    });
  },

  async cancelEmergencyRequest(requestId) {
    const state = read<EmergencyState>(emKey(requestId));
    if (!state) return;
    publish<EmergencyState>(emKey(requestId), {
      ...state,
      status: 'rejected',
      reason: 'Cancelada por el técnico.',
    });
  },
};

export const verificationService: VerificationService = mockVerificationService;

/* ══════════ Atajos de `&dev=1` ══════════
   Simulan lo que haría el backend o el supervisor. No se usan en producción. */

export const devSimulate = {
  phoneVerified(token: string, snapshot: string | null = null) {
    const state = read<PhoneSessionState>(phoneKey(token));
    if (state) publish<PhoneSessionState>(phoneKey(token), { ...state, status: 'verified', snapshot });
  },
  phoneFailed(token: string) {
    const state = read<PhoneSessionState>(phoneKey(token));
    if (state) {
      publish<PhoneSessionState>(phoneKey(token), {
        ...state,
        status: 'failed',
        reason: 'No se pudo verificar en el celular.',
      });
    }
  },
  whatsappSent(requestId: string) {
    const state = read<WhatsappState>(waKey(requestId));
    if (state) {
      publish<WhatsappState>(waKey(requestId), {
        ...state,
        status: 'code_sent',
        maskedPhone: '••••42',
      });
    }
  },
  whatsappRejected(requestId: string) {
    const state = read<WhatsappState>(waKey(requestId));
    if (state) {
      publish<WhatsappState>(waKey(requestId), {
        ...state,
        status: 'rejected',
        reason: 'Este número no está registrado como técnico.',
      });
    }
  },
  emergencyApproved(requestId: string) {
    const state = read<EmergencyState>(emKey(requestId));
    if (state) {
      publish<EmergencyState>(emKey(requestId), {
        ...state,
        status: 'approved',
        maskedPhone: '••••42',
        approvedBy: 'Supervisor demo',
        otpExpiresAt: Date.now() + EMERGENCY_ACCESS.otpTtlMs,
      });
    }
  },
  emergencyRejected(requestId: string) {
    const state = read<EmergencyState>(emKey(requestId));
    if (state) {
      publish<EmergencyState>(emKey(requestId), {
        ...state,
        status: 'rejected',
        reason: 'El supervisor no aprobó el acceso.',
      });
    }
  },
};
