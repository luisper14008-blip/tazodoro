// Fondo retro de cafetería (años 50 a 70): pared crema con franjas, letrero de neón con una taza,
// mostrador verde azulado con canto cromado, frente cereza y piso en damero.
const LETRERO = `<svg viewBox="0 0 220 170" aria-hidden="true">
  <g class="neon-tubo" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M52 78H150V104C150 130 128 148 101 148C74 148 52 130 52 104Z"/>
    <path d="M150 88C178 86 182 124 150 124"/>
    <path d="M36 152H166"/>
    <path class="neon-vapor" d="M82 62C72 50 92 42 82 26M102 62C92 48 112 40 102 22M122 62C112 50 132 42 122 28"/>
  </g>
</svg>`;

export function montarFondoRetro(contenedor) {
  contenedor.innerHTML = `
    <div class="fondo-pared"></div>
    <div class="fondo-franjas"></div>
    <div class="letrero-neon">${LETRERO}</div>
    <div class="fondo-mostrador"></div>
    <div class="fondo-frente"></div>
    <div class="fondo-piso"><div class="damero"></div></div>`;
  return { detener() {} };
}
