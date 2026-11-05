// Íconos SVG en línea (24 × 24). Usan currentColor para tomar el color del tema.
const trazo = 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
const svg = (contenido) => `<svg class="icono-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${contenido}</svg>`;

export const ICONOS = {
  play: svg('<path d="M8.2 5.6v12.8a.8.8 0 0 0 1.2.7l10-6.4a.8.8 0 0 0 0-1.4l-10-6.4a.8.8 0 0 0-1.2.7z" fill="currentColor"/>'),
  pausa: svg('<rect x="6.6" y="5.5" width="3.8" height="13" rx="1.3" fill="currentColor"/><rect x="13.6" y="5.5" width="3.8" height="13" rx="1.3" fill="currentColor"/>'),
  reiniciar: svg(`<path d="M5.2 12a6.8 6.8 0 1 0 2-4.8" ${trazo}/><path d="M5 4.6v3.9h3.9" ${trazo}/>`),
  saltar: svg('<path d="M6 6.4v11.2a.7.7 0 0 0 1.1.6l7.6-5.6a.7.7 0 0 0 0-1.2L7.1 5.8a.7.7 0 0 0-1.1.6z" fill="currentColor"/><rect x="16.2" y="5.8" width="2.4" height="12.4" rx="1.1" fill="currentColor"/>'),
  ajustes: svg(`<path d="M4 7h9M17 7h3M4 17h3M11 17h9" ${trazo}/><circle cx="15" cy="7" r="2.2" ${trazo}/><circle cx="9" cy="17" r="2.2" ${trazo}/>`),
  racha: svg(`<path d="M5 10.5h11.2v3.6a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z" ${trazo}/><path d="M16.2 11.6h1.4a2.4 2.4 0 0 1 0 4.8h-1.6" ${trazo}/><path d="M8.6 3.6c-.9 1.1.9 2.1 0 3.4M12.4 3.6c-.9 1.1.9 2.1 0 3.4" ${trazo}/>`),
  abajo: svg(`<path d="M7 10l5 5 5-5" ${trazo}/>`),
  musica: svg(`<path d="M9 17.5V6.2l10-2v11" ${trazo}/><circle cx="6.6" cy="17.6" r="2.5" ${trazo}/><circle cx="16.6" cy="15.3" r="2.5" ${trazo}/>`),
  silencio: svg(`<path d="M9 17.5V6.2l10-2v11" ${trazo}/><circle cx="6.6" cy="17.6" r="2.5" ${trazo}/><circle cx="16.6" cy="15.3" r="2.5" ${trazo}/><path d="M4 4l16 16" ${trazo}/>`),
  tareas: svg(`<path d="M10 7h10M10 12h10M10 17h10" ${trazo}/><path d="M3.8 7l1.4 1.4L7.6 6M3.8 12l1.4 1.4 2.4-2.4" ${trazo}/><circle cx="5.4" cy="17.2" r="1.2" fill="currentColor"/>`),
  estadisticas: svg(`<path d="M5 19.5V12M10 19.5V6M15 19.5v-9M20 19.5V9" ${trazo}/>`),
  flotante: svg(`<rect x="3" y="5" width="18" height="14" rx="2.5" ${trazo}/><rect x="12" y="12" width="7" height="5" rx="1.2" fill="currentColor"/>`),
  asa: svg('<circle cx="9" cy="7" r="1.5" fill="currentColor"/><circle cx="15" cy="7" r="1.5" fill="currentColor"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/><circle cx="9" cy="17" r="1.5" fill="currentColor"/><circle cx="15" cy="17" r="1.5" fill="currentColor"/>'),
  lapiz: svg(`<path d="M4.5 19.5l1-4.2L15.8 5a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.7 18.5z" ${trazo}/><path d="M13.6 7.2l3.2 3.2" ${trazo}/>`),
  papelera: svg(`<path d="M5 7h14M9.5 7V4.8h5V7M7 7l.9 12.2a1.6 1.6 0 0 0 1.6 1.4h5a1.6 1.6 0 0 0 1.6-1.4L17 7" ${trazo}/>`),
  diana: svg(`<circle cx="12" cy="12" r="8" ${trazo}/><circle cx="12" cy="12" r="4" ${trazo}/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>`),
  descargar: svg(`<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14" ${trazo}/>`),
  // Sonidos de ambiente.
  murmullo: svg(`<path d="M5 4.5h7.5a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8.6l-3.1 2.6v-2.6H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z" ${trazo}/><path d="M17.2 8.6H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-.5v2.6l-3.1-2.6H12a2 2 0 0 1-2-2v-.4" ${trazo}/>`),
  lluvia: svg(`<path d="M7 14h9.5a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 7.3 8.1 3 3 0 0 0 7 14z" ${trazo}/><path d="M8.6 17.2l-.9 2.4M12.6 17.2l-.9 2.4M16.6 17.2l-.9 2.4" ${trazo}/>`),
  cafetera: svg(`<rect x="4" y="3.5" width="16" height="6" rx="1.6" ${trazo}/><circle cx="8" cy="6.5" r="1" fill="currentColor"/><path d="M9.2 9.5v2h5.6v-2M12 13v1.2" ${trazo}/><path d="M8.6 15.6h6.8v1.1a3 3 0 0 1-3 3h-.8a3 3 0 0 1-3-3z" ${trazo}/>`),
  // Tacita para elegir tamaño: crece con el tamaño.
  tamano(escala) {
    const e = escala;
    const ancho = 12 * e;
    const alto = 8.6 * e;
    const x = 11 - ancho / 2;
    const y = 19.5 - alto;
    return svg(`<path d="M${x} ${y}h${ancho}v${alto * 0.45}a${ancho / 2} ${alto * 0.55} 0 0 1-${ancho} 0z" ${trazo}/><path d="M${x + ancho} ${y + alto * 0.18}h1.3a1.9 1.9 0 0 1 0 3.8h-1.4" ${trazo}/>`);
  },
};
