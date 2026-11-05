# Tazodoro

Pomodoro de café: la bebida que eliges se vacía al ritmo del tiempo y se vuelve a llenar en los descansos. Página web propia (no un artefacto de Claude) que debe sentirse como una app de cafetería hecha con cariño, no como una plantilla.

## Reglas del proyecto
- HTML, CSS y JavaScript puros con módulos ES. Sin frameworks, sin compilación, sin npm, sin backend, sin cuentas y sin rastreo.
- Ilustraciones: SVG originales hechos en código. Íconos SVG en línea. Nada de imágenes externas.
- Sonidos con Web Audio API. `assets/sonidos/` queda lista para cambiarlos por archivos CC0 (créditos en `assets/sonidos/CREDITOS.md`).
- Google Fonts con moderación: máximo dos familias por tema.
- Todos los textos de la interfaz (incluidas etiquetas ARIA y mensajes) viven en `js/textos.js`. `index.html` no lleva texto visible: se llena con `data-t`.
- Código, nombres y comentarios en español. Sin ñ ni tildes en nombres de archivos ni identificadores (`tamano`, no `tamaño`).
- Datos en localStorage con `esquema` y migraciones (`js/estado.js`). Clave `tazodoro`; en modo de prueba, `tazodoro-prueba`.
- `referencias/` es solo de consulta y nunca se publica (`.gitignore`). `capturas/` tampoco.
- Rutas relativas siempre: debe funcionar en GitHub Pages o Netlify con `index.html` en la raíz.
- Debe funcionar en Chrome, Edge, Firefox y Safari recientes, en computador y celular.

## Visión de diseño
- **La bebida es el reloj.** Es la protagonista (cerca de la mitad del alto) y el nivel se lee de un vistazo. El tiempo en números grandes la acompaña.
- Organización tomada de la referencia: barra superior (nombre, racha, íconos), pestañas Concentración / Descanso corto / Descanso largo con contadores, tiempo grande al centro, botón grande Empezar y botón de ventana flotante.
- Lo que se mueve solo es la escena (bebida, vapor, fondo). La interfaz solo se mueve cuando la tocas.
- Vocabulario de cafetería en español claro y en minúsculas normales ("Cappuccino mediano", "Taza 2 de 4"). Evitar: rótulos en mayúsculas, puntos medios como separadores, flechas decorativas, tipografía monoespaciada para etiquetas.
- Cada bebida: brillos, sombras internas, textura y superficie con onda leve. Luz cálida de la lámpara (derecha) y relleno frío de la ventana (izquierda).
- La calidad visual manda: no pasar a la siguiente bebida hasta que la actual se vea apetitosa y se vacíe con fluidez.

## Mecánica
- Nivel en concentración = restante / total (1 → 0). En descanso sube (0 → 1). El nivel es altura, no volumen.
- El tiempo se calcula con la hora de fin (epoch ms) guardada en localStorage: recargar continúa donde iba.
- `js/latido.worker.js` da un pulso de 1 s que no se frena con la pestaña oculta. Además, un setTimeout exacto a la hora de fin y re-sincronización en `visibilitychange`.
- Varias pestañas: evento `storage` + Web Locks; cada bloque se registra una sola vez (por id).
- Si un bloque terminó con la página cerrada: se registra con su hora real y el siguiente queda listo (sin encadenar en silencio).
- Saltar concentración: no suma taza, sí minutos de foco. Saltar descanso: la taza se llena de una vez.
- El tamaño no se cambia con una taza en curso; la bebida sí (aparece con el mismo nivel).
- Contadores de las pestañas = bloques de hoy. Inicio automático separado para descansos y para tazas.
- `?prueba=1`: tiempo ×60, deslizador de progreso y parámetros `progreso` (0-100), `bloque` (foco, corto, largo) y `corriendo=1` para capturas.

## Render de bebidas
- `js/bebidas/catalogo.js`: cada bebida es datos (recipiente, capas, superficie, flotantes, efectos, vaciado, servido) y `CARTA` define el orden por secciones.
- `js/bebidas/recipientes.js`: perfiles de revolución proyectados en vista de tres cuartos. Ángulo de cámara por recipiente; en opacos se valida `profundidad ≤ (r arriba + r abajo) · tan(ángulo)` para que la superficie se vea hasta el fondo. `escalaBase` agranda recipientes chicos (tacita).
- `renderizador.js` elige el armado: `opaco.js` (tazas y mugs: se ve el interior por la abertura) o `vidrio.js` (vasos: capas visibles por las paredes, base gruesa, pajita, tapa, condensación). `partes.js` tiene lo común (plato, cucharita, sombra, chorros).
- `capas.js` calcula qué capas quedan según el nivel y `vaciado.modo` (`desde-arriba`, `desde-abajo` con pajita, `espuma-flota`).
- La superficie (`detalles.js` + `artes.js`: corazón, roseta, polvo, rejilla de caramelo) se dibuja en coordenadas unitarias y se ubica con un solo `transform`. En vasos, si arriba queda otra capa, se ve lisa con su color.
- `flotantes.js`: crema batida, malvaviscos, canela y anís, hielos (y hielos sumergidos) y perlas de tapioca.
- `restos.js`: anillo, espuma pegada, cacao, gotas, chorreado y rastros (tazas); anillos de espuma y escurridos (vasos: lo de la pared del fondo va antes del líquido, lo del frente después, recortado sobre la superficie).
- Lo característico de cada bebida es función del progreso y se recalcula cada 0,4 % con ruido de semilla fija. Sin filtros SVG animados; texturas (microespuma, crema, hielo) generadas una vez con canvas.
- Capas de la escena: herramientas de atrás (cafetera, base de licuadora) → bebida (con chorro) → vapor → herramientas de adelante (jarra, jarra de vidrio, tetera, vaso de licuadora, coctelera). Registro en `maquinas.js` (`HERRAMIENTAS`); cada paso de `servido` dice con qué y de qué color.
- Tapas, pajitas y sellos se ocultan mientras se sirve y aparecen al final.

## Bebidas
| Bebida | Recipiente | Detalles | Cómo se vacía | Se sirve con |
|---|---|---|---|---|
| Americano | Taza con plato | Café negro brillante, mucho vapor | Vapor se apaga; anillo marrón | Cafetera |
| Espresso | Tacita con plato y cucharita | Crema dorada atigrada | Crema adelgaza; rastros al fondo | Cafetera |
| Cappuccino | Taza ancha con plato | Espuma, corazón latte art, cacao | Corazón baja, se deforma y se deshace | Cafetera + jarrita de leche |
| Latte | Vaso de vidrio alto | Capas leche/café/espuma, roseta | Capas bajan en orden; anillos de espuma | Jarrita (leche y espuma) + cafetera |
| Mocha | Mug | Chocolate, crema batida, hilo y virutas | Crema se hunde y se derrite | Cafetera |
| Caramel macchiato | Vaso de vidrio | Leche abajo, espresso arriba, rejilla de caramelo | Caramelo escurre por las paredes | Jarrita + cafetera |
| Cold brew con hielo | Vaso de vidrio con pajita | Café oscuro, hielos, condensación | Hielos bajan y se encogen; gotas resbalan | Jarra de vidrio |
| Frappé | Vaso con domo y pajita gruesa | Base helada, crema batida, salsa | Crema se hunde; marcas de salsa | Licuadora |
| Matcha latte | Vaso de vidrio | Verde intenso, espuma, hoja latte art | La hoja se desdibuja | Jarrita (leche) + tetera |
| Chai latte | Mug | Dorado especiado, canela, rama y anís | La canela se dispersa | Tetera |
| Chocolate caliente | Mug grande | Chocolate espeso con malvaviscos | Malvaviscos se encogen y se hunden | Jarrita |
| Bubble tea | Vaso alto sellado con pajita ancha | Té con leche y perlas | Baja; quedan 2 o 3 perlas | Coctelera |

Tamaños: Pequeña 15, Mediana 25, Grande 50, Personalizada 5-90 min. En el espresso: single, doppio, lungo. El recipiente escala con los minutos.

## Temas (propuesta de paletas y letras)
| Tema | Paleta | Letras | Fondo |
|---|---|---|---|
| Cafetería nocturna lo-fi (defecto) | noche #141B2E, pizarra #222B45, madera #3B2A22, ámbar #F2A33A, crema #F4E9DA | Young Serif + Zen Maru Gothic | ventana con lluvia (canvas), lámpara, plantas en silueta, mesa de madera |
| Pastel kawaii | rosa #FFC4D6, menta #BDEBD5, lavanda #D8C8F2, crema #FFF6EA, ciruela #4E2F52 | Cherry Bomb One + M PLUS Rounded 1c | nubes y destellos; bebida con carita (feliz, tranquila, somnolienta, guiño) |
| Retro de cafetería | crema #F7ECD2, mostaza #E2A72E, cereza #C62F3B, verde azulado #227C78, chocolate #2E1E17 | Yellowtail + Josefin Sans | damero en perspectiva, pared a franjas, neón |
| Kraft natural | kraft #C9A77C, kraft claro #E2CDA6, café #4E3423, salvia #52664A, espresso #2A1C14 | Jost + Caveat | papel con fibras, hojas y granos en línea |

## Cómo funcionan los temas
- `js/temas.js` registra cada tema: fuentes de Google (se cargan al elegirlo; las del nocturno vienen en index.html), luz de la escena (`fijarLuz`), si lleva carita, color del navegador y su fondo (`js/fondos/*.js`, que devuelven `detener()`).
- `css/temas/*.css` redefine variables bajo `.app[data-tema='…']`: colores, `--fuente-marca`, `--fuente-display` (reloj), `--fuente-titulos`, `--fuente-ui`, `--fuente-mano`, `--ancho-cifra`, `--vapor`, `--maquina-*`, y ajusta controles. También define su miniatura `.vista-escena[data-vista='…']`.
- Al cambiar de tema se rearman el fondo, la bebida (misma luz nueva y nivel) y las miniaturas de la carta.
- Los tintes sutiles de la base usan `color-mix(... var(--texto) N%, transparent)` para verse en temas claros y oscuros.
- `herramientas/contraste.mjs` revisa los pares de color de cada tema contra AA. Si agregas un tema, agrega sus pares.
- Añadir un tema: entrada en `TEMAS` y `ORDEN_TEMAS`, archivo `css/temas/<id>.css`, fondo en `js/fondos/<id>.js`, textos en `textos.temas` y sus pares en `contraste.mjs`.

## Fases
- [x] **Fase 1** (2026-11-04): estructura, temporizador completo, tamaños, ciclo con recarga, ajustes básicos, Cappuccino terminado y tema Cafetería nocturna lo-fi. Incluye campanita, notificación, favicon que se vacía y modo de prueba. Recarga del Cappuccino: la cafetera sirve el espresso (hasta 30 %) y la jarrita la leche; el corazón se forma al final.
- [x] **Fase 2** (2026-11-05, rama `fase-2-bebidas`): las otras 11 bebidas y la carta. La carta (`js/ui/carta.js`) reemplazó a la ventanita de tamaños: elige bebida y tamaño en un solo lugar; las miniaturas usan el mismo renderizador, quietas.
- [x] **Fase 3** (2026-11-05, rama `fase-3-temas`): Pastel kawaii (carita en la bebida), Retro de cafetería (neón, mostrador, damero) y Kraft natural (papel con fibras, hojas y granos), con selector de vista previa en Ajustes. El tema se aplica al instante y se recuerda.
- [x] **Fase 4** (2026-11-05, rama `fase-4-funciones`): sonidos de ambiente sintetizados (`js/audio/ambientes.js`; murmullo, lluvia y cafetera, con volumen y silencio general; solo la pestaña con el candado `tazodoro-ambientes` los toca; para usar grabaciones CC0, rutas en `FUENTES`), tareas en panel lateral (`js/tareas.js`, `js/ui/tareas.js`; la tarea en curso va bajo el reloj y cada taza terminada le suma), estadísticas (`js/estadisticas.js`, `js/ui/estadisticas.js`; la racha de la barra las abre; descargar y borrar datos) y ventana flotante (`js/ui/flotante.js`, Document PiP con la mesa del tema; si el navegador no puede, el botón se oculta con aviso). Estilos en `css/paneles.css`. Textos con plurales `{ uno, otros }`.
- [ ] **Fase 5**: responsive, accesibilidad, rendimiento, README, service worker mínimo para avisos en Android y preparación para publicar.

## Cierre de cada fase
1. `node herramientas/servidor.mjs` → http://localhost:4173/?prueba=1 (Python no está instalado).
2. `node herramientas/capturas.mjs faseN`: capturas con la bebida al 100 %, 50 %, 0 % y durante un descanso, a 1440 y 390 px, en `capturas/`.
3. Revisar la consola, corregir y hacer commit de git.
4. Actualizar este archivo y detenerse para la revisión del usuario.

## Herramientas de desarrollo (`herramientas/`)
- `servidor.mjs`: servidor local sin dependencias y sin caché (puerto 4173).
- `laboratorio.html?bebida=cappuccino&estados=foco:1,foco:0.5,corto:0.6&quieto=1`: una bebida en grande en varios estados. Úsalo para pulir cada bebida antes de pasar a la siguiente.
- `capturas.mjs`: capturas con Edge sin ventana. Los anchos de celular se toman dentro de `marco.html`, porque en Windows la ventana no baja de ~500 px. `--bebida=latte` elige la bebida de las capturas de la app; `--bebidas` agrega una hoja por bebida (100 %, 50 %, 0 % y descanso).
- Parámetros de prueba: `?prueba=1&quieto=1&tema=retro&bebida=latte&bloque=corto&progreso=40&corriendo=1` (`quieto=1` quita transiciones para capturas exactas). `demo=1` carga tareas y una semana de historial de ejemplo; `panel=tareas|estadisticas|sonidos|carta|ajustes` abre ese panel. `capturas.mjs` acepta `--tema=`, `--demo` y `--paneles`.
- `contraste.mjs`: contraste AA de cada tema.
- El panel del navegador de Claude suele estar oculto: ahí no corren los cuadros de animación ni las transiciones. El pulso del worker repinta una vez por segundo cuando la página está visible pero sin cuadros.

## Notas
- El proyecto está dentro de OneDrive: si git falla por archivos bloqueados, reintentar o pausar la sincronización.
- No hay Firefox ni Safari en este equipo: el usuario revisa esos navegadores.
- Git: identidad configurada solo en este repositorio (`git config user.name` / `user.email`). Cambiarla si el usuario prefiere otro nombre o su correo privado de GitHub antes de publicar.
- Pendientes para fases siguientes: probar la ventana flotante en Chrome/Edge reales (el navegador de Claude no la abre); ocultar los atajos de teclado en pantallas táctiles; service worker para avisos en Android (fase 5).
