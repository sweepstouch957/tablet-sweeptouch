'use client';

/**
 * Cuenta regresiva hasta una fecha.
 *
 * Contra un timestamp y no sumando ticks: si la tablet suspende la pantalla o el
 * intervalo se atrasa, el tiempo que muestra sigue siendo el real.
 */
import { useEffect, useState } from 'react';

export function useCountdown(expiresAt: number | null, tickMs = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), tickMs);
    return () => window.clearInterval(id);
  }, [expiresAt, tickMs]);

  const remainingMs = expiresAt ? Math.max(0, expiresAt - now) : 0;
  return {
    remainingMs,
    expired: !!expiresAt && remainingMs <= 0,
    /** M:SS */
    label: formatCountdown(remainingMs),
  };
}

export function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
