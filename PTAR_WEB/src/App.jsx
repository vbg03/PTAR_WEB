import './App.css'
import Header from './components/Header/header.jsx'

function App() {
  return (
    <div className="ptar-app">
      <Header />
      <main className="ptar-hero">
        <div className="ptar-hero__canvas">
          <h1>EL VIAJE DEL AGUA</h1>
          <p>
            Un recorrido por la planta de tratamiento de aguas residuales (PTAR) de la
            UAO
          </p>
          <button type="button">Iniciar el Recorrido</button>
        </div>
      </main>
    </div>
  )
}

export default App