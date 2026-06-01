/**
 * HidroGrow — resumen visual de equipamiento de sala (solo lectura, datos del configurador).
 */
(function (global) {
  'use strict';

  var ZONAS = [
    {
      id: 'luz',
      title: 'Iluminación',
      icon: '💡',
      cats: ['led'],
    },
    {
      id: 'clima',
      title: 'Climatización',
      icon: '💨',
      cats: ['extractor', 'humidificador', 'deshumidificador'],
    },
    {
      id: 'hidro',
      title: 'Sistema hidro',
      icon: '🫧',
      cats: [],
      hydro: true,
    },
    {
      id: 'medicion',
      title: 'Medición',
      icon: '📊',
      cats: ['medidor'],
    },
  ];

  var HIDRO_LABELS = {
    difusor: { icon: '🫧', label: 'Aireador / difusor' },
    bomba_aire: { icon: '🫧', label: 'Bomba de aire' },
    bomba_recirc: { icon: '⚙️', label: 'Bomba recirculación' },
    calentador: { icon: '🌡️', label: 'Calentador depósito' },
    timer: { icon: '⏱️', label: 'Temporizador' },
    medidorEC: { icon: '📈', label: 'Sonda EC/pH' },
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getCfg() {
    return (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
  }

  function getCats() {
    return typeof getEquipCategorias === 'function'
      ? getEquipCategorias()
      : typeof EQUIP_CATEGORIAS !== 'undefined'
        ? EQUIP_CATEGORIAS
        : {};
  }

  function formatEntry(entry, catKey) {
    if (!entry || (!entry.marca && !entry.modelo)) return null;
    var cats = getCats();
    var cat = cats[catKey] || {};
    var nom = (String(entry.marca || '') + ' ' + String(entry.modelo || '')).trim();
    var chips = [];
    var sp = entry.specs || {};
    if (catKey === 'armario' && sp.anchoM && sp.largoM) {
      chips.push(sp.anchoM + '×' + sp.largoM + ' m');
    }
    if (catKey === 'led' && sp.watts) chips.push(sp.watts + ' W');
    if (catKey === 'extractor' && sp.m3h) chips.push(sp.m3h + ' m³/h');
    if (catKey === 'medidor' && sp.calibracionDias) chips.push('cal. ' + sp.calibracionDias + ' d');
    return {
      icon: cat.icon || '•',
      label: cat.label || catKey,
      nombre: nom,
      chips: chips,
      nota: entry.nota || '',
    };
  }

  function getHydroItems(cfg) {
    var eq = Array.isArray(cfg.equipamiento) ? cfg.equipamiento : [];
    return Object.keys(HIDRO_LABELS)
      .filter(function (k) {
        return eq.indexOf(k) >= 0;
      })
      .map(function (k) {
        var h = HIDRO_LABELS[k];
        return { icon: h.icon, label: h.label, nombre: 'En depósito / línea', chips: [] };
      });
  }

  function renderPlanoSvg(cfg, inst) {
    var w = 340;
    var h = 220;
    var ancho = Number(cfg.growRoomAnchoM || (inst.armario && inst.armario.specs && inst.armario.specs.anchoM));
    var largo = Number(cfg.growRoomLargoM || (inst.armario && inst.armario.specs && inst.armario.specs.largoM));
    var dim =
      Number.isFinite(ancho) && Number.isFinite(largo) && ancho > 0 && largo > 0
        ? ancho.toFixed(1) + ' × ' + largo.toFixed(1) + ' m'
        : 'Medidas en Sala o configurador';

    var body =
      '<rect x="12" y="12" width="' +
      (w - 24) +
      '" height="' +
      (h - 24) +
      '" rx="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>' +
      '<text x="' +
      (w / 2) +
      '" y="32" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="600">SALA · ' +
      esc(dim) +
      '</text>';

    var rx = 40;
    var ry = 48;
    var rw = w - 80;
    var rh = h - 100;
    body +=
      '<rect x="' +
      rx +
      '" y="' +
      ry +
      '" width="' +
      rw +
      '" height="' +
      rh +
      '" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5" stroke-dasharray="6 4"/>';

    if (inst.led) {
      body +=
        '<rect x="' +
        (rx + 20) +
        '" y="' +
        (ry + 8) +
        '" width="' +
        (rw - 40) +
        '" height="22" rx="4" fill="#fef08a" opacity="0.85"/>' +
        '<text x="' +
        (w / 2) +
        '" y="' +
        (ry + 23) +
        '" text-anchor="middle" font-size="9" fill="#713f12" font-weight="700">💡 LED</text>';
    }
    if (inst.extractor) {
      body +=
        '<circle cx="' +
        (rx + rw - 18) +
        '" cy="' +
        (ry + 18) +
        '" r="12" fill="#bae6fd"/><text x="' +
        (rx + rw - 18) +
        '" y="' +
        (ry + 22) +
        '" text-anchor="middle" font-size="10">💨</text>';
    }
    body +=
      '<rect x="' +
      (rx + rw * 0.25) +
      '" y="' +
      (ry + rh - 36) +
      '" width="' +
      rw * 0.5 +
      '" height="28" rx="6" fill="#064e3b" stroke="#34d399" stroke-width="1.2"/>' +
      '<text x="' +
      (w / 2) +
      '" y="' +
      (ry + rh - 18) +
      '" text-anchor="middle" font-size="9" fill="#a7f3d0" font-weight="600">🫧 DWC / RDWC</text>';

    if (inst.medidor) {
      body +=
        '<rect x="' +
        (rx + 8) +
        '" y="' +
        (ry + rh - 32) +
        '" width="36" height="20" rx="4" fill="#ede9fe"/>' +
        '<text x="' +
        (rx + 26) +
        '" y="' +
        (ry + rh - 18) +
        '" text-anchor="middle" font-size="9">📊</text>';
    }

    return (
      '<svg class="hc-sala-plano-svg" viewBox="0 0 ' +
      w +
      ' ' +
      h +
      '" width="100%" role="img" aria-label="Plano orientativo de sala">' +
      body +
      '</svg>'
    );
  }

  function renderZonaCard(zona, items) {
    var filled = items.length > 0;
    return (
      '<div class="hc-sala-zona' +
      (filled ? ' hc-sala-zona--filled' : ' hc-sala-zona--empty') +
      '">' +
      '<div class="hc-sala-zona-head">' +
      '<span class="hc-sala-zona-icon" aria-hidden="true">' +
      zona.icon +
      '</span>' +
      '<span class="hc-sala-zona-title">' +
      esc(zona.title) +
      '</span>' +
      '<span class="hc-sala-zona-count">' +
      (filled ? items.length : '—') +
      '</span></div>' +
      (filled
        ? '<ul class="hc-sala-zona-list">' +
          items
            .map(function (it) {
              return (
                '<li class="hc-sala-zona-item">' +
                '<span class="hc-sala-zona-item-ico">' +
                it.icon +
                '</span>' +
                '<div class="hc-sala-zona-item-body">' +
                '<span class="hc-sala-zona-item-nom">' +
                esc(it.nombre) +
                '</span>' +
                (it.chips.length
                  ? '<span class="hc-sala-zona-item-chips">' +
                    it.chips.map(function (c) {
                      return '<span class="hc-sala-spec">' + esc(c) + '</span>';
                    }).join('') +
                    '</span>'
                  : '') +
                '</div></li>'
              );
            })
            .join('') +
          '</ul>'
        : '<p class="hc-sala-zona-empty">No configurado en el asistente</p>') +
      '</div>'
    );
  }

  function renderSalaLayoutPanel() {
    var host = document.getElementById('salaLayoutPanel');
    if (!host) return;
    var cfg = getCfg();
    var interior =
      String(cfg.ubicacion || (cfg.premiumSetup && cfg.premiumSetup.entorno) || 'interior').toLowerCase() !==
      'exterior';
    if (!interior) {
      host.innerHTML =
        '<p class="hc-sala-layout-hint">Vista de sala solo para cultivo en <strong>interior</strong>.</p>';
      return;
    }
    var inst = cfg.equipamientoInstalado || {};
    var zonasHtml = ZONAS.map(function (zona) {
      var items = [];
      zona.cats.forEach(function (ck) {
        var f = formatEntry(inst[ck], ck);
        if (f) items.push(f);
      });
      if (zona.hydro) items = items.concat(getHydroItems(cfg));
      return renderZonaCard(zona, items);
    }).join('');

    var armario = formatEntry(inst.armario, 'armario');
    var armarioHtml = armario
      ? '<div class="hc-sala-armario-chip">🏠 <strong>' +
        esc(armario.nombre) +
        '</strong>' +
        (armario.chips.length ? ' · ' + armario.chips.map(function (c) { return esc(c); }).join(' ') : '') +
        '</div>'
      : '';

    host.innerHTML =
      '<p class="hc-sala-layout-hint">Vista de solo lectura según el <strong>configurador</strong>. ' +
      'Para cambiar modelos, abre el asistente (editable hasta el primer llenado del depósito).</p>' +
      armarioHtml +
      '<div class="hc-sala-plano-wrap">' +
      renderPlanoSvg(cfg, inst) +
      '</div>' +
      '<div class="hc-sala-zonas-grid">' +
      zonasHtml +
      '</div>';
  }

  global.renderSalaLayoutPanel = renderSalaLayoutPanel;
})(typeof window !== 'undefined' ? window : globalThis);
