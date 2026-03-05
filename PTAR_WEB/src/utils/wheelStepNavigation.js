const PIXELES_POR_LINEA_SCROLL = 16

function esGestoTouchpad(event) {
  if (!event || event.deltaMode !== 0) {
    return false
  }

  const deltaX = Math.abs(event.deltaX || 0)
  const deltaY = Math.abs(event.deltaY || 0)
  const deltaFraccional =
    !Number.isInteger(event.deltaX || 0) || !Number.isInteger(event.deltaY || 0)

  if (deltaFraccional) {
    return true
  }

  return deltaY > 0 && deltaY < 40 && deltaX < 40
}

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
    intervaloMinimoActivacionMs = 460,
    invertirTouchpad = true
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

  if (invertirTouchpad && esGestoTouchpad(event)) {
    deltaNormalizado *= -1
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
