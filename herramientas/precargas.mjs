// Escribe en index.html un <link rel="modulepreload"> por cada módulo que importa js/main.js.
// Así el navegador pide todos los módulos a la vez en vez de descubrirlos nivel por nivel
// (sin esto son cinco viajes de ida y vuelta antes de que la app arranque).
// Uso: node herramientas/precargas.mjs (después de agregar, quitar o mover un módulo).
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)));
const INICIO = '<!-- precargas: generado por herramientas/precargas.mjs -->';
const FIN = '<!-- /precargas -->';

// Recorre los import estáticos con rutas relativas, a lo ancho (primero los más cercanos a main.js).
async function modulos(entrada) {
  const vistos = new Set([entrada]);
  const cola = [entrada];
  const orden = [];
  while (cola.length) {
    const archivo = cola.shift();
    const codigo = await readFile(archivo, 'utf8');
    for (const coincidencia of codigo.matchAll(/^\s*(?:import|export)\s[^'"]*?from\s*['"](\.[^'"]+)['"]|^\s*import\s*['"](\.[^'"]+)['"]/gm)) {
      const ruta = coincidencia[1] ?? coincidencia[2];
      if (!ruta) continue;
      const destino = resolve(dirname(archivo), ruta);
      if (vistos.has(destino)) continue;
      vistos.add(destino);
      orden.push(destino);
      cola.push(destino);
    }
  }
  return orden;
}

const indice = join(raiz, 'index.html');
const html = await readFile(indice, 'utf8');
const lista = await modulos(join(raiz, 'js', 'main.js'));
const enlaces = lista.map((archivo) => `  <link rel="modulepreload" href="${relative(raiz, archivo).split('\\').join('/')}">`).join('\n');
const bloque = `${INICIO}\n${enlaces}\n  ${FIN}`;

let nuevo;
if (html.includes(INICIO)) {
  nuevo = html.replace(new RegExp(`${INICIO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${FIN}`), bloque);
} else {
  nuevo = html.replace('  <script type="module" src="js/main.js"></script>', `  ${bloque}\n  <script type="module" src="js/main.js"></script>`);
}
if (nuevo === html) {
  console.log(`Sin cambios: ${lista.length} módulos.`);
} else {
  await writeFile(indice, nuevo);
  console.log(`index.html al día: ${lista.length} módulos precargados.`);
}
