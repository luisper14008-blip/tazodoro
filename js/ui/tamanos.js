// Ventanita para elegir el tamaño de la taza (los minutos de concentración).
import { t } from '../textos.js';
import { ICONOS } from './iconos.js';
import { TAMANOS, nombreTamano } from '../nombres.js';
import { escalaPorMinutos } from '../bebidas/catalogo.js';

export function montarTamanos(app, { datos, alElegir, bloqueado }) {
  const pop = document.createElement('div');
  pop.className = 'popover popover-tamanos';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', t('tamanos.titulo'));
  pop.hidden = true;
  pop.innerHTML = `
    <p class="popover-titulo">${t('tamanos.titulo')}</p>
    <div class="opciones-tamano" role="radiogroup" aria-label="${t('tamanos.titulo')}">
      ${TAMANOS.map((tamano) => `
        <button type="button" role="radio" class="opcion-tamano" data-tamano="${tamano}">
          <span class="opcion-icono"></span>
          <span class="opcion-nombre"></span>
          <span class="opcion-minutos"></span>
        </button>`).join('')}
    </div>
    <div class="personalizada">
      <label for="minutos-personalizada">${t('tamanos.personalizadaEtiqueta')}</label>
      <div class="personalizada-fila">
        <input id="minutos-personalizada" type="range" min="5" max="90" step="1">
        <output for="minutos-personalizada"></output>
      </div>
    </div>
    <p class="nota-bloqueo">${t('tamanos.bloqueado')}</p>`;
  app.append(pop);

  const opciones = [...pop.querySelectorAll('.opcion-tamano')];
  const deslizador = pop.querySelector('input');
  const salida = pop.querySelector('output');
  let ancla = null;

  function pintar() {
    const d = datos();
    const bloqueo = bloqueado();
    pop.classList.toggle('bloqueado', bloqueo);
    opciones.forEach((boton) => {
      const tamano = boton.dataset.tamano;
      const minutos = d.ajustes.minutos[tamano];
      const elegido = d.seleccion.tamano === tamano;
      boton.setAttribute('aria-checked', String(elegido));
      boton.tabIndex = elegido ? 0 : -1;
      boton.disabled = bloqueo && !elegido;
      boton.querySelector('.opcion-icono').innerHTML = ICONOS.tamano(escalaPorMinutos(minutos) * 0.95);
      boton.querySelector('.opcion-nombre').textContent = nombreTamano(d.seleccion.bebida, tamano);
      boton.querySelector('.opcion-minutos').textContent = t('tamanos.minutos', { n: minutos });
    });
    deslizador.value = d.ajustes.minutos.personalizada;
    deslizador.disabled = bloqueo;
    salida.textContent = t('tamanos.minutos', { n: d.ajustes.minutos.personalizada });
    pop.querySelector('.personalizada').hidden = d.seleccion.tamano !== 'personalizada';
  }

  function ubicar() {
    if (!ancla) return;
    const caja = ancla.getBoundingClientRect();
    const base = app.getBoundingClientRect();
    const ancho = pop.offsetWidth;
    const izquierda = Math.min(Math.max(12, caja.left + caja.width / 2 - ancho / 2 - base.left), base.width - ancho - 12);
    pop.style.left = `${izquierda}px`;
    pop.style.top = `${caja.bottom - base.top + 8}px`;
  }

  function cerrar(devolverFoco = true) {
    if (pop.hidden) return;
    pop.hidden = true;
    ancla?.setAttribute('aria-expanded', 'false');
    if (devolverFoco) ancla?.focus();
  }

  function abrir(boton) {
    ancla = boton;
    pintar();
    pop.hidden = false;
    boton.setAttribute('aria-expanded', 'true');
    ubicar();
    (opciones.find((o) => o.getAttribute('aria-checked') === 'true') || opciones[0]).focus();
  }

  function elegir(boton) {
    if (bloqueado()) return false;
    alElegir(boton.dataset.tamano);
    pintar();
    return true;
  }

  opciones.forEach((boton, i) => {
    boton.addEventListener('click', () => {
      if (elegir(boton) && boton.dataset.tamano !== 'personalizada') cerrar();
    });
    // Flechas: eligen sin cerrar, como un grupo de radio.
    boton.addEventListener('keydown', (evento) => {
      const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[evento.key];
      if (!paso) return;
      evento.preventDefault();
      const siguiente = opciones[(i + paso + opciones.length) % opciones.length];
      if (!siguiente.disabled && elegir(siguiente)) siguiente.focus();
    });
  });

  deslizador.addEventListener('input', () => {
    salida.textContent = t('tamanos.minutos', { n: deslizador.value });
    alElegir('personalizada', Number(deslizador.value));
    pintar();
  });

  document.addEventListener('pointerdown', (evento) => {
    if (!pop.hidden && !pop.contains(evento.target) && !ancla?.contains(evento.target)) cerrar(false);
  });
  pop.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') {
      evento.stopPropagation();
      cerrar();
    }
  });
  window.addEventListener('resize', ubicar);

  return {
    alternar: (boton) => (pop.hidden ? abrir(boton) : cerrar()),
    cerrar,
    pintar: () => !pop.hidden && pintar(),
  };
}
