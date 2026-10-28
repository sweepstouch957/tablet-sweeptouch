/**
 * Fase 1 — encuadre.
 *
 * Lee un resultado del landmarker y dice si hay UN rostro, centrado y a buena
 * distancia. No decide nada sobre vida: eso es `liveness.ts`.
 */
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { FRAMING } from './config';

export type FramingStatus =
  | 'ok'
  | 'noFace'
  | 'manyFaces'
  | 'tooFar'
  | 'tooClose'
  | 'offCenter'
  | 'dark';

export const FRAMING_MESSAGE: Record<FramingStatus, string> = {
  ok: 'Perfecto, no te muevas',
  noFace: 'Centra tu rostro',
  manyFaces: 'Solo una persona frente a la cámara',
  tooFar: 'Acércate',
  tooClose: 'Aléjate un poco',
  offCenter: 'Centra tu rostro',
  dark: 'Mejora la iluminación',
};

export interface FaceBox {
  /** Todo en 0-1 respecto del cuadro de video. */
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

/** Caja del rostro a partir de sus landmarks normalizados. */
export function faceBox(landmarks: { x: number; y: number }[]): FaceBox | null {
  if (!landmarks.length) return null;
  let minX = 1;
  let maxX = 0;
  let minY = 1;
  let maxY = 0;
  for (const p of landmarks) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * `brightness` es el promedio 0-255 del cuadro. Se pasa aparte porque medirlo
 * cuesta y no hace falta en cada frame.
 */
export function evaluateFraming(
  result: FaceLandmarkerResult | null,
  brightness: number | null
): { status: FramingStatus; box: FaceBox | null } {
  const faces = result?.faceLandmarks ?? [];

  if (faces.length === 0) {
    // Oscuridad y "no hay nadie" se ven igual desde acá; si además está oscuro,
    // el mensaje útil es el de la luz.
    if (brightness !== null && brightness < FRAMING.minBrightness) {
      return { status: 'dark', box: null };
    }
    return { status: 'noFace', box: null };
  }
  if (faces.length > 1) return { status: 'manyFaces', box: null };

  const box = faceBox(faces[0]);
  if (!box) return { status: 'noFace', box: null };

  if (box.width < FRAMING.minFaceWidthRatio) return { status: 'tooFar', box };
  if (box.width > FRAMING.maxFaceWidthRatio) return { status: 'tooClose', box };

  const dx = Math.abs(box.centerX - 0.5);
  const dy = Math.abs(box.centerY - 0.5);
  if (dx > FRAMING.maxCenterOffsetX || dy > FRAMING.maxCenterOffsetY) {
    return { status: 'offCenter', box };
  }

  return { status: 'ok', box };
}

/** Brillo promedio del cuadro, muestreando de a 16 px para que sea barato. */
export function frameBrightness(video: HTMLVideoElement, canvas: HTMLCanvasElement): number | null {
  const w = 64;
  const h = 48;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  try {
    ctx.drawImage(video, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return sum / (data.length / 4);
  } catch {
    return null;
  }
}
