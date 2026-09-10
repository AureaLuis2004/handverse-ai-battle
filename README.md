# HANDVERSE: AI BATTLE

**HANDVERSE: AI BATTLE** es una experiencia interactiva desarrollada para la carrera de **Sistemas Inteligentes de ECOTEC**, en la que los participantes pueden entrenar una Inteligencia Artificial utilizando gestos de la mano y posteriormente enfrentarse a ella en una batalla.

El proyecto combina visión artificial, aprendizaje automático, interacción mediante cámara web y una interfaz de batalla en tiempo real.

## Objetivo

Demostrar de una manera práctica e interactiva cómo una Inteligencia Artificial puede aprender a reconocer diferentes gestos realizados por una persona utilizando datos obtenidos directamente desde una cámara web.

El participante primero registra sus datos, entrena el modelo con diferentes posiciones de la mano y finalmente utiliza ese modelo durante una batalla contra HANDVERSE IA.

## Gestos utilizados

El sistema reconoce tres movimientos principales:

- ✊ **Puño cerrado:** ATAQUE
- 🖐️ **Mano abierta:** ESCUDO
- 👍 **Pulgar arriba:** PODER

## Funcionamiento

El flujo principal de HANDVERSE es:

1. El participante registra su nombre, apellido e institución educativa.
2. Se activa la cámara web.
3. MediaPipe detecta los 21 puntos principales de la mano.
4. El participante registra muestras de los tres gestos.
5. TensorFlow.js utiliza las muestras para entrenar una red neuronal.
6. El modelo comienza a realizar predicciones en tiempo real.
7. Se desbloquea la Arena de Batalla.
8. El estudiante compite contra HANDVERSE IA.
9. Al finalizar la batalla, el resultado queda registrado en Supabase.

## Entrenamiento de la IA

Cada participante registra:

- 30 muestras de ATAQUE
- 30 muestras de ESCUDO
- 30 muestras de PODER

Para un total de:

## 90 muestras de entrenamiento

Posteriormente, el modelo neuronal es entrenado directamente desde el navegador.

## Sistema de batalla

Cada jugador comienza con:

- ❤️ 100 puntos de vida
- ⚡ 3 usos de poder especial por ronda

Cada ataque efectivo causa:

## 20 puntos de daño

La batalla utiliza un sistema de enfrentamiento entre movimientos:

- ATAQUE vence a PODER.
- PODER vence a ESCUDO.
- ESCUDO vence a ATAQUE.

Las acciones iguales producen empate.

## Sistema de rondas

La partida utiliza un formato **al mejor de 3 rondas**.

El primer participante que consiga **2 rondas ganadas** obtiene la victoria final.

Al comenzar una nueva ronda:

- La vida vuelve a 100.
- El poder especial vuelve a 3/3.
- Se mantiene el marcador general de rondas.

## Registro de participantes

Antes de ingresar a HANDVERSE se solicitan:

- Nombre(s)
- Apellido(s)
- Institución educativa

El formulario incluye validaciones para evitar datos incorrectos, incluyendo nombres o apellidos repetidos dentro del mismo campo.

Ejemplos no permitidos:

```text
Luis Luis
Aurea Aurea
```

## Base de datos

HANDVERSE utiliza **Supabase** para almacenar el resultado final de cada participante.

La tabla registra información como:

```text
first_names
last_names
full_name
institution
result
player_score
ai_score
created_at
```

Los resultados posibles son:

```text
GANADOR
DERROTA
```

La tabla utiliza **Row Level Security (RLS)** y el aplicativo únicamente dispone de los permisos necesarios para registrar nuevos resultados.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Vite
- TensorFlow.js
- MediaPipe Hand Landmarker
- Supabase
- PostgreSQL
- Vercel
- Git
- GitHub

## Arquitectura general

```text
Cámara Web
    ↓
MediaPipe Hand Landmarker
    ↓
21 puntos de la mano
    ↓
Captura de muestras
    ↓
TensorFlow.js
    ↓
Entrenamiento del modelo
    ↓
Predicción del gesto
    ↓
Motor de batalla
    ↓
Resultado final
    ↓
Supabase
```

## Estructura principal

```text
handverse-ai-battle/
│
├── public/
│   ├── audio/
│   └── models/
│
├── src/
│   ├── ai/
│   ├── assets/
│   ├── game/
│   │   └── battleEngine.js
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── vision/
│   │   └── handTracker.js
│   ├── main.js
│   └── style.css
│
├── .gitignore
├── index.html
├── package.json
└── README.md
```

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/AureaLuis2004/handverse-ai-battle.git
```

Entrar al proyecto:

```bash
cd handverse-ai-battle
```

Instalar las dependencias:

```bash
npm install
```

Ejecutar el proyecto:

```bash
npm run dev
```

Generar una versión de producción:

```bash
npm run build
```

## Variables de entorno

Para conectar el proyecto con Supabase se utilizan las siguientes variables:

```env
VITE_SUPABASE_URL=TU_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=TU_SUPABASE_PUBLISHABLE_KEY
```

El archivo `.env.local` no debe almacenarse en el repositorio.

## Despliegue

La aplicación está desplegada utilizando **Vercel** y conectada al repositorio de GitHub.

Cada actualización enviada a la rama principal:

```text
main
```

genera automáticamente una nueva versión de producción en Vercel.

## Seguridad

El proyecto implementa:

- Row Level Security en Supabase.
- Política específica para INSERT.
- Validación de los datos del participante.
- Restricción de nombres y apellidos repetidos.
- Variables de entorno para la configuración de Supabase.
- Exclusión de `.env.local` mediante `.gitignore`.

## Proyecto académico

Proyecto desarrollado como demostración interactiva de Inteligencia Artificial para:

### ECOTEC – Carrera de Sistemas Inteligentes

HANDVERSE busca enseñar de forma visual cómo una computadora puede aprender a reconocer patrones mediante ejemplos proporcionados por una persona.

---

**HANDVERSE: AI BATTLE**  
*Entrena la IA. Enfréntala. Gana la batalla.*
