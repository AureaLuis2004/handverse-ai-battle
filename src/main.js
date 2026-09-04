import './style.css'

import {
  initializeHandTracker,
  detectHands
} from './vision/handTracker.js'


// ======================================================
// 1. INTERFAZ PRINCIPAL
// ======================================================

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="app-shell">

    <section class="hero">

      <p class="eyebrow">
        ECOTEC · SISTEMAS INTELIGENTES
      </p>

      <h1>
        HANDVERSE:
        <span>AI BATTLE</span>
      </h1>

      <p class="subtitle">
        Entrena tu IA. Combate con tus manos.
      </p>

      <div class="gesture-legend">

        <div>
          <strong>✊</strong>
          <span>ATAQUE</span>
        </div>

        <div>
          <strong>🖐️</strong>
          <span>ESCUDO</span>
        </div>

        <div>
          <strong>👍</strong>
          <span>PODER</span>
        </div>

      </div>

    </section>


    <section class="camera-panel">

      <div class="camera-stage">

        <video
          id="webcam"
          autoplay
          playsinline
          muted
        ></video>

        <canvas id="overlay"></canvas>

        <div id="camera-placeholder">

          <span>📷</span>

          <p>
            Cámara preparada
          </p>

        </div>

      </div>


      <div class="camera-controls">

        <p id="camera-status">
          ● Cámara desactivada
        </p>

        <button
          id="start-camera"
          type="button"
        >
          ACTIVAR CÁMARA
        </button>

      </div>

    </section>

  </main>
`


// ======================================================
// 2. ELEMENTOS
// ======================================================

const video =
  document.querySelector('#webcam')

const canvas =
  document.querySelector('#overlay')

const context =
  canvas.getContext('2d')

const button =
  document.querySelector('#start-camera')

const status =
  document.querySelector('#camera-status')

const placeholder =
  document.querySelector('#camera-placeholder')


// ======================================================
// 3. ESTADO
// ======================================================

let handTrackerReady = false

let detectionRunning = false

let lastVideoTime = -1


// ======================================================
// 4. CONEXIONES DE LOS 21 LANDMARKS
// ======================================================

const HAND_CONNECTIONS = [

  // Pulgar
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],

  // Índice
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],

  // Dedo medio
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],

  // Anular
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],

  // Meñique
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],

  // Cierre de palma
  [0, 17]

]


// ======================================================
// 5. PREPARAR CANVAS
// ======================================================

function resizeOverlay() {

  if (
    video.videoWidth === 0 ||
    video.videoHeight === 0
  ) {
    return
  }


  canvas.width =
    video.videoWidth

  canvas.height =
    video.videoHeight

}


// ======================================================
// 6. CONVERTIR LANDMARK A POSICIÓN DE CANVAS
// ======================================================

function getCanvasPoint(landmark) {

  // El video está mostrado como espejo.
  // Por eso invertimos X para que el esqueleto
  // quede exactamente encima de la mano.

  return {

    x:
      (1 - landmark.x) *
      canvas.width,

    y:
      landmark.y *
      canvas.height

  }

}


// ======================================================
// 7. BORRAR MANO DIGITAL
// ======================================================

function clearHandOverlay() {

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  )

}


// ======================================================
// 8. DIBUJAR MANO FUTURISTA
// ======================================================

function drawHandOverlay(landmarks) {

  clearHandOverlay()


  // ----------------------------------------------------
  // Dibujar conexiones
  // ----------------------------------------------------

  context.save()

  context.lineWidth = 4

  context.lineCap =
    'round'

  context.lineJoin =
    'round'

  context.strokeStyle =
    '#22d3ee'

  context.shadowColor =
    '#22d3ee'

  context.shadowBlur = 16


  for (
    const [startIndex, endIndex]
    of HAND_CONNECTIONS
  ) {

    const start =
      getCanvasPoint(
        landmarks[startIndex]
      )

    const end =
      getCanvasPoint(
        landmarks[endIndex]
      )


    context.beginPath()

    context.moveTo(
      start.x,
      start.y
    )

    context.lineTo(
      end.x,
      end.y
    )

    context.stroke()

  }


  context.restore()


  // ----------------------------------------------------
  // Dibujar los 21 puntos
  // ----------------------------------------------------

  for (
    let index = 0;
    index < landmarks.length;
    index++
  ) {

    const point =
      getCanvasPoint(
        landmarks[index]
      )


    // Resplandor externo

    context.beginPath()

    context.arc(
      point.x,
      point.y,
      9,
      0,
      Math.PI * 2
    )

    context.fillStyle =
      'rgba(34, 211, 238, 0.25)'

    context.fill()


    // Punto principal

    context.beginPath()

    context.arc(
      point.x,
      point.y,
      5,
      0,
      Math.PI * 2
    )

    context.fillStyle =
      '#ffffff'

    context.shadowColor =
      '#22d3ee'

    context.shadowBlur = 16

    context.fill()


    // Centro tecnológico

    context.beginPath()

    context.arc(
      point.x,
      point.y,
      2,
      0,
      Math.PI * 2
    )

    context.fillStyle =
      '#22d3ee'

    context.fill()

  }


  context.shadowBlur = 0

}


// ======================================================
// 9. BUCLE DE DETECCIÓN
// ======================================================

function startHandDetection() {

  if (detectionRunning) {
    return
  }


  detectionRunning = true


  function detectFrame() {

    if (
      video.srcObject &&
      handTrackerReady &&
      video.readyState >= 2
    ) {

      try {

        // Analizamos únicamente frames nuevos

        if (
          video.currentTime !==
          lastVideoTime
        ) {

          lastVideoTime =
            video.currentTime


          const results =
            detectHands(
              video,
              performance.now()
            )


          if (
            results &&
            results.landmarks &&
            results.landmarks.length > 0
          ) {

            const landmarks =
              results.landmarks[0]


            status.textContent =
              `🖐️ Mano detectada — ${landmarks.length} puntos`


            drawHandOverlay(
              landmarks
            )


          } else {

            status.textContent =
              '👁️ Buscando una mano...'


            clearHandOverlay()

          }

        }

      } catch (error) {

        console.error(
          'Error durante la detección:',
          error
        )


        status.textContent =
          '❌ Error durante la detección'


        clearHandOverlay()

      }

    }


    requestAnimationFrame(
      detectFrame
    )

  }


  requestAnimationFrame(
    detectFrame
  )

}


// ======================================================
// 10. ACTIVAR CÁMARA
// ======================================================

async function startCamera() {

  if (
    !navigator.mediaDevices?.getUserMedia
  ) {

    status.textContent =
      '❌ Este navegador no permite usar la cámara'

    return

  }


  button.disabled = true

  button.textContent =
    'CONECTANDO...'


  status.textContent =
    '● Solicitando permiso de cámara...'


  try {

    // --------------------------------------------------
    // Obtener webcam
    // --------------------------------------------------

    const stream =
      await navigator.mediaDevices.getUserMedia({

        video: {

          width: {
            ideal: 1280
          },

          height: {
            ideal: 720
          },

          facingMode:
            'user'

        },

        audio:
          false

      })


    video.srcObject =
      stream


    await video.play()


    // --------------------------------------------------
    // Preparar canvas
    // --------------------------------------------------

    resizeOverlay()


    placeholder.style.display =
      'none'


    // --------------------------------------------------
    // Inicializar IA de visión
    // --------------------------------------------------

    status.textContent =
      '🧠 Inicializando visión artificial...'


    if (!handTrackerReady) {

      await initializeHandTracker()

      handTrackerReady =
        true

    }


    // --------------------------------------------------
    // Empezar detección
    // --------------------------------------------------

    status.textContent =
      '👁️ Buscando una mano...'


    startHandDetection()


    button.textContent =
      'CÁMARA ACTIVADA'


  } catch (error) {

    console.error(
      'Error al iniciar HANDVERSE:',
      error
    )


    if (
      error.name ===
      'NotAllowedError'
    ) {

      status.textContent =
        '❌ Permiso de cámara rechazado'


    } else if (
      error.name ===
      'NotFoundError'
    ) {

      status.textContent =
        '❌ No se encontró una cámara'


    } else if (
      error.name ===
      'NotReadableError'
    ) {

      status.textContent =
        '❌ La cámara está siendo utilizada por otra aplicación'


    } else {

      status.textContent =
        '❌ No se pudo iniciar HANDVERSE'

    }


    button.disabled =
      false


    button.textContent =
      'INTENTAR DE NUEVO'

  }

}


// ======================================================
// 11. EVENTO DEL BOTÓN
// ======================================================

button.addEventListener(
  'click',
  startCamera
)