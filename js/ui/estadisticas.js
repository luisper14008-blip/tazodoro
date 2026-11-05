// Panel de estadísticas: tazas y minutos de hoy, racha, gráfico de 7 días, bebida favorita,
// descargar los datos y borrar historial y tareas.
import { t } from '../textos.js';
import { ICONOS } from './iconos.js';
import { confirmar } from './dialogo.js';
import { resumen } from '../estadisticas.js';
import { nombreBebida } from '../nombres.js';
import { obtenerBebida } from '../bebidas/catalogo.js';
import { crearBebida } from '../bebidas/renderizador.js';
import { claveDia } from '../util/tiempo.js';

const NS = 'http://www.w3.org/2000/svg';
const ALTO = 190;
const ABAJO = 28;
const ARRIBA = 26;

const fechaDe = (clave) => {
  const [a, m, d] = clave.split('-').map(Number);
  return new Date(a, m - 1, d);
};
const diaCorto = new Intl.DateTimeFormat('es', { weekday: 'short' });
const diaLargo = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' });

// Barras finas, punta redondeada de 4 px apoyada en la línea base; etiqueta directa solo en hoy.
// Se dibuja al ancho real del panel para que las letras no se achiquen en el celular.
function grafico(semana, ancho) {
  const maximo = Math.max(25, ...semana.map((d) => d.minutos));
  const paso = ancho / semana.length;
  const anchoBarra = Math.min(36, paso * 0.46);
  const altoUtil = ALTO - ABAJO - ARRIBA;
  const barras = semana.map((d, i) => {
    const x = i * paso + (paso - anchoBarra) / 2;
    const alto = d.minutos > 0 ? Math.max(4, (d.minutos / maximo) * altoUtil) : 0;
    const y = ALTO - ABAJO - alto;
    const r = Math.min(4, alto / 2, anchoBarra / 2);
    const forma = alto > 0
      ? `<path class="barra-dia${d.hoy ? ' barra-dia-hoy' : ''}" d="M${x} ${ALTO - ABAJO}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + anchoBarra - r}Q${x + anchoBarra} ${y} ${x + anchoBarra} ${y + r}V${ALTO - ABAJO}Z"/>`
      : '';
    const etiqueta = d.hoy && d.minutos > 0 ? `<text class="valor-hoy" x="${x + anchoBarra / 2}" y="${y - 8}" text-anchor="middle">${t('tamanos.minutos', { n: d.minutos })}</text>` : '';
    return `<g class="columna" data-i="${i}">
      <rect class="zona" x="${i * paso}" y="0" width="${paso}" height="${ALTO}" fill="transparent"/>
      ${forma}${etiqueta}
      <text class="dia${d.hoy ? ' dia-hoy' : ''}" x="${x + anchoBarra / 2}" y="${ALTO - 8}" text-anchor="middle">${diaCorto.format(fechaDe(d.clave))}</text>
    </g>`;
  });
  const vacia = semana.every((d) => d.minutos === 0)
    ? `<text class="grafico-vacio" x="${ancho / 2}" y="${(ALTO - ABAJO) / 2 + 6}" text-anchor="middle">${t('estadisticas.semanaVacia')}</text>`
    : '';
  return `<svg viewBox="0 0 ${ancho} ${ALTO}" aria-hidden="true" focusable="false">
    <line class="linea-base" x1="0" x2="${ancho}" y1="${ALTO - ABAJO + 0.5}" y2="${ALTO - ABAJO + 0.5}"/>
    ${vacia}${barras.join('')}
  </svg>`;
}

function miniatura(id, carita) {
  const render = crearBebida(obtenerBebida(id), { escala: 1, movimiento: false, semilla: 7, carita });
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', render.encuadre(12));
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = render.markup;
  render.montar(svg);
  render.fijarNivel(1, 'vaciando');
  return svg;
}

export function montarEstadisticas(app, { datos, alBorrar, carita = () => false }) {
  const dialogo = document.createElement('dialog');
  dialogo.className = 'dialogo dialogo-estadisticas';
  dialogo.setAttribute('aria-labelledby', 'titulo-estadisticas');
  dialogo.innerHTML = `
    <div class="dialogo-cuerpo">
      <header class="dialogo-cabecera">
        <h2 id="titulo-estadisticas" class="dialogo-titulo">${t('estadisticas.titulo')}</h2>
        <button type="button" class="boton-suave cerrar">${t('estadisticas.cerrar')}</button>
      </header>
      <div class="cifras">
        <p class="cifra-panel"><span class="cifra-valor" data-cifra="tazas"></span><span class="cifra-etiqueta">${t('estadisticas.tazasHoy')}</span></p>
        <p class="cifra-panel"><span class="cifra-valor" data-cifra="minutos"></span><span class="cifra-etiqueta">${t('estadisticas.minutosHoy')}</span></p>
        <p class="cifra-panel"><span class="cifra-valor" data-cifra="racha"></span><span class="cifra-etiqueta">${t('estadisticas.racha')}</span></p>
      </div>
      <section class="bloque-grafico" aria-labelledby="titulo-semana">
        <h3 id="titulo-semana">${t('estadisticas.semana')}</h3>
        <div class="grafico" role="img"></div>
        <div class="globo-grafico" hidden></div>
        <table class="visualmente-oculto"><caption>${t('estadisticas.semana')}</caption><tbody></tbody></table>
      </section>
      <section class="favorita" aria-labelledby="titulo-favorita">
        <div class="favorita-ilustracion"></div>
        <div>
          <h3 id="titulo-favorita">${t('estadisticas.favorita')}</h3>
          <p class="favorita-texto"></p>
          <p class="nota favorita-total"></p>
        </div>
      </section>
      <div class="acciones-datos">
        <button type="button" class="boton-suave exportar"><span class="icono-boton">${ICONOS.descargar}</span>${t('estadisticas.exportar')}</button>
        <button type="button" class="boton-texto borrar">${t('estadisticas.borrar')}</button>
      </div>
    </div>`;
  app.append(dialogo);

  const contenedor = dialogo.querySelector('.grafico');
  const globo = dialogo.querySelector('.globo-grafico');
  let semanaActual = [];

  function pintar() {
    const r = resumen(datos().registros);
    semanaActual = r.semana;
    dialogo.querySelector('[data-cifra="tazas"]').textContent = r.hoy.tazas;
    dialogo.querySelector('[data-cifra="minutos"]').textContent = r.hoy.minutos;
    dialogo.querySelector('[data-cifra="racha"]').textContent = r.racha;
    contenedor.innerHTML = grafico(r.semana, Math.max(260, Math.round(contenedor.clientWidth) || 560));
    const lectura = r.semana.map((d) => t('estadisticas.dia', { dia: diaLargo.format(fechaDe(d.clave)), n: d.minutos })).join(', ');
    contenedor.setAttribute('aria-label', t('estadisticas.grafico', { datos: lectura }));
    dialogo.querySelector('tbody').innerHTML = r.semana.map((d) => `<tr><th scope="row">${diaLargo.format(fechaDe(d.clave))}</th><td>${t('tamanos.minutos', { n: d.minutos })}</td></tr>`).join('');
    const ilustracion = dialogo.querySelector('.favorita-ilustracion');
    if (r.favorita) {
      ilustracion.replaceChildren(miniatura(r.favorita.id, carita()));
      dialogo.querySelector('.favorita-texto').textContent = t('estadisticas.favoritaTexto', { bebida: nombreBebida(r.favorita.id), n: r.favorita.tazas });
    } else {
      ilustracion.replaceChildren();
      dialogo.querySelector('.favorita-texto').textContent = t('estadisticas.sinFavorita');
    }
    dialogo.querySelector('.favorita-total').textContent = r.total ? t('estadisticas.total', { n: r.total }) : '';
  }

  // Detalle al pasar el puntero por cada día.
  contenedor.addEventListener('pointermove', (evento) => {
    const columna = evento.target.closest('.columna');
    if (!columna) return;
    const d = semanaActual[Number(columna.dataset.i)];
    globo.textContent = `${diaLargo.format(fechaDe(d.clave))}: ${t('tamanos.minutos', { n: d.minutos })}`;
    globo.hidden = false;
    const caja = contenedor.getBoundingClientRect();
    const zona = columna.getBoundingClientRect();
    const base = dialogo.querySelector('.bloque-grafico').getBoundingClientRect();
    // Centrado en el día, pero sin salirse del panel en las orillas.
    const medio = globo.offsetWidth / 2;
    globo.style.left = `${Math.min(base.width - medio, Math.max(medio, zona.left + zona.width / 2 - base.left))}px`;
    globo.style.top = `${caja.top - base.top - 6}px`;
    contenedor.querySelectorAll('.columna').forEach((c) => c.classList.toggle('resaltada', c === columna));
  });
  contenedor.addEventListener('pointerleave', () => {
    globo.hidden = true;
    contenedor.querySelectorAll('.columna').forEach((c) => c.classList.remove('resaltada'));
  });

  dialogo.querySelector('.exportar').addEventListener('click', () => {
    const contenido = JSON.stringify({ app: 'Tazodoro', exportado: new Date().toISOString(), datos: datos() }, null, 2);
    const url = URL.createObjectURL(new Blob([contenido], { type: 'application/json' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `tazodoro-${claveDia()}.json`;
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });

  dialogo.querySelector('.borrar').addEventListener('click', async () => {
    const seguro = await confirmar({ titulo: t('estadisticas.borrarTitulo'), texto: t('estadisticas.borrarTexto'), aceptar: t('estadisticas.borrarSi'), cancelar: t('estadisticas.borrarNo') });
    if (!seguro) return;
    alBorrar();
    pintar();
  });

  dialogo.querySelector('.cerrar').addEventListener('click', () => dialogo.close());
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });
  let origen = null;
  dialogo.addEventListener('close', () => origen?.focus());

  return {
    abrir(boton) {
      origen = boton;
      dialogo.showModal();
      pintar();
    },
    pintar: () => dialogo.open && pintar(),
  };
}
