/**
 * HidroGrow — cuatro caminos de cultivo (setup y post-setup).
 * semilla_propagador | semilla_hidro | esqueje_hidro | madre_hidro
 */
(function (global) {
  'use strict';

  var CAMINOS = {
    semilla_propagador: {
      id: 'semilla_propagador',
      label: 'Semilla en propagador / domo',
      short: 'Propagador',
      origenPlanta: 'semilla',
      germModo: 'propagador',
      faseInicial: 'germinacion',
      icon: '🫧',
      orden: [
        'Equipamiento de germinación (domo, mat térmica) en Fase 1.',
        'Checklist del propagador → <strong>configura la sala</strong> (asistente + montaje).',
        'Las 6 fases de germinación en Inicio.',
        'Tras las 6 fases: cierra DWC/RDWC en el asistente (sin repetir germinación en el depósito).',
        'Completa puntos de sistema hidro en montaje y checklist del depósito.',
      ],
    },
    semilla_hidro: {
      id: 'semilla_hidro',
      label: 'Semilla en el hidro (6 fases)',
      short: 'Semilla → hidro',
      origenPlanta: 'semilla',
      germModo: 'hidro_directo',
      faseInicial: 'germinacion',
      icon: '💧',
      orden: [
        'Equipamiento mínimo: cubos, net pot, medidor (sin sala LED obligatoria al día 1).',
        'Las 6 fases en Inicio con tareas adaptadas al depósito.',
        'Al terminar: elige y configura DWC/RDWC + sala + checklist del sistema.',
      ],
    },
    esqueje_hidro: {
      id: 'esqueje_hidro',
      label: 'Esqueje / clon al hidro',
      short: 'Esqueje',
      origenPlanta: 'clon',
      germModo: null,
      faseInicial: 'hidro',
      icon: '🌿',
      orden: [
        'Propagador / domo de enraizado (imprescindible).',
        'Configura DWC/RDWC, sala y equipamiento en este asistente.',
        'Checklist de enraizado y traslado al net pot.',
      ],
    },
    madre_hidro: {
      id: 'madre_hidro',
      label: 'Madre en DWC/RDWC',
      short: 'Madre',
      origenPlanta: 'madre',
      germModo: null,
      faseInicial: 'hidro',
      icon: '👑',
      orden: [
        'Cubo madre 18/6 + sala y depósito.',
        'Checklist de mantenimiento y sesiones de esquejes.',
        'Los clones siguen el camino de esqueje al hidro.',
      ],
    },
  };

  function ensurePremiumCamino() {
    if (typeof ensurePremiumSetup !== 'function') return null;
    var p = ensurePremiumSetup();
    if (!p.caminoCultivo) {
      p.caminoCultivo = inferCaminoFromOrigen(p.origenPlanta || 'semilla', p.germinacionModoPreferido);
    }
    return p;
  }

  function inferCaminoFromOrigen(origen, modoPref) {
    var o = String(origen || 'semilla').toLowerCase();
    if (o === 'clon') return 'esqueje_hidro';
    if (o === 'madre') return 'madre_hidro';
    if (modoPref === 'hidro_directo' || modoPref === 'hidro') return 'semilla_hidro';
    return 'semilla_propagador';
  }

  function getCaminoCultivo(cfgOpt) {
    try {
      if (typeof ensurePremiumSetup === 'function') {
        var p = ensurePremiumSetup();
        if (p.caminoCultivo && CAMINOS[p.caminoCultivo]) return p.caminoCultivo;
        return inferCaminoFromOrigen(p.origenPlanta, p.germinacionModoPreferido);
      }
    } catch (_) {}
    var cfg = cfgOpt || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var c = String(cfg.caminoCultivo || (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo) || '').trim();
    if (CAMINOS[c]) return c;
    return inferCaminoFromOrigen(
      (cfg.premiumSetup && cfg.premiumSetup.origenPlanta) || cfg.origenPlanta,
      cfg.premiumSetup && cfg.premiumSetup.germinacionModoPreferido
    );
  }

  function getCaminoDef(id) {
    return CAMINOS[id] || CAMINOS.semilla_propagador;
  }

  function seleccionarCaminoCultivo(caminoId) {
    var def = getCaminoDef(caminoId);
    if (!def) return;
    var p = ensurePremiumCamino();
    if (!p) return;
    p.caminoCultivo = def.id;
    p.origenPlanta = def.origenPlanta;
    p.germinacionModoPreferido = def.germModo || '';
    if (typeof seleccionarPremiumOrigen === 'function') {
      seleccionarPremiumOrigen(def.origenPlanta);
    } else if (typeof persistOrigenASetupData === 'function') {
      persistOrigenASetupData(def.origenPlanta);
    }
    if (typeof state !== 'undefined' && state && state.configTorre) {
      state.configTorre.caminoCultivo = def.id;
      if (!state.configTorre.premiumSetup || typeof state.configTorre.premiumSetup !== 'object') {
        state.configTorre.premiumSetup = {};
      }
      state.configTorre.premiumSetup.caminoCultivo = def.id;
      state.configTorre.premiumSetup.origenPlanta = def.origenPlanta;
      if (def.germModo) state.configTorre.premiumSetup.germinacionModoPreferido = def.germModo;
    }
    refreshCaminoCultivoUI();
    if (typeof renderEquipamientoPremiumUI === 'function') renderEquipamientoPremiumUI();
    if (typeof refreshSetupEquipOrigenBanner === 'function') refreshSetupEquipOrigenBanner();
  }

  function refreshCaminoCultivoUI() {
    var cam = getCaminoCultivo();
    var def = getCaminoDef(cam);
    ['setupCamino_semilla_propagador', 'setupCamino_semilla_hidro', 'setupCamino_esqueje_hidro', 'setupCamino_madre_hidro'].forEach(
      function (bid) {
        var el = document.getElementById(bid);
        if (el) el.classList.toggle('selected', bid === 'setupCamino_' + cam);
      }
    );
    var flow = document.getElementById('setupPremiumOrigenFlow');
    if (flow) {
      var esc =
        typeof escHtmlUi === 'function'
          ? escHtmlUi
          : function (t) {
              return String(t || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;');
            };
      flow.innerHTML =
        '<div class="hc-origen-ruta-card hc-camino-ruta-card" role="region" aria-label="Tu camino">' +
        '<div class="hc-origen-ruta-title">' +
        esc(def.icon + ' ' + def.label) +
        '</div>' +
        '<ol class="hc-origen-ruta-ol">' +
        def.orden
          .map(function (s) {
            return '<li>' + esc(s) + '</li>';
          })
          .join('') +
        '</ol></div>';
    }
    var fase = document.getElementById('setupCaminoFaseBanner');
    if (fase) {
      if (def.faseInicial === 'germinacion') {
        fase.classList.remove('setup-hidden');
        fase.innerHTML =
          '<strong>Fase 1 · Germinación.</strong> Tras el propagador (o prep hidro) configuras la <strong>sala</strong>, ' +
          'luego las 6 fases. El <strong>DWC/RDWC</strong> se cierra al terminar la germinación (sin repetirla en el depósito).';
      } else {
        fase.classList.remove('setup-hidden');
        fase.innerHTML =
          '<strong>Camino hidro.</strong> Configura propagador/enraizado, sistema DWC/RDWC y sala en este asistente.';
      }
    }
  }

  /** Sesión del asistente: solo sala (carpa, LED, extractor…) antes de las 6 fases. */
  function hcSetupEnFaseSalaPreGerm() {
    try {
      if (typeof window !== 'undefined' && window._hcSetupSalaPreGermSession) return true;
      var cfg = typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : null;
      return !!(cfg && cfg.hcSetupFase === 'sala_pre_germ');
    } catch (_) {}
    return false;
  }

  function hcCaminoRequiereSalaPreGerm(cfg) {
    var cam = getCaminoCultivo(cfg);
    return cam === 'semilla_propagador' || cam === 'semilla_hidro';
  }

  function salaPreGermConfigurada(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    return !!cfg.salaPreGermConfigAt;
  }

  /** Durante el wizard o con instalación en fase germinación (sin hidro cerrado). */
  function hcSetupEnFaseGerminacion() {
    if (hcSetupEnFaseSalaPreGerm()) return false;
    var cam = getCaminoCultivo();
    var def = getCaminoDef(cam);
    if (def.faseInicial !== 'germinacion') return false;
    try {
      var cfg = typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : null;
      if (cfg && cfg.hcSetupFase === 'hidro') return false;
      if (cfg && cfg.hcSetupFase === 'sala_pre_germ') return false;
      if (cfg && cfg.hcSetupFase === 'germinacion') return true;
    } catch (_) {}
    if (typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre) return true;
    return false;
  }

  function montajeSalaPreGermOk(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (!salaPreGermConfigurada(cfg)) return false;
    if (typeof montajeVerificacionVigente === 'function') {
      return montajeVerificacionVigente(cfg);
    }
    return !!(cfg.puestaMarchaChecks && cfg.puestaMarchaChecks.completedAt);
  }

  function salaListaAntesDeGerminacion(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (!hcCaminoRequiereSalaPreGerm(cfg)) return true;
    if (typeof propagadorMontajeCompleto === 'function' && !propagadorMontajeCompleto(cfg)) {
      return false;
    }
    return montajeSalaPreGermOk(cfg);
  }

  function hcGerminacionBloqueadaPorSala(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (!hcCaminoRequiereSalaPreGerm(cfg)) return false;
    if (typeof propagadorMontajeCompleto === 'function' && !propagadorMontajeCompleto(cfg)) {
      return false;
    }
    return !salaListaAntesDeGerminacion(cfg);
  }

  function hcGerminacionBloqueada(cfg) {
    if (typeof hcGerminacionBloqueadaPorMontaje === 'function' && hcGerminacionBloqueadaPorMontaje(cfg)) {
      return 'propagador';
    }
    if (hcGerminacionBloqueadaPorSala(cfg)) {
      if (!salaPreGermConfigurada(cfg)) return 'sala_config';
      return 'sala_montaje';
    }
    return '';
  }

  function hcCaminoEsSemilla(cam) {
    cam = cam || getCaminoCultivo();
    return cam === 'semilla_propagador' || cam === 'semilla_hidro';
  }

  function germinacionListaParaConfigHidro(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var g = cfg.germinacionFlow;
    if (!g || typeof g !== 'object') return false;
    if (g.trasladoAt) return true;
    var pasos = g.pasos;
    if (!pasos || typeof pasos !== 'object') return false;
    var ids = ['semilla', 'taproot', 'rockwool', 'domo', 'netpot', 'dwc'];
    for (var i = 0; i < ids.length; i++) {
      if (!pasos[ids[i]] || !pasos[ids[i]].doneAt) return false;
    }
    return true;
  }

  function hcCaminoRequiereConfigHidroPendiente(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (!hcCaminoEsSemilla(getCaminoCultivo(cfg))) return false;
    if (cfg.tipoInstalacion === 'dwc' || cfg.tipoInstalacion === 'rdwc') {
      if (cfg.checklistInstalacionConfirmada === true) return false;
      if (cfg.hcSetupFase === 'hidro') return false;
    }
    if (!germinacionListaParaConfigHidro(cfg)) return false;
    return true;
  }

  function persistCaminoToConfig(cfg) {
    if (!cfg || typeof cfg !== 'object') return;
    var cam = getCaminoCultivo(cfg);
    var def = getCaminoDef(cam);
    cfg.caminoCultivo = cam;
    if (!cfg.premiumSetup || typeof cfg.premiumSetup !== 'object') cfg.premiumSetup = {};
    cfg.premiumSetup.caminoCultivo = cam;
    cfg.premiumSetup.origenPlanta = def.origenPlanta;
    if (def.germModo) {
      cfg.premiumSetup.germinacionModoPreferido = def.germModo;
      if (cfg.germinacionFlow && typeof cfg.germinacionFlow === 'object') {
        cfg.germinacionFlow.modo = def.germModo;
      }
    }
    if (def.faseInicial === 'germinacion' && !cfg.hcSetupFase) {
      cfg.hcSetupFase = 'germinacion';
    }
  }

  function abrirSetupFaseSala() {
    try {
      if (typeof hcResetSetupWizardSession === 'function') {
        hcResetSetupWizardSession({ keepNuevaFlag: true, keepPagina: true });
      }
    } catch (_) {}
    if (typeof window !== 'undefined') window._hcSetupSalaPreGermSession = true;
    if (typeof state !== 'undefined' && state && state.configTorre) {
      state.configTorre.hcSetupFase = 'sala_pre_germ';
    }
    setupEsNuevaTorre = false;
    setupPagina =
      typeof SETUP_PAGE_PREMIUM_3 !== 'undefined' ? SETUP_PAGE_PREMIUM_3 : 4;
    var so = document.getElementById('setupOverlay');
    if (so) {
      so.classList.add('open');
      if (typeof renderSetupPage === 'function') renderSetupPage();
      if (typeof a11yDialogOpened === 'function') a11yDialogOpened(so);
    } else if (typeof abrirSetup === 'function') {
      abrirSetup();
    }
    if (typeof showToast === 'function') {
      showToast('Configura la sala (carpa, LED, extractor…) antes de las 6 fases', false, { durationMs: 5600 });
    }
  }

  function abrirSetupFaseHidro() {
    try {
      if (typeof hcResetSetupWizardSession === 'function') {
        hcResetSetupWizardSession({ keepNuevaFlag: true, keepPagina: true });
      }
    } catch (_) {}
    if (typeof window !== 'undefined') window._hcSetupSalaPreGermSession = false;
    if (typeof state !== 'undefined' && state && state.configTorre) {
      state.configTorre.hcSetupFase = 'hidro';
      if (typeof limpiarVerificacionMontajeSiHidroPendiente === 'function') {
        limpiarVerificacionMontajeSiHidroPendiente(state.configTorre);
      }
    }
    setupEsNuevaTorre = false;
    setupPagina =
      typeof SETUP_PAGE_PREMIUM_END !== 'undefined' ? SETUP_PAGE_PREMIUM_END : 8;
    var so = document.getElementById('setupOverlay');
    if (so) {
      so.classList.add('open');
      if (typeof renderSetupPage === 'function') renderSetupPage();
      if (typeof a11yDialogOpened === 'function') a11yDialogOpened(so);
    } else if (typeof abrirSetup === 'function') {
      abrirSetup();
    }
    if (typeof showToast === 'function') {
      showToast('Fase 2: DWC/RDWC y circuito hidro (la germinación en depósito ya está hecha)', false, {
        durationMs: 6200,
      });
    }
  }

  function getSetupSkippedPagesForSalaPreGerm() {
    var skip = new Set();
    if (!hcSetupEnFaseSalaPreGerm()) return skip;
    [
      typeof SETUP_PAGE_WELCOME !== 'undefined' ? SETUP_PAGE_WELCOME : 0,
      typeof SETUP_PAGE_ORIGEN !== 'undefined' ? SETUP_PAGE_ORIGEN : 1,
      typeof SETUP_PAGE_PREMIUM_END !== 'undefined' ? SETUP_PAGE_PREMIUM_END : 8,
      typeof SETUP_PAGE_GEOMETRY !== 'undefined' ? SETUP_PAGE_GEOMETRY : 9,
      typeof SETUP_PAGE_AGUA !== 'undefined' ? SETUP_PAGE_AGUA : 11,
      typeof SETUP_PAGE_NUTRIENTES !== 'undefined' ? SETUP_PAGE_NUTRIENTES : 12,
      typeof SETUP_PAGE_CULTIVOS !== 'undefined' ? SETUP_PAGE_CULTIVOS : 14,
      typeof SETUP_PAGE_RESUMEN !== 'undefined' ? SETUP_PAGE_RESUMEN : 15,
    ].forEach(function (p) {
      skip.add(p);
    });
    return skip;
  }

  function getSetupUltimoPasoIndice() {
    if (hcSetupEnFaseSalaPreGerm()) {
      if (
        typeof setupFlowCanSkipUbicacion === 'function' &&
        setupFlowCanSkipUbicacion()
      ) {
        return typeof SETUP_PAGE_EQUIP !== 'undefined' ? SETUP_PAGE_EQUIP : 10;
      }
      return typeof SETUP_PAGE_UBICACION !== 'undefined' ? SETUP_PAGE_UBICACION : 13;
    }
    if (typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre && hcSetupEnFaseGerminacion()) {
      return typeof SETUP_PAGE_PREMIUM_6 !== 'undefined' ? SETUP_PAGE_PREMIUM_6 : 7;
    }
    var total = typeof SETUP_TOTAL_PAGES !== 'undefined' ? SETUP_TOTAL_PAGES : 16;
    return typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre ? total - 2 : total - 1;
  }

  function getSetupSkippedPagesForCamino() {
    var skip = new Set();
    if (typeof getSetupSkippedPagesForSalaPreGerm === 'function') {
      getSetupSkippedPagesForSalaPreGerm().forEach(function (p) {
        skip.add(p);
      });
    }
    if (skip.size > 0) return skip;
    if (!hcSetupEnFaseGerminacion()) return skip;
    var pages = [
      typeof SETUP_PAGE_PREMIUM_END !== 'undefined' ? SETUP_PAGE_PREMIUM_END : 8,
      typeof SETUP_PAGE_GEOMETRY !== 'undefined' ? SETUP_PAGE_GEOMETRY : 9,
      typeof SETUP_PAGE_EQUIP !== 'undefined' ? SETUP_PAGE_EQUIP : 10,
      typeof SETUP_PAGE_AGUA !== 'undefined' ? SETUP_PAGE_AGUA : 11,
      typeof SETUP_PAGE_NUTRIENTES !== 'undefined' ? SETUP_PAGE_NUTRIENTES : 12,
      typeof SETUP_PAGE_UBICACION !== 'undefined' ? SETUP_PAGE_UBICACION : 13,
      typeof SETUP_PAGE_CULTIVOS !== 'undefined' ? SETUP_PAGE_CULTIVOS : 14,
    ];
    pages.forEach(function (p) {
      skip.add(p);
    });
    return skip;
  }

  global.HC_CAMINOS_CULTIVO = CAMINOS;
  global.ensurePremiumCamino = ensurePremiumCamino;
  global.getCaminoCultivo = getCaminoCultivo;
  global.getCaminoDef = getCaminoDef;
  global.seleccionarCaminoCultivo = seleccionarCaminoCultivo;
  global.refreshCaminoCultivoUI = refreshCaminoCultivoUI;
  global.hcSetupEnFaseGerminacion = hcSetupEnFaseGerminacion;
  global.hcSetupEnFaseSalaPreGerm = hcSetupEnFaseSalaPreGerm;
  global.hcCaminoRequiereSalaPreGerm = hcCaminoRequiereSalaPreGerm;
  global.salaPreGermConfigurada = salaPreGermConfigurada;
  global.montajeSalaPreGermOk = montajeSalaPreGermOk;
  global.salaListaAntesDeGerminacion = salaListaAntesDeGerminacion;
  global.hcGerminacionBloqueadaPorSala = hcGerminacionBloqueadaPorSala;
  global.hcGerminacionBloqueada = hcGerminacionBloqueada;
  global.hcCaminoEsSemilla = hcCaminoEsSemilla;
  global.hcCaminoRequiereConfigHidroPendiente = hcCaminoRequiereConfigHidroPendiente;
  global.germinacionListaParaConfigHidro = germinacionListaParaConfigHidro;
  global.persistCaminoToConfig = persistCaminoToConfig;
  global.abrirSetupFaseSala = abrirSetupFaseSala;
  global.abrirSetupFaseHidro = abrirSetupFaseHidro;
  global.getSetupUltimoPasoIndice = getSetupUltimoPasoIndice;
  global.getSetupSkippedPagesForCamino = getSetupSkippedPagesForCamino;
  global.getSetupSkippedPagesForSalaPreGerm = getSetupSkippedPagesForSalaPreGerm;
  global.inferCaminoFromOrigen = inferCaminoFromOrigen;
})(typeof window !== 'undefined' ? window : this);
