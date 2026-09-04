import './style.css'

import {
  initializeHandTracker,
  detectHands
} from './vision/handTracker.js'

import {
  addSample,
  getSampleCount,
  getDatasetSummary,
  TARGET_SAMPLES_PER_CLASS,
  isDatasetReady,
  clearGestureSamples
} from './ai/dataset.js'

import {
  GESTURE_CLASSES
} from './ai/features.js'


// ======================================================
// HANDVERSE: AI BATTLE
// Aplicación principal
// ======================================================


// ======================================================
// 1. INTERFAZ
// ======================================================

const app =
  document.querySelector('#app')


app.innerHTML = `
  <main class="app-shell">

    <section class="hero">

      <p class="eyebrow">
        ECOTEC · SISTEMAS INTELIGENTES
      </p>

      <h1>
        HANDVERSE:
        <span>BATALLA DE IA</span>
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


    <!-- ================================================
         PANEL DE ENTRENAMIENTO
    ================================================= -->

    <section class="training-panel">

      <div class="training-header">

        <p class="training-eyebrow">
          MACHINE LEARNING LAB
        </p>

        <h2>
          ENTRENA TU IA
        </h2>

        <p>
          Enseña a HANDVERSE tus tres gestos.
        </p>

      </div>


      <div class="training-status-box">

        <span class="training-status-icon">
          🧠
        </span>

        <p id="training-status">
          Activa la cámara para comenzar.
        </p>

      </div>


      <div class="training-grid">


        <!-- MANO ABIERTA -->

        <article
          class="gesture-training-card"
          data-gesture="open_hand"
        >

          <div class="gesture-training-icon">
            🖐️
          </div>

          <h3>
            MANO ABIERTA
          </h3>

          <p class="gesture-action">
            ESCUDO
          </p>


          <div class="progress-container">

            <div class="progress-info">

              <span>
                Muestras
              </span>

              <strong class="sample-count">
                0 / 30
              </strong>

            </div>


            <div class="progress-track">

              <div
                class="progress-fill"
              ></div>

            </div>

          </div>


          <button
            class="train-button"
            data-gesture="open_hand"
            disabled
          >
            ENTRENAR
          </button>

        </article>


        <!-- PUÑO -->

        <article
          class="gesture-training-card"
          data-gesture="fist"
        >

          <div class="gesture-training-icon">
            ✊
          </div>

          <h3>
            PUÑO CERRADO
          </h3>

          <p class="gesture-action">
            ATAQUE
          </p>


          <div class="progress-container">

            <div class="progress-info">

              <span>
                Muestras
              </span>

              <strong class="sample-count">
                0 / 30
              </strong>

            </div>


            <div class="progress-track">

              <div
                class="progress-fill"
              ></div>

            </div>

          </div>


          <button
            class="train-button"
            data-gesture="fist"
            disabled
          >
            ENTRENAR
          </button>

        </article>


        <!-- PULGAR ARRIBA -->

        <article
          class="gesture-training-card"
          data-gesture="thumbs_up"
        >

          <div class="gesture-training-icon">
            👍
          </div>

          <h3>
            PULGAR ARRIBA
          </h3>

          <p class="gesture-action">
            PODER
          </p>


          <div class="progress-container">

            <div class="progress-info">

              <span>
                Muestras
              </span>

              <strong class="sample-count">
                0 / 30
              </strong>

            </div>


            <div class="progress-track">

              <div
                class="progress-fill"
              ></div>

            </div>

          </div>


          <button
            class="train-button"
            data-gesture="thumbs_up"
            disabled
          >
            ENTRENAR
          </button>

        </article>

      </div>


      <div
        id="dataset-ready"
        class="dataset-ready"
      >

        <span>
          🧠
        </span>

        <div>

          <strong>
            MODELO AÚN SIN ENTRENAR
          </strong>

          <p>
            Completa los tres gestos.
          </p>

        </div>

      </div>

    </section>

  </main>
`


// ======================================================
// 2. ELEMENTOS DE LA CÁMARA
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
  document.querySelector(
    '#camera-placeholder'
  )


// ======================================================
// 3. ELEMENTOS DEL ENTRENAMIENTO
// ======================================================

const trainingStatus =
  document.querySelector(
    '#training-status'
  )

const datasetReadyBox =
  document.querySelector(
    '#dataset-ready'
  )

const trainButtons =
  document.querySelectorAll(
    '.train-button'
  )


// ======================================================
// 4. ESTADO GENERAL
// ======================================================

let handTrackerReady = false

let detectionRunning = false

let lastVideoTime = -1

let currentLandmarks = null

let captureInProgress = false


// ======================================================
// 5. INFORMACIÓN DE LOS GESTOS
// ======================================================

const GESTURES = {

  open_hand:
    GESTURE_CLASSES.OPEN_HAND,

  fist:
    GESTURE_CLASSES.FIST,

  thumbs_up:
    GESTURE_CLASSES.THUMBS_UP

}


// ======================================================
// 6. CONEXIONES DE LA MANO
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

  // Medio
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

  // Palma
  [0, 17]

]


// ======================================================
// 7. UTILIDAD DE ESPERA
// ======================================================

function sleep(milliseconds) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milliseconds
      )
  )

}


// ======================================================
// 8. PREPARAR CANVAS
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
// 9. CONVERTIR LANDMARK AL CANVAS
// ======================================================

function getCanvasPoint(
  landmark
) {

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
// 10. LIMPIAR OVERLAY
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
// 11. DIBUJAR MANO FUTURISTA
// ======================================================

function drawHandOverlay(
  landmarks
) {

  clearHandOverlay()


  // ----------------------------------------------------
  // Líneas
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
    const [
      startIndex,
      endIndex
    ]
    of HAND_CONNECTIONS
  ) {

    const start =
      getCanvasPoint(
        landmarks[
          startIndex
        ]
      )

    const end =
      getCanvasPoint(
        landmarks[
          endIndex
        ]
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
  // 21 puntos
  // ----------------------------------------------------

  for (
    const landmark
    of landmarks
  ) {

    const point =
      getCanvasPoint(
        landmark
      )


    // Glow

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


    // Centro

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
// 12. ACTUALIZAR INTERFAZ DEL DATASET
// ======================================================

function updateTrainingUI() {

  const summary =
    getDatasetSummary()


  for (
    const gestureKey
    of Object.keys(
      GESTURES
    )
  ) {

    const card =
      document.querySelector(
        `.gesture-training-card[data-gesture="${gestureKey}"]`
      )


    if (!card) {
      continue
    }


    const count =
      getSampleCount(
        gestureKey
      )


    const countElement =
      card.querySelector(
        '.sample-count'
      )


    const progressFill =
      card.querySelector(
        '.progress-fill'
      )


    const trainButton =
      card.querySelector(
        '.train-button'
      )


    const percentage =
      Math.min(
        100,
        (
          count /
          TARGET_SAMPLES_PER_CLASS
        ) * 100
      )


    countElement.textContent =
      `${count} / ${TARGET_SAMPLES_PER_CLASS}`


    progressFill.style.width =
      `${percentage}%`


    if (
      count >=
      TARGET_SAMPLES_PER_CLASS
    ) {

      card.classList.add(
        'gesture-complete'
      )

      trainButton.textContent =
        'RECAPTURAR'

    } else {

      card.classList.remove(
        'gesture-complete'
      )

      trainButton.textContent =
        'ENTRENAR'

    }

  }


  // ----------------------------------------------------
  // Dataset completo
  // ----------------------------------------------------

  if (
    isDatasetReady()
  ) {

    datasetReadyBox.classList.add(
      'ready'
    )


    datasetReadyBox.innerHTML = `

      <span>
        ✅
      </span>

      <div>

        <strong>
          DATASET COMPLETO
        </strong>

        <p>
          ${summary.total} muestras listas para entrenar la IA.
        </p>

      </div>

    `

  } else {

    datasetReadyBox.classList.remove(
      'ready'
    )

  }

}


// ======================================================
// 13. ACTIVAR/DESACTIVAR BOTONES DE ENTRENAMIENTO
// ======================================================

function setTrainingButtonsDisabled(
  disabled
) {

  trainButtons.forEach(
    trainButton => {

      trainButton.disabled =
        disabled

    }
  )

}


// ======================================================
// 14. CAPTURA AUTOMÁTICA DE UN GESTO
// ======================================================

async function captureGesture(
  gestureKey
) {

  if (
    captureInProgress
  ) {

    return

  }


  if (
    !handTrackerReady ||
    !video.srcObject
  ) {

    trainingStatus.textContent =
      '⚠️ Primero activa la cámara.'

    return

  }


  const gesture =
    GESTURES[
      gestureKey
    ]


  if (!gesture) {

    return

  }


  // ----------------------------------------------------
  // Si ya estaba completo, permite recapturarlo
  // ----------------------------------------------------

  if (
    getSampleCount(
      gestureKey
    ) >=
    TARGET_SAMPLES_PER_CLASS
  ) {

    clearGestureSamples(
      gestureKey
    )

    updateTrainingUI()

  }


  captureInProgress =
    true


  setTrainingButtonsDisabled(
    true
  )


  // ----------------------------------------------------
  // Cuenta regresiva
  // ----------------------------------------------------

  trainingStatus.textContent =
    `${gesture.emoji} Prepárate para ${gesture.name}`


  await sleep(800)


  for (
    let number = 3;
    number >= 1;
    number--
  ) {

    trainingStatus.textContent =
      `${gesture.emoji} ${number}`

    await sleep(800)

  }


  trainingStatus.textContent =
    `🔴 CAPTURANDO ${gesture.name}... mueve ligeramente la mano`


  // ----------------------------------------------------
  // Capturar 30 muestras
  // ----------------------------------------------------

  while (
    getSampleCount(
      gestureKey
    ) <
    TARGET_SAMPLES_PER_CLASS
  ) {

    // Si MediaPipe no ve una mano,
    // no guardamos datos.

    if (
      !currentLandmarks
    ) {

      trainingStatus.textContent =
        '⚠️ No veo tu mano. Colócala frente a la cámara.'

      await sleep(150)

      continue

    }


    const added =
      addSample(
        gestureKey,
        currentLandmarks
      )


    if (added) {

      const currentCount =
        getSampleCount(
          gestureKey
        )


      trainingStatus.textContent =
        `🔴 ${gesture.emoji} Capturando ${currentCount}/${TARGET_SAMPLES_PER_CLASS}`


      updateTrainingUI()

    }


    // Dejamos pasar algunos frames para
    // no capturar exactamente la misma imagen.

    await sleep(120)

  }


  // ----------------------------------------------------
  // Finalizado
  // ----------------------------------------------------

  trainingStatus.textContent =
    `✅ ${gesture.emoji} ${gesture.name} aprendido correctamente`


  captureInProgress =
    false


  setTrainingButtonsDisabled(
    false
  )


  updateTrainingUI()


  if (
    isDatasetReady()
  ) {

    trainingStatus.textContent =
      '🧠 Dataset completo. HANDVERSE está listo para entrenar el modelo.'

  }

}


// ======================================================
// 15. BUCLE DE VISIÓN ARTIFICIAL
// ======================================================

function startHandDetection() {

  if (
    detectionRunning
  ) {

    return

  }


  detectionRunning =
    true


  function detectFrame() {

    if (
      video.srcObject &&
      handTrackerReady &&
      video.readyState >= 2
    ) {

      try {

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

            // Hacemos una copia para
            // conservar el frame actual.

            currentLandmarks =
              results.landmarks[0]
                .map(
                  point => ({
                    x: point.x,
                    y: point.y,
                    z: point.z
                  })
                )


            status.textContent =
              `🖐️ Mano detectada — ${currentLandmarks.length} puntos`


            drawHandOverlay(
              currentLandmarks
            )


          } else {

            currentLandmarks =
              null


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


        currentLandmarks =
          null


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
// 16. ACTIVAR WEBCAM
// ======================================================

async function startCamera() {

  if (
    !navigator.mediaDevices?.getUserMedia
  ) {

    status.textContent =
      '❌ Este navegador no permite usar la cámara'

    return

  }


  button.disabled =
    true


  button.textContent =
    'CONECTANDO...'


  status.textContent =
    '● Solicitando permiso de cámara...'


  try {

    // --------------------------------------------------
    // Webcam
    // --------------------------------------------------

    const stream =
      await navigator.mediaDevices
        .getUserMedia({

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


    resizeOverlay()


    placeholder.style.display =
      'none'


    // --------------------------------------------------
    // MediaPipe
    // --------------------------------------------------

    status.textContent =
      '🧠 Inicializando visión artificial...'


    if (
      !handTrackerReady
    ) {

      await initializeHandTracker()

      handTrackerReady =
        true

    }


    status.textContent =
      '👁️ Buscando una mano...'


    startHandDetection()


    button.textContent =
      'CÁMARA ACTIVADA'


    // --------------------------------------------------
    // Habilitar entrenamiento
    // --------------------------------------------------

    setTrainingButtonsDisabled(
      false
    )


    trainingStatus.textContent =
      'Selecciona un gesto para comenzar el entrenamiento.'


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
// 17. EVENTOS
// ======================================================

button.addEventListener(
  'click',
  startCamera
)


trainButtons.forEach(
  trainButton => {

    trainButton.addEventListener(
      'click',
      () => {

        captureGesture(
          trainButton.dataset.gesture
        )

      }
    )

  }
)


// ======================================================
// 18. ESTADO INICIAL
// ======================================================

updateTrainingUI()