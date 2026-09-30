// ============================================================
// HANDVERSE — MEDIAPIPE LAZY LOADING
// MediaPipe se descarga únicamente al activar la cámara.
// ============================================================

let FilesetResolver = null
let HandLandmarker = null

let mediaPipeModulePromise = null

let handLandmarker = null


async function loadMediaPipeVision() {

  if (!mediaPipeModulePromise) {

    mediaPipeModulePromise =
      import('@mediapipe/tasks-vision')
        .then((module) => {

          FilesetResolver =
            module.FilesetResolver

          HandLandmarker =
            module.HandLandmarker

          console.log(
            '📦 MediaPipe cargado bajo demanda ✅'
          )

          return module
        })
        .catch((error) => {

          // Permite volver a intentarlo si la carga falla.
          mediaPipeModulePromise = null

          throw error
        })
  }


  return mediaPipeModulePromise
}


export async function initializeHandTracker() {

  console.log(
    'Inicializando MediaPipe Hand Landmarker...'
  )


  await loadMediaPipeVision()


  const vision =
    await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )


  handLandmarker =
    await HandLandmarker.createFromOptions(
      vision,
      {

        baseOptions: {

          modelAssetPath:
            '/models/hand_landmarker.task',

          delegate: 'GPU'

        },

        runningMode: 'VIDEO',

        numHands: 1,

        minHandDetectionConfidence: 0.6,

        minHandPresenceConfidence: 0.6,

        minTrackingConfidence: 0.6

      }
    )


  console.log(
    'MediaPipe Hand Landmarker listo ✅'
  )


  return handLandmarker
}


export function detectHands(
  video,
  timestamp
) {

  if (!handLandmarker) {

    return null

  }


  if (
    !video ||
    video.readyState < 2
  ) {

    return null

  }


  return handLandmarker.detectForVideo(
    video,
    timestamp
  )
}