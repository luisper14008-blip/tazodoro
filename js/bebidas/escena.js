// Orquesta la escena: la bebida, el vapor, los sorbos y las máquinas del descanso.
// Capas: máquina (atrás) → bebida → vapor → jarra (adelante). Todas comparten el viewBox 400 × 460.
import { crearBebida, ESCENA } from './renderizador.js';
import { HERRAMIENTAS } from './maquinas.js';
import { pasoDeServido } from './catalogo.js';
import { semillaDeTexto, suave } from '../util/azar.js';
import { nuevoId } from '../util/svg.js';

const NS = 'http://www.w3.org/2000/svg';
const VIEWBOX = `0 0 ${ESCENA.ancho} ${ESCENA.alto}`;
const DURACION_SORBO = 1700;
const DURACION_SALTO = 650;

const pct = (valor, total) => `${((valor / total) * 100).toFixed(3)}%`;

function crearCapaSvg(clase) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', VIEWBOX);
  svg.setAttribute('class', `capa ${clase}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  return svg;
}

// Una voluta de vapor: trazo suave con degradado, desenfocado una sola vez (capa propia).
function voluta(i) {
  const id = nuevoId('vapor');
  const formas = [
    'M20 156C6 124 34 104 20 74S8 26 22 4',
    'M22 156C34 128 8 108 22 80S34 30 18 6',
    'M18 156C10 132 30 116 24 88S10 40 20 8',
    'M21 156C30 120 12 100 18 70S30 28 20 4',
  ];
  const ajustes = [
    { x: 30, dur: 5.6, retraso: -0.4, deriva: 7 },
    { x: 52, dur: 6.4, retraso: -2.9, deriva: -6 },
    { x: 41, dur: 5.1, retraso: -1.7, deriva: 4 },
    { x: 62, dur: 6.9, retraso: -4.2, deriva: -8 },
  ][i];
  return `<div class="voluta" style="--x:${ajustes.x}%;--dur:${ajustes.dur}s;--retraso:${ajustes.retraso}s;--deriva:${ajustes.deriva}%">
    <svg viewBox="0 0 40 160" preserveAspectRatio="none"><defs><linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" style="stop-color:var(--vapor,#FFFFFF);stop-opacity:0"/><stop offset="0.3" style="stop-color:var(--vapor,#FFFFFF);stop-opacity:0.7"/><stop offset="0.75" style="stop-color:var(--vapor,#FFFFFF);stop-opacity:0.25"/><stop offset="1" style="stop-color:var(--vapor,#FFFFFF);stop-opacity:0"/></linearGradient></defs>
    <path d="${formas[i]}" fill="none" stroke="url(#${id})" stroke-width="7" stroke-linecap="round"/></svg></div>`;
}

export function crearEscena(contenedor, { movimiento = true, factor = 1 } = {}) {
  contenedor.classList.add('escena');
  contenedor.innerHTML = '';
  const capaMaquina = crearCapaSvg('capa-maquina');
  const capaBebidas = document.createElement('div');
  capaBebidas.className = 'capa capa-bebidas';
  const capaVapor = document.createElement('div');
  capaVapor.className = 'capa capa-vapor';
  capaVapor.setAttribute('aria-hidden', 'true');
  const capaJarra = crearCapaSvg('capa-jarra');
  contenedor.append(capaMaquina, capaBebidas, capaVapor, capaJarra);

  let actual = null;
  let salidas = {};
  let estado = { nivel: 1, bloque: 'foco', fase: 'listo', modo: 'vaciando' };
  let mostrado = null;
  let transicion = null;
  let sorbo = null;
  let proximoSorbo = performance.now() + 20000;
  let claveMaquinas = '';
  let calorMostrado = -1;
  let pausada = false;
  let conCarita = false;

  const intervaloSorbo = () => (40000 + Math.random() * 50000) / (factor > 1 ? 6 : 1);

  // Arma las herramientas que usa esta bebida al servirse: las de atrás (cafetera, base de licuadora)
  // quedan durante todo el descanso; las de adelante (jarras, tetera…) aparecen solo mientras sirven.
  function construirMaquinas() {
    const borde = actual.render.borde();
    const pasos = actual.bebida.servido || [];
    let atras = '';
    let adelante = '';
    salidas = {};
    for (const nombre of new Set(pasos.map((paso) => paso.con))) {
      const herramienta = HERRAMIENTAS[nombre];
      if (!herramienta) continue;
      const salida = [borde.x + herramienta.pico[0], borde.arriba + herramienta.pico[1]];
      const color = pasos.find((paso) => paso.con === nombre)?.color;
      const creada = herramienta.crear({ salida, mesa: ESCENA.mesa, movimiento, color });
      const grupo = `<g class="herramienta" data-herramienta="${nombre}">${creada.svg}</g>`;
      if (herramienta.capa === 'atras') atras += grupo;
      else adelante += grupo;
      if (herramienta.base) atras += herramienta.base({ salida, mesa: ESCENA.mesa }).svg;
      salidas[nombre] = { desde: creada.salida, separacion: creada.separacion };
    }
    capaMaquina.innerHTML = atras;
    capaJarra.innerHTML = adelante;
    claveMaquinas = '';
  }

  function construirVapor() {
    const borde = actual.render.borde();
    const ancho = borde.radio * 1.5;
    const alto = 175 * actual.render.escala;
    capaVapor.innerHTML = `<div class="vapor" style="left:${pct(borde.x - ancho / 2, ESCENA.ancho)};top:${pct(borde.y - alto, ESCENA.alto)};width:${pct(ancho, ESCENA.ancho)};height:${pct(alto, ESCENA.alto)}">${[0, 1, 2, 3].map(voluta).join('')}</div>`;
    calorMostrado = -1;
  }

  // Muestra una bebida (o la misma con otro tamaño). La anterior se desvanece con el mismo nivel.
  function mostrar(bebida, escala) {
    const render = crearBebida(bebida, { escala, movimiento, semilla: semillaDeTexto(bebida.id) % 1000, carita: conCarita });
    // Solo hay fundido cuando una bebida reemplaza a otra; la primera aparece de inmediato.
    const svg = crearCapaSvg(actual ? 'bebida-svg entrando' : 'bebida-svg');
    svg.innerHTML = render.markup;
    capaBebidas.append(svg);
    render.montar(svg);
    render.fijarNivel(mostrado ?? estado.nivel, estado.modo);
    if (pausada) svg.pauseAnimations?.();
    if (actual) {
      const viejo = actual.svg;
      viejo.classList.add('saliendo');
      setTimeout(() => viejo.remove(), 700);
    }
    requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.remove('entrando')));
    actual = { bebida, escala, render, svg };
    construirMaquinas();
    construirVapor();
    aplicarMaquinas(true);
    aplicarVapor();
  }

  function aplicarMaquinas(forzar = false) {
    const { nivel, bloque, fase } = estado;
    const descanso = bloque !== 'foco';
    const sirviendo = descanso && fase === 'corriendo' && nivel < 0.995 && !transicion;
    const paso = descanso ? pasoDeServido(actual.bebida, nivel) : null;
    const activa = sirviendo ? paso?.con : null;
    const clave = `${descanso}|${activa}|${paso?.color}`;
    if (clave === claveMaquinas && !forzar) return;
    claveMaquinas = clave;
    const herramienta = HERRAMIENTAS[activa];
    capaMaquina.classList.toggle('visible', descanso && capaMaquina.childElementCount > 0);
    capaMaquina.classList.toggle('sirviendo', activa === 'cafetera');
    capaJarra.querySelectorAll('.herramienta').forEach((grupo) => grupo.classList.toggle('activa', grupo.dataset.herramienta === activa));
    capaJarra.classList.toggle('visible', herramienta?.capa === 'adelante');
    if (herramienta && salidas[activa]) {
      actual.render.chorro({ tipo: herramienta.chorro, desde: salidas[activa].desde, color: paso.color, ancho: herramienta.ancho, separacion: salidas[activa].separacion });
    } else {
      actual.render.chorro(null);
    }
  }

  // El vapor se apaga a medida que la bebida se enfría; al servir vuelve a subir.
  function aplicarVapor() {
    if (actual.bebida.temperatura !== 'caliente') {
      capaVapor.style.setProperty('--calor', 0);
      return;
    }
    const { modo } = estado;
    const nivel = mostrado ?? estado.nivel;
    const intensidad = actual.bebida.efectos?.vapor ?? 1;
    const calor = nivel < 0.015 ? 0 : modo === 'vaciando' ? Math.pow(nivel, 0.6) : suave(0.08, 0.6, nivel) * 0.9;
    const valor = Math.round(calor * intensidad * 50) / 50;
    if (valor === calorMostrado) return;
    calorMostrado = valor;
    capaVapor.style.setProperty('--calor', valor);
    const vapor = capaVapor.querySelector('.vapor');
    if (vapor) vapor.dataset.volutas = String(Math.ceil(valor * 4));
  }

  function animarSorbo(ahora) {
    const t = (ahora - sorbo.inicio) / DURACION_SORBO;
    if (t >= 1) {
      sorbo = null;
      actual.render.inclinar(0, 0, 0);
      return;
    }
    const curva = Math.pow(Math.sin(Math.PI * t), 2);
    const giro = -2.6 * curva;
    const alza = 5 * curva;
    const vaiven = 1.5 * Math.sin(t * Math.PI * 3.2) * (1 - t);
    actual.render.inclinar(giro, alza, giro - vaiven);
    if (!sorbo.onda && t > 0.55) {
      sorbo.onda = true;
      actual.render.onda();
    }
  }

  // Se llama en cada cuadro mientras algo se mueve. nivel: nivel real del temporizador.
  function actualizar({ nivel, bloque, fase }, ahora = performance.now()) {
    const modo = bloque === 'foco' ? 'vaciando' : 'llenando';
    estado = { nivel, bloque, fase, modo };
    if (!actual) return;

    // Saltos bruscos (reiniciar, saltar, cambiar de bloque) se animan en medio segundo.
    if (mostrado === null) mostrado = nivel;
    else if (!transicion && Math.abs(nivel - mostrado) > 0.03 && fase !== 'corriendo') {
      transicion = { desde: mostrado, inicio: ahora };
    }
    if (transicion) {
      const t = Math.min(1, (ahora - transicion.inicio) / DURACION_SALTO);
      const facil = 1 - Math.pow(1 - t, 3);
      mostrado = transicion.desde + (nivel - transicion.desde) * facil;
      if (t >= 1) transicion = null;
    } else {
      mostrado = nivel;
    }

    if (sorbo) animarSorbo(ahora);
    else if (movimiento && !pausada && bloque === 'foco' && fase === 'corriendo' && nivel > 0.06 && ahora >= proximoSorbo) {
      sorbo = { inicio: ahora, onda: false };
      proximoSorbo = ahora + intervaloSorbo();
    }

    actual.render.fijarNivel(mostrado, modo);
    aplicarMaquinas();
    aplicarVapor();
  }

  function pausar(valor) {
    pausada = valor;
    contenedor.classList.toggle('pausada', valor);
    contenedor.querySelectorAll('svg').forEach((svg) => {
      if (valor) svg.pauseAnimations?.();
      else svg.unpauseAnimations?.();
    });
    if (valor && sorbo) {
      sorbo = null;
      actual.render.inclinar(0, 0, 0);
    }
  }

  return {
    mostrar,
    actualizar,
    pausar,
    // Cambio de tema: nueva luz y, en kawaii, carita. La bebida se vuelve a armar con el mismo nivel.
    cambiarTema({ carita = false } = {}) {
      conCarita = carita;
      if (actual) mostrar(actual.bebida, actual.escala);
    },
    // ¿Hay algo animándose aunque el temporizador esté quieto?
    animando: () => Boolean(transicion || sorbo),
    sorbo() {
      if (movimiento && !sorbo) sorbo = { inicio: performance.now(), onda: false };
    },
    bebidaActual: () => actual?.bebida,
    escalaActual: () => actual?.escala,
  };
}
