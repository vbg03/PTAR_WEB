const PREFIJOS_POR_COLOR = {
  blanco: 'Bella',
  rojo: 'Jessica'
}

const VOCES_POR_SECCION = {
  informacion: {
    carpeta: 'inicio',
    token: 'Informacion',
    maximos: { blanco: 3, rojo: 4 }
  },
  pozo1: {
    carpeta: 'Pozo 1',
    token: 'Pozo1',
    maximos: { blanco: 2, rojo: 9 }
  },
  pretratamiento: {
    carpeta: 'Pretratamiento',
    token: 'Pretratamiento',
    maximos: { blanco: 5, rojo: 15 }
  },
  areacion: {
    carpeta: 'Aireacion',
    token: 'Aireacion',
    maximos: { blanco: 2, rojo: 10 }
  },
  sedimentador: {
    carpeta: 'Sedimentador',
    token: 'Sedimentador',
    maximos: { blanco: 6, rojo: 8 }
  },
  lechos: {
    carpeta: 'Lechos',
    token: 'Lechos',
    maximos: { blanco: 5, rojo: 7 }
  },
  tamizaje: {
    carpeta: 'Tamizaje',
    token: 'Tamizaje',
    maximos: { blanco: 1, rojo: 5 }
  },
  filtro: {
    carpeta: 'Filtro',
    token: 'Filtro',
    maximos: { blanco: 5, rojo: 9 }
  },
  desinfeccion: {
    carpeta: 'Desinfección',
    token: 'Desinfeccion',
    maximos: { blanco: 3, rojo: 6 }
  },
  almacenamiento: {
    carpeta: 'Almacenamiento',
    token: 'Almacenamiento',
    maximos: { blanco: 5, rojo: 5 }
  },
  pozo2: {
    carpeta: 'Pozo 2',
    token: 'Pozo2',
    maximos: { blanco: 4, rojo: 5 }
  },
  usos: {
    carpeta: 'Usos',
    token: 'Usos',
    maximos: { blanco: 3, rojo: 7 }
  }
}

function codificarSegmento(segmento) {
  return encodeURIComponent(segmento)
}

export function construirRutaVoz({ seccion, color, indice }) {
  if (!seccion || !color || !Number.isInteger(indice) || indice <= 0) {
    return null
  }

  const metadataSeccion = VOCES_POR_SECCION[seccion]
  const prefijo = PREFIJOS_POR_COLOR[color]
  if (!metadataSeccion || !prefijo) {
    return null
  }

  const maximo = metadataSeccion.maximos?.[color]
  if (typeof maximo === 'number' && indice > maximo) {
    return null
  }

  const numero = String(indice).padStart(3, '0')
  const nombreArchivo = `${prefijo}_${metadataSeccion.token}_${numero}.mp3`

  return [
    '',
    'voces',
    color,
    codificarSegmento(metadataSeccion.carpeta),
    codificarSegmento(nombreArchivo)
  ].join('/')
}

export function construirIndicesAudioPorPaso(pasos, campoBurbuja) {
  if (!Array.isArray(pasos) || !campoBurbuja) {
    return []
  }

  let contador = 0
  let textoAnterior = null

  return pasos.map((paso) => {
    const textoActual = paso?.[campoBurbuja]
    if (!textoActual) {
      textoAnterior = null
      return null
    }

    if (textoActual === textoAnterior) {
      return contador
    }

    contador += 1
    textoAnterior = textoActual
    return contador
  })
}
