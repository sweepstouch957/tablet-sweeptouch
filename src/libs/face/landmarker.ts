/**
 * Carga del Face Landmarker de MediaPipe.
 *
 * Delegate GPU con fallback a CPU: en algunas tablets Android el contexto WebGL
 * no está disponible y crear la tarea tira; sin el fallback la pantalla quedaba
 * muerta sin decir por qué.
 *
 * El modelo y el wasm salen de `public/`, no de un CDN: la tablet vive en la
 * tienda y puede no tener salida a internet.
 */
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { FACE_ASSETS } from './config';

export type Delegate = 'GPU' | 'CPU';

let cached: { landmarker: FaceLandmarker; delegate: Delegate } | null = null;
let loading: Promise<{ landmarker: FaceLandmarker; delegate: Delegate }> | null = null;

async function create(delegate: Delegate): Promise<FaceLandmarker> {
  const fileset = await FilesetResolver.forVisionTasks(FACE_ASSETS.wasmPath);
  return FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: FACE_ASSETS.modelPath, delegate },
    runningMode: 'VIDEO',
    // Más de uno a propósito: hay que poder DETECTAR que entró un segundo
    // rostro, no sólo quedarse con el primero.
    numFaces: 2,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  });
}

export async function loadFaceLandmarker(): Promise<{
  landmarker: FaceLandmarker;
  delegate: Delegate;
}> {
  if (cached) return cached;
  if (loading) return loading;

  loading = (async () => {
    try {
      const landmarker = await create('GPU');
      cached = { landmarker, delegate: 'GPU' };
    } catch {
      const landmarker = await create('CPU');
      cached = { landmarker, delegate: 'CPU' };
    }
    return cached;
  })();

  try {
    return await loading;
  } finally {
    loading = null;
  }
}

/** Se llama al cerrar el modal: la tarea reserva memoria del wasm. */
export function disposeFaceLandmarker() {
  cached?.landmarker.close();
  cached = null;
}
