import { useEffect, useRef, useState } from 'react'
import './informacion.css'

const ETAPA_BIENVENIDA = 0
const ETAPA_TITULO = 1
const ETAPA_VIDEO = 2

function Informacion() {
  const [etapaActual, setEtapaActual] = useState(ETAPA_BIENVENIDA)
  const [mostrarResumen, setMostrarResumen] = useState(false)
  const [abrirReproductor, setAbrirReproductor] = useState(false)
  const bloqueoScrollRef = useRef(false)

  useEffect(() => {
    const manejarRueda = (event) => {
      if (bloqueoScrollRef.current) {
        return
      }

      if (event.deltaY > 0 && etapaActual < ETAPA_VIDEO) {
        bloqueoScrollRef.current = true
        setEtapaActual((estadoAnterior) => Math.min(estadoAnterior + 1, ETAPA_VIDEO))
        window.setTimeout(() => {
          bloqueoScrollRef.current = false
        }, 520)
      }

      if (event.deltaY < 0 && etapaActual > ETAPA_BIENVENIDA) {
        bloqueoScrollRef.current = true
        setEtapaActual((estadoAnterior) => Math.max(estadoAnterior - 1, ETAPA_BIENVENIDA))
        window.setTimeout(() => {
          bloqueoScrollRef.current = false
        }, 520)
      }
    }

    window.addEventListener('wheel', manejarRueda, { passive: true })

    return () => {
      window.removeEventListener('wheel', manejarRueda)
    }
  }, [etapaActual])

  const mostrarPtar = etapaActual >= ETAPA_TITULO
  const mostrarBloqueVideo = etapaActual === ETAPA_VIDEO

  return (
    <main className="ptar-info">
      <section className="ptar-info__bienvenida">
        <img
          className="ptar-info__personaje ptar-info__personaje--izquierda"
          src="/images/estudianteNormal.png"
          alt="Estudiante"
        />

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

        <div className={`ptar-info__media ${mostrarBloqueVideo ? 'is-visible' : ''}`}>
          <div className={`ptar-info__media-track ${mostrarResumen ? 'is-summary-open' : ''}`}>
            <button
              type="button"
              className="ptar-info__video-preview"
              onClick={() => setAbrirReproductor(true)}
              aria-label="Abrir reproductor de video"
            >
              <img src="/images/fondito.png" alt="Vista previa del video de PTAR" />
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
              <video
                className="ptar-info__video-player"
                controls
                autoPlay
                poster="/images/fondito.png"
              >
                <source src="/videos/ptar.mp4" type="video/mp4" />
                Tu navegador no soporta este reproductor.
              </video>
            </div>
          </div>
        ) : null}

        <img
          className="ptar-info__personaje ptar-info__personaje--derecha"
          src="/images/estudianteAmbiental.png"
          alt="Guía ambiental"
        />
      </section>
    </main>
  )
}

export default Informacion