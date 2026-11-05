// Formatos de tiempo y fechas locales.

export const MINUTO = 60000;

// 1 500 000 ms → "25:00". Redondea hacia arriba para que el reloj no muestre 24:59 al empezar.
export function formatoReloj(ms) {
  const segundos = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// "2026-11-04" en la hora local del usuario.
export function claveDia(fecha = new Date()) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function diaAnterior(clave) {
  const [a, m, d] = clave.split('-').map(Number);
  return claveDia(new Date(a, m - 1, d - 1));
}
