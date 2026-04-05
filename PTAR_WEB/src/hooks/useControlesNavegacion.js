import { useEffect } from 'react'
import {
  EVENTO_NAVEGACION_AVANZAR,
  EVENTO_NAVEGACION_RETROCEDER,
  MODO_NAVEGACION_BOTONES
} from '../utils/navigationSettings'
import { obtenerDireccionScrollPorGesto } from '../utils/wheelStepNavigation'
import { useModoNavegacion } from './useModoNavegacion'

export function useControlesNavegacion({
  acumulacionScrollRef,
  ultimaMarcaScrollRef,
  ultimaActivacionScrollRef,
  onAvanzar = () => {},
  onRetroceder = () => {}
}) {
  const modoNavegacion = useModoNavegacion()

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      modoNavegacion === MODO_NAVEGACION_BOTONES
    ) {
      return undefined
    }

    const manejarRueda = (event) => {
      const direccionScroll = obtenerDireccionScrollPorGesto(
        event,
        acumulacionScrollRef,
        ultimaMarcaScrollRef,
        ultimaActivacionScrollRef
      )

      if (direccionScroll > 0) {
        onAvanzar()
      } else if (direccionScroll < 0) {
        onRetroceder()
      }
    }

    window.addEventListener('wheel', manejarRueda, { passive: true })
    return () => {
      window.removeEventListener('wheel', manejarRueda)
    }
  }, [
    acumulacionScrollRef,
    modoNavegacion,
    onAvanzar,
    onRetroceder,
    ultimaActivacionScrollRef,
    ultimaMarcaScrollRef
  ])

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      modoNavegacion !== MODO_NAVEGACION_BOTONES
    ) {
      return undefined
    }

    window.addEventListener(EVENTO_NAVEGACION_AVANZAR, onAvanzar)
    window.addEventListener(EVENTO_NAVEGACION_RETROCEDER, onRetroceder)

    return () => {
      window.removeEventListener(EVENTO_NAVEGACION_AVANZAR, onAvanzar)
      window.removeEventListener(EVENTO_NAVEGACION_RETROCEDER, onRetroceder)
    }
  }, [modoNavegacion, onAvanzar, onRetroceder])

  return modoNavegacion
}
