/**
 * HidroGrow — micro-ayudas del asistente de configuración (≤2 líneas por paso).
 */
(function (global) {
  'use strict';

  var SETUP_GUIAS = {
    0: {
      l1: 'El asistente recorre ~15 pasos: tipo de sistema, sala, hidro y cultivos.',
      l2: 'El semillero es solo referencia; las variedades en cestas se asignan al final.',
    },
    1: {
      l1: 'Confirma autocultivo y normativa local; la app calcula parámetros técnicos.',
      l2: 'Siguiente: dónde cultivarás (interior o exterior).',
    },
    2: {
      l1: 'Interior = VPD, LED y extractor controlables; exterior = sol y estaciones.',
      l2: 'Ajusta avisos de clima y equipamiento recomendado.',
    },
    3: {
      l1: 'Medidas de carpa y potencia LED/extractor para validar plantas/m² después.',
      l2: 'Catálogo opcional: rellena la ficha o deja «Manual» arriba.',
    },
    4: {
      l1: 'Fase y fotoperiodo definen objetivos de VPD, EC/pH y checklist diario.',
      l2: 'Los afinarás con mediciones reales en Medir.',
    },
    5: {
      l1: 'SOG/SCROG y genética orientan densidad; aún no eliges plantas concretas.',
      l2: 'Semillero = perfil orientativo (EC/pH). Las cestas se llenan en paso Cultivos.',
    },
    6: {
      l1: 'Semilla, clon o madre: cómo entran las plantas al sistema hidro.',
      l2: 'El calendario de germinación o esquejes se generará según tu elección.',
    },
    7: {
      l1: 'Repaso hidro: oxígeno, recirculación y checklist antes de medir cubos.',
      l2: 'Siguiente: filas×cestas y verás el esquema nítido del sistema.',
    },
    8: {
      l1: 'Define cuántas macetas y forma del depósito; el diagrama se actualiza al instante.',
      l2: 'Aireador y calentador del paso Equipamiento aparecen en el esquema.',
    },
    9: {
      l1: 'Marca aireador, calentador y medidor; se dibujan en el diagrama del sistema.',
      l2: 'Valores por defecto sensatos si aún no tienes el material.',
    },
    10: {
      l1: 'Tipo de agua y sustrato (rockwool, arcilla…) para dosis y recargas.',
      l2: 'Influye en EC inicial y en el checklist de preparación de mezcla.',
    },
    11: {
      l1: 'Elige línea de nutrientes; calculamos dosis según litros del depósito.',
      l2: 'Puedes cambiarla después en Medir → Configuración.',
    },
    12: {
      l1: 'Ubicación para meteo exterior o recordatorios de luz interior.',
      l2: 'Opcional si ya indicaste municipio en otro paso.',
    },
    13: {
      l1: 'Aquí sí: variedad y fecha en cada cesta o cubo del diagrama.',
      l2: 'Distinto del semillero (paso Genética), que solo orienta EC/pH.',
    },
    14: {
      l1: 'Revisa litros, oxígeno, equipamiento y cultivos antes de guardar.',
      l2: 'Tras guardar: checklist diario en Medir y calendario unificado.',
    },
  };

  var SETUP_ROADMAP = [
    { id: 'inicio', label: 'Inicio', pages: [0] },
    { id: 'sala', label: 'Sala', pages: [1, 2, 3, 4] },
    { id: 'planta', label: 'Planta', pages: [5, 6] },
    { id: 'hidro', label: 'Hidro', pages: [7, 8, 9, 10, 11] },
    { id: 'cultivo', label: 'Cultivo', pages: [12, 13, 14] },
  ];

  var SETUP_EQUIP_VIS = {
    difusor: { emoji: '🫧', label: 'Aireador' },
    calentador: { emoji: '🔥', label: 'Calentador' },
    bomba: { emoji: '⚙️', label: 'Bomba recirc.' },
    medidorEC: { emoji: '📊', label: 'Medidor EC/pH' },
    timer: { emoji: '⏱️', label: 'Timer' },
    toldo: { emoji: '⛱️', label: 'Toldo / sombra' },
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
    panel.innerHTML =
      '<p class="setup-guia-l1">' + esc(g.l1) + '</p>' +
      '<p class="setup-guia-l2">' + esc(g.l2) + '</p>';
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

  /** Fusiona equipamiento del paso 9 + premium en el draft del diagrama. */
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
  }

  global.renderSetupGuiaPanel = renderSetupGuiaPanel;
  global.buildSetupEquipamientoMerged = buildSetupEquipamientoMerged;
  global.renderSetupDiagramEquipLegend = renderSetupDiagramEquipLegend;
  global.renderSetupDiagramEquipLegendForPreviews = renderSetupDiagramEquipLegendForPreviews;
  global.markSetupDiagramCrisp = markSetupDiagramCrisp;
})(typeof window !== 'undefined' ? window : globalThis);
