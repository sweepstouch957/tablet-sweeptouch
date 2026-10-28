'use client';

/**
 * Verificación del técnico desde su celular.
 *
 * Es la otra mitad del método del QR: el kiosko abre la sesión y muestra el
 * código, y acá el técnico hace la MISMA prueba de vida con la cámara de su
 * teléfono. El escáner es el mismo componente que usa el kiosko — no hay una
 * segunda implementación que calibrar.
 *
 * Diseñada para vertical y dedo: el técnico la abre de pie, en un pasillo.
 */
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BRAND, NEUTRAL } from '@/libs/brand';
import FaceScanner from '@/component/support/FaceScanner';
import { MOTION_CSS, FONT, INK, PINK, StepTitle, TouchButton } from '@/component/support/ui/kit';
import {
  verificationService,
  type PhoneSessionState,
} from '@/services/support/verification.service';

type Screen = 'loading' | 'invalid' | 'scan' | 'sending' | 'done' | 'failed';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        padding: 20,
        fontFamily: FONT,
        color: INK,
      }}
    >
      <style>{MOTION_CSS}</style>
      {children}
    </div>
  );
}

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get('t') || '';

  const [screen, setScreen] = useState<Screen>('loading');
  const [session, setSession] = useState<PhoneSessionState | null>(null);
  const [error, setError] = useState('');
  const openedRef = useRef(false);

  /* Validación del token: vencido o ya usado, no se sigue. */
  useEffect(() => {
    if (!token) {
      setScreen('invalid');
      return;
    }
    let cancelled = false;
    (async () => {
      const state = await verificationService.getPhoneSession(token);
      if (cancelled) return;
      if (!state || state.status === 'expired' || state.status === 'verified') {
        setScreen('invalid');
        return;
      }
      setSession(state);
      setScreen('scan');
      if (!openedRef.current) {
        openedRef.current = true;
        // El kiosko muestra "Abierto en el celular…" en cuanto esto llega.
        void verificationService.markPhoneOpened(token);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handlePass = useCallback(
    async (snapshot: string | null) => {
      setScreen('sending');
      const res = await verificationService.completePhoneVerification(token, snapshot);
      if (res.ok) {
        setScreen('done');
      } else {
        setError(res.reason || 'No se pudo completar la verificación.');
        setScreen('failed');
      }
    },
    [token]
  );

  if (screen === 'loading') {
    return (
      <Shell>
        <div style={{ fontSize: 18, color: NEUTRAL[50] }}>Validando el código…</div>
      </Shell>
    );
  }

  if (screen === 'invalid') {
    return (
      <Shell>
        <StepTitle sub="Generá uno nuevo en el kiosko">Este código ya no es válido</StepTitle>
        <div style={{ fontSize: 56, color: '#B00020' }}>!</div>
      </Shell>
    );
  }

  if (screen === 'done') {
    return (
      <Shell>
        <StepTitle sub="Tu verificación quedó registrada">Listo, volvé al kiosko</StepTitle>
        <div style={{ fontSize: 76, color: PINK }}>✓</div>
      </Shell>
    );
  }

  if (screen === 'failed') {
    return (
      <Shell>
        <StepTitle sub={error}>No se pudo verificar</StepTitle>
        <TouchButton onClick={() => setScreen('scan')}>Reintentar</TouchButton>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1, color: BRAND.magenta }}>
          SOPORTE TÉCNICO
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
          {session?.technicianName}
        </div>
        <div style={{ fontSize: 15, color: NEUTRAL[50] }}>{session?.storeName}</div>
      </div>

      <FaceScanner
        onPass={(s) => void handlePass(s)}
        portrait
        busy={screen === 'sending'}
        busyLabel="Enviando al kiosko…"
      />
    </Shell>
  );
}

export default function VerificarTecnicoPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <div style={{ fontSize: 18, color: NEUTRAL[50] }}>Cargando…</div>
        </Shell>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
