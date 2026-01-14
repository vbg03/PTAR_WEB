import { useEffect, useState } from 'react'
import './header.css'

const estaciones = [
  'Pozo de Bombeo N°1',
  'Pretratamiento',
  'Tanque de Aireación',
  'Sedimentador',
  'Lechos de Secado',
  'Cámara de Tamiz',
  'Unidad de Filtración',
  'Desinfección',
  'Almacenamiento',
  'Pozo de Bombeo N°2'
]

function Header({ logoSrc = '/images/logouao.png', logoAlt = 'Logo UAO' }) {
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
      <div className="ptar-header__logo">
        <img src={logoSrc} alt={logoAlt} />
      </div>
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
            {estaciones.map((item) => (
              <button className="ptar-header__menu-item" key={item} type="button">
                {item}
              </button>
            ))}
          </div>
        </div>
        <button className="ptar-header__button" type="button">
          Usos del agua
        </button>
        <button className="ptar-header__button" type="button">
          Documentación
        </button>
      </nav>
    </header>
  )
}

export default Header