import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { obtenerDireccionScrollPorGesto } from '../../../utils/wheelStepNavigation'
import { DEBUG_CAMARA_HABILITADO } from '../../../config/debugFlags'
import './tamizaje.css'

const DURACION_BLOQUEO_SCROLL = 340
const DURACION_AUTOAVANCE_TRANSICION = 920
const VALOR_MIN_CAMARA = -120
const VALOR_MAX_CAMARA = 220
const ZOOM_MIN_CAMARA = 0.2
const ZOOM_MAX_CAMARA = 12

const PASO_CAMBIO_ESCENARIO = 4
const PASO_TRANSICION_ESCENARIO = PASO_CAMBIO_ESCENARIO - 1
const PASO_PREVIO_TRANSICION_ESCENARIO = PASO_TRANSICION_ESCENARIO - 1
const PASO_POST_CAMBIO_ESCENARIO = PASO_CAMBIO_ESCENARIO + 1

const ESCENA_COMPARTIDA = '/svg/aireacion-sedimentador-tamizaje.svg'
const ESCENA_TAMIZAJE = '/images/tamizaje/tamizaje-filtro.svg'

const INDICADORES_FINALES = [
    { clave: 'dqo', etiqueta: 'DQO', valor: 26 },
    { clave: 'dbo', etiqueta: 'DBO', valor: 18 }
]

const PASO_BASE = {
    camaraX: 73.4,
    camaraY: 42.8,
    zoom: 3.18,
    gota: { x: 50, y: 58, escala: 0.34 },
    ocultarGota: true,
    gotaLimpia: false,
    chorroEntrada: {
        x: 36.8,
        y: 41.8,
        ancho: 3.6,
        alto: 12.2,
        opacidad: 0
    },
    residuo: {
        x: 42,
        y: 50,
        escala: 1,
        opacidad: 0
    },
    opacidadTurbidez: 0.46,
    gotaTema: '',
    marcador: null,
    burbujaIzquierda: '',
    burbujaDerecha: '',
    burbujaDerechaCompacta: false,
    mostrarPanelContaminantes: false,
    panelContaminantes: {
        x: 9.2,
        y: 42
    },
    indicadores: INDICADORES_FINALES,
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
        camaraX: 84.4,
        camaraY: 68.8,
        zoom: 3.3,
        ocultarGota: false,
        gotaLimpia: true,
        gota: { x: 42, y: 45, escala: 0.3 },
        marcador: { x: 50, y: 24, etiqueta: 'Camara de Tamiz' },
        burbujaDerecha:
            'El agua que sale del sedimentador, ya un poco mas clarificada, pasa primero por una camara de tamiz.'
    }),
    crearPaso({
        camaraX: 84.4,
        camaraY: 68.8,
        zoom: 3.3,
        ocultarGota: false,
        gotaLimpia: true,
        gota: { x: 45, y: 60, escala: 0.3 },
        burbujaIzquierda: 'Camara de tamiz? Que es eso?'
    }),
    crearPaso({
        camaraX: 84.4,
        camaraY: 68.8,
        zoom: 3.3,
        ocultarGota: false,
        gotaLimpia: true,
        gota: { x: 50, y: 70, escala: 0.3 },
        burbujaDerecha: 'Es un tanque con una malla fina instalada a lo largo.'
    }),
    crearPaso({
        camaraX: 84.4,
        camaraY: 68.8,
        zoom: 3.3,
        ocultarGota: true,
        soloTransicion: true
    }),
    crearPaso({
        camaraX: 14.4,
        camaraY: 47,
        zoom: 3.67,
        ocultarGota: false,
        gotaLimpia: true,
        gota: { x: 29, y: 70, escala: 0.3 },
        chorroEntrada: { x: 24.9, y: 50, ancho: 3.5, alto: 15, opacidad: 0.4 },
        opacidadTurbidez: 0.46,
        burbujaDerecha:
            'Aqui se atrapan las ultimas particulas finas que se escapan del tanque anterior.'
    }),
    crearPaso({
        camaraX: 14.4,
        camaraY: 47,
        zoom: 3.67,
        ocultarGota: false,
        gotaLimpia: false,
        gotaTema: 'paleta-tamiz',
        gota: { x: 41, y: 70, escala: 0.3 },
        chorroEntrada: { x: 24.9, y: 48.6, ancho: 3.5, alto: 11.4, opacidad: 0.5 },
        opacidadTurbidez: 0.36,
        burbujaDerechaCompacta: true,
        burbujaDerecha: 'Mueve la gota de agua y observa como cada vez se aclara más.'
    }),
    crearPaso({
        camaraX: 14.4,
        camaraY: 47,
        zoom: 3.67,
        ocultarGota: false,
        gotaLimpia: true,
        gotaTema: 'paleta-tamiz-2',
        gota: { x: 54, y: 70, escala: 0.3 },
        chorroEntrada: { x: 24.9, y: 48.6, ancho: 3.5, alto: 11.4, opacidad: 0.34 },
        opacidadTurbidez: 0.26,
        burbujaDerechaCompacta: true,
        burbujaDerecha: 'Mueve la gota de agua y observa como cada vez se aclara más.'
    }),
    crearPaso({
        camaraX: 14.4,
        camaraY: 47,
        zoom: 3.67,
        ocultarGota: false,
        gotaLimpia: true,
        gotaTema: 'paleta-tamiz-3',
        gota: { x: 67, y: 70, escala: 0.3 },
        chorroEntrada: { x: 24.9, y: 48.6, ancho: 3.5, alto: 11.4, opacidad: 0.24 },
        opacidadTurbidez: 0.17,
        burbujaDerechaCompacta: true,
        burbujaDerecha: 'Mueve la gota de agua y observa como cada vez se aclara más.'
    }),
    crearPaso({
        camaraX: 14.4,
        camaraY: 47,
        zoom: 3.67,
        ocultarGota: false,
        gotaLimpia: true,
        gotaTema: 'paleta-tamiz-3',
        gota: { x: 67, y: 70, escala: 0.3 },
        chorroEntrada: { x: 24.9, y: 48.6, ancho: 3.5, alto: 11.4, opacidad: 0.18 },
        residuo: { x: 72.6, y: 61.2, escala: 0.76, opacidad: 0.1 },
        opacidadTurbidez: 0.12,
        mostrarPanelContaminantes: true,
        burbujaDerechaCompacta: true,
        burbujaDerecha: '¡Bien hecho! Ahora podemos continuar al filtro rapido.'
    }),
    crearPaso({
        camaraX: 8.7,
        camaraY: 42,
        zoom: 2.74,
        ocultarGota: false,
        gotaLimpia: true,
        gotaTema: 'paleta-tamiz-3',
        gota: { x: 87, y: 67, escala: 0.25 },
        chorroEntrada: { x: 24.9, y: 48.6, ancho: 3.5, alto: 11.4, opacidad: 0.12 },
        opacidadTurbidez: 0.08,
        mostrarMediaFinal: true
    })
]

function limitar(valor, minimo, maximo) {
    return Math.min(Math.max(valor, minimo), maximo)
}

function limitarUnidad(valor) {
    return limitar(valor ?? 0, 0, 1)
}

function redondear(valor) {
    return Number(valor.toFixed(2))
}

function Tamizaje({ onVolverALechos, onCompletarTamizaje, iniciarEnFinal = false }) {
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
    const timeoutAutoavanceTransicionRef = useRef(null)
    const timeoutDebugCopiadoRef = useRef(null)

    const paso = PASOS_RECORRIDO[pasoActual]
    const usarEscenarioPrincipal = pasoActual >= PASO_CAMBIO_ESCENARIO
    const fondoEscena = usarEscenarioPrincipal ? ESCENA_TAMIZAJE : ESCENA_COMPARTIDA

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
        if (!paso.soloTransicion) {
            if (timeoutAutoavanceTransicionRef.current) {
                window.clearTimeout(timeoutAutoavanceTransicionRef.current)
                timeoutAutoavanceTransicionRef.current = null
            }
            return
        }

        bloqueoScrollRef.current = true

        timeoutAutoavanceTransicionRef.current = window.setTimeout(() => {
            setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
            timeoutAutoavanceTransicionRef.current = null
        }, DURACION_AUTOAVANCE_TRANSICION)

        if (timeoutBloqueoRef.current) {
            window.clearTimeout(timeoutBloqueoRef.current)
        }
        timeoutBloqueoRef.current = window.setTimeout(() => {
            bloqueoScrollRef.current = false
            timeoutBloqueoRef.current = null
        }, DURACION_AUTOAVANCE_TRANSICION + 140)

        return () => {
            if (timeoutAutoavanceTransicionRef.current) {
                window.clearTimeout(timeoutAutoavanceTransicionRef.current)
                timeoutAutoavanceTransicionRef.current = null
            }
        }
    }, [paso])

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

            if (paso.soloTransicion) {
                return
            }

            bloqueoScrollRef.current = true

            if (direccionScroll > 0) {
                if (pasoActual >= PASOS_RECORRIDO.length - 1) {
                    if (typeof onCompletarTamizaje === 'function') {
                        onCompletarTamizaje()
                    }
                } else {
                    setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
                }
            } else if (pasoActual > 0) {
                if (pasoActual === PASO_CAMBIO_ESCENARIO) {
                    setPasoActual(PASO_PREVIO_TRANSICION_ESCENARIO)
                } else {
                    setPasoActual((pasoAnterior) => Math.max(pasoAnterior - 1, 0))
                }
            } else if (typeof onVolverALechos === 'function') {
                onVolverALechos()
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
    }, [pasoActual, paso, onCompletarTamizaje, onVolverALechos])

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
            if (timeoutAutoavanceTransicionRef.current) {
                window.clearTimeout(timeoutAutoavanceTransicionRef.current)
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
            backgroundImage: `url('${fondoEscena}')`
        }),
        [fondoEscena]
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
    const ocultarContenidoEscena = !!paso.soloTransicion

    return (
        <main className="ptar-tam">
            <section className="ptar-tam__panel" style={estiloPanel} aria-label="Estacion de tamizaje">
                <div className="ptar-tam__escena" style={estiloEscena} aria-hidden="true" />
                <div className="ptar-tam__capa-escena" aria-hidden="true" />

                {!ocultarContenidoEscena ? (
                    <>
                        {usarEscenarioPrincipal ? (
                            <div className="ptar-tam__turbidez" style={estiloTurbidez} aria-hidden="true" />
                        ) : null}

                        {limitarUnidad(paso.chorroEntrada.opacidad) > 0 ? (
                            <div className="ptar-tam__chorro" style={estiloChorro} aria-hidden="true">
                                <span className="ptar-tam__chorro-columna" />
                                <span className="ptar-tam__chorro-espuma" />
                            </div>
                        ) : null}

                        {limitarUnidad(paso.residuo.opacidad) > 0 ? (
                            <span className="ptar-tam__residuo" style={estiloResiduo} aria-hidden="true" />
                        ) : null}

                        {paso.marcador ? (
                            <div
                                className="ptar-tam__marcador"
                                style={{ left: `${paso.marcador.x}%`, top: `${paso.marcador.y}%` }}
                                aria-hidden="true"
                            >
                                <span className="ptar-tam__marcador-label">{paso.marcador.etiqueta}</span>
                                <span className="ptar-tam__marcador-pin" />
                            </div>
                        ) : null}

                        {paso.mostrarPanelContaminantes ? (
                            <div className="ptar-tam__contaminantes" style={estiloPanelContaminantes} aria-hidden="true">
                                <h3>Contaminantes</h3>
                                <div className="ptar-tam__contaminantes-grid">
                                    {paso.indicadores.map((indicador) => (
                                        <div key={indicador.clave} className="ptar-tam__indicador">
                                            <div className="ptar-tam__indicador-canal">
                                                <span
                                                    className={`ptar-tam__indicador-relleno ptar-tam__indicador-relleno--${indicador.clave}`}
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
                            <div className="ptar-tam__media-final">
                                <div className={`ptar-tam__media-final-track ${mostrarResumenFinal ? 'is-summary-open' : ''}`}>
                                    <span className="ptar-tam__pin-video-final" aria-hidden="true" />
                                    <button
                                        type="button"
                                        className="ptar-tam__video-preview-final"
                                        onClick={() => setAbrirReproductorFinal(true)}
                                        aria-label="Abrir video de tamizaje"
                                    >
                                        <img src="/images/tamizaje/tamizaje.jpg" alt="Vista previa de tamizaje" />
                                        <span className="ptar-tam__play-icon-final" aria-hidden="true">
                                            <span className="ptar-tam__play-triangle-final" />
                                        </span>
                                    </button>

                                    <div className="ptar-tam__resumen-wrap-final">
                                        <button
                                            type="button"
                                            className="ptar-tam__resumen-toggle-final"
                                            onClick={() => setMostrarResumenFinal((estadoAnterior) => !estadoAnterior)}
                                            aria-expanded={mostrarResumenFinal}
                                            aria-controls="ptar-tam-resumen-final"
                                            aria-label={mostrarResumenFinal ? 'Ocultar resumen' : 'Mostrar resumen'}
                                        >
                                            <span
                                                className={`ptar-tam__resumen-chevron-final ${mostrarResumenFinal ? 'is-open' : ''}`}
                                                aria-hidden="true"
                                            />
                                        </button>
                                        <aside
                                            id="ptar-tam-resumen-final"
                                            className={`ptar-tam__resumen-final ${mostrarResumenFinal ? 'is-open' : ''}`}
                                        >
                                            <h3>Resumen de tamizaje</h3>
                                            <p>
                                                La malla fina retiene residuos livianos y particulas finales. El agua
                                                sale mas clara y lista para continuar al filtro rapido.
                                            </p>
                                        </aside>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {!paso.ocultarGota ? (
                            <img
                                className={`ptar-tam__gota ${paso.gotaLimpia ? 'ptar-tam__gota--limpia' : ''} ${paso.gotaTema ? `ptar-tam__gota--${paso.gotaTema}` : ''}`}
                                src="/svg/gota.svg"
                                alt="Particula de agua"
                                style={estiloGota}
                            />
                        ) : null}

                        <img
                            className="ptar-tam__avatar ptar-tam__avatar--izquierda"
                            src="/images/Estudiante%20blanco.png"
                            alt=""
                            aria-hidden="true"
                        />
                        <img
                            className="ptar-tam__avatar ptar-tam__avatar--derecha"
                            src="/images/Estudiante%20rojo.png"
                            alt=""
                            aria-hidden="true"
                        />

                        {paso.burbujaIzquierda ? (
                            <aside
                                key={`izquierda-${pasoActual}-${paso.burbujaIzquierda}`}
                                className="ptar-tam__burbuja ptar-tam__burbuja--izquierda ptar-tam__burbuja--blanca"
                            >
                                {paso.burbujaIzquierda}
                            </aside>
                        ) : null}

                        {paso.burbujaDerecha ? (
                            <aside
                                key={`derecha-${pasoActual}-${paso.burbujaDerecha}`}
                                className={`ptar-tam__burbuja ptar-tam__burbuja--derecha ptar-tam__burbuja--roja ${paso.burbujaDerechaCompacta ? 'is-compacta' : ''
                                    }`}
                            >
                                {paso.burbujaDerecha}
                            </aside>
                        ) : null}

                        {debugCamaraActiva ? (
                            <aside className="ptar-tam__debug-camara" role="status" aria-live="polite">
                                <p className="ptar-tam__debug-titulo">Debug camara (paso {pasoActual + 1})</p>
                                <p className="ptar-tam__debug-linea">
                                    X: {redondear(camaraActiva.camaraX)} | Y: {redondear(camaraActiva.camaraY)} | Zoom:{' '}
                                    {redondear(camaraActiva.zoom)}
                                </p>
                                <p className="ptar-tam__debug-linea">
                                    Flechas: mover | +/-: zoom | C: copiar | R: reset paso | F8: ocultar
                                </p>
                                <div className="ptar-tam__debug-botones">
                                    <button
                                        type="button"
                                        className="ptar-tam__debug-boton"
                                        onClick={() => {
                                            void copiarCamaraPasoActual()
                                        }}
                                    >
                                        {debugCopiado ? 'Copiado' : 'Copiar camara'}
                                    </button>
                                    <button
                                        type="button"
                                        className="ptar-tam__debug-boton ptar-tam__debug-boton--secundario"
                                        onClick={reiniciarCamaraPasoActual}
                                    >
                                        Reset paso
                                    </button>
                                </div>
                            </aside>
                        ) : null}

                        {abrirReproductorFinal ? (
                            <div className="ptar-tam__modal" role="dialog" aria-modal="true" aria-label="Reproductor de tamizaje">
                                <button
                                    type="button"
                                    className="ptar-tam__modal-overlay"
                                    onClick={() => setAbrirReproductorFinal(false)}
                                    aria-label="Cerrar reproductor"
                                />
                                <div className="ptar-tam__modal-content">
                                    <button
                                        type="button"
                                        className="ptar-tam__modal-close"
                                        onClick={() => setAbrirReproductorFinal(false)}
                                        aria-label="Cerrar reproductor"
                                    >
                                        x
                                    </button>
                                    <video className="ptar-tam__video-player" controls autoPlay poster="/images/tamizaje/tamizaje-filtro.svg">
                                        <source src="/videos/ptar.mp4" type="video/mp4" />
                                        Tu navegador no soporta este reproductor.
                                    </video>
                                </div>
                            </div>
                        ) : null}
                    </>
                ) : null}

                {paso.soloTransicion ? (
                    <div className="ptar-tam__transicion-vista" aria-hidden="true">
                        <span className="ptar-tam__transicion-capa" />
                        <span className="ptar-tam__transicion-franja ptar-tam__transicion-franja--roja" />
                        <span className="ptar-tam__transicion-franja ptar-tam__transicion-franja--vinotinto" />
                        <span className="ptar-tam__transicion-franja ptar-tam__transicion-franja--crema" />
                        <span className="ptar-tam__transicion-franja ptar-tam__transicion-franja--gris" />
                    </div>
                ) : null}
            </section>
        </main>
    )
}

export default Tamizaje

