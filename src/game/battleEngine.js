// ============================================================
// HANDVERSE: AI BATTLE
// Motor principal de batalla
// ============================================================


// ============================================================
// 1. CONFIGURACIÓN GENERAL
// ============================================================

export const BATTLE_CONFIG = {

  // Vida con la que comienza cada participante
  // al iniciar una nueva ronda.
  INITIAL_HEALTH: 100,

  // Daño recibido cuando se pierde un turno.
  DAMAGE_PER_TURN: 20,

  // Mejor de 3:
  // el primero que gane 2 rondas gana la partida.
  ROUNDS_TO_WIN: 2,

  // Tiempo para mostrar quién ganó una ronda
  // antes de permitir comenzar la siguiente.
  ROUND_TRANSITION_DELAY_MS: 1800
}


// ============================================================
// 2. ACCIONES DISPONIBLES
// ============================================================

export const BATTLE_ACTIONS = {

  ATTACK: {
    key: 'attack',
    name: 'ATAQUE',
    gesture: 'fist',
    emoji: '✊'
  },

  SHIELD: {
    key: 'shield',
    name: 'ESCUDO',
    gesture: 'open_hand',
    emoji: '🖐️'
  },

  POWER: {
    key: 'power',
    name: 'PODER',
    gesture: 'thumbs_up',
    emoji: '👍'
  }
}


// ============================================================
// 3. CREAR ESTADO INICIAL
// ============================================================

function createInitialBattleState() {

  return {

    // --------------------------------------------------------
    // VIDA DE LA RONDA ACTUAL
    // --------------------------------------------------------

    playerHealth:
      BATTLE_CONFIG.INITIAL_HEALTH,

    aiHealth:
      BATTLE_CONFIG.INITIAL_HEALTH,


    // --------------------------------------------------------
    // RONDA ACTUAL
    // --------------------------------------------------------

    // La partida comienza en RONDA 1.
    round: 1,


    // --------------------------------------------------------
    // TURNOS DE LA RONDA
    // --------------------------------------------------------

    // Cada gesto aceptado es un turno.
    // Los turnos NO cambian el número de ronda.
    turn: 0,


    // --------------------------------------------------------
    // MARCADOR GENERAL
    // --------------------------------------------------------

    playerRoundsWon: 0,

    aiRoundsWon: 0,

    // --------------------------------------------------------
    // CONTROL DEL PODER ESPECIAL
    // --------------------------------------------------------

    // Cada participante puede utilizar
    // 👍 PODER solamente una vez por ronda.

    playerPowerUsed: false,

    aiPowerUsed: false,


    // --------------------------------------------------------
    // MOVIMIENTOS
    // --------------------------------------------------------

    playerAction: null,

    aiAction: null,


    // --------------------------------------------------------
    // GANADOR DEL ÚLTIMO TURNO
    // --------------------------------------------------------

    // player
    // ai
    // draw
    turnWinner: null,


    // --------------------------------------------------------
    // GANADOR DE LA RONDA COMPLETA
    // --------------------------------------------------------

    // Solamente tendrá valor cuando
    // alguien llegue a 0 de vida.
    roundWinner: null,


    // --------------------------------------------------------
    // ESTADO DE RONDA
    // --------------------------------------------------------

    roundFinished: false,

    roundEndedAt: null,


    // --------------------------------------------------------
    // GANADOR DE TODA LA PARTIDA
    // --------------------------------------------------------

    winner: null,


    // --------------------------------------------------------
    // ESTADO GENERAL
    // --------------------------------------------------------

    battleStarted: false,

    battleFinished: false
  }
}


// ============================================================
// 4. ESTADO ACTUAL
// ============================================================

let battleState =
  createInitialBattleState()


// ============================================================
// 5. REINICIAR TODA LA PARTIDA
// ============================================================

export function resetBattle() {

  battleState =
    createInitialBattleState()


  console.log(
    '⚔️ Batalla HANDVERSE reiniciada'
  )


  return getBattleState()
}


// ============================================================
// 6. INICIAR PARTIDA
// ============================================================

export function startBattle() {

  // Reiniciamos absolutamente todo.
  resetBattle()


  // Activamos la batalla.
  battleState.battleStarted = true


  console.log(
    '🔥 BATALLA HANDVERSE INICIADA'
  )


  return getBattleState()
}


// ============================================================
// 7. CONVERTIR GESTO EN ACCIÓN
// ============================================================

export function gestureToBattleAction(
  gesture
) {

  switch (gesture) {

    case 'fist':

      return BATTLE_ACTIONS.ATTACK


    case 'open_hand':

      return BATTLE_ACTIONS.SHIELD


    case 'thumbs_up':

      return BATTLE_ACTIONS.POWER


    default:

      return null
  }
}


/// ============================================================
// 8. GENERAR MOVIMIENTO DE HANDVERSE IA
// ============================================================

export function generateAIAction() {

  // ATAQUE y ESCUDO siempre están disponibles.

  const actions = [
    BATTLE_ACTIONS.ATTACK,
    BATTLE_ACTIONS.SHIELD
  ]


  // PODER solamente está disponible
  // si HANDVERSE todavía NO lo utilizó
  // durante la ronda actual.

  if (
    !battleState.aiPowerUsed
  ) {

    actions.push(
      BATTLE_ACTIONS.POWER
    )

  }


  // HANDVERSE selecciona aleatoriamente
  // uno de los movimientos disponibles.

  const randomIndex =

    Math.floor(
      Math.random() *
      actions.length
    )


  return actions[randomIndex]
}


// ============================================================
// 9. DETERMINAR GANADOR DE UN TURNO
//
// REGLAS:
//
// ✊ ATAQUE vence a 👍 PODER
//
// 👍 PODER vence a 🖐️ ESCUDO
//
// 🖐️ ESCUDO vence a ✊ ATAQUE
//
// MISMO MOVIMIENTO = EMPATE
// ============================================================

export function determineRoundWinner(
  playerAction,
  aiAction
) {

  // ----------------------------------------------------------
  // SEGURIDAD
  // ----------------------------------------------------------

  if (
    !playerAction ||
    !aiAction
  ) {

    return null
  }


  // ----------------------------------------------------------
  // EMPATE
  // ----------------------------------------------------------

  if (
    playerAction.key ===
    aiAction.key
  ) {

    return 'draw'
  }


  // ----------------------------------------------------------
  // ATAQUE VENCE A PODER
  // ----------------------------------------------------------

  if (
    playerAction.key === 'attack' &&
    aiAction.key === 'power'
  ) {

    return 'player'
  }


  // ----------------------------------------------------------
  // PODER VENCE A ESCUDO
  // ----------------------------------------------------------

  if (
    playerAction.key === 'power' &&
    aiAction.key === 'shield'
  ) {

    return 'player'
  }


  // ----------------------------------------------------------
  // ESCUDO VENCE A ATAQUE
  // ----------------------------------------------------------

  if (
    playerAction.key === 'shield' &&
    aiAction.key === 'attack'
  ) {

    return 'player'
  }


  // ----------------------------------------------------------
  // SI NO GANÓ EL ESTUDIANTE,
  // GANA HANDVERSE IA
  // ----------------------------------------------------------

  return 'ai'
}


// ============================================================
// 10. ALIAS CON NOMBRE MÁS CORRECTO
// ============================================================
//
// Conservamos determineRoundWinner()
// porque tu main.js puede estar importándolo.
//
// Pero realmente esta función determina
// el ganador de un TURNO.
//
// ============================================================

export const determineTurnWinner =
  determineRoundWinner


// ============================================================
// 11. EJECUTAR UN TURNO DE BATALLA
//
// IMPORTANTE:
//
// CADA GESTO = UN TURNO
//
// UN TURNO NO CAMBIA LA RONDA.
//
// LA RONDA SOLAMENTE TERMINA
// CUANDO UNA VIDA LLEGA A 0.
// ============================================================

export function playBattleTurn(
  gesture
) {

  // ==========================================================
  // COMPROBAR QUE LA PARTIDA COMENZÓ
  // ==========================================================

  if (
    !battleState.battleStarted
  ) {

    return {

      success: false,

      message:
        'La batalla todavía no ha comenzado.',

      ...getBattleState()
    }
  }


  // ==========================================================
  // COMPROBAR SI TODA LA PARTIDA TERMINÓ
  // ==========================================================

  if (
    battleState.battleFinished
  ) {

    return {

      success: false,

      message:
        'La batalla ya terminó.',

      ...getBattleState()
    }
  }


  // ==========================================================
  // SI LA RONDA ANTERIOR TERMINÓ
  // ==========================================================
  //
  // Aquí evitamos que el mismo gesto
  // inmediatamente cause daño en la siguiente ronda.
  //
  // Primero mostramos el ganador aproximadamente
  // 1.8 segundos.
  //
  // Después preparamos RONDA 2, RONDA 3, etc.
  //
  // ==========================================================

  if (
    battleState.roundFinished
  ) {

    const elapsed =

      battleState.roundEndedAt

        ? Date.now() -
        battleState.roundEndedAt

        : BATTLE_CONFIG
          .ROUND_TRANSITION_DELAY_MS


    // --------------------------------------------------------
    // TODAVÍA ESTAMOS MOSTRANDO
    // EL RESULTADO DE LA RONDA
    // --------------------------------------------------------

    if (
      elapsed <
      BATTLE_CONFIG
        .ROUND_TRANSITION_DELAY_MS
    ) {

      return {

        success: false,

        waitingNextRound: true,

        remainingMs:

          BATTLE_CONFIG
            .ROUND_TRANSITION_DELAY_MS -
          elapsed,

        message:
          buildRoundFinishedMessage(),

        ...getBattleState()
      }
    }


    // --------------------------------------------------------
    // YA PODEMOS PASAR A LA SIGUIENTE RONDA
    // --------------------------------------------------------

    return startNextRound()
  }


  // ==========================================================
  // CONVERTIR GESTO DEL ESTUDIANTE EN ACCIÓN
  // ==========================================================

  const playerAction =

    gestureToBattleAction(
      gesture
    )


  // ==========================================================
  // VALIDAR GESTO
  // ==========================================================

  if (
    !playerAction
  ) {

    return {

      success: false,

      message:
        'Gesto no reconocido para batalla.',

      ...getBattleState()
    }
  }

  // ==========================================================
  // COMPROBAR PODER ESPECIAL DEL ESTUDIANTE
  // ==========================================================

  if (
    playerAction.key === 'power' &&
    battleState.playerPowerUsed
  ) {

    return {

      success: false,

      powerAlreadyUsed: true,

      message:
        '👍 Ya utilizaste tu PODER ESPECIAL en esta ronda.',

      ...getBattleState()

    }

  }

  // ==========================================================
  // HANDVERSE IA ELIGE MOVIMIENTO
  // ==========================================================

  const aiAction =
    generateAIAction()

  // ==========================================================
  // REGISTRAR USO DEL PODER ESPECIAL
  // ==========================================================

  // Si el estudiante utilizó PODER,
  // queda gastado durante esta ronda.

  if (
    playerAction.key === 'power'
  ) {

    battleState.playerPowerUsed =
      true

  }


  // Si HANDVERSE utilizó PODER,
  // también queda gastado durante esta ronda.

  if (
    aiAction.key === 'power'
  ) {

    battleState.aiPowerUsed =
      true

  }

  // ==========================================================
  // GUARDAR MOVIMIENTOS
  // ==========================================================

  battleState.playerAction =
    playerAction

  battleState.aiAction =
    aiAction


  // ==========================================================
  // AUMENTAR TURNO
  //
  // IMPORTANTE:
  // AQUÍ NO AUMENTAMOS LA RONDA.
  // ==========================================================

  battleState.turn++


  // ==========================================================
  // DETERMINAR GANADOR DEL TURNO
  // ==========================================================

  const turnWinner =

    determineRoundWinner(

      playerAction,

      aiAction
    )


  battleState.turnWinner =
    turnWinner


  // ==========================================================
  // APLICAR DAÑO
  // ==========================================================


  // ----------------------------------------------------------
  // GANA EL ESTUDIANTE
  // HANDVERSE PIERDE 20 DE VIDA
  // ----------------------------------------------------------

  if (
    turnWinner === 'player'
  ) {

    battleState.aiHealth -=

      BATTLE_CONFIG
        .DAMAGE_PER_TURN
  }


  // ----------------------------------------------------------
  // GANA HANDVERSE
  // EL ESTUDIANTE PIERDE 20 DE VIDA
  // ----------------------------------------------------------

  else if (
    turnWinner === 'ai'
  ) {

    battleState.playerHealth -=

      BATTLE_CONFIG
        .DAMAGE_PER_TURN
  }


  // ----------------------------------------------------------
  // EMPATE
  //
  // Nadie pierde vida.
  // ----------------------------------------------------------


  // ==========================================================
  // EVITAR VIDAS NEGATIVAS
  // ==========================================================

  battleState.playerHealth =

    Math.max(

      0,

      battleState.playerHealth
    )


  battleState.aiHealth =

    Math.max(

      0,

      battleState.aiHealth
    )


  // ==========================================================
  // COMPROBAR SI TERMINÓ LA RONDA
  // ==========================================================

  checkRoundEnd()


  // ==========================================================
  // RESULTADO PARA MAIN.JS
  // ==========================================================

  const result = {

    success: true,


    // --------------------------------------------------------
    // ESTADO COMPLETO
    // --------------------------------------------------------

    ...getBattleState(),


    // --------------------------------------------------------
    // MOVIMIENTOS DE ESTE TURNO
    // --------------------------------------------------------

    playerAction: {
      ...playerAction
    },


    aiAction: {
      ...aiAction
    },


    // --------------------------------------------------------
    // GANADOR DEL TURNO
    // --------------------------------------------------------

    turnWinner,


    // --------------------------------------------------------
    // MENSAJE PARA INTERFAZ
    // --------------------------------------------------------

    message:
      buildTurnMessage(
        turnWinner
      )
  }


  console.log(

    '⚔️ TURNO HANDVERSE:',

    result
  )


  return result
}


// ============================================================
// 12. COMPROBAR SI TERMINÓ LA RONDA
// ============================================================
//
// LA RONDA SOLAMENTE TERMINA CUANDO:
//
// Jugador = 0 HP
//
// o
//
// HANDVERSE = 0 HP
//
// ============================================================

function checkRoundEnd() {

  // ----------------------------------------------------------
  // EVITAMOS CONTABILIZAR DOS VECES
  // LA MISMA RONDA
  // ----------------------------------------------------------

  if (
    battleState.roundFinished ||
    battleState.battleFinished
  ) {

    return
  }


  // ==========================================================
  // ESTUDIANTE GANA LA RONDA
  // ==========================================================

  if (
    battleState.aiHealth <= 0
  ) {

    // Dejamos exactamente 0.
    battleState.aiHealth = 0


    // Marcamos ronda terminada.
    battleState.roundFinished =
      true


    // Guardamos ganador.
    battleState.roundWinner =
      'player'


    // Sumamos una ronda ganada.
    battleState.playerRoundsWon++


    // Guardamos momento en que terminó.
    battleState.roundEndedAt =
      Date.now()


    console.log(

      `🏆 ESTUDIANTE GANÓ LA RONDA ${battleState.round}`
    )


    // Verificamos si además ganó
    // toda la partida.
    checkMatchWinner()


    return
  }


  // ==========================================================
  // HANDVERSE IA GANA LA RONDA
  // ==========================================================

  if (
    battleState.playerHealth <= 0
  ) {

    // Dejamos exactamente 0.
    battleState.playerHealth = 0


    // Marcamos ronda terminada.
    battleState.roundFinished =
      true


    // Guardamos ganador.
    battleState.roundWinner =
      'ai'


    // Sumamos una ronda ganada.
    battleState.aiRoundsWon++


    // Guardamos momento.
    battleState.roundEndedAt =
      Date.now()


    console.log(

      `🤖 HANDVERSE IA GANÓ LA RONDA ${battleState.round}`
    )


    // Verificar ganador final.
    checkMatchWinner()
  }
}


// ============================================================
// 13. COMPROBAR GANADOR DE TODA LA PARTIDA
// ============================================================
//
// La partida es al mejor de 3.
//
// Primero en ganar 2 rondas:
//
// ESTUDIANTE 2 - IA 0
//
// ESTUDIANTE 2 - IA 1
//
// IA 2 - ESTUDIANTE 0
//
// IA 2 - ESTUDIANTE 1
//
// ============================================================

function checkMatchWinner() {

  // ==========================================================
  // ESTUDIANTE GANA PARTIDA
  // ==========================================================

  if (

    battleState.playerRoundsWon >=

    BATTLE_CONFIG.ROUNDS_TO_WIN
  ) {

    battleState.battleFinished =
      true


    battleState.winner =
      'player'


    console.log(
      '🏆 VICTORIA FINAL DEL ESTUDIANTE'
    )


    return
  }


  // ==========================================================
  // HANDVERSE IA GANA PARTIDA
  // ==========================================================

  if (

    battleState.aiRoundsWon >=

    BATTLE_CONFIG.ROUNDS_TO_WIN
  ) {

    battleState.battleFinished =
      true


    battleState.winner =
      'ai'


    console.log(
      '🤖 VICTORIA FINAL DE HANDVERSE IA'
    )
  }
}


// ============================================================
// 14. INICIAR SIGUIENTE RONDA
// ============================================================
//
// Esta función sirve para:
//
// RONDA 1 termina
//
// ↓
//
// RONDA 2
//
// 100 HP vs 100 HP
//
// ↓
//
// RONDA 2 termina
//
// ↓
//
// RONDA 3
//
// ============================================================

export function startNextRound() {

  // ==========================================================
  // SEGURIDAD
  // ==========================================================

  if (
    !battleState.battleStarted
  ) {

    return {

      success: false,

      message:
        'La batalla todavía no ha comenzado.',

      ...getBattleState()
    }
  }


  // ==========================================================
  // SI TODA LA PARTIDA YA TERMINÓ,
  // NO EXISTE OTRA RONDA
  // ==========================================================

  if (
    battleState.battleFinished
  ) {

    return {

      success: false,

      message:
        'La partida ya terminó.',

      ...getBattleState()
    }
  }


  // ==========================================================
  // NO SE PUEDE CAMBIAR DE RONDA
  // SI LA ACTUAL TODAVÍA SIGUE
  // ==========================================================

  if (
    !battleState.roundFinished
  ) {

    return {

      success: false,

      message:
        'La ronda actual todavía no ha terminado.',

      ...getBattleState()
    }
  }


  // ==========================================================
  // AUMENTAR RONDA
  // ==========================================================

  battleState.round++


  // ==========================================================
  // REINICIAR TURNOS
  // ==========================================================

  battleState.turn = 0

  // ==========================================================
  // RECARGAR PODER ESPECIAL
  // ==========================================================

  // Cada nueva ronda devuelve
  // un PODER al estudiante y uno a HANDVERSE.

  battleState.playerPowerUsed =
    false

  battleState.aiPowerUsed =
    false

  // ==========================================================
  // RECUPERAR TODA LA VIDA
  // ==========================================================

  battleState.playerHealth =

    BATTLE_CONFIG.INITIAL_HEALTH


  battleState.aiHealth =

    BATTLE_CONFIG.INITIAL_HEALTH


  // ==========================================================
  // LIMPIAR MOVIMIENTOS
  // ==========================================================

  battleState.playerAction =
    null


  battleState.aiAction =
    null


  // ==========================================================
  // LIMPIAR GANADORES TEMPORALES
  // ==========================================================

  battleState.turnWinner =
    null


  battleState.roundWinner =
    null


  // ==========================================================
  // ACTIVAR NUEVA RONDA
  // ==========================================================

  battleState.roundFinished =
    false


  battleState.roundEndedAt =
    null


  // ==========================================================
  // OBTENER NUEVO ESTADO
  // ==========================================================

  const state =
    getBattleState()


  console.log(

    `🔥 RONDA ${battleState.round} INICIADA`
  )


  // ==========================================================
  // RESULTADO PARA MAIN.JS
  // ==========================================================

  return {

    success: true,

    roundStarted: true,

    // Esto sirve para que main.js sepa
    // que solo cambió de ronda y NO debe
    // interpretar este evento como un ataque.
    transitionOnly: true,

    message:

      `🔥 RONDA ${battleState.round} INICIADA`,

    ...state
  }
}


// ============================================================
// 15. ALIAS PREPARE NEXT ROUND
// ============================================================
//
// Lo dejamos también disponible por si main.js
// utiliza este nombre posteriormente.
//
// ============================================================

export function prepareNextRound() {

  return startNextRound()
}


// ============================================================
// 16. CONSTRUIR MENSAJE DEL TURNO
// ============================================================

function buildTurnMessage(
  turnWinner
) {

  // ----------------------------------------------------------
  // SI TODA LA BATALLA TERMINÓ
  // ----------------------------------------------------------

  if (
    battleState.battleFinished
  ) {

    return buildBattleFinishedMessage()
  }


  // ----------------------------------------------------------
  // SI TERMINÓ LA RONDA
  // ----------------------------------------------------------

  if (
    battleState.roundFinished
  ) {

    return buildRoundFinishedMessage()
  }


  // ----------------------------------------------------------
  // ESTUDIANTE GANA TURNO
  // ----------------------------------------------------------

  if (
    turnWinner === 'player'
  ) {

    return (

      `⚡ Ganaste el turno ${battleState.turn}`
    )
  }


  // ----------------------------------------------------------
  // IA GANA TURNO
  // ----------------------------------------------------------

  if (
    turnWinner === 'ai'
  ) {

    return (

      `🤖 HANDVERSE ganó el turno ${battleState.turn}`
    )
  }


  // ----------------------------------------------------------
  // EMPATE
  // ----------------------------------------------------------

  return (

    `⚔️ Turno ${battleState.turn} empatado`
  )
}


// ============================================================
// 17. MENSAJE DE RONDA TERMINADA
// ============================================================

function buildRoundFinishedMessage() {

  // ----------------------------------------------------------
  // SI TAMBIÉN TERMINÓ TODA LA PARTIDA
  // ----------------------------------------------------------

  if (
    battleState.battleFinished
  ) {

    return buildBattleFinishedMessage()
  }


  // ----------------------------------------------------------
  // ESTUDIANTE GANÓ RONDA
  // ----------------------------------------------------------

  if (
    battleState.roundWinner ===
    'player'
  ) {

    return (

      `🏆 Ganaste la ronda ${battleState.round}`
    )
  }


  // ----------------------------------------------------------
  // IA GANÓ RONDA
  // ----------------------------------------------------------

  if (
    battleState.roundWinner ===
    'ai'
  ) {

    return (

      `🤖 HANDVERSE ganó la ronda ${battleState.round}`
    )
  }


  return (

    `Ronda ${battleState.round} finalizada`
  )
}


// ============================================================
// 18. MENSAJE DE PARTIDA TERMINADA
// ============================================================

function buildBattleFinishedMessage() {

  // ----------------------------------------------------------
  // ESTUDIANTE CAMPEÓN
  // ----------------------------------------------------------

  if (
    battleState.winner ===
    'player'
  ) {

    return (
      '🏆 ¡GANASTE LA BATALLA HANDVERSE!'
    )
  }


  // ----------------------------------------------------------
  // HANDVERSE CAMPEÓN
  // ----------------------------------------------------------

  if (
    battleState.winner ===
    'ai'
  ) {

    return (
      '🤖 HANDVERSE IA GANÓ LA BATALLA'
    )
  }


  return (
    '⚔️ BATALLA FINALIZADA'
  )
}


// ============================================================
// 19. OBTENER ESTADO ACTUAL
// ============================================================

export function getBattleState() {

  return {

    ...battleState,


    // Creamos copias para evitar que main.js
    // modifique accidentalmente los objetos
    // internos del motor.

    playerAction:

      battleState.playerAction

        ? {
          ...battleState.playerAction
        }

        : null,


    aiAction:

      battleState.aiAction

        ? {
          ...battleState.aiAction
        }

        : null
  }
}


// ============================================================
// 20. SABER SI LA BATALLA ESTÁ ACTIVA
// ============================================================

export function isBattleActive() {

  return (

    battleState.battleStarted &&

    !battleState.battleFinished
  )
}


// ============================================================
// 21. SABER SI LA RONDA ESTÁ ACTIVA
// ============================================================

export function isRoundActive() {

  return (

    battleState.battleStarted &&

    !battleState.battleFinished &&

    !battleState.roundFinished
  )
}


// ============================================================
// 22. SABER SI TERMINÓ LA RONDA ACTUAL
// ============================================================

export function isRoundFinished() {

  return battleState.roundFinished
}


// ============================================================
// 23. SABER SI TERMINÓ TODA LA PARTIDA
// ============================================================

export function isBattleFinished() {

  return battleState.battleFinished
}


// ============================================================
// 24. INFORMACIÓN DEL MOTOR
// ============================================================

export function getBattleEngineInfo() {

  return {

    name:
      'HANDVERSE AI Battle Engine',


    version:
      '2.0.0',


    initialHealth:

      BATTLE_CONFIG
        .INITIAL_HEALTH,


    damagePerTurn:

      BATTLE_CONFIG
        .DAMAGE_PER_TURN,


    roundsToWin:

      BATTLE_CONFIG
        .ROUNDS_TO_WIN,


    // Mejor de 3.
    maximumPossibleRounds:

      BATTLE_CONFIG
        .ROUNDS_TO_WIN *
      2 -
      1,


    roundTransitionDelayMs:

      BATTLE_CONFIG
        .ROUND_TRANSITION_DELAY_MS,


    actions: [

      {
        ...BATTLE_ACTIONS.ATTACK
      },

      {
        ...BATTLE_ACTIONS.SHIELD
      },

      {
        ...BATTLE_ACTIONS.POWER
      }
    ]
  }
}