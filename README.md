# Tazodoro

Un Pomodoro de café: la bebida que eliges se vacía al ritmo del tiempo y se vuelve a llenar en los descansos. La taza es el reloj.

**Pruébalo en <https://luisper14008-blip.github.io/tazodoro/>**

Es una página web hecha con HTML, CSS y JavaScript puros. No tiene cuentas, ni servidor propio, ni rastreo: todo lo que guardas se queda en tu navegador.

## Qué trae

- **Doce bebidas** dibujadas en código, cada una con su manera de vaciarse: americano, espresso, cappuccino, latte, mocha, caramel macchiato, cold brew, frappé, matcha latte, chai latte, chocolate caliente y bubble tea. Se eligen en la carta, junto con el tamaño (pequeña 15 min, mediana 25, grande 50 o personalizada de 5 a 90).
- **Descansos que vuelven a servir la taza**: la cafetera, la jarrita de leche, la tetera, la licuadora o la coctelera, según la bebida.
- **Cuatro temas**: Cafetería nocturna (lluvia en la ventana), Pastel kawaii (la bebida tiene carita), Retro de cafetería y Kraft natural.
- **Sonidos de ambiente**: murmullo de cafetería, lluvia y cafetera, cada uno con su volumen, y una campanita al terminar.
- **Tareas**: anota lo que quieres terminar y cuántas tazas crees que te tomará; cada taza terminada suma a la tarea en curso.
- **Estadísticas**: tazas y minutos de hoy, racha de días, los últimos siete días y tu bebida favorita. Puedes descargar tus datos o borrarlos.
- **Ventana flotante** (Chrome y Edge de computador): la bebida y el reloj encima de tus otras ventanas.
- **Avisos** al terminar una taza o un descanso, también en Android.

Atajos de teclado: **Espacio** empieza o pausa, **R** reinicia, **S** salta.

## Probarlo en tu computador

Los módulos de JavaScript no cargan abriendo `index.html` con doble clic: hace falta un servidor local. Con [Node.js](https://nodejs.org) instalado:

```bash
node herramientas/servidor.mjs
```

Y abre <http://localhost:4173>. Cualquier otro servidor de archivos estáticos sirve igual.

## Publicarlo

No hay paso de compilación: se publica la carpeta tal cual, con `index.html` en la raíz. Todas las rutas son relativas, así que funciona también dentro de una subcarpeta.

- **GitHub Pages**: sube el repositorio y, en *Settings → Pages*, elige *Deploy from a branch*, la rama `main` y la carpeta `/ (root)`.
- **Netlify**: arrastra la carpeta a <https://app.netlify.com/drop>, o conecta el repositorio sin comando de compilación y con `.` como carpeta de publicación.

Los avisos en Android y la instalación como app necesitan HTTPS (GitHub Pages y Netlify lo dan solos). Las carpetas `referencias/` y `capturas/` no se suben: están en `.gitignore`.

## Tus datos

Todo se guarda en el `localStorage` de tu navegador, con la clave `tazodoro`: ajustes, tareas e historial de tazas (se guardan los últimos 400 días). Nada sale de tu equipo. En *Estadísticas* puedes descargar todo como JSON o borrar el historial y las tareas.

Las letras de cada tema se cargan desde Google Fonts, así que al abrir la página tu navegador las pide a los servidores de Google. Si prefieres evitarlo, se pueden descargar y servir desde la misma carpeta.

## Navegadores

Funciona en Chrome, Edge, Firefox y Safari recientes, en computador y celular.

- La ventana flotante usa *Document Picture-in-Picture*, que por ahora solo existe en Chrome y Edge de computador. En los demás, el botón no aparece.
- Los avisos dependen de que la pestaña siga viva. Con la pestaña en segundo plano, algunos navegadores (sobre todo en celulares) la pausan y el aviso puede llegar al volver. El tiempo nunca se pierde: se calcula con la hora de término.
- En iPhone y iPad, los avisos solo funcionan si agregas Tazodoro a la pantalla de inicio.

## Modo de prueba

Agrega `?prueba=1` a la dirección: el tiempo corre 60 veces más rápido y aparece un panel para mover el progreso a mano. Usa otra clave de guardado, así que no toca tus datos reales. Otros parámetros:

| Parámetro | Qué hace |
|---|---|
| `bebida=latte` | Elige la bebida |
| `tema=retro` | Elige el tema (`nocturna`, `kawaii`, `retro`, `kraft`) |
| `bloque=corto` | Elige el bloque (`foco`, `corto`, `largo`) |
| `progreso=40` | Mueve el bloque al 40 % |
| `corriendo=1` | Lo deja corriendo |
| `quieto=1` | Quita las transiciones (para capturas) |
| `demo=1` | Carga tareas y una semana de historial de ejemplo |
| `panel=tareas` | Abre un panel (`tareas`, `estadisticas`, `sonidos`, `carta`, `ajustes`) |

## Cómo está hecho

```
index.html            estructura (sin textos: se llenan desde js/textos.js)
manifest.webmanifest  nombre, colores e ícono para instalarla como app
sw.js                 service worker mínimo: solo muestra los avisos
css/                  base, escena, paneles y un archivo por tema
js/main.js            arranque: conecta todo
js/textos.js          todos los textos de la interfaz
js/estado.js          datos guardados, con versión de esquema
js/temporizador.js    tiempo con hora de término, varias pestañas, registros
js/bebidas/           catálogo de bebidas y su dibujo en SVG
js/fondos/            el fondo animado de cada tema
js/audio/             campanita y sonidos de ambiente (Web Audio)
js/ui/                controles, carta, ajustes, tareas, estadísticas, ventana flotante
assets/               ícono y carpeta para sonidos CC0
herramientas/         servidor local, laboratorio de bebidas, capturas, contraste
```

Para cambiar textos o traducir la app, edita `js/textos.js`. Para cambiar un sonido sintetizado por una grabación CC0, mira `assets/sonidos/LEEME.md`. Las reglas del proyecto, cómo agregar un tema o una bebida y el detalle del dibujo están en `CLAUDE.md`.

### Herramientas de desarrollo

| Comando | Para qué |
|---|---|
| `node herramientas/servidor.mjs` | Servidor local sin caché en el puerto 4173 |
| `node herramientas/capturas.mjs nombre` | Capturas con Edge sin ventana (opciones `--tema=`, `--bebida=`, `--bebidas`, `--demo`, `--paneles`) |
| `node herramientas/contraste.mjs` | Revisa el contraste AA de cada tema |
| `node herramientas/instalacion.mjs` | Revisa en Edge el service worker, el manifiesto, la instalación y los avisos |
| `node herramientas/precargas.mjs` | Actualiza la lista de módulos que se precargan en `index.html` (córrelo al agregar o quitar un módulo) |
| `herramientas/laboratorio.html?bebida=cappuccino` | Una bebida en grande en varios estados |

## Créditos

- Ilustraciones, íconos y sonidos: hechos en código para Tazodoro.
- Letras, de Google Fonts: Young Serif, Zen Maru Gothic, Cherry Bomb One, M PLUS Rounded 1c, Josefin Sans, Jost y Caveat (SIL Open Font License) y Yellowtail (Apache 2.0).
