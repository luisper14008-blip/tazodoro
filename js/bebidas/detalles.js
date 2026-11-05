// Superficie de la bebida en coordenadas unitarias: un disco de radio 1 con el frente hacia abajo.
// El renderizador lo ubica con un solo transform; aquí solo cambia lo que evoluciona con el progreso.
import { n, caminoSuave, paradas } from '../util/svg.js';
import { crearAzar, crearRuido, suave } from '../util/azar.js';
import { mezclarColor } from '../util/color.js';
import { textura } from './texturas.js';

const OFFSETS = [0, 0.48, 0.74, 0.9, 1];

// ---------- Corazón de latte art ----------
function puntosCorazon(pasos = 96) {
  const puntos = [];
  for (let i = 0; i < pasos; i++) {
    const t = (i / pasos) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    // Hendidura más suave, como la de un corazón servido con jarra.
    y -= 2.6 * (Math.exp(-((t / 0.55) ** 2)) + Math.exp(-(((t - Math.PI * 2) / 0.55) ** 2)));
    puntos.push([x * 0.035, y * 0.035 - 0.09]);
  }
  return puntos;
}

// Deforma un contorno cerrado con ruido: el corazón se estira, gira y se ondula al bajar.
function deformar(puntos, p, ruidoA, ruidoB, rumbo) {
  const a = suave(0.05, 0.85, p);
  const amplitud = 0.006 + 0.15 * Math.pow(a, 1.3);
  const giro = rumbo.giro * a;
  const cos = Math.cos(giro);
  const sin = Math.sin(giro);
  const total = puntos.length;
  return puntos.map(([x, y], i) => {
    const [xa, ya] = puntos[(i - 1 + total) % total];
    const [xb, yb] = puntos[(i + 1) % total];
    let nx = yb - ya;
    let ny = xa - xb;
    const largo = Math.hypot(nx, ny) || 1;
    nx /= largo;
    ny /= largo;
    const s = i / total;
    const d = amplitud * ruidoA(s, p * 3.2);
    const t = amplitud * 0.4 * ruidoB(s, p * 2.1);
    const px = (x + nx * d - ny * t) * (1 + 0.32 * a);
    const py = (y + ny * d + nx * t) * (1 + 0.1 * a);
    return [px * cos - py * sin + rumbo.deriva[0] * a, px * sin + py * cos + rumbo.deriva[1] * a];
  });
}

// Isla de espuma: círculo ondulado que se encoge al final.
function caminoIsla(isla, p, ruido) {
  const puntos = [];
  const r = isla.r * (1 - 0.55 * suave(0.72, 1, p));
  for (let i = 0; i < 28; i++) {
    const s = i / 28;
    const ang = s * Math.PI * 2;
    const rr = r * (1 + 0.28 * ruido(s, p * 4 + isla.fase));
    puntos.push([isla.x + isla.dx * p + rr * Math.cos(ang), isla.y + isla.dy * p + rr * Math.sin(ang)]);
  }
  return caminoSuave(puntos);
}

function crearCorazon(semilla) {
  const base = puntosCorazon();
  const azar = crearAzar(semilla);
  const ruidoA = crearRuido(semilla + 1, 5);
  const ruidoB = crearRuido(semilla + 2, 3);
  const ruidoIsla = crearRuido(semilla + 3, 3);
  const rumbo = { giro: azar.entre(0.18, 0.34) * azar.signo(), deriva: [azar.entre(-0.08, 0.08), azar.entre(0.04, 0.1)] };
  const islas = [
    { x: -0.24, y: -0.16, r: 0.17 },
    { x: 0.24, y: -0.15, r: 0.15 },
    { x: 0.02, y: 0.22, r: 0.12 },
    { x: -0.05, y: -0.02, r: 0.09 },
  ].map((isla) => ({ ...isla, dx: azar.entre(-0.18, 0.18), dy: azar.entre(-0.06, 0.16), fase: azar.entre(0, 6) }));

  const markup = `
    <g class="arte-corazon">
      <path class="arte-halo" fill="#F6E7D2" opacity="0.6"/>
      <path class="arte-nucleo" fill="#FFFAF2" stroke="#C8976A" stroke-opacity="0.35" stroke-width="1" vector-effect="non-scaling-stroke"/>
      <path class="arte-cola" fill="#FFFAF2"/>
      <g class="arte-islas" fill="#FBF1E3">${islas.map(() => '<path/>').join('')}</g>
    </g>`;

  let el = {};
  return {
    markup,
    montar(raiz) {
      el = {
        grupo: raiz.querySelector('.arte-corazon'),
        halo: raiz.querySelector('.arte-halo'),
        nucleo: raiz.querySelector('.arte-nucleo'),
        cola: raiz.querySelector('.arte-cola'),
        islas: [...raiz.querySelectorAll('.arte-islas path')],
      };
    },
    // p: cuánto se ha bebido (0 → 1). escala: el corazón formándose al servir.
    actualizar({ p, escala = 1 }) {
      const puntos = deformar(base, p, ruidoA, ruidoB, rumbo);
      const halo = puntos.map(([x, y]) => [x * (1.12 + 0.3 * p), y * (1.12 + 0.3 * p) + 0.01]);
      el.nucleo.setAttribute('d', caminoSuave(puntos));
      el.halo.setAttribute('d', caminoSuave(halo));
      el.nucleo.setAttribute('opacity', n(1 - suave(0.5, 0.9, p)));
      el.halo.setAttribute('opacity', n(0.6 * (1 - suave(0.62, 1, p))));

      // Cola del corte: de la punta del corazón hacia el borde.
      const [px, py] = puntos[Math.floor(puntos.length / 2)];
      const lado = [];
      const otro = [];
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        const x = px + (0.02 - px) * u + 0.05 * ruidoB(u * 0.5, p * 2) * suave(0.1, 0.8, p);
        const y = py + (0.8 - py) * u;
        const ancho = 0.017 * (1 - u) + 0.004;
        lado.push([x - ancho, y]);
        otro.unshift([x + ancho, y]);
      }
      el.cola.setAttribute('d', caminoSuave([...lado, ...otro]));
      el.cola.setAttribute('opacity', n(0.95 * (1 - suave(0.35, 0.75, p))));

      const opacidadIslas = suave(0.48, 0.7, p) * (1 - suave(0.88, 1, p));
      el.islas.forEach((camino, i) => {
        if (opacidadIslas > 0.001) camino.setAttribute('d', caminoIsla(islas[i], p, ruidoIsla));
        camino.setAttribute('opacity', n(opacidadIslas));
      });
      el.grupo.setAttribute('transform', escala < 1 ? `translate(0.08 0.04) scale(${n(Math.max(0.001, escala))}) translate(-0.08 -0.04)` : '');
      el.grupo.setAttribute('visibility', escala <= 0.01 ? 'hidden' : 'visible');
    },
  };
}

// ---------- Cacao en polvo ----------
function crearPolvo(semilla, { color = '#4E2C19', cantidad = 80 } = {}) {
  const azar = crearAzar(semilla);
  let puntos = '';
  for (let i = 0; i < cantidad; i++) {
    const ang = azar.entre(0, Math.PI * 2);
    const radio = Math.sqrt(azar.entre(0.05, 0.86));
    puntos += `<circle cx="${n(Math.cos(ang) * radio)}" cy="${n(Math.sin(ang) * radio)}" r="${n(azar.entre(0.004, 0.012))}" opacity="${n(azar.entre(0.18, 0.5))}"/>`;
  }
  const markup = `<g class="topping-polvo" fill="${color}">${puntos}</g>`;
  let grupo;
  return {
    markup,
    montar(raiz) {
      grupo = raiz.querySelector('.topping-polvo');
    },
    actualizar({ p, visible = 1 }) {
      const abre = 1 + 0.28 * suave(0, 1, p);
      grupo.setAttribute('transform', `scale(${n(abre)})`);
      grupo.setAttribute('opacity', n(visible * (1 - 0.8 * suave(0.05, 0.95, p))));
    },
  };
}

const ARTES = { corazon: crearCorazon };
const TOPPINGS = { polvo: crearPolvo };

// ---------- Superficie completa ----------
// bebida.superficie: { colores, fina, crema, textura, arte, toppings }
export function crearSuperficie(bebida, ids, { semilla = 11, movimiento = true } = {}) {
  const sup = bebida.superficie;
  const arte = sup.arte ? ARTES[sup.arte](semilla) : null;
  const toppings = (sup.toppings || []).map((tp, i) => TOPPINGS[tp.tipo](semilla + 20 + i, tp));
  const hastaCrema = bebida.servido?.find((paso) => paso.superficie === 'crema')?.hasta ?? 0;

  const onda = movimiento
    ? `<animateTransform attributeName="transform" type="translate" values="0 0;-0.05 0.025;0.02 -0.01;0 0" dur="7s" repeatCount="indefinite"/>`
    : '';
  const titila = movimiento ? `<animate attributeName="opacity" values="0.75;1;0.8;0.75" dur="4.6s" repeatCount="indefinite"/>` : '';

  const defs = `
    <radialGradient id="${ids.base}" cx="0.46" cy="0.42" r="0.62">${paradas(sup.colores.map((c, i) => [OFFSETS[i], c]))}</radialGradient>
    <pattern id="${ids.textura}" patternUnits="userSpaceOnUse" width="0.6" height="0.6" x="-0.3" y="-0.3">
      <image class="sup-textura-img" href="${textura(sup.textura)}" width="0.6" height="0.6" preserveAspectRatio="none"/>
    </pattern>
    <radialGradient id="${ids.brillo}">${paradas([[0, '#FFFFFF', 0.5], [0.55, '#FFF6E6', 0.16], [1, '#FFF6E6', 0]])}</radialGradient>
    <radialGradient id="${ids.flor}">${paradas([[0, '#FFFBF4', 0.95], [0.7, '#FAF0E2', 0.8], [1, '#F2E2CC', 0]])}</radialGradient>
    <clipPath id="${ids.disco}"><circle r="1"/></clipPath>`;

  const markup = `
    <g clip-path="url(#${ids.disco})">
      <circle r="1" fill="url(#${ids.base})" class="sup-base"/>
      <circle r="1" fill="url(#${ids.textura})" class="sup-textura" opacity="0.55"/>
      <circle class="sup-flor" r="0.2" cx="0.08" cy="0.04" fill="url(#${ids.flor})" opacity="0"/>
      ${arte ? arte.markup : ''}
      ${toppings.map((tp) => tp.markup).join('')}
      <g class="sup-brillo">${onda}<ellipse cx="0.36" cy="-0.5" rx="0.36" ry="0.17" transform="rotate(-16 0.36 -0.5)" fill="url(#${ids.brillo})">${titila}</ellipse></g>
      <circle r="0.955" fill="none" stroke="#4A2C18" stroke-opacity="0.2" stroke-width="3" vector-effect="non-scaling-stroke"/>
      <circle r="0.992" fill="none" stroke="#FFF2DF" stroke-opacity="0.65" stroke-width="1.3" vector-effect="non-scaling-stroke"/>
      <g class="sup-ondas" fill="none" stroke="#FFF6EA" stroke-width="1.4" vector-effect="non-scaling-stroke">
        ${[0, 1].map((i) => `<circle r="0.15" opacity="0"><animate attributeName="r" from="0.12" to="0.95" dur="1.5s" begin="indefinite" fill="freeze"/><animate attributeName="opacity" values="0;0.5;0" dur="1.5s" begin="indefinite" fill="freeze"/></circle>`).join('')}
      </g>
    </g>`;

  let el = {};
  let texturaActual = sup.textura;

  return {
    defs,
    markup,
    montar(raiz) {
      el = {
        paradas: [...raiz.querySelectorAll(`#${ids.base} stop`)],
        textura: raiz.querySelector('.sup-textura'),
        imagen: raiz.querySelector('.sup-textura-img'),
        flor: raiz.querySelector('.sup-flor'),
        ondas: [...raiz.querySelectorAll('.sup-ondas circle')],
      };
      arte?.montar(raiz);
      toppings.forEach((tp) => tp.montar(raiz));
    },
    // estado: { nivel, modo: 'vaciando' | 'llenando' }
    actualizar({ nivel, modo }) {
      let colores;
      let tex = sup.textura;
      let opacidadTextura;
      if (modo === 'vaciando') {
        const p = 1 - nivel;
        const fino = Math.pow(suave(0.12, 1, p), 1.1);
        colores = sup.colores.map((c, i) => mezclarColor(c, sup.fina[i], fino));
        opacidadTextura = 0.55 * (1 - 0.55 * suave(0.3, 1, p));
        arte?.actualizar({ p });
        toppings.forEach((tp) => tp.actualizar({ p }));
        el.flor.setAttribute('opacity', 0);
      } else {
        const leche = suave(hastaCrema, hastaCrema + 0.16, nivel);
        colores = sup.colores.map((c, i) => mezclarColor(sup.crema?.[i] ?? c, c, hastaCrema ? leche : 1));
        if (hastaCrema && leche < 0.5) tex = 'crema';
        opacidadTextura = tex === 'crema' ? 0.75 : 0.5;
        const flor = hastaCrema ? suave(hastaCrema, hastaCrema + 0.05, nivel) * (1 - suave(0.86, 0.95, nivel)) : 0;
        el.flor.setAttribute('opacity', n(0.92 * flor));
        el.flor.setAttribute('r', n(0.12 + 0.5 * suave(hastaCrema, 0.86, nivel)));
        arte?.actualizar({ p: 0, escala: suave(0.85, 0.97, nivel) });
        toppings.forEach((tp) => tp.actualizar({ p: 0, visible: suave(0.975, 0.995, nivel) }));
      }
      el.paradas.forEach((parada, i) => parada.setAttribute('stop-color', colores[i]));
      el.textura.setAttribute('opacity', n(opacidadTextura));
      if (tex !== texturaActual) {
        el.imagen.setAttribute('href', textura(tex));
        texturaActual = tex;
      }
    },
    onda() {
      el.ondas.forEach((circulo, i) => {
        setTimeout(() => circulo.querySelectorAll('animate').forEach((a) => a.beginElement?.()), i * 260);
      });
    },
  };
}
