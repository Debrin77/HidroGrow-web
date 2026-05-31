/**
 * Medir (registro) vs Sala (config) + sub-pestañas Sala + desplegables.
 * Equipamiento / esquejes / semillero → Cultivo e instalación (#sistemaCultivoExtras).
 */
(function () {
  var SALA_SUB_ORDER = ['agua', 'iot', 'recarga'];

  var SALA_GROUPS = {
    agua: ['panelLocalidadMeteo', 'configPanel'],
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
      '<span class="config-section-collapse-title">' +
      '<svg class="hc-ico hc-ico--title-inline" aria-hidden="true" focusable="false"><use href="#hc-i-clipboard"/></svg> ' +
      'Guía del día (protocolo y control)</span>' +
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
    });

    monitor.parentNode.insertBefore(wrap, monitor);
    wrap.appendChild(head);
    wrap.appendChild(body);
    body.appendChild(monitor);
    body.appendChild(protocol);
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
      '<span class="medir-step-kicker">Paso 2 · opcional</span>' +
      '<span class="medir-ambiente-summary-title">' +
      '<svg class="hc-ico hc-ico--title-inline" aria-hidden="true" focusable="false"><use href="#hc-i-home"/></svg> ' +
      'Ambiente de sala (temp, HR, VPD, PPFD…)</span>' +
      '<span class="config-section-collapse-chevron" aria-hidden="true">▼</span>';

    card.parentNode.insertBefore(details, card);
    details.appendChild(summary);
    details.appendChild(card);

    var title = card.querySelector('.card-title');
    if (title) title.remove();
    var lead = card.querySelector('.medir-ambiente-lead');
    if (lead) lead.classList.add('medir-ambiente-lead--in-details');
    ensureAmbienteSaveFooter(card);
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
      'Introduce los valores del <strong>depósito</strong> o pega la lectura del medidor. Evaluación al instante.' +
      '</p>' +
      '<div class="medir-quick-parse">' +
      '<label class="form-label medir-quick-label" for="medirQuickInput">Entrada rápida (pegar)</label>' +
      '<div class="medir-quick-parse-row">' +
      '<input id="medirQuickInput" class="form-input medir-quick-input" type="text" inputmode="text" autocomplete="off" ' +
      'placeholder="EC 1350 pH 6.0 T 20 V 18">' +
      '<button type="button" class="btn btn-secondary btn-sm" onclick="hcMedirTabQuickApply()">Aplicar</button>' +
      '</div>' +
      '<p id="medirQuickParseHint" class="medir-quick-hint" role="status" aria-live="polite"></p>' +
      '</div>' +
      '<p class="medir-step-kicker medir-step-kicker--solucion">Paso 1 · solución</p>' +
      '<div id="medirFlowSolucion" class="medir-flow-solucion-mount"></div>' +
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
    sync.classList.add('medir-solucion-grid');
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

  function salaSubTab(key) {
    if (SALA_SUB_ORDER.indexOf(key) < 0) key = 'agua';
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
    try {
      document.getElementById('stab-' + key)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } catch (_) {}
  }

  function refreshSalaTab() {
    if (typeof initConfigUI === 'function') initConfigUI();
    if (typeof renderIotPanel === 'function') renderIotPanel();
    if (typeof updateRecargaBar === 'function') updateRecargaBar();
    if (typeof actualizarResumenReposicionParcialUI === 'function') actualizarResumenReposicionParcialUI();
  }

  function refreshSistemaCultivoExtras() {
    if (typeof renderMedirEquipamientoPanel === 'function') renderMedirEquipamientoPanel();
    if (typeof renderMedirEsquejesPanel === 'function') renderMedirEsquejesPanel();
    if (typeof renderMedirSemilleroPanel === 'function') renderMedirSemilleroPanel();
    var det = document.getElementById('sistemaEquipDetails');
    if (det && typeof getCamposEquipamientoFaltantes === 'function') {
      var falt = getCamposEquipamientoFaltantes();
      if (falt.length && !det.open) det.open = true;
    }
  }

  function initMedirSalaLayout() {
    buildSalaSubTabs();
    buildMedirFlow();
    ensureGuiaWrap();
    wrapAmbienteCollapsible();
    mountAmbienteInMedirFlow();
    salaSubTab(salaSubActive);
    refreshSistemaCultivoExtras();
  }

  window.salaSubTab = salaSubTab;
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
  window.hcRefreshSistemaCultivoExtras = refreshSistemaCultivoExtras;
  window.hcInitMedirSalaLayout = initMedirSalaLayout;

  document.addEventListener('DOMContentLoaded', initMedirSalaLayout);
})();
