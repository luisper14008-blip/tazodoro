// Capturas de revisión con Edge (o Chrome) sin ventana, usando el modo de prueba.
// Uso: con el servidor local corriendo, node herramientas/capturas.mjs fase1
// Variables opcionales: NAVEGADOR (ruta del ejecutable) y URL_BASE (por defecto http://localhost:4173/).
import { execFile } from 'node:child_process';
import { mkdir, rm, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)));
const carpeta = join(raiz, 'capturas');
const prefijo = process.argv[2] || 'captura';
const navegador = process.env.NAVEGADOR || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const base = process.env.URL_BASE || 'http://localhost:4173/';

const estados = [
  ['100', 'bloque=foco&progreso=0'],
  ['50', 'bloque=foco&progreso=50'],
  ['0', 'bloque=foco&progreso=100'],
  // Descanso largo: dura lo suficiente para que la foto salga mientras se sirve.
  ['descanso', 'bloque=largo&progreso=55&corriendo=1'],
];
const tamanos = [
  [1440, 900],
  [390, 844],
];

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

// En Windows, msedge.exe devuelve el control enseguida y escribe la imagen unos segundos después.
async function esperarArchivo(archivo, limite = 30000) {
  const fin = Date.now() + limite;
  while (Date.now() < fin) {
    const info = await stat(archivo).catch(() => null);
    if (info?.size > 0) {
      await pausa(400);
      return true;
    }
    await pausa(250);
  }
  return false;
}

// Un perfil nuevo por captura: así cada una empieza sin datos guardados.
const perfiles = join(tmpdir(), 'tazodoro-capturas');
let numero = 0;
async function capturar(url, archivo, [ancho, alto]) {
  numero += 1;
  await rm(archivo, { force: true });
  const argumentos = [
    '--headless=new',
    '--hide-scrollbars',
    '--mute-audio',
    `--user-data-dir=${join(perfiles, `${Date.now()}-${numero}`)}`,
    `--window-size=${ancho},${alto}`,
    `--screenshot=${archivo}`,
    '--virtual-time-budget=900',
    url,
  ];
  await new Promise((resolver, rechazar) => {
    execFile(navegador, argumentos, { timeout: 60000 }, (error) => (error ? rechazar(error) : resolver()));
  });
  if (!(await esperarArchivo(archivo))) throw new Error('el navegador no escribió la imagen');
  return archivo;
}

await rm(perfiles, { recursive: true, force: true }).catch(() => {});
await mkdir(carpeta, { recursive: true });
for (const [ancho, alto] of tamanos) {
  for (const [nombre, consulta] of estados) {
    const archivo = join(carpeta, `${prefijo}-${ancho}-${nombre}.png`);
    const app = `${base}?prueba=1&quieto=1&${consulta}`;
    // Anchos de celular: la app va dentro de un marco, porque la ventana no puede ser tan angosta.
    const celular = ancho < 600;
    const url = celular ? `${base}herramientas/marco.html?ancho=${ancho}&alto=${alto}&url=${encodeURIComponent(app)}` : app;
    try {
      await capturar(url, archivo, celular ? [600, alto] : [ancho, alto]);
      console.log(`listo: ${archivo}`);
    } catch (error) {
      console.error(`falló ${archivo}: ${error.message}`);
    }
  }
}
