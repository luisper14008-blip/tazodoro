// Botones, pestañas de bloque, reloj y atajos de teclado.
import { t } from '../textos.js';
import { ICONOS } from './iconos.js';

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
  };

  el.reiniciar.innerHTML = ICONOS.reiniciar;
  el.saltar.innerHTML = ICONOS.saltar;
  el.ajustes.innerHTML = ICONOS.ajustes;
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

  // El reloj usa una celda por cifra para que los números no bailen con fuentes proporcionales.
  let relojActual = '';
  function pintarReloj(texto) {
    if (texto === relojActual) return;
    if (texto.length !== relojActual.length) {
      el.reloj.innerHTML = [...texto].map((c) => (c === ':' ? '<span class="dos-puntos">:</span>' : `<span class="cifra">${c}</span>`)).join('');
    } else {
      [...texto].forEach((c, i) => {
        if (c !== relojActual[i]) el.reloj.children[i].textContent = c;
      });
    }
    relojActual = texto;
  }

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
      pintarReloj(vista.reloj);
    },
    pintarReloj,
  };
}
