# Sonidos

Por ahora todos los sonidos se generan en el navegador con Web Audio API (sin archivos):

| Sonido | Archivo de código | Cuándo suena |
|---|---|---|
| Campanita de cafetería | `js/audio/campanita.js` | Al terminar una taza (dos golpes) y un descanso (uno) |
| Murmullo de cafetería | `js/audio/ambientes.js` (fase 4) | Sonido ambiental opcional |
| Lluvia | `js/audio/ambientes.js` (fase 4) | Sonido ambiental opcional |
| Cafetera | `js/audio/ambientes.js` (fase 4) | Sonido ambiental opcional |

## Cambiar un sonido por un archivo CC0

1. Busca un sonido con licencia CC0 (dominio público), por ejemplo en freesound.org filtrando por "Creative Commons 0".
2. Guárdalo en esta carpeta en formato `.mp3` u `.ogg`, con un nombre en minúsculas y sin espacios (`lluvia.ogg`).
3. Anota en `CREDITOS.md` el nombre, el autor, el enlace y la licencia.
4. En la fase 4, `js/audio/ambientes.js` tendrá una tabla `fuentes` donde se indica el archivo de cada ambiente; si hay archivo, se usa en lugar del sonido sintetizado.

Usa rutas relativas (`assets/sonidos/lluvia.ogg`) para que funcione en GitHub Pages y Netlify.
