import { useEffect, useRef, useState } from 'react'
import {
  LLAVE_VOLUMEN_MUSICA,
  LLAVE_VOLUMEN_VOCES,
  VOLUMEN_DEFECTO_MUSICA,
  VOLUMEN_DEFECTO_VOCES,
  emitirEventoConfiguracionAudio,
  leerVolumenDesdeStorage
} from '../../utils/audioSettings'
import { useEsNavegacionTactil } from '../../hooks/useEsNavegacionTactil'
import { registrarNavegacionSwipeGlobal } from '../../utils/wheelStepNavigation'
import './herramientas.css'

function IconoPregunta() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.75a9.25 9.25 0 1 0 9.25 9.25A9.26 9.26 0 0 0 12 2.75Zm0 14.65a1.13 1.13 0 1 1-1.13 1.12A1.13 1.13 0 0 1 12 17.4Zm1.67-4a3.53 3.53 0 0 0-1 .86.75.75 0 0 1-1.32-.7 4.67 4.67 0 0 1 1.43-1.26 1.74 1.74 0 0 0-.8-3.23 1.87 1.87 0 0 0-1.92 1.49.75.75 0 0 1-1.47-.29 3.35 3.35 0 0 1 3.39-2.7A3.24 3.24 0 0 1 13.67 13.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconoAudio() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M11.6 4.9a1.2 1.2 0 0 1 2.05.85v12.5a1.2 1.2 0 0 1-2.05.85L7.7 15.2H4.2A2.2 2.2 0 0 1 2 13V11a2.2 2.2 0 0 1 2.2-2.2h3.5Zm5.57 2.76a1 1 0 0 1 1.39.17 6.53 6.53 0 0 1 0 8.34 1 1 0 1 1-1.56-1.24 4.53 4.53 0 0 0 0-5.86 1 1 0 0 1 .17-1.41Zm2.71-2.55a1 1 0 0 1 1.4.14 10.53 10.53 0 0 1 0 13.5 1 1 0 1 1-1.54-1.27 8.53 8.53 0 0 0 0-10.96 1 1 0 0 1 .14-1.41Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconoPantallaCompleta() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 9V4h5v2H6v3H4Zm10-5h6v6h-2V6h-4V4ZM4 15h2v3h3v2H4v-5Zm14 3v-3h2v5h-5v-2h3Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Herramientas({ mostrarPantallaCompletaEnEstacion = false }) {
  const herramientasRef = useRef(null)
  const esNavegacionTactil = useEsNavegacionTactil()
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false)
  const [mostrarPanelAudio, setMostrarPanelAudio] = useState(false)
  const [soportaPantallaCompleta, setSoportaPantallaCompleta] = useState(false)
  const [enPantallaCompleta, setEnPantallaCompleta] = useState(false)
  const [enModoStandalone, setEnModoStandalone] = useState(false)
  const [volumenVoces, setVolumenVoces] = useState(() =>
    leerVolumenDesdeStorage(LLAVE_VOLUMEN_VOCES, VOLUMEN_DEFECTO_VOCES)
  )
  const [volumenMusica, setVolumenMusica] = useState(() =>
    leerVolumenDesdeStorage(LLAVE_VOLUMEN_MUSICA, VOLUMEN_DEFECTO_MUSICA)
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(LLAVE_VOLUMEN_VOCES, String(volumenVoces))
  }, [volumenVoces])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(LLAVE_VOLUMEN_MUSICA, String(volumenMusica))
  }, [volumenMusica])

  useEffect(() => {
    emitirEventoConfiguracionAudio({ volumenVoces, volumenMusica })
  }, [volumenVoces, volumenMusica])

  useEffect(() => {
    if (!esNavegacionTactil || typeof window === 'undefined') {
      return undefined
    }

    return registrarNavegacionSwipeGlobal(window)
  }, [esNavegacionTactil])

  useEffect(() => {
    if (!mostrarInstrucciones) {
      return
    }

    const cerrarConEscape = (event) => {
      if (event.key === 'Escape') {
        setMostrarInstrucciones(false)
      }
    }

    window.addEventListener('keydown', cerrarConEscape)
    return () => window.removeEventListener('keydown', cerrarConEscape)
  }, [mostrarInstrucciones])

  useEffect(() => {
    if (!mostrarPanelAudio) {
      return
    }

    const cerrarPanelAudioPorClickExterno = (event) => {
      if (!herramientasRef.current) {
        return
      }

      if (!herramientasRef.current.contains(event.target)) {
        setMostrarPanelAudio(false)
      }
    }

    window.addEventListener('mousedown', cerrarPanelAudioPorClickExterno)
    return () =>
      window.removeEventListener('mousedown', cerrarPanelAudioPorClickExterno)
  }, [mostrarPanelAudio])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    const elementoApp = document.getElementById('root')
    const elementoRaiz = document.documentElement
    const mediaStandalone =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(display-mode: standalone)')
        : null
    const soporta = Boolean(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      elementoRaiz.requestFullscreen ||
      elementoRaiz.webkitRequestFullscreen
    )

    const actualizarEstadoPantallaCompleta = () => {
      const hayPantallaCompleta = Boolean(
        document.fullscreenElement || document.webkitFullscreenElement
      )

      setEnPantallaCompleta(hayPantallaCompleta)

      if (!hayPantallaCompleta && elementoApp) {
        elementoApp.style.removeProperty('--ptar-fullscreen-lock-width')
        elementoApp.style.removeProperty('--ptar-fullscreen-lock-height')
      }
    }

    const actualizarModoStandalone = () => {
      const modoStandalone =
        Boolean(mediaStandalone?.matches) ||
        (typeof navigator !== 'undefined' && navigator.standalone === true)

      setEnModoStandalone(modoStandalone)
    }

    setSoportaPantallaCompleta(soporta)
    actualizarEstadoPantallaCompleta()
    actualizarModoStandalone()

    document.addEventListener('fullscreenchange', actualizarEstadoPantallaCompleta)
    document.addEventListener('webkitfullscreenchange', actualizarEstadoPantallaCompleta)
    if (typeof mediaStandalone?.addEventListener === 'function') {
      mediaStandalone.addEventListener('change', actualizarModoStandalone)
    } else if (typeof mediaStandalone?.addListener === 'function') {
      mediaStandalone.addListener(actualizarModoStandalone)
    }

    return () => {
      document.removeEventListener('fullscreenchange', actualizarEstadoPantallaCompleta)
      document.removeEventListener('webkitfullscreenchange', actualizarEstadoPantallaCompleta)
      if (typeof mediaStandalone?.removeEventListener === 'function') {
        mediaStandalone.removeEventListener('change', actualizarModoStandalone)
      } else if (typeof mediaStandalone?.removeListener === 'function') {
        mediaStandalone.removeListener(actualizarModoStandalone)
      }
    }
  }, [])

  useEffect(() => {
    if (
      typeof document === 'undefined' ||
      esNavegacionTactil ||
      mostrarPantallaCompletaEnEstacion ||
      !enPantallaCompleta
    ) {
      return
    }

    const salirPantallaCompleta =
      document.exitFullscreen?.bind(document) ||
      document.webkitExitFullscreen?.bind(document)

    if (!salirPantallaCompleta) {
      return
    }

    void salirPantallaCompleta().catch(() => {})
  }, [enPantallaCompleta, esNavegacionTactil, mostrarPantallaCompletaEnEstacion])

  const alternarInstrucciones = () => {
    setMostrarInstrucciones((valorAnterior) => !valorAnterior)
    setMostrarPanelAudio(false)
  }

  const alternarPanelAudio = () => {
    setMostrarPanelAudio((valorAnterior) => !valorAnterior)
    setMostrarInstrucciones(false)
  }

  const alternarPantallaCompleta = async () => {
    if (typeof document === 'undefined') {
      return
    }

    const elementoRaiz = document.getElementById('root') ?? document.documentElement
    const elementoEnPantallaCompleta =
      document.fullscreenElement || document.webkitFullscreenElement

    if (elementoEnPantallaCompleta) {
      const salirPantallaCompleta =
        document.exitFullscreen?.bind(document) ||
        document.webkitExitFullscreen?.bind(document)

      if (!salirPantallaCompleta) {
        return
      }

      try {
        await salirPantallaCompleta()
      } catch {
        // Algunos navegadores moviles rechazan la salida si el estado cambio fuera del gesto.
      }

      return
    }

    const solicitarPantallaCompleta =
      elementoRaiz.requestFullscreen?.bind(elementoRaiz) ||
      elementoRaiz.webkitRequestFullscreen?.bind(elementoRaiz)

    if (!solicitarPantallaCompleta) {
      return
    }

    const contenidoApp = document.querySelector('.ptar-app__content')
    if (elementoRaiz instanceof HTMLElement) {
      if (esNavegacionTactil) {
        elementoRaiz.style.removeProperty('--ptar-fullscreen-lock-width')
        elementoRaiz.style.removeProperty('--ptar-fullscreen-lock-height')
      } else if (contenidoApp instanceof HTMLElement) {
        const { width, height } = contenidoApp.getBoundingClientRect()
        if (width > 0 && height > 0) {
          elementoRaiz.style.setProperty('--ptar-fullscreen-lock-width', `${Math.round(width)}px`)
          elementoRaiz.style.setProperty('--ptar-fullscreen-lock-height', `${Math.round(height)}px`)
        }
      }
    }

    try {
      await solicitarPantallaCompleta()

      if (window.screen?.orientation?.lock) {
        try {
          await window.screen.orientation.lock('landscape')
        } catch {
          // No todos los navegadores permiten bloquear la orientacion.
        }
      }
    } catch {
      // En iOS y algunos navegadores la API puede no estar disponible para sitios web.
    }
  }

  const mostrarBotonPantallaCompleta = soportaPantallaCompleta &&
    (esNavegacionTactil || mostrarPantallaCompletaEnEstacion)
  const mostrarBloqueoPantallaCompletaMovil =
    esNavegacionTactil &&
    !enPantallaCompleta &&
    !enModoStandalone

  return (
    <>
      <aside className="ptar-tools" aria-label="Herramientas de navegacion" ref={herramientasRef}>
        <button
          type="button"
          className={`ptar-tools__button${mostrarInstrucciones ? ' ptar-tools__button--activa' : ''}`}
          onClick={alternarInstrucciones}
          aria-label="Abrir instrucciones"
          aria-expanded={mostrarInstrucciones}
          aria-controls="ptar-overlay-instrucciones"
        >
          <IconoPregunta />
        </button>

        {mostrarBotonPantallaCompleta ? (
          <button
            type="button"
            className={`ptar-tools__button${enPantallaCompleta ? ' ptar-tools__button--activa' : ''}`}
            onClick={() => void alternarPantallaCompleta()}
            aria-label={enPantallaCompleta ? 'Salir de pantalla completa' : 'Activar pantalla completa'}
            title={enPantallaCompleta ? 'Salir de pantalla completa' : 'Activar pantalla completa'}
          >
            <IconoPantallaCompleta />
          </button>
        ) : null}

        <button
          type="button"
          className={`ptar-tools__button${mostrarPanelAudio ? ' ptar-tools__button--activa' : ''}`}
          onClick={alternarPanelAudio}
          aria-label="Abrir control de volumen"
          aria-expanded={mostrarPanelAudio}
          aria-controls="ptar-panel-audio"
        >
          <IconoAudio />
        </button>

        {mostrarPanelAudio ? (
          <section id="ptar-panel-audio" className="ptar-tools__audio-panel">
            <h3>Sonido</h3>

            <label className="ptar-tools__slider-field" htmlFor="ptar-volumen-voces">
              <span>Voces</span>
              <output>{volumenVoces}%</output>
            </label>
            <input
              id="ptar-volumen-voces"
              type="range"
              min="0"
              max="100"
              value={volumenVoces}
              onChange={(event) => setVolumenVoces(Number(event.target.value))}
            />

            <label className="ptar-tools__slider-field" htmlFor="ptar-volumen-musica">
              <span>Musica</span>
              <output>{volumenMusica}%</output>
            </label>
            <input
              id="ptar-volumen-musica"
              type="range"
              min="0"
              max="100"
              value={volumenMusica}
              onChange={(event) => setVolumenMusica(Number(event.target.value))}
            />
          </section>
        ) : null}
      </aside>

      {mostrarBloqueoPantallaCompletaMovil ? (
        <div
          className="ptar-tools__fullscreen-required"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ptar-fullscreen-required-title"
        >
          <section className="ptar-tools__fullscreen-required-card">
            <h2 id="ptar-fullscreen-required-title">Activa pantalla completa</h2>
            <p>
              Para usar la experiencia en telefono, activa la pantalla completa desde el
              inicio.
            </p>
            {soportaPantallaCompleta ? (
              <button
                type="button"
                className="ptar-tools__fullscreen-required-button"
                onClick={() => void alternarPantallaCompleta()}
              >
                Activar pantalla completa
              </button>
            ) : (
              <p className="ptar-tools__fullscreen-required-note">
                Si tu navegador no permite pantalla completa aqui, abre la app desde la
                pantalla de inicio.
              </p>
            )}
          </section>
        </div>
      ) : null}

      {mostrarInstrucciones ? (
        <div
          id="ptar-overlay-instrucciones"
          className="ptar-help-overlay"
          onClick={() => setMostrarInstrucciones(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ptar-help-title"
        >
          <section className="ptar-help-overlay__card" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="ptar-help-overlay__close"
              onClick={() => setMostrarInstrucciones(false)}
              aria-label="Cerrar instrucciones"
            >
              Cerrar
            </button>

            <h2 id="ptar-help-title">Instrucciones</h2>
            <ul>
              {esNavegacionTactil ? (
                <>
                  <li>Desliza un dedo hacia la izquierda para avanzar en el recorrido.</li>
                  <li>Desliza un dedo hacia la derecha para retroceder al paso anterior.</li>
                </>
              ) : (
                <>
                  <li>Usa la rueda del raton para avanzar o retroceder en el recorrido.</li>
                  <li>En touchpad de portatil: desliza dos dedos hacia abajo para avanzar.</li>
                  <li>En touchpad de portatil: desliza dos dedos hacia arriba para retroceder.</li>
                  <li>Si el gesto no responde en tu equipo, usa un raton externo.</li>
                </>
              )}
              <li>
                Puedes abrir esta ayuda y los controles de sonido desde los botones
                laterales.
              </li>
              {mostrarBotonPantallaCompleta ? (
                <li>
                  Usa el boton de pantalla completa para ganar mas espacio cuando el
                  navegador lo permita.
                </li>
              ) : null}
              <li>
                Si quieres verla sin la barra del navegador, agrega la app a la pantalla
                de inicio desde el menu del navegador.
              </li>
            </ul>
          </section>
        </div>
      ) : null}
    </>
  )
}

export default Herramientas
