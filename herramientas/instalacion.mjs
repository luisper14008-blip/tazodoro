// Revisa en Edge sin ventana lo que el navegador de Claude no puede probar: el service worker,
// el manifiesto, si la app se puede instalar y si los avisos salen por el service worker.
// Uso: con el servidor corriendo, node herramientas/instalacion.mjs [url base]
// (por defecto http://localhost:4173/; sirve también una subcarpeta, como en GitHub Pages).
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const navegador = process.env.NAVEGADOR || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const base = process.argv[2] || 'http://localhost:4173/';
const puerto = 9333;
const perfil = mkdtempSync(join(tmpdir(), 'tazodoro-instalacion-'));
const proceso = spawn(navegador, ['--headless=new', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const depuracion = (ruta, opciones) => fetch(`http://127.0.0.1:${puerto}${ruta}`, opciones).then((r) => r.json());

let listo = null;
for (let i = 0; i < 40 && !listo; i++) {
  await pausa(250);
  listo = await depuracion('/json/version').catch(() => null);
}
if (!listo) throw new Error('el navegador no abrió el puerto de depuración');

// Modo de prueba: usa la clave de guardado de prueba, no toca los datos reales.
const pagina = await depuracion(`/json/new?${base}?prueba=1%26quieto=1`, { method: 'PUT' });
const conexion = new WebSocket(pagina.webSocketDebuggerUrl);
await new Promise((r) => conexion.addEventListener('open', r));
let numero = 0;
const esperando = new Map();
conexion.addEventListener('message', (evento) => {
  const mensaje = JSON.parse(evento.data);
  esperando.get(mensaje.id)?.(mensaje);
});
const pedir = (method, params = {}) => new Promise((r) => {
  numero += 1;
  esperando.set(numero, r);
  conexion.send(JSON.stringify({ id: numero, method, params }));
});
const evaluar = async (codigo) => (await pedir('Runtime.evaluate', { expression: codigo, awaitPromise: true, returnByValue: true })).result?.result?.value;

let fallas = 0;
const revisar = (bien, texto, detalle = '') => {
  if (!bien) fallas += 1;
  console.log(`  ${bien ? 'bien ' : 'FALLA'}  ${texto}${detalle ? `: ${detalle}` : ''}`);
};

await pausa(2500);
const servicio = await evaluar(`(async () => {
  const registro = await Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 5000))]);
  // "ready" puede llegar mientras todavía se está activando.
  for (let i = 0; i < 30 && registro?.active?.state !== 'activated'; i++) await new Promise((r) => setTimeout(r, 100));
  return { alcance: registro?.scope, estado: registro?.active?.state, controla: Boolean(navigator.serviceWorker.controller) };
})()`);
revisar(servicio?.estado === 'activated', 'service worker activo', servicio?.alcance);

const manifiesto = (await pedir('Page.getAppManifest')).result;
revisar(Boolean(manifiesto?.data) && !manifiesto.errors?.length, 'manifiesto sin errores', manifiesto?.url);
const instalable = (await pedir('Page.getInstallabilityErrors')).result?.installabilityErrors ?? [];
revisar(instalable.length === 0, 'se puede instalar', instalable.map((e) => e.errorId).join(', '));

// Otra pestaña al frente: la de Tazodoro pierde el foco, como cuando estás en otra cosa.
await pedir('Browser.grantPermissions', { permissions: ['notifications'], origin: new URL(base).origin });
const otra = await depuracion('/json/new?about:blank', { method: 'PUT' });
await fetch(`http://127.0.0.1:${puerto}/json/activate/${otra.id}`);
await pausa(500);
const avisos = await evaluar(`(async () => {
  const { notificar } = await import(new URL('js/ui/avisos.js', location.href).href);
  notificar('Taza terminada', 'Prueba de aviso');
  await new Promise((r) => setTimeout(r, 800));
  const registro = await navigator.serviceWorker.ready;
  return (await registro.getNotifications()).map((a) => a.title + ' (' + a.icon + ')');
})()`);
revisar(avisos?.length > 0, 'el aviso sale por el service worker', avisos?.join(', '));

conexion.close();
proceso.kill();
await pausa(500);
try { rmSync(perfil, { recursive: true, force: true }); } catch { /* Edge puede tardar en soltar el perfil */ }
console.log(fallas ? `\n${fallas} revisión(es) fallaron.` : '\nTodo en orden.');
process.exitCode = fallas ? 1 : 0;
