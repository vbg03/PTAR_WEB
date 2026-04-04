import { useCallback, useEffect, useRef, useState } from 'react'
import { useControlesNavegacion } from '../../hooks/useControlesNavegacion'
import { useNarracionVoces } from '../../hooks/useNarracionVoces'
import { construirIndicesAudioPorPaso } from '../../utils/voiceLibrary'
import './casosUsos.css'

const DURACION_BLOQUEO_SCROLL = 340
const DURACION_TRANSICION_MEDIA = 320
const RETRASO_ENTRADA_MEDIA = 22
const RETRASO_ENTRADA_TITULO = 120
const DURACION_TRANSICION_BURBUJA = 320
const RETRASO_ENTRADA_BURBUJA = 22
const TEXTO_BURBUJA_JARDINES =
  'Y segundo, zonas verdes del campus, como los jardines externos. Es una forma de hacer mas sostenible el uso de los recursos.'
const RUTA_AUDIO_BURBUJA_JARDINES = '/voces/rojo/Usos/Jessica_Usos_003.mp3'
const VIDEO_CANCHAS_YOUTUBE_ID = 'MsnByyq5bjo'
const VIDEO_CANCHAS_EMBED_URL = `https://www.youtube.com/embed/${VIDEO_CANCHAS_YOUTUBE_ID}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${VIDEO_CANCHAS_YOUTUBE_ID}&rel=0&modestbranding=1&cc_load_policy=1&cc_lang_pref=es&hl=es`
const VIDEO_JARDINES_YOUTUBE_ID = 'd-3BLsPlAgY'
const VIDEO_JARDINES_EMBED_URL = `https://www.youtube.com/embed/${VIDEO_JARDINES_YOUTUBE_ID}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${VIDEO_JARDINES_YOUTUBE_ID}&rel=0&modestbranding=1&cc_load_policy=1&cc_lang_pref=es&hl=es`
const VIDEO_REFLEXION_YOUTUBE_ID = 'BlmTnuo4tCE'
const VIDEO_REFLEXION_EMBED_URL = `https://www.youtube.com/embed/${VIDEO_REFLEXION_YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&cc_lang_pref=es&hl=es`

const MEDIAS = {
  canchas: {
    titulo: 'RIEGO DE CANCHAS',
    portada: '/images/casos/canchas.jpg',
    embedUrl: VIDEO_CANCHAS_EMBED_URL,
    reproducirInline: true,
    resumen:
      'El agua tratada se reutiliza para el riego de canchas y zonas deportivas del campus, reduciendo el consumo de agua potable.'
  },
  jardines: {
    titulo: 'RIEGO DE JARDINES',
    portada: '/images/casos/jardines.jpg',
    embedUrl: VIDEO_JARDINES_EMBED_URL,
    reproducirInline: true,
    resumen:
      'Tambien se usa para jardines y zonas verdes externas, haciendo mas sostenible la gestion del agua dentro de la universidad.'
  },
  reflexion: {
    titulo: 'REFLEXION FINAL',
    portada: '/images/casos/reflexion.jpg',
    embedUrl: VIDEO_REFLEXION_EMBED_URL,
    resumen:
      'La PTAR permite limpiar y reutilizar parte del agua en el campus, y devolver el resto al rio en mejores condiciones.'
  }
}

const PASOS_RECORRIDO = [
  {
    burbujaDerecha:
      'Esta es una de las partes más importantes. Un 15% del agua que esta en el tanque de almacenamiento se usa para los siguientes casos.'
  },
  {
    titulo: 'RIEGO DE CANCHAS'
  },
  {
    titulo: 'RIEGO DE CANCHAS',
    mediaId: 'canchas',
    burbujaDerecha:
      'Primero, para regar las zonas verdes del campus, como las canchas deportivas. Así no tenemos que gastar agua potable, lo que es mucho mas eficiente y ecológico.'
  },
  {
    titulo: 'RIEGO DE JARDINES',
    mediaId: 'jardines',
    burbujaDerecha: TEXTO_BURBUJA_JARDINES
  },
  {
    titulo: 'RIEGO DE JARDINES',
    mediaId: 'jardines',
    burbujaIzquierda:
      'Entonces, todo el proceso tiene un fin que no solo ayuda a la universidad, sino también al medio ambiente, ¿cierto?'
  },
  {
    titulo: 'REFLEXIÓN FINAL',
    burbujaDerecha:
      'Así es. El ciclo del agua nunca se detiene, y gracias a estos procesos, se recicla y reutiliza, protegiendo tanto los recursos de la UAO como el rio Lili.'
  },
  {
    titulo: 'REFLEXIÓN FINAL',
    mediaId: 'reflexion',
    burbujaDerecha:
      'La PTAR no es solo una obra de concreto; es una especie de compromiso de la universidad con el ambiente y con la ciudad.'
  },
  {
    titulo: 'REFLEXIÓN FINAL',
    mediaId: 'reflexion',
    burbujaIzquierda: 'Entonces, en pocas palabras, ¿por qué es tan importante que la UAO tenga una PTAR?'
  },
  {
    titulo: 'REFLEXIÓN FINAL',
    mediaId: 'reflexion',
    burbujaDerecha:
      'Porque toda el agua sucia que generamos no puede ir directo al rio. La PTAR la limpia, permite reutilizar una parte en el campus y hace que lo que devolvemos al rio Lili llegue en mejores condiciones.'
  },
  {
    titulo: 'REFLEXIÓN FINAL',
    mediaId: 'reflexion',
    burbujaDerecha:
      'Es la forma en que la universidad asume su responsabilidad ambiental y hace más sostenible el uso del agua en el campus.'
  },
  {
    titulo: 'REFLEXIÓN FINAL',
    mediaId: 'reflexion',
    burbujaIzquierda: 'O sea, la PTAR es como la UAO se hace responsable del agua que usa.'
  }
]

const INDICES_AUDIO_BLANCO = construirIndicesAudioPorPaso(
  PASOS_RECORRIDO,
  'burbujaIzquierda'
)
const INDICES_AUDIO_ROJO = construirIndicesAudioPorPaso(
  PASOS_RECORRIDO,
  'burbujaDerecha'
)

function CasosUsos({ onVolverAPozo2, onCompletarUsos, iniciarEnFinal = false }) {
  const [pasoActual, setPasoActual] = useState(() =>
    iniciarEnFinal ? PASOS_RECORRIDO.length - 1 : 0
  )
  const [mostrarResumen, setMostrarResumen] = useState(false)
  const [abrirReproductor, setAbrirReproductor] = useState(false)
  const [tituloVisible, setTituloVisible] = useState(false)
  const [mediaRenderizada, setMediaRenderizada] = useState(null)
  const [mediaVisible, setMediaVisible] = useState(false)
  const [burbujaIzquierdaRender, setBurbujaIzquierdaRender] = useState(null)
  const [burbujaIzquierdaVisible, setBurbujaIzquierdaVisible] = useState(false)
  const [burbujaDerechaRender, setBurbujaDerechaRender] = useState(null)
  const [burbujaDerechaVisible, setBurbujaDerechaVisible] = useState(false)
  const bloqueoScrollRef = useRef(false)
  const acumulacionScrollRef = useRef(0)
  const ultimaMarcaScrollRef = useRef(0)
  const ultimaActivacionScrollRef = useRef(0)
  const timeoutBloqueoRef = useRef(null)
  const timeoutMediaRef = useRef(null)
  const timeoutTituloRef = useRef(null)
  const timeoutBurbujaIzquierdaRef = useRef(null)
  const timeoutBurbujaDerechaRef = useRef(null)
  const tituloAnteriorRef = useRef('')
  const mediaRenderizadaRef = useRef(null)
  const burbujaIzquierdaRenderRef = useRef(null)
  const burbujaDerechaRenderRef = useRef(null)

  const paso = PASOS_RECORRIDO[pasoActual]
  const mediaActiva = paso.mediaId ? MEDIAS[paso.mediaId] : null
  const mediaModal = mediaActiva ?? mediaRenderizada
  const indiceAudioIzquierda =
    burbujaIzquierdaVisible && paso.burbujaIzquierda
      ? INDICES_AUDIO_BLANCO[pasoActual]
      : null
  const indiceAudioDerecha =
    burbujaDerechaVisible && paso.burbujaDerecha
      ? INDICES_AUDIO_ROJO[pasoActual]
      : null
  const colorAudioActivo = indiceAudioDerecha
    ? 'rojo'
    : indiceAudioIzquierda
      ? 'blanco'
      : null
  const indiceAudioActivo = indiceAudioDerecha ?? indiceAudioIzquierda ?? null
  const rutaAudioPersonalizada =
    burbujaDerechaVisible && paso.burbujaDerecha === TEXTO_BURBUJA_JARDINES
      ? RUTA_AUDIO_BURBUJA_JARDINES
      : null

  useNarracionVoces({
    seccion: 'usos',
    colorActivo: colorAudioActivo,
    indiceActivo: indiceAudioActivo,
    rutaPersonalizada: rutaAudioPersonalizada
  })

  useEffect(() => {
    setPasoActual(iniciarEnFinal ? PASOS_RECORRIDO.length - 1 : 0)
    bloqueoScrollRef.current = false
  }, [iniciarEnFinal])

  useEffect(() => {
    setMostrarResumen(false)
    setAbrirReproductor(false)
  }, [pasoActual])

  useEffect(() => {
    if (timeoutTituloRef.current) {
      window.clearTimeout(timeoutTituloRef.current)
      timeoutTituloRef.current = null
    }

    const tituloActual = paso.titulo || ''

    if (!tituloActual) {
      setTituloVisible(false)
      tituloAnteriorRef.current = ''
      return
    }

    const tituloAnterior = tituloAnteriorRef.current
    if (tituloActual === tituloAnterior && tituloAnterior !== '') {
      setTituloVisible(true)
    } else {
      setTituloVisible(false)
      timeoutTituloRef.current = window.setTimeout(() => {
        setTituloVisible(true)
        timeoutTituloRef.current = null
      }, RETRASO_ENTRADA_TITULO)
    }

    tituloAnteriorRef.current = tituloActual
  }, [pasoActual, paso.titulo])

  useEffect(() => {
    if (timeoutMediaRef.current) {
      window.clearTimeout(timeoutMediaRef.current)
      timeoutMediaRef.current = null
    }

    const mediaActualRender = mediaRenderizadaRef.current

    if (!mediaActiva) {
      setMediaVisible(false)
      if (mediaActualRender) {
        timeoutMediaRef.current = window.setTimeout(() => {
          setMediaRenderizada(null)
          mediaRenderizadaRef.current = null
          timeoutMediaRef.current = null
        }, DURACION_TRANSICION_MEDIA)
      }
      return
    }

    if (!mediaActualRender) {
      setMediaRenderizada(mediaActiva)
      mediaRenderizadaRef.current = mediaActiva
      setMediaVisible(false)
      timeoutMediaRef.current = window.setTimeout(() => {
        setMediaVisible(true)
        timeoutMediaRef.current = null
      }, RETRASO_ENTRADA_MEDIA)
      return
    }

    if (mediaActualRender !== mediaActiva) {
      setMediaVisible(false)
      timeoutMediaRef.current = window.setTimeout(() => {
        setMediaRenderizada(mediaActiva)
        mediaRenderizadaRef.current = mediaActiva
        timeoutMediaRef.current = window.setTimeout(() => {
          setMediaVisible(true)
          timeoutMediaRef.current = null
        }, RETRASO_ENTRADA_MEDIA)
      }, DURACION_TRANSICION_MEDIA)
      return
    }

    setMediaVisible(true)
  }, [mediaActiva])

  useEffect(() => {
    if (timeoutBurbujaIzquierdaRef.current) {
      window.clearTimeout(timeoutBurbujaIzquierdaRef.current)
      timeoutBurbujaIzquierdaRef.current = null
    }

    const textoActual = paso.burbujaIzquierda || null
    const textoRenderActual = burbujaIzquierdaRenderRef.current

    if (!textoActual) {
      setBurbujaIzquierdaVisible(false)
      if (textoRenderActual) {
        timeoutBurbujaIzquierdaRef.current = window.setTimeout(() => {
          setBurbujaIzquierdaRender(null)
          burbujaIzquierdaRenderRef.current = null
          timeoutBurbujaIzquierdaRef.current = null
        }, DURACION_TRANSICION_BURBUJA)
      }
      return
    }

    if (!textoRenderActual) {
      setBurbujaIzquierdaRender(textoActual)
      burbujaIzquierdaRenderRef.current = textoActual
      setBurbujaIzquierdaVisible(false)
      timeoutBurbujaIzquierdaRef.current = window.setTimeout(() => {
        setBurbujaIzquierdaVisible(true)
        timeoutBurbujaIzquierdaRef.current = null
      }, RETRASO_ENTRADA_BURBUJA)
      return
    }

    if (textoRenderActual !== textoActual) {
      setBurbujaIzquierdaVisible(false)
      timeoutBurbujaIzquierdaRef.current = window.setTimeout(() => {
        setBurbujaIzquierdaRender(textoActual)
        burbujaIzquierdaRenderRef.current = textoActual
        timeoutBurbujaIzquierdaRef.current = window.setTimeout(() => {
          setBurbujaIzquierdaVisible(true)
          timeoutBurbujaIzquierdaRef.current = null
        }, RETRASO_ENTRADA_BURBUJA)
      }, DURACION_TRANSICION_BURBUJA)
      return
    }

    setBurbujaIzquierdaVisible(true)
  }, [paso.burbujaIzquierda])

  useEffect(() => {
    if (timeoutBurbujaDerechaRef.current) {
      window.clearTimeout(timeoutBurbujaDerechaRef.current)
      timeoutBurbujaDerechaRef.current = null
    }

    const textoActual = paso.burbujaDerecha || null
    const textoRenderActual = burbujaDerechaRenderRef.current

    if (!textoActual) {
      setBurbujaDerechaVisible(false)
      if (textoRenderActual) {
        timeoutBurbujaDerechaRef.current = window.setTimeout(() => {
          setBurbujaDerechaRender(null)
          burbujaDerechaRenderRef.current = null
          timeoutBurbujaDerechaRef.current = null
        }, DURACION_TRANSICION_BURBUJA)
      }
      return
    }

    if (!textoRenderActual) {
      setBurbujaDerechaRender(textoActual)
      burbujaDerechaRenderRef.current = textoActual
      setBurbujaDerechaVisible(false)
      timeoutBurbujaDerechaRef.current = window.setTimeout(() => {
        setBurbujaDerechaVisible(true)
        timeoutBurbujaDerechaRef.current = null
      }, RETRASO_ENTRADA_BURBUJA)
      return
    }

    if (textoRenderActual !== textoActual) {
      setBurbujaDerechaVisible(false)
      timeoutBurbujaDerechaRef.current = window.setTimeout(() => {
        setBurbujaDerechaRender(textoActual)
        burbujaDerechaRenderRef.current = textoActual
        timeoutBurbujaDerechaRef.current = window.setTimeout(() => {
          setBurbujaDerechaVisible(true)
          timeoutBurbujaDerechaRef.current = null
        }, RETRASO_ENTRADA_BURBUJA)
      }, DURACION_TRANSICION_BURBUJA)
      return
    }

    setBurbujaDerechaVisible(true)
  }, [paso.burbujaDerecha])

  const manejarCambioPaso = useCallback(
    (direccionScroll) => {
      if (bloqueoScrollRef.current || direccionScroll === 0) {
        return
      }

      bloqueoScrollRef.current = true

      if (direccionScroll > 0) {
        if (pasoActual < PASOS_RECORRIDO.length - 1) {
          setPasoActual((pasoAnterior) =>
            Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1)
          )
        } else if (typeof onCompletarUsos === 'function') {
          onCompletarUsos()
        }
      } else if (pasoActual > 0) {
        setPasoActual((pasoAnterior) => Math.max(pasoAnterior - 1, 0))
      } else if (typeof onVolverAPozo2 === 'function') {
        onVolverAPozo2()
      }

      if (timeoutBloqueoRef.current) {
        window.clearTimeout(timeoutBloqueoRef.current)
      }

      timeoutBloqueoRef.current = window.setTimeout(() => {
        bloqueoScrollRef.current = false
        timeoutBloqueoRef.current = null
      }, DURACION_BLOQUEO_SCROLL)
    },
    [pasoActual, onVolverAPozo2, onCompletarUsos]
  )

  useControlesNavegacion({
    acumulacionScrollRef,
    ultimaMarcaScrollRef,
    ultimaActivacionScrollRef,
    onAvanzar: useCallback(() => manejarCambioPaso(1), [manejarCambioPaso]),
    onRetroceder: useCallback(() => manejarCambioPaso(-1), [manejarCambioPaso])
  })

  useEffect(() => {
    return () => {
      if (timeoutBloqueoRef.current) {
        window.clearTimeout(timeoutBloqueoRef.current)
      }
      if (timeoutMediaRef.current) {
        window.clearTimeout(timeoutMediaRef.current)
      }
      if (timeoutTituloRef.current) {
        window.clearTimeout(timeoutTituloRef.current)
      }
      if (timeoutBurbujaIzquierdaRef.current) {
        window.clearTimeout(timeoutBurbujaIzquierdaRef.current)
      }
      if (timeoutBurbujaDerechaRef.current) {
        window.clearTimeout(timeoutBurbujaDerechaRef.current)
      }
    }
  }, [])

  return (
    <main className="ptar-usos">
      <section className="ptar-usos__panel" aria-label="Casos de uso del agua">
        <img
          className={`ptar-usos__personaje ptar-usos__personaje--izquierda ${pasoActual === 0 ? 'is-grande is-intro' : ''}`}
          src="/images/estudianteNormal.svg"
          alt=""
          aria-hidden="true"
        />
        <img
          className={`ptar-usos__personaje ptar-usos__personaje--derecha ${pasoActual === 0 ? 'is-grande is-intro' : ''}`}
          src="/images/estudianteAmbiental.svg"
          alt=""
          aria-hidden="true"
        />

        {paso.titulo ? (
          <h2
            className={`ptar-usos__titulo ${tituloVisible ? 'is-visible' : ''} ${
              pasoActual === 1 || pasoActual === 5 ? 'is-step-2-centered' : ''
            } ${
              pasoActual === 2 || pasoActual === 3 || pasoActual === 4 || pasoActual >= 6
                ? 'is-step-3-compact'
                : ''
            }`}
          >
            {paso.titulo}
          </h2>
        ) : null}

        {mediaRenderizada ? (
          <div className={`ptar-usos__media ${mediaVisible ? 'is-visible' : ''}`}>
            <div className="ptar-usos__media-track">
              {mediaRenderizada.reproducirInline ? (
                <div className="ptar-usos__video-preview ptar-usos__video-preview--inline">
                  <iframe
                    className="ptar-usos__video-inline-player"
                    title={`Video de ${mediaRenderizada.titulo.toLowerCase()}`}
                    src={mediaRenderizada.embedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className="ptar-usos__video-preview"
                  onClick={() => setAbrirReproductor(true)}
                  aria-label={`Abrir video de ${mediaRenderizada.titulo.toLowerCase()}`}
                >
                  <img
                    src={mediaRenderizada.portada}
                    alt={`Vista previa de ${mediaRenderizada.titulo.toLowerCase()}`}
                  />
                  <span className="ptar-usos__play-icon" aria-hidden="true">
                    &#9654;
                  </span>
                </button>
              )}

              <div className="ptar-usos__resumen-wrap">
                <button
                  type="button"
                  className="ptar-usos__resumen-toggle"
                  onClick={() => setMostrarResumen((estadoAnterior) => !estadoAnterior)}
                  aria-expanded={mostrarResumen}
                  aria-controls="ptar-usos-resumen"
                  aria-label={mostrarResumen ? 'Ocultar resumen' : 'Mostrar resumen'}
                >
                  <span
                    className={`ptar-usos__resumen-chevron ${mostrarResumen ? 'is-open' : ''}`}
                    aria-hidden="true"
                  />
                </button>

                <aside
                  id="ptar-usos-resumen"
                  className={`ptar-usos__resumen ${mostrarResumen ? 'is-open' : ''}`}
                >
                  <h3>Resumen</h3>
                  <p>{mediaRenderizada.resumen}</p>
                </aside>
              </div>
            </div>
          </div>
        ) : null}

        {burbujaIzquierdaRender ? (
          <aside
            className={`ptar-usos__burbuja ptar-usos__burbuja--izquierda ptar-usos__burbuja--blanca ${
              burbujaIzquierdaVisible ? 'is-visible' : ''
            }`}
          >
            {burbujaIzquierdaRender}
          </aside>
        ) : null}

        {burbujaDerechaRender ? (
          <aside
            className={`ptar-usos__burbuja ptar-usos__burbuja--derecha ptar-usos__burbuja--roja ${
              burbujaDerechaRender === PASOS_RECORRIDO[0].burbujaDerecha ? 'is-intro' : ''
            } ${
              burbujaDerechaVisible ? 'is-visible' : ''
            }`}
          >
            {burbujaDerechaRender}
          </aside>
        ) : null}

        {abrirReproductor && mediaModal ? (
          <div className="ptar-usos__modal" role="dialog" aria-modal="true" aria-label="Reproductor de video">
            <button
              type="button"
              className="ptar-usos__modal-overlay"
              onClick={() => setAbrirReproductor(false)}
              aria-label="Cerrar reproductor"
            />
            <div className="ptar-usos__modal-content">
              <button
                type="button"
                className="ptar-usos__modal-close"
                onClick={() => setAbrirReproductor(false)}
                aria-label="Cerrar reproductor"
              >
                x
              </button>
              {mediaModal.embedUrl ? (
                <iframe
                  className="ptar-usos__video-player ptar-usos__video-player--iframe"
                  title={`Video de ${mediaModal.titulo.toLowerCase()}`}
                  src={mediaModal.embedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video className="ptar-usos__video-player" controls autoPlay poster={mediaModal.portada}>
                  <source src={mediaModal.video} type="video/mp4" />
                  Tu navegador no soporta este reproductor.
                </video>
              )}
            </div>
          </div>
        ) : null}

      </section>
    </main>
  )
}

export default CasosUsos
