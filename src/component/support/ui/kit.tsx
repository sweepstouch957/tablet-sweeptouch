'use client';

/**
 * Piezas comunes del modal de soporte.
 *
 * Estilos en línea como el resto del kiosco 2026: el cartel y el modal se ven
 * en la misma tablet y no deben depender del tema de MUI, que acá no se usa.
 * Los colores salen de `brand.ts`.
 *
 * Todo pensado para dedo: 64 px de alto mínimo, nada que dependa de hover.
 */
import React from 'react';
import { BRAND, MAGENTA, NEUTRAL } from '@/libs/brand';

export const FONT = 'Roboto, system-ui, -apple-system, sans-serif';
export const PINK = BRAND.magenta;
export const INK = NEUTRAL[100];

/** Alto mínimo de cualquier cosa tocable. */
export const TOUCH = 64;

export const MOTION_CSS = `
  @keyframes supportFadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
  @keyframes supportShake {
    0%,100% { transform: translateX(0) }
    20% { transform: translateX(-10px) }
    40% { transform: translateX(10px) }
    60% { transform: translateX(-6px) }
    80% { transform: translateX(6px) }
  }
  @keyframes supportScan { 0% { top: 0 } 50% { top: calc(100% - 3px) } 100% { top: 0 } }
  .support-step { animation: supportFadeIn .22s ease-out both }
  .support-shake { animation: supportShake .4s ease-in-out }
  .support-scan { position:absolute; left:0; right:0; top:0; height:3px; background:${PINK};
                  box-shadow:0 0 10px 2px rgba(252,6,128,.75); animation: supportScan 1.6s ease-in-out infinite }
  @media (prefers-reduced-motion: reduce) {
    .support-step, .support-shake, .support-scan { animation: none }
    .support-scan { top: 48% }
  }
`;

type ButtonVariant = 'primary' | 'ghost' | 'danger';

export function TouchButton({
  children,
  onClick,
  variant = 'primary',
  disabled,
  wide,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  wide?: boolean;
  style?: React.CSSProperties;
}) {
  const palette: Record<ButtonVariant, React.CSSProperties> = {
    primary: { background: PINK, color: '#fff', border: 'none' },
    ghost: { background: '#fff', color: INK, border: `2px solid ${NEUTRAL[25]}` },
    danger: { background: '#fff', color: '#B00020', border: '2px solid #B00020' },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: TOUCH,
        padding: '0 28px',
        borderRadius: 14,
        fontFamily: FONT,
        fontSize: 22,
        fontWeight: 800,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        width: wide ? '100%' : undefined,
        ...palette[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function StepTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 34, fontWeight: 900, color: INK, fontFamily: FONT }}>{children}</div>
      {sub && (
        <div style={{ fontSize: 18, color: NEUTRAL[50], marginTop: 6, fontFamily: FONT }}>{sub}</div>
      )}
    </div>
  );
}

/** Barra de tiempo restante del timeout de inactividad. */
export function TimeoutBar({ ratio }: { ratio: number }) {
  return (
    <div
      style={{ height: 6, width: '100%', background: NEUTRAL[25], borderRadius: 999, overflow: 'hidden' }}
      aria-hidden
    >
      <div
        style={{
          height: '100%',
          width: `${Math.max(0, Math.min(1, ratio)) * 100}%`,
          background: ratio < 0.3 ? '#B00020' : PINK,
          transition: 'width .2s linear',
        }}
      />
    </div>
  );
}

/** Cuadrícula de cajas 1..N. Las cajas no tienen nombre propio en el mock. */
export function RegisterGrid({
  total,
  selected,
  onToggle,
}: {
  total: number;
  selected: number[];
  onToggle: (n: number) => void;
}) {
  const columns = total > 12 ? 6 : total > 6 ? 4 : 3;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 12,
        width: '100%',
      }}
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
        const on = selected.includes(n);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onToggle(n)}
            aria-pressed={on}
            style={{
              minHeight: TOUCH + 12,
              borderRadius: 14,
              border: `3px solid ${on ? PINK : NEUTRAL[25]}`,
              background: on ? MAGENTA[10] : '#fff',
              color: on ? PINK : INK,
              fontFamily: FONT,
              fontSize: 26,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            Caja {n}
          </button>
        );
      })}
    </div>
  );
}

/** Contador +/− para equipos instalados o retirados. */
export function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const btn: React.CSSProperties = {
    width: TOUCH,
    height: TOUCH,
    borderRadius: 12,
    border: `2px solid ${NEUTRAL[25]}`,
    background: '#fff',
    fontSize: 32,
    fontWeight: 900,
    color: INK,
    cursor: 'pointer',
    fontFamily: FONT,
  };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '10px 0',
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, color: INK, fontFamily: FONT }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" style={btn} onClick={() => onChange(Math.max(0, value - 1))} aria-label={`Menos ${label}`}>
          −
        </button>
        <div
          style={{
            minWidth: 56,
            textAlign: 'center',
            fontSize: 32,
            fontWeight: 900,
            color: PINK,
            fontFamily: FONT,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </div>
        <button type="button" style={btn} onClick={() => onChange(value + 1)} aria-label={`Más ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

/** Contenedor con scroll para los pasos largos. */
export function StepBody({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="support-step"
      style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 8px', width: '100%' }}
    >
      {children}
    </div>
  );
}
