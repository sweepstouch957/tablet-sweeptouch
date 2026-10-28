'use client';

/**
 * Método 2 — código por WhatsApp.
 *
 * El código queda amarrado a ESTA sesión del kiosko: el técnico le manda al bot
 * un código de solicitud corto que sólo existe acá, y el bot responde con el de
 * acceso. Sin esa atadura, un código de WhatsApp serviría para entrar en
 * cualquier tienda.
 *
 * El teclado está siempre habilitado, aunque el estado todavía diga `pending`:
 * el mensaje del bot puede llegar antes que la notificación del backend, y
 * bloquear el teclado haría que el técnico se quede mirando un código que ya
 * tiene en la mano.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { NEUTRAL } from '@/libs/brand';
import { useCountdown } from '@/hooks/useCountdown';
import { formatBotNumber, WHATSAPP_CODE } from '@/libs/support/config';
import { isDevMode } from '@/services/support/support.service';
import {
  devSimulate,
  verificationService,
  type WhatsappState,
  type WhatsappStatus,
} from '@/services/support/verification.service';
import type { Technician } from '@/services/support/types';
import { Keypad4 } from '../ui/Keypad4';
import { FONT, INK, PINK, StepBody, StepTitle, TouchButton } from '../ui/kit';

const STATUS_LABEL: Record<WhatsappStatus, string> = {
  pending: 'Esperando tu mensaje…',
  code_sent: 'Te enviamos el código por WhatsApp',
  rejected: 'Este número no está registrado como técnico',
  expired: 'La solicitud venció',
};

interface Props {
  technician: Technician;
  storeSlug: string;
  onVerified: (info: { requestId: string; maskedPhone?: string }) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function WhatsappStep({ technician, storeSlug, onVerified, onBack, onCancel }: Props) {
  const [dev] = useState(() => isDevMode());
  const [requestId, setRequestId] = useState<string | null>(null);
  const [requestCode, setRequestCode] = useState('');
  const [qr, setQr] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [state, setState] = useState<WhatsappState | null>(null);
  const [digits, setDigits] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const countdown = useCountdown(expiresAt);
  const onVerifiedRef = useRef(onVerified);
  onVerifiedRef.current = onVerified;

  const create = useCallback(async () => {
    setState(null);
    setDigits('');
    setError('');
    const req = await verificationService.createWhatsappCodeRequest(technician.id, storeSlug);
    setRequestId(req.requestId);
    setRequestCode(req.requestCode);
    setExpiresAt(req.expiresAt);
    setQr(await QRCode.toDataURL(req.waLink, { width: 420, margin: 1 }));
  }, [storeSlug, technician.id]);

  useEffect(() => {
    void create();
  }, [create]);

  useEffect(() => {
    if (!requestId) return;
    return verificationService.subscribeWhatsappCodeRequest(requestId, setState);
  }, [requestId]);

  const submit = useCallback(
    async (code: string) => {
      if (!requestId) return;
      setChecking(true);
      try {
        const res = await verificationService.verifyWhatsappCode(requestId, code);
        if (res.ok) {
          onVerifiedRef.current({ requestId, maskedPhone: state?.maskedPhone });
          return;
        }
        setError(res.reason || 'Código incorrecto');
        setDigits('');
      } finally {
        setChecking(false);
      }
    },
    [requestId, state?.maskedPhone]
  );

  const addDigit = (d: string) => {
    if (checking || digits.length >= WHATSAPP_CODE.codeLength) return;
    const next = digits + d;
    setError('');
    setDigits(next);
    if (next.length === WHATSAPP_CODE.codeLength) void submit(next);
  };

  const status = state?.status ?? 'pending';
  const dead = status === 'expired' || status === 'rejected' || countdown.expired;

  return (
    <>
      <StepTitle sub="Pedile el código al bot desde tu WhatsApp">Código por WhatsApp</StepTitle>
      <StepBody>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 20,
            marginTop: 8,
            alignItems: 'start',
          }}
        >
          {/* Izquierda: qué mandar y a quién. */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {qr && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr}
                alt="QR para abrir WhatsApp con el mensaje escrito"
                width={190}
                height={190}
                style={{ display: 'block', opacity: dead ? 0.25 : 1, borderRadius: 12 }}
              />
            )}
            <div style={{ fontFamily: FONT, fontSize: 15, color: NEUTRAL[50], textAlign: 'center' }}>
              Enviá este mensaje al WhatsApp
              <br />
              <b style={{ color: INK }}>{formatBotNumber()}</b>
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: 3,
                color: PINK,
                border: `3px dashed ${dead ? NEUTRAL[25] : PINK}`,
                borderRadius: 12,
                padding: '8px 16px',
              }}
            >
              SOPORTE {requestCode}
            </div>
            {!dead && (
              <div style={{ fontFamily: FONT, fontSize: 15, color: NEUTRAL[50] }}>
                Vence en {countdown.label}
              </div>
            )}
          </div>

          {/* Derecha: el código que responde el bot. */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 17,
                fontWeight: 700,
                color: status === 'rejected' ? '#B00020' : INK,
                textAlign: 'center',
                minHeight: 46,
              }}
            >
              {dead && status !== 'rejected' ? STATUS_LABEL.expired : STATUS_LABEL[status]}
            </div>

            <Keypad4
              value={digits}
              length={WHATSAPP_CODE.codeLength}
              onDigit={addDigit}
              onBackspace={() => {
                setError('');
                setDigits((v) => v.slice(0, -1));
              }}
              error={!!error}
              disabled={checking || dead}
            />

            <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#B00020', minHeight: 22 }}>
              {error}
            </div>

            {dead && (
              <TouchButton onClick={() => void create()}>Generar nuevo código</TouchButton>
            )}
          </div>
        </div>

        {dev && requestId && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
            <TouchButton variant="ghost" onClick={() => devSimulate.whatsappSent(requestId)}>
              Simular mensaje enviado
            </TouchButton>
            <TouchButton variant="ghost" onClick={() => devSimulate.whatsappRejected(requestId)}>
              Simular número no registrado
            </TouchButton>
          </div>
        )}
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

export default WhatsappStep;
