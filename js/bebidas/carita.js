// Carita del tema kawaii: va al frente del recipiente y cambia según el nivel.
// Feliz (llena), tranquila (a la mitad), somnolienta (casi vacía) y un guiño al terminar.
import { n } from '../util/svg.js';

const TINTA = '#4E2F52';

// Cada rasgo se dibuja dos veces: un contorno blanco ancho y la tinta encima, así se lee sobre café oscuro o leche.
const trazo = (d, ancho = 2.6) =>
  `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="${ancho + 2.4}" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>` +
  `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${ancho}" stroke-linecap="round" stroke-linejoin="round"/>`;
const punto = (x, y, r) =>
  `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r + 1.2)}" fill="#FFFFFF" opacity="0.85"/><circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${TINTA}"/>` +
  `<circle cx="${n(x - r * 0.35)}" cy="${n(y - r * 0.35)}" r="${n(r * 0.35)}" fill="#FFFFFF"/>`;

export function crearCarita(g) {
  const { def } = g;
  const vidrio = def.material !== 'ceramica';
  const h = def.alto * (vidrio ? 0.3 : 0.42);
  const r = def.perfil(h);
  const x = g.cx;
  const y = g.yc(h) + r * g.s * 0.92;
  const t = Math.min(r * 0.42, 30);
  const ox = t * 0.62;
  const ojos = {
    feliz: trazo(`M${n(-ox - t * 0.2)} 0Q${n(-ox)} ${n(-t * 0.32)} ${n(-ox + t * 0.2)} 0`) + trazo(`M${n(ox - t * 0.2)} 0Q${n(ox)} ${n(-t * 0.32)} ${n(ox + t * 0.2)} 0`),
    tranquila: punto(-ox, -t * 0.05, t * 0.13) + punto(ox, -t * 0.05, t * 0.13),
    somnolienta: trazo(`M${n(-ox - t * 0.2)} ${n(-t * 0.04)}Q${n(-ox)} ${n(t * 0.14)} ${n(-ox + t * 0.2)} ${n(-t * 0.04)}`) + trazo(`M${n(ox - t * 0.2)} ${n(-t * 0.04)}Q${n(ox)} ${n(t * 0.14)} ${n(ox + t * 0.2)} ${n(-t * 0.04)}`),
    guino: trazo(`M${n(-ox - t * 0.2)} 0Q${n(-ox)} ${n(-t * 0.32)} ${n(-ox + t * 0.2)} 0`) + punto(ox, -t * 0.05, t * 0.14),
  };
  const bocas = {
    feliz: `<path d="M${n(-t * 0.24)} ${n(t * 0.24)}Q0 ${n(t * 0.62)} ${n(t * 0.24)} ${n(t * 0.24)}Z" fill="${TINTA}" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="0" cy="${n(t * 0.4)}" rx="${n(t * 0.11)}" ry="${n(t * 0.07)}" fill="#FF8FB1"/>`,
    tranquila: trazo(`M${n(-t * 0.16)} ${n(t * 0.26)}Q0 ${n(t * 0.42)} ${n(t * 0.16)} ${n(t * 0.26)}`, 2.2),
    somnolienta: `<ellipse cx="0" cy="${n(t * 0.34)}" rx="${n(t * 0.09)}" ry="${n(t * 0.11)}" fill="${TINTA}" stroke="#FFFFFF" stroke-width="1.4"/>` +
      trazo(`M${n(t * 1.05)} ${n(-t * 0.95)}h${n(t * 0.28)}l${n(-t * 0.28)} ${n(t * 0.28)}h${n(t * 0.28)}`, 1.8),
    guino: trazo(`M${n(-t * 0.2)} ${n(t * 0.24)}Q${n(-t * 0.1)} ${n(t * 0.38)} 0 ${n(t * 0.26)}Q${n(t * 0.1)} ${n(t * 0.38)} ${n(t * 0.2)} ${n(t * 0.24)}`, 2.2),
  };
  const caras = Object.keys(ojos).map((nombre) => `<g class="cara-${nombre}" display="none">${ojos[nombre]}${bocas[nombre]}</g>`).join('');
  const markup = `<g class="carita" transform="translate(${n(x)} ${n(y)})">
    <ellipse cx="${n(-ox * 1.45)}" cy="${n(t * 0.24)}" rx="${n(t * 0.24)}" ry="${n(t * 0.13)}" fill="#FF8FB1" opacity="0.55"/>
    <ellipse cx="${n(ox * 1.45)}" cy="${n(t * 0.24)}" rx="${n(t * 0.24)}" ry="${n(t * 0.13)}" fill="#FF8FB1" opacity="0.55"/>
    ${caras}
  </g>`;

  let el = {};
  let actual = '';
  return {
    markup,
    montar(raiz) {
      el = Object.fromEntries(Object.keys(ojos).map((nombre) => [nombre, raiz.querySelector(`.cara-${nombre}`)]));
      actual = '';
    },
    actualizar({ nivel, modo }) {
      let cara;
      if (modo === 'llenando') cara = nivel < 0.05 ? 'guino' : nivel < 0.5 ? 'tranquila' : 'feliz';
      else cara = nivel <= 0.02 ? 'guino' : nivel < 0.33 ? 'somnolienta' : nivel < 0.66 ? 'tranquila' : 'feliz';
      if (cara === actual) return;
      Object.entries(el).forEach(([nombre, grupo]) => grupo?.setAttribute('display', nombre === cara ? 'inline' : 'none'));
      actual = cara;
    },
  };
}
