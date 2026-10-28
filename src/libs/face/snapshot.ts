/**
 * Captura del frame que se manda a `verifyFace`.
 *
 * Es la imagen que el backend va a comparar contra el rostro registrado del
 * técnico, así que se guarda el cuadro frontal y no uno cualquiera: se toma
 * cuando el rostro está centrado y con los ojos abiertos.
 *
 * Se des-espeja a propósito. La vista previa va espejada porque así se entiende
 * el movimiento, pero una foto espejada contra una registrada de frente es una
 * comparación peor.
 */
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { LIVENESS } from './config';
import { blendshape, yawDegrees } from './liveness';

/** Lado máximo del JPEG. Suficiente para comparar, liviano para subir. */
const MAX_SIDE = 640;
const QUALITY = 0.85;

/** ¿Este frame sirve como foto? De frente y con los ojos abiertos. */
export function isGoodSnapshotFrame(result: FaceLandmarkerResult | null): boolean {
  const faces = result?.faceLandmarks ?? [];
  if (faces.length !== 1) return false;

  const yaw = yawDegrees(result);
  if (yaw !== null && Math.abs(yaw) > LIVENESS.yawCenter) return false;

  const blink = Math.max(
    blendshape(result, 'eyeBlinkLeft'),
    blendshape(result, 'eyeBlinkRight')
  );
  return blink < LIVENESS.blinkOpen;
}

/** JPEG en dataURL del cuadro actual, o `null` si el video todavía no da. */
export function captureSnapshot(video: HTMLVideoElement): string | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const scale = Math.min(1, MAX_SIDE / Math.max(vw, vh));
  const w = Math.round(vw * scale);
  const h = Math.round(vh * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Des-espejado: la vista previa está volteada, la foto no debe estarlo.
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, w, h);

  try {
    return canvas.toDataURL('image/jpeg', QUALITY);
  } catch {
    return null;
  }
}
