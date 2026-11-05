// Todos los textos de la interfaz viven aquí.
// Para traducir Tazodoro: copia este archivo, cambia los valores y el idioma.
// Las llaves {asi} se reemplazan con valores al mostrarse.

export const idioma = 'es';

export const textos = {
  app: {
    nombre: 'Tazodoro',
    descripcion: 'Un Pomodoro de café: tu bebida se vacía al ritmo del tiempo y se vuelve a llenar en los descansos.',
  },

  barra: {
    racha: '{n} días seguidos con al menos una taza',
    rachaUno: '1 día con al menos una taza',
    rachaCero: 'Termina una taza para empezar tu racha',
    musica: 'Sonidos de ambiente',
    tareas: 'Tareas',
    estadisticas: 'Estadísticas',
    ajustes: 'Ajustes',
  },

  bloques: {
    grupo: 'Tipo de bloque',
    foco: 'Concentración',
    corto: 'Descanso corto',
    largo: 'Descanso largo',
    focoBreve: 'Foco',
    cortoBreve: 'Corto',
    largoBreve: 'Largo',
    contador: '{bloque}, {n} hoy',
  },

  controles: {
    empezar: 'Empezar',
    pausar: 'Pausar',
    seguir: 'Seguir',
    empezarDescanso: 'Descansar',
    reiniciar: 'Reiniciar',
    saltar: 'Saltar',
    saltarDescanso: 'Saltar el descanso',
    flotante: 'Abrir ventana flotante',
  },

  tamanos: {
    titulo: 'Tamaño',
    pequena: 'Pequeña',
    mediana: 'Mediana',
    grande: 'Grande',
    personalizada: 'Personalizada',
    minutos: '{n} min',
    bloqueado: 'El tamaño se cambia cuando termines o reinicies la taza.',
    personalizadaEtiqueta: 'Minutos de la taza personalizada',
  },

  // Tamaños con nombre propio para algunas bebidas.
  tamanosEspeciales: {
    espresso: { pequena: 'Single', mediana: 'Doppio', grande: 'Lungo' },
  },

  // Adjetivos para nombrar el pedido: "Cappuccino mediano".
  adjetivos: { pequena: 'pequeño', mediana: 'mediano', grande: 'grande' },

  pedido: {
    conTamano: '{bebida} {tamano}',
    personalizado: '{bebida} de {n} min',
    abrir: 'Cambiar el tamaño de la taza',
  },

  estado: {
    foco: 'Taza {n} de {total}',
    focoPausa: 'Taza {n} de {total}, en pausa',
    corto: 'Se está sirviendo tu próximo {bebida}',
    cortoListo: 'Tu taza se vuelve a llenar en el descanso',
    largo: 'Descanso largo: se sirve con calma',
    largoListo: 'Te ganaste un descanso largo',
    pausa: 'En pausa',
  },

  mensajes: {
    foco: [
      'Taza terminada. Date un respiro.',
      'Ni una gota. Buen trabajo.',
      'Última gota. Toca descansar.',
      'Se acabó el {bebida}. Estira las piernas.',
    ],
    descanso: [
      'Tu {bebida} está servido.',
      'Taza llena. Seguimos cuando quieras.',
    ],
    ausente: 'Terminaste una taza mientras no estabas.',
  },

  titulo: {
    corriendo: '{tiempo} — {nombre}',
    pausado: 'En pausa {tiempo} — {nombre}',
    inactivo: 'Tazodoro',
  },

  avisos: {
    focoTitulo: 'Taza terminada',
    focoCuerpo: 'Terminaste tu {bebida}. Ahora, {descanso} de {n} min.',
    descansoTitulo: 'Descanso terminado',
    descansoCuerpo: 'Tu {bebida} está listo. Seguimos cuando quieras.',
  },

  anuncios: {
    minutos: 'Quedan {n} minutos.',
    minuto: 'Queda 1 minuto.',
    menosDeUno: 'Queda menos de un minuto.',
    empieza: 'Empieza {bloque}.',
    pausa: 'En pausa.',
    escenaFoco: '{bebida}: queda el {n} % de la taza.',
    escenaDescanso: 'Sirviendo {bebida}: la taza va al {n} %.',
  },

  ajustes: {
    titulo: 'Ajustes',
    tiempos: 'Tiempos',
    tazaPequena: 'Taza pequeña',
    tazaMediana: 'Taza mediana',
    tazaGrande: 'Taza grande',
    descansoCorto: 'Descanso corto',
    descansoLargo: 'Descanso largo',
    largoCada: 'Descanso largo cada',
    unidadMinutos: 'min',
    unidadTazas: 'tazas',
    notaEnCurso: 'Los cambios de tiempo se aplican a la próxima taza.',
    inicio: 'Inicio automático',
    autoDescanso: 'Empezar los descansos solos',
    autoTaza: 'Empezar la siguiente taza sola',
    avisosSeccion: 'Avisos',
    avisos: 'Notificación al terminar cada bloque',
    permisoBloqueado: 'El navegador bloqueó las notificaciones de esta página. Puedes permitirlas en los permisos del sitio.',
    permisoNoDisponible: 'Este navegador no permite notificaciones aquí.',
    campanita: 'Volumen de la campanita',
    probar: 'Probar',
    tema: 'Tema',
    restablecer: 'Volver a los tiempos iniciales',
    cerrar: 'Cerrar',
  },

  confirmar: {
    cambiarTitulo: '¿Dejar la taza a medias?',
    cambiarTexto: 'Si cambias de bloque, el tiempo de esta taza se pierde.',
    cambiar: 'Cambiar de bloque',
    seguir: 'Seguir con la taza',
  },

  atajos: {
    titulo: 'Atajos de teclado',
    espacio: 'Espacio',
    espacioAccion: 'empieza o pausa',
    r: 'R',
    rAccion: 'reinicia',
    s: 'S',
    sAccion: 'salta',
  },

  prueba: {
    titulo: 'Modo de prueba',
    velocidad: 'El tiempo corre 60 veces más rápido.',
    progreso: 'Progreso del bloque',
    terminar: 'Terminar bloque',
    sorbo: 'Sorbo',
  },

  bebidas: {
    cappuccino: {
      nombre: 'Cappuccino',
      frase: 'Espuma sedosa, un corazón dibujado y un toque de cacao.',
    },
  },

  temas: {
    nocturna: {
      nombre: 'Cafetería nocturna',
      frase: 'Lluvia en la ventana y una lámpara cálida.',
    },
  },
};

// Busca un texto por ruta ("controles.empezar") y reemplaza {variables}.
export function t(ruta, variables = {}) {
  const valor = ruta.split('.').reduce((nodo, parte) => (nodo == null ? nodo : nodo[parte]), textos);
  if (typeof valor !== 'string') return valor ?? ruta;
  return rellenar(valor, variables);
}

export function rellenar(plantilla, variables = {}) {
  return plantilla.replace(/\{(\w+)\}/g, (_, llave) => (llave in variables ? String(variables[llave]) : `{${llave}}`));
}

// Elige un elemento de una lista de textos sin repetir el anterior.
let ultimoAzar = -1;
export function alAzar(lista, variables = {}) {
  if (!Array.isArray(lista) || lista.length === 0) return '';
  let i = Math.floor(Math.random() * lista.length);
  if (lista.length > 1 && i === ultimoAzar) i = (i + 1) % lista.length;
  ultimoAzar = i;
  return rellenar(lista[i], variables);
}

// Llena los textos estáticos del HTML: data-t (contenido), data-t-aria (aria-label), data-t-title (title).
export function aplicarTextos(raiz = document) {
  document.documentElement.lang = idioma;
  raiz.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  raiz.querySelectorAll('[data-t-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.tAria)); });
  raiz.querySelectorAll('[data-t-title]').forEach((el) => { el.setAttribute('title', t(el.dataset.tTitle)); });
}
