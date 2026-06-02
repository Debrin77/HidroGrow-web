/**
 * HidroGrow — micro-ayudas del asistente de configuración (una línea por paso).
 */
(function (global) {
  'use strict';

  var SETUP_GUIAS = {
    0: { l1: 'DWC o RDWC — define el resto del asistente.' },
    1: { l1: 'Objetivo y nivel; luego entorno interior/exterior.' },
    2: { l1: 'Interior o exterior (clima y meteo).' },
    3: { l1: 'Carpa, LED y extractor; catálogo opcional.' },
    4: { l1: 'Fase y horas de luz → objetivos EC/VPD.' },
    5: { l1: 'SOG o SCROG; variedades en paso Cultivos.' },
    6: { l1: '6 fases en orden hasta el cubo hidro.' },
    7: { l1: 'Resumen; siguiente: geometría del sistema.' },
    8: { l1: 'Filas, cubos y depósito; diagrama en vivo.' },
    9: { l1: 'Circuito hidro, sala (filtro, circulación, timer LED), herramientas o toldo en exterior.' },
    10: { l1: 'Agua del depósito y medio en net pot.' },
    11: { l1: 'Nutriente para dosis según litros calculados.' },
    12: { l1: 'Exterior: ciudad para meteo (interior salta).' },
    13: { l1: 'Variedad y fecha por cesta con cultivo.' },
    14: { l1: 'Varias salas: nombra instalaciones (Veg, Flor…).' },
  };

  var SETUP_ROADMAP = [
    { id: 'inicio', label: 'Inicio', pages: [0] },
    { id: 'sala', label: 'Sala', pages: [1, 2, 3, 4] },
    { id: 'planta', label: 'Planta', pages: [5, 6] },
    { id: 'hidro', label: 'Hidro', pages: [7, 8, 9] },
    { id: 'mezcla', label: 'Mezcla', pages: [10, 11] },
    { id: 'cultivo', label: 'Cultivo', pages: [12, 13, 14] },
  ];

  var SETUP_EQUIP_VIS = {
    difusor: { emoji: '🫧', label: 'Aireador' },
    calentador: { emoji: '🔥', label: 'Calentador' },
    bomba: { emoji: '⚙️', label: 'Bomba recirc.' },
    medidorEC: { emoji: '📊', label: 'Medidor EC/pH' },
    timer: { emoji: '⏱️', label: 'Temporizador LED' },
    toldo: { emoji: '⛱️', label: 'Toldo / sombra' },
    co2: { emoji: '🌬️', label: 'CO₂' },
    filtroCarbon: { emoji: '🧫', label: 'Filtro carbón' },
    circulacion: { emoji: '🌀', label: 'Circulación' },
    tijeras: { emoji: '✂️', label: 'Tijeras poda' },
    lupa: { emoji: '🔍', label: 'Lupa tricomas' },
  };

  function esc(t) {
    return typeof escHtmlUi === 'function' ? escHtmlUi(t) : String(t || '');
  }

  function roadmapPhaseForPage(page) {
    for (var i = 0; i < SETUP_ROADMAP.length; i++) {
      if (SETUP_ROADMAP[i].pages.indexOf(page) >= 0) return SETUP_ROADMAP[i].id;
    }
    return 'inicio';
  }

  function renderSetupRoadmapMini(page) {
    var el = document.getElementById('setupRoadmapMini');
    if (!el) return;
    var active = roadmapPhaseForPage(page);
    var activeIdx = -1;
    for (var a = 0; a < SETUP_ROADMAP.length; a++) {
      if (SETUP_ROADMAP[a].id === active) {
        activeIdx = a;
        break;
      }
    }
    var html = '';
    for (var i = 0; i < SETUP_ROADMAP.length; i++) {
      var ph = SETUP_ROADMAP[i];
      var cls = 'setup-roadmap-chip';
      if (ph.id === active) cls += ' setup-roadmap-chip--active';
      else if (activeIdx >= 0 && i < activeIdx) cls += ' setup-roadmap-chip--done';
      html += '<span class="' + cls + '">' + esc(ph.label) + '</span>';
    }
    el.innerHTML = html;
    el.classList.remove('setup-hidden');
  }

  function renderSetupGuiaPanel(page) {
    var panel = document.getElementById('setupGuiaPanel');
    if (!panel) return;
    var g = SETUP_GUIAS[page];
    if (!g) {
      panel.classList.add('setup-hidden');
      panel.innerHTML = '';
      return;
    }
    panel.classList.remove('setup-hidden');
    panel.innerHTML = '<p class="setup-guia-l1">' + esc(g.l1) + '</p>';
    renderSetupRoadmapMini(page);
  }

  function getEquipInstaladoCfg() {
    try {
      if (typeof state !== 'undefined' && state && state.configTorre && state.configTorre.equipamientoInstalado) {
        return state.configTorre.equipamientoInstalado;
      }
    } catch (_) {}
    return {};
  }

  function buildSetupEquipamientoMerged(draft) {
    draft = draft || {};
    var eq = new Set(Array.isArray(draft.equipamiento) ? draft.equipamiento : []);
    if (typeof setupEquipamiento !== 'undefined' && setupEquipamiento && setupEquipamiento.forEach) {
      setupEquipamiento.forEach(function (id) {
        eq.add(id);
      });
    }
    if (!eq.has('difusor')) eq.add('difusor');
    draft.equipamiento = Array.from(eq);
    draft.equipamientoInstalado = getEquipInstaladoCfg();
    return draft;
  }

  function collectSetupEquipLegendItems() {
    var items = [];
    var seen = {};
    var inst = getEquipInstaladoCfg();
    Object.keys(inst).forEach(function (cat) {
      var entry = inst[cat];
      if (!entry || seen[cat]) return;
      seen[cat] = true;
      var vis =
        typeof global.HC_VISUAL !== 'undefined' && global.HC_VISUAL && global.HC_VISUAL[cat]
          ? global.HC_VISUAL[cat]
          : null;
      var label = entry.marca && entry.modelo ? entry.marca + ' ' + entry.modelo : vis ? vis.label : cat;
      items.push({
        emoji: vis ? vis.emoji : '🔧',
        label: label,
        sub: vis ? vis.label : '',
      });
    });
    if (typeof setupEquipamiento !== 'undefined' && setupEquipamiento) {
      setupEquipamiento.forEach(function (id) {
        if (seen[id]) return;
        var meta = SETUP_EQUIP_VIS[id];
        if (!meta) return;
        seen[id] = true;
        items.push({ emoji: meta.emoji, label: meta.label, sub: 'En diagrama' });
      });
    }
    return items;
  }

  function renderSetupDiagramEquipLegend(previewEl) {
    if (!previewEl) return;
    var section = previewEl.closest('.setup-dwc-preview-section');
    if (!section) return;
    var legend = section.querySelector('.setup-diagram-equip-legend');
    if (!legend) {
      legend = document.createElement('div');
      legend.className = 'setup-diagram-equip-legend';
      legend.setAttribute('role', 'note');
      legend.setAttribute('aria-label', 'Equipamiento en el diagrama');
      section.appendChild(legend);
    }
    var items = collectSetupEquipLegendItems();
    if (!items.length) {
      legend.classList.add('setup-hidden');
      legend.innerHTML = '';
      return;
    }
    legend.classList.remove('setup-hidden');
    legend.innerHTML =
      '<span class="setup-diagram-equip-kicker">Equipamiento</span>' +
      items
        .map(function (it) {
          return (
            '<span class="setup-diagram-equip-chip" title="' +
            esc(it.sub || it.label) +
            '">' +
            '<span class="setup-diagram-equip-emoji" aria-hidden="true">' +
            it.emoji +
            '</span>' +
            esc(it.label) +
            '</span>'
          );
        })
        .join('');
  }

  function renderSetupDiagramEquipLegendForPreviews() {
    ['setupDwcPreview', 'setupRdwcPreview'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.querySelector('svg')) renderSetupDiagramEquipLegend(el);
    });
  }

  function markSetupDiagramCrisp(previewEl) {
    if (!previewEl) return;
    previewEl.classList.add('setup-diagram-crisp');
    var section = previewEl.closest('.setup-dwc-preview-section');
    if (section) section.classList.add('setup-dwc-preview-section--diagram');
    boostSetupDiagramLegibility(previewEl);
  }

  /** Trazos muy claros (#e2e8f0…) casi no se ven sobre el fondo azul del SVG en el asistente. */
  function boostSetupDiagramLegibility(previewEl) {
    if (!previewEl) return;
    var svg = previewEl.querySelector('svg');
    if (!svg) return;
    svg.classList.add('hc-diagram-setup-vivid');
    var strokeMap = {
      '#e2e8f0': '#64748b',
      '#f1f5f9': '#64748b',
      '#eceff1': '#78909c',
      '#cbd5e1': '#475569',
      '#f8fafc': '#64748b',
    };
    svg.querySelectorAll('[stroke]').forEach(function (el) {
      var s = String(el.getAttribute('stroke') || '').toLowerCase();
      if (strokeMap[s]) el.setAttribute('stroke', strokeMap[s]);
      var op = parseFloat(el.getAttribute('opacity'));
      if (Number.isFinite(op) && op > 0 && op < 0.72) {
        el.setAttribute('opacity', String(Math.min(1, op + 0.38)));
      }
    });
    svg.querySelectorAll('.hc-diagram-view-label').forEach(function (el) {
      el.setAttribute('fill', '#0f172a');
    });
  }

  function metodoLabel(m) {
    return m === 'sog' ? 'SOG (muchas plantas bajas)' : 'SCROG (red / pantalla)';
  }

  function renderSetupCultivosResumen() {
    var panel = document.getElementById('setupCultivosResumen');
    if (!panel) return;
    syncSetupDataFromPremium();
    var p = ensurePremium();
    var tipo =
      typeof setupTipoInstalacion !== 'undefined'
        ? String(setupTipoInstalacion || 'dwc').toUpperCase()
        : 'DWC';
    var ent = p && p.entorno === 'exterior' ? 'Exterior' : 'Interior';
    var met = metodoLabel((p && p.metodoCultivo) || 'scrog');
    var agua = aguaLabel(setupData.agua || 'osmosis');
    var su = sustratoLabel(setupData.sustrato || inferSustratoFromOrigen((p && p.origenPlanta) || 'semilla'));
    var nutId = typeof setupNutriente !== 'undefined' ? setupNutriente : 'canna_aqua';
    var nutNom = nutId;
    try {
      if (typeof NUTRIENTES_DB !== 'undefined' && NUTRIENTES_DB) {
        var nut = NUTRIENTES_DB.find(function (n) {
          return n.id === nutId;
        });
        if (nut) nutNom = nut.marca ? nut.marca + ' ' + (nut.nombre || '') : nut.nombre || nutId;
      }
    } catch (_) {}
    var hLuz = Number.isFinite(p && p.horasLuz) ? p.horasLuz + ' h luz/día' : setupData.horasLuz ? setupData.horasLuz + ' h' : '—';
    panel.innerHTML =
      '<p class="setup-cultivos-resumen-title">Resumen antes de guardar</p>' +
      '<ul class="setup-cultivos-resumen-list">' +
      '<li><strong>Sistema:</strong> ' + esc(tipo) + ' · ' + esc(ent) + ' · ' + esc(hLuz) + '</li>' +
      '<li><strong>Método:</strong> ' + esc(met) + '</li>' +
      '<li><strong>Mezcla:</strong> agua ' + esc(agua) + ' · fijación ' + esc(su) + '</li>' +
      '<li><strong>Nutriente:</strong> ' + esc(String(nutNom).trim()) + '</li>' +
      '</ul>' +
      '<p class="setup-cultivos-resumen-foot">Pulsa «Guardar y empezar» para crear la instalación.</p>';
    panel.classList.remove('setup-hidden');
  }

  global.renderSetupGuiaPanel = renderSetupGuiaPanel;
  global.renderSetupCultivosResumen = renderSetupCultivosResumen;
  global.buildSetupEquipamientoMerged = buildSetupEquipamientoMerged;
  global.renderSetupDiagramEquipLegend = renderSetupDiagramEquipLegend;
  global.renderSetupDiagramEquipLegendForPreviews = renderSetupDiagramEquipLegendForPreviews;
  global.markSetupDiagramCrisp = markSetupDiagramCrisp;
  global.boostSetupDiagramLegibility = boostSetupDiagramLegibility;
})(typeof window !== 'undefined' ? window : globalThis);
