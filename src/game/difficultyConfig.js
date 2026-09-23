// ======================================================
// HANDVERSE: AI BATTLE
// Configuración de dificultad del combate
// ======================================================

// Nivel que aparecerá seleccionado inicialmente.
export const DEFAULT_DIFFICULTY_KEY = "easy";

// El daño se aplica cuando el participante gana el turno.
// Estos valores son reglas del juego.

export const DIFFICULTY_LEVELS = Object.freeze({
  easy: Object.freeze({
    key: "easy",
    name: "FÁCIL",
    description: "Más margen para practicar los gestos.",
    playerDamage: 20,
    aiDamage: 5,
  }),

  medium: Object.freeze({
    key: "medium",
    name: "INTERMEDIO",
    description: "Un reto con menos margen de error.",
    playerDamage: 20,
    aiDamage: 10,
  }),

  hard: Object.freeze({
    key: "hard",
    name: "DIFÍCIL",
    description: "Ambos participantes causan el mismo daño.",
    playerDamage: 20,
    aiDamage: 20,
  }),
});

// Obtener la configuración del nivel solicitado.
// Devuelve null si el nivel no existe.

export function getDifficultyConfig(difficultyKey) {
  return (
    Object.values(DIFFICULTY_LEVELS).find(
      (level) => level.key === difficultyKey
    ) ?? null
  );
}