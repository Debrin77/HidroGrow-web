/**
 * Rangos EC/pH Actualizados Según Investigación de Expertos
 * Basado en investigación de: Blimburn Seeds, Coco For Cannabis, Photone, Gorilla Grow Tent
 * Versión: 1.0.0
 */

// ══════════════════════════════════════════════════
// RANGOS pH ACTUALIZADOS SEGÚN MEDIO DE CULTIVO
// ══════════════════════════════════════════════════

/**
 * Obtiene el rango pH óptimo según el medio de cultivo
 * @param {string} medio - 'suelo', 'coco', 'hidroponia', 'rdwc', 'dwc'
 * @returns {Object} { min: number, max: number }
 */
function getPhRangoPorMedio(medio) {
  const m = String(medio || '').toLowerCase();
  
  // Suelo: pH 6.0-7.0 (según Blimburn Seeds)
  if (m === 'suelo' || m === 'soil') {
    return { min: 6.0, max: 7.0 };
  }
  
  // Coco coir: pH 5.5-6.5 (según Blimburn Seeds)
  if (m === 'coco' || m === 'coco_coir' || m === 'coco coir') {
    return { min: 5.5, max: 6.5 };
  }
  
  // Hidroponía/DWC/RDWC: pH 5.5-6.5 (según Blimburn Seeds)
  if (m === 'hidroponia' || m === 'hydro' || m === 'hidro' || 
      m === 'dwc' || m === 'rdwc' || m === 'deep water culture') {
    return { min: 5.5, max: 6.5 };
  }
  
  // Por defecto: rango hidroponía (más común en la app)
  return { min: 5.5, max: 6.5 };
}

/**
 * Obtiene el rango pH óptimo según el camino de cultivo
 * @param {string} camino - 'semilla_propagador', 'semilla_hidro', 'esqueje_hidro', 'madre_hidro'
 * @returns {Object} { min: number, max: number }
 */
function getPhRangoPorCamino(camino) {
  const c = String(camino || '').toLowerCase();
  
  // Todos los caminos en hidroGrow son hidropónicos (DWC/RDWC)
  // semilla_propagador, semilla_hidro, esqueje_hidro, madre_hidro
  return { min: 5.5, max: 6.5 };
}

// ══════════════════════════════════════════════════
// RANGOS EC ACTUALIZADOS SEGÚN FASE DE CRECIMIENTO
// ══════════════════════════════════════════════════

/**
 * Obtiene el rango EC óptimo según la fase de crecimiento
 * @param {string} fase - 'seedling', 'vegetativo', 'floracion', 'madre'
 * @param {string} medio - 'suelo', 'coco', 'hidroponia', 'rdwc', 'dwc'
 * @returns {Object} { min: number (µS/cm), max: number (µS/cm) }
 */
function getEcRangoPorFase(fase, medio) {
  const f = String(fase || '').toLowerCase();
  const m = String(medio || '').toLowerCase();
  
  // Seedlings/Semilleros: EC más bajo
  if (f === 'seedling' || f === 'semilla' || f === 'semillero' || f === 'germinacion') {
    return { min: 200, max: 600 }; // 0.2-0.6 mS/cm
  }
  
  // Vegetativo: EC 1.2-2.0 mS/cm (1200-2000 µS/cm) según Blimburn Seeds
  if (f === 'vegetativo' || f === 'veg' || f === 'vegetative') {
    return { min: 1200, max: 2000 };
  }
  
  // Floración: EC 1.6-2.4 mS/cm (1600-2400 µS/cm) según Blimburn Seeds
  if (f === 'floracion' || f === 'flor' || f === 'flower' || f === 'bloom') {
    return { min: 1600, max: 2400 };
  }
  
  // Planta madre: EC moderado para vegetativo continuo
  if (f === 'madre' || f === 'mother') {
    return { min: 1200, max: 1800 };
  }
  
  // Por defecto: rango vegetativo
  return { min: 1200, max: 2000 };
}

/**
 * Obtiene el rango EC óptimo según el camino de cultivo y fase
 * @param {string} camino - 'semilla_propagador', 'semilla_hidro', 'esqueje_hidro', 'madre_hidro'
 * @param {string} fase - 'seedling', 'vegetativo', 'floracion', 'madre'
 * @returns {Object} { min: number (µS/cm), max: number (µS/cm) }
 */
function getEcRangoPorCaminoYFase(camino, fase) {
  const c = String(camino || '').toLowerCase();
  const f = String(fase || '').toLowerCase();
  
  // semilla_propagador: fase de germinación usa EC bajo
  if (c === 'semilla_propagador' && (f === 'seedling' || f === 'germinacion')) {
    return { min: 200, max: 600 };
  }
  
  // semilla_hidro: fase de germinación usa EC bajo
  if (c === 'semilla_hidro' && (f === 'seedling' || f === 'germinacion')) {
    return { min: 200, max: 600 };
  }
  
  // madre_hidro: siempre vegetativo
  if (c === 'madre_hidro') {
    return { min: 1200, max: 1800 };
  }
  
  // Por defecto: usar fase
  return getEcRangoPorFase(fase, 'hidroponia');
}

// ══════════════════════════════════════════════════
// RANGOS PPFD/DLI PARA ILUMINACIÓN LED
// ══════════════════════════════════════════════════

/**
 * Obtiene el rango PPFD óptimo según la fase de crecimiento
 * @param {string} fase - 'seedling', 'vegetativo', 'floracion'
 * @returns {Object} { min: number (µmol/m²/s), max: number (µmol/m²/s) }
 */
function getPpfdRangoPorFase(fase) {
  const f = String(fase || '').toLowerCase();
  
  // Seedlings: 200-300 µmol/m²/s según Photone
  if (f === 'seedling' || f === 'semilla' || f === 'semillero' || f === 'germinacion') {
    return { min: 200, max: 300 };
  }
  
  // Vegetativo: 400-800 µmol/m²/s según Trimleaf
  if (f === 'vegetativo' || f === 'veg' || f === 'vegetative') {
    return { min: 400, max: 800 };
  }
  
  // Floración: 800-1200+ µmol/m²/s según Trimleaf
  if (f === 'floracion' || f === 'flor' || f === 'flower' || f === 'bloom') {
    return { min: 800, max: 1200 };
  }
  
  // Por defecto: rango vegetativo
  return { min: 400, max: 800 };
}

/**
 * Obtiene el DLI (Daily Light Integral) óptimo según la fase de crecimiento
 * @param {string} fase - 'seedling', 'vegetativo', 'floracion'
 * @param {number} horasLuz - Horas de luz por día
 * @returns {Object} { min: number (mol/m²/d), max: number (mol/m²/d), target: number }
 */
function getDliPorFase(fase, horasLuz) {
  const f = String(fase || '').toLowerCase();
  const horas = Number(horasLuz) || 18;
  
  // Seedlings: 10-15 mol/m²/d según Photone
  if (f === 'seedling' || f === 'semilla' || f === 'semillero' || f === 'germinacion') {
    return { min: 10, max: 15, target: 12 };
  }
  
  // Vegetativo temprano: 20-30 mol/m²/d según Photone
  if (f === 'vegetativo_temprano' || f === 'veg_early') {
    return { min: 20, max: 30, target: 25 };
  }
  
  // Vegetativo pico: 40-45 mol/m²/d según Photone
  if (f === 'vegetativo' || f === 'veg' || f === 'vegetative' || f === 'veg_peak') {
    return { min: 40, max: 45, target: 42 };
  }
  
  // Floración temprana: 30-35 mol/m²/d según Photone
  if (f === 'floracion_temprana' || f === 'flower_early') {
    return { min: 30, max: 35, target: 32 };
  }
  
  // Floración pico: 40 mol/m²/d según Photone
  if (f === 'floracion' || f === 'flor' || f === 'flower' || f === 'bloom' || f === 'flower_peak') {
    return { min: 35, max: 40, target: 38 };
  }
  
  // Floración tardía: 30-35 mol/m²/d según Photone
  if (f === 'floracion_tardia' || f === 'flower_late') {
    return { min: 30, max: 35, target: 32 };
  }
  
  // Autoflowering: 30-45 mol/m²/d durante todo el ciclo según Photone
  if (f === 'autoflower' || f === 'auto') {
    return { min: 30, max: 45, target: 38 };
  }
  
  // Por defecto: rango vegetativo
  return { min: 40, max: 45, target: 42 };
}

// ══════════════════════════════════════════════════
// ALTURA DE LED SEGÚN FASE Y POTENCIA
// ══════════════════════════════════════════════════

/**
 * Obtiene la altura recomendada de LED según fase y potencia
 * @param {string} fase - 'seedling', 'vegetativo', 'floracion'
 * @param {number} potenciaW - Potencia del LED en watts
 * @returns {Object} { min: number (pulgadas), max: number (pulgadas), dim: number (%) }
 */
function getLedAlturaPorFase(fase, potenciaW) {
  const f = String(fase || '').toLowerCase();
  const watts = Number(potenciaW) || 0;
  
  // Seedlings: altura mayor, dim bajo
  if (f === 'seedling' || f === 'semilla' || f === 'semillero' || f === 'germinacion') {
    if (watts <= 220) return { min: 24, max: 30, dim: 30 };
    if (watts <= 330) return { min: 24, max: 30, dim: 35 };
    if (watts <= 420) return { min: 24, max: 30, dim: 40 };
    if (watts <= 600) return { min: 30, max: 36, dim: 40 };
    return { min: 30, max: 36, dim: 40 };
  }
  
  // Vegetativo: altura media, dim medio-alto
  if (f === 'vegetativo' || f === 'veg' || f === 'vegetative') {
    if (watts <= 220) return { min: 18, max: 24, dim: 80 };
    if (watts <= 330) return { min: 18, max: 24, dim: 80 };
    if (watts <= 420) return { min: 24, max: 30, dim: 80 };
    if (watts <= 600) return { min: 30, max: 36, dim: 100 };
    return { min: 30, max: 36, dim: 100 };
  }
  
  // Floración: altura menor, dim completo
  if (f === 'floracion' || f === 'flor' || f === 'flower' || f === 'bloom') {
    if (watts <= 220) return { min: 12, max: 18, dim: 100 };
    if (watts <= 330) return { min: 12, max: 18, dim: 100 };
    if (watts <= 420) return { min: 18, max: 24, dim: 100 };
    if (watts <= 600) return { min: 18, max: 24, dim: 100 };
    if (watts <= 750) return { min: 18, max: 24, dim: 100 };
    return { min: 18, max: 24, dim: 100 };
  }
  
  // Por defecto: rango vegetativo
  return { min: 18, max: 24, dim: 80 };
}

// ══════════════════════════════════════════════════
// WATTS POR PIE CUADRADO SEGÚN FASE
// ══════════════════════════════════════════════════

/**
 * Obtiene los watts recomendados por pie cuadrado según fase
 * @param {string} fase - 'seedling', 'vegetativo', 'floracion'
 * @returns {Object} { min: number (W/sq ft), max: number (W/sq ft) }
 */
function getWattsPorSqFtPorFase(fase) {
  const f = String(fase || '').toLowerCase();
  
  // Seedlings/Clones: 10-20W por pie cuadrado según Trimleaf
  if (f === 'seedling' || f === 'semilla' || f === 'semillero' || f === 'germinacion') {
    return { min: 10, max: 20 };
  }
  
  // Vegetativo: 25-35W por pie cuadrado según Trimleaf
  if (f === 'vegetativo' || f === 'veg' || f === 'vegetative') {
    return { min: 25, max: 35 };
  }
  
  // Floración: 40-50W por pie cuadrado según Trimleaf
  if (f === 'floracion' || f === 'flor' || f === 'flower' || f === 'bloom') {
    return { min: 40, max: 50 };
  }
  
  // Por defecto: rango vegetativo
  return { min: 25, max: 35 };
}

/**
 * Calcula los watts totales recomendados para una carpa
 * @param {number} sqFt - Área en pies cuadrados
 * @param {string} fase - 'seedling', 'vegetativo', 'floracion'
 * @returns {Object} { min: number (W), max: number (W) }
 */
function getWattsTotalesParaCarpa(sqFt, fase) {
  const area = Number(sqFt) || 0;
  const rango = getWattsPorSqFtPorFase(fase);
  
  return {
    min: Math.round(area * rango.min),
    max: Math.round(area * rango.max)
  };
}

// ══════════════════════════════════════════════════
// EXPORTAR FUNCIONES
// ══════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getPhRangoPorMedio,
    getPhRangoPorCamino,
    getEcRangoPorFase,
    getEcRangoPorCaminoYFase,
    getPpfdRangoPorFase,
    getDliPorFase,
    getLedAlturaPorFase,
    getWattsPorSqFtPorFase,
    getWattsTotalesParaCarpa
  };
}

// Exponer funciones globalmente para uso en la app
if (typeof window !== 'undefined') {
  window.getPhRangoPorMedio = getPhRangoPorMedio;
  window.getPhRangoPorCamino = getPhRangoPorCamino;
  window.getEcRangoPorFase = getEcRangoPorFase;
  window.getEcRangoPorCaminoYFase = getEcRangoPorCaminoYFase;
  window.getPpfdRangoPorFase = getPpfdRangoPorFase;
  window.getDliPorFase = getDliPorFase;
  window.getLedAlturaPorFase = getLedAlturaPorFase;
  window.getWattsPorSqFtPorFase = getWattsPorSqFtPorFase;
  window.getWattsTotalesParaCarpa = getWattsTotalesParaCarpa;
}

console.log('[hc-ec-ph-rangos-actualizados] Módulo cargado correctamente');
