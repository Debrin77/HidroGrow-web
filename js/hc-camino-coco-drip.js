/**
 * HidroGrow — camino semilla_coco_drip (coco coir + goteo DTW).
 * Programación HFF: Coco For Cannabis, THC Farmer, Hydrobuilder, PhenoDB crop steering,
 * Grow Diaries (halo/drip), Bluelab IntelliDose (solo día / intervalos).
 */
(function (global) {
  'use strict';

  var COCO_DRIP_PH = { min: 5.8, max: 6.2, ideal: 6.0 };

  var COCO_DRIP_EC_US = {
    plántula: { min: 300, max: 800, label: 'Plántula' },
    vegetativo: { min: 800, max: 1200, label: 'Vegetativo' },
    prefloracion: { min: 1000, max: 1400, label: 'Prefloración' },
    floracion: { min: 1200, max: 2200, label: 'Floración' },
    flush: { min: 0, max: 400, label: 'Flush' },
  };

  var COCO_DRIP_RUNOFF_PCT = { min: 10, max: 20 };

  /**
   * Eventos/día orientativos (auto goteo, maceta 3–5 gal).
   * CFC: 1→2 plántula; 2 trasplante; 3–6 veg; 3–5 flor; comercial 6–8 pico (Hydrobuilder).
   */
  var COCO_DRIP_EVENTS_BY_FASE = {
    plántula: { auto: 1, hand: 1, min: 1, max: 2 },
    esqueje: { auto: 1, hand: 1, min: 1, max: 2 },
    vegetativo: { auto: 4, hand: 2, min: 2, max: 6 },
    prefloracion: { auto: 4, hand: 2, min: 3, max: 6 },
    floracion: { auto: 5, hand: 2, min: 3, max: 8 },
    flush: { auto: 2, hand: 1, min: 1, max: 3 },
  };

  var COCO_DRIP_DRYBACK_NIGHT_PCT = {
    vegetativo: { min: 10, max: 15 },
    prefloracion: { min: 12, max: 18 },
    floracion: { min: 15, max: 25 },
    plántula: { min: 8, max: 12 },
  };

  var MACETA_LITROS = { small: 11.4, medium: 18.9, large: 56.8 };

  function cfgActiva() {
    return (typeof state !== 'undefined' && state && state.configTorre) || {};
  }

  function cam(cfg) {
    return typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
  }

  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function normFase(fase) {
    var f = String(fase || 'vegetativo')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (f === 'plantula' || f === 'germinacion' || f === 'esqueje') return 'plántula';
    if (f === 'prefloracion') return 'prefloracion';
    if (f === 'floracion') return 'floracion';
    if (f === 'flush') return 'flush';
    return 'vegetativo';
  }

  function hcMedirEsCocoDripCamino(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) !== 'semilla_coco_drip') return false;
    return String(cfg.tipoInstalacion || '').toLowerCase() === 'coco_drip';
  }

  function hcCocoDripInstalacionCerrada(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) !== 'semilla_coco_drip') return false;
    return (
      String(cfg.tipoInstalacion || '').toLowerCase() === 'coco_drip' &&
      cfg.checklistInstalacionConfirmada === true
    );
  }

  function hcCocoDripEquipSalaSinFertigacion(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) !== 'semilla_coco_drip') return false;
    return !hcCocoDripInstalacionCerrada(cfg);
  }

  function hcSemillaCocoDripHubEsPrincipal(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) !== 'semilla_coco_drip') return false;
    return typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg);
  }

  function hcSemillaCocoDripTrasladoCompletado(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) !== 'semilla_coco_drip') return false;
    return !!(cfg.germinacionFlow && cfg.germinacionFlow.trasladoAt);
  }

  function hcCaminoEsSemillaHidroOCoco(cfg) {
    var c = cam(cfg);
    return c === 'semilla_hidro' || c === 'semilla_coco_drip';
  }

  function mapFaseCocoDripEc(fase) {
    var f = normFase(fase);
    if (f === 'plántula') return COCO_DRIP_EC_US.plántula;
    if (f === 'prefloracion') return COCO_DRIP_EC_US.prefloracion;
    if (f === 'floracion') return COCO_DRIP_EC_US.floracion;
    if (f === 'flush') return COCO_DRIP_EC_US.flush;
    return COCO_DRIP_EC_US.vegetativo;
  }

  function getCocoDripEcRangoUs(cfg) {
    cfg = cfg || cfgActiva();
    var fase =
      cfg.cocoDripFaseCultivo ||
      (typeof getFaseCultivoActual === 'function' ? getFaseCultivoActual() : '') ||
      'vegetativo';
    return mapFaseCocoDripEc(fase);
  }

  /**
   * Eventos/día recomendados. modo: 'auto' (goteo) | 'hand' (manual, máx. 2 CFC).
   */
  function getCocoDripFertigacionEventosDia(fase, horasLuz, modo) {
    var f = normFase(fase);
    var meta = COCO_DRIP_EVENTS_BY_FASE[f] || COCO_DRIP_EVENTS_BY_FASE.vegetativo;
    var m = modo === 'hand' ? 'hand' : 'auto';
    var n = meta[m];
    if (horasLuz <= 12 && f === 'floracion' && m === 'auto') {
      n = Math.min(meta.max, Math.max(meta.min, n));
    }
    return n;
  }

  /** Volumen por evento ≈ 5 % del volumen de maceta (CFC / THC Farmer). */
  function getCocoDripVolumenEventoMl(tamanoMaceta) {
    var volL = MACETA_LITROS[tamanoMaceta] || MACETA_LITROS.medium;
    return Math.round(volL * 1000 * 0.05);
  }

  function getCocoDripRunoffMl(volEventoMl, pct) {
    pct = pct == null ? 0.15 : pct;
    return Math.round(volEventoMl * pct);
  }

  /**
   * Horarios de fertigación durante «luces encendidas».
   * Reglas: primer riego +2 h tras encender; último −2 h antes de apagar (Big Plant Science);
   * reparto uniforme en ventana (CFC); solo con nutrientes, nunca agua sola.
   *
   * @param {object} opts - { fase, horasLuz, lightsOnHour, eventos, modo, duracionMin }
   */
  function buildCocoDripProgramacion(opts) {
    opts = opts || {};
    var fase = normFase(opts.fase || 'vegetativo');
    var horasLuz = Number(opts.horasLuz) || 18;
    var lightsOnHour = Number(opts.lightsOnHour);
    if (!Number.isFinite(lightsOnHour)) lightsOnHour = 6;
    var modo = opts.modo === 'hand' ? 'hand' : 'auto';
    var eventos =
      Number(opts.eventos) ||
      getCocoDripFertigacionEventosDia(fase, horasLuz, modo);
    var meta = COCO_DRIP_EVENTS_BY_FASE[fase] || COCO_DRIP_EVENTS_BY_FASE.vegetativo;
    eventos = Math.max(meta.min, Math.min(meta.max, Math.round(eventos)));
    if (modo === 'hand') eventos = Math.min(2, eventos);

    var bufferMin = 120;
    var windowMin = Math.max(60, horasLuz * 60 - 2 * bufferMin);
    var offsets = [];
    if (eventos <= 1) {
      offsets.push(bufferMin + Math.floor(windowMin / 2));
    } else {
      var step = windowMin / (eventos - 1);
      for (var i = 0; i < eventos; i++) {
        offsets.push(Math.round(bufferMin + step * i));
      }
    }

    var duracionMin = Number(opts.duracionMin);
    if (!Number.isFinite(duracionMin) || duracionMin < 1) {
      duracionMin = modo === 'auto' ? 3 : 5;
    }
    duracionMin = Math.max(1, Math.min(15, duracionMin));

    var eventosList = offsets.map(function (offMin, idx) {
      var absMin = lightsOnHour * 60 + offMin;
      var h = Math.floor(absMin / 60) % 24;
      var m = absMin % 60;
      return {
        n: idx + 1,
        offsetMinDesdeLuzOn: offMin,
        hora: h,
        minuto: m,
        label: pad2(h) + ':' + pad2(m),
        duracionMin: duracionMin,
        nota:
          idx === 0
            ? 'Tras +2 h de luz (saturar coco; opcional doble pulso corto)'
            : idx === offsets.length - 1
              ? 'Último riego ≥2 h antes de apagar luces'
              : 'Mantenimiento HFF',
      };
    });

    var dryback = COCO_DRIP_DRYBACK_NIGHT_PCT[fase] || COCO_DRIP_DRYBACK_NIGHT_PCT.vegetativo;
    var volMl = getCocoDripVolumenEventoMl(opts.tamanoMaceta || 'medium');
    var runoffMl = getCocoDripRunoffMl(volMl);

    return {
      fase: fase,
      horasLuz: horasLuz,
      fotoperiodo: horasLuz + '/' + (24 - horasLuz),
      modo: modo,
      eventosDia: eventos,
      duracionMinPorEvento: duracionMin,
      volumenMlPorMaceta: volMl,
      runoffMlObjetivo: runoffMl,
      runoffPct: COCO_DRIP_RUNOFF_PCT,
      drybackNochePct: dryback,
      ventanaMinutos: windowMin,
      reglas: [
        'Fertigar siempre con nutrientes (DTW); no alternar con agua sola.',
        '10–20 % runoff por evento; medir EC runoff vs entrada.',
        'No regar con luces apagadas salvo emergencia (coco muy seco).',
        'Intervalo mínimo entre eventos ~3–4 h en pico de demanda (CFC).',
      ],
      eventos: eventosList,
      fuentes:
        'Coco For Cannabis · THC Farmer · Hydrobuilder · PhenoDB crop steering · Grow Diaries (halo/goteo)',
    };
  }

  function renderCocoDripProgramacionHtml(prog) {
    if (!prog || !prog.eventos || !prog.eventos.length) return '';
    var evLines = prog.eventos
      .map(function (ev) {
        return (
          '<li><strong>' +
          ev.label +
          '</strong> · ' +
          ev.duracionMin +
          ' min · ' +
          ev.nota +
          '</li>'
        );
      })
      .join('');
    return (
      '<div class="setup-coco-drip-schedule">' +
      '<p class="setup-dwc-help"><strong>Programación goteo (' +
      prog.eventosDia +
      '×/día · ' +
      prog.fotoperiodo +
      ' · ' +
      (prog.modo === 'hand' ? 'manual' : 'automático') +
      ')</strong></p>' +
      '<ul class="setup-coco-drip-schedule-list">' +
      evLines +
      '</ul>' +
      '<p class="setup-field-hint">~' +
      prog.volumenMlPorMaceta +
      ' ml/maceta/evento (5 % vol.) → runoff ~' +
      prog.runoffMlObjetivo +
      ' ml (' +
      prog.runoffPct.min +
      '–' +
      prog.runoffPct.max +
      '%). Dryback nocturno objetivo ' +
      prog.drybackNochePct.min +
      '–' +
      prog.drybackNochePct.max +
      '%.</p>' +
      '</div>'
    );
  }

  function getCocoDripResumenRiego(cfg) {
    cfg = cfg || cfgActiva();
    if (typeof cocoDripEnsureConfigDefaults === 'function') cocoDripEnsureConfigDefaults(cfg);
    var fase = cfg.cocoDripFaseCultivo || 'vegetativo';
    var horas =
      Number(cfg.horasLuz) ||
      (cfg.premiumSetup && Number(cfg.premiumSetup.horasLuz)) ||
      (fase === 'floracion' ? 12 : 18);
    var prog = buildCocoDripProgramacion({
      fase: fase,
      horasLuz: horas,
      eventos: cfg.cocoDripFrecuenciaRiego,
      tamanoMaceta: cfg.cocoDripTamanoMacetas,
      duracionMin: cfg.cocoDripDuracionRiegoMin,
      modo: 'auto',
    });
    var horasTxt = prog.eventos.map(function (e) {
      return e.label;
    }).join(', ');
    return (
      'Coco DTW: <strong>' +
      prog.eventosDia +
      '×/día</strong> (' +
      horasTxt +
      ') con nutrientes; runoff <strong>' +
      COCO_DRIP_RUNOFF_PCT.min +
      '–' +
      COCO_DRIP_RUNOFF_PCT.max +
      '%</strong>; pH <strong>' +
      COCO_DRIP_PH.min +
      '–' +
      COCO_DRIP_PH.max +
      '</strong>. ~' +
      prog.volumenMlPorMaceta +
      ' ml/maceta/evento.'
    );
  }

  global.COCO_DRIP_PH = COCO_DRIP_PH;
  global.COCO_DRIP_EC_US = COCO_DRIP_EC_US;
  global.COCO_DRIP_RUNOFF_PCT = COCO_DRIP_RUNOFF_PCT;
  global.COCO_DRIP_EVENTS_BY_FASE = COCO_DRIP_EVENTS_BY_FASE;
  global.hcMedirEsCocoDripCamino = hcMedirEsCocoDripCamino;
  global.hcCocoDripInstalacionCerrada = hcCocoDripInstalacionCerrada;
  global.hcCocoDripEquipSalaSinFertigacion = hcCocoDripEquipSalaSinFertigacion;
  global.hcSemillaCocoDripHubEsPrincipal = hcSemillaCocoDripHubEsPrincipal;
  global.hcSemillaCocoDripTrasladoCompletado = hcSemillaCocoDripTrasladoCompletado;
  global.hcCaminoEsSemillaHidroOCoco = hcCaminoEsSemillaHidroOCoco;
  global.getCocoDripEcRangoUs = getCocoDripEcRangoUs;
  global.getCocoDripFertigacionEventosDia = getCocoDripFertigacionEventosDia;
  global.getCocoDripVolumenEventoMl = getCocoDripVolumenEventoMl;
  global.buildCocoDripProgramacion = buildCocoDripProgramacion;
  global.renderCocoDripProgramacionHtml = renderCocoDripProgramacionHtml;
  global.getCocoDripResumenRiego = getCocoDripResumenRiego;
})(typeof window !== 'undefined' ? window : globalThis);
