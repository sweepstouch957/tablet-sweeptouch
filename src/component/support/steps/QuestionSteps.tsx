'use client';

/**
 * Los pasos de preguntas, uno por tipo de visita.
 *
 * Van juntos en un archivo porque comparten la misma forma —título, cuerpo con
 * scroll, botón de avanzar— y separarlos en seis archivos de 40 líneas sólo
 * agregaba saltos para leer el flujo completo.
 */
import React, { useMemo, useState } from 'react';
import { NEUTRAL, MAGENTA } from '@/libs/brand';
import {
  EQUIPMENT_LABEL,
  TASKS,
  type EquipmentCounts,
  type TaskId,
} from '@/services/support/types';
import { Counter, FONT, INK, PINK, RegisterGrid, StepBody, StepTitle, TouchButton, TOUCH } from '../ui/kit';

/* ── Checklist de tareas (rutina · extraordinaria) ───────────────────────── */

export function TasksStep({
  selected,
  onChange,
  onNext,
}: {
  selected: TaskId[];
  onChange: (next: TaskId[]) => void;
  onNext: () => void;
}) {
  const toggle = (id: TaskId) =>
    onChange(selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id]);

  return (
    <>
      <StepTitle sub="Marcá todo lo que aplique">¿Qué hiciste hoy?</StepTitle>
      <StepBody>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
          {TASKS.map((task) => {
            const on = selected.includes(task.id);
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => toggle(task.id)}
                aria-pressed={on}
                style={{
                  minHeight: TOUCH + 8,
                  textAlign: 'left',
                  padding: '12px 18px',
                  borderRadius: 14,
                  border: `3px solid ${on ? PINK : NEUTRAL[25]}`,
                  background: on ? MAGENTA[10] : '#fff',
                  color: on ? PINK : INK,
                  fontFamily: FONT,
                  fontSize: 20,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {task.label}
              </button>
            );
          })}
        </div>
      </StepBody>
      <TouchButton onClick={onNext} disabled={selected.length === 0} wide>
        Siguiente
      </TouchButton>
    </>
  );
}

/* ── Detalle por tarea: en qué cajas ─────────────────────────────────────── */

export function RegistersStep({
  taskId,
  index,
  total,
  registers,
  selected,
  note,
  onToggle,
  onNote,
  onNext,
  onBack,
}: {
  taskId: TaskId;
  index: number;
  total: number;
  registers: number;
  selected: number[];
  note: string;
  onToggle: (n: number) => void;
  onNote: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const label = TASKS.find((t) => t.id === taskId)?.label ?? taskId;
  const isOther = taskId === 'otro';
  const ratio = total > 0 ? (index + 1) / total : 1;

  return (
    <>
      <StepTitle sub={label}>{isOther ? '¿Qué más hiciste?' : '¿En cuáles cajas?'}</StepTitle>

      <div style={{ width: '100%', marginTop: 10 }}>
        <div style={{ height: 8, background: NEUTRAL[25], borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${ratio * 100}%`, background: PINK, transition: 'width .25s' }} />
        </div>
        <div style={{ fontFamily: FONT, fontSize: 16, color: NEUTRAL[50], marginTop: 6, textAlign: 'center' }}>
          {index + 1} de {total}
        </div>
      </div>

      <StepBody>
        <div style={{ marginTop: 16 }}>
          {isOther ? (
            <textarea
              value={note}
              onChange={(e) => onNote(e.target.value)}
              placeholder="Describí lo que hiciste"
              rows={5}
              style={{
                width: '100%',
                fontFamily: FONT,
                fontSize: 22,
                padding: 16,
                borderRadius: 14,
                border: `3px solid ${NEUTRAL[25]}`,
                color: INK,
                resize: 'none',
              }}
            />
          ) : (
            <RegisterGrid total={registers} selected={selected} onToggle={onToggle} />
          )}
        </div>
      </StepBody>

      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <TouchButton variant="ghost" onClick={onBack} style={{ flex: 1 }}>
          Atrás
        </TouchButton>
        <TouchButton onClick={onNext} style={{ flex: 2 }}>
          Siguiente
        </TouchButton>
      </div>
    </>
  );
}

/* ── Instalación ─────────────────────────────────────────────────────────── */

export function InstallStep({
  registers,
  selected,
  counts,
  onToggle,
  onCounts,
  onNext,
}: {
  registers: number;
  selected: number[];
  counts: EquipmentCounts;
  onToggle: (n: number) => void;
  onCounts: (c: EquipmentCounts) => void;
  onNext: () => void;
}) {
  return (
    <>
      <StepTitle sub="Cajas donde se instalaron tablets">Instalación</StepTitle>
      <StepBody>
        <div style={{ marginTop: 16 }}>
          <RegisterGrid total={registers} selected={selected} onToggle={onToggle} />
        </div>
        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 900, color: INK, marginBottom: 8 }}>
            Equipos instalados
          </div>
          {(Object.keys(EQUIPMENT_LABEL) as (keyof EquipmentCounts)[]).map((key) => (
            <Counter
              key={key}
              label={EQUIPMENT_LABEL[key]}
              value={counts[key]}
              onChange={(v) => onCounts({ ...counts, [key]: v })}
            />
          ))}
        </div>
      </StepBody>
      <TouchButton onClick={onNext} wide>
        Siguiente
      </TouchButton>
    </>
  );
}

/* ── Desinstalación ──────────────────────────────────────────────────────── */

export function UninstallStep({
  registers,
  selected,
  counts,
  onToggle,
  onCounts,
  onNext,
}: {
  registers: number;
  selected: number[];
  counts: EquipmentCounts;
  onToggle: (n: number) => void;
  onCounts: (c: EquipmentCounts) => void;
  onNext: () => void;
}) {
  const missing = registers - selected.length;

  return (
    <>
      <StepTitle sub="Cajas de las que se retiró la tablet">Desinstalación</StepTitle>
      <StepBody>
        <div style={{ marginTop: 16 }}>
          <RegisterGrid total={registers} selected={selected} onToggle={onToggle} />
        </div>

        {/* En una desinstalación deberían salir todas: si faltan, hay que
            explicarlo en el ticket, no acá. */}
        {missing > 0 && (
          <div
            style={{
              marginTop: 18,
              padding: '14px 18px',
              borderRadius: 14,
              background: '#FFF4E5',
              border: '2px solid #FFB74D',
              fontFamily: FONT,
              fontSize: 18,
              color: '#7A4F01',
            }}
          >
            Faltan {missing} de {registers} cajas. Deberás indicar en el ticket del panel admin qué
            pasó con las tablets faltantes.
          </div>
        )}

        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 900, color: INK, marginBottom: 8 }}>
            Equipos retirados
          </div>
          {(Object.keys(EQUIPMENT_LABEL) as (keyof EquipmentCounts)[]).map((key) => (
            <Counter
              key={key}
              label={EQUIPMENT_LABEL[key]}
              value={counts[key]}
              onChange={(v) => onCounts({ ...counts, [key]: v })}
            />
          ))}
        </div>
      </StepBody>
      <TouchButton onClick={onNext} wide>
        Siguiente
      </TouchButton>
    </>
  );
}

/* ── Reconfiguración ─────────────────────────────────────────────────────── */

export function ReconfigStep({
  allDone,
  onChange,
  onNext,
}: {
  allDone: boolean | null;
  onChange: (v: boolean) => void;
  onNext: () => void;
}) {
  return (
    <>
      <StepTitle sub="Una sola pregunta y listo">Reconfiguración</StepTitle>
      <StepBody>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: INK, marginBottom: 20 }}>
            ¿Se reconfiguraron todas?
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            <TouchButton variant={allDone === true ? 'primary' : 'ghost'} onClick={() => onChange(true)}>
              Sí, todas
            </TouchButton>
            <TouchButton variant={allDone === false ? 'primary' : 'ghost'} onClick={() => onChange(false)}>
              Parcial
            </TouchButton>
          </div>
        </div>
      </StepBody>
      <TouchButton onClick={onNext} wide>
        Siguiente
      </TouchButton>
    </>
  );
}

/* ── Utilidad para el resumen ────────────────────────────────────────────── */

export function useTaskLabels(ids: TaskId[]) {
  return useMemo(() => ids.map((id) => TASKS.find((t) => t.id === id)?.label ?? id), [ids]);
}

/** Estado local de un textarea sin perder el foco entre renders del padre. */
export function useDraft(initial: string) {
  const [value, setValue] = useState(initial);
  return { value, setValue };
}
