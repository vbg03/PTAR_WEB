import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { obtenerDireccionScrollPorGesto } from '../../../utils/wheelStepNavigation'
import { DEBUG_CAMARA_HABILITADO } from '../../../config/debugFlags'
import './desinfeccion.css'

const DURACION_BLOQUEO_SCROLL = 340
const VALOR_MIN_CAMARA = -120
const VALOR_MAX_CAMARA = 220
const ZOOM_MIN_CAMARA = 0.2
const ZOOM_MAX_CAMARA = 12

const ESCENA_DESINFECCION = '/svg/desinfeccion-almacenamiento.svg'
const ESTERILIZADOR_UV = '/images/desinfeccion/esterilizadorUV.svg'

const INDICADORES_BASE = [
    { clave: 'dqo', etiqueta: 'DQO', valor: 3 },
    { clave: 'dbo', etiqueta: 'DBO', valor: 1 }
]

const PASO_BASE = {
    camaraX: 77.4,
    camaraY: 46,
    zoom: 5.2,
    gota: { x: 80, y: 48, escala: 0.56 },
    ocultarGota: false,
    gotaLimpia: true,
    gotaTema: 'filtro-agua-muy-clara',
    esterilizador: {
        estado: 'oculto',
        x: 57.2,
        y: 56.8,
        ancho: 26,
        opacidad: 0
    },
    marcador: null,
    mostrarBotonActivar: false,
    burbujaIzquierda: '',
    burbujaDerecha: '',
    burbujaDerechaCompacta: false,
    mostrarPanelContaminantes: false,
    panelContaminantes: {
        x: 69,
        y: 38
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
        esterilizador: {
            ...PASO_BASE.esterilizador,
            ...(override.esterilizador ?? {})
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
        camaraX: 95.4,
        camaraY: 60.3,
        zoom: 12,
        gota: { x: 50, y: 50, escala: 1 },
        burbujaDerecha:
            'El agua puede estar clara pero puede aun tener microorganismos patógenos, bacterias dañinas que pueden causar enfermedades.'
    }),
    crearPaso({
        camaraX: 85.2,
        camaraY: 60.3,
        zoom: 12,
        gota: { x: 50, y: 50, escala: 1 },
        esterilizador: {
            estado: 'visible',
            x: -20,
            y: 48,
            ancho: 55,
            opacidad: 1
        },
        burbujaIzquierda: '¿Y cómo las eliminan?'
    }),
    crearPaso({
        camaraX: 77.9,
        camaraY: 56.3,
        zoom: 5.66,
        gota: { x: 77.2, y: 74, escala: 0.45 },
        esterilizador: {
            estado: 'visible',
            x: 47,
            y: 52,
            ancho: 49.5,
            opacidad: 1
        },
        burbujaDerecha: 'Usamos un sistema combinado: primero desinfección con luz ultravioleta y luego con cloro.'
    }),
    crearPaso({
        camaraX: 77.9,
        camaraY: 57.3,
        zoom: 5.66,
        gota: { x: 62, y: 69.5, escala: 0.45 },
        esterilizador: {
            estado: 'visible',
            x: 47,
            y: 47,
            ancho: 49.5,
            opacidad: 1
        },
        burbujaDerecha:
            'Tenemos un tanque especial fabricado en acero inoxidable con un sistema electrónico que tiene siete lámparas de luz UV.'
    }),
    crearPaso({
        camaraX: 77.2,
        camaraY: 57,
        zoom: 6.32,
        gota: { x: 63, y: 72.5, escala: 0.5 },
        esterilizador: {
            estado: 'visible',
            x: 46.6,
            y: 47.5,
            ancho: 55.5,
            opacidad: 1
        },
        burbujaIzquierda: '¿Y la luz UV mata las bacterias?'
    }),
    crearPaso({
        camaraX: 77.2,
        camaraY: 57,
        zoom: 6.32,
        gota: { x: 50, y: 72.5, escala: 0.5 },
        esterilizador: {
            estado: 'fade-out',
            x: 46.6,
            y: 47.5,
            ancho: 55.5,
            opacidad: 1
        },
        burbujaDerecha:
            'Si, la radiación ultravioleta daña el ADN de los microorganismos patógenos y los inactiva, impidiendo que se reproduzcan.'
    }),
    crearPaso({
        camaraX: 77.2,
        camaraY: 57,
        zoom: 6.32,
        gota: { x: 50, y: 72.5, escala: 0.5 },
        mostrarBotonActivar: true,
        burbujaDerecha:
            'Presiona el botón para activar la luz ultravioleta y eliminar los microorganismos restantes.'
    }),
    crearPaso({
        camaraX: 77.2,
        camaraY: 57,
        zoom: 6.32,
        gota: { x: 50, y: 72.5, escala: 0.5 },
        esterilizador: {
            estado: 'solo-uv',
            x: 52,
            y: 53,
            ancho: 45,
            opacidad: 1
        }
    }),
    crearPaso({
        camaraX: 77.2,
        camaraY: 57,
        zoom: 6.32,
        gota: { x: 50, y: 37, escala: 0.5 },
        gotaTema: 'desinfeccion-agua-cielo',
        esterilizador: {
            estado: 'solo-uv',
            x: 52,
            y: 53,
            ancho: 45,
            opacidad: 1
        },
        burbujaIzquierda: 'Mencionaste que también usan cloro.'
    }),
    crearPaso({
        camaraX: 77.2,
        camaraY: 57,
        zoom: 6.32,
        gota: { x: 20, y: 36, escala: 0.5 },
        gotaTema: 'desinfeccion-agua-cielo',
        esterilizador: {
            estado: 'solo-uv',
            x: 52,
            y: 53,
            ancho: 45,
            opacidad: 1
        },
        mostrarPanelContaminantes: true,
        panelContaminantes: { x: 66, y: 38 },
        burbujaDerechaCompacta: true,
        burbujaDerecha:
            'Correcto. Después de la luz UV, agregamos cloro para garantizar la desinfección completa.'
    }),
    crearPaso({
        camaraX: 85.2,
        camaraY: 48,
        zoom: 3.1,
        gota: { x: 20, y: 65.5, escala: 0.22 },
        gotaTema: 'desinfeccion-agua-cielo',
        esterilizador: {
            estado: 'solo-uv',
            x: 51,
            y: 74,
            ancho: 22,
            opacidad: 1
        },
        marcador: { x: 44.4, y: 22 },
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

function Desinfeccion({ onVolverAFiltro, onCompletarDesinfeccion, iniciarEnFinal = false }) {
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
                    if (typeof onCompletarDesinfeccion === 'function') {
                        onCompletarDesinfeccion()
                    }
                } else {
                    setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
                }
            } else if (pasoActual > 0) {
                setPasoActual((pasoAnterior) => Math.max(pasoAnterior - 1, 0))
            } else if (typeof onVolverAFiltro === 'function') {
                onVolverAFiltro()
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
    }, [pasoActual, onCompletarDesinfeccion, onVolverAFiltro])

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
            backgroundImage: `url('${ESCENA_DESINFECCION}')`
        }),
        []
    )
    const estiloGota = {
        left: `${paso.gota.x}%`,
        top: `${paso.gota.y}%`,
        '--gota-escala': `${paso.gota.escala}`
    }
    const estiloEsterilizador = {
        left: `${paso.esterilizador.x}%`,
        top: `${paso.esterilizador.y}%`,
        '--ester-ancho': `${paso.esterilizador.ancho}%`,
        '--ester-opacidad': `${limitarUnidad(paso.esterilizador.opacidad)}`
    }
    const estiloPanelContaminantes = {
        left: `${paso.panelContaminantes.x}%`,
        top: `${paso.panelContaminantes.y}%`
    }
    const mostrarEsterilizador =
        paso.esterilizador.estado !== 'oculto' && limitarUnidad(paso.esterilizador.opacidad) > 0
    const esterilizadorSoloUv = paso.esterilizador.estado === 'solo-uv'
    const esterilizadorActivo = paso.esterilizador.estado === 'activo' || esterilizadorSoloUv
    const esterilizadorPasoLamparasUv = pasoActual === 3

    return (
        <main className="ptar-des">
            <section className="ptar-des__panel" style={estiloPanel} aria-label="Estacion de desinfeccion">
                <div className="ptar-des__escena" style={estiloEscena} aria-hidden="true" />
                <div className="ptar-des__capa-escena" aria-hidden="true" />

                {mostrarEsterilizador ? (
                    <div
                        className={`ptar-des__esterilizador-wrap ${paso.esterilizador.estado === 'fade-out' ? 'is-fade-out' : ''
                            } ${esterilizadorActivo ? 'is-uv-active' : ''} ${esterilizadorPasoLamparasUv ? 'is-lamparas-focus' : ''}`}
                        style={estiloEsterilizador}
                        aria-hidden="true"
                    >
                        <img
                            className={`ptar-des__esterilizador ${esterilizadorSoloUv ? 'is-oculto' : ''}`}
                            src={ESTERILIZADOR_UV}
                            alt=""
                        />
                        {esterilizadorActivo ? (
                            <div className="ptar-des__uv-energia">
                                <span className="ptar-des__uv-wave ptar-des__uv-wave--izquierda" />
                                <span className="ptar-des__uv-wave ptar-des__uv-wave--derecha" />
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {paso.marcador ? (
                    <div
                        className="ptar-des__marcador"
                        style={{ left: `${paso.marcador.x}%`, top: `${paso.marcador.y}%` }}
                        aria-hidden="true"
                    >
                        {paso.marcador.etiqueta ? (
                            <span className="ptar-des__marcador-label">{paso.marcador.etiqueta}</span>
                        ) : null}
                        <span className="ptar-des__marcador-pin" />
                    </div>
                ) : null}

                {paso.mostrarPanelContaminantes ? (
                    <div className="ptar-des__contaminantes" style={estiloPanelContaminantes} aria-hidden="true">
                        <h3>Contaminantes</h3>
                        <div className="ptar-des__contaminantes-grid">
                            {paso.indicadores.map((indicador) => (
                                <div key={indicador.clave} className="ptar-des__indicador">
                                    <div className="ptar-des__indicador-canal">
                                        <span
                                            className={`ptar-des__indicador-relleno ptar-des__indicador-relleno--${indicador.clave}`}
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
                    <div className="ptar-des__media-final">
                        <div className={`ptar-des__media-final-track ${mostrarResumenFinal ? 'is-summary-open' : ''}`}>
                            <span className="ptar-des__pin-video-final" aria-hidden="true" />
                            <button
                                type="button"
                                className="ptar-des__video-preview-final"
                                onClick={() => setAbrirReproductorFinal(true)}
                                aria-label="Abrir video de desinfeccion"
                            >
                                <img src="/images/desinfeccion/uv.jpg" alt="Vista previa de desinfeccion" />
                                <span className="ptar-des__play-icon-final" aria-hidden="true">
                                    <span className="ptar-des__play-triangle-final" />
                                </span>
                            </button>

                            <div className="ptar-des__resumen-wrap-final">
                                <button
                                    type="button"
                                    className="ptar-des__resumen-toggle-final"
                                    onClick={() => setMostrarResumenFinal((estadoAnterior) => !estadoAnterior)}
                                    aria-expanded={mostrarResumenFinal}
                                    aria-controls="ptar-des-resumen-final"
                                    aria-label={mostrarResumenFinal ? 'Ocultar resumen' : 'Mostrar resumen'}
                                >
                                    <span
                                        className={`ptar-des__resumen-chevron-final ${mostrarResumenFinal ? 'is-open' : ''}`}
                                        aria-hidden="true"
                                    />
                                </button>
                                <aside
                                    id="ptar-des-resumen-final"
                                    className={`ptar-des__resumen-final ${mostrarResumenFinal ? 'is-open' : ''}`}
                                >
                                    <h3>Resumen de desinfeccion</h3>
                                    <p>
                                        El agua recibe desinfeccion ultravioleta y luego cloro para eliminar
                                        microorganismos remanentes antes del almacenamiento.
                                    </p>
                                </aside>
                            </div>
                        </div>
                    </div>
                ) : null}

                {!paso.ocultarGota ? (
                    <img
                        className={`ptar-des__gota ${paso.gotaLimpia ? 'ptar-des__gota--limpia' : ''} ${paso.gotaTema ? `ptar-des__gota--${paso.gotaTema}` : ''}`}
                        src="/svg/gota.svg"
                        alt="Particula de agua"
                        style={estiloGota}
                    />
                ) : null}

                {paso.mostrarBotonActivar ? (
                    <button
                        type="button"
                        className="ptar-des__accion"
                        onClick={() => {
                            setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
                        }}
                    >
                        ACTIVAR
                    </button>
                ) : null}

                <img
                    className="ptar-des__avatar ptar-des__avatar--izquierda"
                    src="/images/Estudiante%20blanco.png"
                    alt=""
                    aria-hidden="true"
                />
                <img
                    className="ptar-des__avatar ptar-des__avatar--derecha"
                    src="/images/Estudiante%20rojo.png"
                    alt=""
                    aria-hidden="true"
                />

                {paso.burbujaIzquierda ? (
                    <aside
                        key={`izquierda-${pasoActual}-${paso.burbujaIzquierda}`}
                        className="ptar-des__burbuja ptar-des__burbuja--izquierda ptar-des__burbuja--blanca"
                    >
                        {paso.burbujaIzquierda}
                    </aside>
                ) : null}

                {paso.burbujaDerecha ? (
                    <aside
                        key={`derecha-${pasoActual}-${paso.burbujaDerecha}`}
                        className={`ptar-des__burbuja ptar-des__burbuja--derecha ptar-des__burbuja--roja ${paso.burbujaDerechaCompacta ? 'is-compacta' : ''}`}
                    >
                        {paso.burbujaDerecha}
                    </aside>
                ) : null}

                {debugCamaraActiva ? (
                    <aside className="ptar-des__debug-camara" role="status" aria-live="polite">
                        <p className="ptar-des__debug-titulo">Debug camara (paso {pasoActual + 1})</p>
                        <p className="ptar-des__debug-linea">
                            X: {redondear(camaraActiva.camaraX)} | Y: {redondear(camaraActiva.camaraY)} | Zoom:{' '}
                            {redondear(camaraActiva.zoom)}
                        </p>
                        <p className="ptar-des__debug-linea">
                            Flechas: mover | +/-: zoom | C: copiar | R: reset paso | F8: ocultar
                        </p>
                        <div className="ptar-des__debug-botones">
                            <button
                                type="button"
                                className="ptar-des__debug-boton"
                                onClick={() => {
                                    void copiarCamaraPasoActual()
                                }}
                            >
                                {debugCopiado ? 'Copiado' : 'Copiar camara'}
                            </button>
                            <button
                                type="button"
                                className="ptar-des__debug-boton ptar-des__debug-boton--secundario"
                                onClick={reiniciarCamaraPasoActual}
                            >
                                Reset paso
                            </button>
                        </div>
                    </aside>
                ) : null}

                {abrirReproductorFinal ? (
                    <div className="ptar-des__modal" role="dialog" aria-modal="true" aria-label="Reproductor de desinfeccion">
                        <button
                            type="button"
                            className="ptar-des__modal-overlay"
                            onClick={() => setAbrirReproductorFinal(false)}
                            aria-label="Cerrar reproductor"
                        />
                        <div className="ptar-des__modal-content">
                            <button
                                type="button"
                                className="ptar-des__modal-close"
                                onClick={() => setAbrirReproductorFinal(false)}
                                aria-label="Cerrar reproductor"
                            >
                                x
                            </button>
                            <video className="ptar-des__video-player" controls autoPlay poster="/images/desinfeccion/uv.jpg">
                                <source src="/videos/ptar.mp4" type="video/mp4" />
                                Tu navegador no soporta este reproductor.
                            </video>
                        </div>
                    </div>
                ) : null}
            </section>
        </main>
    )
}

export default Desinfeccion

