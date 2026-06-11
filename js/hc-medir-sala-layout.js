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
    var refreshGuiaPanels = function () {
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
    };
    setTimeout(refreshGuiaPanels, 32);
  }

  function ensureAmbienteSaveFooter(card) {
    if (!card) return;
    var cfg =
      typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
    var salaLista =
      typeof hcMedirSalaListaParaMedir === 'function' && hcMedirSalaListaParaMedir(cfg);
    var existing = card.querySelector('.medir-ambiente-save-wrap');
    if (!salaLista) {
      if (existing) existing.remove();
      return;
    }
    var hintHtml =
      '<p class="medir-ambiente-save-hint">Usa el botón <strong>Guardar medición</strong> al final del bloque para registrar propagador y sala juntos.</p>';
    if (existing) {
      existing.innerHTML = hintHtml;
      return;
    }
    var wrap = document.createElement('div');
    wrap.className = 'medir-ambiente-save-wrap';
    wrap.innerHTML = hintHtml;
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
    if (ambGrid) ambGrid.classList.add('medir-ambiente-grid--premium', 'medir-param-lab-grid');
    ensureAmbienteSaveFooter(card);
    if (typeof ensureMedirParamTileChrome === 'function') ensureMedirParamTileChrome();
  }

  function applyMedirGuiaProtocoloChrome(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    var germ =
      (typeof window.hcMedirGermPreTrasladoActivo === 'function' &&
        window.hcMedirGermPreTrasladoActivo(cfg)) ||
      (typeof window.hcMedirModoGerminacionPropagador === 'function' &&
        window.hcMedirModoGerminacionPropagador(cfg));
    var ocultarSeguimiento =
      typeof hcSemillaHidroOcultarSeguimientoMedir === 'function' &&
      hcSemillaHidroOcultarSeguimientoMedir(cfg);
    var guia = document.getElementById('medirGuiaDiaCard');
    var monitor = document.getElementById('medirMonitorCard');
    var protocol = document.getElementById('medirProtocoloCard');
    if (guia) guia.classList.toggle('setup-hidden', !!germ || !!ocultarSeguimiento);
    if (monitor) monitor.classList.toggle('setup-hidden', !!germ || !!ocultarSeguimiento);
    if (protocol) protocol.classList.add('setup-hidden');
    applyMedirSemillaHidroChrome(cfg);
  }

  /** Medir propagador: formulario de domo/sala justo bajo el banner. */
  function repositionMedirFlowPropagadorTop() {
    var flow = document.getElementById('medirFlow');
    var tab = document.getElementById('tab-mediciones');
    if (!flow || !tab) return;
    var anchor =
      document.getElementById('medirPropagadorFaseBanner') ||
      document.getElementById('medirTorreBanner');
    if (!anchor || !anchor.parentNode) return;
    if (flow.previousElementSibling === anchor) return;
    anchor.insertAdjacentElement('afterend', flow);
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
      '<div class="medir-step-panel medir-step-panel--unificado" id="medirFlowUnificadoPanel">' +
      '<div id="medirFlowSolucion" class="medir-flow-solucion-mount"></div>' +
      '<div id="medirFlowAmbienteMount" class="medir-flow-ambiente-mount"></div>' +
      '</div>' +
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
    flow.classList.add('medir-flow--compact');

    var solMount = document.getElementById('medirFlowSolucion');
    sync.classList.remove('setup-hidden');
    sync.removeAttribute('aria-hidden');
    sync.classList.add('medir-solucion-grid', 'medir-solucion-grid--premium', 'medir-param-lab-grid');
    solMount.appendChild(sync);

    var ultima = document.getElementById('ultimaMedicionCard');
    if (ultima) {
      ultima.classList.add('ultima-medicion-card--en-flow');
      flow.insertBefore(ultima, flow.firstChild);
    }

    tab.querySelectorAll('.medir-assistant-cta-wrap, .guardar-medicion-bar').forEach(function (n) {
      n.remove();
    });
    if (typeof ensureMedirParamTileChrome === 'function') ensureMedirParamTileChrome();
  }

  /**
   * El bloque equipamiento/montaje debe verse aunque el sub-shell Agua/IoT esté oculto (camino propagador).
   */
  function ensureSalaCultivoEquipMountEnTabRoot() {
    var equipMount = document.getElementById('salaCultivoEquipMount');
    var tab = document.getElementById('tab-sala');
    if (!equipMount || !tab) return;
    equipMount.classList.remove('setup-hidden');
    equipMount.removeAttribute('aria-hidden');
    if (equipMount.parentNode === tab) return;
    var anchor = document.getElementById('tabSalaMount');
    if (anchor && anchor.parentNode === tab) {
      tab.insertBefore(equipMount, anchor);
    } else {
      tab.appendChild(equipMount);
    }
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

    var cfgInit =
      typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
    var ocultarRecargaSala =
      typeof hcMedirEsSemillaHidro === 'function' && hcMedirEsSemillaHidro(cfgInit);
    SALA_SUB_ORDER.forEach(function (key) {
      var panel = document.getElementById('salaPanel' + key.charAt(0).toUpperCase() + key.slice(1));
      (SALA_GROUPS[key] || []).forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (key === 'recarga' && ocultarRecargaSala && id === 'recargaCardMediciones') {
          var pool = getRecargaCardHiddenPool();
          if (pool) pool.appendChild(el);
          return;
        }
        if (panel) panel.appendChild(el);
      });
    });
  }

  function salaRecargaSubTabVisible(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    if (typeof hcRecargaUiVisibleUsuario === 'function') {
      return hcRecargaUiVisibleUsuario(cfg);
    }
    if (typeof hcRecargaCompletaAplicaEnCamino === 'function') {
      return hcRecargaCompletaAplicaEnCamino(cfg);
    }
    return true;
  }

  function getRecargaCardHiddenPool() {
    var tab = document.getElementById('tab-mediciones');
    if (!tab) return null;
    var pool = document.getElementById('hcRecargaInternoPool');
    if (!pool) {
      pool = document.createElement('div');
      pool.id = 'hcRecargaInternoPool';
      pool.className = 'hc-recarga-interno-pool setup-hidden';
      pool.setAttribute('aria-hidden', 'true');
      tab.appendChild(pool);
    }
    return pool;
  }

  function ensureMedirRecargaVolAvisoSlim(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    if (typeof hcMedirEsSemillaHidro !== 'function' || !hcMedirEsSemillaHidro(cfg)) {
      var old = document.getElementById('medirRecargaVolAvisoSlim');
      if (old) old.classList.add('setup-hidden');
      return;
    }
    var slim = document.getElementById('medirRecargaVolAvisoSlim');
    if (!slim) {
      slim = document.createElement('div');
      slim.id = 'medirRecargaVolAvisoSlim';
      slim.className = 'medir-recarga-vol-aviso-slim setup-hidden';
      slim.setAttribute('role', 'status');
      slim.setAttribute('aria-live', 'polite');
      var flow = document.getElementById('medirFlow');
      if (flow) flow.insertAdjacentElement('afterend', slim);
      else {
        var ban = document.getElementById('medirTorreBanner');
        if (ban) ban.insertAdjacentElement('afterend', slim);
      }
    }
  }

  function ocultarRecargaUiSemillaHidro(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    var card = document.getElementById('recargaCardMediciones');
    if (!card) return;
    var esSh = typeof hcMedirEsSemillaHidro === 'function' && hcMedirEsSemillaHidro(cfg);
    if (!esSh) {
      card.classList.remove('recarga-card--interno', 'setup-hidden');
      card.removeAttribute('aria-hidden');
      card.querySelectorAll('.recarga-collapse-wrap--vol-aviso').forEach(function (el) {
        el.classList.remove('setup-hidden');
      });
      return;
    }
    var pool = getRecargaCardHiddenPool();
    if (pool && card.parentNode !== pool) pool.appendChild(card);
    card.classList.add('recarga-card--interno', 'setup-hidden');
    card.setAttribute('aria-hidden', 'true');
    card.querySelectorAll('.recarga-collapse-wrap--vol-aviso').forEach(function (el) {
      el.classList.add('setup-hidden');
    });
    ensureMedirRecargaVolAvisoSlim(cfg);
    if (typeof refreshMedirRecargaVolAvisoSlim === 'function') refreshMedirRecargaVolAvisoSlim();
  }

  var SALA_PANELES_DUPLICADOS_MEDIR = [
    'configPanel',
    'panelGrowRoomSala',
    'panelConfigInteriorGrow',
    'panelLocalidadMeteo',
  ];

  function repositionMedirTorreBannerTop() {
    var tab = document.getElementById('tab-mediciones');
    var banner = document.getElementById('medirTorreBanner');
    if (!tab || !banner) return;
    var title = tab.querySelector('.section-title');
    if (title) {
      if (banner.previousElementSibling === title) return;
      title.insertAdjacentElement('afterend', banner);
      return;
    }
    if (banner.parentNode !== tab) return;
    var first = tab.firstElementChild;
    if (first === banner) return;
    tab.insertBefore(banner, first);
  }

  function ensureRecargaCardEnMedirTab(cfg) {
    ocultarRecargaUiSemillaHidro(cfg);
  }

  function ensureSalaTorreBanner() {
    var tab = document.getElementById('tab-sala');
    if (!tab) return;
    var ban = document.getElementById('salaTorreBanner');
    if (!ban) {
      ban = document.createElement('button');
      ban.type = 'button';
      ban.id = 'salaTorreBanner';
      ban.className = 'medir-torre-banner sala-torre-banner';
      ban.setAttribute('aria-label', 'Instalación activa en sala de cultivo');
      ban.onclick = function () {
        if (typeof abrirSelectorTorres === 'function') abrirSelectorTorres();
      };
      ban.innerHTML =
        '<div class="medir-torre-banner-row">' +
        '<span id="salaTorreEmoji" class="medir-torre-banner-emoji" aria-hidden="true">🌿</span>' +
        '<div><div class="medir-torre-banner-kicker">Sistema activo</div>' +
        '<div id="salaTorreNombre" class="medir-torre-banner-nombre">Instalación</div></div></div>' +
        '<span class="medir-torre-banner-action">Cambiar ›</span>';
      var title = tab.querySelector('.section-title');
      if (title) title.insertAdjacentElement('afterend', ban);
      else tab.insertBefore(ban, tab.firstChild);
    }
    refreshSalaTorreBanner();
  }

  function ensureSistemaTorreBanner() {
    var tab = document.getElementById('tab-sistema');
    if (!tab) return;
    var ban = document.getElementById('sistemaTorreBanner');
    if (!ban) {
      ban = document.createElement('button');
      ban.type = 'button';
      ban.id = 'sistemaTorreBanner';
      ban.className = 'medir-torre-banner sistema-torre-banner';
      ban.setAttribute('aria-label', 'Instalación activa en sistema de cultivo');
      ban.onclick = function () {
        if (typeof abrirSelectorTorres === 'function') abrirSelectorTorres();
      };
      ban.innerHTML =
        '<div class="medir-torre-banner-row">' +
        '<span id="sistemaTorreEmoji" class="medir-torre-banner-emoji" aria-hidden="true">🌿</span>' +
        '<div><div class="medir-torre-banner-kicker">Sistema activo</div>' +
        '<div id="sistemaTorreNombre" class="medir-torre-banner-nombre">Instalación</div></div></div>' +
        '<span class="medir-torre-banner-action">Cambiar ›</span>';
      var title = tab.querySelector('.section-title');
      if (title) title.insertAdjacentElement('afterend', ban);
      else tab.insertBefore(ban, tab.firstChild);
    }
    refreshSistemaTorreBanner();
  }

  function refreshSistemaTorreBanner() {
    var torre =
      typeof getTorreActiva === 'function'
        ? getTorreActiva()
        : typeof state !== 'undefined' && state.torres
          ? state.torres[state.torreActiva || 0]
          : null;
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) || {};
    var ban = document.getElementById('sistemaTorreBanner');
    if (!ban) return;
    var hay =
      typeof hcTieneInstalacionesUsuario === 'function' && hcTieneInstalacionesUsuario();
    ban.classList.toggle('setup-hidden', !hay);
    var nomEl = document.getElementById('sistemaTorreNombre');
    var emoEl = document.getElementById('sistemaTorreEmoji');
    if (nomEl) nomEl.textContent = (torre && torre.nombre ? String(torre.nombre).trim() : '') || 'Instalación';
    if (emoEl) {
      if (typeof hcPintarSistemaIconoEnElemento === 'function' && torre) {
        hcPintarSistemaIconoEnElemento(emoEl, torre, 'hc-ico--dash-torre');
      } else if (typeof emojiSistemaUiPorTorre === 'function' && torre) {
        emoEl.textContent = emojiSistemaUiPorTorre(torre);
      }
    }
    if (typeof hcGeomTorreFilasCestas === 'function') {
      var sub = ban.querySelector('.sistema-torre-banner-sub');
      if (!sub) {
        sub = document.createElement('div');
        sub.className = 'sistema-torre-banner-sub medir-torre-banner-kicker';
        var nom = document.getElementById('sistemaTorreNombre');
        if (nom && nom.parentNode) nom.parentNode.appendChild(sub);
      }
      var tipo =
        typeof etiquetaTipoInstalacion === 'function'
          ? etiquetaTipoInstalacion(cfg)
          : cfg.tipoInstalacion || 'DWC';
      sub.textContent = tipo + ' · ' + hcGeomTorreFilasCestas(cfg).label;
    }
  }

  function refreshSalaTorreBanner() {
    var torre =
      typeof getTorreActiva === 'function'
        ? getTorreActiva()
        : typeof state !== 'undefined' && state.torres
          ? state.torres[state.torreActiva || 0]
          : null;
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) || {};
    var nomEl = document.getElementById('salaTorreNombre');
    var emoEl = document.getElementById('salaTorreEmoji');
    if (nomEl) nomEl.textContent = (torre && torre.nombre ? String(torre.nombre).trim() : '') || 'Instalación';
    if (emoEl) {
      if (typeof hcPintarSistemaIconoEnElemento === 'function' && torre) {
        hcPintarSistemaIconoEnElemento(emoEl, torre, 'hc-ico--dash-torre');
      } else if (typeof emojiSistemaUiPorTorre === 'function' && torre) {
        emoEl.textContent = emojiSistemaUiPorTorre(torre);
      }
    }
    var ban = document.getElementById('salaTorreBanner');
    if (ban && typeof hcGeomTorreFilasCestas === 'function') {
      var sub = ban.querySelector('.sala-torre-banner-sub');
      if (!sub) {
        sub = document.createElement('div');
        sub.className = 'sala-torre-banner-sub medir-torre-banner-kicker';
        var nom = document.getElementById('salaTorreNombre');
        if (nom && nom.parentNode) nom.parentNode.appendChild(sub);
      }
      var tipo =
        typeof etiquetaTipoInstalacion === 'function'
          ? etiquetaTipoInstalacion(cfg)
          : cfg.tipoInstalacion || 'DWC';
      sub.textContent = tipo + ' · ' + hcGeomTorreFilasCestas(cfg).label;
    }
  }

  function applyMedirAmbienteUnificadoOperativa(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    var unificado =
      (typeof hcMedirEsSemillaHidro === 'function' && hcMedirEsSemillaHidro(cfg)) ||
      (typeof hcSemillaHidroUiOperativaLista === 'function' && hcSemillaHidroUiOperativaLista(cfg));
    if (!unificado) return;
    var details = document.getElementById('medirAmbienteDetails');
    if (details) {
      details.open = true;
      details.classList.add('medir-ambiente-details--operativa-unificado');
      var sum = details.querySelector('.medir-ambiente-summary');
      if (sum) sum.classList.add('setup-hidden');
    }
    var flow = document.getElementById('medirFlow');
    if (flow) flow.classList.add('medir-flow--semilla-hidro-unificado');
    var ambCard = document.getElementById('medirAmbienteCard');
    if (ambCard) ambCard.classList.add('medir-ambiente-card--inline-unificado');
  }

  function applyMedirSemillaHidroChrome(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    if (typeof hcMedirEsSemillaHidro !== 'function' || !hcMedirEsSemillaHidro(cfg)) return;
    [
      'medirPreOperativaGate',
      'medirOperativaHub',
      'medirPuestaMarchaCard',
      'medirMonitorCard',
      'medirProtocoloCard',
      'medirGuiaDiaCard',
      'ultimaMedicionCard',
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('setup-hidden');
    });
    ensureRecargaCardEnMedirTab(cfg);
    applyMedirAmbienteUnificadoOperativa(cfg);
    repositionMedirTorreBannerTop();
  }

  function refreshSalaUbicacionSinDuplicarUi() {
    var agua = document.getElementById('salaPanelAgua');
    var panelLoc = document.getElementById('panelLocalidadMeteo');
    var configPanel = document.getElementById('configPanel');
    if (!agua || !panelLoc || !configPanel) return;
    if (!agua.contains(panelLoc) || !agua.contains(configPanel)) return;
    var dedupe =
      !panelLoc.classList.contains('setup-hidden') &&
      !configPanel.classList.contains('setup-hidden');
    configPanel.classList.toggle('sala-config-con-localidad', dedupe);
    var btn2 = document.getElementById('btnMedirDwcBlock2');
    if (btn2) {
      if (!btn2.dataset.hcTitleDefault) {
        var titleEl = btn2.querySelector('.config-section-collapse-title');
        if (titleEl) btn2.dataset.hcTitleDefault = titleEl.innerHTML;
      }
      var tit = btn2.querySelector('.config-section-collapse-title');
      if (tit && btn2.dataset.hcTitleDefault) {
        tit.innerHTML = dedupe
          ? '<svg class="hc-ico hc-ico--title-inline" aria-hidden="true" focusable="false"><use href="#hc-i-bulb"/></svg> Luz y sustrato'
          : btn2.dataset.hcTitleDefault;
      }
      btn2.setAttribute(
        'aria-label',
        dedupe ? 'Luz y sustrato' : 'Ubicación del sistema, luz y sustrato'
      );
    }
  }

  function refreshSalaPanelesDuplicadosMedirUi(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    var hidroOper =
      typeof hcSemillaHidroUiOperativaLista === 'function' && hcSemillaHidroUiOperativaLista(cfg);
    var ocultar =
      hidroOper ||
      (typeof hcSalaOcultarPanelesDuplicadosMedir === 'function' &&
        hcSalaOcultarPanelesDuplicadosMedir(cfg));
    SALA_PANELES_DUPLICADOS_MEDIR.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var hidePanel = ocultar;
      if (hidroOper && id === 'panelLocalidadMeteo') hidePanel = false;
      if (
        id === 'configPanel' &&
        typeof hcSalaConfigPanelOcultoEnUi === 'function' &&
        hcSalaConfigPanelOcultoEnUi(cfg)
      ) {
        hidePanel = true;
      }
      el.classList.toggle('setup-hidden', hidePanel);
      el.setAttribute('aria-hidden', hidePanel ? 'true' : 'false');
    });
    if (hidroOper) {
      var intGrow = document.getElementById('panelConfigInteriorGrow');
      if (intGrow) {
        intGrow.classList.add('setup-hidden');
        intGrow.setAttribute('aria-hidden', 'true');
        intGrow.style.display = 'none';
      }
    }
    var stabAgua = document.getElementById('stab-agua');
    if (stabAgua) {
      var label = ocultar ? 'Equipamiento' : 'Agua y ubicación';
      if (hidroOper) {
        var loc = String(cfg.localidadMeteo || '').trim();
        label = loc || 'Clima';
      }
      var icon = ocultar || hidroOper ? '#hc-i-pin-mapa' : '#hc-i-droplet';
      if (hidroOper && !ocultar) icon = '#hc-i-droplet';
      stabAgua.innerHTML =
        '<svg class="hc-ico" aria-hidden="true" focusable="false"><use href="' +
        icon +
        '"/></svg> ' +
        label;
    }
    var shell = document.getElementById('tabSalaMount');
    if (shell) shell.classList.toggle('sala-sub-shell--solo-equip', ocultar);
    refreshSalaUbicacionSinDuplicarUi();
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
        if (montajeDet.open) montajeDet.dataset.hcMontajeUserOpened = '1';
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
    var cfgEq =
      typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
    if (opts.lightOnly) {
      if (typeof refreshSistemaEquipResumen === 'function') refreshSistemaEquipResumen(cfgEq);
      var hidroOpLo =
        typeof hcSemillaHidroUiOperativaLista === 'function' && hcSemillaHidroUiOperativaLista(cfgEq);
      if (
        hidroOpLo &&
        det &&
        !det.classList.contains('setup-hidden') &&
        typeof renderMedirEquipamientoPanel === 'function'
      ) {
        renderMedirEquipamientoPanel();
      }
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
  var SALA_HEAVY_TTL_MS = 8000;

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
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    if (
      typeof hcSemillaHidroUiOperativaLista === 'function' &&
      hcSemillaHidroUiOperativaLista(cfg)
    ) {
      return true;
    }
    return !(
      typeof hcSalaOcultarPanelesDuplicadosMedir === 'function' &&
      hcSalaOcultarPanelesDuplicadosMedir(cfg)
    );
  }

  function refreshSalaLocalidadDesdeAsistente(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    var panelLoc = document.getElementById('panelLocalidadMeteo');
    if (!panelLoc || panelLoc.classList.contains('setup-hidden')) return;
    if (typeof hcAsegurarLocalidadMeteoDesdeAsistente === 'function') {
      hcAsegurarLocalidadMeteoDesdeAsistente(cfg);
    }
    if (typeof cargarLocalidadMeteoUI === 'function') cargarLocalidadMeteoUI();
  }

  function refreshSalaTabLight(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    ensureSalaTorreBanner();
    bindSalaEquipCollapsibles();
    ocultarRecargaUiSemillaHidro(cfg);
    refreshSalaSubTabsCaminoUi(cfg);
    refreshSalaLocalidadDesdeAsistente(cfg);
    if (typeof applySalaMontajeRecomendadoUi === 'function') applySalaMontajeRecomendadoUi(cfg);
    refreshSalaEquipMontaje({ lightOnly: true });
    if (typeof hcRefreshPuestaMarchaUi === 'function') hcRefreshPuestaMarchaUi();
    if (typeof renderSalaSeguimientoCta === 'function') renderSalaSeguimientoCta();
    if (typeof refreshSalaVistaCamino === 'function') refreshSalaVistaCamino(cfg);
    if (typeof refreshSalaPropagadorDomoPanel === 'function') refreshSalaPropagadorDomoPanel(cfg);
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
  }

  function initMedirSalaLayout() {
    try {
      buildSalaSubTabs();
      buildMedirFlow();
      ensureGuiaWrap();
      wrapAmbienteCollapsible();
      mountAmbienteInMedirFlow();
      if (typeof ensureSalaCultivoEquipMountEnTabRoot === 'function') {
        ensureSalaCultivoEquipMountEnTabRoot();
      }
      bindSalaEquipCollapsibles();
      salaSubTab(salaSubActive);
      refreshSalaSubTabsCaminoUi();
      refreshSalaEquipMontaje({ lightOnly: true });
      if (typeof hcRefreshPuestaMarchaUi === 'function') hcRefreshPuestaMarchaUi();
      applyMedirGuiaProtocoloChrome();
      repositionMedirTorreBannerTop();
      applyMedirAmbienteUnificadoOperativa(
        typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {}
      );
      applyMedirSemillaHidroChrome(
        typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {}
      );
      var deferHeavy = function () {
        try {
          refreshSalaEquipMontaje();
          if (typeof refreshSistemaCultivoExtras === 'function') refreshSistemaCultivoExtras();
          if (typeof repositionMedirGuiaDiaTop === 'function') repositionMedirGuiaDiaTop();
          if (typeof repositionMedirFlowPropagadorTop === 'function') {
            repositionMedirFlowPropagadorTop();
          }
          if (typeof refreshMedirGerminacionUi === 'function') refreshMedirGerminacionUi();
        } catch (_) {}
      };
      setTimeout(deferHeavy, 24);
    } catch (e) {
      try {
        console.warn('initMedirSalaLayout', e);
      } catch (_) {}
    }
  }

  window.salaSubTab = salaSubTab;
  window.refreshSalaSubTabsCaminoUi = refreshSalaSubTabsCaminoUi;
  window.refreshSalaPanelesDuplicadosMedirUi = refreshSalaPanelesDuplicadosMedirUi;
  window.refreshSalaUbicacionSinDuplicarUi = refreshSalaUbicacionSinDuplicarUi;
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
  window.applyMedirAmbienteUnificadoOperativa = applyMedirAmbienteUnificadoOperativa;
  window.refreshSalaTorreBanner = refreshSalaTorreBanner;
  window.ensureSistemaTorreBanner = ensureSistemaTorreBanner;
  window.refreshSistemaTorreBanner = refreshSistemaTorreBanner;
  window.ensureRecargaCardEnMedirTab = ensureRecargaCardEnMedirTab;
  window.ocultarRecargaUiSemillaHidro = ocultarRecargaUiSemillaHidro;
  window.applyMedirSemillaHidroChrome = applyMedirSemillaHidroChrome;
  window.repositionMedirTorreBannerTop = repositionMedirTorreBannerTop;
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
  window.repositionMedirFlowPropagadorTop = repositionMedirFlowPropagadorTop;
  window.mountAmbienteInMedirFlow = mountAmbienteInMedirFlow;
  window.applyMedirGuiaProtocoloChrome = applyMedirGuiaProtocoloChrome;
  window.ensureSalaCultivoEquipMountEnTabRoot = ensureSalaCultivoEquipMountEnTabRoot;

  /** Solo al abrir Medir/Sala (goTab); no en arranque para no bloquear PIN/Inicio. */
  window.scheduleInitMedirSalaLayout = function scheduleInitMedirSalaLayout() {
    if (typeof window !== 'undefined' && window._hcMedirSalaLayoutDone) return;
    if (typeof window !== 'undefined' && window._hcMedirSalaLayoutScheduled) return;
    if (typeof window !== 'undefined') window._hcMedirSalaLayoutScheduled = true;
    var run = function () {
      if (typeof window !== 'undefined' && window._hcMedirSalaLayoutDone) return;
      if (typeof window !== 'undefined') window._hcMedirSalaLayoutDone = true;
      initMedirSalaLayout();
    };
    setTimeout(run, 32);
  };
})();
