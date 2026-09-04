// ======================================================
// HANDVERSE: AI BATTLE
// Dataset para entrenamiento de gestos
// ======================================================

import {
  landmarksToFeatureVector,
  isValidFeatureVector,
  GESTURE_CLASSES
} from './features.js'


// ======================================================
// 1. CONFIGURACIÓN DEL DATASET
// ======================================================

// Para la demostración inicial utilizaremos
// 30 ejemplos por cada gesto.
//
// 30 mano abierta
// 30 puño cerrado
// 30 pulgar arriba
//
// Total inicial: 90 muestras

export const TARGET_SAMPLES_PER_CLASS = 30


// Límite de seguridad.
// Evita almacenar indefinidamente cientos
// de muestras accidentalmente.

export const MAX_SAMPLES_PER_CLASS = 100


// ======================================================
// 2. CREAR ESTRUCTURA DEL DATASET
// ======================================================

const dataset = {

  open_hand: [],

  fist: [],

  thumbs_up: []

}


// ======================================================
// 3. OBTENER INFORMACIÓN DE UNA CLASE
// ======================================================

function getGestureClassByKey(
  gestureKey
) {

  return Object.values(
    GESTURE_CLASSES
  ).find(
    gesture =>
      gesture.key === gestureKey
  )

}


// ======================================================
// 4. VALIDAR NOMBRE DEL GESTO
// ======================================================

export function isValidGestureKey(
  gestureKey
) {

  return Boolean(
    getGestureClassByKey(
      gestureKey
    )
  )

}


// ======================================================
// 5. AGREGAR UNA MUESTRA
// ======================================================

export function addSample(
  gestureKey,
  landmarks
) {

  // ----------------------------------------------------
  // Validar clase
  // ----------------------------------------------------

  if (
    !isValidGestureKey(
      gestureKey
    )
  ) {

    console.error(
      `Gesto no válido: ${gestureKey}`
    )

    return false

  }


  // ----------------------------------------------------
  // Comprobar límite
  // ----------------------------------------------------

  if (
    dataset[gestureKey].length >=
    MAX_SAMPLES_PER_CLASS
  ) {

    console.warn(
      `Se alcanzó el límite de muestras para ${gestureKey}`
    )

    return false

  }


  // ----------------------------------------------------
  // Convertir los 21 landmarks
  // en 63 características normalizadas
  // ----------------------------------------------------

  let features


  try {

    features =
      landmarksToFeatureVector(
        landmarks
      )

  } catch (error) {

    console.error(
      'No se pudieron procesar los landmarks:',
      error
    )

    return false

  }


  // ----------------------------------------------------
  // Validar vector
  // ----------------------------------------------------

  if (
    !isValidFeatureVector(
      features
    )
  ) {

    console.error(
      'El vector generado no contiene 63 valores válidos'
    )

    return false

  }


  // ----------------------------------------------------
  // Guardar muestra
  // ----------------------------------------------------

  dataset[gestureKey].push(
    features
  )


  return true

}


// ======================================================
// 6. OBTENER CANTIDAD DE MUESTRAS DE UN GESTO
// ======================================================

export function getSampleCount(
  gestureKey
) {

  if (
    !isValidGestureKey(
      gestureKey
    )
  ) {

    return 0

  }


  return dataset[
    gestureKey
  ].length

}


// ======================================================
// 7. OBTENER TOTAL GENERAL DE MUESTRAS
// ======================================================

export function getTotalSampleCount() {

  return (
    dataset.open_hand.length +
    dataset.fist.length +
    dataset.thumbs_up.length
  )

}


// ======================================================
// 8. OBTENER RESUMEN DEL DATASET
// ======================================================

export function getDatasetSummary() {

  return {

    open_hand:
      dataset.open_hand.length,

    fist:
      dataset.fist.length,

    thumbs_up:
      dataset.thumbs_up.length,

    total:
      getTotalSampleCount(),

    targetPerClass:
      TARGET_SAMPLES_PER_CLASS

  }

}


// ======================================================
// 9. COMPROBAR SI UNA CLASE ESTÁ COMPLETA
// ======================================================

export function isGestureReady(
  gestureKey
) {

  if (
    !isValidGestureKey(
      gestureKey
    )
  ) {

    return false

  }


  return (
    dataset[gestureKey].length >=
    TARGET_SAMPLES_PER_CLASS
  )

}


// ======================================================
// 10. COMPROBAR SI TODO EL DATASET ESTÁ LISTO
// ======================================================

export function isDatasetReady() {

  return (

    isGestureReady(
      GESTURE_CLASSES.OPEN_HAND.key
    ) &&

    isGestureReady(
      GESTURE_CLASSES.FIST.key
    ) &&

    isGestureReady(
      GESTURE_CLASSES.THUMBS_UP.key
    )

  )

}


// ======================================================
// 11. OBTENER DATOS PARA MACHINE LEARNING
// ======================================================

export function getTrainingData() {

  const inputs = []

  const labels = []


  // ----------------------------------------------------
  // Mano abierta
  // ----------------------------------------------------

  for (
    const features
    of dataset.open_hand
  ) {

    inputs.push(
      [...features]
    )

    labels.push(
      GESTURE_CLASSES.OPEN_HAND.id
    )

  }


  // ----------------------------------------------------
  // Puño cerrado
  // ----------------------------------------------------

  for (
    const features
    of dataset.fist
  ) {

    inputs.push(
      [...features]
    )

    labels.push(
      GESTURE_CLASSES.FIST.id
    )

  }


  // ----------------------------------------------------
  // Pulgar arriba
  // ----------------------------------------------------

  for (
    const features
    of dataset.thumbs_up
  ) {

    inputs.push(
      [...features]
    )

    labels.push(
      GESTURE_CLASSES.THUMBS_UP.id
    )

  }


  return {

    inputs,

    labels

  }

}


// ======================================================
// 12. ELIMINAR MUESTRAS DE UN GESTO
// ======================================================

export function clearGestureSamples(
  gestureKey
) {

  if (
    !isValidGestureKey(
      gestureKey
    )
  ) {

    return false

  }


  dataset[gestureKey] = []


  return true

}


// ======================================================
// 13. REINICIAR TODO EL DATASET
// ======================================================

export function clearDataset() {

  dataset.open_hand = []

  dataset.fist = []

  dataset.thumbs_up = []

}


// ======================================================
// 14. OBTENER COPIA DEL DATASET
// ======================================================

export function getDatasetSnapshot() {

  return {

    open_hand:
      dataset.open_hand.map(
        sample => [...sample]
      ),

    fist:
      dataset.fist.map(
        sample => [...sample]
      ),

    thumbs_up:
      dataset.thumbs_up.map(
        sample => [...sample]
      )

  }

}