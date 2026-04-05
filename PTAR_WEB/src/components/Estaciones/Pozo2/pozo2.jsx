import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useControlesNavegacion } from '../../../hooks/useControlesNavegacion'
import { useNarracionVoces } from '../../../hooks/useNarracionVoces'
import { construirIndicesAudioPorPaso } from '../../../utils/voiceLibrary'
import { DEBUG_CAMARA_HABILITADO } from '../../../config/debugFlags'
import {
    EVENTO_CAMBIO_CONFIG_AUDIO,
    obtenerVolumenMusica
} from '../../../utils/audioSettings'
import { useFixedSceneLayout } from '../../../hooks/useFixedSceneLayout'
import './pozo2.css'

const DURACION_BLOQUEO_SCROLL = 340
const VALOR_MIN_CAMARA = -120
const VALOR_MAX_CAMARA = 220
const ZOOM_MIN_CAMARA = 0.2
const ZOOM_MAX_CAMARA = 12
const AUDIO_PARTE_FINAL_POZO2 = '/audio/partefinal-pozo2.mp3'
const VOLUMEN_MAXIMO_PARTE_FINAL_POZO2 = 0.2
const PASO_AUDIO_PARTE_FINAL_POZO2_INICIO = 6
const DURACION_FADE_AUDIO_PARTE_FINAL_POZO2_MS = 520
const DURACION_FADE_SALIDA_AUDIO_PARTE_FINAL_POZO2_MS = 360
const INTERVALO_FADE_AUDIO_PARTE_FINAL_POZO2_MS = 32

const ESCENA_POZO2 = '/images/pozo2/pozo2.svg'

const MARCADORES_DESTINO = [
    { x: 8.2, y: 72, etiqueta: 'Acequia\nGonchenlandia' },
    { x: 91.8, y: 71, etiqueta: 'Rio Pance y\nafluente rio Lili' }
]

const PASO_BASE = {
    camaraX: 12,
    camaraY: 58.6,
    zoom: 3.25,
    gota: { x: 50, y: 74, escala: 0.24 },
    ocultarGota: false,
    gotaLimpia: true,
    gotaTema: 'pozo2-agua-cielo',
    burbujaIzquierda: '',
    burbujaDerecha: '',
    burbujaDerechaCompacta: false,
    marcadores: []
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
        camaraX: 12.2,
        camaraY: 42.8,
        zoom: 3.2,
        gota: { x: 50, y: 74.5, escala: 0.24 },
        burbujaIzquierda: '¿Este es otro pozo grande como el primero?'
    }),
    crearPaso({
        camaraX: 12.2,
        camaraY: 42.8,
        zoom: 3.2,
        gota: { x: 57, y: 67, escala: 0.24 },
        burbujaDerecha:
            'Si, es otro pozo donde se junta el agua tratada de la planta y también agua de lluvias que viene de una laguna de almacenamiento.'
    }),
    crearPaso({
        camaraX: 12.2,
        camaraY: 42.8,
        zoom: 3.2,
        gota: { x: 85, y: 44.6, escala: 0.3 },
        burbujaDerecha:
            'Adentro del pozo 2 hay bombas sumergibles. Cuando el nivel de agua sube, unos flotadores o sensores avisan a las bombas, se encienden y empiezan a empujar el agua por una tuberia hacia la acequia que va camino al rio Lili.'
    }),
    crearPaso({
        camaraX: 52.3,
        camaraY: 51.7,
        zoom: 3.08,
        gota: { x: 28, y: 26, escala: 0.3 },
        marcadores: MARCADORES_DESTINO
    }),
    crearPaso({
        camaraX: 52.3,
        camaraY: 51.7,
        zoom: 3.08,
        gota: { x: 50, y: 54, escala: 0.3 },
        marcadores: MARCADORES_DESTINO,
        burbujaIzquierda:
            'Entonces, esta agua que antes venia de baños, cafetería y el laboratorio ahora termina aquí, juntándose con el rio.'
    }),
    crearPaso({
        camaraX: 52.3,
        camaraY: 51.7,
        zoom: 3.08,
        gota: { x: 68, y: 54, escala: 0.3 },
        burbujaDerecha:
            'Exactamente. Por eso es tan importante que la planta funcione bien: lo que hacemos dentro del campus se nota afuera. Si tratamos bien el agua, ayudamos a que el rio llegue en mejores condiciones para las personas y para los ecosistemas.'
    }),
    crearPaso({
        camaraX: 63.9,
        camaraY: 64.8,
        zoom: 5.35,
        gota: { x: 50, y: 52, escala: 0.6 },
        burbujaIzquierda:
            'O sea que cada descarga, por pequeña que sea, termina conectada con un rio en alguna parte.'
    }),
    crearPaso({
        camaraX: 82.4,
        camaraY: 64.8,
        zoom: 5.35,
        gota: { x: 50, y: 52, escala: 0.6 },
        burbujaDerecha:
            'Si. Nuestro recorrido termina aqui, pero el de esta gota sigue: puede evaporarse, formar nubes, caer como lluvia y volver a usarse en otra ciudad o en otra casa. El agua es la misma; lo que cambia es que tan limpia la devolvemos al ciclo.'
    }),
    crearPaso({
        camaraX: 96.3,
        camaraY: 55.8,
        zoom: 2.38,
        gota: { x: 47, y: 78, escala: 0.25 },
        burbujaIzquierda:
            'Ahora sí entiendo por qué la PTAR no es solo un tanque más, sino una forma de cuidar el río y el medio ambiente desde la universidad.'
    }),
    crearPaso({
        camaraX: 96.3,
        camaraY: 55.8,
        zoom: 2.38,
        gota: { x: 60, y: 90, escala: 0.25 },
        burbujaDerecha:
            'Esa es la idea: mostrar que detrás de cada gota que sale por este tubo hay todo un trabajo para proteger el agua que compartimos.'
    }),
    crearPaso({
        camaraX: 96.3,
        camaraY: 55.8,
        zoom: 2.38,
        gota: { x: 70, y: 90, escala: 0.25 },
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

function Pozo2({
    onVolverADesinfeccion,
    onVolverAAlmacenamiento,
    onCompletarPozo2,
    iniciarEnFinal = false
}) {
    const [pasoActual, setPasoActual] = useState(0)
    const [debugCamaraActiva, setDebugCamaraActiva] = useState(DEBUG_CAMARA_HABILITADO)
    const [debugCopiado, setDebugCopiado] = useState(false)
    const [debugCamarasPorPaso, setDebugCamarasPorPaso] = useState({})
    const bloqueoScrollRef = useRef(false)
  const acumulacionScrollRef = useRef(0)
  const ultimaMarcaScrollRef = useRef(0)
  const ultimaActivacionScrollRef = useRef(0)
    const timeoutBloqueoRef = useRef(null)
    const timeoutDebugCopiadoRef = useRef(null)
    const audioParteFinalPozo2Ref = useRef(null)
    const fadeAudioParteFinalPozo2Ref = useRef(null)
    const volumenMusicaRef = useRef(obtenerVolumenMusica())

    const obtenerAudioParteFinalPozo2 = useCallback(() => {
        if (audioParteFinalPozo2Ref.current) {
            return audioParteFinalPozo2Ref.current
        }

        const audio = new Audio(AUDIO_PARTE_FINAL_POZO2)
        audio.preload = 'auto'
        audio.loop = true
        audio.volume = 0
        audioParteFinalPozo2Ref.current = audio
        return audio
    }, [])

    const obtenerVolumenObjetivoParteFinalPozo2 = useCallback(() => {
        const volumenMusica = limitar(volumenMusicaRef.current, 0, 1)
        return Math.min(volumenMusica, VOLUMEN_MAXIMO_PARTE_FINAL_POZO2)
    }, [])

    const limpiarFadeAudioParteFinalPozo2 = useCallback(() => {
        if (!fadeAudioParteFinalPozo2Ref.current) {
            return
        }
        window.clearInterval(fadeAudioParteFinalPozo2Ref.current)
        fadeAudioParteFinalPozo2Ref.current = null
    }, [])

    const ejecutarFadeAudioParteFinalPozo2 = useCallback(
        (
            audio,
            volumenDestino,
            { duracionMs = DURACION_FADE_AUDIO_PARTE_FINAL_POZO2_MS, alFinal = null } = {}
        ) => {
            if (!audio) {
                return
            }

            const volumenInicio = limitar(audio.volume, 0, 1)
            const volumenFinal = limitar(volumenDestino, 0, 1)
            const diferencia = volumenFinal - volumenInicio

            if (Math.abs(diferencia) < 0.001) {
                audio.volume = volumenFinal
                if (typeof alFinal === 'function') {
                    alFinal()
                }
                return
            }

            limpiarFadeAudioParteFinalPozo2()

            const pasos = Math.max(
                1,
                Math.round(duracionMs / INTERVALO_FADE_AUDIO_PARTE_FINAL_POZO2_MS)
            )
            let paso = 0

            fadeAudioParteFinalPozo2Ref.current = window.setInterval(() => {
                paso += 1
                const progreso = paso / pasos
                audio.volume = limitar(
                    volumenInicio + diferencia * progreso,
                    0,
                    1
                )

                if (paso >= pasos) {
                    limpiarFadeAudioParteFinalPozo2()
                    audio.volume = volumenFinal
                    if (typeof alFinal === 'function') {
                        alFinal()
                    }
                }
            }, INTERVALO_FADE_AUDIO_PARTE_FINAL_POZO2_MS)
        },
        [limpiarFadeAudioParteFinalPozo2]
    )

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
        seccion: 'pozo2',
        colorActivo: colorAudioActivo,
        indiceActivo: indiceAudioActivo
    })

    const onVolver = onVolverAAlmacenamiento ?? onVolverADesinfeccion

    useEffect(() => {
        setPasoActual(iniciarEnFinal ? PASOS_RECORRIDO.length - 1 : 0)
    }, [iniciarEnFinal])

    useEffect(() => {
        const actualizarVolumenMusica = (event) => {
            const volumenEvento = Number(event?.detail?.volumenMusica)
            volumenMusicaRef.current = Number.isFinite(volumenEvento)
                ? limitar(volumenEvento, 0, 100) / 100
                : obtenerVolumenMusica()

            const audio = audioParteFinalPozo2Ref.current
            const debeSonarEnPasoActual =
                pasoActual >= PASO_AUDIO_PARTE_FINAL_POZO2_INICIO

            if (audio && debeSonarEnPasoActual) {
                ejecutarFadeAudioParteFinalPozo2(
                    audio,
                    obtenerVolumenObjetivoParteFinalPozo2(),
                    { duracionMs: 180 }
                )
            }
        }

        window.addEventListener(EVENTO_CAMBIO_CONFIG_AUDIO, actualizarVolumenMusica)
        return () => {
            window.removeEventListener(
                EVENTO_CAMBIO_CONFIG_AUDIO,
                actualizarVolumenMusica
            )
        }
    }, [
        ejecutarFadeAudioParteFinalPozo2,
        obtenerVolumenObjetivoParteFinalPozo2,
        pasoActual
    ])

    useEffect(() => {
        const debeSonarEnPasoActual =
            pasoActual >= PASO_AUDIO_PARTE_FINAL_POZO2_INICIO

        if (debeSonarEnPasoActual) {
            const audio = obtenerAudioParteFinalPozo2()
            const volumenObjetivo = obtenerVolumenObjetivoParteFinalPozo2()

            if (!audio.paused) {
                ejecutarFadeAudioParteFinalPozo2(audio, volumenObjetivo)
                return
            }

            audio.currentTime = 0
            audio.volume = 0
            const promesaReproduccion = audio.play()
            if (promesaReproduccion && typeof promesaReproduccion.then === 'function') {
                promesaReproduccion
                    .then(() => {
                        ejecutarFadeAudioParteFinalPozo2(audio, volumenObjetivo)
                    })
                    .catch(() => { })
            } else {
                ejecutarFadeAudioParteFinalPozo2(audio, volumenObjetivo)
            }
            return
        }

        if (!audioParteFinalPozo2Ref.current) {
            return
        }

        const audio = audioParteFinalPozo2Ref.current
        ejecutarFadeAudioParteFinalPozo2(audio, 0, {
            duracionMs: DURACION_FADE_SALIDA_AUDIO_PARTE_FINAL_POZO2_MS,
            alFinal: () => {
                audio.pause()
                audio.currentTime = 0
            }
        })
    }, [
        ejecutarFadeAudioParteFinalPozo2,
        obtenerAudioParteFinalPozo2,
        obtenerVolumenObjetivoParteFinalPozo2,
        pasoActual
    ])

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

    const manejarCambioPaso = useCallback((direccionScroll) => {
        if (bloqueoScrollRef.current || direccionScroll === 0) {
            return
        }

        bloqueoScrollRef.current = true

        if (direccionScroll > 0) {
            if (pasoActual >= PASOS_RECORRIDO.length - 1) {
                if (typeof onCompletarPozo2 === 'function') {
                    onCompletarPozo2()
                }
            } else {
                setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
            }
        } else if (pasoActual > 0) {
            setPasoActual((pasoAnterior) => Math.max(pasoAnterior - 1, 0))
        } else if (typeof onVolver === 'function') {
            onVolver()
        }

        if (timeoutBloqueoRef.current) {
            window.clearTimeout(timeoutBloqueoRef.current)
        }

        timeoutBloqueoRef.current = window.setTimeout(() => {
            bloqueoScrollRef.current = false
            timeoutBloqueoRef.current = null
        }, DURACION_BLOQUEO_SCROLL)
    }, [pasoActual, onVolver, onCompletarPozo2])

    useControlesNavegacion({
        acumulacionScrollRef,
        ultimaMarcaScrollRef,
        ultimaActivacionScrollRef,
        onAvanzar: useCallback(() => manejarCambioPaso(1), [manejarCambioPaso]),
        onRetroceder: useCallback(() => manejarCambioPaso(-1), [manejarCambioPaso])
    })

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
            limpiarFadeAudioParteFinalPozo2()
            if (audioParteFinalPozo2Ref.current) {
                audioParteFinalPozo2Ref.current.pause()
                audioParteFinalPozo2Ref.current.currentTime = 0
                audioParteFinalPozo2Ref.current = null
            }
        }
    }, [limpiarFadeAudioParteFinalPozo2])

    const camaraActiva = obtenerCamaraActivaPaso()
    const { viewportRef, estiloEscenaFija } = useFixedSceneLayout()
    const estiloPanel = {
        '--cam-x': `${camaraActiva.camaraX}%`,
        '--cam-y': `${camaraActiva.camaraY}%`,
        '--cam-zoom': `${camaraActiva.zoom}`,
        ...(estiloEscenaFija ?? {})
    }
    const estiloEscena = useMemo(
        () => ({
            backgroundImage: `url('${ESCENA_POZO2}')`
        }),
        []
    )
    const estiloGota = {
        left: `${paso.gota.x}%`,
        top: `${paso.gota.y}%`,
        '--gota-escala': `${paso.gota.escala}`
    }

    return (
        <main className="ptar-pozo2" ref={viewportRef}>
            <section className="ptar-pozo2__panel" style={estiloPanel} aria-label="Estacion pozo 2">
                <div className="ptar-pozo2__escena" style={estiloEscena} aria-hidden="true" />
                <div className="ptar-pozo2__capa-escena" aria-hidden="true" />

                {paso.marcadores?.length
                    ? paso.marcadores.map((marcador, indice) => (
                        <div
                            key={`${marcador.etiqueta}-${indice}`}
                            className="ptar-pozo2__marcador"
                            style={{ left: `${marcador.x}%`, top: `${marcador.y}%` }}
                            aria-hidden="true"
                        >
                            <span className="ptar-pozo2__marcador-label">{marcador.etiqueta}</span>
                            <span className="ptar-pozo2__marcador-pin" />
                        </div>
                    ))
                    : null}

                {!paso.ocultarGota ? (
                    <img
                        className={`ptar-pozo2__gota ${paso.gotaLimpia ? 'ptar-pozo2__gota--limpia' : ''} ${paso.gotaTema ? `ptar-pozo2__gota--${paso.gotaTema}` : ''
                            }`}
                        src="/svg/gota.svg"
                        alt="Particula de agua"
                        style={estiloGota}
                    />
                ) : null}

                <img
                    className="ptar-pozo2__avatar ptar-pozo2__avatar--izquierda"
                    src="/images/Estudiante%20blanco.png"
                    alt=""
                    aria-hidden="true"
                />
                <img
                    className="ptar-pozo2__avatar ptar-pozo2__avatar--derecha"
                    src="/images/Estudiante%20rojo.png"
                    alt=""
                    aria-hidden="true"
                />

                {paso.burbujaIzquierda ? (
                    <aside
                        key={`izquierda-${pasoActual}-${paso.burbujaIzquierda}`}
                        className="ptar-pozo2__burbuja ptar-pozo2__burbuja--izquierda ptar-pozo2__burbuja--blanca"
                    >
                        {paso.burbujaIzquierda}
                    </aside>
                ) : null}

                {paso.burbujaDerecha ? (
                    <aside
                        key={`derecha-${pasoActual}-${paso.burbujaDerecha}`}
                        className={`ptar-pozo2__burbuja ptar-pozo2__burbuja--derecha ptar-pozo2__burbuja--roja ${paso.burbujaDerechaCompacta ? 'is-compacta' : ''
                            }`}
                    >
                        {paso.burbujaDerecha}
                    </aside>
                ) : null}

                {debugCamaraActiva ? (
                    <aside className="ptar-pozo2__debug-camara" role="status" aria-live="polite">
                        <p className="ptar-pozo2__debug-titulo">Debug camara (paso {pasoActual + 1})</p>
                        <p className="ptar-pozo2__debug-linea">
                            X: {redondear(camaraActiva.camaraX)} | Y: {redondear(camaraActiva.camaraY)} | Zoom:{' '}
                            {redondear(camaraActiva.zoom)}
                        </p>
                        <p className="ptar-pozo2__debug-linea">
                            Flechas: mover | +/-: zoom | C: copiar | R: reset paso | F8: ocultar
                        </p>
                        <div className="ptar-pozo2__debug-botones">
                            <button
                                type="button"
                                className="ptar-pozo2__debug-boton"
                                onClick={() => {
                                    void copiarCamaraPasoActual()
                                }}
                            >
                                {debugCopiado ? 'Copiado' : 'Copiar camara'}
                            </button>
                            <button
                                type="button"
                                className="ptar-pozo2__debug-boton ptar-pozo2__debug-boton--secundario"
                                onClick={reiniciarCamaraPasoActual}
                            >
                                Reset paso
                            </button>
                        </div>
                    </aside>
                ) : null}
            </section>
        </main>
    )
}

export default Pozo2
