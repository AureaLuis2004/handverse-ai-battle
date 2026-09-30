# 🎮 HANDVERSE: AI BATTLE

**HANDVERSE: AI BATTLE** es una experiencia web interactiva desarrollada como proyecto académico para la carrera de **Sistemas Inteligentes de ECOTEC**.

El sistema permite que cada participante entrene una Inteligencia Artificial utilizando gestos realizados con su propia mano y posteriormente se enfrente a ella dentro de una arena de batalla.

HANDVERSE integra **visión artificial, aprendizaje automático, reconocimiento de gestos, cámara en tiempo real, un motor de batalla y almacenamiento de resultados en la nube**.

---

## 🌐 Aplicación web

HANDVERSE se encuentra desplegado públicamente mediante **Vercel**.

### Acceso al videojuego

[🎮 Abrir HANDVERSE: AI BATTLE](https://handverse-ai-battle-ecotec.vercel.app)

La aplicación puede abrirse directamente desde un navegador web compatible en computadoras, tablets y teléfonos móviles.

También puede accederse mediante un **código QR** que apunte a la dirección pública de Vercel.

> Para utilizar el reconocimiento de gestos es necesario conceder permiso de acceso a la cámara.

---

## 🎯 Objetivo

El objetivo de HANDVERSE es demostrar de una manera práctica e interactiva cómo una Inteligencia Artificial puede aprender a reconocer diferentes patrones proporcionados directamente por una persona.

Durante la experiencia, el participante:

1. Registra sus datos.
2. Activa la cámara.
3. Selecciona la dificultad.
4. Registra ejemplos de diferentes gestos.
5. Entrena una red neuronal desde el navegador.
6. Utiliza el modelo entrenado para reconocer movimientos en tiempo real.
7. Se enfrenta a HANDVERSE IA.
8. Obtiene un resultado final.
9. El resultado de la partida se registra en Supabase.

---

## 🤖 Funcionamiento general

El flujo principal del sistema es:

```text
Registro del participante
        ↓
Selección de dificultad
        ↓
Activación de cámara
        ↓
MediaPipe Hand Landmarker
        ↓
Detección de 21 puntos de la mano
        ↓
Captura de muestras
        ↓
TensorFlow.js
        ↓
Entrenamiento de la red neuronal
        ↓
Predicción de gestos
        ↓
Arena de batalla
        ↓
Motor de combate
        ↓
Resultado final
        ↓
Supabase
