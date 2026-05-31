/**
 * HidroGrow — «¿Cuántas salas?» al primer uso + nombres sugeridos.
 */
(function (global) {
  'use strict';

  var PLAN_KEY = 'hcSalasPlan';
  var DONE_KEY = 'hcSalasPlanDone';

  var PRESETS = {
    1: [{ name: 'Sala principal', hint: 'Un solo DWC/RDWC con todo el ciclo o una sala mixta.' }],
    2: [
      { name: 'Vegetativo 18/6', hint: 'Crecimiento y prefloración.' },
      { name: 'Floración 12/12', hint: 'Cogollos; EC y HR distintas.' },
    ],
    3: [
      { name: 'Esquejes', hint: 'Clones o madre en cubo.' },
      { name: 'Vegetativo', hint: '18/6 · subir EC gradualmente.' },
      { name: 'Floración', hint: '12/12 · sala de cogollos.' },
    ],
  };

  var wizardStep = 1;
  var wizardCount = 1;
  var wizardNames = [];

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isFirstInstallPending() {
    try {
      if (typeof hcEsPrimeraVezAsistenteInstalacion === 'function' && !hcEsPrimeraVezAsistenteInstalacion()) {
        return false;
      }
    } catch (_) {
      return false;
    }
    try {
      return localStorage.getItem(DONE_KEY) !== '1';
    } catch (_) {
      return false;
    }
  }

  function loadPlan() {
    try {
      var raw = localStorage.getItem(PLAN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function savePlan(plan) {
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
      localStorage.setItem(DONE_KEY, '1');
    } catch (_) {}
  }

  function applyPlanToSetupGlobals(plan) {
    if (!plan) return;
    if (plan.firstName && typeof setupNombreNuevaTorre !== 'undefined') {
      setupNombreNuevaTorre = plan.firstName;
    }
    if (plan.count >= 2 && typeof seleccionarNumTorres === 'function') {
      seleccionarNumTorres('varias');
    } else if (typeof seleccionarNumTorres === 'function') {
      seleccionarNumTorres('una');
    }
    try {
      if (typeof setupNumTorres !== 'undefined') {
        setupNumTorres = plan.count >= 2 ? 'varias' : 'una';
      }
    } catch (_) {}
  }

  function renderSalasPlanWizard() {
    var body = document.getElementById('salasPlanWizardBody');
    var title = document.getElementById('salasPlanWizardTitle');
    var btnBack = document.getElementById('salasPlanBtnBack');
    var btnNext = document.getElementById('salasPlanBtnNext');
    if (!body) return;

    if (wizardStep === 1) {
      if (title) title.textContent = '¿Cuántas salas de cultivo tendrás?';
      body.innerHTML =
        '<p class="hc-salas-lead">No te preocupes: puedes empezar con una y añadir más después. La <strong>germinación en domo</strong> no cuenta como sala hidro salvo que uses un cubo dedicado.</p>' +
        '<div class="hc-salas-count-grid">' +
        '<button type="button" class="hc-salas-count-btn' +
        (wizardCount === 1 ? ' is-selected' : '') +
        '" data-count="1" onclick="hcSalasPlanPickCount(1)"><span class="hc-salas-count-num">1</span><span class="hc-salas-count-lbl">Una sala</span><span class="hc-salas-count-sub">Todo en un DWC/RDWC</span></button>' +
        '<button type="button" class="hc-salas-count-btn' +
        (wizardCount === 2 ? ' is-selected' : '') +
        '" data-count="2" onclick="hcSalasPlanPickCount(2)"><span class="hc-salas-count-num">2</span><span class="hc-salas-count-lbl">Dos salas</span><span class="hc-salas-count-sub">Veg + Flor habitual</span></button>' +
        '<button type="button" class="hc-salas-count-btn' +
        (wizardCount === 3 ? ' is-selected' : '') +
        '" data-count="3" onclick="hcSalasPlanPickCount(3)"><span class="hc-salas-count-num">3+</span><span class="hc-salas-count-lbl">Tres o más</span><span class="hc-salas-count-sub">Esquejes, veg, flor…</span></button>' +
        '</div>';
      if (btnBack) btnBack.style.display = 'none';
      if (btnNext) {
        btnNext.textContent = 'Siguiente →';
        btnNext.style.display = '';
      }
      return;
    }

    if (title) title.textContent = 'Nombra tu primera instalación';
    var presets = PRESETS[wizardCount] || PRESETS[1];
    if (!wizardNames.length) {
      wizardNames = presets.map(function (p) {
        return p.name;
      });
    }
    var rows = presets
      .map(function (p, i) {
        var val = wizardNames[i] != null ? wizardNames[i] : p.name;
        var isFirst = i === 0;
        return (
          '<div class="hc-salas-name-row' +
          (isFirst ? ' hc-salas-name-row--first' : ' hc-salas-name-row--later') +
          '">' +
          (isFirst
            ? '<label class="ctp-label" for="hcSalasName0">Nombre de la <strong>primera</strong> instalación (configuras ahora)</label>'
            : '<label class="ctp-label hc-salas-later-lbl" for="hcSalasName' +
              i +
              '">Instalación ' +
              (i + 1) +
              ' (después, con «Nuevo sistema»)</label>') +
          '<input type="text" id="hcSalasName' +
          i +
          '" class="ctp-input" maxlength="40" value="' +
          escHtml(val) +
          '" ' +
          (isFirst ? '' : 'readonly tabindex="-1"') +
          ' oninput="hcSalasPlanNameInput(' +
          i +
          ', this.value)">' +
          '<p class="hc-salas-name-hint">' +
          escHtml(p.hint) +
          '</p></div>'
        );
      })
      .join('');

    body.innerHTML =
      '<p class="hc-salas-lead">Configurarás la <strong>primera</strong> ahora. Las demás las creas con <strong>Nuevo sistema</strong> cuando estén listas.</p>' +
      rows +
      (wizardCount >= 2
        ? '<p class="hc-salas-note">Tras guardar, verás un recordatorio para añadir: ' +
          escHtml(wizardNames.slice(1).join(', ') || '—') +
          '.</p>'
        : '');
    if (btnBack) btnBack.style.display = '';
    if (btnNext) btnNext.textContent = 'Empezar configuración';
  }

  function openSalasPlanWizard(thenFn) {
    var modal = document.getElementById('modalSalasPlan');
    if (!modal) {
      if (typeof thenFn === 'function') thenFn();
      return;
    }
    wizardStep = 1;
    wizardCount = 1;
    wizardNames = PRESETS[1].map(function (p) {
      return p.name;
    });
    modal._hcThen = thenFn;
    renderSalasPlanWizard();
    modal.classList.add('open');
  }

  function closeSalasPlanWizard(ev) {
    if (ev && ev.target !== ev.currentTarget) return;
    var modal = document.getElementById('modalSalasPlan');
    if (modal) modal.classList.remove('open');
  }

  function pickCount(n) {
    wizardCount = n >= 3 ? 3 : n <= 1 ? 1 : n;
    wizardNames = (PRESETS[wizardCount] || PRESETS[1]).map(function (p) {
      return p.name;
    });
    renderSalasPlanWizard();
  }

  function nameInput(i, val) {
    wizardNames[i] = String(val || '').trim().slice(0, 40);
  }

  function wizardBack() {
    if (wizardStep > 1) {
      wizardStep = 1;
      renderSalasPlanWizard();
    }
  }

  function wizardNext() {
    if (wizardStep === 1) {
      wizardStep = 2;
      wizardNames = (PRESETS[wizardCount] || PRESETS[1]).map(function (p) {
        return p.name;
      });
      renderSalasPlanWizard();
      return;
    }
    var first = (wizardNames[0] || 'Sala principal').trim();
    if (!first) {
      if (typeof showToast === 'function') showToast('Escribe un nombre para la primera instalación.', true);
      return;
    }
    var pending = wizardNames.slice(1).filter(function (n) {
      return n && String(n).trim();
    });
    savePlan({
      count: wizardCount,
      firstName: first,
      pendingNames: pending,
      createdAt: new Date().toISOString(),
    });
    applyPlanToSetupGlobals({ count: wizardCount, firstName: first });
    closeSalasPlanWizard();
    var modal = document.getElementById('modalSalasPlan');
    var thenFn = modal && modal._hcThen;
    if (modal) modal._hcThen = null;
    if (typeof thenFn === 'function') thenFn();
  }

  function maybeShowSalasPlanBefore(thenFn) {
    if (!isFirstInstallPending()) {
      if (typeof thenFn === 'function') thenFn();
      return;
    }
    openSalasPlanWizard(thenFn);
  }

  function wrapAbrirSetup() {
    var orig = global.abrirSetup;
    if (typeof orig !== 'function' || orig._hcSalasWrapped) return;
    function wrapped() {
      maybeShowSalasPlanBefore(function () {
        var plan = loadPlan();
        if (plan) applyPlanToSetupGlobals(plan);
        orig.apply(global, arguments);
      });
    }
    wrapped._hcSalasWrapped = true;
    global.abrirSetup = wrapped;
  }

  function applyFirstInstallName() {
    var plan = loadPlan();
    if (!plan || !plan.firstName) return;
    try {
      if (typeof state !== 'undefined' && state && state.torres && state.torres.length) {
        var idx = state.torreActiva || 0;
        if (state.torres[idx]) {
          state.torres[idx].nombre = plan.firstName;
        }
      }
      if (typeof setupNombreNuevaTorre !== 'undefined') {
        setupNombreNuevaTorre = plan.firstName;
      }
    } catch (_) {}
  }

  function showPendingSalasReminder() {
    var plan = loadPlan();
    if (!plan || !plan.pendingNames || !plan.pendingNames.length) return;
    if (plan.reminderShown) return;
    plan.reminderShown = true;
    savePlan(plan);
    var txt = plan.pendingNames.join('», «');
    if (typeof showToast === 'function') {
      showToast(
        '📋 Cuando estén listas, añade instalaciones «' + txt + '» con Nuevo sistema (Cultivo e instalación).',
        false
      );
    }
  }

  function refreshHeaderInstActiva() {
    var host = document.getElementById('headerInstActiva');
    var nom = document.getElementById('headerInstActivaNombre');
    if (!host || !nom) return;
    var t =
      typeof getTorreActiva === 'function'
        ? getTorreActiva()
        : typeof state !== 'undefined' && state && state.torres
          ? state.torres[state.torreActiva || 0]
          : null;
    var name = t && t.nombre ? String(t.nombre).trim() : '';
    if (!name && !((state && state.torres && state.torres.length) || 0)) {
      host.classList.add('setup-hidden');
      return;
    }
    host.classList.remove('setup-hidden');
    nom.textContent = name || 'Instalación';
    host.setAttribute('aria-label', 'Instalación activa: ' + (name || 'Instalación') + '. Pulsa para cambiar.');
  }

  wrapAbrirSetup();
  function onReady() {
    wrapAbrirSetup();
    var plan = loadPlan();
    if (plan) applyPlanToSetupGlobals(plan);
    refreshHeaderInstActiva();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  global.hcSalasPlanPickCount = pickCount;
  global.hcSalasPlanNameInput = nameInput;
  global.hcSalasPlanWizardBack = wizardBack;
  global.hcSalasPlanWizardNext = wizardNext;
  global.hcCloseSalasPlanWizard = closeSalasPlanWizard;
  global.hcMaybeShowSalasPlanBefore = maybeShowSalasPlanBefore;
  global.hcApplySalasPlanFirstInstallName = applyFirstInstallName;
  global.hcShowPendingSalasReminder = showPendingSalasReminder;
  global.hcRefreshHeaderInstActiva = refreshHeaderInstActiva;
})(typeof window !== 'undefined' ? window : globalThis);
