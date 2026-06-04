/**
 * Medir (registro) vs Sala (config) + sub-pestañas Sala + desplegables.
 * Equipamiento y montaje → Sala (#salaCultivoEquipMount). Esquejes/semillero → Cultivo (#sistemaCultivoExtras).
 */
(function () {
  var SALA_SUB_ORDER = ['agua', 'iot', 'recarga'];

  var SALA_GROUPS = {
    agua: [
      'panelLocalidadMeteo',
      'configPanel',
      'salaCultivoEquipMount',
      'panelGrowRoomSala',
      'panelConfigInteriorGrow',
      'panelMedirCalentadorConsigna',
    ],
    iot: ['medirIotCard'],
    recarga: ['recargaCardMediciones'],
  };

  var salaSubActive = 'agua';
  window.salaSubActive = salaSubActive;

  function ensureGuiaWrap() {
    var monitor = document.getElementById('medirMonitorCard');
    var protocol = document.getElementById('medirProtocoloCard');
    if (!monitor || !protocol || document.getElementById('medirGuiaDiaCard')) return;

    var wrap = document.createElement('div');
    wrap.className = 'card medir-guia-card';
    wrap.id = 'medirGuiaDiaCard';

    var head = document.createElement('button');
    head.type = 'button';
    head.className = 'config-section-collapse-head medir-disclosure-main-head medir-guia-head is-collapsed';
    head.id = 'btnMedirGuiaDia';
    head.setAttribute('aria-expanded', 'false');
    head.setAttribute('aria-controls', 'medirGuiaDiaBody');
    head.innerHTML =
      '<span class="config-section-collapse-title medir-tareas-head">' +
      '<span class="medir-tareas-badge medir-tareas-badge--pend" id="medirTareasHoyBadge" aria-live="polite">0/0</span>' +
      '<span class="medir-tareas-head-text">' +
      '<svg class="hc-ico hc-ico--title-inline" aria-hidden="true" focusable="false"><use href="#hc-i-clipboard"/></svg> ' +
      'Tareas para hoy</span></span>' +
      '<span class="config-section-collapse-chevron" aria-hidden="true">▼</span>';

    var body = document.createElement('div');
    body.className = 'config-section-collapse-body medir-guia-body';
    body.id = 'medirGuiaDiaBody';
    body.hidden = true;

    head.addEventListener('click', function () {
      var open = body.hidden;
      body.hidden = !open;
      head.classList.toggle('is-collapsed', !open);
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && typeof renderMonitorSistemaPanel === 'function') renderMonitorSistemaPanel();
    });

    var anchor =
      document.getElementById('medirPropagadorFaseBanner') ||
      document.getElementById('medirTorreBanner');
    if (anchor && anchor.parentNode) {
      anchor.insertAdjacentElement('afterend', wrap);
    } else if (monitor.parentNode) {
      monitor.parentNode.insertBefore(wrap, monitor);
    }
    wrap.appendChild(head);
    wrap.appendChild(body);
    body.appendChild(monitor);
    body.appendChild(protocol);
    try {
      if (typeof refreshMedirTareasHoyBadge === 'function') refreshMedirTareasHoyBadge();
      if (typeof renderMonitorSistemaPanel === 'function') renderMonitorSistemaPanel();
      var estado =
        typeof getEstadoControlSistema === 'function' ? getEstadoControlSistema() : null;
      if (estado && estado.resumen) {
        var pend =
          estado.resumen.diarioTotal +
          estado.resumen.semanalTotal -
          (estado.resumen.diarioOk + estado.resumen.semanalOk);
        if (pend > 0) {
          body.hidden = false;
          head.classList.remove('is-collapsed');
          head.setAttribute('aria-expanded', 'true');
        }
      }
    } catch (_) {}
  }

  function ensureAmbienteSaveFooter(card) {
    if (!card || card.querySelector('.medir-ambiente-save-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'medir-ambiente-save-wrap';
    wrap.innerHTML =
      '<p class="medir-ambiente-save-hint">' +
      'Depósito y ambiente se guardan juntos en el registro, el historial y la comprobación de rangos.</p>' +
      '<button type="button" class="btn btn-primary medir-save-btn medir-save-btn--inline" onclick="guardarMedicion()">' +
      'Guardar medición</button>';
    card.appendChild(wrap);
  }

  function wrapAmbienteCollapsible() {
    var card = document.getElementById('medirAmbienteCard');
    if (!card || card.closest('details.medir-ambiente-details')) {
      if (card) ensureAmbienteSaveFooter(card);
      return;
    }

    var details = document.createElement('details');
    details.className = 'medir-ambiente-details card';
    details.id = 'medirAmbienteDetails';

    var summary = document.createElement('summary');
    summary.className = 'medir-ambiente-summary';
    summary.innerHTML =
      '<span class="medir-step-head medir-step-head--ambiente">' +
      '<span class="medir-step-head-icon medir-step-head-icon--ambiente" aria-hidden="true">' +
      '<svg class="hc-ico" focusable="false"><use href="#hc-i-home"/></svg></span>' +
      '<span class="medir-step-head-text">' +
      '<span class="medir-step-kicker">Paso 2 · opcional</span>' +
      '<span class="medir-step-sub">Ambiente de sala · temp, HR, VPD, luz, CO₂</span>' +
      '</span></span>' +
      '<span class="config-section-collapse-chevron" aria-hidden="true">▼</span>';

    card.parentNode.insertBefore(details, card);
    details.appendChild(summary);
    details.appendChild(card);

    var title = card.querySelector('.card-title');
    if (title) title.remove();
    var lead = card.querySelector('.medir-ambiente-lead');
    if (lead) lead.classList.add('medir-ambiente-lead--in-details');
    var ambGrid = card.querySelector('.medir-ambiente-grid');
    if (ambGrid) ambGrid.classList.add('medir-ambiente-grid--premium');
    ensureAmbienteSaveFooter(card);
  }

  /** «Tareas para hoy» justo debajo del banner de instalación / propagador. */
  function repositionMedirGuiaDiaTop() {
    var guia = document.getElementById('medirGuiaDiaCard');
    var tab = document.getElementById('tab-mediciones');
    if (!guia || !tab) return;
    var anchor =
      document.getElementById('medirPropagadorFaseBanner') ||
      document.getElementById('medirTorreBanner');
    if (!anchor) return;
    if (guia.parentNode === tab && guia.previousElementSibling === anchor) return;
    anchor.insertAdjacentElement('afterend', guia);
  }

  function ensureMedirFlowAmbienteMount() {
    var flow = document.getElementById('medirFlow');
    if (!flow) return null;
    var mount = document.getElementById('medirFlowAmbienteMount');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'medirFlowAmbienteMount';
      mount.className = 'medir-flow-ambiente-mount';
      var actions = flow.querySelector('.medir-flow-actions');
      if (actions) flow.insertBefore(mount, actions);
      else flow.appendChild(mount);
    }
    return mount;
  }

  function mountAmbienteInMedirFlow() {
    var mount = ensureMedirFlowAmbienteMount();
    var details = document.getElementById('medirAmbienteDetails');
    if (!mount || !details || details.parentNode === mount) return;
    mount.appendChild(details);
  }

  function buildMedirFlow() {
    var tab = document.getElementById('tab-mediciones');
    var banner = document.getElementById('medirTorreBanner');
    var sync = document.getElementById('medirMedicionSyncFields');
    if (!tab || !banner || !sync || document.getElementById('medirFlow')) return;

    var flow = document.createElement('section');
    flow.className = 'medir-flow';
    flow.id = 'medirFlow';
    flow.innerHTML =
      '<p class="medir-flow-lead">' +
      'Valores del depósito. Evaluación al instante.' +
      '</p>' +
      '<div class="medir-quick-parse medir-quick-parse--premium">' +
      '<div class="medir-quick-parse-head">' +
      '<span class="medir-quick-parse-icon" aria-hidden="true"><svg class="hc-ico" focusable="false"><use href="#hc-i-sparkle"/></svg></span>' +
      '<label class="form-label medir-quick-label" for="medirQuickInput">Entrada rápida</label>' +
      '</div>' +
      '<div class="medir-quick-parse-row">' +
      '<input id="medirQuickInput" class="form-input medir-quick-input" type="text" inputmode="text" autocomplete="off" ' +
      'placeholder="EC 1350 · pH 6.0 · T 20 · V 18">' +
      '<button type="button" class="btn btn-secondary btn-sm medir-quick-apply" onclick="hcMedirTabQuickApply()">Aplicar</button>' +
      '</div>' +
      '<p id="medirQuickParseHint" class="medir-quick-hint" role="status" aria-live="polite"></p>' +
      '</div>' +
      '<div class="medir-step-panel medir-step-panel--solucion">' +
      '<div class="medir-step-head medir-step-head--solucion">' +
      '<span class="medir-step-head-icon medir-step-head-icon--solucion" aria-hidden="true">' +
      '<svg class="hc-ico" focusable="false"><use href="#hc-i-droplet"/></svg></span>' +
      '<span class="medir-step-head-text">' +
      '<span class="medir-step-kicker medir-step-kicker--solucion">Paso 1 · solución</span>' +
      '<span class="medir-step-sub">EC, pH, temperatura y volumen del depósito</span>' +
      '</span></div>' +
      '<div id="medirFlowSolucion" class="medir-flow-solucion-mount"></div>' +
      '</div>' +
      '<div id="medirFlowAmbienteMount" class="medir-flow-ambiente-mount"></div>' +
      '<div class="medir-flow-actions">' +
      '<button type="button" id="btnGuardarMedicion" class="btn btn-primary medir-save-btn" onclick="guardarMedicion()">' +
      'Guardar medición</button>' +
      '<button type="button" class="quick-btn quick-btn-info medir-flow-secondary" data-quick-icon="asistentepro" onclick="abrirWizardMedicion()" ' +
      'aria-haspopup="dialog" aria-controls="modalWizardMedicion">' +
      '<span class="quick-btn-icon" aria-hidden="true"><svg class="hc-ico hc-ico--ion-quick" focusable="false"><use href="#hc-i-clipboard"/></svg></span>' +
      '<span>Asistente guiado</span></button>' +
      '<button type="button" class="quick-btn medir-flow-secondary" data-quick-icon="toolspro" onclick="abrirHerramientasPro()" ' +
      'aria-haspopup="dialog" aria-controls="modalHerramientasPro">' +
      '<span class="quick-btn-icon" aria-hidden="true"><svg class="hc-ico hc-ico--ion-quick" focusable="false"><use href="#hc-i-wrench"/></svg></span>' +
      '<span>Herramientas</span></button>' +
      '<button type="button" class="quick-btn medir-flow-secondary" data-quick-icon="equipo" onclick="goTab(\'sistema\')">' +
      '<span class="quick-btn-icon" aria-hidden="true"><svg class="hc-ico hc-ico--ion-quick" focusable="false"><use href="#hc-i-plug"/></svg></span>' +
      '<span>Equipamiento</span></button>' +
      '<button type="button" class="quick-btn medir-flow-link-sala" onclick="goTabSala(\'iot\')">' +
      '<span class="quick-btn-icon" aria-hidden="true"><svg class="hc-ico hc-ico--ion-quick" focusable="false"><use href="#hc-i-bolt"/></svg></span>' +
      '<span>Sensores IoT</span></button>' +
      '</div>';

    banner.insertAdjacentElement('afterend', flow);

    var quickInp = document.getElementById('medirQuickInput');
    if (quickInp) {
      quickInp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (typeof hcMedirTabQuickApply === 'function') hcMedirTabQuickApply();
        }
      });
    }

    var solMount = document.getElementById('medirFlowSolucion');
    sync.classList.remove('setup-hidden');
    sync.removeAttribute('aria-hidden');
    sync.classList.add('medir-solucion-grid', 'medir-solucion-grid--premium');
    solMount.appendChild(sync);

    var ultima = document.getElementById('ultimaMedicionCard');
    if (ultima) flow.insertAdjacentElement('afterend', ultima);

    tab.querySelectorAll('.medir-assistant-cta-wrap, .guardar-medicion-bar').forEach(function (n) {
      n.remove();
    });
  }

  function buildSalaSubTabs() {
    var mount = document.getElementById('tabSalaMount');
    if (!mount || document.getElementById('salaSubTabs')) return;

    var shell = document.createElement('div');
    shell.className = 'sala-sub-shell';
    shell.innerHTML =
      '<div class="sala-sub-tabs hist-tabs" id="salaSubTabs" role="tablist" aria-label="Apartados de sala de cultivo">' +
      '<button type="button" class="hist-tab active" role="tab" id="stab-agua" aria-selected="true" aria-controls="salaPanelAgua" onclick="salaSubTab(\'agua\')">' +
      '<svg class="hc-ico" aria-hidden="true" focusable="false"><use href="#hc-i-droplet"/></svg> Agua y ubicación</button>' +
      '<button type="button" class="hist-tab" role="tab" id="stab-iot" aria-selected="false" aria-controls="salaPanelIot" onclick="salaSubTab(\'iot\')">' +
      '<svg class="hc-ico" aria-hidden="true" focusable="false"><use href="#hc-i-bolt"/></svg> IoT</button>' +
      '<button type="button" class="hist-tab" role="tab" id="stab-recarga" aria-selected="false" aria-controls="salaPanelRecarga" onclick="salaSubTab(\'recarga\')">' +
      '<svg class="hc-ico" aria-hidden="true" focusable="false"><use href="#hc-i-refresh"/></svg> Recarga</button>' +
      '</div>';

    SALA_SUB_ORDER.forEach(function (key) {
      var panel = document.createElement('div');
      panel.className = 'sala-sub-panel hist-tabpanel';
      panel.id = 'salaPanel' + key.charAt(0).toUpperCase() + key.slice(1);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', 'stab-' + key);
      if (key !== 'agua') {
        panel.classList.add('setup-hidden');
        panel.setAttribute('aria-hidden', 'true');
      }
      shell.appendChild(panel);
    });

    mount.parentNode.insertBefore(shell, mount);
    shell.appendChild(mount);
    mount.classList.add('sala-sub-mount-inner');

    SALA_SUB_ORDER.forEach(function (key) {
      var panel = document.getElementById('salaPanel' + key.charAt(0).toUpperCase() + key.slice(1));
      (SALA_GROUPS[key] || []).forEach(function (id) {
        var el = document.getElementById(id);
        if (el && panel) panel.appendChild(el);
      });
    });
  }

  function salaRecargaSubTabVisible(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    if (typeof hcRecargaCompletaAplicaEnCamino === 'function') {
      return hcRecargaCompletaAplicaEnCamino(cfg);
    }
    return true;
  }

  var SALA_PANELES_DUPLICADOS_MEDIR = [
    'configPanel',
    'panelGrowRoomSala',
    'panelConfigInteriorGrow',
    'panelLocalidadMeteo',
  ];

  function refreshSalaPanelesDuplicadosMedirUi(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    var ocultar =
      typeof hcSalaOcultarPanelesDuplicadosMedir === 'function' &&
      hcSalaOcultarPanelesDuplicadosMedir(cfg);
    SALA_PANELES_DUPLICADOS_MEDIR.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('setup-hidden', ocultar);
      el.setAttribute('aria-hidden', ocultar ? 'true' : 'false');
    });
    var stabAgua = document.getElementById('stab-agua');
    if (stabAgua) {
      var label = ocultar ? 'Equipamiento' : 'Agua y ubicación';
      var icon = ocultar ? '#hc-i-plug' : '#hc-i-droplet';
      stabAgua.innerHTML =
        '<svg class="hc-ico" aria-hidden="true" focusable="false"><use href="' +
        icon +
        '"/></svg> ' +
        label;
    }
    var shell = document.getElementById('tabSalaMount');
    if (shell) shell.classList.toggle('sala-sub-shell--solo-equip', ocultar);
  }

  function refreshSalaSubTabsCaminoUi(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    refreshSalaPanelesDuplicadosMedirUi(cfg);
    var showRecarga = salaRecargaSubTabVisible(cfg);
    var btnRec = document.getElementById('stab-recarga');
    var panelRec = document.getElementById('salaPanelRecarga');
    var tabs = document.getElementById('salaSubTabs');
    if (btnRec) btnRec.classList.toggle('setup-hidden', !showRecarga);
    if (panelRec && !showRecarga) {
      panelRec.classList.add('setup-hidden');
      panelRec.setAttribute('aria-hidden', 'true');
    }
    if (tabs) tabs.classList.toggle('sala-sub-tabs--sin-recarga', !showRecarga);
    if (!showRecarga && salaSubActive === 'recarga') {
      salaSubTab('agua');
    }
  }

  function salaSubTab(key) {
    if (SALA_SUB_ORDER.indexOf(key) < 0) key = 'agua';
    if (key === 'recarga' && !salaRecargaSubTabVisible()) key = 'agua';
    salaSubActive = key;
    window.salaSubActive = key;
    SALA_SUB_ORDER.forEach(function (k) {
      var panel = document.getElementById('salaPanel' + k.charAt(0).toUpperCase() + k.slice(1));
      var btn = document.getElementById('stab-' + k);
      var on = k === key;
      if (panel) {
        panel.classList.toggle('setup-hidden', !on);
        panel.setAttribute('aria-hidden', on ? 'false' : 'true');
      }
      if (btn) {
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
        btn.tabIndex = on ? 0 : -1;
      }
    });
    if (key === 'iot') {
      requestAnimationFrame(function () {
        if (salaSubActive !== 'iot') return;
        if (typeof renderIotPanel === 'function') renderIotPanel();
      });
    }
    if (key === 'recarga' && salaRecargaSubTabVisible()) {
      requestAnimationFrame(function () {
        if (salaSubActive !== 'recarga') return;
        if (typeof updateRecargaBar === 'function') updateRecargaBar();
        if (typeof actualizarResumenReposicionParcialUI === 'function') {
          actualizarResumenReposicionParcialUI();
        }
      });
    }
    try {
      document.getElementById('stab-' + key)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } catch (_) {}
  }

  function bindSalaEquipCollapsibles() {
    var det = document.getElementById('sistemaEquipDetails');
    if (det && !det.dataset.hcEquipBound) {
      det.dataset.hcEquipBound = '1';
      det.addEventListener('toggle', function () {
        if (!det.open) det.dataset.hcEquipUserClosed = '1';
        if (det.open && typeof renderMedirEquipamientoPanel === 'function') {
          renderMedirEquipamientoPanel();
        }
      });
    }
    if (det && typeof getCamposEquipamientoFaltantes === 'function') {
      var cfgEq = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
      var falt = getCamposEquipamientoFaltantes(cfgEq);
      var salaCfgOk =
        typeof salaPreGermConfigurada === 'function' && salaPreGermConfigurada(cfgEq);
      if (falt.length && !det.open && !salaCfgOk) det.open = true;
    }
    var montajeDet = document.getElementById('sistemaMontajeChecksDetails');
    if (montajeDet && !montajeDet.dataset.hcMontajeBound) {
      montajeDet.dataset.hcMontajeBound = '1';
      montajeDet.addEventListener('toggle', function () {
        if (!montajeDet.open) montajeDet.dataset.hcMontajeUserClosed = '1';
        if (montajeDet.open && typeof hcRefreshPuestaMarchaUi === 'function') {
          hcRefreshPuestaMarchaUi();
        }
      });
    }
    var cfgPm = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    var vistaMinMontaje =
      typeof hcSalaPropagadorVistaMinimaSoloMontaje === 'function' &&
      hcSalaPropagadorVistaMinimaSoloMontaje(cfgPm);
    if (
      montajeDet &&
      cfgPm.puestaMarchaChecks &&
      !cfgPm.puestaMarchaChecks.completedAt &&
      !montajeDet.open &&
      !vistaMinMontaje
    ) {
      montajeDet.open = true;
    }
  }

  function refreshSalaEquipMontaje(opts) {
    opts = opts || {};
    bindSalaEquipCollapsibles();
    var det = document.getElementById('sistemaEquipDetails');
    var montajeDet = document.getElementById('sistemaMontajeChecksDetails');
    if (opts.lightOnly) {
      if (typeof refreshSistemaEquipResumen === 'function') refreshSistemaEquipResumen();
      return;
    }
    if (det && det.open && typeof renderMedirEquipamientoPanel === 'function') {
      renderMedirEquipamientoPanel();
    } else if (typeof refreshSistemaEquipResumen === 'function') {
      refreshSistemaEquipResumen();
    }
    if (montajeDet && montajeDet.open && typeof hcRefreshPuestaMarchaUi === 'function') {
      hcRefreshPuestaMarchaUi();
    }
    if (typeof refreshLuzOrigenUI === 'function') refreshLuzOrigenUI();
  }

  var _hcSalaHeavyGen = 0;
  var _hcSalaHeavySig = '';
  var _hcSalaHeavyAt = 0;
  var SALA_HEAVY_TTL_MS = 14000;

  function salaConfigRefreshSig(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    return [
      cfg.caminoCultivo || '',
      cfg.faseCamino || '',
      cfg.ubicacion || '',
      cfg.tipoInstalacion || '',
      salaSubActive,
      !!cfg.montajeSalaPreGermOk,
      typeof hcSalaOcultarPanelesDuplicadosMedir === 'function' &&
        hcSalaOcultarPanelesDuplicadosMedir(cfg),
      salaRecargaSubTabVisible(cfg),
    ].join('|');
  }

  function salaPanelesAguaVisibles(cfg) {
    return !(
      typeof hcSalaOcultarPanelesDuplicadosMedir === 'function' &&
      hcSalaOcultarPanelesDuplicadosMedir(cfg)
    );
  }

  function refreshSalaTabLight(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    refreshSalaSubTabsCaminoUi(cfg);
    if (typeof applySalaMontajeRecomendadoUi === 'function') applySalaMontajeRecomendadoUi(cfg);
    refreshSalaEquipMontaje({ lightOnly: true });
    if (typeof renderSalaSeguimientoCta === 'function') renderSalaSeguimientoCta();
  }

  function refreshSalaTabHeavy(cfg, opts) {
    opts = opts || {};
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    var tabEl = document.getElementById('tab-sala');
    if (!tabEl || !tabEl.classList.contains('active')) return;

    var sig = salaConfigRefreshSig(cfg);
    var now = Date.now();
    if (!opts.force && sig === _hcSalaHeavySig && now - _hcSalaHeavyAt < SALA_HEAVY_TTL_MS) {
      return;
    }

    var showAgua = salaPanelesAguaVisibles(cfg);
    var showRecarga = salaRecargaSubTabVisible(cfg);
    var sub = salaSubActive;

    if (showAgua) {
      if (typeof initConfigUI === 'function') initConfigUI();
      if (typeof cargarGrowRoomUI === 'function') cargarGrowRoomUI();
      if (typeof actualizarVisibilidadPanelInteriorGrow === 'function') {
        actualizarVisibilidadPanelInteriorGrow();
      }
      if (typeof cargarInteriorGrowUI === 'function') cargarInteriorGrowUI();
    }
    if (typeof actualizarVisibilidadPanelCalentadorConsigna === 'function') {
      actualizarVisibilidadPanelCalentadorConsigna();
    }
    if (sub === 'iot' && typeof renderIotPanel === 'function') renderIotPanel();
    if (showRecarga && sub === 'recarga') {
      if (typeof updateRecargaBar === 'function') updateRecargaBar();
      if (typeof actualizarResumenReposicionParcialUI === 'function') {
        actualizarResumenReposicionParcialUI();
      }
    }
    refreshSalaEquipMontaje();
    if (typeof renderSalaSeguimientoCta === 'function') renderSalaSeguimientoCta();

    _hcSalaHeavySig = sig;
    _hcSalaHeavyAt = now;
  }

  function scheduleHcRefreshSalaTabHeavy(force) {
    var gen = ++_hcSalaHeavyGen;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (gen !== _hcSalaHeavyGen) return;
        if (typeof currentTab !== 'undefined' && currentTab !== 'sala') return;
        refreshSalaTabHeavy(undefined, { force: !!force });
      });
    });
  }

  function refreshSalaTab(opts) {
    opts = opts || {};
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    refreshSalaTabLight(cfg);
    if (opts.lightOnly) return;
    if (opts.deferHeavy) {
      scheduleHcRefreshSalaTabHeavy(!!opts.force);
      return;
    }
    refreshSalaTabHeavy(cfg, opts);
  }

  function refreshSistemaCultivoExtras() {
    if (typeof renderMedirEsquejesPanel === 'function') renderMedirEsquejesPanel();
    if (typeof renderMedirSemilleroPanel === 'function') renderMedirSemilleroPanel();
    if (typeof renderMedirGeneticaBreederPanel === 'function') renderMedirGeneticaBreederPanel();
    if (typeof renderMedirEsquejesPanel === 'function') renderMedirEsquejesPanel();
  }

  function initMedirSalaLayout() {
    try {
      buildSalaSubTabs();
      buildMedirFlow();
      ensureGuiaWrap();
      wrapAmbienteCollapsible();
      mountAmbienteInMedirFlow();
      salaSubTab(salaSubActive);
      refreshSalaSubTabsCaminoUi();
      refreshSalaEquipMontaje();
      refreshSistemaCultivoExtras();
      if (typeof repositionMedirGuiaDiaTop === 'function') repositionMedirGuiaDiaTop();
      if (typeof refreshMedirGerminacionUi === 'function') {
        refreshMedirGerminacionUi();
      }
    } catch (e) {
      try {
        console.warn('initMedirSalaLayout', e);
      } catch (_) {}
    }
  }

  window.salaSubTab = salaSubTab;
  window.refreshSalaSubTabsCaminoUi = refreshSalaSubTabsCaminoUi;
  window.refreshSalaPanelesDuplicadosMedirUi = refreshSalaPanelesDuplicadosMedirUi;
  window.goTabSala = function (sub) {
    if (typeof goTab === 'function') goTab('sala');
    setTimeout(function () {
      if (sub) salaSubTab(sub);
    }, 60);
  };
  window.hcMedirTabQuickApply = function () {
    var inp = document.getElementById('medirQuickInput');
    if (!inp) return false;
    return typeof hcApplyMedirTabQuick === 'function' ? hcApplyMedirTabQuick(inp.value) : false;
  };
  window.hcRefreshSalaTab = refreshSalaTab;
  window.hcRefreshSalaTabLight = refreshSalaTabLight;
  window.scheduleHcRefreshSalaTabHeavy = scheduleHcRefreshSalaTabHeavy;
  window.hcInvalidateSalaTabHeavyCache = function () {
    _hcSalaHeavySig = '';
    _hcSalaHeavyAt = 0;
  };
  window.hcRefreshSistemaCultivoExtras = refreshSistemaCultivoExtras;
  window.hcRefreshSalaEquipMontaje = refreshSalaEquipMontaje;
  window.hcInitMedirSalaLayout = initMedirSalaLayout;
  window.repositionMedirGuiaDiaTop = repositionMedirGuiaDiaTop;

  function scheduleInitMedirSalaLayout() {
    if (typeof window !== 'undefined' && window._hcMedirSalaLayoutDone) return;
    if (typeof window !== 'undefined' && window._hcMedirSalaLayoutScheduled) return;
    if (typeof window !== 'undefined') window._hcMedirSalaLayoutScheduled = true;
    var run = function () {
      if (typeof window !== 'undefined' && window._hcMedirSalaLayoutDone) return;
      if (typeof window !== 'undefined') window._hcMedirSalaLayoutDone = true;
      initMedirSalaLayout();
    };
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(run, { timeout: 2500 });
    } else {
      setTimeout(run, 600);
    }
  }

  document.addEventListener('DOMContentLoaded', scheduleInitMedirSalaLayout);
})();
