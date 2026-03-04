import { useEffect, useState } from 'react'
import './header.css'

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
  onIrADocumentacion
}) {
  const [isHidden, setIsHidden] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isScrollingDown = currentScrollY > lastScrollY
      const shouldHide = isScrollingDown && currentScrollY > 80

      setIsHidden(shouldHide)
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`ptar-header ${isHidden ? 'ptar-header--hidden' : ''}`}>
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
          className={`ptar-header__dropdown ${isMenuOpen ? 'is-open' : ''}`}
          onMouseLeave={() => setIsMenuOpen(false)}
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
