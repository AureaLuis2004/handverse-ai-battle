# HANDVERSE: AI BATTLE

Proyecto interactivo desarrollado para la Casa Abierta de la carrera de Sistemas Inteligentes de ECOTEC.

HANDVERSE permite que un estudiante entrene una Inteligencia Artificial mediante gestos realizados frente a una cámara web y posteriormente se enfrente a la IA en una batalla interactiva.

---

## Objetivo

Demostrar de forma práctica y visual cómo una Inteligencia Artificial puede aprender a reconocer diferentes gestos de la mano mediante ejemplos proporcionados por el usuario.

---

## Gestos utilizados

El sistema reconoce tres movimientos:

- ✊ Puño cerrado → ATAQUE
- 🖐️ Mano abierta → ESCUDO
- 👍 Pulgar arriba → PODER

Cada gesto es aprendido por el modelo mediante muestras capturadas con la cámara.

---

## Funcionamiento

1. El participante registra:
   - Nombre(s)
   - Apellido(s)
   - Institución educativa

2. Se activa la cámara web.

3. MediaPipe detecta los 21 puntos de referencia de la mano.

4. El participante registra muestras de los tres gestos.

5. TensorFlow.js entrena un modelo de Inteligencia Artificial.

6. El sistema utiliza el modelo entrenado para reconocer los movimientos del jugador.

7. El estudiante se enfrenta a HANDVERSE IA.

8. Al finalizar la batalla se registra el resultado en Supabase.

---

## Sistema de batalla

Cada jugador inicia con:

- ❤️ 100 puntos de vida
- ⚡ 3 usos de poder especial por ronda

Cada ataque efectivo produce:

- 💥 20 puntos de daño

La batalla funciona por rondas.

El primero en ganar **2 rondas** gana la partida.

### Reglas

- ✊ ATAQUE vence a 👍 PODER
- 🖐️ ESCUDO vence a ✊ ATAQUE
- 👍 PODER vence a 🖐️ ESCUDO

---

## Inteligencia Artificial

HANDVERSE utiliza:

- TensorFlow.js
- MediaPipe Hand Landmarker
- 21 puntos de referencia de la mano
- Entrenamiento personalizado en tiempo real
- Clasificación de gestos mediante una red neuronal

Cada participante puede entrenar el modelo directamente desde el navegador.

---

## Base de datos

Se utiliza **Supabase PostgreSQL** para almacenar el historial de las partidas.

La tabla registra:

- Nombre(s)
- Apellido(s)
- Nombre completo
- Institución educativa
- Resultado
- Marcador del estudiante
- Marcador de la IA
- Fecha y hora

La base de datos utiliza **Row Level Security (RLS)** y únicamente permite al aplicativo insertar nuevos resultados.

---

## Validaciones

El formulario de participantes incluye validaciones para:

- Campos obligatorios
- Longitud de nombres y apellidos
- Institución educativa
- Evitar nombres repetidos como `Luis Luis`
- Evitar apellidos repetidos como `Aurea Aurea`

---

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Vite
- TensorFlow.js
- MediaPipe
- Supabase
- PostgreSQL
- Git
- GitHub
- Vercel

---

## Instalación

Clonar el repositorio:

```bash

git clone https://github.com/AureaLuis2004/handverse-ai-battle.git
