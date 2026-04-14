# PTAR WEB - El Viaje del Agua

Aplicacion web interactiva para explicar el funcionamiento de la planta de tratamiento de aguas residuales (PTAR) de la UAO por medio de un recorrido guiado, narrado y multimedia. El proyecto esta construido como una SPA en React + Vite y combina escenas educativas, audio, video, ilustraciones y herramientas de accesibilidad.

## Objetivo

Mostrar de forma clara y atractiva el recorrido del agua dentro de la PTAR, desde el ingreso del agua residual hasta su tratamiento, almacenamiento, reutilizacion y consulta de documentacion tecnica.

## Que incluye la experiencia

- Pantalla de inicio e introduccion del recorrido.
- Seccion informativa inicial sobre la PTAR.
- Recorrido por 10 estaciones del proceso:
  - Pozo de Bombeo No. 1
  - Pretratamiento
  - Tanque de Aireación
  - Sedimentador
  - Lechos de Secado
  - Camara de Tamiz
  - Unidad de Filtración
  - Desinfección
  - Almacenamiento
  - Pozo de Bombeo No. 2
- Seccion de usos del agua tratada dentro del campus.
- Seccion final con enlaces a documentacion tecnica y oficial.
- Narracion con voces pregrabadas y sonido ambiente por escena.
- Navegacion por rueda del mouse, touchpad, gestos tactiles o botones.
- Herramientas de audio, accesibilidad, contraste y personalizacion visual.
- Soporte basico como PWA con `manifest.webmanifest` y `service worker`.

## Tecnologias

- React 19
- Vite 7
- ESLint 9
- JavaScript
- CSS modular por componente
- Vercel para despliegue estatico

## Estructura del proyecto

```text
src/
  App.jsx
  main.jsx
  components/
    Header/
    Herramientas/
    NavegacionBotones/
    Inicio/
    Informacion/
    Usos/
    Documentacion/
    Estaciones/
      Pozo1/
      Pretratamiento/
      Areacion/
      Sedimentador/
      Lechos/
      Tamizaje/
      Filtracion/
      Desinfeccion/
      Almacenamiento/
      Pozo2/
  hooks/
    useControlesNavegacion.js
    useNarracionVoces.js
    useModoNavegacion.js
  utils/
    audioSettings.js
    navigationSettings.js
    themeSettings.js
    voiceLibrary.js
public/
  audio/
  voces/
  images/
  svg/
  icons/
  manifest.webmanifest
  sw.js
```

## Flujo principal

La aplicación se controla desde `src/App.jsx`, donde se administra:

- la seccion activa del recorrido,
- la navegación entre estaciones,
- las transiciones de avance y retroceso,
- el audio ambiente,
- la persistencia de configuracion visual,
- y la apertura de secciones complementarias como `Usos` y `Documentacion`.

Cada estacion vive en su propio componente dentro de `src/components/Estaciones/` y maneja su logica interna de pasos, animaciones y dialogos.

## Funcionalidades destacadas

### Narración y audio

- Las voces se cargan desde `public/voces/`.
- Los sonidos ambiente se cargan desde `public/audio/`.
- El hook `useNarracionVoces` reproduce automaticamente la narracion del paso visible.
- El usuario puede ajustar por separado volumen de voces y musica.

### Navegación

- La experiencia puede recorrerse con rueda del mouse o touchpad.
- En dispositivos tactiles se puede avanzar o retroceder con gestos.
- Tambien existe un modo alterno con botones fijos de navegacion.

### Accesibilidad y personalización

- Modo de alto contraste.
- Edicion de colores de la interfaz.
- Persistencia de la configuracion en `localStorage`.
- Soporte para pantalla completa en escenas y uso preferente en horizontal.

### PWA

- En produccion se registra `public/sw.js`.
- El proyecto incluye `manifest.webmanifest`.
- La app puede comportarse como experiencia instalable en dispositivos compatibles.

## Requisitos

- Node.js
- npm

## Instalacion y ejecucion local

```bash
npm install
npm run dev
```

Luego abre la URL local que muestra Vite en la terminal, normalmente `http://localhost:5173`.

## Scripts disponibles

- `npm run dev`: inicia el entorno de desarrollo.
- `npm run build`: genera la version de produccion en `dist/`.
- `npm run preview`: sirve localmente la build generada.
- `npm run lint`: ejecuta ESLint sobre el proyecto.

## Edicion de contenido

Si vas a actualizar la experiencia, estos archivos son los mas importantes:

- `src/components/Estaciones/*`: logica y contenido de cada etapa del tratamiento.
- `src/components/Usos/casosUsos.jsx`: casos de reutilizacion del agua tratada.
- `src/components/Documentacion/documentacion.jsx`: enlaces externos de consulta.
- `src/components/Herramientas/herramientas.jsx`: audio, accesibilidad y modo de navegacion.
- `src/utils/themeSettings.js`: paletas, alto contraste y variables CSS.
- `src/utils/voiceLibrary.js`: mapeo de voces por seccion y personaje.
- `public/voces/`, `public/audio/`, `public/images/` y `public/svg/`: recursos multimedia.

## Despliegue

El repositorio ya incluye `vercel.json` para despliegue en Vercel con salida en `dist/`.

Flujo recomendado:

```bash
npm run build
npm run preview
```

Si deseas probar el comportamiento del `service worker`, hazlo sobre la build de produccion, ya que su registro solo ocurre cuando `import.meta.env.PROD` es verdadero.

## Consideraciones

- Es un proyecto frontend sin backend.
- Parte del contenido final usa recursos externos:
  - videos embebidos de YouTube en la seccion `Usos`,
  - enlaces de Google Drive en la seccion `Documentacion`.
- Para que la experiencia funcione correctamente, deben conservarse las rutas actuales de los archivos en `public/`.
- La app esta pensada especialmente para tablets y dispositivos moviles en orientacion horizontal.
