'use client';

/**
 * Método 1 — verificar con el celular.
 *
 * El kiosko abre una sesión, muestra el QUÉ escanear y se queda escuchando. La
 * verificación de verdad —la misma prueba de vida— pasa en el teléfono, en
 * `/tecnico/verificar`. Acá sólo se espera y se refleja el estado.
 *
 * El token vive 2 minutos: es un enlace que abre la cámara de un técnico y no
 * tiene por qué quedar válido en el historial de nadie.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { NEUTRAL } from '@/libs/brand';
import { useCountdown } from '@/hooks/useCountdown';
import { isDevMode } from '@/services/support/support.service';
import {
  devSimulate,
  verificationService,
  type PhoneSessionState,
  type PhoneVerificationStatus,
} from '@/services/support/verification.service';
import type { Technician } from '@/services/support/types';
import { FONT, INK, PINK, StepBody, StepTitle, TouchButton } from '../ui/kit';

const STATUS_LABEL: Record<PhoneVerificationStatus, string> = {
  pending: 'Esperando que escanees el código…',
  opened: 'Abierto en el celular…',
  verifying: 'Verificando tu rostro…',
  verified: 'Verificado',
  failed: 'No se pudo verificar en el celular.',
  expired: 'El código venció.',
};

interface Props {
  technician: Technician;
  storeSlug: string;
  storeName: string;
  onVerified: (snapshot: string | null) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function PhoneQrStep({
  technician,
  storeSlug,
  storeName,
  onVerified,
  onBack,
  onCancel,
}: Props) {
  const [dev] = useState(() => isDevMode());
  const [token, setToken] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [state, setState] = useState<PhoneSessionState | null>(null);
  const [creating, setCreating] = useState(false);

  const countdown = useCountdown(expiresAt);
  const onVerifiedRef = useRef(onVerified);
  onVerifiedRef.current = onVerified;

  const create = useCallback(async () => {
    setCreating(true);
    setState(null);
    try {
      const session = await verificationService.createPhoneVerificationSession(
        technician.id,
        storeSlug,
        { technicianName: technician.name, storeName }
      );
      setToken(session.token);
      setExpiresAt(session.expiresAt);
      setQr(
        await QRCode.toDataURL(session.url, { width: 520, margin: 1, errorCorrectionLevel: 'M' })
      );
    } finally {
      setCreating(false);
    }
  }, [storeName, storeSlug, technician.id, technician.name]);

  useEffect(() => {
    void create();
  }, [create]);

  /* Escucha del estado. Hoy es un canal entre pestañas; mañana, un WebSocket. */
  useEffect(() => {
    if (!token) return;
    return verificationService.subscribePhoneVerification(token, (next) => {
      setState(next);
      if (next.status === 'verified') onVerifiedRef.current(next.snapshot ?? null);
    });
  }, [token]);

  const status = state?.status ?? 'pending';
  const dead = status === 'expired' || countdown.expired;

  return (
    <>
      <StepTitle sub="Escaneá con tu celular y seguí los pasos">Verificar con mi celular</StepTitle>
      <StepBody>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 10 }}>
          <div
            style={{
              position: 'relative',
              padding: 14,
              borderRadius: 18,
              border: `3px solid ${dead ? NEUTRAL[25] : PINK}`,
              background: '#fff',
            }}
          >
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr}
                alt="Código QR para verificar en el celular"
                width={260}
                height={260}
                style={{ display: 'block', opacity: dead ? 0.25 : 1 }}
              />
            ) : (
              <div style={{ width: 260, height: 260 }} />
            )}
            {dead && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONT,
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#B00020',
                }}
              >
                Código vencido
              </div>
            )}
          </div>

          <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: INK, textAlign: 'center' }}>
            {dead ? STATUS_LABEL.expired : STATUS_LABEL[status]}
          </div>

          {!dead && (
            <div style={{ fontFamily: FONT, fontSize: 16, color: NEUTRAL[50] }}>
              Vence en {countdown.label}
            </div>
          )}

          {status === 'failed' && state?.reason && (
            <div style={{ fontFamily: FONT, fontSize: 16, color: '#B00020' }}>{state.reason}</div>
          )}

          {(dead || status === 'failed') && (
            <TouchButton onClick={() => void create()} disabled={creating}>
              Generar nuevo código
            </TouchButton>
          )}

          {dev && token && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <TouchButton variant="ghost" onClick={() => devSimulate.phoneVerified(token)}>
                Simular verificación en celular
              </TouchButton>
              <TouchButton variant="ghost" onClick={() => devSimulate.phoneFailed(token)}>
                Simular fallo
              </TouchButton>
            </div>
          )}
        </div>
      </StepBody>

      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <TouchButton variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
          Cancelar
        </TouchButton>
        <TouchButton variant="ghost" onClick={onBack} style={{ flex: 1 }}>
          Volver a las opciones
        </TouchButton>
      </div>
    </>
  );
}

export default PhoneQrStep;
