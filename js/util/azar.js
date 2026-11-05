// Azar con semilla y ruido suave. Con la misma semilla las formas salen siempre iguales,
// así la espuma pegada o el arte latte no cambian al recargar.

export function crearAzar(semilla = 1) {
  let a = (semilla >>> 0) || 1;
  const siguiente = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    siguiente,
    entre: (min, max) => min + (max - min) * siguiente(),
    entero: (min, max) => Math.floor(min + (max - min + 1) * siguiente()),
    signo: () => (siguiente() < 0.5 ? -1 : 1),
  };
}

export function semillaDeTexto(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Ruido periódico: f(s, q) es suave, periódico en s (0..1) y avanza con q.
// Sirve para deformar contornos cerrados de forma orgánica.
export function crearRuido(semilla, armonicos = 4) {
  const azar = crearAzar(semilla);
  const ondas = Array.from({ length: armonicos }, (_, i) => ({
    k: i + 1,
    fase: azar.entre(0, Math.PI * 2),
    velocidad: azar.entre(0.6, 1.8) * azar.signo(),
    amplitud: 1 / Math.pow(i + 1, 0.9),
  }));
  const norma = ondas.reduce((suma, o) => suma + o.amplitud, 0);
  return (s, q = 0) =>
    ondas.reduce((suma, o) => suma + o.amplitud * Math.sin(Math.PI * 2 * o.k * s + o.fase + q * o.velocidad), 0) / norma;
}

export const limitar = (x, min = 0, max = 1) => Math.min(max, Math.max(min, x));
export const mezclar = (a, b, t) => a + (b - a) * t;

// Transición suave entre a y b (0 antes de a, 1 después de b).
export function suave(a, b, x) {
  const t = limitar((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}
