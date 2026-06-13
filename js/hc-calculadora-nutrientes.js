/**
 * Calculadora de Nutrientes con NER y Dilución
 * Basado en investigación de: Coco For Cannabis, Blimburn Seeds
 * Incluye cálculos de NER (Nutrient Element Ratio), dilución, conversión de unidades
 * Versión: 1.0.0
 */

// ════════════════════════════════════════════════
// RANGOS NER (Nutrient Element Ratio)
// ════════════════════════════════════════════════

const NER_RANGOS = {
  vegetativo: {
    n: { min: 3, max: 5 },
    p: { min: 1, max: 2 },
    k: { min: 4, max: 6 },
    descripcion: 'Alto nitrógeno para crecimiento vegetativo'
  },
  floracion: {
    n: { min: 1, max: 3 },
    p: { min: 4, max: 8 },
    k: { min: 6, max: 10 },
    descripcion: 'Alto fósforo y potasio para floración'
  },
  transicion: {
    n: { min: 2, max: 4 },
    p: { min: 3, max: 5 },
    k: { min: 5, max: 7 },
    descripcion: 'Transición de vegetativo a floración'
  }
};

// ════════════════════════════════════════════════
// FUNCIONES DE CÁLCULO DE NER
// ════════════════════════════════════════════════

/**
 * Calcula el NER (Nutrient Element Ratio) de una solución
 * @param {Object} elementos - { n, p, k } en ppm o mg/L
 * @returns {Object} NER calculado
 */
function calcularNER(elementos) {
  const e = elementos || {};
  const n = Number(e.n) || 0;
  const p = Number(e.p) || 0;
  const k = Number(e.k) || 0;
  
  const total = n + p + k;
  if (total === 0) {
    return { n: 0, p: 0, k: 0, total: 0 };
  }
  
  return {
    n: Math.round((n / total) * 10) / 10,
    p: Math.round((p / total) * 10) / 10,
    k: Math.round((k / total) * 10) / 10,
    total: total
  };
}

/**
 * Valida si un NER es adecuado para una fase
 * @param {Object} ner - { n, p, k }
 * @param {string} fase - 'vegetativo' | 'floracion' | 'transicion'
 * @returns {Object} { valido: boolean, mensajes: Array }
 */
function validarNER(ner, fase) {
  const rango = NER_RANGOS[fase] || NER_RANGOS.vegetativo;
  const n = ner || {};
  const mensajes = [];
  let valido = true;
  
  if (n.n < rango.n.min || n.n > rango.n.max) {
    valido = false;
    mensajes.push({
      tipo: 'warning',
      texto: `N (${n.n}) fuera de rango recomendado (${rango.n.min}-${rango.n.max})`
    });
  }
  
  if (n.p < rango.p.min || n.p > rango.p.max) {
    valido = false;
    mensajes.push({
      tipo: 'warning',
      texto: `P (${n.p}) fuera de rango recomendado (${rango.p.min}-${rango.p.max})`
    });
  }
  
  if (n.k < rango.k.min || n.k > rango.k.max) {
    valido = false;
    mensajes.push({
      tipo: 'warning',
      texto: `K (${n.k}) fuera de rango recomendado (${rango.k.min}-${rango.k.max})`
    });
  }
  
  if (valido) {
    mensajes.push({
      tipo: 'success',
      texto: 'NER dentro de rango recomendado'
    });
  }
  
  return { valido, mensajes };
}

/**
 * Obtiene NER recomendado para una fase
 * @param {string} fase - 'vegetativo' | 'floracion' | 'transicion'
 * @returns {Object} NER recomendado
 */
function obtenerNERRecomendado(fase) {
  const rango = NER_RANGOS[fase] || NER_RANGOS.vegetativo;
  
  return {
    n: (rango.n.min + rango.n.max) / 2,
    p: (rango.p.min + rango.p.max) / 2,
    k: (rango.k.min + rango.k.max) / 2,
    descripcion: rango.descripcion
  };
}

// ════════════════════════════════════════════════
// FUNCIONES DE DILUCIÓN
// ════════════════════════════════════════════════

/**
 * Calcula la cantidad de nutriente concentrado a añadir
 * @param {number} volumenFinal - Volumen final deseado en litros
 * @param {number} ecObjetivo - EC objetivo en µS/cm
 * @param {number} ecAgua - EC del agua base en µS/cm
 * @param {number} ecNutriente - EC del nutriente concentrado en µS/cm
 * @returns {Object} { volumenNutriente: number (ml), ecFinal: number }
 */
function calcularDilucion(volumenFinal, ecObjetivo, ecAgua, ecNutriente) {
  const vol = Number(volumenFinal) || 0;
  const ecObj = Number(ecObjetivo) || 0;
  const ecA = Number(ecAgua) || 0;
  const ecNut = Number(ecNutriente) || 0;
  
  if (vol === 0 || ecNut === 0) {
    return { volumenNutriente: 0, ecFinal: ecA };
  }
  
  // EC que necesitamos añadir del nutriente
  const ecNecesaria = ecObj - ecA;
  
  if (ecNecesaria <= 0) {
    return { volumenNutriente: 0, ecFinal: ecA };
  }
  
  // Volumen de nutriente = (EC necesaria / EC nutriente) * volumen final
  const volNutriente = (ecNecesaria / ecNut) * vol;
  
  return {
    volumenNutriente: Math.round(volNutriente * 100) / 100,
    ecFinal: ecObj
  };
}

/**
 * Calcula la dilución para múltiples nutrientes
 * @param {number} volumenFinal - Volumen final en litros
 * @param {Array} nutrientes - Array de { nombre, ecConcentrado, proporcion }
 * @param {number} ecObjetivo - EC objetivo total
 * @param {number} ecAgua - EC del agua base
 * @returns {Object} { mezcla: Array, ecFinal: number }
 */
function calcularMezclaMultiple(volumenFinal, nutrientes, ecObjetivo, ecAgua) {
  const vol = Number(volumenFinal) || 0;
  const ecObj = Number(ecObjetivo) || 0;
  const ecA = Number(ecAgua) || 0;
  const nuts = nutrientes || [];
  
  const ecNecesaria = ecObj - ecA;
  if (ecNecesaria <= 0 || nuts.length === 0) {
    return { mezcla: [], ecFinal: ecA };
  }
  
  // Calcular proporción total
  const proporcionTotal = nuts.reduce((sum, n) => sum + (n.proporcion || 1), 0);
  
  // Calcular volumen de cada nutriente
  const mezcla = nuts.map(n => {
    const proporcion = n.proporcion || 1;
    const proporcionRelativa = proporcion / proporcionTotal;
    const ecNecesariaNutriente = ecNecesaria * proporcionRelativa;
    const volNutriente = (ecNecesariaNutriente / (n.ecConcentrado || 1000)) * vol;
    
    return {
      nombre: n.nombre,
      volumen: Math.round(volNutriente * 100) / 100,
      ecAportada: ecNecesariaNutriente
    };
  });
  
  return {
    mezcla: mezcla,
    ecFinal: ecObj
  };
}

/**
 * Calcula el EC resultante después de añadir nutrientes
 * @param {number} volumenAgua - Volumen de agua en litros
 * @param {number} ecAgua - EC del agua base
 * @param {Array} adiciones - Array de { volumen, ecConcentrado }
 * @returns {number} EC resultante
 */
function calcularECResultado(volumenAgua, ecAgua, adiciones) {
  const vol = Number(volumenAgua) || 0;
  const ecA = Number(ecAgua) || 0;
  const adds = adiciones || [];
  
  let ecTotal = ecA * vol;
  let volumenTotal = vol;
  
  adds.forEach(add => {
    const volAdd = Number(add.volumen) || 0;
    const ecAdd = Number(add.ecConcentrado) || 0;
    
    ecTotal += ecAdd * volAdd;
    volumenTotal += volAdd;
  });
  
  if (volumenTotal === 0) return 0;
  
  return Math.round((ecTotal / volumenTotal) * 10) / 10;
}

// ════════════════════════════════════════════════
// CONVERSIONES DE UNIDADES
// ════════════════════════════════════════════════

/**
 * Convierte EC de µS/cm a mS/cm
 * @param {number} ecUs - EC en µS/cm
 * @returns {number} EC en mS/cm
 */
function ecUsAMs(ecUs) {
  return Math.round((Number(ecUs) / 1000) * 100) / 100;
}

/**
 * Convierte EC de mS/cm a µS/cm
 * @param {number} ecMs - EC en mS/cm
 * @returns {number} EC en µS/cm
 */
function ecMsAUs(ecMs) {
  return Math.round(Number(ecMs) * 1000);
}

/**
 * Convierte ppm a mg/L (equivalente para soluciones acuosas)
 * @param {number} ppm - Valor en ppm
 * @returns {number} Valor en mg/L
 */
function ppmAMgL(ppm) {
  return Number(ppm);
}

/**
 * Convierte mg/L a ppm (equivalente para soluciones acuosas)
 * @param {number} mgL - Valor en mg/L
 * @returns {number} Valor en ppm
 */
function mgLAPpm(mgL) {
  return Number(mgL);
}

/**
 * Convierte ml a L
 * @param {number} ml - Valor en mililitros
 * @returns {number} Valor en litros
 */
function mlAL(ml) {
  return Math.round((Number(ml) / 1000) * 1000) / 1000;
}

/**
 * Convierte L a ml
 * @param {number} l - Valor en litros
 * @returns {number} Valor en mililitros
 */
function lAMl(l) {
  return Math.round(Number(l) * 1000);
}

// ════════════════════════════════════════════════
// FUNCIONES DE RECETA
// ════════════════════════════════════════════════

/**
 * Genera una receta de nutrientes según fase y EC objetivo
 * @param {string} fase - 'vegetativo' | 'floracion' | 'transicion'
 * @param {number} ecObjetivo - EC objetivo en µS/cm
 * @param {number} volumen - Volumen en litros
 * @param {number} ecAgua - EC del agua base
 * @returns {Object} Receta completa
 */
function generarReceta(fase, ecObjetivo, volumen, ecAgua) {
  const ner = obtenerNERRecomendado(fase);
  const ecObj = Number(ecObjetivo) || 1400;
  const vol = Number(volumen) || 10;
  const ecA = Number(ecAgua) || 100;
  
  return {
    fase: fase,
    nerRecomendado: ner,
    ecObjetivo: ecObj,
    volumen: vol,
    ecAgua: ecA,
    ecNecesaria: ecObj - ecA,
    instrucciones: [
      `1. Medir ${vol}L de agua (EC base: ${ecA} µS/cm)`,
      `2. Ajustar pH a 5.8-6.0`,
      `3. Añadir nutrientes hasta alcanzar EC ${ecObj} µS/cm`,
      `4. Mezclar bien y verificar pH final`,
      `5. Aplicar según frecuencia de riego recomendada`
    ]
  };
}

/**
 * Calcula la receta para un nutriente específico (ej. Canna Aqua)
 * @param {string} nutriente - Nombre del nutriente
 * @param {number} volumen - Volumen en litros
 * @param {number} ecObjetivo - EC objetivo en µS/cm
 * @param {string} fase - 'vegetativo' | 'floracion'
 * @returns {Object} Receta específica
 */
function calcularRecetaNutriente(nutriente, volumen, ecObjetivo, fase) {
  const vol = Number(volumen) || 10;
  const ecObj = Number(ecObjetivo) || 1400;
  const f = String(fase).toLowerCase();
  
  // Valores típicos de EC concentrado (aproximados)
  const ecConcentrado = 10000; // 10 mS/cm típico para nutrientes concentrados
  
  const dilucion = calcularDilucion(vol, ecObj, 100, ecConcentrado);
  
  return {
    nutriente: nutriente,
    volumen: vol,
    ecObjetivo: ecObj,
    fase: fase,
    volumenNutriente: dilucion.volumenNutriente,
    ecConcentrado: ecConcentrado,
    instrucciones: [
      `1. Medir ${vol}L de agua`,
      `2. Añadir ${dilucion.volumenNutriente}ml de ${nutriente}`,
      `3. Mezclar bien`,
      `4. Verificar EC (${ecObj} µS/cm) y pH (5.8-6.0)`
    ]
  };
}

// ════════════════════════════════════════════════
// EXPORTAR FUNCIONES
// ════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NER_RANGOS,
    calcularNER,
    validarNER,
    obtenerNERRecomendado,
    calcularDilucion,
    calcularMezclaMultiple,
    calcularECResultado,
    ecUsAMs,
    ecMsAUs,
    ppmAMgL,
    mgLAPpm,
    mlAL,
    lAMl,
    generarReceta,
    calcularRecetaNutriente
  };
}

// Exponer funciones globalmente para uso en la app
if (typeof window !== 'undefined') {
  window.NER_RANGOS = NER_RANGOS;
  window.calcularNER = calcularNER;
  window.validarNER = validarNER;
  window.obtenerNERRecomendado = obtenerNERRecomendado;
  window.calcularDilucion = calcularDilucion;
  window.calcularMezclaMultiple = calcularMezclaMultiple;
  window.calcularECResultado = calcularECResultado;
  window.ecUsAMs = ecUsAMs;
  window.ecMsAUs = ecMsAUs;
  window.ppmAMgL = ppmAMgL;
  window.mgLAPpm = mgLAPpm;
  window.mlAL = mlAL;
  window.lAMl = lAMl;
  window.generarReceta = generarReceta;
  window.calcularRecetaNutriente = calcularRecetaNutriente;
}

console.log('[hc-calculadora-nutrientes] Módulo cargado correctamente');
