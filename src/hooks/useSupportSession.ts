'use client';

/**
 * Sesión de soporte: máquina de pasos, cronómetro y persistencia.
 *
 * El login (código + rostro) NO vive acá: no tiene sentido reanudar una
 * verificación de identidad a medias. La sesión nace cuando el login termina, y
 * desde ahí cada paso y cada respuesta se guardan, para que una recarga de la
 * página no borre una visita en curso.
 *
 * El cronómetro no cuenta ticks: se calcula contra `startedAt`. Si la tablet
 * suspende la pantalla o el intervalo se atrasa, el tiempo sigue siendo el real.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clearSession, loadSession, saveSession } from '@/libs/support/session-storage';
import type {
  EquipmentCounts,
  LoginDetails,
  TaskDetail,
  TaskId,
  Technician,
  Visit,
  VisitReport,
} from '@/services/support/types';
import { EMPTY_COUNTS } from '@/services/support/types';

/** Pasos posteriores al login. Los de login son estado local del modal. */
export type SupportStep =
  | 'login-done'
  /** Visita abierta y modal minimizado: al reabrir se ve esto, no el codigo. */
  | 'in-progress'
  | 'end-ask'
  | 'tasks'
  | 'registers'
  | 'install'
  | 'uninstall'
  | 'reconfig'
  | 'summary'
  | 'sure'
  | 'sent';

export interface SupportSessionData {
  technician: Technician;
  visit: Visit;
  /** Por donde entro. Se fija al iniciar y no cambia. */
  login: LoginDetails;
  /** Cuántas cajas tiene la tienda. Se fija al iniciar: no debe cambiar a mitad. */
  registers: number;
  startedAt: string;
  step: SupportStep;

  selectedTasks: TaskId[];
  /** Detalle por tarea. La clave es el `TaskId`. */
  taskDetails: Record<string, { registers: number[]; note?: string }>;
  /** Qué tarea se está detallando en el paso `registers`. */
  taskIndex: number;

  install: { registers: number[]; counts: EquipmentCounts };
  uninstall: { registers: number[]; counts: EquipmentCounts };
  reconfiguration: { allDone: boolean | null };
}

function newSession(
  technician: Technician,
  visit: Visit,
  registers: number,
  login: LoginDetails
): SupportSessionData {
  return {
    technician,
    visit,
    login,
    registers,
    startedAt: new Date().toISOString(),
    step: 'login-done',
    selectedTasks: [],
    taskDetails: {},
    taskIndex: 0,
    install: { registers: [], counts: { ...EMPTY_COUNTS } },
    uninstall: { registers: [], counts: { ...EMPTY_COUNTS } },
    reconfiguration: { allDone: null },
  };
}

export function useSupportSession() {
  const [session, setSession] = useState<SupportSessionData | null>(null);
  /** El reloj corre solo mientras la visita no terminó. */
  const [now, setNow] = useState(() => Date.now());
  const hydrated = useRef(false);

  /* Rehidratación: una sola vez, en el cliente. */
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = loadSession();
    if (saved) setSession(saved);
  }, []);

  /* Persistencia en cada cambio. */
  useEffect(() => {
    if (!hydrated.current) return;
    if (session) saveSession(session);
  }, [session]);

  /* Cronómetro. */
  const running = !!session && session.step !== 'sent';
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const elapsedMs = useMemo(() => {
    if (!session) return 0;
    return Math.max(0, now - new Date(session.startedAt).getTime());
  }, [session, now]);

  const patch = useCallback((changes: Partial<SupportSessionData>) => {
    setSession((s) => (s ? { ...s, ...changes } : s));
  }, []);

  const start = useCallback(
    (technician: Technician, visit: Visit, registers: number, login: LoginDetails) => {
    const fresh = newSession(technician, visit, registers, login);
      setSession(fresh);
      setNow(Date.now());
      return fresh;
    },
    []
  );

  const goTo = useCallback((step: SupportStep) => patch({ step }), [patch]);

  const end = useCallback(() => {
    setSession(null);
    clearSession();
  }, []);

  /** El primer paso de preguntas según el tipo de visita. */
  const firstQuestionStep = useCallback((): SupportStep => {
    switch (session?.visit.type) {
      case 'instalacion':
        return 'install';
      case 'desinstalacion':
        return 'uninstall';
      case 'reconfiguracion':
        return 'reconfig';
      default:
        return 'tasks';
    }
  }, [session?.visit.type]);

  /** Detalle de cada tarea marcada, en el orden del checklist. */
  const taskDetails = useCallback((): TaskDetail[] => {
    if (!session) return [];
    return session.selectedTasks.map((taskId) => ({
      taskId,
      registers: session.taskDetails[taskId]?.registers ?? [],
      note: session.taskDetails[taskId]?.note,
    }));
  }, [session]);

  /** Arma el reporte final. `snapshot` lo tiene el modal, no la sesión. */
  const buildReport = useCallback(
    (snapshot: string | null): VisitReport | null => {
      if (!session) return null;
      const endedAt = new Date();
      const startedAt = new Date(session.startedAt);
      const base: VisitReport = {
        technician: session.technician,
        store: { slug: session.visit.storeSlug, name: session.visit.storeName },
        visitType: session.visit.type,
        startedAt: session.startedAt,
        endedAt: endedAt.toISOString(),
        durationMs: Math.max(0, endedAt.getTime() - startedAt.getTime()),
        faceSnapshot: snapshot,
        login: session.login,
      };

      switch (session.visit.type) {
        case 'instalacion':
          return { ...base, install: session.install };
        case 'desinstalacion':
          return {
            ...base,
            uninstall: { ...session.uninstall, total: session.registers },
          };
        case 'reconfiguracion':
          return { ...base, reconfiguration: session.reconfiguration };
        default:
          return { ...base, tasks: taskDetails() };
      }
    },
    [session, taskDetails]
  );

  return {
    session,
    elapsedMs,
    start,
    patch,
    goTo,
    end,
    firstQuestionStep,
    taskDetails,
    buildReport,
  };
}

/** MM:SS, o HH:MM:SS si la visita pasó la hora. */
export function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
