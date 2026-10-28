/**
 * Umbrales de la detección facial, TODOS en un solo lugar.
 *
 * Se calibran en la tablet real: con `&dev=1` la pantalla muestra los valores en
 * vivo de blendshapes y yaw encima de la cámara. Cambiar un número acá y recargar
 * es todo lo que hace falta — no hay umbrales sueltos en los componentes.
 */

export const FACE_ASSETS = {
  /** Servidos desde `public/`: la tablet puede estar sin internet externo. */
  wasmPath: '/face/wasm',
  modelPath: '/face/face_landmarker.task',
} as const;

export const FRAMING = {
  /** Qué parte del ancho del cuadro debe ocupar el rostro. */
  minFaceWidthRatio: 0.3,
  maxFaceWidthRatio: 0.6,
  /** Cuánto puede alejarse el centro del rostro del centro del óvalo, en % del cuadro. */
  maxCenterOffsetX: 0.14,
  maxCenterOffsetY: 0.16,
  /** Milisegundos seguidos de encuadre correcto para pasar a la prueba de vida. */
  holdMs: 1000,
  /** Debajo de esto se asume que falta luz y no se confía en la detección. */
  minBrightness: 45,
} as const;

export const LIVENESS = {
  /** Cuántos retos se piden, de los cinco disponibles. */
  challengeCount: 2,
  /** Tiempo máximo por reto. */
  challengeMs: 5000,

  /** Ojo cerrado / abierto (eyeBlinkLeft, eyeBlinkRight). */
  blinkClosed: 0.5,
  blinkOpen: 0.25,

  /** Sonrisa (mouthSmileLeft + mouthSmileRight, promediados). */
  smile: 0.4,
  /** Boca abierta (jawOpen). */
  jawOpen: 0.4,

  /** Giro de cabeza en grados, sacado de la matriz de transformación. */
  yawTurn: 20,
  /** Para dar el giro por terminado hay que volver a mirar de frente. */
  yawCenter: 10,

  /**
   * Continuidad del rostro durante toda la prueba.
   * `maxGapMs`: cuánto puede desaparecer antes de reiniciar.
   * `maxJumpRatio`: salto del centro entre frames, en % del ancho del cuadro.
   */
  maxGapMs: 700,
  maxJumpRatio: 0.18,

  /**
   * Anti-foto estática: una imagen impresa da landmarks casi idénticos frame a
   * frame. Se mide el movimiento promedio y si nunca supera esto, se rechaza.
   */
  minLandmarkMotion: 0.0015,
} as const;

/** Qué pide cada reto, en español y en el orden en que se dibuja. */
export const CHALLENGE_LABEL = {
  blink: 'Parpadeá',
  turnLeft: 'Girá la cabeza a tu izquierda',
  turnRight: 'Girá la cabeza a tu derecha',
  smile: 'Sonreí',
  openMouth: 'Abrí la boca',
} as const;

export type ChallengeId = keyof typeof CHALLENGE_LABEL;

export const ALL_CHALLENGES: ChallengeId[] = [
  'blink',
  'turnLeft',
  'turnRight',
  'smile',
  'openMouth',
];
