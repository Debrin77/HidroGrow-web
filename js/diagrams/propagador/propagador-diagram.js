/**
 * SVG del propagador / domo + bandeja con sustrato y semillas activas.
 */
(function (global) {
  'use strict';

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function cfgDefault() {
    return typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
  }

  function sustratoKey(cfg, g) {
    return (
      (g && g.sustratoGerm) ||
      (cfg && cfg.sustratoGerm) ||
      (cfg && cfg.premiumSetup && cfg.premiumSetup.sustratoGerm) ||
      'lana'
    );
  }

  function sustratoLabel(key) {
    if (typeof etiquetaSustratoGerm === 'function') return etiquetaSustratoGerm(key);
    var m = {
      lana: 'Lana de roca',
      esponja: 'Jiffy / esponja',
      papel: 'Papel húmedo',
      coco: 'Coco / plug',
    };
    return m[key] || key || '—';
  }

  function sustratoStyle(key) {
    var k = String(key || 'lana').replace(/[^a-z0-9_-]/gi, '') || 'lana';
    var map = {
      lana: { fill: '#bef264', stroke: '#65a30d', plug: '#84cc16' },
      esponja: { fill: '#fde68a', stroke: '#d97706', plug: '#fbbf24' },
      papel: { fill: '#fef9c3', stroke: '#ca8a04', plug: '#fde047' },
      coco: { fill: '#d6d3d1', stroke: '#57534e', plug: '#a8a29e' },
    };
    return map[k] || map.lana;
  }

  function bandejaDims(cfg, numSemillas) {
    var prem = (cfg && cfg.premiumSetup) || {};
    var bandeja = prem.bandejaGerm || 'auto';
    var cap = 77;
    var cols = 11;
    var rows = 7;
    if (bandeja === '24') {
      cap = 24;
      cols = 6;
      rows = 4;
    } else if (bandeja === '84') {
      cap = 84;
      cols = 12;
      rows = 7;
    } else if (bandeja === '77') {
      cap = 77;
      cols = 11;
      rows = 7;
    } else if (typeof global.PROPAGADOR_CAPACIDAD_ES === 'object' && cfg) {
      var inst = cfg.equipamientoInstalado || {};
      var prop = inst.propagador;
      if (prop && prop.id && global.PROPAGADOR_CAPACIDAD_ES[prop.id]) {
        cap = global.PROPAGADOR_CAPACIDAD_ES[prop.id].celdas || cap;
      }
    }
    if (numSemillas <= 12) {
      cols = Math.max(numSemillas, 4);
      rows = 1;
      cap = Math.max(cap, numSemillas);
    } else if (numSemillas <= 24 && cap > 24) {
      cols = 6;
      rows = 4;
      cap = 24;
    }
    cap = Math.max(numSemillas, cap);
    return { cols: cols, rows: rows, cap: cap };
  }

  function datosDesdeConfig(cfg) {
    cfg = cfg || cfgDefault();
    var g =
      typeof ensureGerminacionFlow === 'function' ? ensureGerminacionFlow(cfg) : cfg.germinacionFlow || {};
    var prem = cfg.premiumSetup || {};
    var planN = Number.isFinite(prem.numSemillasGerm) ? Math.round(prem.numSemillasGerm) : 0;
    var num = Math.min(72, Math.max(1, Math.round(Number(g.numSemillas) || planN || 6)));
    var activas = Math.min(num, Math.max(0, Math.round(Number(g.semillasActivas) || num)));
    var sub = sustratoKey(cfg, g);
    var dims = bandejaDims(cfg, num);
    var fasesN =
      typeof contarFasesGermHechas === 'function' ? contarFasesGermHechas(cfg) : 0;
    var germinadas = 0;
    if (fasesN > 0) {
      germinadas = Math.min(activas, Math.max(1, Math.round(activas * (fasesN / 6))));
    }
    var vid = String(g.variedadId || prem.variedadGerminacion || '').trim();
    var nombreVar = '';
    if (vid && typeof getCultivoDB === 'function') {
      var cu = getCultivoDB(vid);
      if (cu && cu.nombre) nombreVar = cu.nombre;
    }
    var inst = cfg.equipamientoInstalado || {};
    var prop = inst.propagador || {};
    var modelo =
      (prop.marca ? prop.marca + ' ' : '') + (prop.modelo || '').trim() || 'Propagador / domo';
    var diaN =
      typeof diasDesdeInicio === 'function' ? diasDesdeInicio(g) + 1 : 1;
    return {
      g: g,
      num: num,
      activas: activas,
      germinadas: germinadas,
      sub: sub,
      subLbl: sustratoLabel(sub),
      subSt: sustratoStyle(sub),
      dims: dims,
      nombreVar: nombreVar || vid,
      modelo: modelo.trim(),
      diaN: diaN,
    };
  }

  function buildPropagadorDiagramSvg(cfg) {
    var d = datosDesdeConfig(cfg);
    var W = 360;
    var H = 320;
    var u = 'hcProp' + Math.random().toString(36).slice(2, 8);
    var st = d.subSt;

    var gridX = 36;
    var gridY = 118;
    var gridW = W - 72;
    var gridH = 148;
    var cols = d.dims.cols;
    var rows = d.dims.rows;
    var gap = cols <= 6 ? 5 : 3;
    var cellW = Math.floor((gridW - (cols - 1) * gap) / cols);
    var cellH = Math.floor((gridH - (rows - 1) * gap) / rows);
    cellW = Math.max(10, Math.min(26, cellW));
    cellH = Math.max(10, Math.min(22, cellH));
    var usedW = cols * cellW + (cols - 1) * gap;
    var usedH = rows * cellH + (rows - 1) * gap;
    gridX = Math.round((W - usedW) / 2);
    gridY = Math.round(130 + (gridH - usedH) / 2);

    var cells = '';
    for (var i = 0; i < d.dims.cap; i++) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      if (row >= rows) break;
      var x = gridX + col * (cellW + gap);
      var y = gridY + row * (cellH + gap);
      var active = i < d.activas;
      var germ = active && i < d.germinadas;
      var fill = active ? st.plug : '#e2e8f0';
      var stroke = active ? st.stroke : '#cbd5e1';
      var op = active ? 1 : 0.35;
      if (germ) fill = '#4ade80';
      cells +=
        '<rect class="hc-prop-cell' +
        (active ? ' hc-prop-cell--on' : '') +
        (germ ? ' hc-prop-cell--germ' : '') +
        '" data-prop-cell="' +
        (i + 1) +
        '" x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        cellW +
        '" height="' +
        cellH +
        '" rx="3" fill="' +
        fill +
        '" stroke="' +
        stroke +
        '" stroke-width="1.2" opacity="' +
        op +
        '"/>';
      if (active && cellW >= 14) {
        cells +=
          '<ellipse cx="' +
          (x + cellW / 2).toFixed(1) +
          '" cy="' +
          (y + cellH * 0.42).toFixed(1) +
          '" rx="' +
          Math.max(2, cellW * 0.18).toFixed(1) +
          '" ry="' +
          Math.max(2, cellH * 0.14).toFixed(1) +
          '" fill="#14532d" opacity="0.55"/>';
      }
    }

    var trayY = gridY + usedH + 8;
    var trayX = gridX - 10;
    var trayW = usedW + 20;

    var domeCx = W / 2;
    var domeTop = 52;
    var domeBase = gridY - 6;

    return (
      '<svg class="torre-svg-diagram propagador-svg-diagram svg-centered-block" xmlns="http://www.w3.org/2000/svg" ' +
      'viewBox="0 0 ' +
      W +
      ' ' +
      H +
      '" width="100%" height="auto" role="img" aria-labelledby="' +
      u +
      '-title" overflow="visible">' +
      '<defs>' +
      '<linearGradient id="' +
      u +
      '-dome" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="rgba(186,230,253,0.75)"/>' +
      '<stop offset="100%" stop-color="rgba(34,197,94,0.15)"/></linearGradient>' +
      '<linearGradient id="' +
      u +
      '-tray" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#d6d3d1"/>' +
      '<stop offset="100%" stop-color="#a8a29e"/></linearGradient>' +
      '<filter id="' +
      u +
      '-sh" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(15,23,42,0.2)"/></filter>' +
      '</defs>' +
      '<title id="' +
      u +
      '-title">Propagador con ' +
      d.activas +
      ' semillas en ' +
      esc(d.subLbl) +
      '</title>' +
      '<rect width="' +
      W +
      '" height="' +
      H +
      '" fill="#f8fafc" rx="12"/>' +
      '<text x="' +
      domeCx +
      '" y="28" text-anchor="middle" font-size="13" font-weight="700" fill="#14532d" font-family="system-ui,sans-serif">' +
      esc(d.modelo) +
      '</text>' +
      (d.nombreVar
        ? '<text x="' +
          domeCx +
          '" y="44" text-anchor="middle" font-size="11" fill="#475569" font-family="system-ui,sans-serif">' +
          esc(d.nombreVar) +
          ' · día ' +
          d.diaN +
          '</text>'
        : '<text x="' +
          domeCx +
          '" y="44" text-anchor="middle" font-size="11" fill="#64748b" font-family="system-ui,sans-serif">Día ' +
          d.diaN +
          ' · germinación</text>') +
      '<path d="M' +
      (domeCx - trayW * 0.48).toFixed(1) +
      ' ' +
      domeBase +
      ' Q' +
      domeCx +
      ' ' +
      domeTop +
      ' ' +
      (domeCx + trayW * 0.48).toFixed(1) +
      ' ' +
      domeBase +
      ' Z" fill="url(#' +
      u +
      '-dome)" stroke="rgba(34,197,94,0.55)" stroke-width="1.8" opacity="0.92"/>' +
      '<path d="M' +
      (domeCx - trayW * 0.42).toFixed(1) +
      ' ' +
      (domeBase - 2) +
      ' Q' +
      domeCx +
      ' ' +
      (domeTop + 14) +
      ' ' +
      (domeCx + trayW * 0.42).toFixed(1) +
      ' ' +
      (domeBase - 2) +
      '" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="1.2"/>' +
      '<rect x="' +
      trayX +
      '" y="' +
      (trayY - 4) +
      '" width="' +
      trayW +
      '" height="14" rx="4" fill="url(#' +
      u +
      '-tray)" stroke="#78716c" stroke-width="1" filter="url(#' +
      u +
      '-sh)"/>' +
      '<rect x="' +
      (gridX - 6) +
      '" y="' +
      (gridY - 6) +
      '" width="' +
      (usedW + 12) +
      '" height="' +
      (usedH + 12) +
      '" rx="8" fill="#fafaf9" stroke="#d6d3d1" stroke-width="1.2" opacity="0.95"/>' +
      cells +
      '<text x="' +
      gridX +
      '" y="' +
      (gridY - 10) +
      '" font-size="10" font-weight="600" fill="#57534e" font-family="system-ui,sans-serif">Bandeja · ' +
      esc(d.subLbl) +
      '</text>' +
      '<g font-family="system-ui,sans-serif" font-size="10" fill="#64748b">' +
      '<rect x="24" y="' +
      (H - 36) +
      '" width="10" height="10" rx="2" fill="' +
      st.plug +
      '" stroke="' +
      st.stroke +
      '"/>' +
      '<text x="40" y="' +
      (H - 27) +
      '">' +
      esc(d.subLbl) +
      ' (' +
      d.activas +
      '/' +
      d.num +
      ')</text>' +
      '<rect x="150" y="' +
      (H - 36) +
      '" width="10" height="10" rx="2" fill="#fde68a" stroke="#d97706"/>' +
      '<text x="166" y="' +
      (H - 27) +
      '">En curso</text>' +
      '<rect x="230" y="' +
      (H - 36) +
      '" width="10" height="10" rx="2" fill="#4ade80" stroke="#16a34a"/>' +
      '<text x="246" y="' +
      (H - 27) +
      '">Germinando</text>' +
      '<rect x="310" y="' +
      (H - 36) +
      '" width="10" height="10" rx="2" fill="#e2e8f0" stroke="#cbd5e1" opacity="0.6"/>' +
      '<text x="326" y="' +
      (H - 27) +
      '">Vacío</text>' +
      '</g>' +
      '</svg>'
    );
  }

  function generarSVGPropagador(cfg) {
    try {
      return buildPropagadorDiagramSvg(cfg || cfgDefault());
    } catch (e) {
      try {
        console.error('generarSVGPropagador', e);
      } catch (_) {}
      return (
        '<p class="torre-svg-fallback" role="status">No se pudo dibujar el propagador. Recarga la página.</p>'
      );
    }
  }

  function hcRenderPropagadorSvg(cfg) {
    cfg = cfg || cfgDefault();
    var wrap = document.getElementById('torreSVGWrap');
    if (!wrap) return;
    wrap.classList.add('torre-svg-canvas--propagador');
    wrap.classList.remove('setup-hidden');
    wrap.hidden = false;
    wrap.style.display = '';
    try {
      if (typeof disposeNftThreeIfAny === 'function') disposeNftThreeIfAny(wrap);
      if (typeof disposeDwcScadaViewport === 'function') disposeDwcScadaViewport(wrap);
    } catch (_) {}
    var html = generarSVGPropagador(cfg);
    wrap.innerHTML = html || '';
    wrap.setAttribute(
      'aria-label',
      'Propagador: domo y bandeja con ' +
        (datosDesdeConfig(cfg).activas || 0) +
        ' semillas en ' +
        datosDesdeConfig(cfg).subLbl
    );
  }

  function hcClearPropagadorSvg() {
    var wrap = document.getElementById('torreSVGWrap');
    if (!wrap) return;
    wrap.classList.remove('torre-svg-canvas--propagador');
  }

  global.buildPropagadorDiagramSvg = buildPropagadorDiagramSvg;
  global.generarSVGPropagador = generarSVGPropagador;
  global.hcRenderPropagadorSvg = hcRenderPropagadorSvg;
  global.hcClearPropagadorSvg = hcClearPropagadorSvg;
})(typeof window !== 'undefined' ? window : globalThis);
