import { useEffect, useRef, useState } from 'react'
import './header.css'

const UMBRAL_ACTIVACION_HEADER = 24
const UMBRAL_OCULTAR_HEADER = 148
const QUERY_HEADER_COMPACTO = '(max-width: 950px) and (max-height: 450px) and (orientation: landscape)'

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
  const [isCompactNavOpen, setIsCompactNavOpen] = useState(false)
  const [isCompactLayout, setIsCompactLayout] = useState(false)
  const [cursorEnZonaSuperior, setCursorEnZonaSuperior] = useState(false)
  const [cursorEnHeader, setCursorEnHeader] = useState(false)
  const headerRef = useRef(null)
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
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia(QUERY_HEADER_COMPACTO)
    const actualizarLayoutCompacto = (event) => {
      setIsCompactLayout(event.matches)
    }

    actualizarLayoutCompacto(mediaQuery)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', actualizarLayoutCompacto)
      return () => mediaQuery.removeEventListener('change', actualizarLayoutCompacto)
    }

    mediaQuery.addListener(actualizarLayoutCompacto)
    return () => mediaQuery.removeListener(actualizarLayoutCompacto)
  }, [])

  useEffect(() => {
    if (!isCompactLayout) {
      setIsCompactNavOpen(false)
    }
  }, [isCompactLayout])

  useEffect(() => {
    if (!isCompactNavOpen && !isMenuOpen) {
      return
    }

    const manejarPointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsCompactNavOpen(false)
        setIsMenuOpen(false)
      }
    }

    const manejarEscape = (event) => {
      if (event.key === 'Escape') {
        setIsCompactNavOpen(false)
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('pointerdown', manejarPointerDown)
    window.addEventListener('keydown', manejarEscape)

    return () => {
      window.removeEventListener('pointerdown', manejarPointerDown)
      window.removeEventListener('keydown', manejarEscape)
    }
  }, [isCompactNavOpen, isMenuOpen])

  const mostrarHeaderEnEstacion = cursorEnZonaSuperior || cursorEnHeader || isMenuOpen
  const isHidden = isCompactLayout
    ? false
    : ocultarEnModoEstacion
      ? !mostrarHeaderEnEstacion
      : isHiddenByScroll

  return (
    <header
      ref={headerRef}
      className={`ptar-header ${isHidden ? 'ptar-header--hidden' : ''} ${isCompactLayout ? 'ptar-header--compact-layout' : ''} ${isCompactNavOpen ? 'ptar-header--nav-open' : ''}`}
      onMouseEnter={() => setCursorEnHeader(true)}
      onMouseLeave={() => setCursorEnHeader(false)}
    >
      <button
        className="ptar-header__logo"
        type="button"
        onClick={() => {
          setIsCompactNavOpen(false)
          setIsMenuOpen(false)
          if (typeof onLogoClick === 'function') {
            onLogoClick()
          }
        }}
        aria-label="Ir al inicio"
      >
        <img src={logoSrc} alt={logoAlt} />
      </button>
      <button
        className="ptar-header__toggle"
        type="button"
        onClick={() => setIsCompactNavOpen((estadoAnterior) => !estadoAnterior)}
        aria-label={isCompactNavOpen ? 'Cerrar menu' : 'Abrir menu'}
        aria-expanded={isCompactNavOpen}
        aria-controls="ptar-header-nav"
      >
        <span className="ptar-header__toggle-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
      <nav className="ptar-header__nav" id="ptar-header-nav">
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
                  setIsCompactNavOpen(false)
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
            setIsCompactNavOpen(false)
            setIsMenuOpen(false)
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
            setIsCompactNavOpen(false)
            setIsMenuOpen(false)
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
