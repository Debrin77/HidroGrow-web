/**
 * Sistema de Esquejado de Cannabis para hidroGrow-web
 * Basado en investigación de: Athena Ag, Seeds Here Now, Grow Weed Easy, Cannabis Shop
 * Versión: 1.0.0
 */

// ════════════════════════════════════════════════
// ESTADOS Y FASES DE ESQUEJADO
// ════════════════════════════════════════════════

const ESQUEJADO_FASES = {
  preparacion: {
    id: 'preparacion',
    nombre: 'Preparación',
    dias: 0,
    descripcion: 'Preparar herramientas y medio de enraizamiento'
  },
  corte: {
    id: 'corte',
    nombre: 'Día 1 - El Corte',
    dias: 1,
    descripcion: 'Tomar los esquejes de la planta madre'
  },
  enraizamiento_inicial: {
    id: 'enraizamiento_inicial',
    nombre: 'Día 1-2 - Enraizamiento Inicial',
    dias: 2,
    descripcion: 'Ambiente de alta humedad para enraizamiento'
  },
  ventilacion: {
    id: 'ventilacion',
    nombre: 'Día 3+ - Ventilación',
    dias: 3,
    descripcion: 'Comenzar a ventilar el domo gradualmente'
  },
  desarrollo_raices: {
    id: 'desarrollo_raices',
    nombre: 'Día 5-11 - Desarrollo de Raíces',
    dias: 11,
    descripcion: 'Alimentar y monitorear desarrollo de raíces'
  },
  endurecimiento: {
    id: 'endurecimiento',
    nombre: 'Día 10-15 - Endurecimiento',
    dias: 15,
    descripcion: 'Endurecer los clones antes del trasplante'
  },
  transicion: {
    id: 'transicion',
    nombre: 'Día 14-21 - Transición',
    dias: 21,
    descripcion: 'Reducir humedad gradualmente y aumentar luz'
  },
  trasplante: {
    id: 'trasplante',
    nombre: 'Día 21+ - Trasplante',
    dias: 21,
    descripcion: 'Trasplantar clones enraizados al sistema final'
  }
};

// ════════════════════════════════════════════════
// CHECKLIST DE ESQUEJADO
// ════════════════════════════════════════════════

const ESQUEJADO_CHECKLIST = {
  preparacion: [
    {
      id: 'herramientas',
      texto: 'Reunir herramientas: tijeras afiladas, bisturí, gel de enraizamiento, cubos de enraizamiento, domo de humedad, botella de spray',
      completado: false
    },
    {
      id: 'esterilizacion',
      texto: 'Preparar solución de esterilización (1 parte blanqueador : 9 partes agua)',
      completado: false
    },
    {
      id: 'medio_enraizamiento',
      texto: 'Remojar cubos de enraizamiento en solución de nutrientes (EC 1.0-2.0, pH 5.6) por 10 minutos',
      completado: false
    },
    {
      id: 'planta_madre',
      texto: 'Verificar que la planta madre esté saludable y en fase vegetativa',
      completado: false
    }
  ],
  corte: [
    {
      id: 'seleccionar_rama',
      texto: 'Seleccionar ramas saludables de 1/8" grosor y 6" largo de secciones superior/media',
      completado: false
    },
    {
      id: 'corte_inicial',
      texto: 'Cortar rama de planta madre con tijeras estériles',
      completado: false
    },
    {
      id: 'recortar_esqueje',
      texto: 'Recortar esqueje a 5" de altura, remover nodos inferiores y hojas de abanico',
      completado: false
    },
    {
      id: 'cupping',
      texto: 'Colocar esquejes en taza de solución de nutrientes (opcional pero recomendado)',
      completado: false
    },
    {
      id: 'corte_final',
      texto: 'Hacer corte final a 45° con bisturí limpio',
      completado: false
    },
    {
      id: 'gel_enraizamiento',
      texto: 'Aplicar gel de enraizamiento al tallo',
      completado: false
    },
    {
      id: 'insertar_cubo',
      texto: 'Insertar tallo en cubo de enraizamiento pre-remojado',
      completado: false
    }
  ],
  enraizamiento_inicial: [
    {
      id: 'colocar_domo',
      texto: 'Colocar clones bajo domo de humedad inmediatamente',
      completado: false
    },
    {
      id: 'verificar_humedad',
      texto: 'Verificar humedad 80-90% y temperatura 75-80°F (24-27°C)',
      completado: false
    },
    {
      id: 'verificar_luz',
      texto: 'Verificar luz indirecta o fluorescente, baja intensidad',
      completado: false
    }
  ],
  ventilacion: [
    {
      id: 'abrir_domo',
      texto: 'Comenzar a "abrir" el domo 5-20 minutos diariamente',
      completado: false
    },
    {
      id: 'monitorear',
      texto: 'Monitorear clones diariamente por marchitamiento o moho',
      completado: false
    }
  ],
  desarrollo_raices: [
    {
      id: 'alimentar_dia5',
      texto: 'Alimentar clones en día 5 (dryback 30-35%)',
      completado: false
    },
    {
      id: 'alimentar_dia7',
      texto: 'Alimentar clones en día 7 (dryback 30-35%)',
      completado: false
    },
    {
      id: 'alimentar_dia9',
      texto: 'Alimentar clones en día 9 (dryback 30-35%)',
      completado: false
    },
    {
      id: 'alimentar_dia11',
      texto: 'Alimentar clones en día 11 (dryback 30-35%)',
      completado: false
    },
    {
      id: 'verificar_raices',
      texto: 'Verificar desarrollo de raíces alrededor de día 7-10',
      completado: false
    }
  ],
  endurecimiento: [
    {
      id: 'abrir_completo',
      texto: 'Dejar puertas magnéticas completamente abiertas',
      completado: false
    },
    {
      id: 'limpiar_domo',
      texto: 'Rociar y limpiar domo con solución desinfectante',
      completado: false
    },
    {
      id: 'verificar_raices_establecidas',
      texto: 'Verificar que las raíces estén establecidas (día 10-15)',
      completado: false
    }
  ],
  transicion: [
    {
      id: 'reducir_humedad',
      texto: 'Reducir humedad gradualmente durante 3-5 días',
      completado: false
    },
    {
      id: 'aumentar_luz',
      texto: 'Aumentar gradualmente la intensidad de luz',
      completado: false
    },
    {
      id: 'verificar_listo',
      texto: 'Verificar que clones estén listos para trasplante (día 21)',
      completado: false
    }
  ],
  trasplante: [
    {
      id: 'preparar_sistema',
      texto: 'Preparar sistema de cultivo final (DWC/RDWC, coco, etc.)',
      completado: false
    },
    {
      id: 'trasplantar',
      texto: 'Trasplantar clones enraizados al sistema final',
      completado: false
    },
    {
      id: 'monitorear_adaptacion',
      texto: 'Monitorear adaptación de clones al sistema final',
      completado: false
    }
  ]
};

// ════════════════════════════════════════════════
// FUNCIONES DE GESTIÓN DE ESQUEJADO
// ════════════════════════════════════════════════

/**
 * Obtiene la fase actual de esquejado basada en el día
 * @param {number} dia - Día del proceso de esquejado
 * @returns {Object} Fase actual
 */
function obtenerFaseEsquejado(dia) {
  const d = Number(dia) || 0;
  
  if (d === 0) return ESQUEJADO_FASES.preparacion;
  if (d === 1) return ESQUEJADO_FASES.corte;
  if (d <= 2) return ESQUEJADO_FASES.enraizamiento_inicial;
  if (d <= 4) return ESQUEJADO_FASES.ventilacion;
  if (d <= 11) return ESQUEJADO_FASES.desarrollo_raices;
  if (d <= 15) return ESQUEJADO_FASES.endurecimiento;
  if (d <= 21) return ESQUEJADO_FASES.transicion;
  return ESQUEJADO_FASES.trasplante;
}

/**
 * Obtiene el checklist para una fase específica
 * @param {string} faseId - ID de la fase
 * @returns {Array} Checklist de la fase
 */
function obtenerChecklistFase(faseId) {
  return ESQUEJADO_CHECKLIST[faseId] || [];
}

/**
 * Obtiene el checklist completo del proceso de esquejado
 * @returns {Object} Checklist completo organizado por fase
 */
function obtenerChecklistCompleto() {
  return ESQUEJADO_CHECKLIST;
}

/**
 * Calcula el progreso del esquejado en porcentaje
 * @param {number} dia - Día actual del proceso
 * @param {number} totalDias - Total de días del proceso (por defecto 21)
 * @returns {number} Porcentaje de progreso
 */
function calcularProgresoEsquejado(dia, totalDias) {
  const d = Number(dia) || 0;
  const total = Number(totalDias) || 21;
  return Math.min(100, Math.round((d / total) * 100));
}

/**
 * Valida si un día es válido para el proceso de esquejado
 * @param {number} dia - Día a validar
 * @returns {Object} { valido: boolean, mensaje: string }
 */
function validarDiaEsquejado(dia) {
  const d = Number(dia);
  
  if (!Number.isFinite(d) || d < 0) {
    return { valido: false, mensaje: 'El día debe ser un número positivo' };
  }
  
  if (d === 0) {
    return { valido: true, mensaje: 'Fase de preparación' };
  }
  
  if (d > 30) {
    return { valido: false, mensaje: 'El proceso de esquejado no debería exceder 30 días' };
  }
  
  return { valido: true, mensaje: 'Día válido' };
}

/**
 * Obtiene recomendaciones ambientales para una fase específica
 * @param {string} faseId - ID de la fase
 * @returns {Object} Recomendaciones ambientales
 */
function obtenerRecomendacionesAmbientales(faseId) {
  const recomendaciones = {
    preparacion: {
      humedad: null,
      temperatura: null,
      luz: null,
      notas: 'Preparar todas las herramientas y el medio de enraizamiento'
    },
    corte: {
      humedad: null,
      temperatura: null,
      luz: null,
      notas: 'Trabajar rápido, no dejar esquejes expuestos más de unos minutos'
    },
    enraizamiento_inicial: {
      humedad: { min: 80, max: 90, unidad: '%' },
      temperatura: { min: 75, max: 80, unidad: '°F' },
      luz: { tipo: 'indirecta', intensidad: 'baja', horas: 12 },
      notas: 'No dejar que el domo supere 80°F'
    },
    ventilacion: {
      humedad: { min: 75, max: 85, unidad: '%' },
      temperatura: { min: 75, max: 80, unidad: '°F' },
      luz: { tipo: 'indirecta', intensidad: 'baja', horas: 14 },
      notas: 'Ventilar 5-20 minutos diariamente'
    },
    desarrollo_raices: {
      humedad: { min: 70, max: 80, unidad: '%' },
      temperatura: { min: 72, max: 78, unidad: '°F' },
      luz: { tipo: 'indirecta', intensidad: 'media', horas: 16 },
      notas: 'Alimentar días 5, 7, 9, 11 con dryback 30-35%'
    },
    endurecimiento: {
      humedad: { min: 60, max: 70, unidad: '%' },
      temperatura: { min: 70, max: 75, unidad: '°F' },
      luz: { tipo: 'directa', intensidad: 'media', horas: 18 },
      notas: 'Dejar domo completamente abierto'
    },
    transicion: {
      humedad: { min: 50, max: 60, unidad: '%' },
      temperatura: { min: 70, max: 75, unidad: '°F' },
      luz: { tipo: 'directa', intensidad: 'alta', horas: 18 },
      notas: 'Reducir humedad gradualmente, aumentar luz gradualmente'
    },
    trasplante: {
      humedad: { min: 50, max: 60, unidad: '%' },
      temperatura: { min: 70, max: 75, unidad: '°F' },
      luz: { tipo: 'directa', intensidad: 'alta', horas: 18 },
      notas: 'Trasplantar al sistema final de cultivo'
    }
  };
  
  return recomendaciones[faseId] || recomendaciones.preparacion;
}

/**
 * Registra el inicio de un proceso de esquejado
 * @param {Object} params - { plantaMadreId, fechaInicio, numClones, variedadId }
 * @returns {Object} Datos del proceso de esquejado
 */
function iniciarProcesoEsquejado(params) {
  const p = params || {};
  
  const proceso = {
    id: 'esq_' + Date.now(),
    plantaMadreId: p.plantaMadreId || null,
    fechaInicio: p.fechaInicio || new Date().toISOString(),
    numClones: Number(p.numClones) || 0,
    variedadId: p.variedadId || null,
    diaActual: 0,
    faseActual: 'preparacion',
    checklist: JSON.parse(JSON.stringify(ESQUEJADO_CHECKLIST)),
    estado: 'activo',
    notas: []
  };
  
  return proceso;
}

/**
 * Avanza el proceso de esquejado al siguiente día
 * @param {Object} proceso - Objeto del proceso de esquejado
 * @returns {Object} Proceso actualizado
 */
function avanzarDiaEsquejado(proceso) {
  if (!proceso || proceso.estado !== 'activo') {
    return proceso;
  }
  
  proceso.diaActual = (proceso.diaActual || 0) + 1;
  proceso.faseActual = obtenerFaseEsquejado(proceso.diaActual).id;
  
  return proceso;
}

/**
 * Marca un item del checklist como completado
 * @param {Object} proceso - Objeto del proceso de esquejado
 * @param {string} faseId - ID de la fase
 * @param {string} itemId - ID del item del checklist
 * @returns {Object} Proceso actualizado
 */
function marcarChecklistItem(proceso, faseId, itemId) {
  if (!proceso || !proceso.checklist) {
    return proceso;
  }
  
  const fase = proceso.checklist[faseId];
  if (!fase) return proceso;
  
  const item = fase.find(i => i.id === itemId);
  if (item) {
    item.completado = !item.completado;
  }
  
  return proceso;
}

/**
 * Finaliza el proceso de esquejado
 * @param {Object} proceso - Objeto del proceso de esquejado
 * @param {string} resultado - 'exitoso' | 'fallido'
 * @returns {Object} Proceso actualizado
 */
function finalizarProcesoEsquejado(proceso, resultado) {
  if (!proceso) return proceso;
  
  proceso.estado = resultado || 'completado';
  proceso.fechaFin = new Date().toISOString();
  
  return proceso;
}

/**
 * Añade una nota al proceso de esquejado
 * @param {Object} proceso - Objeto del proceso de esquejado
 * @param {string} nota - Texto de la nota
 * @returns {Object} Proceso actualizado
 */
function añadirNotaEsquejado(proceso, nota) {
  if (!proceso) return proceso;
  
  if (!proceso.notas) proceso.notas = [];
  proceso.notas.push({
    fecha: new Date().toISOString(),
    texto: String(nota)
  });
  
  return proceso;
}

// ════════════════════════════════════════════════
// EXPORTAR FUNCIONES
// ════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ESQUEJADO_FASES,
    ESQUEJADO_CHECKLIST,
    obtenerFaseEsquejado,
    obtenerChecklistFase,
    obtenerChecklistCompleto,
    calcularProgresoEsquejado,
    validarDiaEsquejado,
    obtenerRecomendacionesAmbientales,
    iniciarProcesoEsquejado,
    avanzarDiaEsquejado,
    marcarChecklistItem,
    finalizarProcesoEsquejado,
    añadirNotaEsquejado
  };
}

// Exponer funciones globalmente para uso en la app
if (typeof window !== 'undefined') {
  window.ESQUEJADO_FASES = ESQUEJADO_FASES;
  window.ESQUEJADO_CHECKLIST = ESQUEJADO_CHECKLIST;
  window.obtenerFaseEsquejado = obtenerFaseEsquejado;
  window.obtenerChecklistFase = obtenerChecklistFase;
  window.obtenerChecklistCompleto = obtenerChecklistCompleto;
  window.calcularProgresoEsquejado = calcularProgresoEsquejado;
  window.validarDiaEsquejado = validarDiaEsquejado;
  window.obtenerRecomendacionesAmbientales = obtenerRecomendacionesAmbientales;
  window.iniciarProcesoEsquejado = iniciarProcesoEsquejado;
  window.avanzarDiaEsquejado = avanzarDiaEsquejado;
  window.marcarChecklistItem = marcarChecklistItem;
  window.finalizarProcesoEsquejado = finalizarProcesoEsquejado;
  window.añadirNotaEsquejado = añadirNotaEsquejado;
}

console.log('[hc-esquejado-sistema] Módulo cargado correctamente');
