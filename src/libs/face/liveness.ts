/**
 * Fase 2 — prueba de vida (anti-foto).
 *
 * Se le pasa un resultado del landmarker por frame y devuelve en qué estado
 * está. No toca el DOM ni la cámara: así se puede calibrar y, el día que haya
 * reconocimiento real, sustituir sin rehacer la pantalla.
 *
 * Tres barreras contra una foto puesta frente a la cámara:
 *   1. retos que una imagen impresa no puede cumplir (parpadeo, giro, gesto);
 *   2. continuidad: el mismo rostro, sin cortes, sin un segundo rostro y sin
 *      saltos bruscos — así no se puede cambiar la foto a mitad de camino;
 *   3. movimiento: una imagen estática da landmarks casi idénticos frame a
 *      frame, y eso se mide.
 */
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { ALL_CHALLENGES, LIVENESS, type ChallengeId } from './config';
import { faceBox } from './framing';

/**
 * Signo del yaw.
 *
 * La convención de ejes de la matriz de MediaPipe depende de la cámara y de si
 * la vista va espejada. Si en la tablet "girá a tu izquierda" se cumple girando
 * a la derecha, se cambia este +1 por -1 y listo. Con `&dev=1` el valor del yaw
 * se ve en vivo para decidirlo en un segundo.
 */
export const YAW_SIGN = 1;

export type LivenessPhase = 'running' | 'passed' | 'failed' | 'interrupted';

export interface LivenessState {
  phase: LivenessPhase;
  /** Reto actual (sólo en `running`). */
  challenge: ChallengeId | null;
  index: number;
  total: number;
  /** Milisegundos que quedan del reto actual. */
  remainingMs: number;
  /** Por qué falló o se interrumpió. */
  reason?: string;
}

/** Elige `count` retos distintos, en orden al azar. */
export function pickChallenges(count = LIVENESS.challengeCount): ChallengeId[] {
  const pool = [...ALL_CHALLENGES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }
  return pool.slice(0, Math.min(count, pool.length));
}

/** Valor de un blendshape por nombre, 0 si no vino. */
export function blendshape(result: FaceLandmarkerResult | null, name: string): number {
  const cats = result?.faceBlendshapes?.[0]?.categories;
  if (!cats) return 0;
  const found = cats.find((c) => c.categoryName === name);
  return found ? found.score : 0;
}

/**
 * Yaw en grados desde la matriz de transformación facial.
 *
 * `data` viene como 4x4 en orden por columnas, así que la fila 0 / columna 2 es
 * `data[8]` y la 2/2 es `data[10]`.
 */
export function yawDegrees(result: FaceLandmarkerResult | null): number | null {
  const m = result?.facialTransformationMatrixes?.[0]?.data;
  if (!m || m.length < 11) return null;
  const deg = (Math.atan2(m[8], m[10]) * 180) / Math.PI;
  return deg * YAW_SIGN;
}

/** Movimiento promedio de los landmarks entre dos frames, en unidades 0-1. */
function landmarkMotion(
  a: { x: number; y: number }[] | null,
  b: { x: number; y: number }[] | null
): number {
  if (!a || !b || a.length !== b.length || !a.length) return 0;
  let sum = 0;
  let n = 0;
  // De a 5 puntos: con 478 landmarks medirlos todos en cada frame no aporta.
  for (let i = 0; i < a.length; i += 5) {
    sum += Math.abs(a[i].x - b[i].x) + Math.abs(a[i].y - b[i].y);
    n++;
  }
  return n ? sum / n : 0;
}

interface ChallengeProgress {
  /** Parpadeo: ya se vieron los ojos cerrados. */
  sawClosed: boolean;
  /** Giro: el yaw ya pasó el umbral y falta volver al centro. */
  sawTurn: boolean;
}

export class LivenessSession {
  private challenges: ChallengeId[];
  private index = 0;
  private startedAt = 0;
  private progress: ChallengeProgress = { sawClosed: false, sawTurn: false };

  private lastSeenAt = 0;
  private lastCenter: { x: number; y: number } | null = null;
  private lastLandmarks: { x: number; y: number }[] | null = null;
  private maxMotion = 0;

  private phase: LivenessPhase = 'running';
  private reason?: string;

  constructor(challenges: ChallengeId[] = pickChallenges(), now = Date.now()) {
    this.challenges = challenges;
    this.startedAt = now;
    this.lastSeenAt = now;
  }

  get currentChallenge(): ChallengeId | null {
    return this.challenges[this.index] ?? null;
  }

  private fail(reason: string): LivenessState {
    this.phase = 'failed';
    this.reason = reason;
    return this.state(0);
  }

  private interrupt(reason: string): LivenessState {
    this.phase = 'interrupted';
    this.reason = reason;
    return this.state(0);
  }

  private state(remainingMs: number): LivenessState {
    return {
      phase: this.phase,
      challenge: this.currentChallenge,
      index: this.index,
      total: this.challenges.length,
      remainingMs,
      reason: this.reason,
    };
  }

  /** Avanza al siguiente reto, o termina. */
  private next(now: number): LivenessState {
    this.index++;
    this.progress = { sawClosed: false, sawTurn: false };
    this.startedAt = now;
    if (this.index >= this.challenges.length) {
      // Última barrera: si en toda la prueba los puntos nunca se movieron, esto
      // no fue una cara — fue una imagen quieta que por casualidad pasó algún
      // umbral de blendshape.
      if (this.maxMotion < LIVENESS.minLandmarkMotion) {
        return this.fail('La imagen no se movió: poné tu rostro frente a la cámara.');
      }
      this.phase = 'passed';
      return this.state(0);
    }
    return this.state(LIVENESS.challengeMs);
  }

  update(result: FaceLandmarkerResult | null, now = Date.now()): LivenessState {
    if (this.phase !== 'running') return this.state(0);

    const faces = result?.faceLandmarks ?? [];

    /* ── Continuidad ── */
    if (faces.length > 1) {
      return this.interrupt('Apareció otra persona frente a la cámara.');
    }
    if (faces.length === 0) {
      if (now - this.lastSeenAt > LIVENESS.maxGapMs) {
        return this.interrupt('Se perdió tu rostro.');
      }
      return this.state(Math.max(0, LIVENESS.challengeMs - (now - this.startedAt)));
    }

    const landmarks = faces[0];
    const box = faceBox(landmarks);
    if (box && this.lastCenter) {
      const jump = Math.hypot(box.centerX - this.lastCenter.x, box.centerY - this.lastCenter.y);
      if (jump > LIVENESS.maxJumpRatio) {
        return this.interrupt('El rostro se movió de golpe.');
      }
    }
    if (box) this.lastCenter = { x: box.centerX, y: box.centerY };
    this.lastSeenAt = now;

    /* ── Movimiento acumulado ── */
    const motion = landmarkMotion(this.lastLandmarks, landmarks);
    if (motion > this.maxMotion) this.maxMotion = motion;
    this.lastLandmarks = landmarks;

    /* ── Reto actual ── */
    const challenge = this.currentChallenge;
    if (!challenge) return this.next(now);

    const elapsed = now - this.startedAt;
    const remaining = Math.max(0, LIVENESS.challengeMs - elapsed);

    if (this.checkChallenge(challenge, result)) return this.next(now);

    if (remaining <= 0) {
      return this.fail('Se acabó el tiempo para completar el gesto.');
    }
    return this.state(remaining);
  }

  private checkChallenge(challenge: ChallengeId, result: FaceLandmarkerResult | null): boolean {
    switch (challenge) {
      case 'blink': {
        const left = blendshape(result, 'eyeBlinkLeft');
        const right = blendshape(result, 'eyeBlinkRight');
        const closed = Math.min(left, right) > LIVENESS.blinkClosed;
        const open = Math.max(left, right) < LIVENESS.blinkOpen;
        // Abierto → cerrado → abierto: sólo el cierre no alcanza, una foto con
        // los ojos cerrados pasaría.
        if (closed) this.progress.sawClosed = true;
        return this.progress.sawClosed && open;
      }
      case 'turnLeft':
      case 'turnRight': {
        const yaw = yawDegrees(result);
        if (yaw === null) return false;
        const signed = challenge === 'turnLeft' ? yaw : -yaw;
        if (signed > LIVENESS.yawTurn) this.progress.sawTurn = true;
        // Volver al frente cierra el gesto: así se ve el movimiento, no una
        // foto sostenida de costado.
        return this.progress.sawTurn && Math.abs(yaw) < LIVENESS.yawCenter;
      }
      case 'smile': {
        const smile =
          (blendshape(result, 'mouthSmileLeft') + blendshape(result, 'mouthSmileRight')) / 2;
        return smile > LIVENESS.smile;
      }
      case 'openMouth':
        return blendshape(result, 'jawOpen') > LIVENESS.jawOpen;
      default:
        return false;
    }
  }
}
