// Texturas generadas una sola vez con canvas y reutilizadas como imagen:
// así la superficie tiene grano sin pagar filtros SVG en cada cuadro.
import { crearAzar } from '../util/azar.js';

const TAM = 256;
const cache = new Map();

export function textura(tipo) {
  if (!GENERADORES[tipo]) return '';
  if (!cache.has(tipo)) cache.set(tipo, GENERADORES[tipo]());
  return cache.get(tipo);
}

function lienzo() {
  const c = document.createElement('canvas');
  c.width = TAM;
  c.height = TAM;
  return [c, c.getContext('2d')];
}

// Dibuja también las copias del otro lado del borde para que la textura se repita sin costuras.
function envolver(x, y, r, dibujar) {
  for (const dx of [-TAM, 0, TAM]) {
    for (const dy of [-TAM, 0, TAM]) {
      const px = x + dx;
      const py = y + dy;
      if (px + r < 0 || px - r > TAM || py + r < 0 || py - r > TAM) continue;
      dibujar(px, py);
    }
  }
}

const GENERADORES = {
  // Burbujas finas de leche texturizada.
  microespuma() {
    const [c, ctx] = lienzo();
    const azar = crearAzar(7);
    for (let i = 0; i < 1500; i++) {
      const x = azar.entre(0, TAM);
      const y = azar.entre(0, TAM);
      const r = Math.pow(azar.entre(0.7, 2.3), 1.25);
      const sombra = azar.entre(0.07, 0.2);
      const luz = azar.entre(0.25, 0.6);
      envolver(x, y, r, (px, py) => {
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140, 95, 60, ${sombra})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px - r * 0.3, py - r * 0.3, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 250, 242, ${luz})`;
        ctx.fill();
      });
    }
    return c.toDataURL('image/png');
  },

  // Crema de espresso atigrada: manchas alargadas oscuras y doradas.
  crema() {
    const [c, ctx] = lienzo();
    const azar = crearAzar(19);
    const mancha = (x, y, rx, ry, giro, color) => {
      envolver(x, y, Math.max(rx, ry), (px, py) => {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(giro);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      });
    };
    for (let i = 0; i < 260; i++) {
      mancha(azar.entre(0, TAM), azar.entre(0, TAM), azar.entre(4, 16), azar.entre(1.2, 3.5), azar.entre(-0.5, 0.5), `rgba(92, 50, 20, ${azar.entre(0.08, 0.2)})`);
    }
    for (let i = 0; i < 220; i++) {
      mancha(azar.entre(0, TAM), azar.entre(0, TAM), azar.entre(3, 10), azar.entre(1, 2.6), azar.entre(-0.6, 0.6), `rgba(236, 178, 98, ${azar.entre(0.1, 0.24)})`);
    }
    for (let i = 0; i < 500; i++) {
      mancha(azar.entre(0, TAM), azar.entre(0, TAM), azar.entre(0.5, 1.3), azar.entre(0.5, 1.3), 0, `rgba(255, 236, 200, ${azar.entre(0.15, 0.4)})`);
    }
    return c.toDataURL('image/png');
  },
};
