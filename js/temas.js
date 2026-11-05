// Temas: cada uno cambia colores, letras, fondo y estilo de controles (css/temas/*.css)
// y aquí define sus fuentes de Google (máximo dos familias), la luz de la escena y su fondo.
import { fijarLuz } from './bebidas/partes.js';
import { montarFondoNocturna } from './fondos/nocturna.js';
import { montarFondoKawaii } from './fondos/kawaii.js';
import { montarFondoRetro } from './fondos/retro.js';
import { montarFondoKraft } from './fondos/kraft.js';

export const TEMAS = {
  nocturna: {
    fuentes: 'family=Young+Serif&family=Zen+Maru+Gothic:wght@400;500;700',
    fondo: montarFondoNocturna,
    luz: { calida: '#FFE6BF', fria: '#4F5B7C', sombra: '#211A22' },
    carita: false,
    color: '#141B2E',
    esquema: 'dark',
  },
  kawaii: {
    fuentes: 'family=Cherry+Bomb+One&family=M+PLUS+Rounded+1c:wght@400;500;700;800',
    fondo: montarFondoKawaii,
    luz: { calida: '#FFF1F5', fria: '#B9A8E4', sombra: '#5A3D66' },
    carita: true,
    color: '#FFE3EC',
    esquema: 'light',
  },
  retro: {
    fuentes: 'family=Yellowtail&family=Josefin+Sans:wght@400;600;700',
    fondo: montarFondoRetro,
    luz: { calida: '#FFE7B8', fria: '#3E8E89', sombra: '#3A2418' },
    carita: false,
    color: '#F7ECD2',
    esquema: 'light',
  },
  kraft: {
    fuentes: 'family=Jost:wght@300;400;500;600&family=Caveat:wght@500;600',
    fondo: montarFondoKraft,
    luz: { calida: '#FFF5E2', fria: '#8A9A80', sombra: '#3A2A1E' },
    carita: false,
    color: '#D3B68D',
    esquema: 'light',
  },
};

export const ORDEN_TEMAS = ['nocturna', 'kawaii', 'retro', 'kraft'];

// Las fuentes del tema nocturno vienen en index.html; las demás se piden la primera vez que hacen falta.
const cargadas = new Set(['nocturna']);
export function cargarFuentes(id) {
  if (cargadas.has(id) || !TEMAS[id]) return;
  cargadas.add(id);
  const enlace = document.createElement('link');
  enlace.rel = 'stylesheet';
  enlace.href = `https://fonts.googleapis.com/css2?${TEMAS[id].fuentes}&display=swap`;
  document.head.append(enlace);
}

let fondoActual = null;

// Aplica un tema: atributo data-tema, color del navegador, luz de la escena y fondo.
export function aplicarTema(id, { raiz, fondo, movimiento }) {
  const clave = TEMAS[id] ? id : 'nocturna';
  const tema = TEMAS[clave];
  cargarFuentes(clave);
  raiz.dataset.tema = clave;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema.color);
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', tema.esquema);
  document.body.style.background = tema.color;
  fijarLuz(tema.luz);
  fondoActual?.detener?.();
  fondo.innerHTML = '';
  fondoActual = tema.fondo(fondo, { movimiento });
  return { clave, ...tema };
}
