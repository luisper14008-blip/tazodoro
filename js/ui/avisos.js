// Todo lo que avisa al usuario: título de la pestaña, favicon, mensajes cortos,
// anuncios para lectores de pantalla y notificaciones del navegador.
import { t } from '../textos.js';
import { formatoReloj } from '../util/tiempo.js';

let ultimoFavicon = '';
let esperaMensaje = 0;

export function actualizarTitulo({ fase, bloque, restante, nombreBebida }) {
  let titulo = t('titulo.inactivo');
  if (fase !== 'listo') {
    const nombre = bloque === 'foco' ? nombreBebida : t(`bloques.${bloque}`);
    titulo = t(fase === 'pausado' ? 'titulo.pausado' : 'titulo.corriendo', { tiempo: formatoReloj(restante), nombre });
  }
  if (document.title !== titulo) document.title = titulo;
}

// Favicon: una tacita que se vacía (o se llena en el descanso) con el tiempo.
export function actualizarFavicon(nivel, acento = '#F2A33A') {
  const lleno = Math.round(Math.max(0, Math.min(1, nivel)) * 12) / 12;
  const clave = `${lleno}|${acento}`;
  if (clave === ultimoFavicon) return;
  ultimoFavicon = clave;
  const taza = 'M6 9h17v11a6 6 0 0 1-6 6h-5a6 6 0 0 1-6-6z';
  const alto = 17 * lleno;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><clipPath id="c"><path d="${taza}"/></clipPath></defs>` +
    `<path d="M23 12h2.5a3.5 3.5 0 0 1 0 7H23" fill="none" stroke="${acento}" stroke-width="2.4"/>` +
    `<path d="${taza}" fill="#F4E9DA"/><rect x="5" y="${(26 - alto).toFixed(2)}" width="19" height="${alto.toFixed(2)}" fill="#7A4A28" clip-path="url(#c)"/>` +
    `<path d="${taza}" fill="none" stroke="${acento}" stroke-width="1.8"/></svg>`;
  const enlace = document.querySelector('link[rel="icon"]');
  if (enlace) enlace.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Mensaje corto bajo el reloj (también lo leen los lectores de pantalla: role="status").
export function mostrarMensaje(texto, duracion = 5500) {
  const el = document.querySelector('.mensaje');
  if (!el) return;
  el.textContent = texto;
  el.classList.add('visible');
  clearTimeout(esperaMensaje);
  esperaMensaje = setTimeout(() => el.classList.remove('visible'), duracion);
}

export function anunciar(texto) {
  const el = document.querySelector('.anuncios');
  if (!el) return;
  el.textContent = '';
  setTimeout(() => {
    el.textContent = texto;
  }, 60);
}

export function permisoAvisos() {
  return 'Notification' in window ? Notification.permission : 'no-disponible';
}

// Se pide la primera vez que se pulsa Empezar (tiene que ser dentro del clic).
export function pedirPermisoAvisos() {
  if (permisoAvisos() !== 'default') return;
  try {
    const promesa = Notification.requestPermission();
    promesa?.catch?.(() => {});
  } catch {
    /* algunos navegadores no lo permiten fuera de una app instalada */
  }
}

// Service worker mínimo (sw.js): Android solo muestra avisos a través de él.
// Necesita https o localhost; sin él, los avisos salen directo desde la página (computador).
let registroAvisos = null;
export function registrarAvisos() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  navigator.serviceWorker.register('sw.js').then((registro) => {
    registroAvisos = registro;
  }).catch(() => {});
}

function avisoDirecto(titulo, opciones) {
  try {
    const aviso = new Notification(titulo, opciones);
    aviso.onclick = () => {
      window.focus();
      aviso.close();
    };
  } catch {
    /* este navegador no deja crear avisos desde la página */
  }
}

export function notificar(titulo, cuerpo) {
  if (permisoAvisos() !== 'granted') return;
  if (document.visibilityState === 'visible' && document.hasFocus()) return;
  const opciones = { body: cuerpo, tag: 'tazodoro', silent: true, lang: 'es', icon: 'assets/icono.svg' };
  // Con el service worker activo el aviso sale igual en Android y en computador,
  // y al tocarlo vuelve al frente esta pestaña.
  if (registroAvisos?.active) {
    registroAvisos.showNotification(titulo, opciones).catch(() => avisoDirecto(titulo, opciones));
    return;
  }
  avisoDirecto(titulo, opciones);
}
