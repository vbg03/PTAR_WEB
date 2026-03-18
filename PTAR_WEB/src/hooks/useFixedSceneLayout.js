import { useLayoutEffect, useRef, useState } from 'react'

const ASPECTO_ESCENA_DESKTOP = 16 / 9
const ASPECTO_ESCENA_MOVIL = 19.5 / 9
const ANCHO_MAXIMO_MOVIL_LANDSCAPE = 950
const ALTO_MAXIMO_MOVIL_LANDSCAPE = 450

export function useFixedSceneLayout() {
  const viewportRef = useRef(null)
  const [estiloEscenaFija, setEstiloEscenaFija] = useState(null)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return undefined
    }

    const actualizarDimensionesEscena = () => {
      const { width, height } = viewport.getBoundingClientRect()
      if (!width || !height) {
        return
      }

      const esMovilLandscape =
        width > height &&
        width <= ANCHO_MAXIMO_MOVIL_LANDSCAPE &&
        height <= ALTO_MAXIMO_MOVIL_LANDSCAPE
      const aspectoEscena = esMovilLandscape ? ASPECTO_ESCENA_MOVIL : ASPECTO_ESCENA_DESKTOP

      let anchoEscena = width
      let altoEscena = anchoEscena / aspectoEscena

      if (altoEscena > height) {
        altoEscena = height
        anchoEscena = altoEscena * aspectoEscena
      }

      setEstiloEscenaFija((estadoAnterior) => {
        if (
          estadoAnterior &&
          Math.abs(Number.parseFloat(estadoAnterior.width) - anchoEscena) < 0.5 &&
          Math.abs(Number.parseFloat(estadoAnterior.height) - altoEscena) < 0.5
        ) {
          return estadoAnterior
        }

        return {
          width: `${anchoEscena}px`,
          height: `${altoEscena}px`
        }
      })
    }

    actualizarDimensionesEscena()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', actualizarDimensionesEscena)
      return () => {
        window.removeEventListener('resize', actualizarDimensionesEscena)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      actualizarDimensionesEscena()
    })

    resizeObserver.observe(viewport)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return {
    viewportRef,
    estiloEscenaFija
  }
}
