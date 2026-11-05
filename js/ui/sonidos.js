// Panel de sonidos de ambiente: cada uno se enciende con su interruptor y tiene su volumen; abajo, silenciar todo.
import { t } from '../textos.js';
import { AMBIENTES } from '../audio/ambientes.js';
import { ICONOS } from './iconos.js';

export function montarSonidos(app, { datos, alCambiar }) {
  const dialogo = document.createElement('dialog');
  dialogo.className = 'dialogo dialogo-sonidos';
  dialogo.setAttribute('aria-labelledby', 'titulo-sonidos');
  dialogo.innerHTML = `
    <div class="dialogo-cuerpo">
      <header class="dialogo-cabecera">
        <h2 id="titulo-sonidos" class="dialogo-titulo">${t('sonidos.titulo')}</h2>
        <button type="button" class="boton-suave cerrar">${t('sonidos.cerrar')}</button>
      </header>
      <div class="lista-sonidos">
        ${AMBIENTES.map((id) => `
          <div class="fila-sonido" data-sonido="${id}">
            <label class="interruptor">
              <input type="checkbox" role="switch" data-control="activo">
              <span class="interruptor-pista" aria-hidden="true"></span>
              <span class="sonido-icono">${ICONOS[id]}</span>
              <span class="sonido-nombre">${t(`sonidos.${id}`)}</span>
            </label>
            <input type="range" min="0" max="1" step="0.05" data-control="volumen" aria-label="${t('sonidos.volumen', { sonido: t(`sonidos.${id}`).toLocaleLowerCase('es') })}">
          </div>`).join('')}
      </div>
      <label class="interruptor silencio-general">
        <input type="checkbox" role="switch" data-control="silencio">
        <span class="interruptor-pista" aria-hidden="true"></span>
        <span>${t('sonidos.silencio')}</span>
      </label>
      <p class="nota">${t('sonidos.ayuda')}</p>
    </div>`;
  app.append(dialogo);

  function llenar() {
    const sonidos = datos().ajustes.sonidos;
    dialogo.querySelectorAll('.fila-sonido').forEach((fila) => {
      const ajuste = sonidos[fila.dataset.sonido];
      fila.querySelector('[data-control="activo"]').checked = ajuste.activo;
      fila.querySelector('[data-control="volumen"]').value = ajuste.volumen;
    });
    dialogo.querySelector('[data-control="silencio"]').checked = sonidos.silencio;
  }

  dialogo.querySelectorAll('.fila-sonido').forEach((fila) => {
    const id = fila.dataset.sonido;
    fila.querySelector('[data-control="activo"]').addEventListener('change', (evento) => {
      datos().ajustes.sonidos[id].activo = evento.target.checked;
      alCambiar(id);
    });
    fila.querySelector('[data-control="volumen"]').addEventListener('input', (evento) => {
      const ajuste = datos().ajustes.sonidos[id];
      ajuste.volumen = Number(evento.target.value);
      // Subir el volumen de un sonido apagado lo enciende.
      if (!ajuste.activo && ajuste.volumen > 0) {
        ajuste.activo = true;
        fila.querySelector('[data-control="activo"]').checked = true;
      }
      alCambiar(id);
    });
  });
  dialogo.querySelector('[data-control="silencio"]').addEventListener('change', (evento) => {
    datos().ajustes.sonidos.silencio = evento.target.checked;
    alCambiar('silencio');
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
      llenar();
      dialogo.showModal();
    },
  };
}
