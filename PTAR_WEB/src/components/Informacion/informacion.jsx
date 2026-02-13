import { useEffect, useRef, useState } from 'react'
import './informacion.css'

function Informacion() {
  const [mostrarPtar, setMostrarPtar] = useState(false)
  const [textoSaliendo, setTextoSaliendo] = useState(false)
  const timeoutCambioTextoRef = useRef(null)

  useEffect(() => {
    const manejarRueda = (event) => {
      if (textoSaliendo) {
        return
      }

      if (event.deltaY > 0 && !mostrarPtar) {
        setTextoSaliendo(true)

        timeoutCambioTextoRef.current = window.setTimeout(() => {
          setMostrarPtar(true)
          setTextoSaliendo(false)
        }, 420)
      }

      if (event.deltaY < 0 && mostrarPtar) {
        setTextoSaliendo(true)

        timeoutCambioTextoRef.current = window.setTimeout(() => {
          setMostrarPtar(false)
          setTextoSaliendo(false)
        }, 420)
      }
    }

    window.addEventListener('wheel', manejarRueda, { passive: true })

    return () => {
      window.removeEventListener('wheel', manejarRueda)
      if (timeoutCambioTextoRef.current) {
        window.clearTimeout(timeoutCambioTextoRef.current)
      }
    }
  }, [mostrarPtar, textoSaliendo])

  return (
    <main className="ptar-info">
      <section className="ptar-info__bienvenida">
        <img
          className="ptar-info__personaje ptar-info__personaje--izquierda"
          src="/images/estudianteNormal.png"
          alt="Estudiante"
        />
        <h2
          key={mostrarPtar ? 'texto-ptar' : 'texto-bienvenido'}
          className={`ptar-info__titulo ${textoSaliendo ? 'is-exiting' : ''}`}
        >
          {mostrarPtar ? '¿PTAR?' : '¡BIENVENIDO!'}
        </h2>
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