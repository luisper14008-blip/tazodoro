// Temporizador basado en la hora de fin: nunca resta segundos, así no se desfasa
// con la pestaña en segundo plano ni al recargar.
import { MINUTO } from './util/tiempo.js';
import { cargar, guardar, conCandado } from './estado.js';
import { podar } from './registros.js';
import { sumarTaza } from './tareas.js';

const crearId = () => `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// app: { datos, guardar(), reemplazar(datos) }. factor: 60 en modo de prueba.
export function crearTemporizador(app, { factor = 1, alCambiar = () => {}, alTerminar = () => {} } = {}) {
  let espera = null;
  let completando = false;

  function minutosDe(bloque, datos) {
    if (bloque === 'foco') return datos.ajustes.minutos[datos.seleccion.tamano] ?? 25;
    return bloque === 'corto' ? datos.ajustes.descansoCorto : datos.ajustes.descansoLargo;
  }

  function nuevoBloque(bloque, tazasCiclo, datos = app.datos) {
    const total = (minutosDe(bloque, datos) * MINUTO) / factor;
    return { id: crearId(), bloque, fase: 'listo', totalMs: total, restanteMs: total, finEn: null, inicioEn: null, tazasCiclo };
  }

  function estado() {
    if (!app.datos.temporizador) app.datos.temporizador = nuevoBloque('foco', 0);
    return app.datos.temporizador;
  }

  function restante(ahora = Date.now()) {
    const e = estado();
    return e.fase === 'corriendo' ? Math.max(0, e.finEn - ahora) : e.restanteMs;
  }

  // Fracción transcurrida del bloque (0 → 1).
  function progreso(ahora = Date.now()) {
    const e = estado();
    return e.totalMs > 0 ? 1 - restante(ahora) / e.totalMs : 0;
  }

  // Nivel de la bebida: baja en concentración y sube en los descansos.
  function nivel(ahora = Date.now()) {
    const p = progreso(ahora);
    return estado().bloque === 'foco' ? 1 - p : p;
  }

  function programar() {
    clearTimeout(espera);
    const e = estado();
    if (e.fase === 'corriendo') espera = setTimeout(() => comprobar(), Math.max(0, e.finEn - Date.now()) + 15);
  }

  function cambio(motivo) {
    app.guardar();
    programar();
    alCambiar(motivo);
  }

  function empezar(ahora = Date.now()) {
    const e = estado();
    if (e.fase === 'corriendo') return;
    e.finEn = ahora + e.restanteMs;
    e.inicioEn ??= ahora;
    e.fase = 'corriendo';
    cambio('empezar');
  }

  function pausar(ahora = Date.now()) {
    const e = estado();
    if (e.fase !== 'corriendo') return;
    e.restanteMs = Math.max(0, e.finEn - ahora);
    e.finEn = null;
    e.fase = 'pausado';
    cambio('pausar');
  }

  function alternar() {
    if (estado().fase === 'corriendo') pausar();
    else empezar();
  }

  function reiniciar() {
    const e = estado();
    app.datos.temporizador = nuevoBloque(e.bloque, e.tazasCiclo);
    cambio('reiniciar');
  }

  function irA(bloque) {
    app.datos.temporizador = nuevoBloque(bloque, estado().tazasCiclo);
    cambio('cambiar-bloque');
  }

  // Saltar concentración no suma taza, pero sí los minutos. Saltar un descanso llena la taza de una vez.
  function saltar(ahora = Date.now()) {
    const e = estado();
    if (e.bloque === 'foco') {
      const hecho = e.totalMs - restante(ahora);
      if (e.inicioEn && hecho > 1000 / factor) {
        app.datos.registros.push(registro(e, app.datos, { completo: false, fin: ahora, minutos: (hecho * factor) / MINUTO }));
      }
      app.datos.temporizador = nuevoBloque('corto', e.tazasCiclo);
    } else {
      app.datos.temporizador = nuevoBloque('foco', e.bloque === 'largo' ? 0 : e.tazasCiclo);
    }
    cambio(e.bloque === 'foco' ? 'saltar-foco' : 'saltar-descanso');
  }

  function registro(e, datos, extra) {
    return {
      id: e.id,
      tipo: e.bloque,
      inicio: e.inicioEn,
      bebida: datos.seleccion.bebida,
      tamano: datos.seleccion.tamano,
      ...extra,
    };
  }

  function siguienteDe(e, datos) {
    if (e.bloque === 'foco') {
      const tazas = e.tazasCiclo + 1;
      return nuevoBloque(tazas >= datos.ajustes.largoCada ? 'largo' : 'corto', tazas, datos);
    }
    return nuevoBloque('foco', e.bloque === 'largo' ? 0 : e.tazasCiclo, datos);
  }

  // Cierra el bloque cuando llega la hora de fin. Solo una pestaña lo registra (candado + id).
  async function completar(ahora, { ausente = false } = {}) {
    if (completando) return;
    completando = true;
    const terminado = { ...estado() };
    let lider = false;
    let cambiado = false;
    try {
      await conCandado('tazodoro-bloque', () => {
        const fresco = cargar();
        // Otra pestaña ya lo registró, o el estado cambió mientras tanto (reinicio, otro bloque):
        // se adopta lo guardado y no se pisa nada.
        if (fresco.registros.some((r) => r.id === terminado.id)) {
          app.reemplazar(fresco);
          return;
        }
        if (fresco.temporizador && fresco.temporizador.id !== terminado.id) {
          cambiado = true;
          app.reemplazar(fresco);
          return;
        }
        const base = fresco.temporizador ?? terminado;
        // La taza terminada se suma a la tarea en curso (si hay una).
        const tarea = base.bloque === 'foco' ? sumarTaza(fresco) : null;
        fresco.registros = podar([
          ...fresco.registros,
          registro(base, fresco, { completo: true, fin: base.finEn, minutos: (base.totalMs * factor) / MINUTO, tarea }),
        ]);
        const siguiente = siguienteDe(base, fresco);
        const auto = siguiente.bloque === 'foco' ? fresco.ajustes.autoTaza : fresco.ajustes.autoDescanso;
        if (auto && !ausente) {
          const inicio = ahora - base.finEn < 60000 ? base.finEn : ahora;
          Object.assign(siguiente, { fase: 'corriendo', inicioEn: inicio, finEn: inicio + siguiente.totalMs });
        }
        fresco.temporizador = siguiente;
        guardar(fresco);
        app.reemplazar(fresco);
        lider = true;
      });
    } finally {
      completando = false;
    }
    programar();
    alCambiar('terminar');
    if (!cambiado) alTerminar({ bloque: terminado.bloque, lider, ausente });
    // Si el siguiente bloque también venció (pestaña dormida mucho tiempo), se cierra en el próximo pulso.
  }

  function comprobar(ahora = Date.now()) {
    const e = estado();
    if (e.fase === 'corriendo' && ahora >= e.finEn) completar(ahora);
  }

  // Al abrir la página: si el bloque venció con la página cerrada, se registra sin sonar.
  // Devuelve una promesa para que nadie cambie el estado antes de cerrar ese bloque.
  function iniciar(ahora = Date.now()) {
    const e = estado();
    if (e.fase === 'corriendo' && ahora >= e.finEn) return completar(ahora, { ausente: true });
    programar();
    return Promise.resolve();
  }

  // Ajustes o tamaño cambiaron: solo afecta a un bloque que todavía no empezó.
  function actualizarDuracion() {
    const e = estado();
    if (e.fase !== 'listo') return false;
    app.datos.temporizador = nuevoBloque(e.bloque, e.tazasCiclo);
    cambio('duracion');
    return true;
  }

  // Modo de prueba: mueve el progreso a mano (0 → 1).
  function fijarProgreso(p, ahora = Date.now()) {
    const e = estado();
    const resto = Math.max(0, Math.min(1, 1 - p)) * e.totalMs;
    if (e.fase === 'corriendo') e.finEn = ahora + resto;
    else {
      e.restanteMs = resto;
      if (e.fase === 'listo' && p > 0) {
        e.fase = 'pausado';
        e.inicioEn ??= ahora;
      }
    }
    cambio('progreso');
  }

  return {
    estado,
    restante,
    progreso,
    nivel,
    empezar,
    pausar,
    alternar,
    reiniciar,
    irA,
    saltar,
    comprobar,
    iniciar,
    actualizarDuracion,
    fijarProgreso,
    programar,
    factor,
  };
}
