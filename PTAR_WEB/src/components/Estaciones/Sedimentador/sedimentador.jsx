import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './sedimentador.css'

const DURACION_BLOQUEO_SCROLL = 340
const DURACION_AUTOAVANCE_TRANSICION = 920
const VALOR_MIN_CAMARA = -120
const VALOR_MAX_CAMARA = 220
const ZOOM_MIN_CAMARA = 0.2
const ZOOM_MAX_CAMARA = 12
const PASO_CAMBIO_ESCENARIO = 4
const PASO_TRANSICION_ESCENARIO = PASO_CAMBIO_ESCENARIO - 1
const PASO_PREVIO_TRANSICION_ESCENARIO = PASO_TRANSICION_ESCENARIO - 1
const PASO_POST_CAMBIO_ESCENARIO = PASO_CAMBIO_ESCENARIO + 1
const PASO_INICIO_PARTICULAS_INDIVIDUALES = PASO_CAMBIO_ESCENARIO

const ESCENA_SEDIMENTADOR_ARRIBA = '/images/sedimentador/sedimentador-arriba_nuevo.svg'
const ESCENA_SEDIMENTADOR_PRINCIPAL = '/svg/aireacion-sedimentador-tamizaje.svg'

const CAPAS_PARTICULAS_SEDIMENTADOR = {
    fondo: {
        clase: 'ptar-sed__particulas--fondo',
        src: '/images/sedimentador/particulas%202.png'
    },
    fondoSuave: {
        clase: 'ptar-sed__particulas--fondo-suave',
        src: '/images/sedimentador/particulas.png'
    }
}

const PARTICULAS_ARRIBA_DUPLICADAS_BASE = [
    {
        clave: 'arriba-fondo-a',
        ...CAPAS_PARTICULAS_SEDIMENTADOR.fondo,
        x: 63,
        y: 48,
        movimientoX: 8,
        movimientoY: -6,
        duracionMovimiento: '12s',
        retardoMovimiento: '-2.5s'
    },
    {
        clave: 'arriba-fondo-b',
        ...CAPAS_PARTICULAS_SEDIMENTADOR.fondo,
        x: 76,
        y: 53,
        movimientoX: -7,
        movimientoY: -5,
        duracionMovimiento: '13.6s',
        retardoMovimiento: '-5.2s'
    },
    {
        clave: 'arriba-suave-a',
        ...CAPAS_PARTICULAS_SEDIMENTADOR.fondoSuave,
        x: 66,
        y: 49,
        movimientoX: 6,
        movimientoY: -4,
        duracionMovimiento: '11.4s',
        retardoMovimiento: '-1.4s'
    },
    {
        clave: 'arriba-suave-b',
        ...CAPAS_PARTICULAS_SEDIMENTADOR.fondoSuave,
        x: 79,
        y: 54,
        movimientoX: -5,
        movimientoY: -3,
        duracionMovimiento: '14.2s',
        retardoMovimiento: '-3.8s'
    }
]

const PARTICULAS_INDIVIDUALES_FONDO_BASE = [
    { x: 37, y: 75, tamanoX: 8, tamanoY: 6, opacidad: 0.32, movimientoX: 4, movimientoY: -3, duracionMovimiento: '10.4s', retardoMovimiento: '-1.2s', rotacion: -16 },
    { x: 41, y: 72, tamanoX: 6, tamanoY: 5, opacidad: 0.28, movimientoX: 5, movimientoY: -4, duracionMovimiento: '9.2s', retardoMovimiento: '-4.1s', rotacion: 21 },
    { x: 46, y: 78, tamanoX: 9, tamanoY: 7, opacidad: 0.35, movimientoX: -4, movimientoY: -3, duracionMovimiento: '11.5s', retardoMovimiento: '-2.3s', rotacion: -9 },
    { x: 49, y: 74, tamanoX: 7, tamanoY: 5, opacidad: 0.3, movimientoX: 4, movimientoY: -3, duracionMovimiento: '10.1s', retardoMovimiento: '-5.4s', rotacion: 14 },
    { x: 53, y: 81, tamanoX: 10, tamanoY: 7, opacidad: 0.36, movimientoX: -5, movimientoY: -4, duracionMovimiento: '12.2s', retardoMovimiento: '-3.6s', rotacion: -20 },
    { x: 57, y: 77, tamanoX: 8, tamanoY: 6, opacidad: 0.33, movimientoX: 5, movimientoY: -3, duracionMovimiento: '11.4s', retardoMovimiento: '-6.2s', rotacion: 12 },
    { x: 61, y: 83, tamanoX: 9, tamanoY: 7, opacidad: 0.35, movimientoX: -4, movimientoY: -3, duracionMovimiento: '12.8s', retardoMovimiento: '-2.8s', rotacion: -14 },
    { x: 43, y: 84, tamanoX: 7, tamanoY: 5, opacidad: 0.29, movimientoX: 3, movimientoY: -2, duracionMovimiento: '10.7s', retardoMovimiento: '-4.7s', rotacion: 18 },
    { x: 51, y: 86, tamanoX: 10, tamanoY: 8, opacidad: 0.37, movimientoX: -5, movimientoY: -4, duracionMovimiento: '12.9s', retardoMovimiento: '-1.9s', rotacion: -11 },
    { x: 59, y: 88, tamanoX: 8, tamanoY: 6, opacidad: 0.31, movimientoX: 4, movimientoY: -3, duracionMovimiento: '11.2s', retardoMovimiento: '-5.1s', rotacion: 9 },
    { x: 47, y: 90, tamanoX: 9, tamanoY: 7, opacidad: 0.34, movimientoX: -4, movimientoY: -3, duracionMovimiento: '13.1s', retardoMovimiento: '-7.2s', rotacion: -24 },
    { x: 55, y: 92, tamanoX: 7, tamanoY: 5, opacidad: 0.28, movimientoX: 3, movimientoY: -2, duracionMovimiento: '9.8s', retardoMovimiento: '-2.6s', rotacion: 16 },
    { x: 64, y: 89, tamanoX: 6, tamanoY: 5, opacidad: 0.26, movimientoX: -3, movimientoY: -2, duracionMovimiento: '10.9s', retardoMovimiento: '-4.9s', rotacion: -7 },
    { x: 39, y: 87, tamanoX: 6, tamanoY: 4, opacidad: 0.24, movimientoX: 2, movimientoY: -2, duracionMovimiento: '9.5s', retardoMovimiento: '-3.4s', rotacion: 25 },
    { x: 62, y: 76, tamanoX: 8, tamanoY: 6, opacidad: 0.3, movimientoX: -4, movimientoY: -3, duracionMovimiento: '11.9s', retardoMovimiento: '-6.6s', rotacion: -13 }
]

const PARTICULAS_INDIVIDUALES_SUAVE_BASE = [
    { x: 35, y: 70, tamanoX: 12, tamanoY: 8, opacidad: 0.18, movimientoX: 3, movimientoY: -2, duracionMovimiento: '14.3s', retardoMovimiento: '-3.1s', rotacion: -10 },
    { x: 40, y: 66, tamanoX: 10, tamanoY: 7, opacidad: 0.16, movimientoX: -4, movimientoY: -2, duracionMovimiento: '13.2s', retardoMovimiento: '-5.8s', rotacion: 15 },
    { x: 45, y: 72, tamanoX: 13, tamanoY: 9, opacidad: 0.19, movimientoX: 4, movimientoY: -2, duracionMovimiento: '15.1s', retardoMovimiento: '-2.5s', rotacion: -18 },
    { x: 50, y: 68, tamanoX: 11, tamanoY: 8, opacidad: 0.17, movimientoX: -3, movimientoY: -2, duracionMovimiento: '13.8s', retardoMovimiento: '-6.1s', rotacion: 12 },
    { x: 55, y: 74, tamanoX: 14, tamanoY: 9, opacidad: 0.2, movimientoX: 4, movimientoY: -3, duracionMovimiento: '16.4s', retardoMovimiento: '-4.3s', rotacion: -21 },
    { x: 60, y: 69, tamanoX: 10, tamanoY: 7, opacidad: 0.16, movimientoX: -4, movimientoY: -2, duracionMovimiento: '14.7s', retardoMovimiento: '-1.6s', rotacion: 9 },
    { x: 64, y: 75, tamanoX: 12, tamanoY: 8, opacidad: 0.19, movimientoX: 3, movimientoY: -2, duracionMovimiento: '15.9s', retardoMovimiento: '-7.4s', rotacion: -14 },
    { x: 42, y: 80, tamanoX: 10, tamanoY: 7, opacidad: 0.16, movimientoX: -3, movimientoY: -2, duracionMovimiento: '12.7s', retardoMovimiento: '-3.6s', rotacion: 19 },
    { x: 50, y: 83, tamanoX: 12, tamanoY: 8, opacidad: 0.18, movimientoX: 4, movimientoY: -2, duracionMovimiento: '15.6s', retardoMovimiento: '-6.8s', rotacion: -8 },
    { x: 58, y: 85, tamanoX: 9, tamanoY: 6, opacidad: 0.15, movimientoX: -3, movimientoY: -2, duracionMovimiento: '13.4s', retardoMovimiento: '-2.2s', rotacion: 13 },
    { x: 66, y: 82, tamanoX: 11, tamanoY: 7, opacidad: 0.17, movimientoX: 3, movimientoY: -2, duracionMovimiento: '14.2s', retardoMovimiento: '-5.1s', rotacion: -12 },
    { x: 46, y: 88, tamanoX: 10, tamanoY: 7, opacidad: 0.16, movimientoX: -3, movimientoY: -2, duracionMovimiento: '13.6s', retardoMovimiento: '-1.8s', rotacion: 17 }
]

function desplazarParticulasIndividuales(particulas, desplazamiento = {}) {
    const { x = 0, y = 0 } = desplazamiento
    return particulas.map((particula) => ({
        ...particula,
        x: particula.x + x,
        y: particula.y + y
    }))
}

function duplicarParticulasIndividuales(particulasBase, configuracion = {}) {
    const {
        duplicados = 0,
        pasoX = 1.2,
        pasoY = 1,
        escalaDuplicado = 0.94,
        opacidadDuplicado = 0.9
    } = configuracion

    if (duplicados <= 0) {
        return particulasBase
    }

    const particulas = [...particulasBase]

    for (let copia = 1; copia <= duplicados; copia += 1) {
        const factorTamano = Math.pow(escalaDuplicado, copia)
        const factorOpacidad = Math.pow(opacidadDuplicado, copia)

        particulasBase.forEach((particula, indice) => {
            const direccionX = indice % 2 === 0 ? 1 : -1
            const direccionY = indice % 3 === 0 ? 1 : -1
            const tamanoBaseX = particula.tamanoX ?? particula.tamano ?? 10
            const tamanoBaseY = particula.tamanoY ?? particula.tamano ?? 8

            particulas.push({
                ...particula,
                x: particula.x + direccionX * pasoX * copia,
                y: particula.y + direccionY * pasoY * copia,
                tamanoX: Math.max(2, Math.round(tamanoBaseX * factorTamano)),
                tamanoY: Math.max(2, Math.round(tamanoBaseY * factorTamano)),
                opacidad: Math.max(0.08, (particula.opacidad ?? 0.3) * factorOpacidad)
            })
        })
    }

    return particulas
}

function crearParticulasIndividualesPorPaso({ fondo = {}, fondoSuave = {} } = {}) {
    const {
        x: fondoX = 0,
        y: fondoY = 0,
        duplicados: fondoDuplicados = 0,
        pasoX: fondoPasoX = 1.2,
        pasoY: fondoPasoY = 1,
        escalaDuplicado: fondoEscala = 0.94,
        opacidadDuplicado: fondoOpacidad = 0.9
    } = fondo

    const {
        x: fondoSuaveX = 0,
        y: fondoSuaveY = 0,
        duplicados: fondoSuaveDuplicados = 0,
        pasoX: fondoSuavePasoX = 1.2,
        pasoY: fondoSuavePasoY = 1,
        escalaDuplicado: fondoSuaveEscala = 0.94,
        opacidadDuplicado: fondoSuaveOpacidad = 0.9
    } = fondoSuave

    const particulasFondoBase = desplazarParticulasIndividuales(PARTICULAS_INDIVIDUALES_FONDO_BASE, {
        x: fondoX,
        y: fondoY
    })
    const particulasFondoSuaveBase = desplazarParticulasIndividuales(PARTICULAS_INDIVIDUALES_SUAVE_BASE, {
        x: fondoSuaveX,
        y: fondoSuaveY
    })

    return {
        fondo: duplicarParticulasIndividuales(particulasFondoBase, {
            duplicados: fondoDuplicados,
            pasoX: fondoPasoX,
            pasoY: fondoPasoY,
            escalaDuplicado: fondoEscala,
            opacidadDuplicado: fondoOpacidad
        }),
        fondoSuave: duplicarParticulasIndividuales(particulasFondoSuaveBase, {
            duplicados: fondoSuaveDuplicados,
            pasoX: fondoSuavePasoX,
            pasoY: fondoSuavePasoY,
            escalaDuplicado: fondoSuaveEscala,
            opacidadDuplicado: fondoSuaveOpacidad
        })
    }
}

function combinarCapasParticulas(baseCapas, capaComun = {}, capasOverride = []) {
    const totalCapas = Math.max(baseCapas.length, capasOverride.length)
    return Array.from({ length: totalCapas }, (_, indice) => ({
        ...(baseCapas[indice] ?? baseCapas[baseCapas.length - 1]),
        ...capaComun,
        ...(capasOverride[indice] ?? {}),
        clave:
            capasOverride[indice]?.clave ??
            baseCapas[indice]?.clave ??
            `particulas-arriba-${indice + 1}`
    }))
}

const MARCADORES_PANORAMICA = [
    { x: 34, y: 23, etiqueta: 'Tanque de aireacion' },
    { x: 28, y: 70, etiqueta: 'Pretratamiento' },
    { x: 50, y: 70, etiqueta: 'Camara de espumas' },
    { x: 67, y: 23, etiqueta: 'Tanque de sedimentacion' }
]

const MARCADORES_SUPERIORES = [
    { x: 18, y: 19, etiqueta: 'Tuberia de recirculacion' },
    { x: 60, y: 7.5, etiqueta: 'Agua residual tratada' },
    { x: 70.6, y: 52, etiqueta: 'Agua residual tratada' },
    { x: 83, y: 34, etiqueta: 'Canaleta de agua clarificada' }
]

const MARCADORES_CANALETA = [
    { x: 56, y: 18.5, etiqueta: 'Agua residual tratada' },
    { x: 85, y: 22, etiqueta: 'Canaleta de agua clarificada' }
]

const PASO_BASE = {
    camaraX: 53,
    camaraY: 50,
    zoom: 2.05,
    gota: { x: 50, y: 56, escala: 0.38 },
    particulasArriba: {
        width: 'min(56vw, 900px)',
        height: 'min(44vh, 500px)',
        escala: 1,
        opacidad: 0
    },
    particulasArribaCapas: combinarCapasParticulas(
        PARTICULAS_ARRIBA_DUPLICADAS_BASE,
        {
            width: 'min(56vw, 900px)',
            height: 'min(44vh, 500px)',
            escala: 1,
            opacidad: 0
        }
    ),
    particulasFondo: {
        x: 50,
        y: 64,
        width: 'min(76vw, 1200px)',
        height: 'min(66vh, 760px)',
        escala: 1,
        opacidad: 0.86
    },
    particulasFondoSuave: {
        x: 50,
        y: 66,
        width: 'min(70vw, 980px)',
        height: 'min(58vh, 620px)',
        escala: 1,
        opacidad: 0.74
    },
    nubeParticulas: {
        x: 51,
        y: 84,
        width: 'min(58vw, 920px)',
        height: 'min(34vh, 420px)',
        escala: 1,
        opacidad: 0.52,
        desenfoque: '20px',
        grano: 0.24
    },
    particulasIndividualesFondo: PARTICULAS_INDIVIDUALES_FONDO_BASE,
    particulasIndividualesFondoSuave: PARTICULAS_INDIVIDUALES_SUAVE_BASE,
    panelContaminantes: {
        x: 50,
        y: 56
    },
    marcadores: []
}

const crearPaso = (override = {}) => {
    const particulasArribaComun = {
        ...PASO_BASE.particulasArriba,
        ...(override.particulasArriba ?? {}),
        ...(override.particulas?.arriba ?? {})
    }
    const particulasArribaCapas = combinarCapasParticulas(
        PASO_BASE.particulasArribaCapas,
        particulasArribaComun,
        override.particulasArribaCapas ?? override.particulas?.arribaCapas ?? []
    )

    return {
        ...PASO_BASE,
        ...override,
        gota: {
            ...PASO_BASE.gota,
            ...(override.gota ?? {})
        },
        particulasArriba: particulasArribaComun,
        particulasArribaCapas,
        particulasFondo: {
            ...PASO_BASE.particulasFondo,
            ...(override.particulasFondo ?? {}),
            ...(override.particulas?.fondo ?? {})
        },
        particulasFondoSuave: {
            ...PASO_BASE.particulasFondoSuave,
            ...(override.particulasFondoSuave ?? {}),
            ...(override.particulas?.fondoSuave ?? {})
        },
        nubeParticulas: {
            ...PASO_BASE.nubeParticulas,
            ...(override.nubeParticulas ?? {}),
            ...(override.particulas?.nube ?? {})
        },
        particulasIndividualesFondo:
            override.particulasIndividualesFondo ??
            override.particulasIndividuales?.fondo ??
            PASO_BASE.particulasIndividualesFondo,
        particulasIndividualesFondoSuave:
            override.particulasIndividualesFondoSuave ??
            override.particulasIndividuales?.fondoSuave ??
            PASO_BASE.particulasIndividualesFondoSuave,
        panelContaminantes: {
            ...PASO_BASE.panelContaminantes,
            ...(override.panelContaminantes ?? {})
        },
        marcadores: override.marcadores ?? PASO_BASE.marcadores
    }
}

const PASOS_RECORRIDO = [
    crearPaso({
        camaraX: 50.2,
        camaraY: 51.8,
        zoom: 1.58,
        ocultarGota: true,
        particulasArriba: {
            opacidad: 0.6,
            width: 'min(56vw, 900px)',
            height: 'min(44vh, 500px)'
        },
        particulasArribaCapas: [
            { x: 65, y: 37, escala: 0.6 },
            { x: 70, y: 55, escala: 0.6 },
            { x: 70, y: 35, escala: 0.5 },
            { x: 70, y: 59, escala: 0.5 }
        ],
        burbujaDerecha:
            'Despues del tanque de aireacion, el agua con todas esas bacterias va al sedimentador secundario. Es otro tanque grande, rectangular.'
    }),
    crearPaso({
        camaraX: 50.2,
        camaraY: 51.8,
        zoom: 1.58,
        ocultarGota: true,
        particulasArriba: {
            opacidad: 0.6,
            width: 'min(56vw, 900px)',
            height: 'min(44vh, 500px)'
        },
        particulasArribaCapas: [
            { x: 65, y: 37, escala: 0.6 },
            { x: 70, y: 55, escala: 0.6 },
            { x: 70, y: 35, escala: 0.5 },
            { x: 70, y: 59, escala: 0.5 }
        ],
        marcadores: MARCADORES_PANORAMICA,
        burbujaIzquierda: 'Y que pasa aqui, por que el agua esta tan quieta?'
    }),
    crearPaso({
        camaraX: 78,
        camaraY: 45.1,
        zoom: 3.16,
        ocultarGota: true,
        particulasArriba: {
            opacidad: 0.6,
            width: 'min(56vw, 900px)',
            height: 'min(44vh, 500px)'
        },
        particulasArribaCapas: [
            { x: 40, y: 36, escala: 1 },
            { x: 45, y: 80, escala: 1.2 },
            { x: 50, y: 35, escala: 1 },
            { x: 50, y: 59, escala: 1 }
        ],
        marcadores: MARCADORES_SUPERIORES,
        burbujaDerecha:
            'Aqui el agua se mueve de forma lenta para que los lodos y las particulas gruesas se agrupen y se vayan al fondo. Arriba queda el agua mas clara.'
    }),
    crearPaso({
        camaraX: 61.2,
        camaraY: 51,
        zoom: 2.2,
        gota: { x: 44, y: 56, escala: 0.42 },
        ocultarGota: true,
        soloTransicion: true
    }),
    crearPaso({
        camaraX: 60.9,
        camaraY: 84.4,
        zoom: 2.58,
        ocultarGota: true,
        marcadores: MARCADORES_CANALETA,
        particulasFondo: { opacidad: 0.96 },
        particulasFondoSuave: { opacidad: 9 },
        particulasIndividuales: {
            fondo: [
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -30, y: -70, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -20, y: -70, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: -70, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 20, y: -70, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 5, y: -70, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -15, y: -70, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
            ],
            fondoSuave: [
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -30, y: -70, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -20, y: -70, duplicados: 1 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: -70, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 20, y: -70, duplicados: 1 }
                }).fondoSuave
            ]
        },
        nubeParticulas: {
            x: 52,
            y: 50,
            width: 'min(60vw, 980px)',
            height: 'min(36vh, 460px)',
            escala: 1.08,
            opacidad: 0.58,
            desenfoque: '24px',
            grano: 10
        },
        burbujaIzquierda: 'Lo pesado como que? Piedras?'
    }),
    crearPaso({
        camaraX: 48.9,
        camaraY: 66.3,
        zoom: 6.57,
        gotaLimpia: true,
        gota: { x: 31, y: 42, escala: 0.31 },
        particulasFondo: { opacidad: 0.98, escala: 2 },
        particulasFondoSuave: { opacidad: 0.9, escala: 2 },
        particulasIndividuales: {
            fondo: [
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -6, y: -30, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: -35, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 10, y: -30, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 15, y: -30, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 20, y: -30, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 25, y: -30, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
            ],
            fondoSuave: [
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -6, y: -30, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: -30, duplicados: 1 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 10, y: -30, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 20, y: -30, duplicados: 1 }
                }).fondoSuave
            ]
        },
        burbujaDerecha:
            'Más que piedras, son restos de lodo y bacterias que ya hicieron su trabajo en el tanque anterior. Todo eso pesa más que el agua y, si le damos tiempo, se va hundiendo poco a poco.'
    }),
    crearPaso({
        camaraX: 60.9,
        camaraY: 84.4,
        zoom: 2.58,
        gotaLimpia: true,
        gota: { x: 27, y: 52, escala: 0.2 },
        particulasFondo: { opacidad: 0.95 },
        particulasFondoSuave: { opacidad: 0.86 },
        particulasIndividuales: {
            fondo: [
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -30, y: -70, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -20, y: -70, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: -70, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 20, y: -70, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 5, y: -70, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -15, y: -70, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
            ],
            fondoSuave: [
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -30, y: -70, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -20, y: -70, duplicados: 1 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: -70, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 20, y: -70, duplicados: 1 }
                }).fondoSuave
            ]
        },
        nubeParticulas: {
            x: 52,
            y: 50,
            width: 'min(60vw, 980px)',
            height: 'min(36vh, 460px)',
            escala: 1.08,
            opacidad: 0.58,
            desenfoque: '24px',
            grano: 10
        },
        burbujaIzquierda: 'O sea que antes mezclan todo y ahora lo dejan reposar.'
    }),
    crearPaso({
        camaraX: 60.9,
        camaraY: 84.4,
        zoom: 2.58,
        gotaLimpia: true,
        gota: { x: 43, y: 58, escala: 0.2 },
        particulasFondo: { opacidad: 0.92 },
        particulasFondoSuave: { opacidad: 0.82 },
        particulasIndividuales: {
            fondo: [
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -30, y: -70, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -20, y: -70, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: -70, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 20, y: -70, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 5, y: -70, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -15, y: -70, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
            ],
            fondoSuave: [
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -30, y: -70, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -20, y: -70, duplicados: 1 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: -70, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 20, y: -70, duplicados: 1 }
                }).fondoSuave
            ]
        },
        nubeParticulas: {
            x: 52,
            y: 50,
            width: 'min(60vw, 980px)',
            height: 'min(36vh, 460px)',
            escala: 1.08,
            opacidad: 0.58,
            desenfoque: '24px',
            grano: 10
        },
        burbujaDerecha:
            'Exactamente, es como cuando dejas un jugo con pulpa sobre la mesa: si lo dejas quieto, la pulpa se acumula abajo y arriba te queda la parte mas clara.'
    }),
    crearPaso({
        camaraX: 60.9,
        camaraY: 84.4,
        zoom: 2.58,
        gotaLimpia: true,
        gota: { x: 43, y: 60, escala: 0.2 },
        particulasFondo: { opacidad: 0.96 },
        particulasFondoSuave: { opacidad: 0.94 },
        particulasIndividuales: {
            fondo: [
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -30, y: -60, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -20, y: -60, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: -60, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 20, y: -60, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 5, y: -60, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -15, y: -60, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
            ],
            fondoSuave: [
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -30, y: -60, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -20, y: -60, duplicados: 1 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: -60, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 20, y: -60, duplicados: 1 }
                }).fondoSuave
            ]
        },
        nubeParticulas: {
            x: 52,
            y: 55,
            width: 'min(60vw, 980px)',
            height: 'min(36vh, 460px)',
            escala: 1.08,
            opacidad: 0.58,
            desenfoque: '24px',
            grano: 10
        },
        burbujaIzquierda: 'Y ustedes que aprovechan ahi, lo de arriba o lo de abajo?'
    }),
    crearPaso({
        camaraX: 60.9,
        camaraY: 84.4,
        zoom: 2.58,
        gotaLimpia: true,
        gota: { x: 50, y: 70, escala: 0.2 },
        particulasFondo: { opacidad: 0.96 },
        particulasFondoSuave: { opacidad: 0.94 },
        particulasIndividuales: {
            fondo: [
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -10, y: -40, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -5, y: -40, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: -40, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 20, y: -40, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 5, y: -40, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -15, y: -40, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
            ],
            fondoSuave: [
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -10, y: -30, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -20, y: -30, duplicados: 1 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: -30, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 20, y: -30, duplicados: 1 }
                }).fondoSuave
            ]
        },
        nubeParticulas: {
            x: 52,
            y: 60,
            width: 'min(60vw, 980px)',
            height: 'min(36vh, 460px)',
            escala: 1.08,
            opacidad: 0.58,
            desenfoque: '24px',
            grano: 10
        },
        burbujaDerechaLista: true,
        burbujaDerecha:
            'Aprovechamos las dos cosas, pero de formas diferentes:\n\n- El agua mas clara de arriba la recogemos con unas canaletas.\n\n- El lodo del fondo lo sacamos aparte para seguir tratandolo en lechos de secado.'
    }),
    crearPaso({
        camaraX: 60.9,
        camaraY: 84.4,
        zoom: 2.58,
        gotaLimpia: true,
        gota: { x: 50, y: 80, escala: 0.2 },
        particulasFondo: { opacidad: 0.96 },
        particulasFondoSuave: { opacidad: 0.94 },
        particulasIndividuales: {
            fondo: [
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -1, y: -15, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -5, y: -5, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: -1, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 0, y: 5, duplicados: 2, pasoX: 0, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: 8, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -5, y: 0, duplicados: 2, pasoX: 2, pasoY: 0.8, escalaDuplicado: 0.8 }
                }).fondo,
            ],
            fondoSuave: [
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -5, y: -10, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -1, y: -5, duplicados: 1 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: 5, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: 10, duplicados: 1 }
                }).fondoSuave
            ]
        },
        nubeParticulas: {
            x: 52,
            y: 80,
            width: 'min(60vw, 980px)',
            height: 'min(36vh, 460px)',
            escala: 1.08,
            opacidad: 0.58,
            desenfoque: '24px',
            grano: 10
        },
        burbujaDerecha:
            'Sin embargo, aunque el agua se vea clarificada aun no esta completamente tratada, ya que todavia faltan varios procesos por realizar.'
    }),
    crearPaso({
        camaraX: 60.9,
        camaraY: 84.4,
        zoom: 2.58,
        gotaLimpia: true,
        gota: { x: 60, y: 60, escala: 0.2 },
        particulasFondo: { opacidad: 0.96 },
        particulasFondoSuave: { opacidad: 0.94 },
        particulasIndividuales: {
            fondo: [
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -1, y: -15, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -5, y: -5, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: -1, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 0, y: 5, duplicados: 2, pasoX: 0, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: 8, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -5, y: 0, duplicados: 2, pasoX: 2, pasoY: 0.8, escalaDuplicado: 0.8 }
                }).fondo,
            ],
            fondoSuave: [
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -5, y: -10, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -1, y: -5, duplicados: 1 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: 5, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: 10, duplicados: 1 }
                }).fondoSuave
            ]
        },
        nubeParticulas: {
            x: 52,
            y: 80,
            width: 'min(60vw, 980px)',
            height: 'min(36vh, 460px)',
            escala: 1.08,
            opacidad: 0.58,
            desenfoque: '24px',
            grano: 10
        },
        burbujaIzquierda: 'Y cuanto tarda en cambiar de ese color cafe turbio a casi transparente?'
    }),
    crearPaso({
        camaraX: 60.9,
        camaraY: 84.4,
        zoom: 2.58,
        gotaLimpia: true,
        gota: { x: 72, y: 55, escala: 0.2 },
        particulasFondo: { opacidad: 0.96 },
        particulasFondoSuave: { opacidad: 0.94 },
        particulasIndividuales: {
            fondo: [
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -1, y: -5, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -5, y: 0, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: -1, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 0, y: 5, duplicados: 2, pasoX: 0, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: 8, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -5, y: 0, duplicados: 2, pasoX: 2, pasoY: 0.8, escalaDuplicado: 0.8 }
                }).fondo,
            ],
            fondoSuave: [
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -5, y: -10, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -1, y: -5, duplicados: 1 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: 5, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: 10, duplicados: 1 }
                }).fondoSuave
            ]
        },
        nubeParticulas: {
            x: 52,
            y: 80,
            width: 'min(60vw, 980px)',
            height: 'min(36vh, 460px)',
            escala: 1.08,
            opacidad: 0.58,
            desenfoque: '24px',
            grano: 10
        },
        burbujaDerecha:
            'El proceso toma aproximadamente cinco horas. Durante ese tiempo el color va cambiando gradualmente: empieza de un color turbio, luego se aclara un poco, despues un tono amarillento y finalmente queda casi transparente en la parte superior.'
    }),
    crearPaso({
        camaraX: 66.4,
        camaraY: 70.9,
        zoom: 5.08,
        gotaLimpia: true,
        gotaTema: 'paleta-clara',
        gota: { x: 70, y: 78, escala: 0.4 },
        particulasFondo: { opacidad: 0 },
        particulasFondoSuave: { opacidad: 0 },
        particulasIndividuales: {
            fondo: [],
            fondoSuave: []
        },
        nubeParticulas: { opacidad: 0, grano: 0 },
        mostrarPanelContaminantes: true,
        indicadoresGrandes: true,
        indicadores: [
            { clave: 'dqo', etiqueta: 'DQO', valor: 42 },
            { clave: 'dbo', etiqueta: 'DBO', valor: 36 }
        ],
        burbujaIzquierda: 'Y que sucede con el lodo que se asienta? Lo tiran?'
    }),
    crearPaso({
        camaraX: 63.1,
        camaraY: 82.4,
        zoom: 1.98,
        gotaTema: 'paleta-clara',
        gotaLimpia: true,
        gota: { x: 77, y: 45, escala: 0.15 },
        particulasFondo: { opacidad: 0.96 },
        particulasFondoSuave: { opacidad: 0.94 },
        particulasIndividuales: {
            fondo: [
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -1, y: -5, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -5, y: 0, duplicados: 2, pasoX: 2, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: -1, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 0, y: 5, duplicados: 2, pasoX: 0, pasoY: 0.8 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: 1, y: 8, duplicados: 2 }
                }).fondo,
                ...crearParticulasIndividualesPorPaso({
                    fondo: { x: -5, y: 0, duplicados: 2, pasoX: 2, pasoY: 0.8, escalaDuplicado: 0.8 }
                }).fondo,
            ],
            fondoSuave: [
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -5, y: -10, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: -1, y: -5, duplicados: 1 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: 5, duplicados: 2 }
                }).fondoSuave,
                ...crearParticulasIndividualesPorPaso({
                    fondoSuave: { x: 1, y: 10, duplicados: 1 }
                }).fondoSuave
            ]
        },
        nubeParticulas: {
            x: 52,
            y: 80,
            width: 'min(60vw, 980px)',
            height: 'min(36vh, 460px)',
            escala: 1.08,
            opacidad: 0.58,
            desenfoque: '24px',
            grano: 10
        },
        mostrarMediaFinal: true,
        mostrarBotonLechos: true,
        burbujaDerecha: 'Jamas. Ese lodo va a los lechos de secado.'
    }),
]

function limitar(valor, minimo, maximo) {
    return Math.min(Math.max(valor, minimo), maximo)
}

function redondear(valor) {
    return Number(valor.toFixed(2))
}

function obtenerEstiloParticulas(particulas) {
    return {
        left: `${particulas.x}%`,
        top: `${particulas.y}%`,
        width: particulas.width,
        height: particulas.height,
        '--particulas-escala': `${particulas.escala ?? 1}`,
        '--particulas-flujo-x': `${particulas.movimientoX ?? 0}px`,
        '--particulas-flujo-y': `${particulas.movimientoY ?? 0}px`,
        '--particulas-flujo-duracion': particulas.duracionMovimiento ?? '12s',
        '--particulas-flujo-delay': particulas.retardoMovimiento ?? '0s',
        opacity: particulas.opacidad
    }
}

function obtenerEstiloParticulaIndividual(particula) {
    return {
        left: `${particula.x}%`,
        top: `${particula.y}%`,
        width: `${particula.tamanoX ?? particula.tamano ?? 10}px`,
        height: `${particula.tamanoY ?? particula.tamano ?? 8}px`,
        opacity: particula.opacidad ?? 0.3,
        '--particula-dx': `${particula.movimientoX ?? 4}px`,
        '--particula-dy': `${particula.movimientoY ?? -3}px`,
        '--particula-duracion': particula.duracionMovimiento ?? '12s',
        '--particula-delay': particula.retardoMovimiento ?? '0s',
        '--particula-rotacion': `${particula.rotacion ?? 0}deg`,
        '--particula-radio': particula.radio ?? '56% 44% 58% 42% / 44% 56% 48% 52%'
    }
}

function Sedimentador({ onVolverAAreacion, onCompletarSedimentador, iniciarEnFinal = false }) {
    const [pasoActual, setPasoActual] = useState(() =>
        iniciarEnFinal ? PASOS_RECORRIDO.length - 1 : 0
    )
    const [abrirReproductorFinal, setAbrirReproductorFinal] = useState(false)
    const [debugCamaraActiva, setDebugCamaraActiva] = useState(import.meta.env.DEV)
    const [debugCopiado, setDebugCopiado] = useState(false)
    const [debugCamarasPorPaso, setDebugCamarasPorPaso] = useState({})
    const bloqueoScrollRef = useRef(false)
    const timeoutBloqueoRef = useRef(null)
    const timeoutAutoavanceTransicionRef = useRef(null)
    const timeoutDebugCopiadoRef = useRef(null)

    const paso = PASOS_RECORRIDO[pasoActual]
    const usarEscenarioPrincipal = pasoActual >= PASO_CAMBIO_ESCENARIO
    const fondoEscena = usarEscenarioPrincipal ? ESCENA_SEDIMENTADOR_PRINCIPAL : ESCENA_SEDIMENTADOR_ARRIBA

    const obtenerCamaraActivaPaso = useCallback(
        (pasoIndice = pasoActual) => {
            const pasoBase = PASOS_RECORRIDO[pasoIndice]
            const override = debugCamarasPorPaso[pasoIndice]
            if (!override) {
                return {
                    camaraX: pasoBase.camaraX,
                    camaraY: pasoBase.camaraY,
                    zoom: pasoBase.zoom
                }
            }
            return override
        },
        [pasoActual, debugCamarasPorPaso]
    )

    const ajustarCamaraPasoActual = useCallback(
        (actualizarCamara) => {
            setDebugCamarasPorPaso((estadoAnterior) => {
                const camaraBase =
                    estadoAnterior[pasoActual] ??
                    (() => {
                        const pasoBase = PASOS_RECORRIDO[pasoActual]
                        return {
                            camaraX: pasoBase.camaraX,
                            camaraY: pasoBase.camaraY,
                            zoom: pasoBase.zoom
                        }
                    })()

                const camaraNueva = actualizarCamara(camaraBase)
                return { ...estadoAnterior, [pasoActual]: camaraNueva }
            })
        },
        [pasoActual]
    )

    const reiniciarCamaraPasoActual = useCallback(() => {
        setDebugCamarasPorPaso((estadoAnterior) => {
            if (!estadoAnterior[pasoActual]) {
                return estadoAnterior
            }
            const nuevoEstado = { ...estadoAnterior }
            delete nuevoEstado[pasoActual]
            return nuevoEstado
        })
    }, [pasoActual])

    const copiarCamaraPasoActual = useCallback(async () => {
        const camara = obtenerCamaraActivaPaso()
        const bloque = `camaraX: ${redondear(camara.camaraX)},\ncamaraY: ${redondear(
            camara.camaraY
        )},\nzoom: ${redondear(camara.zoom)}`

        const copiarConAreaTexto = () => {
            const areaTexto = document.createElement('textarea')
            areaTexto.value = bloque
            document.body.appendChild(areaTexto)
            areaTexto.select()
            document.execCommand('copy')
            document.body.removeChild(areaTexto)
        }

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(bloque)
            } else {
                copiarConAreaTexto()
            }
        } catch {
            copiarConAreaTexto()
        }

        setDebugCopiado(true)
        if (timeoutDebugCopiadoRef.current) {
            window.clearTimeout(timeoutDebugCopiadoRef.current)
        }
        timeoutDebugCopiadoRef.current = window.setTimeout(() => {
            setDebugCopiado(false)
        }, 1200)
    }, [obtenerCamaraActivaPaso])

    useEffect(() => {
        if (!paso.soloTransicion) {
            if (timeoutAutoavanceTransicionRef.current) {
                window.clearTimeout(timeoutAutoavanceTransicionRef.current)
                timeoutAutoavanceTransicionRef.current = null
            }
            return
        }

        bloqueoScrollRef.current = true

        timeoutAutoavanceTransicionRef.current = window.setTimeout(() => {
            setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
            timeoutAutoavanceTransicionRef.current = null
        }, DURACION_AUTOAVANCE_TRANSICION)

        if (timeoutBloqueoRef.current) {
            window.clearTimeout(timeoutBloqueoRef.current)
        }
        timeoutBloqueoRef.current = window.setTimeout(() => {
            bloqueoScrollRef.current = false
            timeoutBloqueoRef.current = null
        }, DURACION_AUTOAVANCE_TRANSICION + 140)

        return () => {
            if (timeoutAutoavanceTransicionRef.current) {
                window.clearTimeout(timeoutAutoavanceTransicionRef.current)
                timeoutAutoavanceTransicionRef.current = null
            }
        }
    }, [paso])

    useEffect(() => {
        if (!paso.mostrarMediaFinal) {
            setAbrirReproductorFinal(false)
        }
    }, [paso])

    useEffect(() => {
        const manejarRueda = (event) => {
            if (bloqueoScrollRef.current || event.deltaY === 0) {
                return
            }

            if (paso.soloTransicion) {
                return
            }

            bloqueoScrollRef.current = true

            if (event.deltaY > 0) {
                if (pasoActual >= PASOS_RECORRIDO.length - 1) {
                    if (typeof onCompletarSedimentador === 'function') {
                        onCompletarSedimentador()
                    }
                } else {
                    setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
                }
            } else if (pasoActual > 0) {
                if (pasoActual === PASO_POST_CAMBIO_ESCENARIO) {
                    setPasoActual(PASO_TRANSICION_ESCENARIO)
                } else if (pasoActual === PASO_CAMBIO_ESCENARIO) {
                    setPasoActual(PASO_PREVIO_TRANSICION_ESCENARIO)
                } else {
                    setPasoActual((pasoAnterior) => Math.max(pasoAnterior - 1, 0))
                }
            } else if (typeof onVolverAAreacion === 'function') {
                onVolverAAreacion()
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
        }
    }, [pasoActual, paso, onVolverAAreacion, onCompletarSedimentador])

    useEffect(() => {
        const manejarTecladoDebug = (event) => {
            if (event.key === 'F8') {
                event.preventDefault()
                setDebugCamaraActiva((estadoAnterior) => !estadoAnterior)
                return
            }

            if (!debugCamaraActiva) {
                return
            }

            const pasoMovimiento = event.shiftKey ? 2 : event.altKey ? 0.1 : 0.5
            const pasoZoom = event.shiftKey ? 0.1 : event.altKey ? 0.01 : 0.03

            if (event.key === 'ArrowLeft') {
                event.preventDefault()
                ajustarCamaraPasoActual((camara) => ({
                    ...camara,
                    camaraX: limitar(camara.camaraX - pasoMovimiento, VALOR_MIN_CAMARA, VALOR_MAX_CAMARA)
                }))
            } else if (event.key === 'ArrowRight') {
                event.preventDefault()
                ajustarCamaraPasoActual((camara) => ({
                    ...camara,
                    camaraX: limitar(camara.camaraX + pasoMovimiento, VALOR_MIN_CAMARA, VALOR_MAX_CAMARA)
                }))
            } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                ajustarCamaraPasoActual((camara) => ({
                    ...camara,
                    camaraY: limitar(camara.camaraY - pasoMovimiento, VALOR_MIN_CAMARA, VALOR_MAX_CAMARA)
                }))
            } else if (event.key === 'ArrowDown') {
                event.preventDefault()
                ajustarCamaraPasoActual((camara) => ({
                    ...camara,
                    camaraY: limitar(camara.camaraY + pasoMovimiento, VALOR_MIN_CAMARA, VALOR_MAX_CAMARA)
                }))
            } else if (event.key === '+' || event.key === '=') {
                event.preventDefault()
                ajustarCamaraPasoActual((camara) => ({
                    ...camara,
                    zoom: limitar(camara.zoom + pasoZoom, ZOOM_MIN_CAMARA, ZOOM_MAX_CAMARA)
                }))
            } else if (event.key === '-') {
                event.preventDefault()
                ajustarCamaraPasoActual((camara) => ({
                    ...camara,
                    zoom: limitar(camara.zoom - pasoZoom, ZOOM_MIN_CAMARA, ZOOM_MAX_CAMARA)
                }))
            } else if (event.key.toLowerCase() === 'r') {
                event.preventDefault()
                reiniciarCamaraPasoActual()
            } else if (event.key.toLowerCase() === 'c') {
                event.preventDefault()
                void copiarCamaraPasoActual()
            }
        }

        window.addEventListener('keydown', manejarTecladoDebug)
        return () => {
            window.removeEventListener('keydown', manejarTecladoDebug)
        }
    }, [debugCamaraActiva, ajustarCamaraPasoActual, reiniciarCamaraPasoActual, copiarCamaraPasoActual])

    useEffect(() => {
        return () => {
            if (timeoutBloqueoRef.current) {
                window.clearTimeout(timeoutBloqueoRef.current)
            }
            if (timeoutAutoavanceTransicionRef.current) {
                window.clearTimeout(timeoutAutoavanceTransicionRef.current)
            }
            if (timeoutDebugCopiadoRef.current) {
                window.clearTimeout(timeoutDebugCopiadoRef.current)
            }
        }
    }, [])

    const camaraActiva = obtenerCamaraActivaPaso()
    const estiloPanel = {
        '--cam-x': `${camaraActiva.camaraX}%`,
        '--cam-y': `${camaraActiva.camaraY}%`,
        '--cam-zoom': `${camaraActiva.zoom}`
    }
    const estiloEscena = useMemo(
        () => ({
            backgroundImage: `url('${fondoEscena}')`
        }),
        [fondoEscena]
    )
    const estiloGota = {
        left: `${paso.gota.x}%`,
        top: `${paso.gota.y}%`,
        '--gota-escala': `${paso.gota.escala}`
    }
    const estiloNubeParticulas = {
        left: `${paso.nubeParticulas.x}%`,
        top: `${paso.nubeParticulas.y}%`,
        width: paso.nubeParticulas.width,
        height: paso.nubeParticulas.height,
        opacity: paso.nubeParticulas.opacidad,
        '--nube-escala': `${paso.nubeParticulas.escala ?? 1}`,
        '--nube-blur': paso.nubeParticulas.desenfoque ?? '20px',
        '--nube-grano': `${paso.nubeParticulas.grano ?? 0.24}`
    }
    const usarParticulasIndividuales =
        usarEscenarioPrincipal && pasoActual >= PASO_INICIO_PARTICULAS_INDIVIDUALES
    const capasParticulasActivas = usarEscenarioPrincipal
        ? [
            {
                clave: 'fondo',
                ...CAPAS_PARTICULAS_SEDIMENTADOR.fondo,
                estilo: obtenerEstiloParticulas(paso.particulasFondo)
            },
            {
                clave: 'fondoSuave',
                ...CAPAS_PARTICULAS_SEDIMENTADOR.fondoSuave,
                estilo: obtenerEstiloParticulas(paso.particulasFondoSuave)
            }
        ]
        : paso.particulasArribaCapas.map((capaParticulas, indice) => ({
            clave: capaParticulas.clave ?? `particulas-arriba-${indice + 1}`,
            clase: capaParticulas.clase,
            src: capaParticulas.src,
            estilo: obtenerEstiloParticulas(capaParticulas),
            animarArriba: true
        }))
    const gruposParticulasIndividuales = usarParticulasIndividuales
        ? [
            {
                clave: 'fondo',
                clase: 'ptar-sed__grupo-particulas ptar-sed__grupo-particulas--fondo',
                estilo: obtenerEstiloParticulas(paso.particulasFondo),
                particulas: paso.particulasIndividualesFondo
            },
            {
                clave: 'fondo-suave',
                clase: 'ptar-sed__grupo-particulas ptar-sed__grupo-particulas--suave',
                estilo: obtenerEstiloParticulas(paso.particulasFondoSuave),
                particulas: paso.particulasIndividualesFondoSuave
            }
        ]
        : []
    const estiloPanelContaminantes = {
        left: `${paso.panelContaminantes.x}%`,
        top: `${paso.panelContaminantes.y}%`
    }
    const ocultarContenidoEscena = !!paso.soloTransicion

    return (
        <main className="ptar-sed">
            <section className="ptar-sed__panel" style={estiloPanel} aria-label="Estacion sedimentador">
                <div className="ptar-sed__escena" style={estiloEscena} aria-hidden="true" />
                <div className="ptar-sed__capa-escena" aria-hidden="true" />

                {!ocultarContenidoEscena ? (
                    <>
                        {usarParticulasIndividuales ? (
                            <div className="ptar-sed__nube-lodo" style={estiloNubeParticulas} aria-hidden="true" />
                        ) : null}
                        {usarParticulasIndividuales
                            ? gruposParticulasIndividuales.map((grupoParticulas) => (
                                <div
                                    key={grupoParticulas.clave}
                                    className={grupoParticulas.clase}
                                    style={grupoParticulas.estilo}
                                    aria-hidden="true"
                                >
                                    {grupoParticulas.particulas.map((particula, indice) => (
                                        <span
                                            key={`${grupoParticulas.clave}-${indice}`}
                                            className="ptar-sed__particula-individual"
                                            style={obtenerEstiloParticulaIndividual(particula)}
                                        />
                                    ))}
                                </div>
                            ))
                            : capasParticulasActivas.map((capaParticulas) => (
                                <img
                                    key={capaParticulas.clave}
                                    className={`ptar-sed__particulas ${capaParticulas.clase} ${capaParticulas.animarArriba ? 'ptar-sed__particulas--arriba-flotando' : ''}`}
                                    src={capaParticulas.src}
                                    alt=""
                                    style={capaParticulas.estilo}
                                    aria-hidden="true"
                                />
                            ))}
                        {paso.marcadores?.length
                            ? paso.marcadores.map((marcador, indice) => (
                                <div
                                    key={`${marcador.etiqueta}-${indice}`}
                                    className="ptar-sed__marcador"
                                    style={{ left: `${marcador.x}%`, top: `${marcador.y}%` }}
                                    aria-hidden="true"
                                >
                                    <span className="ptar-sed__marcador-label">{marcador.etiqueta}</span>
                                    <span className="ptar-sed__marcador-pin" />
                                </div>
                            ))
                            : null}

                        {paso.mostrarPanelContaminantes ? (
                            <div
                                className={`ptar-sed__contaminantes ${paso.indicadoresGrandes ? 'is-grande' : ''}`}
                                style={estiloPanelContaminantes}
                                aria-hidden="true"
                            >
                                <h3>Contaminantes</h3>
                                <div className="ptar-sed__contaminantes-grid">
                                    {(paso.indicadores ?? []).map((indicador) => (
                                        <div key={indicador.clave} className="ptar-sed__indicador">
                                            <div className="ptar-sed__indicador-canal">
                                                <span
                                                    className={`ptar-sed__indicador-relleno ptar-sed__indicador-relleno--${indicador.clave}`}
                                                    style={{ height: `${indicador.valor}%` }}
                                                />
                                            </div>
                                            <span>{indicador.etiqueta}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {paso.mostrarMediaFinal ? (
                            <div className="ptar-sed__media-final">
                                <span className="ptar-sed__pin-video-final" aria-hidden="true" />
                                <button
                                    type="button"
                                    className="ptar-sed__video-preview-final"
                                    onClick={() => setAbrirReproductorFinal(true)}
                                    aria-label="Abrir video del sedimentador"
                                >
                                    <img src="/images/sedimentador/sedimentador.jpg" alt="Vista previa del sedimentador" />
                                    <span className="ptar-sed__play-icon-final" aria-hidden="true">
                                        <span className="ptar-sed__play-triangle-final" />
                                    </span>
                                </button>
                            </div>
                        ) : null}

                        {!paso.ocultarGota ? (
                            <img
                                className={`ptar-sed__gota ${paso.gotaLimpia ? 'ptar-sed__gota--limpia' : ''} ${paso.gotaTema ? `ptar-sed__gota--${paso.gotaTema}` : ''}`}
                                src="/svg/gota.svg"
                                alt="Particula de agua"
                                style={estiloGota}
                            />
                        ) : null}

                        <img
                            className="ptar-sed__avatar ptar-sed__avatar--izquierda"
                            src="/images/Estudiante%20blanco.png"
                            alt=""
                            aria-hidden="true"
                        />
                        <img
                            className="ptar-sed__avatar ptar-sed__avatar--derecha"
                            src="/images/Estudiante%20rojo.png"
                            alt=""
                            aria-hidden="true"
                        />

                        {paso.burbujaIzquierda ? (
                            <aside className="ptar-sed__burbuja ptar-sed__burbuja--izquierda ptar-sed__burbuja--blanca">
                                {paso.burbujaIzquierda}
                            </aside>
                        ) : null}

                        {paso.burbujaDerecha ? (
                            <aside
                                className={`ptar-sed__burbuja ptar-sed__burbuja--derecha ptar-sed__burbuja--roja ${paso.burbujaDerechaCompacta ? 'is-compacta' : ''} ${paso.burbujaDerechaLista ? 'is-lista' : ''}`}
                            >
                                {paso.burbujaDerecha}
                            </aside>
                        ) : null}

                        {paso.mostrarBotonLechos ? (
                            <button
                                type="button"
                                className="ptar-sed__accion ptar-sed__accion--lechos"
                                onClick={() => {
                                    if (typeof onCompletarSedimentador === 'function') {
                                        onCompletarSedimentador()
                                    }
                                }}
                            >
                                <span>IR A LECHOS DE SECADO</span>
                                <span className="ptar-sed__accion-flecha" aria-hidden="true" />
                            </button>
                        ) : null}

                        <p className="ptar-sed__paso" aria-hidden="true">
                            Paso {pasoActual + 1} de {PASOS_RECORRIDO.length}
                        </p>

                        {debugCamaraActiva ? (
                            <aside className="ptar-sed__debug-camara" role="status" aria-live="polite">
                                <p className="ptar-sed__debug-titulo">Debug camara (paso {pasoActual + 1})</p>
                                <p className="ptar-sed__debug-linea">
                                    X: {redondear(camaraActiva.camaraX)} | Y: {redondear(camaraActiva.camaraY)} | Zoom:{' '}
                                    {redondear(camaraActiva.zoom)}
                                </p>
                                <p className="ptar-sed__debug-linea">
                                    Flechas: mover | +/-: zoom | C: copiar | R: reset paso | F8: ocultar
                                </p>
                                <div className="ptar-sed__debug-botones">
                                    <button
                                        type="button"
                                        className="ptar-sed__debug-boton"
                                        onClick={() => {
                                            void copiarCamaraPasoActual()
                                        }}
                                    >
                                        {debugCopiado ? 'Copiado' : 'Copiar camara'}
                                    </button>
                                    <button
                                        type="button"
                                        className="ptar-sed__debug-boton ptar-sed__debug-boton--secundario"
                                        onClick={reiniciarCamaraPasoActual}
                                    >
                                        Reset paso
                                    </button>
                                </div>
                            </aside>
                        ) : null}

                        {abrirReproductorFinal ? (
                            <div
                                className="ptar-sed__modal"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Reproductor del sedimentador"
                            >
                                <button
                                    type="button"
                                    className="ptar-sed__modal-overlay"
                                    onClick={() => setAbrirReproductorFinal(false)}
                                    aria-label="Cerrar reproductor"
                                />
                                <div className="ptar-sed__modal-content">
                                    <button
                                        type="button"
                                        className="ptar-sed__modal-close"
                                        onClick={() => setAbrirReproductorFinal(false)}
                                        aria-label="Cerrar reproductor"
                                    >
                                        x
                                    </button>
                                    <video className="ptar-sed__video-player" controls autoPlay poster="/images/sedimentador/sedimentador.jpg">
                                        <source src="/videos/ptar.mp4" type="video/mp4" />
                                        Tu navegador no soporta este reproductor.
                                    </video>
                                </div>
                            </div>
                        ) : null}
                    </>
                ) : null}

                {paso.soloTransicion ? (
                    <div className="ptar-sed__transicion-vista" aria-hidden="true">
                        <span className="ptar-sed__transicion-capa" />
                        <span className="ptar-sed__transicion-franja ptar-sed__transicion-franja--roja" />
                        <span className="ptar-sed__transicion-franja ptar-sed__transicion-franja--vinotinto" />
                        <span className="ptar-sed__transicion-franja ptar-sed__transicion-franja--crema" />
                        <span className="ptar-sed__transicion-franja ptar-sed__transicion-franja--gris" />
                    </div>
                ) : null}
            </section>
        </main>
    )
}

export default Sedimentador
