import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  LLAVE_VOLUMEN_MUSICA,
  LLAVE_VOLUMEN_VOCES,
  VOLUMEN_DEFECTO_MUSICA,
  VOLUMEN_DEFECTO_VOCES,
  emitirEventoConfiguracionAudio,
  leerVolumenDesdeStorage
} from '../../utils/audioSettings'
import {
  CAMPOS_PERSONALIZABLES_VISUALES,
  MODO_TEMA_ALTO_CONTRASTE,
  MODO_TEMA_ESTANDAR,
  actualizarColorConfiguracionVisual,
  cambiarModoConfiguracionVisual,
  crearConfiguracionVisualBase,
  normalizarConfiguracionVisual,
  sonConfiguracionesVisualesIguales
} from '../../utils/themeSettings'
import { useEsNavegacionTactil } from '../../hooks/useEsNavegacionTactil'
import { useModoNavegacion } from '../../hooks/useModoNavegacion'
import {
  guardarModoNavegacion,
  MODO_NAVEGACION_BOTONES,
  MODO_NAVEGACION_GESTOS
} from '../../utils/navigationSettings'
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

function IconoAccesibilidad() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.75a9.25 9.25 0 1 0 9.25 9.25A9.26 9.26 0 0 0 12 2.75Zm0 1.8a7.41 7.41 0 0 1 4.84 13.03V6.42A7.35 7.35 0 0 1 12 4.55Zm-1.6.18v14.54a7.43 7.43 0 0 1 0-14.54Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconoConfiguracion() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10.55 3.18a1.8 1.8 0 0 1 2.9 0l.68.95a1.7 1.7 0 0 0 1.84.66l1.12-.3a1.8 1.8 0 0 1 2.05 2.05l-.3 1.12a1.7 1.7 0 0 0 .66 1.84l.95.68a1.8 1.8 0 0 1 0 2.9l-.95.68a1.7 1.7 0 0 0-.66 1.84l.3 1.12a1.8 1.8 0 0 1-2.05 2.05l-1.12-.3a1.7 1.7 0 0 0-1.84.66l-.68.95a1.8 1.8 0 0 1-2.9 0l-.68-.95a1.7 1.7 0 0 0-1.84-.66l-1.12.3a1.8 1.8 0 0 1-2.05-2.05l.3-1.12a1.7 1.7 0 0 0-.66-1.84l-.95-.68a1.8 1.8 0 0 1 0-2.9l.95-.68a1.7 1.7 0 0 0 .66-1.84l-.3-1.12a1.8 1.8 0 0 1 2.05-2.05l1.12.3a1.7 1.7 0 0 0 1.84-.66Zm1.45 5.57a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Herramientas({
  mostrarPantallaCompletaEnEstacion = false,
  configVisual = crearConfiguracionVisualBase(),
  configVisualGuardada = crearConfiguracionVisualBase(),
  onCambiarConfigVisual = () => {},
  onGuardarConfigVisual,
  onRestablecerConfigVisual
}) {
  const herramientasRef = useRef(null)
  const botonAudioRef = useRef(null)
  const panelAudioRef = useRef(null)
  const botonAccesibilidadRef = useRef(null)
  const panelAccesibilidadRef = useRef(null)
  const botonConfiguracionRef = useRef(null)
  const panelConfiguracionRef = useRef(null)
  const esNavegacionTactil = useEsNavegacionTactil()
  const modoNavegacion = useModoNavegacion()
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false)
  const [mostrarPanelAudio, setMostrarPanelAudio] = useState(false)
  const [mostrarPanelAccesibilidad, setMostrarPanelAccesibilidad] =
    useState(false)
  const [mostrarPanelConfiguracion, setMostrarPanelConfiguracion] =
    useState(false)
  const [soportaPantallaCompleta, setSoportaPantallaCompleta] = useState(false)
  const [enPantallaCompleta, setEnPantallaCompleta] = useState(false)
  const [enModoStandalone, setEnModoStandalone] = useState(false)
  const [offsetSuperiorHerramientas, setOffsetSuperiorHerramientas] =
    useState(92)
  const [volumenVoces, setVolumenVoces] = useState(() =>
    leerVolumenDesdeStorage(LLAVE_VOLUMEN_VOCES, VOLUMEN_DEFECTO_VOCES)
  )
  const [volumenMusica, setVolumenMusica] = useState(() =>
    leerVolumenDesdeStorage(LLAVE_VOLUMEN_MUSICA, VOLUMEN_DEFECTO_MUSICA)
  )
  const [estiloPanelAudio, setEstiloPanelAudio] = useState(null)
  const [estiloPanelAccesibilidad, setEstiloPanelAccesibilidad] =
    useState(null)
  const [estiloPanelConfiguracion, setEstiloPanelConfiguracion] =
    useState(null)
  const configuracionVisualActual = normalizarConfiguracionVisual(configVisual)
  const configuracionVisualPersistida = normalizarConfiguracionVisual(
    configVisualGuardada
  )
  const paletaActiva =
    configuracionVisualActual.paletas[configuracionVisualActual.modoActivo]
  const altoContrasteActivo =
    configuracionVisualActual.modoActivo === MODO_TEMA_ALTO_CONTRASTE
  const hayCambiosVisualesPendientes = !sonConfiguracionesVisualesIguales(
    configuracionVisualActual,
    configuracionVisualPersistida
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
    if (
      !esNavegacionTactil ||
      typeof window === 'undefined' ||
      modoNavegacion !== MODO_NAVEGACION_GESTOS
    ) {
      return undefined
    }

    return registrarNavegacionSwipeGlobal(window)
  }, [esNavegacionTactil, modoNavegacion])

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
    if (
      !mostrarPanelAudio &&
      !mostrarPanelAccesibilidad &&
      !mostrarPanelConfiguracion
    ) {
      return
    }

    const cerrarPanelesPorClickExterno = (event) => {
      if (!herramientasRef.current) {
        return
      }

      if (!herramientasRef.current.contains(event.target)) {
        setMostrarPanelAudio(false)
        setMostrarPanelAccesibilidad(false)
        setMostrarPanelConfiguracion(false)
      }
    }

    window.addEventListener('mousedown', cerrarPanelesPorClickExterno)
    return () =>
      window.removeEventListener('mousedown', cerrarPanelesPorClickExterno)
  }, [
    mostrarPanelAccesibilidad,
    mostrarPanelAudio,
    mostrarPanelConfiguracion
  ])

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
    setMostrarPanelAccesibilidad(false)
    setMostrarPanelConfiguracion(false)
  }

  const alternarPanelAudio = () => {
    setMostrarPanelAudio((valorAnterior) => !valorAnterior)
    setMostrarInstrucciones(false)
    setMostrarPanelAccesibilidad(false)
    setMostrarPanelConfiguracion(false)
  }

  const alternarPanelAccesibilidad = () => {
    setMostrarPanelAccesibilidad((valorAnterior) => !valorAnterior)
    setMostrarInstrucciones(false)
    setMostrarPanelAudio(false)
    setMostrarPanelConfiguracion(false)
  }

  const alternarPanelConfiguracion = () => {
    setMostrarPanelConfiguracion((valorAnterior) => !valorAnterior)
    setMostrarInstrucciones(false)
    setMostrarPanelAudio(false)
    setMostrarPanelAccesibilidad(false)
  }

  const obtenerBordeInferiorSeguroHeader = useCallback(() => {
    if (typeof document === 'undefined') {
      return 0
    }

    const logoHeader = document.querySelector('.ptar-header__logo')
    if (!(logoHeader instanceof HTMLElement)) {
      return 0
    }

    const rect = logoHeader.getBoundingClientRect()
    return rect.bottom > 24 ? rect.bottom : 0
  }, [])

  const calcularEstiloPopover = useCallback((boton, panel) => {
    if (!boton || !panel || typeof window === 'undefined') {
      return null
    }

    const rectBoton = boton.getBoundingClientRect()
    const rectPanel = panel.getBoundingClientRect()
    const viewport = window.visualViewport
    const anchoViewport = viewport?.width ?? window.innerWidth
    const altoViewport = viewport?.height ?? window.innerHeight
    const margenViewport = 12
    const separacion = 12
    const bordeInferiorHeader = obtenerBordeInferiorSeguroHeader()
    const limiteSuperiorSeguro = Math.max(
      margenViewport,
      bordeInferiorHeader > 0
        ? Math.round(bordeInferiorHeader + 18)
        : margenViewport
    )
    const espacioDerecha = anchoViewport - rectBoton.right - margenViewport
    const espacioIzquierda = rectBoton.left - margenViewport
    const abrirALaDerecha =
      espacioDerecha >= rectPanel.width || espacioDerecha >= espacioIzquierda

    let left = abrirALaDerecha
      ? rectBoton.right + separacion
      : rectBoton.left - rectPanel.width - separacion

    left = Math.min(
      Math.max(margenViewport, left),
      Math.max(margenViewport, anchoViewport - rectPanel.width - margenViewport)
    )

    const topLateral = rectBoton.top
    const topAscendente = rectBoton.bottom - rectPanel.height
    const debeAbrirseHaciaArriba =
      altoViewport <= 820 || topLateral + rectPanel.height > altoViewport - margenViewport

    let top = debeAbrirseHaciaArriba ? topAscendente : topLateral
    top = Math.min(
      Math.max(limiteSuperiorSeguro, top),
      Math.max(
        limiteSuperiorSeguro,
        altoViewport - rectPanel.height - margenViewport
      )
    )

    return {
      position: 'fixed',
      left: `${Math.round(left)}px`,
      top: `${Math.round(top)}px`,
      right: 'auto',
      bottom: 'auto',
      maxHeight: `${Math.max(
        180,
        Math.round(altoViewport - limiteSuperiorSeguro - margenViewport)
      )}px`
    }
  }, [obtenerBordeInferiorSeguroHeader])

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const actualizarOffsetSuperior = () => {
      const bordeInferiorHeader = obtenerBordeInferiorSeguroHeader()
      const offsetSeguro = Math.max(
        92,
        bordeInferiorHeader > 0 ? Math.round(bordeInferiorHeader + 18) : 92
      )

      setOffsetSuperiorHerramientas(offsetSeguro)
    }

    actualizarOffsetSuperior()
    window.addEventListener('resize', actualizarOffsetSuperior)
    window.visualViewport?.addEventListener('resize', actualizarOffsetSuperior)

    return () => {
      window.removeEventListener('resize', actualizarOffsetSuperior)
      window.visualViewport?.removeEventListener(
        'resize',
        actualizarOffsetSuperior
      )
    }
  }, [obtenerBordeInferiorSeguroHeader])

  const alternarModoContraste = () => {
    onCambiarConfigVisual((configAnterior) =>
      cambiarModoConfiguracionVisual(
        configAnterior,
        altoContrasteActivo
          ? MODO_TEMA_ESTANDAR
          : MODO_TEMA_ALTO_CONTRASTE
      )
    )
  }

  const manejarCambioColorVisual = (clave, valor) => {
    onCambiarConfigVisual((configAnterior) =>
      actualizarColorConfiguracionVisual(configAnterior, clave, valor)
    )
  }

  const guardarConfiguracionVisualActual = () => {
    if (typeof onGuardarConfigVisual === 'function') {
      onGuardarConfigVisual()
    }
  }

  const restablecerConfiguracionVisualActual = () => {
    if (typeof onRestablecerConfigVisual === 'function') {
      onRestablecerConfigVisual()
    }
  }

  const cambiarModoNavegacion = (modo) => {
    guardarModoNavegacion(modo)
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
        }
      }
    } catch {
    }
  }

  const mostrarBotonPantallaCompleta = soportaPantallaCompleta &&
    (esNavegacionTactil || mostrarPantallaCompletaEnEstacion)
  const mostrarBloqueoPantallaCompletaMovil =
    esNavegacionTactil &&
    !enPantallaCompleta &&
    !enModoStandalone

  useEffect(() => {
    if (
      !mostrarPanelAudio &&
      !mostrarPanelAccesibilidad &&
      !mostrarPanelConfiguracion
    ) {
      return
    }

    const cerrarPanelesConEscape = (event) => {
      if (event.key === 'Escape') {
        setMostrarPanelAudio(false)
        setMostrarPanelAccesibilidad(false)
        setMostrarPanelConfiguracion(false)
      }
    }

    window.addEventListener('keydown', cerrarPanelesConEscape)
    return () =>
      window.removeEventListener('keydown', cerrarPanelesConEscape)
  }, [
    mostrarPanelAccesibilidad,
    mostrarPanelAudio,
    mostrarPanelConfiguracion
  ])

  useLayoutEffect(() => {
    if (!mostrarPanelAudio) {
      setEstiloPanelAudio(null)
      return undefined
    }

    const actualizarPosicion = () => {
      setEstiloPanelAudio(
        calcularEstiloPopover(botonAudioRef.current, panelAudioRef.current)
      )
    }

    actualizarPosicion()
    window.addEventListener('resize', actualizarPosicion)
    window.visualViewport?.addEventListener('resize', actualizarPosicion)

    return () => {
      window.removeEventListener('resize', actualizarPosicion)
      window.visualViewport?.removeEventListener('resize', actualizarPosicion)
    }
  }, [calcularEstiloPopover, mostrarPanelAudio])

  useLayoutEffect(() => {
    if (!mostrarPanelAccesibilidad) {
      setEstiloPanelAccesibilidad(null)
      return undefined
    }

    const actualizarPosicion = () => {
      setEstiloPanelAccesibilidad(
        calcularEstiloPopover(
          botonAccesibilidadRef.current,
          panelAccesibilidadRef.current
        )
      )
    }

    actualizarPosicion()
    window.addEventListener('resize', actualizarPosicion)
    window.visualViewport?.addEventListener('resize', actualizarPosicion)

    return () => {
      window.removeEventListener('resize', actualizarPosicion)
      window.visualViewport?.removeEventListener('resize', actualizarPosicion)
    }
  }, [calcularEstiloPopover, mostrarPanelAccesibilidad])

  useLayoutEffect(() => {
    if (!mostrarPanelConfiguracion) {
      setEstiloPanelConfiguracion(null)
      return undefined
    }

    const actualizarPosicion = () => {
      setEstiloPanelConfiguracion(
        calcularEstiloPopover(
          botonConfiguracionRef.current,
          panelConfiguracionRef.current
        )
      )
    }

    actualizarPosicion()
    window.addEventListener('resize', actualizarPosicion)
    window.visualViewport?.addEventListener('resize', actualizarPosicion)

    return () => {
      window.removeEventListener('resize', actualizarPosicion)
      window.visualViewport?.removeEventListener('resize', actualizarPosicion)
    }
  }, [calcularEstiloPopover, mostrarPanelConfiguracion])

  return (
    <>
      <aside
        className="ptar-tools"
        aria-label="Herramientas de navegacion"
        ref={herramientasRef}
        style={{ '--ptar-tools-top': `${offsetSuperiorHerramientas}px` }}
      >
        <div className="ptar-tools__item">
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
        </div>

        {mostrarBotonPantallaCompleta ? (
          <div className="ptar-tools__item">
            <button
              type="button"
              className={`ptar-tools__button${enPantallaCompleta ? ' ptar-tools__button--activa' : ''}`}
              onClick={() => void alternarPantallaCompleta()}
              aria-label={enPantallaCompleta ? 'Salir de pantalla completa' : 'Activar pantalla completa'}
              title={enPantallaCompleta ? 'Salir de pantalla completa' : 'Activar pantalla completa'}
            >
              <IconoPantallaCompleta />
            </button>
          </div>
        ) : null}

        <div className="ptar-tools__item ptar-tools__item--popover">
          <button
            ref={botonAudioRef}
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
            <section
              id="ptar-panel-audio"
              className="ptar-tools__audio-panel"
              ref={panelAudioRef}
              style={estiloPanelAudio ?? undefined}
            >
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
        </div>

        <div className="ptar-tools__item ptar-tools__item--popover">
          <button
            ref={botonAccesibilidadRef}
            type="button"
            className={`ptar-tools__button${mostrarPanelAccesibilidad ? ' ptar-tools__button--activa' : ''}`}
            onClick={alternarPanelAccesibilidad}
            aria-label="Abrir configuracion de accesibilidad"
            aria-expanded={mostrarPanelAccesibilidad}
            aria-controls="ptar-panel-accesibilidad"
          >
            <IconoAccesibilidad />
          </button>

          {mostrarPanelAccesibilidad ? (
            <section
              id="ptar-panel-accesibilidad"
              className="ptar-tools__access-panel"
              ref={panelAccesibilidadRef}
              style={estiloPanelAccesibilidad ?? undefined}
            >
              <div className="ptar-tools__panel-head">
                <div>
                  <h3>Accesibilidad</h3>
                  <p>Configura contraste y colores de la interfaz.</p>
                </div>
                <span
                  className={`ptar-tools__status${hayCambiosVisualesPendientes ? ' is-pending' : ''}`}
                >
                  {hayCambiosVisualesPendientes ? 'Sin guardar' : 'Guardado'}
                </span>
              </div>

              <label className="ptar-tools__switch-field">
                <span className="ptar-tools__switch-copy">
                  <strong>Alto contraste</strong>
                  <small>
                    Cambia a una paleta mas marcada para distinguir botones,
                    iconos y graficos.
                  </small>
                </span>
                <button
                  type="button"
                  role="switch"
                  className={`ptar-tools__switch${altoContrasteActivo ? ' is-on' : ''}`}
                  aria-checked={altoContrasteActivo}
                  aria-label={
                    altoContrasteActivo
                      ? 'Desactivar alto contraste'
                      : 'Activar alto contraste'
                  }
                  onClick={alternarModoContraste}
                >
                  <span className="ptar-tools__switch-thumb" />
                </button>
              </label>

              <details className="ptar-tools__advanced">
                <summary>Configuracion avanzada</summary>
                <div className="ptar-tools__color-grid">
                  {CAMPOS_PERSONALIZABLES_VISUALES.map(({ clave, etiqueta }) => (
                    <label
                      key={clave}
                      className="ptar-tools__color-field"
                      htmlFor={`ptar-color-${clave}`}
                    >
                      <span>{etiqueta}</span>
                      <span className="ptar-tools__color-control">
                        <input
                          id={`ptar-color-${clave}`}
                          type="color"
                          value={paletaActiva[clave]}
                          onChange={(event) =>
                            manejarCambioColorVisual(clave, event.target.value)
                          }
                        />
                        <output htmlFor={`ptar-color-${clave}`}>
                          {paletaActiva[clave].toUpperCase()}
                        </output>
                      </span>
                    </label>
                  ))}
                </div>
              </details>

              <div className="ptar-tools__panel-actions">
                <button
                  type="button"
                  className="ptar-tools__panel-button"
                  onClick={guardarConfiguracionVisualActual}
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  className="ptar-tools__panel-button ptar-tools__panel-button--secondary"
                  onClick={restablecerConfiguracionVisualActual}
                >
                  Restablecer paleta
                </button>
              </div>

              <p className="ptar-tools__panel-note">
                Los colores guardados se mantienen al recargar la pagina.
              </p>
            </section>
          ) : null}
        </div>

        <div className="ptar-tools__item ptar-tools__item--popover">
          <button
            ref={botonConfiguracionRef}
            type="button"
            className={`ptar-tools__button${mostrarPanelConfiguracion ? ' ptar-tools__button--activa' : ''}`}
            onClick={alternarPanelConfiguracion}
            aria-label="Abrir configuracion de navegacion"
            aria-expanded={mostrarPanelConfiguracion}
            aria-controls="ptar-panel-configuracion-navegacion"
          >
            <IconoConfiguracion />
          </button>

          {mostrarPanelConfiguracion ? (
            <section
              id="ptar-panel-configuracion-navegacion"
              className="ptar-tools__settings-panel"
              ref={panelConfiguracionRef}
              style={estiloPanelConfiguracion ?? undefined}
            >
              <div className="ptar-tools__panel-head">
                <div>
                  <h3>Navegacion</h3>
                  <p>Elige como quieres moverte entre pasos en toda la experiencia.</p>
                </div>
              </div>

              <div
                className="ptar-tools__mode-options"
                role="radiogroup"
                aria-label="Modo de navegacion"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={modoNavegacion === MODO_NAVEGACION_GESTOS}
                  className={`ptar-tools__mode-option${modoNavegacion === MODO_NAVEGACION_GESTOS ? ' is-selected' : ''}`}
                  onClick={() => cambiarModoNavegacion(MODO_NAVEGACION_GESTOS)}
                >
                  <span className="ptar-tools__mode-indicator" aria-hidden="true" />
                  <span className="ptar-tools__mode-copy">
                    <strong>Rueda y gestos</strong>
                    <small>
                      {esNavegacionTactil
                        ? 'En moviles y tablets podras seguir deslizando para avanzar o retroceder.'
                        : 'Usa la rueda del raton o el touchpad para recorrer cada pantalla.'}
                    </small>
                  </span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={modoNavegacion === MODO_NAVEGACION_BOTONES}
                  className={`ptar-tools__mode-option${modoNavegacion === MODO_NAVEGACION_BOTONES ? ' is-selected' : ''}`}
                  onClick={() => cambiarModoNavegacion(MODO_NAVEGACION_BOTONES)}
                >
                  <span className="ptar-tools__mode-indicator" aria-hidden="true" />
                  <span className="ptar-tools__mode-copy">
                    <strong>Botones con flechas</strong>
                    <small>
                      Muestra controles fijos con flecha izquierda y derecha para cambiar
                      de paso sin usar rueda.
                    </small>
                  </span>
                </button>
              </div>
            </section>
          ) : null}
        </div>
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
              {modoNavegacion === MODO_NAVEGACION_BOTONES ? (
                <>
                  <li>Usa la flecha derecha para avanzar en el recorrido.</li>
                  <li>Usa la flecha izquierda para volver al paso anterior.</li>
                </>
              ) : esNavegacionTactil ? (
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
                Puedes cambiar entre rueda, gestos y botones con flechas desde el icono
                de configuracion en la barra lateral.
              </li>
              <li>
                Puedes abrir esta ayuda, los controles de sonido y la paleta de
                accesibilidad desde los botones laterales.
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
