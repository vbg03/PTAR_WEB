import { useEffect, useState } from 'react'

const MEDIA_QUERY_NAVEGACION_TACTIL = '(pointer: coarse)'

function detectarNavegacionTactil() {
  if (typeof window === 'undefined') {
    return false
  }

  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(MEDIA_QUERY_NAVEGACION_TACTIL).matches
  }

  return typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
}

export function useEsNavegacionTactil() {
  const [esNavegacionTactil, setEsNavegacionTactil] = useState(detectarNavegacionTactil)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const media = window.matchMedia(MEDIA_QUERY_NAVEGACION_TACTIL)
    const actualizar = () => {
      setEsNavegacionTactil(media.matches)
    }

    actualizar()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', actualizar)
      return () => media.removeEventListener('change', actualizar)
    }

    media.addListener(actualizar)
    return () => media.removeListener(actualizar)
  }, [])

  return esNavegacionTactil
}
