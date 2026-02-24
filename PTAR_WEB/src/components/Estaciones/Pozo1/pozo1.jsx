import { useCallback, useEffect, useRef, useState } from 'react'
import './pozo1.css'

const DURACION_TRANSICION_REGRESO = 1180

function Pozo1({ onVolverAUbicacion }) {
  const [mostrarTransicionRegreso, setMostrarTransicionRegreso] = useState(false)
  const bloqueoScrollRef = useRef(false)
  const transicionRegresoRef = useRef(false)
  const timeoutRegresoRef = useRef(null)

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
    }
  }, [])

  useEffect(() => {
    const manejarRueda = (event) => {
      if (bloqueoScrollRef.current || transicionRegresoRef.current || event.deltaY >= 0) {
        return
      }

      iniciarTransicionRegreso()
    }

    window.addEventListener('wheel', manejarRueda, { passive: true })

    return () => {
      window.removeEventListener('wheel', manejarRueda)
    }
  }, [iniciarTransicionRegreso])

  return (
    <main className={`ptar-pozo1 ${mostrarTransicionRegreso ? 'is-regresando' : ''}`}>
      <section
        className={`ptar-pozo1__panel ${mostrarTransicionRegreso ? 'is-regresando' : ''}`}
        aria-label="Estacion Pozo 1"
      >
        <p className="ptar-pozo1__etiqueta">Estacion 1</p>
        <h1>Pozo 1</h1>
        <p>
          Aqui comienza el recorrido por las estaciones de la PTAR. En este pozo se
          recibe el agua residual y se controla su bombeo para iniciar el tratamiento.
        </p>
      </section>

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
    </main>
  )
}

export default Pozo1
