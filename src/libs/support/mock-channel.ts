/**
 * Canal entre pestañas para el mock de los métodos de respaldo.
 *
 * Sin backend no hay quién empuje un estado del celular al kiosko, así que las
 * dos pantallas hablan por `BroadcastChannel` —y por el evento `storage` de
 * localStorage como respaldo, para navegadores que no lo tengan. Abriendo la URL
 * del QR en otra pestaña del mismo navegador, el kiosko se entera de verdad.
 *
 * Esto es ANDAMIO. Cuando exista backend, `subscribe*` pasa a ser un WebSocket o
 * un polling y este archivo desaparece: las pantallas no lo conocen, sólo usan
 * las funciones del servicio.
 */

const CHANNEL = 'sweepstouch.support.verification';
/** Prefijo en localStorage: guarda el estado y además dispara el evento. */
const PREFIX = 'sweepstouch.support.v1.';

export interface ChannelMessage<T = unknown> {
  key: string;
  payload: T;
  at: number;
}

type Listener = (msg: ChannelMessage) => void;

let channel: BroadcastChannel | null = null;
const listeners = new Set<Listener>();
let wired = false;

function ensure() {
  if (wired || typeof window === 'undefined') return;
  wired = true;

  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (e) => {
      const msg = e.data as ChannelMessage;
      listeners.forEach((l) => l(msg));
    };
  }

  // `storage` sólo dispara en las OTRAS pestañas, que es justo lo que hace falta.
  window.addEventListener('storage', (e) => {
    if (!e.key?.startsWith(PREFIX) || !e.newValue) return;
    try {
      const payload = JSON.parse(e.newValue);
      listeners.forEach((l) =>
        l({ key: e.key!.slice(PREFIX.length), payload, at: Date.now() })
      );
    } catch {
      /* valor corrupto: se ignora */
    }
  });
}

/** Publica el estado de una clave: lo persiste y avisa a las demás pestañas. */
export function publish<T>(key: string, payload: T) {
  if (typeof window === 'undefined') return;
  ensure();
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(payload));
  } catch {
    /* sin storage, queda sólo el BroadcastChannel */
  }
  channel?.postMessage({ key, payload, at: Date.now() } satisfies ChannelMessage<T>);
  // En la MISMA pestaña ni `storage` ni BroadcastChannel se auto-notifican.
  listeners.forEach((l) => l({ key, payload, at: Date.now() }));
}

/** Último estado conocido de una clave, para no arrancar en blanco. */
export function read<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Escucha una clave. Devuelve la función para dejar de escuchar. */
export function subscribe<T>(key: string, cb: (payload: T) => void): () => void {
  ensure();
  const listener: Listener = (msg) => {
    if (msg.key === key) cb(msg.payload as T);
  };
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function clear(key: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* nada que hacer */
  }
}
