'use client';

/**
 * Modal de soporte técnico: pantalla completa, por encima del kiosco.
 *
 * Va montado FUERA del `<Frame>` del kiosco, como los otros diálogos: el lienzo
 * del kiosco está escalado con `transform`, y cualquier cosa adentro se escala
 * con él. Acá "pantalla completa" tiene que ser la pantalla de verdad.
 *
 * El login (código + rostro) es estado local: no tiene sentido reanudar una
 * verificación de identidad a medias. Desde que el login termina manda
 * `useSupportSession`, que persiste el paso y las respuestas.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NEUTRAL } from '@/libs/brand';
import { formatElapsed, type SupportSessionData, type SupportStep } from '@/hooks/useSupportSession';
import { supportService } from '@/services/support/support.service';
import type {
  EquipmentCounts,
  LoginDetails,
  TaskId,
  Technician,
  Visit,
  VisitReport,
} from '@/services/support/types';
import { AltMethodsStep, type BackupMethod } from './steps/AltMethodsStep';
import { CodeStep } from './steps/CodeStep';
import { EmergencyStep, type EmergencyOutcome } from './steps/EmergencyStep';
import { PhoneQrStep } from './steps/PhoneQrStep';
import { WhatsappStep } from './steps/WhatsappStep';
import { FaceStep } from './steps/FaceStep';
import {
  EndAskStep,
  InProgressStep,
  LoginDoneStep,
  SentStep,
  SummaryStep,
  SureStep,
} from './steps/FlowSteps';
import {
  InstallStep,
  ReconfigStep,
  RegistersStep,
  TasksStep,
  UninstallStep,
} from './steps/QuestionSteps';
import { FONT, INK, MOTION_CSS, TouchButton } from './ui/kit';

/** Fases del login, previas a que exista sesión. */
type Gate =
  | 'code-in'
  | 'face'
  /** Las tres salidas cuando la camara del kiosko no sirve. */
  | 'alt-methods'
  | 'alt-phone'
  | 'alt-whatsapp'
  | 'alt-emergency'
  | 'code-out'
  | null;

interface Props {
  open: boolean;
  storeSlug: string;
  storeName: string;
  session: SupportSessionData | null;
  elapsedMs: number;
  /** De `useSupportSession`. */
  onStart: (
    technician: Technician,
    visit: Visit,
    registers: number,
    login: LoginDetails
  ) => SupportSessionData;
  onPatch: (changes: Partial<SupportSessionData>) => void;
  onGoTo: (step: SupportStep) => void;
  onEnd: () => void;
  firstQuestionStep: () => SupportStep;
  buildReport: (snapshot: string | null) => VisitReport | null;
  /** Minimizar: el modal se cierra y queda la pastilla. */
  onMinimize: () => void;
  /** Cerrar sin sesión abierta (timeout o cancelar en el código de entrada). */
  onDismiss: () => void;
}

export function SupportModal({
  open,
  storeSlug,
  storeName,
  session,
  elapsedMs,
  onStart,
  onPatch,
  onGoTo,
  onEnd,
  firstQuestionStep,
  buildReport,
  onMinimize,
  onDismiss,
}: Props) {
  /** Qué puerta de identidad hay que pasar antes de mostrar el flujo. */
  const [gate, setGate] = useState<Gate>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [sending, setSending] = useState(false);
  const snapshotRef = useRef<string | null>(null);

  /**
   * Qué puerta toca al abrir.
   *
   * La sesión se lee de un ref A PROPÓSITO. Estando en las dependencias, cada
   * cambio de la sesión —marcar una tarea, tocar una caja— volvía a correr el
   * efecto y devolvía al técnico a la pantalla del código. Esto sólo debe
   * decidirse al abrir el modal.
   */
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    if (!open) {
      setGate(null);
      return;
    }
    setGate(sessionRef.current ? null : 'code-in');
  }, [open]);

  const afterCodeIn = useCallback((tech: Technician) => {
    setTechnician(tech);
    setGate('face');
  }, []);

  /**
   * Cierre del login, venga de donde venga.
   *
   * Los cuatro metodos terminan aca: lo unico que cambia es `login`, que queda
   * en el reporte para poder auditar por donde entro cada visita.
   */
  const completeLogin = useCallback(
    async (snapshot: string | null, login: LoginDetails) => {
      if (!technician) return;
      snapshotRef.current = snapshot;
      const [visit, inventory] = await Promise.all([
        supportService.getTodayVisit(storeSlug, storeName),
        supportService.getStoreInventory(storeSlug),
      ]);
      onStart(technician, visit, inventory.registers, login);
      setGate(null);
    },
    [onStart, storeName, storeSlug, technician]
  );

  const afterCodeOut = useCallback(() => {
    setGate(null);
    onGoTo('end-ask');
  }, [onGoTo]);

  const submit = useCallback(async () => {
    const report = buildReport(snapshotRef.current);
    if (!report) return;
    setSending(true);
    try {
      await supportService.submitVisitReport(report);
      onGoTo('sent');
    } finally {
      setSending(false);
    }
  }, [buildReport, onGoTo]);

  if (!open) return null;

  /* ── Contenido ─────────────────────────────────────────────────────────── */
  let body: React.ReactNode = null;

  if (gate === 'code-in') {
    body = (
      <CodeStep
        title="Código de técnico"
        subtitle="Ingresá tu código de 4 dígitos"
        onSuccess={afterCodeIn}
        onTimeout={onDismiss}
        onCancel={onDismiss}
      />
    );
  } else if (gate === 'face' && technician) {
    body = (
      <FaceStep
        technician={technician}
        onSuccess={(shot) => void completeLogin(shot, { method: 'kiosk_camera' })}
        onCancel={onDismiss}
        onOtherMethod={() => setGate('alt-methods')}
      />
    );
  } else if (gate === 'alt-methods') {
    body = (
      <AltMethodsStep
        onPick={(m: BackupMethod) =>
          setGate(m === 'phone' ? 'alt-phone' : m === 'whatsapp' ? 'alt-whatsapp' : 'alt-emergency')
        }
        onBack={() => setGate('face')}
      />
    );
  } else if (gate === 'alt-phone' && technician) {
    body = (
      <PhoneQrStep
        technician={technician}
        storeSlug={storeSlug}
        storeName={storeName}
        onVerified={(shot) => void completeLogin(shot, { method: 'phone_qr' })}
        onBack={() => setGate('alt-methods')}
        onCancel={onDismiss}
      />
    );
  } else if (gate === 'alt-whatsapp' && technician) {
    body = (
      <WhatsappStep
        technician={technician}
        storeSlug={storeSlug}
        onVerified={(info) =>
          void completeLogin(null, {
            method: 'whatsapp_code',
            whatsappRequestId: info.requestId,
            whatsappMaskedPhone: info.maskedPhone,
          })
        }
        onBack={() => setGate('alt-methods')}
        onCancel={onDismiss}
      />
    );
  } else if (gate === 'alt-emergency' && technician) {
    body = (
      <EmergencyStep
        technician={technician}
        storeSlug={storeSlug}
        onVerified={(info: EmergencyOutcome) =>
          void completeLogin(null, {
            method: 'emergency_sms',
            emergencyRequestId: info.requestId,
            emergencyReason: info.reasonText || info.reasonId,
            emergencyApprovedBy: info.approvedBy,
          })
        }
        onBack={() => setGate('alt-methods')}
        onCancel={onDismiss}
      />
    );
  } else if (gate === 'code-out') {
    body = (
      <CodeStep
        title="Código de técnico"
        subtitle="Confirmá tu identidad para continuar"
        onSuccess={afterCodeOut}
        // Al cerrarse por inactividad vuelve a la pastilla: la visita sigue.
        onTimeout={onMinimize}
        onCancel={onMinimize}
        cancelLabel="Volver al kiosco"
      />
    );
  } else if (session) {
    body = renderStep({
      session,
      elapsedMs,
      sending,
      onPatch,
      onGoTo,
      onEnd,
      firstQuestionStep,
      onMinimize,
      submit,
      onRequestEnd: () => setGate('code-out'),
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Soporte técnico"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        background: 'rgba(0,0,0,.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <style>{MOTION_CSS}</style>
      <div
        className="support-step"
        style={{
          width: 'min(900px, 100%)',
          maxHeight: '100%',
          background: '#fff',
          borderRadius: 24,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          fontFamily: FONT,
          color: INK,
          boxShadow: '0 20px 60px rgba(0,0,0,.45)',
        }}
      >
        {/* Cabecera: sólo con sesión abierta, para no distraer durante el login. */}
        {session && !gate && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${NEUTRAL[25]}`,
              paddingBottom: 12,
            }}
          >
            <div style={{ fontSize: 16, color: NEUTRAL[50] }}>
              {session.visit.storeName} · {session.technician.name}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
              {formatElapsed(elapsedMs)}
            </div>
          </div>
        )}
        {body}
      </div>
    </div>
  );
}

/* ── Pasos con sesión abierta ────────────────────────────────────────────── */

function renderStep({
  session,
  elapsedMs,
  sending,
  onPatch,
  onGoTo,
  onEnd,
  firstQuestionStep,
  onMinimize,
  submit,
  onRequestEnd,
}: {
  session: SupportSessionData;
  elapsedMs: number;
  sending: boolean;
  onPatch: (c: Partial<SupportSessionData>) => void;
  onGoTo: (s: SupportStep) => void;
  onEnd: () => void;
  firstQuestionStep: () => SupportStep;
  onMinimize: () => void;
  submit: () => void;
  /** Pide el codigo antes de empezar el cierre de la visita. */
  onRequestEnd: () => void;
}): React.ReactNode {
  const toggleIn = (list: number[], n: number) =>
    list.includes(n) ? list.filter((x) => x !== n) : [...list, n].sort((a, b) => a - b);

  switch (session.step) {
    case 'login-done':
      return (
        <LoginDoneStep
          session={session}
          onContinue={() => {
            onPatch({ step: 'in-progress' });
            onMinimize();
          }}
        />
      );

    case 'in-progress':
      return (
        <InProgressStep
          session={session}
          elapsedMs={elapsedMs}
          onBack={onMinimize}
          onFinish={onRequestEnd}
        />
      );

    case 'end-ask':
      return (
        <EndAskStep
          elapsedMs={elapsedMs}
          onNotYet={() => {
            onPatch({ step: 'in-progress' });
            onMinimize();
          }}
          onYes={() => onGoTo(firstQuestionStep())}
        />
      );

    case 'tasks':
      return (
        <TasksStep
          selected={session.selectedTasks}
          onChange={(next) => onPatch({ selectedTasks: next })}
          onNext={() => onPatch({ step: 'registers', taskIndex: 0 })}
        />
      );

    case 'registers': {
      const taskId = session.selectedTasks[session.taskIndex];
      if (!taskId) return <div />;
      const detail = session.taskDetails[taskId] ?? { registers: [], note: '' };
      const last = session.taskIndex >= session.selectedTasks.length - 1;

      const setDetail = (changes: Partial<{ registers: number[]; note: string }>) =>
        onPatch({
          taskDetails: { ...session.taskDetails, [taskId]: { ...detail, ...changes } },
        });

      return (
        <RegistersStep
          taskId={taskId as TaskId}
          index={session.taskIndex}
          total={session.selectedTasks.length}
          registers={session.registers}
          selected={detail.registers}
          note={detail.note ?? ''}
          onToggle={(n) => setDetail({ registers: toggleIn(detail.registers, n) })}
          onNote={(v) => setDetail({ note: v })}
          onNext={() =>
            last ? onGoTo('summary') : onPatch({ taskIndex: session.taskIndex + 1 })
          }
          onBack={() =>
            session.taskIndex === 0
              ? onGoTo('tasks')
              : onPatch({ taskIndex: session.taskIndex - 1 })
          }
        />
      );
    }

    case 'install':
      return (
        <InstallStep
          registers={session.registers}
          selected={session.install.registers}
          counts={session.install.counts}
          onToggle={(n) =>
            onPatch({
              install: { ...session.install, registers: toggleIn(session.install.registers, n) },
            })
          }
          onCounts={(counts: EquipmentCounts) =>
            onPatch({ install: { ...session.install, counts } })
          }
          onNext={() => onGoTo('summary')}
        />
      );

    case 'uninstall':
      return (
        <UninstallStep
          registers={session.registers}
          selected={session.uninstall.registers}
          counts={session.uninstall.counts}
          onToggle={(n) =>
            onPatch({
              uninstall: {
                ...session.uninstall,
                registers: toggleIn(session.uninstall.registers, n),
              },
            })
          }
          onCounts={(counts: EquipmentCounts) =>
            onPatch({ uninstall: { ...session.uninstall, counts } })
          }
          onNext={() => onGoTo('summary')}
        />
      );

    case 'reconfig':
      return (
        <ReconfigStep
          allDone={session.reconfiguration.allDone}
          onChange={(v) => onPatch({ reconfiguration: { allDone: v } })}
          onNext={() => onGoTo('summary')}
        />
      );

    case 'summary':
      return (
        <SummaryStep
          session={session}
          elapsedMs={elapsedMs}
          onEdit={() => onGoTo(firstQuestionStep())}
          onConfirm={() => onGoTo('sure')}
        />
      );

    case 'sure':
      return <SureStep sending={sending} onNo={() => onGoTo('summary')} onYes={submit} />;

    case 'sent':
      return <SentStep totalMs={elapsedMs} onClose={onEnd} />;

    default:
      return (
        <TouchButton onClick={onMinimize} wide>
          Volver al kiosco
        </TouchButton>
      );
  }
}

export default SupportModal;
