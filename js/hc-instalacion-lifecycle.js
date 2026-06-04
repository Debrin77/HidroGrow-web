/**
 * Estado de instalación: configurar → montaje → cultivo → primer llenado → operativa diaria.
 * Gates UX y hub en Inicio.
 */
(function (global) {
  'use strict';

  var PASOS = [
    { id: 'config', label: 'Configurar', chip: '1 · Instalación' },
    { id: 'montaje', label: 'Montaje de sala', chip: '2 · Montaje' },
    { id: 'cultivo', label: 'Cultivo en matriz', chip: '3 · Cultivo' },
    { id: 'deposito', label: 'Primer llenado', chip: '4 · Depósito' },
  ];

  function cfgActiva() {
    return (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
  }

  function instalacionEstaConfigurada(cfg) {
    if (!cfg || typeof cfg !== 'object') return false;
    if (cfg.hcPlantillaAutogenerada) return false;
    if (cfg.hcSetupFase === 'germinacion' && cfg.caminoCultivo) return true;
    if (cfg.checklistInstalacionConfirmada === true) return true;
    if (
      typeof checklistInstalacionCompletaParaRecarga === 'function' &&
      checklistInstalacionCompletaParaRecarga()
    ) {
      return true;
    }
    return !!(cfg.nutriente && cfg.tipoInstalacion);
  }

  function montajeEstaVerificado(cfg) {
    return !!(cfg && cfg.puestaMarchaChecks && cfg.puestaMarchaChecks.completedAt);
  }

  function cultivoEstaAsignado() {
    if (
      typeof hcCultivoMatrizDisponible === 'function' &&
      !hcCultivoMatrizDisponible(cfgActiva())
    ) {
      return false;
    }
    if (typeof torreTieneAlgunaVariedadAsignada !== 'function' || !torreTieneAlgunaVariedadAsignada()) {
      return false;
    }
    if (
      typeof torreBloqueaChecklistPorFaltaDatosCultivo === 'function' &&
      torreBloqueaChecklistPorFaltaDatosCultivo()
    ) {
      return false;
    }
    return true;
  }

  function depositoPrimerLlenadoOk(cfg, st) {
    cfg = cfg || cfgActiva();
    st = st || (typeof state !== 'undefined' ? state : {});
    if (cfg && cfg.instalacionPrimerLlenadoAt) return true;
    if (st && st.ultimaRecarga) return true;
    if (st && Array.isArray(st.recargasLocal) && st.recargasLocal.length > 0) return true;
    if (st && Array.isArray(st.registro) && st.registro.some(function (r) { return r && r.tipo === 'recarga'; })) {
      return true;
    }
    return false;
  }

  function instalacionGuidadaActiva() {
    if (typeof state === 'undefined' || !state) return false;
    if (state.hcInstalacionGuidadaDismissed) return false;
    if (state.hcPostSetupChecklistPendiente) return true;
    if (state.hcInstalacionGuidadaActiva) return true;
    var lc = getInstalacionLifecycle();
    return lc.fase !== 'operativa' && lc.fase !== 'sin_config' && !lc.legacyOperativa;
  }

  function getInstalacionLifecycle(cfgOpt, stateOpt) {
    var cfg = cfgOpt || cfgActiva();
    var st = stateOpt || (typeof state !== 'undefined' ? state : {});
    var legacy = depositoPrimerLlenadoOk(cfg, st);
    var pasos = PASOS.map(function (p) {
      return { id: p.id, label: p.label, chip: p.chip, done: false, current: false, blocked: false };
    });
    var fase = 'sin_config';
    var pasoIdx = 0;

    if (!instalacionEstaConfigurada(cfg)) {
      fase = 'sin_config';
      pasos[0].current = true;
    } else if (legacy) {
      fase = 'operativa';
      pasos.forEach(function (p) { p.done = true; });
      pasoIdx = 4;
    } else if (
      typeof hcCultivoMatrizDisponible === 'function' &&
      !hcCultivoMatrizDisponible(cfg)
    ) {
      pasos[0].done = true;
      if (montajeEstaVerificado(cfg)) {
        pasos[1].done = true;
      } else {
        pasos[1].current = true;
      }
      pasos[2].blocked = true;
      pasos[3].blocked = true;
      var sigCam =
        typeof hcSiguientePasoInstalacion === 'function'
          ? hcSiguientePasoInstalacion(cfg)
          : null;
      fase = 'germinacion';
      if (sigCam && sigCam.etapa === 'sala_config') fase = 'montaje_pendiente';
      else if (sigCam && sigCam.etapa === 'sala_montaje') fase = 'montaje_pendiente';
      else if (sigCam && sigCam.etapa === 'hidro_config') fase = 'montaje_pendiente';
      pasoIdx = montajeEstaVerificado(cfg) ? 1 : 1;
    } else {
      pasos[0].done = true;
      if (!montajeEstaVerificado(cfg)) {
        fase = 'montaje_pendiente';
        pasoIdx = 1;
        pasos[1].current = true;
        pasos[2].blocked = true;
        pasos[3].blocked = true;
      } else {
        pasos[1].done = true;
        if (!cultivoEstaAsignado()) {
          fase = 'cultivo_pendiente';
          pasoIdx = 2;
          pasos[2].current = true;
          pasos[3].blocked = true;
        } else {
          pasos[2].done = true;
          if (!depositoPrimerLlenadoOk(cfg, st)) {
            fase = 'deposito_pendiente';
            pasoIdx = 3;
            pasos[3].current = true;
          } else {
            fase = 'operativa';
            pasos[3].done = true;
            pasoIdx = 4;
          }
        }
      }
    }

    var doneCount = pasos.filter(function (p) { return p.done; }).length;
    var porcentaje = legacy ? 100 : Math.round((doneCount / 4) * 100);

    return {
      fase: fase,
      pasos: pasos,
      pasoActual: pasoIdx,
      porcentaje: porcentaje,
      operativaDiaria: fase === 'operativa' || legacy,
      legacyOperativa: legacy,
      bloqueaChecklistDeposito: !legacy && fase !== 'operativa' && fase !== 'deposito_pendiente'
        ? true
        : !legacy && fase === 'deposito_pendiente' && !montajeEstaVerificado(cfg),
      esPrimeraInstalacion: !legacy,
      siguientePaso: getSiguientePaso(fase),
    };
  }

  /**
   * Paso único para rail, hub germ, Medir y bloqueos — evita CTAs divergentes.
   */
  function hcSiguientePasoInstalacion(cfgOpt, faseOpt) {
    var cfg = cfgOpt || cfgActiva();
    var fase =
      faseOpt ||
      (typeof getInstalacionLifecycle === 'function'
        ? getInstalacionLifecycle(cfg).fase
        : 'montaje_pendiente');
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';

    try {
      if (
        typeof propagadorMontajeCompleto === 'function' &&
        typeof hcGerminacionActiva === 'function' &&
        hcGerminacionActiva(cfg) &&
        !propagadorMontajeCompleto(cfg)
      ) {
        return {
          label:
            cam === 'semilla_hidro' ? 'Preparar germinación en hidro' : 'Montaje del propagador',
          action: 'irPropagadorMontaje',
          etapa: 'propagador',
        };
      }
      if (cam === 'semilla_hidro' && typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg)) {
        if (typeof propagadorMontajeCompleto === 'function' && !propagadorMontajeCompleto(cfg)) {
          return {
            label: 'Prep germinación en hidro',
            action: 'irPropagadorMontaje',
            etapa: 'prep_hidro',
          };
        }
        if (typeof salaPreGermConfigurada === 'function' && !salaPreGermConfigurada(cfg)) {
          return { label: 'Configurar sala', action: 'abrirSetupFaseSala', etapa: 'sala_config' };
        }
        if (typeof montajeSalaPreGermOk === 'function' && !montajeSalaPreGermOk(cfg)) {
          return { label: 'Montaje de sala', action: 'irMontaje', etapa: 'sala_montaje' };
        }
        if (
          cfg.tipoInstalacion !== 'dwc' &&
          cfg.tipoInstalacion !== 'rdwc' &&
          typeof abrirSetupFaseHidro === 'function'
        ) {
          return { label: 'Configurar DWC/RDWC', action: 'abrirSetupFaseHidro', etapa: 'hidro_config' };
        }
        if (typeof depositoListo === 'function' && !depositoListo(cfg)) {
          return {
            label: 'Primer llenado del depósito',
            action: 'abrirChecklist',
            etapa: 'deposito_llenado',
          };
        }
      }
      if (
        cam === 'semilla_propagador' &&
        typeof hcGerminacionActiva === 'function' &&
        hcGerminacionActiva(cfg) &&
        typeof propagadorMontajeCompleto === 'function' &&
        propagadorMontajeCompleto(cfg)
      ) {
        if (
          typeof germinacionConcluida === 'function' &&
          germinacionConcluida(cfg) &&
          typeof hcCaminoRequiereConfigHidroPendiente === 'function' &&
          hcCaminoRequiereConfigHidroPendiente(cfg)
        ) {
          return {
            label: 'Configurar DWC/RDWC (traslado)',
            action: 'abrirSetupFaseHidro',
            etapa: 'hidro_config',
          };
        }
        if (typeof germinacionConcluida === 'function' && germinacionConcluida(cfg)) {
          if (typeof salaPreGermConfigurada === 'function' && !salaPreGermConfigurada(cfg)) {
            return {
              label: 'Configurar sala (opcional)',
              action: 'abrirSetupFaseSala',
              etapa: 'sala_config',
            };
          }
          if (typeof montajeSalaPreGermOk === 'function' && !montajeSalaPreGermOk(cfg)) {
            return { label: 'Montaje de sala', action: 'irMontaje', etapa: 'sala_montaje' };
          }
        }
        return {
          label: 'Registro diario · propagador',
          action: 'irGerminacion',
          etapa: 'germinacion',
        };
      }
      if (
        typeof hcGerminacionActiva === 'function' &&
        hcGerminacionActiva(cfg) &&
        typeof propagadorMontajeCompleto === 'function' &&
        propagadorMontajeCompleto(cfg) &&
        cam !== 'semilla_hidro'
      ) {
        return {
          label: 'Control germinación (6 fases)',
          action: 'irGerminacion',
          etapa: 'germinacion',
        };
      }
      if (
        typeof hcCaminoRequiereConfigHidroPendiente === 'function' &&
        hcCaminoRequiereConfigHidroPendiente(cfg)
      ) {
        return {
          label: 'Configurar DWC/RDWC (Fase 2)',
          action: 'abrirSetupFaseHidro',
          etapa: 'hidro_config',
        };
      }
      if (
        typeof enraizadoMontajeCompleto === 'function' &&
        cam === 'esqueje_hidro' &&
        !enraizadoMontajeCompleto(cfg) &&
        montajeEstaVerificado(cfg)
      ) {
        return {
          label: 'Checklist de enraizado (esquejes)',
          action: 'irPropagadorMontaje',
          etapa: 'enraizado',
        };
      }
      if (
        typeof hcCaminoEsSemilla === 'function' &&
        hcCaminoEsSemilla(cam) &&
        !montajeEstaVerificado(cfg) &&
        (cfg.tipoInstalacion === 'dwc' || cfg.tipoInstalacion === 'rdwc')
      ) {
        return { label: 'Montaje de sala (sistema hidro)', action: 'irMontaje', etapa: 'montaje_hidro' };
      }
    } catch (_) {}

    switch (fase) {
      case 'sin_config':
        return { label: 'Configurar instalación', action: 'abrirSetup', etapa: 'config' };
      case 'montaje_pendiente': {
        var faseSis =
          typeof getSistemaFaseCamino === 'function' ? getSistemaFaseCamino(cfg) : null;
        if (faseSis === 'enraizado') {
          return { label: 'Enraizado · checklist', action: 'irPropagadorMontaje', etapa: 'enraizado' };
        }
        if (faseSis === 'madre') {
          return { label: 'Asignar madre', action: 'irCultivo', etapa: 'madre_fase' };
        }
        if (faseSis === 'prep_hidro' || faseSis === 'germ_cubo') {
          return { label: 'Ver pasos en Sistema', action: 'irSistemaFase', etapa: 'germinacion' };
        }
        if (cam === 'esqueje_hidro' && typeof enraizadoMontajeCompleto === 'function' && !enraizadoMontajeCompleto(cfg)) {
          return { label: 'Checklist de enraizado', action: 'irPropagadorMontaje', etapa: 'enraizado' };
        }
        return { label: 'Montaje de sala', action: 'irMontaje', etapa: 'montaje' };
      }
      case 'cultivo_pendiente':
        if (typeof hcCultivoMatrizDisponible === 'function' && !hcCultivoMatrizDisponible(cfg)) {
          return typeof hcSiguientePasoInstalacion === 'function'
            ? hcSiguientePasoInstalacion(cfg, 'germinacion')
            : { label: 'Continuar camino', action: 'irGerminacion', etapa: 'germinacion' };
        }
        return { label: 'Asignar cultivos en el esquema', action: 'irCultivo', etapa: 'cultivo' };
      case 'deposito_pendiente':
        return { label: 'Checklist del depósito (nutrientes)', action: 'abrirChecklist', etapa: 'deposito' };
      default:
        return { label: 'Rutina del día — Medir', action: 'irMedir', etapa: 'operativa' };
    }
  }

  function getSiguientePaso(fase) {
    return hcSiguientePasoInstalacion(cfgActiva(), fase);
  }

  function esc(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function mensajeBloqueoChecklistDeposito(lc) {
    lc = lc || getInstalacionLifecycle();
    if (!lc.esPrimeraInstalacion || lc.operativaDiaria) return null;
    var cfg = cfgActiva();
    if (
      typeof enraizadoMontajeCompleto === 'function' &&
      typeof getCaminoCultivo === 'function' &&
      getCaminoCultivo(cfg) === 'esqueje_hidro' &&
      !enraizadoMontajeCompleto(cfg)
    ) {
      return {
        titulo: 'Primero: enraizado de esquejes',
        texto:
          'Verifica el <strong>checklist de enraizado</strong> (domo, rockwool, higiene) antes del primer llenado del depósito.',
        cta: 'Checklist de enraizado',
        action: 'irPropagadorMontaje',
      };
    }
    if (
      typeof hcGerminacionActiva === 'function' &&
      hcGerminacionActiva(cfg) &&
      typeof germinacionListaParaConfigHidro === 'function' &&
      !germinacionListaParaConfigHidro(cfg)
    ) {
      var g = cfg.germinacionFlow;
      var faltaTraslado = g && !g.checklistTrasladoOk;
      return {
        titulo: faltaTraslado ? 'Checklist de traslado pendiente' : 'Primero: germinación (6 fases)',
        texto: faltaTraslado
          ? 'Marca el <strong>checklist de traslado</strong> en Inicio antes del depósito y del asistente DWC/RDWC.'
          : 'Completa el camino en <strong>Inicio</strong> (propagador → sala → 6 fases). ' +
            'El <strong>checklist del depósito</strong> va después de cerrar DWC/RDWC.',
        cta: faltaTraslado ? 'Ir a germinación' : 'Ir a germinación',
        action: 'irGerminacion',
      };
    }
    if (!montajeEstaVerificado(cfg)) {
      return {
        titulo: 'Primero: montaje de sala',
        texto:
          'Verifica el <strong>montaje de sala</strong> (equipamiento instalado y puesta en marcha) ' +
          'antes del <strong>checklist del depósito</strong> (nutrientes).',
        cta: 'Ir a montaje de sala',
        action: 'irMontaje',
      };
    }
    if (!cultivoEstaAsignado()) {
      var sinVar =
        typeof torreTieneAlgunaVariedadAsignada === 'function' && !torreTieneAlgunaVariedadAsignada();
      return {
        titulo: sinVar ? 'Checklist: primero define el cultivo' : 'Checklist: fechas de trasplante',
        texto: sinVar
          ? 'Indica <strong>variedad</strong> en cada cesta con planta antes del primer llenado del depósito.'
          : 'Completa la <strong>fecha de trasplante al hidro</strong> en las cestas con cultivo.',
        cta: 'Ir a Cultivo e instalación',
        action: 'irCultivo',
      };
    }
    return null;
  }

  function mostrarOverlayBloqueoDeposito(msg, opts) {
    opts = opts || {};
    if (!msg) return;
    var prev = document.getElementById('hcInstLifecycleBloqueoOverlay');
    if (prev) prev.remove();
    var o = document.createElement('div');
    o.id = 'hcInstLifecycleBloqueoOverlay';
    o.className = 'checklist-pregunta-overlay';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.setAttribute('aria-label', msg.titulo);
    var foot = opts.desdePostSetupRail
      ? '<p class="checklist-bloqueo-foot">Cierra este aviso y sigue el orden del panel de instalación.</p>'
      : '';
    o.innerHTML =
      '<div class="checklist-pregunta-sheet">' +
      '<div class="checklist-pregunta-handle"></div>' +
      '<div class="checklist-pregunta-head">' +
      '<div class="checklist-pregunta-emoji">📋</div>' +
      '<div><div class="checklist-pregunta-title">' + esc(msg.titulo) + '</div></div></div>' +
      '<p class="checklist-pregunta-nota-pasos">' + msg.texto + '</p>' + foot +
      '<div class="checklist-bloqueo-actions">' +
      '<button type="button" id="hcInstBloqueoCta" class="checklist-pregunta-btn-main">' + esc(msg.cta) + '</button>' +
      '</div>' +
      '<button type="button" id="hcInstBloqueoCerrar" class="checklist-pregunta-btn-later">Cerrar</button>' +
      '</div>';
    document.body.appendChild(o);
    if (typeof a11yDialogOpened === 'function') a11yDialogOpened(o);
    var cerrar = function () {
      try { if (typeof a11yDialogClosed === 'function') a11yDialogClosed(o); } catch (_) {}
      o.remove();
    };
    document.getElementById('hcInstBloqueoCerrar').addEventListener('click', cerrar);
    document.getElementById('hcInstBloqueoCta').addEventListener('click', function () {
      cerrar();
      hcEjecutarAccionInstalacion(msg.action);
    });
  }

  function hcGateChecklistDeposito(opts) {
    opts = opts || {};
    var lc = getInstalacionLifecycle();
    if (!lc.esPrimeraInstalacion || lc.operativaDiaria) return true;
    var msg = mensajeBloqueoChecklistDeposito(lc);
    if (!msg) return true;
    if (opts.desdePostSetupRail && msg.action === 'irCultivo' && typeof mostrarChecklistBloqueadoCultivoSistema === 'function') {
      mostrarChecklistBloqueadoCultivoSistema({ desdeWizard: true, desdePostSetupRail: true });
      return false;
    }
    mostrarOverlayBloqueoDeposito(msg, opts);
    return false;
  }

  function hcIrMontajeSala() {
    try {
      if (typeof goTab === 'function') goTab('sala');
      if (typeof salaSubTab === 'function') salaSubTab('agua');
      else if (typeof goTabSala === 'function') goTabSala('agua');
    } catch (_) {}
    setTimeout(function () {
      try {
        if (typeof hcRefreshSalaTab === 'function') hcRefreshSalaTab({ force: true });
        else if (typeof hcRefreshPuestaMarchaUi === 'function') hcRefreshPuestaMarchaUi();
      } catch (_) {}
      var det = document.getElementById('sistemaMontajeChecksDetails');
      if (det) det.open = true;
      if (det && typeof det.scrollIntoView === 'function') {
        det.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 220);
  }

  function hcIrCultivoMatriz(desdePostSetup) {
    var cfg = cfgActiva();
    if (
      typeof hcCultivoMatrizDisponible === 'function' &&
      !hcCultivoMatrizDisponible(cfg)
    ) {
      if (typeof mostrarChecklistBloqueadoCultivoSistema === 'function') {
        mostrarChecklistBloqueadoCultivoSistema({ desdePostSetupRail: !!desdePostSetup });
      } else if (typeof abrirSetupFaseHidro === 'function') {
        abrirSetupFaseHidro();
      }
      return;
    }
    try {
      if (typeof goTab === 'function') goTab('sistema');
    } catch (_) {}
    setTimeout(function () {
      try {
        if (typeof setTorreInteraccionModo === 'function') {
          setTorreInteraccionModo('asignar', { skipTutorial: true, desdePostSetup: !!desdePostSetup });
        }
      } catch (_) {}
      try {
        if (typeof hcPreseleccionarVariedadAssignPostSetup === 'function') hcPreseleccionarVariedadAssignPostSetup();
      } catch (_) {}
      try {
        if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
      } catch (_) {}
      var torreWrap = document.querySelector('#tab-sistema .torre-container');
      if (torreWrap && typeof torreWrap.scrollIntoView === 'function') {
        torreWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  }

  function hcIrRutinaDia() {
    if (typeof hcIrRutinaDiaOperativa === 'function') {
      hcIrRutinaDiaOperativa();
      return;
    }
    try {
      if (typeof goTab === 'function') goTab('mediciones');
    } catch (_) {}
  }

  function hcEjecutarAccionInstalacion(action) {
    switch (action) {
      case 'abrirSetup':
        if (typeof abrirSetup === 'function') abrirSetup();
        break;
      case 'irMontaje':
        hcIrMontajeSala();
        break;
      case 'irCultivo':
        hcIrCultivoMatriz(true);
        break;
      case 'abrirChecklist':
        if (typeof hcGateChecklistDeposito === 'function' && !hcGateChecklistDeposito({})) return;
        if (typeof abrirChecklist === 'function') abrirChecklist(false, { saltarPreguntaRuta: false });
        break;
      case 'irMedir':
        hcIrRutinaDia();
        break;
      case 'irSistemaFase':
        try {
          if (typeof goTab === 'function') goTab('sistema');
        } catch (_) {}
        setTimeout(function () {
          if (typeof hcRefreshSistemaFasePanel === 'function') hcRefreshSistemaFasePanel();
        }, 200);
        break;
      case 'irGerminacion':
        try {
          if (typeof goTab === 'function') goTab('inicio');
        } catch (_) {}
        setTimeout(function () {
          try {
            document.getElementById('dashGerminacionHub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } catch (_) {}
          if (typeof refreshDashGerminacionHub === 'function') refreshDashGerminacionHub();
        }, 200);
        break;
      case 'abrirSetupFaseSala':
        if (typeof abrirSetupFaseSala === 'function') abrirSetupFaseSala();
        break;
      case 'abrirSetupFaseHidro':
        if (typeof abrirSetupFaseHidro === 'function') abrirSetupFaseHidro();
        break;
      case 'irPropagadorMontaje':
        try {
          if (typeof goTab === 'function') goTab('inicio');
        } catch (_) {}
        setTimeout(function () {
          if (typeof hcOpenPropagadorMontajeChecklist === 'function') hcOpenPropagadorMontajeChecklist();
          else {
            try {
              document.getElementById('hcPropagadorMontajeInline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (_) {}
          }
        }, 200);
        break;
      default:
        break;
    }
  }

  function marcarDepositoPrimerLlenadoOk() {
    if (typeof state === 'undefined' || !state) return;
    if (!state.configTorre) state.configTorre = {};
    if (!state.configTorre.instalacionPrimerLlenadoAt) {
      state.configTorre.instalacionPrimerLlenadoAt = new Date().toISOString();
    }
    try {
      delete state.hcPostSetupChecklistPendiente;
      delete state.hcInstalacionGuidadaActiva;
    } catch (_) {}
    try {
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
      if (typeof saveState === 'function') saveState();
    } catch (_) {}
    refreshInstalacionLifecycleUi();
    try {
      if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
    } catch (_) {}
    try {
      if (typeof refreshMedirOperativaUi === 'function') refreshMedirOperativaUi();
    } catch (_) {}
    try {
      if (typeof avisarPrimeraMedicionOperativa === 'function') avisarPrimeraMedicionOperativa();
    } catch (_) {}
  }

  function activarInstalacionGuidadaPostSetup() {
    if (typeof state === 'undefined' || !state) return;
    try {
      state.hcInstalacionGuidadaActiva = true;
      state.hcPostSetupChecklistPendiente = true;
      delete state.hcInstalacionGuidadaDismissed;
    } catch (_) {}
  }

  function renderLifecycleTrack(pasos) {
    return pasos
      .map(function (p) {
        var cls = 'dash-inst-lifecycle-step';
        if (p.done) cls += ' dash-inst-lifecycle-step--done';
        else if (p.current) cls += ' dash-inst-lifecycle-step--current';
        else if (p.blocked) cls += ' dash-inst-lifecycle-step--blocked';
        return '<span class="' + cls + '" title="' + esc(p.label) + '">' + esc(p.chip.split(' · ')[1] || p.label) + '</span>';
      })
      .join('');
  }

  function refreshInstalacionLifecycleUi() {
    var lc = getInstalacionLifecycle();
    var box = document.getElementById('dashInstalacionLifecycle');
    var germAct = false;
    try {
      germAct = typeof hcGerminacionActiva === 'function' && hcGerminacionActiva();
    } catch (_) {}
    if (typeof refreshDashGerminacionHub === 'function') refreshDashGerminacionHub();
    if (typeof refreshDashCaminoResumen === 'function') refreshDashCaminoResumen();
    if (typeof refreshDashSalaEquipRecoBanner === 'function') refreshDashSalaEquipRecoBanner();
    var rutina = document.getElementById('dashRutinaDia');
    var pctEl = document.getElementById('dashInstLifecyclePct');
    var trackEl = document.getElementById('dashInstLifecycleTrack');
    var nextEl = document.getElementById('dashInstLifecycleNext');
    var ctaEl = document.getElementById('dashInstLifecycleCta');

    if (box) {
      var showInst = lc.fase !== 'operativa' && lc.fase !== 'sin_config';
      box.classList.toggle('setup-hidden', !showInst);
      if (showInst) {
        var pasoUnico =
          typeof hcSiguientePasoInstalacion === 'function'
            ? hcSiguientePasoInstalacion(cfgActiva(), lc.fase)
            : lc.siguientePaso;
        if (pctEl) pctEl.textContent = lc.porcentaje + '%';
        if (trackEl) trackEl.innerHTML = renderLifecycleTrack(lc.pasos);
        if (nextEl) {
          nextEl.innerHTML =
            'Siguiente: <strong>' + esc(pasoUnico.label) + '</strong>' +
            (germAct ? ' <span class="dash-inst-lifecycle-germ-hint">(también en el hub de germinación)</span>' : '');
        }
        if (ctaEl) {
          ctaEl.textContent = pasoUnico.label;
          ctaEl.onclick = function () {
            hcEjecutarAccionInstalacion(pasoUnico.action);
          };
        }
      }
    }

    refreshLegacyInstalacionBanner(lc);

    if (rutina) {
      var showRut = lc.operativaDiaria;
      rutina.classList.toggle('setup-hidden', !showRut);
      if (showRut) {
        var badge = document.getElementById('dashRutinaTareasBadge');
        var sub = document.getElementById('dashRutinaSub');
        try {
          if (typeof getEstadoControlSistema === 'function') {
            var est = getEstadoControlSistema();
            if (est && est.resumen && badge) {
              var tot = est.resumen.diarioTotal + est.resumen.semanalTotal;
              var ok = est.resumen.diarioOk + est.resumen.semanalOk;
              badge.textContent = ok + '/' + tot;
              badge.classList.toggle('medir-tareas-badge--ok', tot > 0 && ok >= tot);
              badge.classList.toggle('medir-tareas-badge--pend', tot > 0 && ok < tot);
              if (sub) {
                sub.textContent = tot > 0 && ok >= tot
                  ? 'Tareas completadas. Los valores en Medir alimentan calendario, historial y meteo.'
                  : 'Marca tareas en Medir, registra EC/pH (manual o IoT) y revisa el historial.';
              }
            }
          }
        } catch (_) {}
      }
    }

    try {
      if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
    } catch (_) {}
    try {
      if (typeof refreshMedirOperativaUi === 'function') refreshMedirOperativaUi();
    } catch (_) {}
  }

  function refreshLegacyInstalacionBanner(lc) {
    lc = lc || getInstalacionLifecycle();
    var host = document.getElementById('tab-inicio');
    if (!host) return;
    var prev = document.getElementById('hcLegacyInstalacionBanner');
    if (!lc.legacyOperativa) {
      if (prev) prev.remove();
      return;
    }
    if (prev) return;
    var ban = document.createElement('div');
    ban.id = 'hcLegacyInstalacionBanner';
    ban.className = 'setup-field-hint setup-field-hint--banner hc-legacy-inst-banner';
    ban.setAttribute('role', 'status');
    ban.innerHTML =
      '<strong>Instalación con historial previo.</strong> Detectamos recargas o datos guardados: el progreso guiado puede estar al 100 %. ' +
      'Revisa montaje y cultivos si acabas de reconfigurar.';
    var hub = document.getElementById('dashGerminacionHub');
    if (hub && !hub.classList.contains('setup-hidden')) {
      hub.insertAdjacentElement('beforebegin', ban);
    } else {
      host.insertBefore(ban, host.firstChild);
    }
  }

  function hcMostrarBannerSalaPostSetup(nombre, opts) {
    opts = opts && typeof opts === 'object' ? opts : {};
    var nom = String(nombre || '').trim();
    var titulo = nom ? '«' + nom + '» guardada' : 'Instalación guardada';
    var tab = document.getElementById('tab-sala');
    if (!tab) return;
    var prev = document.getElementById('hcSalaPostSetupBanner');
    if (prev) prev.remove();
    var ban = document.createElement('div');
    ban.id = 'hcSalaPostSetupBanner';
    ban.className = 'setup-field-hint setup-field-hint--banner hc-sala-post-setup-banner';
    ban.setAttribute('role', 'status');
    var cfgBan = cfgActiva();
    var germBan = !!opts.faseGerm || (typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfgBan));
    var cam = String(opts.camino || (typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfgBan) : ''));
    var cuerpo = 'Checklist de montaje abajo.';
    if (germBan && cam === 'semilla_propagador') {
      cuerpo =
        'La sala se configura <strong>después de las 6 fases</strong>. Ahora: checklist del propagador en Inicio.';
    } else if (germBan && cam === 'semilla_hidro') {
      cuerpo =
        'Tras el prep hidro: <strong>configura la sala</strong> aquí y el montaje antes de las 6 fases.';
    } else if (germBan) {
      cuerpo = 'Verifica montaje de sala; luego las <strong>6 fases</strong> en Inicio.';
    }
    ban.innerHTML = '<strong>✅ ' + esc(titulo) + '</strong> ' + cuerpo;
    var intro = tab.querySelector('.medir-sala-intro');
    if (intro) intro.insertAdjacentElement('afterend', ban);
    else tab.insertBefore(ban, tab.firstChild);
  }

  function iniciarFlujoInstalacionPostSetup() {
    activarInstalacionGuidadaPostSetup();
    var cfgGerm = cfgActiva();
    if (typeof window !== 'undefined' && window._hcSalaPreGermRecienGuardada) {
      try {
        delete window._hcSalaPreGermRecienGuardada;
      } catch (_) {}
      setTimeout(function () {
        try {
          if (typeof goTab === 'function') goTab('sala');
        } catch (_) {}
        setTimeout(function () {
          try {
            var det = document.getElementById('sistemaMontajeChecksDetails');
            if (det) det.open = true;
            if (typeof hcOpenPuestaMarchaChecklist === 'function') hcOpenPuestaMarchaChecklist();
          } catch (_) {}
          if (typeof showToast === 'function') {
            showToast(
              'Montaje de sala (carpa, luz, aire). Sin sistema hidro ni asignar cestas hasta el asistente DWC/RDWC.',
              false,
              { durationMs: 7200, prominent: true }
            );
          }
          refreshInstalacionLifecycleUi();
          try {
            if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
          } catch (_) {}
        }, 420);
      }, 300);
      return;
    }
    if (cfgGerm.hcSetupFase === 'germinacion') {
      var camGerm =
        typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfgGerm) : '';
      var propagadorTrasSetup =
        camGerm === 'semilla_propagador' &&
        typeof window !== 'undefined' &&
        window._hcPropagadorChecklistTrasSetup;
      var delayEntrada = propagadorTrasSetup ? 0 : 300;
      setTimeout(function () {
        var modalProp = document.getElementById('modalPropagadorMontaje');
        var checklistYaAbierto = !!(modalProp && modalProp.classList.contains('open'));
        var abrirCheck =
          !checklistYaAbierto &&
          typeof propagadorMontajeCompleto === 'function' &&
          !propagadorMontajeCompleto(cfgGerm) &&
          typeof hcOpenPropagadorMontajeChecklist === 'function';
        if (abrirCheck) {
          hcOpenPropagadorMontajeChecklist();
          checklistYaAbierto = true;
        }
        if (
          camGerm === 'semilla_propagador' &&
          checklistYaAbierto &&
          typeof hcIrHubGerminacionOperativa !== 'function'
        ) {
          try {
            if (typeof goTab === 'function') goTab('inicio');
          } catch (_) {}
        }
        setTimeout(function () {
          if (camGerm === 'semilla_propagador' && checklistYaAbierto) {
            /* El usuario cierra el checklist; la navegación la hace hcFinishPropagadorMontaje. */
          } else if (camGerm === 'semilla_propagador' && typeof hcIrHubGerminacionOperativa === 'function') {
            hcIrHubGerminacionOperativa({ sinScroll: true });
          } else if (camGerm !== 'semilla_hidro') {
            try {
              if (typeof goTab === 'function') goTab('inicio');
              document.getElementById('dashGerminacionHub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (_) {}
            if (typeof refreshDashGerminacionHub === 'function') refreshDashGerminacionHub();
          }
          refreshInstalacionLifecycleUi();
          try {
            if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
          } catch (_) {}
          try {
            if (typeof refreshTabsOperativaCamino === 'function') refreshTabsOperativaCamino();
          } catch (_) {}
          if (propagadorTrasSetup && !checklistYaAbierto) {
            try {
              if (typeof updateDashboard === 'function') updateDashboard();
            } catch (_) {}
          }
          try {
            delete window._hcPropagadorChecklistTrasSetup;
          } catch (_) {}
        }, propagadorTrasSetup ? 80 : camGerm === 'semilla_hidro' ? 120 : 280);
      }, delayEntrada);
      return;
    }
    setTimeout(function () {
      try {
        if (typeof hcRefreshSalaTab === 'function') hcRefreshSalaTab({ force: true });
        else if (typeof hcRefreshPuestaMarchaUi === 'function') hcRefreshPuestaMarchaUi();
      } catch (_) {}
      hcIrMontajeSala();
      setTimeout(function () {
        try {
          if (typeof salaSubTab === 'function') salaSubTab('agua');
          if (typeof hcRefreshPuestaMarchaUi === 'function') hcRefreshPuestaMarchaUi();
          var det = document.getElementById('sistemaMontajeChecksDetails');
          if (det) det.open = true;
          if (typeof hcOpenPuestaMarchaChecklist === 'function') hcOpenPuestaMarchaChecklist();
        } catch (_) {}
        refreshInstalacionLifecycleUi();
        try {
          if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
        } catch (_) {}
      }, 420);
    }, 300);
  }

  global.hcSiguientePasoInstalacion = hcSiguientePasoInstalacion;
  global.getInstalacionLifecycle = getInstalacionLifecycle;
  global.instalacionGuidadaActiva = instalacionGuidadaActiva;
  global.hcGateChecklistDeposito = hcGateChecklistDeposito;
  global.hcIrMontajeSala = hcIrMontajeSala;
  global.hcIrCultivoMatriz = hcIrCultivoMatriz;
  global.hcIrRutinaDia = hcIrRutinaDia;
  global.hcEjecutarAccionInstalacion = hcEjecutarAccionInstalacion;
  global.marcarDepositoPrimerLlenadoOk = marcarDepositoPrimerLlenadoOk;
  global.activarInstalacionGuidadaPostSetup = activarInstalacionGuidadaPostSetup;
  global.refreshInstalacionLifecycleUi = refreshInstalacionLifecycleUi;
  global.iniciarFlujoInstalacionPostSetup = iniciarFlujoInstalacionPostSetup;
  global.hcMostrarBannerSalaPostSetup = hcMostrarBannerSalaPostSetup;
  global.depositoPrimerLlenadoOk = depositoPrimerLlenadoOk;

  /** Montaje editable hasta completar primer llenado del depósito (mezcla hidropónica). */
  function montajePuedeEditarse(cfgOpt, stateOpt) {
    return !depositoPrimerLlenadoOk(cfgOpt, stateOpt);
  }

  global.montajePuedeEditarse = montajePuedeEditarse;
})(typeof window !== 'undefined' ? window : globalThis);
