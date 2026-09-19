// ======================================================
// HANDVERSE: AI BATTLE
// Validador geométrico de gestos para entrenamiento
// ======================================================
//
// OBJETIVO:
//
// Antes de guardar una muestra en el dataset,
// comprobar que la mano realmente corresponda
// al gesto que el estudiante está entrenando.
//
// Gestos:
//
// 🖐️ open_hand  = MANO ABIERTA
// ✊ fist       = PUÑO CERRADO
// 👍 thumbs_up  = PULGAR ARRIBA
//
// IMPORTANTE:
// Este archivo NO modifica el modelo neuronal.
// Solo funciona como filtro previo al dataset.
// ======================================================


// ======================================================
// 1. DISTANCIA 3D
// ======================================================

function distance3D(pointA, pointB) {

  if (!pointA || !pointB) {
    return 0
  }

  const dx = pointA.x - pointB.x
  const dy = pointA.y - pointB.y
  const dz = pointA.z - pointB.z

  return Math.sqrt(
    dx * dx +
    dy * dy +
    dz * dz
  )
}


// ======================================================
// 2. VALIDAR LANDMARKS DE MEDIAPIPE
// ======================================================

function hasValidLandmarks(landmarks) {

  if (!Array.isArray(landmarks)) {
    return false
  }

  if (landmarks.length !== 21) {
    return false
  }

  return landmarks.every(
    point =>
      point &&
      Number.isFinite(point.x) &&
      Number.isFinite(point.y) &&
      Number.isFinite(point.z)
  )
}


// ======================================================
// 3. DETECTAR SI UN DEDO ESTÁ EXTENDIDO
// ======================================================
//
// MediaPipe:
//
// ÍNDICE
// 5  MCP
// 6  PIP
// 7  DIP
// 8  TIP
//
// MEDIO
// 9  MCP
// 10 PIP
// 11 DIP
// 12 TIP
//
// ANULAR
// 13 MCP
// 14 PIP
// 15 DIP
// 16 TIP
//
// MEÑIQUE
// 17 MCP
// 18 PIP
// 19 DIP
// 20 TIP
//
// La detección se basa en distancias,
// no únicamente en coordenadas verticales.
// Esto permite que la mano tenga cierta inclinación.
// ======================================================

function isFingerExtended(
  landmarks,
  mcpIndex,
  pipIndex,
  tipIndex
) {

  const wrist = landmarks[0]

  const mcp = landmarks[mcpIndex]
  const pip = landmarks[pipIndex]
  const tip = landmarks[tipIndex]

  const wristToTip =
    distance3D(wrist, tip)

  const wristToPip =
    distance3D(wrist, pip)

  const mcpToTip =
    distance3D(mcp, tip)

  const mcpToPip =
    distance3D(mcp, pip)


  // El extremo del dedo debe encontrarse
  // claramente más lejos que la articulación PIP.

  const extendedFromWrist =
    wristToTip >
    wristToPip * 1.12

  const extendedFromMcp =
    mcpToTip >
    mcpToPip * 1.35


  return (
    extendedFromWrist &&
    extendedFromMcp
  )
}


// ======================================================
// 4. DETECTAR SI EL PULGAR ESTÁ EXTENDIDO
// ======================================================
//
// Pulgar:
//
// 1 CMC
// 2 MCP
// 3 IP
// 4 TIP
//
// Además usamos el índice MCP (5)
// para medir cuánto se separa el pulgar
// del resto de la mano.
// ======================================================

function isThumbExtended(landmarks) {

  const wrist = landmarks[0]

  const thumbMcp = landmarks[2]
  const thumbIp = landmarks[3]
  const thumbTip = landmarks[4]

  const indexMcp = landmarks[5]


  const wristToTip =
    distance3D(
      wrist,
      thumbTip
    )

  const wristToIp =
    distance3D(
      wrist,
      thumbIp
    )


  const thumbTipToIndex =
    distance3D(
      thumbTip,
      indexMcp
    )

  const thumbMcpToIndex =
    distance3D(
      thumbMcp,
      indexMcp
    )


  const extendedLength =
    wristToTip >
    wristToIp * 1.06


  const separatedFromPalm =
    thumbTipToIndex >
    thumbMcpToIndex * 1.15


  return (
    extendedLength &&
    separatedFromPalm
  )
}


// ======================================================
// 5. ANALIZAR ESTADO DE LOS CINCO DEDOS
// ======================================================

function analyzeFingers(landmarks) {

  const thumb =
    isThumbExtended(
      landmarks
    )

  const index =
    isFingerExtended(
      landmarks,
      5,
      6,
      8
    )

  const middle =
    isFingerExtended(
      landmarks,
      9,
      10,
      12
    )

  const ring =
    isFingerExtended(
      landmarks,
      13,
      14,
      16
    )

  const pinky =
    isFingerExtended(
      landmarks,
      17,
      18,
      20
    )


  const fourFingerCount = [
    index,
    middle,
    ring,
    pinky
  ].filter(Boolean).length


  return {
    thumb,
    index,
    middle,
    ring,
    pinky,
    fourFingerCount
  }
}


// ======================================================
// 6. CLASIFICAR GESTO GEOMÉTRICAMENTE
// ======================================================

export function detectTrainingGesture(
  landmarks
) {

  if (
    !hasValidLandmarks(
      landmarks
    )
  ) {

    return null
  }


  const fingers =
    analyzeFingers(
      landmarks
    )


  // ----------------------------------------------------
  // MANO ABIERTA
  //
  // Requerimos al menos 3 de los cuatro dedos
  // principales extendidos.
  //
  // Esto da tolerancia a pequeñas variaciones
  // del estudiante o de la cámara.
  // ----------------------------------------------------

  if (
    fingers.fourFingerCount >= 3
  ) {

    return 'open_hand'
  }


  // ----------------------------------------------------
  // PULGAR ARRIBA
  //
  // El pulgar debe estar extendido
  // y los otros cuatro dedos deben estar cerrados.
  // ----------------------------------------------------

  if (
    fingers.thumb &&
    fingers.fourFingerCount === 0
  ) {

    return 'thumbs_up'
  }


  // ----------------------------------------------------
  // PUÑO CERRADO
  //
  // Los cuatro dedos principales deben
  // permanecer cerrados.
  //
  // El pulgar puede variar ligeramente de posición,
  // porque algunas personas cierran el puño
  // con el pulgar encima y otras hacia un lado.
  // ----------------------------------------------------

  if (
    fingers.fourFingerCount === 0
  ) {

    return 'fist'
  }


  // ----------------------------------------------------
  // POSTURA AMBIGUA
  // ----------------------------------------------------

  return null
}


// ======================================================
// 7. VALIDAR EL GESTO SOLICITADO
// ======================================================

export function validateTrainingGesture(
  expectedGestureKey,
  landmarks
) {

  const detectedGesture =
    detectTrainingGesture(
      landmarks
    )


  if (!detectedGesture) {

    return {
      valid: false,
      detectedGesture: null,
      reason:
        'No se reconoce claramente el gesto.'
    }
  }


  if (
    detectedGesture !==
    expectedGestureKey
  ) {

    return {
      valid: false,
      detectedGesture,
      reason:
        'El gesto mostrado no corresponde al gesto que estás entrenando.'
    }
  }


  return {
    valid: true,
    detectedGesture,
    reason:
      'Gesto correcto.'
  }
}


// ======================================================
// 8. NOMBRE VISUAL DEL GESTO
// ======================================================

export function getTrainingGestureName(
  gestureKey
) {

  switch (gestureKey) {

    case 'open_hand':
      return '🖐️ MANO ABIERTA'

    case 'fist':
      return '✊ PUÑO CERRADO'

    case 'thumbs_up':
      return '👍 PULGAR ARRIBA'

    default:
      return 'GESTO DESCONOCIDO'
  }
}