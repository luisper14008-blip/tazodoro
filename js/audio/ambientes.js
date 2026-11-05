// Sonidos de ambiente con Web Audio: murmullo de cafetería, lluvia y cafetera.
// Para usar una grabación CC0 en vez del sonido sintetizado, pon su ruta en FUENTES
// (por ejemplo 'assets/sonidos/lluvia.ogg') y anota el crédito en assets/sonidos/CREDITOS.md.
import { audio } from './motor.js';

export const FUENTES = {
  murmullo: null,
  lluvia: null,
  cafetera: null,
};

export const AMBIENTES = ['murmullo', 'lluvia', 'cafetera'];

// Ajuste de nivel para que los tres suenen parejo con el mismo volumen (la lluvia tiene más agudos y se oye más).
const NIVEL = { murmullo: 1.7, lluvia: 1, cafetera: 1.5 };

const azar = (min, max) => min + Math.random() * (max - min);

// Ruido en un buffer que se repite: blanco, rosa o café (más grave).
function bufferRuido(ctx, segundos, tipo) {
  const largo = Math.floor(ctx.sampleRate * segundos);
  const buffer = ctx.createBuffer(2, largo, ctx.sampleRate);
  for (let canal = 0; canal < 2; canal++) {
    const datos = buffer.getChannelData(canal);
    let [b0, b1, b2, b3, b4, b5, b6, previo] = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < largo; i++) {
      const blanco = Math.random() * 2 - 1;
      if (tipo === 'rosa') {
        b0 = 0.99886 * b0 + blanco * 0.0555179;
        b1 = 0.99332 * b1 + blanco * 0.0750759;
        b2 = 0.969 * b2 + blanco * 0.153852;
        b3 = 0.8665 * b3 + blanco * 0.3104856;
        b4 = 0.55 * b4 + blanco * 0.5329522;
        b5 = -0.7616 * b5 - blanco * 0.016898;
        datos[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + blanco * 0.5362) * 0.11;
        b6 = blanco * 0.115926;
      } else if (tipo === 'cafe') {
        previo = (previo + 0.02 * blanco) / 1.02;
        datos[i] = previo * 3.5;
      } else {
        datos[i] = blanco;
      }
    }
  }
  return buffer;
}

// Gotas: clics cortos y agudos repartidos al azar en un buffer de varios segundos.
function bufferGotas(ctx, segundos) {
  const largo = Math.floor(ctx.sampleRate * segundos);
  const buffer = ctx.createBuffer(2, largo, ctx.sampleRate);
  for (let canal = 0; canal < 2; canal++) {
    const datos = buffer.getChannelData(canal);
    const cantidad = Math.floor(segundos * 55);
    for (let k = 0; k < cantidad; k++) {
      const inicio = Math.floor(Math.random() * largo);
      const tono = azar(1800, 5200);
      const fuerza = azar(0.05, 0.3);
      const dura = Math.floor(ctx.sampleRate * azar(0.004, 0.018));
      for (let i = 0; i < dura && inicio + i < largo; i++) {
        const t = i / ctx.sampleRate;
        datos[inicio + i] += Math.sin(2 * Math.PI * tono * t) * fuerza * Math.exp(-i / (dura * 0.25));
      }
    }
  }
  return buffer;
}

function lazo(ctx, buffer, destino) {
  const fuente = ctx.createBufferSource();
  fuente.buffer = buffer;
  fuente.loop = true;
  fuente.connect(destino);
  fuente.start(ctx.currentTime + azar(0, 0.05), azar(0, buffer.duration));
  return fuente;
}

function filtro(ctx, tipo, frecuencia, q = 0.7) {
  const f = ctx.createBiquadFilter();
  f.type = tipo;
  f.frequency.value = frecuencia;
  f.Q.value = q;
  return f;
}

function ganancia(ctx, valor) {
  const g = ctx.createGain();
  g.gain.value = valor;
  return g;
}

// ---------- Lluvia: siseo constante, gotas y un retumbo grave ----------
function lluvia(ctx, destino) {
  const siseo = ganancia(ctx, 0.55);
  siseo.connect(destino);
  const altos = filtro(ctx, 'highpass', 450);
  altos.connect(filtro(ctx, 'lowpass', 7000)).connect(siseo);
  const fuentes = [lazo(ctx, bufferRuido(ctx, 5, 'rosa'), altos)];
  const gotas = ganancia(ctx, 0.5);
  gotas.connect(destino);
  fuentes.push(lazo(ctx, bufferGotas(ctx, 7), gotas));
  const retumbo = ganancia(ctx, 0.35);
  retumbo.connect(destino);
  const grave = filtro(ctx, 'lowpass', 380);
  grave.connect(retumbo);
  fuentes.push(lazo(ctx, bufferRuido(ctx, 6, 'cafe'), grave));
  return { detener: () => fuentes.forEach((f) => f.stop()) };
}

// ---------- Murmullo: voces lejanas que suben y bajan, y algún tintineo de taza ----------
function murmullo(ctx, destino) {
  const fuentes = [];
  const osciladores = [];
  const ruido = bufferRuido(ctx, 6, 'rosa');
  for (const [frecuencia, q, vel, base] of [[420, 1.2, 0.17, 0.35], [880, 1.4, 0.23, 0.28], [1500, 1.6, 0.31, 0.2], [2600, 2, 0.13, 0.1]]) {
    const voz = ganancia(ctx, base);
    voz.connect(destino);
    const banda = filtro(ctx, 'bandpass', frecuencia, q);
    banda.connect(voz);
    fuentes.push(lazo(ctx, ruido, banda));
    // Subidas y bajadas lentas (conversación) y un temblor rápido (sílabas).
    for (const [hz, profundidad] of [[vel, base * 0.7], [azar(3.5, 5.5), base * 0.25]]) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = hz;
      const cuanto = ganancia(ctx, profundidad);
      lfo.connect(cuanto).connect(voz.gain);
      lfo.start();
      osciladores.push(lfo);
    }
  }
  const sala = ganancia(ctx, 0.25);
  sala.connect(destino);
  const grave = filtro(ctx, 'lowpass', 300);
  grave.connect(sala);
  fuentes.push(lazo(ctx, bufferRuido(ctx, 6, 'cafe'), grave));

  let espera = 0;
  const tintineo = () => {
    const t = ctx.currentTime + 0.02;
    const paneo = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const salida = ganancia(ctx, 1);
    if (paneo) {
      paneo.pan.value = azar(-0.8, 0.8);
      salida.connect(paneo).connect(destino);
    } else salida.connect(destino);
    const base = azar(2200, 3600);
    for (const [razon, fuerza] of [[1, 0.06], [2.4, 0.03], [3.9, 0.015]]) {
      const osc = ctx.createOscillator();
      osc.frequency.value = base * razon;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(fuerza, t + 0.003);
      env.gain.exponentialRampToValueAtTime(0.0001, t + azar(0.25, 0.6));
      osc.connect(env).connect(salida);
      osc.start(t);
      osc.stop(t + 0.7);
    }
    espera = setTimeout(tintineo, azar(2500, 9000));
  };
  espera = setTimeout(tintineo, azar(1500, 4000));
  return {
    detener() {
      clearTimeout(espera);
      fuentes.forEach((f) => f.stop());
      osciladores.forEach((o) => o.stop());
    },
  };
}

// ---------- Cafetera: zumbido de fondo y, de vez en cuando, vapor, bomba o golpe del portafiltro ----------
function cafetera(ctx, destino) {
  const fuentes = [];
  const zumbido = ganancia(ctx, 0.12);
  zumbido.connect(destino);
  const grave = filtro(ctx, 'lowpass', 160);
  grave.connect(zumbido);
  fuentes.push(lazo(ctx, bufferRuido(ctx, 5, 'cafe'), grave));
  const ruido = bufferRuido(ctx, 4, 'blanco');

  const envolvente = (nodo, t, subida, duracion, bajada, pico) => {
    nodo.gain.setValueAtTime(0.0001, t);
    nodo.gain.exponentialRampToValueAtTime(pico, t + subida);
    nodo.gain.setValueAtTime(pico, t + subida + duracion);
    nodo.gain.exponentialRampToValueAtTime(0.0001, t + subida + duracion + bajada);
  };

  const eventos = {
    vapor(t) {
      const dura = azar(1.8, 3.6);
      const env = ganancia(ctx, 0.0001);
      env.connect(destino);
      const fuente = ctx.createBufferSource();
      fuente.buffer = ruido;
      fuente.connect(filtro(ctx, 'highpass', 2200)).connect(filtro(ctx, 'peaking', 5200, 1.2)).connect(env);
      envolvente(env, t, 0.25, dura, 0.6, 0.35);
      fuente.start(t);
      fuente.stop(t + dura + 1);
    },
    bomba(t) {
      const dura = azar(2.5, 4);
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = azar(48, 60);
      const env = ganancia(ctx, 0.0001);
      osc.connect(filtro(ctx, 'lowpass', 240)).connect(env).connect(destino);
      envolvente(env, t, 0.15, dura, 0.4, 0.22);
      osc.start(t);
      osc.stop(t + dura + 0.6);
    },
    golpe(t) {
      for (const desfase of [0, azar(0.35, 0.5)]) {
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(110, t + desfase);
        osc.frequency.exponentialRampToValueAtTime(48, t + desfase + 0.12);
        const env = ganancia(ctx, 0.0001);
        osc.connect(env).connect(destino);
        envolvente(env, t + desfase, 0.004, 0.01, 0.16, 0.5);
        osc.start(t + desfase);
        osc.stop(t + desfase + 0.25);
      }
    },
  };
  let espera = 0;
  const siguiente = () => {
    const nombres = Object.keys(eventos);
    eventos[nombres[Math.floor(Math.random() * nombres.length)]](ctx.currentTime + 0.05);
    espera = setTimeout(siguiente, azar(9000, 22000));
  };
  espera = setTimeout(siguiente, azar(2000, 5000));
  return {
    detener() {
      clearTimeout(espera);
      fuentes.forEach((f) => f.stop());
    },
  };
}

const SINTETIZADOS = { murmullo, lluvia, cafetera };

// Grabación CC0 en bucle, si está configurada.
async function desdeArchivo(ctx, ruta, destino) {
  const respuesta = await fetch(ruta);
  const buffer = await ctx.decodeAudioData(await respuesta.arrayBuffer());
  const fuente = lazo(ctx, buffer, destino);
  return { detener: () => fuente.stop() };
}

export function crearAmbientes() {
  const canales = {};

  function canal(id) {
    const motor = audio();
    if (!motor) return null;
    if (!canales[id]) {
      const volumen = motor.contexto.createGain();
      volumen.gain.value = 0;
      volumen.connect(motor.salida);
      canales[id] = { volumen, sonido: null, activo: false };
    }
    return { ...canales[id], ctx: motor.contexto };
  }

  return {
    // Enciende, apaga o cambia el volumen de un ambiente (llamar dentro de un gesto del usuario).
    async fijar(id, { activo, volumen }) {
      const c = canal(id);
      if (!c) return;
      const datos = canales[id];
      const ahora = c.ctx.currentTime;
      datos.volumen.gain.cancelScheduledValues(ahora);
      datos.volumen.gain.setValueAtTime(datos.volumen.gain.value, ahora);
      datos.volumen.gain.linearRampToValueAtTime(activo ? volumen * 0.9 * NIVEL[id] : 0, ahora + 0.6);
      if (activo && !datos.sonido) {
        datos.sonido = { detener() {} };
        try {
          datos.sonido = FUENTES[id] ? await desdeArchivo(c.ctx, FUENTES[id], datos.volumen) : SINTETIZADOS[id](c.ctx, datos.volumen);
        } catch {
          datos.sonido = SINTETIZADOS[id](c.ctx, datos.volumen);
        }
      }
      if (!activo && datos.sonido) {
        const sonido = datos.sonido;
        datos.sonido = null;
        setTimeout(() => sonido.detener(), 700);
      }
      datos.activo = activo;
    },
  };
}
