// Fondo pastel kawaii: cielo rosa y lavanda, nubes redondas, destellos que titilan y una mesa con lunares.
import { crearAzar } from '../util/azar.js';
import { n } from '../util/svg.js';

const NUBE = `<svg viewBox="0 0 220 110" aria-hidden="true">
  <path d="M32 96C10 96 4 66 28 60C24 34 54 22 72 38C80 12 124 8 134 36C154 20 188 30 186 56C210 58 216 94 190 96Z" fill="#F6D3E2" transform="translate(4 8)"/>
  <path d="M32 96C10 96 4 66 28 60C24 34 54 22 72 38C80 12 124 8 134 36C154 20 188 30 186 56C210 58 216 94 190 96Z" fill="#FFFFFF"/>
  <ellipse cx="74" cy="56" rx="22" ry="10" fill="#FFFFFF" opacity="0.8"/>
</svg>`;

const DESTELLO = '<svg viewBox="-10 -10 20 20" aria-hidden="true"><path d="M0 -9.5C1.1 -2.2 2.2 -1.1 9.5 0C2.2 1.1 1.1 2.2 0 9.5C-1.1 2.2 -2.2 1.1 -9.5 0C-2.2 -1.1 -1.1 -2.2 0 -9.5Z" fill="currentColor"/></svg>';

const COLORES = ['#FFFFFF', '#FF9EBB', '#B9A2EE', '#86D3B4', '#FFD27A'];

export function montarFondoKawaii(contenedor, { movimiento = true } = {}) {
  const azar = crearAzar(9);
  const nubes = [
    [3, 8, 1.15], [64, 4, 0.85], [80, 30, 1.25], [14, 36, 0.7], [44, 18, 0.6],
  ].map(([x, y, e], i) => `<div class="nube" style="left:${x}%;top:${y}%;--e:${e};--i:${i}">${NUBE}</div>`).join('');
  let destellos = '';
  for (let i = 0; i < 18; i++) {
    destellos += `<span class="destello" style="left:${n(azar.entre(2, 98))}%;top:${n(azar.entre(3, 62))}%;--tam:${n(azar.entre(9, 20))}px;--retraso:${n(azar.entre(0, 5))}s;color:${COLORES[i % COLORES.length]}">${DESTELLO}</span>`;
  }
  contenedor.innerHTML = `
    <div class="fondo-cielo"></div>
    <div class="nubes">${nubes}</div>
    <div class="destellos${movimiento ? '' : ' quietos'}">${destellos}</div>
    <div class="fondo-mesa"></div>`;
  return { detener() {} };
}
