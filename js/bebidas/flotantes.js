// Objetos con volumen sobre la bebida (crema batida, malvaviscos, canela, anís, hielos) y dentro de ella (perlas).
// Los flotantes se dibujan en unidades del mundo, relativos al centro de la superficie; el renderizador mueve su grupo.
import { n, paradas, caminoSuave } from '../util/svg.js';
import { crearAzar, suave } from '../util/azar.js';

const PI = Math.PI;

// ---------- Crema batida: un remolino de tres pisos que se hunde y se derrite ----------
function crearCrema(semilla, g, ids, { ancho = 0.66, alto = 0.62, hilo = null, virutas = null, salsa = null, derrite = true } = {}) {
  const azar = crearAzar(semilla);
  const s = g.s;
  const c = g.c;
  const radioLleno = g.rIn(g.def.lleno);
  const R = radioLleno * ancho;
  const H = R * alto;
  const nube = (rx, ry, cy, fase) => {
    const puntos = [];
    for (let i = 0; i < 40; i++) {
      const t = (i / 40) * PI * 2;
      const m = 1 + 0.07 * Math.abs(Math.sin(5 * t + fase));
      puntos.push([rx * m * Math.cos(t), cy + ry * m * Math.sin(t)]);
    }
    return caminoSuave(puntos);
  };
  const pisos = [0, 1, 2].map((k) => {
    const rx = R * (1 - 0.27 * k);
    return { d: nube(rx, rx * s + H * 0.12, -k * H * 0.3 * c, k), rx, cy: -k * H * 0.3 * c };
  });
  const punta = -3 * H * 0.3 * c;
  const remolinos = pisos.map(({ rx, cy }) => `<path d="M${n(-rx * 0.8)} ${n(cy + rx * s * 0.2)}Q0 ${n(cy + rx * s * 1.05)} ${n(rx * 0.85)} ${n(cy + rx * s * 0.1)}" fill="none" stroke="#D9C9B1" stroke-width="1.4" stroke-linecap="round" opacity="0.8"/>`).join('');
  let extra = '';
  if (hilo || salsa) {
    // Hilo en espiral que baja por el remolino, como cuando se sirve desde la boquilla.
    const color = (hilo ?? salsa).color;
    const puntos = [];
    for (let i = 0; i <= 44; i++) {
      const u = i / 44;
      const ang = u * PI * 4.4 + 0.6;
      const radio = R * (0.12 + 0.8 * u);
      const altura = -H * (0.92 - 0.7 * u) * c;
      puntos.push([radio * Math.cos(ang) + azar.entre(-1, 1), altura + radio * s * Math.sin(ang) * 0.85]);
    }
    const d = caminoSuave(puntos, false);
    extra += `<path d="${d}" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" opacity="0.9"/>`;
    extra += `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="0.9" stroke-opacity="0.3" transform="translate(-0.8 -1)"/>`;
  }
  if (virutas) {
    for (let i = 0; i < (virutas.cantidad ?? 14); i++) {
      const x = azar.entre(-R * 0.6, R * 0.6);
      const y = -azar.entre(H * 0.2, H * 0.95) * c + azar.entre(-R * s * 0.3, R * s * 0.3);
      extra += `<rect x="${n(x)}" y="${n(y)}" width="${n(azar.entre(3, 6))}" height="1.8" rx="0.8" fill="${virutas.color}" transform="rotate(${n(azar.entre(-50, 50))} ${n(x)} ${n(y)})"/>`;
    }
  }
  const derretida = [];
  for (let i = 0; i < 36; i++) {
    const t = (i / 36) * PI * 2;
    const m = 1 + 0.16 * Math.sin(3 * t + 1) + 0.08 * Math.sin(7 * t);
    derretida.push([R * 1.1 * m * Math.cos(t), R * 1.1 * m * s * Math.sin(t)]);
  }

  const markup = `
    <g class="crema">
      <path class="crema-charco" d="${caminoSuave(derretida)}" fill="#F3E8D8" opacity="0"/>
      <g class="crema-monte">
        <ellipse cx="0" cy="${n(R * s * 0.25)}" rx="${n(R * 1.02)}" ry="${n(R * s * 0.55)}" fill="#000" opacity="0.18"/>
        ${pisos.map((piso) => `<path d="${piso.d}" fill="url(#${ids.crema})"/>`).join('')}
        <path d="M${n(-R * 0.16)} ${n(punta + R * s * 0.3)}C${n(-R * 0.2)} ${n(punta - H * 0.18)} ${n(R * 0.18)} ${n(punta - H * 0.22)} ${n(R * 0.05)} ${n(punta - H * 0.32)}C${n(R * 0.24)} ${n(punta - H * 0.12)} ${n(R * 0.2)} ${n(punta + R * s * 0.3)} 0 ${n(punta + R * s * 0.35)}Z" fill="url(#${ids.crema})"/>
        ${remolinos}${extra}
      </g>
    </g>`;
  const defs = `<radialGradient id="${ids.crema}" cx="0.6" cy="0.3" r="0.8">${paradas([[0, '#FFFFFF'], [0.5, '#FBF4EA'], [0.85, '#E9DCC8'], [1, '#CDB99E']])}</radialGradient>`;

  let el = {};
  return {
    defs,
    markup,
    montar(raiz) {
      el = { monte: raiz.querySelector('.crema-monte'), charco: raiz.querySelector('.crema-charco') };
    },
    actualizar({ p, modo, nivel, r }) {
      // En vasos cónicos la crema se angosta con el vaso.
      const k = Math.min(1, r / radioLleno);
      if (modo === 'llenando') {
        const aparece = suave(0.92, 0.99, nivel);
        el.monte.setAttribute('transform', `scale(${n(Math.max(0.001, aparece))})`);
        el.monte.setAttribute('opacity', n(aparece));
        el.charco.setAttribute('opacity', 0);
        return;
      }
      if (!derrite) {
        // Crema espesa (frappé): solo se hunde y se achica con el vaso.
        const baja = suave(0, 1, p);
        el.monte.setAttribute('transform', `scale(${n(k * (1 - 0.25 * baja))} ${n(k * (1 - 0.45 * baja))})`);
        el.monte.setAttribute('opacity', n(1 - suave(0.88, 1, p)));
        el.charco.setAttribute('opacity', 0);
        return;
      }
      // Se hunde (más baja), se ensancha y se funde en un charco blanco que luego se mezcla.
      const hunde = suave(0, 0.75, p);
      el.monte.setAttribute('transform', `translate(0 ${n(hunde * H * 0.15)}) scale(${n(k * (1 + 0.32 * hunde))} ${n(k * Math.max(0.05, 1 - 0.85 * hunde))})`);
      el.monte.setAttribute('opacity', n(1 - suave(0.55, 0.85, p)));
      el.charco.setAttribute('opacity', n(0.85 * suave(0.25, 0.6, p) * (1 - suave(0.8, 1, p))));
      el.charco.setAttribute('transform', `scale(${n(k * Math.min(0.85, 0.7 + 0.45 * p))})`);
    },
  };
}

// ---------- Malvaviscos: cilindritos que se encogen, se hunden y quedan como manchas blancas ----------
function crearMalvaviscos(semilla, g, ids, { cantidad = 7, colores = ['#FFFFFF', '#FFE3EA', '#FFFFFF'] } = {}) {
  const azar = crearAzar(semilla);
  const s = g.s;
  const c = g.c;
  const items = Array.from({ length: cantidad }, (_, i) => {
    const ang = (i / cantidad) * PI * 2 + azar.entre(-0.3, 0.3);
    const d = azar.entre(0.12, 0.6);
    return { u: Math.cos(ang) * d, v: Math.sin(ang) * d, color: colores[i % colores.length], tam: azar.entre(12, 16), giro: azar.entre(-14, 14) };
  }).sort((a, b) => a.v - b.v);
  // Cilindros esponjosos: costado redondeado y tapa abombada, un poco ladeados.
  const piezas = items.map((m) => {
    const r = m.tam;
    const h = m.tam * 0.95 * c;
    const domo = r * s * 0.5;
    return `<g class="malvavisco">
      <ellipse class="malva-mancha" rx="${n(r * 1.5)}" ry="${n(r * 1.5 * s)}" fill="#FBF3EA" opacity="0"/>
      <g class="malva-cuerpo"><g transform="rotate(${n(m.giro)})">
        <path d="M${n(-r)} ${n(-h)}C${n(-r * 1.04)} ${n(-h * 0.4)} ${n(-r * 1.02)} 0 ${n(-r * 0.92)} 0A${n(r * 0.92)} ${n(r * s * 0.92)} 0 0 0 ${n(r * 0.92)} 0C${n(r * 1.02)} 0 ${n(r * 1.04)} ${n(-h * 0.4)} ${n(r)} ${n(-h)}Z" fill="url(#${ids.malva})"/>
        <path d="M${n(-r)} ${n(-h)}A${n(r)} ${n(r * s + domo)} 0 0 1 ${n(r)} ${n(-h)}A${n(r)} ${n(r * s)} 0 0 1 ${n(-r)} ${n(-h)}Z" fill="${m.color}"/>
        <ellipse cx="${n(r * 0.2)}" cy="${n(-h - r * s * 0.35)}" rx="${n(r * 0.5)}" ry="${n(r * s * 0.35)}" fill="#FFFFFF" opacity="0.85"/>
        <path d="M${n(-r * 0.7)} ${n(-h * 0.25)}Q0 ${n(r * s * 0.6)} ${n(r * 0.7)} ${n(-h * 0.25)}" fill="none" stroke="#D9C2BC" stroke-width="1" opacity="0.6"/>
      </g></g>
    </g>`;
  });
  const defs = `<linearGradient id="${ids.malva}">${paradas([[0, '#D9CFCB'], [0.45, '#FFFFFF'], [0.8, '#F7EDEA'], [1, '#CDBFBA']])}</linearGradient>`;
  let el = [];
  return {
    defs,
    markup: `<g class="malvaviscos">${piezas.join('')}</g>`,
    montar(raiz) {
      el = [...raiz.querySelectorAll('.malvavisco')].map((grupo) => ({ grupo, cuerpo: grupo.querySelector('.malva-cuerpo'), mancha: grupo.querySelector('.malva-mancha') }));
    },
    actualizar({ p, modo, nivel, r }) {
      el.forEach((pieza, i) => {
        const m = items[i];
        pieza.grupo.setAttribute('transform', `translate(${n(m.u * r)} ${n(m.v * r * g.s)})`);
        if (modo === 'llenando') {
          const cae = suave(0.94 + i * 0.008, 0.99, nivel);
          pieza.cuerpo.setAttribute('transform', `translate(0 ${n(-30 * (1 - cae))})`);
          pieza.cuerpo.setAttribute('opacity', n(cae));
          pieza.mancha.setAttribute('opacity', 0);
          return;
        }
        const encoge = 1 - 0.45 * suave(0.1, 0.85, p);
        const hunde = 9 * suave(0.2, 0.9, p);
        pieza.cuerpo.setAttribute('transform', `translate(0 ${n(hunde)}) scale(${n(encoge)})`);
        pieza.cuerpo.setAttribute('opacity', n(1 - suave(0.78, 0.95, p)));
        pieza.mancha.setAttribute('opacity', n(0.7 * suave(0.55, 0.85, p) * (1 - suave(0.92, 1, p))));
      });
    },
  };
}

// ---------- Rama de canela y anís estrellado (chai) ----------
function crearEspecias(semilla, g, ids) {
  const s = g.s;
  const largo = 92;
  const rama = `<g class="canela" transform="rotate(-24)">
    <rect x="${-largo / 2}" y="-6" width="${largo}" height="12" rx="6" fill="url(#${ids.canela})"/>
    <path d="M${-largo / 2 + 8} -2H${largo / 2 - 8}" stroke="#5A2C14" stroke-width="1" opacity="0.6"/>
    <ellipse cx="${largo / 2 - 1}" cy="0" rx="4" ry="6" fill="#7A4022"/><path d="M${largo / 2 - 2} -3a3 3 0 1 1 0 4" fill="none" stroke="#3E1C0C" stroke-width="1.2"/>
  </g>`;
  let puntas = '';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 360;
    puntas += `<path d="M0 0L-4.5 -3C-3 -11 3 -11 4.5 -3Z" transform="rotate(${a}) scale(1 ${n(0.55 + s * 0.6)})" fill="#6B3720" stroke="#3A1A0C" stroke-width="0.6"/>`;
    puntas += `<ellipse cx="0" cy="-7" rx="1.6" ry="1.1" transform="rotate(${a}) scale(1 ${n(0.55 + s * 0.6)})" fill="#C88A52"/>`;
  }
  const defs = `<linearGradient id="${ids.canela}" x1="0" y1="0" x2="0" y2="1">${paradas([[0, '#B4693A'], [0.45, '#8A4622'], [1, '#4E230F']])}</linearGradient>`;
  let el = {};
  return {
    defs,
    markup: `<g class="especias"><g class="rama">${rama}</g><g class="anis">${puntas}<circle r="2.4" fill="#4A2412"/></g></g>`,
    montar(raiz) {
      el = { rama: raiz.querySelector('.rama'), anis: raiz.querySelector('.anis') };
    },
    actualizar({ r, modo, nivel }) {
      const visible = modo === 'llenando' ? suave(0.95, 0.99, nivel) : 1;
      el.rama.setAttribute('transform', `translate(${n(-0.2 * r)} ${n(-0.12 * r * s)})`);
      el.anis.setAttribute('transform', `translate(${n(0.36 * r)} ${n(0.42 * r * s)}) scale(1.55)`);
      el.rama.setAttribute('opacity', n(visible));
      el.anis.setAttribute('opacity', n(visible));
    },
  };
}

// ---------- Hielos: cubos translúcidos que bajan con el nivel y se encogen ----------
function cubo(tam, giro, s, c) {
  const a = tam / 2;
  const sobresale = tam * 0.42 * c;
  const base = [[-a, -a], [a, -a], [a, a], [-a, a]].map(([x, z]) => {
    const xr = x * Math.cos(giro) - z * Math.sin(giro);
    const zr = x * Math.sin(giro) + z * Math.cos(giro);
    return { x: xr, y: zr * s, z: zr };
  });
  const arriba = base.map((p) => ({ ...p, y: p.y - sobresale }));
  const caras = base.map((p, i) => {
    const q = base[(i + 1) % 4];
    return { profundidad: (p.z + q.z) / 2, d: `M${n(arriba[i].x)} ${n(arriba[i].y)}L${n(arriba[(i + 1) % 4].x)} ${n(arriba[(i + 1) % 4].y)}L${n(q.x)} ${n(q.y)}L${n(p.x)} ${n(p.y)}Z` };
  }).sort((u, v) => u.profundidad - v.profundidad);
  const tapa = arriba.map((p, i) => `${i ? 'L' : 'M'}${n(p.x)} ${n(p.y)}`).join('') + 'Z';
  return `${caras.map((cara, i) => `<path d="${cara.d}" fill="${i < 2 ? '#9FB8D0' : '#C6D9EC'}" fill-opacity="${i < 2 ? 0.28 : 0.42}" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="0.8" stroke-linejoin="round"/>`).join('')}
    <path d="${tapa}" fill="#EEF5FC" fill-opacity="0.62" stroke="#FFFFFF" stroke-opacity="0.75" stroke-width="1" stroke-linejoin="round"/>
    <ellipse cx="${n(-a * 0.2)}" cy="${n(arriba[0].y * 0.5 + arriba[2].y * 0.5 - 1)}" rx="${n(a * 0.45)}" ry="${n(a * 0.18)}" fill="#FFFFFF" opacity="0.55"/>`;
}

function crearHielos(semilla, g, ids, { cantidad = 4, tam = 30 } = {}) {
  const azar = crearAzar(semilla);
  const lugares = [[-0.38, -0.22], [0.34, -0.36], [0.12, 0.3], [-0.2, 0.42], [0.45, 0.2]].slice(0, cantidad);
  const items = lugares.map(([u, v]) => ({ u, v, tam: tam * azar.entre(0.85, 1.1), giro: azar.entre(0, PI / 2) })).sort((a, b) => a.v - b.v);
  // Cubos sumergidos: se ven a través del vaso, justo bajo la superficie.
  const hundidos = [[-0.35, 0.5, 22], [0.3, 0.45, 38], [-0.02, 0.6, 58]].map(([u, v, hondo]) => ({ u, v, hondo, tam: tam * azar.entre(0.8, 1), giro: azar.entre(-0.4, 0.4) }));
  const sumergido = (h) => {
    const a = h.tam / 2;
    return `<g class="hielo-hundido"><rect x="${n(-a)}" y="${n(-a * 0.82)}" width="${n(h.tam)}" height="${n(h.tam * 0.82)}" rx="${n(a * 0.25)}" transform="rotate(${n(h.giro * 40)})" fill="#E9D7C2" fill-opacity="0.22" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="1"/></g>`;
  };
  let el = [];
  let hundidosEl = [];
  return {
    defs: '',
    markup: `<g class="hielos">${items.map((h) => `<g class="hielo">${cubo(h.tam, h.giro, g.s, g.c)}</g>`).join('')}</g>`,
    dentro: `<g class="hielos-dentro">${hundidos.map(sumergido).join('')}</g>`,
    montar(raiz) {
      el = [...raiz.querySelectorAll('.hielo')];
      hundidosEl = [...raiz.querySelectorAll('.hielo-hundido')];
    },
    actualizar({ p, r, modo, nivel }) {
      const derrite = modo === 'vaciando' ? 1 - 0.42 * suave(0, 1, p) : 1;
      el.forEach((grupo, i) => {
        const h = items[i];
        grupo.setAttribute('transform', `translate(${n(h.u * r * 0.95)} ${n(h.v * r * g.s * 0.95)}) scale(${n(derrite)})`);
      });
      const hSuperficie = g.alturaNivel(nivel);
      hundidosEl.forEach((grupo, i) => {
        const h = hundidos[i];
        const altura = Math.max(g.def.piso + 10, hSuperficie - h.hondo);
        const visible = hSuperficie - g.def.piso > h.hondo * 0.6;
        grupo.setAttribute('transform', `translate(${n(g.cx + h.u * r)} ${n(g.yc(altura) + h.v * r * g.s)}) scale(${n(derrite)})`);
        grupo.setAttribute('visibility', visible ? 'visible' : 'hidden');
      });
    },
  };
}

// ---------- Perlas de tapioca: un montón en el fondo; al final quedan 2 o 3 ----------
function crearPerlas(semilla, g, ids, { cantidad = 34, radio = 7.5 } = {}) {
  const azar = crearAzar(semilla);
  const { def } = g;
  const perlas = [];
  let capa = 0;
  while (perlas.length < cantidad) {
    const h = def.piso + radio + capa * radio * 1.5;
    const enCapa = Math.max(3, Math.round(9 - capa * 1.5));
    for (let i = 0; i < enCapa && perlas.length < cantidad; i++) {
      const ang = azar.entre(0, PI * 2);
      const d = Math.sqrt(azar.siguiente()) * (g.rIn(h) - radio * 1.2);
      perlas.push({ x: g.cx + Math.cos(ang) * d, y: g.yc(h) + Math.sin(ang) * d * g.s, z: Math.sin(ang) * d, capa });
    }
    capa += 1;
  }
  // Las de abajo y al frente se dibujan al final; las de arriba son las primeras en irse.
  const orden = perlas.map((p, i) => ({ ...p, i })).sort((a, b) => a.capa - b.capa || a.z - b.z);
  const salida = [...orden].sort((a, b) => b.capa - a.capa || a.z - b.z);
  const defs = `<radialGradient id="${ids.perla}" cx="0.35" cy="0.32" r="0.75">${paradas([[0, '#7A4E36'], [0.35, '#3A2116'], [1, '#120905']])}</radialGradient>`;
  const markup = orden
    .map((p) => `<g class="perla" data-i="${p.i}"><circle cx="${n(p.x)}" cy="${n(p.y)}" r="${n(radio)}" fill="url(#${ids.perla})"/><circle cx="${n(p.x - radio * 0.35)}" cy="${n(p.y - radio * 0.38)}" r="${n(radio * 0.28)}" fill="#FFFFFF" opacity="0.55"/></g>`)
    .join('');
  let el = new Map();
  return {
    defs,
    dentro: `<g class="perlas">${markup}</g>`,
    markup: '',
    montar(raiz) {
      el = new Map([...raiz.querySelectorAll('.perla')].map((nodo) => [Number(nodo.dataset.i), nodo]));
    },
    actualizar({ nivel, modo }) {
      const quedan = modo === 'llenando' ? cantidad : Math.max(3, Math.round(3 + (cantidad - 3) * nivel));
      salida.forEach((p, k) => el.get(p.i)?.setAttribute('visibility', k >= cantidad - quedan ? 'visible' : 'hidden'));
    },
  };
}

const TIPOS = { crema: crearCrema, malvaviscos: crearMalvaviscos, especias: crearEspecias, hielos: crearHielos, perlas: crearPerlas };

export function crearFlotantes(bebida, g, ids, { semilla = 5 } = {}) {
  const lista = (bebida.flotantes || []).map((f, i) => TIPOS[f.tipo](semilla + i * 13, g, ids, f));
  return {
    defs: lista.map((f) => f.defs ?? '').join(''),
    markup: lista.map((f) => f.markup ?? '').join(''),
    dentro: lista.map((f) => f.dentro ?? '').join(''),
    montar(raiz) {
      lista.forEach((f) => f.montar(raiz));
    },
    actualizar(estado) {
      lista.forEach((f) => f.actualizar(estado));
    },
  };
}
