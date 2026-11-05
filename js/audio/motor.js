// Motor de audio con Web Audio API. El navegador solo deja sonar después de un gesto del usuario,
// así que el contexto se crea (o se reanuda) la primera vez que se pulsa un botón.
let contexto = null;
let salida = null;

export function audio() {
  if (!contexto) {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return null;
    contexto = new Contexto();
    salida = contexto.createGain();
    salida.gain.value = silencio ? 0 : 1;
    salida.connect(contexto.destination);
  }
  if (contexto.state === 'suspended') contexto.resume().catch(() => {});
  return { contexto, salida };
}

// Llamar dentro de un clic o una tecla para desbloquear el sonido.
export function desbloquearAudio() {
  audio();
}

export function audioListo() {
  return Boolean(contexto && contexto.state === 'running');
}

// Silencio general: apaga ambientes y campanita sin perder sus volúmenes.
let silencio = false;
export function silenciar(valor) {
  silencio = valor;
  if (!contexto) return;
  const ahora = contexto.currentTime;
  salida.gain.cancelScheduledValues(ahora);
  salida.gain.setValueAtTime(salida.gain.value, ahora);
  salida.gain.linearRampToValueAtTime(valor ? 0 : 1, ahora + 0.25);
}
export const silenciado = () => silencio;
