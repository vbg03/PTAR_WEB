import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './pretratamiento.css'

const DURACION_BLOQUEO_SCROLL = 340
const DURACION_TRANSICION_VISTA = 940
const VALOR_MIN_CAMARA = -120
const VALOR_MAX_CAMARA = 220
const ZOOM_MIN_CAMARA = 0.2
const ZOOM_MAX_CAMARA = 12
const PASO_CAMBIO_VISTA = 5
const UMBRAL_ARRASTRE_CANASTA = 20
const UMBRAL_RETORNO_CANASTA = 3.5
const DURACION_AUTOAVANCE_CANASTA = 460
const DURACION_AUTOAVANCE_ARENA = 420
const DURACION_AUTOAVANCE_GRASAS = 720

const VISTA_LATERAL = '/svg/recorrido-pozo-pretratamiento.svg'
const VISTA_SUPERIOR = '/svg/pretratamiento.svg'

const ETIQUETAS_PUNTOS = [
    { texto: 'Agua sobrante', x: 13.5, y: 25 },
    { texto: 'Rejilla gruesa', x: 25, y: 25 },
    { texto: 'Rejillas delgadas\n(Trampa de arenas)', x: 40, y: 24 },
    { texto: 'Trampa de grasas', x: 64, y: 25 },
    { texto: 'Flujo de agua', x: 83.2, y: 25 }
]

const PASO_BASE = {
    camaraX: 52,
    camaraY: 49,
    zoom: 1.75,
    gota: { x: 52, y: 71, escala: 0.42 },
    arena: { x: 68, y: 71.5, width: 'clamp(220px, 24vw, 480px)', escala: 1.6 },
    canastaSucia: { x: 46, y: 52, width: 'clamp(180px, 20vw, 380px)', escala: 1.6 },
    canastaLimpia: { x: 23.6, y: 52.8, width: 'clamp(180px, 20vw, 380px)', escala: 1 },
    grasasSuperficie: { x: 62, y: 36, width: 'clamp(300px, 38vw, 680px)', escala: 1 },
    mostrarFlecha: false
}

const crearPaso = (override = {}) => ({
    ...PASO_BASE,
    ...override,
    gota: {
        ...PASO_BASE.gota,
        ...(override.gota ?? {})
    },
    arena: {
        ...PASO_BASE.arena,
        ...(override.arena ?? {})
    },
    canastaSucia: {
        ...PASO_BASE.canastaSucia,
        ...(override.canastaSucia ?? {})
    },
    canastaLimpia: {
        ...PASO_BASE.canastaLimpia,
        ...(override.canastaLimpia ?? {})
    },
    grasasSuperficie: {
        ...PASO_BASE.grasasSuperficie,
        ...(override.grasasSuperficie ?? {})
    }
})

const PASOS_RECORRIDO = [
    crearPaso({
        camaraX: 45.4,
        camaraY: 22.4,
        zoom: 7.27,
        gota: { x: 50, y: 42.5, escala: 1.1 },
        burbujaDerecha:
            ' Continuamos con el tratamiento preliminar, es la primera etapa de limpieza real. Aquí quitamos todo lo que no debería estar en el agua: sólidos, arena y grasas. Es fundamental para proteger los equipos que vienen después.'
    }),
    crearPaso({
        camaraX: 63.2,
        camaraY: 25.4,
        zoom: 4.71,
        gota: { x: 20, y: 24, escala: 0.7 },
        burbujaIzquierda: 'Todo eso sucede aqui?'
    }),
    crearPaso({
        camaraX: 96.1,
        camaraY: 39.7,
        zoom: 1.45,
        gota: { x: 25, y: 48, escala: 0.34 },
        burbujaDerecha: 'Claro que si.'
    }),
    crearPaso({
        camaraX: 96.1,
        camaraY: 29.7,
        zoom: 1.45,
        gota: { x: 25, y: 52, escala: 0.34 },
        mostrarEtiquetasPuntos: true,
        burbujaDerecha:
            'En esta etapa se encuentra la rejilla gruesa, la trampa de arenas y la trampa de grasas.'
    }),
    crearPaso({
        camaraX: 96.1,
        camaraY: 29.7,
        zoom: 1.45,
        gota: { x: 25, y: 52, escala: 0.34 },
        mostrarEtiquetasPuntos: true,
        burbujaIzquierda: 'Y como hacen eso exactamente?'
    }),

    crearPaso({
        camaraX: 47,
        camaraY: 1.5,
        zoom: 1.75,
        mostrarCanastaSucia: true,
        mostrarArena: true,
        gota: { x: 24, y: 57, escala: 0.3 },
        arena: { x: 34, y: 60.5, width: 'clamp(220px, 24vw, 480px)', escala: 0.7 },
        canastaSucia: { x: 24, y: 52, width: 'clamp(180px, 20vw, 380px)', escala: 0.7 },
        burbujaDerecha:
            'Primero, el agua pasa por unas rejillas gruesas. Son como unas rejas metálicas con varillas separadas por menos de un centímetro. Ahí quedan atrapados papeles, plásticos, objetos, todo lo que la gente tira indebidamente.'
    }),
    crearPaso({
        camaraX: 17.3,
        camaraY: 22.4,
        zoom: 3.89,
        mostrarCanastaSucia: true,
        mostrarArena: true,
        gota: { x: 46, y: 64, escala: 0.7 },
        arena: { x: 68, y: 71.5, width: 'clamp(220px, 24vw, 480px)', escala: 1.6 },
        canastaSucia: { x: 46, y: 52, width: 'clamp(180px, 20vw, 380px)', escala: 1.6 },
        canastaLimpia: { x: 46, y: 52, width: 'clamp(180px, 20vw, 380px)', escala: 1.6 },
        requiereArrastrarCanasta: true,
        burbujaDerecha: 'Saca la rejilla para poder limpiar los residuos que quedaron.'
    }),
    crearPaso({
        camaraX: 17.3,
        camaraY: 22.4,
        zoom: 3.89,
        gota: { x: 46, y: 64, escala: 0.7 },
        canastaLimpia: { x: 46, y: 52, width: 'clamp(180px, 20vw, 380px)', escala: 1.6 },
        mostrarCanastaLimpia: true,
        mostrarArena: true,
        burbujaDerecha:
            '¡Perfecto! Ahora podemos continuar por la trampa de arenas.'
    }),
    crearPaso({
        camaraX: 40.3,
        camaraY: 22.4,
        zoom: 3.89,
        gota: { x: 29, y: 59, escala: 0.7 },
        arena: { x: 29, y: 71.5, width: 'clamp(220px, 24vw, 480px)', escala: 1.6 },
        canastaLimpia: { x: 7, y: 52, width: 'clamp(180px, 20vw, 380px)', escala: 1.6 },
        mostrarCanastaLimpia: true,
        mostrarArena: true,
        burbujaDerecha: 'Este es el desarenador. Son dos canales rectangulares de concreto, el agua fluye lentamente para que la arena y partículas pequeñas se asienten en el fondo.'
    }),
    crearPaso({
        camaraX: 40.3,
        camaraY: 22.4,
        zoom: 3.89,
        gota: { x: 29, y: 59, escala: 0.7 },
        arena: { x: 29, y: 71.5, width: 'clamp(220px, 24vw, 480px)', escala: 1.6 },
        canastaLimpia: { x: 7, y: 52, width: 'clamp(180px, 20vw, 380px)', escala: 1.6 },
        mostrarCanastaLimpia: true,
        mostrarArena: true,
        burbujaIzquierda: '¿Y por qué es importante quitar la arena?'
    }),
    crearPaso({
        camaraX: 40.3,
        camaraY: 22.4,
        zoom: 3.89,
        gota: { x: 29, y: 59, escala: 0.7 },
        arena: { x: 29, y: 71.5, width: 'clamp(220px, 24vw, 480px)', escala: 1.6 },
        canastaLimpia: { x: 7, y: 52, width: 'clamp(180px, 20vw, 380px)', escala: 1.6 },
        mostrarCanastaLimpia: true,
        mostrarArena: true,
        burbujaDerecha: 'Porque la arena es muy abrasiva. Si no la quitamos, puede dañar las bombas y equipos que vienen después, desgastándolos prematuramente. Además, ocupa espacio innecesario en los siguientes procesos.'
    }),
    crearPaso({
        camaraX: 40.3,
        camaraY: 22.4,
        zoom: 3.89,
        gota: { x: 29, y: 59, escala: 0.7 },
        arena: { x: 29, y: 71.5, width: 'clamp(220px, 24vw, 480px)', escala: 1.6 },
        canastaLimpia: { x: 7, y: 52, width: 'clamp(180px, 20vw, 380px)', escala: 1.6 },
        mostrarCanastaLimpia: true,
        mostrarArena: true,
        mostrarBotonLimpiar: true,
        burbujaDerecha: 'Ahora limpia la rejilla delgada y descaste de la arena.'
    }),
    crearPaso({
        camaraX: 52.3,
        camaraY: 22.4,
        zoom: 3.89,
        gota: { x: 52, y: 79.5, escala: 0.7 },
        canastaLimpia: { x: -13, y: 52, width: 'clamp(180px, 20vw, 380px)', escala: 1.6 },
        mostrarArena: false,
        mostrarCanastaLimpia: true,
        burbujaDerecha: '¡Bien hecho! Ahora dirijamonos a la trampa de grasas.'
    }),
    crearPaso({
        camaraX: 67.3,
        camaraY: 22.4,
        zoom: 3.89,
        gota: { x: 49.5, y: 56, escala: 0.7 },
        burbujaDerecha:
            'Esta es la trampa de grasas. Aquí separamos todos los aceites y grasas que vienen principalmente de las cafeterías.'
    }),
    crearPaso({
        camaraX: 67.3,
        camaraY: 22.4,
        zoom: 3.89,
        gota: { x: 49.5, y: 56, escala: 0.7 },
        burbujaIzquierda: '¿Y cómo funciona esa trampa?'
    }),
    crearPaso({
        camaraX: 67.3,
        camaraY: 22.4,
        zoom: 3.89,
        gota: { x: 49.5, y: 56, escala: 0.7 },
        burbujaDerecha:
            'Es muy simple pero efectivo. Como las grasas y aceites son menos densos que el agua, flotan naturalmente en la superficie. La trampa tiene una salida sumergida en la parte media, entonces el agua sale por abajo mientras las grasas quedan atrapadas arriba. El operario las retira diariamente.'
    }),
    crearPaso({
        camaraX: 67.3,
        camaraY: 22.4,
        zoom: 3.89,
        gota: { x: 49.5, y: 56, escala: 0.7 },
        mostrarIndicadoresContaminantes: true,
        mostrarBotonActivar: true,
        autoAvanceActivar: true,
        mostrarGrasasSuperficie: true,
        burbujaDerecha: 'Presiona el boton y observa como las grasas suben a la superficie.'
    }),
    crearPaso({
        camaraX: 67.3,
        camaraY: 22.4,
        zoom: 3.89,
        gota: { x: 49.5, y: 79, escala: 0.7 },
        grasasSuperficie: { x: 49.5, y: 65, escala: 1.4 },
        mostrarIndicadoresContaminantes: true,
        forzarIndicadoresActivos: true,
        mostrarGrasasSuperficie: true,
        burbujaIzquierda: 'Ah, muy ingenioso. Y despues de todo esto, el agua ya esta limpia?'
    }),
    crearPaso({
        camaraX: 92.8,
        camaraY: 22.4,
        zoom: 3.89,
        gota: { x: 29, y: 79, escala: 0.7 },
        grasasSuperficie: { x: 6, y: 65, escala: 1.4 },
        mostrarGrasasSuperficie: true,
        burbujaDerecha:
            'Para nada. Hasta aquí solo hemos quitado lo visible: sólidos grandes, arena y grasas. Pero el agua todavía tiene mucha contaminación disuelta y materia orgánica invisible. Por eso viene lo más importante: el tratamiento biológico.'
    }),
    crearPaso({
        camaraX: 46.3,
        camaraY: 0.4,
        zoom: 1.79,
        gota: { x: 88, y: 80, escala: 0.25 },
        grasasSuperficie: { x: 64, y: 60, escala: 0.65 },
        canastaLimpia: { x: 23.5, y: 53.5, width: 'clamp(180px, 20vw, 380px)', escala: 0.71 },
        mostrarCanastaLimpia: true,
        mostrarGrasasSuperficie: true,

    }),
]
const PASO_VIDEO_RESUMEN_FINAL = PASOS_RECORRIDO.length - 1

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

function Pretratamiento({ onVolverAPozo1 }) {
    const [pasoActual, setPasoActual] = useState(0)
    const [mostrarResumenIntro, setMostrarResumenIntro] = useState(false)
    const [abrirReproductorIntro, setAbrirReproductorIntro] = useState(false)
    const [mostrarResumenFinal, setMostrarResumenFinal] = useState(false)
    const [abrirReproductorFinal, setAbrirReproductorFinal] = useState(false)
    const [mostrarTransicionVista, setMostrarTransicionVista] = useState(false)
    const [indicadoresActivos, setIndicadoresActivos] = useState(false)
    const [rejillaLimpia, setRejillaLimpia] = useState(false)
    const [canastaArrastreCompletado, setCanastaArrastreCompletado] = useState(false)
    const [canastaRetornoCompletado, setCanastaRetornoCompletado] = useState(false)
    const [canastaSnapActiva, setCanastaSnapActiva] = useState(false)
    const [canastaSuciaPosicion, setCanastaSuciaPosicion] = useState(null)
    const [canastaArrastrando, setCanastaArrastrando] = useState(false)
    const [debugCamaraActiva, setDebugCamaraActiva] = useState(import.meta.env.DEV)
    const [debugCopiado, setDebugCopiado] = useState(false)
    const [debugCamarasPorPaso, setDebugCamarasPorPaso] = useState({})
    const bloqueoScrollRef = useRef(false)
    const timeoutBloqueoRef = useRef(null)
    const timeoutDebugCopiadoRef = useRef(null)
    const timeoutTransicionVistaRef = useRef(null)
    const timeoutCanastaSnapRef = useRef(null)
    const timeoutCanastaAutoavanceRef = useRef(null)
    const timeoutArenaAutoavanceRef = useRef(null)
    const timeoutGrasasAutoavanceRef = useRef(null)
    const zonaVistaAnteriorRef = useRef('lateral')
    const panelEscenaRef = useRef(null)
    const arrastreCanastaRef = useRef(null)
    const canastaSuciaPosicionRef = useRef(null)

    const paso = PASOS_RECORRIDO[pasoActual]
    const pasoRequiereArrastreCanasta = !!paso.requiereArrastrarCanasta
    const usarVistaSuperior = pasoActual >= PASO_CAMBIO_VISTA
    const fondoEscena = usarVistaSuperior ? VISTA_SUPERIOR : VISTA_LATERAL

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
        const zonaVistaActual = usarVistaSuperior ? 'superior' : 'lateral'
        if (zonaVistaAnteriorRef.current === zonaVistaActual) {
            return
        }

        zonaVistaAnteriorRef.current = zonaVistaActual
        setMostrarTransicionVista(true)

        if (timeoutTransicionVistaRef.current) {
            window.clearTimeout(timeoutTransicionVistaRef.current)
        }

        timeoutTransicionVistaRef.current = window.setTimeout(() => {
            setMostrarTransicionVista(false)
        }, DURACION_TRANSICION_VISTA)
    }, [usarVistaSuperior])

    useEffect(() => {
        if (pasoActual !== 0) {
            setMostrarResumenIntro(false)
            setAbrirReproductorIntro(false)
        }
    }, [pasoActual])

    useEffect(() => {
        if (pasoActual !== PASO_VIDEO_RESUMEN_FINAL) {
            setMostrarResumenFinal(false)
            setAbrirReproductorFinal(false)
        }
    }, [pasoActual])

    useEffect(() => {
        if (paso.mostrarBotonActivar) {
            setIndicadoresActivos(false)
        }
    }, [pasoActual, paso.mostrarBotonActivar])

    useEffect(() => {
        if (
            paso.mostrarIndicadoresContaminantes ||
            paso.forzarIndicadoresActivos ||
            paso.mostrarBotonActivar ||
            paso.mostrarGrasasSuperficie
        ) {
            return
        }

        if (timeoutGrasasAutoavanceRef.current) {
            window.clearTimeout(timeoutGrasasAutoavanceRef.current)
            timeoutGrasasAutoavanceRef.current = null
        }

        if (indicadoresActivos) {
            setIndicadoresActivos(false)
        }
    }, [paso, indicadoresActivos])

    useEffect(() => {
        if (paso.mostrarBotonLimpiar) {
            return
        }

        if (timeoutArenaAutoavanceRef.current) {
            window.clearTimeout(timeoutArenaAutoavanceRef.current)
            timeoutArenaAutoavanceRef.current = null
        }

        if (rejillaLimpia) {
            setRejillaLimpia(false)
        }
    }, [paso, rejillaLimpia])

    useEffect(() => {
        canastaSuciaPosicionRef.current = canastaSuciaPosicion
    }, [canastaSuciaPosicion])

    useEffect(() => {
        if (!pasoRequiereArrastreCanasta) {
            setCanastaArrastreCompletado(false)
            setCanastaRetornoCompletado(false)
            setCanastaSnapActiva(false)
            setCanastaSuciaPosicion(null)
            canastaSuciaPosicionRef.current = null
            arrastreCanastaRef.current = null
            setCanastaArrastrando(false)
            if (timeoutCanastaSnapRef.current) {
                window.clearTimeout(timeoutCanastaSnapRef.current)
                timeoutCanastaSnapRef.current = null
            }
            if (timeoutCanastaAutoavanceRef.current) {
                window.clearTimeout(timeoutCanastaAutoavanceRef.current)
                timeoutCanastaAutoavanceRef.current = null
            }
            return
        }

        const posicionInicial = {
            x: paso.canastaSucia.x,
            y: paso.canastaSucia.y
        }
        setCanastaArrastreCompletado(false)
        setCanastaRetornoCompletado(false)
        setCanastaSnapActiva(false)
        setCanastaSuciaPosicion(posicionInicial)
        canastaSuciaPosicionRef.current = posicionInicial
        arrastreCanastaRef.current = null
        setCanastaArrastrando(false)
        if (timeoutCanastaSnapRef.current) {
            window.clearTimeout(timeoutCanastaSnapRef.current)
            timeoutCanastaSnapRef.current = null
        }
        if (timeoutCanastaAutoavanceRef.current) {
            window.clearTimeout(timeoutCanastaAutoavanceRef.current)
            timeoutCanastaAutoavanceRef.current = null
        }
    }, [pasoActual, paso, pasoRequiereArrastreCanasta])

    useEffect(() => {
        if (!pasoRequiereArrastreCanasta || !canastaRetornoCompletado) {
            return
        }

        if (timeoutCanastaAutoavanceRef.current) {
            window.clearTimeout(timeoutCanastaAutoavanceRef.current)
        }

        timeoutCanastaAutoavanceRef.current = window.setTimeout(() => {
            setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
            timeoutCanastaAutoavanceRef.current = null
        }, DURACION_AUTOAVANCE_CANASTA)

        return () => {
            if (timeoutCanastaAutoavanceRef.current) {
                window.clearTimeout(timeoutCanastaAutoavanceRef.current)
                timeoutCanastaAutoavanceRef.current = null
            }
        }
    }, [pasoRequiereArrastreCanasta, canastaRetornoCompletado])

    useEffect(() => {
        if (!paso.mostrarBotonLimpiar || !rejillaLimpia) {
            return
        }

        if (timeoutArenaAutoavanceRef.current) {
            window.clearTimeout(timeoutArenaAutoavanceRef.current)
        }

        timeoutArenaAutoavanceRef.current = window.setTimeout(() => {
            setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
            timeoutArenaAutoavanceRef.current = null
        }, DURACION_AUTOAVANCE_ARENA)

        return () => {
            if (timeoutArenaAutoavanceRef.current) {
                window.clearTimeout(timeoutArenaAutoavanceRef.current)
                timeoutArenaAutoavanceRef.current = null
            }
        }
    }, [paso, rejillaLimpia])

    useEffect(() => {
        if (!paso.mostrarBotonActivar || !indicadoresActivos || !paso.autoAvanceActivar) {
            if (timeoutGrasasAutoavanceRef.current) {
                window.clearTimeout(timeoutGrasasAutoavanceRef.current)
                timeoutGrasasAutoavanceRef.current = null
            }
            return
        }

        timeoutGrasasAutoavanceRef.current = window.setTimeout(() => {
            setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
            timeoutGrasasAutoavanceRef.current = null
        }, DURACION_AUTOAVANCE_GRASAS)

        return () => {
            if (timeoutGrasasAutoavanceRef.current) {
                window.clearTimeout(timeoutGrasasAutoavanceRef.current)
                timeoutGrasasAutoavanceRef.current = null
            }
        }
    }, [paso, indicadoresActivos])

    useEffect(() => {
        const manejarMovimientoArrastre = (event) => {
            const estadoArrastre = arrastreCanastaRef.current
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

            setCanastaSuciaPosicion(nuevaPosicion)
            canastaSuciaPosicionRef.current = nuevaPosicion

            if (!canastaArrastreCompletado && nuevaPosicion.y <= estadoArrastre.yInicio - UMBRAL_ARRASTRE_CANASTA) {
                arrastreCanastaRef.current = null
                setCanastaArrastrando(false)
                setCanastaArrastreCompletado(true)
                return
            }

            if (canastaArrastreCompletado && !canastaRetornoCompletado) {
                const destinoRetorno = {
                    x: paso.canastaSucia.x,
                    y: paso.canastaSucia.y
                }
                const estaEnDestino =
                    Math.abs(nuevaPosicion.x - destinoRetorno.x) <= UMBRAL_RETORNO_CANASTA &&
                    Math.abs(nuevaPosicion.y - destinoRetorno.y) <= UMBRAL_RETORNO_CANASTA

                if (estaEnDestino) {
                    arrastreCanastaRef.current = null
                    setCanastaArrastrando(false)
                    setCanastaSuciaPosicion(destinoRetorno)
                    canastaSuciaPosicionRef.current = destinoRetorno
                    setCanastaRetornoCompletado(true)
                    setCanastaSnapActiva(true)
                    if (timeoutCanastaSnapRef.current) {
                        window.clearTimeout(timeoutCanastaSnapRef.current)
                    }
                    timeoutCanastaSnapRef.current = window.setTimeout(() => {
                        setCanastaSnapActiva(false)
                        timeoutCanastaSnapRef.current = null
                    }, 340)
                }
            }
        }

        const finalizarArrastre = () => {
            if (!arrastreCanastaRef.current) {
                return
            }
            arrastreCanastaRef.current = null
            setCanastaArrastrando(false)
        }

        window.addEventListener('pointermove', manejarMovimientoArrastre)
        window.addEventListener('pointerup', finalizarArrastre)
        window.addEventListener('pointercancel', finalizarArrastre)

        return () => {
            window.removeEventListener('pointermove', manejarMovimientoArrastre)
            window.removeEventListener('pointerup', finalizarArrastre)
            window.removeEventListener('pointercancel', finalizarArrastre)
        }
    }, [canastaArrastreCompletado, canastaRetornoCompletado, paso])

    useEffect(() => {
        const manejarRueda = (event) => {
            if (bloqueoScrollRef.current || event.deltaY === 0) {
                return
            }

            if (event.deltaY > 0 && pasoRequiereArrastreCanasta && !canastaRetornoCompletado) {
                return
            }

            if (event.deltaY > 0 && paso.mostrarBotonActivar) {
                return
            }

            bloqueoScrollRef.current = true

            if (event.deltaY > 0) {
                setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
            } else if (pasoActual > 0) {
                setPasoActual((pasoAnterior) => Math.max(pasoAnterior - 1, 0))
            } else if (typeof onVolverAPozo1 === 'function') {
                onVolverAPozo1()
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
    }, [pasoActual, onVolverAPozo1, pasoRequiereArrastreCanasta, canastaRetornoCompletado, paso.mostrarBotonActivar])

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
    }, [
        debugCamaraActiva,
        ajustarCamaraPasoActual,
        reiniciarCamaraPasoActual,
        copiarCamaraPasoActual
    ])

    useEffect(() => {
        return () => {
            if (timeoutBloqueoRef.current) {
                window.clearTimeout(timeoutBloqueoRef.current)
            }
            if (timeoutDebugCopiadoRef.current) {
                window.clearTimeout(timeoutDebugCopiadoRef.current)
            }
            if (timeoutTransicionVistaRef.current) {
                window.clearTimeout(timeoutTransicionVistaRef.current)
            }
            if (timeoutCanastaSnapRef.current) {
                window.clearTimeout(timeoutCanastaSnapRef.current)
            }
            if (timeoutCanastaAutoavanceRef.current) {
                window.clearTimeout(timeoutCanastaAutoavanceRef.current)
            }
            if (timeoutArenaAutoavanceRef.current) {
                window.clearTimeout(timeoutArenaAutoavanceRef.current)
            }
            if (timeoutGrasasAutoavanceRef.current) {
                window.clearTimeout(timeoutGrasasAutoavanceRef.current)
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
    const estiloArena = {
        left: `${paso.arena.x}%`,
        top: `${paso.arena.y}%`,
        width: paso.arena.width,
        '--arena-escala': `${paso.arena.escala}`
    }
    const estiloCanastaSucia = {
        left: `${canastaSuciaPosicion?.x ?? paso.canastaSucia.x}%`,
        top: `${canastaSuciaPosicion?.y ?? paso.canastaSucia.y}%`,
        width: paso.canastaSucia.width,
        '--canasta-escala': `${paso.canastaSucia.escala}`
    }
    const estiloCanastaLimpia = {
        left: `${pasoRequiereArrastreCanasta && canastaArrastreCompletado
            ? (canastaRetornoCompletado
                ? paso.canastaLimpia.x
                : (canastaSuciaPosicion?.x ?? paso.canastaSucia.x))
            : paso.canastaLimpia.x}%`,
        top: `${pasoRequiereArrastreCanasta && canastaArrastreCompletado
            ? (canastaRetornoCompletado
                ? paso.canastaLimpia.y
                : (canastaSuciaPosicion?.y ?? paso.canastaSucia.y))
            : paso.canastaLimpia.y}%`,
        width:
            pasoRequiereArrastreCanasta && canastaArrastreCompletado
                ? (canastaRetornoCompletado ? paso.canastaLimpia.width : paso.canastaSucia.width)
                : paso.canastaLimpia.width,
        '--canasta-escala': `${pasoRequiereArrastreCanasta && canastaArrastreCompletado
            ? (canastaRetornoCompletado ? paso.canastaLimpia.escala : paso.canastaSucia.escala)
            : paso.canastaLimpia.escala}`
    }
    const estiloGrasasSuperficie = {
        left: `${paso.grasasSuperficie.x}%`,
        top: `${paso.grasasSuperficie.y}%`,
        width: paso.grasasSuperficie.width,
        '--grasas-escala': `${paso.grasasSuperficie.escala}`
    }
    const indicadoresActivosVisual = indicadoresActivos || paso.forzarIndicadoresActivos
    const porcentajeGrasas = indicadoresActivosVisual ? 12 : 84
    const porcentajeAceites = indicadoresActivosVisual ? 9 : 78
    const mostrarGrasasSuperficie = paso.mostrarGrasasSuperficie && indicadoresActivosVisual
    const renderGrasasSuperficie = paso.mostrarGrasasSuperficie
    const mostrarBloqueVideoFinal = pasoActual === PASO_VIDEO_RESUMEN_FINAL
    const mostrarArenaActiva = paso.mostrarArena && !rejillaLimpia
    const renderArena = paso.mostrarArena
    const mostrarBotonLimpiar = paso.mostrarBotonLimpiar && !rejillaLimpia
    const mostrarCanastaSuciaBase = paso.mostrarCanastaSucia || (paso.permiteLimpiarRejilla && !rejillaLimpia)
    const mostrarCanastaSucia = mostrarCanastaSuciaBase && !(pasoRequiereArrastreCanasta && canastaArrastreCompletado)
    const mostrarCanastaLimpia =
        paso.mostrarCanastaLimpia ||
        (paso.permiteLimpiarRejilla && rejillaLimpia) ||
        (pasoRequiereArrastreCanasta && canastaArrastreCompletado)
    const renderCanastaSucia = mostrarCanastaSuciaBase || (pasoRequiereArrastreCanasta && canastaArrastreCompletado)
    const renderCanastaLimpia = mostrarCanastaLimpia || pasoRequiereArrastreCanasta
    const burbujaDerechaActiva =
        pasoRequiereArrastreCanasta && canastaArrastreCompletado && !canastaRetornoCompletado
            ? 'Ahora regresa la canasta limpia a su lugar.'
            : paso.burbujaDerecha

    const iniciarArrastreCanasta = useCallback(
        (event) => {
            if (!pasoRequiereArrastreCanasta || canastaRetornoCompletado) {
                return
            }

            if (event.button !== 0) {
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

            event.preventDefault()

            const posicionBase = canastaSuciaPosicionRef.current ?? {
                x: paso.canastaSucia.x,
                y: paso.canastaSucia.y
            }

            arrastreCanastaRef.current = {
                offsetX: posicionBase.x - punto.x,
                offsetY: posicionBase.y - punto.y,
                yInicio: posicionBase.y
            }
            setCanastaArrastrando(true)
        },
        [paso, pasoRequiereArrastreCanasta, canastaRetornoCompletado]
    )

    return (
        <main className="ptar-pre">
            <section
                className="ptar-pre__panel"
                style={estiloPanel}
                aria-label="Estacion Pretratamiento"
                ref={panelEscenaRef}
            >
                <div className="ptar-pre__escena" style={estiloEscena} aria-hidden="true" />
                <div className="ptar-pre__capa-escena" aria-hidden="true" />

                {paso.mostrarEtiquetasPuntos ? (
                    <div className="ptar-pre__puntos" aria-hidden="true">
                        {ETIQUETAS_PUNTOS.map((punto) => (
                            <div
                                key={punto.texto}
                                className="ptar-pre__punto"
                                style={{ left: `${punto.x}%`, top: `${punto.y}%` }}
                            >
                                <span className="ptar-pre__chip">{punto.texto}</span>
                                <span className="ptar-pre__pin" />
                            </div>
                        ))}
                    </div>
                ) : null}

                {paso.mostrarVideoIntro ? (
                    <div className="ptar-pre__media">
                        <div className={`ptar-pre__media-track ${mostrarResumenIntro ? 'is-summary-open' : ''}`}>
                            <span className="ptar-pre__pin-video" aria-hidden="true" />
                            <button
                                type="button"
                                className="ptar-pre__video-preview"
                                onClick={() => setAbrirReproductorIntro(true)}
                                aria-label="Abrir video de pretratamiento"
                            >
                                <img src="/images/pozo1/pozo1.jpg" alt="Vista previa del pretratamiento" />
                                <span className="ptar-pre__play-icon" aria-hidden="true">
                                    ▶
                                </span>
                            </button>

                            <div className="ptar-pre__resumen-wrap">
                                <button
                                    type="button"
                                    className="ptar-pre__resumen-toggle"
                                    onClick={() => setMostrarResumenIntro((estadoAnterior) => !estadoAnterior)}
                                    aria-expanded={mostrarResumenIntro}
                                    aria-controls="ptar-pre-resumen-intro"
                                >
                                    {mostrarResumenIntro ? '▾' : '▸'}
                                </button>
                                <aside
                                    id="ptar-pre-resumen-intro"
                                    className={`ptar-pre__resumen ${mostrarResumenIntro ? 'is-open' : ''}`}
                                >
                                    <h3>Resumen del pretratamiento:</h3>
                                    <p>
                                        Aqui retiramos solidos grandes, arenas y grasas para proteger las bombas y
                                        preparar el agua para las etapas biologicas.
                                    </p>
                                </aside>
                            </div>
                        </div>
                    </div>
                ) : null}

                {mostrarBloqueVideoFinal ? (
                    <div className="ptar-pre__media-final">
                        <div className={`ptar-pre__media-final-track ${mostrarResumenFinal ? 'is-summary-open' : ''}`}>
                            <img
                                className="ptar-pre__pin-video-final"
                                src="/images/ubicacion.png"
                                alt=""
                                aria-hidden="true"
                            />
                            <button
                                type="button"
                                className="ptar-pre__video-preview-final"
                                onClick={() => setAbrirReproductorFinal(true)}
                                aria-label="Abrir video del pretratamiento"
                            >
                                <img src="/images/pretratamiento/pretratamiento.jpg" alt="Vista previa del video del pretratamiento" />
                                <span className="ptar-pre__play-icon-final" aria-hidden="true">
                                    ▶
                                </span>
                            </button>

                            <div className="ptar-pre__resumen-wrap-final">
                                <button
                                    type="button"
                                    className="ptar-pre__resumen-toggle-final"
                                    onClick={() => setMostrarResumenFinal((estadoAnterior) => !estadoAnterior)}
                                    aria-expanded={mostrarResumenFinal}
                                    aria-controls="ptar-pre-resumen-final"
                                >
                                    {mostrarResumenFinal ? '▾' : '▸'}
                                </button>
                                <aside
                                    id="ptar-pre-resumen-final"
                                    className={`ptar-pre__resumen-final ${mostrarResumenFinal ? 'is-open' : ''}`}
                                >
                                    <h3>Resumen del pretratamiento:</h3>
                                    <p>
                                        Aqui retiramos solidos grandes, arenas y grasas para proteger las bombas y
                                        preparar el agua para las etapas biologicas.
                                    </p>
                                </aside>
                            </div>
                        </div>
                    </div>
                ) : null}

                {renderArena ? (
                    <img
                        className={`ptar-pre__arena ${mostrarArenaActiva ? 'is-visible' : 'is-hidden'}`}
                        src="/images/pretratamiento/arena.png"
                        alt=""
                        aria-hidden="true"
                        style={estiloArena}
                    />
                ) : null}

                {renderGrasasSuperficie ? (
                    <img
                        className={`ptar-pre__grasas-superficie ${mostrarGrasasSuperficie ? 'is-visible' : 'is-hidden'}`}
                        src="/images/pretratamiento/grasas.png"
                        alt=""
                        aria-hidden="true"
                        style={estiloGrasasSuperficie}
                    />
                ) : null}

                {paso.mostrarIndicadoresContaminantes ? (
                    <div className="ptar-pre__contaminantes" aria-hidden="true">
                        <h3>Contaminantes</h3>
                        <div className="ptar-pre__contaminantes-grid">
                            <div className="ptar-pre__indicador">
                                <div className="ptar-pre__indicador-canal">
                                    <span className="ptar-pre__indicador-relleno ptar-pre__indicador-relleno--grasas" style={{ height: `${porcentajeGrasas}%` }} />
                                </div>
                                <span>Grasas</span>
                            </div>
                            <div className="ptar-pre__indicador">
                                <div className="ptar-pre__indicador-canal">
                                    <span className="ptar-pre__indicador-relleno ptar-pre__indicador-relleno--aceites" style={{ height: `${porcentajeAceites}%` }} />
                                </div>
                                <span>Aceites</span>
                            </div>
                        </div>
                    </div>
                ) : null}

                {paso.mostrarBotonActivar ? (
                    <button
                        type="button"
                        className="ptar-pre__accion ptar-pre__accion--derecha"
                        onClick={() => {
                            if (indicadoresActivos) {
                                return
                            }
                            setIndicadoresActivos(true)
                        }}
                    >
                        ACTIVAR
                    </button>
                ) : null}

                {mostrarBotonLimpiar ? (
                    <button
                        type="button"
                        className="ptar-pre__accion ptar-pre__accion--centro"
                        onClick={() => {
                            setRejillaLimpia(true)
                        }}
                    >
                        LIMPIAR REJILLA
                    </button>
                ) : null}

                {renderCanastaSucia ? (
                    <img
                        className={`ptar-pre__canasta ptar-pre__canasta--sucia ${pasoRequiereArrastreCanasta && !canastaArrastreCompletado ? 'is-draggable' : ''
                            } ${canastaArrastrando ? 'is-dragging' : ''} ${mostrarCanastaSucia ? 'is-visible' : 'is-hidden'}`}
                        src="/images/pretratamiento/canasta%20sucia.png"
                        alt=""
                        aria-hidden="true"
                        style={estiloCanastaSucia}
                        onPointerDown={iniciarArrastreCanasta}
                    />
                ) : null}

                {renderCanastaLimpia ? (
                    <img
                        className={`ptar-pre__canasta ptar-pre__canasta--limpia ${pasoRequiereArrastreCanasta && canastaArrastreCompletado && !canastaRetornoCompletado ? 'is-draggable' : ''
                            } ${canastaArrastrando ? 'is-dragging' : ''} ${mostrarCanastaLimpia ? 'is-visible' : 'is-hidden'} ${canastaSnapActiva ? 'is-snapping' : ''}`}
                        src="/images/pretratamiento/canasta%20limpia.png"
                        alt=""
                        aria-hidden="true"
                        style={estiloCanastaLimpia}
                        onPointerDown={iniciarArrastreCanasta}
                    />
                ) : null}

                {!paso.ocultarGota ? (
                    <img
                        className="ptar-pre__gota"
                        src="/svg/gota.svg"
                        alt="Particula de agua"
                        style={estiloGota}
                    />
                ) : null}

                <img
                    className="ptar-pre__avatar ptar-pre__avatar--izquierda"
                    src="/images/Estudiante%20blanco.png"
                    alt=""
                    aria-hidden="true"
                />
                <img
                    className="ptar-pre__avatar ptar-pre__avatar--derecha"
                    src="/images/Estudiante%20rojo.png"
                    alt=""
                    aria-hidden="true"
                />

                {paso.burbujaIzquierda ? (
                    <aside className="ptar-pre__burbuja ptar-pre__burbuja--izquierda ptar-pre__burbuja--blanca">
                        {paso.burbujaIzquierda}
                    </aside>
                ) : null}

                {burbujaDerechaActiva ? (
                    <aside className="ptar-pre__burbuja ptar-pre__burbuja--derecha ptar-pre__burbuja--roja">
                        {burbujaDerechaActiva}
                    </aside>
                ) : null}

                <p className="ptar-pre__paso" aria-hidden="true">
                    Paso {pasoActual + 1} de {PASOS_RECORRIDO.length}
                </p>

                {debugCamaraActiva ? (
                    <aside className="ptar-pre__debug-camara" role="status" aria-live="polite">
                        <p className="ptar-pre__debug-titulo">Debug camara (paso {pasoActual + 1})</p>
                        <p className="ptar-pre__debug-linea">
                            X: {redondear(camaraActiva.camaraX)} | Y: {redondear(camaraActiva.camaraY)} | Zoom:{' '}
                            {redondear(camaraActiva.zoom)}
                        </p>
                        <p className="ptar-pre__debug-linea">
                            Flechas: mover | +/-: zoom | C: copiar | R: reset paso | F8: ocultar
                        </p>
                        <div className="ptar-pre__debug-botones">
                            <button
                                type="button"
                                className="ptar-pre__debug-boton"
                                onClick={() => {
                                    void copiarCamaraPasoActual()
                                }}
                            >
                                {debugCopiado ? 'Copiado' : 'Copiar camara'}
                            </button>
                            <button
                                type="button"
                                className="ptar-pre__debug-boton ptar-pre__debug-boton--secundario"
                                onClick={reiniciarCamaraPasoActual}
                            >
                                Reset paso
                            </button>
                        </div>
                    </aside>
                ) : null}

                {abrirReproductorIntro ? (
                    <div className="ptar-pre__modal" role="dialog" aria-modal="true" aria-label="Reproductor de video">
                        <button
                            type="button"
                            className="ptar-pre__modal-overlay"
                            onClick={() => setAbrirReproductorIntro(false)}
                            aria-label="Cerrar reproductor"
                        />
                        <div className="ptar-pre__modal-content">
                            <button
                                type="button"
                                className="ptar-pre__modal-close"
                                onClick={() => setAbrirReproductorIntro(false)}
                                aria-label="Cerrar reproductor"
                            >
                                ×
                            </button>
                            <video className="ptar-pre__video-player" controls autoPlay poster="/images/pretratamiento/pretratamiento.jpg">
                                <source src="/videos/ptar.mp4" type="video/mp4" />
                                Tu navegador no soporta este reproductor.
                            </video>
                        </div>
                    </div>
                ) : null}

                {abrirReproductorFinal ? (
                    <div
                        className="ptar-pre__modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Reproductor del pretratamiento"
                    >
                        <button
                            type="button"
                            className="ptar-pre__modal-overlay"
                            onClick={() => setAbrirReproductorFinal(false)}
                            aria-label="Cerrar reproductor"
                        />
                        <div className="ptar-pre__modal-content">
                            <button
                                type="button"
                                className="ptar-pre__modal-close"
                                onClick={() => setAbrirReproductorFinal(false)}
                                aria-label="Cerrar reproductor"
                            >
                                ×
                            </button>
                            <video className="ptar-pre__video-player" controls autoPlay poster="/images/pretratamiento/pretratamiento.jpg">
                                <source src="/videos/ptar.mp4" type="video/mp4" />
                                Tu navegador no soporta este reproductor.
                            </video>
                        </div>
                    </div>
                ) : null}

                {mostrarTransicionVista ? (
                    <div className="ptar-pre__transicion-vista" aria-hidden="true">
                        <span className="ptar-pre__transicion-capa" />
                        <span className="ptar-pre__transicion-franja ptar-pre__transicion-franja--roja" />
                        <span className="ptar-pre__transicion-franja ptar-pre__transicion-franja--vinotinto" />
                        <span className="ptar-pre__transicion-franja ptar-pre__transicion-franja--crema" />
                        <span className="ptar-pre__transicion-franja ptar-pre__transicion-franja--gris" />
                    </div>
                ) : null}
            </section>
        </main>
    )
}

export default Pretratamiento
