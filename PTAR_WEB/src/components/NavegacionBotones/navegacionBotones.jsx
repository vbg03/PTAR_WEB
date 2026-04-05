import { useModoNavegacion } from '../../hooks/useModoNavegacion'
import {
  emitirEventoNavegacion,
  MODO_NAVEGACION_BOTONES
} from '../../utils/navigationSettings'
import './navegacionBotones.css'

function IconoFlechaIzquierda() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14.95 4.72a1 1 0 0 1 .08 1.41L9.16 12l5.87 5.87a1 1 0 0 1-1.41 1.41l-6.58-6.57a1 1 0 0 1 0-1.42l6.5-6.57a1 1 0 0 1 1.41 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconoFlechaDerecha() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9.05 19.28a1 1 0 0 1-.08-1.41L14.84 12 8.97 6.13a1 1 0 1 1 1.41-1.41l6.58 6.57a1 1 0 0 1 0 1.42l-6.5 6.57a1 1 0 0 1-1.41 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

function NavegacionBotones({
  mostrar = true,
  mostrarBotonAvanzar = true,
  mostrarBotonRetroceder = true
}) {
  const modoNavegacion = useModoNavegacion()
  const mostrarControles =
    mostrar &&
    modoNavegacion === MODO_NAVEGACION_BOTONES &&
    (mostrarBotonAvanzar || mostrarBotonRetroceder)

  if (!mostrarControles) {
    return null
  }

  return (
    <div
      className="ptar-nav-buttons"
      role="group"
      aria-label="Controles de navegacion del recorrido"
      data-no-swipe-nav="true"
    >
      {mostrarBotonRetroceder ? (
        <button
          type="button"
          className="ptar-nav-buttons__button"
          aria-label="Retroceder en el recorrido"
          title="Retroceder"
          onClick={() => emitirEventoNavegacion('retroceder')}
        >
          <IconoFlechaIzquierda />
        </button>
      ) : null}

      {mostrarBotonAvanzar ? (
        <button
          type="button"
          className="ptar-nav-buttons__button"
          aria-label="Avanzar en el recorrido"
          title="Avanzar"
          onClick={() => emitirEventoNavegacion('avanzar')}
        >
          <IconoFlechaDerecha />
        </button>
      ) : null}
    </div>
  )
}

export default NavegacionBotones
