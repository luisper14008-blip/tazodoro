// Máquinas y herramientas que sirven la bebida durante el descanso.
// Se dibujan en coordenadas de la escena (viewBox 400 × 460) alrededor de la boquilla de salida.
import { n, nuevoId, paradas } from '../util/svg.js';

const CROMO = [[0, '#4C5462'], [0.14, '#E8ECF1'], [0.3, '#97A0AC'], [0.52, '#F8FAFC'], [0.7, '#8B94A1'], [0.86, '#D8DDE3'], [1, '#4A5260']];

// Cafetera de espresso. salida: [x, y] de la punta de las boquillas. mesa: línea de la mesa.
export function crearCafetera({ salida: [x, y], mesa, movimiento = true }) {
  const id = { cromo: nuevoId('cromo'), cuerpo: nuevoId('cuerpo'), panel: nuevoId('panel'), mango: nuevoId('mango'), luz: nuevoId('luz') };
  const arriba = Math.max(30, y - 150);
  const ancho = 268;
  const izq = x - ancho / 2;
  // Dos tacitas boca abajo calentándose sobre la máquina.
  const tacita = (cx) => `<path d="M${n(cx - 13)} ${n(arriba - 12)}L${n(cx - 10)} ${n(arriba - 27)}H${n(cx + 10)}L${n(cx + 13)} ${n(arriba - 12)}Z" fill="#EDE5DA"/><path d="M${n(cx - 10)} ${n(arriba - 27)}H${n(cx + 10)}" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="1.4"/><path d="M${n(cx + 1)} ${n(arriba - 22)}H${n(cx + 12)}" stroke="#000" stroke-opacity="0.12" stroke-width="3"/>`;
  const aguja = movimiento
    ? '<animateTransform attributeName="transform" type="rotate" values="-38;18;6;22;10;-38" keyTimes="0;0.2;0.45;0.65;0.9;1" dur="5s" repeatCount="indefinite" additive="sum"/>'
    : '';
  const vaho = movimiento
    ? [0, 1, 2].map((i) => `<circle cx="${n(x - 18 + i * 14)}" cy="${n(y - 14)}" r="3" fill="#FFFFFF" opacity="0"><animate attributeName="cy" values="${n(y - 14)};${n(y - 44)}" dur="2.4s" begin="${i * 0.8}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0.35;0" dur="2.4s" begin="${i * 0.8}s" repeatCount="indefinite"/><animate attributeName="r" values="2;7" dur="2.4s" begin="${i * 0.8}s" repeatCount="indefinite"/></circle>`).join('')
    : '';

  const svg = `
    <defs>
      <linearGradient id="${id.cromo}">${paradas(CROMO)}</linearGradient>
      <linearGradient id="${id.cuerpo}">
        <stop offset="0" style="stop-color:var(--maquina-sombra,#1B222D)"/>
        <stop offset="0.18" style="stop-color:var(--maquina-cuerpo,#2E3947)"/>
        <stop offset="0.72" style="stop-color:var(--maquina-luz,#4A4C55)"/>
        <stop offset="1" style="stop-color:var(--maquina-sombra,#1B222D)"/>
      </linearGradient>
      <linearGradient id="${id.panel}" x1="0" y1="0" x2="0" y2="1">${paradas([[0, '#FFFFFF', 0.09], [0.5, '#FFFFFF', 0.02], [1, '#000000', 0.18]])}</linearGradient>
      <linearGradient id="${id.mango}" x1="0" y1="0" x2="0" y2="1">${paradas([[0, '#4A3A33'], [0.4, '#241A17'], [1, '#0E0A09']])}</linearGradient>
      <radialGradient id="${id.luz}">${paradas([[0, '#FFE2A6'], [0.5, '#F2A33A'], [1, '#F2A33A', 0]])}</radialGradient>
    </defs>
    <g class="cafetera">
      ${tacita(izq + 70)}${tacita(izq + 104)}
      <rect x="${n(izq + 14)}" y="${n(arriba - 12)}" width="${ancho - 28}" height="5" rx="2.5" fill="url(#${id.cromo})"/>
      ${[0.18, 0.5, 0.82].map((f) => `<rect x="${n(izq + 14 + (ancho - 28) * f - 2)}" y="${n(arriba - 8)}" width="4" height="9" fill="#7D8693"/>`).join('')}
      <rect x="${n(izq)}" y="${n(arriba)}" width="${ancho}" height="${n(mesa - arriba - 4)}" rx="20" fill="url(#${id.cuerpo})"/>
      <rect x="${n(izq + 12)}" y="${n(arriba + 12)}" width="${ancho - 24}" height="${n(mesa - arriba - 30)}" rx="14" fill="url(#${id.panel})" stroke="#FFFFFF" stroke-opacity="0.08"/>
      <g transform="translate(${n(izq + 52)} ${n(arriba + 52)})">
        <circle r="21" fill="url(#${id.cromo})"/>
        <circle r="16.5" fill="#F4EEE3"/>
        ${Array.from({ length: 9 }, (_, i) => { const a = (-130 + i * 32.5) * Math.PI / 180; return `<line x1="${n(Math.sin(a) * 12)}" y1="${n(-Math.cos(a) * 12)}" x2="${n(Math.sin(a) * 15)}" y2="${n(-Math.cos(a) * 15)}" stroke="#3A332E" stroke-width="1"/>`; }).join('')}
        <path d="M-6 -1A7 7 0 0 1 6 -1" fill="none" stroke="#C0392B" stroke-width="2"/>
        <g class="aguja"><line x1="0" y1="2" x2="0" y2="-12" stroke="#B83228" stroke-width="1.6" stroke-linecap="round"/>${aguja}</g>
        <circle r="2.2" fill="#3A332E"/>
      </g>
      <circle class="cafetera-luz" cx="${n(izq + ancho - 46)}" cy="${n(arriba + 44)}" r="9" fill="url(#${id.luz})" opacity="0.25"/>
      <circle cx="${n(izq + ancho - 46)}" cy="${n(arriba + 44)}" r="3.4" fill="#F7C46A"/>
      <circle cx="${n(izq + ancho - 46)}" cy="${n(arriba + 74)}" r="9" fill="url(#${id.mango})"/>
      <rect x="${n(izq + 24)}" y="${n(arriba + 92)}" width="7" height="${n(mesa - arriba - 170)}" rx="3.5" fill="url(#${id.cromo})" transform="rotate(6 ${n(izq + 27)} ${n(arriba + 92)})"/>
      <circle cx="${n(izq + 27)}" cy="${n(arriba + 90)}" r="8" fill="url(#${id.mango})"/>
      <path d="M${n(x - 34)} ${n(y - 64)}H${n(x + 34)}L${n(x + 28)} ${n(y - 34)}H${n(x - 28)}Z" fill="url(#${id.cromo})"/>
      <rect x="${n(x - 38)}" y="${n(y - 70)}" width="76" height="9" rx="4" fill="url(#${id.cromo})"/>
      <path d="M${n(x - 25)} ${n(y - 34)}H${n(x + 25)}L${n(x + 21)} ${n(y - 18)}H${n(x - 21)}Z" fill="#6E7682"/>
      <path d="M${n(x + 20)} ${n(y - 31)}L${n(x + 92)} ${n(y - 22)}Q${n(x + 100)} ${n(y - 20)} ${n(x + 96)} ${n(y - 14)}L${n(x + 20)} ${n(y - 20)}Z" fill="url(#${id.mango})"/>
      <path d="M${n(x - 12)} ${n(y - 18)}H${n(x + 12)}L${n(x + 8)} ${n(y - 9)}H${n(x - 8)}Z" fill="url(#${id.cromo})"/>
      <rect x="${n(x - 8)}" y="${n(y - 10)}" width="4.5" height="10" rx="1.5" fill="#8A929E"/>
      <rect x="${n(x + 3.5)}" y="${n(y - 10)}" width="4.5" height="10" rx="1.5" fill="#8A929E"/>
      <g class="cafetera-vaho">${vaho}</g>
      <path d="M${n(izq + 6)} ${n(mesa - 20)}H${n(izq + ancho - 6)}L${n(izq + ancho - 18)} ${n(mesa - 4)}H${n(izq + 18)}Z" fill="url(#${id.cromo})" opacity="0.9"/>
    </g>`;

  return { svg, salida: [x, y], separacion: 5.75 };
}

// Jarrita de leche inclinada. salida: [x, y] de la punta del pico.
export function crearJarra({ salida: [x, y], movimiento = true }) {
  const id = { cromo: nuevoId('jarra'), boca: nuevoId('boca') };
  const vaiven = movimiento
    ? '<animateTransform attributeName="transform" type="rotate" values="0;-3;2;0" dur="1.6s" repeatCount="indefinite" additive="sum"/>'
    : '';
  // Jarra dibujada derecha con la punta del pico en (0, 0) y luego girada para servir.
  const svg = `
    <defs>
      <linearGradient id="${id.cromo}">${paradas(CROMO)}</linearGradient>
      <linearGradient id="${id.boca}" x1="0" y1="0" x2="0" y2="1">${paradas([[0, '#FFFDF8'], [1, '#E9DCC8']])}</linearGradient>
    </defs>
    <g class="jarra" transform="translate(${n(x)} ${n(y)}) rotate(-70)">
      <g>
        ${vaiven}
        <path d="M14 22C14 18 18 9 26 8L86 8C94 9 96 14 96 22L102 104Q102 116 90 116L22 116Q8 116 8 104Z" fill="url(#${id.cromo})"/>
        <path d="M96 30C126 26 128 66 100 84" fill="none" stroke="#5A626E" stroke-width="9" stroke-linecap="round"/>
        <path d="M96 30C122 27 124 62 100 80" fill="none" stroke="#C9CFD7" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="56" cy="8.5" rx="34" ry="5.5" fill="url(#${id.boca})"/>
        <path d="M0 0C6 2 16 6 24 8L22 13C14 10 6 6 0 0Z" fill="#B7BEC8"/>
        <path d="M18 30L22 108" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="3" stroke-linecap="round"/>
      </g>
    </g>`;
  return { svg, salida: [x, y] };
}
