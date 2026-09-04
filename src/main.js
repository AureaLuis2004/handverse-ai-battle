import './style.css'

import {
  initializeHandTracker,
  detectHands
} from './vision/handTracker.js'


// ======================================================
// 1. INTERFAZ PRINCIPAL DE HANDVERSE
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
          <p>Cámara preparada</p>
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
// 2. ELEMENTOS DE LA INTERFAZ
// ======================================================

const video =
  document.querySelector('#webcam')

const button =
  document.querySelector('#start-camera')

const status =
  document.querySelector('#camera-status')

const placeholder =
  document.querySelector('#camera-placeholder')


// ======================================================
// 3. ESTADO DE MEDIAPIPE
// ======================================================

let handTrackerReady = false

let detectionRunning = false

let lastVideoTime = -1


// ======================================================
// 4. DETECCIÓN CONTINUA DE LA MANO
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

        // Solo analizamos cuando existe
        // un nuevo frame de video
        if (video.currentTime !== lastVideoTime) {

          lastVideoTime = video.currentTime


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


          } else {

            status.textContent =
              '👁️ Buscando una mano...'

          }

        }

      } catch (error) {

        console.error(
          'Error durante la detección de la mano:',
          error
        )

        status.textContent =
          '❌ Error durante la detección'

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
// 5. ACTIVAR WEBCAM
// ======================================================

async function startCamera() {

  // ----------------------------------------------------
  // Comprobar soporte de cámara
  // ----------------------------------------------------

  if (!navigator.mediaDevices?.getUserMedia) {

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
    // Solicitar acceso a webcam
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

          facingMode: 'user'

        },

        audio: false

      })


    // --------------------------------------------------
    // Mostrar webcam
    // --------------------------------------------------

    video.srcObject = stream

    await video.play()


    placeholder.style.display =
      'none'


    // --------------------------------------------------
    // Inicializar MediaPipe
    // --------------------------------------------------

    status.textContent =
      '🧠 Cargando modelo de visión artificial...'


    if (!handTrackerReady) {

      await initializeHandTracker()

      handTrackerReady = true

    }


    // --------------------------------------------------
    // Comenzar detección
    // --------------------------------------------------

    status.textContent =
      '👁️ Buscando una mano...'


    startHandDetection()


    // --------------------------------------------------
    // Actualizar botón
    // --------------------------------------------------

    button.textContent =
      'CÁMARA ACTIVADA'


  } catch (error) {

    console.error(
      'Error al iniciar HANDVERSE:',
      error
    )


    // --------------------------------------------------
    // Errores de permisos
    // --------------------------------------------------

    if (error.name === 'NotAllowedError') {

      status.textContent =
        '❌ Permiso de cámara rechazado'


    } else if (
      error.name === 'NotFoundError'
    ) {

      status.textContent =
        '❌ No se encontró una cámara'


    } else if (
      error.name === 'NotReadableError'
    ) {

      status.textContent =
        '❌ La cámara está siendo utilizada por otra aplicación'


    } else {

      status.textContent =
        '❌ No se pudo iniciar HANDVERSE'

    }


    button.disabled = false

    button.textContent =
      'INTENTAR DE NUEVO'

  }

}


// ======================================================
// 6. EVENTO DEL BOTÓN
// ======================================================

button.addEventListener(
  'click',
  startCamera
)