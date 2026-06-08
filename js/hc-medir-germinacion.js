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
   * Propagador: sala configurada + checklist de montaje verificado (propagador dentro).
   * Hidro directo: solo equipamiento de sala guardado.
   */
  function hcMedirSalaListaParaMedir(cfg) {
    cfg = cfg || cfgActiva();
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam === 'semilla_propagador') {
      if (typeof salaPreGermConfigurada !== 'function' || !salaPreGermConfigurada(cfg)) {
        return false;
      }
      if (typeof montajeSalaPreGermOk === 'function') {
        return montajeSalaPreGermOk(cfg);
      }
      return !!(cfg.puestaMarchaChecks && cfg.puestaMarchaChecks.completedAt);
    }
    if (cam === 'semilla_hidro') {
      return typeof salaPreGermConfigurada === 'function' && salaPreGermConfigurada(cfg);
    }
    return typeof montajeEstaVerificado === 'function' && montajeEstaVerificado(cfg);
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

  /** Medir propagador: T°/HR/VPD del domo siempre; EC según fase; pH según plan. */
  function getMedirGermActivos(cfg) {
    var plan = getPlanMedirGerm(cfg);
    var activos = keysActivos(plan);
    if (hcMedirModoGerminacionPropagador(cfg)) {
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
      if (activo) {
        flow.classList.remove('medir-flow--pre-operativa');
        flow.setAttribute('aria-hidden', 'false');
      }
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
        var salaLista = hcMedirSalaListaParaMedir(cfg);
        var salaCfg = hcMedirSalaConfigurada(cfg);
        lead.innerHTML = activo
          ? salaLista
            ? '<strong>Propagador:</strong> EC/pH del agua del domo si aplica. T°, HR y notas van en <strong>Historial</strong> y <strong>Calendario</strong>. Con sala montada: parámetros del equipamiento abajo.'
            : salaCfg
              ? '<strong>Propagador:</strong> EC/pH del domo. T°, HR y apuntes en <strong>Historial</strong>. Completa el <strong>checklist de montaje en Sala</strong> para medir LED, CO₂, etc.'
              : '<strong>Propagador:</strong> EC/pH del agua del domo. Anota T°, HR y observaciones en <strong>Historial</strong> (no aquí).'
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
      var ambHead = flow.querySelector('.medir-step-head--inline-amb');
      var salaListaFlow = hcMedirSalaListaParaMedir(cfg);
      if (ambHead) ambHead.classList.toggle('setup-hidden', !salaListaFlow);
      var ambMount = document.getElementById('medirFlowAmbienteMount');
      if (ambMount) ambMount.classList.toggle('setup-hidden', !salaListaFlow);
      flow.querySelectorAll('.medir-flow-actions [onclick*="abrirWizardMedicion"]').forEach(function (btn) {
        btn.classList.toggle('setup-hidden', !!activo);
      });
    }

    var preGate = document.getElementById('medirPreOperativaGate');
    if (preGate && activo) preGate.classList.add('setup-hidden');

    if (activo && typeof actualizarRangosParametrosMedirGerm === 'function') {
      actualizarRangosParametrosMedirGerm(cfg);
      evalParamGerminacion();
    }

    refreshMedirSalaAmbienteMedirUi(cfg);
    refreshMedirAsistentePropagadorBtn(activo);
    refreshMedirPropagadorTabChrome(cfg, activo);
    if (typeof refreshSalaPanelesDuplicadosMedirUi === 'function') {
      refreshSalaPanelesDuplicadosMedirUi(cfg);
    }
    if (typeof applyMedirGuiaProtocoloChrome === 'function') applyMedirGuiaProtocoloChrome(cfg);
    if (activo && typeof repositionMedirFlowPropagadorTop === 'function') {
      repositionMedirFlowPropagadorTop();
    }
    if (typeof repositionMedirGuiaDiaTop === 'function') repositionMedirGuiaDiaTop();
  }

  function refreshMedirPropagadorTabChrome(cfg, activo) {
    cfg = cfg || cfgActiva();
    activo = activo !== undefined ? activo : hcMedirModoGerminacionPropagador(cfg);
    var tab = document.getElementById('tab-mediciones');
    if (tab) tab.classList.toggle('medir-tab--propagador', !!activo);

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
      if (n) n.classList.toggle('setup-hidden', !!activo);
    });
    if (tab) {
      var notas = tab.querySelector('.medir-notas-card');
      if (notas) notas.classList.toggle('setup-hidden', !!activo);
      tab.querySelectorAll('.medir-assistant-cta-wrap, .guardar-medicion-bar').forEach(function (n) {
        n.classList.toggle('setup-hidden', !!activo);
      });
    }

    var loc = document.getElementById('panelLocalidadMeteo');
    if (loc) {
      loc.classList.toggle('medir-localidad--propagador', !!activo);
      if (activo) loc.classList.add('setup-hidden');
    }

    var titleWrap = tab && tab.querySelector('.section-title > span');
    if (titleWrap) {
      if (!titleWrap.dataset.hcMedirTitleDefault) {
        titleWrap.dataset.hcMedirTitleDefault = titleWrap.innerHTML;
      }
      titleWrap.innerHTML = activo
        ? '<span class="accent">Medir</span> · domo y sala'
        : titleWrap.dataset.hcMedirTitleDefault;
    }
  }

  function refreshMedirAsistentePropagadorBtn(activo) {
    var flow = document.getElementById('medirFlow');
    if (!flow) return;
    var btn = flow.querySelector('.medir-flow-actions [data-quick-icon="asistentepro"]');
    if (!btn) return;
    var labelSpan = btn.querySelector('span:last-of-type');
    if (labelSpan && !btn.dataset.hcAsistLabelDefault) {
      btn.dataset.hcAsistLabelDefault = labelSpan.textContent;
    }
    if (activo) {
      btn.setAttribute('aria-label', 'Abrir asistente de medición del domo propagador');
      if (labelSpan) labelSpan.textContent = 'Asistente domo';
    } else {
      btn.setAttribute('aria-label', 'Abrir Asistente de mediciones');
      if (labelSpan && btn.dataset.hcAsistLabelDefault) {
        labelSpan.textContent = btn.dataset.hcAsistLabelDefault;
      }
    }
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
    var salaCfg = hcMedirSalaConfigurada(cfg);
    var prop =
      typeof getCaminoCultivo === 'function' && getCaminoCultivo(cfg) === 'semilla_propagador';
    var cfgBtn = prop
      ? '<button type="button" class="btn btn-link btn-sm" onclick="typeof abrirConfiguradorEquipamientoSalaPropagador===\'function\'&&abrirConfiguradorEquipamientoSalaPropagador()">Configurar sala</button>'
      : '<button type="button" class="btn btn-link btn-sm" onclick="typeof abrirSetupFaseSala===\'function\'&&abrirSetupFaseSala()">Configurar sala</button>';
    var montajeBtn =
      '<button type="button" class="btn btn-link btn-sm" onclick="typeof hcIrMontajeSala===\'function\'&&hcIrMontajeSala()">checklist de montaje en Sala</button>';
    if (germ && !salaCfg) {
      hint.innerHTML =
        '<strong>Solo domo por ahora.</strong> Registra <strong>T°, HR y VPD del propagador</strong>. ' +
        'Los parámetros del resto del equipamiento de la sala (LED, CO₂, etc.) aparecen tras ' +
        cfgBtn +
        '.';
    } else if (germ && salaCfg) {
      hint.innerHTML =
        '<strong>Sala configurada.</strong> Completa el ' +
        montajeBtn +
        ' (propagador montado y operativo) para registrar PPFD, CO₂ y el resto según tu equipamiento.';
    } else {
      hint.innerHTML =
        '<strong>Sala / montaje pendiente.</strong> Luz (PPFD), CO₂ y temp. exterior se activan tras el montaje verificado. ' +
        cfgBtn +
        '.';
    }
  }

  function refreshMedirSalaAmbienteMedirUi(cfg) {
    cfg = cfg || cfgActiva();
    var germ = hcMedirModoGerminacionPropagador(cfg);
    var salaLista = hcMedirSalaListaParaMedir(cfg);
    var salaCfg = hcMedirSalaConfigurada(cfg);

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
    if (kick && sub) {
      if (!kick.dataset.hcMedirKickDefault) kick.dataset.hcMedirKickDefault = kick.textContent;
      if (!sub.dataset.hcMedirSubDefault) sub.dataset.hcMedirSubDefault = sub.textContent;
      if (germ) {
        kick.textContent = salaLista ? 'Domo y sala montada' : salaCfg ? 'Domo · sala pendiente montaje' : 'Domo propagador';
        sub.textContent = salaLista
          ? 'T°, HR y VPD del domo · parámetros del equipamiento de sala según catálogo'
          : salaCfg
            ? 'T°, HR y VPD del domo — completa el checklist de montaje en Sala'
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

    if (germ && salaLista) {
      var ambDet = document.getElementById('medirAmbienteDetails');
      if (ambDet && !ambDet.dataset.hcAmbUserClosed) ambDet.open = true;
    }

    if (ambCard) {
      var ambLead = ambCard.querySelector('.medir-ambiente-lead');
      if (ambLead) {
        if (!ambLead.dataset.hcMedirLeadDefault) ambLead.dataset.hcMedirLeadDefault = ambLead.textContent;
        if (germ) {
          ambLead.textContent = salaLista
            ? 'Parámetros del equipamiento de sala (LED, CO₂, extractor…). T°/HR del domo: Historial.'
            : salaCfg
              ? 'Tras el checklist de montaje en Sala aparecerán parámetros del equipamiento. T°/HR del domo: Historial.'
              : 'T° y HR del domo se registran en Historial, no en Medir.';
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
  global.hcMedirSalaListaParaMedir = hcMedirSalaListaParaMedir;
  global.hcMedirSalaConfigurada = hcMedirSalaConfigurada;
  global.hcMedirCardSalaEquipoVisible = hcMedirCardSalaEquipoVisible;
  global.refreshMedirPropagadorTabChrome = refreshMedirPropagadorTabChrome;
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
