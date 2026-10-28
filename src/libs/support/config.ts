/**
 * Tiempos, intentos y datos de contacto de los métodos de respaldo.
 *
 * Todo junto a propósito: son las perillas que se van a querer mover sin leer
 * código. El número del bot NO va fijo en el código — sale de una variable de
 * entorno, porque cambia por país y no debería requerir un deploy del front.
 */

/** Número del bot de WhatsApp, en formato internacional sin signos. */
export const WHATSAPP_BOT_NUMBER =
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || '15551234567';

/** El mismo número, legible, para la instrucción en pantalla. */
export function formatBotNumber(raw = WHATSAPP_BOT_NUMBER): string {
  const d = raw.replace(/\D/g, '');
  if (d.length === 11) return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  if (d.length === 10) return `+1 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  return `+${d}`;
}

export const PHONE_VERIFICATION = {
  /** El QR vence rápido: es un enlace que abre la cámara de un técnico. */
  ttlMs: 2 * 60 * 1000,
  /** Ruta de la página que se abre en el celular. */
  path: '/tecnico/verificar',
} as const;

export const WHATSAPP_CODE = {
  /** Vida de la solicitud y del código que responde el bot. */
  ttlMs: 5 * 60 * 1000,
  codeLength: 6,
  maxAttempts: 3,
  /**
   * Alfabeto del código de solicitud: sin O/0 ni I/1/L.
   * El técnico lo lee de una pantalla y lo tipea en el teléfono.
   */
  requestAlphabet: 'ABCDEFGHJKMNPQRSTUVWXYZ23456789',
  requestLength: 4,
} as const;

export const EMERGENCY_ACCESS = {
  /** Sin respuesta del supervisor en este tiempo, la solicitud muere. */
  requestTtlMs: 15 * 60 * 1000,
  /** Vida del OTP una vez aprobado. */
  otpTtlMs: 10 * 60 * 1000,
  otpLength: 6,
  maxAttempts: 3,
  /** Antes de esto, "Reenviar código" está deshabilitado. */
  resendAfterMs: 60 * 1000,
} as const;

export type EmergencyReasonId = 'kiosk-camera' | 'phone' | 'whatsapp' | 'other';

export const EMERGENCY_REASONS: { id: EmergencyReasonId; label: string }[] = [
  { id: 'kiosk-camera', label: 'La cámara del kiosko no funciona' },
  { id: 'phone', label: 'Mi celular no tiene batería o cámara' },
  { id: 'whatsapp', label: 'No tengo WhatsApp disponible' },
  { id: 'other', label: 'Otro' },
];
