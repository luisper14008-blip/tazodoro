// Fondo de la cafetería nocturna: pared azul, ventana con lluvia, lámpara cálida,
// plantas en silueta y una mesa de madera donde se apoya la bebida.
import { crearAzar } from '../util/azar.js';
import { n, caminoSuave } from '../util/svg.js';

// Hoja con forma de corazón alargado, apuntando en el ángulo dado.
function hoja(x, y, largo, angulo) {
  const a = angulo;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const p = (u, v) => [x + u * c - v * s, y + u * s + v * c];
  const puntos = [p(0, 0), p(largo * 0.25, -largo * 0.32), p(largo * 0.7, -largo * 0.26), p(largo, 0), p(largo * 0.7, largo * 0.26), p(largo * 0.25, largo * 0.32)];
  return caminoSuave(puntos);
}

function plantaColgante(azar) {
  let d = '';
  let hojas = '';
  for (let k = 0; k < 3; k++) {
    const x0 = 30 + k * 34;
    const puntos = [];
    const largo = azar.entre(180, 320);
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      puntos.push([x0 + Math.sin(t * 5 + k) * 14 * t, t * largo]);
    }
    d += caminoSuave(puntos, false);
    for (let i = 1; i < 16; i++) {
      const t = i / 16;
      const [x, y] = [x0 + Math.sin(t * 5 + k) * 14 * t, t * largo];
      const lado = i % 2 ? 1 : -1;
      hojas += `<path d="${hoja(x, y, azar.entre(16, 26) * (1 - t * 0.35), Math.PI / 2 + lado * azar.entre(0.5, 1.1))}"/>`;
    }
  }
  return `<svg class="planta planta-colgante" viewBox="0 0 140 340" aria-hidden="true">
    <path d="M18 0H122L112 30H28Z" class="maceta"/>
    <path d="${d}" fill="none" class="tallo"/>
    <g class="hojas">${hojas}</g></svg>`;
}

function plantaMaceta(azar) {
  let hojas = '';
  for (let i = 0; i < 9; i++) {
    const angulo = -Math.PI / 2 + azar.entre(-1.1, 1.1);
    const largo = azar.entre(70, 120);
    const x = 90 + azar.entre(-10, 10);
    const y = 170;
    const [px, py] = [x + Math.cos(angulo) * largo * 0.55, y + Math.sin(angulo) * largo * 0.55];
    hojas += `<path d="M${n(x)} ${n(y)}Q${n((x + px) / 2 + 8)} ${n((y + py) / 2)} ${n(px)} ${n(py)}" fill="none" class="tallo"/>`;
    hojas += `<path d="${hoja(px, py, largo * 0.62, angulo + azar.entre(-0.3, 0.3))}"/>`;
  }
  return `<svg class="planta planta-maceta" viewBox="0 0 180 250" aria-hidden="true">
    <g class="hojas">${hojas}</g>
    <path d="M52 168H128L118 246H62Z" class="maceta"/>
    <path d="M48 162H132V174H48Z" class="maceta-borde"/></svg>`;
}

const LAMPARA = `<svg class="lampara" viewBox="0 0 120 300" aria-hidden="true">
  <defs>
    <linearGradient id="lampara-pantalla" x1="0" x2="1"><stop offset="0" stop-color="#1D1814"/><stop offset="0.55" stop-color="#4A3524"/><stop offset="0.8" stop-color="#8A5F35"/><stop offset="1" stop-color="#2A1F18"/></linearGradient>
    <radialGradient id="lampara-foco"><stop offset="0" stop-color="#FFF6DA"/><stop offset="0.45" stop-color="#FFD58A"/><stop offset="1" stop-color="#F2A33A" stop-opacity="0"/></radialGradient>
  </defs>
  <line x1="60" y1="0" x2="60" y2="196" stroke="#0E0C0B" stroke-width="2"/>
  <rect x="53" y="190" width="14" height="14" rx="3" fill="#2A211B"/>
  <ellipse cx="60" cy="252" rx="34" ry="20" fill="url(#lampara-foco)"/>
  <path d="M60 200C40 200 30 214 24 236C20 248 14 252 10 256H110C106 252 100 248 96 236C90 214 80 200 60 200Z" fill="url(#lampara-pantalla)"/>
  <ellipse cx="60" cy="256" rx="50" ry="5" fill="#FFD58A" opacity="0.85"/>
  <ellipse cx="60" cy="258" rx="16" ry="7" fill="#FFF3D1"/>
</svg>`;

// Lluvia en canvas: tres planos de gotas (lejos, medio, cerca) y gotas pegadas al vidrio que resbalan.
function crearLluvia(canvas, { movimiento }) {
  const ctx = canvas.getContext('2d');
  const azar = crearAzar(5);
  let ancho = 0;
  let alto = 0;
  let escala = 1;
  let gotas = [];
  let vidrio = [];
  let ultimo = performance.now();
  let id = 0;
  const sprite = document.createElement('canvas');

  function prepararSprite() {
    const r = 6 * escala;
    sprite.width = sprite.height = Math.ceil(r * 2 + 2);
    const s = sprite.getContext('2d');
    const g = s.createRadialGradient(r * 0.8, r * 0.7, 0, r + 1, r + 1, r);
    g.addColorStop(0, 'rgba(230, 240, 255, 0.85)');
    g.addColorStop(0.35, 'rgba(150, 175, 220, 0.35)');
    g.addColorStop(0.85, 'rgba(40, 55, 90, 0.35)');
    g.addColorStop(1, 'rgba(40, 55, 90, 0)');
    s.fillStyle = g;
    s.beginPath();
    s.arc(r + 1, r + 1, r, 0, Math.PI * 2);
    s.fill();
  }

  function medir() {
    const caja = canvas.getBoundingClientRect();
    escala = Math.min(window.devicePixelRatio || 1, 1.5);
    ancho = Math.max(1, Math.round(caja.width * escala));
    alto = Math.max(1, Math.round(caja.height * escala));
    canvas.width = ancho;
    canvas.height = alto;
    const area = (caja.width * caja.height) / 10000;
    gotas = Array.from({ length: Math.round(Math.min(220, area * 2.2)) }, () => nuevaGota(true));
    vidrio = Array.from({ length: Math.round(Math.min(46, area * 0.45)) }, () => nuevaGotaVidrio(true));
    prepararSprite();
  }

  function nuevaGota(dispersa) {
    const plano = azar.siguiente();
    const capa = plano < 0.5 ? 0 : plano < 0.85 ? 1 : 2;
    return {
      x: azar.entre(-0.1, 1.05) * ancho,
      y: dispersa ? azar.entre(0, alto) : azar.entre(-alto * 0.3, 0),
      capa,
      velocidad: [420, 700, 980][capa] * escala * azar.entre(0.85, 1.15),
      largo: [7, 13, 20][capa] * escala,
    };
  }

  function nuevaGotaVidrio(dispersa) {
    return {
      x: azar.entre(0, ancho),
      y: dispersa ? azar.entre(0, alto) : azar.entre(-10, alto * 0.3),
      r: azar.entre(0.35, 1) * escala,
      velocidad: 0,
      espera: azar.entre(1, 14),
    };
  }

  function dibujar(dt) {
    ctx.clearRect(0, 0, ancho, alto);
    const viento = 0.12;
    const colores = ['rgba(150, 170, 210, 0.16)', 'rgba(175, 195, 235, 0.24)', 'rgba(205, 220, 250, 0.32)'];
    for (let capa = 0; capa < 3; capa++) {
      ctx.beginPath();
      ctx.strokeStyle = colores[capa];
      ctx.lineWidth = (capa + 1) * 0.55 * escala;
      for (const g of gotas) {
        if (g.capa !== capa) continue;
        g.y += g.velocidad * dt;
        g.x += g.velocidad * viento * dt;
        if (g.y > alto + g.largo) Object.assign(g, nuevaGota(false));
        ctx.moveTo(g.x, g.y);
        ctx.lineTo(g.x - g.largo * viento, g.y - g.largo);
      }
      ctx.stroke();
    }
    for (const v of vidrio) {
      if (v.velocidad === 0) {
        v.espera -= dt;
        if (v.espera <= 0) v.velocidad = azar.entre(18, 55) * escala;
      } else {
        v.y += v.velocidad * dt;
        v.x += Math.sin(v.y * 0.05) * 0.2;
        if (v.y > alto + 10) Object.assign(v, nuevaGotaVidrio(false));
      }
      const tam = sprite.width * v.r;
      ctx.drawImage(sprite, v.x - tam / 2, v.y - tam / 2, tam, tam);
    }
  }

  function cuadro(ahora) {
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    dibujar(dt);
    id = requestAnimationFrame(cuadro);
  }

  new ResizeObserver(() => {
    medir();
    if (!movimiento) dibujar(0);
  }).observe(canvas);

  return {
    iniciar() {
      if (!movimiento || id) return;
      ultimo = performance.now();
      id = requestAnimationFrame(cuadro);
    },
    detener() {
      cancelAnimationFrame(id);
      id = 0;
    },
  };
}

export function montarFondoNocturna(contenedor, { movimiento = true } = {}) {
  const azar = crearAzar(23);
  contenedor.innerHTML = `
    <div class="fondo-pared"></div>
    <div class="fondo-ventana">
      <div class="ventana-ciudad"></div>
      <canvas class="ventana-lluvia"></canvas>
      <div class="ventana-vaho"></div>
      <div class="ventana-marco"><span class="parteluz-v"></span><span class="parteluz-h"></span></div>
    </div>
    <div class="fondo-halo"></div>
    ${LAMPARA}
    ${plantaColgante(azar)}
    <div class="fondo-mesa"></div>
    ${plantaMaceta(azar)}`;
  const lluvia = crearLluvia(contenedor.querySelector('.ventana-lluvia'), { movimiento });
  lluvia.iniciar();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) lluvia.detener();
    else lluvia.iniciar();
  });
  return lluvia;
}
