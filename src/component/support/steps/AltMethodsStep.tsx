'use client';

/**
 * Las tres salidas cuando la cámara del kiosko no sirve.
 *
 * El orden es la recomendación: el celular primero porque conserva la prueba de
 * vida real; la emergencia al final y más apagada, porque salta la biometría y
 * deja un rastro que alguien tiene que aprobar.
 */
import React from 'react';
import { MAGENTA, NEUTRAL } from '@/libs/brand';
import { FONT, INK, PINK, StepBody, StepTitle, TouchButton, TOUCH } from '../ui/kit';

export type BackupMethod = 'phone' | 'whatsapp' | 'emergency';

function MethodButton({
  title,
  detail,
  tone,
  onClick,
}: {
  title: string;
  detail: string;
  tone: 'primary' | 'normal' | 'quiet';
  onClick: () => void;
}) {
  const border = tone === 'primary' ? PINK : NEUTRAL[25];
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: TOUCH + 24,
        width: '100%',
        textAlign: 'left',
        padding: '16px 22px',
        borderRadius: 16,
        border: `3px solid ${border}`,
        background: tone === 'primary' ? MAGENTA[10] : '#fff',
        cursor: 'pointer',
        opacity: tone === 'quiet' ? 0.82 : 1,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: tone === 'primary' ? 24 : 20,
          fontWeight: 900,
          color: tone === 'primary' ? PINK : INK,
        }}
      >
        {title}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 15, color: NEUTRAL[50], marginTop: 4 }}>
        {detail}
      </div>
    </button>
  );
}

export function AltMethodsStep({
  onPick,
  onBack,
}: {
  onPick: (method: BackupMethod) => void;
  onBack: () => void;
}) {
  return (
    <>
      <StepTitle sub="Elegí cómo querés verificarte">Otro método</StepTitle>
      <StepBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <MethodButton
            tone="primary"
            title="Verificar con mi celular"
            detail="Escaneás un QR y hacés la verificación facial en tu teléfono."
            onClick={() => onPick('phone')}
          />
          <MethodButton
            tone="normal"
            title="Pedir código por WhatsApp"
            detail="Le escribís al bot y te responde con un código de 6 dígitos."
            onClick={() => onPick('whatsapp')}
          />
          <MethodButton
            tone="quiet"
            title="Pedir código de emergencia"
            detail="Solo si no podés verificar con el kiosko, tu celular ni WhatsApp. Necesita aprobación de un supervisor."
            onClick={() => onPick('emergency')}
          />
        </div>
      </StepBody>
      <TouchButton variant="ghost" onClick={onBack} wide>
        Volver a la cámara del kiosko
      </TouchButton>
    </>
  );
}

export default AltMethodsStep;
