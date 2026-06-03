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
        'Fase 1: solo equipamiento de <strong>germinación</strong> (domo, mat térmica) — sin sala.',
        'Checklist del propagador → <strong>6 fases</strong> en Inicio con registro diario.',
        'Tras las 6 fases: <strong>configura la sala</strong> (asistente + montaje).',
        'Checklist traslado → cierra DWC/RDWC (Fase 2) → depósito y cultivo.',
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
        'Asistente: equipamiento de <strong>sala + prep hidro</strong> (net pot, medidor, aireación).',
        'Checklist prep → montaje sala → <strong>DWC/RDWC + primer llenado</strong> del depósito.',
        'Las <strong>6 fases</strong> en Inicio (registro diario en el cubo, no semilla suelta en tanque).',
        'Tras las 6 fases: checklist traslado y operativa del sistema definitivo.',
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
        'Asistente: propagador, DWC/RDWC, sala y equipamiento.',
        'Montaje de sala verificado en checklist.',
        '<strong>Checklist de enraizado</strong> (domo, rockwool, higiene) antes de la matriz.',
        'Asigna clones en Cultivo → primer llenado del depósito.',
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

  function germinacionSeisFasesCompletas(cfg) {
    return contarFasesGermHechas(cfg) >= 6;
  }

  function salaListaAntesDeGerminacion(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (!hcCaminoRequiereSalaPreGerm(cfg)) return true;
    if (typeof propagadorMontajeCompleto === 'function' && !propagadorMontajeCompleto(cfg)) {
      return false;
    }
    return montajeSalaPreGermOk(cfg);
  }

  /** Propagador: sala después de las 6 fases. Hidro directo: sala antes de germinar. */
  function hcGerminacionBloqueadaPorSala(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (!hcCaminoRequiereSalaPreGerm(cfg)) return false;
    var cam = getCaminoCultivo(cfg);
    if (typeof propagadorMontajeCompleto === 'function' && !propagadorMontajeCompleto(cfg)) {
      return false;
    }
    if (cam === 'semilla_propagador') {
      if (!germinacionSeisFasesCompletas(cfg)) return false;
      return !salaPreGermConfigurada(cfg) || !montajeSalaPreGermOk(cfg);
    }
    return !salaPreGermConfigurada(cfg) || !montajeSalaPreGermOk(cfg);
  }

  /** Semilla en hidro: prep + sala + montaje + sistema + depósito antes de las 6 fases. */
  function hcGerminacionBloqueadaPorPrepSistema(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (getCaminoCultivo(cfg) !== 'semilla_hidro') return '';
    if (typeof propagadorMontajeCompleto === 'function' && !propagadorMontajeCompleto(cfg)) {
      return '';
    }
    if (!salaPreGermConfigurada(cfg) || !montajeSalaPreGermOk(cfg)) return '';
    if (!hidroInstalacionCerrada(cfg)) return 'hidro_config';
    if (!depositoListo(cfg)) return 'deposito_llenado';
    return '';
  }

  function hcGerminacionBloqueada(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (typeof hcGerminacionBloqueadaPorMontaje === 'function' && hcGerminacionBloqueadaPorMontaje(cfg)) {
      return 'propagador';
    }
    var prepSys = hcGerminacionBloqueadaPorPrepSistema(cfg);
    if (prepSys === 'hidro_config') return 'hidro_config';
    if (prepSys === 'deposito_llenado') return 'deposito_llenado';
    if (hcGerminacionBloqueadaPorSala(cfg)) {
      if (!salaPreGermConfigurada(cfg)) return 'sala_config';
      return 'sala_montaje';
    }
    if (typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg)) {
      var g = cfg.germinacionFlow;
      if (g && g.pasos) {
        var ids = ['semilla', 'taproot', 'rockwool', 'domo', 'netpot', 'dwc'];
        var allDone = true;
        for (var i = 0; i < ids.length; i++) {
          if (!g.pasos[ids[i]] || !g.pasos[ids[i]].doneAt) {
            allDone = false;
            break;
          }
        }
        if (allDone && !g.checklistTrasladoOk) return 'traslado';
      }
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
    return !!g.checklistTrasladoOk;
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
    var cam = getCaminoCultivo();
    if (cam === 'semilla_hidro') {
      [
        typeof SETUP_PAGE_CULTIVOS !== 'undefined' ? SETUP_PAGE_CULTIVOS : 14,
        typeof SETUP_PAGE_RESUMEN !== 'undefined' ? SETUP_PAGE_RESUMEN : 15,
      ].forEach(function (p) {
        skip.add(p);
      });
      return skip;
    }
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

  function escResumen(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function contarFasesGermHechas(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var g = cfg.germinacionFlow;
    if (!g || !g.pasos) return 0;
    var ids = ['semilla', 'taproot', 'rockwool', 'domo', 'netpot', 'dwc'];
    var n = 0;
    for (var i = 0; i < ids.length; i++) {
      if (g.pasos[ids[i]] && g.pasos[ids[i]].doneAt) n++;
    }
    return n;
  }

  function hidroInstalacionCerrada(cfg) {
    cfg = cfg || {};
    if (cfg.checklistInstalacionConfirmada === true) return true;
    if (cfg.tipoInstalacion !== 'dwc' && cfg.tipoInstalacion !== 'rdwc') return false;
    if (typeof hcCaminoRequiereConfigHidroPendiente === 'function' && hcCaminoRequiereConfigHidroPendiente(cfg)) {
      return false;
    }
    return true;
  }

  function depositoListo(cfg) {
    if (typeof depositoPrimerLlenadoOk === 'function') {
      return depositoPrimerLlenadoOk(cfg, typeof state !== 'undefined' ? state : {});
    }
    return !!(cfg && cfg.instalacionPrimerLlenadoAt);
  }

  function cultivoMatrizListo() {
    if (typeof torreTieneAlgunaVariedadAsignada !== 'function' || !torreTieneAlgunaVariedadAsignada()) {
      return false;
    }
    if (typeof torreBloqueaChecklistPorFaltaDatosCultivo === 'function' && torreBloqueaChecklistPorFaltaDatosCultivo()) {
      return false;
    }
    return true;
  }

  function getCaminoResumenPasos(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var cam = getCaminoCultivo(cfg);
    var pasos = [];

    if (cam === 'semilla_propagador' || cam === 'semilla_hidro') {
      var fasesN = contarFasesGermHechas(cfg);
      var g = cfg.germinacionFlow || {};
      if (cam === 'semilla_propagador') {
        pasos = [
          {
            id: 'prep',
            label: 'Checklist propagador',
            done: typeof propagadorMontajeCompleto === 'function' && propagadorMontajeCompleto(cfg),
            action: 'irPropagadorMontaje',
          },
          {
            id: 'fases6',
            label: '6 fases (' + fasesN + '/6)',
            done: fasesN >= 6,
            action: 'irGerminacion',
            hint: fasesN > 0 && fasesN < 6 ? 'En curso' : '',
          },
          {
            id: 'sala_cfg',
            label: 'Sala configurada',
            done: salaPreGermConfigurada(cfg),
            action: 'abrirSetupFaseSala',
          },
          {
            id: 'sala_mont',
            label: 'Montaje de sala',
            done: montajeSalaPreGermOk(cfg),
            action: 'irMontaje',
          },
        ];
      } else {
        pasos = [
          {
            id: 'prep',
            label: 'Prep en hidro',
            done: typeof propagadorMontajeCompleto === 'function' && propagadorMontajeCompleto(cfg),
            action: 'irPropagadorMontaje',
          },
          {
            id: 'sala_cfg',
            label: 'Sala configurada',
            done: salaPreGermConfigurada(cfg),
            action: 'abrirSetupFaseSala',
          },
          {
            id: 'sala_mont',
            label: 'Montaje de sala',
            done: montajeSalaPreGermOk(cfg),
            action: 'irMontaje',
          },
          {
            id: 'hidro',
            label: 'DWC/RDWC cerrado',
            done: hidroInstalacionCerrada(cfg),
            action: 'abrirSetupFaseHidro',
          },
          {
            id: 'deposito_pre',
            label: 'Depósito listo (germinar)',
            done: depositoListo(cfg),
            action: 'abrirChecklist',
          },
          {
            id: 'fases6',
            label: '6 fases (' + fasesN + '/6)',
            done: fasesN >= 6,
            action: 'irGerminacion',
            hint: fasesN > 0 && fasesN < 6 ? 'En curso' : '',
          },
        ];
      }
      pasos = pasos.concat([
        {
          id: 'traslado',
          label: 'Checklist traslado',
          done: !!g.checklistTrasladoOk,
          action: 'irGerminacion',
        },
        {
          id: 'hidro',
          label: cam === 'semilla_hidro' ? 'Sistema definitivo' : 'DWC/RDWC cerrado',
          done: hidroInstalacionCerrada(cfg),
          action: 'abrirSetupFaseHidro',
        },
        {
          id: 'cultivo',
          label: 'Cultivo en matriz',
          done: cultivoMatrizListo(),
          action: 'irCultivo',
        },
        {
          id: 'deposito',
          label: 'Primer llenado depósito',
          done: depositoListo(cfg),
          action: 'abrirChecklist',
        },
      ]);
    } else if (cam === 'esqueje_hidro') {
      pasos = [
        {
          id: 'config',
          label: 'Instalación (asistente)',
          done:
            !!(cfg.tipoInstalacion === 'dwc' || cfg.tipoInstalacion === 'rdwc' || cfg.checklistInstalacionConfirmada),
          action: 'abrirSetup',
        },
        {
          id: 'montaje',
          label: 'Montaje de sala',
          done: !!(cfg.puestaMarchaChecks && cfg.puestaMarchaChecks.completedAt),
          action: 'irMontaje',
        },
        {
          id: 'enraizado',
          label: 'Checklist enraizado',
          done: typeof enraizadoMontajeCompleto === 'function' && enraizadoMontajeCompleto(cfg),
          action: 'irPropagadorMontaje',
        },
        {
          id: 'cultivo',
          label: 'Esquejes en matriz',
          done: cultivoMatrizListo(),
          action: 'irCultivo',
        },
        {
          id: 'deposito',
          label: 'Primer llenado depósito',
          done: depositoListo(cfg),
          action: 'abrirChecklist',
        },
      ];
    } else if (cam === 'madre_hidro') {
      pasos = [
        {
          id: 'config',
          label: 'Sala y depósito madre',
          done:
            !!(cfg.tipoInstalacion === 'dwc' || cfg.tipoInstalacion === 'rdwc' || cfg.checklistInstalacionConfirmada),
          action: 'abrirSetup',
        },
        {
          id: 'montaje',
          label: 'Montaje de sala',
          done: !!(cfg.puestaMarchaChecks && cfg.puestaMarchaChecks.completedAt),
          action: 'irMontaje',
        },
        {
          id: 'cultivo',
          label: 'Madre en matriz',
          done: cultivoMatrizListo(),
          action: 'irCultivo',
        },
        {
          id: 'operativa',
          label: 'Rutina diaria (Medir)',
          done: depositoListo(cfg),
          action: 'irMedir',
        },
      ];
    }
    return pasos;
  }

  function caminoResumenDebeMostrarse(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var cam = getCaminoCultivo(cfg);
    if (!cam || !CAMINOS[cam]) return false;
    if (depositoListo(cfg)) return false;
    try {
      if (typeof getInstalacionLifecycle === 'function') {
        var lc = getInstalacionLifecycle(cfg);
        if (lc.operativaDiaria) return false;
      }
    } catch (_) {}
    return true;
  }

  function renderCaminoResumenHtml(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var cam = getCaminoCultivo(cfg);
    var def = getCaminoDef(cam);
    var pasos = getCaminoResumenPasos(cfg);
    if (!pasos.length) return '';

    var doneN = pasos.filter(function (p) {
      return p.done;
    }).length;
    var currentIdx = -1;
    for (var i = 0; i < pasos.length; i++) {
      if (!pasos[i].done) {
        currentIdx = i;
        break;
      }
    }
    var pasoUnico =
      typeof hcSiguientePasoInstalacion === 'function' ? hcSiguientePasoInstalacion(cfg) : null;

    var items = pasos
      .map(function (p, i) {
        var cls = 'hc-camino-resumen-item';
        if (p.done) cls += ' hc-camino-resumen-item--done';
        else if (i === currentIdx) cls += ' hc-camino-resumen-item--current';
        var icon = p.done ? '✓' : i === currentIdx ? '→' : '○';
        var hint = p.hint ? ' <span class="hc-camino-resumen-hint">' + escResumen(p.hint) + '</span>' : '';
        return (
          '<li class="' +
          cls +
          '">' +
          '<span class="hc-camino-resumen-ico" aria-hidden="true">' +
          icon +
          '</span>' +
          '<span class="hc-camino-resumen-lbl">' +
          escResumen(p.label) +
          hint +
          '</span></li>'
        );
      })
      .join('');

    var cta =
      pasoUnico && pasoUnico.action
        ? '<button type="button" class="btn btn-primary btn-sm hc-camino-resumen-cta" data-camino-action="' +
          escResumen(pasoUnico.action) +
          '">' +
          escResumen(pasoUnico.label) +
          '</button>'
        : '';

    return (
      '<div class="hc-camino-resumen-card">' +
      '<div class="hc-camino-resumen-head">' +
      '<h2 class="hc-camino-resumen-title">' +
      escResumen((def.icon || '') + ' ' + def.label) +
      '</h2>' +
      '<span class="hc-camino-resumen-pct">' +
      doneN +
      '/' +
      pasos.length +
      ' listos</span></div>' +
      '<p class="hc-camino-resumen-lead">Orden recomendado hasta el primer llenado del depósito y la rutina en Medir.</p>' +
      '<ul class="hc-camino-resumen-list" role="list">' +
      items +
      '</ul>' +
      (cta ? '<div class="hc-camino-resumen-actions">' + cta + '</div>' : '') +
      '</div>'
    );
  }

  function refreshDashCaminoResumen() {
    var host = document.getElementById('dashCaminoResumen');
    if (!host) return;
    var cfg = typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
    if (!caminoResumenDebeMostrarse(cfg)) {
      host.classList.add('setup-hidden');
      host.innerHTML = '';
      return;
    }
    host.classList.remove('setup-hidden');
    host.innerHTML = renderCaminoResumenHtml(cfg);
    var btn = host.querySelector('.hc-camino-resumen-cta');
    if (btn) {
      btn.addEventListener('click', function () {
        var act = btn.getAttribute('data-camino-action');
        if (act && typeof hcEjecutarAccionInstalacion === 'function') hcEjecutarAccionInstalacion(act);
      });
    }
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
  global.hcGerminacionBloqueadaPorPrepSistema = hcGerminacionBloqueadaPorPrepSistema;
  global.germinacionSeisFasesCompletas = germinacionSeisFasesCompletas;
  global.hcGerminacionBloqueada = hcGerminacionBloqueada;
  global.hcCaminoEsSemilla = hcCaminoEsSemilla;
  global.hcCaminoRequiereConfigHidroPendiente = hcCaminoRequiereConfigHidroPendiente;
  global.germinacionListaParaConfigHidro = germinacionListaParaConfigHidro;
  global.depositoListo = depositoListo;
  global.persistCaminoToConfig = persistCaminoToConfig;
  global.abrirSetupFaseSala = abrirSetupFaseSala;
  global.abrirSetupFaseHidro = abrirSetupFaseHidro;
  global.getSetupUltimoPasoIndice = getSetupUltimoPasoIndice;
  global.getSetupSkippedPagesForCamino = getSetupSkippedPagesForCamino;
  global.getSetupSkippedPagesForSalaPreGerm = getSetupSkippedPagesForSalaPreGerm;
  global.getCaminoResumenPasos = getCaminoResumenPasos;
  global.renderCaminoResumenHtml = renderCaminoResumenHtml;
  global.refreshDashCaminoResumen = refreshDashCaminoResumen;
  global.inferCaminoFromOrigen = inferCaminoFromOrigen;
})(typeof window !== 'undefined' ? window : this);
