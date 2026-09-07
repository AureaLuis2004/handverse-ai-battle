# HANDVERSE: BATALLA DE IA

![HANDVERSE](https://img.shields.io/badge/HANDVERSE-AI%20BATTLE-22d3ee)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-Machine%20Learning-orange)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hand%20Tracking-blue)
![Vite](https://img.shields.io/badge/Vite-Frontend-purple)

## Descripción

HANDVERSE: Batalla de IA es una aplicación web interactiva que utiliza
visión artificial y aprendizaje automático para reconocer gestos de la mano
en tiempo real y convertirlos en acciones dentro de un sistema de batalla.

El usuario primero enseña tres gestos a la inteligencia artificial y
posteriormente utiliza esos mismos gestos para combatir contra HANDVERSE IA.

El proyecto fue desarrollado como demostración de Inteligencia Artificial
aplicada para la carrera de Sistemas Inteligentes de ECOTEC.

---

## Objetivo

Demostrar de manera interactiva cómo una inteligencia artificial puede:

- Detectar una mano mediante una cámara.
- Identificar puntos de referencia de la mano.
- Crear un dataset personalizado.
- Entrenar un modelo de clasificación.
- Reconocer gestos en tiempo real.
- Convertir las predicciones del modelo en acciones dentro de un videojuego.

---

## Gestos disponibles

HANDVERSE reconoce tres gestos:

| Gesto            | Acción |
| ---------------- | ------ |
| ✊ Puño cerrado  | ATAQUE |
| 🖐️ Mano abierta  | ESCUDO |
| 👍 Pulgar arriba | PODER  |

---

## Funcionamiento

El sistema sigue este flujo:

```text
CÁMARA
   ↓
MEDIAPIPE HAND LANDMARKER
   ↓
21 PUNTOS DE LA MANO
   ↓
EXTRACCIÓN DE CARACTERÍSTICAS
   ↓
DATASET
   ↓
TENSORFLOW.JS
   ↓
ENTRENAMIENTO
   ↓
PREDICCIÓN DEL GESTO
   ↓
BATTLE ENGINE
   ↓
ACCIÓN DEL JUGADOR
```

## Demo pública

HANDVERSE se encuentra desplegado en Vercel y puede utilizarse desde cualquier navegador compatible con cámara.

## Enlace de la aplicación

handverse-ai-battle.vercel.app

> Al ingresar por primera vez, el navegador solicitará permiso para utilizar la cámara.

---

## Estado del proyecto

## Estado actual: COMPLETADO

El proyecto cuenta con:

- Reconocimiento de manos en tiempo real.
- 21 landmarks mediante MediaPipe.
- Dataset personalizado de 90 muestras.
- Entrenamiento con TensorFlow.js.
- Clasificación de tres gestos.
- Sistema de batalla por rondas.
- Control de vida y daño.
- Poder especial limitado.
- Música dinámica de combate y victoria.
- Animaciones y efectos visuales.
- Nueva partida sin necesidad de reentrenamiento.
- Deployment público mediante Vercel.

---

## Limitaciones actuales

- El modelo se entrena nuevamente en cada nueva sesión del navegador.
- El rendimiento puede variar según la iluminación y la calidad de la cámara.
- Los gestos deben mantenerse visibles frente a la cámara para obtener una predicción estable.
- La aplicación requiere permiso de acceso a la cámara.
- Para la versión pública se necesita conexión a Internet.

---

## Autores

Proyecto desarrollado para la Casa Abierta de ECOTEC.

**Carrera:** Ingeniería en Sistemas Inteligentes

**Proyecto:** HANDVERSE: Batalla de IA

**Integrantes y sus funciones:**

- Luis Aurea (INTEGRACIÓN DE MAIN.JS, BATTLEENGINE.J Y UNIÓN DE CODIFICACIÓN)
- Sury Cobos (BATTLEMODE)
- Melanie Villegas (IMPLEMENTACIÓN DE HANDVERSE: AI)
- Emily Ayana (DISEÑO DE MEJORAS UI/UX)
- Edwin Cruz (MEDIAPIPE)

---

## Versión

## HANDVERSE AI BATTLE v1.0

Versión preparada para demostración académica y Casa Abierta ECOTEC 2026.
