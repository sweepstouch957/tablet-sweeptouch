'use client';

/**
 * Teclado del código de técnico.
 *
 * Replica las medidas del teclado del kiosco (teclas blancas, borde #d9d9d9,
 * radio 10, cifras grandes, acción en magenta) sin reusar aquel componente: el
 * del kiosco no está exportado y manda números de teléfono de 10 dígitos.
 */
import React from 'react';
import { FONT, INK, PINK, TOUCH } from './kit';
import { NEUTRAL } from '@/libs/brand';

interface Props {
  /** Dígitos ya tecleados. */
  value: string;
  length: number;
  onDigit: (d: string) => void;
  onBackspace: () => void;
  /** Se marca en rojo y tiembla cuando el código no es el correcto. */
  error?: boolean;
  disabled?: boolean;
}

export function Keypad4({ value, length, onDigit, onBackspace, error, disabled }: Props) {
  const key: React.CSSProperties = {
    height: TOUCH + 12,
    background: '#fff',
    border: '1px solid #d9d9d9',
    borderRadius: 10,
    fontSize: 38,
    fontWeight: 700,
    fontFamily: FONT,
    color: INK,
    cursor: disabled ? 'default' : 'pointer',
    padding: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Puntos: el código no se muestra, pero sí cuántos dígitos van. */}
      <div
        className={error ? 'support-shake' : undefined}
        style={{ display: 'flex', gap: 18 }}
      >
        {Array.from({ length }, (_, i) => {
          const filled = i < value.length;
          return (
            <span
              key={i}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: error ? '#B00020' : filled ? PINK : 'transparent',
                border: `3px solid ${error ? '#B00020' : filled ? PINK : NEUTRAL[25]}`,
                display: 'block',
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          width: 'min(420px, 100%)',
        }}
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
          <button
            key={n}
            type="button"
            style={key}
            disabled={disabled}
            onClick={() => onDigit(n)}
          >
            {n}
          </button>
        ))}
        <div />
        <button type="button" style={key} disabled={disabled} onClick={() => onDigit('0')}>
          0
        </button>
        <button
          type="button"
          style={{ ...key, color: PINK, fontSize: 16, fontWeight: 900, letterSpacing: 1 }}
          disabled={disabled}
          onClick={onBackspace}
          aria-label="Borrar"
        >
          BORRAR
        </button>
      </div>
    </div>
  );
}

export default Keypad4;
