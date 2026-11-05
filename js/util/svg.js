// Ayudas para armar SVG en texto.

let contador = 0;

// Ids únicos: varias bebidas pueden convivir en la misma página (carta, ventana flotante).
export function nuevoId(prefijo = 'tz') {
  contador += 1;
  return `${prefijo}-${contador.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

// Redondea para que el SVG no se llene de decimales.
export const n = (x) => Math.round(x * 100) / 100;

export function caminoPoligono(puntos, cerrado = true) {
  if (!puntos.length) return '';
  const partes = puntos.map(([x, y], i) => `${i ? 'L' : 'M'}${n(x)} ${n(y)}`);
  return partes.join('') + (cerrado ? 'Z' : '');
}

// Curva suave que pasa por todos los puntos (Catmull-Rom convertido a Bézier cúbica).
export function caminoSuave(puntos, cerrado = true, tension = 1) {
  const total = puntos.length;
  if (total < 3) return caminoPoligono(puntos, cerrado);
  const p = (i) => {
    if (cerrado) return puntos[(i + total) % total];
    return puntos[Math.min(total - 1, Math.max(0, i))];
  };
  let d = `M${n(puntos[0][0])} ${n(puntos[0][1])}`;
  const tramos = cerrado ? total : total - 1;
  for (let i = 0; i < tramos; i++) {
    const p0 = p(i - 1);
    const p1 = p(i);
    const p2 = p(i + 1);
    const p3 = p(i + 2);
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    d += `C${n(c1x)} ${n(c1y)} ${n(c2x)} ${n(c2y)} ${n(p2[0])} ${n(p2[1])}`;
  }
  return d + (cerrado ? 'Z' : '');
}

// Arco de elipse muestreado entre dos ángulos (radianes), como lista de puntos.
export function puntosArco(cx, cy, rx, ry, desde, hasta, pasos = 24) {
  const puntos = [];
  for (let i = 0; i <= pasos; i++) {
    const a = desde + ((hasta - desde) * i) / pasos;
    puntos.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return puntos;
}

export function elipse(cx, cy, rx, ry, atributos = '') {
  return `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(Math.max(0, rx))}" ry="${n(Math.max(0, ry))}" ${atributos}/>`;
}

// Gradiente con paradas [[offset, color, opacidad?], ...].
export function paradas(lista) {
  return lista
    .map(([offset, color, opacidad = 1]) => `<stop offset="${offset}" stop-color="${color}"${opacidad < 1 ? ` stop-opacity="${opacidad}"` : ''}/>`)
    .join('');
}
