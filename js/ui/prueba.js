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

// Datos de ejemplo para revisar tareas y estadísticas (?demo=1): cuatro tareas y una semana de tazas.
export function datosDemo(ahora = Date.now()) {
  const tareas = [
    { id: 'demo1', texto: 'Escribir el informe de ventas', estimadas: 4, hechas: 2, completa: false },
    { id: 'demo2', texto: 'Responder los correos de clientes', estimadas: 1, hechas: 1, completa: true },
    { id: 'demo3', texto: 'Preparar la presentación del lunes', estimadas: 3, hechas: 0, completa: false },
    { id: 'demo4', texto: 'Leer el capítulo 5', estimadas: 2, hechas: 0, completa: false },
  ];
  const bebidas = ['cappuccino', 'latte', 'cappuccino', 'matcha', 'cappuccino', 'mocha'];
  const tazasPorDia = [3, 4, 0, 2, 5, 4, 2]; // De hace seis días a hoy.
  const registros = [];
  let n = 0;
  tazasPorDia.forEach((tazas, i) => {
    const dia = new Date(ahora);
    dia.setDate(dia.getDate() - (tazasPorDia.length - 1 - i));
    dia.setHours(9, 0, 0, 0);
    for (let k = 0; k < tazas; k++) {
      const inicio = dia.getTime() + k * 35 * 60000;
      const fin = inicio + 25 * 60000;
      registros.push({ id: `demo-f${n}`, tipo: 'foco', completo: true, inicio, fin, minutos: 25, bebida: bebidas[n % bebidas.length], tamano: 'mediana', tarea: null });
      registros.push({ id: `demo-c${n}`, tipo: 'corto', completo: true, inicio: fin, fin: fin + 5 * 60000, minutos: 5, bebida: bebidas[n % bebidas.length], tamano: 'mediana', tarea: null });
      n += 1;
    }
  });
  return { tareas, tareaActiva: 'demo1', registros };
}

// Panel abierto para capturas (?panel=tareas, estadisticas, sonidos, carta o ajustes).
export const panelDePrueba = () => new URLSearchParams(location.search).get('panel');

// Parámetros para capturas: ?prueba=1&bebida=latte&bloque=corto&progreso=50&corriendo=1&demo=1
export function aplicarParametros(temporizador, { elegirBebida, elegirTema, sembrarDemo } = {}) {
  const parametros = new URLSearchParams(location.search);
  if (parametros.get('demo') === '1') sembrarDemo?.();
  if (parametros.get('tema')) elegirTema?.(parametros.get('tema'));
  if (parametros.get('bebida')) elegirBebida?.(parametros.get('bebida'));
  const bloque = parametros.get('bloque');
  if (['foco', 'corto', 'largo'].includes(bloque)) temporizador.irA(bloque);
  const progreso = Number(parametros.get('progreso'));
  if (parametros.has('progreso') && Number.isFinite(progreso)) temporizador.fijarProgreso(progreso / 100);
  if (parametros.get('corriendo') === '1') temporizador.empezar();
}
