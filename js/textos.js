// Todos los textos de la interfaz viven aquí.
// Para traducir Tazodoro: copia este archivo, cambia los valores y el idioma.
// Las llaves {asi} se reemplazan con valores al mostrarse.
// Plurales: { uno, otros } elige según la variable n (o la que diga "cuenta").

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
    musicaSilencio: 'Sonidos de ambiente (silenciados)',
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
    abrir: 'Abrir la carta para cambiar de bebida o tamaño',
  },

  carta: {
    titulo: 'La carta',
    ayuda: 'Si cambias de bebida a mitad de la taza, la nueva aparece con el mismo nivel.',
    cerrar: 'Cerrar',
    tamano: 'Tamaño',
    secciones: { cafe: 'Con café', frios: 'Fríos', otros: 'Tés y chocolate' },
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

  sonidos: {
    titulo: 'Sonidos de ambiente',
    ayuda: 'Se generan en el navegador. Suenan aunque cambies de pestaña.',
    murmullo: 'Murmullo de cafetería',
    lluvia: 'Lluvia',
    cafetera: 'Cafetera',
    volumen: 'Volumen de {sonido}',
    silencio: 'Silenciar todo',
    silenciado: 'Sonidos silenciados',
    cerrar: 'Cerrar',
  },

  tareas: {
    titulo: 'Tareas',
    nueva: 'Nueva tarea',
    ejemplo: 'Por ejemplo: escribir el informe',
    estimadas: 'Tazas estimadas',
    agregar: 'Agregar',
    vacio: 'Escribe lo que quieres terminar hoy y cuántas tazas crees que te tomará.',
    resumen: { cuenta: 'total', uno: '{hechas} de 1 tarea hecha', otros: '{hechas} de {total} tareas hechas' },
    tazas: { cuenta: 'estimadas', uno: '{hechas} de 1 taza', otros: '{hechas} de {estimadas} tazas' },
    completar: 'Marcar como hecha: {tarea}',
    activar: 'Trabajar en esta tarea',
    activa: 'Tarea en curso',
    editar: 'Editar: {tarea}',
    guardar: 'Guardar',
    cancelar: 'Cancelar',
    borrar: 'Borrar: {tarea}',
    mover: 'Mover: {tarea}. Usa las flechas arriba y abajo.',
    movida: '{tarea} quedó en el lugar {n}.',
    enCurso: { cuenta: 'estimadas', uno: '{tarea}, {hechas} de 1 taza', otros: '{tarea}, {hechas} de {estimadas} tazas' },
    enCursoPrefijo: 'Tarea en curso: ',
    abrir: 'Ver tus tareas',
    cerrar: 'Cerrar',
  },

  estadisticas: {
    titulo: 'Estadísticas',
    tazasHoy: 'Tazas de hoy',
    minutosHoy: 'Minutos de foco hoy',
    racha: 'Días seguidos',
    semana: 'Minutos de foco, últimos 7 días',
    grafico: 'Minutos de foco por día: {datos}.',
    semanaVacia: 'Aquí aparecerán tus minutos de foco.',
    dia: '{dia}: {n} min',
    favorita: 'Tu bebida favorita',
    favoritaTexto: { uno: '{bebida}, con 1 taza', otros: '{bebida}, con {n} tazas' },
    sinFavorita: 'Termina una taza para ver tu favorita.',
    total: { uno: '1 taza en total', otros: '{n} tazas en total' },
    exportar: 'Descargar mis datos',
    borrar: 'Borrar historial y tareas',
    borrarTitulo: '¿Borrar historial y tareas?',
    borrarTexto: 'Se borran tus tazas, minutos, racha y tareas. Tus ajustes y tu tema se quedan. No se puede deshacer.',
    borrarSi: 'Borrar',
    borrarNo: 'Conservar',
    borrado: 'Historial y tareas borrados.',
    cerrar: 'Cerrar',
  },

  flotante: {
    abrir: 'Abrir ventana flotante',
    titulo: 'Tazodoro flotante',
    noDisponible: 'Este navegador no deja abrir la ventana flotante.',
  },

  prueba: {
    titulo: 'Modo de prueba',
    velocidad: 'El tiempo corre 60 veces más rápido.',
    progreso: 'Progreso del bloque',
    terminar: 'Terminar bloque',
    sorbo: 'Sorbo',
  },

  bebidas: {
    americano: { nombre: 'Americano', frase: 'Café negro y brillante, recién servido y humeante.' },
    espresso: { nombre: 'Espresso', frase: 'Pequeño e intenso, con su crema dorada.' },
    cappuccino: { nombre: 'Cappuccino', frase: 'Espuma sedosa, un corazón dibujado y un toque de cacao.' },
    latte: { nombre: 'Latte', frase: 'Leche, café y espuma en capas, con una roseta encima.' },
    mocha: { nombre: 'Mocha', frase: 'Chocolate y espresso bajo una nube de crema.' },
    caramelMacchiato: { nombre: 'Caramel macchiato', frase: 'Leche, espresso y una rejilla de caramelo.' },
    coldBrew: { nombre: 'Cold brew', frase: 'Café de infusión lenta, frío y con hielo.' },
    frappe: { nombre: 'Frappé', frase: 'Café helado y batido, con crema y salsa.' },
    matcha: { nombre: 'Matcha latte', frase: 'Té verde batido con leche y una hoja de espuma.' },
    chai: { nombre: 'Chai latte', frase: 'Té especiado con canela y anís estrellado.' },
    chocolate: { nombre: 'Chocolate caliente', frase: 'Espeso, dulce y con malvaviscos.' },
    bubbleTea: { nombre: 'Bubble tea', frase: 'Té con leche y perlas de tapioca.' },
  },

  temas: {
    nocturna: { nombre: 'Cafetería nocturna', frase: 'Lluvia en la ventana y una lámpara cálida.' },
    kawaii: { nombre: 'Pastel kawaii', frase: 'Nubes, destellos y una bebida con carita.' },
    retro: { nombre: 'Retro de cafetería', frase: 'Neón, mostrador cromado y piso en damero.' },
    kraft: { nombre: 'Kraft natural', frase: 'Papel kraft, hojas y granos en línea fina.' },
  },
};

// Busca un texto por ruta ("controles.empezar") y reemplaza {variables}.
export function t(ruta, variables = {}) {
  let valor = ruta.split('.').reduce((nodo, parte) => (nodo == null ? nodo : nodo[parte]), textos);
  if (valor && typeof valor === 'object' && 'otros' in valor) {
    valor = Number(variables[valor.cuenta ?? 'n']) === 1 ? valor.uno : valor.otros;
  }
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
