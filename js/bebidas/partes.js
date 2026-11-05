// Partes que comparten todos los recipientes: luz de la escena, sombra en la mesa, plato, cucharita y chorros.
import { n, paradas, elipse, caminoSuave } from '../util/svg.js';
import { mezclarColor } from '../util/color.js';
import { contorno, perfilPlato } from './recipientes.js';

// Luz cálida desde la lámpara (derecha) y relleno frío desde la ventana (izquierda).
export const LUZ = { calida: '#FFE6BF', fria: '#4F5B7C', sombra: '#211A22' };
export const PI = Math.PI;

export const caminoElipse = (cx, cy, rx, ry) =>
  `M${n(cx - rx)} ${n(cy)}A${n(rx)} ${n(ry)} 0 1 0 ${n(cx + rx)} ${n(cy)}A${n(rx)} ${n(ry)} 0 1 0 ${n(cx - rx)} ${n(cy)}Z`;

// Arco de elipse entre dos ángulos, en sentido de los ángulos crecientes (0 = derecha, π/2 = frente).
export function arco(cx, cy, rx, ry, desde, hasta) {
  const [x1, y1] = [cx + rx * Math.cos(desde), cy + ry * Math.sin(desde)];
  const [x2, y2] = [cx + rx * Math.cos(hasta), cy + ry * Math.sin(hasta)];
  const grande = Math.abs(hasta - desde) > PI ? 1 : 0;
  return `M${n(x1)} ${n(y1)}A${n(rx)} ${n(ry)} 0 ${grande} 1 ${n(x2)} ${n(y2)}`;
}

// Banda angosta sobre la cara exterior (reflejos del esmalte o del vidrio).
export function bandaExterior(g, perfil, t1, t2, hArriba, hAbajo, pasos = 24) {
  const ida = [];
  const vuelta = [];
  for (let i = 0; i <= pasos; i++) {
    const u = i / pasos;
    const h = hArriba + (hAbajo - hArriba) * u;
    const r = perfil(h) + 0.2;
    const medio = (t1 + t2) / 2;
    const ancho = ((t2 - t1) / 2) * (0.25 + 0.75 * Math.sin(PI * u));
    ida.push([g.cx + r * Math.cos(medio - ancho), g.yc(h) + r * g.s * Math.sin(medio - ancho)]);
    vuelta.unshift([g.cx + r * Math.cos(medio + ancho), g.yc(h) + r * g.s * Math.sin(medio + ancho)]);
  }
  return caminoSuave([...ida, ...vuelta]);
}

export function defsComunes(ids, esmalte) {
  const tono = (color, t) => mezclarColor(esmalte, color, t);
  return `
    <radialGradient id="${ids.sombraMesa}">${paradas([[0, '#07060C', 0.55], [0.55, '#07060C', 0.28], [1, '#07060C', 0]])}</radialGradient>
    <radialGradient id="${ids.contacto}">${paradas([[0, LUZ.sombra, 0.5], [0.7, LUZ.sombra, 0.18], [1, LUZ.sombra, 0]])}</radialGradient>
    <linearGradient id="${ids.platoLado}">${paradas([[0, tono(LUZ.fria, 0.7)], [0.5, tono(LUZ.sombra, 0.35)], [0.8, tono(LUZ.calida, 0.2)], [1, tono(LUZ.sombra, 0.55)]])}</linearGradient>
    <radialGradient id="${ids.platoCara}" cx="0.58" cy="0.46" r="0.62">${paradas([[0, tono(LUZ.calida, 0.45)], [0.6, esmalte], [0.88, tono(LUZ.fria, 0.22)], [1, tono(LUZ.fria, 0.4)]])}</radialGradient>
    <radialGradient id="${ids.platoHondo}" cx="0.56" cy="0.58" r="0.6">${paradas([[0, tono(LUZ.calida, 0.3)], [0.7, tono(LUZ.sombra, 0.08)], [1, tono(LUZ.sombra, 0.2)]])}</radialGradient>
    <linearGradient id="${ids.metal}">${paradas([[0, '#5C6470'], [0.3, '#E9EDF2'], [0.55, '#9AA2AE'], [0.8, '#F4F6F9'], [1, '#6A727E']])}</linearGradient>`;
}

// Sombra suave en la mesa, debajo del plato o del recipiente.
export function marcadoSombra(g, radio, ids) {
  return elipse(g.cx + 10, g.mesa + 7, radio * 1.08, radio * g.s * 1.14, `fill="url(#${ids.sombraMesa})"`);
}

export function marcadoPlato(g, plato, ids) {
  const { cx, s, c, mesa } = g;
  const yc = (h) => mesa - h * c;
  const R = plato.radio;
  const arriba = yc(plato.alto);
  const hondo = yc(plato.alto - plato.hondo);
  return `
    <path d="${contorno(perfilPlato(plato), 0, plato.alto, { cx, s, yc }, 72, 12)}" fill="url(#${ids.platoLado})"/>
    ${elipse(cx, arriba, R, R * s, `fill="url(#${ids.platoCara})"`)}
    ${elipse(cx, hondo, R - 14, (R - 14) * s, `fill="url(#${ids.platoHondo})"`)}
    ${elipse(cx, hondo, plato.pozo, plato.pozo * s, `fill="none" stroke="${LUZ.sombra}" stroke-opacity="0.16" stroke-width="1.6"`)}
    <path d="${arco(cx, arriba, R - 0.6, (R - 0.6) * s, 0.12, 2.3)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="1.3" stroke-linecap="round"/>`;
}

// Cucharita apoyada en el plato, al frente y a la derecha de la taza.
export function marcadoCuchara(g, plato, ids) {
  const y = g.mesa - (plato.alto - plato.hondo) * g.c;
  const x0 = g.cx + plato.radio * 0.32;
  const y0 = y + plato.radio * g.s * 0.62;
  return `<g transform="translate(${n(x0)} ${n(y0)}) rotate(-14)">
    <ellipse cx="2" cy="3.5" rx="44" ry="5" fill="${LUZ.sombra}" opacity="0.18"/>
    <path d="M-38 0C-30 -2.4 -8 -2.6 6 -1.6L6 1.6C-8 2.6 -30 2.4 -38 0Z" fill="url(#${ids.metal})"/>
    <ellipse cx="17" cy="0" rx="14" ry="6.2" fill="url(#${ids.metal})"/>
    <ellipse cx="18" cy="-0.6" rx="9.5" ry="3.6" fill="#FFFFFF" opacity="0.45"/>
  </g>`;
}

// Degradados de los chorros: uno por color, con brillo al centro.
export function defsChorros(ids, colores) {
  return colores
    .map((color, i) => {
      const borde = mezclarColor(color, '#000000', 0.35);
      const luz = mezclarColor(color, '#FFFFFF', 0.45);
      return `<linearGradient id="${ids.chorro}-${i}">${paradas([[0, borde], [0.38, color], [0.5, luz], [0.62, color], [1, borde]])}</linearGradient>`;
    })
    .join('');
}

export function marcadoChorros(ids, movimiento) {
  const flujo = movimiento ? '<animate attributeName="stroke-dashoffset" from="0" to="-28" dur="0.5s" repeatCount="indefinite"/>' : '';
  return `<g class="chorros" clip-path="url(#${ids.sobreBorde})" display="none">
    <path class="chorro-forma"/>
    <path class="chorro-flujo" fill="none" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="0.8" stroke-dasharray="9 5" stroke-linecap="round">${flujo}</path>
    <ellipse class="chorro-impacto" rx="7" ry="2.5" fill="none" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="1"/>
  </g>`;
}

// Forma de un chorro que se afina al caer.
export function formaChorro(xc, arriba, abajo, ancho, angosto) {
  const tramo = abajo - arriba;
  return `M${n(xc - ancho / 2)} ${n(arriba)}C${n(xc - ancho / 2)} ${n(arriba + tramo * 0.4)} ${n(xc - angosto / 2)} ${n(abajo - tramo * 0.3)} ${n(xc - angosto / 2)} ${n(abajo)}` +
    `L${n(xc + angosto / 2)} ${n(abajo)}C${n(xc + angosto / 2)} ${n(abajo - tramo * 0.3)} ${n(xc + ancho / 2)} ${n(arriba + tramo * 0.4)} ${n(xc + ancho / 2)} ${n(arriba)}Z`;
}
