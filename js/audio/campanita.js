// Campanita de mostrador sintetizada: parciales inarmónicos de campana con caída exponencial
// y un golpe corto de ruido para el ataque del metal.
// Si pones un archivo CC0 en assets/sonidos/campanita.mp3 y lo registras en assets/sonidos/LEEME.md,
// se puede cambiar aquí por una reproducción del archivo.
import { audio } from './motor.js';

const PARCIALES = [
  { razon: 1, amplitud: 1, caida: 2.6 },
  { razon: 2.756, amplitud: 0.5, caida: 1.4 },
  { razon: 5.404, amplitud: 0.28, caida: 0.8 },
  { razon: 8.933, amplitud: 0.12, caida: 0.45 },
  { razon: 13.34, amplitud: 0.05, caida: 0.25 },
];

let ruidoCache = null;

function ruidoBlanco(ctx) {
  if (ruidoCache && ruidoCache.sampleRate === ctx.sampleRate) return ruidoCache;
  const largo = Math.floor(ctx.sampleRate * 0.04);
  ruidoCache = ctx.createBuffer(1, largo, ctx.sampleRate);
  const datos = ruidoCache.getChannelData(0);
  for (let i = 0; i < largo; i++) datos[i] = (Math.random() * 2 - 1) * (1 - i / largo);
  return ruidoCache;
}

function golpe(ctx, destino, inicio, frecuencia, volumen) {
  const suavizado = ctx.createBiquadFilter();
  suavizado.type = 'lowpass';
  suavizado.frequency.value = 9000;
  const bus = ctx.createGain();
  bus.gain.value = volumen;
  bus.connect(suavizado).connect(destino);

  for (const parcial of PARCIALES) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = frecuencia * parcial.razon;
    osc.detune.value = (Math.random() - 0.5) * 5;
    const envolvente = ctx.createGain();
    envolvente.gain.setValueAtTime(0.0001, inicio);
    envolvente.gain.exponentialRampToValueAtTime(parcial.amplitud * 0.3, inicio + 0.004);
    envolvente.gain.exponentialRampToValueAtTime(0.0001, inicio + parcial.caida);
    osc.connect(envolvente).connect(bus);
    osc.start(inicio);
    osc.stop(inicio + parcial.caida + 0.05);
  }

  const ataque = ctx.createBufferSource();
  ataque.buffer = ruidoBlanco(ctx);
  const banda = ctx.createBiquadFilter();
  banda.type = 'bandpass';
  banda.frequency.value = 5200;
  banda.Q.value = 1.4;
  const nivelAtaque = ctx.createGain();
  nivelAtaque.gain.value = 0.18;
  ataque.connect(banda).connect(nivelAtaque).connect(bus);
  ataque.start(inicio);
}

// veces: 2 al terminar una taza ("din-don"), 1 al terminar un descanso.
export function tocarCampanita({ volumen = 0.7, veces = 2 } = {}) {
  const motor = audio();
  if (!motor || volumen <= 0) return;
  const { contexto: ctx, salida } = motor;
  const inicio = ctx.currentTime + 0.03;
  golpe(ctx, salida, inicio, 1568, volumen);
  if (veces > 1) golpe(ctx, salida, inicio + 0.24, 1318.5, volumen * 0.85);
}
