// ======================================================
// HANDVERSE: AI BATTLE
// Modelo de Inteligencia Artificial
// TensorFlow.js
// ======================================================

// ======================================================
// TENSORFLOW.JS — LAZY LOADING
// Se carga únicamente cuando HANDVERSE necesita
// entrenar realmente el modelo neuronal.
// ======================================================

let tf = null

let tensorFlowReadyPromise = null


async function loadTensorFlow() {

  if (!tensorFlowReadyPromise) {

    tensorFlowReadyPromise =
      (async () => {

        console.log(
          '📦 Cargando TensorFlow.js bajo demanda...'
        )


        tf =
          await import('@tensorflow/tfjs')


        await tf.ready()


        console.log(
          'TensorFlow.js listo ✅'
        )


        console.log(
          'Backend:',
          tf.getBackend()
        )


        return true
      })()
        .catch((error) => {

          // Permitimos reintentar si hubo un fallo
          // durante la descarga o inicialización.
          tensorFlowReadyPromise = null

          tf = null

          throw error
        })
  }


  return tensorFlowReadyPromise
}

import {
  getTrainingData
} from './dataset.js'

import {
  landmarksToFeatureVector,
  isValidFeatureVector,
  GESTURE_CLASSES
} from './features.js'


// ======================================================
// 1. CONFIGURACIÓN
// ======================================================

const INPUT_SIZE = 63

const OUTPUT_SIZE = 3

const EPOCHS = 50

const BATCH_SIZE = 16


// ======================================================
// 2. ESTADO DEL MODELO
// ======================================================

let model = null

let modelTrained = false

let trainingInProgress = false


// ======================================================
// 3. INFORMACIÓN DE LAS CLASES
// ======================================================

const CLASS_BY_ID = {

  [GESTURE_CLASSES.OPEN_HAND.id]:
    GESTURE_CLASSES.OPEN_HAND,

  [GESTURE_CLASSES.FIST.id]:
    GESTURE_CLASSES.FIST,

  [GESTURE_CLASSES.THUMBS_UP.id]:
    GESTURE_CLASSES.THUMBS_UP

}


// ======================================================
// 4. INICIALIZAR TENSORFLOW.JS
// ======================================================

export async function initializeAI() {

  await loadTensorFlow()

  return true
}


// ======================================================
// 5. CREAR RED NEURONAL
// ======================================================

export function createGestureModel() {

  // Si ya existe un modelo anterior,
  // liberamos su memoria.

  if (model) {

    model.dispose()

  }


  model =
    tf.sequential()


  // ----------------------------------------------------
  // CAPA DE ENTRADA + PRIMERA CAPA OCULTA
  //
  // Recibe los 63 valores:
  //
  // 21 landmarks × X,Y,Z = 63
  // ----------------------------------------------------

  model.add(

    tf.layers.dense({

      inputShape: [
        INPUT_SIZE
      ],

      units: 48,

      activation: 'relu',

      kernelInitializer:
        'glorotUniform'

    })

  )


  // ----------------------------------------------------
  // DROPOUT
  //
  // Ayuda a reducir sobreajuste.
  // ----------------------------------------------------

  model.add(

    tf.layers.dropout({

      rate: 0.15

    })

  )


  // ----------------------------------------------------
  // SEGUNDA CAPA OCULTA
  // ----------------------------------------------------

  model.add(

    tf.layers.dense({

      units: 24,

      activation: 'relu'

    })

  )


  // ----------------------------------------------------
  // CAPA DE SALIDA
  //
  // 3 neuronas:
  //
  // 0 → Mano abierta
  // 1 → Puño
  // 2 → Pulgar arriba
  //
  // Softmax convierte la salida en probabilidades.
  // ----------------------------------------------------

  model.add(

    tf.layers.dense({

      units:
        OUTPUT_SIZE,

      activation:
        'softmax'

    })

  )


  // ----------------------------------------------------
  // COMPILAR
  // ----------------------------------------------------

  model.compile({

    optimizer:
      tf.train.adam(
        0.001
      ),

    loss:
      'categoricalCrossentropy',

    metrics: [
      'accuracy'
    ]

  })


  modelTrained =
    false


  console.log(
    'Modelo HANDVERSE creado ✅'
  )


  model.summary()


  return model

}

// ======================================================
// 5.1. DIVISIÓN ESTRATIFICADA DEL DATASET
// ======================================================
//
// Separa entrenamiento y validación manteniendo
// representación de los tres gestos.
//
// Con 30 muestras por gesto y validationRatio = 0.2:
//
// 24 → entrenamiento
// 6  → validación
//
// por cada gesto.
//
// De esta manera la validación no queda formada
// solamente por una clase.
// ======================================================

function createStratifiedSplit(
  inputs,
  labels,
  validationRatio = 0.2
) {

  const samplesByClass = new Map()


  // ----------------------------------------------------
  // AGRUPAR MUESTRAS SEGÚN SU CLASE
  // ----------------------------------------------------

  for (
    let index = 0;
    index < inputs.length;
    index++
  ) {

    const label =
      labels[index]


    if (
      !samplesByClass.has(
        label
      )
    ) {

      samplesByClass.set(
        label,
        []
      )

    }


    samplesByClass
      .get(label)
      .push({

        input:
          inputs[index],

        label

      })

  }


  const trainingSamples = []

  const validationSamples = []


  // ----------------------------------------------------
  // SEPARAR CADA CLASE INDIVIDUALMENTE
  // ----------------------------------------------------

  for (
    const samples
    of samplesByClass.values()
  ) {

    const shuffledSamples =
      [...samples]


    tf.util.shuffle(
      shuffledSamples
    )


    const validationCount =

      Math.min(

        shuffledSamples.length - 1,

        Math.max(

          1,

          Math.round(
            shuffledSamples.length *
            validationRatio
          )

        )

      )


    validationSamples.push(

      ...shuffledSamples.slice(
        0,
        validationCount
      )

    )


    trainingSamples.push(

      ...shuffledSamples.slice(
        validationCount
      )

    )

  }


  // ----------------------------------------------------
  // MEZCLAR ENTRENAMIENTO Y VALIDACIÓN
  // SIN PERDER LA RELACIÓN INPUT ↔ LABEL
  // ----------------------------------------------------

  tf.util.shuffle(
    trainingSamples
  )


  tf.util.shuffle(
    validationSamples
  )


  // ----------------------------------------------------
  // DEVOLVER ARRAYS
  // ----------------------------------------------------

  return {

    trainingInputs:
      trainingSamples.map(
        sample =>
          sample.input
      ),

    trainingLabels:
      trainingSamples.map(
        sample =>
          sample.label
      ),

    validationInputs:
      validationSamples.map(
        sample =>
          sample.input
      ),

    validationLabels:
      validationSamples.map(
        sample =>
          sample.label
      )

  }

}

// ======================================================
// 6. ENTRENAR MODELO
// ======================================================

export async function trainGestureModel(
  onEpoch = null
) {

  // TensorFlow se descarga/inicializa aquí
  // solamente cuando realmente vamos a entrenar.
  await initializeAI()


  if (
    trainingInProgress
  ) {

    throw new Error(
      'Ya existe un entrenamiento en progreso.'
    )

  }


  const trainingData =
    getTrainingData()


  const {
    inputs,
    labels
  } = trainingData


  // ----------------------------------------------------
  // Validar dataset
  // ----------------------------------------------------

  if (
    !inputs ||
    !labels ||
    inputs.length === 0 ||
    labels.length === 0
  ) {

    throw new Error(
      'El dataset está vacío.'
    )

  }


  if (
    inputs.length !==
    labels.length
  ) {

    throw new Error(
      'La cantidad de entradas y etiquetas no coincide.'
    )

  }


  // ----------------------------------------------------
  // Validar que cada entrada tenga 63 características
  // ----------------------------------------------------

  const invalidSample =
    inputs.find(
      sample =>
        !isValidFeatureVector(
          sample
        )
    )


  if (invalidSample) {

    throw new Error(
      'El dataset contiene una muestra inválida.'
    )

  }

  // ----------------------------------------------------
  // DIVIDIR DATASET DE FORMA EQUILIBRADA
  // ----------------------------------------------------

  const {

    trainingInputs,
    trainingLabels,
    validationInputs,
    validationLabels

  } = createStratifiedSplit(
    inputs,
    labels,
    0.2
  )


  console.log(
    '🧠 División del dataset HANDVERSE:',
    {
      entrenamiento:
        trainingInputs.length,

      validacion:
        validationInputs.length
    }
  )

  // ----------------------------------------------------
  // Crear nuevo modelo
  // ----------------------------------------------------

  createGestureModel()


  trainingInProgress =
    true


  let xs = null

  let labelTensor = null

  let ys = null


  let validationXs = null

  let validationLabelTensor = null

  let validationYs = null


  try {

    // --------------------------------------------------
    // Convertir datos JavaScript a tensores
    // --------------------------------------------------

    xs =
      tf.tensor2d(
        trainingInputs,
        [
          trainingInputs.length,
          INPUT_SIZE
        ],
        'float32'
      )


    labelTensor =
      tf.tensor1d(
        trainingLabels,
        'int32'
      )


    // Convierte:
    //
    // 0 → [1,0,0]
    // 1 → [0,1,0]
    // 2 → [0,0,1]

    ys =
      tf.oneHot(
        labelTensor,
        OUTPUT_SIZE
      )

    // ----------------------------------------------------
    // CREAR TENSORES DE VALIDACIÓN
    // ----------------------------------------------------

    validationXs =
      tf.tensor2d(
        validationInputs,
        [
          validationInputs.length,
          INPUT_SIZE
        ],
        'float32'
      )


    validationLabelTensor =
      tf.tensor1d(
        validationLabels,
        'int32'
      )


    validationYs =
      tf.oneHot(
        validationLabelTensor,
        OUTPUT_SIZE
      )


    console.log(
      `Entrenando HANDVERSE con ${inputs.length} muestras...`
    )

    console.log(
      '⚙️ Backend TensorFlow:',
      tf.getBackend()
    )

    const trainingStartTime =
      performance.now()

    console.log(
      '⏱️ Iniciando model.fit...'
    )
    // --------------------------------------------------
    // ENTRENAMIENTO
    // --------------------------------------------------

    const history =
      await model.fit(
        xs,
        ys,
        {

          epochs:
            trainingEpochs,

          batchSize:
            BATCH_SIZE,

          shuffle:
            true,

          validationData: [
            validationXs,
            validationYs
          ],

          callbacks: {

            onEpochEnd:
              async (
                epoch,
                logs
              ) => {

                const accuracy =
                  logs.acc ??
                  logs.accuracy ??
                  0


                const validationAccuracy =
                  logs.val_acc ??
                  logs.val_accuracy ??
                  0


                const loss =
                  logs.loss ??
                  0


                // ======================================================
                // EARLY STOPPING PARA MOVILES
                // Detener si la IA ya aprendió correctamente
                // ======================================================

                if (
                  isMobileDevice &&
                  epoch >= 9 &&
                  accuracy >= 0.98 &&
                  validationAccuracy >= 0.98
                ) {
                  consecutiveGoodEpochs += 1
                } else {
                  consecutiveGoodEpochs = 0
                }

                if (
                  isMobileDevice &&
                  consecutiveGoodEpochs >= 3
                ) {
                  console.log(
                    '📱 IA aprendida correctamente. Finalizando entrenamiento móvil.'
                  )

                  model.stopTraining = true
                }

                console.log(
                  `Epoch ${epoch + 1}/${trainingEpochs}`,
                  {
                    accuracy,
                    validationAccuracy,
                    loss
                  }
                )


                // Permite a main.js actualizar
                // la interfaz visual.

                if (
                  typeof onEpoch ===
                  'function'
                ) {

                  await onEpoch({

                    epoch:
                      epoch + 1,

                    totalEpochs:
                      trainingEpochs,

                    accuracy,

                    validationAccuracy,

                    loss

                  })
                  if (
                    isMobileDevice &&
                    epoch % 2 === 0
                  ) {
                    await tf.nextFrame()
                  }
                }

              }

          }

        }
      )

    const trainingEndTime =
      performance.now()

    console.log(
      '⏱️ Tiempo REAL de entrenamiento:',
      (
        (
          trainingEndTime -
          trainingStartTime
        ) / 1000
      ).toFixed(2),
      'segundos'
    )


    modelTrained =
      true


    console.log(
      'HANDVERSE entrenado correctamente ✅'
    )


    return {

      success:
        true,

      history,

      samples:
        inputs.length

    }


  } finally {

    // --------------------------------------------------
    // Liberar tensores utilizados durante entrenamiento
    // --------------------------------------------------

    if (xs) {
      xs.dispose()
    }

    if (labelTensor) {
      labelTensor.dispose()
    }

    if (ys) {
      ys.dispose()
    }

    if (validationXs) {
      validationXs.dispose()
    }

    if (validationLabelTensor) {
      validationLabelTensor.dispose()
    }

    if (validationYs) {
      validationYs.dispose()
    }


    trainingInProgress =
      false

  }

}

// ======================================================
// OPTIMIZACION DE ENTRENAMIENTO PARA MOVILES
// ======================================================

const isMobileDevice =
  typeof window !== 'undefined' &&
  window.matchMedia(
    '(max-width: 768px)'
  ).matches

const trainingEpochs =
  isMobileDevice
    ? Math.min(EPOCHS, 25)
    : EPOCHS

let consecutiveGoodEpochs = 0

console.log(
  '🧠 Configuración de entrenamiento:',
  {
    dispositivo:
      isMobileDevice
        ? 'MÓVIL'
        : 'ESCRITORIO',
    epochs:
      trainingEpochs,
    batchSize:
      BATCH_SIZE
  }
)


// ======================================================
// 7. PREDECIR A PARTIR DE FEATURES
// ======================================================

export function predictFeatures(
  features
) {

  if (
    !model ||
    !modelTrained
  ) {

    return null

  }


  if (
    !isValidFeatureVector(
      features
    )
  ) {

    return null

  }


  return tf.tidy(
    () => {

      // -----------------------------------------------
      // Crear tensor:
      //
      // [1, 63]
      // -----------------------------------------------

      const inputTensor =
        tf.tensor2d(
          [
            features
          ],
          [
            1,
            INPUT_SIZE
          ],
          'float32'
        )


      // -----------------------------------------------
      // Predicción
      // -----------------------------------------------

      const predictionTensor =
        model.predict(
          inputTensor
        )


      const probabilities =
        Array.from(
          predictionTensor.dataSync()
        )


      // -----------------------------------------------
      // Buscar clase con mayor probabilidad
      // -----------------------------------------------

      let bestClassId = 0

      let bestConfidence =
        probabilities[0]


      for (
        let index = 1;
        index <
        probabilities.length;
        index++
      ) {

        if (
          probabilities[index] >
          bestConfidence
        ) {

          bestConfidence =
            probabilities[index]

          bestClassId =
            index

        }

      }


      const gesture =
        CLASS_BY_ID[
        bestClassId
        ]


      return {

        classId:
          bestClassId,

        key:
          gesture?.key ??
          null,

        name:
          gesture?.name ??
          'DESCONOCIDO',

        emoji:
          gesture?.emoji ??
          '❓',

        confidence:
          bestConfidence,

        confidencePercent:
          bestConfidence * 100,

        probabilities

      }

    }
  )

}


// ======================================================
// 8. PREDECIR DIRECTAMENTE DESDE LOS 21 LANDMARKS
// ======================================================

export function predictGesture(
  landmarks
) {

  if (
    !landmarks ||
    landmarks.length !== 21
  ) {

    return null

  }


  let features


  try {

    features =
      landmarksToFeatureVector(
        landmarks
      )

  } catch (error) {

    console.error(
      'Error preparando landmarks para predicción:',
      error
    )

    return null

  }


  return predictFeatures(
    features
  )

}


// ======================================================
// 9. SABER SI EL MODELO ESTÁ ENTRENADO
// ======================================================

export function isModelTrained() {

  return modelTrained

}


// ======================================================
// 10. SABER SI ESTÁ ENTRENANDO
// ======================================================

export function isTraining() {

  return trainingInProgress

}


// ======================================================
// 11. OBTENER MODELO
// ======================================================

export function getModel() {

  return model

}


// ======================================================
// 12. INFORMACIÓN DEL MODELO
// ======================================================

export function getModelInfo() {

  return {

    inputSize:
      INPUT_SIZE,

    outputSize:
      OUTPUT_SIZE,

    epochs:
      EPOCHS,

    batchSize:
      BATCH_SIZE,

    trained:
      modelTrained,

    training:
      trainingInProgress,

    backend:
      tf
        ? tf.getBackend()
        : null

  }

}


// ======================================================
// 13. REINICIAR MODELO
// ======================================================

export function resetGestureModel() {

  if (model) {

    model.dispose()

  }


  model =
    null

  modelTrained =
    false

  trainingInProgress =
    false


  console.log(
    'Modelo HANDVERSE reiniciado.'
  )

}