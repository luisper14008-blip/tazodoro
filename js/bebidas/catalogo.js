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
      { con: 'cafetera', hasta: 0.3, superficie: 'crema' },
      { con: 'jarra', hasta: 1 },
    ],
  },
};

export const BEBIDA_INICIAL = 'cappuccino';

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
