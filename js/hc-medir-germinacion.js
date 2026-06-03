/**
 * Medir en camino semilla_propagador (hasta hidro operativo): domo / propagador, no depósito DWC.
 */
(function (global) {
  'use strict';

  var MEDIR_GERM_KEYS = ['temp', 'hr', 'ec', 'ph', 'vpd'];

  var MEDIR_GERM_FIELD = {
    temp: {
      card: 'cardTempAire',
      input: 'inputTempAire',
      label: 'T° domo',
      icon: 'hc-i-therm',
      rangeId: 'paramRangeTempAire',
      statusId: 'statusTempAire',
      correccionId: 'correccionTempAire',
      amb: true,
    },
    hr: {
      card: 'cardHumSala',
      input: 'inputHumSala',
      label: 'HR domo',
      icon: 'hc-i-droplet',
      rangeId: 'paramRangeHum',
      statusId: 'statusHumSala',
      correccionId: 'correccionHumSala',
      amb: true,
    },
    vpd: {
      card: 'cardVPD',
      input: 'inputVPD',
      label: 'VPD',
      icon: 'hc-i-wind',
      rangeId: 'paramRangeVPD',
      statusId: 'statusVPD',
      correccionId: 'correccionVPD',
      amb: true,
    },
    ec: {
      card: 'cardEC',
      input: 'inputEC',
      label: 'EC propagador',
      icon: 'hc-i-bolt',
      rangeId: 'paramRangeEC',
      statusId: 'statusEC',
      correccionId: 'correccionEC',
      amb: false,
    },
    ph: {
      card: 'cardPH',
      input: 'inputPH',
      label: 'pH cubo',
      icon: 'hc-i-flask',
      rangeId: 'paramRangePH',
      statusId: 'statusPH',
      correccionId: 'correccionPH',
      amb: false,
    },
  };

  var DEPOSITO_CARDS = ['cardEC', 'cardPH', 'cardTemp', 'cardVol'];
  var AMBIENTE_SALA_CARDS = ['cardPPFD', 'cardCO2', 'cardTempExt'];

  function cfgActiva() {
    return typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
  }

  /** Mismo criterio que tiles de Inicio: propagador sin depósito DWC listo. */
  function hcMedirModoGerminacionPropagador(cfg) {
    cfg = cfg || cfgActiva();
    if (typeof getCaminoCultivo === 'function' && getCaminoCultivo(cfg) !== 'semilla_propagador') {
      return false;
    }
    if (
      typeof hcRecargaCompletaAplicaEnCamino === 'function' &&
      hcRecargaCompletaAplicaEnCamino(cfg)
    ) {
      return false;
    }
    if (typeof hcMostrarSistemaPropagador === 'function' && hcMostrarSistemaPropagador(cfg)) {
      return true;
    }
    if (typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg)) {
      return true;
    }
    return false;
  }

  function getPlanMedirGerm(cfg) {
    if (typeof getGerminacionDashTilesPlan !== 'function') return { tiles: [], faseId: 'semilla', variedadId: '', spec: {} };
    return getGerminacionDashTilesPlan(cfg);
  }

  function keysActivos(plan) {
    var k = {};
    (plan.tiles || []).forEach(function (t) {
      k[t.key] = true;
    });
    return k;
  }

  /**
   * Campos de sala (PPFD, CO₂, temp. exterior): en propagador solo tras configurar la sala en el asistente.
   */
  function hcMedirSalaAmbienteDisponible(cfg) {
    cfg = cfg || cfgActiva();
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam === 'semilla_propagador' || cam === 'semilla_hidro') {
      return typeof salaPreGermConfigurada === 'function' && salaPreGermConfigurada(cfg);
    }
    return typeof montajeEstaVerificado === 'function' && montajeEstaVerificado(cfg);
  }

  /** Medir propagador: T°/HR/VPD del domo siempre; EC según fase; pH según plan. */
  function getMedirGermActivos(cfg) {
    var plan = getPlanMedirGerm(cfg);
    var activos = keysActivos(plan);
    if (hcMedirModoGerminacionPropagador(cfg)) {
      activos.temp = true;
      activos.hr = true;
      activos.vpd = true;
      activos.ec = true;
      return { plan: plan, activos: activos };
    }
    activos.ec = true;
    return { plan: plan, activos: activos };
  }

  function setLabelSpan(cardId, text) {
    var card = document.getElementById(cardId);
    if (!card) return;
    var span = card.querySelector('.param-label span:last-of-type');
    if (!span) return;
    if (!span.dataset.hcMedirLblDefault) span.dataset.hcMedirLblDefault = span.textContent;
    span.textContent = text;
  }

  function restoreLabelSpan(cardId) {
    var card = document.getElementById(cardId);
    if (!card) return;
    var span = card.querySelector('.param-label span:last-of-type');
    if (span && span.dataset.hcMedirLblDefault) span.textContent = span.dataset.hcMedirLblDefault;
  }

  function setCardIcon(cardId, iconId) {
    var use = document.querySelector('#' + cardId + ' .param-label .hc-ico use');
    if (!use || !iconId) return;
    if (!use.dataset.hcMedirIcoDefault) use.dataset.hcMedirIcoDefault = use.getAttribute('href') || '';
    use.setAttribute('href', '#' + iconId);
  }

  function restoreCardIcon(cardId) {
    var use = document.querySelector('#' + cardId + ' .param-label .hc-ico use');
    if (use && use.dataset.hcMedirIcoDefault) use.setAttribute('href', use.dataset.hcMedirIcoDefault);
  }

  function setGermRange(rangeId, key, cfg) {
    if (typeof setMedirParamRange !== 'function' || typeof getGerminacionRangosMonitoreo !== 'function') {
      return;
    }
    var plan = getPlanMedirGerm(cfg);
    var r = getGerminacionRangosMonitoreo(plan.variedadId, plan.faseId, cfg);
    var map = {
      temp: r.temp.min + ' – ' + r.temp.max + ' °C',
      hr: r.hr.min + ' – ' + r.hr.max + ' %',
      ec: r.ec && r.ecAplica
        ? r.ec.min + ' – ' + r.ec.max + ' µS (obj. ~' + r.ecObjetivo + ')'
        : 'Según sustrato (p. ej. papel: sin EC)',
      ph: r.ph
        ? r.phObjetivo + ' (' + r.ph.min + ' – ' + r.ph.max + ')'
        : '—',
      vpd: r.vpd.min + ' – ' + r.vpd.max + ' kPa',
    };
    setMedirParamRange(rangeId, map[key] || '');
  }

  function actualizarRangosParametrosMedirGerm(cfg) {
    cfg = cfg || cfgActiva();
    var mg = getMedirGermActivos(cfg);
    var activos = mg.activos;
    MEDIR_GERM_KEYS.forEach(function (key) {
      var f = MEDIR_GERM_FIELD[key];
      if (!f) return;
      if (activos[key]) setGermRange(f.rangeId, key, cfg);
      else if (typeof setMedirParamRange === 'function') setMedirParamRange(f.rangeId, '');
    });
    ['paramRangeTemp', 'paramRangeVol'].forEach(function (id) {
      if (typeof setMedirParamRange === 'function') setMedirParamRange(id, '');
    });
  }

  function setGermStatus(statusId, nivel, texto) {
    if (typeof setAmbStatus === 'function' && (statusId === 'statusTempAire' || statusId === 'statusHumSala' || statusId === 'statusVPD')) {
      var icon = nivel === 'ok' ? '✅' : nivel === 'bad' ? '🔴' : nivel === 'warn' ? '🟡' : '';
      setAmbStatus(statusId, nivel, icon, texto);
      return;
    }
    if (typeof setStatus === 'function') {
      var icon2 = nivel === 'ok' ? '✅' : nivel === 'bad' ? '🔴' : nivel === 'warn' ? '🟡' : '';
      setStatus(statusId, nivel, icon2, texto);
    }
  }

  function evalParamGerminacion() {
    var cfg = cfgActiva();
    var mg = getMedirGermActivos(cfg);
    var plan = mg.plan;
    var activos = mg.activos;
    var vid = plan.variedadId;
    var faseId = plan.faseId;

    MEDIR_GERM_KEYS.forEach(function (key) {
      var f = MEDIR_GERM_FIELD[key];
      if (!f) return;
      var inp = document.getElementById(f.input);
      var val = inp ? parseFloat(String(inp.value || '').replace(',', '.')) : NaN;
      if (!activos[key]) {
        setGermStatus(f.statusId, 'empty', '');
        if (typeof setCard === 'function') setCard(f.card, '');
        if (f.amb && typeof showAmbCorreccion === 'function') showAmbCorreccion(f.correccionId, '');
        else if (typeof showCorreccion === 'function') showCorreccion(f.correccionId, '');
        return;
      }
      if (typeof evalGerminacionMedicion !== 'function') return;
      var ev = evalGerminacionMedicion(key, val, vid, faseId, cfg);
      setGermStatus(f.statusId, ev.nivel, ev.desfaseTxt);
      if (typeof setCard === 'function') setCard(f.card, ev.nivel);
      var corrHtml = ev.correccion
        ? '<div class="correccion-title">Ajuste</div><div class="correccion-muted">' + ev.correccion + '</div>'
        : '';
      if (f.amb && typeof showAmbCorreccion === 'function') showAmbCorreccion(f.correccionId, corrHtml);
      else if (typeof showCorreccion === 'function') showCorreccion(f.correccionId, corrHtml);
    });

    if (activos.temp && activos.hr && typeof actualizarVPDEnUI === 'function') {
      actualizarVPDEnUI();
    }
  }

  function evalAmbienteGerminacion() {
    evalParamGerminacion();
  }

  function refreshMedirGerminacionUi(cfg) {
    cfg = cfg || cfgActiva();
    var activo = hcMedirModoGerminacionPropagador(cfg);
    var mg = getMedirGermActivos(cfg);
    var activos = mg.activos;
    var tieneSolucion = activos.ec || activos.ph;

    var flow = document.getElementById('medirFlow');
    if (flow) {
      flow.classList.toggle('medir-flow--germ-prop', activo);
      var mountAmb = document.getElementById('medirFlowAmbienteMount');
      var solPanel = flow.querySelector('.medir-step-panel--solucion');
      if (activo && mountAmb && solPanel) {
        flow.insertBefore(mountAmb, solPanel);
      } else if (!activo && mountAmb && solPanel) {
        var actions = flow.querySelector('.medir-flow-actions');
        if (actions && mountAmb.nextElementSibling !== actions) {
          flow.insertBefore(solPanel, mountAmb);
        }
      }
      var quickBlock = flow.querySelector('.medir-quick-parse');
      if (quickBlock) quickBlock.classList.toggle('setup-hidden', activo);
      var lead = flow.querySelector('.medir-flow-lead');
      if (lead) {
        if (!lead.dataset.hcMedirLeadDefault) lead.dataset.hcMedirLeadDefault = lead.innerHTML;
        lead.innerHTML = activo
          ? 'Introduce <strong>T° y HR del domo</strong>; el <strong>VPD se calcula solo</strong>' +
            (activos.ec || activos.ph ? '. También puedes registrar EC/pH del propagador' : '') +
            '. Los recuadros indican si estás en rango.'
          : lead.dataset.hcMedirLeadDefault;
      }
      var solPanel = flow.querySelector('.medir-step-panel--solucion');
      if (solPanel) solPanel.classList.toggle('setup-hidden', !activo || !tieneSolucion);
      var solHead = solPanel && solPanel.querySelector('.medir-step-kicker--solucion');
      if (solHead) {
        solHead.textContent = activo ? 'Agua del propagador (si aplica)' : 'Paso 1 · solución';
      }
      var solSub = solPanel && solPanel.querySelector('.medir-step-sub');
      if (solSub && activo) {
        if (!solSub.dataset.hcMedirSubDefault) solSub.dataset.hcMedirSubDefault = solSub.textContent;
        solSub.textContent =
          'EC del agua del domo (µS/cm). En fases tempranas puede ir muy baja; pH del cubo cuando aplique.';
      } else if (solSub && solSub.dataset.hcMedirSubDefault) {
        solSub.textContent = solSub.dataset.hcMedirSubDefault;
      }
    }

    var ambDetails = document.getElementById('medirAmbienteDetails');
    if (ambDetails && activo) ambDetails.open = true;

    DEPOSITO_CARDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (!activo) {
        el.classList.remove('setup-hidden');
        restoreLabelSpan(id);
        restoreCardIcon(id);
        return;
      }
      var hideDep = id === 'cardTemp' || id === 'cardVol' || (id === 'cardEC' && !activos.ec) || (id === 'cardPH' && !activos.ph);
      el.classList.toggle('setup-hidden', hideDep);
      if (id === 'cardEC' && activos.ec) {
        setLabelSpan(id, 'EC propagador');
        setCardIcon(id, 'hc-i-bolt');
        var inpEc = document.getElementById('inputEC');
        if (inpEc && mg.plan && mg.plan.ecObjetivo) {
          inpEc.placeholder = String(mg.plan.ecObjetivo);
        }
      }
      if (id === 'cardPH' && activos.ph) {
        setLabelSpan(id, 'pH cubo');
        setCardIcon(id, 'hc-i-flask');
      }
    });

    MEDIR_GERM_KEYS.forEach(function (key) {
      var f = MEDIR_GERM_FIELD[key];
      if (!f || !f.amb) return;
      var el = document.getElementById(f.card);
      if (!el) return;
      if (!activo) {
        el.classList.remove('setup-hidden');
        restoreLabelSpan(f.card);
        restoreCardIcon(f.card);
        return;
      }
      el.classList.toggle('setup-hidden', !activos[key]);
      if (activos[key]) {
        setLabelSpan(f.card, f.label);
        setCardIcon(f.card, f.icon);
      }
    });

    var recarga = document.getElementById('recargaCardMediciones');
    if (recarga) recarga.classList.toggle('setup-hidden', activo);

    var hub = document.getElementById('medirOperativaHub');
    if (hub) hub.classList.toggle('setup-hidden', activo);

    var hostRangos = document.getElementById('hcMedirGermRangosHost');
    if (activo) {
      if (!hostRangos && flow && typeof renderGerminacionRangosPanelHtml === 'function') {
        hostRangos = document.createElement('div');
        hostRangos.id = 'hcMedirGermRangosHost';
        hostRangos.className = 'hc-medir-germ-rangos-host';
        var anchor = flow.querySelector('.medir-flow-lead');
        if (anchor) anchor.insertAdjacentElement('afterend', hostRangos);
        else flow.insertBefore(hostRangos, flow.firstChild);
      }
      if (hostRangos) {
        hostRangos.classList.remove('setup-hidden');
        hostRangos.innerHTML =
          typeof renderGerminacionRangosPanelHtml === 'function'
            ? renderGerminacionRangosPanelHtml(cfg, { forMedir: true })
            : '';
      }
    } else if (hostRangos) {
      hostRangos.classList.add('setup-hidden');
      hostRangos.innerHTML = '';
    }

    if (flow && activo) {
      flow.classList.remove('medir-flow--pre-operativa');
      flow.setAttribute('aria-hidden', 'false');
    }

    var preGate = document.getElementById('medirPreOperativaGate');
    if (preGate && activo) preGate.classList.add('setup-hidden');

    if (activo && typeof actualizarRangosParametrosMedirGerm === 'function') {
      actualizarRangosParametrosMedirGerm(cfg);
      evalParamGerminacion();
    }

    refreshMedirSalaAmbienteMedirUi(cfg);
  }

  function ensureMedirSalaPendienteHint(ambCard, cfg, germ, salaLista) {
    if (!ambCard) return;
    var hint = document.getElementById('hcMedirSalaPendienteHint');
    if (salaLista) {
      if (hint) hint.remove();
      return;
    }
    if (!hint) {
      hint = document.createElement('p');
      hint.id = 'hcMedirSalaPendienteHint';
      hint.className = 'medir-sala-pendiente-hint setup-field-hint';
      hint.setAttribute('role', 'note');
      var lead = ambCard.querySelector('.medir-ambiente-lead');
      if (lead) lead.insertAdjacentElement('afterend', hint);
      else ambCard.insertBefore(hint, ambCard.firstChild);
    }
    var cfgBtn =
      typeof getCaminoCultivo === 'function' && getCaminoCultivo(cfg) === 'semilla_propagador'
        ? '<button type="button" class="btn btn-link btn-sm" onclick="typeof abrirSetupFaseSala===\'function\'&&abrirSetupFaseSala()">Configurar sala</button> o ' +
          '<button type="button" class="btn btn-link btn-sm" onclick="typeof hcIrMontajeSala===\'function\'&&hcIrMontajeSala()">checklist de montaje</button>'
        : '<button type="button" class="btn btn-link btn-sm" onclick="typeof hcIrMontajeSala===\'function\'&&hcIrMontajeSala()">checklist de montaje en Sala</button>';
    hint.innerHTML =
      (germ
        ? '<strong>Sala sin configurar.</strong> PPFD, CO₂ y temp. exterior aparecen cuando completes la <strong>configuración de sala</strong> en el asistente. Arriba: <strong>T°, HR y VPD del domo</strong>. '
        : '<strong>Sala / montaje pendiente.</strong> Luz (PPFD), CO₂ y temp. exterior se activan tras configurar la instalación y completar el checklist de montaje. ') +
      cfgBtn +
      '.';
  }

  function refreshMedirSalaAmbienteMedirUi(cfg) {
    cfg = cfg || cfgActiva();
    var germ = hcMedirModoGerminacionPropagador(cfg);
    var salaLista = hcMedirSalaAmbienteDisponible(cfg);

    AMBIENTE_SALA_CARDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('setup-hidden', !salaLista);
    });

    var banner = document.getElementById('medirAmbienteImportanteBanner');
    if (banner) {
      banner.classList.toggle('setup-hidden', germ || salaLista);
    }

    var kick = document.querySelector('#medirAmbienteDetails .medir-step-kicker');
    var sub = document.querySelector('#medirAmbienteDetails .medir-step-sub');
    if (kick && sub) {
      if (!kick.dataset.hcMedirKickDefault) kick.dataset.hcMedirKickDefault = kick.textContent;
      if (!sub.dataset.hcMedirSubDefault) sub.dataset.hcMedirSubDefault = sub.textContent;
      if (germ) {
        kick.textContent = salaLista ? 'Domo y sala' : 'Domo propagador';
        sub.textContent = salaLista
          ? 'T°, HR y VPD del domo · PPFD, CO₂ y temp. exterior (sala configurada)'
          : 'T°, HR y VPD del domo — obligatorio';
      } else if (!salaLista) {
        kick.textContent = 'Paso 2 · opcional';
        sub.textContent = 'Luz, CO₂ y temp. exterior tras montaje de sala verificado';
      } else {
        kick.textContent = kick.dataset.hcMedirKickDefault;
        sub.textContent = sub.dataset.hcMedirSubDefault;
      }
    }

    var ambCard = document.getElementById('medirAmbienteCard');
    ensureMedirSalaPendienteHint(ambCard, cfg, germ, salaLista);

    if (ambCard) {
      var ambLead = ambCard.querySelector('.medir-ambiente-lead');
      if (ambLead) {
        if (!ambLead.dataset.hcMedirLeadDefault) ambLead.dataset.hcMedirLeadDefault = ambLead.textContent;
        if (germ) {
          ambLead.textContent = salaLista
            ? 'T°, HR y VPD del domo. Con la sala montada puedes añadir PPFD, CO₂ y temp. exterior abajo.'
            : 'T°, HR y VPD del domo del propagador. El VPD se calcula al escribir T° y HR.';
        } else if (!salaLista) {
          ambLead.textContent =
            'Temp. aire y HR para VPD. PPFD, CO₂ y temp. exterior cuando el montaje de sala esté verificado.';
        } else if (ambLead.dataset.hcMedirLeadDefault) {
          ambLead.textContent = ambLead.dataset.hcMedirLeadDefault;
        }
      }
    }
  }

  function hookMedirGerminacion() {
    if (global._hcMedirGermHooked) return;
    global._hcMedirGermHooked = true;

    var prevRangos = global.actualizarRangosParametrosMedir;
    if (typeof prevRangos === 'function') {
      global.actualizarRangosParametrosMedir = function (cfg) {
        cfg = cfg || cfgActiva();
        if (hcMedirModoGerminacionPropagador(cfg)) {
          actualizarRangosParametrosMedirGerm(cfg);
          return;
        }
        return prevRangos(cfg);
      };
    }

    var prevEval = global.evalParam;
    if (typeof prevEval === 'function') {
      global.evalParam = function () {
        if (hcMedirModoGerminacionPropagador()) {
          evalParamGerminacion();
          return;
        }
        return prevEval();
      };
    }

    if (typeof global.evalAmbiente === 'function') {
      var prevAmb = global.evalAmbiente;
      global.evalAmbiente = function () {
        if (hcMedirModoGerminacionPropagador()) {
          evalAmbienteGerminacion();
          return;
        }
        return prevAmb();
      };
    }
  }

  function hookMedirOperativaRefresh() {
    if (global._hcMedirGermOpHooked) return;
    if (typeof global.refreshMedirOperativaUi !== 'function') return;
    global._hcMedirGermOpHooked = true;
    var prevRefresh = global.refreshMedirOperativaUi;
    global.refreshMedirOperativaUi = function () {
      var out = prevRefresh();
      try {
        refreshMedirGerminacionUi();
        refreshMedirSalaAmbienteMedirUi();
      } catch (_) {}
      return out;
    };
  }

  global.hcMedirModoGerminacionPropagador = hcMedirModoGerminacionPropagador;
  global.hcMedirPermiteRegistroGerminacion = hcMedirModoGerminacionPropagador;
  global.refreshMedirGerminacionUi = refreshMedirGerminacionUi;
  global.refreshMedirSalaAmbienteMedirUi = refreshMedirSalaAmbienteMedirUi;
  global.hcMedirSalaAmbienteDisponible = hcMedirSalaAmbienteDisponible;
  global.evalParamGerminacion = evalParamGerminacion;
  global.actualizarRangosParametrosMedirGerm = actualizarRangosParametrosMedirGerm;

  hookMedirGerminacion();
  hookMedirOperativaRefresh();

  function onReady() {
    try {
      refreshMedirGerminacionUi();
      refreshMedirSalaAmbienteMedirUi();
    } catch (_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})(typeof window !== 'undefined' ? window : globalThis);
