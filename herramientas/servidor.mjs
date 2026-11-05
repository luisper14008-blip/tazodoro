// Servidor local mínimo para desarrollo, sin dependencias.
// Uso: node herramientas/servidor.mjs [puerto]
// Sirve la carpeta del proyecto sin caché para ver siempre la última versión de los módulos.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)));
const puerto = Number(process.argv[2] || process.env.PORT || 4173);

const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function responder(respuesta, codigo, texto) {
  respuesta.writeHead(codigo, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  respuesta.end(texto);
}

createServer(async (pedido, respuesta) => {
  try {
    const url = new URL(pedido.url, 'http://localhost');
    let archivo = normalize(join(raiz, decodeURIComponent(url.pathname)));
    if (archivo !== raiz && !archivo.startsWith(raiz + sep)) return responder(respuesta, 403, 'Prohibido');

    let info = await stat(archivo).catch(() => null);
    if (info?.isDirectory()) {
      archivo = join(archivo, 'index.html');
      info = await stat(archivo).catch(() => null);
    }
    if (!info) return responder(respuesta, 404, 'No encontrado');

    const cuerpo = await readFile(archivo);
    respuesta.writeHead(200, {
      'Content-Type': tipos[extname(archivo).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    respuesta.end(cuerpo);
  } catch (error) {
    console.error(error);
    responder(respuesta, 500, 'Error del servidor');
  }
}).listen(puerto, () => {
  console.log(`Tazodoro en http://localhost:${puerto}  (modo de prueba: http://localhost:${puerto}/?prueba=1)`);
});
