// ======================================================
// HANDVERSE: AI BATTLE
// Modelo de Inteligencia Artificial
// TensorFlow.js
// ======================================================

import * as tf from '@tensorflow/tfjs'

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

  await tf.ready()

  console.log(
    'TensorFlow.js listo ✅'
  )

  console.log(
    'Backend:',
    tf.getBackend()
  )

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
// 6. ENTRENAR MODELO
// ======================================================

export async function trainGestureModel(
  onEpoch = null
) {

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
  // Crear nuevo modelo
  // ----------------------------------------------------

  createGestureModel()


  trainingInProgress =
    true


  let xs = null

  let labelTensor = null

  let ys = null


  try {

    // --------------------------------------------------
    // Convertir datos JavaScript a tensores
    // --------------------------------------------------

    xs =
      tf.tensor2d(
        inputs,
        [
          inputs.length,
          INPUT_SIZE
        ],
        'float32'
      )


    labelTensor =
      tf.tensor1d(
        labels,
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


    console.log(
      `Entrenando HANDVERSE con ${inputs.length} muestras...`
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
            EPOCHS,

          batchSize:
            BATCH_SIZE,

          shuffle:
            true,

          validationSplit:
            0.2,

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


                console.log(
                  `Epoch ${epoch + 1}/${EPOCHS}`,
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
                      EPOCHS,

                    accuracy,

                    validationAccuracy,

                    loss

                  })

                }

              }

          }

        }
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


    trainingInProgress =
      false

  }

}


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
      tf.getBackend()

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