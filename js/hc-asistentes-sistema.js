/**
 * Asistentes de Configuración Específicos por Sistema de Cultivo
 * Basado en investigación de: Coco For Cannabis, Royal Queen Seeds, Artisun Technology
 * Sistemas: Coco Coir + Drip, RDWC, DWC, Propagación
 * Versión: 1.0.0
 */

// ════════════════════════════════════════════════
// CONFIGURACIONES POR SISTEMA
// ════════════════════════════════════════════════

const CONFIGURACION_SISTEMA = {
  coco_drip: {
    id: 'coco_drip',
    nombre: 'Coco Coir + Riego por Goteo',
    descripcion: 'Sistema de cultivo en coco coir con riego automatizado por goteo. Ideal para control preciso y alta producción.',
    medio: 'coco',
    riego: 'goteo',
    ec: { min: 1200, max: 2400 },
    ph: { min: 5.5, max: 6.5 },
    frecuenciaRiego: {
      vegetativo: { min: 1, max: 3, unidad: 'veces/día' },
      floracion: { min: 2, max: 4, unidad: 'veces/día' }
    },
    dryback: { min: 20, max: 40, unidad: '%' },
    recomendaciones: [
      'Usar coco coir de alta calidad pre-lavado',
      'Añadir perlita 30% para mejor aireación',
      'Calibrar pH del agua de riego a 5.8-6.0',
      'EC gradual: empezar bajo en vegetativo, subir en floración',
      'Monitorear dryback del 20-40% antes de cada riego',
      'Usar Smart Pots o Air-Pots para mejor oxigenación radicular'
    ]
  },
  rdwc: {
    id: 'rdwc',
    nombre: 'RDWC (Recirculating Deep Water Culture)',
    descripcion: 'Sistema hidropónico de agua profunda recirculante. Máxima oxigenación y crecimiento rápido.',
    medio: 'hidroponia',
    riego: 'recirculacion',
    ec: { min: 1200, max: 2400 },
    ph: { min: 5.5, max: 6.5 },
    frecuenciaRiego: {
      vegetativo: { min: 24, max: 24, unidad: 'horas' },
      floracion: { min: 24, max: 24, unidad: 'horas' }
    },
    dryback: { min: 0, max: 5, unidad: '%' },
    recomendaciones: [
      'Mantener agua oxigenada 24/7 con aireadores',
      'Temperatura del agua: 18-22°C (65-72°F)',
      'pH estable en 5.8-6.2 en recirculación',
      'EC gradual: vegetativo 1.2-1.6, floración 1.6-2.4 mS/cm',
      'Cambiar agua cada 7-10 días',
      'Usar piedras de aire de alta calidad',
      'Evitar luz en el depósito para prevenir algas'
    ]
  },
  dwc: {
    id: 'dwc',
    nombre: 'DWC (Deep Water Culture)',
    descripcion: 'Sistema hidropónico de agua profunda individual. Simplicidad y crecimiento rápido.',
    medio: 'hidroponia',
    riego: 'continuo',
    ec: { min: 1200, max: 2400 },
    ph: { min: 5.5, max: 6.5 },
    frecuenciaRiego: {
      vegetativo: { min: 24, max: 24, unidad: 'horas' },
      floracion: { min: 24, max: 24, unidad: 'horas' }
    },
    dryback: { min: 0, max: 5, unidad: '%' },
    recomendaciones: [
      'Mantener nivel de agua 1-2" por debajo del fondo de la cesta',
      'Aireador por cubo individual',
      'Temperatura del agua: 18-22°C (65-72°F)',
      'pH 5.8-6.2',
      'EC gradual: vegetativo 1.2-1.6, floración 1.6-2.4 mS/cm',
      'Cambiar agua cada 7-10 días',
      'Usar cestas de red para mejor oxigenación'
    ]
  },
  propagacion: {
    id: 'propagacion',
    nombre: 'Propagación (Clones/Plántulas)',
    descripcion: 'Sistema para propagación de clones y plántulas. Alta humedad y ambiente controlado.',
    medio: 'varios',
    riego: 'manual',
    ec: { min: 400, max: 800 },
    ph: { min: 5.5, max: 6.2 },
    frecuenciaRiego: {
      vegetativo: { min: 1, max: 2, unidad: 'veces/día' },
      floracion: { min: 1, max: 2, unidad: 'veces/día' }
    },
    dryback: { min: 30, max: 50, unidad: '%' },
    recomendaciones: [
      'Humedad 80-90% para clones',
      'Temperatura 24-27°C (75-80°F)',
      'Luz indirecta o LED de baja intensidad',
      'EC bajo: 0.4-0.8 mS/cm',
      'pH 5.5-6.2',
      'Usar domo de humedad',
      'No sobrregar, mantener medio húmedo no saturado'
    ]
  }
};

// ════════════════════════════════════════════════
// CHECKLISTS POR SISTEMA
// ════════════════════════════════════════════════

const CHECKLIST_SISTEMA = {
  coco_drip: [
    // Materiales
    { id: 'reservorio', texto: 'Reservorio (14+ galones), preferiblemente oscuro', completado: false, categoria: 'materiales' },
    { id: 'bomba', texto: 'Bomba de riego (300+ GPH, 60 GPH por planta)', completado: false, categoria: 'materiales' },
    { id: 'timer', texto: 'Timer digital con intervalos de 1 segundo', completado: false, categoria: 'materiales' },
    { id: 'linea_principal', texto: 'Línea principal de 1/2" desde bomba a tent', completado: false, categoria: 'materiales' },
    { id: 'distribuidor', texto: 'Distribuidores (emitters o Hydro Halos)', completado: false, categoria: 'materiales' },
    { id: 'valvulas', texto: 'Válvulas de control (master + por planta)', completado: false, categoria: 'materiales' },
    { id: 'smart_pots', texto: 'Smart Pots o Air-Pots de tamaño adecuado', completado: false, categoria: 'materiales' },
    { id: 'coco_coir', texto: 'Coco coir pre-lavado de alta calidad', completado: false, categoria: 'materiales' },
    { id: 'perlita', texto: 'Perlita (30% del volumen del sustrato)', completado: false, categoria: 'materiales' },
    { id: 'drenaje', texto: 'Sistema de drenaje (bandejas o self-draining saucers)', completado: false, categoria: 'materiales' },
    { id: 'ph_ec', texto: 'Medidores de pH y EC', completado: false, categoria: 'materiales' },
    // Puesta en marcha
    { id: 'preparar_medio', texto: 'Preparar coco coir con 30% perlita, hidratar completamente', completado: false, categoria: 'puesta_marcha' },
    { id: 'llenar_macetas', texto: 'Llenar macetas con medio, compactar ligeramente', completado: false, categoria: 'puesta_marcha' },
    { id: 'instalar_bomba', texto: 'Instalar bomba en reservorio, conectar a timer', completado: false, categoria: 'puesta_marcha' },
    { id: 'instalar_lineas', texto: 'Conectar línea principal y distribuidores', completado: false, categoria: 'puesta_marcha' },
    { id: 'instalar_valvulas', texto: 'Instalar válvula master y válvulas por planta', completado: false, categoria: 'puesta_marcha' },
    { id: 'posicionar_macetas', texto: 'Posicionar macetas en Smart Pots sobre elevadores', completado: false, categoria: 'puesta_marcha' },
    { id: 'conectar_emitters', texto: 'Conectar emitters a cada maceta', completado: false, categoria: 'puesta_marcha' },
    { id: 'calibrar_flujo', texto: 'Calibrar flujo de cada emitter con válvulas', completado: false, categoria: 'puesta_marcha' },
    { id: 'configurar_timer', texto: 'Configurar timer según frecuencia recomendada', completado: false, categoria: 'puesta_marcha' },
    { id: 'verificar_drenaje', texto: 'Verificar drenaje adecuado (10-15% run-off)', completado: false, categoria: 'puesta_marcha' },
    { id: 'ajustar_ph', texto: 'Ajustar pH del agua a 5.8-6.0', completado: false, categoria: 'puesta_marcha' },
    { id: 'preparar_solucion', texto: 'Preparar solución nutricional con EC inicial 0.8-1.0 mS/cm', completado: false, categoria: 'puesta_marcha' },
    { id: 'primer_riego', texto: 'Realizar primer riego con solución completa', completado: false, categoria: 'puesta_marcha' },
    // Seguimiento
    { id: 'monitorear_dryback', texto: 'Monitorear dryback del 20-40% antes de cada riego', completado: false, categoria: 'seguimiento' },
    { id: 'verificar_runoff', texto: 'Verificar run-off 10-15% del volumen aplicado', completado: false, categoria: 'seguimiento' },
    { id: 'medir_ec_ph', texto: 'Medir EC y pH del run-off regularmente', completado: false, categoria: 'seguimiento' },
    { id: 'ajustar_frecuencia', texto: 'Ajustar frecuencia según fase de cultivo', completado: false, categoria: 'seguimiento' },
    { id: 'ajustar_duracion', texto: 'Ajustar duración según tamaño de maceta y emitter flow', completado: false, categoria: 'seguimiento' },
    { id: 'limpiar_emitters', texto: 'Limpiar emitters regularmente para evitar obstrucciones', completado: false, categoria: 'seguimiento' },
    { id: 'cambiar_agua', texto: 'Cambiar agua del reservorio cada 7-10 días', completado: false, categoria: 'seguimiento' }
  ],
  rdwc: [
    { id: 'depósito', texto: 'Instalar depósito central con capacidad adecuada', completado: false },
    { id: 'bomba', texto: 'Instalar bomba de agua recirculante', completado: false },
    { id: 'aireadores', texto: 'Instalar aireadores de alta calidad en depósito', completado: false },
    { id: 'tuberias', texto: 'Conectar tuberías entre cubos y depósito', completado: false },
    { id: 'cubos', texto: 'Preparar cubos DWC con cestas de red', completado: false },
    { id: 'temperatura', texto: 'Configurar control de temperatura del agua 18-22°C', completado: false },
    { id: 'ph_ec', texto: 'Calibrar pH 5.8-6.2 y EC inicial 0.8-1.0 mS/cm', completado: false },
    { id: 'luz', texto: 'Asegurar que el depósito esté oscuro (sin luz)', completado: false }
  ],
  dwc: [
    { id: 'cubos', texto: 'Preparar cubos DWC individuales', completado: false },
    { id: 'cestas', texto: 'Instalar cestas de red en cada cubo', completado: false },
    { id: 'aireadores', texto: 'Instalar aireador individual por cubo', completado: false },
    { id: 'nivel_agua', texto: 'Llenar cubos hasta 1-2" por debajo del fondo de la cesta', completado: false },
    { id: 'ph_ec', texto: 'Calibrar pH 5.8-6.2 y EC inicial 0.8-1.0 mS/cm', completado: false },
    { id: 'temperatura', texto: 'Verificar temperatura del agua 18-22°C', completado: false },
    { id: 'tapas', texto: 'Instalar tapas oscuras para evitar luz en el agua', completado: false }
  ],
  propagacion: [
    { id: 'domo', texto: 'Preparar domo de humedad', completado: false },
    { id: 'medio', texto: 'Preparar medio de enraizamiento (rockwool, turba, etc.)', completado: false },
    { id: 'gel', texto: 'Tener gel de enraizamiento listo', completado: false },
    { id: 'herramientas', texto: 'Esterilizar tijeras y bisturí', completado: false },
    { id: 'luz', texto: 'Configurar luz LED de baja intensidad', completado: false },
    { id: 'temperatura', texto: 'Verificar temperatura 24-27°C (75-80°F)', completado: false },
    { id: 'humedad', texto: 'Verificar capacidad de mantener 80-90% HR', completado: false }
  ]
};

// ════════════════════════════════════════════════
// FUNCIONES DE ASISTENTE
// ════════════════════════════════════════════════

/**
 * Obtiene configuración de un sistema específico
 * @param {string} sistemaId - ID del sistema (coco_drip, rdwc, dwc, propagacion)
 * @returns {Object} Configuración del sistema
 */
function obtenerConfiguracionSistema(sistemaId) {
  return CONFIGURACION_SISTEMA[sistemaId] || null;
}

/**
 * Obtiene checklist de un sistema específico filtrado por categoría
 * @param {string} sistemaId - ID del sistema
 * @param {string} categoria - 'materiales' | 'puesta_marcha' | 'seguimiento' | null (todas)
 * @returns {Array} Checklist filtrado del sistema
 */
function obtenerChecklistSistema(sistemaId, categoria = null) {
  const checklist = CHECKLIST_SISTEMA[sistemaId] || [];
  if (!categoria) return checklist;
  return checklist.filter(item => item.categoria === categoria);
}

/**
 * Obtiene recomendaciones de EC/pH según sistema y fase
 * @param {string} sistemaId - ID del sistema
 * @param {string} fase - 'vegetativo' | 'floracion'
 * @returns {Object} { ec: { min, max }, ph: { min, max } }
 */
function obtenerEcPhPorSistema(sistemaId, fase) {
  const sistema = CONFIGURACION_SISTEMA[sistemaId];
  if (!sistema) return { ec: { min: 1200, max: 2000 }, ph: { min: 5.5, max: 6.5 } };
  
  const f = String(fase).toLowerCase();
  const ecBase = sistema.ec;
  
  // Ajustar EC según fase
  let ecMin, ecMax;
  if (f === 'vegetativo') {
    ecMin = Math.max(ecBase.min, 1200);
    ecMax = Math.min(ecBase.max, 1600);
  } else if (f === 'floracion') {
    ecMin = Math.max(ecBase.min, 1600);
    ecMax = Math.min(ecBase.max, 2400);
  } else {
    ecMin = ecBase.min;
    ecMax = ecBase.max;
  }
  
  return {
    ec: { min: ecMin, max: ecMax },
    ph: sistema.ph
  };
}

/**
 * Obtiene frecuencia de riego recomendada según sistema y fase
 * @param {string} sistemaId - ID del sistema
 * @param {string} fase - 'vegetativo' | 'floracion'
 * @returns {Object} { min, max, unidad }
 */
function obtenerFrecuenciaRiego(sistemaId, fase) {
  const sistema = CONFIGURACION_SISTEMA[sistemaId];
  if (!sistema) return { min: 1, max: 2, unidad: 'veces/día' };
  
  const f = String(fase).toLowerCase();
  return sistema.frecuenciaRiego[f] || sistema.frecuenciaRiego.vegetativo;
}

/**
 * Obtiene dryback recomendado según sistema
 * @param {string} sistemaId - ID del sistema
 * @returns {Object} { min, max, unidad }
 */
function obtenerDrybackSistema(sistemaId) {
  const sistema = CONFIGURACION_SISTEMA[sistemaId];
  if (!sistema) return { min: 20, max: 40, unidad: '%' };
  
  return sistema.dryback;
}

/**
 * Genera recomendaciones personalizadas según sistema
 * @param {string} sistemaId - ID del sistema
 * @param {Object} params - { fase, numPlantas, tamanoMaceta }
 * @returns {Object} Recomendaciones personalizadas
 */
function generarRecomendacionesSistema(sistemaId, params) {
  const sistema = CONFIGURACION_SISTEMA[sistemaId];
  if (!sistema) return null;
  
  const p = params || {};
  const fase = p.fase || 'vegetativo';
  
  const ecPh = obtenerEcPhPorSistema(sistemaId, fase);
  const frecuencia = obtenerFrecuenciaRiego(sistemaId, fase);
  const dryback = obtenerDrybackSistema(sistemaId);
  
  return {
    sistema: sistema,
    ecPh: ecPh,
    frecuenciaRiego: frecuencia,
    dryback: dryback,
    recomendaciones: sistema.recomendaciones,
    fase: fase
  };
}

/**
 * Valida si una configuración es adecuada para un sistema
 * @param {string} sistemaId - ID del sistema
 * @param {Object} config - { ec, ph, frecuenciaRiego, dryback }
 * @returns {Object} { valida: boolean, mensajes: Array }
 */
function validarConfiguracionSistema(sistemaId, config) {
  const sistema = CONFIGURACION_SISTEMA[sistemaId];
  if (!sistema) {
    return { valida: false, mensajes: [{ tipo: 'error', texto: 'Sistema no reconocido' }] };
  }
  
  const c = config || {};
  const mensajes = [];
  let valida = true;
  
  // Validar EC
  if (c.ec) {
    if (c.ec < sistema.ec.min) {
      valida = false;
      mensajes.push({
        tipo: 'warning',
        texto: `EC (${c.ec} µS/cm) es menor al mínimo recomendado (${sistema.ec.min} µS/cm)`
      });
    } else if (c.ec > sistema.ec.max) {
      mensajes.push({
        tipo: 'warning',
        texto: `EC (${c.ec} µS/cm) es mayor al máximo recomendado (${sistema.ec.max} µS/cm)`
      });
    } else {
      mensajes.push({
        tipo: 'success',
        texto: `EC (${c.ec} µS/cm) está dentro del rango recomendado`
      });
    }
  }
  
  // Validar pH
  if (c.ph) {
    if (c.ph < sistema.ph.min) {
      valida = false;
      mensajes.push({
        tipo: 'warning',
        texto: `pH (${c.ph}) es menor al mínimo recomendado (${sistema.ph.min})`
      });
    } else if (c.ph > sistema.ph.max) {
      mensajes.push({
        tipo: 'warning',
        texto: `pH (${c.ph}) es mayor al máximo recomendado (${sistema.ph.max})`
      });
    } else {
      mensajes.push({
        tipo: 'success',
        texto: `pH (${c.ph}) está dentro del rango recomendado`
      });
    }
  }
  
  return {
    valida: valida,
    mensajes: mensajes
  };
}

/**
 * Calcula impulsos de micro riegos según número de plantas y variedad
 * @param {string} sistemaId - ID del sistema (coco_drip)
 * @param {Object} params - { numPlantas, tamanoMaceta, faseCultivo, variedad, emitterFlowLph }
 * @returns {Object} { frecuencia, duracion, volumenPorEvento, volumenTotalDia, recomendaciones }
 */
function calcularImpulsosMicroRiego(sistemaId, params) {
  if (sistemaId !== 'coco_drip') {
    return { error: 'Sistema no soportado para cálculo de micro riegos' };
  }
  
  const p = params || {};
  const numPlantas = p.numPlantas || 4;
  const tamanoMaceta = p.tamanoMaceta || 'medium';
  const faseCultivo = p.faseCultivo || 'vegetativo';
  const variedad = p.variedad || 'sativa'; // sativa, indica, híbrida
  const emitterFlowLph = p.emitterFlowLph || 2;
  
  // Volumen de maceta en litros según tamaño
  const volumenMacetaLitros = {
    small: 11.4,   // 3 gal
    medium: 18.9,  // 5 gal
    large: 56.8    // 15 gal
  }[tamanoMaceta] || 18.9;
  
  // Volumen de riego por evento: 5% del volumen de maceta (Coco For Cannabis)
  const volumenPorEventoLitros = volumenMacetaLitros * 0.05;
  
  // Frecuencia según fase y variedad
  const frecuenciaBase = {
    esqueje: 1,
    vegetativo: 2,
    prefloracion: 3,
    floracion: 4
  }[faseCultivo] || 2;
  
  // Ajuste por variedad: Indica necesita menos frecuencia, Sativa más
  const ajusteVariedad = {
    indica: -0.5,
    sativa: 0.5,
    hibrida: 0
  }[variedad] || 0;
  
  const frecuencia = Math.max(1, Math.min(6, Math.round(frecuenciaBase + ajusteVariedad)));
  
  // Duración por evento en minutos
  const emitterFlowLpm = emitterFlowLph / 60; // Convertir L/h a L/min
  const duracionMin = Math.ceil(volumenPorEventoLitros / emitterFlowLpm);
  
  // Volumen total por día
  const volumenTotalDiaLitros = volumenPorEventoLitros * frecuencia * numPlantas;
  
  // Recomendaciones
  const recomendaciones = [];
  
  if (faseCultivo === 'floracion' && frecuencia < 3) {
    recomendaciones.push('En floración, considera aumentar frecuencia a 3-4 veces/día para mejor absorción');
  }
  
  if (variedad === 'sativa' && faseCultivo === 'floracion') {
    recomendaciones.push('Sativas en floración pueden beneficiarse de 4-5 riegos/día');
  }
  
  if (variedad === 'indica' && frecuencia > 3) {
    recomendaciones.push('Indicas pueden preferir frecuencia menor (2-3 veces/día) para evitar sobreriego');
  }
  
  if (volumenTotalDiaLitros > 50) {
    recomendaciones.push(`Volumen diario alto (${volumenTotalDiaLitros.toFixed(1)} L): verifica capacidad del reservorio`);
  }
  
  return {
    sistema: sistemaId,
    numPlantas: numPlantas,
    tamanoMaceta: tamanoMaceta,
    volumenMacetaLitros: volumenMacetaLitros,
    faseCultivo: faseCultivo,
    variedad: variedad,
    emitterFlowLph: emitterFlowLph,
    frecuencia: frecuencia,
    duracion: duracionMin,
    volumenPorEvento: volumenPorEventoLitros,
    volumenTotalDia: volumenTotalDiaLitros,
    recomendaciones: recomendaciones
  };
}
function listarSistemas() {
  return Object.keys(CONFIGURACION_SISTEMA).map(id => ({
    id: id,
    nombre: CONFIGURACION_SISTEMA[id].nombre,
    descripcion: CONFIGURACION_SISTEMA[id].descripcion
  }));
}

// ════════════════════════════════════════════════
// EXPORTAR FUNCIONES
// ════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CONFIGURACION_SISTEMA,
    CHECKLIST_SISTEMA,
    obtenerConfiguracionSistema,
    obtenerChecklistSistema,
    obtenerEcPhPorSistema,
    obtenerFrecuenciaRiego,
    obtenerDrybackSistema,
    generarRecomendacionesSistema,
    validarConfiguracionSistema,
    listarSistemas,
    calcularImpulsosMicroRiego
  };
}

// Exponer funciones globalmente para uso en la app
if (typeof window !== 'undefined') {
  window.CONFIGURACION_SISTEMA = CONFIGURACION_SISTEMA;
  window.CHECKLIST_SISTEMA = CHECKLIST_SISTEMA;
  window.obtenerConfiguracionSistema = obtenerConfiguracionSistema;
  window.obtenerChecklistSistema = obtenerChecklistSistema;
  window.obtenerEcPhPorSistema = obtenerEcPhPorSistema;
  window.obtenerFrecuenciaRiego = obtenerFrecuenciaRiego;
  window.obtenerDrybackSistema = obtenerDrybackSistema;
  window.generarRecomendacionesSistema = generarRecomendacionesSistema;
  window.validarConfiguracionSistema = validarConfiguracionSistema;
  window.listarSistemas = listarSistemas;
  window.calcularImpulsosMicroRiego = calcularImpulsosMicroRiego;
}

console.log('[hc-asistentes-sistema] Módulo cargado correctamente');
