import {
  FilesetResolver,
  HandLandmarker
} from '@mediapipe/tasks-vision'


let handLandmarker = null


export async function initializeHandTracker() {

  console.log(
    'Inicializando MediaPipe Hand Landmarker...'
  )


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