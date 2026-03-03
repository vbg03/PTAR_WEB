import { useEffect, useRef, useState } from 'react'
import './App.css'
import Header from './components/Header/header.jsx'
import Inicio from './components/Inicio/inicio.jsx'
import Informacion from './components/Informacion/informacion.jsx'
import Pozo1 from './components/Estaciones/Pozo1/pozo1.jsx'
import Pretratamiento from './components/Estaciones/Pretratamiento/pretratamiento.jsx'
import Areacion from './components/Estaciones/Areación/areacion.jsx'
import Sedimentador from './components/Estaciones/Sedimentador/sedimentador.jsx'
import Lechos from './components/Estaciones/Lechos/lechos.jsx'
import Tamizaje from './components/Estaciones/Tamizaje/tamizaje.jsx'
import Filtro from './components/Estaciones/Filtración/filtro.jsx'
import Desinfeccion from './components/Estaciones/Desinfección/desinfeccion.jsx'

const DURACION_TRANSICION_ESTACION = 760
const MITAD_TRANSICION_ESTACION = 340

function App() {
  const [seccionActiva, setSeccionActiva] = useState('inicio')
  const [volverAUbicacion, setVolverAUbicacion] = useState(false)
  const [pozo1RenderKey, setPozo1RenderKey] = useState(0)
  const [pretratamientoRenderKey, setPretratamientoRenderKey] = useState(0)
  const [areacionRenderKey, setAreacionRenderKey] = useState(0)
  const [sedimentadorRenderKey, setSedimentadorRenderKey] = useState(0)
  const [lechosRenderKey, setLechosRenderKey] = useState(0)
  const [tamizajeRenderKey, setTamizajeRenderKey] = useState(0)
  const [filtroRenderKey, setFiltroRenderKey] = useState(0)
  const [desinfeccionRenderKey, setDesinfeccionRenderKey] = useState(0)
  const [pozo1IniciarEnFinal, setPozo1IniciarEnFinal] = useState(false)
  const [pretratamientoIniciarEnFinal, setPretratamientoIniciarEnFinal] = useState(false)
  const [areacionEntradaSuave, setAreacionEntradaSuave] = useState(false)
  const [areacionIniciarEnFinal, setAreacionIniciarEnFinal] = useState(false)
  const [sedimentadorIniciarEnFinal, setSedimentadorIniciarEnFinal] = useState(false)
  const [lechosIniciarEnFinal, setLechosIniciarEnFinal] = useState(false)
  const [tamizajeIniciarEnFinal, setTamizajeIniciarEnFinal] = useState(false)
  const [filtroIniciarEnFinal, setFiltroIniciarEnFinal] = useState(false)
  const [desinfeccionIniciarEnFinal, setDesinfeccionIniciarEnFinal] = useState(false)
  const [transicionEstacionActiva, setTransicionEstacionActiva] = useState(false)
  const [direccionTransicionEstacion, setDireccionTransicionEstacion] = useState('avance')
  const transicionActivaRef = useRef(false)
  const timeoutCambioSeccionRef = useRef(null)
  const timeoutFinTransicionRef = useRef(null)

  const limpiarTimeout = (timeoutRef) => {
    if (!timeoutRef.current) {
      return
    }
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  const ejecutarTransicionEstacion = (direccion, cambiarSeccion) => {
    if (transicionActivaRef.current) {
      return
    }

    transicionActivaRef.current = true
    setDireccionTransicionEstacion(direccion)
    setTransicionEstacionActiva(true)

    limpiarTimeout(timeoutCambioSeccionRef)
    limpiarTimeout(timeoutFinTransicionRef)

    timeoutCambioSeccionRef.current = window.setTimeout(() => {
      cambiarSeccion()
    }, MITAD_TRANSICION_ESTACION)

    timeoutFinTransicionRef.current = window.setTimeout(() => {
      transicionActivaRef.current = false
      setTransicionEstacionActiva(false)
      timeoutCambioSeccionRef.current = null
      timeoutFinTransicionRef.current = null
    }, DURACION_TRANSICION_ESTACION)
  }

  useEffect(() => {
    return () => {
      limpiarTimeout(timeoutCambioSeccionRef)
      limpiarTimeout(timeoutFinTransicionRef)
    }
  }, [])

  const claseApp =
    seccionActiva === 'pozo1'
      ? 'ptar-app--pozo1'
      : seccionActiva === 'pretratamiento'
        ? 'ptar-app--pretratamiento'
        : seccionActiva === 'areacion'
          ? 'ptar-app--areacion'
          : seccionActiva === 'sedimentador'
            ? 'ptar-app--sedimentador'
            : seccionActiva === 'lechos'
              ? 'ptar-app--lechos'
              : seccionActiva === 'tamizaje'
                ? 'ptar-app--tamizaje'
                : seccionActiva === 'filtro'
                  ? 'ptar-app--filtro'
                  : seccionActiva === 'desinfeccion'
                    ? 'ptar-app--desinfeccion'
                : ''

  return (
    <div className={`ptar-app ${claseApp}`}>
      <Header
        onLogoClick={() => {
          setVolverAUbicacion(false)
          setPozo1IniciarEnFinal(false)
          setPretratamientoIniciarEnFinal(false)
          setAreacionEntradaSuave(false)
          setAreacionIniciarEnFinal(false)
          setSedimentadorIniciarEnFinal(false)
          setLechosIniciarEnFinal(false)
          setTamizajeIniciarEnFinal(false)
          setFiltroIniciarEnFinal(false)
          setDesinfeccionIniciarEnFinal(false)
          setSeccionActiva('inicio')
        }}
        onSeleccionarEstacion={(_, indice) => {
          if (indice === 0) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('pozo1')
            setPozo1RenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 1) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('pretratamiento')
            setPretratamientoRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 2) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('areacion')
            setAreacionRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 3) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('sedimentador')
            setSedimentadorRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 4) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('lechos')
            setLechosRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 5) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('tamizaje')
            setTamizajeRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 6) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('filtro')
            setFiltroRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }

          if (indice === 7) {
            setVolverAUbicacion(false)
            setPozo1IniciarEnFinal(false)
            setPretratamientoIniciarEnFinal(false)
            setAreacionEntradaSuave(false)
            setAreacionIniciarEnFinal(false)
            setSedimentadorIniciarEnFinal(false)
            setLechosIniciarEnFinal(false)
            setTamizajeIniciarEnFinal(false)
            setFiltroIniciarEnFinal(false)
            setDesinfeccionIniciarEnFinal(false)
            setSeccionActiva('desinfeccion')
            setDesinfeccionRenderKey((valorAnterior) => valorAnterior + 1)
            return
          }
        }}
      />
      <div className="ptar-app__content">
        {seccionActiva === 'inicio' ? (
          <Inicio
            onIniciarRecorrido={() => {
              setVolverAUbicacion(false)
              setPozo1IniciarEnFinal(false)
              setPretratamientoIniciarEnFinal(false)
              setAreacionEntradaSuave(false)
              setAreacionIniciarEnFinal(false)
              setSedimentadorIniciarEnFinal(false)
              setLechosIniciarEnFinal(false)
              setTamizajeIniciarEnFinal(false)
              setFiltroIniciarEnFinal(false)
              setDesinfeccionIniciarEnFinal(false)
              setSeccionActiva('informacion')
            }}
          />
        ) : null}

        {seccionActiva === 'informacion' ? (
          <Informacion
            iniciarEnUbicacion={volverAUbicacion}
            onCompletarInformacion={() => {
              setVolverAUbicacion(false)
              setPozo1IniciarEnFinal(false)
              setPretratamientoIniciarEnFinal(false)
              setAreacionEntradaSuave(false)
              setAreacionIniciarEnFinal(false)
              setSedimentadorIniciarEnFinal(false)
              setLechosIniciarEnFinal(false)
              setTamizajeIniciarEnFinal(false)
              setFiltroIniciarEnFinal(false)
              setDesinfeccionIniciarEnFinal(false)
              setSeccionActiva('pozo1')
            }}
          />
        ) : null}

        {seccionActiva === 'pozo1' ? (
          <Pozo1
            key={pozo1RenderKey}
            iniciarEnFinal={pozo1IniciarEnFinal}
            onCompletarPozo1={() => {
              ejecutarTransicionEstacion('avance', () => {
                setPozo1IniciarEnFinal(false)
                setPretratamientoIniciarEnFinal(false)
                setAreacionEntradaSuave(false)
                setAreacionIniciarEnFinal(false)
                setSedimentadorIniciarEnFinal(false)
                setLechosIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('pretratamiento')
                setPretratamientoRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onVolverAUbicacion={() => {
              setVolverAUbicacion(true)
              setPozo1IniciarEnFinal(false)
              setPretratamientoIniciarEnFinal(false)
              setAreacionEntradaSuave(false)
              setAreacionIniciarEnFinal(false)
              setSedimentadorIniciarEnFinal(false)
              setLechosIniciarEnFinal(false)
              setTamizajeIniciarEnFinal(false)
              setFiltroIniciarEnFinal(false)
              setDesinfeccionIniciarEnFinal(false)
              setSeccionActiva('informacion')
            }}
          />
        ) : null}

        {seccionActiva === 'pretratamiento' ? (
          <Pretratamiento
            key={pretratamientoRenderKey}
            iniciarEnFinal={pretratamientoIniciarEnFinal}
            onVolverAPozo1={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setPozo1IniciarEnFinal(true)
                setPretratamientoIniciarEnFinal(false)
                setAreacionEntradaSuave(false)
                setAreacionIniciarEnFinal(false)
                setSedimentadorIniciarEnFinal(false)
                setLechosIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('pozo1')
                setPozo1RenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onCompletarPretratamiento={() => {
              setPretratamientoIniciarEnFinal(false)
              setAreacionEntradaSuave(true)
              setAreacionIniciarEnFinal(false)
              setSedimentadorIniciarEnFinal(false)
              setLechosIniciarEnFinal(false)
              setTamizajeIniciarEnFinal(false)
              setFiltroIniciarEnFinal(false)
              setDesinfeccionIniciarEnFinal(false)
              setSeccionActiva('areacion')
              setAreacionRenderKey((valorAnterior) => valorAnterior + 1)
            }}
          />
        ) : null}

        {seccionActiva === 'areacion' ? (
          <Areacion
            key={areacionRenderKey}
            entradaSuaveDesdePretratamiento={areacionEntradaSuave}
            iniciarEnFinal={areacionIniciarEnFinal}
            onVolverAPretratamiento={() => {
              setPretratamientoIniciarEnFinal(true)
              setAreacionEntradaSuave(false)
              setAreacionIniciarEnFinal(false)
              setSedimentadorIniciarEnFinal(false)
              setLechosIniciarEnFinal(false)
              setTamizajeIniciarEnFinal(false)
              setFiltroIniciarEnFinal(false)
              setDesinfeccionIniciarEnFinal(false)
              setSeccionActiva('pretratamiento')
              setPretratamientoRenderKey((valorAnterior) => valorAnterior + 1)
            }}
            onCompletarAreacion={() => {
              ejecutarTransicionEstacion('avance', () => {
                setAreacionEntradaSuave(false)
                setAreacionIniciarEnFinal(false)
                setSedimentadorIniciarEnFinal(false)
                setLechosIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('sedimentador')
                setSedimentadorRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {seccionActiva === 'sedimentador' ? (
          <Sedimentador
            key={sedimentadorRenderKey}
            iniciarEnFinal={sedimentadorIniciarEnFinal}
            onVolverAAreacion={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setAreacionEntradaSuave(false)
                setAreacionIniciarEnFinal(true)
                setSedimentadorIniciarEnFinal(false)
                setLechosIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('areacion')
                setAreacionRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onCompletarSedimentador={() => {
              ejecutarTransicionEstacion('avance', () => {
                setSedimentadorIniciarEnFinal(false)
                setLechosIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('lechos')
                setLechosRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {seccionActiva === 'lechos' ? (
          <Lechos
            key={lechosRenderKey}
            iniciarEnFinal={lechosIniciarEnFinal}
            onVolverASedimentador={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setLechosIniciarEnFinal(false)
                setSedimentadorIniciarEnFinal(true)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('sedimentador')
                setSedimentadorRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onCompletarLechos={() => {
              ejecutarTransicionEstacion('avance', () => {
                setLechosIniciarEnFinal(false)
                setSedimentadorIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('tamizaje')
                setTamizajeRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {seccionActiva === 'tamizaje' ? (
          <Tamizaje
            key={tamizajeRenderKey}
            iniciarEnFinal={tamizajeIniciarEnFinal}
            onVolverALechos={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setLechosIniciarEnFinal(true)
                setSedimentadorIniciarEnFinal(false)
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('lechos')
                setLechosRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onCompletarTamizaje={() => {
              ejecutarTransicionEstacion('avance', () => {
                setTamizajeIniciarEnFinal(false)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('filtro')
                setFiltroRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {seccionActiva === 'filtro' ? (
          <Filtro
            key={filtroRenderKey}
            iniciarEnFinal={filtroIniciarEnFinal}
            onVolverATamizaje={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setTamizajeIniciarEnFinal(true)
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('tamizaje')
                setTamizajeRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
            onCompletarFiltracion={() => {
              ejecutarTransicionEstacion('avance', () => {
                setFiltroIniciarEnFinal(false)
                setDesinfeccionIniciarEnFinal(false)
                setSeccionActiva('desinfeccion')
                setDesinfeccionRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {seccionActiva === 'desinfeccion' ? (
          <Desinfeccion
            key={desinfeccionRenderKey}
            iniciarEnFinal={desinfeccionIniciarEnFinal}
            onVolverAFiltro={() => {
              ejecutarTransicionEstacion('retroceso', () => {
                setDesinfeccionIniciarEnFinal(false)
                setFiltroIniciarEnFinal(true)
                setSeccionActiva('filtro')
                setFiltroRenderKey((valorAnterior) => valorAnterior + 1)
              })
            }}
          />
        ) : null}

        {transicionEstacionActiva ? (
          <div
            className={`ptar-app__transicion-estacion ptar-app__transicion-estacion--${direccionTransicionEstacion}`}
            aria-hidden="true"
          >
            <span className="ptar-app__transicion-capa" />
            <span className="ptar-app__transicion-brillo" />
            <span className="ptar-app__transicion-linea ptar-app__transicion-linea--roja" />
            <span className="ptar-app__transicion-linea ptar-app__transicion-linea--vinotinto" />
            <span className="ptar-app__transicion-linea ptar-app__transicion-linea--crema" />
            <span className="ptar-app__transicion-linea ptar-app__transicion-linea--gris" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default App
