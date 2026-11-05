// Operaciones sobre la lista de tareas (datos.tareas) y la tarea activa (datos.tareaActiva).
// Cada tarea: { id, texto, estimadas, hechas, completa }.

const crearId = () => `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const MAX_TAZAS = 12;

const limitarTazas = (n) => Math.min(MAX_TAZAS, Math.max(1, Math.round(Number(n) || 1)));

export function tareaActiva(datos) {
  return datos.tareas.find((t) => t.id === datos.tareaActiva && !t.completa) ?? null;
}

// Si la activa se completó o se borró, pasa a la siguiente pendiente.
function reelegirActiva(datos) {
  if (!tareaActiva(datos)) datos.tareaActiva = datos.tareas.find((t) => !t.completa)?.id ?? null;
}

export function agregarTarea(datos, texto, estimadas = 1) {
  const limpio = texto.trim();
  if (!limpio) return null;
  const tarea = { id: crearId(), texto: limpio, estimadas: limitarTazas(estimadas), hechas: 0, completa: false };
  datos.tareas.push(tarea);
  reelegirActiva(datos);
  return tarea;
}

export function editarTarea(datos, id, { texto, estimadas }) {
  const tarea = datos.tareas.find((t) => t.id === id);
  if (!tarea) return;
  if (texto !== undefined && texto.trim()) tarea.texto = texto.trim();
  if (estimadas !== undefined) tarea.estimadas = limitarTazas(estimadas);
}

export function completarTarea(datos, id, completa) {
  const tarea = datos.tareas.find((t) => t.id === id);
  if (!tarea) return;
  tarea.completa = completa;
  reelegirActiva(datos);
}

export function elegirActiva(datos, id) {
  const tarea = datos.tareas.find((t) => t.id === id);
  if (tarea && !tarea.completa) datos.tareaActiva = id;
}

export function borrarTarea(datos, id) {
  datos.tareas = datos.tareas.filter((t) => t.id !== id);
  reelegirActiva(datos);
}

// Mueve una tarea a la posición indicada (arrastrar o flechas).
export function moverTarea(datos, id, destino) {
  const desde = datos.tareas.findIndex((t) => t.id === id);
  if (desde < 0) return desde;
  const hasta = Math.max(0, Math.min(datos.tareas.length - 1, destino));
  const [tarea] = datos.tareas.splice(desde, 1);
  datos.tareas.splice(hasta, 0, tarea);
  return hasta;
}

// Una taza terminada suma a la tarea activa. Devuelve su id para el registro.
export function sumarTaza(datos) {
  const tarea = tareaActiva(datos);
  if (!tarea) return null;
  tarea.hechas += 1;
  return tarea.id;
}
