import { useEffect, useState } from 'react'
import {
  EVENTO_CAMBIO_MODO_NAVEGACION,
  LLAVE_MODO_NAVEGACION,
  leerModoNavegacionGuardado,
  normalizarModoNavegacion
} from '../utils/navigationSettings'

export function useModoNavegacion() {
  const [modoNavegacion, setModoNavegacion] = useState(() =>
    leerModoNavegacionGuardado()
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const actualizarModo = (event) => {
      setModoNavegacion(normalizarModoNavegacion(event?.detail?.modo))
    }

    const sincronizarStorage = (event) => {
      if (event.key === LLAVE_MODO_NAVEGACION) {
        setModoNavegacion(leerModoNavegacionGuardado())
      }
    }

    window.addEventListener(EVENTO_CAMBIO_MODO_NAVEGACION, actualizarModo)
    window.addEventListener('storage', sincronizarStorage)

    return () => {
      window.removeEventListener(
        EVENTO_CAMBIO_MODO_NAVEGACION,
        actualizarModo
      )
      window.removeEventListener('storage', sincronizarStorage)
    }
  }, [])

  return modoNavegacion
}
