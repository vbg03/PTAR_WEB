import { useCallback, useEffect, useRef, useState } from 'react'
import { useControlesNavegacion } from '../../hooks/useControlesNavegacion'
import { useNarracionVoces } from '../../hooks/useNarracionVoces'
import { useEsNavegacionTactil } from '../../hooks/useEsNavegacionTactil'
import { MODO_NAVEGACION_BOTONES } from '../../utils/navigationSettings'
import './informacion.css'

const ETAPA_BIENVENIDA = 0
const ETAPA_TITULO = 1
const ETAPA_VIDEO = 2
const ETAPA_UBICACION = 3

const PASO_VIDEO_INICIAL = 0
const PASO_VIDEO_EXPLICACION = 1
const PASO_VIDEO_PREGUNTA = 2
const PASO_UBICACION_RESPUESTA = 0
const PASO_UBICACION_PREGUNTA = 1
const DURACION_TRANSICION_ETAPA = 520
const DURACION_TRANSICION_POZO = 1480
const VIDEO_INICIAL_YOUTUBE_ID = 'AJVGGiLtAo8'
const VIDEO_INICIAL_EMBED_URL = `https://www.youtube.com/embed/${VIDEO_INICIAL_YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&cc_lang_pref=es&hl=es`
const VIDEO_UBICACION_YOUTUBE_ID = '2VKo5IrmLqs'
const VIDEO_UBICACION_EMBED_URL = `https://www.youtube.com/embed/${VIDEO_UBICACION_YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&cc_lang_pref=es&hl=es`
const VIDEO_UBICACION_POSTER = '/images/ubicacion1.png'

const CONVERSACIONES = {
  bienvenida:
    '¡Hola! Veo que tienes curiosidad por conocer nuestra planta de tratamiento de agua residual.',
  titulo: 'Sí, pero no tengo idea de lo que es eso. ¿Qué es exactamente una PTAR?',
  videoSiglas: 'PTAR son las siglas de "Planta de Tratamiento de Agua Residual".',
  videoExplicacion:
    'Es una instalación especializada donde limpiamos toda el agua que se contamina por las actividades diarias de la universidad: baños, cafeterías, laboratorios, lavamanos... todo.',
  videoPregunta: 'Ah, entiendo. ¿Y dónde está ubicada exactamente aquí en la UAO?',
  ubicacionPregunta:
    'Ah sí, creo que la he visto de lejos. ¿Pero cuéntame, cómo funciona todo? ¿Por dónde empieza el proceso?',
  ubicacionRespuesta:
    'La PTAR está ubicada en la parte posterior del campus, cerca de Villa Laurentino. Justo entre la calle 115 y la calle 42.'
}

function Informacion({ onCompletarInformacion, iniciarEnUbicacion = false }) {
  const esNavegacionTactil = useEsNavegacionTactil()
  const etapaInicial = iniciarEnUbicacion ? ETAPA_UBICACION : ETAPA_BIENVENIDA
  const pasoUbicacionInicial = iniciarEnUbicacion
    ? PASO_UBICACION_PREGUNTA
    : PASO_UBICACION_RESPUESTA

  const [etapaActual, setEtapaActual] = useState(etapaInicial)
  const [mostrarResumen, setMostrarResumen] = useState(false)
  const [mostrarResumenUbicacion, setMostrarResumenUbicacion] = useState(false)
  const [abrirReproductor, setAbrirReproductor] = useState(false)
  const [abrirReproductorUbicacion, setAbrirReproductorUbicacion] = useState(false)
  const [pasoConversacionVideo, setPasoConversacionVideo] = useState(PASO_VIDEO_INICIAL)
  const [pasoConversacionUbicacion, setPasoConversacionUbicacion] = useState(pasoUbicacionInicial)
  const [renderBloqueVideo, setRenderBloqueVideo] = useState(false)
  const [renderBloqueUbicacion, setRenderBloqueUbicacion] = useState(false)
  const [animarBloqueVideo, setAnimarBloqueVideo] = useState(false)
  const [animarBloqueUbicacion, setAnimarBloqueUbicacion] = useState(false)
  const [mostrarTransicionPozo, setMostrarTransicionPozo] = useState(false)
  const bloqueoScrollRef = useRef(false)
  const acumulacionScrollRef = useRef(0)
  const ultimaMarcaScrollRef = useRef(0)
  const ultimaActivacionScrollRef = useRef(0)
  const transicionPozoRef = useRef(false)
  const timeoutTransicionPozoRef = useRef(null)

  const iniciarTransicionPozo = useCallback(() => {
    if (transicionPozoRef.current) {
      return
    }

    transicionPozoRef.current = true
    bloqueoScrollRef.current = true
    setMostrarTransicionPozo(true)

    timeoutTransicionPozoRef.current = window.setTimeout(() => {
      if (typeof onCompletarInformacion === 'function') {
        onCompletarInformacion()
      }
    }, DURACION_TRANSICION_POZO)
  }, [onCompletarInformacion])

  useEffect(() => {
    return () => {
      if (timeoutTransicionPozoRef.current) {
        window.clearTimeout(timeoutTransicionPozoRef.current)
      }
    }
  }, [])

  const manejarCambioPaso = useCallback(
    (direccionScroll) => {
      if (
        bloqueoScrollRef.current ||
        transicionPozoRef.current ||
        direccionScroll === 0
      ) {
        return
      }

      bloqueoScrollRef.current = true

      if (direccionScroll > 0) {
        if (etapaActual < ETAPA_VIDEO) {
          setEtapaActual((estadoAnterior) => {
            const nuevaEtapa = Math.min(estadoAnterior + 1, ETAPA_VIDEO)
            if (nuevaEtapa === ETAPA_VIDEO) {
              setPasoConversacionVideo(PASO_VIDEO_INICIAL)
            }
            return nuevaEtapa
          })
        } else if (etapaActual === ETAPA_VIDEO) {
          if (pasoConversacionVideo < PASO_VIDEO_PREGUNTA) {
            setPasoConversacionVideo((pasoAnterior) =>
              Math.min(pasoAnterior + 1, PASO_VIDEO_PREGUNTA)
            )
          } else {
            setEtapaActual(ETAPA_UBICACION)
            setPasoConversacionUbicacion(PASO_UBICACION_RESPUESTA)
          }
        } else if (etapaActual === ETAPA_UBICACION) {
          if (pasoConversacionUbicacion < PASO_UBICACION_PREGUNTA) {
            setPasoConversacionUbicacion(PASO_UBICACION_PREGUNTA)
          } else {
            iniciarTransicionPozo()
          }
        }
      }

      if (direccionScroll < 0) {
        if (etapaActual === ETAPA_UBICACION) {
          if (pasoConversacionUbicacion > PASO_UBICACION_RESPUESTA) {
            setPasoConversacionUbicacion(PASO_UBICACION_RESPUESTA)
          } else {
            setEtapaActual(ETAPA_VIDEO)
            setPasoConversacionVideo(PASO_VIDEO_PREGUNTA)
          }
        } else if (etapaActual === ETAPA_VIDEO) {
          setPasoConversacionVideo((pasoAnterior) => {
            if (pasoAnterior > PASO_VIDEO_INICIAL) {
              return pasoAnterior - 1
            }

            setEtapaActual(ETAPA_TITULO)
            return PASO_VIDEO_INICIAL
          })
        } else {
          setEtapaActual((estadoAnterior) =>
            Math.max(estadoAnterior - 1, ETAPA_BIENVENIDA)
          )
        }
      }

      window.setTimeout(() => {
        if (!transicionPozoRef.current) {
          bloqueoScrollRef.current = false
        }
      }, 320)
    },
    [
      etapaActual,
      pasoConversacionVideo,
      pasoConversacionUbicacion,
      iniciarTransicionPozo
    ]
  )

  const modoNavegacion = useControlesNavegacion({
    acumulacionScrollRef,
    ultimaMarcaScrollRef,
    ultimaActivacionScrollRef,
    onAvanzar: useCallback(() => manejarCambioPaso(1), [manejarCambioPaso]),
    onRetroceder: useCallback(() => manejarCambioPaso(-1), [manejarCambioPaso])
  })

  useEffect(() => {
    if (etapaActual !== ETAPA_VIDEO) {
      setMostrarResumen(false)
      setAbrirReproductor(false)
    }

    if (etapaActual !== ETAPA_UBICACION) {
      setMostrarResumenUbicacion(false)
      setAbrirReproductorUbicacion(false)
      setPasoConversacionUbicacion(PASO_UBICACION_RESPUESTA)
    }
  }, [etapaActual])

  useEffect(() => {
    let timeoutEntrada = null
    let timeoutSalida = null

    if (etapaActual === ETAPA_VIDEO) {
      setRenderBloqueVideo(true)
      timeoutEntrada = window.setTimeout(() => {
        setAnimarBloqueVideo(true)
      }, 20)
    } else {
      setAnimarBloqueVideo(false)
      timeoutSalida = window.setTimeout(() => {
        setRenderBloqueVideo(false)
      }, DURACION_TRANSICION_ETAPA)
    }

    return () => {
      if (timeoutEntrada) {
        window.clearTimeout(timeoutEntrada)
      }
      if (timeoutSalida) {
        window.clearTimeout(timeoutSalida)
      }
    }
  }, [etapaActual])

  useEffect(() => {
    let timeoutEntrada = null
    let timeoutSalida = null

    if (etapaActual === ETAPA_UBICACION) {
      setRenderBloqueUbicacion(true)
      timeoutEntrada = window.setTimeout(() => {
        setAnimarBloqueUbicacion(true)
      }, 20)
    } else {
      setAnimarBloqueUbicacion(false)
      timeoutSalida = window.setTimeout(() => {
        setRenderBloqueUbicacion(false)
      }, DURACION_TRANSICION_ETAPA)
    }

    return () => {
      if (timeoutEntrada) {
        window.clearTimeout(timeoutEntrada)
      }
      if (timeoutSalida) {
        window.clearTimeout(timeoutSalida)
      }
    }
  }, [etapaActual])

  const mostrarPtar = etapaActual >= ETAPA_TITULO
  const mostrarBloqueVideo = etapaActual === ETAPA_VIDEO
  const mostrarBloqueUbicacion = etapaActual === ETAPA_UBICACION
  const mostrarIndicacionScroll =
    etapaActual < ETAPA_VIDEO ||
    (etapaActual === ETAPA_UBICACION &&
      pasoConversacionUbicacion === PASO_UBICACION_PREGUNTA)
  const textoIndicacionScroll =
    etapaActual === ETAPA_UBICACION &&
    pasoConversacionUbicacion === PASO_UBICACION_PREGUNTA
      ? modoNavegacion === MODO_NAVEGACION_BOTONES
        ? 'Usa la flecha derecha para seguir a Pozo 1'
        : esNavegacionTactil
        ? 'Desliza a la izquierda para seguir a Pozo 1'
        : 'Sigue con la rueda para ir a la estacion Pozo 1'
      : modoNavegacion === MODO_NAVEGACION_BOTONES
        ? 'Usa las flechas: derecha avanza, izquierda retrocede'
        : esNavegacionTactil
        ? 'Desliza: izquierda avanza, derecha retrocede'
        : 'Muevete usando la rueda del raton'

  const mostrarBurbujaBienvenida = etapaActual === ETAPA_BIENVENIDA
  const mostrarBurbujaTitulo = etapaActual === ETAPA_TITULO

  const mostrarBurbujaVideoSiglas =
    etapaActual === ETAPA_VIDEO && pasoConversacionVideo === PASO_VIDEO_INICIAL
  const mostrarBurbujaVideoExplicacion =
    etapaActual === ETAPA_VIDEO && pasoConversacionVideo === PASO_VIDEO_EXPLICACION
  const mostrarBurbujaVideoPregunta =
    etapaActual === ETAPA_VIDEO && pasoConversacionVideo === PASO_VIDEO_PREGUNTA

  const mostrarBurbujaUbicacionPregunta =
    etapaActual === ETAPA_UBICACION &&
    pasoConversacionUbicacion === PASO_UBICACION_PREGUNTA
  const mostrarBurbujaUbicacionRespuesta =
    etapaActual === ETAPA_UBICACION &&
    pasoConversacionUbicacion === PASO_UBICACION_RESPUESTA

  let colorAudioActivo = null
  let indiceAudioActivo = null

  if (mostrarBurbujaBienvenida) {
    colorAudioActivo = 'rojo'
    indiceAudioActivo = 1
  } else if (mostrarBurbujaTitulo) {
    colorAudioActivo = 'blanco'
    indiceAudioActivo = 1
  } else if (mostrarBurbujaVideoSiglas) {
    colorAudioActivo = 'rojo'
    indiceAudioActivo = 2
  } else if (mostrarBurbujaVideoExplicacion) {
    colorAudioActivo = 'rojo'
    indiceAudioActivo = 3
  } else if (mostrarBurbujaVideoPregunta) {
    colorAudioActivo = 'blanco'
    indiceAudioActivo = 2
  } else if (mostrarBurbujaUbicacionRespuesta) {
    colorAudioActivo = 'rojo'
    indiceAudioActivo = 4
  } else if (mostrarBurbujaUbicacionPregunta) {
    colorAudioActivo = 'blanco'
    indiceAudioActivo = 3
  }

  useNarracionVoces({
    seccion: 'informacion',
    colorActivo: colorAudioActivo,
    indiceActivo: indiceAudioActivo
  })

  let textoBurbujaIzquierda = CONVERSACIONES.titulo
  if (mostrarBurbujaVideoPregunta) {
    textoBurbujaIzquierda = CONVERSACIONES.videoPregunta
  }
  if (mostrarBurbujaUbicacionPregunta) {
    textoBurbujaIzquierda = CONVERSACIONES.ubicacionPregunta
  }

  let textoBurbujaDerecha = CONVERSACIONES.videoSiglas
  if (mostrarBurbujaBienvenida) {
    textoBurbujaDerecha = CONVERSACIONES.bienvenida
  } else if (mostrarBurbujaUbicacionRespuesta) {
    textoBurbujaDerecha = CONVERSACIONES.ubicacionRespuesta
  } else if (mostrarBurbujaVideoExplicacion) {
    textoBurbujaDerecha = CONVERSACIONES.videoExplicacion
  }

  return (
    <main className="ptar-info">
      <section
        className={`ptar-info__bienvenida ${mostrarTransicionPozo ? 'is-transicion-activa' : ''}`}
      >
        <img
          className="ptar-info__personaje ptar-info__personaje--izquierda"
          src="/images/estudianteNormal.svg"
          alt="Estudiante"
        />

        <aside
          key={`info-izq-${etapaActual}-${pasoConversacionVideo}-${pasoConversacionUbicacion}-${textoBurbujaIzquierda}`}
          className={`ptar-info__burbuja ptar-info__burbuja--izquierda ptar-info__burbuja--blanca ${
            mostrarBurbujaTitulo ? 'is-title-step' : ''
          } ${
            mostrarBurbujaVideoPregunta ? 'is-video-step' : ''
          } ${mostrarBurbujaUbicacionPregunta ? 'is-location-step' : ''} ${
            mostrarBurbujaTitulo ||
            mostrarBurbujaVideoPregunta ||
            mostrarBurbujaUbicacionPregunta
              ? 'is-visible'
              : ''
          }`}
          aria-hidden={
            !(
              mostrarBurbujaTitulo ||
              mostrarBurbujaVideoPregunta ||
              mostrarBurbujaUbicacionPregunta
            )
          }
        >
          {textoBurbujaIzquierda}
        </aside>

        {etapaActual !== ETAPA_UBICACION ? (
          <div className="ptar-info__titulos">
            <h2
              className={`ptar-info__titulo ${
                mostrarPtar ? 'is-hidden-left' : 'is-visible'
              }`}
            >
              ¡BIENVENIDO!
            </h2>
            <h2
              className={`ptar-info__titulo ptar-info__titulo--ptar ${
                mostrarPtar ? 'is-visible' : 'is-hidden-right'
              }`}
            >
              ¿PTAR?
            </h2>
          </div>
        ) : null}

        {renderBloqueVideo ? (
          <div className={`ptar-info__media ${animarBloqueVideo ? 'is-visible' : ''}`}>
            <div className={`ptar-info__media-track ${mostrarResumen ? 'is-summary-open' : ''}`}>
              <button
                type="button"
                className="ptar-info__video-preview"
                onClick={() => setAbrirReproductor(true)}
                aria-label="Abrir reproductor de video"
              >
                <img src="/images/video1.png" alt="Vista previa del video de la PTAR" />
                <span className="ptar-info__play-icon" aria-hidden="true">
                  ▶
                </span>
              </button>

              <div className="ptar-info__resumen-wrap">
                <button
                  type="button"
                  className="ptar-info__resumen-toggle"
                  onClick={() => setMostrarResumen((estadoAnterior) => !estadoAnterior)}
                  aria-expanded={mostrarResumen}
                  aria-controls="ptar-resumen"
                >
                  {mostrarResumen ? '▾' : '▸'}
                </button>
                <aside
                  id="ptar-resumen"
                  className={`ptar-info__resumen ${mostrarResumen ? 'is-open' : ''}`}
                >
                  <h3>Resumen del video:</h3>
                  <p>
                    La PTAR trata el agua residual en varias etapas para remover sólidos,
                    reducir la carga orgánica y devolver agua en mejores condiciones al entorno,
                    ayudando al cuidado ambiental del campus.
                  </p>
                </aside>
              </div>
            </div>
          </div>
        ) : null}

        {renderBloqueUbicacion ? (
          <div className={`ptar-info__ubicacion ${animarBloqueUbicacion ? 'is-visible' : ''}`}>
            <div className="ptar-info__ubicacion-track">
              <article className="ptar-info__mapa" aria-label="Mapa interactivo PTAR">
                <iframe
                  title="Ubicación de la PTAR en la UAO"
                  src="https://maps.google.com/maps?q=PTAR%20Universidad%20Autonoma%20de%20Occidente%20Cali&t=k&z=17&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </article>

              <div className="ptar-info__recorrido-wrap">
                <div className="ptar-info__video-preview ptar-info__video-preview--recorrido">
                  <img src={VIDEO_UBICACION_POSTER} alt="Vista previa del recorrido a la PTAR" />
                  <button
                    type="button"
                    className="ptar-info__play-button"
                    onClick={() => setAbrirReproductorUbicacion(true)}
                    aria-label="Abrir video del recorrido"
                  >
                    ▶
                  </button>
                </div>

                <div className="ptar-info__resumen-wrap ptar-info__resumen-wrap--recorrido">
                  <button
                    type="button"
                    className="ptar-info__resumen-toggle"
                    onClick={() =>
                      setMostrarResumenUbicacion((estadoAnterior) => !estadoAnterior)
                    }
                    aria-expanded={mostrarResumenUbicacion}
                    aria-controls="ptar-resumen-recorrido"
                  >
                    {mostrarResumenUbicacion ? '▾' : '▸'}
                  </button>
                  <aside
                    id="ptar-resumen-recorrido"
                    className={`ptar-info__resumen ptar-info__resumen--recorrido ${
                      mostrarResumenUbicacion ? 'is-open' : ''
                    }`}
                  >
                    <h3>Resumen del recorrido:</h3>
                    <p>
                      El recorrido muestra el acceso hacia la PTAR desde la zona posterior
                      del campus y los puntos de referencia para llegar fácilmente.
                    </p>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <aside
          key={`info-der-${etapaActual}-${pasoConversacionVideo}-${pasoConversacionUbicacion}-${textoBurbujaDerecha}`}
          className={`ptar-info__burbuja ptar-info__burbuja--derecha ptar-info__burbuja--roja ${
            mostrarBurbujaBienvenida ? 'is-welcome-step' : ''
          } ${
            mostrarBurbujaVideoSiglas || mostrarBurbujaVideoExplicacion ? 'is-video-step' : ''
          } ${
            mostrarBurbujaUbicacionRespuesta ? 'is-location-step' : ''
          } ${
            (mostrarResumen && mostrarBloqueVideo) ||
            (mostrarResumenUbicacion && mostrarBloqueUbicacion)
              ? 'is-behind-summary'
              : ''
          } ${
            mostrarBurbujaBienvenida ||
            mostrarBurbujaVideoSiglas ||
            mostrarBurbujaVideoExplicacion ||
            mostrarBurbujaUbicacionRespuesta
              ? 'is-visible'
              : ''
          }`}
          aria-hidden={
            !(
              mostrarBurbujaBienvenida ||
              mostrarBurbujaVideoSiglas ||
              mostrarBurbujaVideoExplicacion ||
              mostrarBurbujaUbicacionRespuesta
            )
          }
        >
          {textoBurbujaDerecha}
        </aside>

        {abrirReproductor ? (
          <div
            className="ptar-info__modal"
            role="dialog"
            aria-modal="true"
            aria-label="Reproductor ampliado"
          >
            <button
              type="button"
              className="ptar-info__modal-overlay"
              onClick={() => setAbrirReproductor(false)}
              aria-label="Cerrar reproductor"
            />
            <div className="ptar-info__modal-content">
              <button
                type="button"
                className="ptar-info__modal-close"
                onClick={() => setAbrirReproductor(false)}
                aria-label="Cerrar reproductor"
              >
                ×
              </button>
              <iframe
                className="ptar-info__video-player ptar-info__video-player--iframe"
                title="Video introductorio de la PTAR"
                src={VIDEO_INICIAL_EMBED_URL}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : null}

        {abrirReproductorUbicacion ? (
          <div
            className="ptar-info__modal"
            role="dialog"
            aria-modal="true"
            aria-label="Reproductor del recorrido"
          >
            <button
              type="button"
              className="ptar-info__modal-overlay"
              onClick={() => setAbrirReproductorUbicacion(false)}
              aria-label="Cerrar reproductor"
            />
            <div className="ptar-info__modal-content">
              <button
                type="button"
                className="ptar-info__modal-close"
                onClick={() => setAbrirReproductorUbicacion(false)}
                aria-label="Cerrar reproductor"
              >
                ×
              </button>
              <iframe
                className="ptar-info__video-player ptar-info__video-player--iframe"
                title="Video del recorrido hacia la PTAR"
                src={VIDEO_UBICACION_EMBED_URL}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : null}

        <img
          className="ptar-info__personaje ptar-info__personaje--derecha"
          src="/images/estudianteAmbiental.svg"
          alt="Guía ambiental"
        />

        {mostrarTransicionPozo ? (
          <div className="ptar-info__transicion-pozo" aria-hidden="true">
            <span className="ptar-info__transicion-capa" />
            <span className="ptar-info__transicion-destello" />
            <span className="ptar-info__transicion-destello ptar-info__transicion-destello--secundario" />
            <span className="ptar-info__transicion-franja ptar-info__transicion-franja--roja" />
            <span className="ptar-info__transicion-franja ptar-info__transicion-franja--vinotinto" />
            <span className="ptar-info__transicion-franja ptar-info__transicion-franja--crema" />
            <span className="ptar-info__transicion-franja ptar-info__transicion-franja--gris" />
          </div>
        ) : null}

        {mostrarIndicacionScroll ? (
          <p
            className={`ptar-info__hint-scroll${esNavegacionTactil ? ' is-touch' : ''}`}
            aria-live="polite"
          >
            {esNavegacionTactil ? (
              <>
                <span className="ptar-info__hint-gesture" aria-hidden="true">
                  <img
                    className="ptar-info__hint-gesture-icon"
                    src="/images/dedo-click.png"
                    alt=""
                  />
                </span>
                <span className="ptar-info__hint-scroll-text">{textoIndicacionScroll}</span>
              </>
            ) : (
              textoIndicacionScroll
            )}
          </p>
        ) : null}
      </section>
    </main>
  )
}

export default Informacion

