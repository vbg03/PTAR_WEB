const PIXELES_POR_LINEA_SCROLL = 16

export function obtenerDireccionScrollPorGesto(
  event,
  acumulacionScrollRef,
  ultimaMarcaScrollRef,
  ultimaActivacionScrollRef,
  opciones = {}
) {
  const {
    umbralPixeles = 72,
    reinicioGestoMs = 140,
    intervaloMinimoActivacionMs = 460
  } = opciones

  if (!event || event.ctrlKey || event.metaKey) {
    return 0
  }

  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    return 0
  }

  let deltaNormalizado = event.deltaY
  if (!Number.isFinite(deltaNormalizado) || deltaNormalizado === 0) {
    return 0
  }

  if (event.deltaMode === 1) {
    deltaNormalizado *= PIXELES_POR_LINEA_SCROLL
  } else if (event.deltaMode === 2) {
    deltaNormalizado *= window.innerHeight
  }

  const ahora = typeof performance !== 'undefined' ? performance.now() : Date.now()

  if (ahora - ultimaActivacionScrollRef.current < intervaloMinimoActivacionMs) {
    return 0
  }

  if (ahora - ultimaMarcaScrollRef.current > reinicioGestoMs) {
    acumulacionScrollRef.current = 0
  }

  ultimaMarcaScrollRef.current = ahora
  acumulacionScrollRef.current += deltaNormalizado

  if (Math.abs(acumulacionScrollRef.current) < umbralPixeles) {
    return 0
  }

  const direccion = acumulacionScrollRef.current > 0 ? 1 : -1
  acumulacionScrollRef.current = 0
  ultimaActivacionScrollRef.current = ahora
  return direccion
}
