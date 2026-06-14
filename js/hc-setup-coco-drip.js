/**
 * Configuración específica para Coco Coir + Drip Irrigation
 * Basado en investigación de: Coco For Cannabis
 * Versión: 1.0.0
 */

(function () {
  'use strict';

  // ════════════════════════════════════════════════
  // CONFIGURACIÓN POR DEFECTO PARA COCO DRIP
  // ════════════════════════════════════════════════

  function hcFreshCocoDripSetupBare() {
    return {
      tipoInstalacion: 'coco_drip',
      cocoDripNumPlantas: 4,
      cocoDripTamanoMacetas: 'medium', // small, medium, large
      cocoDripReservorioLitros: 50,
      cocoDripBombaGPH: 300,
      cocoDripTipoDistribucion: 'emitters', // emitters, halos
      cocoDripFrecuenciaRiego: 2, // veces por día
      cocoDripDrybackObjetivo: 30, // porcentaje
      cocoDripPerlitaPorcentaje: 30,
      cocoDripSmartPots: false,
      cocoDripSistemaDrenaje: 'manual' // manual, auto
    };
  }

  function hcFreshCocoDripSetupDefaults() {
    const base = hcFreshCocoDripSetupBare();
    return Object.assign({}, base, {
      cocoDripFechaConfig: new Date().toISOString(),
      cocoDripChecklistCompletado: false
    });
  }

  function cocoDripEnsureConfigDefaults(cfg) {
    if (!cfg) cfg = {};
    const defaults = hcFreshCocoDripSetupDefaults();
    
    // Asegurar valores por defecto
    if (typeof cfg.cocoDripNumPlantas !== 'number') cfg.cocoDripNumPlantas = defaults.cocoDripNumPlantas;
    if (!cfg.cocoDripTamanoMacetas) cfg.cocoDripTamanoMacetas = defaults.cocoDripTamanoMacetas;
    if (typeof cfg.cocoDripReservorioLitros !== 'number') cfg.cocoDripReservorioLitros = defaults.cocoDripReservorioLitros;
    if (typeof cfg.cocoDripBombaGPH !== 'number') cfg.cocoDripBombaGPH = defaults.cocoDripBombaGPH;
    if (!cfg.cocoDripTipoDistribucion) cfg.cocoDripTipoDistribucion = defaults.cocoDripTipoDistribucion;
    if (typeof cfg.cocoDripFrecuenciaRiego !== 'number') cfg.cocoDripFrecuenciaRiego = defaults.cocoDripFrecuenciaRiego;
    if (typeof cfg.cocoDripDrybackObjetivo !== 'number') cfg.cocoDripDrybackObjetivo = defaults.cocoDripDrybackObjetivo;
    if (typeof cfg.cocoDripPerlitaPorcentaje !== 'number') cfg.cocoDripPerlitaPorcentaje = defaults.cocoDripPerlitaPorcentaje;
    if (typeof cfg.cocoDripSmartPots !== 'boolean') cfg.cocoDripSmartPots = defaults.cocoDripSmartPots;
    if (!cfg.cocoDripSistemaDrenaje) cfg.cocoDripSistemaDrenaje = defaults.cocoDripSistemaDrenaje;
    
    return cfg;
  }

  // ════════════════════════════════════════════════
  // FUNCIÓN PARA MANEJAR INPUTS DE COCO DRIP
  // ════════════════════════════════════════════════

  function onSetupCocoDripInput() {
    try {
      const numPlantas = Number(document.getElementById('setupCocoDripNumPlantas')?.value) || 0;
      const tamanoMacetas = document.getElementById('setupCocoDripTamanoMacetas')?.value || 'medium';
      const reservorio = Number(document.getElementById('setupCocoDripReservorioLitros')?.value) || 0;
      const bomba = Number(document.getElementById('setupCocoDripBombaGPH')?.value) || 0;
      const smartPots = document.getElementById('setupCocoDripSmartPots')?.checked || false;
      
      const recoEl = document.getElementById('setupCocoDripRecoValor');
      if (!recoEl) return;
      
      // Generar recomendaciones basadas en la configuración
      let recomendaciones = [];
      
      if (numPlantas > 0) {
        const maxPlantas = Math.floor(bomba / 60); // 60 GPH por planta
        if (numPlantas > maxPlantas) {
          recomendaciones.push(`⚠️ Bomba insuficiente: ${bomba} GPH soporta hasta ${maxPlantas} plantas (60 GPH/planta)`);
        } else {
          recomendaciones.push(`✅ Bomba adecuada para ${numPlantas} plantas`);
        }
      }
      
      if (reservorio < 14) {
        recomendaciones.push('⚠️ Reservorio mínimo recomendado: 14 galones (~53 L)');
      } else {
        recomendaciones.push(`✅ Reservorio de ${reservorio} L adecuado`);
      }
      
      if (smartPots) {
        recomendaciones.push('✅ Smart Pots seleccionados: mejor oxigenación radicular con air pruning');
      } else {
        recomendaciones.push('ℹ️ Considera Smart Pots para mejor oxigenación radicular');
      }
      
      if (tamanoMacetas === 'small' && numPlantas > 8) {
        recomendaciones.push('⚠️ Muchas plantas en macetas pequeñas: considera tamaño medio');
      }
      
      recoEl.textContent = recomendaciones.length > 0 ? recomendaciones.join(' | ') : 'Configura los parámetros para ver recomendaciones';
      
    } catch (e) {
      console.error('[hc-setup-coco-drip] Error en onSetupCocoDripInput:', e);
    }
  }

  // ════════════════════════════════════════════════
  // EXPORTAR FUNCIONES
  // ════════════════════════════════════════════════

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      hcFreshCocoDripSetupBare,
      hcFreshCocoDripSetupDefaults,
      cocoDripEnsureConfigDefaults,
      onSetupCocoDripInput
    };
  }

  if (typeof window !== 'undefined') {
    window.hcFreshCocoDripSetupBare = hcFreshCocoDripSetupBare;
    window.hcFreshCocoDripSetupDefaults = hcFreshCocoDripSetupDefaults;
    window.cocoDripEnsureConfigDefaults = cocoDripEnsureConfigDefaults;
    window.onSetupCocoDripInput = onSetupCocoDripInput;
  }

  console.log('[hc-setup-coco-drip] Módulo cargado correctamente');
})();
