// ============================================================
// HANDVERSE: AI BATTLE
// Motor principal de batalla
// ============================================================


// ============================================================
// 1. CONFIGURACIÓN GENERAL
// ============================================================

export const BATTLE_CONFIG = {
  INITIAL_HEALTH: 100,
  DAMAGE_PER_ROUND: 20,
  MAX_ROUNDS: 10
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
// 3. ESTADO DE LA BATALLA
// ============================================================

let battleState = {
  playerHealth: BATTLE_CONFIG.INITIAL_HEALTH,
  aiHealth: BATTLE_CONFIG.INITIAL_HEALTH,

  round: 0,

  playerAction: null,
  aiAction: null,

  winner: null,

  battleStarted: false,
  battleFinished: false
}


// ============================================================
// 4. CREAR / REINICIAR BATALLA
// ============================================================

export function resetBattle() {

  battleState = {
    playerHealth: BATTLE_CONFIG.INITIAL_HEALTH,
    aiHealth: BATTLE_CONFIG.INITIAL_HEALTH,

    round: 0,

    playerAction: null,
    aiAction: null,

    winner: null,

    battleStarted: false,
    battleFinished: false
  }

  console.log(
    '⚔️ Batalla HANDVERSE reiniciada'
  )

  return getBattleState()
}


// ============================================================
// 5. INICIAR BATALLA
// ============================================================

export function startBattle() {

  resetBattle()

  battleState.battleStarted = true

  console.log(
    '🔥 BATALLA HANDVERSE INICIADA'
  )

  return getBattleState()
}


// ============================================================
// 6. CONVERTIR GESTO EN ACCIÓN
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


// ============================================================
// 7. GENERAR MOVIMIENTO DE LA IA
// ============================================================

export function generateAIAction() {

  const actions = [
    BATTLE_ACTIONS.ATTACK,
    BATTLE_ACTIONS.SHIELD,
    BATTLE_ACTIONS.POWER
  ]

  const randomIndex =
    Math.floor(
      Math.random() * actions.length
    )

  return actions[randomIndex]
}


// ============================================================
// 8. DETERMINAR QUIÉN GANA EL TURNO
// ============================================================

export function determineRoundWinner(
  playerAction,
  aiAction
) {

  if (
    !playerAction ||
    !aiAction
  ) {
    return null
  }


  // EMPATE

  if (
    playerAction.key ===
    aiAction.key
  ) {

    return 'draw'
  }


  // ATAQUE vence a PODER

  if (
    playerAction.key === 'attack' &&
    aiAction.key === 'power'
  ) {

    return 'player'
  }


  // PODER vence a ESCUDO

  if (
    playerAction.key === 'power' &&
    aiAction.key === 'shield'
  ) {

    return 'player'
  }


  // ESCUDO vence a ATAQUE

  if (
    playerAction.key === 'shield' &&
    aiAction.key === 'attack'
  ) {

    return 'player'
  }


  // Si ninguna condición anterior ocurrió,
  // gana la Inteligencia Artificial.

  return 'ai'
}


// ============================================================
// 9. EJECUTAR TURNO
// ============================================================

export function playBattleTurn(
  gesture
) {

  if (
    !battleState.battleStarted
  ) {

    return {
      success: false,
      message:
        'La batalla todavía no ha comenzado.'
    }
  }


  if (
    battleState.battleFinished
  ) {

    return {
      success: false,
      message:
        'La batalla ya terminó.'
    }
  }


  // Convertimos el gesto reconocido
  // por TensorFlow.js en una acción.

  const playerAction =
    gestureToBattleAction(
      gesture
    )


  if (!playerAction) {

    return {
      success: false,
      message:
        'Gesto no reconocido para batalla.'
    }
  }


  // La IA selecciona su movimiento.

  const aiAction =
    generateAIAction()


  // Guardamos movimientos.

  battleState.playerAction =
    playerAction

  battleState.aiAction =
    aiAction


  // Aumentamos turno.

  battleState.round++


  // Determinamos ganador.

  const roundWinner =
    determineRoundWinner(
      playerAction,
      aiAction
    )


  // ==========================================================
  // APLICAR DAÑO
  // ==========================================================

  if (
    roundWinner === 'player'
  ) {

    battleState.aiHealth -=
      BATTLE_CONFIG.DAMAGE_PER_ROUND
  }


  if (
    roundWinner === 'ai'
  ) {

    battleState.playerHealth -=
      BATTLE_CONFIG.DAMAGE_PER_ROUND
  }


  // Evitamos números negativos.

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
  // COMPROBAR FIN DE LA BATALLA
  // ==========================================================

  checkBattleEnd()


  // ==========================================================
  // RESULTADO DEL TURNO
  // ==========================================================

  const result = {

    success: true,

    round:
      battleState.round,

    playerAction,

    aiAction,

    roundWinner,

    playerHealth:
      battleState.playerHealth,

    aiHealth:
      battleState.aiHealth,

    battleFinished:
      battleState.battleFinished,

    winner:
      battleState.winner
  }


  console.log(
    '⚔️ TURNO HANDVERSE:',
    result
  )


  return result
}


// ============================================================
// 10. COMPROBAR GANADOR FINAL
// ============================================================

function checkBattleEnd() {

  // Si la IA pierde toda su vida.

  if (
    battleState.aiHealth <= 0
  ) {

    battleState.battleFinished =
      true

    battleState.winner =
      'player'

    return
  }


  // Si el jugador pierde toda su vida.

  if (
    battleState.playerHealth <= 0
  ) {

    battleState.battleFinished =
      true

    battleState.winner =
      'ai'

    return
  }


  // Seguridad por número máximo de rondas.

  if (
    battleState.round >=
    BATTLE_CONFIG.MAX_ROUNDS
  ) {

    battleState.battleFinished =
      true


    if (
      battleState.playerHealth >
      battleState.aiHealth
    ) {

      battleState.winner =
        'player'
    }

    else if (
      battleState.aiHealth >
      battleState.playerHealth
    ) {

      battleState.winner =
        'ai'
    }

    else {

      battleState.winner =
        'draw'
    }
  }
}


// ============================================================
// 11. OBTENER ESTADO ACTUAL
// ============================================================

export function getBattleState() {

  return {
    ...battleState,

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
// 12. SABER SI LA BATALLA ESTÁ ACTIVA
// ============================================================

export function isBattleActive() {

  return (
    battleState.battleStarted &&
    !battleState.battleFinished
  )
}


// ============================================================
// 13. SABER SI TERMINÓ
// ============================================================

export function isBattleFinished() {

  return battleState.battleFinished
}


// ============================================================
// 14. INFORMACIÓN DEL MOTOR
// ============================================================

export function getBattleEngineInfo() {

  return {

    name:
      'HANDVERSE AI Battle Engine',

    version:
      '1.0.0',

    initialHealth:
      BATTLE_CONFIG.INITIAL_HEALTH,

    damagePerRound:
      BATTLE_CONFIG.DAMAGE_PER_ROUND,

    maxRounds:
      BATTLE_CONFIG.MAX_ROUNDS,

    actions: [
      BATTLE_ACTIONS.ATTACK,
      BATTLE_ACTIONS.SHIELD,
      BATTLE_ACTIONS.POWER
    ]
  }
}