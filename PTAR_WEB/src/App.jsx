import { useState } from 'react'
import './App.css'
import Header from './components/Header/header.jsx'
import Inicio from './components/Inicio/inicio.jsx'
import Informacion from './components/Informacion/informacion.jsx'
import Pozo1 from './components/Estaciones/Pozo1/pozo1.jsx'

function App() {
  const [seccionActiva, setSeccionActiva] = useState('inicio')
  const [volverAUbicacion, setVolverAUbicacion] = useState(false)
  const [pozo1RenderKey, setPozo1RenderKey] = useState(0)

  return (
    <div className={`ptar-app ${seccionActiva === 'pozo1' ? 'ptar-app--pozo1' : ''}`}>
      <Header
        onLogoClick={() => {
          setVolverAUbicacion(false)
          setSeccionActiva('inicio')
        }}
        onSeleccionarEstacion={(_, indice) => {
          if (indice !== 0) {
            return
          }

          setVolverAUbicacion(false)
          setSeccionActiva('pozo1')
          setPozo1RenderKey((valorAnterior) => valorAnterior + 1)
        }}
      />
      <div className="ptar-app__content">
        {seccionActiva === 'inicio' ? (
          <Inicio
            onIniciarRecorrido={() => {
              setVolverAUbicacion(false)
              setSeccionActiva('informacion')
            }}
          />
        ) : null}

        {seccionActiva === 'informacion' ? (
          <Informacion
            iniciarEnUbicacion={volverAUbicacion}
            onCompletarInformacion={() => {
              setVolverAUbicacion(false)
              setSeccionActiva('pozo1')
            }}
          />
        ) : null}

        {seccionActiva === 'pozo1' ? (
          <Pozo1
            key={pozo1RenderKey}
            onVolverAUbicacion={() => {
              setVolverAUbicacion(true)
              setSeccionActiva('informacion')
            }}
          />
        ) : null}
      </div>
    </div>
  )
}

export default App
