/**
 * HidroGrow — checklist de montaje del propagador / prep germinación en hidro.
 * Fase previa a las 6 fases de germinación (rutas semilla_propagador y semilla_hidro).
 */
(function (global) {
  'use strict';

  var ITEMS_PROPAGADOR = [
    { id: 'prop_domo', label: 'Domo / propagador montado', hint: 'Bandeja estable, tapa hermética y acceso para ventilar 2×/día.', accent: 'germ' },
    { id: 'prop_mat', label: 'Mat térmica bajo bandeja (si aplica)', hint: '22–26 °C en sustrato; termostato o termohigrómetro cerca.', accent: 'light' },
    { id: 'prop_termo', label: 'Termo-higrómetro en zona de germinación', hint: 'HR 70–80 % bajo domo; anota en el registro diario.', accent: 'iot' },
    { id: 'prop_luz', label: 'Luz suave 18/6 (tenue)', hint: 'No LED de floración encima del domo; fluorescente o LED muy bajo.', accent: 'light' },
    { id: 'prop_rockwool', label: 'Cubos lana 4×4 remojados pH 5,5', hint: 'Listos para fase 3 del camino; agua destilada u ósmosis.', accent: 'hydro' },
    { id: 'prop_higiene', label: 'Higiene: tijeras y superficie limpias', hint: 'Alcohol 70 % en herramientas; evita tocar radículas.', accent: 'tool' },
    { id: 'prop_vent', label: 'Ventilación del domo probada', hint: 'Abre 2× al día 3–5 min; sin corrientes frías directas.', accent: 'air' },
  ];

  var ITEMS_ENRAIZADO = [
    { id: 'enr_domo', label: 'Domo de enraizado montado', hint: 'HR 70–80 %, 22–26 °C; ventilar 2×/día.', accent: 'germ' },
    { id: 'enr_rockwool', label: 'Cubos rockwool pH 5,5 listos', hint: 'Humedecidos, no encharcados; gel/polvo de enraizante a mano.', accent: 'hydro' },
    { id: 'enr_higiene', label: 'Tijeras y superficie esterilizadas', hint: 'Alcohol 70 %; corte 45° por la mañana si puedes.', accent: 'tool' },
    { id: 'enr_luz', label: 'Luz tenue 18/6 sobre el domo', hint: 'Sin LED de floración directo sobre esquejes tiernos.', accent: 'light' },
    { id: 'enr_termo', label: 'Termo-higrómetro en la zona de clones', hint: 'Anota T° y HR en el protocolo de esquejes.', accent: 'iot' },
    { id: 'enr_aire', label: 'Aireación del depósito/clonador comprobada', hint: 'Burbujeo suave; EC 0–400 µS las primeras 48 h si usas mini DWC.', accent: 'air' },
  ];

  var ITEMS_PREP_HIDRO = [
    { id: 'ph_netpot', label: 'Net pot y cubo de lana en el sistema', hint: 'Semilla nunca suelta en el depósito; solo en cubo dentro de la maceta.', accent: 'hydro' },
    { id: 'ph_nivel', label: 'Nivel de agua mínimo / niebla de raíz', hint: 'EC 200–400 µS hasta enraizar; T° agua 20–24 °C.', accent: 'hydro' },
    { id: 'ph_domo_mini', label: 'Mini domo o HR alta sobre la maceta', hint: 'Microclima hasta que la plántula aguante sin domo.', accent: 'germ' },
    { id: 'ph_medidor', label: 'Medidor EC/pH a mano listo', hint: 'Calibración reciente; anota en Medir cuando subas EC.', accent: 'iot' },
    { id: 'ph_aire', label: 'Aireación del depósito comprobada', hint: 'Burbujeo suave; sin burbujas fuertes sobre la semilla.', accent: 'air' },
    { id: 'ph_luz', label: 'Luz tenue 18/6 sobre la zona', hint: 'Misma lógica que propagador: evita estrés en plántula joven.', accent: 'light' },
  ];

  var PROP_ICONS = {
    prop_domo: '🫧',
    prop_mat: '🔥',
    prop_termo: '🌡️',
    prop_luz: '💡',
    prop_rockwool: '🧊',
    prop_higiene: '✂️',
    prop_vent: '💨',
    enr_domo: '🫧',
    enr_rockwool: '🧊',
    enr_higiene: '✂️',
    enr_luz: '💡',
    enr_termo: '🌡️',
    enr_aire: '🫧',
    ph_netpot: '🪴',
    ph_nivel: '💧',
    ph_domo_mini: '🫧',
    ph_medidor: '📟',
    ph_aire: '💨',
    ph_luz: '💡',
  };

  function getCfg() {
    if (typeof state !== 'undefined' && state && state.configTorre) return state.configTorre;
    try {
      if (typeof getTorreActiva === 'function') {
        var t = getTorreActiva();
        if (t && t.config) return t.config;
      }
    } catch (_) {}
    return {};
  }

  function getCamino(cfg) {
    return typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
  }

  function esRutaPropagador(cfg) {
    return getCamino(cfg) === 'semilla_propagador';
  }

  function esRutaGermHidro(cfg) {
    return getCamino(cfg) === 'semilla_hidro';
  }

  function esRutaEsqueje(cfg) {
    return getCamino(cfg) === 'esqueje_hidro';
  }

  function aplicaChecklistGerm(cfg) {
    cfg = cfg || getCfg();
    return esRutaPropagador(cfg) || esRutaGermHidro(cfg);
  }

  function aplicaChecklistEnraizado(cfg) {
    cfg = cfg || getCfg();
    return esRutaEsqueje(cfg);
  }

  function getChecksKey(cfg) {
    cfg = cfg || getCfg();
    if (esRutaEsqueje(cfg)) return 'enraizadoMontajeChecks';
    return esRutaGermHidro(cfg) ? 'preparacionGermHidroChecks' : 'propagadorMontajeChecks';
  }

  function getChecks(cfg) {
    cfg = cfg || getCfg();
    var key = getChecksKey(cfg);
    if (!cfg[key] || typeof cfg[key] !== 'object') cfg[key] = {};
    return cfg[key];
  }

  function saveChecks(cfg, checks) {
    if (typeof state === 'undefined' || !state || !state.configTorre) return;
    var key = getChecksKey(cfg || getCfg());
    state.configTorre[key] = checks;
    try {
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
      if (typeof saveState === 'function') saveState();
    } catch (_) {}
  }

  function propagadorMontajeCompleto(cfg) {
    cfg = cfg || getCfg();
    if (!aplicaChecklistGerm(cfg)) return true;
    var ch = getChecks(cfg);
    return !!ch.completedAt;
  }

  function enraizadoMontajeCompleto(cfg) {
    cfg = cfg || getCfg();
    if (!aplicaChecklistEnraizado(cfg)) return true;
    var ch = getChecks(cfg);
    return !!ch.completedAt;
  }

  function hcGerminacionBloqueadaPorMontaje(cfg) {
    cfg = cfg || getCfg();
    if (!aplicaChecklistGerm(cfg)) return false;
    return !propagadorMontajeCompleto(cfg);
  }

  function buildItems(cfg) {
    cfg = cfg || getCfg();
    var base = esRutaEsqueje(cfg)
      ? ITEMS_ENRAIZADO.slice()
      : esRutaGermHidro(cfg)
        ? ITEMS_PREP_HIDRO.slice()
        : ITEMS_PROPAGADOR.slice();
    var inst = cfg.equipamientoInstalado || {};
    return base.map(function (it) {
      var copy = Object.assign({}, it);
      if (it.id === 'prop_domo' && inst.propagador && inst.propagador.marca) {
        copy.label += ' · ' + inst.propagador.marca + ' ' + (inst.propagador.modelo || '');
      }
      if (it.id === 'prop_mat' && inst.mat_termica_germ && inst.mat_termica_germ.marca) {
        copy.label += ' · ' + inst.mat_termica_germ.marca;
      }
      return copy;
    });
  }

  function countProgress(checks, items) {
    var done = 0;
    var total = items.length;
    items.forEach(function (it) {
      if (checks[it.id]) done++;
    });
    return { done: done, total: total };
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function propItemIcon(it) {
    return PROP_ICONS[it.id] || '🌱';
  }

  function renderPropProgressHtml(prog, verificada, titulo) {
    var pct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
    var r = 15.5;
    var c = 2 * Math.PI * r;
    var off = c * (1 - pct / 100);
    var badge = verificada ? 'Verificado' : prog.done + '/' + prog.total;
    var badgeCls =
      'hc-pm-progress-badge' + (verificada ? ' hc-pm-progress-badge--ok' : '');
    return (
      '<div class="hc-pm-progress hc-pm-progress--prop" role="status" aria-live="polite">' +
      '<div class="hc-pm-progress-ring" aria-hidden="true">' +
      '<svg viewBox="0 0 36 36" focusable="false">' +
      '<circle class="hc-pm-progress-ring-bg" cx="18" cy="18" r="' +
      r +
      '"></circle>' +
      '<circle class="hc-pm-progress-ring-fill" cx="18" cy="18" r="' +
      r +
      '" stroke-dasharray="' +
      c.toFixed(2) +
      '" stroke-dashoffset="' +
      off.toFixed(2) +
      '"></circle></svg>' +
      '<span class="hc-pm-progress-pct">' +
      pct +
      '%</span></div>' +
      '<div class="hc-pm-progress-meta">' +
      '<span class="hc-pm-progress-title">' +
      esc(titulo) +
      '</span>' +
      '<span class="hc-pm-progress-sub">' +
      prog.done +
      ' de ' +
      prog.total +
      ' puntos listos</span>' +
      '<div class="hc-pm-progress-bar" aria-hidden="true">' +
      '<div class="hc-pm-progress-fill" style="width:' +
      pct +
      '%"></div></div></div>' +
      '<span class="' +
      badgeCls +
      '">' +
      esc(badge) +
      '</span></div>'
    );
  }

  function renderCard(it, checks) {
    var on = !!checks[it.id];
    var safe = String(it.id || '').replace(/[^a-zA-Z0-9_]/g, '');
    var accent = it.accent || 'germ';
    var dot = it.label.indexOf(' · ');
    var title = dot > 0 ? it.label.slice(0, dot) : it.label;
    var sub = dot > 0 ? it.label.slice(dot + 3) : '';
    return (
      '<article class="hc-pm-card hc-pm-card--' +
      accent +
      (on ? ' hc-pm-card--checked' : '') +
      '" data-prop-id="' +
      esc(safe) +
      '" role="listitem" tabindex="0" aria-pressed="' +
      (on ? 'true' : 'false') +
      '" onclick="hcPropCardActivate(event,\'' +
      esc(safe) +
      '\')" onkeydown="hcPropCardKey(event,\'' +
      esc(safe) +
      '\')">' +
      '<label class="hc-pm-card-check' +
      (on ? ' is-on' : '') +
      '" aria-hidden="true">' +
      '<input type="checkbox" class="hc-pm-card-input" data-prop-input="' +
      esc(safe) +
      '"' +
      (on ? ' checked' : '') +
      ' tabindex="-1" onchange="hcPropagadorToggleItem(\'' +
      esc(safe) +
      '\', this.checked)">' +
      '<span class="hc-pm-card-check-icon"></span></label>' +
      '<div class="hc-pm-card-body">' +
      '<span class="hc-pm-card-icon" aria-hidden="true">' +
      propItemIcon(it) +
      '</span>' +
      '<div class="hc-pm-card-text">' +
      '<h4 class="hc-pm-card-title">' +
      esc(title) +
      '</h4>' +
      (sub ? '<p class="hc-pm-card-sub">' + esc(sub) + '</p>' : '') +
      '<p class="hc-pm-card-hint">' +
      esc(it.hint) +
      '</p></div></div>' +
      (on ? '<span class="hc-pm-card-done-badge" aria-hidden="true">OK</span>' : '') +
      '</article>'
    );
  }

  function hcPropCardActivate(ev, id) {
    if (ev && (ev.target.closest('.hc-pm-card-input') || ev.target.closest('button'))) return;
    var inp = document.querySelector('[data-prop-input="' + id + '"]');
    if (!inp || inp.disabled) return;
    inp.checked = !inp.checked;
    hcPropagadorToggleItem(id, inp.checked);
  }

  function hcPropCardKey(ev, id) {
    if (!ev || (ev.key !== 'Enter' && ev.key !== ' ')) return;
    ev.preventDefault();
    hcPropCardActivate(ev, id);
  }

  function renderBodyHtml(cfg) {
    cfg = cfg || getCfg();
    var checks = getChecks(cfg);
    var items = buildItems(cfg);
    var prog = countProgress(checks, items);
    var verificada = !!checks.completedAt;
    var titulo = esRutaGermHidro(cfg)
      ? 'Preparación · germinación en el hidro'
      : esRutaEsqueje(cfg)
        ? 'Checklist de enraizado'
        : 'Montaje del propagador / domo';
    var lead = esRutaGermHidro(cfg)
      ? 'Antes de las <strong>6 fases</strong>: confirma net pot y microclima. Después <strong>configura la sala</strong> (asistente + montaje); el DWC/RDWC se cierra al terminar el camino.'
      : esRutaEsqueje(cfg)
        ? 'Domo, higiene y microclima antes de pasar esquejes a la matriz.'
        : 'Marca cada punto del montaje. Arriba debes tener <strong>genética, semillas y sustrato</strong> antes de confirmar.';
    var inst = cfg.equipamientoInstalado || {};
    var equipRef = '';
    if (inst.propagador && inst.propagador.marca) {
      equipRef =
        '<p class="hc-pm-equip-ref"><strong>En catálogo:</strong> ' +
        esc(inst.propagador.marca + ' ' + (inst.propagador.modelo || '')) +
        (inst.mat_termica_germ && inst.mat_termica_germ.marca
          ? ' · ' + esc(inst.mat_termica_germ.marca)
          : '') +
        '</p>';
    }
    var planBlock =
      typeof renderPlanGermModalBlock === 'function' ? renderPlanGermModalBlock(cfg) : '';
    return (
      '<div class="hc-pm-shell hc-pm-shell--prop">' +
      planBlock +
      '<div class="hc-prop-hero">' +
      '<span class="hc-prop-hero-ico" aria-hidden="true">' +
      (esRutaGermHidro(cfg) ? '💧' : esRutaEsqueje(cfg) ? '🌿' : '🫧') +
      '</span>' +
      '<div class="hc-prop-hero-text">' +
      '<h3 class="hc-prop-modal-title">' +
      esc(titulo) +
      '</h3>' +
      '<p class="hc-pm-lead">' +
      lead +
      '</p></div></div>' +
      equipRef +
      renderPropProgressHtml(prog, verificada, 'Progreso del montaje') +
      '<div class="hc-pm-grid hc-pm-grid--prop" role="list">' +
      items
        .map(function (it) {
          return renderCard(it, checks);
        })
        .join('') +
      '</div></div>'
    );
  }

  function renderInlineEnGermHub() {
    var cfg = getCfg();
    if (!aplicaChecklistGerm(cfg) || !hcGerminacionActiva(cfg)) return '';
    var checks = getChecks(cfg);
    var items = buildItems(cfg);
    var prog = countProgress(checks, items);
    var verificada = !!checks.completedAt;
    var titulo = esRutaGermHidro(cfg) ? 'Paso 1 · Preparar germinación en hidro' : 'Paso 1 · Montaje del propagador';
    var pct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
    return (
      '<div class="hc-prop-inline hc-prop-inline--premium" id="hcPropagadorMontajeInline">' +
      '<div class="hc-prop-inline-head">' +
      '<span class="hc-prop-inline-ico" aria-hidden="true">🫧</span>' +
      '<h3 class="hc-prop-inline-title">' +
      esc(titulo) +
      '</h3>' +
      '<span class="hc-prop-inline-pct' +
      (verificada ? ' hc-prop-inline-pct--ok' : '') +
      '">' +
      (verificada ? '✓ Listo' : prog.done + '/' + prog.total + ' · ' + pct + '%') +
      '</span></div>' +
      '<div class="hc-prop-inline-bar" aria-hidden="true"><span style="width:' +
      pct +
      '%"></span></div>' +
      '<p class="hc-prop-inline-lead">Completa el checklist premium; después <strong>configura la sala</strong> y las 6 fases.</p>' +
      '<button type="button" class="btn btn-primary btn-sm" onclick="hcOpenPropagadorMontajeChecklist()">' +
      (verificada ? 'Revisar checklist' : 'Abrir checklist de montaje') +
      '</button>' +
      (verificada &&
      typeof salaListaAntesDeGerminacion === 'function' &&
      !salaListaAntesDeGerminacion(cfg)
        ? '<button type="button" class="btn btn-secondary btn-sm hc-prop-cta-sala" style="margin-left:8px" onclick="typeof abrirSetupFaseSala===\'function\'&&abrirSetupFaseSala()">Configurar sala</button>'
        : '') +
      '</div>'
    );
  }

  function refreshPropagadorMontajeUi() {
    try {
      if (typeof refreshDashGerminacionHub === 'function') refreshDashGerminacionHub();
    } catch (_) {}
    try {
      if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
    } catch (_) {}
    try {
      if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
    } catch (_) {}
    try {
      if (typeof refreshDashCaminoResumen === 'function') refreshDashCaminoResumen();
    } catch (_) {}
  }

  function hcPropagadorToggleItem(id, checked) {
    var cfg = getCfg();
    var checks = Object.assign({}, getChecks(cfg));
    if (!checked && checks.completedAt) {
      delete checks.completedAt;
      if (typeof showToast === 'function') {
        showToast('Verificación anulada: confirma de nuevo cuando esté listo.', false);
      }
    }
    checks[id] = !!checked;
    saveChecks(cfg, checks);
    var body = document.getElementById('propagadorMontajeBody');
    if (body) body.innerHTML = renderBodyHtml(cfg);
    refreshPropagadorMontajeUi();
  }

  function hcOpenPropagadorMontajeChecklist() {
    var modal = document.getElementById('modalPropagadorMontaje');
    if (!modal) {
      if (typeof showToast === 'function') showToast('Checklist no disponible.', true);
      return;
    }
    var cfg = getCfg();
    try {
      if (typeof hcGerminacionSyncDesdePremium === 'function') hcGerminacionSyncDesdePremium(cfg);
    } catch (_) {}
    var body = document.getElementById('propagadorMontajeBody');
    if (body) body.innerHTML = renderBodyHtml(cfg);
    var title = document.getElementById('propagadorMontajeTitle');
    var cfg = getCfg();
    if (title) {
      title.textContent = esRutaEsqueje(cfg)
        ? 'Checklist de enraizado'
        : esRutaGermHidro(cfg)
          ? 'Preparación germinación en hidro'
          : 'Montaje del propagador';
    }
    modal.classList.add('open');
    try {
      if (typeof a11yDialogOpened === 'function') a11yDialogOpened(modal);
    } catch (_) {}
  }

  function hcClosePropagadorMontajeChecklist(ev) {
    if (ev && ev.target !== ev.currentTarget) return;
    var modal = document.getElementById('modalPropagadorMontaje');
    if (modal) modal.classList.remove('open');
  }

  function hcFinishPropagadorMontaje() {
    var cfg = getCfg();
    var checks = getChecks(cfg);
    var items = buildItems(cfg);
    var prog = countProgress(checks, items);
    if (prog.done < prog.total) {
      if (typeof showToast === 'function') {
        showToast('Marca todos los puntos (' + prog.done + '/' + prog.total + ').', true);
      }
      return;
    }
    if (
      typeof requiereValidacionPlanGerm === 'function' &&
      requiereValidacionPlanGerm(cfg) &&
      typeof validarPlanGerminacionCompleto === 'function'
    ) {
      persistHcPropPlanFromModal();
      var planVal = validarPlanGerminacionCompleto(cfg);
      if (!planVal.ok) {
        if (typeof showToast === 'function') {
          showToast(
            planVal.message || 'Completa genética, semillas y sustrato en el bloque superior.',
            true,
            { durationMs: 6200 }
          );
        }
        try {
          document.getElementById('hcPropPlanGermBlock')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (_) {}
        return;
      }
    }
    var msgConfirm = esRutaEsqueje(cfg)
      ? '¿Confirmas que el domo de enraizado está listo?'
      : esRutaGermHidro(cfg)
        ? '¿Confirmas el preparativo en hidro?'
        : '¿Confirmas el propagador/domo?';
    if (!confirm(msgConfirm)) {
      return;
    }
    checks.completedAt = new Date().toISOString();
    try {
      if (typeof hcRefreshSistemaFasePanel === 'function') hcRefreshSistemaFasePanel();
      else if (typeof hcRefreshSistemaPropagadorPanel === 'function') {
        hcRefreshSistemaPropagadorPanel();
      }
      if (typeof refreshTabsOperativaCamino === 'function') refreshTabsOperativaCamino();
      if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
    } catch (_) {}
    saveChecks(cfg, checks);
    hcClosePropagadorMontajeChecklist();
    refreshPropagadorMontajeUi();
    if (typeof showToast === 'function') {
      showToast(
        esRutaEsqueje(cfg)
          ? '✓ Enraizado listo. Asigna clones en Cultivo e instalación.'
          : esRutaGermHidro(cfg)
            ? '✓ Prep listo. Siguiente: configurar la sala en el asistente.'
            : '✓ Propagador listo.',
        false,
        { durationMs: 4200 }
      );
    }
    if (esRutaEsqueje(cfg)) {
      refreshPropagadorMontajeUi();
      return;
    }
    var cam =
      typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam === 'semilla_propagador') {
      if (typeof hcIrHubGerminacionOperativa === 'function') {
        hcIrHubGerminacionOperativa();
      }
      return;
    }
    if (typeof hcCaminoRequiereSalaPreGerm === 'function' && hcCaminoRequiereSalaPreGerm(cfg)) {
      setTimeout(function () {
        if (
          typeof salaPreGermConfigurada === 'function' &&
          salaPreGermConfigurada(cfg) &&
          typeof montajeSalaPreGermOk === 'function' &&
          montajeSalaPreGermOk(cfg)
        ) {
          return;
        }
        if (typeof abrirSetupFaseSala === 'function') abrirSetupFaseSala();
      }, 700);
    }
  }

  function hcPropagadorMontajeSiguienteTrasGerminacion(cfg) {
    cfg = cfg || getCfg();
    if (!hcCaminoEsSemilla(getCamino(cfg))) return null;
    if (!propagadorMontajeCompleto(cfg)) {
      return { label: 'Montaje del propagador', action: 'irPropagadorMontaje' };
    }
    return null;
  }

  global.propagadorMontajeCompleto = propagadorMontajeCompleto;
  global.enraizadoMontajeCompleto = enraizadoMontajeCompleto;
  global.aplicaChecklistEnraizado = aplicaChecklistEnraizado;
  global.hcGerminacionBloqueadaPorMontaje = hcGerminacionBloqueadaPorMontaje;
  global.hcOpenPropagadorMontajeChecklist = hcOpenPropagadorMontajeChecklist;
  global.hcClosePropagadorMontajeChecklist = hcClosePropagadorMontajeChecklist;
  global.hcFinishPropagadorMontaje = hcFinishPropagadorMontaje;
  global.hcPropagadorToggleItem = hcPropagadorToggleItem;
  global.hcPropCardActivate = hcPropCardActivate;
  global.hcPropCardKey = hcPropCardKey;
  global.renderPropagadorMontajeInlineHtml = renderInlineEnGermHub;
  global.hcPropagadorMontajeSiguienteTrasGerminacion = hcPropagadorMontajeSiguienteTrasGerminacion;
  global.hcRerenderPropagadorMontajeModal = hcRerenderPropagadorMontajeModal;
})(typeof window !== 'undefined' ? window : this);
