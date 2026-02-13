import { useState } from 'react'
import './inicio.css'

function Inicio() {
  const [recorridoIniciado, setRecorridoIniciado] = useState(false)

  const iniciarRecorrido = () => {
    setRecorridoIniciado(true)
  }

  return (
    <main className="ptar-hero">
      <div className={`ptar-hero__slider ${recorridoIniciado ? 'is-started' : ''}`}>
        <section className="ptar-hero__panel ptar-hero__panel--inicio">
          <div className="ptar-hero__canvas">
            <h1>EL VIAJE DEL AGUA</h1>
            <p>
              Un recorrido por la planta de tratamiento de aguas residuales (PTAR) de
              la UAO
            </p>
            <button type="button" onClick={iniciarRecorrido}>
              Iniciar el Recorrido
            </button>
          </div>
        </section>

        <section className="ptar-hero__panel ptar-hero__panel--bienvenida">
          <img
            className="ptar-hero__personaje ptar-hero__personaje--izquierda"
            src="/images/estudianteNormal.png"
            alt="Estudiante"
          />
          <h2 className="ptar-hero__bienvenida">¡BIENVENIDO!</h2>
          <img
            className="ptar-hero__personaje ptar-hero__personaje--derecha"
            src="/images/estudianteAmbiental.png"
            alt="Guía ambiental"
          />
        </section>
      </div>
    </main>
  )
}

export default Inicio