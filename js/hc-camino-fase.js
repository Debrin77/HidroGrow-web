/**
 * Fase operativa por camino: proceso propio, resultado común (cultivo en casa).
 * null = esquema DWC/RDWC completo en Sistema.
 */
(function (global) {
  'use strict';

  var FASE_UI = {
    propagador: {
      tituloTab: 'Propagador',
      tituloPanel: 'Sistema · propagador',
      icon: '🫧',
      bodyClass: 'hc-modo-fase-propagador',
    },
    prep_hidro: {
      tituloTab: 'Prep hidro',
      tituloPanel: 'Sistema · preparación hidro',
      icon: '💧',
      bodyClass: 'hc-modo-fase-prep-hidro',
    },
    germ_cubo: {
      tituloTab: 'Germinación en cubo',
      tituloPanel: 'Sistema · germinación en cubo',
      icon: '🌱',
      bodyClass: 'hc-modo-fase-germ-cubo',
    },
    enraizado: {
      tituloTab: 'Enraizado',
      tituloPanel: 'Sistema · enraizado de esquejes',
      icon: '🌿',
      bodyClass: 'hc-modo-fase-enraizado',
    },
    madre: {
      tituloTab: 'Cubo madre',
      tituloPanel: 'Sistema · planta madre',
      icon: '👑',
      bodyClass: 'hc-modo-fase-madre',
    },
  };

  function cfgActiva() {
    return typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
  }

  function cam(cfg) {
    return typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
  }

  function prepGermHidroListo(cfg) {
    return typeof propagadorMontajeCompleto === 'function' && propagadorMontajeCompleto(cfg);
  }

  function salaConfiguradaCamino(cfg) {
    if (typeof salaPreGermConfigurada === 'function' && salaPreGermConfigurada(cfg)) {
      return true;
    }
    var p = cfg.premiumSetup || {};
    if (Number(p.anchoM) > 0 && Number(p.largoM) > 0) return true;
    if (Number(cfg.growRoomAnchoM) > 0 && Number(cfg.growRoomLargoM) > 0) return true;
    var inst = cfg.equipamientoInstalado || {};
    return Object.keys(inst).some(function (k) {
      return inst[k] && (inst[k].marca || inst[k].id);
    });
  }

  function montajeSalaOkCamino(cfg) {
    if (typeof montajeSalaPreGermOk === 'function' && montajeSalaPreGermOk(cfg)) {
      return true;
    }
    if (typeof montajeVerificacionVigente === 'function' && montajeVerificacionVigente(cfg)) {
      return true;
    }
    return !!(cfg.puestaMarchaChecks && cfg.puestaMarchaChecks.completedAt);
  }

  function salaLista(cfg) {
    return salaConfiguradaCamino(cfg) && montajeSalaOkCamino(cfg);
  }

  function hidroCerrado(cfg) {
    return typeof hidroInstalacionCerrada === 'function' && hidroInstalacionCerrada(cfg);
  }

  /**
   * Semilla_hidro en operativa plena (germinación cerrada en matriz): ocultar paneles de onboarding duplicados.
   */
  function hcSemillaHidroPostAsistenteUi(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) !== 'semilla_hidro') return false;
    if (!hidroCerrado(cfg) || !prepGermHidroListo(cfg)) return false;
    var g = cfg.germinacionFlow;
    if (g && g.trasladoAt) return true;
    if (typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg)) return false;
    if (typeof germChecklistCierreOk === 'function' && g && germChecklistCierreOk(g)) return true;
    return false;
  }

  /** Hub germinación activo: ocultar rails duplicados (lifecycle, resumen camino). */
  function hcSemillaHidroHubEsPrincipal(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) !== 'semilla_hidro') return false;
    return typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg);
  }

  /**
   * Asistente semilla_hidro cerrado (prep + sala + montaje + hidro + depósito): UI operativa sin onboarding.
   */
  function hcSemillaHidroUiOperativaLista(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) !== 'semilla_hidro') return false;
    return (
      prepGermHidroListo(cfg) &&
      salaLista(cfg) &&
      hidroCerrado(cfg) &&
      depListo(cfg)
    );
  }

  /** Medir unificado: semilla_hidro con DWC cerrado en asistente. */
  function hcMedirEsSemillaHidro(cfg) {
    cfg = cfg || cfgActiva();
    return cam(cfg) === 'semilla_hidro' && hidroCerrado(cfg);
  }

  /** Ocultar seguimiento clásico / tareas en Medir (germinación en cubo usa flujo directo). */
  function hcSemillaHidroOcultarSeguimientoMedir(cfg) {
    cfg = cfg || cfgActiva();
    if (hcMedirEsSemillaHidro(cfg)) return true;
    if (hcSemillaHidroUiOperativaLista(cfg)) return true;
    if (!hcSemillaHidroPostAsistenteUi(cfg)) return false;
    try {
      if (typeof getInstalacionLifecycle === 'function') {
        var lc = getInstalacionLifecycle(cfg);
        if (lc && lc.operativaDiaria) return true;
      }
    } catch (_) {}
    return true;
  }

  /** Filas × cestas reales del DWC/RDWC (no matriz 1×N del propagador). */
  function hcGeomTorreFilasCestas(cfg) {
    cfg = cfg || cfgActiva();
    var tipo =
      typeof tipoInstalacionNormalizado === 'function'
        ? tipoInstalacionNormalizado(cfg)
        : cfg.tipoInstalacion || 'dwc';
    var filas = 1;
    var cestas = 1;
    if (typeof state !== 'undefined' && state && state.torre && state.torre.length) {
      filas = state.torre.length;
      cestas = (state.torre[0] && state.torre[0].length) || 1;
    }
    if (hidroCerrado(cfg)) {
      var gf = parseInt(String(cfg.hcDwcGeomFilas || 0), 10);
      var gc = parseInt(String(cfg.hcDwcGeomCestas || 0), 10);
      if (gf > 1 && gc > 1) {
        filas = gf;
        cestas = gc;
      } else {
        var niv = parseInt(String(cfg.numNiveles || 0), 10);
        var ces = parseInt(String(cfg.numCestas || 0), 10);
        if (niv > 1 || (niv === 1 && ces > 1 && !cfg.germinacionEnPropagador)) {
          filas = Math.max(1, niv);
          cestas = Math.max(1, ces);
        } else if (filas > 1 || cestas > 1) {
          cfg.numNiveles = filas;
          cfg.numCestas = cestas;
        }
      }
    } else {
      filas = Math.max(1, parseInt(String(cfg.numNiveles || filas), 10) || filas);
      cestas = Math.max(1, parseInt(String(cfg.numCestas || cestas), 10) || cestas);
    }
    if (tipo === 'rdwc') {
      filas = Math.max(1, parseInt(String(cfg.rdwcRows || filas), 10) || filas);
      cestas = Math.max(1, parseInt(String(cfg.rdwcSites || cestas), 10) || cestas);
      return {
        filas: filas,
        cestas: cestas,
        label: filas + ' filas × ' + cestas + ' módulos',
      };
    }
    if (
      tipo === 'dwc' &&
      typeof dwcGetOxigenacionDiseno === 'function' &&
      dwcGetOxigenacionDiseno(cfg) === 'cubos_independientes'
    ) {
      var nCubos =
        typeof dwcGetNumCubosIndependientes === 'function'
          ? dwcGetNumCubosIndependientes(cfg)
          : filas * cestas;
      return { filas: filas, cestas: cestas, label: nCubos + ' cubo' + (nCubos === 1 ? '' : 's') };
    }
    var unidad = hidroCerrado(cfg) ? 'cestas' : 'macetas';
    return {
      filas: filas,
      cestas: cestas,
      label: filas + ' filas × ' + cestas + ' ' + unidad,
    };
  }

  function depListo(cfg) {
    return typeof depositoListo === 'function' && depositoListo(cfg);
  }

  function matrizLista() {
    if (typeof cultivoMatrizListo === 'function') return cultivoMatrizListo();
    return false;
  }

  /**
   * @returns {null|'propagador'|'prep_hidro'|'germ_cubo'|'enraizado'|'madre'}
   */
  function getSistemaFaseCamino(cfg) {
    cfg = cfg || cfgActiva();
    var c = cam(cfg);

    if (c === 'semilla_propagador') {
      if (
        typeof hidrogrowPropagadorEnFaseGermSinHidro === 'function' &&
        hidrogrowPropagadorEnFaseGermSinHidro(cfg)
      ) {
        return 'propagador';
      }
      if (!hidroCerrado(cfg)) return 'propagador';
      return null;
    }

    if (c === 'semilla_hidro') {
      if (!prepGermHidroListo(cfg)) return 'prep_hidro';
      if (!salaLista(cfg)) return 'prep_hidro';
      if (!hidroCerrado(cfg)) return 'prep_hidro';
      if (!depListo(cfg)) return 'prep_hidro';
      if (typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg)) {
        return 'germ_cubo';
      }
      var g = cfg.germinacionFlow;
      if (
        g &&
        !g.trasladoAt &&
        typeof germinacionConcluida === 'function' &&
        germinacionConcluida(cfg) &&
        !g.checklistTrasladoOk
      ) {
        return 'germ_cubo';
      }
      return null;
    }

    if (c === 'esqueje_hidro') {
      if (typeof enraizadoMontajeCompleto === 'function' && !enraizadoMontajeCompleto(cfg)) {
        return 'enraizado';
      }
      if (!matrizLista()) return 'enraizado';
      return null;
    }

    if (c === 'madre_hidro') {
      if (!matrizLista()) return 'madre';
      if (!depListo(cfg)) return 'madre';
      return null;
    }

    return null;
  }

  function hcMostrarSistemaFaseCamino(cfg) {
    return !!getSistemaFaseCamino(cfg || cfgActiva());
  }

  /**
   * Panel fase (prep/germ) sí; esquema DWC/RDWC no debe bloquearse en semilla_hidro operativa.
   */
  function hcRenderTorreBloqueadoPorFaseCamino(cfg) {
    cfg = cfg || cfgActiva();
    var fase = getSistemaFaseCamino(cfg);
    if (!fase) return false;
    if (cam(cfg) === 'semilla_hidro' && hidroCerrado(cfg)) return false;
    return true;
  }

  function hcMostrarSistemaPropagador(cfg) {
    return getSistemaFaseCamino(cfg) === 'propagador';
  }

  /** Semilla + propagador: sin bloques de depósito DWC/RDWC hasta cerrar el asistente hidro. */
  function hcSistemaPropagadorSinHidro(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) !== 'semilla_propagador') return false;
    return !hidroCerrado(cfg);
  }

  function hcTituloSistemaTab(cfg) {
    var f = getSistemaFaseCamino(cfg);
    if (!f || !FASE_UI[f]) return 'Cultivo e instalación';
    return FASE_UI[f].tituloTab;
  }

  function hcOperativaFaseCamino(cfg) {
    return hcMostrarSistemaFaseCamino(cfg);
  }

  function hcOperativaFasePropagadorGerm(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) !== 'semilla_propagador') return false;
    return hcMostrarSistemaFaseCamino(cfg);
  }

  /** Subtítulo del banner «Instalación seleccionada» en Inicio (sin L ni nutriente de depósito). */
  function hcDashUsaTilesGerminacion(cfg) {
    cfg = cfg || cfgActiva();
    if (hcMostrarSistemaPropagador(cfg)) return true;
    if (getSistemaFaseCamino(cfg) === 'germ_cubo') return true;
    if (typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg)) return true;
    return false;
  }

  function numSemillasCaminoGerm(cfg) {
    cfg = cfg || cfgActiva();
    if (typeof hcNumSemillasGermConfig === 'function') {
      var nCfg = hcNumSemillasGermConfig(cfg);
      if (nCfg >= 1) return nCfg;
    }
    if (typeof getPlanGermEstado === 'function') {
      var st = getPlanGermEstado(cfg);
      if (st.numSemillas >= 1) return Math.round(st.numSemillas);
    }
    return 0;
  }

  function etiquetaFaseGermCorta(cfg) {
    cfg = cfg || cfgActiva();
    var faseId =
      typeof hcGerminacionFaseActualId === 'function' ? hcGerminacionFaseActualId(cfg) : 'semilla';
    var esHidro = cam(cfg) === 'semilla_hidro';
    var map = {
      semilla: 'Fase semilla',
      taproot: 'Radícula',
      rockwool: 'Cubo lana',
      domo: esHidro ? 'Cúpula + luz' : 'Domo + luz',
      netpot: 'Net pot',
      dwc: esHidro ? 'Matriz' : 'Traslado hidro',
    };
    return map[faseId] || faseId;
  }

  /**
   * Resumen para «Mis instalaciones» y picker (no mostrar DWC/filas×cubos en propagador).
   * @returns {null|{ tipoLabel, plantasLabel, geomLabel, iconEmoji }}
   */
  function hcMetaListaInstalacionTorre(cfg, torreSlot) {
    cfg = cfg || (torreSlot && torreSlot.config) || cfgActiva();
    var c = cam(cfg);
    var def = typeof getCaminoDef === 'function' ? getCaminoDef(c) : null;
    var fase = typeof getSistemaFaseCamino === 'function' ? getSistemaFaseCamino(cfg) : null;

    if (fase === 'propagador') {
      var nSem = numSemillasCaminoGerm(cfg);
      var geom = [];
      if (nSem >= 1) {
        geom.push(nSem + (nSem === 1 ? ' semilla' : ' semillas'));
      } else {
        geom.push('Plan de semillas pendiente');
      }
      if (typeof getPlanGermEstado === 'function') {
        var st = getPlanGermEstado(cfg);
        if (st.nombreVar) geom.push(st.nombreVar);
        if (st.sustrato) {
          var subLbl =
            typeof etiquetaSustratoGerm === 'function'
              ? etiquetaSustratoGerm(st.sustrato)
              : st.sustrato;
          if (subLbl) geom.push(subLbl);
        }
      }
      geom.push(etiquetaFaseGermCorta(cfg));
      return {
        tipoLabel: (def && def.short) || 'Propagador',
        plantasLabel: nSem >= 1 ? nSem + (nSem === 1 ? ' semilla' : ' semillas') : 'Sin semillas en plan',
        geomLabel: geom.join(' · '),
        iconTipo: 'propagador',
      };
    }

    if (fase === 'germ_cubo') {
      var nCubo = numSemillasCaminoGerm(cfg) || 1;
      var geomCubo =
        cam(cfg) === 'semilla_hidro' && hidroCerrado(cfg)
          ? hcGeomTorreFilasCestas(cfg).label
          : 'Semilla en hidro · ' + etiquetaFaseGermCorta(cfg);
      return {
        tipoLabel: 'Germinación en cubo',
        plantasLabel: nCubo + (nCubo === 1 ? ' cubo' : ' cubos'),
        geomLabel: geomCubo,
        iconTipo: 'germ_cubo',
      };
    }

    if (fase === 'prep_hidro') {
      var pend = [];
      if (!prepGermHidroListo(cfg)) pend.push('prep hidro');
      if (!salaLista(cfg)) pend.push('sala');
      if (!hidroCerrado(cfg)) pend.push('DWC/RDWC');
      return {
        tipoLabel: (def && def.short) || 'Prep hidro',
        plantasLabel: numSemillasCaminoGerm(cfg) >= 1 ? numSemillasCaminoGerm(cfg) + ' semillas' : 'Germinación',
        geomLabel: pend.length ? 'Pendiente: ' + pend.join(', ') : 'Preparación',
        iconTipo: 'prep_hidro',
      };
    }

    if (fase === 'enraizado') {
      return {
        tipoLabel: 'Enraizado',
        plantasLabel: 'Esquejes',
        geomLabel: 'Domo de clones · checklist en curso',
        iconEmoji: '🌿',
      };
    }

    if (fase === 'madre') {
      return {
        tipoLabel: 'Madre',
        plantasLabel: '1 madre',
        geomLabel: hidroCerrado(cfg) ? 'Cubo madre en sistema' : 'Configuración en curso',
        iconTipo: 'madre',
      };
    }

    return null;
  }

  var DASH_TORRE_CULTIVO_LABELS_DEFAULT = [
    'Plantas',
    'Días media',
    'Cosechar',
    'Días cosecha',
  ];

  function hcGuardarDashTorreCultivoLabelsDefault() {
    var summary = document.querySelector('.dash-medicion-y-cultivo .torre-summary');
    if (!summary || summary.dataset.hcDashLabelsSaved === '1') return;
    var labels = summary.querySelectorAll('.torre-mini-label');
    for (var i = 0; i < labels.length && i < DASH_TORRE_CULTIVO_LABELS_DEFAULT.length; i++) {
      labels[i].dataset.hcDefaultLabel = labels[i].textContent;
    }
    var titleEl = summary.querySelector('.card-title');
    if (titleEl) titleEl.dataset.hcDefaultHtml = titleEl.innerHTML;
    summary.dataset.hcDashLabelsSaved = '1';
  }

  function hcRestaurarDashTorreCultivoLabelsDefault() {
    var summary = document.querySelector('.dash-medicion-y-cultivo .torre-summary');
    if (!summary || summary.dataset.hcDashLabelsSaved !== '1') return;
    var labels = summary.querySelectorAll('.torre-mini-label');
    labels.forEach(function (el) {
      if (el.dataset.hcDefaultLabel) el.textContent = el.dataset.hcDefaultLabel;
    });
    var titleEl = summary.querySelector('.card-title');
    if (titleEl && titleEl.dataset.hcDefaultHtml) titleEl.innerHTML = titleEl.dataset.hcDefaultHtml;
  }

  /** Inicio: bloque «Cultivo e instalación» con semillas/fase propagador (no ocultar ni dejar en 0 plantas). */
  function hcRefreshDashTorreCultivoResumen(cfg) {
    cfg = cfg || cfgActiva();
    var summary = document.querySelector('.dash-medicion-y-cultivo .torre-summary');
    if (!summary) return;
    if (
      typeof hcSistemaPropagadorSinHidro === 'function' &&
      hcSistemaPropagadorSinHidro(cfg) &&
      typeof hcDashGermHubVisibleEnInicio === 'function' &&
      hcDashGermHubVisibleEnInicio()
    ) {
      summary.classList.add('setup-hidden');
      return;
    }
    var usarGerm =
      typeof hcDashUsaTilesGerminacion === 'function' && hcDashUsaTilesGerminacion(cfg);
    var ocultarGermResumen =
      typeof hcSemillaHidroPostAsistenteUi === 'function' && hcSemillaHidroPostAsistenteUi(cfg);
    if (ocultarGermResumen) {
      summary.classList.add('setup-hidden');
      return;
    }
    summary.classList.remove('setup-hidden');
    if (!usarGerm) {
      summary.classList.remove('torre-summary--propagador');
      hcRestaurarDashTorreCultivoLabelsDefault();
      return;
    }
    try {
      if (typeof hcSyncGerminacionPlanCultivo === 'function') hcSyncGerminacionPlanCultivo(cfg);
    } catch (_) {}
    hcGuardarDashTorreCultivoLabelsDefault();
    summary.classList.add('torre-summary--propagador');
    var fase = getSistemaFaseCamino(cfg);
    var esProp = fase === 'propagador';
    var titleEl = summary.querySelector('.card-title');
    if (titleEl) {
      if (esProp) {
        titleEl.innerHTML =
          '<svg class="hc-ico hc-ico--title" aria-hidden="true" focusable="false"><use href="#hc-i-plant"/></svg> Germinación en propagador';
        summary.setAttribute('aria-label', 'Ir a propagador y plan de germinación');
      } else if (fase === 'germ_cubo') {
        titleEl.innerHTML =
          '<svg class="hc-ico hc-ico--title" aria-hidden="true" focusable="false"><use href="#hc-i-plant"/></svg> Germinación en cubo';
        summary.setAttribute('aria-label', 'Ir a germinación en cubo');
      }
    }
    var labelTexts = esProp
      ? ['Semillas', 'Día cultivo', 'Fase actual', 'Traslado hidro']
      : ['Cubos', 'Día cultivo', 'Fase actual', 'Siguiente paso'];
    var labels = summary.querySelectorAll('.torre-mini-label');
    for (var li = 0; li < labels.length && li < labelTexts.length; li++) {
      labels[li].textContent = labelTexts[li];
    }
    var nSem = numSemillasCaminoGerm(cfg);
    var nPlantas = nSem > 0 ? nSem : 0;
    var g =
      typeof ensureGerminacionFlow === 'function' ? ensureGerminacionFlow(cfg) : cfg.germinacionFlow || {};
    var diaN = 1;
    var isoIni =
      typeof getFechaInicioGerminacion === 'function'
        ? getFechaInicioGerminacion(g, cfg)
        : g.startedAt;
    if (isoIni) {
      var d0 = new Date(isoIni + 'T12:00:00');
      d0.setHours(0, 0, 0, 0);
      var hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      diaN = Math.max(1, Math.floor((hoy - d0) / 86400000) + 1);
    }
    var diasObj =
      typeof diasObjetivoConclusionGerm === 'function'
        ? diasObjetivoConclusionGerm(cfg, g)
        : 12;
    var faseTxt = etiquetaFaseGermCorta(cfg);
    var elP = document.getElementById('dashPlantas');
    var elD = document.getElementById('dashDias');
    var elC = document.getElementById('dashCosecha');
    var elX = document.getElementById('dashProxCosecha');
    if (elP) elP.textContent = String(nPlantas);
    if (elD) elD.textContent = isoIni ? 'Día ' + diaN : 'Sin fecha siembra';
    if (elC) {
      var faseCorta =
        typeof hcGerminacionFaseActualId === 'function'
          ? hcGerminacionFaseActualId(cfg)
          : 'semilla';
      var mapCorta = {
        semilla: 'Semilla',
        taproot: 'Radícula',
        rockwool: 'Lana',
        domo: 'Domo',
        netpot: 'Net pot',
        dwc: 'Hidro',
      };
      elC.textContent = mapCorta[faseCorta] || faseTxt || '—';
    }
    if (elX) {
      if (typeof germinacionConcluida === 'function' && germinacionConcluida(cfg)) {
        elX.textContent = 'Listo';
      } else if (isoIni && diasObj > 0) {
        var rest = Math.max(0, diasObj - diaN);
        elX.textContent = rest > 0 ? '~' + rest + ' d' : 'Pronto';
      } else {
        elX.textContent = '6 fases';
      }
    }
    var planSt = typeof getPlanGermEstado === 'function' ? getPlanGermEstado(cfg) : null;
    if (planSt && planSt.nombreVar && titleEl && esProp) {
      summary.setAttribute(
        'title',
        planSt.nombreVar +
          (nPlantas ? ' · ' + nPlantas + ' semilla(s)' : '') +
          ' · ' +
          faseTxt
      );
    }
  }

  function hcDashTorreInfoPropagador(cfg) {
    cfg = cfg || cfgActiva();
    if (!hcMostrarSistemaPropagador(cfg)) return null;
    var meta = hcMetaListaInstalacionTorre(cfg);
    if (meta) {
      var parts = [meta.geomLabel];
      var op =
        typeof sistemaEstaOperativa === 'function' && sistemaEstaOperativa(cfg)
          ? 'operativa'
          : 'stand-by';
      parts.push(op);
      return parts.join(' · ');
    }
    var parts = ['Germinación en propagador'];
    if (typeof getPlanGermEstado === 'function') {
      var st = getPlanGermEstado(cfg);
      if (st.numSemillas >= 1) {
        parts.push(st.numSemillas + (st.numSemillas === 1 ? ' semilla' : ' semillas'));
      }
      if (st.sustrato) {
        var subLbl =
          typeof etiquetaSustratoGerm === 'function'
            ? etiquetaSustratoGerm(st.sustrato)
            : st.sustrato;
        if (subLbl) parts.push(subLbl);
      }
    }
    var op =
      typeof sistemaEstaOperativa === 'function' && sistemaEstaOperativa(cfg)
        ? 'operativa'
        : 'stand-by';
    parts.push(op);
    return parts.join(' · ');
  }

  /** Propagador: sala accesible durante la germinación (DWC/RDWC solo tras tener sala). */
  function hcOcultarTabSalaDuranteCamino(cfg) {
    return false;
  }

  /**
   * Riego DWC (bomba/ciclos del depósito) no aplica en propagador: solo capa fina en bandeja.
   * La pestaña vuelve al cerrar hidro / tener depósito operativo.
   */
  function hcOcultarTabRiegoEnCaminoPropagador(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) === 'semilla_hidro') {
      return !(typeof depListo === 'function' && depListo(cfg));
    }
    if (cam(cfg) !== 'semilla_propagador') return false;
    if (typeof hcRecargaCompletaAplicaEnCamino === 'function') {
      return !hcRecargaCompletaAplicaEnCamino(cfg);
    }
    return !hidroCerrado(cfg);
  }

  /**
   * Asistente / Medir: el camino propagador exige municipio para previsión (pestaña Meteo).
   * No implica mostrar «Condiciones de ambiente» en Inicio — ver refreshDashInicioVistaCamino.
   */
  function hcMeteoRequiereLocalidad(cfg) {
    cfg = cfg || cfgActiva();
    var c = cam(cfg);
    return c === 'semilla_propagador' || c === 'semilla_hidro';
  }

  /** Meteo accesible aunque el depósito aún no esté operativo (caminos semilla en prep). */
  function hcMeteoTabPermitidaSinOperativa(cfg) {
    cfg = cfg || cfgActiva();
    var c = cam(cfg);
    if (c === 'semilla_propagador') return true;
    if (c === 'semilla_hidro') {
      return (
        typeof hcRecargaCompletaAplicaEnCamino === 'function' &&
        !hcRecargaCompletaAplicaEnCamino(cfg)
      );
    }
    return false;
  }

  /** Hub germinación visible = vista principal en Inicio (sin tiles DWC ni nutriente duplicado). */
  function hcDashGermHubVisibleEnInicio() {
    var germHub = document.getElementById('dashGerminacionHub');
    return !!(
      germHub &&
      !germHub.classList.contains('setup-hidden') &&
      !!String(germHub.innerHTML || '').trim()
    );
  }

  /** Inicio en modo resumido: hub germinación como pantalla principal (propagador o semilla_hidro). */
  function hcDashInicioGermFoco(cfg) {
    cfg = cfg || cfgActiva();
    if (!hcDashGermHubVisibleEnInicio()) return false;
    if (typeof hcSistemaPropagadorSinHidro === 'function' && hcSistemaPropagadorSinHidro(cfg)) {
      return true;
    }
    if (typeof hcSemillaHidroHubEsPrincipal === 'function' && hcSemillaHidroHubEsPrincipal(cfg)) {
      return true;
    }
    return false;
  }

  function hcQuickBtnLabel(btn, germFoco, focoLbl) {
    if (!btn) return;
    var span = btn.querySelector('span:last-child');
    if (!span) return;
    if (!btn.dataset.hcLblOrig) btn.dataset.hcLblOrig = span.textContent;
    span.textContent = germFoco ? focoLbl : btn.dataset.hcLblOrig;
  }

  /** Reaplica vistas por camino tras refrescos que pueden volver a mostrar bloques DWC. */
  function hcReaplicarVistasCaminoUi(cfg) {
    cfg = cfg || cfgActiva();
    try {
      if (typeof refreshDashInicioVistaCamino === 'function') refreshDashInicioVistaCamino(cfg);
    } catch (_) {}
    try {
      if (typeof refreshSalaVistaCamino === 'function') refreshSalaVistaCamino(cfg);
    } catch (_) {}
    try {
      if (
        typeof refreshMedirPropagadorTabChrome === 'function' &&
        document.getElementById('tab-mediciones') &&
        document.getElementById('tab-mediciones').classList.contains('active')
      ) {
        refreshMedirPropagadorTabChrome(cfg);
      }
    } catch (_) {}
  }

  /**
   * Inicio acotado a germinación/propagador: sin depósito, meteo de zona, rutina DWC ni medición rápida EC/pH.
   */
  function refreshDashInicioVistaCamino(cfg) {
    cfg = cfg || cfgActiva();
    if (typeof global !== 'undefined' && global._hcRefreshInicioVistaCamino) return;
    if (typeof global !== 'undefined') global._hcRefreshInicioVistaCamino = true;
    try {
    var soloPropag =
      typeof hcSistemaPropagadorSinHidro === 'function' && hcSistemaPropagadorSinHidro(cfg);
    var germHub = document.getElementById('dashGerminacionHub');
    var germHubVisible =
      germHub && !germHub.classList.contains('setup-hidden') && !!germHub.innerHTML.trim();
    ['dashBloqueAmbienteExterior', 'meteoFlashAviso'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('setup-hidden');
    });
    var ocultarLcHidro =
      typeof hcSemillaHidroPostAsistenteUi === 'function' && hcSemillaHidroPostAsistenteUi(cfg);
    var ocultarLcHidroHub =
      typeof hcSemillaHidroHubEsPrincipal === 'function' && hcSemillaHidroHubEsPrincipal(cfg);
    var inicioGermFoco =
      germHubVisible &&
      (soloPropag ||
        (typeof hcSemillaHidroHubEsPrincipal === 'function' && hcSemillaHidroHubEsPrincipal(cfg)));
    var esPropagFoco = soloPropag && germHubVisible;
    var esHidroFoco = ocultarLcHidroHub && germHubVisible;
    var idsOcultarHidro = [
      'dashOperativaHub',
      'dashInstalacionLifecycle',
      'ecTransicionAvisoInicio',
      'dashGerminacionHub',
    ];
    idsOcultarHidro.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (id === 'dashGerminacionHub') {
        el.classList.toggle('setup-hidden', ocultarLcHidro);
      } else if (id === 'dashInstalacionLifecycle') {
        el.classList.toggle('setup-hidden', soloPropag || ocultarLcHidro || ocultarLcHidroHub);
      } else if (id === 'dashOperativaHub') {
        el.classList.toggle('setup-hidden', soloPropag || ocultarLcHidro || inicioGermFoco);
      } else {
        el.classList.toggle('setup-hidden', soloPropag || ocultarLcHidro);
      }
    });
    var idsOcultarPropag = [
      'dashRutinaDia',
      'dashCaminoResumen',
      'dashNutrienteLabel',
      'dashSistemaInfo',
      'hcPlantasInstalacionInicioDetails',
      'hcMontajeInicioDetails',
      'dashRecargaCard',
      'dashSalaEquipReco',
    ];
    idsOcultarPropag.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('setup-hidden', inicioGermFoco);
    });
    if (inicioGermFoco) {
      var salaReco = document.getElementById('dashSalaEquipReco');
      if (salaReco) salaReco.innerHTML = '';
    }
    if (esPropagFoco) {
      var trasladoHost = document.getElementById('hcTrasladoSalaBannerHost');
      if (trasladoHost) {
        var trBan = trasladoHost.querySelector('.hc-traslado-sala-banner');
        if (trBan) trBan.remove();
      }
    }
    var medYcult = document.querySelector('.dash-medicion-y-cultivo');
    if (medYcult) {
      if (inicioGermFoco) {
        medYcult.classList.add('setup-hidden');
      } else {
        medYcult.classList.remove('setup-hidden');
        var grid = medYcult.querySelector('.params-grid');
        if (grid) grid.classList.remove('setup-hidden');
        var summary = medYcult.querySelector('.torre-summary');
        if (summary) summary.classList.remove('setup-hidden');
      }
    }
    var opRow = document.querySelector('#tab-inicio .dash-operativa-row');
    if (opRow) opRow.classList.toggle('setup-hidden', inicioGermFoco);
    var avisoCestas = document.getElementById('avisoCestasSinFechaInicio');
    if (avisoCestas && soloPropag) {
      avisoCestas.style.display = 'none';
      avisoCestas.innerHTML = '';
    }
    var ocultarSalaTab =
      typeof hcOcultarTabSalaDuranteCamino === 'function' && hcOcultarTabSalaDuranteCamino(cfg);
    var quickSala = document.querySelector('.quick-btn[data-quick-icon="sala"]');
    if (quickSala) quickSala.classList.toggle('setup-hidden', !!ocultarSalaTab);
    var quickRec = document.querySelector('.quick-btn[data-quick-icon="recarga"]');
    if (quickRec) {
      quickRec.classList.toggle(
        'setup-hidden',
        inicioGermFoco ||
          (typeof hcRecargaCompletaAplicaEnCamino === 'function' &&
            !hcRecargaCompletaAplicaEnCamino(cfg))
      );
    }
    var tabInicio = document.getElementById('tab-inicio');
    if (tabInicio) {
      tabInicio.classList.toggle('dash-inicio--germ-foco', !!inicioGermFoco);
      tabInicio.classList.toggle('dash-inicio--germ-foco-hidro', !!esHidroFoco);
    }
    var propRuta = document.getElementById('dashPropagadorRutaHost');
    if (propRuta) propRuta.classList.toggle('setup-hidden', !!inicioGermFoco);
    var notifPrefs = document.getElementById('dashNotifPrefsCard');
    if (notifPrefs) notifPrefs.classList.toggle('setup-hidden', !!inicioGermFoco);
    var dashVar = document.getElementById('dashInstalacionVariedad');
    if (dashVar) dashVar.classList.toggle('setup-hidden', !!inicioGermFoco);
    var dashInstLbl = document.getElementById('dashInstalacionLabel');
    if (dashInstLbl) dashInstLbl.classList.toggle('setup-hidden', !!inicioGermFoco);
    var quickCal = document.querySelector('.quick-btn[data-quick-icon="calendario"]');
    if (quickCal) quickCal.classList.toggle('setup-hidden', !inicioGermFoco);
    var quickCons = document.querySelector('.quick-btn[data-quick-icon="consejos"]');
    if (quickCons) quickCons.classList.toggle('setup-hidden', !inicioGermFoco);
    var quickCult = document.querySelector('.quick-btn[data-quick-icon="sistema"]');
    if (quickCult) quickCult.classList.toggle('setup-hidden', !!esPropagFoco);
    var quickBandeja = document.querySelector('.quick-btn[data-quick-icon="bandeja"]');
    if (quickBandeja) quickBandeja.classList.toggle('setup-hidden', !esPropagFoco);
    hcQuickBtnLabel(
      document.querySelector('.quick-btn[data-quick-icon="mediciones"]'),
      esPropagFoco,
      'Medir domo'
    );
    var quickMore = document.getElementById('quickActionsMore');
    if (quickMore && inicioGermFoco) quickMore.open = false;
    try {
      if (typeof refreshDashRecargaCardCamino === 'function') refreshDashRecargaCardCamino();
    } catch (_) {}
    try {
      if (typeof clearMeteoAlertRetry === 'function') clearMeteoAlertRetry();
    } catch (_) {}
    try {
      if (typeof applyInicioAmbienteExteriorVisibility === 'function') {
        applyInicioAmbienteExteriorVisibility();
      }
    } catch (_) {}
    try {
      if (typeof refreshDashSalaEquipRecoBanner === 'function') refreshDashSalaEquipRecoBanner(cfg);
    } catch (_) {}
    } finally {
      if (typeof global !== 'undefined') global._hcRefreshInicioVistaCamino = false;
    }
  }

  function hcOcultarTabSalaDuranteGerm(cfg) {
    return hcOcultarTabSalaDuranteCamino(cfg);
  }

  /**
   * Propagador sin hidro cerrado: en Sala no repetir bloques de Medir (ambiente, ubicación/luz, grow room).
   * Equipamiento + checklist de montaje siguen en Sala.
   */
  function hcSalaOcultarPanelesDuplicadosMedir(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) !== 'semilla_propagador') return false;
    if (typeof hcRecargaCompletaAplicaEnCamino === 'function' && hcRecargaCompletaAplicaEnCamino(cfg)) {
      return false;
    }
    return true;
  }

  function hcMedirEnfocadoGerminacion(cfg) {
    cfg = cfg || cfgActiva();
    var f = getSistemaFaseCamino(cfg);
    return f === 'propagador' || f === 'germ_cubo' || f === 'prep_hidro';
  }

  /**
   * «Recarga completa» = vaciar + limpiar + mezcla nueva del depósito DWC/RDWC.
   * En propagador (sin hidro cerrado) no aplica: solo domo y aporte opcional en el registro diario.
   */
  function hcRecargaCompletaAplicaEnCamino(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) === 'semilla_propagador') {
      return !!(
        typeof hidroInstalacionCerrada === 'function' && hidroInstalacionCerrada(cfg)
      );
    }
    if (cam(cfg) === 'semilla_hidro') {
      return !!(
        typeof hidroInstalacionCerrada === 'function' && hidroInstalacionCerrada(cfg)
      );
    }
    return true;
  }

  /** Sistema operativo semilla_hidro: sin panel estrategia EC/pH (recomendación automática por fase). */
  function hcSistemaOcultarEcPhStrategy(cfg) {
    cfg = cfg || cfgActiva();
    return typeof hcMedirEsSemillaHidro === 'function' && hcMedirEsSemillaHidro(cfg);
  }

  /** Depósito DWC en Sistema: solo consulta (valores fijados en asistente). */
  function hcSistemaDwcSoloConsulta(cfg) {
    cfg = cfg || cfgActiva();
    return typeof hcMedirEsSemillaHidro === 'function' && hcMedirEsSemillaHidro(cfg);
  }

  /** Depósito DWC/RDWC en Sistema: colapsado por defecto en semilla_hidro operativa. */
  function hcSistemaDwcPanelColapsado(cfg) {
    cfg = cfg || cfgActiva();
    if (typeof hcMedirEsSemillaHidro === 'function' && hcMedirEsSemillaHidro(cfg)) {
      return cfg.uiSistemaDwcColapsado !== false;
    }
    return cfg.uiSistemaDwcColapsado === true;
  }

  /** UI de recarga completa visible al usuario (la lógica interna sigue activa en semilla_hidro). */
  function hcRecargaUiVisibleUsuario(cfg) {
    cfg = cfg || cfgActiva();
    if (typeof hcMedirEsSemillaHidro === 'function' && hcMedirEsSemillaHidro(cfg)) {
      return false;
    }
    return typeof hcRecargaCompletaAplicaEnCamino === 'function'
      ? hcRecargaCompletaAplicaEnCamino(cfg)
      : true;
  }

  /** Texto para Inicio cuando la tarjeta de recarga completa no aplica (propagador). */
  function hcDashRecargaPropagadorInfo(cfg) {
    cfg = cfg || cfgActiva();
    if (hcRecargaCompletaAplicaEnCamino(cfg)) return null;
    var g =
      typeof ensureGerminacionFlow === 'function' ? ensureGerminacionFlow(cfg) : {};
    var vid = String(
      g.variedadId || (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) || ''
    ).trim();
    var spec =
      typeof getGerminacionSpecPorVariedad === 'function'
        ? getGerminacionSpecPorVariedad(vid)
        : { ecInicialUs: 500, phCubo: '5.5' };
    var faseId =
      typeof hcGerminacionFaseActualId === 'function' ? hcGerminacionFaseActualId(cfg) : 'semilla';
    var faseNut = faseId === 'semilla' || faseId === 'taproot';
    var ec = spec.ecInicialUs || 500;
    var diasObj =
      typeof diasObjetivoConclusionGerm === 'function'
        ? diasObjetivoConclusionGerm(cfg, g)
        : 12;
    return {
      ecOrientativaUs: ec,
      phCubo: spec.phCubo || '5.5',
      faseId: faseId,
      faseNutrienteOpcional: !faseNut,
      diasObjetivo: diasObj,
      nombreVar: spec.nombreGenetica || vid || '',
    };
  }

  global.getSistemaFaseCamino = getSistemaFaseCamino;
  global.hcMostrarSistemaFaseCamino = hcMostrarSistemaFaseCamino;
  global.hcRenderTorreBloqueadoPorFaseCamino = hcRenderTorreBloqueadoPorFaseCamino;
  global.hcMostrarSistemaPropagador = hcMostrarSistemaPropagador;
  global.hcSistemaPropagadorSinHidro = hcSistemaPropagadorSinHidro;
  global.hcTituloSistemaTab = hcTituloSistemaTab;
  global.hcOperativaFaseCamino = hcOperativaFaseCamino;
  global.hcOperativaFasePropagadorGerm = hcOperativaFasePropagadorGerm;
  global.hcDashTorreInfoPropagador = hcDashTorreInfoPropagador;
  global.hcRefreshDashTorreCultivoResumen = hcRefreshDashTorreCultivoResumen;
  global.hcMetaListaInstalacionTorre = hcMetaListaInstalacionTorre;
  global.hcDashUsaTilesGerminacion = hcDashUsaTilesGerminacion;
  global.hcRecargaCompletaAplicaEnCamino = hcRecargaCompletaAplicaEnCamino;
  global.hcDashRecargaPropagadorInfo = hcDashRecargaPropagadorInfo;
  global.hcOcultarTabSalaDuranteCamino = hcOcultarTabSalaDuranteCamino;
  global.hcOcultarTabSalaDuranteGerm = hcOcultarTabSalaDuranteGerm;
  global.hcOcultarTabRiegoEnCaminoPropagador = hcOcultarTabRiegoEnCaminoPropagador;
  global.hcMeteoRequiereLocalidad = hcMeteoRequiereLocalidad;
  global.hcMeteoTabPermitidaSinOperativa = hcMeteoTabPermitidaSinOperativa;
  /**
   * Sala: solo equipamiento + montaje en propagador; sin CTA duplicado de Medir/Historial.
   */
  function refreshSalaVistaCamino(cfg) {
    cfg = cfg || cfgActiva();
    var cam = getCaminoCultivo(cfg);
    var soloEquip =
      typeof hcSalaOcultarPanelesDuplicadosMedir === 'function' &&
      hcSalaOcultarPanelesDuplicadosMedir(cfg);
    var ocultarSalaTab =
      typeof hcOcultarTabSalaDuranteCamino === 'function' && hcOcultarTabSalaDuranteCamino(cfg);
    var seg = document.getElementById('salaSeguimientoCta');
    if (seg) {
      var ocultarSeg =
        cam === 'semilla_propagador' ||
        soloEquip ||
        ocultarSalaTab ||
        (typeof hcSistemaPropagadorSinHidro === 'function' && hcSistemaPropagadorSinHidro(cfg));
      if (ocultarSeg) {
        seg.classList.add('setup-hidden');
        seg.innerHTML = '';
      }
    }
    var layout = document.getElementById('salaLayoutPanel');
    if (layout) layout.classList.toggle('setup-hidden', !!soloEquip);
    var puente = document.getElementById('salaPropagadorPuenteMontaje');
    if (puente && (soloEquip || ocultarSalaTab)) {
      puente.classList.add('setup-hidden');
      puente.innerHTML = '';
    }
    var flujo = document.getElementById('salaPropagadorFlujoGuiado');
    if (flujo && (soloEquip || ocultarSalaTab)) {
      flujo.classList.add('setup-hidden');
      flujo.innerHTML = '';
    }
    var hint = document.getElementById('tabContextHintSala');
    if (hint && (soloEquip || ocultarSalaTab)) hint.classList.add('setup-hidden');
    var intro = document.querySelector('.medir-sala-intro');
    if (intro) intro.classList.add('setup-hidden');
    var tabSalaMount = document.getElementById('tabSalaMount');
    if (tabSalaMount && ocultarSalaTab) tabSalaMount.classList.add('setup-hidden');
  }

  global.hcDashGermHubVisibleEnInicio = hcDashGermHubVisibleEnInicio;
  global.hcDashInicioGermFoco = hcDashInicioGermFoco;
  global.hcReaplicarVistasCaminoUi = hcReaplicarVistasCaminoUi;
  global.refreshDashInicioVistaCamino = refreshDashInicioVistaCamino;
  global.refreshSalaVistaCamino = refreshSalaVistaCamino;
  global.hcSalaOcultarPanelesDuplicadosMedir = hcSalaOcultarPanelesDuplicadosMedir;
  global.hcMedirEnfocadoGerminacion = hcMedirEnfocadoGerminacion;
  global.salaConfiguradaCamino = salaConfiguradaCamino;
  global.montajeSalaOkCamino = montajeSalaOkCamino;
  global.HC_FASE_UI = FASE_UI;

  /** Alertas de control por camino (esqueje, madre, prep hidro). */
  function hcCaminoFaseEventosCalendario(fecha, hoy) {
    var ev = [];
    var cfg = cfgActiva();
    var f = getSistemaFaseCamino(cfg);
    if (!f) return ev;
    var d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    var h = new Date(hoy);
    h.setHours(0, 0, 0, 0);
    if (d.getTime() !== h.getTime()) return ev;
    var c = cam(cfg);
    if (f === 'prep_hidro') {
      ev.push({
        tipo: 'camino',
        icono: '💧',
        titulo: 'Prep hidro · pasos pendientes',
        desc: 'Revisa la lista en Sistema (checklist, sala, montaje, depósito).',
        action: 'sistema',
      });
    }
    if (f === 'germ_cubo' && c === 'semilla_hidro' && typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg)) {
      var gEv =
        typeof ensureGerminacionFlow === 'function' ? ensureGerminacionFlow(cfg) : cfg.germinacionFlow || {};
      var diaGerm = 1;
      var isoGerm =
        typeof getFechaInicioGerminacion === 'function'
          ? getFechaInicioGerminacion(gEv, cfg)
          : gEv.startedAt;
      if (isoGerm) {
        var d0 = new Date(isoGerm + 'T12:00:00');
        d0.setHours(0, 0, 0, 0);
        diaGerm = Math.max(1, Math.floor((h - d0) / 86400000) + 1);
      }
      if (diaGerm >= 1 && diaGerm <= 2) {
        ev.push({
          tipo: 'germinacion',
          icono: '🌑',
          titulo: 'Oscuridad · día ' + diaGerm + ' de 2',
          desc: 'Mantén cúpulas cerradas sin luz directa. Humedad y calor en el cubo; sin LED sobre la semilla.',
          action: 'medicion',
        });
      } else if (diaGerm === 3) {
        ev.push({
          tipo: 'germinacion',
          icono: '💡',
          titulo: 'Brote verde · iniciar luz suave',
          desc: 'Destapa o ventila cúpulas y activa fotoperíodo tenue (~18 h/día) según tu sala.',
          action: 'medicion',
        });
      } else if (diaGerm > 2 && diaGerm <= 7) {
        ev.push({
          tipo: 'germinacion',
          icono: '🫧',
          titulo: 'Ventilar cúpulas por cesta',
          desc: 'Quita o ventila mini cúpulas al brote verde; burbujeo suave y registro de T°/HR en Medir.',
          action: 'medicion',
        });
      }
      var faseId =
        typeof hcGerminacionFaseActualId === 'function' ? hcGerminacionFaseActualId(cfg) : 'semilla';
      if (faseId !== 'semilla' && faseId !== 'taproot') {
        ev.push({
          tipo: 'medicion',
          icono: '📊',
          titulo: 'Medir depósito y ambiente',
          desc: 'Registra EC, pH, volumen, T° agua y T°/HR aire en Medir (alimenta calendario e historial).',
          action: 'medicion',
        });
      }
    } else if (f === 'germ_cubo') {
      ev.push({
        tipo: 'camino',
        icono: '🌱',
        titulo: 'Germinación en cubo',
        desc: 'Registro diario en Inicio; esquema completo tras checklist operativa y matriz.',
        action: 'inicio',
      });
    }
    if (f === 'enraizado') {
      ev.push({
        tipo: 'camino',
        icono: '🌿',
        titulo: 'Enraizado de esquejes',
        desc: 'Checklist domo y asignar clones en el esquema.',
        action: 'sistema',
      });
    }
    if (f === 'madre') {
      ev.push({
        tipo: 'camino',
        icono: '👑',
        titulo: 'Cubo madre',
        desc: 'Asigna madre en Sistema y primer llenado del depósito.',
        action: 'sistema',
      });
    }
    if (c === 'esqueje_hidro' && typeof enraizadoMontajeCompleto === 'function' && !enraizadoMontajeCompleto(cfg)) {
      ev.push({
        tipo: 'camino',
        icono: '🫧',
        titulo: 'Ventilar domo de clones',
        desc: '2× al día 5 min; HR 70–80 %.',
      });
    }
    return ev;
  }

  global.hcCaminoFaseEventosCalendario = hcCaminoFaseEventosCalendario;
  global.hcSemillaHidroUiOperativaLista = hcSemillaHidroUiOperativaLista;
  global.hcSemillaHidroPostAsistenteUi = hcSemillaHidroPostAsistenteUi;
  global.hcSemillaHidroHubEsPrincipal = hcSemillaHidroHubEsPrincipal;
  global.hcSemillaHidroOcultarSeguimientoMedir = hcSemillaHidroOcultarSeguimientoMedir;
  global.hcMedirEsSemillaHidro = hcMedirEsSemillaHidro;
  global.hcRecargaUiVisibleUsuario = hcRecargaUiVisibleUsuario;
  global.hcSistemaOcultarEcPhStrategy = hcSistemaOcultarEcPhStrategy;
  global.hcSistemaDwcSoloConsulta = hcSistemaDwcSoloConsulta;
  global.hcSistemaDwcPanelColapsado = hcSistemaDwcPanelColapsado;
  global.hcGeomTorreFilasCestas = hcGeomTorreFilasCestas;
})(typeof window !== 'undefined' ? window : globalThis);
