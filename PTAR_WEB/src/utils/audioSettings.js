export const LLAVE_VOLUMEN_VOCES = 'ptar-volumen-voces'
export const LLAVE_VOLUMEN_MUSICA = 'ptar-volumen-musica'
export const VOLUMEN_DEFECTO_VOCES = 72
export const VOLUMEN_DEFECTO_MUSICA = 48
export const EVENTO_CAMBIO_CONFIG_AUDIO = 'ptar-audio-config-cambio'

export function normalizarPorcentajeVolumen(valor, valorDefecto = 50) {
  const numero = Number(valor)
  if (!Number.isFinite(numero)) {
    return valorDefecto
  }

  return Math.max(0, Math.min(100, Math.round(numero)))
}

export function leerVolumenDesdeStorage(llave, valorDefecto) {
  if (typeof window === 'undefined') {
    return valorDefecto
  }

  const valorCrudo = window.localStorage.getItem(llave)
  if (valorCrudo === null) {
    return valorDefecto
  }

  return normalizarPorcentajeVolumen(valorCrudo, valorDefecto)
}

export function obtenerVolumenVoces() {
  return leerVolumenDesdeStorage(LLAVE_VOLUMEN_VOCES, VOLUMEN_DEFECTO_VOCES) / 100
}

export function obtenerVolumenMusica() {
  return leerVolumenDesdeStorage(LLAVE_VOLUMEN_MUSICA, VOLUMEN_DEFECTO_MUSICA) / 100
}

export function emitirEventoConfiguracionAudio({
  volumenVoces,
  volumenMusica
} = {}) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(EVENTO_CAMBIO_CONFIG_AUDIO, {
      detail: {
        volumenVoces: normalizarPorcentajeVolumen(
          volumenVoces,
          VOLUMEN_DEFECTO_VOCES
        ),
        volumenMusica: normalizarPorcentajeVolumen(
          volumenMusica,
          VOLUMEN_DEFECTO_MUSICA
        )
      }
    })
  )
}
