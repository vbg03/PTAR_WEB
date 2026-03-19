import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { obtenerDireccionScrollPorGesto } from '../../../utils/wheelStepNavigation'
import { useNarracionVoces } from '../../../hooks/useNarracionVoces'
import { construirIndicesAudioPorPaso } from '../../../utils/voiceLibrary'
import { DEBUG_CAMARA_HABILITADO } from '../../../config/debugFlags'
import {
    EVENTO_CAMBIO_CONFIG_AUDIO,
    obtenerVolumenMusica
} from '../../../utils/audioSettings'
import { useFixedSceneLayout } from '../../../hooks/useFixedSceneLayout'
import './lechos.css'

const DURACION_BLOQUEO_SCROLL = 340
const VALOR_MIN_CAMARA = -120
const VALOR_MAX_CAMARA = 220
const ZOOM_MIN_CAMARA = 0.2
const ZOOM_MAX_CAMARA = 12
const CANTIDAD_CAMAS = 4
const VIDEO_LECHOS_YOUTUBE_ID = 'FzofFJl8jIU'
const VIDEO_LECHOS_EMBED_URL = `https://www.youtube.com/embed/${VIDEO_LECHOS_YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&cc_lang_pref=es&hl=es`
const ESCENA_LECHOS = '/images/lechos/lechos-fondo.svg'
const ASSET_LODO = '/images/lechos/lodo.svg'
const TEXTURAS_SECADO = [
    '/images/lechos/lodo-seco (1).png',
    '/images/lechos/lodo-seco (2).png',
    '/images/lechos/lodo-seco (3).png',
    '/images/lechos/lodo-seco (4).png'
]
const POSICIONES_RELLENO_LECHO_BASE = [
    { x: 14.55, y: 53.3, width: 19.9, height: 69 },
    { x: 36.32, y: 53.3, width: 19.9, height: 69 },
    { x: 58.08, y: 53.3, width: 19.9, height: 69 },
    { x: 79.85, y: 53.3, width: 19.9, height: 69 }
]

const CAMA_BASE = {
    flujo: 0,
    ondas: 0,
    capaSuperior: 0,
    capaMedia: 0,
    capaFondo: 0,
    textura: 0,
    seco: 0,
    verde: 0,
    opacidadLodo: null,
    nivelLodo: null,
    secoX: null,
    secoY: null,
    secoWidth: null,
    secoHeight: null,
    secoEscala: 1,
    secoEscalaX: 1,
    secoEscalaY: 1,
    x: null,
    y: null,
    width: null,
    height: null,
    offsetX: 0,
    offsetY: 0,
    escala: 1,
    escalaX: 1,
    escalaY: 1
}

function crearCamasConBase(base = {}, variaciones = []) {
    return Array.from({ length: CANTIDAD_CAMAS }, (_, indice) => ({
        ...CAMA_BASE,
        ...base,
        ...(variaciones[indice] ?? {})
    }))
}

const CAMAS_VACIAS = crearCamasConBase({})
const CAMAS_DESCARGA_1 = crearCamasConBase(
    { flujo: 0.86, ondas: 0.62, capaSuperior: 0.16 },
    [{ capaSuperior: 0.14 }, { capaSuperior: 0.15 }, { capaSuperior: 0.14 }, { capaSuperior: 0.15 }]
)
const CAMAS_DESCARGA_2 = crearCamasConBase(
    { flujo: 0.9, ondas: 0.76, capaSuperior: 0.31, capaMedia: 0.11 },
    [{ capaSuperior: 0.29 }, {}, { capaSuperior: 0.3 }, { capaMedia: 0.13 }]
)
const CAMAS_DESCARGA_3 = crearCamasConBase(
    { flujo: 0.84, ondas: 0.68, capaSuperior: 0.35, capaMedia: 0.24, capaFondo: 0.12 },
    [{ capaFondo: 0.1 }, {}, { capaSuperior: 0.33 }, { capaFondo: 0.15 }]
)
const CAMAS_DESCARGA_4 = crearCamasConBase(
    { flujo: 0.74, ondas: 0.52, capaSuperior: 0.36, capaMedia: 0.28, capaFondo: 0.21 },
    [{ capaSuperior: 0.34 }, { capaFondo: 0.23 }, { capaMedia: 0.25 }, { capaFondo: 0.22 }]
)
const CAMAS_REPOSO = crearCamasConBase(
    { flujo: 0.26, ondas: 0.24, capaSuperior: 0.33, capaMedia: 0.27, capaFondo: 0.31 },
    [{ capaFondo: 0.33 }, { capaMedia: 0.25 }, { capaFondo: 0.29 }, { capaSuperior: 0.34 }]
)
const CAMAS_SECADO_1 = crearCamasConBase(
    {
        flujo: 0,
        ondas: 0.04,
        capaSuperior: 0.33,
        capaMedia: 0.27,
        capaFondo: 0.31,
        textura: 0.2,
        seco: 0.24,
        opacidadLodo: 0.78
    },
    [
        { textura: 0.24, seco: 0.28, opacidadLodo: 0.74 },
        { seco: 0.22, opacidadLodo: 0.8 },
        { textura: 0.26, seco: 0.27, opacidadLodo: 0.76 },
        { seco: 0.2, opacidadLodo: 0.82 }
    ]
)
const CAMAS_SECADO_2 = crearCamasConBase(
    { flujo: 0, ondas: 0, capaSuperior: 0.32, capaMedia: 0.26, capaFondo: 0.3, textura: 0.36, seco: 0.36 },
    [{ seco: 0.42 }, { seco: 0.28 }, { textura: 0.42, seco: 0.38 }, { seco: 0.4 }]
)
const CAMAS_SECADO_3 = crearCamasConBase(
    { flujo: 0, ondas: 0, capaSuperior: 0.31, capaMedia: 0.24, capaFondo: 0.28, textura: 0.5, seco: 0.58 },
    [{ seco: 0.66 }, { seco: 0.46 }, { textura: 0.58, seco: 0.6 }, { seco: 0.64 }]
)
const CAMAS_SECADO_4 = crearCamasConBase(
    { flujo: 0, ondas: 0, capaSuperior: 0.29, capaMedia: 0.22, capaFondo: 0.24, textura: 0.64, seco: 0.86 },
    [
        { seco: 0.9, capaFondo: 0.2 },
        { seco: 0.82 },
        { seco: 0.78, verde: 0.5 },
        { seco: 0.92, capaMedia: 0.2 }
    ]
)

const CHORROS_TURBIOS_BASE = [
    { clave: 'a', x: 21.65, y: 27.4, ancho: 1.9, alto: 10.8, retardo: '0s' },
    { clave: 'b', x: 40.11, y: 27.4, ancho: 1.9, alto: 11.1, retardo: '-0.4s' },
    { clave: 'c', x: 58.56, y: 27.4, ancho: 1.9, alto: 11.2, retardo: '-0.7s' },
    { clave: 'd', x: 77.05, y: 27.4, ancho: 1.9, alto: 11.3, retardo: '-1.1s' }
]

const PASO_BASE = {
    camaraX: 50,
    camaraY: 51,
    zoom: 1.58,
    flujoColector: 0.56,
    camas: CAMAS_VACIAS,
    chorrosTurbios: CHORROS_TURBIOS_BASE.map((chorro) => ({
        ...chorro,
        opacidad: 0,
        presencia: 0
    }))
}

function normalizarCamas(camas) {
    if (!Array.isArray(camas)) {
        return PASO_BASE.camas.map((cama, indice) => ({
            ...POSICIONES_RELLENO_LECHO_BASE[indice],
            ...cama
        }))
    }

    return Array.from({ length: CANTIDAD_CAMAS }, (_, indice) => ({
        ...POSICIONES_RELLENO_LECHO_BASE[indice],
        ...CAMA_BASE,
        ...(camas[indice] ?? {})
    }))
}

function normalizarChorros(chorrosTurbios) {
    const chorros = Array.isArray(chorrosTurbios) ? chorrosTurbios : []

    return CHORROS_TURBIOS_BASE.map((chorroBase, indice) => {
        const chorroPorClave = chorros.find((chorro) => (chorro.clave ?? null) === chorroBase.clave)
        const chorroPorIndice = chorros[indice]
        const override = chorroPorClave ?? chorroPorIndice

        if (!override) {
            return {
                ...chorroBase,
                opacidad: 0,
                presencia: 0
            }
        }

        return {
            ...chorroBase,
            ...override,
            opacidad: override.opacidad ?? 0.9,
            presencia: override.presencia ?? 1
        }
    })
}

const crearPaso = (override = {}) => ({
    ...PASO_BASE,
    ...override,
    camas: normalizarCamas(override.camas),
    chorrosTurbios: normalizarChorros(override.chorrosTurbios)
})

const PASOS_RECORRIDO = [
    crearPaso({
        camaraX: 50,
        camaraY: 57.5,
        zoom: 1.42,
        flujoColector: 0.55,
        camas: CAMAS_VACIAS,
        burbujaDerecha:
            'Cuando el lodo se extrae del tanque de sedimentación, presenta una consistencia aún alta en liquido. Por eso se lleva a unas "camas" especiales que se llaman lechos de secado.'
    }),
    crearPaso({
        camaraX: 50,
        camaraY: 57.5,
        zoom: 1.42,
        flujoColector: 0.72,
        chorrosTurbios: [
            { clave: 'a', x: 21.65, y: 27.4, ancho: 1.9, alto: 10.8, retardo: '0s' },
            { clave: 'b', x: 40.11, y: 27.4, ancho: 1.9, alto: 11.1, retardo: '-0.4s' },
            { clave: 'c', x: 58.56, y: 27.4, ancho: 1.9, alto: 11.2, retardo: '-0.7s' },
            { clave: 'd', x: 77.05, y: 27.4, ancho: 1.9, alto: 11.3, retardo: '-1.1s' }
        ],
        burbujaIzquierda: '¿Camas? ¿Cómo así?, ¿cómo una cama normal?'
    }),
    crearPaso({
        camaraX: 50,
        camaraY: 57.5,
        zoom: 1.42,
        flujoColector: 0.78,
        camas: [
            {
                ...CAMAS_REPOSO[0],
                nivelLodo: 1,
                x: 21.5,
                y: 39.7,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 1
            },
            {
                ...CAMAS_REPOSO[1],
                nivelLodo: 1,
                x: 40,
                y: 39.7,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 1
            },
            {
                ...CAMAS_REPOSO[2],
                nivelLodo: 1,
                x: 58.45,
                y: 39.7,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 1
            },
            {
                ...CAMAS_REPOSO[3],
                nivelLodo: 1,
                x: 76.9,
                y: 39.7,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 1
            }
        ],
        chorrosTurbios: [
            { clave: 'a', x: 21.65, y: 27.4, ancho: 1.9, alto: 10.8, retardo: '0s' },
            { clave: 'b', x: 40.11, y: 27.4, ancho: 1.9, alto: 11.1, retardo: '-0.4s' },
            { clave: 'c', x: 58.56, y: 27.4, ancho: 1.9, alto: 11.2, retardo: '-0.7s' },
            { clave: 'd', x: 77.05, y: 27.4, ancho: 1.9, alto: 11.3, retardo: '-1.1s' }
        ],
        burbujaDerecha:
            'Más o menos. Imagina una caja grande y poco profunda. Abajo tiene capas de piedra y arena para drenar, y arriba se acumula el lodo.'
    }),
    crearPaso({
        camaraX: 50,
        camaraY: 57.5,
        zoom: 1.42,
        flujoColector: 0.82,
        camas: [
            {
                ...CAMAS_REPOSO[0],
                nivelLodo: 1,
                x: 21.5,
                y: 47.5,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 1.5
            },
            {
                ...CAMAS_REPOSO[1],
                nivelLodo: 1,
                x: 40,
                y: 47.5,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 1.5
            },
            {
                ...CAMAS_REPOSO[2],
                nivelLodo: 1,
                x: 58.45,
                y: 47.5,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 1.5
            },
            {
                ...CAMAS_REPOSO[3],
                nivelLodo: 1,
                x: 76.9,
                y: 47.5,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 1.5
            }
        ],
        chorrosTurbios: [
            { clave: 'a', x: 21.65, y: 27.4, ancho: 1.9, alto: 10.8, retardo: '0s' },
            { clave: 'b', x: 40.11, y: 27.4, ancho: 1.9, alto: 11.1, retardo: '-0.4s' },
            { clave: 'c', x: 58.56, y: 27.4, ancho: 1.9, alto: 11.2, retardo: '-0.7s' },
            { clave: 'd', x: 77.05, y: 27.4, ancho: 1.9, alto: 11.3, retardo: '-1.1s' }
        ],
        burbujaIzquierda: '¿Y qué pasa cuando el lodo llega ahí?'
    }),
    crearPaso({
        camaraX: 50,
        camaraY: 57.5,
        zoom: 1.42,
        flujoColector: 0.84,
        camas: [
            {
                ...CAMAS_REPOSO[0],
                nivelLodo: 1,
                x: 21.5,
                y: 55.4,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2
            },
            {
                ...CAMAS_REPOSO[1],
                nivelLodo: 1,
                x: 40,
                y: 55.4,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2
            },
            {
                ...CAMAS_REPOSO[2],
                nivelLodo: 1,
                x: 58.45,
                y: 55.4,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2
            },
            {
                ...CAMAS_REPOSO[3],
                nivelLodo: 1,
                x: 76.9,
                y: 55.4,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2
            }
        ],
        burbujaDerecha: 'Primero, lo reparten por la superficie del lecho. El lodo queda extendido.'
    }),
    crearPaso({
        camaraX: 50,
        camaraY: 57.5,
        zoom: 1.42,
        flujoColector: 0.86,
        camas: [
            {
                ...CAMAS_REPOSO[0],
                nivelLodo: 1,
                x: 21.5,
                y: 58.5,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_REPOSO[1],
                nivelLodo: 1,
                x: 40,
                y: 58.5,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_REPOSO[2],
                nivelLodo: 1,
                x: 58.45,
                y: 58.5,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_REPOSO[3],
                nivelLodo: 1,
                x: 76.9,
                y: 58.5,
                width: 19.9,
                height: 69,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            }
        ],
        burbujaDerechaLista: true,
        burbujaDerecha:
            '1. Una parte del agua se escurre hacia abajo a través de la arena y la grava. 2. Otra parte del agua se evapora con el sol y el calor.'
    }),
    crearPaso({
        camaraX: 50,
        camaraY: 57.5,
        zoom: 1.42,
        flujoColector: 0.42,
        camas: [
            {
                ...CAMAS_SECADO_1[0],
                nivelLodo: 1,
                seco: 0.34,
                opacidadLodo: 0.66,
                secoX: 21.5,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 21.5,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[1],
                nivelLodo: 1,
                seco: 0.3,
                opacidadLodo: 0.7,
                secoX: 40,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 40,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[2],
                nivelLodo: 1,
                seco: 0.36,
                opacidadLodo: 0.64,
                secoX: 58.45,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 58.45,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[3],
                nivelLodo: 1,
                seco: 0.3,
                opacidadLodo: 0.7,
                secoX: 76.9,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 76.9,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            }
        ],
        burbujaIzquierda: '¿Cuánto se demora en secarse?'
    }),
    crearPaso({
        camaraX: 50,
        camaraY: 57.5,
        zoom: 1.42,
        flujoColector: 0.2,
        camas: [
            {
                ...CAMAS_SECADO_1[0],
                nivelLodo: 1,
                seco: 0.5,
                opacidadLodo: 0.6,
                secoX: 21.5,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 21.5,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[1],
                nivelLodo: 1,
                seco: 0.5,
                opacidadLodo: 0.6,
                secoX: 40,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 40,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[2],
                nivelLodo: 1,
                seco: 0.5,
                opacidadLodo: 0.6,
                secoX: 58.45,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 58.45,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[3],
                nivelLodo: 1,
                seco: 0.5,
                opacidadLodo: 0.6,
                secoX: 76.9,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 76.9,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            }
        ],
        burbujaDerecha:
            'Depende del clima y de cuanto lodo haya, pero no es de un día para otro. Son varios días o semanas hasta que se forma una masa casi seca, que se puede palear.'
    }),
    crearPaso({
        camaraX: 50,
        camaraY: 57.5,
        zoom: 1.42,
        flujoColector: 0.08,
        camas: [
            {
                ...CAMAS_SECADO_1[0],
                nivelLodo: 1,
                seco: 0.7,
                opacidadLodo: 0.4,
                secoX: 21.5,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 21.5,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[1],
                nivelLodo: 1,
                seco: 0.7,
                opacidadLodo: 0.4,
                secoX: 40,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 40,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[2],
                nivelLodo: 1,
                seco: 0.7,
                opacidadLodo: 0.4,
                secoX: 58.45,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 58.45,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[3],
                nivelLodo: 1,
                seco: 0.7,
                opacidadLodo: 0.4,
                secoX: 76.9,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 76.9,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            }
        ],
        burbujaIzquierda: '¿Y cuándo ya esta seco que hacen, lo botan a la basura?'
    }),
    crearPaso({
        camaraX: 50,
        camaraY: 57.5,
        zoom: 1.42,
        flujoColector: 0,
        camas: [
            {
                ...CAMAS_SECADO_1[0],
                nivelLodo: 1,
                seco: 1,
                opacidadLodo: 0,
                secoX: 21.5,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 21.5,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[1],
                nivelLodo: 1,
                seco: 1,
                opacidadLodo: 0,
                secoX: 40,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 40,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[2],
                nivelLodo: 1,
                seco: 1,
                opacidadLodo: 0,
                secoX: 58.45,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 58.45,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[3],
                nivelLodo: 1,
                seco: 1,
                opacidadLodo: 0,
                secoX: 76.9,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 76.9,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            }
        ],
        mostrarLombricompostaje: true,
        burbujaDerecha:
            'No. Una parte de ese lodo se mezcla con residuos orgánicos y se lleva a la lombricompostaje. Las lombrices lo transforman en abono.'
    }),
    crearPaso({
        camaraX: 50,
        camaraY: 57.5,
        zoom: 1.42,
        flujoColector: 0,
        camas: [
            {
                ...CAMAS_SECADO_1[0],
                nivelLodo: 1,
                seco: 1,
                opacidadLodo: 0,
                secoX: 21.5,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 21.5,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[1],
                nivelLodo: 1,
                seco: 1,
                opacidadLodo: 0,
                secoX: 40,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 40,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[2],
                nivelLodo: 1,
                seco: 1,
                opacidadLodo: 0,
                secoX: 58.45,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 58.45,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            },
            {
                ...CAMAS_SECADO_1[3],
                nivelLodo: 1,
                seco: 1,
                opacidadLodo: 0,
                secoX: 76.9,
                secoY: 58.6,
                secoWidth: 19.9,
                secoHeight: 69,
                secoEscala: 1,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 76.9,
                y: 58.5,
                width: 19.9,
                height: 32,
                escala: 1,
                escalaX: 0.85,
                escalaY: 2.2
            }
        ],
        burbujaDerechaCompacta: true,
        burbujaDerecha:
            'Y la otra parte restante la incineran, porque las lombrices no se lo comen.'
    }),
    crearPaso({
        camaraX: 50,
        camaraY: 43.1,
        zoom: 1.06,
        flujoColector: 0,
        camas: [
            {
                ...CAMAS_SECADO_1[0],
                nivelLodo: 1,
                seco: 1,
                opacidadLodo: 0,
                secoX: 30,
                secoY: 67,
                secoWidth: 19.9,
                secoHeight: 70,
                secoEscala: 2,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 28.56,
                y: 66.5,
                width: 19.9,
                height: 31,
                escala: 0.2,
                escalaX: 0.65,
                escalaY: 1.65
            },
            {
                ...CAMAS_SECADO_1[1],
                nivelLodo: 1,
                seco: 1,
                opacidadLodo: 0,
                secoX: 41,
                secoY: 67,
                secoWidth: 19.9,
                secoHeight: 70,
                secoEscala: 2,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 42.7,
                y: 66.5,
                width: 19.9,
                height: 31,
                escala: 0.2,
                escalaX: 0.65,
                escalaY: 1.65
            },
            {
                ...CAMAS_SECADO_1[2],
                nivelLodo: 1,
                seco: 1,
                opacidadLodo: 0,
                secoX: 56.45,
                secoY: 67,
                secoWidth: 19.9,
                secoHeight: 70,
                secoEscala: 2,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 56.2,
                y: 66.5,
                width: 19.9,
                height: 31,
                escala: 0.2,
                escalaX: 0.65,
                escalaY: 1.65
            },
            {
                ...CAMAS_SECADO_1[3],
                nivelLodo: 1,
                seco: 1,
                opacidadLodo: 0,
                secoX: 69.9,
                secoY: 67,
                secoWidth: 19.9,
                secoHeight: 70,
                secoEscala: 2,
                secoEscalaX: 1.2,
                secoEscalaY: 0.456,
                x: 70.1,
                y: 66.5,
                width: 19.9,
                height: 31,
                escala: 0.2,
                escalaX: 0.65,
                escalaY: 1.65
            }
        ],
        mostrarMediaFinal: true,
        burbujaIzquierda: 'Interesante...¿y el agua después del sedimentador hacia donde va?',
        mostrarBotonTamizaje: true
    })
]

const INDICES_AUDIO_BLANCO = construirIndicesAudioPorPaso(
    PASOS_RECORRIDO,
    'burbujaIzquierda'
)
const INDICES_AUDIO_ROJO = construirIndicesAudioPorPaso(
    PASOS_RECORRIDO,
    'burbujaDerecha'
)
const AUDIO_SONIDO_LECHOS = '/audio/sonido-lechos.mp3'
const VOLUMEN_MAXIMO_SONIDO_LECHOS = 0.2
const PASO_AUDIO_LECHOS_INICIO = 1
const PASO_AUDIO_LECHOS_FIN = 3
const DURACION_FADE_AUDIO_LECHOS_MS = 520
const DURACION_FADE_SALIDA_AUDIO_LECHOS_MS = 360
const INTERVALO_FADE_AUDIO_LECHOS_MS = 32

function limitar(valor, minimo, maximo) {
    return Math.min(Math.max(valor, minimo), maximo)
}

function limitarUnidad(valor) {
    return limitar(valor ?? 0, 0, 1)
}

function redondear(valor) {
    return Number(valor.toFixed(2))
}

function obtenerEstiloChorroTurbio(chorro, indice) {
    const presencia = limitarUnidad(chorro.presencia ?? (chorro.opacidad > 0 ? 1 : 0))
    const opacidadBase = limitarUnidad(chorro.opacidad ?? 0.9)

    return {
        left: `${chorro.x}%`,
        top: `${chorro.y}%`,
        '--chorro-ancho': `${chorro.ancho ?? 1.9}%`,
        '--chorro-alto': `${chorro.alto ?? 11}%`,
        '--chorro-opacidad': `${opacidadBase * presencia}`,
        '--chorro-presencia': `${presencia}`,
        '--chorro-retardo': chorro.retardo ?? `${-0.32 * indice}s`
    }
}

function obtenerEstiloCama(cama) {
    const escalaBase = cama.escala ?? 1
    const escalaX = cama.escalaX ?? escalaBase
    const escalaY = cama.escalaY ?? escalaBase
    const opacidadLodoPorSecado = limitar(1 - limitarUnidad(cama.seco) * 0.75, 0.28, 1)
    const opacidadLodo = limitarUnidad(cama.opacidadLodo ?? opacidadLodoPorSecado)

    return {
        '--flujo-opacidad': `${limitarUnidad(cama.flujo)}`,
        '--ondas-opacidad': `${limitarUnidad(cama.ondas)}`,
        '--textura-opacidad': `${limitarUnidad(cama.textura)}`,
        '--secado-opacidad': `${limitarUnidad(cama.seco)}`,
        '--verde-opacidad': `${limitarUnidad(cama.verde)}`,
        '--lodo-opacidad': `${opacidadLodo}`,
        '--relleno-escala': `${escalaBase}`,
        '--relleno-escala-x': `${escalaX}`,
        '--relleno-escala-y': `${escalaY}`
    }
}

function obtenerDimensionesRellenoLecho(cama, indice) {
    const posicionBase = POSICIONES_RELLENO_LECHO_BASE[indice] ?? POSICIONES_RELLENO_LECHO_BASE[0]
    const xBase = cama.x ?? posicionBase.x
    const yBase = cama.y ?? posicionBase.y
    const widthBase = cama.width ?? posicionBase.width
    const heightBase = cama.height ?? posicionBase.height
    const xFinal = xBase + (cama.offsetX ?? 0)
    const yFinal = yBase + (cama.offsetY ?? 0)

    return {
        xFinal,
        yFinal,
        widthBase,
        heightBase,
        widthSafe: Math.abs(widthBase) > 0.0001 ? widthBase : 0.0001,
        heightSafe: Math.abs(heightBase) > 0.0001 ? heightBase : 0.0001
    }
}

function obtenerEstiloRellenoLecho(cama, indice) {
    const { xFinal, yFinal, widthBase, heightBase } = obtenerDimensionesRellenoLecho(cama, indice)

    return {
        ...obtenerEstiloCama(cama),
        left: `${xFinal}%`,
        top: `${yFinal}%`,
        width: `${widthBase}%`,
        height: `${heightBase}%`
    }
}

function obtenerEstiloRellenoSeco(cama, indice) {
    const { xFinal, yFinal, widthBase, heightBase, widthSafe, heightSafe } = obtenerDimensionesRellenoLecho(cama, indice)
    const secoX = cama.secoX ?? xFinal
    const secoY = cama.secoY ?? yFinal
    const secoWidth = cama.secoWidth ?? widthBase
    const secoHeight = cama.secoHeight ?? heightBase
    const secoEscalaBase = cama.secoEscala ?? 1
    const secoEscalaX = cama.secoEscalaX ?? secoEscalaBase
    const secoEscalaY = cama.secoEscalaY ?? secoEscalaBase
    const leftRel = ((secoX - xFinal) / widthSafe) * 100 + 50
    const topRel = ((secoY - yFinal) / heightSafe) * 100 + 50
    const widthRel = (secoWidth / widthSafe) * 100
    const heightRel = (secoHeight / heightSafe) * 100

    return {
        left: `${leftRel}%`,
        top: `${topRel}%`,
        width: `${widthRel}%`,
        height: `${heightRel}%`,
        '--seco-escala-x': `${secoEscalaX}`,
        '--seco-escala-y': `${secoEscalaY}`
    }
}

function obtenerEstiloCapaLodoUnica(cama) {
    const nivelPorCapas = (cama.capaSuperior ?? 0) + (cama.capaMedia ?? 0) + (cama.capaFondo ?? 0)
    const nivelLodo = limitarUnidad(cama.nivelLodo ?? nivelPorCapas)
    const altura = nivelLodo * 100

    return {
        top: `${100 - altura}%`,
        height: `${altura}%`
    }
}

function obtenerCapasCama(cama) {
    const superiorBase = limitarUnidad(cama.capaSuperior)
    const mediaBase = limitarUnidad(cama.capaMedia)
    const fondoBase = limitarUnidad(cama.capaFondo)
    const total = superiorBase + mediaBase + fondoBase
    const factor = total > 1 ? 1 / total : 1
    const superior = superiorBase * factor
    const media = mediaBase * factor
    const fondo = fondoBase * factor
    const offsetMedia = superior * 100
    const offsetFondo = (superior + media) * 100

    return {
        superior: {
            top: '0%',
            height: `${superior * 100}%`
        },
        media: {
            top: `${offsetMedia}%`,
            height: `${media * 100}%`
        },
        fondo: {
            top: `${offsetFondo}%`,
            height: `${fondo * 100}%`
        }
    }
}

function Lechos({ onVolverASedimentador, onCompletarLechos, iniciarEnFinal = false }) {
    const [pasoActual, setPasoActual] = useState(0)
    const [debugCamaraActiva, setDebugCamaraActiva] = useState(DEBUG_CAMARA_HABILITADO)
    const [debugCopiado, setDebugCopiado] = useState(false)
    const [debugCamarasPorPaso, setDebugCamarasPorPaso] = useState({})
    const [abrirReproductorFinal, setAbrirReproductorFinal] = useState(false)
    const [mostrarResumenFinal, setMostrarResumenFinal] = useState(false)
    const bloqueoScrollRef = useRef(false)
  const acumulacionScrollRef = useRef(0)
  const ultimaMarcaScrollRef = useRef(0)
  const ultimaActivacionScrollRef = useRef(0)
    const timeoutBloqueoRef = useRef(null)
    const timeoutDebugCopiadoRef = useRef(null)
    const audioLechosRef = useRef(null)
    const fadeAudioLechosRef = useRef(null)
    const volumenMusicaRef = useRef(obtenerVolumenMusica())

    const obtenerAudioLechos = useCallback(() => {
        if (audioLechosRef.current) {
            return audioLechosRef.current
        }

        const audio = new Audio(AUDIO_SONIDO_LECHOS)
        audio.preload = 'auto'
        audio.loop = true
        audio.volume = 0
        audioLechosRef.current = audio
        return audio
    }, [])

    const obtenerVolumenObjetivoLechos = useCallback(() => {
        const volumenMusica = limitar(volumenMusicaRef.current, 0, 1)
        return Math.min(volumenMusica, VOLUMEN_MAXIMO_SONIDO_LECHOS)
    }, [])

    const limpiarFadeAudioLechos = useCallback(() => {
        if (!fadeAudioLechosRef.current) {
            return
        }
        window.clearInterval(fadeAudioLechosRef.current)
        fadeAudioLechosRef.current = null
    }, [])

    const ejecutarFadeAudioLechos = useCallback(
        (
            audio,
            volumenDestino,
            { duracionMs = DURACION_FADE_AUDIO_LECHOS_MS, alFinal = null } = {}
        ) => {
            if (!audio) {
                return
            }

            const volumenInicio = limitar(audio.volume, 0, 1)
            const volumenFinal = limitar(volumenDestino, 0, 1)
            const diferencia = volumenFinal - volumenInicio

            if (Math.abs(diferencia) < 0.001) {
                audio.volume = volumenFinal
                if (typeof alFinal === 'function') {
                    alFinal()
                }
                return
            }

            limpiarFadeAudioLechos()

            const pasos = Math.max(
                1,
                Math.round(duracionMs / INTERVALO_FADE_AUDIO_LECHOS_MS)
            )
            let paso = 0

            fadeAudioLechosRef.current = window.setInterval(() => {
                paso += 1
                const progreso = paso / pasos
                audio.volume = limitar(
                    volumenInicio + diferencia * progreso,
                    0,
                    1
                )

                if (paso >= pasos) {
                    limpiarFadeAudioLechos()
                    audio.volume = volumenFinal
                    if (typeof alFinal === 'function') {
                        alFinal()
                    }
                }
            }, INTERVALO_FADE_AUDIO_LECHOS_MS)
        },
        [limpiarFadeAudioLechos]
    )

    const paso = PASOS_RECORRIDO[pasoActual]
    const indiceAudioIzquierda = paso.burbujaIzquierda
        ? INDICES_AUDIO_BLANCO[pasoActual]
        : null
    const indiceAudioDerecha = paso.burbujaDerecha
        ? INDICES_AUDIO_ROJO[pasoActual]
        : null
    const colorAudioActivo = indiceAudioDerecha
        ? 'rojo'
        : indiceAudioIzquierda
            ? 'blanco'
            : null
    const indiceAudioActivo = indiceAudioDerecha ?? indiceAudioIzquierda ?? null

    useNarracionVoces({
        seccion: 'lechos',
        colorActivo: colorAudioActivo,
        indiceActivo: indiceAudioActivo
    })

    useEffect(() => {
        setPasoActual(iniciarEnFinal ? PASOS_RECORRIDO.length - 1 : 0)
        setAbrirReproductorFinal(false)
    }, [iniciarEnFinal])

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
        if (!paso.mostrarMediaFinal) {
            setAbrirReproductorFinal(false)
            setMostrarResumenFinal(false)
        }
    }, [paso])

    useEffect(() => {
        const actualizarVolumenMusica = (event) => {
            const volumenEvento = Number(event?.detail?.volumenMusica)
            volumenMusicaRef.current = Number.isFinite(volumenEvento)
                ? limitar(volumenEvento, 0, 100) / 100
                : obtenerVolumenMusica()

            const audio = audioLechosRef.current
            const debeSonarEnPasoActual =
                pasoActual >= PASO_AUDIO_LECHOS_INICIO &&
                pasoActual <= PASO_AUDIO_LECHOS_FIN

            if (audio && debeSonarEnPasoActual) {
                ejecutarFadeAudioLechos(audio, obtenerVolumenObjetivoLechos(), {
                    duracionMs: 180
                })
            }
        }

        window.addEventListener(EVENTO_CAMBIO_CONFIG_AUDIO, actualizarVolumenMusica)
        return () => {
            window.removeEventListener(
                EVENTO_CAMBIO_CONFIG_AUDIO,
                actualizarVolumenMusica
            )
        }
    }, [ejecutarFadeAudioLechos, obtenerVolumenObjetivoLechos, pasoActual])

    useEffect(() => {
        const debeSonarEnPasoActual =
            pasoActual >= PASO_AUDIO_LECHOS_INICIO &&
            pasoActual <= PASO_AUDIO_LECHOS_FIN

        if (debeSonarEnPasoActual) {
            const audio = obtenerAudioLechos()
            const volumenObjetivo = obtenerVolumenObjetivoLechos()

            if (!audio.paused) {
                ejecutarFadeAudioLechos(audio, volumenObjetivo)
                return
            }

            audio.currentTime = 0
            audio.volume = 0
            const promesaReproduccion = audio.play()
            if (promesaReproduccion && typeof promesaReproduccion.then === 'function') {
                promesaReproduccion
                    .then(() => {
                        ejecutarFadeAudioLechos(audio, volumenObjetivo)
                    })
                    .catch(() => { })
            } else {
                ejecutarFadeAudioLechos(audio, volumenObjetivo)
            }
            return
        }

        if (!audioLechosRef.current) {
            return
        }

        const audio = audioLechosRef.current
        ejecutarFadeAudioLechos(audio, 0, {
            duracionMs: DURACION_FADE_SALIDA_AUDIO_LECHOS_MS,
            alFinal: () => {
                audio.pause()
                audio.currentTime = 0
            }
        })
    }, [ejecutarFadeAudioLechos, obtenerAudioLechos, obtenerVolumenObjetivoLechos, pasoActual])

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

            if (direccionScroll > 0) {
                setPasoActual((pasoAnterior) => Math.min(pasoAnterior + 1, PASOS_RECORRIDO.length - 1))
            } else if (pasoActual > 0) {
                setPasoActual((pasoAnterior) => Math.max(pasoAnterior - 1, 0))
            } else if (typeof onVolverASedimentador === 'function') {
                onVolverASedimentador()
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
    }, [pasoActual, onVolverASedimentador])

    useEffect(() => {
        const manejarTecladoDebug = (event) => {
            if (DEBUG_CAMARA_HABILITADO && event.key === 'F8') {
                event.preventDefault()
                setDebugCamaraActiva((estadoAnterior) => !estadoAnterior)
                return
            }

            if (!DEBUG_CAMARA_HABILITADO || !debugCamaraActiva) {
                return
            }

            const pasoMovimiento = event.shiftKey ? 2.4 : 0.6
            const pasoZoom = event.shiftKey ? 0.12 : 0.04

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
            if (timeoutDebugCopiadoRef.current) {
                window.clearTimeout(timeoutDebugCopiadoRef.current)
            }
            limpiarFadeAudioLechos()
            if (audioLechosRef.current) {
                audioLechosRef.current.pause()
                audioLechosRef.current.currentTime = 0
                audioLechosRef.current = null
            }
        }
    }, [limpiarFadeAudioLechos])

    const camaraActiva = obtenerCamaraActivaPaso()
    const { viewportRef, estiloEscenaFija } = useFixedSceneLayout()
    const estiloPanel = {
        '--cam-x': `${camaraActiva.camaraX}%`,
        '--cam-y': `${camaraActiva.camaraY}%`,
        '--cam-zoom': `${camaraActiva.zoom}`,
        ...(estiloEscenaFija ?? {})
    }
    const estiloEscena = useMemo(
        () => ({
            backgroundImage: `url('${ESCENA_LECHOS}')`
        }),
        []
    )

    return (
        <main className="ptar-lec" ref={viewportRef}>
            <section className="ptar-lec__panel" style={estiloPanel} aria-label="Estacion Lechos de secado">
                <div className="ptar-lec__escena" style={estiloEscena} aria-hidden="true" />
                <div className="ptar-lec__capa-escena" aria-hidden="true" />
                <div className="ptar-lec__rellenos-lodo" aria-hidden="true">
                    {paso.camas.map((cama, indice) => {
                        const capas = obtenerCapasCama(cama)
                        const mostrarCapaLodoUnica = cama.nivelLodo !== null && cama.nivelLodo !== undefined
                        return (
                            <div
                                key={`relleno-${indice + 1}`}
                                className="ptar-lec__relleno-lecho"
                                style={obtenerEstiloRellenoLecho(cama, indice)}
                            >
                                {mostrarCapaLodoUnica ? (
                                    <span className="ptar-lec__relleno-capa-unica" style={obtenerEstiloCapaLodoUnica(cama)} />
                                ) : (
                                    <>
                                        <img
                                            className="ptar-lec__relleno-capa ptar-lec__relleno-capa--superior"
                                            src={ASSET_LODO}
                                            alt=""
                                            style={capas.superior}
                                        />
                                        <img
                                            className="ptar-lec__relleno-capa ptar-lec__relleno-capa--media"
                                            src={ASSET_LODO}
                                            alt=""
                                            style={capas.media}
                                        />
                                        <img
                                            className="ptar-lec__relleno-capa ptar-lec__relleno-capa--fondo"
                                            src={ASSET_LODO}
                                            alt=""
                                            style={capas.fondo}
                                        />
                                    </>
                                )}
                                <span className="ptar-lec__relleno-textura" />
                                <img
                                    className="ptar-lec__relleno-seco"
                                    src={TEXTURAS_SECADO[indice]}
                                    alt=""
                                    style={obtenerEstiloRellenoSeco(cama, indice)}
                                />
                                <span className="ptar-lec__relleno-verde" />
                            </div>
                        )
                    })}
                </div>
                {paso.chorrosTurbios?.length ? (
                    <div className="ptar-lec__chorros-turbios" aria-hidden="true">
                        {paso.chorrosTurbios.map((chorro, indice) => (
                            <div
                                key={chorro.clave ?? `chorro-${indice + 1}`}
                                className="ptar-lec__chorro"
                                style={obtenerEstiloChorroTurbio(chorro, indice)}
                            >
                                <span className="ptar-lec__chorro-columna" />
                                <span className="ptar-lec__chorro-sombra" />
                                <div className="ptar-lec__chorro-ondas">
                                    <span className="ptar-lec__chorro-onda ptar-lec__chorro-onda--a" />
                                    <span className="ptar-lec__chorro-onda ptar-lec__chorro-onda--b" />
                                    <span className="ptar-lec__chorro-onda ptar-lec__chorro-onda--c" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}

                {paso.mostrarLombricompostaje ? (
                    <img
                        className="ptar-lec__lombricompostaje"
                        src="/images/lechos/lombricompostaje.png"
                        alt="Aprovechamiento del lodo en lombricultura"
                    />
                ) : null}

                {paso.mostrarMediaFinal ? (
                    <div className="ptar-lec__media-final">
                        <div className={`ptar-lec__media-final-track ${mostrarResumenFinal ? 'is-summary-open' : ''}`}>
                            <span className="ptar-lec__pin-video-final" aria-hidden="true" />
                            <button
                                type="button"
                                className="ptar-lec__video-preview-final"
                                onClick={() => setAbrirReproductorFinal(true)}
                                aria-label="Abrir video de lechos de secado"
                            >
                                <img src="/images/lechos/lechos.png" alt="Vista previa de lechos de secado" />
                                <span className="ptar-lec__play-icon-final" aria-hidden="true">
                                    <span className="ptar-lec__play-triangle-final" />
                                </span>
                            </button>

                            <div className="ptar-lec__resumen-wrap-final">
                                <button
                                    type="button"
                                    className="ptar-lec__resumen-toggle-final"
                                    onClick={() => setMostrarResumenFinal((estadoAnterior) => !estadoAnterior)}
                                    aria-expanded={mostrarResumenFinal}
                                    aria-controls="ptar-lec-resumen-final"
                                    aria-label={mostrarResumenFinal ? 'Ocultar resumen' : 'Mostrar resumen'}
                                >
                                    <span
                                        className={`ptar-lec__resumen-chevron-final ${mostrarResumenFinal ? 'is-open' : ''}`}
                                        aria-hidden="true"
                                    />
                                </button>
                                <aside
                                    id="ptar-lec-resumen-final"
                                    className={`ptar-lec__resumen-final ${mostrarResumenFinal ? 'is-open' : ''}`}
                                >
                                    <h3>Resumen de lechos de secado</h3>
                                    <p>
                                        El lodo se extiende en camas, pierde agua por drenaje y evaporacion, y se
                                        transforma en un material mas seco para su manejo y aprovechamiento.
                                    </p>
                                </aside>
                            </div>
                        </div>
                    </div>
                ) : null}

                <img
                    className="ptar-lec__avatar ptar-lec__avatar--izquierda"
                    src="/images/Estudiante%20blanco.png"
                    alt=""
                    aria-hidden="true"
                />
                <img
                    className="ptar-lec__avatar ptar-lec__avatar--derecha"
                    src="/images/Estudiante%20rojo.png"
                    alt=""
                    aria-hidden="true"
                />

                {paso.burbujaIzquierda ? (
                    <aside
                        key={`izquierda-${pasoActual}-${paso.burbujaIzquierda}`}
                        className="ptar-lec__burbuja ptar-lec__burbuja--izquierda ptar-lec__burbuja--blanca"
                    >
                        {paso.burbujaIzquierda}
                    </aside>
                ) : null}

                {paso.burbujaDerecha ? (
                    <aside
                        key={`derecha-${pasoActual}-${paso.burbujaDerecha}`}
                        className={`ptar-lec__burbuja ptar-lec__burbuja--derecha ptar-lec__burbuja--roja ${paso.burbujaDerechaCompacta ? 'is-compacta' : ''
                            } ${paso.burbujaDerechaLista ? 'is-lista' : ''}`}
                    >
                        {paso.burbujaDerecha}
                    </aside>
                ) : null}

                {paso.mostrarBotonTamizaje ? (
                    <button
                        type="button"
                        className="ptar-lec__accion-regresar"
                        onClick={() => {
                            if (typeof onCompletarLechos === 'function') {
                                onCompletarLechos()
                            }
                        }}
                    >
                        <span className="ptar-lec__accion-icono ptar-lec__accion-icono--avance" aria-hidden="true">
                            <span />
                        </span>
                        IR A CAMARA DE TAMIZ
                    </button>
                ) : null}

                {debugCamaraActiva ? (
                    <aside className="ptar-lec__debug-camara" role="status" aria-live="polite">
                        <p className="ptar-lec__debug-titulo">Debug camara (paso {pasoActual + 1})</p>
                        <p className="ptar-lec__debug-linea">
                            X: {redondear(camaraActiva.camaraX)} | Y: {redondear(camaraActiva.camaraY)} | Zoom:{' '}
                            {redondear(camaraActiva.zoom)}
                        </p>
                        <p className="ptar-lec__debug-linea">
                            Flechas: mover | +/-: zoom | C: copiar | R: reset paso | F8: ocultar
                        </p>
                        <div className="ptar-lec__debug-botones">
                            <button
                                type="button"
                                className="ptar-lec__debug-boton"
                                onClick={() => {
                                    void copiarCamaraPasoActual()
                                }}
                            >
                                {debugCopiado ? 'Copiado' : 'Copiar camara'}
                            </button>
                            <button
                                type="button"
                                className="ptar-lec__debug-boton ptar-lec__debug-boton--secundario"
                                onClick={reiniciarCamaraPasoActual}
                            >
                                Reset paso
                            </button>
                        </div>
                    </aside>
                ) : null}

                {abrirReproductorFinal ? (
                    <div className="ptar-lec__modal" role="dialog" aria-modal="true" aria-label="Reproductor de lechos de secado">
                        <button
                            type="button"
                            className="ptar-lec__modal-overlay"
                            onClick={() => setAbrirReproductorFinal(false)}
                            aria-label="Cerrar reproductor"
                        />
                        <div className="ptar-lec__modal-content">
                            <button
                                type="button"
                                className="ptar-lec__modal-close"
                                onClick={() => setAbrirReproductorFinal(false)}
                                aria-label="Cerrar reproductor"
                            >
                                x
                            </button>
                            <iframe
                                className="ptar-lec__video-player ptar-lec__video-player--iframe"
                                title="Video de lechos de secado"
                                src={VIDEO_LECHOS_EMBED_URL}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    </div>
                ) : null}
            </section>
        </main>
    )
}

export default Lechos


