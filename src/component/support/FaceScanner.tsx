'use client';

/**
 * Escáner facial reusable: cámara, encuadre y prueba de vida.
 *
 * Lo usan DOS pantallas —el kiosko y la página del celular— y por eso vive
 * aparte: duplicarlo significaría calibrar dos veces los mismos umbrales y que
 * un arreglo valiera sólo para una.
 *
 * Sólo orquesta. Quién decide si el encuadre sirve es `libs/face/framing`, y si
 * hay una persona viva delante, `libs/face/liveness`. Avisa con `onPass` y deja
 * que el padre resuelva qué hacer con la foto.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { FaceLandmarker, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { CHALLENGE_LABEL, FRAMING } from '@/libs/face/config';
import {
  evaluateFraming,
  frameBrightness,
  FRAMING_MESSAGE,
  type FramingStatus,
} from '@/libs/face/framing';
import { blendshape, LivenessSession, yawDegrees, type LivenessState } from '@/libs/face/liveness';
import { loadFaceLandmarker, type Delegate } from '@/libs/face/landmarker';
import { captureSnapshot, isGoodSnapshotFrame } from '@/libs/face/snapshot';
import { NEUTRAL } from '@/libs/brand';
import { FONT, INK, PINK, TouchButton } from './ui/kit';

export type ScannerStage = 'loading' | 'framing' | 'liveness' | 'done' | 'failed' | 'error';

interface Props {
  /** Pasó la prueba: acá viene el JPEG frontal, o `null` si no se pudo capturar. */
  onPass: (snapshot: string | null) => void;
  /** Landmarks dibujados y valores en vivo para calibrar en la tablet. */
  dev?: boolean;
  /** Vertical para el celular, apaisado para el kiosko. */
  portrait?: boolean;
  /** Se muestra mientras el padre procesa el resultado. */
  busy?: boolean;
  busyLabel?: string;
}

export function FaceScanner({ onPass, dev = false, portrait = false, busy, busyLabel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const scratchRef = useRef<HTMLCanvasElement | null>(null);

  const [stage, setStage] = useState<ScannerStage>('loading');
  const [message, setMessage] = useState('Preparando la cámara…');
  const [errorText, setErrorText] = useState('');
  const [liveness, setLiveness] = useState<LivenessState | null>(null);
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const [debug, setDebug] = useState({ yaw: 0, blink: 0, smile: 0, jaw: 0, faces: 0 });

  /* Lo que cambia en cada frame vive en refs: con estado, el bucle se
     re-crearía 30 veces por segundo y la cámara se reiniciaría. */
  const stageRef = useRef<ScannerStage>('loading');
  stageRef.current = stage;
  const sessionRef = useRef<LivenessSession | null>(null);
  const okSinceRef = useRef<number | null>(null);
  const snapshotRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(-1);
  const brightnessRef = useRef<number | null>(null);
  const brightnessAtRef = useRef(0);
  const onPassRef = useRef(onPass);
  onPassRef.current = onPass;

  const startLiveness = useCallback(() => {
    sessionRef.current = new LivenessSession();
    setLiveness(sessionRef.current.update(null));
    setStage('liveness');
  }, []);

  const backToFraming = useCallback((reason?: string) => {
    sessionRef.current = null;
    okSinceRef.current = null;
    setLiveness(null);
    setStage('framing');
    if (reason) setMessage(reason);
  }, []);

  const onFrame = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) return;

    const ts = performance.now();
    // detectForVideo exige timestamps estrictamente crecientes.
    if (ts <= lastTsRef.current) return;
    lastTsRef.current = ts;

    let result: FaceLandmarkerResult | null = null;
    try {
      result = landmarker.detectForVideo(video, ts);
    } catch {
      return;
    }

    if (dev) {
      setDebug({
        yaw: yawDegrees(result) ?? 0,
        blink: Math.max(blendshape(result, 'eyeBlinkLeft'), blendshape(result, 'eyeBlinkRight')),
        smile: (blendshape(result, 'mouthSmileLeft') + blendshape(result, 'mouthSmileRight')) / 2,
        jaw: blendshape(result, 'jawOpen'),
        faces: result?.faceLandmarks?.length ?? 0,
      });
      drawLandmarks(overlayRef.current, video, result);
    }

    const stageNow = stageRef.current;

    if (stageNow === 'framing') {
      // El brillo se mide una vez por segundo: leer píxeles en cada frame cuesta.
      if (ts - brightnessAtRef.current > 1000) {
        if (!scratchRef.current) scratchRef.current = document.createElement('canvas');
        brightnessRef.current = frameBrightness(video, scratchRef.current);
        brightnessAtRef.current = ts;
      }
      const { status } = evaluateFraming(result, brightnessRef.current);
      setMessage(FRAMING_MESSAGE[status as FramingStatus]);

      if (status === 'ok') {
        if (okSinceRef.current === null) okSinceRef.current = ts;
        if (ts - okSinceRef.current >= FRAMING.holdMs) startLiveness();
      } else {
        okSinceRef.current = null;
      }
      return;
    }

    if (stageNow === 'liveness' && sessionRef.current) {
      // El mejor frame se guarda durante los retos: al terminar, la cara puede
      // estar de costado o con los ojos cerrados.
      if (!snapshotRef.current && isGoodSnapshotFrame(result)) {
        snapshotRef.current = captureSnapshot(video);
      }

      const state = sessionRef.current.update(result, ts);
      setLiveness(state);

      if (state.phase === 'passed') {
        setStage('done');
        onPassRef.current(snapshotRef.current || captureSnapshot(video));
      } else if (state.phase === 'interrupted') {
        backToFraming(state.reason);
      } else if (state.phase === 'failed') {
        setStage('failed');
        setErrorText(state.reason || 'No se pudo completar la prueba.');
      }
    }
  }, [backToFraming, dev, startLiveness]);

  /* ── Cámara + modelo ───────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch {
        if (!cancelled) {
          setStage('error');
          setErrorText('No se pudo acceder a la cámara. Revisá el permiso o el hardware.');
        }
        return;
      }

      try {
        const { landmarker, delegate: used } = await loadFaceLandmarker();
        if (cancelled) return;
        landmarkerRef.current = landmarker;
        setDelegate(used);
        setStage('framing');
        setMessage('Centra tu rostro');
      } catch {
        if (!cancelled) {
          setStage('error');
          setErrorText('No se pudo cargar el modelo de detección facial.');
        }
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      // El landmarker queda cacheado: reabrir no debe volver a bajar 4 MB.
    };
  }, []);

  /* ── Bucle ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (stage !== 'framing' && stage !== 'liveness') return;
    let active = true;
    const tick = () => {
      if (!active) return;
      onFrame();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stage, onFrame]);

  const retry = () => {
    snapshotRef.current = null;
    setErrorText('');
    backToFraming('Centra tu rostro');
  };

  const challengeText =
    liveness?.challenge && liveness.phase === 'running' ? CHALLENGE_LABEL[liveness.challenge] : null;

  const broken = stage === 'failed' || stage === 'error';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
      <div
        style={{
          position: 'relative',
          width: portrait ? 'min(420px, 92vw)' : 'min(520px, 70vw)',
          aspectRatio: portrait ? '3 / 4' : '4 / 3',
          borderRadius: 20,
          overflow: 'hidden',
          background: '#000',
          border: `3px solid ${broken ? '#B00020' : NEUTRAL[25]}`,
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            // Espejada: así el movimiento se entiende. La foto que se manda al
            // backend se des-espeja en `captureSnapshot`.
            transform: 'scaleX(-1)',
          }}
        />

        {dev && (
          <canvas
            ref={overlayRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              transform: 'scaleX(-1)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Óvalo guía: oscurece todo menos el centro. */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '52%',
            height: '78%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: `4px solid ${stage === 'liveness' ? PINK : 'rgba(255,255,255,.85)'}`,
            boxShadow: '0 0 0 2000px rgba(0,0,0,.45)',
            pointerEvents: 'none',
          }}
        />

        {busy && <div className="support-scan" />}

        {(stage === 'error' || stage === 'loading') && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,.72)',
              color: '#fff',
              fontFamily: FONT,
              fontSize: 18,
              textAlign: 'center',
              padding: 24,
            }}
          >
            {stage === 'loading' ? 'Preparando la cámara…' : errorText}
          </div>
        )}

        {dev && delegate && (
          <div
            style={{
              position: 'absolute',
              left: 8,
              top: 8,
              background: 'rgba(0,0,0,.65)',
              color: '#0f0',
              fontFamily: 'monospace',
              fontSize: 12,
              padding: '6px 8px',
              borderRadius: 6,
              lineHeight: 1.5,
            }}
          >
            <div>delegate: {delegate}</div>
            <div>faces: {debug.faces}</div>
            <div>yaw: {debug.yaw.toFixed(1)}°</div>
            <div>blink: {debug.blink.toFixed(2)}</div>
            <div>smile: {debug.smile.toFixed(2)}</div>
            <div>jaw: {debug.jaw.toFixed(2)}</div>
          </div>
        )}
      </div>

      <div style={{ minHeight: 70, textAlign: 'center' }}>
        {busy ? (
          <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: PINK }}>
            {busyLabel || 'Verificando…'}
          </div>
        ) : stage === 'liveness' && challengeText ? (
          <>
            <div style={{ fontFamily: FONT, fontSize: portrait ? 26 : 32, fontWeight: 900, color: PINK }}>
              {challengeText}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 16, color: NEUTRAL[50], marginTop: 4 }}>
              Reto {(liveness?.index ?? 0) + 1} de {liveness?.total ?? 0} ·{' '}
              {Math.ceil((liveness?.remainingMs ?? 0) / 1000)} s
            </div>
          </>
        ) : (
          <div
            style={{
              fontFamily: FONT,
              fontSize: portrait ? 20 : 26,
              fontWeight: 700,
              color: broken ? '#B00020' : INK,
            }}
          >
            {broken ? errorText : message}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {stage === 'failed' && !busy && <TouchButton onClick={retry}>Reintentar</TouchButton>}

        {/* Sin cámara no se puede continuar. El atajo existe sólo para probar el
            resto del flujo en una computadora. */}
        {dev && !busy && stage !== 'done' && (
          <TouchButton variant="ghost" onClick={() => onPassRef.current(null)}>
            Simular verificación
          </TouchButton>
        )}
      </div>
    </div>
  );
}

/** Puntos del rostro, sólo en modo desarrollo, para calibrar en la tablet. */
function drawLandmarks(
  canvas: HTMLCanvasElement | null,
  video: HTMLVideoElement,
  result: FaceLandmarkerResult | null
) {
  if (!canvas) return;
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(0,255,128,.75)';
  for (const face of result?.faceLandmarks ?? []) {
    for (const p of face) {
      ctx.fillRect(p.x * w, p.y * h, 2, 2);
    }
  }
}

export default FaceScanner;
