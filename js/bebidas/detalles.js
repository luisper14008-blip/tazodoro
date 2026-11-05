// Superficie de la bebida en coordenadas unitarias: un disco de radio 1 con el frente hacia abajo.
// El renderizador la ubica con un solo transform; aquí solo cambia lo que evoluciona con el progreso.
//
// bebida.superficie: { colores, fina, crema, textura, arte, toppings, capa, brillo, reflejo, colorArte }
//   colores / fina / crema: 5 tonos del centro al borde (llena, casi acabada y al servir la crema).
//   capa: en vasos, nombre de la capa que lleva este aspecto (si arriba queda otra, se ve lisa con su color).
import { n, paradas } from '../util/svg.js';
import { suave } from '../util/azar.js';
import { mezclarColor } from '../util/color.js';
import { textura } from './texturas.js';
import { ARTES, TOPPINGS } from './artes.js';

const OFFSETS = [0, 0.48, 0.74, 0.9, 1];

// Tonos de una capa lisa vista desde arriba: más clara al centro, más oscura en el borde.
function tonosLisos(color) {
  return [mezclarColor(color, '#FFFFFF', 0.14), mezclarColor(color, '#FFFFFF', 0.05), color, mezclarColor(color, '#000000', 0.18), mezclarColor(color, '#000000', 0.38)];
}

export function crearSuperficie(bebida, ids, { semilla = 11, movimiento = true } = {}) {
  const sup = bebida.superficie;
  const arte = sup.arte ? ARTES[sup.arte](semilla, sup) : null;
  const toppings = (sup.toppings || []).map((tp, i) => TOPPINGS[tp.tipo](semilla + 20 + i, tp));
  const hastaCrema = bebida.servido?.find((paso) => paso.superficie === 'crema')?.hasta ?? 0;
  const brillo = sup.brillo ?? 1;
  const reflejo = sup.reflejo ?? 0;

  const onda = movimiento
    ? '<animateTransform attributeName="transform" type="translate" values="0 0;-0.05 0.025;0.02 -0.01;0 0" dur="7s" repeatCount="indefinite"/>'
    : '';
  const titila = movimiento ? '<animate attributeName="opacity" values="0.75;1;0.8;0.75" dur="4.6s" repeatCount="indefinite"/>' : '';

  const defs = `
    <radialGradient id="${ids.base}" cx="0.46" cy="0.42" r="0.62">${paradas(sup.colores.map((c, i) => [OFFSETS[i], c]))}</radialGradient>
    <pattern id="${ids.textura}" patternUnits="userSpaceOnUse" width="0.6" height="0.6" x="-0.3" y="-0.3">
      <image class="sup-textura-img" href="${textura(sup.textura || 'microespuma')}" width="0.6" height="0.6" preserveAspectRatio="none"/>
    </pattern>
    <radialGradient id="${ids.brilloSup}">${paradas([[0, '#FFFFFF', 0.5 * brillo], [0.55, '#FFF6E6', 0.16 * brillo], [1, '#FFF6E6', 0]])}</radialGradient>
    <radialGradient id="${ids.flor}">${paradas([[0, '#FFFBF4', 0.95], [0.7, '#FAF0E2', 0.8], [1, '#F2E2CC', 0]])}</radialGradient>
    <clipPath id="${ids.disco}"><circle r="1"/></clipPath>`;

  // Reflejo de la ventana: cuatro paneles de luz fría sobre el líquido brillante.
  const ventana = reflejo > 0
    ? `<g class="sup-ventana" transform="translate(-0.4 -0.38) rotate(-8)" fill="#C9DAF5" opacity="${n(0.12 * reflejo)}">
        <rect x="-0.21" y="-0.15" width="0.2" height="0.13" rx="0.05"/><rect x="0.01" y="-0.15" width="0.2" height="0.13" rx="0.05"/>
        <rect x="-0.21" y="0.01" width="0.2" height="0.13" rx="0.05"/><rect x="0.01" y="0.01" width="0.2" height="0.13" rx="0.05"/>
      </g>`
    : '';

  const markup = `
    <g clip-path="url(#${ids.disco})">
      <circle r="1" fill="url(#${ids.base})" class="sup-base"/>
      <circle r="1" fill="url(#${ids.textura})" class="sup-textura" opacity="0.55"/>
      <circle class="sup-flor" r="0.2" cx="0.08" cy="0.04" fill="url(#${ids.flor})" opacity="0"/>
      <g class="sup-detalle">
        ${arte ? arte.markup : ''}
        ${toppings.map((tp) => tp.markup).join('')}
      </g>
      ${ventana}
      <g class="sup-brillo">${onda}<ellipse cx="0.36" cy="-0.5" rx="0.36" ry="0.17" transform="rotate(-16 0.36 -0.5)" fill="url(#${ids.brilloSup})">${titila}</ellipse></g>
      <circle r="0.955" fill="none" stroke="#4A2C18" stroke-opacity="0.2" stroke-width="3" vector-effect="non-scaling-stroke"/>
      <circle r="0.992" fill="none" stroke="#FFF2DF" stroke-opacity="0.65" stroke-width="1.3" vector-effect="non-scaling-stroke"/>
      <g class="sup-ondas" fill="none" stroke="#FFF6EA" stroke-width="1.4" vector-effect="non-scaling-stroke">
        ${[0, 1].map(() => '<circle r="0.15" opacity="0"><animate attributeName="r" from="0.12" to="0.95" dur="1.5s" begin="indefinite" fill="freeze"/><animate attributeName="opacity" values="0;0.5;0" dur="1.5s" begin="indefinite" fill="freeze"/></circle>').join('')}
      </g>
    </g>`;

  let el = {};
  let texturaActual = sup.textura || 'microespuma';

  function ponerTextura(tipo, opacidad) {
    if (tipo && tipo !== texturaActual) {
      el.imagen.setAttribute('href', textura(tipo));
      texturaActual = tipo;
    }
    el.textura.setAttribute('opacity', n(tipo ? opacidad : 0));
  }

  return {
    defs,
    markup,
    montar(raiz) {
      el = {
        paradas: [...raiz.querySelectorAll(`#${ids.base} stop`)],
        textura: raiz.querySelector('.sup-textura'),
        imagen: raiz.querySelector('.sup-textura-img'),
        flor: raiz.querySelector('.sup-flor'),
        detalle: raiz.querySelector('.sup-detalle'),
        ondas: [...raiz.querySelectorAll('.sup-ondas circle')],
      };
      arte?.montar(raiz);
      toppings.forEach((tp) => tp.montar(raiz));
    },
    // estado: { nivel, modo: 'vaciando' | 'llenando', capa (en vasos: la de arriba), p (cuánto se bebió del detalle) }
    actualizar({ nivel, modo, capa, p = 1 - nivel }) {
      let colores;
      // En vasos, si arriba quedó otra capa, la superficie es lisa con su color.
      if (sup.capa && capa && capa.nombre !== sup.capa) {
        colores = tonosLisos(capa.color);
        ponerTextura(capa.textura, 0.3);
        el.detalle.setAttribute('display', 'none');
        el.flor.setAttribute('opacity', 0);
      } else if (modo === 'vaciando') {
        const fino = Math.pow(suave(0.12, 1, p), 1.1);
        colores = sup.colores.map((c, i) => mezclarColor(c, (sup.fina ?? sup.colores)[i], fino));
        ponerTextura(sup.textura, (sup.opacidadTextura ?? 0.55) * (1 - 0.55 * suave(0.3, 1, p)));
        el.detalle.removeAttribute('display');
        arte?.actualizar({ p });
        toppings.forEach((tp) => tp.actualizar({ p }));
        el.flor.setAttribute('opacity', 0);
      } else {
        const leche = hastaCrema ? suave(hastaCrema, hastaCrema + 0.16, nivel) : 1;
        colores = sup.colores.map((c, i) => mezclarColor(sup.crema?.[i] ?? c, c, leche));
        const tipo = hastaCrema && leche < 0.5 ? 'crema' : sup.textura;
        ponerTextura(tipo, tipo === 'crema' ? 0.75 : (sup.opacidadTextura ?? 0.55) * 0.9);
        const flor = hastaCrema ? suave(hastaCrema, hastaCrema + 0.05, nivel) * (1 - suave(0.86, 0.95, nivel)) : 0;
        el.flor.setAttribute('opacity', n(0.92 * flor));
        el.flor.setAttribute('r', n(0.12 + 0.5 * suave(hastaCrema, 0.86, nivel)));
        el.detalle.removeAttribute('display');
        arte?.actualizar({ p: 0, escala: suave(0.85, 0.97, nivel) });
        toppings.forEach((tp) => tp.actualizar({ p: 0, visible: suave(0.975, 0.995, nivel) }));
      }
      el.paradas.forEach((parada, i) => parada.setAttribute('stop-color', colores[i]));
    },
    onda() {
      el.ondas.forEach((circulo, i) => {
        setTimeout(() => circulo.querySelectorAll('animate').forEach((a) => a.beginElement?.()), i * 260);
      });
    },
  };
}
