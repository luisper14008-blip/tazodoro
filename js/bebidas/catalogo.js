// Catálogo de bebidas: cada bebida es una entrada de datos y el renderizador común la dibuja.
// Para añadir una bebida: agrega una entrada aquí y su nombre y frase en js/textos.js (textos.bebidas).
//
// recipiente: forma (ver recipientes.js) y color del esmalte o del vidrio.
// capas: de abajo arriba, en fracción de la altura del líquido.
// superficie: colores del centro al borde (llena, casi acabada y al servir), textura, arte y toppings.
// vaciado.modo: 'desde-arriba' | 'desde-abajo' (pajita) | 'espuma-flota'. vaciado.restos: marcas que deja.
// servido: pasos del descanso. con: máquina o herramienta; hasta: nivel al que llega ese paso.

export const CATALOGO = {
  cappuccino: {
    id: 'cappuccino',
    familia: 'cafe',
    temperatura: 'caliente',
    recipiente: { forma: 'taza-ancha', color: '#F2ECE3' },
    capas: [
      { hasta: 0.3, color: '#3E2416', nombre: 'espresso' },
      { hasta: 0.78, color: '#A9784F', nombre: 'leche' },
      { hasta: 1, color: '#E8D5BC', nombre: 'espuma' },
    ],
    superficie: {
      colores: ['#F4E4CC', '#E9CFAB', '#D3A372', '#A66C3E', '#774826'],
      fina: ['#C49A72', '#B68A61', '#9A6A43', '#74482A', '#55331D'],
      crema: ['#DDA35E', '#C88A48', '#A66A32', '#7A4820', '#563015'],
      textura: 'microespuma',
      arte: 'corazon',
      toppings: [{ tipo: 'polvo', color: '#5C3520', cantidad: 150 }],
    },
    efectos: { vapor: 0.9 },
    vaciado: { modo: 'espuma-flota', restos: ['anillo', 'espuma-pegada', 'gotas', 'cacao'] },
    servido: [
      { con: 'cafetera', hasta: 0.3, superficie: 'crema', color: '#7A3E18' },
      { con: 'jarra', hasta: 1, color: '#FFFDF8' },
    ],
  },
};

Object.assign(CATALOGO, {
  americano: {
    id: 'americano',
    familia: 'cafe',
    temperatura: 'caliente',
    recipiente: { forma: 'taza', color: '#F3EEE6' },
    capas: [{ hasta: 1, color: '#2A160C', nombre: 'cafe' }],
    superficie: {
      colores: ['#3E2414', '#2E190D', '#22120A', '#4E2D16', '#6E4322'],
      fina: ['#46291A', '#361E11', '#28150B', '#4A2A15', '#5E391D'],
      textura: null,
      brillo: 1.5,
      reflejo: 1,
    },
    efectos: { vapor: 1.2 },
    vaciado: { modo: 'desde-arriba', restos: ['anillo', 'gotas'], coloresRestos: { espuma: '#8A5A34', marca: '#4A2814', gota: '#3A1E0E' } },
    servido: [{ con: 'cafetera', hasta: 1, color: '#4A240E' }],
  },

  espresso: {
    id: 'espresso',
    familia: 'cafe',
    temperatura: 'caliente',
    recipiente: { forma: 'tacita', color: '#F4EFE7' },
    capas: [
      { hasta: 0.75, color: '#2A150B', nombre: 'cafe' },
      { hasta: 1, color: '#B97A3C', nombre: 'crema' },
    ],
    superficie: {
      colores: ['#E0A964', '#CF9150', '#B47236', '#8A5120', '#5E3312'],
      fina: ['#6A3D1E', '#5A3218', '#482713', '#371D0E', '#28140A'],
      textura: 'crema',
      opacidadTextura: 0.85,
      brillo: 1.1,
    },
    efectos: { vapor: 0.7 },
    vaciado: { modo: 'espuma-flota', restos: ['anillo', 'rastros', 'gotas'], coloresRestos: { espuma: '#C08A4E', marca: '#3A1C0C', gota: '#2E160A' } },
    servido: [{ con: 'cafetera', hasta: 1, color: '#6A3416', superficie: 'crema' }],
  },
});

Object.assign(CATALOGO, {
  mocha: {
    id: 'mocha',
    familia: 'cafe',
    temperatura: 'caliente',
    recipiente: { forma: 'mug', color: '#EDE4D8' },
    capas: [{ hasta: 1, color: '#3E2014', nombre: 'mocha' }],
    superficie: {
      colores: ['#6A3B22', '#58301B', '#472615', '#371C0F', '#28130A'],
      fina: ['#5E3520', '#4E2B19', '#3E2213', '#2F190E', '#22110A'],
      textura: 'microespuma',
      opacidadTextura: 0.18,
      brillo: 1.1,
      reflejo: 0.4,
    },
    flotantes: [{ tipo: 'crema', ancho: 0.66, alto: 1.15, hilo: { color: '#3A1A0C' }, virutas: { color: '#2A1208', cantidad: 16 } }],
    efectos: { vapor: 0.8 },
    vaciado: { modo: 'desde-arriba', restos: ['anillo', 'espuma-pegada', 'chorreado', 'gotas'], coloresRestos: { espuma: '#9A6A48', marca: '#3A1A0C', gota: '#2E140A' } },
    servido: [{ con: 'cafetera', hasta: 1, color: '#4A2414' }],
  },

  chai: {
    id: 'chai',
    familia: 'te',
    temperatura: 'caliente',
    recipiente: { forma: 'mug', color: '#4F7F7B', interior: '#F2EBE1' },
    capas: [
      { hasta: 0.88, color: '#D19A5C', nombre: 'chai' },
      { hasta: 1, color: '#EBD3B0', nombre: 'espuma' },
    ],
    superficie: {
      colores: ['#EFD3A6', '#E6C08A', '#D3A266', '#B07A40', '#87562A'],
      fina: ['#D2A56E', '#C4955F', '#AE7C48', '#8C5C33', '#664022'],
      textura: 'microespuma',
      opacidadTextura: 0.45,
      toppings: [{ tipo: 'polvo', color: '#8A4A22', cantidad: 160 }],
    },
    flotantes: [{ tipo: 'especias' }],
    efectos: { vapor: 0.85 },
    vaciado: { modo: 'espuma-flota', restos: ['anillo', 'espuma-pegada', 'cacao', 'gotas'], coloresRestos: { espuma: '#EAD3AE', marca: '#A86A34', polvo: '#7A3E1C', gota: '#8A5228' } },
    servido: [{ con: 'tetera', hasta: 1, color: '#C98A48' }],
  },

  chocolate: {
    id: 'chocolate',
    familia: 'chocolate',
    temperatura: 'caliente',
    recipiente: { forma: 'mug-grande', color: '#A9372F', interior: '#F2EBE1' },
    capas: [{ hasta: 1, color: '#3A1A0E', nombre: 'chocolate' }],
    superficie: {
      colores: ['#5E311C', '#4C2616', '#3C1C10', '#2C130A', '#1F0D06'],
      fina: ['#583020', '#482618', '#3A1D12', '#2B150C', '#1F0E08'],
      textura: null,
      brillo: 1.3,
      reflejo: 0.6,
    },
    flotantes: [{ tipo: 'malvaviscos', cantidad: 6 }],
    efectos: { vapor: 0.9 },
    vaciado: { modo: 'desde-arriba', restos: ['anillo', 'chorreado', 'gotas'], coloresRestos: { espuma: '#5A2E18', marca: '#3A1A0C', gota: '#2E1308' } },
    servido: [{ con: 'jarra', hasta: 1, color: '#4A2414' }],
  },
});

Object.assign(CATALOGO, {
  latte: {
    id: 'latte',
    familia: 'cafe',
    temperatura: 'caliente',
    recipiente: { forma: 'vaso-alto', color: '#F2ECE3' },
    capas: [
      { hasta: 0.46, color: '#EFE5D6', nombre: 'leche' },
      { hasta: 0.74, color: '#8E5A34', nombre: 'cafe' },
      { hasta: 1, color: '#F7EFE4', nombre: 'espuma' },
    ],
    superficie: {
      capa: 'espuma',
      colores: ['#E2C29A', '#D8B286', '#C99A6A', '#B07E50', '#8E6038'],
      fina: ['#D2B08A', '#C6A07A', '#B48A62', '#9A7048', '#7E5634'],
      textura: 'microespuma',
      opacidadTextura: 0.45,
      arte: 'roseta',
      colorArte: '#FFFBF4',
      colorHalo: '#F4E8D6',
      hojas: 7,
    },
    efectos: { vapor: 0.7 },
    vaciado: { modo: 'desde-arriba', restos: ['anillos-espuma'] },
    servido: [
      { con: 'jarra', hasta: 0.46, color: '#FFFDF8' },
      { con: 'cafetera', hasta: 0.74, color: '#6A3618' },
      { con: 'jarra', hasta: 1, color: '#FFFDF8' },
    ],
  },

  caramelMacchiato: {
    id: 'caramelMacchiato',
    familia: 'cafe',
    temperatura: 'caliente',
    recipiente: { forma: 'vaso', color: '#F2ECE3' },
    capas: [
      { hasta: 0.58, color: '#F1E6D4', nombre: 'leche' },
      { hasta: 0.84, color: '#6E3E20', nombre: 'espresso' },
      { hasta: 1, color: '#F2E2C6', nombre: 'espuma' },
    ],
    superficie: {
      capa: 'espuma',
      colores: ['#F6E9D4', '#EFDDC2', '#E3C9A2', '#CBA678', '#AD8152'],
      fina: ['#E8D6BA', '#DEC8A8', '#CFB28A', '#B48E62', '#957044'],
      textura: 'microespuma',
      opacidadTextura: 0.4,
      toppings: [{ tipo: 'rejilla', color: '#C0702A', lineas: 5 }],
    },
    efectos: { vapor: 0.6 },
    vaciado: { modo: 'desde-arriba', restos: ['escurrido', 'anillos-espuma'], coloresRestos: { marca: '#C47A2E' } },
    servido: [
      { con: 'jarra', hasta: 0.58, color: '#FFFDF8' },
      { con: 'cafetera', hasta: 0.84, color: '#5E2E12' },
      { con: 'jarra', hasta: 1, color: '#FFFDF8' },
    ],
  },

  matcha: {
    id: 'matcha',
    familia: 'te',
    temperatura: 'caliente',
    recipiente: { forma: 'vaso-matcha', color: '#F2ECE3' },
    capas: [
      { hasta: 0.34, color: '#F2EFE2', nombre: 'leche' },
      { hasta: 0.88, color: '#79A03F', nombre: 'matcha' },
      { hasta: 1, color: '#DDE8BE', nombre: 'espuma' },
    ],
    superficie: {
      colores: ['#B7D07E', '#A5C26A', '#8DAD52', '#6E8F3A', '#56722A'],
      fina: ['#9DBA62', '#8DAA55', '#789845', '#5E7E34', '#4A6528'],
      textura: 'microespuma',
      opacidadTextura: 0.35,
      arte: 'roseta',
      colorArte: '#F8F6EA',
      colorHalo: '#E2EBC8',
      hojas: 5,
    },
    efectos: { vapor: 0.7 },
    vaciado: { modo: 'espuma-flota', restos: ['anillos-espuma'], coloresRestos: { espuma: '#EEF3DC' } },
    servido: [
      { con: 'jarra', hasta: 0.34, color: '#FFFDF8' },
      { con: 'tetera', hasta: 0.88, color: '#7FA046' },
      { con: 'jarra', hasta: 1, color: '#FFFDF8' },
    ],
  },
});

Object.assign(CATALOGO, {
  coldBrew: {
    id: 'coldBrew',
    familia: 'cafe',
    temperatura: 'fria',
    recipiente: { forma: 'vaso-hielo', color: '#F2ECE3' },
    capas: [{ hasta: 1, color: '#4A2614', nombre: 'cafe' }],
    superficie: {
      colores: ['#5A3420', '#4A2A18', '#3A2012', '#2B170C', '#1E1008'],
      textura: null,
      brillo: 1.2,
      reflejo: 0.8,
    },
    flotantes: [{ tipo: 'hielos', cantidad: 4, tam: 36 }],
    vaciado: { modo: 'desde-abajo', restos: [] },
    servido: [{ con: 'jarra-vidrio', hasta: 1, color: '#3A1F10' }],
  },

  frappe: {
    id: 'frappe',
    familia: 'cafe',
    temperatura: 'fria',
    recipiente: { forma: 'vaso-domo', color: '#F2ECE3' },
    capas: [{ hasta: 1, color: '#C9A07A', nombre: 'base' }],
    superficie: {
      colores: ['#D9B894', '#CFAA84', '#BF9670', '#A67C56', '#8A6240'],
      textura: 'hielo',
      opacidadTextura: 0.7,
    },
    flotantes: [{ tipo: 'crema', ancho: 0.9, alto: 1.15, salsa: { color: '#B5651D' }, derrite: false }],
    vaciado: { modo: 'desde-abajo', restos: ['escurrido'], coloresRestos: { marca: '#A35A1C' } },
    servido: [{ con: 'licuadora', hasta: 1, color: '#C9A07A' }],
  },

  bubbleTea: {
    id: 'bubbleTea',
    familia: 'te',
    temperatura: 'fria',
    recipiente: { forma: 'vaso-sellado', color: '#F2ECE3' },
    capas: [{ hasta: 1, color: '#D6B48C', nombre: 'te' }],
    superficie: {
      colores: ['#E4C8A4', '#DABC96', '#CBA982', '#B28E66', '#94724E'],
      textura: null,
      brillo: 0.8,
    },
    flotantes: [{ tipo: 'perlas', cantidad: 34, radio: 7.5 }],
    vaciado: { modo: 'desde-abajo', restos: [] },
    servido: [{ con: 'coctelera', hasta: 1, color: '#D6B48C' }],
  },
});

export const BEBIDA_INICIAL = 'cappuccino';

// Orden de la carta, por secciones.
export const CARTA = [
  { seccion: 'cafe', bebidas: ['americano', 'espresso', 'cappuccino', 'latte', 'mocha', 'caramelMacchiato'] },
  { seccion: 'frios', bebidas: ['coldBrew', 'frappe', 'bubbleTea'] },
  { seccion: 'otros', bebidas: ['matcha', 'chai', 'chocolate'] },
];

export function obtenerBebida(id) {
  return CATALOGO[id] ?? CATALOGO[BEBIDA_INICIAL];
}

// El recipiente crece con los minutos: 5 min se ve chico y 90 min se ve grande.
const PUNTOS_ESCALA = [
  [5, 0.82],
  [15, 0.97],
  [25, 1.12],
  [50, 1.26],
  [90, 1.34],
];

export function escalaPorMinutos(minutos) {
  if (minutos <= PUNTOS_ESCALA[0][0]) return PUNTOS_ESCALA[0][1];
  for (let i = 1; i < PUNTOS_ESCALA.length; i++) {
    const [m1, e1] = PUNTOS_ESCALA[i - 1];
    const [m2, e2] = PUNTOS_ESCALA[i];
    if (minutos <= m2) return e1 + ((e2 - e1) * (minutos - m1)) / (m2 - m1);
  }
  return PUNTOS_ESCALA[PUNTOS_ESCALA.length - 1][1];
}

// Paso de servido activo para un nivel dado (durante el descanso).
export function pasoDeServido(bebida, nivel) {
  const pasos = bebida.servido || [];
  return pasos.find((paso) => nivel < paso.hasta) ?? pasos[pasos.length - 1] ?? null;
}
