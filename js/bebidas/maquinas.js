// Máquinas y herramientas que sirven la bebida durante el descanso.
// Se dibujan en coordenadas de la escena (viewBox 400 × 460) alrededor de la boquilla de salida.
import { n, nuevoId, paradas } from '../util/svg.js';

const CROMO = [[0, '#4C5462'], [0.14, '#E8ECF1'], [0.3, '#97A0AC'], [0.52, '#F8FAFC'], [0.7, '#8B94A1'], [0.86, '#D8DDE3'], [1, '#4A5260']];

// Cafetera de espresso. salida: [x, y] de la punta de las boquillas. mesa: línea de la mesa.
export function crearCafetera({ salida: [x, y], mesa, movimiento = true }) {
  const id = { cromo: nuevoId('cromo'), cuerpo: nuevoId('cuerpo'), panel: nuevoId('panel'), mango: nuevoId('mango'), luz: nuevoId('luz') };
  // Con recipientes altos la máquina se acorta por arriba para no salirse de la escena.
  const arriba = Math.min(Math.max(30, y - 150), y - 82);
  const hayLugar = arriba >= 30;
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
      ${hayLugar ? tacita(izq + 70) + tacita(izq + 104) : ''}
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

// Jarrita de leche (o de chocolate) inclinada. salida: [x, y] de la punta del pico.
export function crearJarra({ salida: [x, y], movimiento = true, color = '#FFFDF8' }) {
  const id = { cromo: nuevoId('jarra'), boca: nuevoId('boca') };
  const vaiven = movimiento
    ? '<animateTransform attributeName="transform" type="rotate" values="0;-3;2;0" dur="1.6s" repeatCount="indefinite" additive="sum"/>'
    : '';
  // Jarra dibujada derecha con la punta del pico en (0, 0) y luego girada para servir.
  const svg = `
    <defs>
      <linearGradient id="${id.cromo}">${paradas(CROMO)}</linearGradient>
      <linearGradient id="${id.boca}" x1="0" y1="0" x2="0" y2="1">${paradas([[0, color], [1, '#E9DCC8']])}</linearGradient>
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

// Herramienta inclinada para servir: se dibuja derecha con el pico en (0, 0) y se gira.
function inclinada(x, y, giro, contenido, movimiento, vaiven = '0;-3;2;0') {
  const anim = movimiento ? `<animateTransform attributeName="transform" type="rotate" values="${vaiven}" dur="1.8s" repeatCount="indefinite" additive="sum"/>` : '';
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${giro})"><g>${anim}${contenido}</g></g>`;
}

// Jarra de vidrio con cold brew.
export function crearJarraVidrio({ salida: [x, y], movimiento = true, color = '#2A160C' }) {
  const id = { vidrio: nuevoId('jarraV'), cafe: nuevoId('cafeJ') };
  const svg = `
    <defs>
      <linearGradient id="${id.vidrio}">${paradas([[0, '#FFFFFF', 0.35], [0.12, '#FFFFFF', 0.08], [0.7, '#FFFFFF', 0.05], [0.9, '#FFFFFF', 0.25], [1, '#FFFFFF', 0.4]])}</linearGradient>
      <linearGradient id="${id.cafe}">${paradas([[0, color], [0.5, '#5A3018'], [1, color]])}</linearGradient>
    </defs>
    ${inclinada(x, y, -64, `
      <path d="M10 46C2 70 4 112 22 124H78C96 112 98 70 90 46Z" fill="url(#${id.cafe})" opacity="0.92"/>
      <path d="M14 8H76C76 20 82 30 92 44C100 74 98 112 80 126H20C2 112 0 74 8 44C18 30 22 20 14 8Z" fill="url(#${id.vidrio})" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="1.6"/>
      <path d="M0 0C6 2 12 6 16 9" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="2" fill="none"/>
      <path d="M90 52C116 50 118 96 92 100" fill="none" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="5" stroke-linecap="round"/>
      <path d="M24 40C18 64 18 96 26 114" fill="none" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="3" stroke-linecap="round"/>`, movimiento)}`;
  return { svg, salida: [x, y] };
}

// Tetera de cerámica verde azulado con detalles dorados (chai, matcha).
export function crearTetera({ salida: [x, y], movimiento = true }) {
  const id = { cuerpo: nuevoId('tetera') };
  const svg = `
    <defs><radialGradient id="${id.cuerpo}" cx="0.62" cy="0.32" r="0.75">${paradas([[0, '#7FB0A8'], [0.5, '#3F6E68'], [1, '#1E3B38']])}</radialGradient></defs>
    ${inclinada(x, y, -50, `
      <path d="M26 58C18 40 8 20 0 0C10 4 22 22 36 42Z" fill="url(#${id.cuerpo})"/>
      <path d="M110 22C140 18 142 66 112 66" fill="none" stroke="#2E534E" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="72" cy="46" rx="48" ry="40" fill="url(#${id.cuerpo})"/>
      <path d="M28 40C40 30 104 30 116 40" fill="none" stroke="#D9B26A" stroke-width="2.4" opacity="0.85"/>
      <ellipse cx="72" cy="12" rx="24" ry="7" fill="#2E534E"/>
      <path d="M60 10C60 -2 84 -2 84 10Z" fill="url(#${id.cuerpo})"/>
      <circle cx="72" cy="-1" r="5" fill="#D9B26A"/>
      <ellipse cx="88" cy="30" rx="12" ry="18" fill="#FFFFFF" opacity="0.22" transform="rotate(-20 88 30)"/>`, movimiento)}`;
  return { svg, salida: [x, y] };
}

// Vaso de licuadora inclinado con frappé.
export function crearLicuadora({ salida: [x, y], movimiento = true, color = '#C9A07A' }) {
  const id = { vaso: nuevoId('licuadora'), batido: nuevoId('batido') };
  const svg = `
    <defs>
      <linearGradient id="${id.vaso}">${paradas([[0, '#FFFFFF', 0.4], [0.15, '#FFFFFF', 0.1], [0.8, '#FFFFFF', 0.08], [1, '#FFFFFF', 0.38]])}</linearGradient>
      <linearGradient id="${id.batido}">${paradas([[0, '#A27A58'], [0.5, color], [1, '#93684A']])}</linearGradient>
    </defs>
    ${inclinada(x, y, -78, `
      <path d="M8 40L22 140H74L88 40Z" fill="url(#${id.batido})"/>
      <path d="M2 2H92L80 146H18Z" fill="url(#${id.vaso})" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="1.6"/>
      <path d="M90 26C118 26 116 92 84 96" fill="none" stroke="#2B2B2E" stroke-width="10" stroke-linecap="round"/>
      <rect x="10" y="-8" width="80" height="12" rx="4" fill="#2B2B2E"/>
      <path d="M22 60L28 128" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="3" stroke-linecap="round"/>`, movimiento, '0;-1.5;1.5;0')}`;
  return { svg, salida: [x, y] };
}

// Base de la licuadora: queda atrás, a la derecha de la bebida.
export function crearBaseLicuadora({ salida: [x], mesa }) {
  const id = nuevoId('baseLic');
  const bx = x + 118;
  const svg = `
    <defs><linearGradient id="${id}">${paradas([[0, '#1C1C20'], [0.4, '#3C3C44'], [0.75, '#55555F'], [1, '#1C1C20']])}</linearGradient></defs>
    <g class="licuadora-base">
      <path d="M${n(bx - 46)} ${n(mesa - 6)}L${n(bx - 38)} ${n(mesa - 76)}H${n(bx + 38)}L${n(bx + 46)} ${n(mesa - 6)}Z" fill="url(#${id})"/>
      <rect x="${n(bx - 30)}" y="${n(mesa - 84)}" width="60" height="10" rx="3" fill="#2A2A30"/>
      <circle cx="${n(bx)}" cy="${n(mesa - 40)}" r="11" fill="#2A2A30" stroke="#8A8A96" stroke-width="2"/>
      <circle cx="${n(bx + 26)}" cy="${n(mesa - 40)}" r="3" fill="#F2A33A"/>
    </g>`;
  return { svg, salida: [x, mesa] };
}

// Coctelera de metal inclinada (bubble tea).
export function crearCoctelera({ salida: [x, y], movimiento = true }) {
  const id = nuevoId('coctelera');
  const svg = `
    <defs><linearGradient id="${id}">${paradas(CROMO)}</linearGradient></defs>
    ${inclinada(x, y, -125, `
      <path d="M-11 0H11L20 26H-20Z" fill="url(#${id})"/>
      <rect x="-24" y="24" width="48" height="8" rx="3" fill="#8A929E"/>
      <path d="M-30 32H30L24 150H-24Z" fill="url(#${id})"/>
      <path d="M-14 42L-11 140" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="3" stroke-linecap="round"/>`, movimiento, '0;-6;5;-4;0')}`;
  return { svg, salida: [x, y] };
}

// Registro: dónde va cada herramienta y cómo sale su chorro.
export const HERRAMIENTAS = {
  cafetera: { capa: 'atras', crear: crearCafetera, chorro: 'doble', ancho: 3.4, pico: [0, -22] },
  jarra: { capa: 'adelante', crear: crearJarra, chorro: 'simple', ancho: 7.5, pico: [10, -34] },
  'jarra-vidrio': { capa: 'adelante', crear: crearJarraVidrio, chorro: 'simple', ancho: 6.5, pico: [12, -34] },
  tetera: { capa: 'adelante', crear: crearTetera, chorro: 'simple', ancho: 5, pico: [12, -30] },
  licuadora: { capa: 'adelante', crear: crearLicuadora, chorro: 'simple', ancho: 10, pico: [10, -34], base: crearBaseLicuadora },
  coctelera: { capa: 'adelante', crear: crearCoctelera, chorro: 'simple', ancho: 6.5, pico: [10, -30] },
};
