// Pulso de 1 segundo. Los temporizadores de un worker no se frenan como los de una pestaña oculta,
// así el título y el aviso de fin llegan a tiempo.
let intervalo = null;

self.onmessage = (evento) => {
  if (evento.data === 'iniciar') {
    clearInterval(intervalo);
    intervalo = setInterval(() => self.postMessage('latido'), 1000);
  } else if (evento.data === 'detener') {
    clearInterval(intervalo);
    intervalo = null;
  }
};
