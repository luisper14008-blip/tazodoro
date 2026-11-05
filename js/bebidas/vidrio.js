// Recipientes de vidrio o plástico: el líquido se ve por las paredes, en capas.
// Cada capa es una franja entre los arcos frontales de dos alturas; la superficie (disco unitario) la cubre por arriba.
// Lo que cambia con el nivel (franjas, recortes de la pajita y de las marcas) se recalcula en actualizar().
import { n, paradas, elipse, caminoSuave } from '../util/svg.js';
import { mezclarColor } from '../util/color.js';
import { crearAzar } from '../util/azar.js';
import { contorno } from './recipientes.js';
import { LUZ, PI, arco, bandaExterior, marcadoChorros } from './partes.js';

const MATERIALES = {
  vidrio: { cuerpo: 0.07, filo: 0.3, brillo: 0.55, base: 0.3 },
  plastico: { cuerpo: 0.1, filo: 0.2, brillo: 0.4, base: 0.16 },
};

// Franja de líquido entre dos alturas, siguiendo la silueta interior.
function franja(g, hArriba, hAbajo, extra = 1.5) {
  const { cx, s, yc } = g;
  const pasos = 6;
  const der = [];
  const izq = [];
  for (let i = 0; i <= pasos; i++) {
    const h = hArriba + ((hAbajo - hArriba) * i) / pasos;
    const r = g.rIn(h) + extra;
    der.push([cx + r, yc(h)]);
    izq.unshift([cx - r, yc(h)]);
  }
  const rA = g.rIn(hArriba) + extra;
  const rB = g.rIn(hAbajo) + extra;
  return `M${n(cx - rA)} ${n(yc(hArriba))}A${n(rA)} ${n(rA * s)} 0 0 0 ${n(cx + rA)} ${n(yc(hArriba))}` +
    der.slice(1).map(([x, y]) => `L${n(x)} ${n(y)}`).join('') +
    `A${n(rB)} ${n(rB * s)} 0 0 1 ${n(cx - rB)} ${n(yc(hAbajo))}` +
    izq.slice(1).map(([x, y]) => `L${n(x)} ${n(y)}`).join('') + 'Z';
}

// Región por encima (o por debajo) del arco frontal de la superficie.
function sobreFrente(g, h, r) {
  const y = g.yc(h);
  return `M-600 -600H1000V${n(y)}H${n(g.cx + r)}A${n(r)} ${n(r * g.s)} 0 0 1 ${n(g.cx - r)} ${n(y)}H-600Z`;
}
function bajoFrente(g, h, r) {
  const y = g.yc(h);
  return `M-600 ${n(y)}H${n(g.cx - r)}A${n(r)} ${n(r * g.s)} 0 0 0 ${n(g.cx + r)} ${n(y)}H1000V1200H-600Z`;
}

function degradadoCapa(id, color) {
  const tono = (otro, t) => mezclarColor(color, otro, t);
  return `<linearGradient id="${id}">${paradas([
    [0, tono('#000000', 0.42)], [0.12, tono(LUZ.fria, 0.18)], [0.4, color], [0.66, tono(LUZ.calida, 0.22)],
    [0.82, color], [0.95, tono('#000000', 0.3)], [1, tono('#000000', 0.45)],
  ])}</linearGradient>`;
}

// Pajita: un cilindro recto inclinado, del fondo a por encima del borde.
function geometriaPajita(g, pajita) {
  const { def } = g;
  const hAbajo = def.piso + 3;
  const hArriba = def.alto + pajita.sobresale;
  const xAbajo = pajita.x * g.rIn(hAbajo);
  const z = pajita.z * g.rIn(hAbajo);
  const inclinacion = Math.tan((pajita.angulo * PI) / 180);
  const punto = (h) => [g.cx + xAbajo + (h - hAbajo) * inclinacion, g.yc(h) + z * g.s];
  return { hAbajo, hArriba, punto };
}

function caminoPajita(g, pajita) {
  const { hAbajo, hArriba, punto } = geometriaPajita(g, pajita);
  const [x1, y1] = punto(hAbajo);
  const [x2, y2] = punto(hArriba);
  const largo = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / largo;
  const uy = (y2 - y1) / largo;
  const px = -uy * (pajita.grosor / 2);
  const py = ux * (pajita.grosor / 2);
  return `M${n(x1 + px)} ${n(y1 + py)}L${n(x2 + px)} ${n(y2 + py)}L${n(x2 - px)} ${n(y2 - py)}L${n(x1 - px)} ${n(y1 - py)}Z`;
}

export function armarVidrio(bebida, g, ids, { superficie, flotantes, restos, movimiento }) {
  const { def, cx } = g;
  const material = MATERIALES[def.material] ?? MATERIALES.vidrio;
  const yArriba = g.yc(def.alto);
  const R = g.borde;
  const exterior = contorno(def.perfil, 0, def.alto, g);
  const cavidad = contorno(g.rIn, def.piso, def.alto, g);
  const capas = bebida.capas || [];
  const pajita = def.pajita;
  const tapa = def.tapa;
  const azar = crearAzar(77);

  const defs = `
    ${capas.map((capa, i) => degradadoCapa(`${ids.capa}-${i}`, capa.color)).join('')}
    <linearGradient id="${ids.cuerpo}">${paradas([[0, '#FFFFFF', material.filo], [0.07, '#FFFFFF', material.cuerpo], [0.5, '#FFFFFF', material.cuerpo * 0.4], [0.93, '#FFFFFF', material.cuerpo], [1, '#FFFFFF', material.filo]])}</linearGradient>
    <linearGradient id="${ids.brillo}" x1="0" y1="0" x2="0" y2="1">${paradas([[0, '#FFFFFF', 0], [0.2, '#FFFFFF', material.brillo], [0.75, '#FFF4E2', material.brillo * 0.4], [1, '#FFF4E2', 0]])}</linearGradient>
    <linearGradient id="${ids.base}-vidrio">${paradas([[0, '#DCE6F5', material.base * 1.3], [0.5, '#FFFFFF', material.base * 0.6], [0.75, '#FFF1DA', material.base * 1.4], [1, '#DCE6F5', material.base * 1.3]])}</linearGradient>
    ${pajita ? `<linearGradient id="${ids.pajita}">${paradas([[0, mezclarColor(pajita.color, '#000000', 0.4)], [0.4, pajita.color], [0.62, mezclarColor(pajita.color, '#FFFFFF', 0.35)], [1, mezclarColor(pajita.color, '#000000', 0.45)]])}</linearGradient>` : ''}
    <clipPath id="${ids.cavidad}"><path d="${cavidad}"/></clipPath>
    <clipPath id="${ids.sobreFrente}"><path class="recorte-sobre"/></clipPath>
    <clipPath id="${ids.bajoFrente}"><path class="recorte-bajo"/></clipPath>
    <clipPath id="${ids.pajitaArriba}"><rect class="recorte-pajita-arriba" x="-600" y="-600" width="1600" height="600"/></clipPath>
    <clipPath id="${ids.pajitaAbajo}"><rect class="recorte-pajita-abajo" x="-600" y="0" width="1600" height="1600"/></clipPath>
    <clipPath id="${ids.sobreBorde}"><rect x="-600" y="-600" width="1600" height="1600"/></clipPath>`;

  const gotas = def.condensacion ? marcadoCondensacion(g, def.condensacion, azar, movimiento) : '';
  const pajitaD = pajita ? caminoPajita(g, pajita) : '';
  const pajitaMarkup = (extra = '') => (pajita ? `<path d="${pajitaD}" fill="url(#${ids.pajita})" ${extra}/>` : '');

  const markup = `
    <g class="taza">
      ${elipse(cx + 2, g.yc(0) + 3, def.perfil(0) * 1.3, def.perfil(0) * 1.3 * g.s, `fill="url(#${ids.contacto})"`)}
      <path d="${exterior}" fill="url(#${ids.cuerpo})"/>
      <path d="${arco(cx, yArriba, R, R * g.s, PI, 2 * PI)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="1.2"/>
      ${restos.atras ?? ''}
      <g clip-path="url(#${ids.cavidad})">
        <g class="liquido">
          <g class="capas">${capas.map((_, i) => `<path class="capa-liquido" fill="url(#${ids.capa}-${i})"/>`).join('')}</g>
          <g class="nivel">${superficie.markup}</g>
          <g class="dentro" opacity="0.92">${flotantes.dentro ?? ''}</g>
        </g>
        ${pajitaMarkup(`clip-path="url(#${ids.pajitaAbajo})" opacity="0.3" class="al-final"`)}
      </g>
      <g clip-path="url(#${ids.sobreFrente})">${restos.markup}</g>
      <g clip-path="url(#${ids.pajitaArriba})" class="al-final">${pajitaMarkup()}</g>
      <g class="flotantes">${flotantes.markup}</g>
      <path d="${contorno(def.perfil, 0, def.piso, g, 60, 10)}" fill="url(#${ids.base}-vidrio)"/>
      <path d="${arco(cx, g.yc(def.piso * 0.45), def.perfil(def.piso * 0.45) * 0.86, def.perfil(def.piso * 0.45) * 0.86 * g.s, 0.35, 2.2)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="1.6" stroke-linecap="round"/>
      <path d="${bandaExterior(g, def.perfil, 0.3, 0.52, def.alto - 6, def.piso + 4)}" fill="url(#${ids.brillo})"/>
      <path d="${bandaExterior(g, def.perfil, PI - 0.36, PI - 0.2, def.alto - 10, def.piso + 10)}" fill="url(#${ids.brillo})" opacity="0.5"/>
      <g clip-path="url(#${ids.bajoFrente})">${gotas}</g>
      <path d="${arco(cx, yArriba, R, R * g.s, 0, PI)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.65" stroke-width="1.6"/>
      <path d="${arco(cx, yArriba, g.bordeIn, g.bordeIn * g.s, 0.15, PI - 0.15)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="0.8"/>
      ${tapa ? `<g class="tapa al-final">${marcadoTapa(g, tapa, ids)}</g>` : ''}
      ${pajita && tapa ? `<g class="al-final">${pajitaMarkup(`clip-path="url(#${ids.pajitaArriba})"`)}</g>` : ''}
      ${marcadoChorros(ids, movimiento)}
    </g>`;

  let el = {};
  return {
    defs,
    markup,
    montar(raiz) {
      el = {
        capas: [...raiz.querySelectorAll('.capa-liquido')],
        dentro: raiz.querySelector('.dentro'),
        sobre: raiz.querySelector('.recorte-sobre'),
        bajo: raiz.querySelector('.recorte-bajo'),
        pajitaArriba: raiz.querySelector('.recorte-pajita-arriba'),
        pajitaAbajo: raiz.querySelector('.recorte-pajita-abajo'),
        alFinal: [...raiz.querySelectorAll('.al-final')],
      };
    },
    // visibles: capas con alturas (0..1); h: altura de la superficie; r: su radio.
    actualizar({ visibles, h, r, nivel, modo }) {
      const alto = (f) => def.piso + (def.lleno - def.piso) * f;
      el.capas.forEach((camino, i) => {
        const tramo = visibles.find((v) => v.capa === capas[i]);
        if (!tramo || tramo.hasta - tramo.desde < 0.0005) camino.setAttribute('d', '');
        else camino.setAttribute('d', franja(g, alto(tramo.hasta), alto(tramo.desde)));
      });
      el.sobre.setAttribute('d', sobreFrente(g, h, r));
      el.bajo.setAttribute('d', bajoFrente(g, h, r));
      if (pajita) {
        const { punto } = geometriaPajita(g, pajita);
        const [, yEntrada] = punto(h);
        el.pajitaArriba.setAttribute('height', n(600 + yEntrada));
        el.pajitaAbajo.setAttribute('y', n(yEntrada));
      }
      // Tapa y pajita se ponen cuando la bebida ya está servida.
      const servida = modo !== 'llenando' || nivel > 0.97;
      el.alFinal.forEach((nodo) => nodo.setAttribute('visibility', servida ? 'visible' : 'hidden'));
    },
    dentro: () => el.dentro,
  };
}

function marcadoTapa(g, tapa, ids) {
  const { cx } = g;
  const y = g.yc(g.def.alto);
  const R = g.borde + 2.5;
  const anillo = `${elipse(cx, y, R, R * g.s, 'fill="none" stroke="#FFFFFF" stroke-opacity="0.75" stroke-width="3"')}`;
  if (tapa.tipo === 'domo') {
    const alto = tapa.alto * g.c;
    return `
      <path d="M${n(cx - R)} ${n(y)}C${n(cx - R)} ${n(y - alto * 1.32)} ${n(cx + R)} ${n(y - alto * 1.32)} ${n(cx + R)} ${n(y)}A${n(R)} ${n(R * g.s)} 0 0 1 ${n(cx - R)} ${n(y)}Z" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="1.2"/>
      <path d="M${n(cx - R * 0.62)} ${n(y - alto * 0.62)}C${n(cx - R * 0.5)} ${n(y - alto * 0.95)} ${n(cx - R * 0.1)} ${n(y - alto * 1.02)} ${n(cx + R * 0.05)} ${n(y - alto * 0.99)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="2.2" stroke-linecap="round"/>
      ${elipse(cx, y - alto * 0.98, R * 0.16, R * 0.16 * g.s, 'fill="#FFFFFF" fill-opacity="0.18" stroke="#FFFFFF" stroke-opacity="0.5"')}
      ${anillo}`;
  }
  // Sello de plástico impreso, como el de los vasos de bubble tea.
  const puntos = [];
  const azar = crearAzar(3);
  for (let i = 0; i < 22; i++) {
    const a = azar.entre(0, PI * 2);
    const d = Math.sqrt(azar.siguiente()) * 0.82;
    puntos.push(`<circle cx="${n(cx + Math.cos(a) * d * R)}" cy="${n(y + Math.sin(a) * d * R * g.s)}" r="${n(azar.entre(2, 3.6))}" fill="${tapa.puntos ?? '#F29BB0'}" opacity="0.7"/>`);
  }
  return `
    ${elipse(cx, y, R, R * g.s, `fill="${tapa.color ?? '#FBF2E4'}" fill-opacity="0.9"`)}
    ${puntos.join('')}
    ${elipse(cx + R * 0.25, y - R * g.s * 0.3, R * 0.45, R * g.s * 0.25, 'fill="#FFFFFF" opacity="0.35"')}
    ${anillo}`;
}

function marcadoCondensacion(g, { cantidad = 24 }, azar, movimiento) {
  const { def } = g;
  let markup = '';
  for (let i = 0; i < cantidad; i++) {
    const theta = azar.entre(0.3, PI - 0.3);
    const h = azar.entre(def.piso + 6, def.lleno * 0.96);
    const r = def.perfil(h) + 0.6;
    const x = g.cx + r * Math.cos(theta);
    const y = g.yc(h) + r * g.s * Math.sin(theta);
    const tam = azar.entre(1.1, 2.9);
    const resbala = movimiento && i % 5 === 0;
    const anim = resbala
      ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 ${n(azar.entre(18, 46))}" keyTimes="0;0.7;1" dur="${n(azar.entre(7, 13))}s" begin="${n(azar.entre(0, 8))}s" repeatCount="indefinite"/>`
      : '';
    markup += `<g>${anim}<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(tam)}" ry="${n(tam * 1.3)}" fill="#FFFFFF" fill-opacity="0.16" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="0.5"/><circle cx="${n(x - tam * 0.35)}" cy="${n(y - tam * 0.45)}" r="${n(tam * 0.35)}" fill="#FFFFFF" opacity="0.75"/></g>`;
  }
  return markup;
}
