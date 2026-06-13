/**
 * Alertas Específicas por Sistema de Cultivo
 * Basado en investigación de: Coco For Cannabis, Royal Queen Seeds, Artisun Technology
 * Sistemas: Coco Coir + Drip, RDWC, DWC, Propagación
 * Versión: 1.0.0
 */

// ════════════════════════════════════════════════
// ALERTAS POR SISTEMA
// ════════════════════════════════════════════════

const ALERTAS_SISTEMA = {
  coco_drip: {
    ec_baja: {
      condicion: (medicion) => medicion.ec < 1000,
      mensaje: 'EC demasiado baja para coco. Aumentar nutrientes gradualmente.',
      severidad: 'warning',
      accion: 'Aumentar EC a 1200-1400 µS/cm en vegetativo'
    },
    ec_alta: {
      condicion: (medicion) => medicion.ec > 2500,
      mensaje: 'EC demasiado alta para coco. Riesgo de bloqueo de nutrientes.',
      severidad: 'alert',
      accion: 'Reducir EC o aumentar riego para lavar el sustrato'
    },
    ph_bajo: {
      condicion: (medicion) => medicion.ph < 5.3,
      mensaje: 'pH demasiado bajo para coco. Bloqueo de nutrientes inminente.',
      severidad: 'alert',
      accion: 'Ajustar pH a 5.8-6.0'
    },
    ph_alto: {
      condicion: (medicion) => medicion.ph > 6.7,
      mensaje: 'pH demasiado alto para coco. Disponibilidad de nutrientes reducida.',
      severidad: 'warning',
      accion: 'Ajustar pH a 5.8-6.0'
    },
    humedad_baja: {
      condicion: (medicion) => medicion.humSustrato < 30,
      mensaje: 'Humedad del sustrato demasiado baja. Estrés hídrico.',
      severidad: 'warning',
      accion: 'Aumentar frecuencia de riego'
    },
    humedad_alta: {
      condicion: (medicion) => medicion.humSustrato > 70,
      mensaje: 'Humedad del sustrato demasiado alta. Riesgo de pudrición radicular.',
      severidad: 'alert',
      accion: 'Reducir frecuencia de riego y mejorar drenaje'
    },
    dryback_excesivo: {
      condicion: (medicion) => medicion.dryback > 50,
      mensaje: 'Dryback excesivo. Estrés hídrico severo.',
      severidad: 'alert',
      accion: 'Aumentar frecuencia de riego inmediatamente'
    }
  },
  rdwc: {
    ec_baja: {
      condicion: (medicion) => medicion.ec < 1000,
      mensaje: 'EC demasiado baja para RDWC. Nutrición insuficiente.',
      severidad: 'warning',
      accion: 'Aumentar EC a 1200-1400 µS/cm en vegetativo'
    },
    ec_alta: {
      condicion: (medicion) => medicion.ec > 2500,
      mensaje: 'EC demasiado alta para RDWC. Riesgo de quemadura de raíces.',
      severidad: 'alert',
      accion: 'Reducir EC o cambiar agua'
    },
    ph_bajo: {
      condicion: (medicion) => medicion.ph < 5.3,
      mensaje: 'pH demasiado bajo para RDWC. Bloqueo de nutrientes.',
      severidad: 'alert',
      accion: 'Ajustar pH a 5.8-6.2'
    },
    ph_alto: {
      condicion: (medicion) => medicion.ph > 6.7,
      mensaje: 'pH demasiado alto para RDWC. Disponibilidad reducida.',
      severidad: 'warning',
      accion: 'Ajustar pH a 5.8-6.2'
    },
    temp_agua_alta: {
      condicion: (medicion) => medicion.tempAgua > 24,
      mensaje: 'Temperatura del agua demasiado alta. Riesgo de pudrición radicular.',
      severidad: 'alert',
      accion: 'Enfriar agua a 18-22°C (65-72°F)'
    },
    temp_agua_baja: {
      condicion: (medicion) => medicion.tempAgua < 17,
      mensaje: 'Temperatura del agua demasiado baja. Metabolismo lento.',
      severidad: 'warning',
      accion: 'Calentar agua a 18-22°C (65-72°F)'
    },
    oxigenacion_baja: {
      condicion: (medicion) => medicion.oxigeno < 6,
      mensaje: 'Oxigenación del agua baja. Riesgo de pudrición radicular.',
      severidad: 'alert',
      accion: 'Verificar aireadores y aumentar oxigenación'
    }
  },
  dwc: {
    ec_baja: {
      condicion: (medicion) => medicion.ec < 1000,
      mensaje: 'EC demasiado baja para DWC. Nutrición insuficiente.',
      severidad: 'warning',
      accion: 'Aumentar EC a 1200-1400 µS/cm en vegetativo'
    },
    ec_alta: {
      condicion: (medicion) => medicion.ec > 2500,
      mensaje: 'EC demasiado alta para DWC. Riesgo de quemadura.',
      severidad: 'alert',
      accion: 'Reducir EC o cambiar agua'
    },
    ph_bajo: {
      condicion: (medicion) => medicion.ph < 5.3,
      mensaje: 'pH demasiado bajo para DWC. Bloqueo de nutrientes.',
      severidad: 'alert',
      accion: 'Ajustar pH a 5.8-6.2'
    },
    ph_alto: {
      condicion: (medicion) => medicion.ph > 6.7,
      mensaje: 'pH demasiado alto para DWC. Disponibilidad reducida.',
      severidad: 'warning',
      accion: 'Ajustar pH a 5.8-6.2'
    },
    temp_agua_alta: {
      condicion: (medicion) => medicion.tempAgua > 24,
      mensaje: 'Temperatura del agua demasiado alta. Riesgo de pudrición.',
      severidad: 'alert',
      accion: 'Enfriar agua a 18-22°C (65-72°F)'
    },
    nivel_agua_bajo: {
      condicion: (medicion) => medicion.nivelAgua < 2,
      mensaje: 'Nivel de agua demasiado bajo. Raíces expuestas al aire.',
      severidad: 'alert',
      accion: 'Rellenar cubos inmediatamente'
    },
    nivel_agua_alto: {
      condicion: (medicion) => medicion.nivelAgua > 4,
      mensaje: 'Nivel de agua demasiado alto. Riesgo de pudrición del tallo.',
      severidad: 'warning',
      accion: 'Reducir nivel de agua a 1-2" por debajo de la cesta'
    }
  },
  propagacion: {
    ec_alta: {
      condicion: (medicion) => medicion.ec > 1000,
      mensaje: 'EC demasiado alta para propagación. Quemadura de raíces.',
      severidad: 'alert',
      accion: 'Reducir EC a 400-800 µS/cm'
    },
    ph_bajo: {
      condicion: (medicion) => medicion.ph < 5.3,
      mensaje: 'pH demasiado bajo para propagación. Dificulta enraizamiento.',
      severidad: 'alert',
      accion: 'Ajustar pH a 5.5-6.2'
    },
    ph_alto: {
      condicion: (medicion) => medicion.ph > 6.5,
      mensaje: 'pH demasiado alto para propagación. Dificulta enraizamiento.',
      severidad: 'warning',
      accion: 'Ajustar pH a 5.5-6.2'
    },
    humedad_baja: {
      condicion: (medicion) => medicion.humedadAmbiente < 70,
      mensaje: 'Humedad ambiente demasiado baja. Marchitamiento de clones.',
      severidad: 'alert',
      accion: 'Aumentar humedad a 80-90% con domo'
    },
    humedad_alta: {
      condicion: (medicion) => medicion.humedadAmbiente > 95,
      mensaje: 'Humedad ambiente demasiado alta. Riesgo de moho.',
      severidad: 'warning',
      accion: 'Ventilar domo para reducir humedad'
    },
    temp_alta: {
      condicion: (medicion) => medicion.tempAmbiente > 28,
      mensaje: 'Temperatura demasiado alta. Estrés de clones.',
      severidad: 'alert',
      accion: 'Reducir temperatura a 24-27°C (75-80°F)'
    },
    temp_baja: {
      condicion: (medicion) => medicion.tempAmbiente < 20,
      mensaje: 'Temperatura demasiado baja. Enraizamiento lento.',
      severidad: 'warning',
      accion: 'Aumentar temperatura a 24-27°C (75-80°F)'
    }
  }
};

// ════════════════════════════════════════════════
// FUNCIONES DE ALERTAS
// ════════════════════════════════════════════════

/**
 * Evalúa alertas para un sistema específico
 * @param {string} sistemaId - ID del sistema (coco_drip, rdwc, dwc, propagacion)
 * @param {Object} medicion - Datos de medición actual
 * @returns {Array} Array de alertas activas
 */
function evaluarAlertasSistema(sistemaId, medicion) {
  const alertasSistema = ALERTAS_SISTEMA[sistemaId];
  if (!alertasSistema) return [];
  
  const med = medicion || {};
  const alertasActivas = [];
  
  Object.keys(alertasSistema).forEach(alertaId => {
    const alerta = alertasSistema[alertaId];
    try {
      if (alerta.condicion(med)) {
        alertasActivas.push({
          id: alertaId,
          mensaje: alerta.mensaje,
          severidad: alerta.severidad,
          accion: alerta.accion,
          sistema: sistemaId
        });
      }
    } catch (e) {
      console.error(`Error evaluando alerta ${alertaId}:`, e);
    }
  });
  
  return alertasActivas;
}

/**
 * Evalúa alertas para múltiples sistemas
 * @param {Object} mediciones - { sistemaId: medicion }
 * @returns {Object} { sistemaId: alertas[] }
 */
function evaluarAlertasMultiplesSistemas(mediciones) {
  const meds = mediciones || {};
  const resultado = {};
  
  Object.keys(meds).forEach(sistemaId => {
    resultado[sistemaId] = evaluarAlertasSistema(sistemaId, meds[sistemaId]);
  });
  
  return resultado;
}

/**
 * Filtra alertas por severidad
 * @param {Array} alertas - Array de alertas
 * @param {string} severidad - 'alert' | 'warning' | 'info'
 * @returns {Array} Alertas filtradas
 */
function filtrarAlertasPorSeveridad(alertas, severidad) {
  if (!alertas || !Array.isArray(alertas)) return [];
  
  return alertas.filter(a => a.severidad === severidad);
}

/**
 * Obtiene alertas críticas (severidad 'alert')
 * @param {Array} alertas - Array de alertas
 * @returns {Array} Alertas críticas
 */
function obtenerAlertasCriticas(alertas) {
  return filtrarAlertasPorSeveridad(alertas, 'alert');
}

/**
 * Obtiene alertas de advertencia (severidad 'warning')
 * @param {Array} alertas - Array de alertas
 * @returns {Array} Alertas de advertencia
 */
function obtenerAlertasAdvertencia(alertas) {
  return filtrarAlertasPorSeveridad(alertas, 'warning');
}

/**
 * Genera un resumen de alertas
 * @param {Array} alertas - Array de alertas
 * @returns {Object} { total, criticas, advertencias, info }
 */
function resumenAlertas(alertas) {
  if (!alertas || !Array.isArray(alertas)) {
    return { total: 0, criticas: 0, advertencias: 0, info: 0 };
  }
  
  return {
    total: alertas.length,
    criticas: obtenerAlertasCriticas(alertas).length,
    advertencias: obtenerAlertasAdvertencia(alertas).length,
    info: filtrarAlertasPorSeveridad(alertas, 'info').length
  };
}

/**
 * Verifica si hay alertas críticas
 * @param {Array} alertas - Array de alertas
 * @returns {boolean} True si hay alertas críticas
 */
function hayAlertasCriticas(alertas) {
  return obtenerAlertasCriticas(alertas).length > 0;
}

/**
 * Genera mensaje de resumen de alertas
 * @param {Array} alertas - Array de alertas
 * @returns {string} Mensaje de resumen
 */
function generarMensajeResumen(alertas) {
  const resumen = resumenAlertas(alertas);
  
  if (resumen.total === 0) {
    return 'Sin alertas. Sistema funcionando correctamente.';
  }
  
  const partes = [];
  if (resumen.criticas > 0) {
    partes.push(`${resumen.criticas} alerta(s) crítica(s)`);
  }
  if (resumen.advertencias > 0) {
    partes.push(`${resumen.advertencias} advertencia(s)`);
  }
  if (resumen.info > 0) {
    partes.push(`${resumen.info} info`);
  }
  
  return `Atención: ${partes.join(', ')}.`;
}

/**
 * Obtiene alertas recomendadas según fase de cultivo
 * @param {string} sistemaId - ID del sistema
 * @param {string} fase - 'vegetativo' | 'floracion' | 'transicion'
 * @returns {Array} Alertas recomendadas
 */
function obtenerAlertasRecomendadas(sistemaId, fase) {
  const sistema = ALERTAS_SISTEMA[sistemaId];
  if (!sistema) return [];
  
  // Alertas generales según fase
  const alertasFase = [];
  
  if (fase === 'vegetativo') {
    alertasFase.push({
      id: 'info_veg',
      mensaje: 'Fase vegetativa: Mantener EC 1200-1600 µS/cm',
      severidad: 'info',
      accion: 'Monitorear crecimiento y ajustar EC gradualmente'
    });
  } else if (fase === 'floracion') {
    alertasFase.push({
      id: 'info_flor',
      mensaje: 'Fase de floración: Mantener EC 1600-2400 µS/cm',
      severidad: 'info',
      accion: 'Aumentar EC gradualmente según engorde'
    });
  }
  
  return alertasFase;
}

// ════════════════════════════════════════════════
// EXPORTAR FUNCIONES
// ════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ALERTAS_SISTEMA,
    evaluarAlertasSistema,
    evaluarAlertasMultiplesSistemas,
    filtrarAlertasPorSeveridad,
    obtenerAlertasCriticas,
    obtenerAlertasAdvertencia,
    resumenAlertas,
    hayAlertasCriticas,
    generarMensajeResumen,
    obtenerAlertasRecomendadas
  };
}

// Exponer funciones globalmente para uso en la app
if (typeof window !== 'undefined') {
  window.ALERTAS_SISTEMA = ALERTAS_SISTEMA;
  window.evaluarAlertasSistema = evaluarAlertasSistema;
  window.evaluarAlertasMultiplesSistemas = evaluarAlertasMultiplesSistemas;
  window.filtrarAlertasPorSeveridad = filtrarAlertasPorSeveridad;
  window.obtenerAlertasCriticas = obtenerAlertasCriticas;
  window.obtenerAlertasAdvertencia = obtenerAlertasAdvertencia;
  window.resumenAlertas = resumenAlertas;
  window.hayAlertasCriticas = hayAlertasCriticas;
  window.generarMensajeResumen = generarMensajeResumen;
  window.obtenerAlertasRecomendadas = obtenerAlertasRecomendadas;
}

console.log('[hc-alertas-sistema] Módulo cargado correctamente');
