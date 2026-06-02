/**
 * HidroGrow — producto inicial «Germinación» (6 fases → traslado DWC/RDWC).
 * Tras hc-premium-wizard.js; antes de hc-dash-operativa.js.
 */
(function (global) {
  'use strict';

  var PASOS = [
    {
      id: 'semilla',
      paso: 1,
      titulo: 'Germinador (papel o domo)',
      desc: 'Semilla húmeda a 22–26 °C, a oscuras o en domo. Todavía no va al cubo hidro.',
      icon: '🌱',
    },
    {
      id: 'taproot',
      paso: 2,
      titulo: 'Radícula 5–10 mm',
      desc: 'La raíz blanca asoma: momento de pasarla al cubo de lana. No toques la punta.',
      icon: '🌿',
    },
    {
      id: 'rockwool',
      paso: 3,
      titulo: 'Cubo lana de roca 4×4 cm',
      desc: 'Remoja pH 5.5 e inserta la semilla en el hueco central del cubo.',
      icon: '🧊',
    },
    {
      id: 'domo',
      paso: 4,
      titulo: 'Domo húmedo + luz suave 18/6',
      desc: 'Plántula bajo domo (HR 70–80 %). Ventila 2×/día; luz tenue, no intensa.',
      icon: '🫧',
    },
    {
      id: 'netpot',
      paso: 5,
      titulo: 'Net pot + arcilla expandida',
      desc: 'Cuando la raíz sale del cubo, pasa a maceta de malla antes del depósito.',
      icon: '🪴',
    },
    {
      id: 'dwc',
      paso: 6,
      titulo: 'Traslado al cubo DWC/RDWC',
      desc: 'Solo plántula enraizada en net pot. Nunca siembra directa en el depósito · EC 400–600 µS.',
      icon: '💧',
    },
  ];

  var EQUIP_ESENCIAL = [
    { id: 'domo', label: 'Domo / propagador', emoji: '🫧' },
    { id: 'rockwool', label: 'Cubos lana 4×4', emoji: '🧊' },
    { id: 'ph', label: 'pH ~5,5 (cubos)', emoji: '🧪' },
    { id: 'luz', label: 'Luz tenue 18/6', emoji: '💡' },
    { id: 'netpot', label: 'Net pot', emoji: '🪴' },
    { id: 'arcilla', label: 'Arcilla expandida', emoji: '⚪' },
  ];

  var EQUIP_RECOMENDADO = [
    { id: 'termohigro', label: 'Termo-higrómetro', emoji: '🌡️' },
    { id: 'mat', label: 'Mat térmica', emoji: '🔥' },
  ];

  /** Avisos suaves por fase si falta equipamiento marcado (no bloquea). */
  var EQUIP_AVISO_FASE = {
    semilla: { need: ['domo'], msg: 'Sin domo/propagador marcado: germina a 22–26 °C en bandeja húmeda o domo.' },
    taproot: { need: ['domo', 'rockwool'], msg: 'Antes del cubo: ten listos domo y cubos de lana 4×4.' },
    rockwool: { need: ['rockwool', 'ph'], msg: 'Fase cubo: remoja lana a pH ~5,5 (marca pH y cubos si los tienes).' },
    domo: { need: ['domo', 'luz'], msg: 'Bajo domo: luz suave 18/6 y HR 70–80 %; ventila 2×/día.' },
    netpot: { need: ['netpot', 'arcilla'], msg: 'Tras el cubo: net pot + arcilla antes del depósito DWC/RDWC.' },
    dwc: { need: ['netpot', 'arcilla'], msg: 'Al hidro: solo plántula enraizada en net pot; EC baja en el depósito.' },
  };

  function avisoEquipFase(pasoId, g) {
    var spec = EQUIP_AVISO_FASE[pasoId];
    if (!spec || !g || !g.equip) return '';
    var falta = spec.need.filter(function (id) {
      return !g.equip[id];
    });
    if (!falta.length) return '';
    return spec.msg;
  }

  function renderEquipChips(list, g) {
    return list
      .map(function (eq) {
        var on = !!g.equip[eq.id];
        return (
          '<button type="button" class="hc-germ-equip-chip' +
          (on ? ' hc-germ-equip-chip--on' : '') +
          '" onclick="toggleGermEquip(\'' +
          eq.id +
          '\')" aria-pressed="' +
          (on ? 'true' : 'false') +
          '">' +
          '<span aria-hidden="true">' +
          eq.emoji +
          '</span> ' +
          esc(eq.label) +
          '</button>'
        );
      })
      .join('');
  }

  global.HC_GERMINACION_PASOS = PASOS;

  function esc(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function cfgActiva() {
    return typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
  }

  function hoyIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function hoyDisplay() {
    const d = new Date();
    return (
      d.getDate().toString().padStart(2, '0') +
      '/' +
      (d.getMonth() + 1).toString().padStart(2, '0') +
      '/' +
      d.getFullYear()
    );
  }

  function horaDisplay() {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function origenEsSemilla(cfg) {
    cfg = cfg || cfgActiva();
    const raw = (cfg.premiumSetup && cfg.premiumSetup.origenPlanta) || cfg.origenPlanta || '';
    if (raw === 'semilla') return true;
    if (typeof normalizarOrigenPlanta === 'function') {
      return normalizarOrigenPlanta(raw) === 'germinacion';
    }
    return raw === 'germinacion';
  }

  function ensureGerminacionFlow(cfg) {
    cfg = cfg || cfgActiva();
    if (!cfg.germinacionFlow || typeof cfg.germinacionFlow !== 'object') {
      cfg.germinacionFlow = {
        activo: false,
        pasos: {},
        equip: {},
        variedadId: '',
        startedAt: '',
        trasladoAt: '',
        ultimaDomo: null,
      };
    }
    const g = cfg.germinacionFlow;
    if (!g.pasos || typeof g.pasos !== 'object') g.pasos = {};
    if (!g.equip || typeof g.equip !== 'object') g.equip = {};
    migrateChecklistLegacy(cfg, g);
    return g;
  }

  function migrateChecklistLegacy(cfg, g) {
    const leg = cfg.premiumSetup && cfg.premiumSetup.germinacionChecklist;
    if (!leg || typeof leg !== 'object') return;
    let moved = false;
    PASOS.forEach(function (p) {
      if (leg[p.id] && !g.pasos[p.id]) {
        g.pasos[p.id] = { doneAt: hoyIso(), fecha: hoyDisplay(), hora: horaDisplay() };
        moved = true;
      }
    });
    if (moved && !g.startedAt) g.startedAt = hoyIso();
  }

  function hcGerminacionSyncDesdePremium(cfg) {
    if (!cfg || !origenEsSemilla(cfg)) {
      if (cfg && cfg.germinacionFlow) cfg.germinacionFlow.activo = false;
      return;
    }
    const g = ensureGerminacionFlow(cfg);
    if (!g.trasladoAt) g.activo = true;
    if (!g.startedAt && g.activo) g.startedAt = hoyIso();
    if (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) {
      g.variedadId = cfg.premiumSetup.variedadGerminacion;
    }
  }

  function hcGerminacionActiva(cfg) {
    cfg = cfg || cfgActiva();
    if (!origenEsSemilla(cfg)) return false;
    const g = ensureGerminacionFlow(cfg);
    if (g.trasladoAt) return false;
    return !!g.activo;
  }

  function indiceFaseActual(g) {
    for (let i = 0; i < PASOS.length; i++) {
      if (!g.pasos[PASOS[i].id] || !g.pasos[PASOS[i].id].doneAt) return i;
    }
    return PASOS.length;
  }

  function fasesCompletadas(g) {
    return indiceFaseActual(g) >= PASOS.length;
  }

  function pctProgreso(g) {
    let n = 0;
    PASOS.forEach(function (p) {
      if (g.pasos[p.id] && g.pasos[p.id].doneAt) n++;
    });
    return Math.round((n / PASOS.length) * 100);
  }

  function persistirGerminacion() {
    try {
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
      if (typeof saveState === 'function') saveState();
    } catch (_) {}
  }

  function mostrarCelebracionFase(paso, siguiente) {
    var prev = document.getElementById('hcGermCelebracionOverlay');
    if (prev) prev.remove();
    var o = document.createElement('div');
    o.id = 'hcGermCelebracionOverlay';
    o.className = 'hc-germ-celebrate-overlay';
    o.setAttribute('role', 'alertdialog');
    o.setAttribute('aria-label', 'Fase completada');
    var sigTxt = siguiente
      ? '<p class="hc-germ-celebrate-next">Siguiente: <strong>' + esc(siguiente.titulo) + '</strong></p>'
      : '<p class="hc-germ-celebrate-next"><strong>¡Camino completo!</strong> Ya puedes trasladar al hidro.</p>';
    o.innerHTML =
      '<div class="hc-germ-celebrate-card">' +
      '<div class="hc-germ-celebrate-burst" aria-hidden="true"></div>' +
      '<span class="hc-germ-celebrate-ico" aria-hidden="true">' +
      (paso.icon || '✓') +
      '</span>' +
      '<h3 class="hc-germ-celebrate-title">Fase ' +
      paso.paso +
      ' completada</h3>' +
      '<p class="hc-germ-celebrate-sub">' +
      esc(paso.titulo) +
      '</p>' +
      sigTxt +
      '</div>';
    document.body.appendChild(o);
    setTimeout(function () {
      o.classList.add('hc-germ-celebrate-overlay--out');
      setTimeout(function () {
        o.remove();
      }, 420);
    }, 2200);
  }

  function hcGerminacionCompletarFaseActual() {
    const cfg = cfgActiva();
    const g = ensureGerminacionFlow(cfg);
    const idx = indiceFaseActual(g);
    if (idx >= PASOS.length) {
      if (typeof showToast === 'function') showToast('Todas las fases están completadas', false);
      return;
    }
    const paso = PASOS[idx];
    g.pasos[paso.id] = { doneAt: hoyIso(), fecha: hoyDisplay(), hora: horaDisplay() };
    if (!g.startedAt) g.startedAt = hoyIso();
    persistirGerminacion();
    const sig = idx < PASOS.length - 1 ? PASOS[idx + 1] : null;
    mostrarCelebracionFase(paso, sig);
    if (typeof showToast === 'function') {
      showToast(
        sig ? '✓ Fase ' + paso.paso + ' lista · Sigue con: ' + sig.titulo : '✓ Germinación lista para el hidro',
        false
      );
    }
    refreshDashGerminacionHub();
    if (fasesCompletadas(g)) {
      setTimeout(function () {
        try {
          document.getElementById('hcGermTrasladoCta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (_) {}
      }, 800);
    }
  }

  function toggleGermEquip(id) {
    const cfg = cfgActiva();
    const g = ensureGerminacionFlow(cfg);
    g.equip[id] = !g.equip[id];
    persistirGerminacion();
    refreshDashGerminacionHub();
  }

  function guardarMedicionDomo() {
    const t = parseFloat(String(document.getElementById('hcGermDomoTemp')?.value || '').replace(',', '.'));
    const h = parseFloat(String(document.getElementById('hcGermDomoHr')?.value || '').replace(',', '.'));
    const cfg = cfgActiva();
    const g = ensureGerminacionFlow(cfg);
    const vpd =
      typeof calcVPDkPa === 'function' && Number.isFinite(t) && Number.isFinite(h)
        ? calcVPDkPa(t, h)
        : NaN;
    g.ultimaDomo = {
      fecha: hoyDisplay(),
      hora: horaDisplay(),
      temp: Number.isFinite(t) ? t : null,
      hr: Number.isFinite(h) ? h : null,
      vpd: Number.isFinite(vpd) ? vpd : null,
    };
    persistirGerminacion();
    if (typeof guardarMedicion === 'function' && (Number.isFinite(t) || Number.isFinite(h))) {
      guardarMedicion({
        tempAire: Number.isFinite(t) ? t : '',
        humSala: Number.isFinite(h) ? h : '',
        vpd: Number.isFinite(vpd) ? vpd : '',
        notas: 'Germinación · domo',
        skipClearInputs: true,
        source: 'germ-domo',
      }).catch(function () {});
    } else if (typeof showToast === 'function') {
      showToast('Registro del domo guardado', false);
    }
    refreshDashGerminacionHub();
  }

  function primerCestaVacia() {
    const tor = state.torre || [];
    const numN = (state.configTorre && state.configTorre.numNiveles) || tor.length || 1;
    for (let n = 0; n < numN; n++) {
      const row = tor[n] || [];
      for (let c = 0; c < row.length; c++) {
        if (!row[c] || !row[c].variedad) return { n: n, c: c };
      }
    }
    return null;
  }

  function hcGerminacionAbrirTraslado() {
    const cfg = cfgActiva();
    const g = ensureGerminacionFlow(cfg);
    if (!fasesCompletadas(g)) {
      if (typeof showToast === 'function') {
        showToast('Completa las 6 fases del camino antes del traslado (o marca la fase actual)', true);
      }
      return;
    }
    var prev = document.getElementById('hcGermTrasladoOverlay');
    if (prev) prev.remove();
    var slot = primerCestaVacia();
    var cultOpts = '';
    try {
      if (typeof CULTIVOS_DB !== 'undefined' && CULTIVOS_DB) {
        CULTIVOS_DB.filter(function (cu) {
          return cu && cu.id && (cu.grupo === 'indica' || cu.grupo === 'hibrida' || cu.grupo === 'sativa' || cu.grupo === 'auto');
        }).forEach(function (cu) {
          cultOpts +=
            '<option value="' +
            esc(cu.id) +
            '"' +
            (g.variedadId === cu.id ? ' selected' : '') +
            '>' +
            esc(cu.nombre || cu.id) +
            '</option>';
        });
      }
    } catch (_) {}
    var tipo =
      typeof etiquetaTipoInstalacion === 'function'
        ? etiquetaTipoInstalacion(cfg)
        : cfg.tipoInstalacion === 'rdwc'
          ? 'RDWC'
          : 'DWC';
    var o = document.createElement('div');
    o.id = 'hcGermTrasladoOverlay';
    o.className = 'checklist-pregunta-overlay';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.innerHTML =
      '<div class="checklist-pregunta-sheet hc-germ-traslado-sheet">' +
      '<div class="checklist-pregunta-handle"></div>' +
      '<div class="checklist-pregunta-head">' +
      '<div class="checklist-pregunta-emoji">💧</div>' +
      '<div><div class="checklist-pregunta-title">Trasladar al ' +
      esc(tipo) +
      '</div></div></div>' +
      '<p class="checklist-pregunta-nota-pasos">La plántula entra en la matriz con origen <strong>germinación propia</strong> y fecha de hoy. EC inicial baja (400–600 µS) hasta que enraice en el depósito.</p>' +
      '<label class="hc-germ-traslado-lbl">Variedad</label>' +
      '<select id="hcGermTrasladoVar" class="form-select hc-germ-traslado-inp">' +
      '<option value="">— Elige variedad —</option>' +
      cultOpts +
      '</select>' +
      (slot
        ? '<p class="setup-field-hint">Cesta sugerida: nivel ' +
          (slot.n + 1) +
          ', posición ' +
          (slot.c + 1) +
          '</p>'
        : '<p class="setup-box-warn">No hay cesta vacía: libera una en Cultivo e instalación o el traslado la ocupará en la primera libre.</p>') +
      '<div class="checklist-bloqueo-actions">' +
      '<button type="button" id="hcGermTrasladoOk" class="checklist-pregunta-btn-main">Confirmar traslado</button>' +
      '</div>' +
      '<button type="button" id="hcGermTrasladoCancel" class="checklist-pregunta-btn-later">Cancelar</button>' +
      '</div>';
    document.body.appendChild(o);
    if (typeof a11yDialogOpened === 'function') a11yDialogOpened(o);
    var cerrar = function () {
      try {
        if (typeof a11yDialogClosed === 'function') a11yDialogClosed(o);
      } catch (_) {}
      o.remove();
    };
    document.getElementById('hcGermTrasladoCancel').addEventListener('click', cerrar);
    document.getElementById('hcGermTrasladoOk').addEventListener('click', function () {
      var vid = String(document.getElementById('hcGermTrasladoVar')?.value || '').trim();
      if (!vid) {
        if (typeof showToast === 'function') showToast('Elige la variedad', true);
        return;
      }
      var dest = primerCestaVacia();
      if (!dest) {
        if (typeof showToast === 'function') showToast('No hay cesta vacía en el esquema', true);
        return;
      }
      if (typeof aplicarCultivoACestaUna === 'function') {
        var orSel = document.getElementById('torreAssignOrigen');
        if (orSel) orSel.value = 'germinacion';
        aplicarCultivoACestaUna(dest.n, dest.c, vid);
      } else {
        var row = state.torre[dest.n][dest.c];
        row.variedad = vid;
        row.fecha = hoyIso();
        row.origenPlanta = 'germinacion';
      }
      g.variedadId = vid;
      g.trasladoAt = new Date().toISOString();
      g.activo = false;
      persistirGerminacion();
      cerrar();
      refreshDashGerminacionHub();
      if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
      if (typeof updateDashboard === 'function') updateDashboard();
      if (typeof showToast === 'function') showToast('✓ Planta en el ' + tipo + ' · sigue con el primer llenado del depósito', false);
      setTimeout(function () {
        if (typeof goTab === 'function') goTab('sistema');
        if (typeof setTorreInteraccionModo === 'function') setTorreInteraccionModo('editar', { skipTutorial: true });
      }, 400);
    });
  }

  function renderTimeline(g, idxActual) {
    return (
      '<div class="hc-germ-rail" role="list" aria-label="Camino semilla a cubo hidro">' +
      PASOS.map(function (p, i) {
        var done = !!(g.pasos[p.id] && g.pasos[p.id].doneAt);
        var cur = i === idxActual && !done;
        var cls = 'hc-germ-rail-step';
        if (done) cls += ' hc-germ-rail-step--done';
        if (cur) cls += ' hc-germ-rail-step--current';
        return (
          '<div class="' +
          cls +
          '" role="listitem" title="' +
          esc(p.titulo) +
          '">' +
          '<span class="hc-germ-rail-dot" aria-hidden="true">' +
          (done ? '✓' : p.paso) +
          '</span>' +
          '<span class="hc-germ-rail-lbl">' +
          p.paso +
          '</span></div>'
        );
      }).join('') +
      '<div class="hc-germ-rail-fill" style="--hc-germ-pct:' +
      pctProgreso(g) +
      '%" aria-hidden="true"></div></div>'
    );
  }

  function renderDashGerminacionHub() {
    var hub = document.getElementById('dashGerminacionHub');
    if (!hub) return;
    var cfg = cfgActiva();
    if (!hcGerminacionActiva(cfg)) {
      hub.classList.add('setup-hidden');
      hub.innerHTML = '';
      return;
    }
    hub.classList.remove('setup-hidden');
    var g = ensureGerminacionFlow(cfg);
    var idx = indiceFaseActual(g);
    var pct = pctProgreso(g);
    var paso = idx < PASOS.length ? PASOS[idx] : PASOS[PASOS.length - 1];
    var allDone = fasesCompletadas(g);
    var tipo =
      typeof etiquetaTipoInstalacion === 'function'
        ? etiquetaTipoInstalacion(cfg)
        : cfg.tipoInstalacion === 'rdwc'
          ? 'RDWC'
          : 'DWC';
    var cultNombre = '';
    if (g.variedadId && typeof getCultivoDB === 'function') {
      var cu = getCultivoDB(g.variedadId);
      if (cu) cultNombre = cu.nombre || g.variedadId;
    }
    var domo = g.ultimaDomo || {};
    var equipAviso = allDone ? '' : avisoEquipFase(paso.id, g);
    var semMarca = '';
    try {
      var sem = cfg.semillero;
      if (sem && sem.id && sem.marca && !sem.omitido) {
        semMarca =
          '<p class="hc-germ-hub-sem">Perfil tienda: <strong>' +
          esc(sem.marca) +
          '</strong> · orientativo EC/pH (no es el domo)</p>';
      }
    } catch (_) {}

    hub.innerHTML =
      '<div class="hc-germ-hub-card">' +
      '<div class="hc-germ-hub-head">' +
      '<div class="hc-germ-hub-badge">Producto inicial</div>' +
      '<div class="hc-germ-hub-pct-ring" style="--hc-germ-pct:' +
      pct +
      '%" aria-hidden="true"><span>' +
      pct +
      '%</span></div>' +
      '<div class="hc-germ-hub-titles">' +
      '<h2 class="hc-germ-hub-title">Germinación · camino al cubo</h2>' +
      '<p class="hc-germ-hub-sub">6 fases en orden · luego traslado a <strong>' +
      esc(tipo) +
      '</strong></p>' +
      (cultNombre ? '<p class="hc-germ-hub-var">Variedad: ' + esc(cultNombre) + '</p>' : '') +
      semMarca +
      '</div></div>' +
      renderTimeline(g, idx) +
      '<div class="hc-germ-focus' +
      (allDone ? ' hc-germ-focus--done' : '') +
      '">' +
      '<span class="hc-germ-focus-ico" aria-hidden="true">' +
      (allDone ? '🎉' : paso.icon) +
      '</span>' +
      '<div class="hc-germ-focus-body">' +
      '<div class="hc-germ-focus-kicker">' +
      (allDone ? 'Camino completo' : 'Fase ' + paso.paso + ' de ' + PASOS.length) +
      '</div>' +
      '<h3 class="hc-germ-focus-title">' +
      esc(allDone ? 'Lista para el hidro' : paso.titulo) +
      '</h3>' +
      '<p class="hc-germ-focus-desc">' +
      esc(allDone ? 'Asigna la plántula en la matriz y prepara el depósito con EC baja.' : paso.desc) +
      '</p>' +
      (equipAviso ? '<p class="hc-germ-equip-aviso" role="note">' + esc(equipAviso) + '</p>' : '') +
      (allDone
        ? ''
        : '<button type="button" class="btn btn-primary hc-germ-focus-cta" onclick="hcGerminacionCompletarFaseActual()">Marcar fase completada</button>') +
      '</div></div>' +
      '<div class="hc-germ-equip-block">' +
      '<h4 class="hc-germ-block-lbl">Equipamiento del germinador</h4>' +
      '<p class="hc-germ-equip-lead">Marca lo que tienes en casa · no sustituye la marca de semillas del asistente.</p>' +
      '<div class="hc-germ-equip-tier">Esencial</div>' +
      '<div class="hc-germ-equip-row">' +
      renderEquipChips(EQUIP_ESENCIAL, g) +
      '</div>' +
      '<div class="hc-germ-equip-tier hc-germ-equip-tier--rec">Recomendado</div>' +
      '<div class="hc-germ-equip-row">' +
      renderEquipChips(EQUIP_RECOMENDADO, g) +
      '</div></div>' +
      '<div class="hc-germ-domo-block">' +
      '<h4 class="hc-germ-block-lbl">Monitor del domo</h4>' +
      '<p class="hc-germ-domo-hint">T° y HR del propagador (no del depósito). Ideal 22–26 °C · HR 70–80 %.</p>' +
      '<div class="hc-germ-domo-grid">' +
      '<label class="dash-quick-field"><span class="dash-quick-label">T° domo °C</span>' +
      '<input type="number" class="param-input dash-quick-input" id="hcGermDomoTemp" inputmode="decimal" step="0.1" value="' +
      (domo.temp != null ? domo.temp : '') +
      '"></label>' +
      '<label class="dash-quick-field"><span class="dash-quick-label">HR %</span>' +
      '<input type="number" class="param-input dash-quick-input" id="hcGermDomoHr" inputmode="numeric" value="' +
      (domo.hr != null ? domo.hr : '') +
      '"></label></div>' +
      (domo.fecha
        ? '<p class="hc-germ-domo-last">Último: ' +
          esc(domo.fecha) +
          ' ' +
          esc(domo.hora || '') +
          (domo.vpd != null ? ' · VPD ' + domo.vpd + ' kPa' : '') +
          '</p>'
        : '') +
      '<button type="button" class="btn btn-secondary btn-sm" onclick="guardarMedicionDomo()">Guardar lectura del domo</button>' +
      '</div>' +
      (allDone
        ? '<div class="hc-germ-traslado-block" id="hcGermTrasladoCta">' +
          '<button type="button" class="btn btn-primary btn-lg hc-germ-traslado-btn" onclick="hcGerminacionAbrirTraslado()">Trasladar al ' +
          esc(tipo) +
          ' →</button>' +
          '<p class="hc-germ-traslado-foot">Configura el ' +
          esc(tipo) +
          ' en paralelo; la planta entra cuando tú confirmes.</p></div>'
        : '') +
      '</div>';
  }

  function hcGerminacionRenderSetupPreview() {
    var sec = document.getElementById('setupPremiumGerminacionPasos');
    if (!sec) return;
    var orig =
      typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup().origenPlanta || 'semilla' : 'semilla';
    if (orig !== 'semilla') {
      if (typeof refreshPremiumGerminacionUI === 'function') refreshPremiumGerminacionUI();
      return;
    }
    sec.innerHTML =
      '<div class="hc-germ-setup-preview setup-box-info" role="note">' +
      '<p><strong>Camino semilla → cubo (6 fases).</strong> No las marques aquí: son días de trabajo real.</p>' +
      '<p>Al guardar la instalación, el seguimiento aparece en <strong>Inicio</strong> con equipamiento, monitor del domo y avisos al completar cada fase.</p>' +
      '<ol class="hc-germ-setup-ol">' +
      PASOS.map(function (p) {
        return '<li><strong>' + p.paso + '.</strong> ' + esc(p.titulo) + '</li>';
      }).join('') +
      '</ol></div>';
  }

  function hcGerminacionActivarDesdeSetup() {
    var cfg = cfgActiva();
    if (typeof setupData !== 'undefined' && setupData.premium) {
      setupData.premium.origenPlanta = 'semilla';
    }
    hcGerminacionSyncDesdePremium(cfg);
    ensureGerminacionFlow(cfg).activo = true;
    ensureGerminacionFlow(cfg).startedAt = hoyIso();
  }

  global.hcGerminacionActiva = hcGerminacionActiva;
  global.hcGerminacionSyncDesdePremium = hcGerminacionSyncDesdePremium;
  global.refreshDashGerminacionHub = refreshDashGerminacionHub;
  global.hcGerminacionCompletarFaseActual = hcGerminacionCompletarFaseActual;
  global.hcGerminacionAbrirTraslado = hcGerminacionAbrirTraslado;
  global.hcGerminacionRenderSetupPreview = hcGerminacionRenderSetupPreview;
  global.hcGerminacionActivarDesdeSetup = hcGerminacionActivarDesdeSetup;
  global.toggleGermEquip = toggleGermEquip;
  global.guardarMedicionDomo = guardarMedicionDomo;
  global.ensureGerminacionFlow = ensureGerminacionFlow;
})();
