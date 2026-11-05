// Diálogo de ajustes: tiempos, inicio automático, avisos y tema. Los cambios se aplican al instante.
import { t } from '../textos.js';
import { AJUSTES_INICIALES } from '../estado.js';
import { permisoAvisos } from './avisos.js';

const CAMPOS_TIEMPO = [
  { llave: 'minutos.pequena', etiqueta: 'ajustes.tazaPequena', min: 5, max: 90, unidad: 'ajustes.unidadMinutos' },
  { llave: 'minutos.mediana', etiqueta: 'ajustes.tazaMediana', min: 5, max: 90, unidad: 'ajustes.unidadMinutos' },
  { llave: 'minutos.grande', etiqueta: 'ajustes.tazaGrande', min: 5, max: 90, unidad: 'ajustes.unidadMinutos' },
  { llave: 'descansoCorto', etiqueta: 'ajustes.descansoCorto', min: 1, max: 30, unidad: 'ajustes.unidadMinutos' },
  { llave: 'descansoLargo', etiqueta: 'ajustes.descansoLargo', min: 5, max: 60, unidad: 'ajustes.unidadMinutos' },
  { llave: 'largoCada', etiqueta: 'ajustes.largoCada', min: 2, max: 8, unidad: 'ajustes.unidadTazas' },
];

const leer = (objeto, llave) => llave.split('.').reduce((nodo, parte) => nodo?.[parte], objeto);
function escribir(objeto, llave, valor) {
  const partes = llave.split('.');
  const ultima = partes.pop();
  partes.reduce((nodo, parte) => nodo[parte], objeto)[ultima] = valor;
}

const interruptor = (llave, etiqueta) => `
  <label class="interruptor">
    <input type="checkbox" role="switch" data-llave="${llave}">
    <span class="interruptor-pista" aria-hidden="true"></span>
    <span>${t(etiqueta)}</span>
  </label>`;

export function montarAjustes(app, { datos, enCurso, alCambiar, probarCampanita, pedirPermiso }) {
  const dialogo = document.createElement('dialog');
  dialogo.className = 'dialogo dialogo-ajustes';
  dialogo.setAttribute('aria-labelledby', 'titulo-ajustes');
  dialogo.innerHTML = `
    <div class="dialogo-cuerpo">
      <header class="dialogo-cabecera">
        <h2 id="titulo-ajustes" class="dialogo-titulo">${t('ajustes.titulo')}</h2>
        <button type="button" class="boton-suave cerrar">${t('ajustes.cerrar')}</button>
      </header>
      <section class="grupo-ajustes" aria-labelledby="ajustes-tiempos">
        <h3 id="ajustes-tiempos">${t('ajustes.tiempos')}</h3>
        <p class="nota nota-en-curso">${t('ajustes.notaEnCurso')}</p>
        <div class="rejilla-tiempos">
          ${CAMPOS_TIEMPO.map((c) => `
            <label class="campo">
              <span class="campo-etiqueta">${t(c.etiqueta)}</span>
              <span class="entrada-numero">
                <input type="number" inputmode="numeric" min="${c.min}" max="${c.max}" step="1" data-llave="${c.llave}">
                <span class="unidad">${t(c.unidad)}</span>
              </span>
            </label>`).join('')}
        </div>
        <button type="button" class="boton-texto restablecer">${t('ajustes.restablecer')}</button>
      </section>
      <section class="grupo-ajustes" aria-labelledby="ajustes-inicio">
        <h3 id="ajustes-inicio">${t('ajustes.inicio')}</h3>
        ${interruptor('autoDescanso', 'ajustes.autoDescanso')}
        ${interruptor('autoTaza', 'ajustes.autoTaza')}
      </section>
      <section class="grupo-ajustes" aria-labelledby="ajustes-avisos">
        <h3 id="ajustes-avisos">${t('ajustes.avisosSeccion')}</h3>
        ${interruptor('avisos', 'ajustes.avisos')}
        <p class="nota nota-permiso" hidden></p>
        <div class="campo campo-volumen">
          <label for="volumen-campanita" class="campo-etiqueta">${t('ajustes.campanita')}</label>
          <div class="fila">
            <input id="volumen-campanita" type="range" min="0" max="1" step="0.05" data-llave="volumen.campanita">
            <button type="button" class="boton-suave probar">${t('ajustes.probar')}</button>
          </div>
        </div>
      </section>
      <section class="grupo-ajustes" aria-labelledby="ajustes-tema">
        <h3 id="ajustes-tema">${t('ajustes.tema')}</h3>
        <div class="tema-actual">
          <span class="tema-muestra" aria-hidden="true"></span>
          <span><strong>${t('temas.nocturna.nombre')}</strong><span class="tema-frase">${t('temas.nocturna.frase')}</span></span>
        </div>
      </section>
    </div>`;
  app.append(dialogo);

  const entradas = [...dialogo.querySelectorAll('[data-llave]')];
  const notaPermiso = dialogo.querySelector('.nota-permiso');

  function pintarPermiso() {
    const permiso = permisoAvisos();
    const activo = datos().ajustes.avisos;
    const texto = !activo ? '' : permiso === 'denied' ? t('ajustes.permisoBloqueado') : permiso === 'no-disponible' ? t('ajustes.permisoNoDisponible') : '';
    notaPermiso.textContent = texto;
    notaPermiso.hidden = !texto;
  }

  function llenar() {
    const ajustes = datos().ajustes;
    entradas.forEach((entrada) => {
      const valor = leer(ajustes, entrada.dataset.llave);
      if (entrada.type === 'checkbox') entrada.checked = Boolean(valor);
      else entrada.value = valor;
    });
    dialogo.querySelector('.nota-en-curso').hidden = !enCurso();
    pintarPermiso();
  }

  entradas.forEach((entrada) => {
    const evento = entrada.type === 'range' ? 'input' : 'change';
    entrada.addEventListener(evento, () => {
      const ajustes = datos().ajustes;
      const llave = entrada.dataset.llave;
      let valor;
      if (entrada.type === 'checkbox') valor = entrada.checked;
      else if (entrada.type === 'range') valor = Number(entrada.value);
      else {
        const min = Number(entrada.min);
        const max = Number(entrada.max);
        valor = Math.round(Number(entrada.value));
        if (!Number.isFinite(valor)) valor = leer(ajustes, llave);
        valor = Math.min(max, Math.max(min, valor));
        entrada.value = valor;
      }
      escribir(ajustes, llave, valor);
      if (llave === 'avisos' && valor) pedirPermiso();
      alCambiar(llave);
      pintarPermiso();
    });
  });

  dialogo.querySelector('.restablecer').addEventListener('click', () => {
    const ajustes = datos().ajustes;
    ajustes.minutos = { ...ajustes.minutos, pequena: 15, mediana: 25, grande: 50 };
    ajustes.descansoCorto = AJUSTES_INICIALES.descansoCorto;
    ajustes.descansoLargo = AJUSTES_INICIALES.descansoLargo;
    ajustes.largoCada = AJUSTES_INICIALES.largoCada;
    llenar();
    alCambiar('tiempos');
  });
  dialogo.querySelector('.probar').addEventListener('click', () => probarCampanita());
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
