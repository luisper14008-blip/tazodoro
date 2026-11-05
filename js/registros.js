// Cuentas a partir de los bloques registrados: contadores de hoy y racha.
import { claveDia, diaAnterior } from './util/tiempo.js';

const DIAS_GUARDADOS = 400;

export function conteosDeHoy(registros, ahora = Date.now()) {
  const hoy = claveDia(ahora);
  const conteos = { foco: 0, corto: 0, largo: 0 };
  for (const r of registros) {
    if (r.completo && claveDia(r.fin) === hoy && r.tipo in conteos) conteos[r.tipo] += 1;
  }
  return conteos;
}

// Días seguidos con al menos una taza terminada. Si hoy aún no hay taza, la racha sigue viva desde ayer.
export function racha(registros, ahora = Date.now()) {
  const dias = new Set(registros.filter((r) => r.tipo === 'foco' && r.completo).map((r) => claveDia(r.fin)));
  let dia = claveDia(ahora);
  if (!dias.has(dia)) dia = diaAnterior(dia);
  let total = 0;
  while (dias.has(dia)) {
    total += 1;
    dia = diaAnterior(dia);
  }
  return total;
}

// Quita registros muy viejos para que localStorage no crezca sin límite.
export function podar(registros, ahora = Date.now()) {
  const limite = ahora - DIAS_GUARDADOS * 86400000;
  return registros.filter((r) => r.fin >= limite);
}
