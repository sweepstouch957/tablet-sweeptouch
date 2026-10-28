'use client';

/**
 * Código de técnico — se usa dos veces: para entrar y para cerrar la visita.
 *
 * Qué pasa al agotarse el timeout lo decide el padre (`onTimeout`): al entrar
 * cierra el modal y devuelve el kiosco a los clientes; al salir vuelve a la
 * pastilla SIN terminar la visita.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supportService } from '@/services/support/support.service';
import type { Technician } from '@/services/support/types';
import { Keypad4 } from '../ui/Keypad4';
import { StepTitle, TimeoutBar, TouchButton, FONT, INK } from '../ui/kit';
import { NEUTRAL } from '@/libs/brand';

const CODE_LENGTH = 4;
/** Sin tocar nada, el modal no puede quedarse abierto encima del kiosco. */
const TIMEOUT_MS = 10_000;
const TICK_MS = 100;

interface Props {
  title: string;
  subtitle?: string;
  onSuccess: (technician: Technician) => void;
  onTimeout: () => void;
  onCancel: () => void;
  cancelLabel?: string;
}

export function CodeStep({ title, subtitle, onSuccess, onTimeout, onCancel, cancelLabel }: Props) {
  const [digits, setDigits] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const [remaining, setRemaining] = useState(TIMEOUT_MS);

  /* El timeout se lee de un ref: el intervalo se crea una sola vez y no se
     reinicia en cada tecla, que es lo que hacía parpadear la barra. */
  const deadline = useRef(Date.now() + TIMEOUT_MS);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const bump = useCallback(() => {
    deadline.current = Date.now() + TIMEOUT_MS;
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const left = deadline.current - Date.now();
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        window.clearInterval(id);
        onTimeoutRef.current();
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const submit = useCallback(
    async (code: string) => {
      setChecking(true);
      try {
        const res = await supportService.verifyTechnicianCode(code);
        if (res.ok && res.technician) {
          onSuccess(res.technician);
          return;
        }
        setError(true);
        setDigits('');
        window.setTimeout(() => setError(false), 600);
      } finally {
        setChecking(false);
      }
    },
    [onSuccess]
  );

  const addDigit = (d: string) => {
    bump();
    if (checking || digits.length >= CODE_LENGTH) return;
    const next = digits + d;
    setError(false);
    setDigits(next);
    if (next.length === CODE_LENGTH) void submit(next);
  };

  const backspace = () => {
    bump();
    setError(false);
    setDigits((v) => v.slice(0, -1));
  };

  return (
    <div
      onPointerDown={bump}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        width: '100%',
      }}
    >
      <StepTitle sub={subtitle}>{title}</StepTitle>

      <Keypad4
        value={digits}
        length={CODE_LENGTH}
        onDigit={addDigit}
        onBackspace={backspace}
        error={error}
        disabled={checking}
      />

      <div style={{ height: 26, fontFamily: FONT, fontSize: 20, fontWeight: 700, color: '#B00020' }}>
        {error ? 'Código incorrecto' : ''}
      </div>

      <div style={{ width: 'min(420px, 100%)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TimeoutBar ratio={remaining / TIMEOUT_MS} />
        <div style={{ fontFamily: FONT, fontSize: 14, color: NEUTRAL[50], textAlign: 'center' }}>
          Se cierra solo en {Math.ceil(remaining / 1000)} s
        </div>
      </div>

      <TouchButton variant="ghost" onClick={onCancel} style={{ color: INK }}>
        {cancelLabel || 'Cancelar'}
      </TouchButton>
    </div>
  );
}

export default CodeStep;
