// La carta: elegir bebida (tarjetas con mini ilustración, nombre y frase) y tamaño de la taza.
// Las miniaturas se dibujan con el mismo renderizador, quietas y llenas, la primera vez que se abre.
import { t } from '../textos.js';
import { ICONOS } from './iconos.js';
import { TAMANOS, nombreTamano, nombreBebida } from '../nombres.js';
import { CARTA, obtenerBebida, escalaPorMinutos } from '../bebidas/catalogo.js';
import { crearBebida } from '../bebidas/renderizador.js';
import { semillaDeTexto } from '../util/azar.js';

const NS = 'http://www.w3.org/2000/svg';

function miniatura(id) {
  const render = crearBebida(obtenerBebida(id), { escala: 1, movimiento: false, semilla: semillaDeTexto(id) % 1000 });
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', render.encuadre(14));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = render.markup;
  render.montar(svg);
  render.fijarNivel(1, 'vaciando');
  return svg;
}

export function montarCarta(app, { datos, bloqueado, alElegirBebida, alElegirTamano }) {
  const dialogo = document.createElement('dialog');
  dialogo.className = 'dialogo dialogo-carta';
  dialogo.setAttribute('aria-labelledby', 'titulo-carta');
  dialogo.innerHTML = `
    <div class="dialogo-cuerpo">
      <header class="dialogo-cabecera">
        <h2 id="titulo-carta" class="dialogo-titulo">${t('carta.titulo')}</h2>
        <button type="button" class="boton-suave cerrar">${t('carta.cerrar')}</button>
      </header>
      <section class="carta-tamanos" aria-labelledby="carta-tamano">
        <h3 id="carta-tamano" class="carta-seccion">${t('carta.tamano')}</h3>
        <div class="opciones-tamano" role="radiogroup" aria-labelledby="carta-tamano">
          ${TAMANOS.map((tamano) => `
            <button type="button" role="radio" class="opcion-tamano" data-tamano="${tamano}">
              <span class="opcion-icono"></span><span class="opcion-nombre"></span><span class="opcion-minutos"></span>
            </button>`).join('')}
        </div>
        <div class="personalizada">
          <label for="minutos-personalizada" class="campo-etiqueta">${t('tamanos.personalizadaEtiqueta')}</label>
          <div class="personalizada-fila">
            <input id="minutos-personalizada" type="range" min="5" max="90" step="1">
            <output for="minutos-personalizada"></output>
          </div>
        </div>
        <p class="nota nota-bloqueo">${t('tamanos.bloqueado')}</p>
      </section>
      ${CARTA.map(({ seccion, bebidas }) => `
        <section class="carta-grupo" aria-labelledby="carta-${seccion}">
          <h3 id="carta-${seccion}" class="carta-seccion">${t(`carta.secciones.${seccion}`)}</h3>
          <div class="carta-tarjetas">
            ${bebidas.map((id) => `
              <button type="button" class="tarjeta-bebida" data-bebida="${id}" aria-pressed="false">
                <span class="tarjeta-ilustracion"></span>
                <span class="tarjeta-nombre">${nombreBebida(id)}</span>
                <span class="tarjeta-frase">${t(`bebidas.${id}.frase`)}</span>
              </button>`).join('')}
          </div>
        </section>`).join('')}
      <p class="nota carta-ayuda">${t('carta.ayuda')}</p>
    </div>`;
  app.append(dialogo);

  const tarjetas = [...dialogo.querySelectorAll('.tarjeta-bebida')];
  const opciones = [...dialogo.querySelectorAll('.opcion-tamano')];
  const deslizador = dialogo.querySelector('#minutos-personalizada');
  const salida = dialogo.querySelector('output');
  let dibujadas = false;
  let origen = null;

  function pintar() {
    const d = datos();
    const bloqueo = bloqueado();
    dialogo.classList.toggle('bloqueado', bloqueo);
    tarjetas.forEach((tarjeta) => tarjeta.setAttribute('aria-pressed', String(tarjeta.dataset.bebida === d.seleccion.bebida)));
    opciones.forEach((boton) => {
      const tamano = boton.dataset.tamano;
      const minutos = d.ajustes.minutos[tamano];
      const elegido = d.seleccion.tamano === tamano;
      boton.setAttribute('aria-checked', String(elegido));
      boton.tabIndex = elegido ? 0 : -1;
      boton.disabled = bloqueo && !elegido;
      boton.querySelector('.opcion-icono').innerHTML = ICONOS.tamano(escalaPorMinutos(minutos) * 0.86);
      boton.querySelector('.opcion-nombre').textContent = nombreTamano(d.seleccion.bebida, tamano);
      boton.querySelector('.opcion-minutos').textContent = t('tamanos.minutos', { n: minutos });
    });
    deslizador.value = d.ajustes.minutos.personalizada;
    deslizador.disabled = bloqueo;
    salida.textContent = t('tamanos.minutos', { n: d.ajustes.minutos.personalizada });
    dialogo.querySelector('.personalizada').hidden = d.seleccion.tamano !== 'personalizada';
  }

  function elegirTamano(boton) {
    if (bloqueado()) return false;
    alElegirTamano(boton.dataset.tamano);
    pintar();
    return true;
  }

  opciones.forEach((boton, i) => {
    boton.addEventListener('click', () => elegirTamano(boton));
    boton.addEventListener('keydown', (evento) => {
      const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[evento.key];
      if (!paso) return;
      evento.preventDefault();
      const siguiente = opciones[(i + paso + opciones.length) % opciones.length];
      if (!siguiente.disabled && elegirTamano(siguiente)) siguiente.focus();
    });
  });

  deslizador.addEventListener('input', () => {
    salida.textContent = t('tamanos.minutos', { n: deslizador.value });
    alElegirTamano('personalizada', Number(deslizador.value));
    pintar();
  });

  tarjetas.forEach((tarjeta) => {
    tarjeta.addEventListener('click', () => {
      alElegirBebida(tarjeta.dataset.bebida);
      pintar();
      dialogo.close();
    });
  });

  dialogo.querySelector('.cerrar').addEventListener('click', () => dialogo.close());
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });
  dialogo.addEventListener('close', () => {
    origen?.setAttribute('aria-expanded', 'false');
    origen?.focus();
  });

  return {
    abrir(boton) {
      origen = boton;
      if (!dibujadas) {
        tarjetas.forEach((tarjeta) => tarjeta.querySelector('.tarjeta-ilustracion').append(miniatura(tarjeta.dataset.bebida)));
        dibujadas = true;
      }
      pintar();
      boton?.setAttribute('aria-expanded', 'true');
      dialogo.showModal();
      dialogo.querySelector('.tarjeta-bebida[aria-pressed="true"]')?.focus();
    },
    pintar: () => dialogo.open && pintar(),
  };
}
