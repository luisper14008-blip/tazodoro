// Marcas que deja la bebida en la pared interior. Se dibujan debajo de la superficie:
// mientras están sumergidas el líquido las tapa y aparecen solas a medida que el nivel baja.
import { n, caminoSuave, paradas } from '../util/svg.js';
import { crearAzar, crearRuido } from '../util/azar.js';

const PI = Math.PI;

// Banda sobre la pared del fondo entre dos alturas que varían con el ángulo.
function banda(g, desde, hasta, alto, bajo, pasos = 40) {
  const arriba = [];
  const abajo = [];
  for (let i = 0; i <= pasos; i++) {
    const u = i / pasos;
    const theta = desde + (hasta - desde) * u;
    arriba.push(g.pared(theta, alto(u)));
    abajo.unshift(g.pared(theta, bajo(u)));
  }
  return caminoSuave([...arriba, ...abajo]);
}

function linea(g, desde, hasta, altura, pasos = 40) {
  const puntos = [];
  for (let i = 0; i <= pasos; i++) {
    const u = i / pasos;
    puntos.push(g.pared(desde + (hasta - desde) * u, altura(u)));
  }
  return caminoSuave(puntos, false);
}

export function crearRestos(bebida, g, ids, semilla = 31) {
  const tipos = new Set(bebida.vaciado?.restos || []);
  const azar = crearAzar(semilla);
  const ruido = crearRuido(semilla + 5, 4);
  const { def } = g;
  const colores = { espuma: '#EAD7BC', marca: '#8A5A35', polvo: '#4E2C19', gota: '#6B4124', ...(bebida.vaciado?.coloresRestos || {}) };
  let markup = '';

  // Tinte suave en la pared que estuvo mojada: deja ver hasta dónde llegaba la taza.
  const tope = def.lleno - 1.5;
  const arco = [];
  for (let i = 0; i <= 40; i++) arco.push(g.pared(PI + (PI * i) / 40, tope));
  const [xd, yd] = arco[arco.length - 1];
  const [xi] = arco[0];
  const fondo = g.yc(def.piso) + 200;
  const defs = `<linearGradient id="${ids.tinte}" x1="0" y1="0" x2="0" y2="1">${paradas([[0, colores.marca, 0.07], [1, colores.marca, 0.26]])}</linearGradient>`;
  markup += `<path d="${caminoSuave(arco, false)}L${n(xd)} ${n(fondo)}L${n(xi)} ${n(fondo)}Z" fill="url(#${ids.tinte})"/>`;

  if (tipos.has('espuma-pegada')) {
    // Encajes: líneas de espuma que quedan con cada sorbo.
    const encajes = 6;
    for (let k = 0; k < encajes; k++) {
      const h = def.piso + 12 + ((def.lleno - def.piso - 22) * (k + azar.entre(0.1, 0.9))) / encajes;
      const inicio = PI + azar.entre(0.08, 1.1);
      const fin = Math.min(2 * PI - 0.08, inicio + azar.entre(0.9, 2.1));
      const grosor = azar.entre(1, 2.4);
      const semillaLinea = azar.entre(0, 10);
      markup += `<path d="${banda(g, inicio, fin, (u) => h + grosor * (0.6 + 0.5 * ruido(u * 0.7, semillaLinea)), (u) => h - grosor * (0.4 + 0.4 * ruido(u * 0.7 + 0.3, semillaLinea + 2)), 30)}" fill="${colores.espuma}" opacity="${n(azar.entre(0.45, 0.72))}"/>`;
    }
    // Parches de espuma pegados a la pared.
    for (let k = 0; k < 8; k++) {
      const tc = PI + azar.entre(0.3, PI - 0.3);
      const hc = azar.entre(def.piso + 10, def.lleno - 7);
      const dt = azar.entre(0.07, 0.2);
      const dh = azar.entre(1.8, 5);
      const fase = azar.entre(0, 9);
      const puntos = [];
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * PI * 2;
        const deform = 1 + 0.32 * ruido(i / 18, fase);
        puntos.push(g.pared(tc + dt * Math.cos(a) * deform, hc + dh * Math.sin(a) * deform));
      }
      markup += `<path d="${caminoSuave(puntos)}" fill="${colores.espuma}" opacity="${n(azar.entre(0.5, 0.85))}"/>`;
    }
  }

  if (tipos.has('anillo')) {
    // Banda de espuma arriba y una línea de café justo debajo: la marca del primer sorbo.
    markup += `<path d="${banda(g, PI + 0.03, 2 * PI - 0.03, (u) => tope + 2.6 + 1.1 * ruido(u, 1), (u) => tope - 2.2 + 1.2 * ruido(u, 4), 56)}" fill="${colores.espuma}" opacity="0.85"/>`;
    markup += `<path d="${linea(g, PI + 0.05, 2 * PI - 0.05, (u) => tope - 2.2 + 1.2 * ruido(u, 4), 56)}" fill="none" stroke="${colores.marca}" stroke-opacity="0.55" stroke-width="1.3"/>`;
  }

  if (tipos.has('cacao')) {
    for (let k = 0; k < 46; k++) {
      const [x, y] = g.pared(PI + azar.entre(0.1, PI - 0.1), tope + azar.entre(-5, 2.5));
      markup += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(azar.entre(0.45, 1.05))}" fill="${colores.polvo}" opacity="${n(azar.entre(0.3, 0.65))}"/>`;
    }
  }

  if (tipos.has('gotas')) {
    // Gotas cerca del fondo, con un hilo que baja.
    for (let k = 0; k < 6; k++) {
      const theta = PI + azar.entre(0.45, PI - 0.45);
      const h = def.piso + azar.entre(3, 17);
      const [x, y] = g.pared(theta, h);
      const [, yArriba] = g.pared(theta, h + azar.entre(4, 11));
      const rx = azar.entre(1, 1.8);
      markup += `<path d="M${n(x)} ${n(yArriba)}L${n(x)} ${n(y)}" stroke="${colores.gota}" stroke-opacity="0.28" stroke-width="${n(rx * 0.7)}" stroke-linecap="round"/>`;
      markup += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rx)}" ry="${n(rx * 1.45)}" fill="${colores.gota}" opacity="0.7"/>`;
      markup += `<circle cx="${n(x - rx * 0.35)}" cy="${n(y - rx * 0.5)}" r="${n(rx * 0.35)}" fill="#FFF4E4" opacity="0.65"/>`;
    }
  }

  return { defs, markup };
}
