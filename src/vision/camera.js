// ======================================================
// HANDVERSE: AI BATTLE
// Control de cámara
// Edwin Cruz
// ======================================================

export async function startCamera(video) {

  if (!navigator.mediaDevices?.getUserMedia) {

    throw new Error(
      'Este navegador no permite usar la cámara'
    )

  }

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

  console.log(
    'Cámara iniciada correctamente ✅'
  )

  return stream
}
