// Cálculos de estadísticas a partir de los bloques registrados.
import { claveDia, diaAnterior } from './util/tiempo.js';
import { racha } from './registros.js';

export function resumen(registros, ahora = Date.now()) {
  const hoy = claveDia(ahora);
  const porDia = new Map();
  const porBebida = {};
  let total = 0;
  for (const r of registros) {
    if (r.tipo !== 'foco') continue;
    const dia = claveDia(r.fin);
    const actual = porDia.get(dia) ?? { minutos: 0, tazas: 0 };
    // Los minutos cuentan aunque la taza se haya saltado; las tazas, solo si se terminaron.
    actual.minutos += r.minutos || 0;
    if (r.completo) {
      actual.tazas += 1;
      total += 1;
      porBebida[r.bebida] = (porBebida[r.bebida] || 0) + 1;
    }
    porDia.set(dia, actual);
  }
  const semana = [];
  let dia = hoy;
  for (let i = 0; i < 7; i++) {
    const valores = porDia.get(dia) ?? { minutos: 0, tazas: 0 };
    semana.unshift({ clave: dia, minutos: Math.round(valores.minutos), tazas: valores.tazas, hoy: i === 0 });
    dia = diaAnterior(dia);
  }
  const [favoritaId, favoritaTazas] = Object.entries(porBebida).sort((a, b) => b[1] - a[1])[0] ?? [];
  const deHoy = porDia.get(hoy) ?? { minutos: 0, tazas: 0 };
  return {
    hoy: { minutos: Math.round(deHoy.minutos), tazas: deHoy.tazas },
    semana,
    favorita: favoritaId ? { id: favoritaId, tazas: favoritaTazas } : null,
    racha: racha(registros, ahora),
    total,
  };
}
