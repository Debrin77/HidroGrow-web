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
      label: 'EC agua',
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
  var AMBIENTE_EXTRA = ['cardPPFD', 'cardCO2', 'cardTempExt'];

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
    var r = getGerminacionRangosMonitoreo(plan.variedadId, plan.faseId);
    var map = {
      temp: r.temp.min + ' – ' + r.temp.max + ' °C',
      hr: r.hr.min + ' – ' + r.hr.max + ' %',
      ec: r.ec.min + ' – ' + r.ec.max + ' µS (obj. ~' + r.ecObjetivo + ')',
      ph: r.phObjetivo + ' (' + r.ph.min + ' – ' + r.ph.max + ')',
      vpd: r.vpd.min + ' – ' + r.vpd.max + ' kPa',
    };
    setMedirParamRange(rangeId, map[key] || '');
  }

  function actualizarRangosParametrosMedirGerm(cfg) {
    cfg = cfg || cfgActiva();
    var plan = getPlanMedirGerm(cfg);
    var activos = keysActivos(plan);
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
    var plan = getPlanMedirGerm(cfg);
    var activos = keysActivos(plan);
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
      var ev = evalGerminacionMedicion(key, val, vid, faseId);
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
    var plan = getPlanMedirGerm(cfg);
    var activos = keysActivos(plan);
    var tieneSolucion = activos.ec || activos.ph;

    var flow = document.getElementById('medirFlow');
    if (flow) {
      flow.classList.toggle('medir-flow--germ-prop', activo);
      var lead = flow.querySelector('.medir-flow-lead');
      if (lead) {
        if (!lead.dataset.hcMedirLeadDefault) lead.dataset.hcMedirLeadDefault = lead.innerHTML;
        lead.innerHTML = activo
          ? 'Germinación en <strong>propagador</strong>: mismos parámetros que en Inicio (T°, HR del domo' +
            (tieneSolucion ? ', EC/pH del agua del propagador' : '') +
            (activos.vpd ? ', VPD' : '') +
            '). <strong>No es el depósito DWC</strong> hasta configurar el hidro.'
          : lead.dataset.hcMedirLeadDefault;
      }
      var solPanel = flow.querySelector('.medir-step-panel--solucion');
      if (solPanel) solPanel.classList.toggle('setup-hidden', !activo || !tieneSolucion);
      var solHead = solPanel && solPanel.querySelector('.medir-step-kicker--solucion');
      if (solHead) {
        solHead.textContent = activo ? 'Agua del propagador (orientativo)' : 'Paso 1 · solución';
      }
      var solSub = solPanel && solPanel.querySelector('.medir-step-sub');
      if (solSub && activo) {
        if (!solSub.dataset.hcMedirSubDefault) solSub.dataset.hcMedirSubDefault = solSub.textContent;
        solSub.textContent = 'EC y pH del agua del domo — no del depósito de floración.';
      } else if (solSub && solSub.dataset.hcMedirSubDefault) {
        solSub.textContent = solSub.dataset.hcMedirSubDefault;
      }
      var quick = document.getElementById('medirQuickInput');
      if (quick) {
        quick.placeholder = activo
          ? 'T 24 · HR 75 · EC 450 · pH 5.5'
          : 'EC 1350 · pH 6.0 · T 20 · V 18';
      }
    }

    var ambDetails = document.getElementById('medirAmbienteDetails');
    var ambCard = document.getElementById('medirAmbienteCard');
    if (ambDetails && activo) ambDetails.open = true;
    if (ambCard) {
      var ambLead = ambCard.querySelector('.medir-ambiente-lead');
      if (ambLead) {
        if (!ambLead.dataset.hcMedirLeadDefault) ambLead.dataset.hcMedirLeadDefault = ambLead.textContent;
        ambLead.textContent = activo
          ? 'T° y HR bajo el domo del propagador. El VPD se calcula al escribir T° y HR. Rangos según tu genética.'
          : ambLead.dataset.hcMedirLeadDefault;
      }
      var ambTitle = ambCard.querySelector('.card-title');
      if (ambTitle && activo) {
        if (!ambTitle.dataset.hcMedirTitleDefault) ambTitle.dataset.hcMedirTitleDefault = ambTitle.innerHTML;
        ambTitle.innerHTML =
          '<svg class="hc-ico hc-ico--title" aria-hidden="true" focusable="false"><use href="#hc-i-home"/></svg> Domo / propagador';
      } else if (ambTitle && ambTitle.dataset.hcMedirTitleDefault) {
        ambTitle.innerHTML = ambTitle.dataset.hcMedirTitleDefault;
      }
    }

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
        setLabelSpan(id, 'EC agua');
        setCardIcon(id, 'hc-i-bolt');
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

    AMBIENTE_EXTRA.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('setup-hidden', activo);
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
        var quickParse = flow.querySelector('.medir-quick-parse');
        if (quickParse) quickParse.insertAdjacentElement('afterend', hostRangos);
        else flow.insertBefore(hostRangos, flow.firstChild);
      }
      if (hostRangos) {
        hostRangos.classList.remove('setup-hidden');
        hostRangos.innerHTML = renderGerminacionRangosPanelHtml(cfg);
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
      } catch (_) {}
      return out;
    };
  }

  global.hcMedirModoGerminacionPropagador = hcMedirModoGerminacionPropagador;
  global.hcMedirPermiteRegistroGerminacion = hcMedirModoGerminacionPropagador;
  global.refreshMedirGerminacionUi = refreshMedirGerminacionUi;
  global.evalParamGerminacion = evalParamGerminacion;
  global.actualizarRangosParametrosMedirGerm = actualizarRangosParametrosMedirGerm;

  hookMedirGerminacion();
  hookMedirOperativaRefresh();

  function onReady() {
    try {
      refreshMedirGerminacionUi();
    } catch (_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})(typeof window !== 'undefined' ? window : globalThis);
