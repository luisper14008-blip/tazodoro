// Nombres que dependen de la bebida y el tamaño: "Cappuccino mediano", "Espresso doppio".
import { t, textos } from './textos.js';

export const TAMANOS = ['pequena', 'mediana', 'grande', 'personalizada'];

export function nombreBebida(id) {
  return t(`bebidas.${id}.nombre`);
}

export function nombreTamano(bebidaId, tamano) {
  return textos.tamanosEspeciales[bebidaId]?.[tamano] ?? t(`tamanos.${tamano}`);
}

export function nombrePedido(bebidaId, tamano, minutos) {
  const bebida = nombreBebida(bebidaId);
  if (tamano === 'personalizada') return t('pedido.personalizado', { bebida, n: minutos });
  // En la frase el tamaño va en minúscula: "Espresso doppio", como "Cappuccino mediano".
  const especial = textos.tamanosEspeciales[bebidaId]?.[tamano]?.toLocaleLowerCase('es');
  return t('pedido.conTamano', { bebida, tamano: especial ?? t(`adjetivos.${tamano}`) });
}
