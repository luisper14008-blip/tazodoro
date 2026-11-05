// Renderizador común: arma el SVG de una bebida a partir de sus datos del catálogo.
// Las tazas y mugs de cerámica se arman en opaco.js; los vasos de vidrio o plástico, en vidrio.js.
// Aquí vive lo que se mueve: el nivel, el sorbo y el chorro.
import { n, nuevoId } from '../util/svg.js';
import { limitar } from '../util/azar.js';
import { ESCENA, RECIPIENTES, geometria, validarVisibilidad } from './recipientes.js';
import { LUZ, defsComunes, marcadoSombra, marcadoPlato, marcadoCuchara, defsChorros, formaChorro } from './partes.js';
import { crearSuperficie } from './detalles.js';
import { crearFlotantes } from './flotantes.js';
import { crearRestos, crearRestosVidrio } from './restos.js';
import { armarOpaco } from './opaco.js';
import { armarVidrio } from './vidrio.js';
import { capasVisibles } from './capas.js';
import { crearCarita } from './carita.js';

export { LUZ, ESCENA };

const NOMBRES_IDS = ['sombraMesa', 'contacto', 'platoLado', 'platoCara', 'platoHondo', 'metal', 'cuerpo', 'oclusion', 'brillo',
  'brilloSup', 'asa', 'interior', 'abertura', 'labio', 'base', 'textura', 'flor', 'disco', 'tinte', 'chorro', 'sobreBorde', 'sobreBordeIn',
  'capa', 'cavidad', 'sobreFrente', 'bajoFrente', 'pajitaArriba', 'pajitaAbajo', 'pajita', 'crema', 'malva', 'canela', 'perla'];

export function crearBebida(bebida, { escala: escalaPedida = 1, movimiento = true, semilla = 11, carita: conCarita = false } = {}) {
  const def = RECIPIENTES[bebida.recipiente.forma];
  if (!def) throw new Error(`Recipiente desconocido: ${bebida.recipiente.forma}`);
  const escala = escalaPedida * (def.escalaBase ?? 1);
  if (!validarVisibilidad(def)) console.warn(`El recipiente ${bebida.recipiente.forma} esconde el fondo: sube el ángulo.`);

  const g = geometria(def);
  const ids = Object.fromEntries(NOMBRES_IDS.map((nombre) => [nombre, nuevoId(nombre)]));
  const vidrio = def.material !== 'ceramica';
  const superficie = crearSuperficie(bebida, ids, { semilla, movimiento });
  const flotantes = crearFlotantes(bebida, g, ids, { semilla: semilla + 3 });
  const restos = vidrio ? crearRestosVidrio(bebida, g, semilla + 7) : crearRestos(bebida, g, ids, semilla + 7);
  const armar = vidrio ? armarVidrio : armarOpaco;
  const cuerpo = armar(bebida, g, ids, { superficie, flotantes, restos, movimiento });
  // La carita (tema kawaii) va dentro del grupo de la taza para inclinarse con los sorbos.
  const carita = conCarita ? crearCarita(g) : null;
  if (carita) cuerpo.markup = cuerpo.markup.replace(/<\/g>\s*$/, `${carita.markup}</g>`);
  const coloresChorro = [...new Set((bebida.servido || []).map((paso) => paso.color).filter(Boolean))];
  const { cx, mesa } = g;

  const markup = `
    <defs>${defsComunes(ids, bebida.recipiente.color)}${cuerpo.defs}${superficie.defs}${restos.defs}${flotantes.defs}${defsChorros(ids, coloresChorro)}</defs>
    <g class="bebida" transform="translate(${cx} ${mesa}) scale(${n(escala)}) translate(${-cx} ${-mesa})">
      ${marcadoSombra(g, def.plato ? def.plato.radio : g.borde * 1.05, ids)}
      ${def.plato ? marcadoPlato(g, def.plato, ids) : ''}
      ${cuerpo.markup}
      ${def.plato && def.cuchara ? marcadoCuchara(g, def.plato, ids) : ''}
    </g>`;

  let el = {};
  let estado = { nivel: 1, modo: 'vaciando' };
  let pose = { giro: 0 };
  let ultimo = { transform: '', nivel: -1, modo: '' };
  let chorroActual = null;

  const aLocal = ([x, y]) => [cx + (x - cx) / escala, mesa + (y - mesa) / escala];
  const aEscena = ([x, y]) => [cx + (x - cx) * escala, mesa + (y - mesa) * escala];

  function superficieEn(nivel) {
    const h = g.alturaNivel(limitar(nivel));
    return { h, y: g.yc(h), r: Math.max(0.1, g.rIn(h) - (vidrio ? 0.2 : 0.6)) };
  }

  // Cuánto se bebió del detalle de la superficie (arte, toppings, flotantes).
  function progresoDetalle() {
    const capaArte = bebida.superficie?.capa;
    const modoVaciado = bebida.vaciado?.modo ?? 'desde-arriba';
    if (!vidrio || !capaArte || modoVaciado !== 'desde-arriba') return 1 - estado.nivel;
    const capas = bebida.capas || [];
    const i = capas.findIndex((capa) => capa.nombre === capaArte);
    const desde = i > 0 ? capas[i - 1].hasta : 0;
    const hasta = capas[i]?.hasta ?? 1;
    return limitar((hasta - estado.nivel) / Math.max(0.01, hasta - desde));
  }

  function aplicarNivel() {
    const { h, y, r } = superficieEn(estado.nivel);
    const giroSuperficie = vidrio ? 0 : -pose.giro;
    const transform = `translate(${n(cx)} ${n(y)}) rotate(${n(giroSuperficie)}) scale(${n(r)} ${n(r * g.s)})`;
    const modoCapas = estado.modo === 'llenando' ? 'desde-arriba' : bebida.vaciado?.modo ?? 'desde-arriba';
    const movido = transform !== ultimo.transform;
    if (movido) {
      el.nivel.setAttribute('transform', transform);
      el.flotantes?.setAttribute('transform', `translate(${n(cx)} ${n(y)}) rotate(${n(-pose.giro)})`);
      if (vidrio) el.liquido?.setAttribute('transform', pose.giro ? `rotate(${n(-pose.giro)} ${n(cx)} ${n(y)})` : '');
      ultimo.transform = transform;
    }
    const visibles = vidrio || bebida.capas ? capasVisibles(bebida.capas, estado.nivel, modoCapas) : [];
    if (vidrio && movido) cuerpo.actualizar({ visibles, h, r, nivel: estado.nivel, modo: estado.modo });
    if (Math.abs(estado.nivel - ultimo.nivel) > 0.004 || estado.modo !== ultimo.modo) {
      const p = progresoDetalle();
      superficie.actualizar({ nivel: estado.nivel, modo: estado.modo, capa: vidrio ? visibles.at(-1)?.capa : undefined, p });
      flotantes.actualizar({ nivel: estado.nivel, modo: estado.modo, p, r: g.rIn(h) });
      carita?.actualizar(estado);
      if (vidrio && !movido) cuerpo.actualizar({ visibles, h, r, nivel: estado.nivel, modo: estado.modo });
      ultimo.nivel = estado.nivel;
      ultimo.modo = estado.modo;
    }
    if (chorroActual) dibujarChorro();
  }

  function dibujarChorro() {
    const { y: ySuperficie } = superficieEn(estado.nivel);
    const [x, yInicio] = aLocal(chorroActual.desde);
    const fin = ySuperficie + 1;
    const ancho = (chorroActual.ancho ?? 3.4) / escala;
    const angosto = ancho * 0.64;
    const color = Math.max(0, coloresChorro.indexOf(chorroActual.color));
    const separacion = chorroActual.tipo === 'doble' ? (chorroActual.separacion ?? 5.75) / escala : 0;
    const xs = separacion ? [x - separacion, x + separacion] : [x];
    el.chorroForma.setAttribute('d', xs.map((xi) => formaChorro(xi, yInicio, fin, ancho, angosto)).join(''));
    el.chorroForma.setAttribute('fill', `url(#${ids.chorro}-${color})`);
    el.flujo.setAttribute('d', xs.map((xi) => `M${n(xi)} ${n(yInicio)}L${n(xi)} ${n(fin)}`).join(''));
    el.impacto.setAttribute('cx', n(x));
    el.impacto.setAttribute('cy', n(fin));
    el.impacto.setAttribute('ry', n(7 * g.s));
  }

  return {
    markup,
    g,
    escala,
    aEscena,
    // Puntos útiles en coordenadas de la escena: centro del borde, radio y punto más alto del recipiente.
    borde() {
      const yBorde = g.yc(def.alto);
      const [x, y] = aEscena([cx, yBorde]);
      return { x, y, radio: g.borde * escala, radioY: g.borde * g.s * escala, arriba: y - g.borde * g.s * escala };
    },
    // Recorte para mostrar la bebida sola (miniaturas de la carta).
    encuadre(margen = 10) {
      const ancho = Math.max(def.plato?.radio ?? 0, g.borde + (def.asa ? def.asa.sale + def.asa.grosor : 0)) + margen;
      const extra = Math.max(def.pajita ? def.pajita.sobresale * g.c + 10 : 0, def.tapa?.alto ? def.tapa.alto * g.c * 1.1 : 0, bebida.flotantes?.some((f) => f.tipo === 'crema') ? 40 : 0);
      const arriba = g.yc(def.alto) - g.borde * g.s - extra - margen;
      const abajo = mesa + (def.plato ? def.plato.radio * g.s : g.borde * g.s) + margen;
      return `${n(cx - ancho)} ${n(arriba)} ${n(ancho * 2)} ${n(abajo - arriba)}`;
    },
    montar(raiz) {
      el = {
        taza: raiz.querySelector('.taza'),
        nivel: raiz.querySelector('.nivel'),
        flotantes: raiz.querySelector('.flotantes'),
        liquido: raiz.querySelector('.liquido'),
        chorros: raiz.querySelector('.chorros'),
        chorroForma: raiz.querySelector('.chorro-forma'),
        flujo: raiz.querySelector('.chorro-flujo'),
        impacto: raiz.querySelector('.chorro-impacto'),
      };
      superficie.montar(raiz);
      flotantes.montar(raiz);
      cuerpo.montar?.(raiz);
      carita?.montar(raiz);
      ultimo = { transform: '', nivel: -1, modo: '' };
      aplicarNivel();
    },
    fijarNivel(nivel, modo = estado.modo) {
      estado = { nivel: limitar(nivel), modo };
      aplicarNivel();
    },
    // Sorbo: el recipiente se inclina y se levanta; el líquido se queda horizontal.
    inclinar(giro, alza = 0, giroLiquido = giro) {
      pose = { giro: giroLiquido };
      el.taza.setAttribute('transform', giro || alza ? `translate(0 ${n(-alza)}) rotate(${n(giro)} ${n(cx)} ${n(g.yc(0))})` : '');
      ultimo.transform = '';
      aplicarNivel();
    },
    // config: null o { tipo: 'doble' | 'simple', desde: [x, y] en la escena, color, ancho, separacion }
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
