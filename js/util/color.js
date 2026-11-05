// Mezclas de color en hex para gradientes que cambian con el nivel.

export function hexARgb(hex) {
  const limpio = hex.replace('#', '');
  const largo = limpio.length === 3 ? limpio.split('').map((c) => c + c).join('') : limpio;
  const valor = parseInt(largo, 16);
  return [(valor >> 16) & 255, (valor >> 8) & 255, valor & 255];
}

export function rgbAHex([r, g, b]) {
  const canal = (c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0');
  return `#${canal(r)}${canal(g)}${canal(b)}`;
}

export function mezclarColor(a, b, t) {
  const ca = hexARgb(a);
  const cb = hexARgb(b);
  return rgbAHex(ca.map((c, i) => c + (cb[i] - c) * t));
}

export const aclarar = (hex, t) => mezclarColor(hex, '#ffffff', t);
export const oscurecer = (hex, t) => mezclarColor(hex, '#000000', t);
