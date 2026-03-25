import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import Header from './components/Header/header.jsx'
import Inicio from './components/Inicio/inicio.jsx'
import Informacion from './components/Informacion/informacion.jsx'
import Pozo1 from './components/Estaciones/Pozo1/pozo1.jsx'
import Pretratamiento from './components/Estaciones/Pretratamiento/pretratamiento.jsx'
import Areacion from './components/Estaciones/Areación/areacion.jsx'
import Sedimentador from './components/Estaciones/Sedimentador/sedimentador.jsx'
import Lechos from './components/Estaciones/Lechos/lechos.jsx'
import Tamizaje from './components/Estaciones/Tamizaje/tamizaje.jsx'
import Filtro from './components/Estaciones/Filtración/filtro.jsx'
import Desinfeccion from './components/Estaciones/Desinfección/desinfeccion.jsx'
import Almacenamiento from './components/Estaciones/Almacenamiento/almacenamiento.jsx'
import Pozo2 from './components/Estaciones/Pozo2/pozo2.jsx'
import CasosUsos from './components/Usos/casosUsos.jsx'
import Documentacion from './components/Documentacion/documentacion.jsx'
import Herramientas from './components/Herramientas/herramientas.jsx'
import {
  EVENTO_CAMBIO_CONFIG_AUDIO,
  obtenerVolumenMusica
} from './utils/audioSettings'

const DURACION_TRANSICION_ESTACION = 760
const MITAD_TRANSICION_ESTACION = 340
const AUDIO_AMBIENTE_POZO1 = '/audio/sonido-agua.mp3'
const AUDIO_AMBIENTE_SEDIMENTADOR = '/audio/agua-estaciones.mp3'
const DURACION_FADE_AUDIO_MS = 720
const INTERVALO_FADE_AUDIO_MS = 32
const SECCIONES_AUDIO_AMBIENTE_AGUA = [
  'pozo1',
  'pretratamiento',
  'filtro',
  'almacenamiento',
  'pozo2'
]
const SECCIONES_AUDIO_AMBIENTE_ESTACIONES = ['sedimentador', 'tamizaje']
const SECCIONES_ESTACIONES = [
  'pozo1',
  'pretratamiento',
  'areacion',
  'sedimentador',
  'lechos',
  'tamizaje',
  'filtro',
  'desinfeccion',
  'almacenamiento',
  'pozo2'
]

function App() {
  const [seccionActiva, setSeccionActiva] = useState('inicio')
  const [volverAUbicacion, setVolverAUbicacion] = useState(false)
  const [pozo1RenderKey, setPozo1RenderKey] = useState(0)
  const [pretratamientoRenderKey, setPretratamientoRenderKey] = useState(0)
  const [areacionRenderKey, setAreacionRenderKey] = useState(0)
  const [sedimentadorRenderKey, setSedimentadorRenderKey] = useState(0)
  const [lechosRenderKey, setLechosRenderKey] = useState(0)
  const [tamizajeRenderKey, setTamizajeRenderKey] = useState(0)
  const [filtroRenderKey, setFiltroRenderKey] = useState(0)
  const [desinfeccionRenderKey, setDesinfeccionRenderKey] = useState(0)
  const [almacenamientoRenderKey, setAlmacenamientoRenderKey] = useState(0)
  const [pozo2RenderKey, setPozo2RenderKey] = useState(0)
  const [usosRenderKey, setUsosRenderKey] = useState(0)
  const [usosIniciarEnFinal, setUsosIniciarEnFinal] = useState(false)
  const [pozo1IniciarEnFinal, setPozo1IniciarEnFinal] = useState(false)
  const [pretratamientoIniciarEnFinal, setPretratamientoIniciarEnFinal] = useState(false)
  const [areacionEntradaSuave, setAreacionEntradaSuave] = useState(false)
  const [areacionIniciarEnFinal, setAreacionIniciarEnFinal] = useState(false)
  const [sedimentadorIniciarEnFinal, setSedimentadorIniciarEnFinal] = useState(false)
  const [lechosIniciarEnFinal, setLechosIniciarEnFinal] = useState(false)
  const [tamizajeIniciarEnFinal, setTamizajeIniciarEnFinal] = useState(false)
  const [filtroIniciarEnFinal, setFiltroIniciarEnFinal] = useState(false)
  const [desinfeccionIniciarEnFinal, setDesinfeccionIniciarEnFinal] = useState(false)
  const [almacenamientoIniciarEnFinal, setAlmacenamientoIniciarEnFinal] = useState(false)
  const [pozo2IniciarEnFinal, setPozo2IniciarEnFinal] = useState(false)
  const [transicionEstacionActiva, setTransicionEstacionActiva] = useState(false)
  const [direccionTransicionEstacion, setDireccionTransicionEstacion] = useState('avance')
  const transicionActivaRef = useRef(false)
  const timeoutCambioSeccionRef = useRef(null)
  const timeoutFinTransicionRef = useRef(null)
  const audioAmbientePozo1Ref = useRef(null)
  const audioAmbienteSedimentadorRef = useRef(null)
  const fadeAudioRef = useRef(null)
  const fadeAudioSedimentadorRef = useRef(null)
  const volumenMusicaRef = useRef(obtenerVolumenMusica())

  const limpiarFadeAudio = useCallback(() => {
    if (!fadeAudioRef.current) {
      return
    }
    window.clearInterval(fadeAudioRef.current)
    fadeAudioRef.current = null
  }, [])

  const limpiarFadeAudioSedimentador = useCallback(() => {
    if (!fadeAudioSedimentadorRef.current) {
      return
    }
    window.clearInterval(fadeAudioSedimentadorRef.current)
    fadeAudioSedimentadorRef.current = null
  }, [])

  const limitarVolumen = useCallback((volumen) => {
    if (!Number.isFinite(volumen)) {
      return 0
    }
    return Math.max(0, Math.min(1, volumen))
  }, [])

  const obtenerAudioAmbientePozo1 = useCallback(() => {
    if (audioAmbientePozo1Ref.current) {
      return audioAmbientePozo1Ref.current
    }

    const audio = new Audio(AUDIO_AMBIENTE_POZO1)
    audio.preload = 'auto'
    audio.loop = true
    audio.volume = 0
    audioAmbientePozo1Ref.current = audio
    return audio
  }, [])

  const obtenerAudioAmbienteSedimentador = useCallback(() => {
    if (audioAmbienteSedimentadorRef.current) {
      return audioAmbienteSedimentadorRef.current
    }

    const audio = new Audio(AUDIO_AMBIENTE_SEDIMENTADOR)
    audio.preload = 'auto'
    audio.loop = true
    audio.volume = 0
    audioAmbienteSedimentadorRef.current = audio
    return audio
  }, [])

  const ejecutarFadeAudio = useCallback(
    (
      audio,
      volumenDestino,
      { duracionMs = DURACION_FADE_AUDIO_MS, alFinal = null } = {}
    ) => {
      if (!audio) {
        return
      }

      const inicio = limitarVolumen(audio.volume)
      const destino = limitarVolumen(volumenDestino)
      const diferencia = destino - inicio

      if (Math.abs(diferencia) < 0.001) {
        audio.volume = destino
        if (typeof alFinal === 'function') {
          alFinal()
        }
        return
      }

      limpiarFadeAudio()

      const pasos = Math.max(1, Math.round(duracionMs / INTERVALO_FADE_AUDIO_MS))
      let pasoActual = 0

      fadeAudioRef.current = window.setInterval(() => {
        pasoActual += 1
        const progreso = pasoActual / pasos
        audio.volume = limitarVolumen(inicio + diferencia * progreso)

        if (pasoActual >= pasos) {
          limpiarFadeAudio()
          audio.volume = destino
          if (typeof alFinal === 'function') {
            alFinal()
          }
        }
      }, INTERVALO_FADE_AUDIO_MS)
    },
    [limitarVolumen, limpiarFadeAudio]
  )

  const ejecutarFadeAudioSedimentador = useCallback(
    (
      audio,
      volumenDestino,
      { duracionMs = DURACION_FADE_AUDIO_MS, alFinal = null } = {}
    ) => {
      if (!audio) {
        return
      }

      const inicio = limitarVolumen(audio.volume)
      const destino = limitarVolumen(volumenDestino)
      const diferencia = destino - inicio

      if (Math.abs(diferencia) < 0.001) {
        audio.volume = destino
        if (typeof alFinal === 'function') {
          alFinal()
        }
        return
      }

      limpiarFadeAudioSedimentador()

      const pasos = Math.max(1, Math.round(duracionMs / INTERVALO_FADE_AUDIO_MS))
      let pasoActual = 0

      fadeAudioSedimentadorRef.current = window.setInterval(() => {
        pasoActual += 1
        const progreso = pasoActual / pasos
        audio.volume = limitarVolumen(inicio + diferencia * progreso)

        if (pasoActual >= pasos) {
          limpiarFadeAudioSedimentador()
          audio.volume = destino
          if (typeof alFinal === 'function') {
            alFinal()
          }
        }
      }, INTERVALO_FADE_AUDIO_MS)
    },
    [limitarVolumen, limpiarFadeAudioSedimentador]
  )

  const limpiarTimeout = (timeoutRef) => {
    if (!timeoutRef.current) {
      return
    }
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  const ejecutarTransicionEstacion = (direccion, cambiarSeccion) => {
    if (transicionActivaRef.current) {
      return
    }

    transicionActivaRef.current = true
    setDireccionTransicionEstacion(direccion)
    setTransicionEstacionActiva(true)

    limpiarTimeout(timeoutCambioSeccionRef)
    limpiarTimeout(timeoutFinTransicionRef)

    timeoutCambioSeccionRef.current = window.setTimeout(() => {
      cambiarSeccion()
    }, MITAD_TRANSICION_ESTACION)

    timeoutFinTransicionRef.current = window.setTimeout(() => {
      transicionActivaRef.current = false
      setTransicionEstacionActiva(false)
      timeoutCambioSeccionRef.current = null
      timeoutFinTransicionRef.current = null
    }, DURACION_TRANSICION_ESTACION)
  }

  useEffect(() => {
    return () => {
      limpiarTimeout(timeoutCambioSeccionRef)
      limpiarTimeout(timeoutFinTransicionRef)
      limpiarFadeAudio()
      limpiarFadeAudioSedimentador()

      if (audioAmbientePozo1Ref.current) {
        audioAmbientePozo1Ref.current.pause()
        audioAmbientePozo1Ref.current = null
      }

      if (audioAmbienteSedimentadorRef.current) {
        audioAmbienteSedimentadorRef.current.pause()
        audioAmbienteSedimentadorRef.current = null
      }
    }
  }, [limpiarFadeAudio, limpiarFadeAudioSedimentador])

  useEffect(() => {
    const actualizarVolumenMusica = (event) => {
      const volumenEvento = Number(event?.detail?.volumenMusica)
      const volumenNormalizado = Number.isFinite(volumenEvento)
        ? Math.max(0, Math.min(100, volumenEvento)) / 100
        : obtenerVolumenMusica()

      volumenMusicaRef.current = volumenNormalizado

      const audio = audioAmbientePozo1Ref.current
      if (audio && SECCIONES_AUDIO_AMBIENTE_AGUA.includes(seccionActiva)) {
        ejecutarFadeAudio(audio, volumenMusicaRef.current, { duracionMs: 260 })
      }

      const audioSedimentador = audioAmbienteSedimentadorRef.current
      if (
        audioSedimentador &&
        SECCIONES_AUDIO_AMBIENTE_ESTACIONES.includes(seccionActiva)
      ) {
        ejecutarFadeAudioSedimentador(audioSedimentador, volumenMusicaRef.current, {
          duracionMs: 260
        })
      }
    }

    window.addEventListener(EVENTO_CAMBIO_CONFIG_AUDIO, actualizarVolumenMusica)
    return () =>
      window.removeEventListener(
        EVENTO_CAMBIO_CONFIG_AUDIO,
        actualizarVolumenMusica
      )
  }, [ejecutarFadeAudio, ejecutarFadeAudioSedimentador, seccionActiva])

  useEffect(() => {
    const debeSonarAudioAmbienteAgua =
      SECCIONES_AUDIO_AMBIENTE_AGUA.includes(seccionActiva)

    if (debeSonarAudioAmbienteAgua) {
      const audio = obtenerAudioAmbientePozo1()
      if (!audio.paused) {
        ejecutarFadeAudio(audio, volumenMusicaRef.current)
        return
      }

      audio.currentTime = 0
      audio.volume = 0

      const promesaReproduccion = audio.play()
      if (promesaReproduccion && typeof promesaReproduccion.then === 'function') {
        promesaReproduccion
          .then(() => ejecutarFadeAudio(audio, volumenMusicaRef.current))
          .catch(() => {})
        return
      }

      ejecutarFadeAudio(audio, volumenMusicaRef.current)
      return
    }

    if (!audioAmbientePozo1Ref.current) {
      return
    }

    const audio = audioAmbientePozo1Ref.current
    ejecutarFadeAudio(audio, 0, {
      alFinal: () => {
        audio.pause()
        audio.currentTime = 0
      }
    })
  }, [ejecutarFadeAudio, obtenerAudioAmbientePozo1, seccionActiva])

  useEffect(() => {
    if (SECCIONES_AUDIO_AMBIENTE_ESTACIONES.includes(seccionActiva)) {
      const audio = obtenerAudioAmbienteSedimentador()
      if (!audio.paused) {
        ejecutarFadeAudioSedimentador(audio, volumenMusicaRef.current)
        return
      }

      audio.currentTime = 0
      audio.volume = 0

      const promesaReproduccion = audio.play()
      if (promesaReproduccion && typeof promesaReproduccion.then === 'function') {
        promesaReproduccion
          .then(() =>
            ejecutarFadeAudioSedimentador(audio, volumenMusicaRef.current)
          )
          .catch(() => {})
        return
      }

      ejecutarFadeAudioSedimentador(audio, volumenMusicaRef.current)
      return
    }

    if (!audioAmbienteSedimentadorRef.current) {
      return
    }

    const audio = audioAmbienteSedimentadorRef.current
    ejecutarFadeAudioSedimentador(audio, 0, {
      alFinal: () => {
        audio.pause()
        audio.currentTime = 0
      }
    })
  }, [ejecutarFadeAudioSedimentador, obtenerAudioAmbienteSedimentador, seccionActiva])

  useEffect(() => {
    if (seccionActiva !== 'almacenamiento' && almacenamientoIniciarEnFinal) {
      setAlmacenamientoIniciarEnFinal(false)
    }
  }, [seccionActiva, almacenamientoIniciarEnFinal])

  useEffect(() => {
    if (seccionActiva !== 'pozo2' && pozo2IniciarEnFinal) {
      setPozo2IniciarEnFinal(false)
    }
  }, [seccionActiva, pozo2IniciarEnFinal])

  const claseApp =
    {
      pozo1: 'ptar-app--pozo1',
      pretratamiento: 'ptar-app--pretratamiento',
      areacion: 'ptar-app--areacion',
      sedimentador: 'ptar-app--sedimentador',
      lechos: 'ptar-app--lechos',
      tamizaje: 'ptar-app--tamizaje',
      filtro: 'ptar-app--filtro',
      desinfeccion: 'ptar-app--desinfeccion',
      almacenamiento: 'ptar-app--almacenamiento',
      pozo2: 'ptar-app--pozo2',
      informacion: 'ptar-app--informacion',
      usos: 'ptar-app--usos',
      documentacion: 'ptar-app--documentacion',
      inicio: 'ptar-app--inicio'
    }[seccionActiva] || ''
  const esSeccionEstacion = SECCIONES_ESTACIONES.includes(seccionActiva)
  const ocultarHeaderHastaZonaSuperior = esSeccionEstacion

  return (
    <div className={`ptar-app ${claseApp} ${esSeccionEstacion ? 'ptar-app--estacion' : ''}`}>
      <Header
        onLogoClick={() => {
          setVolverAUbicacion(false)
          setPozo1IniciarEnFinal(false)
          setPretratamientoIniciarEnFinal(false)
          setAreacionEntradaSuave(false)
          setAreacionIniciarEnFinal(false)
          setSedimentadorIniciarEnFinal(false)
          setLechosIniciarEnFinal(false)
          setTamizajeIniciarEnFinal(false)
          setFiltroIniciarEnFinal(false)
          setDesinfeccionIniciarEnFinal(false)
          setAlmacenamientoIniciarEnFinal(false)
          setPozo2IniciarEnFinal(false)
          setSeccionActiva('inicio')
        }}
        onSeleccionarEstacion={(_, indice) => {
          if (indice === 0) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('pozo1')
            setPozo1RenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 1) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('pretratamiento')
            setPretratamientoRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 2) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('areacion')
            setAreacionRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 3) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('sedimentador')
            setSedimentadorRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 4) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('lechos')
            setLechosRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 5) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('tamizaje')
            setTamizajeRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 6) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('filtro')
            setFiltroRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 7) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('desinfeccion')
            setDesinfeccionRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 8) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setAlmacenamientoIniciarEnFinal(false)
            setSeccionActiva('almacenamiento')
            setAlmacenamientoRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 9) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setPozo2IniciarEnFinal(false)
            setSeccionActiva('pozo2')
            setPozo2RenderKey((valorAnterior) => valorAnterior + 1)
            return
          }
        }}
        onIrAUsos={() => {
          setVolverAUbicacion(false)
          setPozo1IniciarEnFinal(false)
          setPretratamientoIniciarEnFinal(false)
          setAreacionEntradaSuave(false)
          setAreacionIniciarEnFinal(false)
          setSedimentadorIniciarEnFinal(false)
          setLechosIniciarEnFinal(false)
          setTamizajeIniciarEnFinal(false)
          setFiltroIniciarEnFinal(false)
          setDesinfeccionIniciarEnFinal(false)
          setAlmacenamientoIniciarEnFinal(false)
          setPozo2IniciarEnFinal(false)
          setUsosIniciarEnFinal(false)
          setSeccionActiva('usos')
          setUsosRenderKey((valorAnterior) => valorAnterior + 1)
        }}
        onIrADocumentacion={() => {
          setVolverAUbicacion(false)
          setPozo1IniciarEnFinal(false)
          setPretratamientoIniciarEnFinal(false)
          setAreacionEntradaSuave(false)
          setAreacionIniciarEnFinal(false)
          setSedimentadorIniciarEnFinal(false)
          setLechosIniciarEnFinal(false)
          setTamizajeIniciarEnFinal(false)
          setFiltroIniciarEnFinal(false)
          setDesinfeccionIniciarEnFinal(false)
          setAlmacenamientoIniciarEnFinal(false)
          setPozo2IniciarEnFinal(false)
          setSeccionActiva('documentacion')
        }}
        ocultarEnModoEstacion={ocultarHeaderHastaZonaSuperior}
      />
      <Herramientas mostrarPantallaCompletaEnEstacion={esSeccionEstacion} />
      <div className="ptar-app__orientacion" aria-live="polite" aria-label="Aviso de orientacion">
        <div className="ptar-app__orientacion-card">
          <span className="ptar-app__orientacion-icon" aria-hidden="true">
            <span className="ptar-app__orientacion-phone" />
            <span className="ptar-app__orientacion-arrow" />
          </span>
          <h2 className="ptar-app__orientacion-titulo">Gira tu dispositivo</h2>
          <p className="ptar-app__orientacion-texto">
            Esta experiencia esta pensada para usarse en horizontal en tablets y moviles.
          </p>
        </div>
      </div>
      <div className="ptar-app__content">
        {seccionActiva === 'inicio' ? (
          <Inicio
            onIniciarRecorrido={() => {
              setVolverAUbicacion(false)
              setPozo1IniciarEnFinal(false)
              setPretratamientoIniciarEnFinal(false)
              setAreacionEntradaSuave(false)
              setAreacionIniciarEnFinal(false)
              setSedimentadorIniciarEnFinal(false)
              setLechosIniciarEnFinal(false)
              setTamizajeIniciarEnFinal(false)
              setFiltroIniciarEnFinal(false)
              setDesinfeccionIniciarEnFinal(false)
              setSeccionActiva('informacion')
            }}
          />
        ) : null}

        {seccionActiva === 'informacion' ? (
          <Informacion
            iniciarEnUbicacion={volverAUbicacion}
            onCompletarInformacion={() => {
              setVolverAUbicacion(false)
              setPozo1IniciarEnFinal(false)
              setPretratamientoIniciarEnFinal(false)
              setAreacionEntradaSuave(false)
              setAreacionIniciarEnFinal(false)
              setSedimentadorIniciarEnFinal(false)
              setLechosIniciarEnFinal(false)
              setTamizajeIniciarEnFinal(false)
              setFiltroIniciarEnFinal(false)
              setDesinfeccionIniciarEnFinal(false)
              setSeccionActiva('pozo1')
            }}
          />
        ) : null}

        {seccionActiva === 'pozo1' ? (
          <Pozo1
            key={pozo1RenderKey}
            iniciarEnFinal={pozo1IniciarEnFinal}
            onCompletarPozo1={() => {
              ejecutarTransicionEstacion('avance', () => {
                setPozo1IniciarEnFinal(false)
                setPretratamientoIniciarEnFinal(false)
                setAreacionEntradaSuave(false)
                setAreacionIniciarEnFinal(false)
                setSedimentadorIniciarEnFinal(false)
                setLechosIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('pretratamiento')
                setPretratamientoRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onVolverAUbicacion={() => {
              setVolverAUbicacion(true)
              setPozo1IniciarEnFinal(false)
              setPretratamientoIniciarEnFinal(false)
              setAreacionEntradaSuave(false)
              setAreacionIniciarEnFinal(false)
              setSedimentadorIniciarEnFinal(false)
              setLechosIniciarEnFinal(false)
              setTamizajeIniciarEnFinal(false)
              setFiltroIniciarEnFinal(false)
              setDesinfeccionIniciarEnFinal(false)
              setSeccionActiva('informacion')
            }}
          />
        ) : null}

        {seccionActiva === 'pretratamiento' ? (
          <Pretratamiento
            key={pretratamientoRenderKey}
            iniciarEnFinal={pretratamientoIniciarEnFinal}
            onVolverAPozo1={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setPozo1IniciarEnFinal(true)
                setPretratamientoIniciarEnFinal(false)
                setAreacionEntradaSuave(false)
                setAreacionIniciarEnFinal(false)
                setSedimentadorIniciarEnFinal(false)
                setLechosIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('pozo1')
                setPozo1RenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onCompletarPretratamiento={() => {
              setPretratamientoIniciarEnFinal(false)
              setAreacionEntradaSuave(true)
              setAreacionIniciarEnFinal(false)
              setSedimentadorIniciarEnFinal(false)
              setLechosIniciarEnFinal(false)
              setTamizajeIniciarEnFinal(false)
              setFiltroIniciarEnFinal(false)
              setDesinfeccionIniciarEnFinal(false)
              setSeccionActiva('areacion')
              setAreacionRenderKey((valorAnterior) => valorAnterior + 1)
            }}
          />
        ) : null}

        {seccionActiva === 'areacion' ? (
          <Areacion
            key={areacionRenderKey}
            entradaSuaveDesdePretratamiento={areacionEntradaSuave}
            iniciarEnFinal={areacionIniciarEnFinal}
            onVolverAPretratamiento={() => {
              setPretratamientoIniciarEnFinal(true)
              setAreacionEntradaSuave(false)
              setAreacionIniciarEnFinal(false)
              setSedimentadorIniciarEnFinal(false)
              setLechosIniciarEnFinal(false)
              setTamizajeIniciarEnFinal(false)
              setFiltroIniciarEnFinal(false)
              setDesinfeccionIniciarEnFinal(false)
              setSeccionActiva('pretratamiento')
              setPretratamientoRenderKey((valorAnterior) => valorAnterior + 1)
            }}
            onCompletarAreacion={() => {
              ejecutarTransicionEstacion('avance', () => {
                setAreacionEntradaSuave(false)
                setAreacionIniciarEnFinal(false)
                setSedimentadorIniciarEnFinal(false)
                setLechosIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('sedimentador')
                setSedimentadorRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {seccionActiva === 'sedimentador' ? (
          <Sedimentador
            key={sedimentadorRenderKey}
            iniciarEnFinal={sedimentadorIniciarEnFinal}
            onVolverAAreacion={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setAreacionEntradaSuave(false)
                setAreacionIniciarEnFinal(true)
                setSedimentadorIniciarEnFinal(false)
                setLechosIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('areacion')
                setAreacionRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onCompletarSedimentador={() => {
              ejecutarTransicionEstacion('avance', () => {
                setSedimentadorIniciarEnFinal(false)
                setLechosIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('lechos')
                setLechosRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {seccionActiva === 'lechos' ? (
          <Lechos
            key={lechosRenderKey}
            iniciarEnFinal={lechosIniciarEnFinal}
            onVolverASedimentador={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setLechosIniciarEnFinal(false)
                setSedimentadorIniciarEnFinal(true)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('sedimentador')
                setSedimentadorRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onCompletarLechos={() => {
              ejecutarTransicionEstacion('avance', () => {
                setLechosIniciarEnFinal(false)
                setSedimentadorIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('tamizaje')
                setTamizajeRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {seccionActiva === 'tamizaje' ? (
          <Tamizaje
            key={tamizajeRenderKey}
            iniciarEnFinal={tamizajeIniciarEnFinal}
            onVolverALechos={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setLechosIniciarEnFinal(true)
                setSedimentadorIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('lechos')
                setLechosRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onCompletarTamizaje={() => {
              ejecutarTransicionEstacion('avance', () => {
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('filtro')
                setFiltroRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {seccionActiva === 'filtro' ? (
          <Filtro
            key={filtroRenderKey}
            iniciarEnFinal={filtroIniciarEnFinal}
            onVolverATamizaje={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setTamizajeIniciarEnFinal(true)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('tamizaje')
                setTamizajeRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onCompletarFiltracion={() => {
              ejecutarTransicionEstacion('avance', () => {
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('desinfeccion')
                setDesinfeccionRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {seccionActiva === 'desinfeccion' ? (
          <Desinfeccion
            key={desinfeccionRenderKey}
            iniciarEnFinal={desinfeccionIniciarEnFinal}
            onCompletarDesinfeccion={() => {
              ejecutarTransicionEstacion('avance', () => {
                setDesinfeccionIniciarEnFinal(false)
                setAlmacenamientoIniciarEnFinal(false)
                setSeccionActiva('almacenamiento')
                setAlmacenamientoRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onVolverAFiltro={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setDesinfeccionIniciarEnFinal(false)
                setFiltroIniciarEnFinal(true)
                setSeccionActiva('filtro')
                setFiltroRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {seccionActiva === 'almacenamiento' ? (
          <Almacenamiento
            key={almacenamientoRenderKey}
            iniciarEnFinal={almacenamientoIniciarEnFinal}
            onVolverADesinfeccion={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setDesinfeccionIniciarEnFinal(true)
                setSeccionActiva('desinfeccion')
                setDesinfeccionRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onCompletarAlmacenamiento={() => {
              ejecutarTransicionEstacion('avance', () => {
                setPozo2IniciarEnFinal(false)
                setSeccionActiva('pozo2')
                setPozo2RenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {seccionActiva === 'pozo2' ? (
          <Pozo2
            key={pozo2RenderKey}
            iniciarEnFinal={pozo2IniciarEnFinal}
            onVolverAAlmacenamiento={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setAlmacenamientoIniciarEnFinal(true)
                setSeccionActiva('almacenamiento')
                setAlmacenamientoRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onCompletarPozo2={() => {
              ejecutarTransicionEstacion('avance', () => {
                setPozo2IniciarEnFinal(false)
                setUsosIniciarEnFinal(false)
                setSeccionActiva('usos')
                setUsosRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {seccionActiva === 'usos' ? (
          <CasosUsos
            key={usosRenderKey}
            iniciarEnFinal={usosIniciarEnFinal}
            onVolverAPozo2={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setPozo2IniciarEnFinal(true)
                setSeccionActiva('pozo2')
                setPozo2RenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onCompletarUsos={() => {
              ejecutarTransicionEstacion('avance', () => {
                setPozo2IniciarEnFinal(false)
                setUsosIniciarEnFinal(false)
                setSeccionActiva('documentacion')
              })
            }}
          />
        ) : null}

        {seccionActiva === 'documentacion' ? (
          <Documentacion
            onVolverAUsos={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setUsosIniciarEnFinal(true)
                setSeccionActiva('usos')
                setUsosRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {transicionEstacionActiva ? (
          <div
            className={`ptar-app__transicion-estacion ptar-app__transicion-estacion--${direccionTransicionEstacion}`}
            aria-hidden="true"
          >
            <span className="ptar-app__transicion-capa" />
            <span className="ptar-app__transicion-brillo" />
            <span className="ptar-app__transicion-linea ptar-app__transicion-linea--roja" />
            <span className="ptar-app__transicion-linea ptar-app__transicion-linea--vinotinto" />
            <span className="ptar-app__transicion-linea ptar-app__transicion-linea--crema" />
            <span className="ptar-app__transicion-linea ptar-app__transicion-linea--gris" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default App
