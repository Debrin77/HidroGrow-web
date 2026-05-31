/**
 * HidroGrow — plano orientativo de sala (slots de equipamiento en zona de cultivo).
 */
(function (global) {
  'use strict';

  var SLOTS = [
    { id: 'led', cat: 'led', label: 'LED', x: 50, y: 12, icon: '💡' },
    { id: 'extractor', cat: 'extractor', label: 'Extractor', x: 88, y: 18, icon: '💨' },
    { id: 'intraccion', cat: 'intraccion', label: 'Entrada aire', x: 12, y: 72, icon: '🌬️' },
    { id: 'humidificador', cat: 'humidificador', label: 'Humidificador', x: 12, y: 42, icon: '💧' },
    { id: 'deshumidificador', cat: 'deshumidificador', label: 'Deshumid.', x: 88, y: 42, icon: '🌫️' },
    { id: 'circulacion', cat: 'circulacion', label: 'Clip fan', x: 50, y: 58, icon: '🌀' },
    { id: 'sonda_ambiente', cat: 'sonda_ambiente', label: 'Higrometro', x: 72, y: 68, icon: '📡' },
    { id: 'sonda_ec', cat: 'medidor', label: 'Medidor EC/pH', x: 28, y: 78, icon: '📊' },
    { id: 'co2', cat: 'co2', label: 'CO₂ (opc.)', x: 50, y: 78, icon: '🫧' },
  ];

  function ensureSalaLayout(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    if (!cfg.salaLayout || typeof cfg.salaLayout !== 'object') cfg.salaLayout = {};
    return cfg.salaLayout;
  }

  function getEquipForSlot(slot) {
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    var inst = cfg.equipamientoInstalado || {};
    if (slot.cat === 'intraccion' || slot.cat === 'circulacion' || slot.cat === 'co2' || slot.cat === 'sonda_ambiente') {
      var manual = ensureSalaLayout(cfg)[slot.id];
      return manual ? { label: manual } : null;
    }
    var e = inst[slot.cat];
    if (!e) return null;
    return { label: e.marca + ' ' + e.modelo, entry: e };
  }

  function renderSalaLayoutSvg() {
    var w = 320;
    var h = 200;
    var body =
      '<rect x="8" y="8" width="' +
      (w - 16) +
      '" height="' +
      (h - 16) +
      '" rx="10" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>' +
      '<rect x="24" y="88" width="' +
      (w - 48) +
      '" height="36" rx="6" fill="#ecfdf5" stroke="#6ee7b7" stroke-width="1.5" stroke-dasharray="4 3"/>' +
      '<text x="' +
      (w / 2) +
      '" y="108" text-anchor="middle" font-size="9" fill="#047857" font-weight="700">Copa / dosel</text>' +
      '<rect x="40" y="128" width="' +
      (w - 80) +
      '" height="28" rx="5" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.2"/>' +
      '<text x="' +
      (w / 2) +
      '" y="146" text-anchor="middle" font-size="8" fill="#0369a1">Sistema hidro (DWC/RDWC)</text>';

    SLOTS.forEach(function (slot) {
      var eq = getEquipForSlot(slot);
      var cx = (slot.x / 100) * w;
      var cy = (slot.y / 100) * h;
      var filled = !!eq;
      body +=
        '<g class="hc-sala-slot' +
        (filled ? ' hc-sala-slot--filled' : '') +
        '" data-slot="' +
        slot.id +
        '">' +
        '<circle cx="' +
        cx +
        '" cy="' +
        cy +
        '" r="14" fill="' +
        (filled ? '#dcfce7' : '#f1f5f9') +
        '" stroke="' +
        (filled ? '#16a34a' : '#cbd5e1') +
        '" stroke-width="1.5"/>' +
        '<text x="' +
        cx +
        '" y="' +
        (cy + 4) +
        '" text-anchor="middle" font-size="12">' +
        slot.icon +
        '</text>' +
        '<text x="' +
        cx +
        '" y="' +
        (cy + 26) +
        '" text-anchor="middle" font-size="7" fill="#475569" font-weight="600">' +
        slot.label +
        '</text>' +
        '</g>';
    });

    return (
      '<svg class="hc-sala-layout-svg" viewBox="0 0 ' +
      w +
      ' ' +
      h +
      '" width="100%" role="img" aria-label="Plano orientativo de sala de cultivo">' +
      body +
      '</svg>'
    );
  }

  function renderSalaLayoutLegend() {
    return SLOTS.map(function (slot) {
      var eq = getEquipForSlot(slot);
      var txt = eq ? eq.label : '— sin asignar —';
      return (
        '<div class="hc-sala-legend-row' +
        (eq ? ' hc-sala-legend-row--ok' : '') +
        '">' +
        '<span class="hc-sala-legend-ico" aria-hidden="true">' +
        slot.icon +
        '</span>' +
        '<span class="hc-sala-legend-label">' +
        slot.label +
        '</span>' +
        '<span class="hc-sala-legend-val">' +
        txt +
        '</span></div>'
      );
    }).join('');
  }

  function renderSalaLayoutPanel() {
    var host = document.getElementById('salaLayoutPanel');
    if (!host) return;
    host.innerHTML =
      '<p class="hc-sala-layout-hint">Plano orientativo (vista lateral). El catálogo de equipamiento rellena LED, extractor, humidificador… Los slots vacíos son recordatorio de montaje.</p>' +
      renderSalaLayoutSvg() +
      '<div class="hc-sala-legend">' +
      renderSalaLayoutLegend() +
      '</div>';
  }

  function toggleSalaSlotManual(slotId, label) {
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    var lay = ensureSalaLayout(cfg);
    if (label) lay[slotId] = label;
    else delete lay[slotId];
    if (typeof saveState === 'function') saveState();
    renderSalaLayoutPanel();
  }

  global.renderSalaLayoutPanel = renderSalaLayoutPanel;
  global.HC_SALA_SLOTS = SLOTS;
  global.toggleSalaSlotManual = toggleSalaSlotManual;
})(typeof window !== 'undefined' ? window : globalThis);
