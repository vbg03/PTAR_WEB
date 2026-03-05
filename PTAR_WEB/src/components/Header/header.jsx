import { useEffect, useRef, useState } from 'react'
import './header.css'

const UMBRAL_ACTIVACION_HEADER = 24
const UMBRAL_OCULTAR_HEADER = 148

const estaciones = [
  'Pozo de Bombeo No. 1',
  'Pretratamiento',
  'Tanque de Aireacion',
  'Sedimentador',
  'Lechos de Secado',
  'Camara de Tamiz',
  'Unidad de Filtracion',
  'Desinfeccion',
  'Almacenamiento',
  'Pozo de Bombeo No. 2'
]

function Header({
  logoSrc = '/images/logouao.png',
  logoAlt = 'Logo UAO',
  onLogoClick,
  onSeleccionarEstacion,
  onIrAUsos,
  onIrADocumentacion,
  ocultarEnModoEstacion = false
}) {
  const [isHiddenByScroll, setIsHiddenByScroll] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cursorEnZonaSuperior, setCursorEnZonaSuperior] = useState(false)
  const [cursorEnHeader, setCursorEnHeader] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (ocultarEnModoEstacion) {
      setIsHiddenByScroll(false)
      return
    }

    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isScrollingDown = currentScrollY > lastScrollY
      const shouldHide = isScrollingDown && currentScrollY > 80

      setIsHiddenByScroll(shouldHide)
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [ocultarEnModoEstacion])

  useEffect(() => {
    if (!ocultarEnModoEstacion) {
      setCursorEnZonaSuperior(false)
      setCursorEnHeader(false)
      return
    }

    const handleMouseMove = (event) => {
      const posicionY = event.clientY
      setCursorEnZonaSuperior((estadoAnterior) => {
        if (estadoAnterior) {
          return posicionY <= UMBRAL_OCULTAR_HEADER
        }
        return posicionY <= UMBRAL_ACTIVACION_HEADER
      })
    }

    const handleMouseLeaveWindow = () => {
      setCursorEnZonaSuperior(false)
      setCursorEnHeader(false)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeaveWindow)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeaveWindow)
    }
  }, [ocultarEnModoEstacion])

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const manejarPointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    const manejarEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('pointerdown', manejarPointerDown)
    window.addEventListener('keydown', manejarEscape)

    return () => {
      window.removeEventListener('pointerdown', manejarPointerDown)
      window.removeEventListener('keydown', manejarEscape)
    }
  }, [isMenuOpen])

  const mostrarHeaderEnEstacion = cursorEnZonaSuperior || cursorEnHeader || isMenuOpen
  const isHidden = ocultarEnModoEstacion ? !mostrarHeaderEnEstacion : isHiddenByScroll

  return (
    <header
      className={`ptar-header ${isHidden ? 'ptar-header--hidden' : ''}`}
      onMouseEnter={() => setCursorEnHeader(true)}
      onMouseLeave={() => setCursorEnHeader(false)}
    >
      <button
        className="ptar-header__logo"
        type="button"
        onClick={onLogoClick}
        aria-label="Ir al inicio"
      >
        <img src={logoSrc} alt={logoAlt} />
      </button>
      <nav className="ptar-header__nav">
        <div
          ref={dropdownRef}
          className={`ptar-header__dropdown ${isMenuOpen ? 'is-open' : ''}`}
        >
          <button
            className="ptar-header__button"
            onClick={() => setIsMenuOpen((open) => !open)}
            type="button"
          >
            Estaciones
            <span className="ptar-header__chevron" aria-hidden="true" />
          </button>
          <div className="ptar-header__menu" role="menu">
            {estaciones.map((item, indice) => (
              <button
                className="ptar-header__menu-item"
                key={item}
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  if (typeof onSeleccionarEstacion === 'function') {
                    onSeleccionarEstacion(item, indice)
                  }
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <button
          className="ptar-header__button"
          type="button"
          onClick={() => {
            if (typeof onIrAUsos === 'function') {
              onIrAUsos()
            }
          }}
        >
          Usos del agua
        </button>
        <button
          className="ptar-header__button"
          type="button"
          onClick={() => {
            if (typeof onIrADocumentacion === 'function') {
              onIrADocumentacion()
            }
          }}
        >
          Documentacion
        </button>
      </nav>
    </header>
  )
}

export default Header
