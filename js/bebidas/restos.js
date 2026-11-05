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

  if (tipos.has('chorreado')) {
    // Chocolate espeso que bajó por la pared desde el anillo.
    for (let k = 0; k < 5; k++) {
      const theta = PI + azar.entre(0.4, PI - 0.4);
      markup += goteo(g, theta, tope + 1, tope - azar.entre(12, 36), azar.entre(4, 7), colores.marca, 0.42);
    }
  }

  if (tipos.has('rastros')) {
    // Manchas oscuras de café y vetas de crema cerca del fondo.
    for (let k = 0; k < 5; k++) {
      const tc = PI + azar.entre(0.4, PI - 0.4);
      const hc = def.piso + azar.entre(2, 13);
      const dt = azar.entre(0.1, 0.26);
      const dh = azar.entre(1.6, 3.6);
      const fase = azar.entre(0, 9);
      const puntos = [];
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * PI * 2;
        const deform = 1 + 0.35 * ruido(i / 16, fase);
        puntos.push(g.pared(tc + dt * Math.cos(a) * deform, hc + dh * Math.sin(a) * deform));
      }
      markup += `<path d="${caminoSuave(puntos)}" fill="${k % 2 ? colores.espuma : colores.marca}" opacity="${n(k % 2 ? 0.55 : 0.4)}"/>`;
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

// Hilo que baja por la pared (caramelo, salsa, chocolate) con una gota al final.
function goteo(g, theta, hDesde, hHasta, ancho, color, opacidad) {
  const izquierda = [];
  const derecha = [];
  const pasos = 10;
  const fase = theta * 7.3;
  const vaiven = (u) => 1.3 * Math.sin(u * Math.PI * 2.2 + fase) * u;
  for (let i = 0; i <= pasos; i++) {
    const u = i / pasos;
    const h = hDesde + (hHasta - hDesde) * u;
    const [x, y] = g.pared(theta, h);
    const a = (ancho / 2) * (1 - 0.45 * u);
    izquierda.push([x - a + vaiven(u), y]);
    derecha.unshift([x + a + vaiven(u), y]);
  }
  const [xBase, yf] = g.pared(theta, hHasta);
  const xf = xBase + vaiven(1);
  return `<path d="${caminoSuave([...izquierda, ...derecha])}" fill="${color}" opacity="${n(opacidad)}"/>` +
    `<ellipse cx="${n(xf)}" cy="${n(yf + 0.8)}" rx="${n(ancho * 0.48)}" ry="${n(ancho * 0.62)}" fill="${color}" opacity="${n(opacidad)}"/>`;
}

// Restos en vasos: lo de la pared del fondo se dibuja antes del líquido (queda tapado mientras está sumergido)
// y lo de la pared del frente después, recortado por encima de la superficie.
export function crearRestosVidrio(bebida, g, semilla = 41) {
  const tipos = new Set(bebida.vaciado?.restos || []);
  const azar = crearAzar(semilla);
  const ruido = crearRuido(semilla + 3, 4);
  const { def } = g;
  const colores = { espuma: '#FFFFFF', marca: '#C5782A', ...(bebida.vaciado?.coloresRestos || {}) };
  let atras = '';
  let frente = '';

  if (tipos.has('anillos-espuma')) {
    // Encaje de espuma: un anillo por cada sorbo, irregular y con huecos.
    const anillos = 6;
    for (let k = 0; k < anillos; k++) {
      const h = def.piso + 18 + ((def.lleno - def.piso - 26) * (k + azar.entre(0.2, 0.8))) / anillos;
      const grosor = azar.entre(1.2, 2.6);
      const fase = azar.entre(0, 9);
      const tramos = [[PI + 0.05, 2 * PI - 0.05, 'atras'], [0.05, PI - 0.05, 'frente']];
      for (const [desde, hasta, lado] of tramos) {
        const d = banda(g, desde, hasta, (u) => h + grosor * (0.5 + 0.6 * ruido(u, fase)), (u) => h - grosor * (0.3 + 0.5 * ruido(u + 0.4, fase + 1)), 40);
        const trazo = `<path d="${d}" fill="${colores.espuma}" opacity="${n(lado === 'atras' ? azar.entre(0.3, 0.45) : azar.entre(0.45, 0.7))}"/>`;
        if (lado === 'atras') atras += trazo;
        else frente += trazo;
      }
    }
  }

  if (tipos.has('escurrido')) {
    // Hilos de caramelo o salsa que bajan desde el borde.
    for (let k = 0; k < 9; k++) {
      const atrasLado = k % 2 === 0;
      const theta = atrasLado ? PI + azar.entre(0.3, PI - 0.3) : azar.entre(0.35, PI - 0.35);
      const trazo = goteo(g, theta, def.lleno + 2, def.lleno - azar.entre(20, 75), azar.entre(1.8, 3.2), colores.marca, atrasLado ? 0.4 : azar.entre(0.55, 0.75));
      if (atrasLado) atras += trazo;
      else frente += trazo;
    }
  }

  return { defs: '', atras, markup: frente };
}
