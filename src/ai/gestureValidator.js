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
// VECTOR 3D ENTRE DOS LANDMARKS
// ======================================================
//
// Nos permite conocer hacia qué dirección
// apunta una parte de la mano.
// ======================================================

function vector3D(fromPoint, toPoint) {

  return {

    x:
      toPoint.x -
      fromPoint.x,

    y:
      toPoint.y -
      fromPoint.y,

    z:
      toPoint.z -
      fromPoint.z

  }
}


// ======================================================
// SIMILITUD DE DIRECCIÓN ENTRE DOS VECTORES
// ======================================================
//
// Resultado aproximado:
//
//  1  = misma dirección
//  0  = direcciones perpendiculares
// -1  = direcciones opuestas
//
// Esto nos ayudará después a distinguir:
//
// ✊ pulgar lateral / sobre los dedos
//
// de
//
// 👍 pulgar realmente levantado.
// ======================================================

function cosineSimilarity3D(
  vectorA,
  vectorB
) {

  const dotProduct =

    vectorA.x * vectorB.x +
    vectorA.y * vectorB.y +
    vectorA.z * vectorB.z


  const lengthA =

    Math.sqrt(

      vectorA.x * vectorA.x +
      vectorA.y * vectorA.y +
      vectorA.z * vectorA.z

    )


  const lengthB =

    Math.sqrt(

      vectorB.x * vectorB.x +
      vectorB.y * vectorB.y +
      vectorB.z * vectorB.z

    )


  if (
    lengthA < 0.000001 ||
    lengthB < 0.000001
  ) {

    return 0
  }


  return (
    dotProduct /
    (lengthA * lengthB)
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
// DETECTAR SI EL PULGAR APUNTA COMO 👍
// ======================================================
//
// isThumbExtended() solamente comprueba si el pulgar
// está extendido y separado.
//
// Esta segunda comprobación analiza su DIRECCIÓN.
//
// Comparamos:
//
// muñeca (0) → base del dedo medio (9)
//          con
// MCP del pulgar (2) → punta del pulgar (4)
//
// Así intentamos diferenciar:
//
// ✊ pulgar atravesado / encima de los dedos
//
// de:
//
// 👍 pulgar claramente levantado.
//
// La comparación es relativa a la propia mano,
// no a la pantalla.
// ======================================================

function isThumbPointingUpRelativeToHand(
  landmarks
) {

  const wrist =
    landmarks[0]

  const middleMcp =
    landmarks[9]

  const thumbMcp =
    landmarks[2]

  const thumbTip =
    landmarks[4]


  // Dirección principal de la mano.

  const palmDirection =

    vector3D(
      wrist,
      middleMcp
    )


  // Dirección del pulgar.

  const thumbDirection =

    vector3D(
      thumbMcp,
      thumbTip
    )


  // Comparar ambas direcciones.

  const alignment =

    cosineSimilarity3D(
      thumbDirection,
      palmDirection
    )


  // Cuanto más cerca de 1,
  // más apunta el pulgar en la misma dirección
  // principal de la mano.
  //
  // 0.45 deja cierto margen natural
  // de inclinación.

  return alignment >= 0.45
}


// ======================================================
// 5. ANALIZAR ESTADO DE LOS CINCO DEDOS
// ======================================================

function analyzeFingers(landmarks) {

  const thumb =
    isThumbExtended(
      landmarks
    )

  const thumbUp =

    thumb &&

    isThumbPointingUpRelativeToHand(
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
    thumbUp,
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

    fingers.thumbUp &&

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
// CONFIANZA GEOMÉTRICA DEL GESTO
// ======================================================
//
// Esta función NO reemplaza la confianza de la IA.
//
// Evalúa qué tan correctamente está colocada
// físicamente la mano para el gesto predicho.
//
// Resultado:
//
// 1.00 = postura geométrica excelente
// 0.80 = postura bastante correcta
// 0.50 = postura dudosa
// 0.00 = postura incompatible
//
// Después MAIN.JS combinará:
//
// confianza neuronal + confianza geométrica
//
// ======================================================

export function getGestureGeometryConfidence(
  gestureKey,
  landmarks
) {

  // ----------------------------------------------------
  // LANDMARKS INVÁLIDOS
  // ----------------------------------------------------

  if (!hasValidLandmarks(landmarks)) {
    return 0
  }


  // ----------------------------------------------------
  // ANALIZAR LOS CINCO DEDOS
  // ----------------------------------------------------

  const fingers =
    analyzeFingers(
      landmarks
    )


  const extendedFingerCount =
    fingers.fourFingerCount


  const closedFingerCount =
    4 - extendedFingerCount


  let geometryScore = 0


  // ----------------------------------------------------
  // 🖐️ MANO ABIERTA / ESCUDO
  // ----------------------------------------------------

  if (gestureKey === 'open_hand') {

    // Cuantos más dedos principales estén abiertos,
    // mayor será la calidad geométrica.

    geometryScore =
      extendedFingerCount / 4


    // Si el pulgar también está separado,
    // damos una pequeña bonificación.

    if (fingers.thumb) {

      geometryScore =
        Math.min(
          1,
          geometryScore + 0.08
        )

    }

  }


  // ----------------------------------------------------
  // ✊ PUÑO CERRADO / ATAQUE
  // ----------------------------------------------------

  else if (gestureKey === 'fist') {

    // Cuantos más dedos estén cerrados,
    // mejor formado está el puño.

    geometryScore =
      closedFingerCount / 4


    // Si realmente parece pulgar arriba,
    // penalizamos fuertemente el puño.

    if (fingers.thumbUp) {

      geometryScore *= 0.35

    }

  }


  // ----------------------------------------------------
  // 👍 PULGAR ARRIBA / PODER
  // ----------------------------------------------------

  else if (gestureKey === 'thumbs_up') {

    // Los cuatro dedos cerrados representan
    // el 65 % de la calidad.

    const closedScore =
      closedFingerCount / 4


    // La orientación correcta del pulgar
    // representa el otro 35 %.

    const thumbScore =
      fingers.thumbUp
        ? 1
        : 0


    geometryScore =
      closedScore * 0.65 +
      thumbScore * 0.35

  }


  // ----------------------------------------------------
  // GESTO DESCONOCIDO
  // ----------------------------------------------------

  else {

    return 0

  }


  // ----------------------------------------------------
  // COMPARAR CON EL CLASIFICADOR GEOMÉTRICO
  // ----------------------------------------------------

  const geometricGesture =
    detectTrainingGesture(
      landmarks
    )


  // La geometría no reconoce claramente la postura.

  if (!geometricGesture) {

    geometryScore *= 0.5

  }


  // La geometría reconoce OTRO gesto.

  else if (
    geometricGesture !== gestureKey
  ) {

    geometryScore *= 0.35

  }


  // ----------------------------------------------------
  // GARANTIZAR RANGO 0 → 1
  // ----------------------------------------------------

  return Math.max(
    0,
    Math.min(
      1,
      geometryScore
    )
  )
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