import { useLayoutEffect, useRef, useState } from 'react'

const ASPECTO_ESCENA_DESKTOP = 16 / 9
const ASPECTO_ESCENA_DESKTOP_MAX = 2.12
const ASPECTO_ESCENA_MOVIL = 19.5 / 9
const ANCHO_MAXIMO_MOVIL_LANDSCAPE = 950
const ALTO_MAXIMO_MOVIL_LANDSCAPE = 450

export function useFixedSceneLayout() {
  const viewportRef = useRef(null)
  const [estiloEscenaFija, setEstiloEscenaFija] = useState(null)
  const ultimoAspectoEscenaRef = useRef(ASPECTO_ESCENA_DESKTOP)
  const aspectoBloqueadoFullscreenRef = useRef(null)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return undefined
    }
    const visualViewport = window.visualViewport

    const programarActualizacionEscena = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          actualizarDimensionesEscena()
        })
      })
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
      const aspectoEscena = aspectoBloqueadoFullscreenRef.current ??
        (esMovilLandscape
          ? ASPECTO_ESCENA_MOVIL
          : Math.min(
            Math.max(width / height, ASPECTO_ESCENA_DESKTOP),
            ASPECTO_ESCENA_DESKTOP_MAX
          ))

      ultimoAspectoEscenaRef.current = aspectoEscena

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

    const manejarCambioFullscreen = () => {
      const hayFullscreen = Boolean(
        document.fullscreenElement || document.webkitFullscreenElement
      )

      aspectoBloqueadoFullscreenRef.current = hayFullscreen
        ? ultimoAspectoEscenaRef.current
        : null

      programarActualizacionEscena()
    }

    actualizarDimensionesEscena()
    window.addEventListener('orientationchange', programarActualizacionEscena)
    window.addEventListener('resize', actualizarDimensionesEscena)
    document.addEventListener('fullscreenchange', manejarCambioFullscreen)
    document.addEventListener('webkitfullscreenchange', manejarCambioFullscreen)
    visualViewport?.addEventListener('resize', actualizarDimensionesEscena)

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        window.removeEventListener('resize', actualizarDimensionesEscena)
        window.removeEventListener('orientationchange', programarActualizacionEscena)
        document.removeEventListener('fullscreenchange', manejarCambioFullscreen)
        document.removeEventListener('webkitfullscreenchange', manejarCambioFullscreen)
        visualViewport?.removeEventListener('resize', actualizarDimensionesEscena)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      actualizarDimensionesEscena()
    })

    resizeObserver.observe(viewport)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', actualizarDimensionesEscena)
      window.removeEventListener('orientationchange', programarActualizacionEscena)
      document.removeEventListener('fullscreenchange', manejarCambioFullscreen)
      document.removeEventListener('webkitfullscreenchange', manejarCambioFullscreen)
      visualViewport?.removeEventListener('resize', actualizarDimensionesEscena)
    }
  }, [])

  return {
    viewportRef,
    estiloEscenaFija
  }
}
