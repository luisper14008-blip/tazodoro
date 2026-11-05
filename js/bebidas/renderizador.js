// Renderizador común: arma el SVG de una bebida a partir de sus datos del catálogo.
// Capas de atrás hacia delante: sombra y plato → cuerpo y asa → interior (pared, restos, superficie)
// → labio del borde → chorro al servir.
import { n, nuevoId, paradas, elipse, caminoSuave } from '../util/svg.js';
import { limitar } from '../util/azar.js';
import { mezclarColor } from '../util/color.js';
import { ESCENA, RECIPIENTES, geometria, contorno, caminoAsa, perfilPlato, validarVisibilidad } from './recipientes.js';
import { crearSuperficie } from './detalles.js';
import { crearRestos } from './restos.js';

// Luz de la escena: cálida desde la lámpara (derecha) y fría desde la ventana (izquierda).
export const LUZ = { calida: '#FFE6BF', fria: '#4F5B7C', sombra: '#211A22' };
const PI = Math.PI;

const NOMBRES_IDS = ['sombraMesa', 'platoLado', 'platoCara', 'platoHondo', 'cuerpo', 'oclusion', 'brillo', 'asa', 'interior',
  'abertura', 'labio', 'base', 'textura', 'flor', 'disco', 'tinte', 'chorro', 'chorroLeche', 'sobreBorde', 'contacto'];

// Elipse completa como path (para combinar con evenodd).
const caminoElipse = (cx, cy, rx, ry) => `M${n(cx - rx)} ${n(cy)}A${n(rx)} ${n(ry)} 0 1 0 ${n(cx + rx)} ${n(cy)}A${n(rx)} ${n(ry)} 0 1 0 ${n(cx - rx)} ${n(cy)}Z`;

// Reflejo del esmalte sobre el cuerpo: una banda angosta en el frente derecho.
function bandaExterior(g, t1, t2, hArriba, hAbajo, pasos = 24) {
  const ida = [];
  const vuelta = [];
  for (let i = 0; i <= pasos; i++) {
    const u = i / pasos;
    const h = hArriba + (hAbajo - hArriba) * u;
    const r = g.def.perfil(h) + 0.2;
    const medio = (t1 + t2) / 2;
    const ancho = ((t2 - t1) / 2) * (0.25 + 0.75 * Math.sin(PI * u));
    ida.push([g.cx + r * Math.cos(medio - ancho), g.yc(h) + r * g.s * Math.sin(medio - ancho)]);
    vuelta.unshift([g.cx + r * Math.cos(medio + ancho), g.yc(h) + r * g.s * Math.sin(medio + ancho)]);
  }
  return caminoSuave([...ida, ...vuelta]);
}

function arcoFrente(cx, cy, rx, ry, desde, hasta) {
  const [x1, y1] = [cx + rx * Math.cos(desde), cy + ry * Math.sin(desde)];
  const [x2, y2] = [cx + rx * Math.cos(hasta), cy + ry * Math.sin(hasta)];
  return `M${n(x1)} ${n(y1)}A${n(rx)} ${n(ry)} 0 0 1 ${n(x2)} ${n(y2)}`;
}

function marcadoPlato(g, plato, ids) {
  const { cx, s, c, mesa } = g;
  const yc = (h) => mesa - h * c;
  const R = plato.radio;
  const arriba = yc(plato.alto);
  const hondo = yc(plato.alto - plato.hondo);
  return `
    ${elipse(cx + 10, mesa + 7, R * 1.08, R * s * 1.14, `fill="url(#${ids.sombraMesa})"`)}
    <path d="${contorno(perfilPlato(plato), 0, plato.alto, { cx, s, yc }, 72, 12)}" fill="url(#${ids.platoLado})"/>
    ${elipse(cx, arriba, R, R * s, `fill="url(#${ids.platoCara})"`)}
    ${elipse(cx, hondo, R - 14, (R - 14) * s, `fill="url(#${ids.platoHondo})"`)}
    ${elipse(cx, hondo, plato.pozo, plato.pozo * s, `fill="none" stroke="${LUZ.sombra}" stroke-opacity="0.16" stroke-width="1.6"`)}
    <path d="${arcoFrente(cx, arriba, R - 0.6, (R - 0.6) * s, 0.12, 2.3)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="1.3" stroke-linecap="round"/>`;
}

function definiciones(g, ids, esmalte) {
  const { def } = g;
  const tono = (color, t) => mezclarColor(esmalte, color, t);
  const yArriba = g.yc(def.alto);
  const R = g.borde;
  return `
    <radialGradient id="${ids.sombraMesa}">${paradas([[0, '#07060C', 0.55], [0.55, '#07060C', 0.28], [1, '#07060C', 0]])}</radialGradient>
    <radialGradient id="${ids.contacto}">${paradas([[0, LUZ.sombra, 0.5], [0.7, LUZ.sombra, 0.18], [1, LUZ.sombra, 0]])}</radialGradient>
    <linearGradient id="${ids.platoLado}">${paradas([[0, tono(LUZ.fria, 0.7)], [0.5, tono(LUZ.sombra, 0.35)], [0.8, tono(LUZ.calida, 0.2)], [1, tono(LUZ.sombra, 0.55)]])}</linearGradient>
    <radialGradient id="${ids.platoCara}" cx="0.58" cy="0.46" r="0.62">${paradas([[0, tono(LUZ.calida, 0.45)], [0.6, esmalte], [0.88, tono(LUZ.fria, 0.22)], [1, tono(LUZ.fria, 0.4)]])}</radialGradient>
    <radialGradient id="${ids.platoHondo}" cx="0.56" cy="0.58" r="0.6">${paradas([[0, tono(LUZ.calida, 0.3)], [0.7, tono(LUZ.sombra, 0.08)], [1, tono(LUZ.sombra, 0.2)]])}</radialGradient>
    <linearGradient id="${ids.cuerpo}">${paradas([
      [0, tono(LUZ.fria, 0.62)], [0.1, tono(LUZ.fria, 0.38)], [0.3, tono(LUZ.fria, 0.12)], [0.52, esmalte],
      [0.7, tono(LUZ.calida, 0.55)], [0.83, tono(LUZ.calida, 0.18)], [0.94, tono('#6E4E3A', 0.32)], [1, tono('#3E2C24', 0.55)],
    ])}</linearGradient>
    <linearGradient id="${ids.oclusion}" x1="0" y1="0" x2="0" y2="1">${paradas([[0, LUZ.sombra, 0], [0.5, LUZ.sombra, 0], [1, LUZ.sombra, 0.42]])}</linearGradient>
    <linearGradient id="${ids.brillo}" x1="0" y1="0" x2="0" y2="1">${paradas([[0, '#FFFFFF', 0], [0.25, '#FFFFFF', 0.75], [0.7, '#FFF4E2', 0.35], [1, '#FFF4E2', 0]])}</linearGradient>
    <linearGradient id="${ids.asa}" x1="0" y1="0" x2="0.35" y2="1">${paradas([[0, tono(LUZ.calida, 0.5)], [0.45, esmalte], [1, tono(LUZ.sombra, 0.45)]])}</linearGradient>
    <radialGradient id="${ids.interior}" cx="0.5" cy="0.12" r="0.95">${paradas([[0, tono(LUZ.calida, 0.3)], [0.45, esmalte], [0.8, tono(LUZ.sombra, 0.22)], [1, tono(LUZ.sombra, 0.42)]])}</radialGradient>
    <linearGradient id="${ids.labio}">${paradas([[0, tono(LUZ.fria, 0.45)], [0.35, tono(LUZ.fria, 0.08)], [0.7, tono(LUZ.calida, 0.6)], [1, tono('#6E4E3A', 0.3)]])}</linearGradient>
    <linearGradient id="${ids.chorro}">${paradas([[0, '#2E170A'], [0.35, '#7E451E'], [0.5, '#C4823F'], [0.65, '#7E451E'], [1, '#2E170A']])}</linearGradient>
    <linearGradient id="${ids.chorroLeche}">${paradas([[0, '#CDBFAE'], [0.4, '#FFFDF8'], [0.6, '#FFFFFF'], [1, '#C8B8A6']])}</linearGradient>
    <clipPath id="${ids.abertura}">${elipse(g.cx, yArriba, g.bordeIn, g.bordeIn * g.s)}</clipPath>
    <clipPath id="${ids.sobreBorde}"><path d="M-600 -600H1000V${n(yArriba)}H${n(g.cx + R)}A${n(R)} ${n(R * g.s)} 0 0 1 ${n(g.cx - R)} ${n(yArriba)}H-600Z"/></clipPath>`;
}

export function crearBebida(bebida, { escala = 1, movimiento = true, semilla = 11 } = {}) {
  const def = RECIPIENTES[bebida.recipiente.forma];
  if (!def) throw new Error(`Recipiente desconocido: ${bebida.recipiente.forma}`);
  if (!validarVisibilidad(def)) console.warn(`El recipiente ${bebida.recipiente.forma} esconde el fondo: sube el ángulo.`);

  const g = geometria(def);
  const ids = Object.fromEntries(NOMBRES_IDS.map((nombre) => [nombre, nuevoId(nombre)]));
  const esmalte = bebida.recipiente.color;
  const superficie = crearSuperficie(bebida, ids, { semilla, movimiento });
  const restos = crearRestos(bebida, g, ids, semilla + 7);
  const { cx, mesa } = g;
  const yArriba = g.yc(def.alto);
  const asa = caminoAsa(g);
  const cuerpo = contorno(def.perfil, 0, def.alto, g);
  const borde = mezclarColor(esmalte, LUZ.sombra, 0.55);
  const pie = def.perfil(0);
  const flujo = movimiento ? '<animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.45s" repeatCount="indefinite"/>' : '';

  const markup = `
    <defs>${definiciones(g, ids, esmalte)}${superficie.defs}${restos.defs}</defs>
    <g class="bebida" transform="translate(${cx} ${mesa}) scale(${n(escala)}) translate(${-cx} ${-mesa})">
      ${def.plato ? marcadoPlato(g, def.plato, ids) : ''}
      <g class="taza">
        ${elipse(cx - 26, g.yc(0) + 7, g.borde * 0.95, g.borde * 0.95 * g.s * 0.6, `fill="url(#${ids.contacto})" opacity="0.7"`)}
        ${elipse(cx + 3, g.yc(0) + 2, pie * 1.35, pie * 1.35 * g.s, `fill="url(#${ids.contacto})"`)}
        <path d="${cuerpo}" fill="url(#${ids.cuerpo})" stroke="${borde}" stroke-opacity="0.5" stroke-width="0.8"/>
        <path d="${cuerpo}" fill="url(#${ids.oclusion})"/>
        <path d="${bandaExterior(g, 0.32, 0.62, def.alto - 9, def.alto * 0.36)}" fill="url(#${ids.brillo})"/>
        <path d="${bandaExterior(g, PI - 0.3, PI - 0.1, def.alto - 12, def.alto * 0.45)}" fill="#B9C6E6" opacity="0.18"/>
        <path d="${asa.contorno}" fill="url(#${ids.asa})" stroke="${borde}" stroke-opacity="0.45" stroke-width="0.8"/>
        <path d="${asa.brillo}" fill="none" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="1.6" stroke-linecap="round"/>
        <g clip-path="url(#${ids.abertura})">
          ${elipse(cx, yArriba, g.bordeIn, g.bordeIn * g.s, `fill="url(#${ids.interior})"`)}
          ${restos.markup}
          <g class="nivel">${superficie.markup}</g>
          <path d="${arcoFrente(cx, g.yc(def.alto - 2), g.bordeIn, g.bordeIn * g.s, PI, 2 * PI)}" fill="none" stroke="${LUZ.sombra}" stroke-opacity="0.12" stroke-width="9"/>
          <path d="${arcoFrente(cx, g.yc(def.alto - 1), g.bordeIn, g.bordeIn * g.s, PI, 2 * PI)}" fill="none" stroke="${LUZ.sombra}" stroke-opacity="0.18" stroke-width="3"/>
        </g>
        <path d="${caminoElipse(cx, yArriba, g.borde, g.borde * g.s)}${caminoElipse(cx, yArriba, g.bordeIn, g.bordeIn * g.s)}" fill-rule="evenodd" fill="url(#${ids.labio})"/>
        <path d="${arcoFrente(cx, yArriba, (g.borde + g.bordeIn) / 2, ((g.borde + g.bordeIn) / 2) * g.s, 0.12, 1.25)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="1.5" stroke-linecap="round"/>
        <path d="${arcoFrente(cx, yArriba, g.borde, g.borde * g.s, 0.02, PI - 0.02)}" fill="none" stroke="${borde}" stroke-opacity="0.45" stroke-width="0.8"/>
        <g class="chorros" clip-path="url(#${ids.sobreBorde})" display="none">
          <path class="chorro-cafe" fill="url(#${ids.chorro})"/>
          <path class="chorro-leche" fill="url(#${ids.chorroLeche})"/>
          <path class="chorro-flujo" fill="none" stroke="#FFE7C2" stroke-opacity="0.28" stroke-width="0.8" stroke-dasharray="8 6" stroke-linecap="round">${flujo}</path>
          <ellipse class="chorro-impacto" rx="7" ry="${n(7 * g.s)}" fill="none" stroke="#FFF2DE" stroke-opacity="0.55" stroke-width="1"/>
        </g>
      </g>
    </g>`;

  let el = {};
  let estado = { nivel: 1, modo: 'vaciando' };
  let pose = { giro: 0, alza: 0 };
  let ultimo = { transform: '', nivel: -1, modo: '' };
  let chorroActual = null;

  const aLocal = ([x, y]) => [cx + (x - cx) / escala, mesa + (y - mesa) / escala];
  const aEscena = ([x, y]) => [cx + (x - cx) * escala, mesa + (y - mesa) * escala];

  function superficieEn(nivel) {
    const h = g.alturaNivel(limitar(nivel));
    return { y: g.yc(h), r: Math.max(0.1, g.rIn(h) - 0.6) };
  }

  function aplicarNivel() {
    const { y, r } = superficieEn(estado.nivel);
    const transform = `translate(${n(cx)} ${n(y)}) rotate(${n(-pose.giro)}) scale(${n(r)} ${n(r * g.s)})`;
    if (transform !== ultimo.transform) {
      el.nivel.setAttribute('transform', transform);
      ultimo.transform = transform;
    }
    if (Math.abs(estado.nivel - ultimo.nivel) > 0.004 || estado.modo !== ultimo.modo) {
      superficie.actualizar(estado);
      ultimo.nivel = estado.nivel;
      ultimo.modo = estado.modo;
    }
    if (chorroActual) dibujarChorro();
  }

  function dibujarChorro() {
    const { y: ySuperficie } = superficieEn(estado.nivel);
    const [x, yInicio] = aLocal(chorroActual.desde);
    const leche = chorroActual.tipo === 'leche';
    const fin = ySuperficie + 1;
    const forma = (xc, ancho, angosto) =>
      `M${n(xc - ancho / 2)} ${n(yInicio)}C${n(xc - ancho / 2)} ${n(yInicio + (fin - yInicio) * 0.4)} ${n(xc - angosto / 2)} ${n(fin - (fin - yInicio) * 0.3)} ${n(xc - angosto / 2)} ${n(fin)}` +
      `L${n(xc + angosto / 2)} ${n(fin)}C${n(xc + angosto / 2)} ${n(fin - (fin - yInicio) * 0.3)} ${n(xc + ancho / 2)} ${n(yInicio + (fin - yInicio) * 0.4)} ${n(xc + ancho / 2)} ${n(yInicio)}Z`;
    const separacion = (chorroActual.separacion ?? 0) / escala;
    if (leche) {
      el.chorroLeche.setAttribute('d', forma(x, 7.5 / escala, 4.5 / escala));
      el.chorroCafe.setAttribute('d', '');
      el.flujo.setAttribute('d', `M${n(x)} ${n(yInicio)}L${n(x)} ${n(fin)}`);
    } else {
      el.chorroCafe.setAttribute('d', forma(x - separacion, 3.4 / escala, 2.2 / escala) + forma(x + separacion, 3.4 / escala, 2.2 / escala));
      el.chorroLeche.setAttribute('d', '');
      el.flujo.setAttribute('d', `M${n(x - separacion)} ${n(yInicio)}L${n(x - separacion)} ${n(fin)}M${n(x + separacion)} ${n(yInicio)}L${n(x + separacion)} ${n(fin)}`);
    }
    el.impacto.setAttribute('cx', n(x));
    el.impacto.setAttribute('cy', n(fin));
  }

  return {
    markup,
    g,
    escala,
    aEscena,
    // Puntos útiles en coordenadas de la escena: centro del borde y radio exterior.
    borde() {
      const [x, y] = aEscena([cx, yArriba]);
      return { x, y, radio: g.borde * escala, radioY: g.borde * g.s * escala, arriba: y - g.borde * g.s * escala };
    },
    montar(raiz) {
      el = {
        taza: raiz.querySelector('.taza'),
        nivel: raiz.querySelector('.nivel'),
        chorros: raiz.querySelector('.chorros'),
        chorroCafe: raiz.querySelector('.chorro-cafe'),
        chorroLeche: raiz.querySelector('.chorro-leche'),
        flujo: raiz.querySelector('.chorro-flujo'),
        impacto: raiz.querySelector('.chorro-impacto'),
      };
      superficie.montar(raiz);
      ultimo = { transform: '', nivel: -1, modo: '' };
      aplicarNivel();
    },
    fijarNivel(nivel, modo = estado.modo) {
      estado = { nivel: limitar(nivel), modo };
      aplicarNivel();
    },
    // Sorbo: la taza se inclina y se levanta; el líquido se queda horizontal.
    inclinar(giro, alza = 0, giroLiquido = giro) {
      pose = { giro: giroLiquido, alza };
      el.taza.setAttribute('transform', giro || alza ? `translate(0 ${n(-alza)}) rotate(${n(giro)} ${n(cx)} ${n(g.yc(0))})` : '');
      aplicarNivel();
    },
    // config: null o { tipo: 'cafe' | 'leche', desde: [x, y] en la escena, separacion }
    chorro(config) {
      chorroActual = config;
      if (!config) el.chorros.setAttribute('display', 'none');
      else {
        el.chorros.removeAttribute('display');
        dibujarChorro();
      }
    },
    onda: () => superficie.onda(),
  };
}

export { ESCENA };
