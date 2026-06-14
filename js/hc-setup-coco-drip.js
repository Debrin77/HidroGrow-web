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
      cocoDripSistemaDrenaje: 'manual', // manual, auto
      cocoDripFaseCultivo: 'vegetativo', // vegetativo, floracion
      cocoDripUsarPlacaSolar: false,
      cocoDripPotenciaPlacaSolarW: 0,
      cocoDripDuracionRiegoMin: 5, // minutos por evento
      cocoDripEmitterFlowLph: 2 // L/h por emitter
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
    if (!cfg.cocoDripFaseCultivo) cfg.cocoDripFaseCultivo = defaults.cocoDripFaseCultivo;
    if (typeof cfg.cocoDripUsarPlacaSolar !== 'boolean') cfg.cocoDripUsarPlacaSolar = defaults.cocoDripUsarPlacaSolar;
    if (typeof cfg.cocoDripPotenciaPlacaSolarW !== 'number') cfg.cocoDripPotenciaPlacaSolarW = defaults.cocoDripPotenciaPlacaSolarW;
    if (typeof cfg.cocoDripDuracionRiegoMin !== 'number') cfg.cocoDripDuracionRiegoMin = defaults.cocoDripDuracionRiegoMin;
    if (typeof cfg.cocoDripEmitterFlowLph !== 'number') cfg.cocoDripEmitterFlowLph = defaults.cocoDripEmitterFlowLph;
    
    return cfg;
  }

  // ════════════════════════════════════════════════
  // CÁLCULOS DE RIEGO Y BOMBA
  // ════════════════════════════════════════════════

  /**
   * Calcula el volumen de maceta en litros según tamaño
   */
  function obtenerVolumenMacetaLitros(tamano) {
    const volumenes = {
      small: 11.4, // 3 gal
      medium: 18.9, // 5 gal
      large: 56.8 // 15 gal
    };
    return volumenes[tamano] || volumenes.medium;
  }

  /**
   * Calcula la bomba recomendada en GPH basado en número de plantas y frecuencia de riego
   * Basado en: 60 GPH por planta como regla general (Coco For Cannabis)
   * Ajustado para múltiples riegos diarios
   */
  function calcularBombaRecomendada(numPlantas, frecuenciaRiego, tamanoMacetas) {
    if (!numPlantas || numPlantas <= 0) return 300; // valor por defecto
    
    // GPH base por planta según tamaño de maceta
    const volMaceta = obtenerVolumenMacetaLitros(tamanoMacetas);
    let gphPorPlanta = 60; // base
    
    // Ajustar según tamaño de maceta (macetas más grandes necesitan más flujo)
    if (tamanoMacetas === 'large') gphPorPlanta = 80;
    else if (tamanoMacetas === 'small') gphPorPlanta = 40;
    
    // Ajustar según frecuencia (más frecuencia = menos GPH por planta)
    const factorFrecuencia = Math.max(0.5, 2 / frecuenciaRiego);
    const gphTotal = Math.ceil(numPlantas * gphPorPlanta * factorFrecuencia);
    
    // Mínimo 100 GPH, máximo 1000 GPH
    return Math.max(100, Math.min(1000, gphTotal));
  }

  /**
   * Calcula la frecuencia de riego recomendada según fase de cultivo
   * Basado en: Coco For Cannabis - 3-5 veces/día en floración, 1-2 en vegetativo
   */
  function calcularFrecuenciaRiegoRecomendada(fase) {
    const frecuencias = {
      vegetativo: 2, // 2 veces por día
      prefloracion: 3, // 3 veces por día
      floracion: 4, // 4 veces por día (rango 3-5)
      esqueje: 1 // 1 vez por día
    };
    return frecuencias[fase] || 2;
  }

  /**
   * Calcula la duración de cada evento de riego en minutos
   * Basado en: volumen de agua necesario (5% del volumen de maceta) y flujo del emitter
   */
  function calcularDuracionRiegoMin(numPlantas, tamanoMacetas, emitterFlowLph) {
    const volMaceta = obtenerVolumenMacetaLitros(tamanoMacetas);
    // 5% del volumen de maceta por evento (Coco For Cannabis)
    const volAguaPorEvento = volMaceta * 0.05;
    const volTotal = volAguaPorEvento * numPlantas;
    
    // Convertir emitter flow de L/h a L/min
    const flowLpm = emitterFlowLph / 60;
    
    // Tiempo en minutos = volumen total / flujo total
    // Asumiendo 1 emitter por planta
    const tiempoMin = volTotal / (flowLpm * numPlantas);
    
    // Mínimo 1 minuto, máximo 15 minutos
    return Math.max(1, Math.min(15, Math.ceil(tiempoMin)));
  }

  /**
   * Calcula la potencia de placa solar recomendada en Watts
   * Basado en: potencia de bomba + margen de seguridad + batería
   */
  function calcularPotenciaPlacaSolarRecomendada(bombaGPH, usarPlacaSolar) {
    if (!usarPlacaSolar) return 0;
    
    // Bomba típica: ~10-20W por 100 GPH
    const potenciaBombaW = (bombaGPH / 100) * 15;
    
    // Margen de seguridad del 50% para batería y pérdidas
    const potenciaTotal = potenciaBombaW * 1.5;
    
    // Mínimo 50W, máximo 500W
    return Math.max(50, Math.min(500, Math.ceil(potenciaTotal / 10) * 10));
  }

  // ════════════════════════════════════════════════
  // VALIDACIÓN Y GUARDADO
  // ════════════════════════════════════════════════

  function applySetupCocoDripDesdeFormulario() {
    try {
      const numPlantas = Number(document.getElementById('setupCocoDripNumPlantas')?.value) || 0;
      const tamanoMacetas = document.getElementById('setupCocoDripTamanoMacetas')?.value || 'medium';
      const reservorio = Number(document.getElementById('setupCocoDripReservorioLitros')?.value) || 0;
      const bomba = Number(document.getElementById('setupCocoDripBombaGPH')?.value) || 0;
      const tipoDistribucion = document.getElementById('setupCocoDripTipoDistribucion')?.value || 'emitters';
      const frecuenciaRiego = Number(document.getElementById('setupCocoDripFrecuenciaRiego')?.value) || 2;
      const drybackObjetivo = Number(document.getElementById('setupCocoDripDrybackObjetivo')?.value) || 30;
      const perlitaPorcentaje = Number(document.getElementById('setupCocoDripPerlitaPorcentaje')?.value) || 30;
      const smartPots = document.getElementById('setupCocoDripSmartPots')?.checked || false;
      const sistemaDrenaje = document.getElementById('setupCocoDripSistemaDrenaje')?.value || 'manual';
      const faseCultivo = document.getElementById('setupCocoDripFaseCultivo')?.value || 'vegetativo';
      const usarPlacaSolar = document.getElementById('setupCocoDripUsarPlacaSolar')?.checked || false;
      const potenciaPlacaSolarW = Number(document.getElementById('setupCocoDripPotenciaPlacaSolarW')?.value) || 0;
      const duracionRiegoMin = Number(document.getElementById('setupCocoDripDuracionRiegoMin')?.value) || 5;
      const emitterFlowLph = Number(document.getElementById('setupCocoDripEmitterFlowLph')?.value) || 2;

      return {
        tipoInstalacion: 'coco_drip',
        cocoDripNumPlantas: numPlantas,
        cocoDripTamanoMacetas: tamanoMacetas,
        cocoDripReservorioLitros: reservorio,
        cocoDripBombaGPH: bomba,
        cocoDripTipoDistribucion: tipoDistribucion,
        cocoDripFrecuenciaRiego: frecuenciaRiego,
        cocoDripDrybackObjetivo: drybackObjetivo,
        cocoDripPerlitaPorcentaje: perlitaPorcentaje,
        cocoDripSmartPots: smartPots,
        cocoDripSistemaDrenaje: sistemaDrenaje,
        cocoDripFaseCultivo: faseCultivo,
        cocoDripUsarPlacaSolar: usarPlacaSolar,
        cocoDripPotenciaPlacaSolarW: potenciaPlacaSolarW,
        cocoDripDuracionRiegoMin: duracionRiegoMin,
        cocoDripEmitterFlowLph: emitterFlowLph
      };
    } catch (e) {
      console.error('[hc-setup-coco-drip] Error en applySetupCocoDripDesdeFormulario:', e);
      return {};
    }
  }

  function cocoDripSetupFormularioCompleto() {
    try {
      const numPlantas = Number(document.getElementById('setupCocoDripNumPlantas')?.value) || 0;
      const reservorio = Number(document.getElementById('setupCocoDripReservorioLitros')?.value) || 0;
      const bomba = Number(document.getElementById('setupCocoDripBombaGPH')?.value) || 0;
      
      return numPlantas > 0 && reservorio > 0 && bomba > 0;
    } catch (e) {
      console.error('[hc-setup-coco-drip] Error en cocoDripSetupFormularioCompleto:', e);
      return false;
    }
  }

  function cocoDripSetupValidFromConfig(cfg) {
    if (!cfg) return false;
    const numPlantas = cfg.cocoDripNumPlantas || 0;
    const reservorio = cfg.cocoDripReservorioLitros || 0;
    const bomba = cfg.cocoDripBombaGPH || 0;
    
    return numPlantas > 0 && reservorio > 0 && bomba > 0;
  }

  function syncSetupCocoDripFieldsDesdeConfig(cfg) {
    try {
      if (!cfg) return;
      
      const numPlantasInput = document.getElementById('setupCocoDripNumPlantas');
      const tamanoMacetasInput = document.getElementById('setupCocoDripTamanoMacetas');
      const reservorioInput = document.getElementById('setupCocoDripReservorioLitros');
      const bombaInput = document.getElementById('setupCocoDripBombaGPH');
      const tipoDistribucionInput = document.getElementById('setupCocoDripTipoDistribucion');
      const frecuenciaRiegoInput = document.getElementById('setupCocoDripFrecuenciaRiego');
      const drybackObjetivoInput = document.getElementById('setupCocoDripDrybackObjetivo');
      const perlitaPorcentajeInput = document.getElementById('setupCocoDripPerlitaPorcentaje');
      const smartPotsInput = document.getElementById('setupCocoDripSmartPots');
      const sistemaDrenajeInput = document.getElementById('setupCocoDripSistemaDrenaje');
      const faseCultivoInput = document.getElementById('setupCocoDripFaseCultivo');
      const usarPlacaSolarInput = document.getElementById('setupCocoDripUsarPlacaSolar');
      const potenciaPlacaSolarWInput = document.getElementById('setupCocoDripPotenciaPlacaSolarW');
      const duracionRiegoMinInput = document.getElementById('setupCocoDripDuracionRiegoMin');
      const emitterFlowLphInput = document.getElementById('setupCocoDripEmitterFlowLph');

      if (numPlantasInput && cfg.cocoDripNumPlantas) numPlantasInput.value = cfg.cocoDripNumPlantas;
      if (tamanoMacetasInput && cfg.cocoDripTamanoMacetas) tamanoMacetasInput.value = cfg.cocoDripTamanoMacetas;
      if (reservorioInput && cfg.cocoDripReservorioLitros) reservorioInput.value = cfg.cocoDripReservorioLitros;
      if (bombaInput && cfg.cocoDripBombaGPH) bombaInput.value = cfg.cocoDripBombaGPH;
      if (tipoDistribucionInput && cfg.cocoDripTipoDistribucion) tipoDistribucionInput.value = cfg.cocoDripTipoDistribucion;
      if (frecuenciaRiegoInput && cfg.cocoDripFrecuenciaRiego) frecuenciaRiegoInput.value = cfg.cocoDripFrecuenciaRiego;
      if (drybackObjetivoInput && cfg.cocoDripDrybackObjetivo) drybackObjetivoInput.value = cfg.cocoDripDrybackObjetivo;
      if (perlitaPorcentajeInput && cfg.cocoDripPerlitaPorcentaje) perlitaPorcentajeInput.value = cfg.cocoDripPerlitaPorcentaje;
      if (smartPotsInput && typeof cfg.cocoDripSmartPots === 'boolean') smartPotsInput.checked = cfg.cocoDripSmartPots;
      if (sistemaDrenajeInput && cfg.cocoDripSistemaDrenaje) sistemaDrenajeInput.value = cfg.cocoDripSistemaDrenaje;
      if (faseCultivoInput && cfg.cocoDripFaseCultivo) faseCultivoInput.value = cfg.cocoDripFaseCultivo;
      if (usarPlacaSolarInput && typeof cfg.cocoDripUsarPlacaSolar === 'boolean') usarPlacaSolarInput.checked = cfg.cocoDripUsarPlacaSolar;
      if (potenciaPlacaSolarWInput && cfg.cocoDripPotenciaPlacaSolarW) potenciaPlacaSolarWInput.value = cfg.cocoDripPotenciaPlacaSolarW;
      if (duracionRiegoMinInput && cfg.cocoDripDuracionRiegoMin) duracionRiegoMinInput.value = cfg.cocoDripDuracionRiegoMin;
      if (emitterFlowLphInput && cfg.cocoDripEmitterFlowLph) emitterFlowLphInput.value = cfg.cocoDripEmitterFlowLph;
    } catch (e) {
      console.error('[hc-setup-coco-drip] Error en syncSetupCocoDripFieldsDesdeConfig:', e);
    }
  }

  function hcCompletarCocoDripSetupDefaultsAntesGuardar() {
    try {
      const cfg = applySetupCocoDripDesdeFormulario();
      if (typeof cocoDripEnsureConfigDefaults === 'function') {
        cocoDripEnsureConfigDefaults(cfg);
      }
      syncSetupCocoDripFieldsDesdeConfig(cfg);
    } catch (e) {
      console.error('[hc-setup-coco-drip] Error en hcCompletarCocoDripSetupDefaultsAntesGuardar:', e);
    }
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
      const faseCultivo = document.getElementById('setupCocoDripFaseCultivo')?.value || 'vegetativo';
      const frecuenciaRiego = Number(document.getElementById('setupCocoDripFrecuenciaRiego')?.value) || 2;
      const usarPlacaSolar = document.getElementById('setupCocoDripUsarPlacaSolar')?.checked || false;
      const emitterFlow = Number(document.getElementById('setupCocoDripEmitterFlowLph')?.value) || 2;
      
      const recoEl = document.getElementById('setupCocoDripRecoValor');
      if (!recoEl) return;
      
      // Calcular valores recomendados
      const bombaRecomendada = calcularBombaRecomendada(numPlantas, frecuenciaRiego, tamanoMacetas);
      const frecuenciaRecomendada = calcularFrecuenciaRiegoRecomendada(faseCultivo);
      const duracionRecomendada = calcularDuracionRiegoMin(numPlantas, tamanoMacetas, emitterFlow);
      const potenciaSolarRecomendada = calcularPotenciaPlacaSolarRecomendada(bomba, usarPlacaSolar);
      
      // Generar recomendaciones basadas en la configuración
      let recomendaciones = [];
      
      // Validación de bomba
      if (numPlantas > 0) {
        const maxPlantas = Math.floor(bomba / 60); // 60 GPH por planta
        if (numPlantas > maxPlantas) {
          recomendaciones.push(`⚠️ Bomba insuficiente: ${bomba} GPH soporta hasta ${maxPlantas} plantas (60 GPH/planta). Recomendado: ${bombaRecomendada} GPH`);
        } else {
          recomendaciones.push(`✅ Bomba adecuada para ${numPlantas} plantas`);
        }
      }
      
      // Validación de reservorio
      if (reservorio < 14) {
        recomendaciones.push('⚠️ Reservorio mínimo recomendado: 14 galones (~53 L)');
      } else {
        recomendaciones.push(`✅ Reservorio de ${reservorio} L adecuado`);
      }
      
      // Recomendación de frecuencia según fase
      if (frecuenciaRiego !== frecuenciaRecomendada) {
        recomendaciones.push(`ℹ️ Fase ${faseCultivo}: frecuencia recomendada ${frecuenciaRecomendada} veces/día`);
      }
      
      // Recomendación de duración
      recomendaciones.push(`⏱️ Duración riego: ~${duracionRecomendada} min por evento (${emitterFlow} L/h emitter)`);
      
      // Smart Pots
      if (smartPots) {
        recomendaciones.push('✅ Smart Pots seleccionados: mejor oxigenación radicular con air pruning');
      } else {
        recomendaciones.push('ℹ️ Considera Smart Pots para mejor oxigenación radicular');
      }
      
      // Validación de macetas
      if (tamanoMacetas === 'small' && numPlantas > 8) {
        recomendaciones.push('⚠️ Muchas plantas en macetas pequeñas: considera tamaño medio');
      }
      
      // Placa solar
      if (usarPlacaSolar) {
        recomendaciones.push(`☀️ Placa solar: recomendado ${potenciaSolarRecomendada} W para bomba de ${bomba} GPH`);
      }
      
      recoEl.textContent = recomendaciones.length > 0 ? recomendaciones.join(' | ') : 'Configura los parámetros para ver recomendaciones';
      
      // Auto-ajustar bomba si está vacío
      const bombaInput = document.getElementById('setupCocoDripBombaGPH');
      if (bombaInput && (!bomba || bomba === 0) && numPlantas > 0) {
        bombaInput.value = bombaRecomendada;
      }
      
      // Auto-ajustar duración
      const duracionInput = document.getElementById('setupCocoDripDuracionRiegoMin');
      if (duracionInput) {
        duracionInput.value = duracionRecomendada;
      }
      
      // Auto-ajustar potencia solar
      if (usarPlacaSolar) {
        const potenciaSolarInput = document.getElementById('setupCocoDripPotenciaPlacaSolarW');
        if (potenciaSolarInput) {
          potenciaSolarInput.value = potenciaSolarRecomendada;
        }
      }
      
      // Persistir configuración
      if (typeof state !== 'undefined' && state && state.configTorre) {
        const cfg = state.configTorre;
        cfg.cocoDripNumPlantas = numPlantas;
        cfg.cocoDripTamanoMacetas = tamanoMacetas;
        cfg.cocoDripReservorioLitros = reservorio;
        cfg.cocoDripBombaGPH = bomba;
        cfg.cocoDripSmartPots = smartPots;
        cfg.cocoDripFaseCultivo = faseCultivo;
        cfg.cocoDripFrecuenciaRiego = frecuenciaRiego;
        cfg.cocoDripUsarPlacaSolar = usarPlacaSolar;
        cfg.cocoDripEmitterFlowLph = emitterFlow;
        cfg.cocoDripDuracionRiegoMin = duracionRecomendada;
        cfg.cocoDripPotenciaPlacaSolarW = usarPlacaSolar ? potenciaSolarRecomendada : 0;
        
        if (typeof saveState === 'function') saveState();
      }
      
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
      onSetupCocoDripInput,
      applySetupCocoDripDesdeFormulario,
      cocoDripSetupFormularioCompleto,
      cocoDripSetupValidFromConfig,
      syncSetupCocoDripFieldsDesdeConfig,
      hcCompletarCocoDripSetupDefaultsAntesGuardar
    };
  }

  if (typeof window !== 'undefined') {
    window.hcFreshCocoDripSetupBare = hcFreshCocoDripSetupBare;
    window.hcFreshCocoDripSetupDefaults = hcFreshCocoDripSetupDefaults;
    window.cocoDripEnsureConfigDefaults = cocoDripEnsureConfigDefaults;
    window.onSetupCocoDripInput = onSetupCocoDripInput;
    window.calcularBombaRecomendadaCocoDrip = calcularBombaRecomendada;
    window.calcularFrecuenciaRiegoRecomendadaCocoDrip = calcularFrecuenciaRiegoRecomendada;
    window.calcularDuracionRiegoCocoDrip = calcularDuracionRiegoMin;
    window.calcularPotenciaPlacaSolarCocoDrip = calcularPotenciaPlacaSolarRecomendada;
    window.applySetupCocoDripDesdeFormulario = applySetupCocoDripDesdeFormulario;
    window.cocoDripSetupFormularioCompleto = cocoDripSetupFormularioCompleto;
    window.cocoDripSetupValidFromConfig = cocoDripSetupValidFromConfig;
    window.syncSetupCocoDripFieldsDesdeConfig = syncSetupCocoDripFieldsDesdeConfig;
    window.hcCompletarCocoDripSetupDefaultsAntesGuardar = hcCompletarCocoDripSetupDefaultsAntesGuardar;
  }

  console.log('[hc-setup-coco-drip] Módulo cargado correctamente');
})();
