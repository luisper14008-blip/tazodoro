// Fondo kraft natural: papel con fibras (SVG estático), ilustraciones en línea fina de hojas y granos.
import { crearAzar } from '../util/azar.js';
import { n } from '../util/svg.js';

// Fibras y motas del papel reciclado, en una baldosa que se repite.
function baldosaFibras() {
  const azar = crearAzar(13);
  let marcas = '';
  for (let i = 0; i < 150; i++) {
    const x = azar.entre(0, 240);
    const y = azar.entre(0, 240);
    if (i % 3 === 0) {
      const largo = azar.entre(4, 11);
      const a = azar.entre(0, Math.PI);
      marcas += `<path d="M${n(x)} ${n(y)}l${n(Math.cos(a) * largo)} ${n(Math.sin(a) * largo)}" stroke="${i % 2 ? '#7A5A3A' : '#F2DFC0'}" stroke-opacity="${n(azar.entre(0.18, 0.4))}" stroke-width="0.7"/>`;
    } else {
      marcas += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(azar.entre(0.4, 1.3))}" fill="${i % 2 ? '#5E432B' : '#F5E6CC'}" fill-opacity="${n(azar.entre(0.2, 0.5))}"/>`;
    }
  }
  const ruido = `<filter id="r"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.35 0 0 0 0 0.24 0 0 0 0 0.14 0 0 0 0.22 0"/></filter>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">${ruido}<rect width="240" height="240" filter="url(#r)"/>${marcas}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const HOJA = (x, y, giro, escala) => `<g transform="translate(${x} ${y}) rotate(${giro}) scale(${escala})">
  <path d="M0 0C10 -18 34 -22 52 -12C38 4 16 8 0 0Z"/><path d="M2 -1C18 -8 32 -11 46 -11"/>
  <path d="M14 -5L18 -12M24 -7L30 -14M34 -9L40 -14"/></g>`;
const GRANO = (x, y, giro, escala) => `<g transform="translate(${x} ${y}) rotate(${giro}) scale(${escala})">
  <ellipse cx="0" cy="0" rx="12" ry="16"/><path d="M-1 -15C-6 -6 4 4 -1 15"/></g>`;

const RAMA = `<svg viewBox="0 0 260 260" aria-hidden="true"><g fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <path class="tallo" d="M30 250C60 200 90 150 150 110C180 90 210 80 240 76"/>
  <g class="hojas">${HOJA(60, 206, -60, 1)}${HOJA(92, 160, -24, 0.9)}${HOJA(128, 128, -70, 0.85)}${HOJA(170, 100, -10, 0.8)}${HOJA(204, 86, -48, 0.7)}</g>
</g></svg>`;

const GRANOS = `<svg viewBox="0 0 200 160" aria-hidden="true"><g fill="none" stroke-width="1.6" stroke-linecap="round">
  ${GRANO(40, 50, -20, 1)}${GRANO(86, 34, 30, 0.9)}${GRANO(70, 96, 70, 1.05)}${GRANO(130, 80, -40, 0.85)}${GRANO(160, 124, 15, 0.75)}
</g></svg>`;

export function montarFondoKraft(contenedor) {
  contenedor.innerHTML = `
    <div class="fondo-papel"></div>
    <div class="ilustracion ilustracion-rama">${RAMA}</div>
    <div class="ilustracion ilustracion-granos">${GRANOS}</div>
    <div class="ilustracion ilustracion-rama-chica">${RAMA}</div>
    <div class="fondo-mesa"></div>`;
  // Se asigna por JS: el url("data:…") lleva comillas que romperían un atributo style.
  contenedor.querySelector('.fondo-papel').style.setProperty('--fibras', baldosaFibras());
  return { detener() {} };
}
