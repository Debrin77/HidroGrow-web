/**
 * Calculadora de Iluminación LED para Cultivo de Cannabis
 * Basado en investigación de: Photone, Gorilla Grow Tent, Trimleaf, Cultiuana
 * Versión: 1.0.0
 */

// ══════════════════════════════════════════════════
// CÁLCULOS DE ILUMINACIÓN LED
// ══════════════════════════════════════════════════

/**
 * Calcula los watts recomendados para una carpa según tamaño y fase
 * @param {number} sqFt - Área en pies cuadrados
 * @param {string} fase - 'seedling', 'vegetativo', 'floracion'
 * @returns {Object} { min: number (W), max: number (W), recomendado: number (W) }
 */
function calcularWattsParaCarpa(sqFt, fase) {
  const area = Number(sqFt) || 0;
  const f = String(fase || '').toLowerCase();
  
  const rangoWattsSqFt = getWattsPorSqFtPorFase(f);
  const minWatts = Math.round(area * rangoWattsSqFt.min);
  const maxWatts = Math.round(area * rangoWattsSqFt.max);
  const recomendado = Math.round((minWatts + maxWatts) / 2);
  
  return {
    min: minWatts,
    max: maxWatts,
    recomendado: recomendado,
    wattsPorSqFt: rangoWattsSqFt
  };
}

/**
 * Calcula el número de plantas recomendado para una carpa según tamaño
 * @param {number} sqFt - Área en pies cuadrados
 * @param {string} metodo - 'sog' (1 sq ft por planta), 'scrog' (2 sq ft por planta), 'lst' (4 sq ft por planta)
 * @returns {Object} { min: number, max: number, recomendado: number }
 */
function calcularPlantasParaCarpa(sqFt, metodo) {
  const area = Number(sqFt) || 0;
  const m = String(metodo || '').toLowerCase();
  
  let sqFtPorPlanta;
  if (m === 'sog') sqFtPorPlanta = 1;
  else if (m === 'scrog') sqFtPorPlanta = 2;
  else if (m === 'lst' || m === 'mainlining') sqFtPorPlanta = 4;
  else sqFtPorPlanta = 2; // Por defecto SCROG
  
  const maxPlantas = Math.floor(area / sqFtPorPlanta);
  const minPlantas = Math.max(1, Math.floor(maxPlantas * 0.5));
  const recomendado = Math.floor((minPlantas + maxPlantas) / 2);
  
  return {
    min: minPlantas,
    max: maxPlantas,
    recomendado: recomendado,
    sqFtPorPlanta: sqFtPorPlanta,
    metodo: m
  };
}

/**
 * Calcula la altura recomendada de LED según fase y potencia
 * @param {string} fase - 'seedling', 'vegetativo', 'floracion'
 * @param {number} potenciaW - Potencia del LED en watts
 * @returns {Object} { min: number (pulgadas), max: number (pulgadas), dim: number (%), recomendado: number (pulgadas) }
 */
function calcularAlturaLed(fase, potenciaW) {
  const f = String(fase || '').toLowerCase();
  const watts = Number(potenciaW) || 0;
  
  const rango = getLedAlturaPorFase(f, watts);
  const recomendado = Math.round((rango.min + rango.max) / 2);
  
  return {
    min: rango.min,
    max: rango.max,
    dim: rango.dim,
    recomendado: recomendado,
    fase: f,
    potencia: watts
  };
}

/**
 * Calcula el PPFD objetivo según fase y horas de luz
 * @param {string} fase - 'seedling', 'vegetativo', 'floracion'
 * @param {number} horasLuz - Horas de luz por día
 * @returns {Object} { ppfdMin: number, ppfdMax: number, ppfdRecomendado: number, dli: number }
 */
function calcularPpfdObjetivo(fase, horasLuz) {
  const f = String(fase || '').toLowerCase();
  const horas = Number(horasLuz) || 18;
  
  const rangoPpfd = getPpfdRangoPorFase(f);
  const ppfdRecomendado = Math.round((rangoPpfd.min + rangoPpfd.max) / 2);
  
  // Calcular DLI: PPFD (µmol/m²/s) × horas × 3600 / 1,000,000 = mol/m²/d
  const dliMin = Math.round((rangoPpfd.min * horas * 3600) / 1000000 * 10) / 10;
  const dliMax = Math.round((rangoPpfd.max * horas * 3600) / 1000000 * 10) / 10;
  const dliRecomendado = Math.round((ppfdRecomendado * horas * 3600) / 1000000 * 10) / 10;
  
  return {
    ppfdMin: rangoPpfd.min,
    ppfdMax: rangoPpfd.max,
    ppfdRecomendado: ppfdRecomendado,
    dliMin: dliMin,
    dliMax: dliMax,
    dliRecomendado: dliRecomendado,
    horasLuz: horas
  };
}

/**
 * Calcula el DLI objetivo según fase
 * @param {string} fase - 'seedling', 'vegetativo', 'floracion'
 * @param {number} horasLuz - Horas de luz por día
 * @returns {Object} { min: number, max: number, target: number }
 */
function calcularDliObjetivo(fase, horasLuz) {
  const f = String(fase || '').toLowerCase();
  const horas = Number(horasLuz) || 18;
  
  return getDliPorFase(f, horas);
}

/**
 * Genera recomendaciones completas de iluminación para una carpa
 * @param {Object} params - { sqFt, fase, metodo, potenciaW, horasLuz }
 * @returns {Object} Recomendaciones completas
 */
function generarRecomendacionIluminacion(params) {
  const p = params || {};
  const sqFt = Number(p.sqFt) || 16; // Por defecto 4x4
  const fase = p.fase || 'vegetativo';
  const metodo = p.metodo || 'scrog';
  const potenciaW = Number(p.potenciaW) || 0;
  const horasLuz = Number(p.horasLuz) || (fase === 'floracion' ? 12 : 18);
  
  // Calcular watts
  const watts = calcularWattsParaCarpa(sqFt, fase);
  
  // Calcular plantas
  const plantas = calcularPlantasParaCarpa(sqFt, metodo);
  
  // Calcular altura LED
  const potenciaUsar = potenciaW > 0 ? potenciaW : watts.recomendado;
  const altura = calcularAlturaLed(fase, potenciaUsar);
  
  // Calcular PPFD/DLI
  const ppfdDli = calcularPpfdObjetivo(fase, horasLuz);
  
  // Calcular costo mensual estimado
  const costoMensual = calcularCostoElectricidad(potenciaUsar, horasLuz);
  
  return {
    watts: watts,
    plantas: plantas,
    altura: altura,
    ppfdDli: ppfdDli,
    costoMensual: costoMensual,
    parametros: {
      sqFt: sqFt,
      fase: fase,
      metodo: metodo,
      potencia: potenciaUsar,
      horasLuz: horasLuz
    }
  };
}

/**
 * Calcula el costo mensual estimado de electricidad para una luz LED
 * @param {number} watts - Potencia en watts
 * @param {number} horasPorDia - Horas de uso por día
 * @param {number} costoKwh - Costo por kWh (por defecto $0.12)
 * @returns {Object} { costoMensual: number, costoAnual: number }
 */
function calcularCostoElectricidad(watts, horasPorDia, costoKwh) {
  const w = Number(watts) || 0;
  const horas = Number(horasPorDia) || 18;
  const costo = Number(costoKwh) || 0.12;
  
  const kwhPorDia = (w * horas) / 1000;
  const kwhPorMes = kwhPorDia * 30;
  const costoMensual = Math.round(kwhPorMes * costo * 100) / 100;
  const costoAnual = Math.round(costoMensual * 12 * 100) / 100;
  
  return {
    costoMensual: costoMensual,
    costoAnual: costoAnual,
    kwhPorDia: Math.round(kwhPorDia * 100) / 100,
    kwhPorMes: Math.round(kwhPorMes * 100) / 100
  };
}

/**
 * Genera tabla de watts por tamaño de carpa
 * @param {string} fase - 'seedling', 'vegetativo', 'floracion'
 * @returns {Array} Array de objetos con información por tamaño de carpa
 */
function generarTablaWattsPorCarpa(fase) {
  const tamanos = [
    { nombre: '2x2', sqFt: 4 },
    { nombre: '2x4', sqFt: 8 },
    { nombre: '3x3', sqFt: 9 },
    { nombre: '4x4', sqFt: 16 },
    { nombre: '5x5', sqFt: 25 },
    { nombre: '4x8', sqFt: 32 }
  ];
  
  return tamanos.map(t => {
    const watts = calcularWattsParaCarpa(t.sqFt, fase);
    return {
      nombre: t.nombre,
      sqFt: t.sqFt,
      wattsMin: watts.min,
      wattsMax: watts.max,
      wattsRecomendado: watts.recomendado
    };
  });
}

/**
 * Genera tabla de altura LED por potencia y fase
 * @param {string} fase - 'seedling', 'vegetativo', 'floracion'
 * @returns {Array} Array de objetos con información por potencia
 */
function generarTablaAlturaLed(fase) {
  const potencias = [220, 330, 420, 600, 750, 1000];
  
  return potencias.map(w => {
    const altura = calcularAlturaLed(fase, w);
    return {
      potencia: w,
      alturaMin: altura.min,
      alturaMax: altura.max,
      alturaRecomendada: altura.recomendado,
      dim: altura.dim
    };
  });
}

/**
 * Valida si la configuración de iluminación es adecuada
 * @param {Object} config - { sqFt, watts, fase }
 * @returns {Object} { valida: boolean, mensajes: Array }
 */
function validarConfiguracionIluminacion(config) {
  const c = config || {};
  const sqFt = Number(c.sqFt) || 0;
  const watts = Number(c.watts) || 0;
  const fase = c.fase || 'vegetativo';
  
  const mensajes = [];
  let valida = true;
  
  // Verificar watts por pie cuadrado
  if (sqFt > 0 && watts > 0) {
    const wattsPorSqFt = watts / sqFt;
    const rango = getWattsPorSqFtPorFase(fase);
    
    if (wattsPorSqFt < rango.min) {
      valida = false;
      mensajes.push({
        tipo: 'warning',
        texto: `Watts por pie cuadrado (${wattsPorSqFt.toFixed(1)} W/sq ft) es menor al recomendado (${rango.min}-${rango.max} W/sq ft). Considera aumentar la potencia.`
      });
    } else if (wattsPorSqFt > rango.max) {
      mensajes.push({
        tipo: 'info',
        texto: `Watts por pie cuadrado (${wattsPorSqFt.toFixed(1)} W/sq ft) es mayor al recomendado (${rango.min}-${rango.max} W/sq ft). Puedes reducir la potencia o dimmer.`
      });
    } else {
      mensajes.push({
        tipo: 'success',
        texto: `Watts por pie cuadrado (${wattsPorSqFt.toFixed(1)} W/sq ft) está dentro del rango recomendado (${rango.min}-${rango.max} W/sq ft).`
      });
    }
  }
  
  return {
    valida: valida,
    mensajes: mensajes,
    wattsPorSqFt: sqFt > 0 && watts > 0 ? watts / sqFt : 0
  };
}

// ══════════════════════════════════════════════════
// FUNCIONES DE UTILIDAD
// ══════════════════════════════════════════════════

/**
 * Convierte pulgadas a centímetros
 * @param {number} pulgadas - Valor en pulgadas
 * @returns {number} Valor en centímetros
 */
function pulgadasACm(pulgadas) {
  return Math.round(Number(pulgadas) * 2.54 * 10) / 10;
}

/**
 * Convierte centímetros a pulgadas
 * @param {number} cm - Valor en centímetros
 * @returns {number} Valor en pulgadas
 */
function cmAPulgadas(cm) {
  return Math.round(Number(cm) / 2.54 * 10) / 10;
}

/**
 * Convierte pies cuadrados a metros cuadrados
 * @param {number} sqFt - Valor en pies cuadrados
 * @returns {number} Valor en metros cuadrados
 */
function sqFtAM2(sqFt) {
  return Math.round(Number(sqFt) * 0.092903 * 100) / 100;
}

/**
 * Convierte metros cuadrados a pies cuadrados
 * @param {number} m2 - Valor en metros cuadrados
 * @returns {number} Valor en pies cuadrados
 */
function m2ASqFt(m2) {
  return Math.round(Number(m2) / 0.092903 * 100) / 100;
}

// ══════════════════════════════════════════════════
// EXPORTAR FUNCIONES
// ══════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calcularWattsParaCarpa,
    calcularPlantasParaCarpa,
    calcularAlturaLed,
    calcularPpfdObjetivo,
    calcularDliObjetivo,
    generarRecomendacionIluminacion,
    calcularCostoElectricidad,
    generarTablaWattsPorCarpa,
    generarTablaAlturaLed,
    validarConfiguracionIluminacion,
    pulgadasACm,
    cmAPulgadas,
    sqFtAM2,
    m2ASqFt
  };
}

// Exponer funciones globalmente para uso en la app
if (typeof window !== 'undefined') {
  window.calcularWattsParaCarpa = calcularWattsParaCarpa;
  window.calcularPlantasParaCarpa = calcularPlantasParaCarpa;
  window.calcularAlturaLed = calcularAlturaLed;
  window.calcularPpfdObjetivo = calcularPpfdObjetivo;
  window.calcularDliObjetivo = calcularDliObjetivo;
  window.generarRecomendacionIluminacion = generarRecomendacionIluminacion;
  window.calcularCostoElectricidad = calcularCostoElectricidad;
  window.generarTablaWattsPorCarpa = generarTablaWattsPorCarpa;
  window.generarTablaAlturaLed = generarTablaAlturaLed;
  window.validarConfiguracionIluminacion = validarConfiguracionIluminacion;
  window.pulgadasACm = pulgadasACm;
  window.cmAPulgadas = cmAPulgadas;
  window.sqFtAM2 = sqFtAM2;
  window.m2ASqFt = m2ASqFt;
}

console.log('[hc-calculadora-iluminacion] Módulo cargado correctamente');
