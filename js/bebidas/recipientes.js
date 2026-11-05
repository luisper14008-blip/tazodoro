// Recipientes como perfiles de revolución vistos en tres cuartos.
// Cada recipiente se describe con su radio exterior a cada altura (perfil) y la cámara lo proyecta:
// un círculo horizontal a la altura h se ve como una elipse de radios (r, r·sen(ángulo)).
// Unidades del mundo: en tamaño mediano, el radio del borde ronda 100.
import { n, caminoPoligono } from '../util/svg.js';
import { suave } from '../util/azar.js';

export const ESCENA = { ancho: 400, alto: 460, cx: 200, mesa: 345 };
const RAD = Math.PI / 180;

export const RECIPIENTES = {
  // Taza ancha de cappuccino: cuenco redondo sobre un pie corto, con plato.
  'taza-ancha': {
    material: 'ceramica',
    angulo: 36,
    alto: 118,
    grosor: 7,
    piso: 22,
    lleno: 109,
    perfil(h) {
      if (h <= 6) return 45 + h * 0.2;
      const t = Math.min(1, (h - 6) / 112);
      return 47 + 53 * Math.pow(Math.sin((t * Math.PI) / 2), 0.68) + 1.4 * suave(0.86, 1, t);
    },
    plato: { radio: 148, alto: 8, hondo: 3, pozo: 56 },
    asa: { arriba: 97, abajo: 47, sale: 38, grosor: 12, giro: 0.26 },
  },

  // Taza clásica de americano, de paredes casi rectas.
  taza: {
    material: 'ceramica',
    angulo: 36,
    alto: 112,
    grosor: 7,
    piso: 20,
    lleno: 102,
    perfil(h) {
      if (h <= 5) return 44 + h * 0.4;
      const t = Math.min(1, (h - 5) / 107);
      return 52 + 34 * Math.pow(t, 0.6) + 2 * suave(0.9, 1, t);
    },
    plato: { radio: 138, alto: 8, hondo: 3, pozo: 52 },
    asa: { arriba: 92, abajo: 40, sale: 36, grosor: 11, giro: 0.26 },
  },

  // Tacita de espresso, gruesa, con plato chico y cucharita. Se dibuja un poco más grande para que luzca.
  tacita: {
    material: 'ceramica',
    escalaBase: 1.2,
    angulo: 38,
    alto: 84,
    grosor: 8,
    piso: 22,
    lleno: 72,
    perfil(h) {
      if (h <= 5) return 34 + h * 0.5;
      const t = Math.min(1, (h - 5) / 79);
      return 38 + 30 * Math.pow(Math.sin((t * Math.PI) / 2), 0.8) + 1.5 * suave(0.9, 1, t);
    },
    plato: { radio: 112, alto: 7, hondo: 2.5, pozo: 40 },
    cuchara: true,
    asa: { arriba: 66, abajo: 34, sale: 26, grosor: 9, giro: 0.3 },
  },

  // Mug de paredes rectas, con fondo redondeado. Cámara más alta para ver el fondo.
  mug: {
    material: 'ceramica',
    angulo: 44,
    alto: 150,
    grosor: 8,
    piso: 16,
    lleno: 138,
    perfil(h) {
      if (h < 12) return 66 + 12 * Math.sqrt(h / 12);
      return 78 + 4 * ((h - 12) / 138);
    },
    asa: { arriba: 126, abajo: 40, sale: 44, grosor: 15, giro: 0.22 },
  },

  // Mug grande y panzón para el chocolate.
  'mug-grande': {
    material: 'ceramica',
    angulo: 38,
    alto: 138,
    grosor: 9,
    piso: 18,
    lleno: 126,
    perfil(h) {
      if (h < 14) return 74 + 20 * Math.sqrt(h / 14);
      const t = (h - 14) / 124;
      return 94 + 8 * Math.sin(t * Math.PI * 0.8);
    },
    asa: { arriba: 116, abajo: 46, sale: 42, grosor: 15, giro: 0.24 },
  },

  // Vaso alto de latte, sobre un platito.
  'vaso-alto': {
    material: 'vidrio',
    angulo: 18,
    alto: 176,
    grosor: 3.2,
    piso: 16,
    lleno: 164,
    perfil: (h) => 50 + 8 * (h / 176) + 3 * suave(0.85, 1, h / 176),
    plato: { radio: 98, alto: 7, hondo: 2.5, pozo: 56 },
    cuchara: true,
  },

  // Vaso más bajo y ancho (caramel macchiato).
  vaso: {
    material: 'vidrio',
    angulo: 22,
    alto: 150,
    grosor: 3.2,
    piso: 14,
    lleno: 136,
    perfil: (h) => 54 + 10 * (h / 150),
    plato: { radio: 104, alto: 7, hondo: 2.5, pozo: 58 },
  },

  // Vaso de cold brew con pajita y gotas de condensación.
  'vaso-hielo': {
    material: 'vidrio',
    angulo: 20,
    alto: 178,
    grosor: 3.4,
    piso: 18,
    lleno: 152,
    perfil: (h) => 54 + 6 * (h / 178),
    pajita: { grosor: 7, color: '#1E1E22', angulo: 9, x: 0.34, z: -0.3, sobresale: 46 },
    condensacion: { cantidad: 26 },
  },

  // Vaso redondeado para el matcha latte.
  'vaso-matcha': {
    material: 'vidrio',
    angulo: 24,
    alto: 128,
    grosor: 3.4,
    piso: 14,
    lleno: 116,
    perfil(h) {
      const t = Math.min(1, h / 128);
      return 50 + 16 * Math.pow(Math.sin((t * Math.PI) / 2), 0.6);
    },
    plato: { radio: 108, alto: 7, hondo: 2.5, pozo: 54 },
  },

  // Vaso de plástico con domo y pajita gruesa (frappé).
  'vaso-domo': {
    material: 'plastico',
    angulo: 20,
    alto: 176,
    grosor: 2,
    piso: 6,
    lleno: 164,
    perfil: (h) => 46 + 22 * (h / 176),
    tapa: { tipo: 'domo', alto: 56 },
    pajita: { grosor: 11, color: '#2F7D6D', angulo: 8, x: 0.12, z: -0.1, sobresale: 96 },
    condensacion: { cantidad: 22 },
  },

  // Vaso alto sellado de bubble tea, con pajita ancha.
  'vaso-sellado': {
    material: 'plastico',
    angulo: 20,
    alto: 196,
    grosor: 2,
    piso: 6,
    lleno: 182,
    perfil: (h) => 46 + 18 * (h / 196),
    tapa: { tipo: 'sello', color: '#FBF1E6', puntos: '#F29BB0' },
    pajita: { grosor: 13, color: '#E9A3B5', angulo: 10, x: 0.18, z: -0.15, sobresale: 70 },
    condensacion: { cantidad: 18 },
  },
};

// En recipientes opacos la superficie debe verse hasta el fondo:
// profundidad ≤ (radio arriba + radio a esa altura) · tan(ángulo).
export function validarVisibilidad(def) {
  if (def.material !== 'ceramica') return true;
  const tan = Math.tan(def.angulo * RAD);
  const arriba = def.perfil(def.alto) - def.grosor;
  for (let h = def.piso; h <= def.lleno; h += 1) {
    if (def.alto - h > (arriba + def.perfil(h) - def.grosor) * tan) return false;
  }
  return true;
}

// Medidas proyectadas de un recipiente apoyado en la mesa (o en su plato).
export function geometria(def, { cx = ESCENA.cx, mesa = ESCENA.mesa } = {}) {
  const s = Math.sin(def.angulo * RAD);
  const c = Math.cos(def.angulo * RAD);
  const apoyo = def.plato ? def.plato.alto - def.plato.hondo : 0;
  const base = mesa - apoyo * c;
  const yc = (h) => base - h * c;
  const borde = def.perfil(def.alto);
  const rIn = (h) => def.perfil(Math.max(h, def.piso)) - def.grosor;
  return {
    def,
    s,
    c,
    cx,
    mesa,
    base,
    yc,
    rIn,
    borde,
    bordeIn: borde - def.grosor,
    alturaNivel: (nivel) => def.piso + (def.lleno - def.piso) * nivel,
    // Punto de la pared interior a la altura h, en el ángulo theta (π..2π es la pared del fondo).
    pared: (theta, h) => {
      const r = rIn(h);
      return [cx + r * Math.cos(theta), yc(h) + r * s * Math.sin(theta)];
    },
  };
}

// Silueta de un sólido de revolución: unión de las elipses de todas sus alturas.
export function contorno(perfil, desde, hasta, { cx, s, yc }, pasosX = 84, pasosH = 72) {
  const alturas = Array.from({ length: pasosH + 1 }, (_, i) => desde + ((hasta - desde) * i) / pasosH);
  const radios = alturas.map(perfil);
  const rMax = Math.max(...radios);
  const arriba = [];
  const abajo = [];
  for (let i = 0; i <= pasosX; i++) {
    const x = -rMax * Math.cos((Math.PI * i) / pasosX);
    let yMin = Infinity;
    let yMax = -Infinity;
    for (let k = 0; k < alturas.length; k++) {
      const r = radios[k];
      if (Math.abs(x) > r) continue;
      const dy = r * s * Math.sqrt(Math.max(0, 1 - (x / r) ** 2));
      const y = yc(alturas[k]);
      if (y - dy < yMin) yMin = y - dy;
      if (y + dy > yMax) yMax = y + dy;
    }
    if (yMin === Infinity) continue;
    arriba.push([cx + x, yMin]);
    abajo.push([cx + x, yMax]);
  }
  return caminoPoligono([...arriba, ...abajo.reverse()]);
}

// Asa de oreja pegada al lado derecho, girada un poco hacia quien mira.
// Devuelve el contorno y la línea de brillo de su lomo.
export function caminoAsa(g) {
  const a = g.def.asa;
  if (!a) return { contorno: '', brillo: '' };
  const punto = (h) => {
    const r = g.def.perfil(h) - 2;
    return [g.cx + r * Math.cos(a.giro), g.yc(h) + r * g.s * Math.sin(a.giro)];
  };
  const [ax, ay] = punto(a.arriba);
  const [bx, by] = punto(a.abajo);
  const w = a.sale;
  const k = a.grosor;
  const h = by - ay;
  const brillo = `M${n(ax + 2)} ${n(ay - k * 0.38)}C${n(ax + w * 0.5)} ${n(ay - k * 1.02)} ${n(ax + w + k * 0.12)} ${n(ay + h * 0.1)} ${n(ax + w - k * 0.22)} ${n(ay + h * 0.46)}`;
  const contorno = [
    `M${n(ax)} ${n(ay - k * 0.55)}`,
    `C${n(ax + w * 0.55)} ${n(ay - k * 1.3)} ${n(ax + w + k * 0.4)} ${n(ay + h * 0.08)} ${n(ax + w)} ${n(ay + h * 0.5)}`,
    `C${n(ax + w - k * 0.2)} ${n(ay + h * 0.9)} ${n(bx + w * 0.42)} ${n(by + k * 0.8)} ${n(bx)} ${n(by + k * 0.45)}`,
    `L${n(bx)} ${n(by - k * 0.35)}`,
    `C${n(bx + w * 0.3)} ${n(by - k * 0.1)} ${n(ax + w - k * 1.05)} ${n(ay + h * 0.84)} ${n(ax + w - k * 0.95)} ${n(ay + h * 0.5)}`,
    `C${n(ax + w - k * 0.85)} ${n(ay + h * 0.18)} ${n(ax + w * 0.45)} ${n(ay + k * 0.3)} ${n(ax)} ${n(ay + k * 0.45)}Z`,
  ].join('');
  return { contorno, brillo };
}

// Perfil del plato: un aro de apoyo y un ala que sube hasta el borde.
export function perfilPlato(plato) {
  const R = plato.radio;
  return (h) => {
    if (h <= 1.5) return R * 0.6;
    const t = Math.min(1, (h - 1.5) / (plato.alto - 1.5));
    return R * (0.6 + 0.4 * Math.pow(Math.sin((t * Math.PI) / 2), 0.55));
  };
}
