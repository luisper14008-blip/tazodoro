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
- `js/bebidas/catalogo.js`: cada bebida es datos (recipiente, capas, superficie, efectos, vaciado, servido).
- `js/bebidas/recipientes.js`: perfiles de revolución proyectados en vista de tres cuartos. Ángulo de cámara por recipiente; en opacos se valida `profundidad ≤ (r arriba + r abajo) · tan(ángulo)` para que la superficie se vea hasta el fondo.
- La superficie se dibuja en coordenadas unitarias (círculo de radio 1) y se ubica con un solo `transform` (translate + scale): una sola escritura por cuadro.
- Lo característico de cada bebida (arte latte que se deforma, crema que adelgaza…) es función del progreso y se recalcula cada 0,4 % con ruido de semilla fija.
- Sin filtros SVG animados. Texturas generadas una vez con canvas. Ondas con SMIL (se pausan con `pauseAnimations`). Vapor en capas HTML con CSS (transform y opacity).
- Capas de la escena: máquina (atrás) → bebida (con chorro) → vapor → jarra (adelante).
- `vaciado.modo`: `desde-arriba`, `desde-abajo` (pajita) o `espuma-flota`.

## Bebidas
| Bebida | Recipiente | Detalles | Cómo se vacía | Se sirve con |
|---|---|---|---|---|
| Americano | Taza con plato | Café negro brillante, mucho vapor | Vapor se apaga; anillo marrón | Cafetera |
| Espresso | Tacita con plato y cucharita | Crema dorada atigrada | Crema adelgaza; rastros al fondo | Cafetera |
| Cappuccino | Taza ancha con plato | Espuma, corazón latte art, cacao | Corazón baja, se deforma y se deshace | Cafetera + jarrita de leche |
| Latte | Vaso de vidrio alto | Capas leche/café/espuma, roseta | Capas bajan en orden; anillos de espuma | Cafetera |
| Mocha | Mug | Chocolate, crema batida, hilo y virutas | Crema se hunde y se derrite | Cafetera |
| Caramel macchiato | Vaso de vidrio | Leche abajo, espresso arriba, rejilla de caramelo | Caramelo escurre por las paredes | Cafetera |
| Cold brew con hielo | Vaso de vidrio con pajita | Café oscuro, hielos, condensación | Hielos bajan y se encogen; gotas resbalan | Jarra de vidrio |
| Frappé | Vaso con domo y pajita gruesa | Base helada, crema batida, salsa | Crema se hunde; marcas de salsa | Licuadora |
| Matcha latte | Vaso de vidrio | Verde intenso, espuma, hoja latte art | La hoja se desdibuja | Tetera |
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

## Fases
- [x] **Fase 1** (2026-11-04): estructura, temporizador completo, tamaños, ciclo con recarga, ajustes básicos, Cappuccino terminado y tema Cafetería nocturna lo-fi. Incluye campanita, notificación, favicon que se vacía y modo de prueba. Recarga del Cappuccino: la cafetera sirve el espresso (hasta 30 %) y la jarrita la leche; el corazón se forma al final.
- [ ] **Fase 2**: las otras 11 bebidas y la carta.
- [ ] **Fase 3**: los otros 3 temas y su selector con vista previa.
- [ ] **Fase 4**: sonidos ambientales, tareas, estadísticas con racha y ventana flotante.
- [ ] **Fase 5**: responsive, accesibilidad, rendimiento, README, service worker mínimo para avisos en Android y preparación para publicar.

## Cierre de cada fase
1. `node herramientas/servidor.mjs` → http://localhost:4173/?prueba=1 (Python no está instalado).
2. `node herramientas/capturas.mjs faseN`: capturas con la bebida al 100 %, 50 %, 0 % y durante un descanso, a 1440 y 390 px, en `capturas/`.
3. Revisar la consola, corregir y hacer commit de git.
4. Actualizar este archivo y detenerse para la revisión del usuario.

## Herramientas de desarrollo (`herramientas/`)
- `servidor.mjs`: servidor local sin dependencias y sin caché (puerto 4173).
- `laboratorio.html?bebida=cappuccino&estados=foco:1,foco:0.5,corto:0.6&quieto=1`: una bebida en grande en varios estados. Úsalo para pulir cada bebida antes de pasar a la siguiente.
- `capturas.mjs`: capturas con Edge sin ventana. Los anchos de celular se toman dentro de `marco.html`, porque en Windows la ventana no baja de ~500 px.
- Parámetros de prueba: `?prueba=1&quieto=1&bloque=corto&progreso=40&corriendo=1` (`quieto=1` quita transiciones para capturas exactas).
- El panel del navegador de Claude suele estar oculto: ahí no corren los cuadros de animación ni las transiciones. El pulso del worker repinta una vez por segundo cuando la página está visible pero sin cuadros.

## Notas
- El proyecto está dentro de OneDrive: si git falla por archivos bloqueados, reintentar o pausar la sincronización.
- No hay Firefox ni Safari en este equipo: el usuario revisa esos navegadores.
- Git: identidad configurada solo en este repositorio (`git config user.name` / `user.email`). Cambiarla si el usuario prefiere otro nombre o su correo privado de GitHub antes de publicar.
- Pendientes para fases siguientes: botones de música, tareas y estadísticas en la barra (fase 4); la racha se volverá botón que abre estadísticas (fase 4); service worker para avisos en Android (fase 5).
