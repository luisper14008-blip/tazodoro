// Recipientes opacos (tazas y mugs de cerámica) en vista de tres cuartos:
// cuerpo y asa por fuera; por la abertura se ven la pared interior, los restos y la superficie.
import { n, paradas, elipse } from '../util/svg.js';
import { mezclarColor } from '../util/color.js';
import { contorno, caminoAsa } from './recipientes.js';
import { LUZ, PI, caminoElipse, arco, bandaExterior, marcadoChorros } from './partes.js';

function definiciones(g, ids, esmalte, colorInterior = esmalte) {
  const tono = (color, t) => mezclarColor(esmalte, color, t);
  const tonoInterior = (color, t) => mezclarColor(colorInterior, color, t);
  const yArriba = g.yc(g.def.alto);
  const R = g.borde;
  return `
    <linearGradient id="${ids.cuerpo}">${paradas([
      [0, tono(LUZ.fria, 0.62)], [0.1, tono(LUZ.fria, 0.38)], [0.3, tono(LUZ.fria, 0.12)], [0.52, esmalte],
      [0.7, tono(LUZ.calida, 0.55)], [0.83, tono(LUZ.calida, 0.18)], [0.94, tono('#6E4E3A', 0.32)], [1, tono('#3E2C24', 0.55)],
    ])}</linearGradient>
    <linearGradient id="${ids.oclusion}" x1="0" y1="0" x2="0" y2="1">${paradas([[0, LUZ.sombra, 0], [0.5, LUZ.sombra, 0], [1, LUZ.sombra, 0.42]])}</linearGradient>
    <linearGradient id="${ids.brillo}" x1="0" y1="0" x2="0" y2="1">${paradas([[0, '#FFFFFF', 0], [0.25, '#FFFFFF', 0.75], [0.7, '#FFF4E2', 0.35], [1, '#FFF4E2', 0]])}</linearGradient>
    <linearGradient id="${ids.asa}" x1="0" y1="0" x2="0.35" y2="1">${paradas([[0, tono(LUZ.calida, 0.5)], [0.45, esmalte], [1, tono(LUZ.sombra, 0.45)]])}</linearGradient>
    <radialGradient id="${ids.interior}" cx="0.5" cy="0.12" r="0.95">${paradas([[0, tonoInterior(LUZ.calida, 0.3)], [0.45, colorInterior], [0.8, tonoInterior(LUZ.sombra, 0.22)], [1, tonoInterior(LUZ.sombra, 0.42)]])}</radialGradient>
    <linearGradient id="${ids.labio}">${paradas([[0, tono(LUZ.fria, 0.45)], [0.35, tono(LUZ.fria, 0.08)], [0.7, tono(LUZ.calida, 0.6)], [1, tono('#6E4E3A', 0.3)]])}</linearGradient>
    <clipPath id="${ids.abertura}">${elipse(g.cx, yArriba, g.bordeIn, g.bordeIn * g.s)}</clipPath>
    <clipPath id="${ids.sobreBorde}"><path d="M-600 -600H1000V${n(yArriba)}H${n(g.cx + R)}A${n(R)} ${n(R * g.s)} 0 0 1 ${n(g.cx - R)} ${n(yArriba)}H-600Z"/></clipPath>
    <clipPath id="${ids.sobreBordeIn}"><path d="M-600 -600H1000V${n(yArriba)}H${n(g.cx + g.bordeIn)}A${n(g.bordeIn)} ${n(g.bordeIn * g.s)} 0 0 1 ${n(g.cx - g.bordeIn)} ${n(yArriba)}H-600Z"/></clipPath>`;
}

// superficie, flotantes y restos ya armados: aquí solo se ubican en su capa.
export function armarOpaco(bebida, g, ids, { superficie, flotantes, restos, movimiento }) {
  const { def, cx } = g;
  const esmalte = bebida.recipiente.color;
  const yArriba = g.yc(def.alto);
  const asa = caminoAsa(g);
  const cuerpo = contorno(def.perfil, 0, def.alto, g);
  const borde = mezclarColor(esmalte, LUZ.sombra, 0.55);
  const pie = def.perfil(0);

  const markup = `
    <g class="taza">
      ${elipse(cx - 26, g.yc(0) + 7, g.borde * 0.95, g.borde * 0.95 * g.s * 0.6, `fill="url(#${ids.contacto})" opacity="0.7"`)}
      ${elipse(cx + 3, g.yc(0) + 2, pie * 1.35, pie * 1.35 * g.s, `fill="url(#${ids.contacto})"`)}
      <path d="${cuerpo}" fill="url(#${ids.cuerpo})" stroke="${borde}" stroke-opacity="0.5" stroke-width="0.8"/>
      <path d="${cuerpo}" fill="url(#${ids.oclusion})"/>
      <path d="${bandaExterior(g, def.perfil, 0.32, 0.62, def.alto - 9, def.alto * 0.36)}" fill="url(#${ids.brillo})"/>
      <path d="${bandaExterior(g, def.perfil, PI - 0.3, PI - 0.1, def.alto - 12, def.alto * 0.45)}" fill="#B9C6E6" opacity="0.18"/>
      <path d="${asa.contorno}" fill="url(#${ids.asa})" stroke="${borde}" stroke-opacity="0.45" stroke-width="0.8"/>
      <path d="${asa.brillo}" fill="none" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="1.6" stroke-linecap="round"/>
      <g clip-path="url(#${ids.abertura})">
        ${elipse(cx, yArriba, g.bordeIn, g.bordeIn * g.s, `fill="url(#${ids.interior})"`)}
        ${restos.markup}
        <g class="nivel">${superficie.markup}</g>
        <path d="${arco(cx, g.yc(def.alto - 2), g.bordeIn, g.bordeIn * g.s, PI, 2 * PI)}" fill="none" stroke="${LUZ.sombra}" stroke-opacity="0.12" stroke-width="9"/>
        <path d="${arco(cx, g.yc(def.alto - 1), g.bordeIn, g.bordeIn * g.s, PI, 2 * PI)}" fill="none" stroke="${LUZ.sombra}" stroke-opacity="0.18" stroke-width="3"/>
      </g>
      <path d="${caminoElipse(cx, yArriba, g.borde, g.borde * g.s)}${caminoElipse(cx, yArriba, g.bordeIn, g.bordeIn * g.s)}" fill-rule="evenodd" fill="url(#${ids.labio})"/>
      <path d="${arco(cx, yArriba, (g.borde + g.bordeIn) / 2, ((g.borde + g.bordeIn) / 2) * g.s, 0.12, 1.25)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="1.5" stroke-linecap="round"/>
      <path d="${arco(cx, yArriba, g.borde, g.borde * g.s, 0.02, PI - 0.02)}" fill="none" stroke="${borde}" stroke-opacity="0.45" stroke-width="0.8"/>
      <g clip-path="url(#${ids.sobreBordeIn})"><g class="flotantes">${flotantes.markup}</g></g>
      ${marcadoChorros(ids, movimiento)}
    </g>`;

  return { defs: definiciones(g, ids, esmalte, bebida.recipiente.interior), markup };
}
