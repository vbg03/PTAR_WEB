export const LLAVE_MODO_NAVEGACION = 'ptar-modo-navegacion'
export const MODO_NAVEGACION_GESTOS = 'gestos'
export const MODO_NAVEGACION_BOTONES = 'botones'
export const EVENTO_CAMBIO_MODO_NAVEGACION = 'ptar-modo-navegacion-cambio'
export const EVENTO_NAVEGACION_AVANZAR = 'ptar-navegacion-avanzar'
export const EVENTO_NAVEGACION_RETROCEDER = 'ptar-navegacion-retroceder'

export function normalizarModoNavegacion(modo) {
  return modo === MODO_NAVEGACION_BOTONES
    ? MODO_NAVEGACION_BOTONES
    : MODO_NAVEGACION_GESTOS
}

export function leerModoNavegacionGuardado() {
  if (typeof window === 'undefined') {
    return MODO_NAVEGACION_GESTOS
  }

  return normalizarModoNavegacion(
    window.localStorage.getItem(LLAVE_MODO_NAVEGACION)
  )
}

export function emitirEventoCambioModoNavegacion(modo) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(EVENTO_CAMBIO_MODO_NAVEGACION, {
      detail: {
        modo: normalizarModoNavegacion(modo)
      }
    })
  )
}

export function guardarModoNavegacion(modo) {
  const modoNormalizado = normalizarModoNavegacion(modo)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LLAVE_MODO_NAVEGACION, modoNormalizado)
    emitirEventoCambioModoNavegacion(modoNormalizado)
  }

  return modoNormalizado
}

export function emitirEventoNavegacion(direccion) {
  if (typeof window === 'undefined') {
    return
  }

  const tipoEvento =
    direccion === 'retroceder'
      ? EVENTO_NAVEGACION_RETROCEDER
      : EVENTO_NAVEGACION_AVANZAR

  window.dispatchEvent(new CustomEvent(tipoEvento))
}
