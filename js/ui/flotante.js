// Ventana flotante con Document Picture-in-Picture: la bebida y el reloj encima de otras apps.
// Solo existe en Chrome y Edge de escritorio; si el navegador no la tiene, el botón se oculta.
import { t } from '../textos.js';
import { ICONOS } from './iconos.js';
import { crearEscena } from '../bebidas/escena.js';
import { crearPintorReloj } from './reloj.js';

export function montarFlotante(boton, { vista, alternar, movimiento, factor, avisar = () => {} }) {
  if (!('documentPictureInPicture' in window)) {
    boton.hidden = true;
    return { actualizar() {} };
  }
  boton.innerHTML = ICONOS.flotante;
  boton.setAttribute('aria-label', t('flotante.abrir'));
  boton.title = t('flotante.abrir');

  let ventana = null;
  let escena = null;
  let el = {};
  let ultimo = '';
  let copiadas = new Set();

  // Copia los estilos de la página: los que se pueden leer van en línea (sin parpadeo);
  // los de otro origen (Google Fonts) o aún cargando se enlazan. Se repite al cambiar de tema
  // para sumar las fuentes del tema nuevo.
  function copiarEstilos(doc) {
    for (const nodo of document.querySelectorAll('link[rel="stylesheet"], style')) {
      if (copiadas.has(nodo)) continue;
      copiadas.add(nodo);
      let reglas = null;
      try {
        reglas = [...nodo.sheet.cssRules].map((regla) => regla.cssText).join('\n');
      } catch {
        reglas = null;
      }
      if (reglas !== null) {
        const estilo = doc.createElement('style');
        estilo.textContent = reglas;
        doc.head.append(estilo);
      } else if (nodo.href) {
        const enlace = doc.createElement('link');
        enlace.rel = 'stylesheet';
        enlace.href = nodo.href;
        doc.head.append(enlace);
      }
    }
  }

  function mostrarBebida() {
    const v = vista();
    copiarEstilos(ventana.document);
    el.raiz.dataset.tema = v.tema;
    escena.cambiarTema({ carita: v.carita, rearmar: false });
    escena.mostrar(v.bebida, v.escala);
  }

  // Igual que en la página: el borde de la mesa pasa por la mitad de la escena.
  function alinearMesa() {
    if (!ventana) return;
    const caja = el.escena.getBoundingClientRect();
    el.raiz.style.setProperty('--mesa-y', `${Math.round(caja.top + caja.height * 0.5)}px`);
    el.raiz.style.setProperty('--escena-x', `${Math.round(caja.left + caja.width / 2)}px`);
    el.raiz.style.setProperty('--escena-abajo', `${Math.round(caja.bottom)}px`);
  }

  // Cada cuadro mientras corre o algo se anima; quieto, revisa dos veces por segundo.
  function cuadro() {
    if (!ventana) return;
    const v = vista();
    escena.actualizar(v.estado);
    el.pintarReloj(v.reloj);
    const clave = `${v.estado.fase}|${v.texto}`;
    if (clave !== ultimo) {
      ultimo = clave;
      escena.pausar(v.estado.fase === 'pausado');
      el.boton.innerHTML = v.estado.fase === 'corriendo' ? ICONOS.pausa : ICONOS.play;
      el.boton.setAttribute('aria-label', v.texto);
      el.boton.title = v.texto;
    }
    if (v.estado.fase === 'corriendo' || escena.animando()) ventana.requestAnimationFrame(cuadro);
    else ventana.setTimeout(() => ventana?.requestAnimationFrame(cuadro), 500);
  }

  async function abrir() {
    if (ventana) {
      ventana.focus();
      return;
    }
    try {
      ventana = await window.documentPictureInPicture.requestWindow({ width: 300, height: 400 });
    } catch (error) {
      // Sin gesto del usuario solo se reintenta; si el navegador no puede, el botón se va con un aviso.
      ventana = null;
      if (error?.name !== 'NotAllowedError') {
        boton.hidden = true;
        avisar(t('flotante.noDisponible'));
      }
      return;
    }
    const doc = ventana.document;
    doc.documentElement.lang = document.documentElement.lang;
    doc.title = t('flotante.titulo');
    copiadas = new Set();
    copiarEstilos(doc);
    const raiz = doc.createElement('div');
    raiz.className = 'app flotante';
    // La mesa (o el mostrador del tema retro) es la misma de la página, con su tema.
    raiz.innerHTML = `
      <div class="fondo" aria-hidden="true"><div class="fondo-mesa"></div><div class="fondo-mostrador"></div></div>
      <div class="flotante-escena"></div>
      <div class="flotante-pie">
        <div class="reloj" role="timer"><span class="reloj-cifras"></span></div>
        <button type="button" class="boton-principal boton-flotante"></button>
      </div>`;
    doc.body.append(raiz);
    el = { raiz, pintarReloj: crearPintorReloj(raiz.querySelector('.reloj-cifras')), boton: raiz.querySelector('.boton-flotante'), escena: raiz.querySelector('.flotante-escena') };
    escena = crearEscena(el.escena, { movimiento, factor, ventana });
    mostrarBebida();
    alinearMesa();
    ventana.addEventListener('resize', alinearMesa);
    el.boton.addEventListener('click', () => alternar());
    doc.addEventListener('keydown', (evento) => {
      if (evento.code === 'Space' && !evento.repeat) {
        evento.preventDefault();
        alternar();
      }
    });
    ultimo = '';
    boton.setAttribute('aria-pressed', 'true');
    ventana.addEventListener('pagehide', () => {
      ventana = null;
      escena = null;
      boton.setAttribute('aria-pressed', 'false');
    });
    cuadro();
  }

  boton.addEventListener('click', () => abrir());

  return {
    // Cambió la bebida, el tamaño o el tema: la ventana flotante se pone al día.
    actualizar() {
      if (ventana && escena) mostrarBebida();
    },
  };
}
