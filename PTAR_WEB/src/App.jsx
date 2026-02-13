import { useState } from 'react'
import './App.css'
import Header from './components/Header/header.jsx'
import Inicio from './components/Inicio/inicio.jsx'
import Informacion from './components/Informacion/informacion.jsx'

function App() {
  const [seccionActiva, setSeccionActiva] = useState('inicio')

  return (
    <div className="ptar-app">
      <Header />
      <div className="ptar-app__content">
        {seccionActiva === 'inicio' ? (
          <Inicio onIniciarRecorrido={() => setSeccionActiva('informacion')} />
        ) : (
          <Informacion />
        )}
      </div>
    </div>
  )
}

export default App