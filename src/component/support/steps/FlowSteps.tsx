'use client';

/** Pantallas de confirmación del flujo: login, cierre, resumen y envío. */
import React, { useEffect, useRef, useState } from 'react';
import { MAGENTA, NEUTRAL } from '@/libs/brand';
import { formatElapsed, type SupportSessionData } from '@/hooks/useSupportSession';
import {
  EQUIPMENT_LABEL,
  LOGIN_METHOD_LABEL,
  TASKS,
  VISIT_TYPE_LABEL,
  type EquipmentCounts,
} from '@/services/support/types';
import { FONT, INK, PINK, StepBody, StepTitle, TimeoutBar, TouchButton } from '../ui/kit';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 20,
        padding: '12px 0',
        borderBottom: `1px solid ${NEUTRAL[25]}`,
        fontFamily: FONT,
      }}
    >
      <span style={{ fontSize: 18, color: NEUTRAL[50] }}>{label}</span>
      <span style={{ fontSize: 20, fontWeight: 800, color: INK, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

/* ── 3 · Login completado ────────────────────────────────────────────────── */

export function LoginDoneStep({
  session,
  onContinue,
}: {
  session: SupportSessionData;
  onContinue: () => void;
}) {
  return (
    <>
      <StepTitle sub="Tu visita ya está corriendo">Bienvenido</StepTitle>
      <StepBody>
        <div style={{ marginTop: 20 }}>
          <Row label="Tienda" value={session.visit.storeName} />
          <Row label="Técnico" value={session.technician.name} />
          <Row label="Tipo de visita" value={VISIT_TYPE_LABEL[session.visit.type]} />
          <Row label="Cajas en la tienda" value={session.registers} />
        </div>
        <div
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontFamily: FONT,
            fontSize: 18,
            color: NEUTRAL[50],
          }}
        >
          Al continuar, el kiosco vuelve a funcionar para los clientes y el cronómetro sigue
          corriendo en la pastilla de abajo.
        </div>
      </StepBody>
      <TouchButton onClick={onContinue} wide>
        Empezar mi soporte
      </TouchButton>
    </>
  );
}

/* ── 4 · Soporte en curso (al reabrir desde la pastilla) ────────── */

/**
 * Lo que ve el tecnico al volver al modal con la visita abierta.
 *
 * El codigo NO se pide acá: se pide recién al tocar "Terminé mi soporte", que es
 * la única acción que puede cerrar la visita. Volver a mirar el cronómetro no
 * tiene por qué costar cuatro dígitos.
 */
export function InProgressStep({
  session,
  elapsedMs,
  onBack,
  onFinish,
}: {
  session: SupportSessionData;
  elapsedMs: number;
  onBack: () => void;
  onFinish: () => void;
}) {
  return (
    <>
      <StepTitle sub={`${session.visit.storeName} · ${VISIT_TYPE_LABEL[session.visit.type]}`}>
        Soporte en curso
      </StepTitle>
      <StepBody>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 72,
              fontWeight: 900,
              color: PINK,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatElapsed(elapsedMs)}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 18, color: NEUTRAL[50], marginTop: 8 }}>
            El kiosco sigue funcionando para los clientes mientras tanto.
          </div>
        </div>
      </StepBody>
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <TouchButton variant="ghost" onClick={onBack} style={{ flex: 1 }}>
          Volver al kiosco
        </TouchButton>
        <TouchButton onClick={onFinish} style={{ flex: 1 }}>
          Terminé mi soporte
        </TouchButton>
      </div>
    </>
  );
}

/* ── 5 · ¿Ya terminaste? ─────────────────────────────────────────────────── */

export function EndAskStep({
  elapsedMs,
  onNotYet,
  onYes,
}: {
  elapsedMs: number;
  onNotYet: () => void;
  onYes: () => void;
}) {
  return (
    <>
      <StepTitle sub={`Llevás ${formatElapsed(elapsedMs)} en esta visita`}>
        ¿Ya terminaste tu soporte?
      </StepTitle>
      <StepBody>
        <div />
      </StepBody>
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <TouchButton variant="ghost" onClick={onNotYet} style={{ flex: 1 }}>
          Todavía no
        </TouchButton>
        <TouchButton onClick={onYes} style={{ flex: 1 }}>
          Sí, terminé
        </TouchButton>
      </div>
    </>
  );
}

/* ── 7 · Resumen ─────────────────────────────────────────────────────────── */

function countsText(counts: EquipmentCounts) {
  const parts = (Object.keys(EQUIPMENT_LABEL) as (keyof EquipmentCounts)[])
    .filter((k) => counts[k] > 0)
    .map((k) => `${EQUIPMENT_LABEL[k]}: ${counts[k]}`);
  return parts.length ? parts.join(' · ') : 'Ninguno';
}

export function SummaryStep({
  session,
  elapsedMs,
  onEdit,
  onConfirm,
}: {
  session: SupportSessionData;
  elapsedMs: number;
  onEdit: () => void;
  onConfirm: () => void;
}) {
  const type = session.visit.type;

  return (
    <>
      <StepTitle sub="Revisá antes de enviar">Resumen de la visita</StepTitle>
      <StepBody>
        {/* Si no entro por la camara del kiosko hay que verlo de un vistazo: un
            acceso de emergencia salta la biometria y eso se audita. */}
        {session.login.method !== 'kiosk_camera' && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 16px',
              borderRadius: 999,
              display: 'inline-block',
              background: session.login.method === 'emergency_sms' ? '#FFF4E5' : MAGENTA[10],
              border: `2px solid ${
                session.login.method === 'emergency_sms' ? '#FFB74D' : PINK
              }`,
              fontFamily: FONT,
              fontSize: 16,
              fontWeight: 900,
              color: session.login.method === 'emergency_sms' ? '#7A4F01' : PINK,
            }}
          >
            {LOGIN_METHOD_LABEL[session.login.method]}
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          <Row label="Tienda" value={session.visit.storeName} />
          <Row label="Tipo" value={VISIT_TYPE_LABEL[type]} />
          <Row label="Técnico" value={session.technician.name} />
          <Row label="Tiempo" value={formatElapsed(elapsedMs)} />
          <Row label="Verificación" value={LOGIN_METHOD_LABEL[session.login.method]} />
          {session.login.emergencyReason && (
            <Row label="Motivo de emergencia" value={session.login.emergencyReason} />
          )}
          {session.login.emergencyApprovedBy && (
            <Row label="Aprobado por" value={session.login.emergencyApprovedBy} />
          )}

          {(type === 'rutina' || type === 'extraordinaria') &&
            session.selectedTasks.map((id) => {
              const detail = session.taskDetails[id];
              const label = TASKS.find((t) => t.id === id)?.label ?? id;
              const value =
                id === 'otro'
                  ? detail?.note || '—'
                  : detail?.registers?.length
                    ? detail.registers.map((n) => `Caja ${n}`).join(', ')
                    : 'Sin cajas';
              return <Row key={id} label={label} value={value} />;
            })}

          {type === 'instalacion' && (
            <>
              <Row
                label="Cajas instaladas"
                value={
                  session.install.registers.length
                    ? session.install.registers.map((n) => `Caja ${n}`).join(', ')
                    : 'Ninguna'
                }
              />
              <Row label="Equipos instalados" value={countsText(session.install.counts)} />
            </>
          )}

          {type === 'desinstalacion' && (
            <>
              <Row
                label="Cajas desinstaladas"
                value={`${session.uninstall.registers.length} de ${session.registers}`}
              />
              <Row label="Equipos retirados" value={countsText(session.uninstall.counts)} />
            </>
          )}

          {type === 'reconfiguracion' && (
            <Row
              label="¿Se reconfiguraron todas?"
              value={
                session.reconfiguration.allDone === null
                  ? 'Sin responder'
                  : session.reconfiguration.allDone
                    ? 'Sí, todas'
                    : 'Parcial'
              }
            />
          )}
        </div>
      </StepBody>
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <TouchButton variant="ghost" onClick={onEdit} style={{ flex: 1 }}>
          Editar
        </TouchButton>
        <TouchButton onClick={onConfirm} style={{ flex: 2 }}>
          Confirmar y enviar
        </TouchButton>
      </div>
    </>
  );
}

/* ── 8 · ¿Estás seguro? ──────────────────────────────────────────────────── */

export function SureStep({
  sending,
  onNo,
  onYes,
}: {
  sending: boolean;
  onNo: () => void;
  onYes: () => void;
}) {
  return (
    <>
      <StepTitle sub="Se cierra la visita y se envía el reporte">¿Estás seguro?</StepTitle>
      <StepBody>
        <div />
      </StepBody>
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <TouchButton variant="ghost" onClick={onNo} disabled={sending} style={{ flex: 1 }}>
          No, volver
        </TouchButton>
        <TouchButton onClick={onYes} disabled={sending} style={{ flex: 1 }}>
          {sending ? 'Enviando…' : 'Sí, enviar'}
        </TouchButton>
      </div>
    </>
  );
}

/* ── Soporte registrado ──────────────────────────────────────────────────── */

/** El reporte ya se envió: nadie tiene que quedarse esperando para cerrarlo. */
const SENT_AUTOCLOSE_MS = 10_000;

export function SentStep({ totalMs, onClose }: { totalMs: number; onClose: () => void }) {
  const [remaining, setRemaining] = useState(SENT_AUTOCLOSE_MS);

  /* Por ref: si el intervalo dependiera de `onClose`, cada render del padre
     lo recrearía y la cuenta nunca llegaría a cero. */
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const deadline = Date.now() + SENT_AUTOCLOSE_MS;
    const id = window.setInterval(() => {
      const left = deadline - Date.now();
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        window.clearInterval(id);
        onCloseRef.current();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <StepTitle sub={`Tiempo total: ${formatElapsed(totalMs)}`}>Soporte registrado</StepTitle>
      <StepBody>
        <div
          style={{
            marginTop: 40,
            textAlign: 'center',
            fontSize: 80,
            color: PINK,
            fontFamily: FONT,
          }}
        >
          ✓
        </div>
      </StepBody>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TimeoutBar ratio={remaining / SENT_AUTOCLOSE_MS} />
        <div style={{ fontFamily: FONT, fontSize: 14, color: NEUTRAL[50], textAlign: 'center' }}>
          Se cierra solo en {Math.ceil(remaining / 1000)} s
        </div>
        <TouchButton onClick={onClose} wide>
          Cerrar
        </TouchButton>
      </div>
    </>
  );
}
