// Arte latte y toppings planos sobre la superficie, en coordenadas unitarias (disco de radio 1, frente hacia abajo).
// Cada pieza devuelve { markup, montar(raiz), actualizar({ p, escala, visible }) }; p es cuánto se ha bebido (0 → 1).
import { n, caminoSuave } from '../util/svg.js';
import { crearAzar, crearRuido, suave } from '../util/azar.js';

// Deforma un contorno con ruido: se estira, gira y se ondula al bajar.
function deformar(puntos, p, ruidoA, ruidoB, rumbo, cerrado = true) {
  const a = suave(0.05, 0.85, p);
  const amplitud = 0.006 + 0.15 * Math.pow(a, 1.3);
  const cos = Math.cos(rumbo.giro * a);
  const sin = Math.sin(rumbo.giro * a);
  const total = puntos.length;
  return puntos.map(([x, y], i) => {
    const anterior = puntos[cerrado ? (i - 1 + total) % total : Math.max(0, i - 1)];
    const siguiente = puntos[cerrado ? (i + 1) % total : Math.min(total - 1, i + 1)];
    let nx = siguiente[1] - anterior[1];
    let ny = anterior[0] - siguiente[0];
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

function puntosCorazon(escala = 0.035, dy = -0.09, pasos = 96) {
  const puntos = [];
  for (let i = 0; i < pasos; i++) {
    const t = (i / pasos) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    y -= 2.6 * (Math.exp(-((t / 0.55) ** 2)) + Math.exp(-(((t - Math.PI * 2) / 0.55) ** 2)));
    puntos.push([x * escala, y * escala + dy]);
  }
  return puntos;
}

function caminoCola(punta, p, ruido, ancho = 0.017) {
  const [px, py] = punta;
  const lado = [];
  const otro = [];
  for (let i = 0; i <= 10; i++) {
    const u = i / 10;
    const x = px + (0.02 - px) * u + 0.05 * ruido(u * 0.5, p * 2) * suave(0.1, 0.8, p);
    const y = py + (0.8 - py) * u;
    const a = ancho * (1 - u) + 0.004;
    lado.push([x - a, y]);
    otro.unshift([x + a, y]);
  }
  return caminoSuave([...lado, ...otro]);
}

function rumboAlAzar(azar) {
  return { giro: azar.entre(0.18, 0.34) * azar.signo(), deriva: [azar.entre(-0.08, 0.08), azar.entre(0.04, 0.1)] };
}

function escalar(grupo, escala, centro = [0.08, 0.04]) {
  const [x, y] = centro;
  grupo.setAttribute('transform', escala < 1 ? `translate(${x} ${y}) scale(${n(Math.max(0.001, escala))}) translate(${-x} ${-y})` : '');
  // 'inherit' y no 'visible': así el grupo padre puede ocultar el arte cuando arriba queda otra capa.
  grupo.setAttribute('visibility', escala <= 0.01 ? 'hidden' : 'inherit');
}

// ---------- Corazón (cappuccino) ----------
export function crearCorazon(semilla, { colorArte = '#FFFAF2', colorHalo = '#F6E7D2' } = {}) {
  const base = puntosCorazon();
  const azar = crearAzar(semilla);
  const ruidoA = crearRuido(semilla + 1, 5);
  const ruidoB = crearRuido(semilla + 2, 3);
  const ruidoIsla = crearRuido(semilla + 3, 3);
  const rumbo = rumboAlAzar(azar);
  const islas = [[-0.24, -0.16, 0.17], [0.24, -0.15, 0.15], [0.02, 0.22, 0.12], [-0.05, -0.02, 0.09]]
    .map(([x, y, r]) => ({ x, y, r, dx: azar.entre(-0.18, 0.18), dy: azar.entre(-0.06, 0.16), fase: azar.entre(0, 6) }));

  const markup = `
    <g class="arte">
      <path class="arte-halo" fill="${colorHalo}" opacity="0.6"/>
      <path class="arte-nucleo" fill="${colorArte}" stroke="#C8976A" stroke-opacity="0.35" stroke-width="1" vector-effect="non-scaling-stroke"/>
      <path class="arte-cola" fill="${colorArte}"/>
      <g class="arte-islas" fill="${colorArte}" opacity="0.9">${islas.map(() => '<path/>').join('')}</g>
    </g>`;

  let el = {};
  return {
    markup,
    montar(raiz) {
      el = {
        grupo: raiz.querySelector('.arte'),
        halo: raiz.querySelector('.arte-halo'),
        nucleo: raiz.querySelector('.arte-nucleo'),
        cola: raiz.querySelector('.arte-cola'),
        islas: [...raiz.querySelectorAll('.arte-islas path')],
      };
    },
    actualizar({ p, escala = 1 }) {
      const puntos = deformar(base, p, ruidoA, ruidoB, rumbo);
      el.nucleo.setAttribute('d', caminoSuave(puntos));
      el.halo.setAttribute('d', caminoSuave(puntos.map(([x, y]) => [x * (1.12 + 0.3 * p), y * (1.12 + 0.3 * p) + 0.01])));
      el.nucleo.setAttribute('opacity', n(1 - suave(0.5, 0.9, p)));
      el.halo.setAttribute('opacity', n(0.6 * (1 - suave(0.62, 1, p))));
      el.cola.setAttribute('d', caminoCola(puntos[Math.floor(puntos.length / 2)], p, ruidoB));
      el.cola.setAttribute('opacity', n(0.95 * (1 - suave(0.35, 0.75, p))));
      const opacidad = suave(0.48, 0.7, p) * (1 - suave(0.88, 1, p));
      el.islas.forEach((camino, i) => {
        if (opacidad > 0.001) {
          const isla = islas[i];
          const r = isla.r * (1 - 0.55 * suave(0.72, 1, p));
          const puntosIsla = Array.from({ length: 28 }, (_, k) => {
            const s = k / 28;
            const rr = r * (1 + 0.28 * ruidoIsla(s, p * 4 + isla.fase));
            return [isla.x + isla.dx * p + rr * Math.cos(s * Math.PI * 2), isla.y + isla.dy * p + rr * Math.sin(s * Math.PI * 2)];
          });
          camino.setAttribute('d', caminoSuave(puntosIsla));
        }
        camino.setAttribute('opacity', n(opacidad));
      });
      escalar(el.grupo, escala);
    },
  };
}

// ---------- Roseta u hoja (latte, matcha) ----------
export function crearRoseta(semilla, { colorArte = '#FFFAF2', colorHalo = '#F6E7D2', hojas = 7 } = {}) {
  const azar = crearAzar(semilla);
  const ruidoA = crearRuido(semilla + 1, 5);
  const ruidoB = crearRuido(semilla + 2, 3);
  const rumbo = rumboAlAzar(azar);
  // Cada hoja es una franja curva (∩); la de atrás remata en un corazoncito.
  const formas = [];
  for (let k = 0; k < hojas; k++) {
    const t = k / (hojas - 1);
    const y = 0.5 - t * 0.9;
    const ancho = 0.6 * (1 - t * 0.55) * (0.94 + 0.12 * azar.siguiente());
    const curva = 0.15 + 0.07 * t;
    const grosor = 0.075 * (1 - t * 0.35);
    const exterior = [];
    const interior = [];
    for (let i = 0; i <= 14; i++) {
      const u = -1 + (2 * i) / 14;
      exterior.push([u * ancho, y - curva * (1 - u * u)]);
      interior.unshift([u * ancho * 0.9, y - curva * (1 - u * u) + grosor * (1 - 0.6 * u * u)]);
    }
    formas.push([...exterior, ...interior]);
  }
  formas.push(puntosCorazon(0.012, -0.5, 48));
  const tallo = Array.from({ length: 12 }, (_, i) => [0, 0.66 - (i / 11) * 1.18]);

  const markup = `
    <g class="arte">
      <g class="arte-halo" fill="${colorHalo}" opacity="0.5">${formas.map(() => '<path/>').join('')}</g>
      <g class="arte-hojas" fill="${colorArte}">${formas.map(() => '<path/>').join('')}</g>
      <path class="arte-tallo" fill="none" stroke="${colorArte}" stroke-width="1.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    </g>`;

  let el = {};
  return {
    markup,
    montar(raiz) {
      el = {
        grupo: raiz.querySelector('.arte'),
        halos: [...raiz.querySelectorAll('.arte-halo path')],
        hojas: [...raiz.querySelectorAll('.arte-hojas path')],
        tallo: raiz.querySelector('.arte-tallo'),
      };
    },
    actualizar({ p, escala = 1 }) {
      formas.forEach((forma, i) => {
        const puntos = deformar(forma, p, ruidoA, ruidoB, rumbo);
        el.hojas[i].setAttribute('d', caminoSuave(puntos));
        el.halos[i].setAttribute('d', caminoSuave(puntos.map(([x, y]) => [x * (1.06 + 0.25 * p), y * (1.06 + 0.25 * p)])));
        // Las hojas de atrás se desdibujan primero.
        const desde = 0.35 + 0.45 * (1 - i / formas.length);
        el.hojas[i].setAttribute('opacity', n(1 - suave(desde - 0.3, desde + 0.15, p)));
      });
      el.tallo.setAttribute('d', caminoSuave(deformar(tallo, p, ruidoA, ruidoB, rumbo, false), false));
      el.tallo.setAttribute('opacity', n(0.9 * (1 - suave(0.3, 0.7, p))));
      el.grupo.querySelector('.arte-halo').setAttribute('opacity', n(0.5 * (1 - suave(0.6, 1, p))));
      escalar(el.grupo, escala, [0, 0.05]);
    },
  };
}

// ---------- Polvo (cacao, canela) ----------
export function crearPolvo(semilla, { color = '#5C3520', cantidad = 120 } = {}) {
  const azar = crearAzar(semilla);
  let puntos = '';
  for (let i = 0; i < cantidad; i++) {
    const ang = azar.entre(0, Math.PI * 2);
    const radio = Math.sqrt(azar.entre(0.05, 0.86));
    puntos += `<circle cx="${n(Math.cos(ang) * radio)}" cy="${n(Math.sin(ang) * radio)}" r="${n(azar.entre(0.004, 0.012))}" opacity="${n(azar.entre(0.18, 0.5))}"/>`;
  }
  let grupo;
  return {
    markup: `<g class="topping-polvo" fill="${color}">${puntos}</g>`,
    montar(raiz) {
      grupo = raiz.querySelector('.topping-polvo');
    },
    actualizar({ p, visible = 1 }) {
      grupo.setAttribute('transform', `scale(${n(1 + 0.28 * suave(0, 1, p))})`);
      grupo.setAttribute('opacity', n(visible * (1 - 0.8 * suave(0.05, 0.95, p))));
    },
  };
}

// ---------- Rejilla de caramelo (caramel macchiato) ----------
export function crearRejilla(semilla, { color = '#C5782A', lineas = 7 } = {}) {
  const ruido = crearRuido(semilla, 3);
  const caminos = [];
  for (const angulo of [0.62, -0.62]) {
    const cos = Math.cos(angulo);
    const sin = Math.sin(angulo);
    for (let k = 0; k < lineas; k++) {
      const desplazo = -0.72 + (1.44 * k) / (lineas - 1);
      const puntos = [];
      for (let i = 0; i <= 10; i++) {
        const t = -0.95 + (1.9 * i) / 10;
        const onda = 0.018 * ruido(i / 10, k + angulo * 3);
        const x = t * cos - (desplazo + onda) * sin;
        const y = t * sin + (desplazo + onda) * cos;
        if (x * x + y * y < 0.86) puntos.push([x, y]);
      }
      if (puntos.length > 2) caminos.push(caminoSuave(puntos, false));
    }
  }
  const trazos = caminos.map((d) => `<path d="${d}"/>`).join('');
  let grupo;
  return {
    markup: `<g class="topping-rejilla" fill="none" stroke-linecap="round">
      <g stroke="${color}" stroke-width="2.3" vector-effect="non-scaling-stroke">${trazos.replaceAll('<path ', '<path vector-effect="non-scaling-stroke" ')}</g>
      <g stroke="#F4C27A" stroke-width="0.8" stroke-opacity="0.7" transform="translate(-0.006 -0.01)">${trazos.replaceAll('<path ', '<path vector-effect="non-scaling-stroke" ')}</g>
    </g>`,
    montar(raiz) {
      grupo = raiz.querySelector('.topping-rejilla');
    },
    actualizar({ p, visible = 1 }) {
      grupo.setAttribute('opacity', n(visible * (1 - suave(0.15, 0.85, p))));
      grupo.setAttribute('transform', `scale(${n(1 + 0.12 * p)})`);
    },
  };
}

export const ARTES = { corazon: crearCorazon, roseta: crearRoseta };
export const TOPPINGS = { polvo: crearPolvo, rejilla: crearRejilla };
