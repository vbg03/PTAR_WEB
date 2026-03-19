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

function Herramientas() {
  const herramientasRef = useRef(null)
  const esNavegacionTactil = useEsNavegacionTactil()
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false)
  const [mostrarPanelAudio, setMostrarPanelAudio] = useState(false)
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

  const alternarInstrucciones = () => {
    setMostrarInstrucciones((valorAnterior) => !valorAnterior)
    setMostrarPanelAudio(false)
  }

  const alternarPanelAudio = () => {
    setMostrarPanelAudio((valorAnterior) => !valorAnterior)
    setMostrarInstrucciones(false)
  }

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
                Puedes abrir esta ayuda y los controles de sonido desde los botones del
                lateral izquierdo.
              </li>
            </ul>
          </section>
        </div>
      ) : null}
    </>
  )
}

export default Herramientas
