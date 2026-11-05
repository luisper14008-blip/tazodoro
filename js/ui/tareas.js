// Panel lateral de tareas: agregar, editar, completar, elegir la activa, reordenar y borrar.
// Reordenar: arrastrando el asa (mouse o dedo) o con las flechas del teclado sobre el asa.
import { t } from '../textos.js';
import { ICONOS } from './iconos.js';
import { anunciar } from './avisos.js';
import { agregarTarea, editarTarea, completarTarea, elegirActiva, borrarTarea, moverTarea, MAX_TAZAS } from '../tareas.js';

// Lista vacía: una comanda de cafetería con una tacita al lado.
const COMANDA = `<svg class="tareas-ilustracion" viewBox="0 0 64 68" aria-hidden="true" focusable="false">
  <path class="papel" d="M16 6h32a2 2 0 0 1 2 2v50l-4.5-3-4.5 3-4.5-3-4.5 3-4.5-3-4.5 3-4.5-3-4.5 3V8a2 2 0 0 1 2-2z"/>
  <rect class="casilla" x="19" y="15" width="6" height="6" rx="1.5"/><path class="visto" d="M20.2 18.1l1.6 1.6 2.8-3.3"/><path class="renglon" d="M29 18h15"/>
  <rect class="casilla" x="19" y="26" width="6" height="6" rx="1.5"/><path class="visto" d="M20.2 29.1l1.6 1.6 2.8-3.3"/><path class="renglon" d="M29 29h11"/>
  <rect class="casilla" x="19" y="37" width="6" height="6" rx="1.5"/><path class="renglon" d="M29 40h14"/>
  <path class="vaporcito" d="M48.5 46.5c-1 1.2 1 2.2 0 3.6M52.5 46.5c-1 1.2 1 2.2 0 3.6"/>
  <path class="taza" d="M44 52.5h13v3.6a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path class="asa" d="M57 54.2h1.1a2.3 2.3 0 0 1 0 4.6h-1.6"/>
  <path class="platito" d="M41.5 64h19"/>
</svg>`;

const escapar = (texto) => texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function montarTareas(app, { datos, alCambiar }) {
  const dialogo = document.createElement('dialog');
  dialogo.className = 'dialogo panel-lateral dialogo-tareas';
  dialogo.setAttribute('aria-labelledby', 'titulo-tareas');
  dialogo.innerHTML = `
    <div class="dialogo-cuerpo">
      <header class="dialogo-cabecera">
        <h2 id="titulo-tareas" class="dialogo-titulo">${t('tareas.titulo')}</h2>
        <button type="button" class="boton-suave cerrar">${t('tareas.cerrar')}</button>
      </header>
      <form class="nueva-tarea">
        <label class="campo campo-ancho">
          <span class="campo-etiqueta">${t('tareas.nueva')}</span>
          <input type="text" name="texto" maxlength="120" autocomplete="off" placeholder="${t('tareas.ejemplo')}" class="entrada-texto">
        </label>
        <label class="campo">
          <span class="campo-etiqueta">${t('tareas.estimadas')}</span>
          <span class="entrada-numero"><input type="number" name="estimadas" min="1" max="${MAX_TAZAS}" value="1" inputmode="numeric"></span>
        </label>
        <button type="submit" class="boton-acento">${t('tareas.agregar')}</button>
      </form>
      <p class="nota resumen-tareas" aria-live="polite"></p>
      <ol class="lista-tareas"></ol>
      <div class="tareas-vacio">${COMANDA}<p>${t('tareas.vacio')}</p></div>
    </div>`;
  app.append(dialogo);

  const lista = dialogo.querySelector('.lista-tareas');
  const formulario = dialogo.querySelector('.nueva-tarea');
  let editando = null;

  function cambio(enfocar) {
    alCambiar();
    pintar();
    if (enfocar) dialogo.querySelector(enfocar)?.focus();
  }

  function filaTarea(tarea, activa) {
    const nombre = escapar(tarea.texto);
    if (editando === tarea.id) {
      return `<li class="tarea editando" data-id="${tarea.id}">
        <form class="editar-tarea">
          <input type="text" name="texto" value="${nombre}" maxlength="120" class="entrada-texto" aria-label="${t('tareas.nueva')}">
          <span class="entrada-numero"><input type="number" name="estimadas" min="1" max="${MAX_TAZAS}" value="${tarea.estimadas}" aria-label="${t('tareas.estimadas')}"></span>
          <button type="submit" class="boton-acento">${t('tareas.guardar')}</button>
          <button type="button" class="boton-suave" data-accion="cancelar">${t('tareas.cancelar')}</button>
        </form>
      </li>`;
    }
    return `<li class="tarea${tarea.completa ? ' completa' : ''}${activa ? ' activa' : ''}" data-id="${tarea.id}">
      <button type="button" class="asa-tarea" data-accion="mover" aria-label="${escapar(t('tareas.mover', { tarea: tarea.texto }))}">${ICONOS.asa}</button>
      <label class="marca-tarea">
        <input type="checkbox" data-accion="completar" ${tarea.completa ? 'checked' : ''} aria-label="${escapar(t('tareas.completar', { tarea: tarea.texto }))}">
        <span class="marca-caja" aria-hidden="true"></span>
      </label>
      <span class="tarea-texto"><span class="tarea-nombre">${nombre}</span><span class="tarea-tazas">${t('tareas.tazas', { hechas: tarea.hechas, estimadas: tarea.estimadas })}</span></span>
      <button type="button" class="boton-mini" data-accion="activar" aria-pressed="${activa}" ${tarea.completa ? 'disabled' : ''} title="${t(activa ? 'tareas.activa' : 'tareas.activar')}" aria-label="${t(activa ? 'tareas.activa' : 'tareas.activar')}">${ICONOS.diana}</button>
      <button type="button" class="boton-mini" data-accion="editar" aria-label="${escapar(t('tareas.editar', { tarea: tarea.texto }))}">${ICONOS.lapiz}</button>
      <button type="button" class="boton-mini" data-accion="borrar" aria-label="${escapar(t('tareas.borrar', { tarea: tarea.texto }))}">${ICONOS.papelera}</button>
    </li>`;
  }

  function pintar() {
    const d = datos();
    lista.innerHTML = d.tareas.map((tarea) => filaTarea(tarea, tarea.id === d.tareaActiva && !tarea.completa)).join('');
    const hechas = d.tareas.filter((tarea) => tarea.completa).length;
    dialogo.querySelector('.resumen-tareas').textContent = d.tareas.length ? t('tareas.resumen', { hechas, total: d.tareas.length }) : '';
    dialogo.querySelector('.tareas-vacio').hidden = d.tareas.length > 0;
    if (editando) dialogo.querySelector('.editar-tarea input[name="texto"]')?.focus();
  }

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const texto = formulario.texto.value;
    if (!agregarTarea(datos(), texto, formulario.estimadas.value)) return;
    formulario.texto.value = '';
    formulario.estimadas.value = 1;
    cambio();
    formulario.texto.focus();
  });

  lista.addEventListener('change', (evento) => {
    if (evento.target.dataset.accion !== 'completar') return;
    const id = evento.target.closest('.tarea').dataset.id;
    completarTarea(datos(), id, evento.target.checked);
    cambio(`.tarea[data-id="${id}"] [data-accion="completar"]`);
  });

  lista.addEventListener('click', (evento) => {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;
    const id = boton.closest('.tarea').dataset.id;
    const accion = boton.dataset.accion;
    if (accion === 'activar') {
      elegirActiva(datos(), id);
      cambio(`.tarea[data-id="${id}"] [data-accion="activar"]`);
    } else if (accion === 'editar') {
      editando = id;
      pintar();
    } else if (accion === 'cancelar') {
      editando = null;
      pintar();
      dialogo.querySelector(`.tarea[data-id="${id}"] [data-accion="editar"]`)?.focus();
    } else if (accion === 'borrar') {
      const indice = datos().tareas.findIndex((tarea) => tarea.id === id);
      borrarTarea(datos(), id);
      cambio();
      const siguiente = lista.children[Math.min(indice, lista.children.length - 1)];
      (siguiente?.querySelector('[data-accion="borrar"]') ?? formulario.texto).focus();
    }
  });

  lista.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const form = evento.target;
    const id = form.closest('.tarea').dataset.id;
    editarTarea(datos(), id, { texto: form.texto.value, estimadas: form.estimadas.value });
    editando = null;
    cambio(`.tarea[data-id="${id}"] [data-accion="editar"]`);
  });

  lista.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && editando) {
      evento.preventDefault();
      evento.stopPropagation();
      const id = editando;
      editando = null;
      pintar();
      dialogo.querySelector(`.tarea[data-id="${id}"] [data-accion="editar"]`)?.focus();
      return;
    }
    const asa = evento.target.closest('.asa-tarea');
    const paso = { ArrowUp: -1, ArrowDown: 1 }[evento.key];
    if (!asa || !paso) return;
    evento.preventDefault();
    const id = asa.closest('.tarea').dataset.id;
    const actual = datos().tareas.findIndex((tarea) => tarea.id === id);
    const nuevo = moverTarea(datos(), id, actual + paso);
    if (nuevo === actual) return;
    cambio(`.tarea[data-id="${id}"] .asa-tarea`);
    anunciar(t('tareas.movida', { tarea: datos().tareas[nuevo].texto, n: nuevo + 1 }));
  });

  // Arrastrar con mouse o dedo: la fila sigue al puntero y las demás se corren para hacerle lugar.
  lista.addEventListener('pointerdown', (evento) => {
    const asa = evento.target.closest('.asa-tarea');
    if (!asa || evento.button > 0) return;
    evento.preventDefault();
    const fila = asa.closest('.tarea');
    const filas = [...lista.children];
    const desde = filas.indexOf(fila);
    const cajas = filas.map((f) => f.getBoundingClientRect());
    const alto = cajas[desde].height + 8;
    const inicio = evento.clientY;
    let destino = desde;
    asa.setPointerCapture(evento.pointerId);
    fila.classList.add('arrastrando');

    const mover = (e) => {
      const dy = e.clientY - inicio;
      fila.style.transform = `translateY(${dy}px)`;
      const centro = cajas[desde].top + cajas[desde].height / 2 + dy;
      destino = cajas.reduce((indice, caja, i) => (centro > caja.top + caja.height / 2 ? i : indice), 0);
      if (centro < cajas[0].top + cajas[0].height / 2) destino = 0;
      filas.forEach((f, i) => {
        if (f === fila) return;
        const corre = desde < destino && i > desde && i <= destino ? -alto : desde > destino && i < desde && i >= destino ? alto : 0;
        f.style.transform = corre ? `translateY(${corre}px)` : '';
      });
    };
    const soltar = () => {
      asa.removeEventListener('pointermove', mover);
      asa.removeEventListener('pointerup', soltar);
      asa.removeEventListener('pointercancel', soltar);
      filas.forEach((f) => { f.style.transform = ''; });
      fila.classList.remove('arrastrando');
      if (destino !== desde) {
        moverTarea(datos(), fila.dataset.id, destino);
        cambio(`.tarea[data-id="${fila.dataset.id}"] .asa-tarea`);
      }
    };
    asa.addEventListener('pointermove', mover);
    asa.addEventListener('pointerup', soltar);
    asa.addEventListener('pointercancel', soltar);
  });

  dialogo.querySelector('.cerrar').addEventListener('click', () => dialogo.close());
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });
  let origen = null;
  dialogo.addEventListener('close', () => {
    editando = null;
    origen?.focus();
  });

  return {
    abrir(boton) {
      origen = boton;
      pintar();
      dialogo.showModal();
      formulario.texto.focus();
    },
    // Mientras se edita una tarea no se repinta (se perdería lo escrito).
    pintar: () => dialogo.open && !editando && pintar(),
  };
}
