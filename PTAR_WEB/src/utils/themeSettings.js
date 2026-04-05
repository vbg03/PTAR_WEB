export const LLAVE_CONFIGURACION_VISUAL = 'ptar-config-visual'
export const MODO_TEMA_ESTANDAR = 'estandar'
export const MODO_TEMA_ALTO_CONTRASTE = 'alto-contraste'

export const CAMPOS_PERSONALIZABLES_VISUALES = Object.freeze([
  { clave: 'fondo', etiqueta: 'Fondo general' },
  { clave: 'fondoEscena', etiqueta: 'Fondo de escenas' },
  { clave: 'superficie', etiqueta: 'Paneles y tarjetas' },
  { clave: 'primario', etiqueta: 'Botones y resaltes' },
  { clave: 'secundario', etiqueta: 'Color de apoyo' },
  { clave: 'texto', etiqueta: 'Texto principal' },
  { clave: 'graficoGrasas', etiqueta: 'Grafico grasas' },
  { clave: 'graficoAceites', etiqueta: 'Grafico aceites' },
  { clave: 'graficoDbo', etiqueta: 'Grafico DBO' },
  { clave: 'graficoDqo', etiqueta: 'Grafico DQO' }
])

const PALETAS_BASE = Object.freeze({
  [MODO_TEMA_ESTANDAR]: Object.freeze({
    fondo: '#ececec',
    fondoEscena: '#2f251c',
    superficie: '#fbf5ec',
    primario: '#da1e25',
    secundario: '#78001b',
    texto: '#1d1616',
    graficoGrasas: '#e7be2d',
    graficoAceites: '#2dd17f',
    graficoDbo: '#2dd17f',
    graficoDqo: '#e7be2d'
  }),
  [MODO_TEMA_ALTO_CONTRASTE]: Object.freeze({
    fondo: '#050505',
    fondoEscena: '#000000',
    superficie: '#111111',
    primario: '#ffd400',
    secundario: '#00c2ff',
    texto: '#f5f7fa',
    graficoGrasas: '#ffd400',
    graficoAceites: '#00ff85',
    graficoDbo: '#ff7a00',
    graficoDqo: '#00c2ff'
  })
})

const CLAVES_PERSONALIZABLES = CAMPOS_PERSONALIZABLES_VISUALES.map(
  ({ clave }) => clave
)

function normalizarModoTema(modo) {
  return modo === MODO_TEMA_ALTO_CONTRASTE
    ? MODO_TEMA_ALTO_CONTRASTE
    : MODO_TEMA_ESTANDAR
}

function clonarPaletaBase(modo) {
  return { ...PALETAS_BASE[modo] }
}

function esColorHexValido(valor) {
  return typeof valor === 'string' && /^#[0-9a-fA-F]{6}$/.test(valor.trim())
}

export function normalizarColorHex(valor, valorDefecto) {
  return esColorHexValido(valor) ? valor.trim().toLowerCase() : valorDefecto
}

function hexARgb(colorHex) {
  const colorNormalizado = normalizarColorHex(colorHex, '#000000').slice(1)

  return {
    r: Number.parseInt(colorNormalizado.slice(0, 2), 16),
    g: Number.parseInt(colorNormalizado.slice(2, 4), 16),
    b: Number.parseInt(colorNormalizado.slice(4, 6), 16)
  }
}

function rgbAHex({ r, g, b }) {
  const aHex = (valor) =>
    Math.max(0, Math.min(255, Math.round(valor))).toString(16).padStart(2, '0')

  return `#${aHex(r)}${aHex(g)}${aHex(b)}`
}

function mezclarColores(colorA, colorB, proporcionColorB = 0.5) {
  const origen = hexARgb(colorA)
  const destino = hexARgb(colorB)
  const proporcion = Math.max(0, Math.min(1, Number(proporcionColorB) || 0))

  return rgbAHex({
    r: origen.r + (destino.r - origen.r) * proporcion,
    g: origen.g + (destino.g - origen.g) * proporcion,
    b: origen.b + (destino.b - origen.b) * proporcion
  })
}

function aclararColor(colorHex, intensidad = 0.14) {
  return mezclarColores(colorHex, '#ffffff', intensidad)
}

function oscurecerColor(colorHex, intensidad = 0.14) {
  return mezclarColores(colorHex, '#000000', intensidad)
}

function colorConAlpha(colorHex, alpha = 1) {
  const { r, g, b } = hexARgb(colorHex)
  const opacidad = Math.max(0, Math.min(1, Number(alpha) || 0))
  return `rgba(${r}, ${g}, ${b}, ${opacidad})`
}

function obtenerLuminancia(colorHex) {
  const { r, g, b } = hexARgb(colorHex)
  return (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255
}

function obtenerColorContraste(colorHex) {
  return obtenerLuminancia(colorHex) >= 0.62 ? '#101010' : '#ffffff'
}

function normalizarPaleta(modo, paletaEntrada) {
  const paletaBase = PALETAS_BASE[modo]
  const paletaNormalizada = {}

  CLAVES_PERSONALIZABLES.forEach((clave) => {
    paletaNormalizada[clave] = normalizarColorHex(
      paletaEntrada?.[clave],
      paletaBase[clave]
    )
  })

  return paletaNormalizada
}

export function crearConfiguracionVisualBase(
  modoActivo = MODO_TEMA_ESTANDAR
) {
  const modoNormalizado = normalizarModoTema(modoActivo)

  return {
    modoActivo: modoNormalizado,
    paletas: {
      [MODO_TEMA_ESTANDAR]: clonarPaletaBase(MODO_TEMA_ESTANDAR),
      [MODO_TEMA_ALTO_CONTRASTE]: clonarPaletaBase(MODO_TEMA_ALTO_CONTRASTE)
    }
  }
}

export function normalizarConfiguracionVisual(configuracion) {
  const configuracionBase = crearConfiguracionVisualBase(
    configuracion?.modoActivo
  )
  const paletasEntrada = configuracion?.paletas ?? {}

  return {
    modoActivo: configuracionBase.modoActivo,
    paletas: {
      [MODO_TEMA_ESTANDAR]: normalizarPaleta(
        MODO_TEMA_ESTANDAR,
        paletasEntrada[MODO_TEMA_ESTANDAR]
      ),
      [MODO_TEMA_ALTO_CONTRASTE]: normalizarPaleta(
        MODO_TEMA_ALTO_CONTRASTE,
        paletasEntrada[MODO_TEMA_ALTO_CONTRASTE]
      )
    }
  }
}

export function leerConfiguracionVisualGuardada() {
  if (typeof window === 'undefined') {
    return crearConfiguracionVisualBase()
  }

  const valorCrudo = window.localStorage.getItem(LLAVE_CONFIGURACION_VISUAL)
  if (!valorCrudo) {
    return crearConfiguracionVisualBase()
  }

  try {
    return normalizarConfiguracionVisual(JSON.parse(valorCrudo))
  } catch {
    return crearConfiguracionVisualBase()
  }
}

export function guardarConfiguracionVisual(configuracion) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    LLAVE_CONFIGURACION_VISUAL,
    JSON.stringify(normalizarConfiguracionVisual(configuracion))
  )
}

export function obtenerPaletaActiva(configuracion) {
  const configuracionNormalizada = normalizarConfiguracionVisual(configuracion)
  return {
    ...configuracionNormalizada.paletas[configuracionNormalizada.modoActivo]
  }
}

export function cambiarModoConfiguracionVisual(configuracion, modoActivo) {
  const configuracionNormalizada = normalizarConfiguracionVisual(configuracion)

  return {
    ...configuracionNormalizada,
    modoActivo: normalizarModoTema(modoActivo)
  }
}

export function actualizarColorConfiguracionVisual(
  configuracion,
  clave,
  valor
) {
  if (!CLAVES_PERSONALIZABLES.includes(clave)) {
    return normalizarConfiguracionVisual(configuracion)
  }

  const configuracionNormalizada = normalizarConfiguracionVisual(configuracion)
  const modoActivo = configuracionNormalizada.modoActivo
  const paletaActiva = configuracionNormalizada.paletas[modoActivo]

  return {
    ...configuracionNormalizada,
    paletas: {
      ...configuracionNormalizada.paletas,
      [modoActivo]: {
        ...paletaActiva,
        [clave]: normalizarColorHex(valor, paletaActiva[clave])
      }
    }
  }
}

export function restablecerPaletaActiva(configuracion) {
  const configuracionNormalizada = normalizarConfiguracionVisual(configuracion)
  const modoActivo = configuracionNormalizada.modoActivo

  return {
    ...configuracionNormalizada,
    paletas: {
      ...configuracionNormalizada.paletas,
      [modoActivo]: clonarPaletaBase(modoActivo)
    }
  }
}

export function sonConfiguracionesVisualesIguales(
  configuracionA,
  configuracionB
) {
  return (
    JSON.stringify(normalizarConfiguracionVisual(configuracionA)) ===
    JSON.stringify(normalizarConfiguracionVisual(configuracionB))
  )
}

export function construirVariablesCssTema(configuracion) {
  const configuracionNormalizada = normalizarConfiguracionVisual(configuracion)
  const esAltoContraste =
    configuracionNormalizada.modoActivo === MODO_TEMA_ALTO_CONTRASTE
  const paleta = configuracionNormalizada.paletas[configuracionNormalizada.modoActivo]
  const colorSuperficieElevada = aclararColor(
    paleta.superficie,
    esAltoContraste ? 0.06 : 0.03
  )
  const colorPrimarioActivo = esAltoContraste
    ? paleta.primario
    : aclararColor(paleta.primario, 0.08)
  const colorBordeSuperficie = esAltoContraste
    ? aclararColor(paleta.superficie, 0.32)
    : oscurecerColor(paleta.superficie, 0.16)
  const colorTextoSobreSuperficie = obtenerColorContraste(paleta.superficie)
  const colorTextoSobrePrimario = obtenerColorContraste(colorPrimarioActivo)
  const colorTextoSobreSecundario = obtenerColorContraste(paleta.secundario)
  const colorPanelOscuro = esAltoContraste
    ? '#000000'
    : colorConAlpha(paleta.fondoEscena, 0.78)
  const colorPistaGrafico = esAltoContraste
    ? aclararColor(paleta.fondoEscena, 0.18)
    : mezclarColores(paleta.superficie, '#000000', 0.18)

  return {
    '--ptar-color-app-bg': paleta.fondo,
    '--ptar-color-app-grid': colorConAlpha(
      esAltoContraste ? paleta.texto : paleta.secundario,
      esAltoContraste ? 0.16 : 0.14
    ),
    '--ptar-color-station-bg': paleta.fondoEscena,
    '--ptar-color-surface': paleta.superficie,
    '--ptar-color-surface-elevated': colorSuperficieElevada,
    '--ptar-color-text': paleta.texto,
    '--ptar-color-text-soft': colorConAlpha(
      paleta.texto,
      esAltoContraste ? 0.86 : 0.76
    ),
    '--ptar-color-text-muted': colorConAlpha(
      paleta.texto,
      esAltoContraste ? 0.72 : 0.62
    ),
    '--ptar-color-on-surface': colorTextoSobreSuperficie,
    '--ptar-color-primary': colorPrimarioActivo,
    '--ptar-color-primary-hover': oscurecerColor(colorPrimarioActivo, 0.14),
    '--ptar-color-on-primary': colorTextoSobrePrimario,
    '--ptar-color-secondary': paleta.secundario,
    '--ptar-color-secondary-hover': oscurecerColor(paleta.secundario, 0.16),
    '--ptar-color-on-secondary': colorTextoSobreSecundario,
    '--ptar-color-border': colorBordeSuperficie,
    '--ptar-color-focus': aclararColor(paleta.primario, esAltoContraste ? 0.16 : 0.12),
    '--ptar-color-overlay': colorConAlpha(paleta.texto, esAltoContraste ? 0.78 : 0.58),
    '--ptar-color-panel-dark': colorPanelOscuro,
    '--ptar-color-on-dark': obtenerColorContraste(paleta.fondoEscena),
    '--ptar-color-bubble-left-bg': paleta.superficie,
    '--ptar-color-bubble-left-border': colorBordeSuperficie,
    '--ptar-color-bubble-left-text': colorTextoSobreSuperficie,
    '--ptar-color-bubble-right-bg': colorPrimarioActivo,
    '--ptar-color-bubble-right-text': colorTextoSobrePrimario,
    '--ptar-color-hint': esAltoContraste
      ? paleta.texto
      : aclararColor(paleta.superficie, 0.02),
    '--ptar-color-chart-track': colorPistaGrafico,
    '--ptar-color-chart-grasas': paleta.graficoGrasas,
    '--ptar-color-chart-aceites': paleta.graficoAceites,
    '--ptar-color-chart-dbo': paleta.graficoDbo,
    '--ptar-color-chart-dqo': paleta.graficoDqo,
    '--ptar-color-transition-light': esAltoContraste
      ? paleta.texto
      : colorSuperficieElevada,
    '--ptar-color-transition-neutral': esAltoContraste
      ? aclararColor(paleta.superficie, 0.18)
      : '#e8e8e8',
    '--ptar-scene-filter': esAltoContraste
      ? 'saturate(0.85) contrast(1.18)'
      : 'none',
    '--ptar-asset-filter': esAltoContraste
      ? 'contrast(1.16) saturate(1.04) drop-shadow(0 0 12px rgba(255, 255, 255, 0.2))'
      : 'none'
  }
}
