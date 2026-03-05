import { useEffect, useRef } from 'react'
import { obtenerDireccionScrollPorGesto } from '../../utils/wheelStepNavigation'
import './documentacion.css'

const DURACION_BLOQUEO_SCROLL = 340

const ENLACE_FICHA_TECNICA =
  'https://drive.google.com/file/d/1RDE2gCq1fxK_YbtxVTLuWcFABEjqtaSO/view?usp=sharing'
const ENLACE_DOCUMENTACION_OFICIAL =
  'https://drive.google.com/file/d/1vG1p81qSbzKHjKwlggZ4C_Rtq5QJ2CTb/view?usp=drive_link'

function Documentacion({ onVolverAUsos }) {
  const bloqueoScrollRef = useRef(false)
  const acumulacionScrollRef = useRef(0)
  const ultimaMarcaScrollRef = useRef(0)
  const ultimaActivacionScrollRef = useRef(0)
  const timeoutBloqueoRef = useRef(null)

  useEffect(() => {
    const manejarRueda = (event) => {
      const direccionScroll = obtenerDireccionScrollPorGesto(
            event,
            acumulacionScrollRef,
            ultimaMarcaScrollRef,
            ultimaActivacionScrollRef
        )

            if (bloqueoScrollRef.current || direccionScroll === 0) {
        return
      }

      bloqueoScrollRef.current = true

      if (direccionScroll < 0 && typeof onVolverAUsos === 'function') {
        onVolverAUsos()
      }

      if (timeoutBloqueoRef.current) {
        window.clearTimeout(timeoutBloqueoRef.current)
      }

      timeoutBloqueoRef.current = window.setTimeout(() => {
        bloqueoScrollRef.current = false
        timeoutBloqueoRef.current = null
      }, DURACION_BLOQUEO_SCROLL)
    }

    window.addEventListener('wheel', manejarRueda, { passive: true })

    return () => {
      window.removeEventListener('wheel', manejarRueda)
      if (timeoutBloqueoRef.current) {
        window.clearTimeout(timeoutBloqueoRef.current)
        timeoutBloqueoRef.current = null
      }
    }
  }, [onVolverAUsos])

  return (
    <main className="ptar-documentacion">
      <section className="ptar-documentacion__panel" aria-label="Documentacion de la PTAR">
        <div className="ptar-documentacion__contenido">
          <h1>Documentacion de la PTAR</h1>
          <p>
            Descarga la documentacion tecnica y los documentos oficiales si deseas saber mas
          </p>

          <div className="ptar-documentacion__acciones">
            <a
              className="ptar-documentacion__boton"
              href={ENLACE_FICHA_TECNICA}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ptar-documentacion__icono ptar-documentacion__icono--pdf" aria-hidden="true">
                PDF
              </span>
              <span>Ficha tecnica</span>
            </a>

            <a
              className="ptar-documentacion__boton"
              href={ENLACE_DOCUMENTACION_OFICIAL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span
                className="ptar-documentacion__icono ptar-documentacion__icono--documento"
                aria-hidden="true"
              >
                DOC
              </span>
              <span>Documentacion oficial</span>
            </a>
          </div>

          <p className="ptar-documentacion__nota">
            Haz click en cualquiera de los dos botones para descargar los archivos.
          </p>
        </div>
      </section>
    </main>
  )
}

export default Documentacion
