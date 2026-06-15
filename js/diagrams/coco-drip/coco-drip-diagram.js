/**
 * SVG coco coir + goteo DTW — vista cenital (bolsas rectangulares) + corte lateral.
 */
(function (global) {
  'use strict';

  var SC = global.COCO_DRIP_SCADA || {};
  var f1 = global.cocoDripScadaF1 || function (n) {
    return Number(n).toFixed(1);
  };

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function cfgDefault() {
    return typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
  }

  function torreDefault() {
    return typeof state !== 'undefined' && state && state.torre ? state.torre : [];
  }

  function bagSizePlan(tamano) {
    if (tamano === 'small') return { w: 48, h: 54 };
    if (tamano === 'large') return { w: 72, h: 88 };
    return { w: 56, h: 68 };
  }

  function gridFromCfg(cfg) {
    var rows = Math.max(1, parseInt(cfg.numNiveles, 10) || 1);
    var cols = Math.max(1, parseInt(cfg.numCestas, 10) || 1);
    var nPlant = parseInt(cfg.cocoDripNumPlantas, 10);
    if (nPlant === 9) {
      rows = 3;
      cols = 3;
    } else if (nPlant > 0 && rows * cols < nPlant) {
      cols = Math.max(cols, Math.ceil(Math.sqrt(nPlant)));
      rows = Math.max(rows, Math.ceil(nPlant / cols));
    }
    return { rows: rows, cols: cols, total: rows * cols };
  }

  function perlitaFrac(cfg) {
    var p = Number(cfg.cocoDripPerlitaPorcentaje);
    if (!Number.isFinite(p) || p <= 0) return 0.22;
    return Math.max(0.08, Math.min(0.45, p / 100));
  }

  function datosDiagrama(cfg, torre) {
    cfg = cfg || cfgDefault();
    torre = torre || torreDefault();
    var grid = gridFromCfg(cfg);
    var tam = cfg.cocoDripTamanoMacetas || 'medium';
    var bag = bagSizePlan(tam);
    var dist = cfg.cocoDripTipoDistribucion === 'halos' ? 'halos' : 'emitters';
    var smart = cfg.cocoDripSmartPots === true;
    var perlPct = Math.round(perlitaFrac(cfg) * 100);
    var freq = cfg.cocoDripFrecuenciaRiego || 4;
    var prog = cfg.cocoDripProgramacion;
    if (prog && prog.eventosDia) freq = prog.eventosDia;
    var porCelda =
      (prog && prog.porCelda) || cfg.cocoDripProgramacionPorCelda || {};
    return {
      cfg: cfg,
      torre: torre,
      grid: grid,
      bag: bag,
      dist: dist,
      smart: smart,
      perlPct: perlPct,
      freq: freq,
      fase: cfg.cocoDripFaseCultivo || 'vegetativo',
      porCelda: porCelda,
    };
  }

  function plantaEnCelda(torre, n, c) {
    var row = torre && torre[n];
    var cell = row && row[c];
    return !!(cell && String(cell.variedad || '').trim());
  }

  function nombreCelda(torre, n, c) {
    var row = torre && torre[n];
    var cell = row && row[c];
    if (!cell || !cell.variedad) return '';
    if (typeof getCultivoDB === 'function') {
      var cu = getCultivoDB(cell.variedad);
      if (cu && cu.nombre) return cu.nombre;
    }
    return String(cell.variedad);
  }

  /** Bolsa cenital interactiva (hc-cesta). */
  function renderBagPlan(x, y, w, h, opts) {
    opts = opts || {};
    var n = opts.n;
    var c = opts.c;
    var hasPlant = !!opts.hasPlant;
    var dist = opts.dist || 'emitters';
    var smart = !!opts.smart;
    var perlH = Math.max(6, h * (opts.perlFrac || 0.22));
    var stroke = smart ? SC.fabricStroke : SC.potStroke;
    var dash = smart ? ' stroke-dasharray="5 3"' : '';
    var uid = 'bag' + n + '_' + c;
    var aria = esc(opts.label || 'Bolsa coco ' + (n + 1) + '-' + (c + 1));

    var g =
      '<g data-n="' +
      n +
      '" data-c="' +
      c +
      '" class="hc-cesta hc-cesta--interactive coco-drip-bag" role="button" tabindex="0" aria-label="' +
      aria +
      '">';

    g +=
      '<rect class="hc-cesta-hit" x="' +
      f1(x) +
      '" y="' +
      f1(y) +
      '" width="' +
      f1(w) +
      '" height="' +
      f1(h) +
      '" fill="rgba(0,0,0,0)" stroke="none" pointer-events="all"/>';

    g +=
      '<rect x="' +
      f1(x) +
      '" y="' +
      f1(y) +
      '" width="' +
      f1(w) +
      '" height="' +
      f1(h) +
      '" rx="6" fill="' +
      SC.cocoDark +
      '" opacity="0.12" stroke="none"/>';

    g +=
      '<rect x="' +
      f1(x + 2) +
      '" y="' +
      f1(y + 2) +
      '" width="' +
      f1(w - 4) +
      '" height="' +
      f1(h - 4) +
      '" rx="5" fill="' +
      SC.cocoFill +
      '" stroke="' +
      stroke +
      '" stroke-width="1.6"' +
      dash +
      '/>';

    if (smart) {
      g +=
        '<rect x="' +
        f1(x + 5) +
        '" y="' +
        f1(y + 5) +
        '" width="' +
        f1(w - 10) +
        '" height="' +
        f1(h - 10) +
        '" rx="4" fill="none" stroke="' +
        SC.fabricStroke +
        '" stroke-width="0.8" stroke-dasharray="3 2" opacity="0.7"/>';
    }

    g +=
      '<rect x="' +
      f1(x + 4) +
      '" y="' +
      f1(y + 4) +
      '" width="' +
      f1(w - 8) +
      '" height="' +
      f1(perlH) +
      '" rx="3" fill="url(#cocoDripPerlite)" stroke="' +
      SC.perliteDot +
      '" stroke-width="0.6" opacity="0.95"/>';

    if (hasPlant) {
      var cx = x + w / 2;
      var cy = y + perlH + (h - perlH) * 0.42;
      g +=
        '<ellipse cx="' +
        f1(cx) +
        '" cy="' +
        f1(cy) +
        '" rx="' +
        f1(w * 0.18) +
        '" ry="' +
        f1(h * 0.1) +
        '" fill="' +
        SC.plant +
        '" opacity="0.85"/>';
      g +=
        '<path d="M' +
        f1(cx) +
        ' ' +
        f1(cy - h * 0.14) +
        ' C' +
        f1(cx - w * 0.12) +
        ' ' +
        f1(cy - h * 0.02) +
        ' ' +
        f1(cx - w * 0.08) +
        ' ' +
        f1(cy + h * 0.08) +
        ' ' +
        f1(cx) +
        ' ' +
        f1(cy + h * 0.06) +
        ' C' +
        f1(cx + w * 0.08) +
        ' ' +
        f1(cy + h * 0.08) +
        ' ' +
        f1(cx + w * 0.12) +
        ' ' +
        f1(cy - h * 0.02) +
        ' ' +
        f1(cx) +
        ' ' +
        f1(cy - h * 0.14) +
        ' Z" fill="' +
        SC.plantDark +
        '" opacity="0.9"/>';
    }

    if (dist === 'halos') {
      g +=
        '<ellipse cx="' +
        f1(x + w / 2) +
        '" cy="' +
        f1(y + 8) +
        '" rx="' +
        f1(w * 0.38) +
        '" ry="5" fill="none" stroke="' +
        SC.haloRing +
        '" stroke-width="1.8" opacity="0.9"/>';
    } else {
      g +=
        '<line x1="' +
        f1(x + w / 2) +
        '" y1="' +
        f1(y - 2) +
        '" x2="' +
        f1(x + w / 2) +
        '" y2="' +
        f1(y + 6) +
        '" stroke="' +
        SC.flow +
        '" stroke-width="2" stroke-linecap="round"/>';
      g +=
        '<circle cx="' +
        f1(x + w / 2) +
        '" cy="' +
        f1(y + 8) +
        '" r="2.2" fill="' +
        SC.flowLight +
        '" stroke="' +
        SC.flow +
        '" stroke-width="0.8"/>';
    }

    if (opts.celdaProg && opts.celdaProg.eventosDia) {
      g +=
        '<text x="' +
        f1(x + w / 2) +
        '" y="' +
        f1(y + h - 4) +
        '" text-anchor="middle" font-size="8" font-weight="600" fill="' +
        (SC.accent || '#0d9488') +
        '">' +
        esc(String(opts.celdaProg.eventosDia) + '×') +
        '</text>';
    }

    g += '</g>';
    return g;
  }

  function renderPlanView(d, planX, planY, planW, planH) {
    var o = '';
    var pad = 16;
    var tentX = planX + pad;
    var tentY = planY + pad;
    var tentW = planW - pad * 2;
    var tentH = planH - pad * 2 - 36;

    o +=
      '<rect x="' +
      f1(tentX) +
      '" y="' +
      f1(tentY) +
      '" width="' +
      f1(tentW) +
      '" height="' +
      f1(tentH) +
      '" rx="10" fill="' +
      SC.tentFill +
      '" stroke="' +
      SC.tentStroke +
      '" stroke-width="1.5" stroke-dasharray="8 5"/>';

    var gap = 10;
    var bagW = d.bag.w;
    var bagH = d.bag.h;
    var bagLift = 10;
    var gridW = d.grid.cols * bagW + (d.grid.cols - 1) * gap;
    var gridH = d.grid.rows * bagH + (d.grid.rows - 1) * gap;
    var gx = tentX + (tentW - gridW) / 2;
    var gy = tentY + (tentH - gridH) / 2 - 8 - bagLift;

    var manifoldY = gy - 14;
    o +=
      '<line x1="' +
      f1(gx) +
      '" y1="' +
      f1(manifoldY) +
      '" x2="' +
      f1(gx + gridW) +
      '" y2="' +
      f1(manifoldY) +
      '" stroke="' +
      SC.flow +
      '" stroke-width="3" stroke-linecap="round"/>';

    var idx = 0;
    for (var r = 0; r < d.grid.rows; r++) {
      for (var c = 0; c < d.grid.cols; c++) {
        var bx = gx + c * (bagW + gap);
        var by = gy + r * (bagH + gap);
        var hasPlant = plantaEnCelda(d.torre, r, c);
        var nom = nombreCelda(d.torre, r, c);
        var cKey = r + '_' + c;
        var celdaProg = d.porCelda && d.porCelda[cKey] ? d.porCelda[cKey] : null;
        o += renderBagPlan(bx, by, bagW, bagH, {
          n: r,
          c: c,
          hasPlant: hasPlant,
          dist: d.dist,
          smart: d.smart,
          perlFrac: perlitaFrac(d.cfg),
          label: nom ? 'Bolsa ' + (r + 1) + '-' + (c + 1) + ': ' + nom : undefined,
          celdaProg: celdaProg,
        });
        o +=
          '<rect x="' +
          f1(bx + bagW * 0.18) +
          '" y="' +
          f1(by + bagH) +
          '" width="' +
          f1(bagW * 0.18) +
          '" height="' +
          f1(bagLift) +
          '" rx="1" fill="' +
          SC.potStroke +
          '" opacity="0.45"/>';
        o +=
          '<rect x="' +
          f1(bx + bagW * 0.64) +
          '" y="' +
          f1(by + bagH) +
          '" width="' +
          f1(bagW * 0.18) +
          '" height="' +
          f1(bagLift) +
          '" rx="1" fill="' +
          SC.potStroke +
          '" opacity="0.45"/>';
        o +=
          '<line x1="' +
          f1(bx + bagW / 2) +
          '" y1="' +
          f1(manifoldY) +
          '" x2="' +
          f1(bx + bagW / 2) +
          '" y2="' +
          f1(by) +
          '" stroke="' +
          SC.flow +
          '" stroke-width="1.5" opacity="0.75"/>';
        idx++;
      }
    }

    var trayY = gy + gridH + bagLift + 4;
    o +=
      '<path d="M' +
      f1(gx - 6) +
      ' ' +
      f1(trayY) +
      ' L' +
      f1(gx + gridW + 6) +
      ' ' +
      f1(trayY) +
      ' L' +
      f1(gx + gridW + 18) +
      ' ' +
      f1(trayY + 14) +
      ' L' +
      f1(gx - 18) +
      ' ' +
      f1(trayY + 14) +
      ' Z" fill="' +
      SC.trayFill +
      '" stroke="' +
      SC.trayStroke +
      '" stroke-width="1.2" opacity="0.9"/>';
    for (var gi = 1; gi < d.grid.cols; gi++) {
      var gxLine = gx + gi * (bagW + gap) - gap / 2;
      o +=
        '<line x1="' +
        f1(gxLine) +
        '" y1="' +
        f1(trayY + 2) +
        '" x2="' +
        f1(gxLine) +
        '" y2="' +
        f1(trayY + 12) +
        '" stroke="' +
        SC.trayStroke +
        '" stroke-width="0.8" opacity="0.5"/>';
    }
    for (var gj = 1; gj < d.grid.rows; gj++) {
      var gyLine = trayY + (gj * 14) / d.grid.rows;
      o +=
        '<line x1="' +
        f1(gx - 4) +
        '" y1="' +
        f1(gyLine) +
        '" x2="' +
        f1(gx + gridW + 4) +
        '" y2="' +
        f1(gyLine) +
        '" stroke="' +
        SC.trayStroke +
        '" stroke-width="0.8" opacity="0.5"/>';
    }
    o +=
      '<text x="' +
      f1(gx + gridW + 22) +
      '" y="' +
      f1(trayY + 10) +
      '" font-size="8" fill="' +
      SC.inkSoft +
      '">DTW — vaciar</text>';
    o +=
      '<text x="' +
      f1(gx) +
      '" y="' +
      f1(trayY + 26) +
      '" font-size="7" fill="' +
      SC.inkSoft +
      '">Macetas elevadas · no reabsorber runoff (Saltón Verde)</text>';

    var tankW = 88;
    var tankH = 52;
    var tankX = tentX + tentW - tankW - 4;
    var tankY = tentY + tentH - tankH + 4;
    o +=
      '<rect x="' +
      f1(tankX) +
      '" y="' +
      f1(tankY) +
      '" width="' +
      f1(tankW) +
      '" height="' +
      f1(tankH) +
      '" rx="6" fill="url(#cocoDripTank)" stroke="' +
      SC.tankStroke +
      '" stroke-width="1.5"/>';
    o +=
      '<text x="' +
      f1(tankX + tankW / 2) +
      '" y="' +
      f1(tankY + 18) +
      '" text-anchor="middle" font-size="9" font-weight="600" fill="' +
      SC.tankStroke +
      '">Reservorio</text>';
    o +=
      '<text x="' +
      f1(tankX + tankW / 2) +
      '" y="' +
      f1(tankY + 32) +
      '" text-anchor="middle" font-size="8" fill="' +
      SC.inkSoft +
      '">' +
      esc(String(d.cfg.cocoDripReservorioLitros || '—')) +
      ' L · ' +
      d.freq +
      '×/d</text>';

    o +=
      '<path d="M' +
      f1(tankX) +
      ' ' +
      f1(tankY + tankH / 2) +
      ' L' +
      f1(gx - 8) +
      ' ' +
      f1(manifoldY) +
      '" fill="none" stroke="' +
      SC.flow +
      '" stroke-width="2.5" marker-end="url(#cocoDripArrow)"/>';

    o +=
      '<text x="' +
      f1(planX + planW / 2) +
      '" y="' +
      f1(planY + 14) +
      '" text-anchor="middle" font-size="11" font-weight="700" fill="' +
      SC.title +
      '">Vista cenital · bolsas coco + goteo</text>';

    return o;
  }

  function renderCrossSection(d, x, y, w, h) {
    var o = '';
    var bx = x + w * 0.22;
    var bw = w * 0.28;
    var bh = h * 0.72;
    var by = y + h * 0.12;
    var perlH = bh * perlitaFrac(d.cfg);
    var smart = d.smart;
    var dash = smart ? ' stroke-dasharray="5 3"' : '';

    o +=
      '<text x="' +
      f1(x + w / 2) +
      '" y="' +
      f1(y + 12) +
      '" text-anchor="middle" font-size="11" font-weight="700" fill="' +
      SC.title +
      '">Corte · bolsa ' +
      (smart ? 'tela' : 'rígida') +
      '</text>';

    o +=
      '<rect x="' +
      f1(bx) +
      '" y="' +
      f1(by) +
      '" width="' +
      f1(bw) +
      '" height="' +
      f1(bh) +
      '" rx="5" fill="' +
      SC.cocoFill +
      '" stroke="' +
      (smart ? SC.fabricStroke : SC.potStroke) +
      '" stroke-width="1.6"' +
      dash +
      '/>';

    o +=
      '<rect x="' +
      f1(bx + 3) +
      '" y="' +
      f1(by + 3) +
      '" width="' +
      f1(bw - 6) +
      '" height="' +
      f1(perlH) +
      '" rx="2" fill="url(#cocoDripPerlite)" stroke="' +
      SC.perliteDot +
      '" stroke-width="0.5"/>';

    o +=
      '<text x="' +
      f1(bx + bw + 6) +
      '" y="' +
      f1(by + perlH / 2 + 3) +
      '" font-size="8" fill="' +
      SC.inkSoft +
      '">Perlita ' +
      d.perlPct +
      '%</text>';

    var plantY = by + perlH + bh * 0.28;
    o +=
      '<ellipse cx="' +
      f1(bx + bw / 2) +
      '" cy="' +
      f1(plantY) +
      '" rx="' +
      f1(bw * 0.22) +
      '" ry="' +
      f1(bh * 0.08) +
      '" fill="' +
      SC.plant +
      '"/>';
    o +=
      '<path d="M' +
      f1(bx + bw / 2) +
      ' ' +
      f1(plantY - bh * 0.16) +
      ' l-6 12 h12 z" fill="' +
      SC.plantDark +
      '"/>';

    if (d.dist === 'halos') {
      o +=
        '<ellipse cx="' +
        f1(bx + bw / 2) +
        '" cy="' +
        f1(by + 6) +
        '" rx="' +
        f1(bw * 0.42) +
        '" ry="4" fill="none" stroke="' +
        SC.haloRing +
        '" stroke-width="1.5"/>';
    } else {
      o +=
        '<line x1="' +
        f1(bx + bw / 2) +
        '" y1="' +
        f1(by - 16) +
        '" x2="' +
        f1(bx + bw / 2) +
        '" y2="' +
        f1(by + 2) +
        '" stroke="' +
        SC.flow +
        '" stroke-width="2"/>';
    }

    var trayY = by + bh + 4;
    o +=
      '<rect x="' +
      f1(bx - 10) +
      '" y="' +
      f1(trayY) +
      '" width="' +
      f1(bw + 20) +
      '" height="10" rx="2" fill="' +
      SC.trayFill +
      '" stroke="' +
      SC.trayStroke +
      '"/>';
    o +=
      '<path d="M' +
      f1(bx + bw / 2) +
      ' ' +
      f1(trayY + 10) +
      ' l4 8 h-8 z" fill="' +
      SC.runoff +
      '" opacity="0.8"/>';
    o +=
      '<text x="' +
      f1(bx + bw / 2) +
      '" y="' +
      f1(trayY + 28) +
      '" text-anchor="middle" font-size="8" fill="' +
      SC.inkSoft +
      '">Runoff 10–20%</text>';

    var lx = x + w * 0.58;
    var ly = y + 28;
    o +=
      '<text x="' +
      f1(lx) +
      '" y="' +
      f1(ly) +
      '" font-size="9" font-weight="600" fill="' +
      SC.accent +
      '">Leyenda DTW</text>';
    var lines = [
      '· ~5% vol. maceta / evento',
      '· Fertigar con nutrientes',
      '· ' + d.freq + ' riegos/día (luces ON)',
      '· Distribución: ' + (d.dist === 'halos' ? 'halo' : 'emitter'),
    ];
    for (var i = 0; i < lines.length; i++) {
      o +=
        '<text x="' +
        f1(lx) +
        '" y="' +
        f1(ly + 14 + i * 13) +
        '" font-size="8.5" fill="' +
        SC.inkSoft +
        '">' +
        esc(lines[i]) +
        '</text>';
    }

    return o;
  }

  function buildCocoDripDiagramSvg(cfg, torre) {
    var d = datosDiagrama(cfg, torre);
    var W = 520;
    var H = 460;
    var planH = 268;
    var uid = 'cocoDrip' + Math.random().toString(36).slice(2, 7);
    var defs = typeof cocoDripScadaDefs === 'function' ? cocoDripScadaDefs('cocoDrip') : '';
    defs +=
      '<marker id="cocoDripArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">' +
      '<path d="M0,0 L6,3 L0,6 Z" fill="' +
      SC.flow +
      '"/></marker>';

    return (
      '<svg class="torre-svg-diagram coco-drip-svg-diagram svg-centered-block" xmlns="http://www.w3.org/2000/svg" ' +
      'viewBox="0 0 ' +
      W +
      ' ' +
      H +
      '" width="100%" height="auto" role="img" aria-labelledby="' +
      uid +
      '-title" overflow="visible">' +
      defs +
      '<title id="' +
      uid +
      '-title">Coco coir y goteo: bolsas en sala, reservorio y drenaje DTW</title>' +
      '<rect width="' +
      W +
      '" height="' +
      H +
      '" fill="url(#cocoDripBg)" rx="8"/>' +
      '<line x1="12" y1="' +
      planH +
      '" x2="' +
      (W - 12) +
      '" y2="' +
      planH +
      '" stroke="' +
      SC.trayStroke +
      '" stroke-width="1" opacity="0.35"/>' +
      renderPlanView(d, 0, 0, W, planH) +
      renderCrossSection(d, 0, planH, W, H - planH) +
      '</svg>'
    );
  }

  function generarSVGCocoDrip() {
    try {
      return buildCocoDripDiagramSvg(
        typeof state !== 'undefined' ? state.configTorre : null,
        typeof state !== 'undefined' ? state.torre : null
      );
    } catch (e) {
      try {
        console.error('generarSVGCocoDrip', e);
      } catch (_) {}
      return (
        '<p class="torre-svg-fallback" role="status">No se pudo dibujar el esquema coco + goteo.</p>'
      );
    }
  }

  global.buildCocoDripDiagramSvg = buildCocoDripDiagramSvg;
  global.generarSVGCocoDrip = generarSVGCocoDrip;
})(typeof window !== 'undefined' ? window : globalThis);
