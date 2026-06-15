/**
 * Referencia oficial cultivo coco + goteo DTW — Saltón Verde / Netadrip.
 * Fuente: https://saltonverde.com/guia-de-cultivo-en-coco/
 * (Guía Tesla1200W y Nabis en colaboración con Netadrip.)
 */
(function (global) {
  'use strict';

  var FUENTE_URL = 'https://saltonverde.com/guia-de-cultivo-en-coco/';
  var FUENTE_LABEL = 'Saltón Verde — Guía de Cultivo en Coco (Netadrip)';

  /** mS/cm → µS/cm (×1000). La app trabaja en µS/cm. */
  function msCmToUs(minMs, maxMs) {
    return {
      min: Math.round(minMs * 1000),
      max: Math.round(maxMs * 1000),
      ecMinMs: minMs,
      ecMaxMs: maxMs,
    };
  }

  /**
   * Tabla EC/pH por fase — Saltón Verde (foto 2 / sección EC del sustrato).
   */
  var FASES_EC_PH = {
    enraizado_esqueje: {
      id: 'enraizado_esqueje',
      label: 'Enraizado (esqueje)',
      ec: msCmToUs(0.4, 0.6),
      ph: { min: 5.5, max: 5.8 },
    },
    inicio_vegetativo: {
      id: 'inicio_vegetativo',
      label: 'Inicio vegetativo',
      ec: msCmToUs(0.8, 1.2),
      ph: { min: 5.8, max: 6.0 },
    },
    crecimiento_activo: {
      id: 'crecimiento_activo',
      label: 'Crecimiento activo',
      ec: msCmToUs(1.2, 1.6),
      ph: { min: 5.8, max: 6.0 },
    },
    prefloracion_stretch: {
      id: 'prefloracion_stretch',
      label: 'Prefloración (stretch)',
      ec: msCmToUs(1.6, 1.8),
      ph: { min: 5.9, max: 6.2 },
    },
    floracion_media: {
      id: 'floracion_media',
      label: 'Floración media',
      ec: msCmToUs(1.8, 2.2),
      ph: { min: 6.0, max: 6.3 },
    },
    floracion_final: {
      id: 'floracion_final',
      label: 'Floración final',
      ec: msCmToUs(1.4, 1.6),
      ph: { min: 6.2, max: 6.4 },
    },
    lavado_final: {
      id: 'lavado_final',
      label: 'Lavado final',
      ec: { min: 0, max: 400, ecMinMs: 0, ecMaxMs: 0.4 },
      ph: { min: 6.0, max: 6.5 },
      nota: 'EC < 0,4 mS/cm; solución ligera con Ca/Mg — no agua pura (SV).',
    },
  };

  /** Mapeo microfase app → fase Saltón Verde. */
  var MICROFASE_A_FASE_SV = {
    plántula: 'enraizado_esqueje',
    esqueje: 'enraizado_esqueje',
    veg_temprano: 'inicio_vegetativo',
    veg_tarde: 'crecimiento_activo',
    prefloracion: 'prefloracion_stretch',
    flor_temprana: 'prefloracion_stretch',
    flor_pico: 'floracion_media',
    flor_tardia: 'floracion_final',
    flush: 'lavado_final',
    vegetativo: 'crecimiento_activo',
    prefloracion_legacy: 'prefloracion_stretch',
    floracion: 'floracion_media',
  };

  var RUNOFF_PCT = { min: 10, max: 20 };

  /** Dryback: regar al 60–70 % humedad (= 30–40 % seco desde último riego). */
  var DRYBACK_RIEGO_PCT = { min: 30, max: 40 };

  /** Densidad recomendada (guía SV). */
  var DENSIDAD_SV = {
    plantasPorM2: 9,
    macetaLitrosMin: 4,
    macetaLitrosMax: 5,
    macetaInicialLitrosMin: 0.3,
    macetaInicialLitrosMax: 1,
  };

  /** Macetas definitivas 4–5 L (Salton Verde); no hidro DWC. */
  var MACETA_LITROS_SV = {
    small: 4,
    medium: 5,
    large: 11,
  };

  var REGLAS_ORO = [
    'Fertilizar en cada riego (DTW); no alternar con agua sola salvo lavado final con solución muy diluida.',
    'Siempre 10–20 % de drenaje por riego; desechar runoff — nunca dejar la maceta encharcada en su propio drenaje.',
    'No dejar secar el coco por completo; regar al ~30–40 % de seco (60–70 % humedad).',
    'Medir EC de entrada y EC de runoff en cada revisión.',
    'pH riego: ~5,8–6,0 en crecimiento; 6,0–6,3 en floración.',
    'Goteo automatizado recomendado (p. ej. Netadrip Hydra) para riegos múltiples uniformes.',
  ];

  var SISTEMA_DESCRIPCION =
    'Cultivo sin suelo: fibra de coco bufferizada en maceta + fertigación por goteo ' +
    '(Drain-to-Waste). No es hidroponía DWC/RDWC: las raíces viven en sustrato inerte, ' +
    'no en solución. Distribución en rejilla tipo sala (como RDWC) con bandeja de drenaje independiente.';

  function mapMicrofaseAFaseSaltonVerde(microfase) {
    var k = String(microfase || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (MICROFASE_A_FASE_SV[k]) return FASES_EC_PH[MICROFASE_A_FASE_SV[k]];
    if (k.indexOf('flor') >= 0 && k.indexOf('tard') >= 0) return FASES_EC_PH.floracion_final;
    if (k.indexOf('flor') >= 0) return FASES_EC_PH.floracion_media;
    if (k.indexOf('preflor') >= 0) return FASES_EC_PH.prefloracion_stretch;
    if (k.indexOf('veg') >= 0) return FASES_EC_PH.crecimiento_activo;
    if (k === 'flush' || k.indexOf('lavado') >= 0) return FASES_EC_PH.lavado_final;
    return FASES_EC_PH.inicio_vegetativo;
  }

  function getEcPhSaltonVerde(microfaseOrFase) {
    return mapMicrofaseAFaseSaltonVerde(microfaseOrFase);
  }

  function ecRangoUsDesdeFaseSv(faseSv) {
    if (!faseSv || !faseSv.ec) return null;
    return {
      min: faseSv.ec.min,
      max: faseSv.ec.max,
      label: faseSv.label,
      phMin: faseSv.ph.min,
      phMax: faseSv.ph.max,
    };
  }

  /** Lavado: EC ~20–25 % de la EC de floración pico (SV). */
  function ecFlushDesdeEcFlorMs(ecFlorMaxMs) {
    var peak = Number(ecFlorMaxMs) || 2.0;
    var flushMs = peak * 0.225;
    return {
      min: 0,
      max: Math.round(flushMs * 1000),
      ecMinMs: 0,
      ecMaxMs: flushMs,
      label: 'Lavado final (~22 % EC flor)',
    };
  }

  function renderSaltonVerdeEcTableHtml() {
    var rows = Object.keys(FASES_EC_PH)
      .map(function (key) {
        var f = FASES_EC_PH[key];
        return (
          '<tr><td>' +
          f.label +
          '</td><td>' +
          f.ec.ecMinMs +
          '–' +
          f.ec.ecMaxMs +
          ' mS/cm</td><td>' +
          f.ph.min +
          '–' +
          f.ph.max +
          '</td></tr>'
        );
      })
      .join('');
    return (
      '<div class="coco-sv-ec-table-wrap">' +
      '<p class="setup-field-hint"><strong>EC/pH por fase</strong> — ' +
      '<a href="' +
      FUENTE_URL +
      '" target="_blank" rel="noopener noreferrer">Saltón Verde</a></p>' +
      '<table class="setup-coco-drip-celdas-table coco-sv-ec-table">' +
      '<thead><tr><th>Fase</th><th>EC</th><th>pH</th></tr></thead><tbody>' +
      rows +
      '</tbody></table></div>'
    );
  }

  global.COCO_SV_FUENTE_URL = FUENTE_URL;
  global.COCO_SV_FUENTE_LABEL = FUENTE_LABEL;
  global.COCO_SV_FASES_EC_PH = FASES_EC_PH;
  global.COCO_SV_RUNOFF_PCT = RUNOFF_PCT;
  global.COCO_SV_DRYBACK_RIEGO_PCT = DRYBACK_RIEGO_PCT;
  global.COCO_SV_DENSIDAD = DENSIDAD_SV;
  global.COCO_SV_MACETA_LITROS = MACETA_LITROS_SV;
  global.COCO_SV_REGLAS_ORO = REGLAS_ORO;
  global.COCO_SV_SISTEMA_DESCRIPCION = SISTEMA_DESCRIPCION;
  global.mapMicrofaseAFaseSaltonVerde = mapMicrofaseAFaseSaltonVerde;
  global.getEcPhSaltonVerde = getEcPhSaltonVerde;
  global.ecRangoUsDesdeFaseSv = ecRangoUsDesdeFaseSv;
  global.ecFlushDesdeEcFlorMs = ecFlushDesdeEcFlorMs;
  global.renderSaltonVerdeEcTableHtml = renderSaltonVerdeEcTableHtml;
})(typeof window !== 'undefined' ? window : globalThis);
