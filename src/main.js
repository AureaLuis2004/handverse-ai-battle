// ============================================================
// HANDVERSE: AI BATTLE
// MAIN.JS COMPLETO
// ============================================================

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

import {
  startBattle,
  startNextRound,
  playBattleTurn,
  getBattleState,
  isBattleActive,
  resetBattle
} from './game/battleEngine.js'


// ============================================================
// 1. INTERFAZ PRINCIPAL
// ============================================================

const app =
  document.querySelector('#app')

app.innerHTML = `
  <main class="app-shell">

    <!-- ================================================== -->
    <!-- CABECERA -->
    <!-- ================================================== -->

    <section class="hero">

      <p class="eyebrow">
        ECOTEC · SISTEMAS INTELIGENTES
      </p>

      <h1>
        HANDVERSE:
        <span>
          BATALLA DE IA
        </span>
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


    <!-- ================================================== -->
    <!-- CÁMARA -->
    <!-- ================================================== -->

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

          <span>
            📷
          </span>

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


      <!-- ================================================= -->
      <!-- RECONOCIMIENTO DE GESTO -->
      <!-- ================================================= -->

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


    <!-- ================================================== -->
    <!-- ENTRENAMIENTO -->
    <!-- ================================================== -->

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


        <!-- ================================================ -->
        <!-- MANO ABIERTA -->
        <!-- ================================================ -->

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


        <!-- ================================================ -->
        <!-- PUÑO CERRADO -->
        <!-- ================================================ -->

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


        <!-- ================================================ -->
        <!-- PULGAR ARRIBA -->
        <!-- ================================================ -->

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


      <!-- ================================================= -->
      <!-- ESTADO DEL DATASET -->
      <!-- ================================================= -->

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


    <!-- ================================================== -->
    <!-- ARENA DE BATALLA -->
    <!-- ================================================== -->

    <section
      id="battle-section"
      class="battle-section battle-locked"
    >

      <div class="battle-header">

        <span class="battle-eyebrow">
          HANDVERSE COMBAT SYSTEM
        </span>

        <h2>
          ⚔️ ARENA DE BATALLA
        </h2>

        <p id="battle-message">
          Entrena la IA para desbloquear la batalla.
        </p>

      </div>


      <!-- ================================================= -->
      <!-- HUD DE VIDA -->
      <!-- ================================================= -->

      <div class="battle-hud">


        <!-- JUGADOR -->

        <div class="battle-player">

          <span class="battle-character">
            👤
          </span>

          <div>

            <span class="battle-label">
              JUGADOR
            </span>

            <div class="health-info">

              <span>
                VIDA
              </span>

              <span id="player-health-text">
                100 / 100
              </span>

            </div>

            <span
              id="player-damage-indicator"
              class="damage-indicator"
            ></span>

            <div class="health-bar">

              <div
                id="player-health-bar"
                class="health-fill player-health"
              ></div>

            </div>


            <!-- ESTADO DEL PODER ESPECIAL DEL JUGADOR -->

            <div
              id="player-power-status"
              class="power-status power-available"
            >
              ⚡ PODER ESPECIAL · 3/3
            </div>

          </div>

        </div>


        <!-- CENTRO -->

        <div class="battle-center">

          <span class="round-label">
            RONDA
          </span>

          <strong id="battle-round">
            0
          </strong>

          <span class="battle-vs">
            VS
          </span>

        </div>


        <!-- IA -->

        <div class="battle-player battle-ai">

          <span class="battle-character">
            🤖
          </span>

          <div>

            <span class="battle-label">
              HANDVERSE IA
            </span>

            <div class="health-info">

              <span>
                VIDA
              </span>

              <span id="ai-health-text">
                100 / 100
              </span>

            </div>

            <span
              id="ai-damage-indicator"
              class="damage-indicator"
            ></span>

            <div class="health-bar">

              <div
                id="ai-health-bar"
                class="health-fill ai-health"
              ></div>

            </div>


            <!-- ESTADO DEL PODER ESPECIAL DE HANDVERSE IA -->

            <div
              id="ai-power-status"
              class="power-status power-available"
            >
              ⚡ PODER ESPECIAL · 3/3
            </div>

          </div>

        </div>

      </div>


      <!-- ================================================= -->
      <!-- MOVIMIENTOS -->
      <!-- ================================================= -->

      <div class="battle-actions">


        <!-- JUGADOR -->

        <div class="battle-action-card">

          <span>
            TU MOVIMIENTO
          </span>

          <strong id="player-battle-emoji">
            ❔
          </strong>

          <p id="player-battle-action">
            ESPERANDO
          </p>

        </div>


        <div class="battle-action-versus">
          VS
        </div>


        <!-- IA -->

        <div class="battle-action-card">

          <span>
            MOVIMIENTO IA
          </span>

          <strong id="ai-battle-emoji">
            🤖
          </strong>

          <p id="ai-battle-action">
            ESPERANDO
          </p>

        </div>

      </div>


      <!-- ================================================= -->
      <!-- RESULTADO -->
      <!-- ================================================= -->

      <div
        id="battle-result"
        class="battle-result"
      >
        🔒 BATALLA BLOQUEADA
      </div>


      <!-- ================================================= -->
      <!-- NUEVA PARTIDA -->
      <!-- ================================================= -->

      <div
        id="new-battle-container"
        class="new-battle-container"
        hidden
      >

        <button
          id="new-battle-button"
          class="new-battle-button"
          type="button"
        >
          🎮 GENERAR OTRA PARTIDA
        </button>

      </div>

    </section>

  </main>
`


// ============================================================
// 2. ELEMENTOS DEL DOM
// ============================================================

const video =
  document.querySelector(
    '#webcam'
  )

const canvas =
  document.querySelector(
    '#overlay'
  )

const context =
  canvas.getContext(
    '2d'
  )

const cameraButton =
  document.querySelector(
    '#start-camera'
  )

const cameraStatus =
  document.querySelector(
    '#camera-status'
  )

const cameraPlaceholder =
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


const newBattleContainer =
  document.querySelector(
    '#new-battle-container'
  )

const newBattleButton =
  document.querySelector(
    '#new-battle-button'
  )


// ============================================================
// 3. ESTADO GENERAL
// ============================================================

let handTrackerReady =
  false

let detectionRunning =
  false

let lastVideoTime =
  -1

let currentLandmarks =
  null

let captureInProgress =
  false

let lastPredictionLogTime =
  0


// ============================================================
// CONTROL DE GESTOS DE BATALLA
// ============================================================

let battleGestureLocked =
  false

let lastBattleGesture =
  null

let battleGestureStartTime =
  0


// ============================================================
// TRANSICIÓN ENTRE RONDAS
// ============================================================

let roundTransitionActive =
  false

let roundTransitionTimer =
  null


// ============================================================
// CONFIGURACIÓN DE RECONOCIMIENTO
// ============================================================

const BATTLE_GESTURE_HOLD_MS =
  350

const BATTLE_MIN_CONFIDENCE =
  0.80

const PREDICTION_LOG_INTERVAL_MS =
  250

const ROUND_TRANSITION_MS =
  1800


// ============================================================
// 4. INFORMACIÓN DE LOS GESTOS
// ============================================================

const GESTURES = {

  open_hand:
    GESTURE_CLASSES.OPEN_HAND,

  fist:
    GESTURE_CLASSES.FIST,

  thumbs_up:
    GESTURE_CLASSES.THUMBS_UP

}


// ============================================================
// INFORMACIÓN VISUAL
// ============================================================

const GESTURE_VIEW = {

  open_hand: {

    icon:
      '🖐️',

    name:
      'MANO ABIERTA',

    action:
      'ESCUDO',

    className:
      'shield'

  },


  fist: {

    icon:
      '✊',

    name:
      'PUÑO CERRADO',

    action:
      'ATAQUE',

    className:
      'attack'

  },


  thumbs_up: {

    icon:
      '👍',

    name:
      'PULGAR ARRIBA',

    action:
      'PODER',

    className:
      'power'

  }

}


// ============================================================
// 5. CONEXIONES DE LA MANO
// ============================================================

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


// ============================================================
// 6. UTILIDAD DE ESPERA
// ============================================================

function sleep(
  milliseconds
) {

  return new Promise(
    resolve => {

      setTimeout(
        resolve,
        milliseconds
      )

    }
  )

}


// ============================================================
// LIMITAR VIDA ENTRE 0 Y 100
// ============================================================

function clampHealth(
  value
) {

  return Math.max(
    0,
    Math.min(
      100,
      Number(
        value ?? 100
      )
    )
  )

}


// ============================================================
// REINICIAR CONTROL DE GESTOS
// ============================================================

function resetBattleGestureControl() {

  lastBattleGesture =
    null

  battleGestureStartTime =
    0

  battleGestureLocked =
    false

}


// ============================================================
// CANCELAR TRANSICIÓN DE RONDA
// ============================================================

function cancelRoundTransition() {

  if (
    roundTransitionTimer
  ) {

    clearTimeout(
      roundTransitionTimer
    )

    roundTransitionTimer =
      null

  }


  roundTransitionActive =
    false

}


// ============================================================
// INICIAR TRANSICIÓN DE RONDA
// ============================================================

function beginRoundTransition() {

  cancelRoundTransition()

  roundTransitionActive =
    true

  battleGestureLocked =
    true


  roundTransitionTimer =
    setTimeout(
      () => {

        roundTransitionTimer =
          null


        // ==============================================
        // PEDIR AL BATTLE ENGINE LA SIGUIENTE RONDA
        // ==============================================

        const nextRoundState =
          startNextRound()


        console.log(
          '🔥 SIGUIENTE RONDA:',
          nextRoundState
        )


        roundTransitionActive =
          false


        resetBattleGestureControl()


        updateBattleUI(
          nextRoundState
        )

      },
      ROUND_TRANSITION_MS
    )

}


// ============================================================
// 7. PREPARAR CANVAS
// ============================================================

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


// ============================================================
// CONVERTIR LANDMARK AL CANVAS
// ============================================================

function getCanvasPoint(
  landmark
) {

  return {

    x:
      (
        1 -
        landmark.x
      ) *
      canvas.width,

    y:
      landmark.y *
      canvas.height

  }

}


// ============================================================
// LIMPIAR MANO
// ============================================================

function clearHandOverlay() {

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  )

}


// ============================================================
// DIBUJAR MANO
// ============================================================

function drawHandOverlay(
  landmarks
) {

  clearHandOverlay()


  // ========================================================
  // LÍNEAS
  // ========================================================

  context.save()

  context.lineWidth =
    4

  context.lineCap =
    'round'

  context.lineJoin =
    'round'

  context.strokeStyle =
    '#22d3ee'

  context.shadowColor =
    '#22d3ee'

  context.shadowBlur =
    16


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


  // ========================================================
  // 21 PUNTOS
  // ========================================================

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


    // Punto blanco

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

    context.shadowBlur =
      16

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


  context.shadowBlur =
    0

}


// ============================================================
// 8. ACTUALIZAR INTERFAZ DEL DATASET
// ============================================================

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


    if (
      !card
    ) {

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


    if (
      countElement
    ) {

      countElement.textContent =
        `${count} / ${TARGET_SAMPLES_PER_CLASS}`

    }


    if (
      progressFill
    ) {

      progressFill.style.width =
        `${percentage}%`

    }


    if (
      count >=
      TARGET_SAMPLES_PER_CLASS
    ) {

      card.classList.add(
        'gesture-complete'
      )


      if (
        trainButton
      ) {

        trainButton.textContent =
          'RECAPTURAR'

      }

    }

    else {

      card.classList.remove(
        'gesture-complete'
      )


      if (
        trainButton
      ) {

        trainButton.textContent =
          'ENTRENAR'

      }

    }

  }


  // ========================================================
  // DATASET COMPLETO
  // ========================================================

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
          ${modelAlreadyTrained
        ? 'disabled'
        : ''
      }
        >

          ${modelAlreadyTrained
        ? '✅ IA ENTRENADA'
        : '🧠 ENTRENAR MODELO IA'
      }

        </button>

        <p
          id="model-training-status"
          class="model-training-status"
        >

          ${modelAlreadyTrained
        ? '✅ IA entrenada correctamente. HANDVERSE está lista.'
        : 'Esperando entrenamiento...'
      }

        </p>

      </div>

    `

  }

  else {

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
// 9. ENTRENAR MODELO DE IA
// ============================================================

async function handleTrainModel() {

  const trainModelButton =
    document.querySelector(
      '#train-model-button'
    )


  const modelTrainingStatus =
    document.querySelector(
      '#model-training-status'
    )


  if (
    !trainModelButton ||
    !modelTrainingStatus
  ) {

    return

  }


  if (
    isTraining()
  ) {

    modelTrainingStatus.textContent =
      '⚠️ La IA ya se está entrenando...'

    return

  }


  trainModelButton.disabled =
    true

  trainModelButton.textContent =
    '🧠 ENTRENANDO IA...'

  modelTrainingStatus.textContent =
    '⚙️ Preparando red neuronal...'


  try {

    console.log(
      '🧠 Iniciando entrenamiento de HANDVERSE...'
    )


    await trainGestureModel()


    if (
      !isModelTrained()
    ) {

      modelTrainingStatus.textContent =
        '⚠️ El entrenamiento terminó, pero el modelo no está listo.'


      trainModelButton.textContent =
        '🧠 ENTRENAR NUEVAMENTE'

      trainModelButton.disabled =
        false


      return

    }


    modelTrainingStatus.textContent =
      '✅ IA entrenada correctamente. HANDVERSE está lista.'


    trainModelButton.textContent =
      '✅ IA ENTRENADA'


    trainModelButton.disabled =
      true


    console.log(
      '✅ Modelo HANDVERSE entrenado correctamente.'
    )


    // ======================================================
    // INICIAR NUEVA BATALLA
    // ======================================================

    cancelRoundTransition()

    resetBattleGestureControl()


    const initialBattleState =
      startBattle()


    console.log(
      '🔥 BATALLA HANDVERSE INICIADA:',
      initialBattleState
    )


    updateBattleUI(
      initialBattleState
    )

  }

  catch (
  error
  ) {

    console.error(
      '❌ Error entrenando HANDVERSE:',
      error
    )


    modelTrainingStatus.textContent =
      '❌ Error durante el entrenamiento. Revisa la consola.'


    trainModelButton.textContent =
      '🧠 INTENTAR ENTRENAMIENTO'


    trainModelButton.disabled =
      false

  }

}


// ============================================================
// 10. HABILITAR / DESHABILITAR BOTONES
// ============================================================

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


// ============================================================
// 11. CAPTURAR GESTO
// ============================================================

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


  // ========================================================
  // SI CAMBIAMOS EL DATASET DESPUÉS DE ENTRENAR
  // ========================================================

  if (
    isModelTrained()
  ) {

    resetGestureModel()

    resetBattle()

    cancelRoundTransition()

    resetBattleGestureControl()


    updateBattleUI(
      getBattleState()
    )


    trainingStatus.textContent =
      '🔄 Datos modificados. Será necesario volver a entrenar la IA.'

  }


  // ========================================================
  // RECAPTURAR
  // ========================================================

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


  try {

    trainingStatus.textContent =
      `${gesture.emoji} Prepárate para ${gesture.name}`


    await sleep(
      800
    )


    // ======================================================
    // CUENTA REGRESIVA
    // ======================================================

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


    // ======================================================
    // CAPTURAR MUESTRAS
    // ======================================================

    while (
      getSampleCount(
        gestureKey
      ) <
      TARGET_SAMPLES_PER_CLASS
    ) {

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


      await sleep(
        120
      )

    }


    trainingStatus.textContent =
      `✅ ${gesture.emoji} ${gesture.name} aprendido correctamente`

  }

  catch (
  error
  ) {

    console.error(
      `❌ Error capturando ${gestureKey}:`,
      error
    )


    trainingStatus.textContent =
      '❌ Ocurrió un error durante la captura.'

  }

  finally {

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

}


// ============================================================
// 12. ACTUALIZAR RECONOCIMIENTO VISUAL
// ============================================================

function updatePredictionUI(
  prediction
) {

  if (
    !prediction
  ) {

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


  const gesture =
    GESTURE_VIEW[
    prediction.key
    ]


  if (
    !gesture
  ) {

    return

  }


  const confidence =
    Math.round(
      (
        prediction.confidence ??
        0
      ) *
      100
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


// ============================================================
// 13. MOSTRAR GESTO EN LA ARENA EN TIEMPO REAL
// ============================================================

function updateBattleGesturePreview(
  prediction
) {

  if (
    !prediction ||
    roundTransitionActive
  ) {

    return

  }


  const state =
    getBattleState()


  if (
    !state ||
    !state.battleStarted ||
    state.battleFinished
  ) {

    return

  }


  const action =
    GESTURE_VIEW[
    prediction.key
    ]


  if (
    !action
  ) {

    return

  }


  const playerActionIcon =
    document.getElementById(
      'player-battle-emoji'
    )


  const playerActionName =
    document.getElementById(
      'player-battle-action'
    )


  if (
    !playerActionIcon ||
    !playerActionName
  ) {

    return

  }


  // ========================================================
  // VISTA PREVIA INMEDIATA
  // ========================================================

  playerActionIcon.textContent =
    action.icon


  playerActionName.textContent =
    action.action

}


// ============================================================
// 14. PROCESAR GESTO COMO TURNO
// ============================================================

function processBattlePrediction(
  prediction
) {

  if (
    !prediction
  ) {

    return

  }


  // Mostrar gesto inmediatamente.

  updateBattleGesturePreview(
    prediction
  )


  // Durante transición de ronda
  // no aceptamos otro ataque.

  if (
    roundTransitionActive
  ) {

    return

  }


  // La batalla debe estar activa.

  if (
    !isBattleActive()
  ) {

    return

  }


  const gesture =
    prediction.key


  const confidence =
    prediction.confidence ??
    0


  // ========================================================
  // CONFIANZA MÍNIMA
  // ========================================================

  if (
    confidence <
    BATTLE_MIN_CONFIDENCE
  ) {

    resetBattleGestureControl()

    return

  }


  const now =
    performance.now()


  // ========================================================
  // GESTO NUEVO
  // ========================================================

  if (
    gesture !==
    lastBattleGesture
  ) {

    lastBattleGesture =
      gesture


    battleGestureStartTime =
      now


    battleGestureLocked =
      false


    return

  }


  // ========================================================
  // EVITAR REPETICIÓN AUTOMÁTICA
  // ========================================================

  if (
    battleGestureLocked
  ) {

    return

  }


  // ========================================================
  // CONFIRMAR GESTO DURANTE 350 ms
  // ========================================================

  if (
    now -
    battleGestureStartTime <
    BATTLE_GESTURE_HOLD_MS
  ) {

    return

  }


  // ========================================================
  // EJECUTAR TURNO
  // ========================================================

  const result =
    playBattleTurn(
      gesture
    )


  if (
    !result ||
    !result.success
  ) {

    console.warn(
      'Movimiento de batalla rechazado:',
      result?.message ??
      'Resultado de batalla inválido'
    )


    // ========================================================
    // PODER ESPECIAL AGOTADO
    // ========================================================

    if (
      result?.powerAlreadyUsed ||
      result?.powerExhausted
    ) {

      const battleResult =
        document.getElementById(
          'battle-result'
        )


      if (
        battleResult
      ) {

        battleResult.textContent =
          `${result?.message ?? '⚠️ PODER ESPECIAL AGOTADO'} · ELIGE ATAQUE O ESCUDO`

      }


      // Bloqueamos este mismo gesto
      // hasta que el estudiante cambie la mano.

      battleGestureLocked =
        true

    }


    return
  }


  // Impedir que un mismo gesto
  // se dispare varias veces.

  battleGestureLocked =
    true


  // Actualizamos la interfaz.

  updateBattleUI(
    result
  )


  console.log(
    '⚔️ TURNO HANDVERSE:',
    result
  )


  // ========================================================
  // SI TERMINÓ UNA RONDA
  // ========================================================

  if (
    result.roundFinished &&
    !result.battleFinished
  ) {

    beginRoundTransition()

  }

}


// ============================================================
// 15. GENERAR OTRA PARTIDA
// ============================================================
//
// IMPORTANTE:
//
// NO:
// - recarga la página
// - borra las muestras
// - elimina el modelo
// - vuelve a entrenar la IA
// - apaga la cámara
//
// SÍ:
// - vuelve a ronda 1
// - devuelve ambas vidas a 100
// - coloca marcador 0 - 0
// ============================================================

function startNewBattle() {

  if (
    !isModelTrained()
  ) {

    console.warn(
      'No se puede generar otra partida porque la IA no está entrenada.'
    )

    return

  }


  // ==========================================================
  // REINICIAR CONTROL DE EFECTOS DE LA NUEVA PARTIDA
  // ==========================================================

  lastPlayerPowerAnimation =
    null

  lastAiPowerAnimation =
    null


  const currentState =
    getBattleState()


  if (
    !currentState ||
    !currentState.battleFinished
  ) {

    console.warn(
      'La partida actual todavía no ha terminado.'
    )

    return

  }


  // Detenemos cualquier temporizador
  // sobrante de la partida anterior.

  cancelRoundTransition()


  // Limpiamos solamente el control
  // temporal de gestos.

  resetBattleGestureControl()


  // startBattle() reinicia únicamente
  // el motor de batalla.

  const newBattleState =
    startBattle()


  updateBattleUI(
    newBattleState
  )


  console.log(
    '🎮 NUEVA PARTIDA HANDVERSE INICIADA:',
    newBattleState
  )

}


// ============================================================
// CONTROL VISUAL DE DAÑO
// ============================================================

let previousPlayerHealth = 100
let previousAiHealth = 100

let playerDamageTimeout = null
let aiDamageTimeout = null


function showDamageIndicator(
  element,
  damage,
  type
) {

  if (
    !element ||
    damage <= 0
  ) {

    return

  }


  element.textContent =
    `💥 -${damage}`


  element.classList.remove(
    'damage-visible'
  )


  // Reinicia la animación

  void element.offsetWidth


  element.classList.add(
    'damage-visible'
  )


  if (
    type === 'player'
  ) {

    clearTimeout(
      playerDamageTimeout
    )


    playerDamageTimeout =
      setTimeout(
        () => {

          element.classList.remove(
            'damage-visible'
          )

          element.textContent =
            ''

        },
        850
      )

  }


  if (
    type === 'ai'
  ) {

    clearTimeout(
      aiDamageTimeout
    )


    aiDamageTimeout =
      setTimeout(
        () => {

          element.classList.remove(
            'damage-visible'
          )

          element.textContent =
            ''

        },
        850
      )

  }

}


// ============================================================
// EFECTO VISUAL AL RECIBIR DAÑO
// ============================================================

function showBattleHitEffect(
  damageIndicator,
  type
) {

  if (
    !damageIndicator
  ) {

    return

  }


  // Busca automáticamente el panel del personaje

  const characterPanel =
    damageIndicator.closest(
      '.battle-player'
    )


  if (
    !characterPanel
  ) {

    return

  }


  const hitClass =
    type === 'player'
      ? 'battle-hit-player'
      : 'battle-hit-ai'


  // Quitamos la clase anterior
  // para poder reiniciar la animación.

  characterPanel.classList.remove(
    hitClass
  )


  void characterPanel.offsetWidth


  // Ejecutamos impacto

  characterPanel.classList.add(
    hitClass
  )


  // Después la eliminamos.

  setTimeout(
    () => {

      characterPanel.classList.remove(
        hitClass
      )

    },
    500
  )

}


// ============================================================
// EFECTO VISUAL DEL PODER ESPECIAL
// ============================================================

function showPowerSpecialEffect(
  actionIcon,
  type
) {

  if (
    !actionIcon
  ) {

    return

  }


  const powerClass =
    type === 'player'
      ? 'player-power-effect'
      : 'ai-power-effect'


  // Eliminamos la clase anterior
  // para permitir reiniciar la animación.

  actionIcon.classList.remove(
    powerClass
  )


  // Forzamos el reinicio de la animación.

  void actionIcon.offsetWidth


  // Activamos el poder especial.

  actionIcon.classList.add(
    powerClass
  )


  // La animación termina
  // y limpiamos la clase.

  setTimeout(
    () => {

      actionIcon.classList.remove(
        powerClass
      )

    },
    900
  )

}


// ============================================================
// CONTROL DE ANIMACIÓN DEL PODER ESPECIAL
// ============================================================

let lastPlayerPowerAnimation =
  null

let lastAiPowerAnimation =
  null


// ============================================================
// 16. ACTUALIZAR INTERFAZ DE BATALLA
// ============================================================

function updateBattleUI(
  state
) {

  if (
    !state
  ) {

    return

  }


  // ========================================================
  // BOTÓN GENERAR OTRA PARTIDA
  // ========================================================

  if (
    newBattleContainer
  ) {

    newBattleContainer.hidden =
      !state.battleFinished

  }


  // ========================================================
  // ELEMENTOS
  // ========================================================

  const battleSection =
    document.getElementById(
      'battle-section'
    )


  const battleMessage =
    document.getElementById(
      'battle-message'
    )


  const battleResult =
    document.getElementById(
      'battle-result'
    )


  const battleRound =
    document.getElementById(
      'battle-round'
    )


  const playerHealthText =
    document.getElementById(
      'player-health-text'
    )


  const aiHealthText =
    document.getElementById(
      'ai-health-text'
    )


  const playerDamageIndicator =
    document.getElementById(
      'player-damage-indicator'
    )


  const aiDamageIndicator =
    document.getElementById(
      'ai-damage-indicator'
    )


  const playerPowerStatus =
    document.getElementById(
      'player-power-status'
    )


  const aiPowerStatus =
    document.getElementById(
      'ai-power-status'
    )


  const playerHealthBar =
    document.getElementById(
      'player-health-bar'
    )


  const aiHealthBar =
    document.getElementById(
      'ai-health-bar'
    )


  const playerActionIcon =
    document.getElementById(
      'player-battle-emoji'
    )


  const playerActionName =
    document.getElementById(
      'player-battle-action'
    )


  const aiActionIcon =
    document.getElementById(
      'ai-battle-emoji'
    )


  const aiActionName =
    document.getElementById(
      'ai-battle-action'
    )


  const playerRoundsWon =
    Number(
      state.playerRoundsWon ??
      0
    )


  const aiRoundsWon =
    Number(
      state.aiRoundsWon ??
      0
    )


  // ========================================================
  // BATALLA NO INICIADA
  // ========================================================

  if (
    !state.battleStarted
  ) {

    battleSection?.classList.add(
      'battle-locked'
    )


    if (
      battleRound
    ) {

      battleRound.textContent =
        '0'

    }


    if (
      playerHealthText
    ) {

      playerHealthText.textContent =
        '100 / 100'

    }


    if (
      aiHealthText
    ) {

      aiHealthText.textContent =
        '100 / 100'

    }


    if (
      playerHealthBar
    ) {

      playerHealthBar.style.width =
        '100%'

    }


    if (
      aiHealthBar
    ) {

      aiHealthBar.style.width =
        '100%'

    }


    if (
      battleMessage
    ) {

      battleMessage.textContent =
        'Entrena la IA para desbloquear la batalla.'

    }


    if (
      battleResult
    ) {

      battleResult.textContent =
        '🔒 BATALLA BLOQUEADA'

    }


    if (
      playerActionIcon
    ) {

      playerActionIcon.textContent =
        '❔'

    }


    if (
      playerActionName
    ) {

      playerActionName.textContent =
        'ESPERANDO'

    }


    if (
      aiActionIcon
    ) {

      aiActionIcon.textContent =
        '🤖'

    }


    if (
      aiActionName
    ) {

      aiActionName.textContent =
        'ESPERANDO'

    }


    // ======================================================
    // REINICIAR ESTADO VISUAL DEL PODER ESPECIAL
    // ======================================================

    if (
      playerPowerStatus
    ) {

      playerPowerStatus.textContent =
        '⚡ PODER ESPECIAL · 3/3'


      playerPowerStatus.classList.remove(
        'power-used'
      )


      playerPowerStatus.classList.add(
        'power-available'
      )

    }


    if (
      aiPowerStatus
    ) {

      aiPowerStatus.textContent =
        '⚡ PODER ESPECIAL · 3/3'


      aiPowerStatus.classList.remove(
        'power-used'
      )


      aiPowerStatus.classList.add(
        'power-available'
      )

    }


    return

  }


  // ========================================================
  // DESBLOQUEAR ARENA
  // ========================================================

  battleSection?.classList.remove(
    'battle-locked'
  )


  // ========================================================
  // RONDA ACTUAL
  // ========================================================

  const currentRound =
    Math.max(
      1,
      Number(
        state.round ??
        1
      )
    )


  if (
    battleRound
  ) {

    battleRound.textContent =
      String(
        currentRound
      )

  }


  // ========================================================
  // VIDAS
  // ========================================================

  let playerHealth =
    clampHealth(
      state.playerHealth
    )


  let aiHealth =
    clampHealth(
      state.aiHealth
    )


  // ============================================================
  // DETECTAR DAÑO RECIBIDO
  // ============================================================

  const playerDamage =
    previousPlayerHealth -
    playerHealth


  const aiDamage =
    previousAiHealth -
    aiHealth


  // El estudiante recibió daño

  if (
    playerDamage > 0
  ) {

    showDamageIndicator(
      playerDamageIndicator,
      playerDamage,
      'player'
    )


    showBattleHitEffect(
      playerDamageIndicator,
      'player'
    )

  }


  // HANDVERSE recibió daño

  if (
    aiDamage > 0
  ) {

    showDamageIndicator(
      aiDamageIndicator,
      aiDamage,
      'ai'
    )


    showBattleHitEffect(
      aiDamageIndicator,
      'ai'
    )

  }


  // Guardamos las vidas actuales para
  // compararlas en la siguiente actualización.

  previousPlayerHealth =
    playerHealth


  previousAiHealth =
    aiHealth


  /*
    Durante la transición mantenemos visualmente
    la vida del perdedor en 0 hasta entrar a la
    siguiente ronda.
  */

  if (
    state.roundFinished &&
    !state.battleFinished
  ) {

    if (
      state.roundWinner ===
      'player'
    ) {

      aiHealth =
        0

    }

    else if (
      state.roundWinner ===
      'ai'
    ) {

      playerHealth =
        0

    }

  }


  if (
    playerHealthText
  ) {

    playerHealthText.textContent =
      `${playerHealth} / 100`

  }


  if (
    aiHealthText
  ) {

    aiHealthText.textContent =
      `${aiHealth} / 100`

  }


  if (
    playerHealthBar
  ) {

    playerHealthBar.style.width =
      `${playerHealth}%`

  }


  if (
    aiHealthBar
  ) {

    aiHealthBar.style.width =
      `${aiHealth}%`

  }


  // ============================================================
  // ESTADO DEL PODER ESPECIAL
  // ============================================================

  // El Battle Engine entrega:
  //
  // playerPowerUses          -> usos realizados por el estudiante
  // aiPowerUses              -> usos realizados por HANDVERSE IA
  // maxPowerUsesPerRound     -> máximo permitido por ronda
  // playerPowerUsesRemaining -> usos restantes del estudiante
  // aiPowerUsesRemaining     -> usos restantes de HANDVERSE IA

  const maxPowerUses =
    Math.max(
      1,
      Number(
        state.maxPowerUsesPerRound ??
        3
      )
    )


  const playerPowerUses =
    Math.max(
      0,
      Math.min(
        maxPowerUses,
        Number(
          state.playerPowerUses ??
          0
        )
      )
    )


  const aiPowerUses =
    Math.max(
      0,
      Math.min(
        maxPowerUses,
        Number(
          state.aiPowerUses ??
          0
        )
      )
    )


  const playerPowerRemaining =
    Math.max(
      0,
      Number(
        state.playerPowerUsesRemaining ??
        maxPowerUses -
        playerPowerUses
      )
    )


  const aiPowerRemaining =
    Math.max(
      0,
      Number(
        state.aiPowerUsesRemaining ??
        maxPowerUses -
        aiPowerUses
      )
    )


  // ------------------------------------------------------------
  // PODER DEL ESTUDIANTE
  // ------------------------------------------------------------

  if (
    playerPowerStatus
  ) {

    if (
      playerPowerRemaining <= 0
    ) {

      playerPowerStatus.textContent =
        `⚡ PODER AGOTADO · 0/${maxPowerUses}`


      playerPowerStatus.classList.remove(
        'power-available'
      )


      playerPowerStatus.classList.add(
        'power-used'
      )

    }

    else {

      playerPowerStatus.textContent =
        `⚡ PODER ESPECIAL · ${playerPowerRemaining}/${maxPowerUses}`


      playerPowerStatus.classList.remove(
        'power-used'
      )


      playerPowerStatus.classList.add(
        'power-available'
      )

    }

  }


  // ------------------------------------------------------------
  // PODER DE HANDVERSE IA
  // ------------------------------------------------------------

  if (
    aiPowerStatus
  ) {

    if (
      aiPowerRemaining <= 0
    ) {

      aiPowerStatus.textContent =
        `⚡ PODER AGOTADO · 0/${maxPowerUses}`


      aiPowerStatus.classList.remove(
        'power-available'
      )


      aiPowerStatus.classList.add(
        'power-used'
      )

    }

    else {

      aiPowerStatus.textContent =
        `⚡ PODER ESPECIAL · ${aiPowerRemaining}/${maxPowerUses}`


      aiPowerStatus.classList.remove(
        'power-used'
      )


      aiPowerStatus.classList.add(
        'power-available'
      )

    }

  }


  // ========================================================
  // MOVIMIENTO DEL JUGADOR
  // ========================================================

  if (
    state.playerAction
  ) {

    if (
      playerActionIcon
    ) {

      playerActionIcon.textContent =
        state.playerAction.emoji ??
        '❔'

    }


    if (
      playerActionName
    ) {

      playerActionName.textContent =
        state.playerAction.name ??
        'ESPERANDO'

    }

  }

  else {

    if (
      playerActionIcon
    ) {

      playerActionIcon.textContent =
        '❔'

    }


    if (
      playerActionName
    ) {

      playerActionName.textContent =
        'ESPERANDO'

    }

  }


  // ========================================================
  // MOVIMIENTO DE HANDVERSE
  // ========================================================

  if (
    state.aiAction
  ) {

    if (
      aiActionIcon
    ) {

      aiActionIcon.textContent =
        state.aiAction.emoji ??
        '🤖'

    }


    if (
      aiActionName
    ) {

      aiActionName.textContent =
        state.aiAction.name ??
        'ESPERANDO'

    }

  }

  else {

    if (
      aiActionIcon
    ) {

      aiActionIcon.textContent =
        '🤖'

    }


    if (
      aiActionName
    ) {

      aiActionName.textContent =
        'ESPERANDO'

    }

  }


  // ============================================================
  // ANIMACIÓN DEL PODER ESPECIAL
  // ============================================================

  const currentBattleActionId =
    `${state.round}-${state.turn}`


  // ============================================================
  // PODER ESPECIAL DEL ESTUDIANTE
  // ============================================================

  if (
    state.playerAction &&
    state.playerAction.key === 'power' &&
    lastPlayerPowerAnimation !==
    currentBattleActionId
  ) {

    showPowerSpecialEffect(
      playerActionIcon,
      'player'
    )


    lastPlayerPowerAnimation =
      currentBattleActionId

  }


  // ============================================================
  // PODER ESPECIAL DE HANDVERSE
  // ============================================================

  if (
    state.aiAction &&
    state.aiAction.key === 'power' &&
    lastAiPowerAnimation !==
    currentBattleActionId
  ) {

    showPowerSpecialEffect(
      aiActionIcon,
      'ai'
    )


    lastAiPowerAnimation =
      currentBattleActionId

  }


  // ========================================================
  // PARTIDA COMPLETA TERMINADA
  // ========================================================

  if (
    state.battleFinished
  ) {

    cancelRoundTransition()


    battleGestureLocked =
      true


    if (
      state.winner ===
      'player'
    ) {

      if (
        battleMessage
      ) {

        battleMessage.textContent =
          `🏆 ¡GANASTE LA BATALLA! Marcador ${playerRoundsWon} - ${aiRoundsWon}`

      }


      if (
        battleResult
      ) {

        battleResult.textContent =
          '🏆 VICTORIA FINAL DEL ESTUDIANTE'

      }

    }


    else if (
      state.winner ===
      'ai'
    ) {

      if (
        battleMessage
      ) {

        battleMessage.textContent =
          `🤖 HANDVERSE IA GANÓ LA BATALLA. Marcador ${playerRoundsWon} - ${aiRoundsWon}`

      }


      if (
        battleResult
      ) {

        battleResult.textContent =
          '🤖 VICTORIA FINAL DE HANDVERSE IA'

      }

    }


    else {

      if (
        battleMessage
      ) {

        battleMessage.textContent =
          '🤝 BATALLA EMPATADA.'

      }


      if (
        battleResult
      ) {

        battleResult.textContent =
          '🤝 EMPATE FINAL'

      }

    }


    return

  }


  // ========================================================
  // RONDA COMPLETA FINALIZADA
  // ========================================================

  if (
    state.roundFinished
  ) {

    if (
      battleMessage
    ) {

      battleMessage.textContent =
        `Ronda ${currentRound} terminada · Marcador ${playerRoundsWon} - ${aiRoundsWon}`

    }


    if (
      battleResult
    ) {

      if (
        state.roundWinner ===
        'player'
      ) {

        battleResult.textContent =
          `🏆 EL ESTUDIANTE GANÓ LA RONDA ${currentRound}`

      }


      else if (
        state.roundWinner ===
        'ai'
      ) {

        battleResult.textContent =
          `🤖 HANDVERSE IA GANÓ LA RONDA ${currentRound}`

      }


      else {

        battleResult.textContent =
          `⚔️ RONDA ${currentRound} FINALIZADA`

      }

    }


    return

  }


  // ========================================================
  // RONDA EN CURSO
  //
  // CADA GESTO ES UN TURNO.
  // NO ES UNA NUEVA RONDA.
  // ========================================================

  if (
    battleMessage
  ) {

    battleMessage.textContent =
      `Ronda ${currentRound} · Marcador ${playerRoundsWon} - ${aiRoundsWon} · Sigue combatiendo.`

  }


  if (
    !battleResult
  ) {

    return

  }


  // Todavía no se realizó ningún turno.

  if (
    !state.playerAction ||
    !state.aiAction
  ) {

    battleResult.textContent =
      '🎮 ESPERANDO TU MOVIMIENTO'


    return

  }


  // ========================================================
  // RESULTADO DEL TURNO
  // ========================================================

  if (
    state.turnWinner ===
    'player'
  ) {

    battleResult.textContent =
      '⚡ GANASTE EL INTERCAMBIO · LA RONDA CONTINÚA'

  }


  else if (
    state.turnWinner ===
    'ai'
  ) {

    battleResult.textContent =
      '🤖 HANDVERSE GANÓ EL INTERCAMBIO · LA RONDA CONTINÚA'

  }


  else {

    battleResult.textContent =
      '⚔️ EMPATE · LA RONDA CONTINÚA'

  }

}


// ============================================================
// 17. BUCLE DE VISIÓN ARTIFICIAL
// ============================================================

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


          // ==================================================
          // MANO DETECTADA
          // ==================================================

          if (
            results?.landmarks &&
            results.landmarks.length > 0
          ) {

            currentLandmarks =
              results.landmarks[0]
                .map(
                  point => ({

                    x:
                      point.x,

                    y:
                      point.y,

                    z:
                      point.z

                  })
                )


            cameraStatus.textContent =
              `🖐️ Mano detectada — ${currentLandmarks.length} puntos`


            drawHandOverlay(
              currentLandmarks
            )


            // ================================================
            // PREDICCIÓN
            // ================================================

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


                // ============================================
                // CONSOLA LIMITADA A 250 ms
                // ============================================

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

                }


                // Interfaz superior

                updatePredictionUI(
                  prediction
                )


                // Juego

                processBattlePrediction(
                  prediction
                )

              }

            }

          }


          // ==================================================
          // NO HAY MANO
          // ==================================================

          else {

            currentLandmarks =
              null


            /*
              Al retirar la mano desbloqueamos
              el control para permitir otro gesto.
            */

            resetBattleGestureControl()


            cameraStatus.textContent =
              '👁️ Buscando una mano...'


            updatePredictionUI(
              null
            )


            clearHandOverlay()

          }

        }

      }


      catch (
      error
      ) {

        console.error(
          'Error durante la detección:',
          error
        )


        currentLandmarks =
          null


        resetBattleGestureControl()


        cameraStatus.textContent =
          '❌ Error durante la detección'


        updatePredictionUI(
          null
        )


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


// ============================================================
// 18. ACTIVAR CÁMARA
// ============================================================

async function startCamera() {

  if (
    !navigator.mediaDevices
      ?.getUserMedia
  ) {

    cameraStatus.textContent =
      '❌ Este navegador no permite usar la cámara'


    return

  }


  cameraButton.disabled =
    true


  cameraButton.textContent =
    'CONECTANDO...'


  cameraStatus.textContent =
    '● Solicitando permiso de cámara...'


  try {

    // ========================================================
    // SOLICITAR WEBCAM
    // ========================================================

    const stream =
      await navigator.mediaDevices
        .getUserMedia({

          video: {

            width: {
              ideal:
                1280
            },

            height: {
              ideal:
                720
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


    cameraPlaceholder.style.display =
      'none'


    // ========================================================
    // MEDIAPIPE
    // ========================================================

    cameraStatus.textContent =
      '🧠 Inicializando visión artificial...'


    if (
      !handTrackerReady
    ) {

      await initializeHandTracker()


      handTrackerReady =
        true

    }


    cameraStatus.textContent =
      '👁️ Buscando una mano...'


    startHandDetection()


    cameraButton.textContent =
      'CÁMARA ACTIVADA'


    // ========================================================
    // HABILITAR ENTRENAMIENTO
    // ========================================================

    setTrainingButtonsDisabled(
      false
    )


    trainingStatus.textContent =
      'Selecciona un gesto para comenzar el entrenamiento.'

  }


  catch (
  error
  ) {

    console.error(
      'Error al iniciar HANDVERSE:',
      error
    )


    if (
      error.name ===
      'NotAllowedError'
    ) {

      cameraStatus.textContent =
        '❌ Permiso de cámara rechazado'

    }


    else if (
      error.name ===
      'NotFoundError'
    ) {

      cameraStatus.textContent =
        '❌ No se encontró una cámara'

    }


    else if (
      error.name ===
      'NotReadableError'
    ) {

      cameraStatus.textContent =
        '❌ La cámara está siendo utilizada por otra aplicación'

    }


    else {

      cameraStatus.textContent =
        '❌ No se pudo iniciar HANDVERSE'

    }


    cameraButton.disabled =
      false


    cameraButton.textContent =
      'INTENTAR DE NUEVO'

  }

}


// ============================================================
// 19. EVENTOS
// ============================================================

video.addEventListener(
  'loadedmetadata',
  resizeOverlay
)


window.addEventListener(
  'resize',
  resizeOverlay
)


cameraButton.addEventListener(
  'click',
  startCamera
)


// ============================================================
// BOTÓN GENERAR OTRA PARTIDA
// ============================================================

if (
  newBattleButton
) {

  newBattleButton.addEventListener(
    'click',
    startNewBattle
  )

}


// ============================================================
// BOTONES PARA CAPTURAR GESTOS
// ============================================================

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


// ============================================================
// BOTÓN DINÁMICO PARA ENTRENAR IA
// ============================================================

document.addEventListener(
  'click',
  async event => {

    const trainModelButton =
      event.target.closest(
        '#train-model-button'
      )


    if (
      !trainModelButton
    ) {

      return

    }


    await handleTrainModel()

  }
)


// ============================================================
// 20. ESTADO INICIAL
// ============================================================

updateTrainingUI()


updateBattleUI(
  getBattleState()
)


// ============================================================
// 21. INICIALIZACIÓN DE TENSORFLOW / IA
// ============================================================

async function initializeHandverseAI() {

  try {

    console.log(
      '🧠 Inicializando motor neuronal de HANDVERSE...'
    )


    await initializeAI()


    console.log(
      '✅ Motor de Inteligencia Artificial preparado'
    )

  }


  catch (
  error
  ) {

    console.error(
      '❌ Error inicializando la IA de HANDVERSE:',
      error
    )

  }

}


initializeHandverseAI()