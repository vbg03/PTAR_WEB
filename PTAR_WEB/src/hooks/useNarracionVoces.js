import { useEffect, useRef } from 'react'
import {
  EVENTO_CAMBIO_CONFIG_AUDIO,
  obtenerVolumenVoces
} from '../utils/audioSettings'
import { construirRutaVoz } from '../utils/voiceLibrary'

export function useNarracionVoces({
  seccion,
  colorActivo,
  indiceActivo,
  rutaPersonalizada = null,
  habilitado = true
}) {
  const audioRef = useRef(null)
  const claveReproducidaRef = useRef('')
  const claveObjetivoRef = useRef('')
  const clavePendienteRef = useRef('')
  const volumenVocesRef = useRef(obtenerVolumenVoces())

  useEffect(() => {
    const actualizarVolumen = () => {
      volumenVocesRef.current = obtenerVolumenVoces()
      if (audioRef.current) {
        audioRef.current.volume = volumenVocesRef.current
      }
    }

    window.addEventListener(EVENTO_CAMBIO_CONFIG_AUDIO, actualizarVolumen)
    return () =>
      window.removeEventListener(EVENTO_CAMBIO_CONFIG_AUDIO, actualizarVolumen)
  }, [])

  useEffect(() => {
    const intentarReproducirPendiente = () => {
      const audio = audioRef.current
      const clavePendiente = clavePendienteRef.current
      if (!audio || !clavePendiente) {
        return
      }

      if (clavePendiente !== claveObjetivoRef.current) {
        clavePendienteRef.current = ''
        return
      }

      audio.volume = volumenVocesRef.current
      const intento = audio.play()

      if (intento && typeof intento.then === 'function') {
        intento
          .then(() => {
            claveReproducidaRef.current = clavePendiente
            clavePendienteRef.current = ''
          })
          .catch(() => {})
        return
      }

      claveReproducidaRef.current = clavePendiente
      clavePendienteRef.current = ''
    }

    window.addEventListener('wheel', intentarReproducirPendiente, {
      passive: true
    })
    window.addEventListener('pointerdown', intentarReproducirPendiente, {
      passive: true
    })
    window.addEventListener('touchstart', intentarReproducirPendiente, {
      passive: true
    })
    window.addEventListener('keydown', intentarReproducirPendiente)

    return () => {
      window.removeEventListener('wheel', intentarReproducirPendiente)
      window.removeEventListener('pointerdown', intentarReproducirPendiente)
      window.removeEventListener('touchstart', intentarReproducirPendiente)
      window.removeEventListener('keydown', intentarReproducirPendiente)
    }
  }, [])

  useEffect(() => {
    const tieneRutaPersonalizada =
      typeof rutaPersonalizada === 'string' && rutaPersonalizada.length > 0
    const indiceValido = Number.isInteger(indiceActivo) && indiceActivo > 0
    const tieneAudioPorIndice =
      Boolean(seccion) && Boolean(colorActivo) && indiceValido
    if (!habilitado || (!tieneRutaPersonalizada && !tieneAudioPorIndice)) {
      claveObjetivoRef.current = ''
      clavePendienteRef.current = ''
      claveReproducidaRef.current = ''
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      return
    }

    const claveAudio = tieneRutaPersonalizada
      ? `custom:${rutaPersonalizada}`
      : `${seccion}:${colorActivo}:${indiceActivo}`
    claveObjetivoRef.current = claveAudio
    if (claveAudio === claveReproducidaRef.current) {
      return
    }

    const rutaVoz = tieneRutaPersonalizada
      ? rutaPersonalizada
      : construirRutaVoz({
          seccion,
          color: colorActivo,
          indice: indiceActivo
        })
    if (!rutaVoz) {
      return
    }

    const audio = audioRef.current ?? new Audio()
    audioRef.current = audio
    audio.preload = 'auto'
    audio.volume = volumenVocesRef.current

    const manejarError = () => {
      if (clavePendienteRef.current === claveAudio) {
        clavePendienteRef.current = ''
      }
    }

    audio.pause()
    audio.currentTime = 0
    audio.src = rutaVoz
    audio.load()
    audio.addEventListener('error', manejarError, { once: true })

    const intento = audio.play()
    if (intento && typeof intento.then === 'function') {
      intento
        .then(() => {
          if (claveObjetivoRef.current !== claveAudio) {
            return
          }
          claveReproducidaRef.current = claveAudio
          if (clavePendienteRef.current === claveAudio) {
            clavePendienteRef.current = ''
          }
        })
        .catch((error) => {
          if (error?.name === 'NotAllowedError') {
            clavePendienteRef.current = claveAudio
            return
          }
        })
      return
    }

    claveReproducidaRef.current = claveAudio
  }, [seccion, colorActivo, indiceActivo, rutaPersonalizada, habilitado])

  useEffect(() => {
    return () => {
      if (!audioRef.current) {
        return
      }

      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
    }
  }, [])
}
