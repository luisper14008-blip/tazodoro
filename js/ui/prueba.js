// Panel del modo de prueba (?prueba=1): el tiempo corre 60 veces más rápido
// y un deslizador mueve el progreso del bloque a mano.
import { t } from '../textos.js';

export function montarPrueba(app, { temporizador, escena, alCambiar }) {
  const panel = document.createElement('aside');
  panel.className = 'panel-prueba';
  panel.setAttribute('aria-label', t('prueba.titulo'));
  panel.innerHTML = `
    <p class="prueba-titulo">${t('prueba.titulo')}</p>
    <p class="prueba-nota">${t('prueba.velocidad')}</p>
    <label for="prueba-progreso">${t('prueba.progreso')}</label>
    <input id="prueba-progreso" type="range" min="0" max="100" step="0.5" value="0">
    <div class="prueba-botones">
      <button type="button" class="boton-suave" data-prueba="terminar">${t('prueba.terminar')}</button>
      <button type="button" class="boton-suave" data-prueba="sorbo">${t('prueba.sorbo')}</button>
    </div>`;
  app.append(panel);

  const deslizador = panel.querySelector('input');
  let arrastrando = false;
  deslizador.addEventListener('pointerdown', () => {
    arrastrando = true;
  });
  window.addEventListener('pointerup', () => {
    arrastrando = false;
  });
  deslizador.addEventListener('input', () => {
    temporizador.fijarProgreso(Number(deslizador.value) / 100);
    alCambiar();
  });
  panel.querySelector('[data-prueba="terminar"]').addEventListener('click', () => {
    if (temporizador.estado().fase !== 'corriendo') temporizador.empezar();
    temporizador.fijarProgreso(1);
    temporizador.comprobar();
  });
  panel.querySelector('[data-prueba="sorbo"]').addEventListener('click', () => escena.sorbo());

  return {
    sincronizar(progreso) {
      if (arrastrando || document.activeElement === deslizador) return;
      const valor = (progreso * 100).toFixed(1);
      if (deslizador.value !== valor) deslizador.value = valor;
    },
  };
}

// Parámetros para capturas: ?prueba=1&bloque=corto&progreso=50&corriendo=1
export function aplicarParametros(temporizador) {
  const parametros = new URLSearchParams(location.search);
  const bloque = parametros.get('bloque');
  if (['foco', 'corto', 'largo'].includes(bloque)) temporizador.irA(bloque);
  const progreso = Number(parametros.get('progreso'));
  if (parametros.has('progreso') && Number.isFinite(progreso)) temporizador.fijarProgreso(progreso / 100);
  if (parametros.get('corriendo') === '1') temporizador.empezar();
}
