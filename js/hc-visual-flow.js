/**
 * HidroGrow — iconos visuales, tarjetas interactivas y mini-flujos (SVG propio, sin logos externos).
 */
(function () {
  var HC_VISUAL = {
    semilla: { icon: 'hc-i-sprout', emoji: '🫘', label: 'Semilla', color: '#059669', bg: 'rgba(5,150,105,0.12)' },
    esqueje: { icon: 'hc-i-scissors', emoji: '✂️', label: 'Esqueje / clon', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
    madre: { icon: 'hc-i-plant', emoji: '🌿', label: 'Planta madre', color: '#15803d', bg: 'rgba(21,128,61,0.12)' },
    armario: { icon: 'hc-i-home', emoji: '🏠', label: 'Armario / carpa', color: '#475569', bg: 'rgba(71,85,105,0.12)' },
    led: { icon: 'hc-i-bulb', emoji: '💡', label: 'LED', color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
    extractor: { icon: 'hc-i-wind', emoji: '💨', label: 'Extractor', color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
    humidificador: { icon: 'hc-i-droplet', emoji: '💧', label: 'Humidificador', color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
    deshumidificador: { icon: 'hc-i-cloud-rain', emoji: '🌫️', label: 'Deshumidificador', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    medidor: { icon: 'hc-i-flask', emoji: '📊', label: 'Medidor EC/pH', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
    semillero: { icon: 'hc-i-package', emoji: '🏪', label: 'Semillero', color: '#c026d3', bg: 'rgba(192,38,211,0.1)' },
    nutriente: { icon: 'hc-i-flask', emoji: '🧪', label: 'Nutriente', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    dwc: { icon: 'hc-i-sys-dwc', emoji: '🫧', label: 'DWC', color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
    foto: { icon: 'hc-i-sun', emoji: '☀️', label: 'Fotoperíodo', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    auto: { icon: 'hc-i-clock', emoji: '⏱️', label: 'Autofloreciente', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    filtro_carbon: { icon: 'hc-i-flask', emoji: '🧫', label: 'Filtro carbón', color: '#78716c', bg: 'rgba(120,113,108,0.12)' },
    ventilador_circ: { icon: 'hc-i-wind', emoji: '🌀', label: 'Circulación', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
    temporizador: { icon: 'hc-i-clock', emoji: '⏱️', label: 'Temporizador LED', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    toldo_malla: { icon: 'hc-i-umbrella', emoji: '⛱️', label: 'Toldo / malla', color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
    tijeras: { icon: 'hc-i-scissors', emoji: '✂️', label: 'Tijeras poda', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
    lupa: { icon: 'hc-i-search', emoji: '🔍', label: 'Lupa tricomas', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
    co2: { icon: 'hc-i-wind', emoji: '🌬️', label: 'CO₂', color: '#059669', bg: 'rgba(5,150,105,0.12)' },
    sog: { icon: 'hc-i-grid', emoji: '📐', label: 'SOG', color: '#0d9488', bg: 'rgba(13,148,136,0.12)' },
    scrog: { icon: 'hc-i-layers', emoji: '🕸️', label: 'SCROG', color: '#0369a1', bg: 'rgba(3,105,161,0.12)' },
  };

  function visualMeta(key) {
    return HC_VISUAL[key] || { icon: 'hc-i-leaf', emoji: '🌿', label: key, color: '#059669', bg: 'rgba(5,150,105,0.1)' };
  }

  function visualIconSvg(key, extraClass) {
    var m = visualMeta(key);
    if (typeof hcIcon === 'function') {
      return hcIcon(m.icon, 'hc-visual-ico ' + (extraClass || ''));
    }
    return '<span class="hc-visual-emoji">' + m.emoji + '</span>';
  }

  function visualCardHtml(opts) {
    opts = opts || {};
    var key = opts.visualKey || 'semilla';
    var m = visualMeta(key);
    var sel = opts.selected ? ' hc-visual-card--selected' : '';
    var onclick = opts.onclick ? ' onclick="' + String(opts.onclick).replace(/"/g, '&quot;') + '"' : '';
    var badge = opts.badge ? '<span class="hc-visual-badge">' + opts.badge + '</span>' : '';
    return (
      '<button type="button" class="hc-visual-card' + sel + '"' + onclick +
      ' style="--hc-visual-color:' + (opts.color || m.color) + ';--hc-visual-bg:' + (opts.bg || m.bg) + '">' +
      badge +
      '<span class="hc-visual-card-icon">' + visualIconSvg(key) + '</span>' +
      '<span class="hc-visual-card-title">' + (opts.title || m.label) + '</span>' +
      (opts.desc ? '<span class="hc-visual-card-desc">' + opts.desc + '</span>' : '') +
      '</button>'
    );
  }

  function flowStepsHtml(steps) {
    if (!steps || !steps.length) return '';
    return (
      '<div class="hc-flow-steps" role="list">' +
      steps.map(function (step, i) {
        var m = visualMeta(step.key || 'semilla');
        var arrow = i < steps.length - 1 ? '<span class="hc-flow-arrow" aria-hidden="true">→</span>' : '';
        return (
          '<div class="hc-flow-step" role="listitem">' +
          '<span class="hc-flow-icon" style="background:' + m.bg + ';color:' + m.color + '">' +
          visualIconSvg(step.key || 'semilla', 'hc-visual-ico--sm') + '</span>' +
          '<span class="hc-flow-label">' + (step.label || m.label) + '</span>' +
          arrow + '</div>'
        );
      }).join('') +
      '</div>'
    );
  }

  function semillaFlowHtml() {
    return flowStepsHtml([
      { key: 'semilla', label: 'Semilla' },
      { key: 'semilla', label: 'Rockwool' },
      { key: 'esqueje', label: 'Net pot' },
      { key: 'dwc', label: 'Cubo DWC' },
    ]);
  }

  function esquejeFlowHtml() {
    return flowStepsHtml([
      { key: 'madre', label: 'Madre 18/6' },
      { key: 'esqueje', label: 'Corte + domo' },
      { key: 'semilla', label: 'Enraizar' },
      { key: 'dwc', label: 'Cubo' },
    ]);
  }

  function paintOriginIcons() {
    document.querySelectorAll('.hc-visual-origin-icon[data-visual]').forEach(function (node) {
      var key = node.getAttribute('data-visual');
      node.innerHTML = visualIconSvg(key, 'hc-visual-ico--lg');
    });
  }

  function refreshPremiumOrigenFlow(origen) {
    var host = document.getElementById('setupPremiumOrigenFlow');
    if (!host) return;
    host.classList.add('setup-hidden');
    host.innerHTML = '';
  }

  function enhancePremiumVisualUI(origen) {
    paintOriginIcons();
    refreshPremiumOrigenFlow(origen);
  }

  window.HC_VISUAL = HC_VISUAL;
  window.hcVisualMeta = visualMeta;
  window.hcVisualIconSvg = visualIconSvg;
  window.hcVisualCardHtml = visualCardHtml;
  window.hcFlowStepsHtml = flowStepsHtml;
  window.hcSemillaFlowHtml = semillaFlowHtml;
  window.hcEsquejeFlowHtml = esquejeFlowHtml;
  window.enhancePremiumVisualUI = enhancePremiumVisualUI;
  window.paintOriginIcons = paintOriginIcons;
  window.refreshPremiumOrigenFlow = refreshPremiumOrigenFlow;
})();
