import './inicio.css'

function Inicio({ onIniciarRecorrido }) {
  return (
    <main className="ptar-hero">
      <section className="ptar-hero__panel ptar-hero__panel--inicio">
        <div className="ptar-hero__canvas">
          <h1>EL VIAJE DEL AGUA</h1>
          <p>
            Un recorrido por la planta de tratamiento de aguas residuales (PTAR) de la
            UAO
          </p>
          <button type="button" onClick={onIniciarRecorrido}>
            Iniciar el Recorrido
          </button>
        </div>
      </section>
    </main>
  )
}

export default Inicio