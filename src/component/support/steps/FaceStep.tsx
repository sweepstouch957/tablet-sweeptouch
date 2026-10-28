'use client';

/**
 * Verificación biométrica en el kiosko.
 *
 * La cámara, el encuadre y la prueba de vida están en `FaceScanner`, que también
 * usa la página del celular. Acá sólo queda lo propio del kiosko: llamar a
 * `verifyFace` y ofrecer los métodos de respaldo.
 *
 * El modal NO se cierra solo en este paso: una vez aceptado el código, el
 * técnico sale con "Cancelar" y no por inactividad.
 */
import React, { useCallback, useState } from 'react';
import { isDevMode, supportService } from '@/services/support/support.service';
import type { Technician } from '@/services/support/types';
import { NEUTRAL } from '@/libs/brand';
import { FaceScanner } from '../FaceScanner';
import { FONT, PINK, StepTitle, TouchButton } from '../ui/kit';

interface Props {
  technician: Technician;
  onSuccess: (snapshot: string | null) => void;
  onCancel: () => void;
  /** Abre la pantalla con los tres métodos de respaldo. */
  onOtherMethod: () => void;
}

export function FaceStep({ technician, onSuccess, onCancel, onOtherMethod }: Props) {
  const [dev] = useState(() => isDevMode());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handlePass = useCallback(
    async (snapshot: string | null) => {
      setBusy(true);
      setError('');
      try {
        const res = await supportService.verifyFace(technician.id, snapshot);
        if (res.ok) {
          onSuccess(snapshot);
        } else {
          setError(res.reason || 'No se pudo verificar tu rostro.');
        }
      } finally {
        setBusy(false);
      }
    },
    [onSuccess, technician.id]
  );

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        width: '100%',
      }}
    >
      <StepTitle sub="Mirá a la cámara y seguí las indicaciones">Verificación facial</StepTitle>

      <FaceScanner onPass={(s) => void handlePass(s)} dev={dev} busy={busy} />

      {error && (
        <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: '#B00020' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <TouchButton variant="ghost" onClick={onCancel} disabled={busy}>
          Cancelar
        </TouchButton>
      </div>

      {/* Discreto y siempre visible: el técnico no tiene que fallar tres veces
          para enterarse de que hay otra salida. */}
      <button
        type="button"
        onClick={onOtherMethod}
        disabled={busy}
        style={{
          background: 'none',
          border: 'none',
          borderBottom: `2px solid ${NEUTRAL[25]}`,
          padding: '4px 2px',
          fontFamily: FONT,
          fontSize: 16,
          fontWeight: 700,
          color: PINK,
          cursor: busy ? 'default' : 'pointer',
        }}
      >
        Otro método
      </button>
    </div>
  );
}

export default FaceStep;
