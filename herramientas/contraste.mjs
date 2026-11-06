// Revisa el contraste AA de los pares de color de cada tema (texto sobre su fondo real).
// Uso: node herramientas/contraste.mjs
// AA pide 4,5:1 para texto normal y 3:1 para texto grande (24 px o más, o 19 px en negrita).

function luminancia(hex) {
  const valor = parseInt(hex.replace('#', ''), 16);
  const canales = [(valor >> 16) & 255, (valor >> 8) & 255, valor & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2];
}

function contraste(a, b) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// [qué, color del texto, color del fondo, 'normal' | 'grande' | 'grafico']
// 'grafico' (barras, íconos con significado) pide 3:1. Las barras de días pasados son el color del gráfico al 80 % sobre el panel.
const PARES = {
  nocturna: [
    ['texto sobre la pared', '#F4E9DA', '#141B2E', 'normal'],
    ['texto suave sobre la mesa', '#BCC4D9', '#3B2A22', 'normal'],
    ['texto suave sobre la mesa (abajo)', '#BCC4D9', '#2C1F19', 'normal'],
    ['botón principal', '#1E140A', '#F2A33A', 'normal'],
    ['contador activo', '#1E140A', '#F2A33A', 'normal'],
    ['enlace en los paneles', '#F2A33A', '#171D30', 'normal'],
    ['texto suave en los paneles', '#BCC4D9', '#171D30', 'normal'],
    ['barra de días pasados', '#C68838', '#171D30', 'grafico'],
  ],
  kawaii: [
    ['texto sobre el cielo', '#4E2F52', '#FFE9F0', 'normal'],
    ['texto suave sobre el mantel', '#634466', '#FFC8DA', 'normal'],
    ['texto suave sobre el mantel (abajo)', '#634466', '#FFB9CF', 'normal'],
    ['botón principal', '#3E1F42', '#FF8FB1', 'normal'],
    ['reloj sobre el mantel', '#B42D60', '#FFB9CF', 'grande'],
    ['marca sobre el cielo', '#C93D6E', '#FFD6E5', 'grande'],
    ['enlace en los paneles', '#B42D60', '#FFFBFD', 'normal'],
    ['texto suave en los paneles', '#634466', '#FFFBFD', 'normal'],
    ['barra de días pasados', '#CD6189', '#FFFBFD', 'grafico'],
    ['ícono de acento', '#C13B6C', '#FFFBFD', 'grafico'],
  ],
  retro: [
    ['texto sobre la pared', '#2E1E17', '#F7ECD2', 'normal'],
    ['texto suave sobre la pared', '#5A463C', '#F4E6C6', 'normal'],
    ['botón principal', '#2E1E17', '#E2A72E', 'normal'],
    ['reloj sobre el frente cereza', '#F7ECD2', '#C23243', 'grande'],
    ['estado sobre el frente cereza', '#FCEBD6', '#C23243', 'normal'],
    ['pedido sobre su fondo', '#F7ECD2', '#2E1E17', 'normal'],
    ['marca de neón', '#D6283C', '#FBF3DF', 'grande'],
    ['contador activo', '#FFF4E2', '#B8293A', 'normal'],
    ['enlace en los paneles', '#B8293A', '#FFF8EA', 'normal'],
    ['texto suave en los paneles', '#5A463C', '#FFF8EA', 'normal'],
    ['barra de días pasados', '#4E958F', '#FFF8EA', 'grafico'],
    ['ícono de acento', '#B8293A', '#FFF8EA', 'grafico'],
    ['tarea en curso sobre su fondo', '#FCEBD6', '#572423', 'normal'],
  ],
  kraft: [
    ['texto sobre el papel', '#2A1C14', '#D7BB93', 'normal'],
    ['texto suave sobre el papel', '#4E3423', '#CFB087', 'normal'],
    ['botón principal', '#F6EEDF', '#52664A', 'normal'],
    ['texto en los diálogos', '#2A1C14', '#EFE2C8', 'normal'],
    ['enlace en los paneles', '#52664A', '#EFE2C8', 'normal'],
    ['barra de días pasados', '#717F63', '#EFE2C8', 'grafico'],
  ],
};

let fallas = 0;
for (const [tema, pares] of Object.entries(PARES)) {
  console.log(`\n${tema}`);
  for (const [que, texto, fondo, tamano] of pares) {
    const r = contraste(texto, fondo);
    const minimo = tamano === 'normal' ? 4.5 : 3;
    const ok = r >= minimo;
    if (!ok) fallas += 1;
    console.log(`  ${ok ? 'bien' : 'FALLA'}  ${r.toFixed(2)}:1  (mín. ${minimo})  ${que}`);
  }
}
console.log(fallas ? `\n${fallas} pares no cumplen AA.` : '\nTodos los pares cumplen AA.');
process.exitCode = fallas ? 1 : 0;
