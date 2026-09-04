// ======================================================
// HANDVERSE: AI BATTLE
// Extracción y normalización de características
// ======================================================


// ======================================================
// 1. DISTANCIA 3D ENTRE DOS PUNTOS
// ======================================================

function distance3D(pointA, pointB) {

  const dx =
    pointA.x - pointB.x

  const dy =
    pointA.y - pointB.y

  const dz =
    pointA.z - pointB.z


  return Math.sqrt(
    dx * dx +
    dy * dy +
    dz * dz
  )

}


// ======================================================
// 2. VALIDAR LANDMARKS
// ======================================================

function validateLandmarks(landmarks) {

  if (!Array.isArray(landmarks)) {
    return false
  }


  if (landmarks.length !== 21) {
    return false
  }


  for (const point of landmarks) {

    if (
      typeof point.x !== 'number' ||
      typeof point.y !== 'number' ||
      typeof point.z !== 'number'
    ) {

      return false

    }

  }


  return true

}


// ======================================================
// 3. NORMALIZAR LANDMARKS
// ======================================================

export function normalizeLandmarks(
  landmarks
) {

  if (!validateLandmarks(landmarks)) {

    throw new Error(
      'HANDVERSE esperaba exactamente 21 landmarks válidos'
    )

  }


  // ----------------------------------------------------
  // Usamos la muñeca (landmark 0) como origen
  // ----------------------------------------------------

  const wrist =
    landmarks[0]


  const translated =
    landmarks.map(
      point => ({

        x:
          point.x -
          wrist.x,

        y:
          point.y -
          wrist.y,

        z:
          point.z -
          wrist.z

      })
    )


  // ----------------------------------------------------
  // Calcular escala de la mano
  //
  // Utilizamos la distancia entre:
  // landmark 0 = muñeca
  // landmark 9 = base del dedo medio
  // ----------------------------------------------------

  const scale =
    distance3D(
      landmarks[0],
      landmarks[9]
    )


  // Evitar divisiones entre cero

  const safeScale =
    scale > 0.000001
      ? scale
      : 1


  // ----------------------------------------------------
  // Normalizar tamaño
  // ----------------------------------------------------

  const normalized =
    translated.map(
      point => ({

        x:
          point.x /
          safeScale,

        y:
          point.y /
          safeScale,

        z:
          point.z /
          safeScale

      })
    )


  return normalized

}


// ======================================================
// 4. CONVERTIR LA MANO EN VECTOR PARA MACHINE LEARNING
// ======================================================

export function landmarksToFeatureVector(
  landmarks
) {

  const normalized =
    normalizeLandmarks(
      landmarks
    )


  const features = []


  for (
    const point
    of normalized
  ) {

    features.push(
      point.x,
      point.y,
      point.z
    )

  }


  return features

}


// ======================================================
// 5. VALIDAR VECTOR FINAL
// ======================================================

export function isValidFeatureVector(
  features
) {

  if (!Array.isArray(features)) {
    return false
  }


  // 21 landmarks × XYZ
  if (features.length !== 63) {
    return false
  }


  return features.every(
    value =>
      Number.isFinite(value)
  )

}


// ======================================================
// 6. NOMBRES DE LAS CLASES
// ======================================================

export const GESTURE_CLASSES = {

  OPEN_HAND: {
    id: 0,
    key: 'open_hand',
    name: 'MANO ABIERTA',
    emoji: '🖐️'
  },


  FIST: {
    id: 1,
    key: 'fist',
    name: 'PUÑO CERRADO',
    emoji: '✊'
  },


  THUMBS_UP: {
    id: 2,
    key: 'thumbs_up',
    name: 'PULGAR ARRIBA',
    emoji: '👍'
  }

}


// ======================================================
// 7. INFORMACIÓN DEL VECTOR
// ======================================================

export function getFeatureInfo() {

  return {

    landmarks:
      21,

    coordinatesPerLandmark:
      3,

    featureCount:
      63,

    classes:
      Object.keys(
        GESTURE_CLASSES
      ).length

  }

}