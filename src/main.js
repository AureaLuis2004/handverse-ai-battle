import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="app-shell">

    <section class="hero">
      <p class="eyebrow">
        ECOTEC · SISTEMAS INTELIGENTES
      </p>

      <h1>
        HANDVERSE:
        <span>AI BATTLE</span>
      </h1>

      <p class="subtitle">
        Entrena tu IA. Combate con tus manos.
      </p>

      <div class="gesture-legend">

        <div>
          <strong>✊</strong>
          <span>ATAQUE</span>
        </div>

        <div>
          <strong>🖐️</strong>
          <span>ESCUDO</span>
        </div>

        <div>
          <strong>👍</strong>
          <span>PODER</span>
        </div>

      </div>
    </section>


    <section class="camera-panel">

      <div class="camera-stage">

        <video
          id="webcam"
          autoplay
          playsinline
          muted
        ></video>

        <canvas id="overlay"></canvas>

        <div id="camera-placeholder">
          <span>📷</span>
          <p>Cámara preparada</p>
        </div>

      </div>


      <div class="camera-controls">

        <p id="camera-status">
          ● Cámara desactivada
        </p>

        <button
          id="start-camera"
          type="button"
        >
          ACTIVAR CÁMARA
        </button>

      </div>

    </section>

  </main>
`


const video =
  document.querySelector('#webcam')

const button =
  document.querySelector('#start-camera')

const status =
  document.querySelector('#camera-status')

const placeholder =
  document.querySelector('#camera-placeholder')


async function startCamera() {

  if (!navigator.mediaDevices?.getUserMedia) {

    status.textContent =
      '❌ Este navegador no permite usar la cámara'

    return
  }


  button.disabled = true

  button.textContent =
    'CONECTANDO...'

  status.textContent =
    '● Solicitando permiso de cámara...'


  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({

        video: {

          width: {
            ideal: 1280
          },

          height: {
            ideal: 720
          },

          facingMode: 'user'

        },

        audio: false

      })


    video.srcObject = stream

    await video.play()


    placeholder.style.display =
      'none'


    status.textContent =
      '● Cámara activa ✅'


    button.textContent =
      'CÁMARA ACTIVADA'


  } catch (error) {

    console.error(
      'Error al acceder a la cámara:',
      error
    )


    if (error.name === 'NotAllowedError') {

      status.textContent =
        '❌ Permiso de cámara rechazado'

    } else if (
      error.name === 'NotFoundError'
    ) {

      status.textContent =
        '❌ No se encontró una cámara'

    } else {

      status.textContent =
        '❌ No se pudo iniciar la cámara'

    }


    button.disabled = false

    button.textContent =
      'INTENTAR DE NUEVO'

  }

}


button.addEventListener(
  'click',
  startCamera
)