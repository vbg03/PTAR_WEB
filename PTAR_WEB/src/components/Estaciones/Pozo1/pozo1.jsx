import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { obtenerDireccionScrollPorGesto } from '../../../utils/wheelStepNavigation'
import { useNarracionVoces } from '../../../hooks/useNarracionVoces'
import { useEsNavegacionTactil } from '../../../hooks/useEsNavegacionTactil'
import { construirIndicesAudioPorPaso } from '../../../utils/voiceLibrary'
import { DEBUG_CAMARA_HABILITADO } from '../../../config/debugFlags'
import {
  EVENTO_CAMBIO_CONFIG_AUDIO,
  obtenerVolumenMusica
} from '../../../utils/audioSettings'
import './pozo1.css'

const DURACION_TRANSICION_REGRESO = 1180
const DURACION_BLOQUEO_SCROLL = 340
const VALOR_MIN_CAMARA = -120
const VALOR_MAX_CAMARA = 220
const ZOOM_MIN_CAMARA = 0.2
const ZOOM_MAX_CAMARA = 12
const VIDEO_POZO1_YOUTUBE_ID = 'VhDasYTYGrI'
const VIDEO_POZO1_EMBED_URL = `https://www.youtube.com/embed/${VIDEO_POZO1_YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&cc_lang_pref=es&hl=es`
const AUDIO_OBJETOS_POZO1 = '/audio/objetos.mp3'
const ASPECTO_ESCENA_POZO1_DESKTOP = 16 / 9
const ASPECTO_ESCENA_POZO1_DESKTOP_MAX = 2.12
const ASPECTO_ESCENA_POZO1_MOVIL = 19.5 / 9
const ANCHO_MAXIMO_MOVIL_LANDSCAPE = 950
const ALTO_MAXIMO_MOVIL_LANDSCAPE = 450
const AJUSTE_GLOBAL_CAMARA_X_POZO1 = 0
const PASO_RETIRO_SOLIDOS = 9
const PASO_SIGUIENTE_RETIRO_SOLIDOS = PASO_RETIRO_SOLIDOS + 1
const LIMITES_POZO_INTERACTIVO = {
  minX: 31,
  maxX: 68,
  minY: 56,
  maxY: 90
}

const RESIDUOS_POZO = [
  { id: 'pozo-1', src: '/images/pozo1/papel.png', x: 45, y: 67, escala: 0.62, rotacion: -18 },
  { id: 'pozo-2', src: '/images/pozo1/basura5.png', x: 50, y: 72, escala: 0.66, rotacion: 10 },
  { id: 'pozo-3', src: '/images/pozo1/basura4.png', x: 60, y: 78, escala: 1, rotacion: -12 },
  { id: 'pozo-4', src: '/images/pozo1/basura2.png', x: 40, y: 68, escala: 0.65, rotacion: 8 },
  { id: 'pozo-5', src: '/images/pozo1/basura3.png', x: 46, y: 82, escala: 0.8, rotacion: -14 },
  { id: 'pozo-6', src: '/images/pozo1/basura.png', x: 39, y: 79, escala: 0.52, rotacion: 16 }
]

const POSICIONES_INICIALES_RESIDUOS = Object.fromEntries(
  RESIDUOS_POZO.map((residuo) => [residuo.id, { x: residuo.x, y: residuo.y }])
)

const PASOS_RECORRIDO = [
  {
    camaraX: 0,
    camaraY: 22.8,
    zoom: 10,
    gota: { x: 30, y: 46, escala: 1.24 },
    papel: { x: 69, y: 46, escala: 2.5, rotacion: -10 },
    mostrarBasurasPozo: false,
    burbujaDerecha:
      'Todo empieza por lo que tiramos por el sanitario, lavamanos y desagues; luego viaja por tuberias subterraneas hasta llegar al pozo 1.'
  },
  {
    camaraX: 10,
    camaraY: 22.8,
    zoom: 10,
    gota: { x: 50, y: 46, escala: 1.24 },
    papel: { x: 17, y: 46, escala: 2, rotacion: 8 },
    mostrarBasurasPozo: false,
    burbujaIzquierda: '¿Aqui comienza a limpiarse?'
  },
  {
    camaraX: 20,
    camaraY: 22.8,
    zoom: 10,
    gota: { x: 66, y: 46, escala: 1.08 },
    papel: { x: 29, y: 46, escala: 2, rotacion: 6 },
    mostrarBasurasPozo: false,
    mostrarFlecha: false,
    burbujaDerecha:
      'Este es el primer filtro. Dentro del pozo se atrapan cosas grandes: trapos, bolsas, papel, toallas higiénicas, lo que la gente no debería botar.'
  },
  {
    camaraX: 23.6,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 17, y: 47.5, escala: 0.52 },
    papel: { x: 5, y: 48, escala: 0.9, rotacion: 6 },
    mostrarBasurasPozo: true,
    burbujaDerecha:
      'Tiene aproximadamente un metro treinta de diámetro y casi metro y medio de altura. Dentro del pozo hay dos bombas sumergibles muy especiales.'
  },
  {
    camaraX: 23.6,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 35, y: 47.9, escala: 0.4 },
    mostrarBasurasPozo: true,
    burbujaDerecha:
      'Estas bombas son inatascables y tienen unas cuchillas en la parte inferior que trituran los sólidos grandes que llegan con el agua.'
  },
  {
    camaraX: 23.6,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 54, y: 80, escala: 0.4 },
    mostrarBasurasPozo: true,
    burbujaDerecha:
      'Es como una licuadora industrial que desmenuza todo para que pueda ser bombeado hacia arriba sin tapar las tuberías.'
  },
  {
    camaraX: 23.6,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 54, y: 80, escala: 0.4 },
    mostrarBasurasPozo: true,
    burbujaDerecha:
      'Cuando sube el nivel del agua en el pozo, las bombas se activan de forma automatica.'
  },
  {
    camaraX: 23.6,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 54, y: 80, escala: 0.4 },
    mostrarBasurasPozo: true,
    burbujaIzquierda: '¿Y que pasa con los residuos que no se pueden triturar facilmente?'
  },
  {
    camaraX: 23.6,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 54, y: 80, escala: 0.4 },
    mostrarBasurasPozo: true,
    burbujaDerecha:
      'Esos residuos no organicos se retiran manualmente porque no deberian estar en la red sanitaria.'
  },
  {
    camaraX: 23.6,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 54, y: 80, escala: 0.4 },
    mostrarBasurasPozo: true,
    burbujaDerecha: 'Para retirarlos arrastra los solidos fuera del pozo.'
  },
  {
    camaraX: 23.6,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 54, y: 80, escala: 0.4 },
    mostrarBasurasPozo: false,
    burbujaDerecha: 'Perfecto. Ahora continuamos con el pretratamiento.'
  },
  {
    camaraX: 21.3,
    camaraY: 5.4,
    zoom: 2.93,
    gota: { x: 86, y: 63.2, escala: 0.4 },
    mostrarBasurasPozo: false,
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
const PASO_VIDEO_RESUMEN = PASOS_RECORRIDO.length - 1

function construirEstiloPosicion(posicion) {
  return {
    left: `${posicion.x}%`,
    top: `${posicion.y}%`,
    '--res-escala': `${posicion.escala ?? 1}`,
    '--res-rotacion': `${posicion.rotacion ?? 0}deg`
  }
}

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo)
}

function redondear(valor) {
  return Number(valor.toFixed(2))
}

function obtenerPuntoEnPanel(event, panel) {
  const rect = panel.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) {
    return null
  }

  return {
    x: limitar(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
    y: limitar(((event.clientY - rect.top) / rect.height) * 100, 0, 100)
  }
}

function Pozo1({ onVolverAUbicacion, onCompletarPozo1, iniciarEnFinal = false }) {
  const esNavegacionTactil = useEsNavegacionTactil()
  const [pasoActual, setPasoActual] = useState(() =>
    iniciarEnFinal ? PASOS_RECORRIDO.length - 1 : 0
  )
  const [mostrarTransicionRegreso, setMostrarTransicionRegreso] = useState(false)
  const [mostrarResumenPasoFinal, setMostrarResumenPasoFinal] = useState(false)
  const [abrirReproductorPasoFinal, setAbrirReproductorPasoFinal] = useState(false)
  const [debugCamaraActiva, setDebugCamaraActiva] = useState(DEBUG_CAMARA_HABILITADO)
  const [debugCopiado, setDebugCopiado] = useState(false)
  const [debugCamarasPorPaso, setDebugCamarasPorPaso] = useState({})
  const [dimensionesEscena, setDimensionesEscena] = useState(null)
  const [posicionesResiduos, setPosicionesResiduos] = useState(POSICIONES_INICIALES_RESIDUOS)
  const [residuosRetirados, setResiduosRetirados] = useState({})
  const [residuoArrastrandoId, setResiduoArrastrandoId] = useState(null)
  const bloqueoScrollRef = useRef(false)
  const acumulacionScrollRef = useRef(0)
  const ultimaMarcaScrollRef = useRef(0)
  const ultimaActivacionScrollRef = useRef(0)
  const transicionRegresoRef = useRef(false)
  const timeoutRegresoRef = useRef(null)
  const timeoutBloqueoRef = useRef(null)
  const timeoutDebugCopiadoRef = useRef(null)
  const viewportEscenaRef = useRef(null)
  const panelEscenaRef = useRef(null)
  const arrastreResiduoRef = useRef(null)
  const posicionesResiduosRef = useRef(POSICIONES_INICIALES_RESIDUOS)
  const residuosRetiradosRef = useRef({})
  const audioObjetosRef = useRef(null)
  const volumenMusicaRef = useRef(obtenerVolumenMusica())

  const detenerAudioObjetos = useCallback((reiniciar = false) => {
    const audio = audioObjetosRef.current
    if (!audio) {
      return
    }

    audio.pause()
    if (reiniciar) {
      audio.currentTime = 0
    }
  }, [])

  const iniciarAudioObjetos = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }

    const audio =
      audioObjetosRef.current ??
      (() => {
        const nuevoAudio = new Audio(AUDIO_OBJETOS_POZO1)
        nuevoAudio.preload = 'auto'
        nuevoAudio.loop = true
        audioObjetosRef.current = nuevoAudio
        return nuevoAudio
      })()

    audio.volume = volumenMusicaRef.current
    if (!audio.paused) {
      return
    }

    void audio.play().catch(() => {})
  }, [])

  const obtenerCamaraActivaPaso = useCallback(
    (pasoIndice = pasoActual) => {
      const pasoBase = PASOS_RECORRIDO[pasoIndice]
      const override = debugCamarasPorPaso[pasoIndice]

      if (!override) {
        return {
          camaraX: pasoBase.camaraX,
          camaraY: pasoBase.camaraY,
          zoom: pasoBase.zoom
        }
      }

      return override
    },
    [pasoActual, debugCamarasPorPaso]
  )

  const ajustarCamaraPasoActual = useCallback(
    (actualizarCamara) => {
      setDebugCamarasPorPaso((estadoAnterior) => {
        const camaraBase =
          estadoAnterior[pasoActual] ??
          (() => {
            const pasoBase = PASOS_RECORRIDO[pasoActual]
            return {
              camaraX: pasoBase.camaraX,
              camaraY: pasoBase.camaraY,
              zoom: pasoBase.zoom
            }
          })()

        const camaraNueva = actualizarCamara(camaraBase)
        return { ...estadoAnterior, [pasoActual]: camaraNueva }
      })
    },
    [pasoActual]
  )

  const reiniciarCamaraPasoActual = useCallback(() => {
    setDebugCamarasPorPaso((estadoAnterior) => {
      if (!estadoAnterior[pasoActual]) {
        return estadoAnterior
      }

      const nuevoEstado = { ...estadoAnterior }
      delete nuevoEstado[pasoActual]
      return nuevoEstado
    })
  }, [pasoActual])

  const copiarCamaraPasoActual = useCallback(async () => {
    const camara = obtenerCamaraActivaPaso()
    const bloque = `camaraX: ${redondear(camara.camaraX)},\ncamaraY: ${redondear(
      camara.camaraY
    )},\nzoom: ${redondear(camara.zoom)}`

    const copiarConAreaTexto = () => {
      const areaTexto = document.createElement('textarea')
      areaTexto.value = bloque
      document.body.appendChild(areaTexto)
      areaTexto.select()
      document.execCommand('copy')
      document.body.removeChild(areaTexto)
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(bloque)
      } else {
        copiarConAreaTexto()
      }
    } catch {
      copiarConAreaTexto()
    }

    setDebugCopiado(true)
    if (timeoutDebugCopiadoRef.current) {
      window.clearTimeout(timeoutDebugCopiadoRef.current)
    }
    timeoutDebugCopiadoRef.current = window.setTimeout(() => {
      setDebugCopiado(false)
    }, 1200)
  }, [obtenerCamaraActivaPaso])

  const iniciarTransicionRegreso = useCallback(() => {
    if (transicionRegresoRef.current) {
      return
    }

    transicionRegresoRef.current = true
    bloqueoScrollRef.current = true
    setMostrarTransicionRegreso(true)

    timeoutRegresoRef.current = window.setTimeout(() => {
      if (typeof onVolverAUbicacion === 'function') {
        onVolverAUbicacion()
      }
    }, DURACION_TRANSICION_REGRESO)
  }, [onVolverAUbicacion])

  useEffect(() => {
    posicionesResiduosRef.current = posicionesResiduos
  }, [posicionesResiduos])

  useEffect(() => {
    residuosRetiradosRef.current = residuosRetirados
  }, [residuosRetirados])

  useEffect(() => {
    const actualizarVolumenMusica = (event) => {
      const volumenEvento = Number(event?.detail?.volumenMusica)
      volumenMusicaRef.current = Number.isFinite(volumenEvento)
        ? limitar(volumenEvento, 0, 100) / 100
        : obtenerVolumenMusica()

      if (audioObjetosRef.current) {
        audioObjetosRef.current.volume = volumenMusicaRef.current
      }
    }

    window.addEventListener(EVENTO_CAMBIO_CONFIG_AUDIO, actualizarVolumenMusica)
    return () =>
      window.removeEventListener(
        EVENTO_CAMBIO_CONFIG_AUDIO,
        actualizarVolumenMusica
      )
  }, [])

  const retiroSolidosCompletado = Object.keys(residuosRetirados).length === RESIDUOS_POZO.length

  const manejarInicioArrastreResiduo = useCallback(
    (idResiduo, event) => {
      if (pasoActual !== PASO_RETIRO_SOLIDOS || residuosRetiradosRef.current[idResiduo]) {
        return
      }

      if (event.button !== 0) {
        return
      }

      event.preventDefault()

      const panel = panelEscenaRef.current
      if (!panel) {
        return
      }

      const punto = obtenerPuntoEnPanel(event, panel)
      if (!punto) {
        return
      }

      const posicionActual = posicionesResiduosRef.current[idResiduo] ?? POSICIONES_INICIALES_RESIDUOS[idResiduo]
      const offsetX = posicionActual.x - punto.x
      const offsetY = posicionActual.y - punto.y

      arrastreResiduoRef.current = {
        id: idResiduo,
        offsetX,
        offsetY
      }
      setResiduoArrastrandoId(idResiduo)
      iniciarAudioObjetos()
    },
    [iniciarAudioObjetos, pasoActual]
  )

  const reiniciarInteraccionResiduos = useCallback(() => {
    arrastreResiduoRef.current = null
    setResiduoArrastrandoId(null)
    setPosicionesResiduos(POSICIONES_INICIALES_RESIDUOS)
    posicionesResiduosRef.current = POSICIONES_INICIALES_RESIDUOS
    setResiduosRetirados({})
    residuosRetiradosRef.current = {}
    detenerAudioObjetos(true)
  }, [detenerAudioObjetos])

  useEffect(() => {
    const manejarMovimientoArrastre = (event) => {
      const estadoArrastre = arrastreResiduoRef.current
      if (!estadoArrastre) {
        return
      }

      const panel = panelEscenaRef.current
      if (!panel) {
        return
      }

      const punto = obtenerPuntoEnPanel(event, panel)
      if (!punto) {
        return
      }

      const nuevaPosicion = {
        x: limitar(punto.x + estadoArrastre.offsetX, 0, 100),
        y: limitar(punto.y + estadoArrastre.offsetY, 0, 100)
      }

      setPosicionesResiduos((estadoAnterior) => {
        const nuevoEstado = { ...estadoAnterior, [estadoArrastre.id]: nuevaPosicion }
        posicionesResiduosRef.current = nuevoEstado
        return nuevoEstado
      })
    }

    const finalizarArrastre = () => {
      const estadoArrastre = arrastreResiduoRef.current
      if (!estadoArrastre) {
        return
      }

      arrastreResiduoRef.current = null
      setResiduoArrastrandoId(null)
      detenerAudioObjetos(true)

      const posicion = posicionesResiduosRef.current[estadoArrastre.id]
      if (!posicion) {
        return
      }

      const quedoDentroPozo =
        posicion.x >= LIMITES_POZO_INTERACTIVO.minX &&
        posicion.x <= LIMITES_POZO_INTERACTIVO.maxX &&
        posicion.y >= LIMITES_POZO_INTERACTIVO.minY &&
        posicion.y <= LIMITES_POZO_INTERACTIVO.maxY

      if (quedoDentroPozo || residuosRetiradosRef.current[estadoArrastre.id]) {
        return
      }

      setResiduosRetirados((estadoAnterior) => {
        if (estadoAnterior[estadoArrastre.id]) {
          return estadoAnterior
        }

        const nuevoEstado = { ...estadoAnterior, [estadoArrastre.id]: true }
        residuosRetiradosRef.current = nuevoEstado

        if (Object.keys(nuevoEstado).length === RESIDUOS_POZO.length) {
          setPasoActual((pasoAnterior) =>
            pasoAnterior === PASO_RETIRO_SOLIDOS ? PASO_SIGUIENTE_RETIRO_SOLIDOS : pasoAnterior
          )
        }

        return nuevoEstado
      })
    }

    window.addEventListener('pointermove', manejarMovimientoArrastre)
    window.addEventListener('pointerup', finalizarArrastre)
    window.addEventListener('pointercancel', finalizarArrastre)

    return () => {
      window.removeEventListener('pointermove', manejarMovimientoArrastre)
      window.removeEventListener('pointerup', finalizarArrastre)
      window.removeEventListener('pointercancel', finalizarArrastre)
    }
  }, [detenerAudioObjetos])

  useEffect(() => {
    if (pasoActual !== PASO_VIDEO_RESUMEN) {
      setMostrarResumenPasoFinal(false)
      setAbrirReproductorPasoFinal(false)
    }
  }, [pasoActual])

  useLayoutEffect(() => {
    const viewport = viewportEscenaRef.current
    if (!viewport) {
      return undefined
    }

    const actualizarDimensionesEscena = () => {
      const { width, height } = viewport.getBoundingClientRect()
      if (!width || !height) {
        return
      }

      const esMovilLandscape =
        width > height &&
        width <= ANCHO_MAXIMO_MOVIL_LANDSCAPE &&
        height <= ALTO_MAXIMO_MOVIL_LANDSCAPE
      const aspectoViewport = width / height
      const aspectoEscena = esMovilLandscape
        ? ASPECTO_ESCENA_POZO1_MOVIL
        : limitar(
          aspectoViewport,
          ASPECTO_ESCENA_POZO1_DESKTOP,
          ASPECTO_ESCENA_POZO1_DESKTOP_MAX
        )

      let anchoEscena = width
      let altoEscena = anchoEscena / aspectoEscena

      if (altoEscena > height) {
        altoEscena = height
        anchoEscena = altoEscena * aspectoEscena
      }

      setDimensionesEscena((estadoAnterior) => {
        if (
          estadoAnterior &&
          Math.abs(estadoAnterior.width - anchoEscena) < 0.5 &&
          Math.abs(estadoAnterior.height - altoEscena) < 0.5
        ) {
          return estadoAnterior
        }

        return {
          width: anchoEscena,
          height: altoEscena
        }
      })
    }

    actualizarDimensionesEscena()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', actualizarDimensionesEscena)
      return () => {
        window.removeEventListener('resize', actualizarDimensionesEscena)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      actualizarDimensionesEscena()
    })

    resizeObserver.observe(viewport)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    if (pasoActual >= PASO_RETIRO_SOLIDOS) {
      return
    }

    const huboResiduosRetirados = Object.keys(residuosRetiradosRef.current).length > 0
    const huboMovimiento = RESIDUOS_POZO.some((residuo) => {
      const posicionActual = posicionesResiduosRef.current[residuo.id]
      const posicionInicial = POSICIONES_INICIALES_RESIDUOS[residuo.id]
      return (
        !!posicionActual &&
        (posicionActual.x !== posicionInicial.x || posicionActual.y !== posicionInicial.y)
      )
    })

    if (arrastreResiduoRef.current || huboResiduosRetirados || huboMovimiento) {
      reiniciarInteraccionResiduos()
    }
  }, [pasoActual, reiniciarInteraccionResiduos])

  useEffect(() => {
    if (pasoActual !== PASO_RETIRO_SOLIDOS) {
      detenerAudioObjetos(true)
    }
  }, [detenerAudioObjetos, pasoActual])

  useEffect(() => {
    return () => {
      if (timeoutRegresoRef.current) {
        window.clearTimeout(timeoutRegresoRef.current)
      }
      if (timeoutBloqueoRef.current) {
        window.clearTimeout(timeoutBloqueoRef.current)
      }
      if (timeoutDebugCopiadoRef.current) {
        window.clearTimeout(timeoutDebugCopiadoRef.current)
      }
      detenerAudioObjetos(true)
    }
  }, [detenerAudioObjetos])

  useEffect(() => {
    const manejarRueda = (event) => {
      const direccionScroll = obtenerDireccionScrollPorGesto(
      event,
      acumulacionScrollRef,
      ultimaMarcaScrollRef,
      ultimaActivacionScrollRef
    )

    if (bloqueoScrollRef.current || transicionRegresoRef.current || direccionScroll === 0) {
        return
      }

      if (direccionScroll > 0 && pasoActual === PASO_RETIRO_SOLIDOS && !retiroSolidosCompletado) {
        return
      }

      bloqueoScrollRef.current = true

      if (direccionScroll > 0) {
        if (pasoActual >= PASOS_RECORRIDO.length - 1) {
          if (typeof onCompletarPozo1 === 'function') {
            onCompletarPozo1()
          }
        } else {
          setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
        }
      } else if (pasoActual > 0) {
        setPasoActual((pasoAnterior) => Math.max(pasoAnterior - 1, 0))
      } else {
        iniciarTransicionRegreso()
      }

      if (timeoutBloqueoRef.current) {
        window.clearTimeout(timeoutBloqueoRef.current)
      }

      timeoutBloqueoRef.current = window.setTimeout(() => {
        if (!transicionRegresoRef.current) {
          bloqueoScrollRef.current = false
        }
      }, DURACION_BLOQUEO_SCROLL)
    }

    window.addEventListener('wheel', manejarRueda, { passive: true })

    return () => {
      window.removeEventListener('wheel', manejarRueda)
    }
  }, [pasoActual, iniciarTransicionRegreso, retiroSolidosCompletado, onCompletarPozo1])

  useEffect(() => {
    const manejarTecladoDebug = (event) => {
      if (DEBUG_CAMARA_HABILITADO && event.key === 'F8') {
        event.preventDefault()
        setDebugCamaraActiva((estadoAnterior) => !estadoAnterior)
        return
      }

      if (!DEBUG_CAMARA_HABILITADO || !debugCamaraActiva) {
        return
      }

      const pasoMovimiento = event.shiftKey ? 2 : event.altKey ? 0.1 : 0.5
      const pasoZoom = event.shiftKey ? 0.1 : event.altKey ? 0.01 : 0.03

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        ajustarCamaraPasoActual((camara) => ({
          ...camara,
          camaraX: limitar(camara.camaraX - pasoMovimiento, VALOR_MIN_CAMARA, VALOR_MAX_CAMARA)
        }))
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        ajustarCamaraPasoActual((camara) => ({
          ...camara,
          camaraX: limitar(camara.camaraX + pasoMovimiento, VALOR_MIN_CAMARA, VALOR_MAX_CAMARA)
        }))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        ajustarCamaraPasoActual((camara) => ({
          ...camara,
          camaraY: limitar(camara.camaraY - pasoMovimiento, VALOR_MIN_CAMARA, VALOR_MAX_CAMARA)
        }))
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        ajustarCamaraPasoActual((camara) => ({
          ...camara,
          camaraY: limitar(camara.camaraY + pasoMovimiento, VALOR_MIN_CAMARA, VALOR_MAX_CAMARA)
        }))
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        ajustarCamaraPasoActual((camara) => ({
          ...camara,
          zoom: limitar(camara.zoom + pasoZoom, ZOOM_MIN_CAMARA, ZOOM_MAX_CAMARA)
        }))
      } else if (event.key === '-') {
        event.preventDefault()
        ajustarCamaraPasoActual((camara) => ({
          ...camara,
          zoom: limitar(camara.zoom - pasoZoom, ZOOM_MIN_CAMARA, ZOOM_MAX_CAMARA)
        }))
      } else if (event.key.toLowerCase() === 'r') {
        event.preventDefault()
        reiniciarCamaraPasoActual()
      } else if (event.key.toLowerCase() === 'c') {
        event.preventDefault()
        void copiarCamaraPasoActual()
      }
    }

    window.addEventListener('keydown', manejarTecladoDebug)
    return () => {
      window.removeEventListener('keydown', manejarTecladoDebug)
    }
  }, [
    debugCamaraActiva,
    ajustarCamaraPasoActual,
    reiniciarCamaraPasoActual,
    copiarCamaraPasoActual
  ])

  const paso = PASOS_RECORRIDO[pasoActual]
  const indiceAudioIzquierda = paso.burbujaIzquierda
    ? INDICES_AUDIO_BLANCO[pasoActual]
    : null
  const indiceAudioDerecha = paso.burbujaDerecha
    ? INDICES_AUDIO_ROJO[pasoActual]
    : null
  const colorAudioActivo = indiceAudioDerecha
    ? 'rojo'
    : indiceAudioIzquierda
      ? 'blanco'
      : null
  const indiceAudioActivo = indiceAudioDerecha ?? indiceAudioIzquierda ?? null

  useNarracionVoces({
    seccion: 'pozo1',
    colorActivo: colorAudioActivo,
    indiceActivo: indiceAudioActivo
  })

  const esPasoRetiroSolidos = pasoActual === PASO_RETIRO_SOLIDOS
  const camaraActiva = obtenerCamaraActivaPaso()
  const camaraXAjustada = limitar(
    camaraActiva.camaraX + AJUSTE_GLOBAL_CAMARA_X_POZO1,
    VALOR_MIN_CAMARA,
    VALOR_MAX_CAMARA
  )
  const estiloPanel = {
    '--cam-x': `${camaraXAjustada}%`,
    '--cam-y': `${camaraActiva.camaraY}%`,
    '--cam-zoom': `${camaraActiva.zoom}`,
    ...(dimensionesEscena
      ? {
        width: `${dimensionesEscena.width}px`,
        height: `${dimensionesEscena.height}px`
      }
      : {})
  }
  const estiloGota = {
    left: `${paso.gota.x}%`,
    top: `${paso.gota.y}%`,
    '--gota-escala': `${paso.gota.escala}`
  }
  const mostrarBloqueVideoPasoFinal = pasoActual === PASO_VIDEO_RESUMEN
  const residuosVisiblesPozo = esPasoRetiroSolidos
    ? RESIDUOS_POZO.filter((residuo) => !residuosRetirados[residuo.id])
    : RESIDUOS_POZO

  return (
    <main
      className={`ptar-pozo1 ${mostrarTransicionRegreso ? 'is-regresando' : ''}`}
      ref={viewportEscenaRef}
    >
      <section
        className={`ptar-pozo1__panel ${mostrarTransicionRegreso ? 'is-regresando' : ''}`}
        style={estiloPanel}
        aria-label="Estacion Pozo 1"
        ref={panelEscenaRef}
      >
        <div className="ptar-pozo1__escena" aria-hidden="true" />
        <div className="ptar-pozo1__capa-escena" aria-hidden="true" />

        {paso.mostrarFlecha ? <span className="ptar-pozo1__flecha-entrada" aria-hidden="true" /> : null}

        {paso.papel ? (
          <img
            className="ptar-pozo1__residuo"
            src="/images/pozo1/papel.png"
            alt=""
            aria-hidden="true"
            style={construirEstiloPosicion(paso.papel)}
          />
        ) : null}

        {paso.basuraTuberia ? (
          <img
            className="ptar-pozo1__residuo"
            src={paso.basuraTuberia.src}
            alt=""
            aria-hidden="true"
            style={construirEstiloPosicion(paso.basuraTuberia)}
          />
        ) : null}

        {paso.mostrarBasurasPozo
          ? residuosVisiblesPozo.map((residuo, indice) => (
            <img
              key={residuo.id}
              className={`ptar-pozo1__residuo ptar-pozo1__residuo--pozo ${esPasoRetiroSolidos ? 'is-draggable' : ''
                } ${residuoArrastrandoId === residuo.id ? 'is-dragging' : ''}`}
              src={residuo.src}
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{
                ...construirEstiloPosicion({
                  ...residuo,
                  ...(esPasoRetiroSolidos
                    ? posicionesResiduos[residuo.id] ?? POSICIONES_INICIALES_RESIDUOS[residuo.id]
                    : POSICIONES_INICIALES_RESIDUOS[residuo.id])
                }),
                '--res-delay': `${indice * -0.45}s`
              }}
              onPointerDown={(event) => {
                manejarInicioArrastreResiduo(residuo.id, event)
              }}
            />
          ))
          : null}

        {mostrarBloqueVideoPasoFinal ? (
          <div className="ptar-pozo1__media-final">
            <div
              className={`ptar-pozo1__media-final-track ${mostrarResumenPasoFinal ? 'is-summary-open' : ''
                }`}
            >
              <img
                className="ptar-pozo1__pin-video-final"
                src="/images/ubicacion.png"
                alt=""
                aria-hidden="true"
              />
              <button
                type="button"
                className="ptar-pozo1__video-preview-final"
                onClick={() => setAbrirReproductorPasoFinal(true)}
                aria-label="Abrir video del pretratamiento"
              >
                <img src="/images/pozo1/pozo1.jpg" alt="Vista previa del video del pretratamiento" />
                <span className="ptar-pozo1__play-icon-final" aria-hidden="true">
                  ▶
                </span>
              </button>

              <div className="ptar-pozo1__resumen-wrap-final">
                <button
                  type="button"
                  className="ptar-pozo1__resumen-toggle-final"
                  onClick={() => setMostrarResumenPasoFinal((estadoAnterior) => !estadoAnterior)}
                  aria-expanded={mostrarResumenPasoFinal}
                  aria-controls="ptar-pozo1-resumen-final"
                >
                  {mostrarResumenPasoFinal ? '▾' : '▸'}
                </button>
                <aside
                  id="ptar-pozo1-resumen-final"
                  className={`ptar-pozo1__resumen-final ${mostrarResumenPasoFinal ? 'is-open' : ''}`}
                >
                  <h3>Resumen del pretratamiento:</h3>
                  <p>
                    En esta etapa se retienen y separan los residuos grandes que llegan en el
                    agua residual para proteger los equipos y preparar el flujo para el
                    tratamiento posterior.
                  </p>
                </aside>
              </div>
            </div>
          </div>
        ) : null}

        <img
          className="ptar-pozo1__gota"
          src="/svg/gota.svg"
          alt="Particula de agua"
          style={estiloGota}
        />

        <img
          className="ptar-pozo1__avatar ptar-pozo1__avatar--izquierda"
          src="/images/Estudiante%20blanco.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="ptar-pozo1__avatar ptar-pozo1__avatar--derecha"
          src="/images/Estudiante%20rojo.png"
          alt=""
          aria-hidden="true"
        />

        {paso.burbujaIzquierda ? (
          <aside
            key={`izquierda-${pasoActual}`}
            className="ptar-pozo1__burbuja ptar-pozo1__burbuja--izquierda ptar-pozo1__burbuja--blanca"
          >
            {paso.burbujaIzquierda}
          </aside>
        ) : null}

        {paso.burbujaDerecha ? (
          <aside
            key={`derecha-${pasoActual}`}
            className="ptar-pozo1__burbuja ptar-pozo1__burbuja--derecha ptar-pozo1__burbuja--roja"
          >
            {paso.burbujaDerecha}
          </aside>
        ) : null}

        {pasoActual <= 1 ? (
          <p className="ptar-pozo1__hint" aria-live="polite">
            {esNavegacionTactil
              ? 'Mueve la gota deslizando: izquierda avanza, derecha retrocede'
              : 'Mueve la gota de agua con la rueda del raton'}
          </p>
        ) : null}

        {debugCamaraActiva ? (
          <aside className="ptar-pozo1__debug-camara" role="status" aria-live="polite">
            <p className="ptar-pozo1__debug-titulo">Debug camara (paso {pasoActual + 1})</p>
            <p className="ptar-pozo1__debug-linea">
              X: {redondear(camaraActiva.camaraX)} | Y: {redondear(camaraActiva.camaraY)} | Zoom:{' '}
              {redondear(camaraActiva.zoom)}
            </p>
            <p className="ptar-pozo1__debug-linea">
              Flechas: mover | +/-: zoom | C: copiar | R: reset paso | F8: ocultar
            </p>
            <div className="ptar-pozo1__debug-botones">
              <button
                type="button"
                className="ptar-pozo1__debug-boton"
                onClick={() => {
                  void copiarCamaraPasoActual()
                }}
              >
                {debugCopiado ? 'Copiado' : 'Copiar camara'}
              </button>
              <button
                type="button"
                className="ptar-pozo1__debug-boton ptar-pozo1__debug-boton--secundario"
                onClick={reiniciarCamaraPasoActual}
              >
                Reset paso
              </button>
            </div>
          </aside>
        ) : null}

        {abrirReproductorPasoFinal ? (
          <div
            className="ptar-pozo1__modal"
            role="dialog"
            aria-modal="true"
            aria-label="Reproductor del Pozo 1"
          >
            <button
              type="button"
              className="ptar-pozo1__modal-overlay"
              onClick={() => setAbrirReproductorPasoFinal(false)}
              aria-label="Cerrar reproductor"
            />
            <div className="ptar-pozo1__modal-content">
              <button
                type="button"
                className="ptar-pozo1__modal-close"
                onClick={() => setAbrirReproductorPasoFinal(false)}
                aria-label="Cerrar reproductor"
              >
                ×
              </button>
              <iframe
                className="ptar-pozo1__video-player ptar-pozo1__video-player--iframe"
                title="Video del Pozo 1"
                src={VIDEO_POZO1_EMBED_URL}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : null}

        {mostrarTransicionRegreso ? (
          <div className="ptar-pozo1__transicion-regreso" aria-hidden="true">
            <span className="ptar-pozo1__transicion-capa" />
            <span className="ptar-pozo1__transicion-destello" />
            <span className="ptar-pozo1__transicion-franja ptar-pozo1__transicion-franja--roja" />
            <span className="ptar-pozo1__transicion-franja ptar-pozo1__transicion-franja--vinotinto" />
            <span className="ptar-pozo1__transicion-franja ptar-pozo1__transicion-franja--crema" />
            <span className="ptar-pozo1__transicion-franja ptar-pozo1__transicion-franja--gris" />
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default Pozo1

