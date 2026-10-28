/**
 * Persistencia de la sesión del técnico en localStorage.
 *
 * El kiosco corre días enteros en una tablet y la página se puede recargar sola
 * (actualización, caída de red, pantalla que se reinicia). Sin esto, una visita
 * a mitad de camino perdía el cronómetro y las respuestas ya cargadas, y el
 * técnico tenía que empezar de nuevo.
 *
 * El snapshot del rostro NO se guarda: es una imagen de una persona y no tiene
 * por qué quedar en el disco de una tablet de tienda. Si la página se recarga,
 * la visita sigue — lo que se pierde es la foto adjunta al reporte.
 */
import type { SupportSessionData } from '@/hooks/useSupportSession';

const KEY = 'sweepstouch.support.session.v1';

/** Más que esto no es una visita: es una sesión que quedó abierta y se olvidó. */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export function loadSession(): SupportSessionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SupportSessionData;
    if (!data?.startedAt) return null;
    if (Date.now() - new Date(data.startedAt).getTime() > MAX_AGE_MS) {
      clearSession();
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function saveSession(data: SupportSessionData) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Modo privado o cuota llena: la visita sigue, sólo no sobrevive a recargas.
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nada que hacer */
  }
}
