const PIXELES_POR_LINEA_SCROLL = 16
const SELECTOR_IGNORAR_SWIPE =
  'button, a, input, select, textarea, label, iframe, [role="button"], [contenteditable="true"], .ptar-help-overlay, .ptar-tools, .ptar-header, .ptar-modal, .is-draggable, [data-no-swipe-nav="true"]'

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

function debeIgnorarSwipe(target, selectorIgnorar) {
  return target instanceof Element && typeof target.closest === 'function'
    ? !!target.closest(selectorIgnorar)
    : false
}

export function registrarNavegacionSwipeGlobal(destino = window, opciones = {}) {
  if (!destino || typeof destino.addEventListener !== 'function') {
    return () => {}
  }

  const {
    umbralHorizontal = 72,
    maxDesplazamientoVertical = 96,
    intervaloMinimoActivacionMs = 380,
    selectorIgnorar = SELECTOR_IGNORAR_SWIPE
  } = opciones

  let gestoActivo = null
  let ultimaActivacion = 0

  const reiniciarGesto = () => {
    gestoActivo = null
  }

  const manejarTouchStart = (event) => {
    if (!event.touches || event.touches.length !== 1) {
      reiniciarGesto()
      return
    }

    if (debeIgnorarSwipe(event.target, selectorIgnorar)) {
      reiniciarGesto()
      return
    }

    const toque = event.touches[0]
    gestoActivo = {
      x: toque.clientX,
      y: toque.clientY
    }
  }

  const manejarTouchEnd = (event) => {
    if (!gestoActivo || !event.changedTouches || event.changedTouches.length === 0) {
      reiniciarGesto()
      return
    }

    const ahora = typeof performance !== 'undefined' ? performance.now() : Date.now()
    if (ahora - ultimaActivacion < intervaloMinimoActivacionMs) {
      reiniciarGesto()
      return
    }

    const toqueFinal = event.changedTouches[0]
    const deltaX = toqueFinal.clientX - gestoActivo.x
    const deltaY = toqueFinal.clientY - gestoActivo.y
    reiniciarGesto()

    if (
      Math.abs(deltaX) < umbralHorizontal ||
      Math.abs(deltaX) <= Math.abs(deltaY) ||
      Math.abs(deltaY) > maxDesplazamientoVertical
    ) {
      return
    }

    ultimaActivacion = ahora
    const deltaWheel = deltaX < 0 ? 120 : -120

    if (typeof WheelEvent === 'function') {
      destino.dispatchEvent(
        new WheelEvent('wheel', {
          deltaX: 0,
          deltaY: deltaWheel,
          deltaMode: 0
        })
      )
    }
  }

  destino.addEventListener('touchstart', manejarTouchStart, { passive: true })
  destino.addEventListener('touchend', manejarTouchEnd, { passive: true })
  destino.addEventListener('touchcancel', reiniciarGesto, { passive: true })

  return () => {
    destino.removeEventListener('touchstart', manejarTouchStart)
    destino.removeEventListener('touchend', manejarTouchEnd)
    destino.removeEventListener('touchcancel', reiniciarGesto)
  }
}
