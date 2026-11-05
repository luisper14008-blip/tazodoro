// Botones, pestañas de bloque, reloj y atajos de teclado.
import { t } from '../textos.js';
import { ICONOS } from './iconos.js';
import { crearPintorReloj } from './reloj.js';

export function montarControles(raiz, acciones) {
  const $ = (selector) => raiz.querySelector(selector);
  const el = {
    app: raiz,
    bloques: [...raiz.querySelectorAll('.bloque')],
    principal: $('.boton-principal'),
    principalIcono: $('.boton-principal .principal-icono'),
    principalTexto: $('.boton-principal .principal-texto'),
    reiniciar: $('[data-accion="reiniciar"]'),
    saltar: $('[data-accion="saltar"]'),
    pedido: $('.pedido'),
    pedidoTexto: $('.pedido-texto'),
    estado: $('.estado-linea'),
    reloj: $('.reloj-cifras'),
    racha: $('.racha'),
    rachaNumero: $('.racha-numero'),
    ajustes: $('[data-accion="ajustes"]'),
    sonidos: $('[data-accion="sonidos"]'),
    tareas: $('[data-accion="tareas"]'),
    estadisticas: $('[data-accion="estadisticas"]'),
    tareaActiva: $('.tarea-activa'),
    tareaActivaTexto: $('.tarea-activa-texto'),
  };

  el.reiniciar.innerHTML = ICONOS.reiniciar;
  el.saltar.innerHTML = ICONOS.saltar;
  el.ajustes.innerHTML = ICONOS.ajustes;
  el.sonidos.innerHTML = ICONOS.musica;
  el.tareas.innerHTML = ICONOS.tareas;
  el.estadisticas.innerHTML = ICONOS.estadisticas;
  $('.tarea-activa-icono').innerHTML = ICONOS.diana;

  el.sonidos.addEventListener('click', () => acciones.sonidos(el.sonidos));
  el.tareas.addEventListener('click', () => acciones.tareas(el.tareas));
  el.estadisticas.addEventListener('click', () => acciones.estadisticas(el.estadisticas));
  el.racha.addEventListener('click', () => acciones.estadisticas(el.racha));
  el.tareaActiva.addEventListener('click', () => acciones.tareas(el.tareaActiva));
  $('.racha-icono').innerHTML = ICONOS.racha;
  $('.pedido-flecha').innerHTML = ICONOS.abajo;

  el.principal.addEventListener('click', () => acciones.alternar());
  el.reiniciar.addEventListener('click', () => acciones.reiniciar());
  el.saltar.addEventListener('click', () => acciones.saltar());
  el.bloques.forEach((boton) => boton.addEventListener('click', () => acciones.irA(boton.dataset.bloque)));
  el.pedido.addEventListener('click', () => acciones.pedido(el.pedido));
  el.ajustes.addEventListener('click', () => acciones.ajustes(el.ajustes));

  // Atajos: espacio, R y S. No interfieren al escribir ni con la activación nativa de botones.
  document.addEventListener('keydown', (evento) => {
    if (evento.defaultPrevented || evento.ctrlKey || evento.metaKey || evento.altKey || evento.repeat) return;
    if (document.querySelector('dialog[open]')) return;
    const objetivo = evento.target instanceof Element ? evento.target : document.body;
    if (objetivo.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return;
    const tecla = evento.key.toLowerCase();
    if (evento.code === 'Space' || tecla === ' ') {
      if (objetivo.closest('button, a, summary, [role="button"], [role="radio"]')) return;
      evento.preventDefault();
      acciones.alternar();
    } else if (tecla === 'r') {
      evento.preventDefault();
      acciones.reiniciar();
    } else if (tecla === 's') {
      evento.preventDefault();
      acciones.saltar();
    }
  });

  const pintarReloj = crearPintorReloj(el.reloj);

  let iconoActual = '';
  return {
    pintar(vista) {
      el.bloques.forEach((boton) => {
        const bloque = boton.dataset.bloque;
        boton.setAttribute('aria-pressed', String(bloque === vista.bloque));
        boton.querySelector('.contador').textContent = vista.conteos[bloque];
        boton.setAttribute('aria-label', t('bloques.contador', { bloque: t(`bloques.${bloque}`), n: vista.conteos[bloque] }));
      });
      el.principalTexto.textContent = vista.principalTexto;
      const icono = vista.corriendo ? 'pausa' : 'play';
      if (icono !== iconoActual) {
        el.principalIcono.innerHTML = ICONOS[icono];
        iconoActual = icono;
      }
      el.saltar.setAttribute('aria-label', vista.saltarTexto);
      el.saltar.title = vista.saltarTexto;
      el.pedidoTexto.textContent = vista.pedidoTexto;
      el.pedido.disabled = false;
      el.estado.textContent = vista.estadoTexto;
      el.rachaNumero.textContent = vista.racha;
      el.racha.setAttribute('aria-label', vista.rachaTexto);
      el.racha.title = vista.rachaTexto;
      el.app.dataset.bloque = vista.bloque;
      el.app.dataset.fase = vista.fase;
      el.tareaActiva.hidden = !vista.tareaTexto;
      el.app.classList.toggle('con-tarea', Boolean(vista.tareaTexto));
      if (vista.tareaTexto && el.tareaActivaTexto.textContent !== vista.tareaTexto) el.tareaActivaTexto.textContent = vista.tareaTexto;
      el.sonidos.dataset.sonando = String(vista.sonando && !vista.silencio);
      const iconoSonido = vista.silencio ? 'silencio' : 'musica';
      if (el.sonidos.dataset.icono !== iconoSonido) {
        el.sonidos.innerHTML = ICONOS[iconoSonido];
        el.sonidos.dataset.icono = iconoSonido;
        el.sonidos.setAttribute('aria-label', vista.textoSonidos);
        el.sonidos.title = vista.textoSonidos;
      }
      pintarReloj(vista.reloj);
    },
    pintarReloj,
  };
}
