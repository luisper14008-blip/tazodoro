// Altura de cada capa según el nivel y la forma de vaciarse.
// Devuelve [{ capa, desde, hasta }] en fracciones de la altura del líquido (0..1), de abajo arriba.
//   desde-arriba: se bebe primero la capa de arriba (y así se llena al servir).
//   desde-abajo: con pajita se va primero la capa de abajo y las demás bajan.
//   espuma-flota: la espuma se queda arriba y adelgaza.
export function capasVisibles(capas, nivel, modo) {
  const L = Math.max(0, Math.min(1, nivel));
  if (!capas?.length || L <= 0.0005) return [];

  if (modo === 'desde-abajo') {
    let consumido = 1 - L;
    let base = 0;
    let previo = 0;
    const quedan = [];
    for (const capa of capas) {
      let grosor = capa.hasta - previo;
      previo = capa.hasta;
      const quita = Math.min(grosor, consumido);
      grosor -= quita;
      consumido -= quita;
      if (grosor > 0.0001) {
        quedan.push({ capa, desde: base, hasta: base + grosor });
        base += grosor;
      }
    }
    return quedan;
  }

  if (modo === 'espuma-flota') {
    const ultima = capas[capas.length - 1];
    const previa = capas.length > 1 ? capas[capas.length - 2].hasta : 0;
    const espuma = Math.min(L, (ultima.hasta - previa) * (0.35 + 0.65 * L));
    const cuerpo = L - espuma;
    const resultado = [];
    let previo = 0;
    for (const capa of capas.slice(0, -1)) {
      if (previo < cuerpo) resultado.push({ capa, desde: previo, hasta: Math.min(capa.hasta, cuerpo) });
      previo = capa.hasta;
    }
    resultado.push({ capa: ultima, desde: cuerpo, hasta: L });
    return resultado;
  }

  const resultado = [];
  let previo = 0;
  for (const capa of capas) {
    if (previo < L) resultado.push({ capa, desde: previo, hasta: Math.min(capa.hasta, L) });
    previo = capa.hasta;
  }
  return resultado;
}
