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
