// Arranque de Tazodoro: conecta el temporizador, la escena, la interfaz, el sonido y los avisos.
import { textos, t, aplicarTextos, alAzar } from './textos.js';
import { cargar, guardar, modoPrueba, escucharOtrasPestanas } from './estado.js';
import { crearTemporizador } from './temporizador.js';
import { conteosDeHoy, racha } from './registros.js';
import { CATALOGO, obtenerBebida, escalaPorMinutos } from './bebidas/catalogo.js';
import { crearEscena } from './bebidas/escena.js';
import { formatoReloj, MINUTO } from './util/tiempo.js';
import { montarControles } from './ui/controles.js';
import { montarCarta } from './ui/carta.js';
import { montarAjustes } from './ui/ajustes.js';
import { confirmar } from './ui/dialogo.js';
import { montarPrueba, aplicarParametros, datosDemo, panelDePrueba } from './ui/prueba.js';
import { actualizarTitulo, actualizarFavicon, mostrarMensaje, anunciar, pedirPermisoAvisos, notificar } from './ui/avisos.js';
import { desbloquearAudio, silenciar } from './audio/motor.js';
import { tocarCampanita } from './audio/campanita.js';
import { crearAmbientes, AMBIENTES } from './audio/ambientes.js';
import { montarSonidos } from './ui/sonidos.js';
import { montarTareas } from './ui/tareas.js';
import { montarEstadisticas } from './ui/estadisticas.js';
import { montarFlotante } from './ui/flotante.js';
import { tareaActiva } from './tareas.js';
import { aplicarTema, TEMAS } from './temas.js';
import { nombreBebida, nombrePedido } from './nombres.js';

const FACTOR = modoPrueba ? 60 : 1;
const movimiento = !matchMedia('(prefers-reduced-motion: reduce)').matches;
const raiz = document.querySelector('.app');
const marcoEscena = document.querySelector('.escena');

aplicarTextos();
document.querySelector('meta[name="description"]')?.setAttribute('content', t('app.descripcion'));

const app = {
  datos: cargar(),
  guardar() {
    guardar(app.datos);
  },
  reemplazar(nuevos) {
    app.datos = nuevos;
  },
};

const temporizador = crearTemporizador(app, { factor: FACTOR, alCambiar: alCambiarTemporizador, alTerminar });
const escena = crearEscena(marcoEscena, { movimiento, factor: FACTOR });
const capaFondo = document.querySelector('.fondo');
let tema = aplicarTema(app.datos.ajustes.tema, { raiz, fondo: capaFondo, movimiento });
escena.cambiarTema({ carita: tema.carita });

// Cambio de tema: fondo, luz de la escena, bebida y miniaturas de la carta se vuelven a armar.
function cambiarTema(id) {
  if (!TEMAS[id]) return;
  app.datos.ajustes.tema = id;
  app.guardar();
  tema = aplicarTema(id, { raiz, fondo: capaFondo, movimiento });
  escena.cambiarTema({ carita: tema.carita });
  carta.invalidar();
  flotante.actualizar();
  acento = '';
  alinearMesa();
  pintar();
}

// ---------- Bebida y tamaño ----------
let bebidaMostrada = '';
const minutosFoco = () => app.datos.ajustes.minutos[app.datos.seleccion.tamano];
const nombreEnFrase = () => nombreBebida(app.datos.seleccion.bebida).toLocaleLowerCase('es');

function mostrarBebida() {
  const { bebida } = app.datos.seleccion;
  const escala = escalaPorMinutos(minutosFoco());
  const clave = `${bebida}|${escala.toFixed(3)}`;
  if (clave === bebidaMostrada) return;
  bebidaMostrada = clave;
  escena.mostrar(obtenerBebida(bebida), escala);
  flotante.actualizar();
}

// ---------- Interfaz ----------
const controles = montarControles(raiz, {
  alternar,
  reiniciar() {
    desbloquearAudio();
    temporizador.reiniciar();
  },
  saltar() {
    desbloquearAudio();
    temporizador.saltar();
  },
  irA: cambiarBloque,
  pedido: (boton) => carta.abrir(boton),
  ajustes: (boton) => ajustes.abrir(boton),
  sonidos: (boton) => sonidos.abrir(boton),
  tareas: (boton) => tareas.abrir(boton),
  estadisticas: (boton) => estadisticas.abrir(boton),
});

const carta = montarCarta(raiz, {
  datos: () => app.datos,
  carita: () => tema.carita,
  // El tamaño no se cambia con una taza en curso; la bebida sí (aparece con el mismo nivel).
  bloqueado: () => {
    const e = temporizador.estado();
    return e.bloque === 'foco' && e.fase !== 'listo';
  },
  alElegirBebida(id) {
    app.datos.seleccion.bebida = id;
    app.guardar();
    mostrarBebida();
    pintar();
  },
  alElegirTamano(tamano, minutos) {
    if (minutos) app.datos.ajustes.minutos.personalizada = minutos;
    app.datos.seleccion.tamano = tamano;
    app.guardar();
    temporizador.actualizarDuracion();
    mostrarBebida();
    pintar();
  },
});

const ajustes = montarAjustes(raiz, {
  datos: () => app.datos,
  enCurso: () => temporizador.estado().fase !== 'listo',
  alCambiar(llave) {
    app.guardar();
    if (/^(minutos|descanso|largoCada|tiempos)/.test(llave)) {
      temporizador.actualizarDuracion();
      mostrarBebida();
    }
    pintar();
  },
  probarCampanita() {
    desbloquearAudio();
    tocarCampanita({ volumen: app.datos.ajustes.volumen.campanita });
  },
  pedirPermiso: pedirPermisoAvisos,
  alElegirTema: cambiarTema,
});

// ---------- Sonidos de ambiente ----------
// Solo una pestaña los toca: la que tiene el candado. Las demás guardan los ajustes y esa los aplica.
const ambientes = crearAmbientes();
let tocaAmbientes = false;
let pidioAmbientes = false;
silenciar(app.datos.ajustes.sonidos.silencio);

function aplicarSonidos() {
  const ajustesSonido = app.datos.ajustes.sonidos;
  silenciar(ajustesSonido.silencio);
  if (tocaAmbientes) AMBIENTES.forEach((id) => ambientes.fijar(id, ajustesSonido[id]));
}

function tomarAmbientes() {
  if (pidioAmbientes) return;
  pidioAmbientes = true;
  const empezar = () => {
    tocaAmbientes = true;
    aplicarSonidos();
  };
  if (!navigator.locks?.request) {
    empezar();
    return;
  }
  navigator.locks.request('tazodoro-ambientes', () => {
    empezar();
    return new Promise(() => {}); // Se suelta al cerrar la pestaña.
  }).catch(() => {});
}

// El navegador solo deja sonar después de un gesto: con cada uno se despierta (o reanuda) el audio.
function gesto() {
  desbloquearAudio();
  tomarAmbientes();
}
['pointerdown', 'pointerup', 'keydown'].forEach((tipo) => window.addEventListener(tipo, gesto, { capture: true, passive: true }));

const sonidos = montarSonidos(raiz, {
  datos: () => app.datos,
  alCambiar(id) {
    app.guardar();
    gesto();
    if (id === 'silencio') silenciar(app.datos.ajustes.sonidos.silencio);
    else if (tocaAmbientes) ambientes.fijar(id, app.datos.ajustes.sonidos[id]);
    pintar();
  },
});

// ---------- Tareas y estadísticas ----------
const tareas = montarTareas(raiz, {
  datos: () => app.datos,
  alCambiar() {
    app.guardar();
    pintar();
  },
});

const estadisticas = montarEstadisticas(raiz, {
  datos: () => app.datos,
  carita: () => tema.carita,
  alBorrar() {
    app.datos.registros = [];
    app.datos.tareas = [];
    app.datos.tareaActiva = null;
    app.guardar();
    anunciar(t('estadisticas.borrado'));
    pintar();
  },
});

// ---------- Ventana flotante ----------
function vistaFlotante() {
  const ahora = Date.now();
  const e = temporizador.estado();
  return {
    estado: { nivel: temporizador.nivel(ahora), bloque: e.bloque, fase: e.fase },
    reloj: formatoReloj(temporizador.restante(ahora) * FACTOR),
    texto: textoPrincipal(e),
    bebida: obtenerBebida(app.datos.seleccion.bebida),
    escala: escalaPorMinutos(minutosFoco()),
    tema: tema.clave,
    carita: tema.carita,
  };
}
const flotante = montarFlotante(raiz.querySelector('[data-accion="flotante"]'), { vista: vistaFlotante, alternar, movimiento, factor: FACTOR, avisar: mostrarMensaje });

const prueba = modoPrueba ? montarPrueba(raiz, { temporizador, escena, alCambiar: () => latido() }) : null;
raiz.classList.toggle('modo-prueba', modoPrueba);
raiz.classList.toggle('sin-transiciones', modoPrueba && new URLSearchParams(location.search).get('quieto') === '1');

function alternar() {
  desbloquearAudio();
  if (temporizador.estado().fase !== 'corriendo' && app.datos.ajustes.avisos) pedirPermisoAvisos();
  temporizador.alternar();
}

async function cambiarBloque(bloque) {
  const e = temporizador.estado();
  if (bloque === e.bloque && e.fase === 'listo') return;
  if (e.fase !== 'listo') {
    const seguro = await confirmar({
      titulo: t('confirmar.cambiarTitulo'),
      texto: t('confirmar.cambiarTexto'),
      aceptar: t('confirmar.cambiar'),
      cancelar: t('confirmar.seguir'),
    });
    if (!seguro) return;
  }
  temporizador.irA(bloque);
}

// ---------- Eventos del temporizador ----------
// Señal breve de cambio de bloque (el neón del tema retro parpadea con ella).
let esperaCambio = 0;
function marcarCambioDeBloque() {
  raiz.classList.remove('cambio-bloque');
  void raiz.offsetWidth;
  raiz.classList.add('cambio-bloque');
  clearTimeout(esperaCambio);
  esperaCambio = setTimeout(() => raiz.classList.remove('cambio-bloque'), 1400);
}

function alCambiarTemporizador(motivo) {
  const e = temporizador.estado();
  if (['terminar', 'saltar-foco', 'saltar-descanso', 'cambiar-bloque'].includes(motivo)) marcarCambioDeBloque();
  escena.pausar(e.fase === 'pausado');
  if (motivo === 'empezar') anunciar(t('anuncios.empieza', { bloque: t(`bloques.${e.bloque}`).toLocaleLowerCase('es') }));
  if (motivo === 'pausar') anunciar(t('anuncios.pausa'));
  carta.pintar();
  tareas.pintar();
  estadisticas.pintar();
  pintar();
  sincronizarLatido();
  latido();
}

function alTerminar({ bloque, lider, ausente }) {
  const { ajustes: a } = app.datos;
  if (ausente) {
    mostrarMensaje(t('mensajes.ausente'));
    return;
  }
  const bebida = nombreEnFrase();
  if (bloque === 'foco') {
    mostrarMensaje(alAzar(textos.mensajes.foco, { bebida }));
    if (!lider) return;
    tocarCampanita({ volumen: a.volumen.campanita, veces: 2 });
    const siguiente = temporizador.estado().bloque;
    const minutos = siguiente === 'largo' ? a.descansoLargo : a.descansoCorto;
    if (a.avisos) notificar(t('avisos.focoTitulo'), t('avisos.focoCuerpo', { bebida, descanso: t(`bloques.${siguiente}`).toLocaleLowerCase('es'), n: minutos }));
  } else {
    mostrarMensaje(alAzar(textos.mensajes.descanso, { bebida }));
    if (!lider) return;
    tocarCampanita({ volumen: a.volumen.campanita, veces: 1 });
    if (a.avisos) notificar(t('avisos.descansoTitulo'), t('avisos.descansoCuerpo', { bebida }));
  }
}

// ---------- Pintado ----------
function vista(ahora = Date.now()) {
  const e = temporizador.estado();
  const { bebida, tamano } = app.datos.seleccion;
  const corriendo = e.fase === 'corriendo';
  const descanso = e.bloque !== 'foco';
  const total = app.datos.ajustes.largoCada;
  const n = Math.min(e.tazasCiclo + 1, total);
  let estadoTexto;
  if (!descanso) estadoTexto = t(e.fase === 'pausado' ? 'estado.focoPausa' : 'estado.foco', { n, total });
  else if (e.fase === 'pausado') estadoTexto = t('estado.pausa');
  else if (e.bloque === 'corto') estadoTexto = e.fase === 'listo' ? t('estado.cortoListo') : t('estado.corto', { bebida: nombreEnFrase() });
  else estadoTexto = e.fase === 'listo' ? t('estado.largoListo') : t('estado.largo');
  const dias = racha(app.datos.registros, ahora);
  const tarea = tareaActiva(app.datos);
  const ajustesSonido = app.datos.ajustes.sonidos;
  return {
    bloque: e.bloque,
    fase: e.fase,
    corriendo,
    conteos: conteosDeHoy(app.datos.registros, ahora),
    racha: dias,
    rachaTexto: dias === 0 ? t('barra.rachaCero') : dias === 1 ? t('barra.rachaUno') : t('barra.racha', { n: dias }),
    reloj: formatoReloj(temporizador.restante(ahora) * FACTOR),
    principalTexto: textoPrincipal(e),
    saltarTexto: descanso ? t('controles.saltarDescanso') : t('controles.saltar'),
    pedidoTexto: nombrePedido(bebida, tamano, app.datos.ajustes.minutos.personalizada),
    estadoTexto,
    tareaTexto: tarea ? t('tareas.enCurso', { tarea: tarea.texto, hechas: tarea.hechas, estimadas: tarea.estimadas }) : '',
    silencio: ajustesSonido.silencio,
    sonando: AMBIENTES.some((id) => ajustesSonido[id].activo),
    textoSonidos: t(ajustesSonido.silencio ? 'barra.musicaSilencio' : 'barra.musica'),
  };
}

function textoPrincipal(e) {
  if (e.fase === 'corriendo') return t('controles.pausar');
  if (e.fase === 'pausado') return t('controles.seguir');
  return e.bloque === 'foco' ? t('controles.empezar') : t('controles.empezarDescanso');
}

function pintar() {
  mostrarBebida();
  controles.pintar(vista());
  cuadroEscena(Date.now());
}

let acento = '';
let ultimoPorcentaje = -1;
let ultimoMinuto = null;

// Lo que cambia con el tiempo: escena, reloj, título, favicon, anuncios.
function cuadroEscena(ahora) {
  const e = temporizador.estado();
  const nivel = temporizador.nivel(ahora);
  const restante = temporizador.restante(ahora) * FACTOR;
  escena.actualizar({ nivel, bloque: e.bloque, fase: e.fase });
  controles.pintarReloj(formatoReloj(restante));
  actualizarTitulo({ fase: e.fase, bloque: e.bloque, restante, nombreBebida: nombreBebida(app.datos.seleccion.bebida) });
  acento ||= getComputedStyle(raiz).getPropertyValue('--acento').trim() || '#F2A33A';
  actualizarFavicon(nivel, acento);
  prueba?.sincronizar(temporizador.progreso(ahora));

  const porcentaje = Math.round(nivel * 20) * 5;
  if (porcentaje !== ultimoPorcentaje) {
    ultimoPorcentaje = porcentaje;
    marcoEscena.setAttribute('aria-label', t(e.bloque === 'foco' ? 'anuncios.escenaFoco' : 'anuncios.escenaDescanso', { bebida: nombreBebida(app.datos.seleccion.bebida), n: porcentaje }));
  }

  if (e.fase !== 'corriendo') ultimoMinuto = null;
  else {
    const minutos = Math.ceil(restante / MINUTO);
    if (ultimoMinuto !== null && minutos !== ultimoMinuto && minutos > 0) anunciar(minutos === 1 ? t('anuncios.minuto') : t('anuncios.minutos', { n: minutos }));
    ultimoMinuto = minutos;
  }
}

// ---------- Bucle de dibujo ----------
// Solo dibuja con la pestaña visible y cuando algo se mueve; el tiempo nunca depende de los cuadros.
let idCuadro = 0;
let segundoPintado = -1;
let ultimoCuadro = 0;

function cuadro() {
  idCuadro = 0;
  ultimoCuadro = performance.now();
  const ahora = Date.now();
  temporizador.comprobar(ahora);
  cuadroEscena(ahora);
  const segundo = Math.floor(ahora / 1000);
  if (segundo !== segundoPintado) {
    segundoPintado = segundo;
    controles.pintar(vista(ahora));
  }
  const sigue = temporizador.estado().fase === 'corriendo' || escena.animando();
  if (sigue && !document.hidden) idCuadro = requestAnimationFrame(cuadro);
}

function latido() {
  if (!idCuadro && !document.hidden) idCuadro = requestAnimationFrame(cuadro);
}

// Pulso del worker: con la pestaña oculta mantiene al día el título y el aviso de fin.
let worker = null;
try {
  worker = new Worker(new URL('./latido.worker.js', import.meta.url));
  worker.onmessage = () => {
    const ahora = Date.now();
    temporizador.comprobar(ahora);
    if (document.hidden) {
      // Pestaña oculta: no se dibuja, solo se mantienen al día el título y el favicon.
      const e = temporizador.estado();
      actualizarTitulo({ fase: e.fase, bloque: e.bloque, restante: temporizador.restante(ahora) * FACTOR, nombreBebida: nombreBebida(app.datos.seleccion.bebida) });
      actualizarFavicon(temporizador.nivel(ahora), acento);
    } else if (temporizador.estado().fase === 'corriendo' && performance.now() - ultimoCuadro > 1500) {
      // Visible pero sin cuadros (ventana tapada o panel oculto): se pinta una vez por segundo.
      cuadroEscena(ahora);
      controles.pintar(vista(ahora));
    }
  };
} catch {
  setInterval(() => temporizador.comprobar(), 1000);
}

function sincronizarLatido() {
  worker?.postMessage(temporizador.estado().fase === 'corriendo' ? 'iniciar' : 'detener');
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  temporizador.comprobar();
  pintar();
  latido();
});

escucharOtrasPestanas((nuevos) => {
  app.datos = nuevos;
  aplicarSonidos();
  tareas.pintar();
  estadisticas.pintar();
  temporizador.programar();
  escena.pausar(temporizador.estado().fase === 'pausado');
  pintar();
  sincronizarLatido();
  latido();
});

// ---------- La mesa se alinea con la escena ----------
function alinearMesa() {
  const caja = marcoEscena.getBoundingClientRect();
  const base = raiz.getBoundingClientRect();
  raiz.style.setProperty('--mesa-y', `${Math.round(caja.top - base.top + caja.height * 0.5)}px`);
  raiz.style.setProperty('--escena-x', `${Math.round(caja.left - base.left + caja.width / 2)}px`);
  raiz.style.setProperty('--escena-abajo', `${Math.round(caja.bottom - base.top)}px`);
}
new ResizeObserver(alinearMesa).observe(marcoEscena);
window.addEventListener('resize', alinearMesa);

// ---------- Arranque ----------
mostrarBebida();
await temporizador.iniciar();
if (modoPrueba) {
  aplicarParametros(temporizador, {
    elegirBebida(id) {
      if (!CATALOGO[id]) return;
      app.datos.seleccion.bebida = id;
      app.guardar();
    },
    elegirTema: cambiarTema,
    sembrarDemo() {
      Object.assign(app.datos, datosDemo());
      app.guardar();
    },
  });
}
alCambiarTemporizador('inicio');
alinearMesa();
raiz.classList.add('lista');
if (modoPrueba && panelDePrueba()) {
  const paneles = { tareas, estadisticas, sonidos, carta, ajustes };
  const botones = { carta: '.pedido', ajustes: '[data-accion="ajustes"]', tareas: '[data-accion="tareas"]', estadisticas: '[data-accion="estadisticas"]', sonidos: '[data-accion="sonidos"]' };
  paneles[panelDePrueba()]?.abrir(raiz.querySelector(botones[panelDePrueba()]));
}
