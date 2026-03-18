import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { obtenerDireccionScrollPorGesto } from '../../../utils/wheelStepNavigation'
import { useNarracionVoces } from '../../../hooks/useNarracionVoces'
import { construirIndicesAudioPorPaso } from '../../../utils/voiceLibrary'
import { DEBUG_CAMARA_HABILITADO } from '../../../config/debugFlags'
import './filtro.css'

const DURACION_BLOQUEO_SCROLL = 340
const VALOR_MIN_CAMARA = -120
const VALOR_MAX_CAMARA = 220
const ZOOM_MIN_CAMARA = 0.2
const ZOOM_MAX_CAMARA = 12
const VIDEO_FILTRO_YOUTUBE_ID = 'XiSZi4xwoM8'
const VIDEO_FILTRO_EMBED_URL = `https://www.youtube.com/embed/${VIDEO_FILTRO_YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&cc_lang_pref=es&hl=es`

const ESCENA_FILTRO = '/images/tamizaje/tamizaje-filtro.svg'

const INDICADORES_BASE = [
    { clave: 'dqo', etiqueta: 'DQO', valor: 16 },
    { clave: 'dbo', etiqueta: 'DBO', valor: 11 }
]

const PASO_BASE = {
    camaraX: 12.9,
    camaraY: 47.8,
    zoom: 3.5,
    gota: { x: 30, y: 62, escala: 0.3 },
    ocultarGota: false,
    gotaLimpia: true,
    gotaTema: 'paleta-tamiz-3',
    chorroEntrada: {
        x: 26.8,
        y: 48.8,
        ancho: 3.6,
        alto: 11.8,
        opacidad: 0
    },
    capaFiltro: {
        x: 51.2,
        y: 63.8,
        ancho: 43,
        alto: 38,
        opacidad: 0,
        relleno: 0.26
    },
    residuo: {
        x: 41,
        y: 61,
        escala: 1,
        opacidad: 0
    },
    opacidadTurbidez: 0.2,
    marcador: null,
    burbujaIzquierda: '',
    burbujaDerecha: '',
    burbujaDerechaCompacta: false,
    mostrarPanelContaminantes: false,
    panelContaminantes: {
        x: 8.8,
        y: 42.4
    },
    indicadores: INDICADORES_BASE,
    mostrarMediaFinal: false
}

function crearPaso(override = {}) {
    return {
        ...PASO_BASE,
        ...override,
        gota: {
            ...PASO_BASE.gota,
            ...(override.gota ?? {})
        },
        chorroEntrada: {
            ...PASO_BASE.chorroEntrada,
            ...(override.chorroEntrada ?? {})
        },
        capaFiltro: {
            ...PASO_BASE.capaFiltro,
            ...(override.capaFiltro ?? {})
        },
        residuo: {
            ...PASO_BASE.residuo,
            ...(override.residuo ?? {})
        },
        panelContaminantes: {
            ...PASO_BASE.panelContaminantes,
            ...(override.panelContaminantes ?? {})
        },
        indicadores: override.indicadores ?? PASO_BASE.indicadores
    }
}

const PASOS_RECORRIDO = [
    crearPaso({
        camaraX: 31.3,
        camaraY: 51.2,
        zoom: 4.34,
        gotaLimpia: true,
        gotaTema: 'filtro-arena',
        gota: { x: 72.6, y: 51, escala: 0.4 },
        burbujaIzquierda: '¿Filtro rápido?\n¿Eso qué es?'
    }),
    crearPaso({
        camaraX: 42.3,
        camaraY: 51.2,
        zoom: 5.39,
        gotaLimpia: true,
        gotaTema: 'paleta-tamiz-3',
        gota: { x: 50, y: 51.2, escala: 0.55 },
        burbujaDerecha: 'El filtro rápido, que es una unidad complementaria muy importante.'
    }),
    crearPaso({
        camaraX: 51.3,
        camaraY: 51.2,
        zoom: 5.39,
        gotaLimpia: true,
        gotaTema: 'paleta-tamiz-3',
        gota: { x: 50, y: 51.2, escala: 0.55 },
        burbujaDerecha: 'Es un tanque grande, de cuatro metros ochenta por cada lado y casi tres metros de altura.'
    }),
    crearPaso({
        camaraX: 58.3,
        camaraY: 51.2,
        zoom: 5.39,
        gotaLimpia: true,
        gotaTema: 'paleta-tamiz-3',
        gota: { x: 50, y: 51.2, escala: 0.55 },
        burbujaIzquierda: '¿Y cómo funciona ese filtro?'
    }),
    crearPaso({
        camaraX: 96.6,
        camaraY: 57.8,
        zoom: 1.78,
        gotaLimpia: true,
        gotaTema: 'paleta-tamiz-3',
        gota: { x: 22, y: 46, escala: 0.16 },
        burbujaDerecha: 'Es como un colador grande que funciona de arriba hacia abajo.'
    }),
    crearPaso({
        camaraX: 96.6,
        camaraY: 57.8,
        zoom: 1.78,
        gotaLimpia: true,
        gotaTema: 'paleta-tamiz-3',
        gota: { x: 42, y: 50, escala: 0.16 },
        burbujaDerecha:
            'El agua entra por la parte de arriba y va bajando. Mientras baja, esas capas van atrapando las partículas mas chiquitas que todavía quedan en el agua.'
    }),
    crearPaso({
        camaraX: 96.6,
        camaraY: 57.8,
        zoom: 1.78,
        gotaLimpia: true,
        gotaTema: 'paleta-tamiz-3',
        gota: { x: 45, y: 58.5, escala: 0.16 },
        burbujaIzquierda:
            'O sea que el agua va quedando cada vez más limpia a medida que atraviesa las capas.'
    }),
    crearPaso({
        camaraX: 73.6,
        camaraY: 59.8,
        zoom: 6.54,
        gotaLimpia: true,
        gotaTema: 'paleta-tamiz-3',
        gota: { x: 50, y: 50, escala: 0.6 },
        burbujaDerecha:
            'Exactamente. Este filtro es capaz de remover mas del 90% de los solidos que aún pudieran quedar. El agua sale muy clara del filtro.'
    }),
    crearPaso({
        camaraX: 73.6,
        camaraY: 62.3,
        zoom: 6.54,
        gotaLimpia: true,
        gotaTema: 'filtro-arena',
        gota: { x: 50, y: 50, escala: 0.6 },
        burbujaDerecha:
            'La arena retiene las particulas microscopicas. La grava cumple la función de brindar soporte estructural a la arena y, adicionalmente, contribuye a la retención de partículas de menor tamaño, favoreciendo así el proceso de filtración.'
    }),
    crearPaso({
        camaraX: 73.6,
        camaraY: 65.1,
        zoom: 6.54,
        gotaLimpia: true,
        gotaTema: 'filtro-observa',
        gota: { x: 50, y: 50, escala: 0.6 },
        burbujaDerecha: 'Observa como la gota de agua se hace más clara al pasar por cada uno de los filtros.'
    }),
    crearPaso({
        camaraX: 73.6,
        camaraY: 68.3,
        zoom: 6.54,
        gotaLimpia: true,
        gotaTema: 'filtro-observa-clara',
        gota: { x: 50, y: 50, escala: 0.6 },
        burbujaDerecha: 'Observa como la gota de agua se hace más clara al pasar por cada uno de los filtros.'
    }),
    crearPaso({
        camaraX: 73.6,
        camaraY: 74.3,
        zoom: 6.54,
        gotaLimpia: true,
        gotaTema: 'filtro-observa-clara',
        gota: { x: 50, y: 17, escala: 0.6 },
        burbujaDerecha:
            'Finalmente, el agua filtrada llega a un falso fondo, que es una base con agujeros por donde sale el agua.'
    }),
    crearPaso({
        camaraX: 73.6,
        camaraY: 74.3,
        zoom: 6.54,
        gotaLimpia: true,
        gotaTema: 'filtro-agua-muy-clara',
        gota: { x: 50, y: 71.5, escala: 0.6 },
        burbujaIzquierda: '¿Y qué sucede con esa agua?'
    }),
    crearPaso({
        camaraX: 73.1,
        camaraY: 74.3,
        zoom: 3.94,
        gotaLimpia: true,
        gotaTema: 'filtro-agua-muy-clara',
        gota: { x: 57, y: 73, escala: 0.35 },
        burbujaDerecha: 'Pasa por una tubería la cual lleva el agua hacia la desinfección ultravioleta.'
    }),
    crearPaso({
        camaraX: 65.1,
        camaraY: 74.3,
        zoom: 3.94,
        gotaLimpia: true,
        gotaTema: 'filtro-agua-muy-clara',
        gota: { x: 57, y: 74, escala: 0.35 },
        mostrarPanelContaminantes: true,
        panelContaminantes: { x: 11.8, y: 42.4 },
        burbujaIzquierda: '¿Desinfeccion ultravioleta? Eso suena muy tecnologico.'
    }),
    crearPaso({
        camaraX: 101.8,
        camaraY: 50.2,
        zoom: 1.67,
         gotaLimpia: true,
        gotaTema: 'filtro-agua-muy-clara',
        gota: { x: 15, y: 90.6, escala: 0.19 },
        mostrarMediaFinal: true
    })
]

const INDICES_AUDIO_BLANCO = construirIndicesAudioPorPaso(
    PASOS_RECORRIDO,
    'burbujaIzquierda'
)
const INDICES_AUDIO_ROJO = construirIndicesAudioPorPaso(
    PASOS_RECORRIDO,
    'burbujaDerecha'
)

function limitar(valor, minimo, maximo) {
    return Math.min(Math.max(valor, minimo), maximo)
}

function limitarUnidad(valor) {
    return limitar(valor ?? 0, 0, 1)
}

function redondear(valor) {
    return Number(valor.toFixed(2))
}

function Filtro({ onVolverATamizaje, onCompletarFiltracion, iniciarEnFinal = false }) {
    const [pasoActual, setPasoActual] = useState(0)
    const [debugCamaraActiva, setDebugCamaraActiva] = useState(DEBUG_CAMARA_HABILITADO)
    const [debugCopiado, setDebugCopiado] = useState(false)
    const [debugCamarasPorPaso, setDebugCamarasPorPaso] = useState({})
    const [abrirReproductorFinal, setAbrirReproductorFinal] = useState(false)
    const [mostrarResumenFinal, setMostrarResumenFinal] = useState(false)
    const bloqueoScrollRef = useRef(false)
  const acumulacionScrollRef = useRef(0)
  const ultimaMarcaScrollRef = useRef(0)
  const ultimaActivacionScrollRef = useRef(0)
    const timeoutBloqueoRef = useRef(null)
    const timeoutDebugCopiadoRef = useRef(null)

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
        seccion: 'filtro',
        colorActivo: colorAudioActivo,
        indiceActivo: indiceAudioActivo
    })

    useEffect(() => {
        setPasoActual(iniciarEnFinal ? PASOS_RECORRIDO.length - 1 : 0)
        setAbrirReproductorFinal(false)
        setMostrarResumenFinal(false)
    }, [iniciarEnFinal])

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

    useEffect(() => {
        if (!paso.mostrarMediaFinal) {
            setAbrirReproductorFinal(false)
            setMostrarResumenFinal(false)
        }
    }, [paso])

    useEffect(() => {
        const manejarRueda = (event) => {
            const direccionScroll = obtenerDireccionScrollPorGesto(
            event,
            acumulacionScrollRef,
            ultimaMarcaScrollRef,
            ultimaActivacionScrollRef
        )

            if (bloqueoScrollRef.current || direccionScroll === 0) {
                return
            }

            bloqueoScrollRef.current = true

            if (direccionScroll > 0) {
                if (pasoActual >= PASOS_RECORRIDO.length - 1) {
                    if (typeof onCompletarFiltracion === 'function') {
                        onCompletarFiltracion()
                    }
                } else {
                    setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
                }
            } else if (pasoActual > 0) {
                setPasoActual((pasoAnterior) => Math.max(pasoAnterior - 1, 0))
            } else if (typeof onVolverATamizaje === 'function') {
                onVolverATamizaje()
            }

            if (timeoutBloqueoRef.current) {
                window.clearTimeout(timeoutBloqueoRef.current)
            }

            timeoutBloqueoRef.current = window.setTimeout(() => {
                bloqueoScrollRef.current = false
                timeoutBloqueoRef.current = null
            }, DURACION_BLOQUEO_SCROLL)
        }

        window.addEventListener('wheel', manejarRueda, { passive: true })
        return () => {
            window.removeEventListener('wheel', manejarRueda)
        }
    }, [pasoActual, onCompletarFiltracion, onVolverATamizaje])

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
    }, [debugCamaraActiva, ajustarCamaraPasoActual, reiniciarCamaraPasoActual, copiarCamaraPasoActual])

    useEffect(() => {
        return () => {
            if (timeoutBloqueoRef.current) {
                window.clearTimeout(timeoutBloqueoRef.current)
            }
            if (timeoutDebugCopiadoRef.current) {
                window.clearTimeout(timeoutDebugCopiadoRef.current)
            }
        }
    }, [])

    const camaraActiva = obtenerCamaraActivaPaso()
    const estiloPanel = {
        '--cam-x': `${camaraActiva.camaraX}%`,
        '--cam-y': `${camaraActiva.camaraY}%`,
        '--cam-zoom': `${camaraActiva.zoom}`
    }
    const estiloEscena = useMemo(
        () => ({
            backgroundImage: `url('${ESCENA_FILTRO}')`
        }),
        []
    )
    const estiloGota = {
        left: `${paso.gota.x}%`,
        top: `${paso.gota.y}%`,
        '--gota-escala': `${paso.gota.escala}`
    }
    const estiloChorro = {
        left: `${paso.chorroEntrada.x}%`,
        top: `${paso.chorroEntrada.y}%`,
        '--chorro-ancho': `${paso.chorroEntrada.ancho}%`,
        '--chorro-alto': `${paso.chorroEntrada.alto}%`,
        '--chorro-opacidad': `${limitarUnidad(paso.chorroEntrada.opacidad)}`
    }
    const estiloCapaFiltro = {
        left: `${paso.capaFiltro.x}%`,
        top: `${paso.capaFiltro.y}%`,
        '--capa-ancho': `${paso.capaFiltro.ancho}%`,
        '--capa-alto': `${paso.capaFiltro.alto}%`,
        '--capa-opacidad': `${limitarUnidad(paso.capaFiltro.opacidad)}`,
        '--capa-relleno': `${limitarUnidad(paso.capaFiltro.relleno)}`
    }
    const estiloResiduo = {
        left: `${paso.residuo.x}%`,
        top: `${paso.residuo.y}%`,
        '--residuo-escala': `${paso.residuo.escala}`,
        opacity: limitarUnidad(paso.residuo.opacidad)
    }
    const estiloTurbidez = {
        '--turbidez-opacidad': `${limitarUnidad(paso.opacidadTurbidez)}`
    }
    const estiloPanelContaminantes = {
        left: `${paso.panelContaminantes.x}%`,
        top: `${paso.panelContaminantes.y}%`
    }

    return (
        <main className="ptar-fil">
            <section className="ptar-fil__panel" style={estiloPanel} aria-label="Estacion de filtracion">
                <div className="ptar-fil__escena" style={estiloEscena} aria-hidden="true" />
                <div className="ptar-fil__capa-escena" aria-hidden="true" />
                <div className="ptar-fil__turbidez" style={estiloTurbidez} aria-hidden="true" />

                <div className="ptar-fil__capa-filtro" style={estiloCapaFiltro} aria-hidden="true">
                    <span className="ptar-fil__capa-filtro-base" />
                    <span className="ptar-fil__capa-filtro-textura" />
                    <span className="ptar-fil__capa-filtro-relleno" />
                </div>

                {limitarUnidad(paso.chorroEntrada.opacidad) > 0 ? (
                    <div className="ptar-fil__chorro" style={estiloChorro} aria-hidden="true">
                        <span className="ptar-fil__chorro-columna" />
                        <span className="ptar-fil__chorro-espuma" />
                    </div>
                ) : null}

                {limitarUnidad(paso.residuo.opacidad) > 0 ? (
                    <span className="ptar-fil__residuo" style={estiloResiduo} aria-hidden="true" />
                ) : null}

                {paso.marcador ? (
                    <div
                        className="ptar-fil__marcador"
                        style={{ left: `${paso.marcador.x}%`, top: `${paso.marcador.y}%` }}
                        aria-hidden="true"
                    >
                        <span className="ptar-fil__marcador-label">{paso.marcador.etiqueta}</span>
                        <span className="ptar-fil__marcador-pin" />
                    </div>
                ) : null}

                {paso.mostrarPanelContaminantes ? (
                    <div className="ptar-fil__contaminantes" style={estiloPanelContaminantes} aria-hidden="true">
                        <h3>Contaminantes</h3>
                        <div className="ptar-fil__contaminantes-grid">
                            {paso.indicadores.map((indicador) => (
                                <div key={indicador.clave} className="ptar-fil__indicador">
                                    <div className="ptar-fil__indicador-canal">
                                        <span
                                            className={`ptar-fil__indicador-relleno ptar-fil__indicador-relleno--${indicador.clave}`}
                                            style={{ height: `${limitarUnidad(indicador.valor / 100) * 100}%` }}
                                        />
                                    </div>
                                    <span>{indicador.etiqueta}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                {paso.mostrarMediaFinal ? (
                    <div className="ptar-fil__media-final">
                        <div className={`ptar-fil__media-final-track ${mostrarResumenFinal ? 'is-summary-open' : ''}`}>
                            <span className="ptar-fil__pin-video-final" aria-hidden="true" />
                            <button
                                type="button"
                                className="ptar-fil__video-preview-final"
                                onClick={() => setAbrirReproductorFinal(true)}
                                aria-label="Abrir video de filtracion"
                            >
                                <img src="/images/filtro/filtro.jpg" alt="Vista previa de filtracion" />
                                <span className="ptar-fil__play-icon-final" aria-hidden="true">
                                    <span className="ptar-fil__play-triangle-final" />
                                </span>
                            </button>

                            <div className="ptar-fil__resumen-wrap-final">
                                <button
                                    type="button"
                                    className="ptar-fil__resumen-toggle-final"
                                    onClick={() => setMostrarResumenFinal((estadoAnterior) => !estadoAnterior)}
                                    aria-expanded={mostrarResumenFinal}
                                    aria-controls="ptar-fil-resumen-final"
                                    aria-label={mostrarResumenFinal ? 'Ocultar resumen' : 'Mostrar resumen'}
                                >
                                    <span
                                        className={`ptar-fil__resumen-chevron-final ${mostrarResumenFinal ? 'is-open' : ''}`}
                                        aria-hidden="true"
                                    />
                                </button>
                                <aside
                                    id="ptar-fil-resumen-final"
                                    className={`ptar-fil__resumen-final ${mostrarResumenFinal ? 'is-open' : ''}`}
                                >
                                    <h3>Resumen de filtracion</h3>
                                    <p>
                                        El agua pasa por el filtro rapido, baja su turbidez y se estabiliza para entrar
                                        a la fase de desinfeccion.
                                    </p>
                                </aside>
                            </div>
                        </div>
                    </div>
                ) : null}

                {!paso.ocultarGota ? (
                    <img
                        className={`ptar-fil__gota ${paso.gotaLimpia ? 'ptar-fil__gota--limpia' : ''} ${paso.gotaTema ? `ptar-fil__gota--${paso.gotaTema}` : ''}`}
                        src="/svg/gota.svg"
                        alt="Particula de agua"
                        style={estiloGota}
                    />
                ) : null}

                <img
                    className="ptar-fil__avatar ptar-fil__avatar--izquierda"
                    src="/images/Estudiante%20blanco.png"
                    alt=""
                    aria-hidden="true"
                />
                <img
                    className="ptar-fil__avatar ptar-fil__avatar--derecha"
                    src="/images/Estudiante%20rojo.png"
                    alt=""
                    aria-hidden="true"
                />

                {paso.burbujaIzquierda ? (
                    <aside
                        key={`izquierda-${pasoActual}-${paso.burbujaIzquierda}`}
                        className="ptar-fil__burbuja ptar-fil__burbuja--izquierda ptar-fil__burbuja--blanca"
                    >
                        {paso.burbujaIzquierda}
                    </aside>
                ) : null}

                {paso.burbujaDerecha ? (
                    <aside
                        key={`derecha-${pasoActual}-${paso.burbujaDerecha}`}
                        className={`ptar-fil__burbuja ptar-fil__burbuja--derecha ptar-fil__burbuja--roja ${paso.burbujaDerechaCompacta ? 'is-compacta' : ''}`}
                    >
                        {paso.burbujaDerecha}
                    </aside>
                ) : null}

                {debugCamaraActiva ? (
                    <aside className="ptar-fil__debug-camara" role="status" aria-live="polite">
                        <p className="ptar-fil__debug-titulo">Debug camara (paso {pasoActual + 1})</p>
                        <p className="ptar-fil__debug-linea">
                            X: {redondear(camaraActiva.camaraX)} | Y: {redondear(camaraActiva.camaraY)} | Zoom:{' '}
                            {redondear(camaraActiva.zoom)}
                        </p>
                        <p className="ptar-fil__debug-linea">
                            Flechas: mover | +/-: zoom | C: copiar | R: reset paso | F8: ocultar
                        </p>
                        <div className="ptar-fil__debug-botones">
                            <button
                                type="button"
                                className="ptar-fil__debug-boton"
                                onClick={() => {
                                    void copiarCamaraPasoActual()
                                }}
                            >
                                {debugCopiado ? 'Copiado' : 'Copiar camara'}
                            </button>
                            <button
                                type="button"
                                className="ptar-fil__debug-boton ptar-fil__debug-boton--secundario"
                                onClick={reiniciarCamaraPasoActual}
                            >
                                Reset paso
                            </button>
                        </div>
                    </aside>
                ) : null}

                {abrirReproductorFinal ? (
                    <div className="ptar-fil__modal" role="dialog" aria-modal="true" aria-label="Reproductor de filtracion">
                        <button
                            type="button"
                            className="ptar-fil__modal-overlay"
                            onClick={() => setAbrirReproductorFinal(false)}
                            aria-label="Cerrar reproductor"
                        />
                        <div className="ptar-fil__modal-content">
                            <button
                                type="button"
                                className="ptar-fil__modal-close"
                                onClick={() => setAbrirReproductorFinal(false)}
                                aria-label="Cerrar reproductor"
                            >
                                x
                            </button>
                            <iframe
                                className="ptar-fil__video-player ptar-fil__video-player--iframe"
                                title="Video de filtracion"
                                src={VIDEO_FILTRO_EMBED_URL}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    </div>
                ) : null}
            </section>
        </main>
    )
}

export default Filtro
