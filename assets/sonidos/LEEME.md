# Sonidos

Por ahora todos los sonidos se generan en el navegador con Web Audio API (sin archivos):

| Sonido | Archivo de código | Cuándo suena |
|---|---|---|
| Campanita de cafetería | `js/audio/campanita.js` | Al terminar una taza (dos golpes) y un descanso (uno) |
| Murmullo de cafetería | `js/audio/ambientes.js` | Sonido de ambiente opcional |
| Lluvia | `js/audio/ambientes.js` | Sonido de ambiente opcional |
| Cafetera | `js/audio/ambientes.js` | Sonido de ambiente opcional |

## Cambiar un sonido de ambiente por un archivo CC0

1. Busca un sonido con licencia CC0 (dominio público), por ejemplo en freesound.org filtrando por "Creative Commons 0". Mejor si se puede repetir sin que se note el corte.
2. Guárdalo en esta carpeta en formato `.mp3` u `.ogg`, con un nombre en minúsculas y sin espacios (`lluvia.ogg`).
3. Anota en `CREDITOS.md` el nombre, el autor, el enlace y la licencia.
4. En `js/audio/ambientes.js`, escribe la ruta en la tabla `FUENTES` (por ejemplo `lluvia: 'assets/sonidos/lluvia.ogg'`). Si hay archivo, se usa en bucle en lugar del sonido sintetizado; si no carga, vuelve el sintetizado.
5. Si suena más fuerte o más suave que los otros, ajusta su número en la tabla `NIVEL` del mismo archivo.

Usa rutas relativas (`assets/sonidos/lluvia.ogg`) para que funcione en GitHub Pages y Netlify.
