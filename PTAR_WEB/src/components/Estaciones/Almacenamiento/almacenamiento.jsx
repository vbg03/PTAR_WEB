import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { obtenerDireccionScrollPorGesto } from '../../../utils/wheelStepNavigation'
import { useNarracionVoces } from '../../../hooks/useNarracionVoces'
import { construirIndicesAudioPorPaso } from '../../../utils/voiceLibrary'
import { DEBUG_CAMARA_HABILITADO } from '../../../config/debugFlags'
import './almacenamiento.css'

const DURACION_BLOQUEO_SCROLL = 340
const VALOR_MIN_CAMARA = -120
const VALOR_MAX_CAMARA = 220
const ZOOM_MIN_CAMARA = 0.2
const ZOOM_MAX_CAMARA = 12
const VIDEO_ALMACENAMIENTO_YOUTUBE_ID = 'GjRI-8puvas'
const VIDEO_ALMACENAMIENTO_EMBED_URL = `https://www.youtube.com/embed/${VIDEO_ALMACENAMIENTO_YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&cc_lang_pref=es&hl=es`

const ESCENA_ALMACENAMIENTO = '/svg/desinfeccion-almacenamiento.svg'

const PASO_BASE = {
    camaraX: 95.2,
    camaraY: 60.2,
    zoom: 12,
    gota: { x: 82, y: 50, escala: 0.98 },
    ocultarGota: false,
    gotaLimpia: true,
    gotaTema: 'almacenamiento-agua-limpia',
    burbujaIzquierda: '',
    burbujaDerecha: '',
    burbujaDerechaCompacta: false,
    mostrarMediaFinal: false,
    mostrarBotonPozo2: false
}

function crearPaso(override = {}) {
    return {
        ...PASO_BASE,
        ...override,
        gota: {
            ...PASO_BASE.gota,
            ...(override.gota ?? {})
        }
    }
}

const PASOS_RECORRIDO = [
    crearPaso({
        camaraX: 60.2,
        camaraY: 54,
        zoom: 12,
        gota: { x: 50, y: 50, escala: 1 },
        burbujaIzquierda: '¿Y con eso ya eliminan todo?'
    }),
    crearPaso({
        camaraX: 49.7,
        camaraY: 54,
        zoom: 12,
        gota: { x: 50, y: 50, escala: 1 },
        burbujaDerecha:
            'Si, usar luz ultravioleta junto con cloro funciona muy bien. Con esa mezcla se eliminan los microbios que vienen del agua.'
    }),
    crearPaso({
        camaraX: 38.7,
        camaraY: 54,
        zoom: 12,
        gota: { x: 50, y: 50, escala: 1 },
        burbujaIzquierda: '¿Y finalmente a dónde va esa agua tratada?'
    }),
    crearPaso({
        camaraX: 7,
        camaraY: 64.6,
        zoom: 2.88,
        gota: { x: 93, y: 33.2, escala: 0.24 },
        burbujaDerecha:
            'Después de pasar por las lámparas UV, el agua ya viene limpia y desinfectada. De ahí no se va directo al rio.'
    }),
    crearPaso({
        camaraX: 7,
        camaraY: 64.6,
        zoom: 2.88,
        gota: { x: 76, y: 35, escala: 0.24 },
        burbujaIzquierda: '¿Ese tanque es como una cisterna grande?'
    }),
    crearPaso({
        camaraX: 7,
        camaraY: 64.6,
        zoom: 2.88,
        gota: { x: 73.2, y: 40, escala: 0.24 },
        burbujaDerecha:
            'Exacto, es como una bodega de agua limpia. Ahí se guarda el agua que ya pasó por todos los procesos de la PTAR.'
    }),
    crearPaso({
        camaraX: 7,
        camaraY: 64.6,
        zoom: 2.88,
        gota: { x: 70, y: 60, escala: 0.24 },
        burbujaIzquierda: '¿Y para qué la guardan ahí?'
    }),
    crearPaso({
        camaraX: 7,
        camaraY: 64.6,
        zoom: 2.88,
        gota: { x: 50, y: 70, escala: 0.24 },
        burbujaDerecha:
            'Desde ese tanque, unas bombas la envían por tuberías para regar jardines y zonas verdes del campus.'
    }),
    crearPaso({
        camaraX: 7,
        camaraY: 64.6,
        zoom: 2.88,
        gota: { x: 50, y: 70, escala: 0.24 },
        burbujaIzquierda: '¿Y qué pasa con el resto del agua?'
    }),
    crearPaso({
        camaraX: 1,
        camaraY: 58.6,
        zoom: 2.35,
        gota: { x: 50, y: 80, escala: 0.2 },
        burbujaDerecha:
            'Lo que no se usa, y el agua que va saliendo de la planta todo el tiempo, termina llegando a otro punto: el pozo de bombeo 2.',
        mostrarMediaFinal: true,
        mostrarBotonPozo2: true
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

function redondear(valor) {
    return Number(valor.toFixed(2))
}

function Almacenamiento({ onVolverADesinfeccion, onCompletarAlmacenamiento, iniciarEnFinal = false }) {
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
        seccion: 'almacenamiento',
        colorActivo: colorAudioActivo,
        indiceActivo: indiceAudioActivo
    })

    useEffect(() => {
        setPasoActual(iniciarEnFinal ? PASOS_RECORRIDO.length - 1 : 0)
        setAbrirReproductorFinal(false)
        setMostrarResumenFinal(false)
    }, [iniciarEnFinal])

    useEffect(() => {
        if (!paso.mostrarMediaFinal) {
            setAbrirReproductorFinal(false)
            setMostrarResumenFinal(false)
        }
    }, [paso])

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
                    if (typeof onCompletarAlmacenamiento === 'function') {
                        onCompletarAlmacenamiento()
                    }
                } else {
                    setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
                }
            } else if (pasoActual > 0) {
                setPasoActual((pasoAnterior) => Math.max(pasoAnterior - 1, 0))
            } else if (typeof onVolverADesinfeccion === 'function') {
                onVolverADesinfeccion()
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
    }, [pasoActual, onCompletarAlmacenamiento, onVolverADesinfeccion])

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
            backgroundImage: `url('${ESCENA_ALMACENAMIENTO}')`
        }),
        []
    )
    const estiloGota = {
        left: `${paso.gota.x}%`,
        top: `${paso.gota.y}%`,
        '--gota-escala': `${paso.gota.escala}`
    }

    return (
        <main className="ptar-alm">
            <section className="ptar-alm__panel" style={estiloPanel} aria-label="Estacion de almacenamiento">
                <div className="ptar-alm__escena" style={estiloEscena} aria-hidden="true" />
                <div className="ptar-alm__capa-escena" aria-hidden="true" />

                {!paso.ocultarGota ? (
                    <img
                        className={`ptar-alm__gota ${paso.gotaLimpia ? 'ptar-alm__gota--limpia' : ''} ${paso.gotaTema ? `ptar-alm__gota--${paso.gotaTema}` : ''
                            }`}
                        src="/svg/gota.svg"
                        alt="Particula de agua"
                        style={estiloGota}
                    />
                ) : null}

                <img
                    className="ptar-alm__avatar ptar-alm__avatar--izquierda"
                    src="/images/Estudiante%20blanco.png"
                    alt=""
                    aria-hidden="true"
                />
                <img
                    className="ptar-alm__avatar ptar-alm__avatar--derecha"
                    src="/images/Estudiante%20rojo.png"
                    alt=""
                    aria-hidden="true"
                />

                {paso.burbujaIzquierda ? (
                    <aside
                        key={`izquierda-${pasoActual}-${paso.burbujaIzquierda}`}
                        className="ptar-alm__burbuja ptar-alm__burbuja--izquierda ptar-alm__burbuja--blanca"
                    >
                        {paso.burbujaIzquierda}
                    </aside>
                ) : null}

                {paso.burbujaDerecha ? (
                    <aside
                        key={`derecha-${pasoActual}-${paso.burbujaDerecha}`}
                        className={`ptar-alm__burbuja ptar-alm__burbuja--derecha ptar-alm__burbuja--roja ${paso.burbujaDerechaCompacta ? 'is-compacta' : ''
                            }`}
                    >
                        {paso.burbujaDerecha}
                    </aside>
                ) : null}

                {paso.mostrarMediaFinal ? (
                    <div className="ptar-alm__media-final">
                        <div className={`ptar-alm__media-final-track ${mostrarResumenFinal ? 'is-summary-open' : ''}`}>
                            <span className="ptar-alm__pin-video-final" aria-hidden="true" />
                            <button
                                type="button"
                                className="ptar-alm__video-preview-final"
                                onClick={() => setAbrirReproductorFinal(true)}
                                aria-label="Abrir video de almacenamiento"
                            >
                                <img src="/images/almacenamiento/almacenamiento.jpg" alt="Vista previa de almacenamiento" />
                                <span className="ptar-alm__play-icon-final" aria-hidden="true">
                                    <span className="ptar-alm__play-triangle-final" />
                                </span>
                            </button>

                            <div className="ptar-alm__resumen-wrap-final">
                                <button
                                    type="button"
                                    className="ptar-alm__resumen-toggle-final"
                                    onClick={() => setMostrarResumenFinal((estadoAnterior) => !estadoAnterior)}
                                    aria-expanded={mostrarResumenFinal}
                                    aria-controls="ptar-alm-resumen-final"
                                    aria-label={mostrarResumenFinal ? 'Ocultar resumen' : 'Mostrar resumen'}
                                >
                                    <span
                                        className={`ptar-alm__resumen-chevron-final ${mostrarResumenFinal ? 'is-open' : ''}`}
                                        aria-hidden="true"
                                    />
                                </button>
                                <aside
                                    id="ptar-alm-resumen-final"
                                    className={`ptar-alm__resumen-final ${mostrarResumenFinal ? 'is-open' : ''}`}
                                >
                                    <h3>Resumen de almacenamiento</h3>
                                    <p>
                                        El agua tratada se almacena temporalmente en este tanque para uso en riego y
                                        para enviar el excedente de forma controlada hacia pozo de bombeo 2.
                                    </p>
                                </aside>
                            </div>
                        </div>
                    </div>
                ) : null}

                {paso.mostrarBotonPozo2 ? (
                    <button
                        type="button"
                        className="ptar-alm__accion ptar-alm__accion--pozo2"
                        onClick={() => {
                            if (typeof onCompletarAlmacenamiento === 'function') {
                                onCompletarAlmacenamiento()
                            }
                        }}
                    >
                        <span>IR AL POZO DE BOMBEO 2</span>
                        <span className="ptar-alm__accion-flecha" aria-hidden="true" />
                    </button>
                ) : null}

                {debugCamaraActiva ? (
                    <aside className="ptar-alm__debug-camara" role="status" aria-live="polite">
                        <p className="ptar-alm__debug-titulo">Debug camara (paso {pasoActual + 1})</p>
                        <p className="ptar-alm__debug-linea">
                            X: {redondear(camaraActiva.camaraX)} | Y: {redondear(camaraActiva.camaraY)} | Zoom:{' '}
                            {redondear(camaraActiva.zoom)}
                        </p>
                        <p className="ptar-alm__debug-linea">
                            Flechas: mover | +/-: zoom | C: copiar | R: reset paso | F8: ocultar
                        </p>
                        <div className="ptar-alm__debug-botones">
                            <button
                                type="button"
                                className="ptar-alm__debug-boton"
                                onClick={() => {
                                    void copiarCamaraPasoActual()
                                }}
                            >
                                {debugCopiado ? 'Copiado' : 'Copiar camara'}
                            </button>
                            <button
                                type="button"
                                className="ptar-alm__debug-boton ptar-alm__debug-boton--secundario"
                                onClick={reiniciarCamaraPasoActual}
                            >
                                Reset paso
                            </button>
                        </div>
                    </aside>
                ) : null}

                {abrirReproductorFinal ? (
                    <div className="ptar-alm__modal" role="dialog" aria-modal="true" aria-label="Reproductor de almacenamiento">
                        <button
                            type="button"
                            className="ptar-alm__modal-overlay"
                            onClick={() => setAbrirReproductorFinal(false)}
                            aria-label="Cerrar reproductor"
                        />
                        <div className="ptar-alm__modal-content">
                            <button
                                type="button"
                                className="ptar-alm__modal-close"
                                onClick={() => setAbrirReproductorFinal(false)}
                                aria-label="Cerrar reproductor"
                            >
                                x
                            </button>
                            <iframe
                                className="ptar-alm__video-player ptar-alm__video-player--iframe"
                                title="Video de almacenamiento"
                                src={VIDEO_ALMACENAMIENTO_EMBED_URL}
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

export default Almacenamiento
