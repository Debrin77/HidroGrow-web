/**
 * HidroGrow — cuatro caminos de cultivo (setup y post-setup).
 * semilla_propagador | semilla_hidro | esqueje_hidro | madre_hidro
 */
(function (global) {
  'use strict';

  var CAMINOS = {
    semilla_propagador: {
      id: 'semilla_propagador',
      label: 'Semilla en propagador',
      short: 'Propagador',
      origenPlanta: 'semilla',
      germModo: 'propagador',
      faseInicial: 'germinacion',
      icon: '🫧',
      orden: [
        'Fase 1: <strong>propagador</strong> (marca, semillas, sustrato, accesorios) — sala opcional.',
        'Checklist montaje → app en modo propagador (Inicio, Medir, Sala, Sistema con gráfico del domo).',
        'Registro diario (T°, HR, nutrientes en agua) y alertas en calendario.',
        'Al concluir por días → <strong>DWC/RDWC</strong> → sala/montaje → traslado → depósito.',
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
        'Asistente único: <strong>sala + DWC/RDWC</strong> (sin repetir después).',
        'Checklist prep → montaje → <strong>primer llenado</strong> → 6 fases en el cubo (Inicio).',
        'Sistema muestra germinación en cubo; esquema completo tras registrar la plántula en la matriz.',
        'Medir = agua del depósito + microclima del cubo.',
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
        'Asistente: sala + DWC/RDWC en un solo paso (sin germinación de semilla).',
        'Sistema = <strong>enraizado</strong> hasta checklist y clones en el esquema.',
        'Luego primer llenado y operativa (Medir, Calendario).',
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
        'Asistente: cubo madre + sala + depósito.',
        'Sistema = <strong>cubo madre</strong> hasta asignar planta y primer llenado.',
        '18/6 permanente; esquejes con el camino de clon.',
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
    var cfg =
      cfgOpt && typeof cfgOpt === 'object'
        ? cfgOpt
        : typeof state !== 'undefined' && state && state.configTorre
          ? state.configTorre
          : {};
    var fromCfg = String(
      cfg.caminoCultivo || (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo) || ''
    ).trim();
    if (fromCfg && CAMINOS[fromCfg]) return fromCfg;
    try {
      if (typeof ensurePremiumSetup === 'function') {
        var p = ensurePremiumSetup();
        if (p.caminoCultivo && CAMINOS[p.caminoCultivo]) return p.caminoCultivo;
        return inferCaminoFromOrigen(p.origenPlanta, p.germinacionModoPreferido);
      }
    } catch (_) {}
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
    if (typeof setupData === 'undefined') {
      try {
        if (typeof showToast === 'function') {
          showToast('Cargando asistente… espera un momento y vuelve a pulsar', true);
        }
      } catch (_) {}
      return;
    }
    var p = ensurePremiumCamino();
    if (!p) return;
    p.caminoCultivo = def.id;
    p.origenPlanta = def.origenPlanta;
    p.germinacionModoPreferido = def.germModo || '';
    p.climaManual = false;
    if (typeof aplicarPremiumClimaPorCamino === 'function') {
      aplicarPremiumClimaPorCamino(def.id, { force: true });
    }
    if (typeof seleccionarPremiumOrigen === 'function') {
      seleccionarPremiumOrigen(def.origenPlanta);
    } else if (typeof persistOrigenASetupData === 'function') {
      persistOrigenASetupData(def.origenPlanta);
    }
    if (def.origenPlanta === 'semilla') {
      var esNuevaGerm =
        typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre;
      var premGuard =
        typeof state !== 'undefined' &&
        state &&
        state.configTorre &&
        state.configTorre.premiumSetup;
      if (
        esNuevaGerm ||
        !premGuard ||
        !(premGuard.numSemillasGermManual || premGuard.sustratoGermManual)
      ) {
        if (typeof hcResetPremiumGermPlanBorrador === 'function') {
          hcResetPremiumGermPlanBorrador(p);
        }
      }
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
    if (
      typeof setupPagina !== 'undefined' &&
      typeof SETUP_PAGE_ORIGEN !== 'undefined' &&
      setupPagina === SETUP_PAGE_ORIGEN
    ) {
      if (typeof refreshSetupCaminoStepBanner === 'function') {
        refreshSetupCaminoStepBanner(setupPagina);
      }
      return;
    }
    if (typeof renderPremiumGermPlanUI === 'function') renderPremiumGermPlanUI();
    if (typeof syncPremiumMetodoGenPlacement === 'function') syncPremiumMetodoGenPlacement();
    if (typeof syncPremiumGermSectionPlacement === 'function') syncPremiumGermSectionPlacement();
    if (typeof renderEquipamientoPremiumUI === 'function') renderEquipamientoPremiumUI();
    if (typeof refreshSetupEquipOrigenBanner === 'function') refreshSetupEquipOrigenBanner();
    if (typeof refreshSetupCaminoStepBanner === 'function' && typeof setupPagina !== 'undefined') {
      refreshSetupCaminoStepBanner(setupPagina);
    }
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
      flow.classList.add('setup-hidden');
      flow.innerHTML = '';
    }
    if (typeof refreshPremiumOrigenRecoUI === 'function') {
      refreshPremiumOrigenRecoUI();
    }
    var foot = document.getElementById('setupPremiumOrigenFootHint');
    if (foot) foot.classList.add('setup-hidden');
    var fase = document.getElementById('setupCaminoFaseBanner');
    if (fase) {
      fase.classList.add('setup-hidden');
      fase.innerHTML = '';
    }
  }

  /** Sesión del asistente: solo sala (carpa, LED, extractor…) antes de las 6 fases. */
  /** Quita modo «solo sala» del asistente (nueva instalación o reconfigurar camino). */
  function hcClearSetupSalaPreGermFlags(cfg) {
    try {
      if (typeof window !== 'undefined') delete window._hcSetupSalaPreGermSession;
    } catch (_) {}
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || null;
    if (cfg && typeof cfg === 'object' && cfg.hcSetupFase === 'sala_pre_germ') {
      cfg.hcSetupFase = 'germinacion';
    }
  }

  /** Propagador: el asistente premium (camino → germ) aún no se guardó; no saltar a sala. */
  function hcPropagadorAsistenteGermPendiente(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (getCaminoCultivo(cfg) !== 'semilla_propagador') return false;
    if (String(cfg.hcSetupFase || '') === 'hidro') return false;
    if (cfg.hcPropagadorGermAsistenteGuardadoAt) return false;
    return true;
  }

  function hcForzarSetupPaginaCamino() {
    hcClearSetupSalaPreGermFlags();
    if (typeof state !== 'undefined' && state && state.configTorre) {
      if (state.configTorre.hcSetupFase === 'sala_pre_germ') {
        state.configTorre.hcSetupFase = 'germinacion';
      }
    }
    setupPagina =
      typeof SETUP_PAGE_ORIGEN !== 'undefined' ? SETUP_PAGE_ORIGEN : 1;
  }

  /** Inicio / CTA: abrir siempre «¿Cómo empiezas el cultivo?» (no equipamiento de sala). */
  function abrirSetupCaminoPropagador() {
    hcForzarSetupPaginaCamino();
    try {
      if (typeof hcResetSetupWizardSession === 'function') {
        hcResetSetupWizardSession({ keepPagina: true });
      }
    } catch (_) {}
    hcForzarSetupPaginaCamino();
    setupEsNuevaTorre = false;
    var so = document.getElementById('setupOverlay');
    if (!so) return;
    so.classList.add('open');
    try {
      if (typeof renderSetupPage === 'function') renderSetupPage();
      if (typeof refreshCaminoCultivoUI === 'function') refreshCaminoCultivoUI();
      if (typeof a11yDialogOpened === 'function') a11yDialogOpened(so);
    } catch (_) {}
  }

  function hcSetupEnFaseSalaPreGerm() {
    try {
      if (typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre) return false;
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
    if (cfg.salaPreGermConfigAt) return true;
    /* No llamar salaConfiguradaCamino: esa función ya delega aquí y provoca recursión infinita. */
    var p = cfg.premiumSetup || {};
    if (Number(p.anchoM) > 0 && Number(p.largoM) > 0) return true;
    if (Number(cfg.growRoomAnchoM) > 0 && Number(cfg.growRoomLargoM) > 0) return true;
    var inst = cfg.equipamientoInstalado || {};
    return Object.keys(inst).some(function (k) {
      return inst[k] && (inst[k].marca || inst[k].id);
    });
  }

  /** Tras guardar solo equipamiento de sala: no pisar propagador, germinación ni camino. */
  function hcRestaurarCfgCaminoGerminacionTrasSetupSala(dest, src) {
    if (!dest || !src || typeof dest !== 'object' || typeof src !== 'object') return dest;
    var keys = [
      'caminoCultivo',
      'germinacionFlow',
      'premiumSetup',
      'propagadorMontajeChecks',
      'preparacionGermHidroChecks',
      'enraizadoMontajeChecks',
      'semillero',
      'sustratoGerm',
      'hcGermPlan',
      'variedadGerminacion',
      'numNiveles',
      'numCestas',
    ];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (src[k] == null) continue;
      try {
        dest[k] = JSON.parse(JSON.stringify(src[k]));
      } catch (_) {
        dest[k] = src[k];
      }
    }
    return dest;
  }

  /**
   * Propagador: montaje/config de sala sin circuito hidro (DWC, tuberías, depósito).
   * El hidro entra al cerrar germinación y abrir el asistente DWC/RDWC (hcSetupFase === 'hidro').
   */
  function hcPropagadorEquipSalaSinHidro(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (getCaminoCultivo(cfg) !== 'semilla_propagador') return false;
    return String(cfg.hcSetupFase || 'germinacion') !== 'hidro';
  }

  /** Asistente premium aún en bloque germinación (antes de geometría/hidro). */
  function hcSetupWizardEnBloquePremiumGerm() {
    if (typeof setupPagina === 'undefined') return false;
    var start =
      typeof SETUP_PAGE_PREMIUM_START !== 'undefined' ? SETUP_PAGE_PREMIUM_START : 1;
    var end = typeof SETUP_PAGE_PREMIUM_6 !== 'undefined' ? SETUP_PAGE_PREMIUM_6 : 7;
    return setupPagina >= start && setupPagina <= end;
  }

  /** Semilla (propagador o hidro): bloque premium de germinación en el asistente inicial. */
  function hcCaminoSemillaGermEnSetup() {
    var cam = getCaminoCultivo();
    if (cam !== 'semilla_propagador' && cam !== 'semilla_hidro') return false;
    if (hcSetupEnFaseSalaPreGerm()) return false;
    if (hcSetupEnFaseGerminacion()) return true;
    if (typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre) return true;
    return hcSetupWizardEnBloquePremiumGerm();
  }

  /** Semilla en propagador: fase 1 del asistente = solo domo/mat, sin sala ni hidro. */
  function hcCaminoSemillaPropagadorSetupGerm() {
    if (getCaminoCultivo() !== 'semilla_propagador') return false;
    return hcCaminoSemillaGermEnSetup();
  }

  /** Durante el wizard o con instalación en fase germinación (sin hidro cerrado). */
  function hcSetupEnFaseGerminacion() {
    if (hcSetupEnFaseSalaPreGerm()) return false;
    var cam = getCaminoCultivo();
    var def = getCaminoDef(cam);
    if (!def || def.faseInicial !== 'germinacion') return false;
    if (typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre) return true;
    if (hcSetupWizardEnBloquePremiumGerm()) return true;
    try {
      var cfg = typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : null;
      if (cfg && cfg.hcSetupFase === 'hidro') return false;
      if (cfg && cfg.hcSetupFase === 'sala_pre_germ') return false;
    } catch (_) {}
    return false;
  }

  function montajeSalaPreGermOk(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (!salaPreGermConfigurada(cfg)) return false;
    var checks = cfg.puestaMarchaChecks;
    if (!checks || !checks.completedAt) return false;
    if (typeof montajeVerificacionVigente === 'function') {
      return montajeVerificacionVigente(cfg);
    }
    return true;
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

  /** Propagador: sala opcional en cualquier momento (sin exigir las 6 fases). Hidro: sala antes de germinar. */
  function hcGerminacionBloqueadaPorSala(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (!hcCaminoRequiereSalaPreGerm(cfg)) return false;
    var cam = getCaminoCultivo(cfg);
    if (typeof propagadorMontajeCompleto === 'function' && !propagadorMontajeCompleto(cfg)) {
      return false;
    }
    if (cam === 'semilla_propagador') {
      if (typeof germinacionConcluida !== 'function' || !germinacionConcluida(cfg)) return false;
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

  function checklistCierreGermOk(g) {
    if (typeof global.germChecklistCierreOk === 'function') return global.germChecklistCierreOk(g);
    if (!g || typeof g !== 'object') return false;
    if (g.checklistOperativaOk === true) return true;
    return !!g.checklistTrasladoOk;
  }

  /** Tras cambiar de instalación: re-sincroniza camino, pestañas y resumen sin mezclar datos. */
  function hcSincronizarUiInstalacionActiva(opts) {
    opts = opts || {};
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) || {};
    try {
      if (typeof hcGerminacionSyncDesdePremium === 'function') hcGerminacionSyncDesdePremium(cfg);
    } catch (_) {}
    try {
      if (typeof refreshTabsOperativaCamino === 'function') {
        refreshTabsOperativaCamino({ visibilidadOnly: !!opts.soloVisibilidad });
      }
    } catch (_) {}
    try {
      if (typeof refreshDashCaminoResumen === 'function') refreshDashCaminoResumen();
    } catch (_) {}
    try {
      if (typeof hcRefreshSistemaFasePanel === 'function') hcRefreshSistemaFasePanel();
    } catch (_) {}
  }

  function hcGerminacionBloqueada(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (typeof hcGerminacionBloqueadaPorMontaje === 'function' && hcGerminacionBloqueadaPorMontaje(cfg)) {
      return 'propagador';
    }
    if (typeof hcGerminacionBloqueadaPorPlanDatos === 'function' && hcGerminacionBloqueadaPorPlanDatos(cfg)) {
      return 'plan_germ';
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
      var camGerm = getCaminoCultivo(cfg);
      if (g && g.pasos) {
        var ids = ['semilla', 'taproot', 'rockwool', 'domo', 'netpot', 'dwc'];
        var allDone = true;
        for (var i = 0; i < ids.length; i++) {
          if (!g.pasos[ids[i]] || !g.pasos[ids[i]].doneAt) {
            allDone = false;
            break;
          }
        }
        if (camGerm === 'semilla_propagador') {
          if (
            typeof germinacionConcluida === 'function' &&
            germinacionConcluida(cfg) &&
            typeof hidroInstalacionCerrada === 'function' &&
            !hidroInstalacionCerrada(cfg)
          ) {
            return 'hidro_config';
          }
          if (
            typeof germinacionConcluida === 'function' &&
            germinacionConcluida(cfg) &&
            !checklistCierreGermOk(g)
          ) {
            return 'traslado';
          }
        } else if (allDone && !checklistCierreGermOk(g)) {
          return 'traslado';
        }
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
    var cam = getCaminoCultivo(cfg);
    if (cam === 'semilla_propagador') {
      return typeof germinacionConcluida === 'function' && germinacionConcluida(cfg);
    }
    var g = cfg.germinacionFlow;
    if (!g || typeof g !== 'object') return false;
    if (g.trasladoAt) return true;
    var pasos = g.pasos;
    if (!pasos || typeof pasos !== 'object') return false;
    var ids = ['semilla', 'taproot', 'rockwool', 'domo', 'netpot', 'dwc'];
    for (var i = 0; i < ids.length; i++) {
      if (!pasos[ids[i]] || !pasos[ids[i]].doneAt) return false;
    }
    return checklistCierreGermOk(g);
  }

  function hcCaminoRequiereConfigHidroPendiente(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var cam = getCaminoCultivo(cfg);
    if (cam === 'semilla_propagador') {
      if (!germinacionListaParaConfigHidro(cfg)) return false;
      return !hidroInstalacionCerrada(cfg);
    }
    /** Hidro directo: DWC/RDWC solo en el asistente inicial (antes de las 6 fases). */
    if (cam === 'semilla_hidro') return false;
    if (!hcCaminoEsSemilla(cam)) return false;
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

  function hcSalaPreGermPermitida(cfg, opts) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (getCaminoCultivo(cfg) === 'semilla_propagador') {
      return true;
    }
    return true;
  }

  /** DWC/RDWC y matriz aún no cerrados (solo montaje de equipamiento de sala). */
  function hcMontajeEsSoloEquipamientoSala(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (getCaminoCultivo(cfg) === 'semilla_propagador') {
      return hcPropagadorEquipSalaSinHidro(cfg);
    }
    if (typeof hcCaminoEsSemilla === 'function' && !hcCaminoEsSemilla(getCaminoCultivo(cfg))) {
      return false;
    }
    return cfg.tipoInstalacion !== 'dwc' && cfg.tipoInstalacion !== 'rdwc';
  }

  /** Matriz visible solo en fase operativa (no durante modo fase en Sistema). */
  function hcCultivoMatrizDisponible(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (typeof getSistemaFaseCamino === 'function' && getSistemaFaseCamino(cfg)) {
      return false;
    }
    if (!hcMontajeEsSoloEquipamientoSala(cfg)) return true;
    return cfg.checklistInstalacionConfirmada === true;
  }

  function hcSugerirGeometriaDesdeGerminacion(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var g = cfg.germinacionFlow;
    if (!g) return null;
    var n = Math.min(72, Math.max(1, Math.round(Number(g.numSemillas) || 1)));
    var vid = g.variedadId || (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) || '';
    return { numPlantas: n, variedadId: vid };
  }

  /** Pre-rellena cubos/cestas del asistente hidro según semillas en germinación. */
  function hcAplicarGeometriaSugeridaGerminacion(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var sug = hcSugerirGeometriaDesdeGerminacion(cfg);
    if (!sug) return false;
    var n = sug.numPlantas;
    try {
      if (typeof setupData !== 'undefined' && setupData) {
        setupData.dwcNumCubos = n;
      }
      if (typeof state !== 'undefined' && state && state.configTorre) {
        state.configTorre.dwcNumCubos = n;
        if (typeof dwcAplicarMatrizCultivoMulticuboEnCfg === 'function') {
          dwcAplicarMatrizCultivoMulticuboEnCfg(state.configTorre, { numCubos: 'setupDwcNumCubos' });
        } else {
          state.configTorre.numNiveles = 1;
          state.configTorre.numCestas = n;
        }
        var rs = state.configTorre.rdwcSites;
        if (!rs || rs < n) state.configTorre.rdwcSites = n;
      }
      var elCub = document.getElementById('setupDwcNumCubos');
      if (elCub) elCub.value = String(n);
      var elSites = document.getElementById('setupRdwcSites');
      if (elSites && (!elSites.value || parseInt(elSites.value, 10) < n)) elSites.value = String(n);
      var slC = document.getElementById('sliderCestas');
      if (slC) slC.value = String(n);
      var slN = document.getElementById('sliderNiveles');
      if (slN && parseInt(slN.value, 10) > 1) slN.value = '1';
    } catch (_) {}
    return true;
  }

  function hcNumSemillasGermConfig(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var g = cfg.germinacionFlow || {};
    if (Number.isFinite(g.numSemillas) && g.numSemillas >= 1) {
      return Math.min(72, Math.round(g.numSemillas));
    }
    if (typeof getPlanGermEstado === 'function') {
      var st = getPlanGermEstado(cfg);
      if (st.numSemillas >= 1) return Math.min(72, Math.round(st.numSemillas));
    }
    var prem = cfg.premiumSetup || {};
    if (Number.isFinite(prem.numSemillasGerm) && prem.numSemillasGerm >= 1) {
      return Math.min(72, Math.round(prem.numSemillasGerm));
    }
    if (Number.isFinite(cfg.numSemillasGerm) && cfg.numSemillasGerm >= 1) {
      return Math.min(72, Math.round(cfg.numSemillasGerm));
    }
    return 0;
  }

  function hcCloneCeldaTorrePropagador(c) {
    if (!c || typeof c !== 'object') {
      return { variedad: '', fecha: '', notas: '', origenPlanta: '', fotos: [], fotoKeys: [] };
    }
    return {
      variedad: c.variedad || '',
      fecha: c.fecha || '',
      notas: c.notas || '',
      origenPlanta: c.origenPlanta || '',
      fotos: Array.isArray(c.fotos) ? c.fotos.slice() : [],
      fotoKeys: Array.isArray(c.fotoKeys) ? c.fotoKeys.slice() : [],
    };
  }

  /**
   * Propagador: matriz 1×N alineada con numSemillas (Inicio / Plantas en instalación / esquema).
   * Aplana filas DWC antiguas (p. ej. 3×3=9) a una sola fila de N alvéolos.
   */
  function hcPropagadorTorreNecesitaAjuste(cfg, nObjetivo) {
    if (typeof state === 'undefined' || !state) return false;
    var n = Math.min(
      72,
      Math.max(1, Math.round(Number(nObjetivo) || hcNumSemillasGermConfig(cfg) || 1))
    );
    var torre = state.torre || [];
    var flat = 0;
    for (var fi = 0; fi < torre.length; fi++) {
      flat += (torre[fi] && torre[fi].length) || 0;
    }
    return (
      torre.length !== 1 ||
      flat !== n ||
      (cfg.numNiveles || 1) !== 1 ||
      (cfg.numCestas || 0) !== n
    );
  }

  function hcAjustarTorrePropagadorSemillas(cfg, nObjetivo, opts) {
    opts = opts || {};
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var camAj = getCaminoCultivo(cfg);
    if (camAj !== 'semilla_propagador' && camAj !== 'semilla_hidro') return false;
    if (typeof state === 'undefined' || !state) return false;
    if (cfg._hcAjustandoTorrePropagador) return false;
    cfg._hcAjustandoTorrePropagador = true;
    var n = Math.min(
      72,
      Math.max(1, Math.round(Number(nObjetivo) || hcNumSemillasGermConfig(cfg) || 1))
    );
    if (!opts.force && !hcPropagadorTorreNecesitaAjuste(cfg, n)) {
      delete cfg._hcAjustandoTorrePropagador;
      return false;
    }
    try {
    if (typeof ensureGerminacionFlow === 'function') ensureGerminacionFlow(cfg);
    var prem = cfg.premiumSetup || {};
    if (!cfg.premiumSetup || typeof cfg.premiumSetup !== 'object') cfg.premiumSetup = prem;
    prem.numSemillasGerm = n;
    cfg.numSemillasGerm = n;
    var g = cfg.germinacionFlow;
    if (g) {
      g.numSemillas = n;
      if (!Number.isFinite(g.semillasActivas) || g.semillasActivas < 1 || g.semillasActivas > n) {
        g.semillasActivas = n;
      }
    }
    var flat = [];
    var torreIn = state.torre || [];
    for (var ni = 0; ni < torreIn.length; ni++) {
      var rowIn = torreIn[ni] || [];
      for (var ci = 0; ci < rowIn.length; ci++) {
        if (rowIn[ci]) flat.push(rowIn[ci]);
      }
    }
    var sug = hcSugerirGeometriaDesdeGerminacion(cfg);
    var vid = sug ? String(sug.variedadId || '').trim() : '';
    var hoy =
      typeof hoyIso === 'function'
        ? hoyIso()
        : new Date().toISOString().slice(0, 10);
    var suKey =
      cfg.sustratoGerm ||
      prem.sustratoGerm ||
      (g && g.sustratoGerm) ||
      '';
    var suLbl =
      typeof etiquetaSustratoGerm === 'function' ? etiquetaSustratoGerm(suKey) : suKey;
    var notasBase = suLbl ? 'Sustrato: ' + suLbl : '';
    var rowNueva = [];
    for (var i = 0; i < n; i++) {
      var cell = hcCloneCeldaTorrePropagador(flat[i]);
      if (!String(cell.variedad || '').trim() && vid) {
        cell.variedad = vid;
        cell.fecha = hoy;
        cell.origenPlanta = 'germinacion';
      }
      if (!cell.notas && notasBase) cell.notas = notasBase;
      rowNueva.push(cell);
    }
    state.torre = [rowNueva];
    cfg.numNiveles = 1;
    cfg.numCestas = n;
    cfg.germinacionEnPropagador = true;
    return true;
    } finally {
      delete cfg._hcAjustandoTorrePropagador;
    }
  }

  /**
   * Repara torre/config cuando quedó matriz DWC (p. ej. 3×3=9) pero el plan tiene otra cantidad de semillas.
   */
  function hcRepararSemillasPropagadorAlCargar(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (getCaminoCultivo(cfg) !== 'semilla_propagador') return false;
    if (typeof state === 'undefined' || !state) return false;
    var n = hcNumSemillasGermConfig(cfg);
    if (!n || n < 1) return false;
    if (!hcPropagadorTorreNecesitaAjuste(cfg, n)) return false;
    return hcAjustarTorrePropagadorSemillas(cfg, n, { force: true });
  }

  /** Filas × cestas según camino (propagador = 1×N semillas, no 5×5 por defecto). */
  function hcDimsTorreDesdeConfig(cfg, torre) {
    cfg = cfg || {};
    torre = torre || [];
    if (getCaminoCultivo(cfg) === 'semilla_propagador') {
      var c = hcNumSemillasGermConfig(cfg);
      if (!c || c < 1) {
        c = 6;
      }
      return { numNiveles: 1, numCestas: Math.min(72, Math.max(1, c)) };
    }
    return {
      numNiveles: Math.max(1, parseInt(String(cfg.numNiveles || 5), 10) || 5),
      numCestas: Math.max(1, parseInt(String(cfg.numCestas || 5), 10) || 5),
    };
  }

  /** Matriz 1×N en propagador: genética + sustrato visibles en Cultivo / plantas en instalación. */
  function hcInicializarTorreGerminacionPropagador(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (typeof syncGermPlanATorreDraft === 'function') syncGermPlanATorreDraft();
    var sug = hcSugerirGeometriaDesdeGerminacion(cfg);
    if (!sug) return false;
    var n = Math.max(sug.numPlantas, hcNumSemillasGermConfig(cfg) || 1);
    return hcAjustarTorrePropagadorSemillas(cfg, n);
  }

  /** Repara torre vacía o sin genética cuando el modo Sistema es propagador. */
  function hcSyncGerminacionPlanCultivo(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (typeof getSistemaFaseCamino !== 'function' || getSistemaFaseCamino(cfg) !== 'propagador') {
      return;
    }
    hcRepararSemillasPropagadorAlCargar(cfg);
    var sug = hcSugerirGeometriaDesdeGerminacion(cfg);
    if (!sug || !sug.variedadId) return;
    var torre = typeof state !== 'undefined' && state && state.torre ? state.torre : [];
    var conVar = false;
    for (var ni = 0; ni < torre.length; ni++) {
      var row = torre[ni];
      if (!row) continue;
      for (var ci = 0; ci < row.length; ci++) {
        if (row[ci] && row[ci].variedad && String(row[ci].variedad).trim()) {
          conVar = true;
          break;
        }
      }
      if (conVar) break;
    }
    if (!conVar) {
      hcAjustarTorrePropagadorSemillas(cfg, hcNumSemillasGermConfig(cfg) || 6);
    }
  }

  /** Tras cerrar DWC/RDWC: variedad y origen «germinación» en cestas vacías (camino semilla). */
  function hcAplicarGerminacionATorreTrasHidro(cfg, torreArr) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (typeof hcCaminoEsSemilla === 'function' && !hcCaminoEsSemilla(getCaminoCultivo(cfg))) {
      return;
    }
    var sug = hcSugerirGeometriaDesdeGerminacion(cfg);
    if (!sug || !sug.variedadId || !torreArr || !torreArr.length) return;
    var hoy =
      typeof hoyIso === 'function'
        ? hoyIso()
        : new Date().toISOString().slice(0, 10);
    for (var ni = 0; ni < torreArr.length; ni++) {
      var row = torreArr[ni];
      if (!row) continue;
      for (var ci = 0; ci < row.length; ci++) {
        var cell = row[ci];
        if (!cell) continue;
        if (cell.variedad && String(cell.variedad).trim()) continue;
        cell.variedad = sug.variedadId;
        cell.origenPlanta = 'germinacion';
        if (!cell.fecha) cell.fecha = hoy;
      }
    }
  }

  function abrirSetupFaseSala(opts) {
    opts = opts || {};
    var cfg =
      typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
    if (
      getCaminoCultivo(cfg) === 'semilla_propagador' &&
      hcPropagadorAsistenteGermPendiente(cfg)
    ) {
      abrirSetupCaminoPropagador();
      return;
    }
    if (
      getCaminoCultivo(cfg) === 'semilla_hidro' &&
      salaPreGermConfigurada(cfg) &&
      typeof montajeSalaPreGermOk === 'function' &&
      !montajeSalaPreGermOk(cfg) &&
      typeof hcAbrirMontajeSalaChecklist === 'function'
    ) {
      if (typeof showToast === 'function') {
        showToast(
          'La sala ya está en el asistente. Abre el checklist de montaje físico en Sala.',
          false,
          { durationMs: 5200 }
        );
      }
      hcAbrirMontajeSalaChecklist();
      return;
    }
    if (!hcSalaPreGermPermitida(cfg, opts)) {
      if (typeof showToast === 'function') {
        showToast('Aún no puedes configurar la sala. Revisa los pasos pendientes en Inicio.', true, {
          durationMs: 6200,
        });
      }
      return;
    }
    try {
      if (typeof syncSetupEquipamientoDesdeConfig === 'function') {
        syncSetupEquipamientoDesdeConfig(cfg);
      }
      if (cfg.equipamientoInstalado && typeof setupData !== 'undefined') {
        setupData.equipamientoInstaladoDraft = JSON.parse(
          JSON.stringify(cfg.equipamientoInstalado)
        );
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
      if (typeof cargarPremiumSetupUI === 'function') {
        cargarPremiumSetupUI(setupPagina);
      }
      if (typeof applySalaPreGermEquipMinimalChrome === 'function') {
        applySalaPreGermEquipMinimalChrome();
      }
      if (typeof renderEquipamientoPremiumUI === 'function') {
        renderEquipamientoPremiumUI();
      }
      if (typeof a11yDialogOpened === 'function') a11yDialogOpened(so);
    } else if (typeof abrirSetup === 'function') {
      abrirSetup();
    }
    if (typeof showToast === 'function') {
      showToast(
        opts.duranteGerminacion
          ? 'Elige carpa, LED, extractor y propagador. Al guardar, el checklist de montaje está en Sala.'
          : 'Solo equipamiento de sala (carpa, LED, extractor). El fotoperiodo y el DWC/RDWC ya los definiste o irán después.',
        false,
        { durationMs: 6800 }
      );
    }
  }

  /** Inicio · propagador: abrir configurador de equipamiento de sala durante la germinación. */
  function abrirConfiguradorEquipamientoSalaPropagador() {
    abrirSetupFaseSala({ duranteGerminacion: true });
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
    hcAplicarGeometriaSugeridaGerminacion(state && state.configTorre);
    var sug = hcSugerirGeometriaDesdeGerminacion(state && state.configTorre);
    if (typeof showToast === 'function') {
      showToast(
        sug
          ? 'Fase 2: DWC/RDWC · orientativo ' +
            sug.numPlantas +
            ' planta(s) según germinación (ajusta cestas al guardar)'
          : 'Fase 2: DWC/RDWC y circuito hidro',
        false,
        { durationMs: 6200 }
      );
    }
  }

  function getSetupSkippedPagesForSalaPreGerm() {
    var skip = new Set();
    if (!hcSetupEnFaseSalaPreGerm()) return skip;
    [
      typeof SETUP_PAGE_WELCOME !== 'undefined' ? SETUP_PAGE_WELCOME : 0,
      typeof SETUP_PAGE_ORIGEN !== 'undefined' ? SETUP_PAGE_ORIGEN : 1,
      typeof SETUP_PAGE_PREMIUM_1 !== 'undefined' ? SETUP_PAGE_PREMIUM_1 : 2,
      typeof SETUP_PAGE_PREMIUM_2 !== 'undefined' ? SETUP_PAGE_PREMIUM_2 : 3,
      typeof SETUP_PAGE_PREMIUM_4 !== 'undefined' ? SETUP_PAGE_PREMIUM_4 : 5,
      typeof SETUP_PAGE_PREMIUM_5 !== 'undefined' ? SETUP_PAGE_PREMIUM_5 : 6,
      typeof SETUP_PAGE_PREMIUM_6 !== 'undefined' ? SETUP_PAGE_PREMIUM_6 : 7,
      typeof SETUP_PAGE_PREMIUM_END !== 'undefined' ? SETUP_PAGE_PREMIUM_END : 8,
      typeof SETUP_PAGE_GEOMETRY !== 'undefined' ? SETUP_PAGE_GEOMETRY : 9,
      typeof SETUP_PAGE_EQUIP !== 'undefined' ? SETUP_PAGE_EQUIP : 10,
      typeof SETUP_PAGE_AGUA !== 'undefined' ? SETUP_PAGE_AGUA : 11,
      typeof SETUP_PAGE_NUTRIENTES !== 'undefined' ? SETUP_PAGE_NUTRIENTES : 12,
      typeof SETUP_PAGE_UBICACION !== 'undefined' ? SETUP_PAGE_UBICACION : 13,
      typeof SETUP_PAGE_CULTIVOS !== 'undefined' ? SETUP_PAGE_CULTIVOS : 14,
      typeof SETUP_PAGE_RESUMEN !== 'undefined' ? SETUP_PAGE_RESUMEN : 15,
    ].forEach(function (p) {
      skip.add(p);
    });
    return skip;
  }

  function getSetupUltimoPasoIndice() {
    if (hcSetupEnFaseSalaPreGerm()) {
      return typeof SETUP_PAGE_PREMIUM_3 !== 'undefined' ? SETUP_PAGE_PREMIUM_3 : 4;
    }
    if (typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre && hcSetupEnFaseGerminacion()) {
      if (typeof getSetupVisiblePages === 'function') {
        var vis = getSetupVisiblePages();
        if (vis.length) return vis[vis.length - 1];
      }
      if (getCaminoCultivo() === 'semilla_propagador') {
        return typeof SETUP_PAGE_PREMIUM_4 !== 'undefined' ? SETUP_PAGE_PREMIUM_4 : 5;
      }
      if (getCaminoCultivo() === 'semilla_hidro') {
        return typeof SETUP_PAGE_PREMIUM_END !== 'undefined' ? SETUP_PAGE_PREMIUM_END : 8;
      }
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
    if (!hcSetupEnFaseGerminacion()) {
      if (
        typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
        hcCaminoSemillaPropagadorSetupGerm()
      ) {
        skip.add(typeof SETUP_PAGE_PREMIUM_6 !== 'undefined' ? SETUP_PAGE_PREMIUM_6 : 7);
      }
      return skip;
    }
    var cam = getCaminoCultivo();
    if (cam === 'semilla_hidro') {
      [
        typeof SETUP_PAGE_EQUIP !== 'undefined' ? SETUP_PAGE_EQUIP : 10,
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
    if (cam === 'semilla_propagador') {
      pages.push(typeof SETUP_PAGE_PREMIUM_5 !== 'undefined' ? SETUP_PAGE_PREMIUM_5 : 6);
      pages.push(typeof SETUP_PAGE_PREMIUM_6 !== 'undefined' ? SETUP_PAGE_PREMIUM_6 : 7);
    }
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
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    var tipo = String(cfg.tipoInstalacion || '').trim().toLowerCase();
    if (cam === 'semilla_propagador') {
      if (typeof germinacionConcluida === 'function' && !germinacionConcluida(cfg)) {
        return false;
      }
      if (String(cfg.hcSetupFase || 'germinacion') !== 'hidro') return false;
      return (
        (tipo === 'dwc' || tipo === 'rdwc') && cfg.checklistInstalacionConfirmada === true
      );
    }
    if (cfg.checklistInstalacionConfirmada === true) {
      if (tipo === 'dwc' || tipo === 'rdwc') return true;
      return true;
    }
    if (tipo !== 'dwc' && tipo !== 'rdwc') return false;
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
            id: 'fases6',
            label: '6 fases (' + fasesN + '/6)',
            done: fasesN >= 6,
            action: 'irGerminacion',
            hint: fasesN > 0 && fasesN < 6 ? 'En curso' : '',
          },
        ];
        if (
          typeof germinacionConcluida === 'function' &&
          germinacionConcluida(cfg)
        ) {
          pasos = pasos.concat([
            {
              id: 'traslado',
              label: 'Checklist traslado',
              done: checklistCierreGermOk(g),
              action: 'irGerminacion',
            },
            {
              id: 'hidro',
              label: 'DWC/RDWC cerrado',
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
        }
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
        pasos = pasos.concat([
          {
            id: 'traslado',
            label: 'Checklist operativa',
            done: checklistCierreGermOk(g),
            action: 'irGerminacion',
          },
          {
            id: 'cultivo',
            label: 'Planta en matriz',
            done: cultivoMatrizListo() || !!g.trasladoAt,
            action: 'irCultivo',
          },
        ]);
      }
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
    if (cam === 'semilla_propagador') return false;
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
  global.hcCaminoSemillaGermEnSetup = hcCaminoSemillaGermEnSetup;
  global.hcCaminoSemillaPropagadorSetupGerm = hcCaminoSemillaPropagadorSetupGerm;
  global.hcSetupWizardEnBloquePremiumGerm = hcSetupWizardEnBloquePremiumGerm;
  global.hcCaminoRequiereSalaPreGerm = hcCaminoRequiereSalaPreGerm;
  global.salaPreGermConfigurada = salaPreGermConfigurada;
  global.hcPropagadorEquipSalaSinHidro = hcPropagadorEquipSalaSinHidro;
  global.montajeSalaPreGermOk = montajeSalaPreGermOk;
  global.salaListaAntesDeGerminacion = salaListaAntesDeGerminacion;
  global.hcGerminacionBloqueadaPorSala = hcGerminacionBloqueadaPorSala;
  global.hcGerminacionBloqueadaPorPrepSistema = hcGerminacionBloqueadaPorPrepSistema;
  global.germinacionSeisFasesCompletas = germinacionSeisFasesCompletas;
  global.hcGerminacionBloqueada = hcGerminacionBloqueada;
  global.hcSincronizarUiInstalacionActiva = hcSincronizarUiInstalacionActiva;
  global.checklistCierreGermOk = checklistCierreGermOk;
  global.hcCaminoEsSemilla = hcCaminoEsSemilla;
  global.hcCaminoRequiereConfigHidroPendiente = hcCaminoRequiereConfigHidroPendiente;
  global.hidroInstalacionCerrada = hidroInstalacionCerrada;
  global.germinacionListaParaConfigHidro = germinacionListaParaConfigHidro;
  global.depositoListo = depositoListo;
  global.persistCaminoToConfig = persistCaminoToConfig;
  global.hcClearSetupSalaPreGermFlags = hcClearSetupSalaPreGermFlags;
  global.hcPropagadorAsistenteGermPendiente = hcPropagadorAsistenteGermPendiente;
  global.hcForzarSetupPaginaCamino = hcForzarSetupPaginaCamino;
  global.abrirSetupCaminoPropagador = abrirSetupCaminoPropagador;
  global.abrirSetupFaseSala = abrirSetupFaseSala;
  global.abrirConfiguradorEquipamientoSalaPropagador = abrirConfiguradorEquipamientoSalaPropagador;
  global.abrirSetupFaseHidro = abrirSetupFaseHidro;
  global.getSetupUltimoPasoIndice = getSetupUltimoPasoIndice;
  global.getSetupSkippedPagesForCamino = getSetupSkippedPagesForCamino;
  global.getSetupSkippedPagesForSalaPreGerm = getSetupSkippedPagesForSalaPreGerm;
  global.hcSalaPreGermPermitida = hcSalaPreGermPermitida;
  global.hcRestaurarCfgCaminoGerminacionTrasSetupSala = hcRestaurarCfgCaminoGerminacionTrasSetupSala;
  global.hcMontajeEsSoloEquipamientoSala = hcMontajeEsSoloEquipamientoSala;
  global.hcCultivoMatrizDisponible = hcCultivoMatrizDisponible;
  global.cultivoMatrizListo = cultivoMatrizListo;
  global.hcSugerirGeometriaDesdeGerminacion = hcSugerirGeometriaDesdeGerminacion;
  global.hcAplicarGeometriaSugeridaGerminacion = hcAplicarGeometriaSugeridaGerminacion;
  global.hcInicializarTorreGerminacionPropagador = hcInicializarTorreGerminacionPropagador;
  global.hcAjustarTorrePropagadorSemillas = hcAjustarTorrePropagadorSemillas;
  global.hcPropagadorTorreNecesitaAjuste = hcPropagadorTorreNecesitaAjuste;
  global.hcRepararSemillasPropagadorAlCargar = hcRepararSemillasPropagadorAlCargar;
  global.hcSyncGerminacionPlanCultivo = hcSyncGerminacionPlanCultivo;
  global.hcDimsTorreDesdeConfig = hcDimsTorreDesdeConfig;
  global.hcNumSemillasGermConfig = hcNumSemillasGermConfig;
  global.hcAplicarGerminacionATorreTrasHidro = hcAplicarGerminacionATorreTrasHidro;
  global.getCaminoResumenPasos = getCaminoResumenPasos;
  global.renderCaminoResumenHtml = renderCaminoResumenHtml;
  global.refreshDashCaminoResumen = refreshDashCaminoResumen;
  global.inferCaminoFromOrigen = inferCaminoFromOrigen;
})(typeof window !== 'undefined' ? window : this);
