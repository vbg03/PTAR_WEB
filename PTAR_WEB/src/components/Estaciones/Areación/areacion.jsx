import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './areacion.css'

const DURACION_BLOQUEO_SCROLL = 340
const DURACION_ENTRADA_SUAVE = 760
const DURACION_AUTOAVANCE_TRANSICION = 920
const DURACION_AUTOAVANCE_ACTIVAR = 720
const DURACION_AUTOAVANCE_DETALLE = 420
const VALOR_MIN_CAMARA = -120
const VALOR_MAX_CAMARA = 220
const ZOOM_MIN_CAMARA = 0.2
const ZOOM_MAX_CAMARA = 12
const PASO_CAMBIO_ESCENARIO = 4
const PASO_TRANSICION_ESCENARIO = PASO_CAMBIO_ESCENARIO - 1
const PASO_PREVIO_TRANSICION_ESCENARIO = PASO_TRANSICION_ESCENARIO - 1
const PASO_ACTIVAR = 8
const PASO_DETALLE = 9

const ESCENA_PRETRATAMIENTO = '/svg/pretratamiento.svg'
const ESCENA_AIREACION = '/svg/aireacion-sedimentador-tamizaje.svg'
const CAMARA_ENTRADA_DESDE_PRETRATAMIENTO = {
    camaraX: 46.3,
    camaraY: 0.4,
    zoom: 1.79
}
const GOTA_ENTRADA_DESDE_PRETRATAMIENTO = {
    x: 88,
    y: 80,
    escala: 0.25
}

const PASO_BASE = {
    camaraX: 49,
    camaraY: 31,
    zoom: 2.2,
    gota: { x: 26, y: 68, escala: 0.45 },
    burbujas: {
        x: 50,
        y: 62.5,
        width: 'min(76vw, 1120px)',
        height: 'min(52vh, 460px)',
        escala: 1
    }
}

const crearPaso = (override = {}) => ({
    ...PASO_BASE,
    ...override,
    gota: {
        ...PASO_BASE.gota,
        ...(override.gota ?? {})
    },
    burbujas: {
        ...PASO_BASE.burbujas,
        ...(override.burbujas ?? {})
    }
})

const PASOS_RECORRIDO = [
    crearPaso({
        camaraX: 95.9,
        camaraY: 75.9,
        zoom: 4.11,
        gota: { x: 51, y: 50, escala: 0.7 },
        burbujaDerecha:
            'Todo ocurre en el tanque de aireación, que es un tanque grande. Tiene una capacidad de 160 metros cúbicos.'
    }),
    crearPaso({
        camaraX: 95.9,
        camaraY: 85.9,
        zoom: 4.11,
        gota: { x: 51, y: 80, escala: 0.7 },
        burbujaDerecha:
            'Ahí es donde ocurre la magia. El agua se mezcla con millones de microorganismos, principalmente bacterias, que se alimentan de la contaminación. Es como tener trabajadores microscópicos que se comen toda la suciedad.'
    }),
    crearPaso({
        camaraX: 86.9,
        camaraY: 93.4,
        zoom: 4.11,
        gota: { x: 30, y: 65, escala: 0.7 },
        burbujaIzquierda: 'Bacterias limpiando el agua? Eso no la contamina mas?'
    }),
    crearPaso({
        camaraX: 52,
        camaraY: 26,
        zoom: 4.5,
        gota: { x: 28, y: 72, escala: 0.9 },
        soloTransicion: true
    }),
    crearPaso({
        camaraX: 19.7,
        camaraY: 79.7,
        zoom: 2.3,
        gota: { x: 10, y: 80, escala: 0.3 },
        mostrarPanelContaminantes: true,
        indicadores: [{ clave: 'dbo', etiqueta: 'DBO', valor: 84 }],
        burbujaDerecha:
            'Al contrario, estas bacterias son beneficiosas. Se llaman bacterias aerobias porque necesitan oxígeno para vivir. Ellas degradan toda la materia orgánica contaminante: restos de comida, jabones, detergentes, todo.'
    }),
    crearPaso({
        camaraX: 19.7,
        camaraY: 79.7,
        zoom: 2.3,
        gota: { x: 20, y: 80, escala: 0.3 },
        mostrarPanelContaminantes: true,
        indicadores: [{ clave: 'dbo', etiqueta: 'DBO', valor: 84 }],
        burbujaDerecha:
            'Se les da oxigeno con un aireador mecanico instalado en el centro del tanque. Es como una gran batidora montada sobre una plataforma de concreto.'
    }),
    crearPaso({
        camaraX: 19.7,
        camaraY: 79.7,
        zoom: 2.3,
        gota: { x: 30, y: 80, escala: 0.3 },
        mostrarPanelContaminantes: true,
        indicadores: [{ clave: 'dbo', etiqueta: 'DBO', valor: 84 }],
        burbujaIzquierda: 'Y funciona todo el tiempo?'
    }),
    crearPaso({
        camaraX: 19.7,
        camaraY: 79.7,
        zoom: 2.3,
        gota: { x: 38, y: 80, escala: 0.3 },
        mostrarPanelContaminantes: true,
        indicadores: [{ clave: 'dbo', etiqueta: 'DBO', valor: 84 }],
        burbujaDerecha:
            'No, tiene ciclos programados. Se enciende por cinco minutos para mezclar todo y dar oxigeno a las bacterias, luego se apaga por quince minutos.'
    }),
    crearPaso({
        camaraX: 19.7,
        camaraY: 79.7,
        zoom: 2.3,
        gota: { x: 38, y: 80, escala: 0.3 },
        mostrarPanelContaminantes: true,
        indicadores: [{ clave: 'dbo', etiqueta: 'DBO', valor: 84 }],
        mostrarBotonActivar: true,
        autoAvanceActivar: true,
        burbujaDerecha: 'Presiona el boton para activar el tanque de areacion.'
    }),
    crearPaso({
        camaraX: 19.7,
        camaraY: 79.7,
        zoom: 2.3,
        gota: { x: 38, y: 75, escala: 0.3 },
        burbujas: {
            x: 48,
            y: 66,
            width: 'min(70vw, 980px)',
            height: 'min(46vh, 390px)',
            escala: 1.4
        },
        renderBurbujas: true,
        forzarBurbujasActivas: true,
        burbujasModo: 'tanque',
        mostrarBotonDetalle: true,
        burbujaDerechaCompacta: true,
        burbujaDerecha: 'Observa como la turbina se activa y crea burbujas.'
    }),
    crearPaso({
        camaraX: 23.7,
        camaraY: 79.7,
        zoom: 9.42,
        gota: { x: 50, y: 50, escala: 2 },
        burbujas: {
            x: 48,
            y: 5,
            width: 'min(70vw, 980px)',
            height: 'min(46vh, 390px)',
            escala: 7
        },
        renderBurbujas: true,
        forzarBurbujasActivas: true,
        burbujasModo: 'detalle'
    }),
    crearPaso({
        camaraX: 23.7,
        camaraY: 79.7,
        zoom: 9.42,
        gota: { x: 50, y: 50, escala: 2 },
        burbujas: {
            x: 48,
            y: 5,
            width: 'min(70vw, 980px)',
            height: 'min(46vh, 390px)',
            escala: 7
        },
        gotaLimpia: true,
        renderBurbujas: true,
        forzarBurbujasActivas: true,
        burbujasModo: 'detalle',
        mostrarPanelContaminantes: true,
        contaminantesSinCaja: true,
        indicadores: [
            { clave: 'dqo', etiqueta: 'DQO', valor: 68 },
            { clave: 'dbo', etiqueta: 'DBO', valor: 67 }
        ],
        burbujaDerecha: 'Las bacterias se llenan de oxigeno y ayudan a reducir los contaminantes del agua.'
    }),
    crearPaso({
        camaraX: 19.7,
        camaraY: 79.7,
        zoom: 2.3,
        gota: { x: 60, y: 70, escala: 0.3 },
        burbujas: {
            x: 48,
            y: 66,
            width: 'min(70vw, 980px)',
            height: 'min(46vh, 390px)',
            escala: 1.4
        },
        gotaLimpia: true,
        renderBurbujas: true,
        forzarBurbujasActivas: true,
        burbujasModo: 'tanque',
        burbujaDerecha: 'Perfecto! Ahora nuestra particula de agua esta mas limpia.'
    }),
    crearPaso({
        camaraX: 19.7,
        camaraY: 79.7,
        zoom: 2.3,
        gota: { x: 70, y: 70, escala: 0.3 },
        burbujas: {
            x: 48,
            y: 66,
            width: 'min(70vw, 980px)',
            height: 'min(46vh, 390px)',
            escala: 1.4
        },
        gotaLimpia: true,
        renderBurbujas: true,
        forzarBurbujasActivas: true,
        burbujasModo: 'tanque',
        mostrarRecirculacion: true,
        burbujaDerecha:
            'Ahora durante quince minutos de reposo es cuando realizamos la recirculacion de lodos.'
    }),
    crearPaso({
        camaraX: 19.7,
        camaraY: 79.7,
        zoom: 2.3,
        gota: { x: 65, y: 80, escala: 0.15 },
        burbujas: {
            x: 48,
            y: 76,
            width: 'min(70vw, 980px)',
            height: 'min(46vh, 390px)',
            escala: 0.98
        },
        gotaLimpia: true,
        renderBurbujas: true,
        forzarBurbujasActivas: true,
        burbujasModo: 'tanque',
        mostrarMediaFinal: true
    })
]

function limitar(valor, minimo, maximo) {
    return Math.min(Math.max(valor, minimo), maximo)
}

function redondear(valor) {
    return Number(valor.toFixed(2))
}

function obtenerBurbujasBasePorModo(modo) {
    if (modo === 'detalle') {
        return {
            x: 50,
            y: 52,
            width: '114%',
            height: '114%',
            escala: 1
        }
    }

    return {
        x: 50,
        y: 62.5,
        width: 'min(76vw, 1120px)',
        height: 'min(52vh, 460px)',
        escala: 1
    }
}

function Areacion({
    onVolverAPretratamiento,
    onCompletarAreacion,
    entradaSuaveDesdePretratamiento = false
}) {
    const [pasoActual, setPasoActual] = useState(0)
    const [aireacionActiva, setAireacionActiva] = useState(false)
    const [detalleParticulaActivado, setDetalleParticulaActivado] = useState(false)
    const [mostrarResumenFinal, setMostrarResumenFinal] = useState(false)
    const [abrirReproductorFinal, setAbrirReproductorFinal] = useState(false)
    const [debugCamaraActiva, setDebugCamaraActiva] = useState(import.meta.env.DEV)
    const [debugCopiado, setDebugCopiado] = useState(false)
    const [debugCamarasPorPaso, setDebugCamarasPorPaso] = useState(() =>
        entradaSuaveDesdePretratamiento ? { 0: CAMARA_ENTRADA_DESDE_PRETRATAMIENTO } : {}
    )
    const [gotaEntradaSuave, setGotaEntradaSuave] = useState(() =>
        entradaSuaveDesdePretratamiento ? GOTA_ENTRADA_DESDE_PRETRATAMIENTO : null
    )
    const bloqueoScrollRef = useRef(false)
    const timeoutBloqueoRef = useRef(null)
    const timeoutAutoavanceTransicionRef = useRef(null)
    const timeoutAutoavanceActivarRef = useRef(null)
    const timeoutAutoavanceDetalleRef = useRef(null)
    const timeoutDebugCopiadoRef = useRef(null)
    const timeoutEntradaSuaveRef = useRef(null)

    const paso = PASOS_RECORRIDO[pasoActual]
    const usarEscenarioAireacion = pasoActual >= PASO_CAMBIO_ESCENARIO
    const fondoEscena = usarEscenarioAireacion ? ESCENA_AIREACION : ESCENA_PRETRATAMIENTO

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
        if (!entradaSuaveDesdePretratamiento || pasoActual !== 0) {
            return
        }

        bloqueoScrollRef.current = true

        timeoutEntradaSuaveRef.current = window.setTimeout(() => {
            setDebugCamarasPorPaso((estadoAnterior) => {
                if (!estadoAnterior[0]) {
                    return estadoAnterior
                }
                const nuevoEstado = { ...estadoAnterior }
                delete nuevoEstado[0]
                return nuevoEstado
            })
            setGotaEntradaSuave(null)
            timeoutEntradaSuaveRef.current = null
        }, 90)

        if (timeoutBloqueoRef.current) {
            window.clearTimeout(timeoutBloqueoRef.current)
        }
        timeoutBloqueoRef.current = window.setTimeout(() => {
            bloqueoScrollRef.current = false
            timeoutBloqueoRef.current = null
        }, DURACION_ENTRADA_SUAVE + 120)

        return () => {
            if (timeoutEntradaSuaveRef.current) {
                window.clearTimeout(timeoutEntradaSuaveRef.current)
                timeoutEntradaSuaveRef.current = null
            }
        }
    }, [entradaSuaveDesdePretratamiento, pasoActual])

    useEffect(() => {
        if (pasoActual !== PASOS_RECORRIDO.length - 1) {
            setMostrarResumenFinal(false)
            setAbrirReproductorFinal(false)
        }
    }, [pasoActual])

    useEffect(() => {
        if (pasoActual === PASO_ACTIVAR) {
            setAireacionActiva(false)
            return
        }

        if (pasoActual < PASO_ACTIVAR) {
            setAireacionActiva(false)
        }
    }, [pasoActual])

    useEffect(() => {
        if (pasoActual !== PASO_DETALLE) {
            setDetalleParticulaActivado(false)
        }
    }, [pasoActual])

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
        if (!paso.mostrarBotonActivar || !paso.autoAvanceActivar || !aireacionActiva) {
            if (timeoutAutoavanceActivarRef.current) {
                window.clearTimeout(timeoutAutoavanceActivarRef.current)
                timeoutAutoavanceActivarRef.current = null
            }
            return
        }

        timeoutAutoavanceActivarRef.current = window.setTimeout(() => {
            setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
            timeoutAutoavanceActivarRef.current = null
        }, DURACION_AUTOAVANCE_ACTIVAR)

        return () => {
            if (timeoutAutoavanceActivarRef.current) {
                window.clearTimeout(timeoutAutoavanceActivarRef.current)
                timeoutAutoavanceActivarRef.current = null
            }
        }
    }, [paso, aireacionActiva])

    useEffect(() => {
        const manejarRueda = (event) => {
            if (bloqueoScrollRef.current || event.deltaY === 0) {
                return
            }

            if (paso.soloTransicion) {
                return
            }

            if (event.deltaY > 0 && paso.mostrarBotonActivar && !aireacionActiva) {
                return
            }

            if (event.deltaY > 0 && paso.mostrarBotonDetalle && !detalleParticulaActivado) {
                return
            }

            bloqueoScrollRef.current = true

            if (event.deltaY > 0) {
                if (pasoActual >= PASOS_RECORRIDO.length - 1) {
                    if (typeof onCompletarAreacion === 'function') {
                        onCompletarAreacion()
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
            } else if (typeof onVolverAPretratamiento === 'function') {
                onVolverAPretratamiento()
            }

            if (timeoutBloqueoRef.current) {
                window.clearTimeout(timeoutBloqueoRef.current)
            }

            timeoutBloqueoRef.current = window.setTimeout(() => {
                bloqueoScrollRef.current = false
            }, DURACION_BLOQUEO_SCROLL)
        }

        window.addEventListener('wheel', manejarRueda, { passive: true })
        return () => {
            window.removeEventListener('wheel', manejarRueda)
        }
    }, [
        pasoActual,
        paso,
        aireacionActiva,
        detalleParticulaActivado,
        onVolverAPretratamiento,
        onCompletarAreacion
    ])

    useEffect(() => {
        const manejarTecladoDebug = (event) => {
            if (event.key === 'F8') {
                event.preventDefault()
                setDebugCamaraActiva((estadoAnterior) => !estadoAnterior)
                return
            }

            if (!debugCamaraActiva) {
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
            if (timeoutAutoavanceActivarRef.current) {
                window.clearTimeout(timeoutAutoavanceActivarRef.current)
            }
            if (timeoutAutoavanceDetalleRef.current) {
                window.clearTimeout(timeoutAutoavanceDetalleRef.current)
            }
            if (timeoutDebugCopiadoRef.current) {
                window.clearTimeout(timeoutDebugCopiadoRef.current)
            }
            if (timeoutEntradaSuaveRef.current) {
                window.clearTimeout(timeoutEntradaSuaveRef.current)
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
    const gotaActiva = pasoActual === 0 && gotaEntradaSuave ? gotaEntradaSuave : paso.gota
    const estiloGota = {
        left: `${gotaActiva.x}%`,
        top: `${gotaActiva.y}%`,
        '--gota-escala': `${gotaActiva.escala}`
    }
    const burbujasVisibles = aireacionActiva || paso.forzarBurbujasActivas
    const renderBurbujas = paso.renderBurbujas || paso.mostrarBotonActivar
    const burbujasModo = paso.burbujasModo ?? 'tanque'
    const burbujasActivas = {
        ...obtenerBurbujasBasePorModo(burbujasModo),
        ...(paso.burbujas ?? {})
    }
    const estiloBurbujas = {
        left: `${burbujasActivas.x}%`,
        top: `${burbujasActivas.y}%`,
        width: burbujasActivas.width,
        height: burbujasActivas.height,
        '--burbujas-escala': `${burbujasActivas.escala}`
    }
    const ocultarContenidoEscena = !!paso.soloTransicion

    return (
        <main className="ptar-are">
            <section
                className="ptar-are__panel"
                style={estiloPanel}
                aria-label="Estacion Tanque de areacion"
            >
                <div className="ptar-are__escena" style={estiloEscena} aria-hidden="true" />
                <div className="ptar-are__capa-escena" aria-hidden="true" />

                {!ocultarContenidoEscena ? (
                    <>
                        {paso.mostrarPanelContaminantes ? (
                            <div
                                className={`ptar-are__contaminantes ${paso.contaminantesSinCaja ? 'is-flotante' : ''
                                    }`}
                                aria-hidden="true"
                            >
                                {paso.indicadores?.length ? <h3>Contaminantes</h3> : null}
                                <div className="ptar-are__contaminantes-grid">
                                    {(paso.indicadores ?? []).map((indicador) => (
                                        <div key={indicador.clave} className="ptar-are__indicador">
                                            <div className="ptar-are__indicador-canal">
                                                <span
                                                    className={`ptar-are__indicador-relleno ptar-are__indicador-relleno--${indicador.clave}`}
                                                    style={{ height: `${indicador.valor}%` }}
                                                />
                                            </div>
                                            <span>{indicador.etiqueta}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {renderBurbujas ? (
                            <div
                                className={`ptar-are__burbujas ptar-are__burbujas--${burbujasModo} ${burbujasVisibles ? 'is-visible' : ''
                                    }`}
                                style={estiloBurbujas}
                                aria-hidden="true"
                            >
                                <img
                                    className="ptar-are__burbujas-capa ptar-are__burbujas-capa--a"
                                    src="/images/bombeo/burbujas.svg"
                                    alt=""
                                />
                            </div>
                        ) : null}

                        {paso.mostrarRecirculacion ? (
                            <div className="ptar-are__recirculacion" aria-hidden="true">
                                <span className="ptar-are__pin-recirc" />
                                <span className="ptar-are__label-recirc">Recirculacion de lodos</span>
                            </div>
                        ) : null}

                        {paso.mostrarMediaFinal ? (
                            <div className="ptar-are__media-final">
                                <div className={`ptar-are__media-final-track ${mostrarResumenFinal ? 'is-summary-open' : ''}`}>
                                    <span className="ptar-are__pin-video-final" aria-hidden="true" />
                                    <button
                                        type="button"
                                        className="ptar-are__video-preview-final"
                                        onClick={() => setAbrirReproductorFinal(true)}
                                        aria-label="Abrir video del tanque de areacion"
                                    >
                                        <img src="/images/bombeo/bombeo.jpg" alt="Vista previa del proceso de aireacion" />
                                        <span className="ptar-are__play-icon-final" aria-hidden="true">
                                            <span className="ptar-are__play-triangle-final" />
                                        </span>
                                    </button>

                                    <div className="ptar-are__resumen-wrap-final">
                                        <button
                                            type="button"
                                            className="ptar-are__resumen-toggle-final"
                                            onClick={() => setMostrarResumenFinal((estadoAnterior) => !estadoAnterior)}
                                            aria-expanded={mostrarResumenFinal}
                                            aria-controls="ptar-are-resumen-final"
                                            aria-label={mostrarResumenFinal ? 'Ocultar resumen' : 'Mostrar resumen'}
                                        >
                                            <span
                                                className={`ptar-are__resumen-chevron-final ${mostrarResumenFinal ? 'is-open' : ''}`}
                                                aria-hidden="true"
                                            />
                                        </button>
                                        <aside
                                            id="ptar-are-resumen-final"
                                            className={`ptar-are__resumen-final ${mostrarResumenFinal ? 'is-open' : ''}`}
                                        >
                                            <h3>Resumen de aireacion</h3>
                                            <p>
                                                En esta etapa las bacterias aerobias usan oxigeno para degradar materia
                                                organica y reducir la carga contaminante del agua.
                                            </p>
                                        </aside>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {!paso.ocultarGota ? (
                            <img
                                className={`ptar-are__gota ${paso.gotaLimpia ? 'ptar-are__gota--limpia' : ''}`}
                                src="/svg/gota.svg"
                                alt="Particula de agua"
                                style={estiloGota}
                            />
                        ) : null}

                        <img
                            className="ptar-are__avatar ptar-are__avatar--izquierda"
                            src="/images/Estudiante%20blanco.png"
                            alt=""
                            aria-hidden="true"
                        />
                        <img
                            className="ptar-are__avatar ptar-are__avatar--derecha"
                            src="/images/Estudiante%20rojo.png"
                            alt=""
                            aria-hidden="true"
                        />

                        {paso.burbujaIzquierda ? (
                            <aside className="ptar-are__burbuja ptar-are__burbuja--izquierda ptar-are__burbuja--blanca">
                                {paso.burbujaIzquierda}
                            </aside>
                        ) : null}

                        {paso.burbujaDerecha ? (
                            <aside
                                className={`ptar-are__burbuja ptar-are__burbuja--derecha ptar-are__burbuja--roja ${paso.burbujaDerechaCompacta ? 'is-compacta' : ''
                                    }`}
                            >
                                {paso.burbujaDerecha}
                            </aside>
                        ) : null}

                        {paso.mostrarBotonActivar ? (
                            <button
                                type="button"
                                className="ptar-are__accion ptar-are__accion--centro"
                                onClick={() => {
                                    if (aireacionActiva) {
                                        return
                                    }
                                    setAireacionActiva(true)
                                }}
                            >
                                ACTIVAR
                            </button>
                        ) : null}

                        {paso.mostrarBotonDetalle ? (
                            <button
                                type="button"
                                className="ptar-are__accion ptar-are__accion--centro"
                                onClick={() => {
                                    if (detalleParticulaActivado) {
                                        return
                                    }
                                    setDetalleParticulaActivado(true)
                                    if (timeoutAutoavanceDetalleRef.current) {
                                        window.clearTimeout(timeoutAutoavanceDetalleRef.current)
                                    }
                                    timeoutAutoavanceDetalleRef.current = window.setTimeout(() => {
                                        setPasoActual((pasoAnterior) =>
                                            Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1)
                                        )
                                        timeoutAutoavanceDetalleRef.current = null
                                    }, DURACION_AUTOAVANCE_DETALLE)
                                }}
                            >
                                VER DETALLE DE PARTICULA
                            </button>
                        ) : null}

                        <p className="ptar-are__paso" aria-hidden="true">
                            Paso {pasoActual + 1} de {PASOS_RECORRIDO.length}
                        </p>

                        {debugCamaraActiva ? (
                            <aside className="ptar-are__debug-camara" role="status" aria-live="polite">
                                <p className="ptar-are__debug-titulo">Debug camara (paso {pasoActual + 1})</p>
                                <p className="ptar-are__debug-linea">
                                    X: {redondear(camaraActiva.camaraX)} | Y: {redondear(camaraActiva.camaraY)} |
                                    Zoom: {redondear(camaraActiva.zoom)}
                                </p>
                                <p className="ptar-are__debug-linea">
                                    Flechas: mover | +/-: zoom | C: copiar | R: reset paso | F8: ocultar
                                </p>
                                <div className="ptar-are__debug-botones">
                                    <button
                                        type="button"
                                        className="ptar-are__debug-boton"
                                        onClick={() => {
                                            void copiarCamaraPasoActual()
                                        }}
                                    >
                                        {debugCopiado ? 'Copiado' : 'Copiar camara'}
                                    </button>
                                    <button
                                        type="button"
                                        className="ptar-are__debug-boton ptar-are__debug-boton--secundario"
                                        onClick={reiniciarCamaraPasoActual}
                                    >
                                        Reset paso
                                    </button>
                                </div>
                            </aside>
                        ) : null}

                        {abrirReproductorFinal ? (
                            <div
                                className="ptar-are__modal"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Reproductor del tanque de areacion"
                            >
                                <button
                                    type="button"
                                    className="ptar-are__modal-overlay"
                                    onClick={() => setAbrirReproductorFinal(false)}
                                    aria-label="Cerrar reproductor"
                                />
                                <div className="ptar-are__modal-content">
                                    <button
                                        type="button"
                                        className="ptar-are__modal-close"
                                        onClick={() => setAbrirReproductorFinal(false)}
                                        aria-label="Cerrar reproductor"
                                    >
                                        x
                                    </button>
                                    <video className="ptar-are__video-player" controls autoPlay poster="/images/video1.png">
                                        <source src="/videos/ptar.mp4" type="video/mp4" />
                                        Tu navegador no soporta este reproductor.
                                    </video>
                                </div>
                            </div>
                        ) : null}
                    </>
                ) : null}

                {paso.soloTransicion ? (
                    <div className="ptar-are__transicion-vista" aria-hidden="true">
                        <span className="ptar-are__transicion-capa" />
                        <span className="ptar-are__transicion-franja ptar-are__transicion-franja--roja" />
                        <span className="ptar-are__transicion-franja ptar-are__transicion-franja--vinotinto" />
                        <span className="ptar-are__transicion-franja ptar-are__transicion-franja--crema" />
                        <span className="ptar-are__transicion-franja ptar-are__transicion-franja--gris" />
                    </div>
                ) : null}
            </section>
        </main>
    )
}

export default Areacion
