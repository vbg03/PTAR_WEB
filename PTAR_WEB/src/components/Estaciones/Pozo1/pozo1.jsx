import { useCallback, useEffect, useRef, useState } from 'react'
import './pozo1.css'

const DURACION_TRANSICION_REGRESO = 1180
const DURACION_BLOQUEO_SCROLL = 340
const VALOR_MIN_CAMARA = -120
const VALOR_MAX_CAMARA = 220
const ZOOM_MIN_CAMARA = 0.2
const ZOOM_MAX_CAMARA = 12

const RESIDUOS_POZO = [
  { id: 'pozo-1', src: '/images/pozo1/papel.png', x: 45, y: 67, escala: 0.62, rotacion: -18 },
  { id: 'pozo-2', src: '/images/pozo1/basura5.png', x: 50, y: 72, escala: 0.66, rotacion: 10 },
  { id: 'pozo-3', src: '/images/pozo1/basura4.png', x: 60, y: 78, escala: 1, rotacion: -12 },
  { id: 'pozo-4', src: '/images/pozo1/basura2.png', x: 40, y: 68, escala: 0.65, rotacion: 8 },
  { id: 'pozo-5', src: '/images/pozo1/basura3.png', x: 46, y: 82, escala: 0.8, rotacion: -14 },
  { id: 'pozo-6', src: '/images/pozo1/basura.png', x: 39, y: 79, escala: 0.52, rotacion: 16 }
]

const PASOS_RECORRIDO = [
  {
    camaraX: 0,
    camaraY: 22.8,
    zoom: 10,
    gota: { x: 30, y: 46, escala: 1.24 },
    papel: { x: 69, y: 46, escala: 2.5, rotacion: -10 },
    mostrarBasurasPozo: false,
    burbujaDerecha:
      'Todo empieza por lo que tiramos por el sanitario, lavamanos y desagues; luego viaja por tuberias subterraneas hasta llegar al pozo 1.'
  },
  {
    camaraX: 10,
    camaraY: 22.8,
    zoom: 10,
    gota: { x: 50, y: 46, escala: 1.24 },
    papel: { x: 17, y: 46, escala: 2, rotacion: 8 },
    mostrarBasurasPozo: false,
    burbujaIzquierda: '¿Aqui comienza a limpiarse?'
  },
  {
    camaraX: 20,
    camaraY: 22.8,
    zoom: 10,
    gota: { x: 66, y: 46, escala: 1.08 },
    papel: { x: 29, y: 46, escala: 2, rotacion: 6 },
    mostrarBasurasPozo: false,
    mostrarFlecha: false,
    burbujaDerecha:
      'Este es el primer filtro. Dentro del pozo se atrapan cosas grandes: trapos, bolsas, papel, toallas higiénicas, lo que la gente no debería botar.'
  },
  {
    camaraX: 23,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 17, y: 47.5, escala: 0.52 },
    papel: { x: 5, y: 48, escala: 0.9, rotacion: 6 },
    mostrarBasurasPozo: true,
    burbujaDerecha:
      'Tiene aproximadamente un metro treinta de diámetro y casi metro y medio de altura. Dentro del pozo hay dos bombas sumergibles muy especiales.'
  },
  {
    camaraX: 23,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 35, y: 47.9, escala: 0.4 },
    mostrarBasurasPozo: true,
    burbujaDerecha:
      'Estas bombas son inatascables y tienen unas cuchillas en la parte inferior que trituran los sólidos grandes que llegan con el agua.'
  },
  {
    camaraX: 23,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 54, y: 80, escala: 0.4 },
    mostrarBasurasPozo: true,
    burbujaDerecha:
      'Es como una licuadora industrial que desmenuza todo para que pueda ser bombeado hacia arriba sin tapar las tuberías.'
  },
  {
    camaraX: 23,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 54, y: 80, escala: 0.4 },
    mostrarBasurasPozo: true,
    burbujaDerecha:
      'Cuando sube el nivel del agua en el pozo, las bombas se activan de forma automatica.'
  },
  {
    camaraX: 23,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 54, y: 80, escala: 0.4 },
    mostrarBasurasPozo: true,
    burbujaIzquierda: '¿Y que pasa con los residuos que no se pueden triturar facilmente?'
  },
  {
    camaraX: 23,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 54, y: 80, escala: 0.4 },
    mostrarBasurasPozo: true,
    burbujaDerecha:
      'Esos residuos no organicos se retiran manualmente porque no deberian estar en la red sanitaria.'
  },
  {
    camaraX: 23,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 54, y: 80, escala: 0.4 },
    mostrarBasurasPozo: true,
    burbujaDerecha: 'Para retirarlos arrastra los solidos fuera del pozo.'
  },
  {
    camaraX: 23,
    camaraY: 17.5,
    zoom: 3.96,
    gota: { x: 54, y: 80, escala: 0.4 },
    mostrarBasurasPozo: false,
    burbujaDerecha: 'Perfecto. Ahora continuamos con el pretratamiento.'
  },
  {
    camaraX: 57,
    camaraY: 44,
    zoom: 1.62,
    gota: { x: 86, y: 45, escala: 0.4 },
    mostrarBasurasPozo: false,
  }
]

function construirEstiloPosicion(posicion) {
  return {
    left: `${posicion.x}%`,
    top: `${posicion.y}%`,
    '--res-escala': `${posicion.escala ?? 1}`,
    '--res-rotacion': `${posicion.rotacion ?? 0}deg`
  }
}

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo)
}

function redondear(valor) {
  return Number(valor.toFixed(2))
}

function Pozo1({ onVolverAUbicacion }) {
  const [pasoActual, setPasoActual] = useState(0)
  const [mostrarTransicionRegreso, setMostrarTransicionRegreso] = useState(false)
  const [debugCamaraActiva, setDebugCamaraActiva] = useState(import.meta.env.DEV)
  const [debugCopiado, setDebugCopiado] = useState(false)
  const [debugCamarasPorPaso, setDebugCamarasPorPaso] = useState({})
  const bloqueoScrollRef = useRef(false)
  const transicionRegresoRef = useRef(false)
  const timeoutRegresoRef = useRef(null)
  const timeoutBloqueoRef = useRef(null)
  const timeoutDebugCopiadoRef = useRef(null)

  const obtenerCamaraActivaPaso = useCallback(
    (pasoIndice = pasoActual) => {
      const pasoBase = PASOS_RECORRIDO[pasoIndice]
      const override = debugCamarasPorPaso[pasoIndice]

      if (!override) {
        return {
          camaraX: pasoBase.camaraX,
          camaraY: pasoBase.camaraY,
          zoom: pasoBase.zoom
        }
      }

      return override
    },
    [pasoActual, debugCamarasPorPaso]
  )

  const ajustarCamaraPasoActual = useCallback(
    (actualizarCamara) => {
      setDebugCamarasPorPaso((estadoAnterior) => {
        const camaraBase =
          estadoAnterior[pasoActual] ??
          (() => {
            const pasoBase = PASOS_RECORRIDO[pasoActual]
            return {
              camaraX: pasoBase.camaraX,
              camaraY: pasoBase.camaraY,
              zoom: pasoBase.zoom
            }
          })()

        const camaraNueva = actualizarCamara(camaraBase)
        return { ...estadoAnterior, [pasoActual]: camaraNueva }
      })
    },
    [pasoActual]
  )

  const reiniciarCamaraPasoActual = useCallback(() => {
    setDebugCamarasPorPaso((estadoAnterior) => {
      if (!estadoAnterior[pasoActual]) {
        return estadoAnterior
      }

      const nuevoEstado = { ...estadoAnterior }
      delete nuevoEstado[pasoActual]
      return nuevoEstado
    })
  }, [pasoActual])

  const copiarCamaraPasoActual = useCallback(async () => {
    const camara = obtenerCamaraActivaPaso()
    const bloque = `camaraX: ${redondear(camara.camaraX)},\ncamaraY: ${redondear(
      camara.camaraY
    )},\nzoom: ${redondear(camara.zoom)}`

    const copiarConAreaTexto = () => {
      const areaTexto = document.createElement('textarea')
      areaTexto.value = bloque
      document.body.appendChild(areaTexto)
      areaTexto.select()
      document.execCommand('copy')
      document.body.removeChild(areaTexto)
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(bloque)
      } else {
        copiarConAreaTexto()
      }
    } catch {
      copiarConAreaTexto()
    }

    setDebugCopiado(true)
    if (timeoutDebugCopiadoRef.current) {
      window.clearTimeout(timeoutDebugCopiadoRef.current)
    }
    timeoutDebugCopiadoRef.current = window.setTimeout(() => {
      setDebugCopiado(false)
    }, 1200)
  }, [obtenerCamaraActivaPaso])

  const iniciarTransicionRegreso = useCallback(() => {
    if (transicionRegresoRef.current) {
      return
    }

    transicionRegresoRef.current = true
    bloqueoScrollRef.current = true
    setMostrarTransicionRegreso(true)

    timeoutRegresoRef.current = window.setTimeout(() => {
      if (typeof onVolverAUbicacion === 'function') {
        onVolverAUbicacion()
      }
    }, DURACION_TRANSICION_REGRESO)
  }, [onVolverAUbicacion])

  useEffect(() => {
    return () => {
      if (timeoutRegresoRef.current) {
        window.clearTimeout(timeoutRegresoRef.current)
      }
      if (timeoutBloqueoRef.current) {
        window.clearTimeout(timeoutBloqueoRef.current)
      }
      if (timeoutDebugCopiadoRef.current) {
        window.clearTimeout(timeoutDebugCopiadoRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const manejarRueda = (event) => {
      if (bloqueoScrollRef.current || transicionRegresoRef.current || event.deltaY === 0) {
        return
      }

      bloqueoScrollRef.current = true

      if (event.deltaY > 0) {
        setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
      } else if (pasoActual > 0) {
        setPasoActual((pasoAnterior) => Math.max(pasoAnterior - 1, 0))
      } else {
        iniciarTransicionRegreso()
      }

      if (timeoutBloqueoRef.current) {
        window.clearTimeout(timeoutBloqueoRef.current)
      }

      timeoutBloqueoRef.current = window.setTimeout(() => {
        if (!transicionRegresoRef.current) {
          bloqueoScrollRef.current = false
        }
      }, DURACION_BLOQUEO_SCROLL)
    }

    window.addEventListener('wheel', manejarRueda, { passive: true })

    return () => {
      window.removeEventListener('wheel', manejarRueda)
    }
  }, [pasoActual, iniciarTransicionRegreso])

  useEffect(() => {
    const manejarTecladoDebug = (event) => {
      if (event.key === 'F8') {
        event.preventDefault()
        setDebugCamaraActiva((estadoAnterior) => !estadoAnterior)
        return
      }

      if (!debugCamaraActiva) {
        return
      }

      const pasoMovimiento = event.shiftKey ? 2 : event.altKey ? 0.1 : 0.5
      const pasoZoom = event.shiftKey ? 0.1 : event.altKey ? 0.01 : 0.03

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        ajustarCamaraPasoActual((camara) => ({
          ...camara,
          camaraX: limitar(camara.camaraX - pasoMovimiento, VALOR_MIN_CAMARA, VALOR_MAX_CAMARA)
        }))
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        ajustarCamaraPasoActual((camara) => ({
          ...camara,
          camaraX: limitar(camara.camaraX + pasoMovimiento, VALOR_MIN_CAMARA, VALOR_MAX_CAMARA)
        }))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        ajustarCamaraPasoActual((camara) => ({
          ...camara,
          camaraY: limitar(camara.camaraY - pasoMovimiento, VALOR_MIN_CAMARA, VALOR_MAX_CAMARA)
        }))
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        ajustarCamaraPasoActual((camara) => ({
          ...camara,
          camaraY: limitar(camara.camaraY + pasoMovimiento, VALOR_MIN_CAMARA, VALOR_MAX_CAMARA)
        }))
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        ajustarCamaraPasoActual((camara) => ({
          ...camara,
          zoom: limitar(camara.zoom + pasoZoom, ZOOM_MIN_CAMARA, ZOOM_MAX_CAMARA)
        }))
      } else if (event.key === '-') {
        event.preventDefault()
        ajustarCamaraPasoActual((camara) => ({
          ...camara,
          zoom: limitar(camara.zoom - pasoZoom, ZOOM_MIN_CAMARA, ZOOM_MAX_CAMARA)
        }))
      } else if (event.key.toLowerCase() === 'r') {
        event.preventDefault()
        reiniciarCamaraPasoActual()
      } else if (event.key.toLowerCase() === 'c') {
        event.preventDefault()
        void copiarCamaraPasoActual()
      }
    }

    window.addEventListener('keydown', manejarTecladoDebug)
    return () => {
      window.removeEventListener('keydown', manejarTecladoDebug)
    }
  }, [
    debugCamaraActiva,
    ajustarCamaraPasoActual,
    reiniciarCamaraPasoActual,
    copiarCamaraPasoActual
  ])

  const paso = PASOS_RECORRIDO[pasoActual]
  const camaraActiva = obtenerCamaraActivaPaso()
  const estiloPanel = {
    '--cam-x': `${camaraActiva.camaraX}%`,
    '--cam-y': `${camaraActiva.camaraY}%`,
    '--cam-zoom': `${camaraActiva.zoom}`
  }
  const estiloGota = {
    left: `${paso.gota.x}%`,
    top: `${paso.gota.y}%`,
    '--gota-escala': `${paso.gota.escala}`
  }

  return (
    <main className={`ptar-pozo1 ${mostrarTransicionRegreso ? 'is-regresando' : ''}`}>
      <section
        className={`ptar-pozo1__panel ${mostrarTransicionRegreso ? 'is-regresando' : ''}`}
        style={estiloPanel}
        aria-label="Estacion Pozo 1"
      >
        <div className="ptar-pozo1__escena" aria-hidden="true" />
        <div className="ptar-pozo1__capa-escena" aria-hidden="true" />

        {paso.mostrarFlecha ? <span className="ptar-pozo1__flecha-entrada" aria-hidden="true" /> : null}

        {paso.papel ? (
          <img
            className="ptar-pozo1__residuo"
            src="/images/pozo1/papel.png"
            alt=""
            aria-hidden="true"
            style={construirEstiloPosicion(paso.papel)}
          />
        ) : null}

        {paso.basuraTuberia ? (
          <img
            className="ptar-pozo1__residuo"
            src={paso.basuraTuberia.src}
            alt=""
            aria-hidden="true"
            style={construirEstiloPosicion(paso.basuraTuberia)}
          />
        ) : null}

        {paso.mostrarBasurasPozo
          ? RESIDUOS_POZO.map((residuo, indice) => (
            <img
              key={residuo.id}
              className="ptar-pozo1__residuo ptar-pozo1__residuo--pozo"
              src={residuo.src}
              alt=""
              aria-hidden="true"
              style={{
                ...construirEstiloPosicion(residuo),
                '--res-delay': `${indice * -0.45}s`
              }}
            />
          ))
          : null}

        <img
          className="ptar-pozo1__gota"
          src="/svg/gota.svg"
          alt="Particula de agua"
          style={estiloGota}
        />

        <img
          className="ptar-pozo1__avatar ptar-pozo1__avatar--izquierda"
          src="/images/Estudiante%20blanco.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="ptar-pozo1__avatar ptar-pozo1__avatar--derecha"
          src="/images/Estudiante%20rojo.png"
          alt=""
          aria-hidden="true"
        />

        {paso.burbujaIzquierda ? (
          <aside
            key={`izquierda-${pasoActual}`}
            className="ptar-pozo1__burbuja ptar-pozo1__burbuja--izquierda ptar-pozo1__burbuja--blanca"
          >
            {paso.burbujaIzquierda}
          </aside>
        ) : null}

        {paso.burbujaDerecha ? (
          <aside
            key={`derecha-${pasoActual}`}
            className="ptar-pozo1__burbuja ptar-pozo1__burbuja--derecha ptar-pozo1__burbuja--roja"
          >
            {paso.burbujaDerecha}
          </aside>
        ) : null}

        {pasoActual <= 1 ? (
          <p className="ptar-pozo1__hint" aria-live="polite">
            Mueve la gota de agua con la rueda del raton
          </p>
        ) : null}

        <p className="ptar-pozo1__paso" aria-hidden="true">
          Paso {pasoActual + 1} de {PASOS_RECORRIDO.length}
        </p>

        {debugCamaraActiva ? (
          <aside className="ptar-pozo1__debug-camara" role="status" aria-live="polite">
            <p className="ptar-pozo1__debug-titulo">Debug camara (paso {pasoActual + 1})</p>
            <p className="ptar-pozo1__debug-linea">
              X: {redondear(camaraActiva.camaraX)} | Y: {redondear(camaraActiva.camaraY)} | Zoom:{' '}
              {redondear(camaraActiva.zoom)}
            </p>
            <p className="ptar-pozo1__debug-linea">
              Flechas: mover | +/-: zoom | C: copiar | R: reset paso | F8: ocultar
            </p>
            <div className="ptar-pozo1__debug-botones">
              <button
                type="button"
                className="ptar-pozo1__debug-boton"
                onClick={() => {
                  void copiarCamaraPasoActual()
                }}
              >
                {debugCopiado ? 'Copiado' : 'Copiar camara'}
              </button>
              <button
                type="button"
                className="ptar-pozo1__debug-boton ptar-pozo1__debug-boton--secundario"
                onClick={reiniciarCamaraPasoActual}
              >
                Reset paso
              </button>
            </div>
          </aside>
        ) : null}

        {mostrarTransicionRegreso ? (
          <div className="ptar-pozo1__transicion-regreso" aria-hidden="true">
            <span className="ptar-pozo1__transicion-capa" />
            <span className="ptar-pozo1__transicion-destello" />
            <span className="ptar-pozo1__transicion-franja ptar-pozo1__transicion-franja--roja" />
            <span className="ptar-pozo1__transicion-franja ptar-pozo1__transicion-franja--vinotinto" />
            <span className="ptar-pozo1__transicion-franja ptar-pozo1__transicion-franja--crema" />
            <span className="ptar-pozo1__transicion-franja ptar-pozo1__transicion-franja--gris" />
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default Pozo1
