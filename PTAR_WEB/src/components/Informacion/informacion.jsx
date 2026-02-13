import { useEffect, useRef, useState } from 'react'
import './informacion.css'

function Informacion() {
  const [mostrarPtar, setMostrarPtar] = useState(false)
  const bloqueoScrollRef = useRef(false)

  useEffect(() => {
    const manejarRueda = (event) => {
      if (bloqueoScrollRef.current) {
        return
      }

      if (event.deltaY > 0 && !mostrarPtar) {
        bloqueoScrollRef.current = true
        setMostrarPtar(true)
        window.setTimeout(() => {
          bloqueoScrollRef.current = false
        }, 520)
      }

      if (event.deltaY < 0 && mostrarPtar) {
        bloqueoScrollRef.current = true
        setMostrarPtar(false)
        window.setTimeout(() => {
          bloqueoScrollRef.current = false
        }, 520)
      }
    }

    window.addEventListener('wheel', manejarRueda, { passive: true })

    return () => {
      window.removeEventListener('wheel', manejarRueda)
    }
  }, [mostrarPtar])

  return (
    <main className="ptar-info">
      <section className="ptar-info__bienvenida">
        <img
          className="ptar-info__personaje ptar-info__personaje--izquierda"
          src="/images/estudianteNormal.png"
          alt="Estudiante"
        />

        <div className="ptar-info__titulos">
          <h2
            className={`ptar-info__titulo ${
              mostrarPtar ? 'is-hidden-left' : 'is-visible'
            }`}
          >
            ¡BIENVENIDO!
          </h2>
          <h2
            className={`ptar-info__titulo ${
              mostrarPtar ? 'is-visible' : 'is-hidden-right'
            }`}
          >
            ¿PTAR?
          </h2>
        </div>

        <img
          className="ptar-info__personaje ptar-info__personaje--derecha"
          src="/images/estudianteAmbiental.png"
          alt="Guía ambiental"
        />
      </section>
    </main>
  )
}

export default Informacion