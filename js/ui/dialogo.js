// Confirmación con <dialog>: atrapa el foco y se cierra con Escape sin más código.
let dialogo = null;

function crear() {
  dialogo = document.createElement('dialog');
  dialogo.className = 'dialogo dialogo-confirmar';
  dialogo.innerHTML = `
    <form method="dialog" class="dialogo-cuerpo">
      <h2 class="dialogo-titulo"></h2>
      <p class="dialogo-texto"></p>
      <div class="dialogo-botones">
        <button value="no" class="boton-suave" autofocus></button>
        <button value="si" class="boton-acento"></button>
      </div>
    </form>`;
  document.querySelector('.app').append(dialogo);
}

export function confirmar({ titulo, texto, aceptar, cancelar }) {
  if (!dialogo) crear();
  dialogo.querySelector('.dialogo-titulo').textContent = titulo;
  dialogo.querySelector('.dialogo-texto').textContent = texto;
  dialogo.querySelector('[value="si"]').textContent = aceptar;
  dialogo.querySelector('[value="no"]').textContent = cancelar;
  dialogo.returnValue = '';
  return new Promise((resolver) => {
    dialogo.addEventListener('close', () => resolver(dialogo.returnValue === 'si'), { once: true });
    dialogo.showModal();
  });
}
