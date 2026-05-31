/**
 * HidroGrow — micro-ayudas del asistente de configuración (≤2 líneas por paso).
 */
(function (global) {
  'use strict';

  var SETUP_GUIAS = {
    0: {
      l1: 'Elige DWC o RDWC una sola vez; el resto del asistente no volverá a preguntarlo salvo error.',
      l2: 'Fases: contexto → planta → montaje hidro → mezcla → cultivos en cestas.',
    },
    1: {
      l1: 'Objetivo y nivel Consejos (principiante/avanzado); solo se pregunta aquí.',
      l2: 'Siguiente: interior o exterior (define clima y meteo).',
    },
    2: {
      l1: 'Interior o exterior — única vez; no se repite en pasos posteriores.',
      l2: 'Exterior: más adelante pediremos ciudad para meteo si hace falta.',
    },
    3: {
      l1: 'Medidas de carpa, LED y extractor; catálogo opcional para rellenar fichas.',
      l2: 'Estos datos validan plantas/m² en el paso Cultivos.',
    },
    4: {
      l1: 'Fase y fotoperiodo: única fuente de horas de luz y objetivos VPD/EC.',
      l2: 'No volverás a ajustar el slider de horas más adelante.',
    },
    5: {
      l1: 'SOG/SCROG y genética orientan densidad; semillero = referencia EC/pH.',
      l2: 'Variedades concretas en cestas van al final (paso Cultivos).',
    },
    6: {
      l1: 'Las 6 casillas son fases en orden hasta el cubo hidro, no opciones alternativas.',
      l2: 'Radícula = raíz blanca; domo = plántula húmeda; nunca siembra en depósito.',
    },
    7: {
      l1: 'Resumen de lo ya definido; ahora pasamos a medidas del montaje real.',
      l2: 'Siguiente: geometría con diagrama nítido del sistema.',
    },
    8: {
      l1: 'Filas×cestas o cubos RDWC y medidas del depósito; diagrama en vivo.',
      l2: 'DWC/RDWC ya elegido — cambia solo si te equivocaste.',
    },
    9: {
      l1: 'Aireador, calentador y medidor hidro (distinto del catálogo LED/extractor).',
      l2: 'Aparecen en el diagrama del paso anterior.',
    },
    10: {
      l1: 'Agua de mezcla del depósito + medio en net pot (no el cubo de germinación).',
      l2: 'Sustrato sugerido según origen Planta; confirma o cambia.',
    },
    11: {
      l1: 'Línea de nutrientes para dosis según litros calculados en Geometría.',
      l2: 'Editable después en Medir → Configuración.',
    },
    12: {
      l1: 'Solo si cultivas en exterior: ciudad para meteo (interior salta este paso).',
      l2: 'Ubicación, luz y horas ya vienen de Entorno y Clima.',
    },
    13: {
      l1: 'Grupos genéticos + variedad/fecha por cesta — aquí sí asignas plantas.',
      l2: 'Distinto del semillero (referencia) y del medio en net pot (paso Agua).',
    },
    14: {
      l1: 'Revisa litros, equipamiento, mezcla y cultivos antes de guardar.',
      l2: 'Tras guardar: checklist diario en Medir.',
    },
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
