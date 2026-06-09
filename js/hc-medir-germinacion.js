/**
 * Medir pre-traslado: propagador (semilla_propagador) y cubo (semilla_hidro).
 * Depósito DWC/RDWC solo tras traslado / registro en matriz.
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
      label: 'pH bandeja',
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

  /** Propagador en germinación: domo (agua + HR + volumen), no depósito DWC hasta el traslado. */
  function hcMedirModoGerminacionPropagador(cfg) {
    cfg = cfg || cfgActiva();
    if (typeof getCaminoCultivo === 'function' && getCaminoCultivo(cfg) !== 'semilla_propagador') {
      return false;
    }
    if (
      typeof hcPropagadorTrasladoCompletado === 'function' &&
      hcPropagadorTrasladoCompletado(cfg)
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

  /** Germinación en cubo (semilla_hidro) antes del registro en matriz. */
  function hcMedirModoGerminacionCubo(cfg) {
    cfg = cfg || cfgActiva();
    if (typeof getCaminoCultivo === 'function' && getCaminoCultivo(cfg) !== 'semilla_hidro') {
      return false;
    }
    if (
      typeof hcSemillaHidroTrasladoCompletado === 'function' &&
      hcSemillaHidroTrasladoCompletado(cfg)
    ) {
      return false;
    }
    if (typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg)) {
      return true;
    }
    if (typeof getSistemaFaseCamino === 'function') {
      var f = getSistemaFaseCamino(cfg);
      if (f === 'germ_cubo') return true;
    }
    return false;
  }

  function hcMedirGermPreTrasladoActivo(cfg) {
    return hcMedirModoGerminacionPropagador(cfg) || hcMedirModoGerminacionCubo(cfg);
  }

  /** @returns {'propagador'|'cubo'|''} */
  function hcMedirGermPreTrasladoVariant(cfg) {
    if (hcMedirModoGerminacionPropagador(cfg)) return 'propagador';
    if (hcMedirModoGerminacionCubo(cfg)) return 'cubo';
    return '';
  }

  function medirGermEtiquetaEntidad(variant) {
    return variant === 'cubo' ? 'Cubo de germinación' : 'Propagador';
  }

  function medirGermEtiquetaMicro(variant) {
    return variant === 'cubo' ? 'cubo' : 'domo';
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
   * Propagador: sala configurada + checklist de montaje verificado (propagador dentro).
   * Hidro directo: solo equipamiento de sala guardado.
   */
  function hcMedirSalaListaParaMedir(cfg) {
    cfg = cfg || cfgActiva();
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam === 'semilla_propagador') {
      return typeof montajeSalaPreGermOk === 'function' && montajeSalaPreGermOk(cfg);
    }
    if (cam === 'semilla_hidro') {
      if (typeof salaPreGermConfigurada !== 'function' || !salaPreGermConfigurada(cfg)) {
        return false;
      }
      if (typeof montajeEstaVerificado === 'function') {
        return montajeEstaVerificado(cfg);
      }
      return typeof montajeSalaPreGermOk === 'function' && montajeSalaPreGermOk(cfg);
    }
    return typeof montajeEstaVerificado === 'function' && montajeEstaVerificado(cfg);
  }

  /** Semilla propagador/hidro: ocultar bloque sala en Medir hasta config + puesta en marcha. */
  function hcMedirOcultarBloqueSala(cfg) {
    cfg = cfg || cfgActiva();
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam !== 'semilla_propagador' && cam !== 'semilla_hidro') return false;
    return !hcMedirSalaListaParaMedir(cfg);
  }

  function ocultarTarjetasAmbienteSalaEnMedir(cfg, salaLista) {
    if (salaLista) return;
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam !== 'semilla_propagador' && cam !== 'semilla_hidro') return;
    ['cardTempAire', 'cardVPD', 'cardPPFD', 'cardCO2', 'cardTempExt'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('setup-hidden');
    });
    var ambCard = document.getElementById('medirAmbienteCard');
    if (ambCard) ambCard.classList.add('setup-hidden');
    var details = document.getElementById('medirAmbienteDetails');
    if (details) {
      details.classList.add('setup-hidden');
      details.open = false;
    }
    var mount = document.getElementById('medirFlowAmbienteMount');
    if (mount) mount.classList.add('setup-hidden');
  }

  function hcMedirSalaConfigurada(cfg) {
    cfg = cfg || cfgActiva();
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam === 'semilla_propagador' || cam === 'semilla_hidro') {
      return typeof salaPreGermConfigurada === 'function' && salaPreGermConfigurada(cfg);
    }
    return typeof montajeEstaVerificado === 'function' && montajeEstaVerificado(cfg);
  }

  /** Alias histórico: parámetros de sala medibles en Medir. */
  function hcMedirSalaAmbienteDisponible(cfg) {
    return hcMedirSalaListaParaMedir(cfg);
  }

  /** PPFD / CO₂ / temp. ext. según equipamiento registrado en la sala. */
  function hcMedirCardSalaEquipoVisible(cardId, cfg) {
    if (!hcMedirSalaListaParaMedir(cfg)) return false;
    cfg = cfg || cfgActiva();
    var inst = cfg.equipamientoInstalado || {};
    var eq = Array.isArray(cfg.equipamiento) ? cfg.equipamiento : [];
    var ubic = String(
      cfg.ubicacion || (cfg.premiumSetup && cfg.premiumSetup.entorno) || 'interior'
    ).toLowerCase();
    if (cardId === 'cardPPFD') {
      return !!(inst.led && inst.led.id) || Number.isFinite(Number(cfg.growRoomLedW));
    }
    if (cardId === 'cardCO2') {
      return !!(inst.co2 && inst.co2.id) || eq.indexOf('co2') >= 0;
    }
    if (cardId === 'cardTempExt') {
      return ubic === 'exterior' || !!(inst.extractor && inst.extractor.id);
    }
    return true;
  }

  /** Pre-traslado: HR siempre; T° agua y volumen en cards; EC/pH según fase. */
  function getMedirGermActivos(cfg) {
    var plan = getPlanMedirGerm(cfg);
    var activos = keysActivos(plan);
    if (hcMedirGermPreTrasladoActivo(cfg)) {
      activos.hr = true;
      activos.temp = false;
      activos.vpd = false;
      if (activos.ec === undefined) activos.ec = true;
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
    if (hcMedirGermPreTrasladoActivo(cfg) && typeof getGerminacionRangosMonitoreo === 'function') {
      var planR = getPlanMedirGerm(cfg);
      var rProp = getGerminacionRangosMonitoreo(planR.variedadId, planR.faseId, cfg);
      var volHint =
        hcMedirGermPreTrasladoVariant(cfg) === 'cubo'
          ? 'Litros de solución en el cubo de germinación'
          : 'Litros de solución en el domo / bandeja';
      if (typeof setMedirParamRange === 'function') {
        setMedirParamRange(
          'paramRangeTemp',
          rProp.temp.min + ' – ' + rProp.temp.max + ' °C (agua)'
        );
        setMedirParamRange('paramRangeVol', volHint);
      }
    } else {
      ['paramRangeTemp', 'paramRangeVol'].forEach(function (id) {
        if (typeof setMedirParamRange === 'function') setMedirParamRange(id, '');
      });
    }
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
      if (typeof setCard === 'function') {
        setCard(f.card, ev.nivel === 'bad' ? 'alert' : ev.nivel);
      }
      var corrHtml = ev.correccion
        ? '<div class="correccion-title">Ajuste</div><div class="correccion-muted">' + ev.correccion + '</div>'
        : '';
      if (f.amb && typeof showAmbCorreccion === 'function') showAmbCorreccion(f.correccionId, corrHtml);
      else if (typeof showCorreccion === 'function') showCorreccion(f.correccionId, corrHtml);
    });

    if (hcMedirGermPreTrasladoActivo(cfg)) {
      var inpWt = document.getElementById('inputTemp');
      var valWt = inpWt ? parseFloat(String(inpWt.value || '').replace(',', '.')) : NaN;
      if (typeof evalGerminacionMedicion === 'function') {
        var evWt = evalGerminacionMedicion('temp', valWt, vid, faseId, cfg);
        setGermStatus('statusTemp', Number.isFinite(valWt) ? evWt.nivel : 'empty', evWt.desfaseTxt || '');
        if (typeof setCard === 'function') {
          setCard('cardTemp', Number.isFinite(valWt) ? (evWt.nivel === 'bad' ? 'alert' : evWt.nivel) : '');
        }
        var corrWt = evWt.correccion
          ? '<div class="correccion-title">Ajuste</div><div class="correccion-muted">' + evWt.correccion + '</div>'
          : '';
        if (typeof showCorreccion === 'function') showCorreccion('correccionTemp', corrWt);
      }
    }

    if (activos.temp && activos.hr && typeof actualizarVPDEnUI === 'function') {
      actualizarVPDEnUI();
    }
  }

  function evalAmbienteGerminacion() {
    evalParamGerminacion();
  }

  /**
   * Evaluación post-guardado alineada con las tarjetas de germinación (no rangos DWC).
   */
  function evaluarMedicionGerminacion(payload, cfg) {
    cfg = cfg || cfgActiva();
    payload = payload || {};
    var items = [];
    var alertas = [];
    if (typeof evalGerminacionMedicion !== 'function') {
      return { items: items, alertas: alertas, fase: '' };
    }
    var mg = getMedirGermActivos(cfg);
    var plan = mg.plan;
    var activos = mg.activos;
    var vid = plan.variedadId;
    var faseId = plan.faseId;
    var pre = hcMedirGermPreTrasladoActivo(cfg);

    function num(v) {
      if (v == null || v === '') return NaN;
      var n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
      return Number.isFinite(n) ? n : NaN;
    }

    function pushItem(id, ev, val) {
      var estado =
        ev.nivel === 'bad' ? 'bad' : ev.nivel === 'warn' ? 'warn' : ev.nivel === 'ok' ? 'ok' : 'empty';
      var it = {
        id: id,
        valor: val,
        estado: estado,
        msg: ev.desfaseTxt || '',
        solucionTexto: ev.correccion || '',
        solucionHtml: ev.correccion
          ? '<div class="correccion-muted">' + ev.correccion + '</div>'
          : '',
      };
      items.push(it);
      if (estado === 'warn' || estado === 'bad') alertas.push(it);
    }

    function evalKey(key, val, id) {
      if (!Number.isFinite(val)) return;
      var ev = evalGerminacionMedicion(key, val, vid, faseId, cfg);
      pushItem(id || key, ev, val);
    }

    if (pre) {
      evalKey('temp', num(payload.temp), 'temp');
      evalKey('hr', num(payload.humSala), 'humSala');
    } else {
      if (activos.temp) evalKey('temp', num(payload.tempAire), 'tempAire');
      if (activos.hr) evalKey('hr', num(payload.humSala), 'humSala');
    }
    if (activos.ec) evalKey('ec', num(payload.ec), 'ec');
    if (activos.ph) evalKey('ph', num(payload.ph), 'ph');
    if (activos.vpd) evalKey('vpd', num(payload.vpd), 'vpd');

    if (typeof global.evaluarMedicionCompleta === 'function' && hcMedirSalaListaParaMedir(cfg)) {
      var salaEval = global.evaluarMedicionCompleta({
        ppfd: payload.ppfd,
        lux: payload.lux,
        co2: payload.co2,
        tempExt: payload.tempExt,
        fase: payload.fase,
      });
      (salaEval.items || []).forEach(function (it) {
        items.push(it);
        if (it.estado === 'warn' || it.estado === 'bad') alertas.push(it);
      });
    }

    return { items: items, alertas: alertas, fase: faseId };
  }

  function refreshMedirGerminacionUi(cfg) {
    cfg = cfg || cfgActiva();
    var variant = hcMedirGermPreTrasladoVariant(cfg);
    var preTraslado = !!variant;
    var mg = getMedirGermActivos(cfg);
    var activos = mg.activos;
    var salaLista = hcMedirSalaListaParaMedir(cfg);
    var salaCfg = hcMedirSalaConfigurada(cfg);

    if (preTraslado && typeof mountAmbienteInMedirFlow === 'function') {
      try {
        mountAmbienteInMedirFlow();
      } catch (_) {}
    }

    var flow = document.getElementById('medirFlow');
    if (flow) {
      flow.classList.toggle('medir-flow--germ-prop', variant === 'propagador');
      flow.classList.toggle('medir-flow--germ-cubo', variant === 'cubo');
      if (preTraslado) {
        flow.classList.remove('medir-flow--pre-operativa');
        flow.setAttribute('aria-hidden', 'false');
      }
      var mountAmb = document.getElementById('medirFlowAmbienteMount');
      var solPanel = flow.querySelector('.medir-step-panel--solucion');
      if (preTraslado && mountAmb && solPanel) {
        flow.insertBefore(mountAmb, solPanel);
      } else if (!preTraslado && mountAmb && solPanel) {
        var actions = flow.querySelector('.medir-flow-actions');
        if (actions && mountAmb.nextElementSibling !== actions) {
          flow.insertBefore(solPanel, mountAmb);
        }
      }
      var quickBlock = flow.querySelector('.medir-quick-parse');
      if (quickBlock) quickBlock.classList.toggle('setup-hidden', preTraslado);
      flow.classList.toggle('medir-flow--germ-compact', preTraslado);
    }

    var ambDetails = document.getElementById('medirAmbienteDetails');
    if (ambDetails && preTraslado) ambDetails.open = true;

    var lblAguaTemp = variant === 'cubo' ? 'T° agua cubo' : 'T° agua propagador';
    var lblEc = variant === 'cubo' ? 'EC cubo' : 'EC propagador';
    var lblHr = variant === 'cubo' ? 'HR cubo/sala' : 'HR domo';

    DEPOSITO_CARDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (!preTraslado) {
        el.classList.remove('setup-hidden');
        restoreLabelSpan(id);
        restoreCardIcon(id);
        return;
      }
      var hideDep =
        (id === 'cardEC' && !activos.ec) || (id === 'cardPH' && !activos.ph);
      el.classList.toggle('setup-hidden', hideDep);
      if (id === 'cardTemp') {
        setLabelSpan(id, lblAguaTemp);
        setCardIcon(id, 'hc-i-therm');
      }
      if (id === 'cardVol') {
        setLabelSpan(id, 'Volumen agua');
        setCardIcon(id, 'hc-i-bucket');
      }
      if (id === 'cardEC' && activos.ec) {
        setLabelSpan(id, lblEc);
        setCardIcon(id, 'hc-i-bolt');
        var inpEc = document.getElementById('inputEC');
        if (inpEc && mg.plan && mg.plan.ecObjetivo) {
          inpEc.placeholder = String(mg.plan.ecObjetivo);
        }
      }
      if (id === 'cardPH' && activos.ph) {
        setLabelSpan(id, 'pH agua');
        setCardIcon(id, 'hc-i-flask');
      }
    });

    MEDIR_GERM_KEYS.forEach(function (key) {
      var f = MEDIR_GERM_FIELD[key];
      if (!f || !f.amb) return;
      var el = document.getElementById(f.card);
      if (!el) return;
      var ocultarSalaAmb =
        typeof hcMedirOcultarBloqueSala === 'function' && hcMedirOcultarBloqueSala(cfg);
      if (!preTraslado) {
        if (ocultarSalaAmb) {
          el.classList.add('setup-hidden');
          return;
        }
        el.classList.remove('setup-hidden');
        restoreLabelSpan(f.card);
        restoreCardIcon(f.card);
        return;
      }
      var showAmb = false;
      if (key === 'hr') {
        showAmb = salaLista || variant !== 'propagador';
      } else if (key === 'temp' && salaLista) showAmb = true;
      else if (key === 'vpd' && salaLista) showAmb = true;
      el.classList.toggle('setup-hidden', !showAmb);
      if (showAmb) {
        if (key === 'hr') {
          setLabelSpan(f.card, lblHr);
          setCardIcon(f.card, 'hc-i-droplet');
        } else if (key === 'temp') {
          setLabelSpan(f.card, 'T° aire sala');
          setCardIcon(f.card, 'hc-i-therm');
        } else if (key === 'vpd') {
          setLabelSpan(f.card, 'VPD sala');
          setCardIcon(f.card, 'hc-i-wind');
        }
      }
    });

    var recarga = document.getElementById('recargaCardMediciones');
    if (recarga) recarga.classList.toggle('setup-hidden', preTraslado);

    var hub = document.getElementById('medirOperativaHub');
    if (hub) hub.classList.toggle('setup-hidden', preTraslado);

    var hostRangos = document.getElementById('hcMedirGermRangosHost');
    if (hostRangos) {
      hostRangos.classList.add('setup-hidden');
      hostRangos.innerHTML = '';
    }

    if (flow && preTraslado) {
      flow.classList.remove('medir-flow--pre-operativa');
      flow.setAttribute('aria-hidden', 'false');
      flow.querySelectorAll('.medir-flow-actions [onclick*="abrirWizardMedicion"]').forEach(function (btn) {
        btn.classList.toggle('setup-hidden', !!preTraslado);
      });
    }

    var preGate = document.getElementById('medirPreOperativaGate');
    if (preGate && preTraslado) preGate.classList.add('setup-hidden');

    if (preTraslado && typeof actualizarRangosParametrosMedirGerm === 'function') {
      actualizarRangosParametrosMedirGerm(cfg);
      evalParamGerminacion();
    }

    refreshMedirSalaAmbienteMedirUi(cfg);
    ocultarTarjetasAmbienteSalaEnMedir(cfg, salaLista);
    ensureMedirHrDomoEnPropagadorGrid(cfg, preTraslado, variant, salaLista);
    refreshMedirAsistentePropagadorBtn(preTraslado, variant);
    refreshMedirSaveBtnLabel(cfg, preTraslado, variant, salaLista);
    refreshMedirPropagadorTabChrome(cfg, preTraslado, variant);
    if (typeof refreshSalaPanelesDuplicadosMedirUi === 'function') {
      refreshSalaPanelesDuplicadosMedirUi(cfg);
    }
    if (typeof applyMedirGuiaProtocoloChrome === 'function') applyMedirGuiaProtocoloChrome(cfg);
    if (preTraslado && typeof repositionMedirFlowPropagadorTop === 'function') {
      repositionMedirFlowPropagadorTop();
    }
    if (typeof repositionMedirGuiaDiaTop === 'function') repositionMedirGuiaDiaTop();
  }

  function refreshMedirPropagadorTabChrome(cfg, preTraslado, variant) {
    cfg = cfg || cfgActiva();
    if (preTraslado === undefined) {
      variant = hcMedirGermPreTrasladoVariant(cfg);
      preTraslado = !!variant;
    }
    variant = variant || hcMedirGermPreTrasladoVariant(cfg);
    var tab = document.getElementById('tab-mediciones');
    var ocultarSalaMedir =
      typeof hcMedirOcultarBloqueSala === 'function' && hcMedirOcultarBloqueSala(cfg);
    if (tab) {
      tab.classList.toggle('medir-tab--propagador', variant === 'propagador');
      tab.classList.toggle('medir-tab--germ-cubo', variant === 'cubo');
    }

    var hideWhenProp = [
      'medirPuestaMarchaCard',
      'medirPreOperativaGate',
      'medirOperativaHub',
      'tabContextHintMediciones',
      'hcMultiCoachMedir',
      'medirDatosFacilesBanner',
      'ultimaMedicionCard',
      'medirMonitorCard',
      'medirProtocoloCard',
      'medirGuiaDiaCard',
      'medirIotCard',
      'medirAmbienteCard',
      'panelLocalidadMeteo',
      'ecTransicionAvisoMedir',
      'configPanel',
      'recargaCardMediciones',
    ];
    hideWhenProp.forEach(function (id) {
      var n = document.getElementById(id);
      if (!n) return;
      if (id === 'medirAmbienteCard' && (preTraslado || ocultarSalaMedir)) {
        var salaOk =
          typeof hcMedirSalaListaParaMedir === 'function' && hcMedirSalaListaParaMedir(cfg);
        var mountAmb = document.getElementById('medirFlowAmbienteMount');
        if (salaOk && mountAmb && mountAmb.contains(n)) {
          n.classList.remove('setup-hidden');
          return;
        }
        n.classList.add('setup-hidden');
        return;
      }
      n.classList.toggle('setup-hidden', !!preTraslado);
    });
    if (tab) {
      var notas = tab.querySelector('.medir-notas-card');
      if (notas) notas.classList.toggle('setup-hidden', !!preTraslado);
      tab.querySelectorAll('.medir-assistant-cta-wrap, .guardar-medicion-bar').forEach(function (n) {
        n.classList.toggle('setup-hidden', !!preTraslado);
      });
    }

    var loc = document.getElementById('panelLocalidadMeteo');
    if (loc) {
      loc.classList.toggle('medir-localidad--propagador', !!preTraslado);
      if (preTraslado) loc.classList.add('setup-hidden');
    }

    var titleWrap = tab && tab.querySelector('.section-title > span');
    if (titleWrap) {
      if (!titleWrap.dataset.hcMedirTitleDefault) {
        titleWrap.dataset.hcMedirTitleDefault = titleWrap.innerHTML;
      }
      var titleLbl =
        variant === 'cubo' ? 'germinación en cubo' : variant === 'propagador' ? 'propagador' : '';
      titleWrap.innerHTML = preTraslado
        ? '<span class="accent">Medir</span> · ' +
          titleLbl +
          (hcMedirSalaListaParaMedir(cfg) ? ' y sala' : '')
        : titleWrap.dataset.hcMedirTitleDefault;
    }
  }

  function refreshMedirAsistentePropagadorBtn(preTraslado, variant) {
    var flow = document.getElementById('medirFlow');
    if (!flow) return;
    var btn = flow.querySelector('.medir-flow-actions [data-quick-icon="asistentepro"]');
    if (!btn) return;
    var labelSpan = btn.querySelector('span:last-of-type');
    if (labelSpan && !btn.dataset.hcAsistLabelDefault) {
      btn.dataset.hcAsistLabelDefault = labelSpan.textContent;
    }
    if (preTraslado) {
      var asistLbl = variant === 'cubo' ? 'Asistente cubo' : 'Asistente domo';
      btn.setAttribute(
        'aria-label',
        'Abrir asistente de medición del ' + (variant === 'cubo' ? 'cubo' : 'domo propagador')
      );
      if (labelSpan) labelSpan.textContent = asistLbl;
    } else {
      btn.setAttribute('aria-label', 'Abrir Asistente de mediciones');
      if (labelSpan && btn.dataset.hcAsistLabelDefault) {
        labelSpan.textContent = btn.dataset.hcAsistLabelDefault;
      }
    }
  }

  function refreshMedirSaveBtnLabel(cfg, preTraslado, variant, salaLista) {
    var btn = document.getElementById('btnGuardarMedicion');
    if (!btn) return;
    if (!btn.dataset.hcMedirSaveLabelDefault) {
      btn.dataset.hcMedirSaveLabelDefault = btn.textContent.trim() || 'Guardar medición';
    }
    if (preTraslado && variant === 'propagador') {
      btn.textContent = salaLista
        ? 'Guardar medición (propagador y sala)'
        : 'Guardar medición del propagador';
    } else if (preTraslado && variant === 'cubo') {
      btn.textContent = salaLista
        ? 'Guardar medición (cubo y sala)'
        : 'Guardar medición del cubo';
    } else {
      btn.textContent = btn.dataset.hcMedirSaveLabelDefault;
    }
  }

  function ensureMedirHrDomoEnPropagadorGrid(cfg, preTraslado, variant, salaLista) {
    var cardHr = document.getElementById('cardHumSala');
    var solMount = document.getElementById('medirFlowSolucion');
    var ambGrid = document.querySelector('#medirAmbienteCard .medir-ambiente-grid');
    if (!cardHr) return;
    if (preTraslado && variant === 'propagador' && !salaLista && solMount) {
      if (cardHr.parentNode !== solMount) {
        solMount.appendChild(cardHr);
      }
      cardHr.classList.remove('setup-hidden');
      setLabelSpan('cardHumSala', 'HR domo');
      setCardIcon('cardHumSala', 'hc-i-droplet');
      return;
    }
    if (preTraslado && variant === 'propagador' && salaLista && ambGrid) {
      if (cardHr.parentNode !== ambGrid) {
        var afterTemp = document.getElementById('cardTempAire');
        if (afterTemp && afterTemp.parentNode === ambGrid) {
          afterTemp.insertAdjacentElement('afterend', cardHr);
        } else {
          ambGrid.insertBefore(cardHr, ambGrid.firstChild);
        }
      }
    }
  }

  function ensureMedirSalaPendienteHint(ambCard, cfg, germ, salaLista) {
    var hint = document.getElementById('hcMedirSalaPendienteHint');
    if (hint) hint.remove();
    if (!germ || salaLista) return;
    if (typeof hcMedirOcultarBloqueSala !== 'function' || !hcMedirOcultarBloqueSala(cfg)) return;
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam !== 'semilla_propagador' && cam !== 'semilla_hidro') return;
    var host = document.getElementById('medirFlow') || document.getElementById('tab-mediciones');
    if (!host) return;
    hint = document.createElement('p');
    hint.id = 'hcMedirSalaPendienteHint';
    hint.className = 'medir-sala-pendiente-hint setup-field-hint setup-field-hint--banner';
    hint.setAttribute('role', 'note');
    hint.innerHTML =
      '<strong>Mediciones de sala:</strong> aparecerán cuando configures la sala y completes el ' +
      '<strong>checklist de montaje</strong> en la pestaña Sala. Hasta entonces registra solo el propagador (agua, HR del domo, volumen…).';
    var actions = host.querySelector('.medir-flow-actions');
    if (actions) {
      host.insertBefore(hint, actions);
    } else {
      host.appendChild(hint);
    }
  }

  function applyMedirAmbienteMountLayout(cfg, germ, salaLista, salaCfg) {
    var mount = document.getElementById('medirFlowAmbienteMount');
    var details = document.getElementById('medirAmbienteDetails');
    if (!mount) return;

    if (typeof hcMedirOcultarBloqueSala === 'function' && hcMedirOcultarBloqueSala(cfg)) {
      mount.classList.add('setup-hidden');
      if (details) {
        details.classList.add('setup-hidden');
        details.open = false;
      }
      return;
    }

    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    var ocultarSalaHastaMontaje =
      germ &&
      !salaLista &&
      (cam === 'semilla_propagador' || cam === 'semilla_hidro');

    if (ocultarSalaHastaMontaje) {
      mount.classList.add('setup-hidden');
      if (details) {
        details.classList.add('setup-hidden');
        details.open = false;
      }
      return;
    }

    var montajePendiente = !!(salaCfg && !salaLista);
    var soloHrGerm = !!(germ && !salaLista && !montajePendiente);

    mount.classList.toggle('setup-hidden', !germ && !montajePendiente && !salaLista);

    if (!details) return;

    details.classList.remove(
      'medir-ambiente-details--montaje-pendiente',
      'medir-ambiente-details--sala-montada',
      'medir-ambiente-details--inline-flat',
      'medir-ambiente-details--solo-hr'
    );

    var summary = details.querySelector('.medir-ambiente-summary');
    var ambLead = document.getElementById('medirAmbienteCard')?.querySelector('.medir-ambiente-lead');

    if (salaLista) {
      details.classList.remove('setup-hidden');
      var ambCardEl = document.getElementById('medirAmbienteCard');
      if (ambCardEl) ambCardEl.classList.remove('setup-hidden');
      details.classList.add('medir-ambiente-details--sala-montada', 'medir-ambiente-details--inline-flat');
      details.open = true;
      if (summary) summary.classList.add('setup-hidden');
      if (ambLead) ambLead.classList.add('setup-hidden');
      return;
    }

    if (soloHrGerm) {
      details.classList.remove('setup-hidden');
      details.classList.add('medir-ambiente-details--inline-flat', 'medir-ambiente-details--solo-hr');
      details.open = true;
      if (summary) summary.classList.add('setup-hidden');
      if (ambLead) ambLead.classList.add('setup-hidden');
      return;
    }

    if (!montajePendiente) {
      details.classList.add('setup-hidden');
      details.open = false;
      if (summary) summary.classList.remove('setup-hidden');
      return;
    }

    details.classList.remove('setup-hidden');
    details.classList.add('medir-ambiente-details--montaje-pendiente');
    details.open = !!details.dataset.hcAmbUserOpened;
    if (summary) summary.classList.remove('setup-hidden');
    if (ambLead) ambLead.classList.add('setup-hidden');
  }

  function refreshMedirSalaAmbienteMedirUi(cfg) {
    cfg = cfg || cfgActiva();
    var variant = hcMedirGermPreTrasladoVariant(cfg);
    var germ = !!variant;
    var salaLista = hcMedirSalaListaParaMedir(cfg);
    var salaCfg = hcMedirSalaConfigurada(cfg);
    var micro = medirGermEtiquetaMicro(variant);

    AMBIENTE_SALA_CARDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var show = hcMedirCardSalaEquipoVisible(id, cfg);
      el.classList.toggle('setup-hidden', !show);
    });

    var banner = document.getElementById('medirAmbienteImportanteBanner');
    if (banner) {
      banner.classList.toggle('setup-hidden', germ || salaLista);
    }

    var kick = document.querySelector('#medirAmbienteDetails .medir-step-kicker');
    var sub = document.querySelector('#medirAmbienteDetails .medir-step-sub');
    var montajePendiente = salaCfg && !salaLista;
    if (kick && sub) {
      if (!kick.dataset.hcMedirKickDefault) kick.dataset.hcMedirKickDefault = kick.textContent;
      if (!sub.dataset.hcMedirSubDefault) sub.dataset.hcMedirSubDefault = sub.textContent;
      if (montajePendiente) {
        kick.textContent = 'Sala · montaje pendiente';
        sub.textContent = 'Completa el checklist en Sala para medir LED, CO₂ y equipamiento';
      } else if (salaLista) {
        kick.textContent = kick.dataset.hcMedirKickDefault;
        sub.textContent = sub.dataset.hcMedirSubDefault;
      } else if (!germ && !salaLista) {
        kick.textContent = 'Ambiente de sala';
        sub.textContent = 'Disponible tras configurar y montar la sala';
      } else {
        kick.textContent = kick.dataset.hcMedirKickDefault;
        sub.textContent = sub.dataset.hcMedirSubDefault;
      }
    }

    var ambCard = document.getElementById('medirAmbienteCard');
    ensureMedirSalaPendienteHint(ambCard, cfg, germ, salaLista);
    applyMedirAmbienteMountLayout(cfg, germ, salaLista, salaCfg);

    if (ambCard) {
      var ambLead = ambCard.querySelector('.medir-ambiente-lead');
      if (ambLead) {
        ambLead.classList.toggle('setup-hidden', germ || salaLista || montajePendiente);
      }
    }

    var ambDet = document.getElementById('medirAmbienteDetails');
    if (ambDet && !ambDet.dataset.hcAmbToggleBound) {
      ambDet.dataset.hcAmbToggleBound = '1';
      ambDet.addEventListener('toggle', function () {
        if (ambDet.open) ambDet.dataset.hcAmbUserOpened = '1';
        else delete ambDet.dataset.hcAmbUserOpened;
      });
    }
  }

  function hookMedirGerminacion() {
    if (global._hcMedirGermHooked) return;
    global._hcMedirGermHooked = true;

    var prevRangos = global.actualizarRangosParametrosMedir;
    if (typeof prevRangos === 'function') {
      global.actualizarRangosParametrosMedir = function (cfg) {
        cfg = cfg || cfgActiva();
        if (hcMedirGermPreTrasladoActivo(cfg)) {
          actualizarRangosParametrosMedirGerm(cfg);
          return;
        }
        return prevRangos(cfg);
      };
    }

    var prevEval = global.evalParam;
    if (typeof prevEval === 'function') {
      global.evalParam = function () {
        if (hcMedirGermPreTrasladoActivo()) {
          evalParamGerminacion();
          return;
        }
        return prevEval();
      };
    }

    if (typeof global.evalAmbiente === 'function') {
      var prevAmb = global.evalAmbiente;
      global.evalAmbiente = function () {
        if (hcMedirGermPreTrasladoActivo()) {
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
  global.hcMedirModoGerminacionCubo = hcMedirModoGerminacionCubo;
  global.hcMedirGermPreTrasladoActivo = hcMedirGermPreTrasladoActivo;
  global.hcMedirGermPreTrasladoVariant = hcMedirGermPreTrasladoVariant;
  global.hcMedirPermiteRegistroGerminacion = hcMedirGermPreTrasladoActivo;
  global.refreshMedirGerminacionUi = refreshMedirGerminacionUi;
  global.refreshMedirSalaAmbienteMedirUi = refreshMedirSalaAmbienteMedirUi;
  global.hcMedirSalaAmbienteDisponible = hcMedirSalaAmbienteDisponible;
  global.hcMedirSalaListaParaMedir = hcMedirSalaListaParaMedir;
  global.hcMedirOcultarBloqueSala = hcMedirOcultarBloqueSala;
  global.hcMedirSalaConfigurada = hcMedirSalaConfigurada;
  global.hcMedirCardSalaEquipoVisible = hcMedirCardSalaEquipoVisible;
  global.refreshMedirPropagadorTabChrome = refreshMedirPropagadorTabChrome;
  global.evalParamGerminacion = evalParamGerminacion;
  global.evaluarMedicionGerminacion = evaluarMedicionGerminacion;
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
