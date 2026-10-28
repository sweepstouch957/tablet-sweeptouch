'use client';

/**
 * Método 3 — código de emergencia por SMS, con aprobación.
 *
 * Es el último recurso y la pantalla lo dice: salta la biometría por completo,
 * así que alguien tiene que autorizarlo y queda registrado quién fue.
 *
 * Tres momentos: elegir el motivo, esperar al supervisor, y el OTP.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NEUTRAL } from '@/libs/brand';
import { useCountdown, formatCountdown } from '@/hooks/useCountdown';
import {
  EMERGENCY_ACCESS,
  EMERGENCY_REASONS,
  type EmergencyReasonId,
} from '@/libs/support/config';
import { isDevMode } from '@/services/support/support.service';
import {
  devSimulate,
  verificationService,
  type EmergencyState,
} from '@/services/support/verification.service';
import type { Technician } from '@/services/support/types';
import { Keypad4 } from '../ui/Keypad4';
import { FONT, INK, PINK, StepBody, StepTitle, TouchButton, TOUCH } from '../ui/kit';

type Phase = 'reason' | 'waiting' | 'otp' | 'closed';

export interface EmergencyOutcome {
  requestId: string;
  reasonId: EmergencyReasonId;
  reasonText?: string;
  approvedBy?: string;
  maskedPhone?: string;
}

interface Props {
  technician: Technician;
  storeSlug: string;
  onVerified: (info: EmergencyOutcome) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function EmergencyStep({ technician, storeSlug, onVerified, onBack, onCancel }: Props) {
  const [dev] = useState(() => isDevMode());
  const [phase, setPhase] = useState<Phase>('reason');
  const [reasonId, setReasonId] = useState<EmergencyReasonId | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [state, setState] = useState<EmergencyState | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [waited, setWaited] = useState(0);
  const [digits, setDigits] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [resendAt, setResendAt] = useState<number | null>(null);

  const otpCountdown = useCountdown(state?.otpExpiresAt ?? null);
  const onVerifiedRef = useRef(onVerified);
  onVerifiedRef.current = onVerified;

  /* Tiempo de espera corriendo en la pantalla de aprobación. */
  useEffect(() => {
    if (phase !== 'waiting') return;
    const id = window.setInterval(() => setWaited(Date.now() - startedAt), 1000);
    return () => window.clearInterval(id);
  }, [phase, startedAt]);

  useEffect(() => {
    if (!requestId) return;
    return verificationService.subscribeEmergencyRequest(requestId, (next) => {
      setState(next);
      if (next.status === 'approved') {
        setPhase('otp');
        setResendAt(Date.now() + EMERGENCY_ACCESS.resendAfterMs);
      } else if (next.status === 'rejected' || next.status === 'expired') {
        setPhase('closed');
      }
    });
  }, [requestId]);

  const send = useCallback(async () => {
    if (!reasonId) return;
    const req = await verificationService.requestEmergencyAccess(technician.id, storeSlug, {
      id: reasonId,
      text: reasonId === 'other' ? reasonText.trim() : undefined,
    });
    setRequestId(req.requestId);
    setStartedAt(Date.now());
    setWaited(0);
    setPhase('waiting');
  }, [reasonId, reasonText, storeSlug, technician.id]);

  const submit = useCallback(
    async (otp: string) => {
      if (!requestId || !reasonId) return;
      setChecking(true);
      try {
        const res = await verificationService.verifyEmergencyOtp(requestId, otp);
        if (res.ok) {
          onVerifiedRef.current({
            requestId,
            reasonId,
            reasonText: reasonId === 'other' ? reasonText.trim() : undefined,
            approvedBy: state?.approvedBy,
            maskedPhone: state?.maskedPhone,
          });
          return;
        }
        setError(res.reason || 'Código incorrecto');
        setDigits('');
        // Tres fallos cierran la puerta: hay que pedir aprobación de nuevo.
        if ((state?.attempts ?? 0) + 1 >= EMERGENCY_ACCESS.maxAttempts) setPhase('closed');
      } finally {
        setChecking(false);
      }
    },
    [reasonId, reasonText, requestId, state?.approvedBy, state?.attempts, state?.maskedPhone]
  );

  const addDigit = (d: string) => {
    if (checking || digits.length >= EMERGENCY_ACCESS.otpLength) return;
    const next = digits + d;
    setError('');
    setDigits(next);
    if (next.length === EMERGENCY_ACCESS.otpLength) void submit(next);
  };

  const canResend = resendAt !== null && Date.now() >= resendAt;

  /* ── Motivo ───────────────────────────────────────────────────────────── */
  if (phase === 'reason') {
    return (
      <>
        <StepTitle sub="Solo si no podés verificar con el kiosko, tu celular ni WhatsApp">
          Código de emergencia
        </StepTitle>
        <StepBody>
          <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: INK, margin: '12px 0 10px' }}>
            ¿Por qué necesitás este acceso?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EMERGENCY_REASONS.map((r) => {
              const on = reasonId === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReasonId(r.id)}
                  aria-pressed={on}
                  style={{
                    minHeight: TOUCH,
                    textAlign: 'left',
                    padding: '12px 18px',
                    borderRadius: 14,
                    border: `3px solid ${on ? PINK : NEUTRAL[25]}`,
                    background: '#fff',
                    color: on ? PINK : INK,
                    fontFamily: FONT,
                    fontSize: 19,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {r.label}
                </button>
              );
            })}
            {reasonId === 'other' && (
              <textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder="Contanos qué pasó"
                rows={3}
                style={{
                  fontFamily: FONT,
                  fontSize: 19,
                  padding: 14,
                  borderRadius: 14,
                  border: `3px solid ${NEUTRAL[25]}`,
                  color: INK,
                  resize: 'none',
                }}
              />
            )}
          </div>
        </StepBody>
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <TouchButton variant="ghost" onClick={onBack} style={{ flex: 1 }}>
            Volver a las opciones
          </TouchButton>
          <TouchButton
            onClick={() => void send()}
            disabled={!reasonId || (reasonId === 'other' && !reasonText.trim())}
            style={{ flex: 1 }}
          >
            Pedir aprobación
          </TouchButton>
        </div>
      </>
    );
  }

  /* ── Esperando al supervisor ──────────────────────────────────────────── */
  if (phase === 'waiting') {
    return (
      <>
        <StepTitle sub="Le avisamos a tu supervisor">Esperando aprobación…</StepTitle>
        <StepBody>
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 56,
                fontWeight: 900,
                color: PINK,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCountdown(waited)}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 16, color: NEUTRAL[50], marginTop: 8 }}>
              La solicitud vence a los {Math.round(EMERGENCY_ACCESS.requestTtlMs / 60000)} minutos
              sin respuesta.
            </div>
          </div>

          {dev && requestId && (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
              <TouchButton variant="ghost" onClick={() => devSimulate.emergencyApproved(requestId)}>
                Simular aprobación
              </TouchButton>
              <TouchButton variant="ghost" onClick={() => devSimulate.emergencyRejected(requestId)}>
                Simular rechazo
              </TouchButton>
            </div>
          )}
        </StepBody>
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <TouchButton
            variant="danger"
            onClick={() => {
              if (requestId) void verificationService.cancelEmergencyRequest(requestId);
              onBack();
            }}
            style={{ flex: 1 }}
          >
            Cancelar solicitud
          </TouchButton>
          <TouchButton variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
            Cancelar
          </TouchButton>
        </div>
      </>
    );
  }

  /* ── Rechazo, vencimiento o intentos agotados ─────────────────────────── */
  if (phase === 'closed') {
    return (
      <>
        <StepTitle sub={state?.reason || 'La solicitud ya no está activa'}>
          No se pudo autorizar
        </StepTitle>
        <StepBody>
          <div style={{ textAlign: 'center', marginTop: 40, fontSize: 64, color: '#B00020' }}>!</div>
        </StepBody>
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <TouchButton variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
            Cancelar
          </TouchButton>
          <TouchButton onClick={onBack} style={{ flex: 1 }}>
            Volver a las opciones
          </TouchButton>
        </div>
      </>
    );
  }

  /* ── OTP ──────────────────────────────────────────────────────────────── */
  return (
    <>
      <StepTitle
        sub={`Te enviamos un código por SMS al número terminado en ${
          (state?.maskedPhone || '••••').replace(/\D/g, '') || '••'
        }`}
      >
        Ingresá el código
      </StepTitle>
      <StepBody>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <Keypad4
            value={digits}
            length={EMERGENCY_ACCESS.otpLength}
            onDigit={addDigit}
            onBackspace={() => {
              setError('');
              setDigits((v) => v.slice(0, -1));
            }}
            error={!!error}
            disabled={checking}
          />
          <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#B00020', minHeight: 22 }}>
            {error}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 15, color: NEUTRAL[50] }}>
            El código vence en {otpCountdown.label}
          </div>
          <TouchButton
            variant="ghost"
            disabled={!canResend}
            onClick={() => {
              if (!requestId) return;
              void verificationService.resendEmergencyOtp(requestId);
              setResendAt(Date.now() + EMERGENCY_ACCESS.resendAfterMs);
              setDigits('');
              setError('');
            }}
          >
            Reenviar código
          </TouchButton>
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

export default EmergencyStep;
