/**
 * HidroGrow — checklist de montaje del propagador / prep germinación en hidro.
 * Fase previa a las 6 fases de germinación (rutas semilla_propagador y semilla_hidro).
 */
(function (global) {
  'use strict';

  var ITEMS_PROPAGADOR = [
    { id: 'prop_domo', label: 'Domo / propagador montado', hint: 'Bandeja estable, tapa hermética y acceso para ventilar 2×/día.' },
    { id: 'prop_mat', label: 'Mat térmica bajo bandeja (si aplica)', hint: '22–26 °C en sustrato; termostato o termohigrómetro cerca.' },
    { id: 'prop_termo', label: 'Termo-higrómetro en zona de germinación', hint: 'HR 70–80 % bajo domo; anota en el registro diario.' },
    { id: 'prop_luz', label: 'Luz suave 18/6 (tenue)', hint: 'No LED de floración encima del domo; fluorescente o LED muy bajo.' },
    { id: 'prop_rockwool', label: 'Cubos lana 4×4 remojados pH 5,5', hint: 'Listos para fase 3 del camino; agua destilada u ósmosis.' },
    { id: 'prop_higiene', label: 'Higiene: tijeras y superficie limpias', hint: 'Alcohol 70 % en herramientas; evita tocar radículas.' },
    { id: 'prop_vent', label: 'Ventilación del domo probada', hint: 'Abre 2× al día 3–5 min; sin corrientes frías directas.' },
  ];

  var ITEMS_ENRAIZADO = [
    { id: 'enr_domo', label: 'Domo de enraizado montado', hint: 'HR 70–80 %, 22–26 °C; ventilar 2×/día.' },
    { id: 'enr_rockwool', label: 'Cubos rockwool pH 5,5 listos', hint: 'Humedecidos, no encharcados; gel/polvo de enraizante a mano.' },
    { id: 'enr_higiene', label: 'Tijeras y superficie esterilizadas', hint: 'Alcohol 70 %; corte 45° por la mañana si puedes.' },
    { id: 'enr_luz', label: 'Luz tenue 18/6 sobre el domo', hint: 'Sin LED de floración directo sobre esquejes tiernos.' },
    { id: 'enr_termo', label: 'Termo-higrómetro en la zona de clones', hint: 'Anota T° y HR en el protocolo de esquejes.' },
    { id: 'enr_aire', label: 'Aireación del depósito/clonador comprobada', hint: 'Burbujeo suave; EC 0–400 µS las primeras 48 h si usas mini DWC.' },
  ];

  var ITEMS_PREP_HIDRO = [
    { id: 'ph_netpot', label: 'Net pot y cubo de lana en el sistema', hint: 'Semilla nunca suelta en el depósito; solo en cubo dentro de la maceta.' },
    { id: 'ph_nivel', label: 'Nivel de agua mínimo / niebla de raíz', hint: 'EC 200–400 µS hasta enraizar; T° agua 20–24 °C.' },
    { id: 'ph_domo_mini', label: 'Mini domo o HR alta sobre la maceta', hint: 'Microclima hasta que la plántula aguante sin domo.' },
    { id: 'ph_medidor', label: 'Medidor EC/pH a mano listo', hint: 'Calibración reciente; anota en Medir cuando subas EC.' },
    { id: 'ph_aire', label: 'Aireación del depósito comprobada', hint: 'Burbujeo suave; sin burbujas fuertes sobre la semilla.' },
    { id: 'ph_luz', label: 'Luz tenue 18/6 sobre la zona', hint: 'Misma lógica que propagador: evita estrés en plántula joven.' },
  ];

  var GUIAS = {
    prop_domo: {
      title: 'Montar el domo',
      steps: [
        'Coloca la bandeja a nivel y la mat térmica si la usas.',
        'Comprueba que la tapa cierra bien y deja hueco para cables de termohigrómetro.',
        'Marca en catálogo el modelo de propagador si aún no lo hiciste en el asistente.',
      ],
    },
    prop_mat: {
      title: 'Mat térmica',
      steps: ['Enciende la mat antes de sembrar.', 'Comprueba que no supera ~28 °C en la base del cubo.'],
    },
    prop_luz: {
      title: 'Luz de germinación',
      steps: ['18 h encendido / 6 h apagado.', 'Distancia: luz tenue, sin quemar hojas.'],
    },
    ph_netpot: {
      title: 'Net pot en el hidro',
      steps: [
        'Cubo de lana humedecido en la maceta.',
        'Depósito con nivel bajo: la raíz busca humedad sin sumergir la semilla.',
      ],
    },
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

  function renderCard(it, checks) {
    var on = !!checks[it.id];
    return (
      '<label class="hc-pm-card hc-prop-card' +
      (on ? ' hc-pm-card--on' : '') +
      '" data-prop-id="' +
      esc(it.id) +
      '">' +
      '<input type="checkbox" class="hc-pm-card-input" ' +
      (on ? 'checked ' : '') +
      'onchange="hcPropagadorToggleItem(\'' +
      esc(it.id) +
      '\', this.checked)">' +
      '<span class="hc-pm-card-body">' +
      '<span class="hc-pm-card-label">' +
      esc(it.label) +
      '</span>' +
      '<span class="hc-pm-card-hint">' +
      esc(it.hint) +
      '</span></span></label>'
    );
  }

  function renderBodyHtml(cfg) {
    cfg = cfg || getCfg();
    var checks = getChecks(cfg);
    var items = buildItems(cfg);
    var prog = countProgress(checks, items);
    var verificada = !!checks.completedAt;
    var titulo = esRutaGermHidro(cfg)
      ? 'Preparación · germinación en el hidro'
      : 'Montaje del propagador / domo';
    var lead = esRutaGermHidro(cfg)
      ? 'Antes de las <strong>6 fases</strong>: confirma net pot y microclima. Después <strong>configura la sala</strong> (asistente + montaje); el DWC/RDWC se cierra al terminar el camino (sin repetir germinación en el depósito).'
      : 'Imprescindible antes de la sala y las <strong>6 fases</strong>. Tras este checklist: <strong>configura la sala</strong>; el DWC/RDWC va al terminar la germinación.';
    return (
      '<div class="hc-pm-shell hc-pm-shell--prop">' +
      '<h3 class="hc-prop-modal-title">' +
      esc(titulo) +
      '</h3>' +
      '<p class="hc-pm-lead">' +
      lead +
      '</p>' +
      '<div class="hc-pm-progress">' +
      '<span class="hc-pm-progress-txt">' +
      prog.done +
      '/' +
      prog.total +
      ' puntos</span>' +
      (verificada ? '<span class="hc-pm-progress-ok">✓ Verificado</span>' : '') +
      '</div>' +
      '<div class="hc-pm-cards-grid">' +
      items.map(function (it) {
        return renderCard(it, checks);
      }).join('') +
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
    return (
      '<div class="hc-prop-inline" id="hcPropagadorMontajeInline">' +
      '<div class="hc-prop-inline-head">' +
      '<h3 class="hc-prop-inline-title">' +
      esc(titulo) +
      '</h3>' +
      '<span class="hc-prop-inline-pct">' +
      (verificada ? '✓ Listo' : prog.done + '/' + prog.total) +
      '</span></div>' +
      '<p class="hc-prop-inline-lead">Completa este checklist; después <strong>configura la sala</strong> y luego las 6 fases.</p>' +
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
    var body = document.getElementById('propagadorMontajeBody');
    if (body) body.innerHTML = renderBodyHtml(getCfg());
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
    var msgConfirm = esRutaEsqueje(cfg)
      ? '¿Confirmas que el domo de enraizado está listo?\n\nSiguiente: asignar esquejes en la matriz y primer llenado.'
      : esRutaGermHidro(cfg)
        ? '¿Confirmas el preparativo en hidro?\n\nSiguiente: configurar la sala antes de las 6 fases.'
        : '¿Confirmas el propagador/domo?\n\nSiguiente: configurar la sala (carpa, LED, extractor) antes de las 6 fases.';
    if (!confirm(msgConfirm)) {
      return;
    }
    checks.completedAt = new Date().toISOString();
    saveChecks(cfg, checks);
    hcClosePropagadorMontajeChecklist();
    refreshPropagadorMontajeUi();
    if (typeof showToast === 'function') {
      showToast(
        esRutaEsqueje(cfg)
          ? '✓ Enraizado listo. Asigna clones en Cultivo e instalación.'
          : '✓ Listo. Ahora configura la sala completa en el asistente.',
        false,
        { durationMs: 5600 }
      );
    }
    if (esRutaEsqueje(cfg)) {
      refreshPropagadorMontajeUi();
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
  global.renderPropagadorMontajeInlineHtml = renderInlineEnGermHub;
  global.hcPropagadorMontajeSiguienteTrasGerminacion = hcPropagadorMontajeSiguienteTrasGerminacion;
})(typeof window !== 'undefined' ? window : this);
