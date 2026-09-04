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

import {
  initializeAI,
  trainGestureModel,
  predictGesture,
  isModelTrained,
  isTraining,
  resetGestureModel
} from './ai/model.js'


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
      
      <div
        id="prediction-panel"
        class="prediction-panel"
      >
        <div class="prediction-icon">
          🧠
        </div>

        <div class="prediction-information">

          <span class="prediction-eyebrow">
            RECONOCIMIENTO IA
          </span>

          <strong id="prediction-name">
            ESPERANDO GESTO
          </strong>

          <span id="prediction-action">
            Entrena la IA y muestra tu mano
          </span>

        </div>

        <div class="prediction-confidence">

          <span>
            CONFIANZA
          </span>

          <strong id="prediction-confidence">
            -- %
          </strong>

        </div>
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

const predictionPanel =
  document.querySelector(
    '#prediction-panel'
  )

const predictionName =
  document.querySelector(
    '#prediction-name'
  )

const predictionAction =
  document.querySelector(
    '#prediction-action'
  )

const predictionConfidence =
  document.querySelector(
    '#prediction-confidence'
  )

const predictionIcon =
  document.querySelector(
    '.prediction-icon'
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

let lastPredictionLogTime = 0

const PREDICTION_LOG_INTERVAL_MS = 250


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


    const modelAlreadyTrained =
      isModelTrained()


    datasetReadyBox.innerHTML = `
      <span>
        ✅
      </span>

      <div class="dataset-ready-content">

        <strong>
          DATASET COMPLETO
        </strong>

        <p>
          ${summary.total} muestras listas para entrenar la IA.
        </p>

        <button
          id="train-model-button"
          class="train-model-button"
          type="button"
          ${modelAlreadyTrained ? 'disabled' : ''}
        >
          ${
            modelAlreadyTrained
              ? '✅ IA ENTRENADA'
              : '🧠 ENTRENAR MODELO IA'
          }
        </button>

        <p
          id="model-training-status"
          class="model-training-status"
        >
          ${
            modelAlreadyTrained
              ? '✅ IA entrenada correctamente. HANDVERSE está lista.'
              : 'Esperando entrenamiento...'
          }
        </p>

      </div>
    `

  } else {

    datasetReadyBox.classList.remove(
      'ready'
    )


    datasetReadyBox.innerHTML = `
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
    `

  }

}


// ============================================================
//  ENTRENAMIENTO DE LA INTELIGENCIA ARTIFICIAL
// ============================================================

async function handleTrainModel() {

  const trainButton =
    document.querySelector(
      '#train-model-button'
    )


  const modelTrainingStatus =
    document.querySelector(
      '#model-training-status'
    )


  if (
    !trainButton ||
    !modelTrainingStatus
  ) {

    return

  }


  // Evita dos entrenamientos simultáneos

  if (
    isTraining()
  ) {

    modelTrainingStatus.textContent =
      '⚠️ La IA ya se está entrenando...'

    return

  }


  trainButton.disabled =
    true


  trainButton.textContent =
    '🧠 ENTRENANDO IA...'


  modelTrainingStatus.textContent =
    '⚙️ Preparando red neuronal...'


  try {

    console.log(
      '🧠 Iniciando entrenamiento de HANDVERSE...'
    )


    await trainGestureModel()


    if (
      isModelTrained()
    ) {

      modelTrainingStatus.textContent =
        '✅ IA entrenada correctamente. HANDVERSE está lista.'


      trainButton.textContent =
        '✅ IA ENTRENADA'


      trainButton.disabled =
        true


      console.log(
        '✅ Modelo HANDVERSE entrenado correctamente.'
      )

    } else {

      modelTrainingStatus.textContent =
        '⚠️ El entrenamiento terminó, pero el modelo no está listo.'


      trainButton.textContent =
        '🧠 ENTRENAR NUEVAMENTE'


      trainButton.disabled =
        false

    }

  } catch (error) {

    console.error(
      '❌ Error entrenando HANDVERSE:',
      error
    )


    modelTrainingStatus.textContent =
      '❌ Error durante el entrenamiento. Revisa la consola.'


    trainButton.textContent =
      '🧠 INTENTAR ENTRENAMIENTO'


    trainButton.disabled =
      false

  }

}


// ============================================================
// EVENTO DEL BOTÓN ENTRENAR MODELO
// ============================================================

document.addEventListener(
  'click',
  async event => {

    const trainButton =
      event.target.closest(
        '#train-model-button'
      )


    if (
      !trainButton
    ) {

      return

    }


    await handleTrainModel()

  }
)


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


  if (
    !gesture
  ) {

    return

  }


  // ----------------------------------------------------
  // Si ya existe un modelo entrenado y modificamos
  // los datos, ese modelo deja de ser válido.
  // ----------------------------------------------------

  if (
    isModelTrained()
  ) {

    resetGestureModel()


    trainingStatus.textContent =
      '🔄 Datos modificados. Será necesario volver a entrenar la IA.'

  }


  // ----------------------------------------------------
  // Si estaba completo permite recapturarlo
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


  await sleep(
    800
  )


  for (
    let number = 3;
    number >= 1;
    number--
  ) {

    trainingStatus.textContent =
      `${gesture.emoji} ${number}`


    await sleep(
      800
    )

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

    // Si MediaPipe no detecta mano
    // no guardamos datos.

    if (
      !currentLandmarks
    ) {

      trainingStatus.textContent =
        '⚠️ No veo tu mano. Colócala frente a la cámara.'


      await sleep(
        150
      )


      continue

    }


    const added =
      addSample(
        gestureKey,
        currentLandmarks
      )


    if (
      added
    ) {

      const currentCount =
        getSampleCount(
          gestureKey
        )


      trainingStatus.textContent =
        `🔴 ${gesture.emoji} Capturando ${currentCount}/${TARGET_SAMPLES_PER_CLASS}`


      updateTrainingUI()

    }


    // Dejamos pasar frames para evitar
    // capturar exactamente la misma posición.

    await sleep(
      120
    )

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


function updatePredictionUI(
  prediction
) {

  if (!prediction) {

    predictionIcon.textContent =
      '🧠'

    predictionName.textContent =
      'ESPERANDO GESTO'

    predictionAction.textContent =
      'Muestra tu mano frente a la cámara'

    predictionConfidence.textContent =
      '-- %'

    predictionPanel.className =
      'prediction-panel'

    return
  }


  const gestureData = {

    open_hand: {
      icon: '🖐️',
      name: 'MANO ABIERTA',
      action: 'ESCUDO',
      className: 'shield'
    },

    fist: {
      icon: '✊',
      name: 'PUÑO CERRADO',
      action: 'ATAQUE',
      className: 'attack'
    },

    thumbs_up: {
      icon: '👍',
      name: 'PULGAR ARRIBA',
      action: 'PODER',
      className: 'power'
    }

  }


  const gesture =
    gestureData[prediction.key]


  if (!gesture) {
    return
  }


  const confidence =
    Math.round(
      prediction.confidence * 100
    )


  predictionIcon.textContent =
    gesture.icon


  predictionName.textContent =
    gesture.name


  predictionAction.textContent =
    gesture.action


  predictionConfidence.textContent =
    `${confidence} %`


  predictionPanel.className =
    `prediction-panel ${gesture.className}`

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

            // Guardamos una copia de los
            // landmarks del frame actual.

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


            // ------------------------------------------------
            // PREDICCIÓN DE GESTOS
            // ------------------------------------------------

            if (
              isModelTrained() &&
              !captureInProgress
            ) {

              const prediction =
                predictGesture(
                  currentLandmarks
                )


              if (
                prediction
              ) {

                const now =
                  performance.now()


                if (
                  now -
                  lastPredictionLogTime >=
                  PREDICTION_LOG_INTERVAL_MS
                ) {

                  lastPredictionLogTime =
                    now


                  console.log(
                    '🤖 Predicción HANDVERSE:',
                    prediction
                  )

                  updatePredictionUI(
                    prediction
                  )

                }

              }

            }

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
    // Habilitar botones de entrenamiento
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
// MANTENER CANVAS SINCRONIZADO
// ======================================================

video.addEventListener(
  'loadedmetadata',
  resizeOverlay
)


window.addEventListener(
  'resize',
  resizeOverlay
)


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


// ======================================================
// 19. INICIALIZACIÓN DEL MOTOR DE IA
// ======================================================

async function initializeHandverseAI() {

  try {

    console.log(
      '🧠 Inicializando motor neuronal de HANDVERSE...'
    )


    await initializeAI()


    console.log(
      '✅ Motor de Inteligencia Artificial preparado'
    )

  } catch (error) {

    console.error(
      '❌ Error inicializando la IA de HANDVERSE:',
      error
    )

  }

}


initializeHandverseAI()