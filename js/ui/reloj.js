// Pinta el reloj con una celda por cifra para que los números no bailen con fuentes proporcionales.
// Solo toca las cifras que cambian.
export function crearPintorReloj(elemento) {
  let actual = '';
  return function pintar(texto) {
    if (texto === actual) return;
    if (texto.length !== actual.length) {
      elemento.innerHTML = [...texto].map((c) => (c === ':' ? '<span class="dos-puntos">:</span>' : `<span class="cifra">${c}</span>`)).join('');
    } else {
      [...texto].forEach((c, i) => {
        if (c !== actual[i]) elemento.children[i].textContent = c;
      });
    }
    actual = texto;
  };
}
