// Datos guardados en localStorage, con versión de esquema y migraciones.
// En modo de prueba (?prueba=1) se usa otra clave para no ensuciar los datos reales.

export const ESQUEMA = 1;

const parametros = new URLSearchParams(location.search);
export const modoPrueba = parametros.get('prueba') === '1';
export const CLAVE = modoPrueba ? 'tazodoro-prueba' : 'tazodoro';

export const AJUSTES_INICIALES = {
  minutos: { pequena: 15, mediana: 25, grande: 50, personalizada: 30 },
  descansoCorto: 5,
  descansoLargo: 15,
  largoCada: 4,
  autoDescanso: false,
  autoTaza: false,
  avisos: true,
  volumen: { campanita: 0.7 },
  tema: 'nocturna',
};

export function datosIniciales() {
  return {
    esquema: ESQUEMA,
    ajustes: structuredClone(AJUSTES_INICIALES),
    seleccion: { bebida: 'cappuccino', tamano: 'mediana' },
    temporizador: null,
    registros: [],
    tareas: [],
  };
}

// Cada migración recibe datos del esquema N y devuelve datos del esquema N + 1.
const migraciones = {
  // 1: (datos) => ({ ...datos, esquema: 2 }),
};

function migrar(datos) {
  let actual = datos;
  while (typeof actual.esquema === 'number' && actual.esquema < ESQUEMA && migraciones[actual.esquema]) {
    actual = migraciones[actual.esquema](actual);
  }
  return actual;
}

const esObjeto = (x) => x && typeof x === 'object' && !Array.isArray(x);

// Completa lo guardado con los valores por defecto (útil cuando aparecen ajustes nuevos).
function completar(base, guardado) {
  if (!esObjeto(guardado)) return base;
  const resultado = { ...base };
  for (const [llave, valor] of Object.entries(guardado)) {
    resultado[llave] = esObjeto(valor) && esObjeto(base[llave]) ? completar(base[llave], valor) : valor;
  }
  return resultado;
}

// Si localStorage no está disponible (modo privado estricto), los datos viven en memoria.
let respaldo = null;

function leerCrudo() {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return respaldo;
  }
}

export function interpretar(crudo) {
  if (!crudo) return datosIniciales();
  try {
    return completar(datosIniciales(), migrar(JSON.parse(crudo)));
  } catch {
    return datosIniciales();
  }
}

export function cargar() {
  return interpretar(leerCrudo());
}

export function guardar(datos) {
  const texto = JSON.stringify(datos);
  try {
    localStorage.setItem(CLAVE, texto);
  } catch {
    respaldo = texto;
  }
}

// Otra pestaña guardó cambios: avisa con los datos nuevos.
export function escucharOtrasPestanas(alCambiar) {
  window.addEventListener('storage', (evento) => {
    if (evento.key === CLAVE && evento.newValue) alCambiar(interpretar(evento.newValue));
  });
}

// Ejecuta fn con un candado compartido entre pestañas (Web Locks) cuando existe.
export function conCandado(nombre, fn) {
  if (navigator.locks?.request) return navigator.locks.request(nombre, fn);
  return Promise.resolve().then(fn);
}

export function borrarTodo() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    respaldo = null;
  }
}
