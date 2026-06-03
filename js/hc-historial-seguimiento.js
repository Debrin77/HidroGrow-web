/**
 * Historial — gráficos de seguimiento real vs objetivo teórico (EC/pH/VPD).
 * Tras hc-setup-historial-tabs.js.
 */
(function () {
  'use strict';

  let histSegDias = 14;

  function parseNum(v) {
    if (v == null || v === '') return NaN;
    const n = parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  }

  function histMedicionMs(m) {
    if (typeof parseRegistroFechaHoraMs === 'function') {
      return parseRegistroFechaHoraMs(m.fecha, m.hora);
    }
    return 0;
  }

  function edadMedicionCorta(fecha, hora) {
    const ms = histMedicionMs({ fecha: fecha, hora: hora });
    if (!ms) return '';
    const diff = Date.now() - ms;
    if (diff < 60000) return 'Ahora mismo';
    const min = Math.floor(diff / 60000);
    if (min < 60) return 'Hace ' + min + ' min';
    const h = Math.floor(min / 60);
    if (h < 24) return 'Hace ' + h + ' h';
    const d = Math.floor(h / 24);
    if (d === 1) return 'Ayer';
    return 'Hace ' + d + ' d';
  }

  function histResolverInstalacion(torreId) {
    if (typeof initTorres === 'function') initTorres();
    const multi = state.torres && state.torres.length > 1;
    const filtro =
      typeof filtroTorreActivo !== 'undefined' && filtroTorreActivo != null ? filtroTorreActivo : null;

    if (multi && filtro == null) return null;

    let slot = null;
    if (filtro != null && Array.isArray(state.torres)) {
      slot = state.torres.find(t => t && String(t.id) === String(filtro));
    } else if (!multi) {
      const ta = typeof getTorreActiva === 'function' ? getTorreActiva() : null;
      slot = ta || (state.torres && state.torres[0]) || null;
    } else if (torreId != null && Array.isArray(state.torres)) {
      slot = state.torres.find(t => t && String(t.id) === String(torreId));
    }

    if (slot) {
      return {
        cfg: slot.config || state.configTorre || {},
        torre: slot.torre || state.torre || [],
        nombre: slot.nombre || 'Instalación',
        emoji: slot.emoji || '🌿',
      };
    }
    return {
      cfg: state.configTorre || {},
      torre: state.torre || [],
      nombre: (typeof getTorreActiva === 'function' && getTorreActiva()?.nombre) || 'Instalación',
      emoji: '🌿',
    };
  }

  function esInteriorCfg(cfg) {
    const u = String((cfg && cfg.ubicacion) || cfg?.premiumSetup?.entorno || 'interior').toLowerCase();
    return u !== 'exterior';
  }

  function bandaEnFecha(inst, atMs) {
    if (!inst || typeof getRecomendacionEcPhDesdeInstalacion !== 'function') return null;
    try {
      return getRecomendacionEcPhDesdeInstalacion(inst.cfg, inst.torre, atMs);
    } catch (_) {
      return null;
    }
  }

  function faseEcKeyToAmbiente(key) {
    if (!key || key === 'manual') {
      return typeof getFaseCultivoActual === 'function' ? getFaseCultivoActual() : 'vegetativo';
    }
    const k = String(key).toLowerCase();
    if (
      k.indexOf('clon') >= 0 ||
      k.indexOf('esquej') >= 0 ||
      k === 'germinacion' ||
      k === 'plantula' ||
      k.indexOf('enraiz') >= 0 ||
      k.indexOf('traslado') >= 0
    ) {
      return 'esqueje';
    }
    if (k === 'prefloracion') return 'prefloracion';
    if (k === 'floracion' || k === 'fructificacion') return 'floracion';
    return 'vegetativo';
  }

  function bandaVpdEnFecha(inst, atMs, ecBand) {
    if (!inst || !esInteriorCfg(inst.cfg) || typeof getRangosFaseAmbiente !== 'function') return null;
    try {
      const fase = faseEcKeyToAmbiente(ecBand && ecBand.faseDominante);
      const r = getRangosFaseAmbiente(fase);
      if (r && r.vpd) return { min: r.vpd.min, max: r.vpd.max, fase };
    } catch (_) {}
    return null;
  }

  function buildPuntosSeguimiento(mediciones, dias) {
    const cutoff = Date.now() - dias * 86400000;
    const pts = [];
    const multi = state.torres && state.torres.length > 1;
    const filtro =
      typeof filtroTorreActivo !== 'undefined' && filtroTorreActivo != null ? filtroTorreActivo : null;

    mediciones.forEach(m => {
      const ms = histMedicionMs(m);
      if (!ms || ms < cutoff) return;
      const ec = parseNum(m.ec);
      const ph = parseNum(m.ph);
      const vpd = parseNum(m.vpd);
      if (!Number.isFinite(ec) && !Number.isFinite(ph) && !Number.isFinite(vpd)) return;

      let inst = histResolverInstalacion(m.torreId);
      if (multi && filtro == null && m.torreId != null) {
        inst = histResolverInstalacion(m.torreId);
      }
      const band = inst ? bandaEnFecha(inst, ms) : null;
      const vpdBand = inst ? bandaVpdEnFecha(inst, ms, band) : null;

      pts.push({
        ms,
        fecha: m.fecha,
        hora: m.hora,
        ec: Number.isFinite(ec) ? ec : null,
        ph: Number.isFinite(ph) ? ph : null,
        vpd: Number.isFinite(vpd) ? vpd : null,
        band,
        vpdBand,
      });
    });
    pts.sort((a, b) => a.ms - b.ms);
    if (pts.length > 40) return pts.slice(pts.length - 40);
    return pts;
  }

  function tituloFaseHist(key) {
    const map = {
      germinacion: 'Germinación',
      plantula: 'Plántula',
      vegetativo: 'Vegetativo',
      prefloracion: 'Pre-flor',
      floracion: 'Floración',
      fructificacion: 'Fructificación',
      manual: 'Objetivo manual',
      clonador_48h: 'Clonador',
      enraizamiento: 'Enraizamiento',
      traslado_dwc: 'Traslado DWC',
      esqueje: 'Esqueje',
    };
    return map[key] || (key ? String(key).replace(/_/g, ' ') : '');
  }

  function getParamVal(p, param) {
    if (param === 'ec') return p.ec;
    if (param === 'ph') return p.ph;
    return p.vpd;
  }

  function getParamBand(p, param) {
    if (param === 'vpd') return p.vpdBand;
    if (!p.band) return null;
    return param === 'ec' ? p.band.ec : p.band.ph;
  }

  function paramLabel(param) {
    if (param === 'ec') return 'EC';
    if (param === 'ph') return 'pH';
    return 'VPD';
  }

  function colorPunto(param, val, p) {
    if (!Number.isFinite(val)) return '#64748b';
    const r = getParamBand(p, param);
    if (!r || !Number.isFinite(r.min) || !Number.isFinite(r.max)) return '#64748b';
    if (val >= r.min && val <= r.max) return '#16a34a';
    const span = r.max - r.min || 1;
    const margen = param === 'ec' ? span * 0.12 : param === 'ph' ? 0.25 : span * 0.15;
    if (val >= r.min - margen && val <= r.max + margen) return '#d97706';
    return '#dc2626';
  }

  function renderSeguimientoSvg(container, pts, param) {
    if (!container) return;
    const W = 320;
    const H = 120;
    const padL = 36;
    const padR = 8;
    const padT = 10;
    const padB = 22;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const lineColor =
      param === 'vpd' ? '#059669' : param === 'ph' ? '#7c3aed' : 'var(--hist-seg-line, #2563eb)';

    const withVal = pts.filter(p => Number.isFinite(getParamVal(p, param)));
    if (withVal.length === 0) {
      const extra =
        param === 'vpd'
          ? ' Registra VPD en Medir (temp. aire + HR).'
          : '';
      container.innerHTML =
        '<p class="hist-seg-empty">Sin mediciones de ' + paramLabel(param) + ' en este periodo.' + extra + '</p>';
      return;
    }

    let yMin = Infinity;
    let yMax = -Infinity;
    withVal.forEach(p => {
      const v = getParamVal(p, param);
      yMin = Math.min(yMin, v);
      yMax = Math.max(yMax, v);
      const r = getParamBand(p, param);
      if (r && Number.isFinite(r.min)) yMin = Math.min(yMin, r.min);
      if (r && Number.isFinite(r.max)) yMax = Math.max(yMax, r.max);
    });
    if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) {
      container.innerHTML = '<p class="hist-seg-empty">Sin datos</p>';
      return;
    }
    const padY =
      param === 'ec' ? Math.max(80, (yMax - yMin) * 0.08) : Math.max(0.12, (yMax - yMin) * 0.12);
    yMin -= padY;
    yMax += padY;
    if (yMax === yMin) {
      yMax += 1;
      yMin -= 1;
    }

    function yPos(v) {
      return padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
    }
    function xPos(i) {
      const n = Math.max(1, withVal.length - 1);
      return padL + (i / n) * plotW;
    }

    const bandRects = [];
    withVal.forEach((p, i) => {
      const r = getParamBand(p, param);
      if (!r || !Number.isFinite(r.min) || !Number.isFinite(r.max)) return;
      const x = xPos(i);
      const w = Math.max(6, plotW / Math.max(1, withVal.length) * 0.85);
      const y1 = yPos(r.max);
      const y2 = yPos(r.min);
      bandRects.push(
        '<rect x="' +
          (x - w / 2).toFixed(1) +
          '" y="' +
          Math.min(y1, y2).toFixed(1) +
          '" width="' +
          w.toFixed(1) +
          '" height="' +
          Math.max(2, Math.abs(y2 - y1)).toFixed(1) +
          '" class="hist-seg-band-rect' +
          (param === 'vpd' ? ' hist-seg-band-rect--vpd' : '') +
          '"/>'
      );
    });

    const linePts = [];
    withVal.forEach((p, i) => {
      const v = getParamVal(p, param);
      linePts.push(xPos(i).toFixed(1) + ',' + yPos(v).toFixed(1));
    });

    const dots = withVal
      .map((p, i) => {
        const v = getParamVal(p, param);
        const c = colorPunto(param, v, p);
        return (
          '<circle cx="' +
          xPos(i).toFixed(1) +
          '" cy="' +
          yPos(v).toFixed(1) +
          '" r="4" fill="' +
          c +
          '" stroke="#fff" stroke-width="1"/>'
        );
      })
      .join('');

    const labels = [];
    const step = Math.max(1, Math.ceil(withVal.length / 5));
    withVal.forEach((p, i) => {
      if (i !== 0 && i !== withVal.length - 1 && i % step !== 0) return;
      const lbl = p.fecha ? String(p.fecha).slice(0, 5) : '';
      labels.push(
        '<text x="' +
          xPos(i).toFixed(1) +
          '" y="' +
          (H - 4) +
          '" text-anchor="middle" class="hist-seg-axis-lbl">' +
          lbl +
          '</text>'
      );
    });

    const fmtY = v => (param === 'ec' ? Math.round(v) : v.toFixed(1));
    const yTicks =
      '<text x="' +
      (padL - 4) +
      '" y="' +
      (padT + 4) +
      '" text-anchor="end" class="hist-seg-axis-lbl">' +
      fmtY(yMax) +
      '</text>' +
      '<text x="' +
      (padL - 4) +
      '" y="' +
      (padT + plotH) +
      '" text-anchor="end" class="hist-seg-axis-lbl">' +
      fmtY(yMin) +
      '</text>';

    const unit = param === 'ec' ? 'µS/cm' : param === 'vpd' ? 'kPa' : '';
    container.innerHTML =
      '<svg class="hist-seg-svg" viewBox="0 0 ' +
      W +
      ' ' +
      H +
      '" role="img" aria-label="Seguimiento ' +
      paramLabel(param) +
      '">' +
      '<rect x="' +
      padL +
      '" y="' +
      padT +
      '" width="' +
      plotW +
      '" height="' +
      plotH +
      '" fill="var(--hist-seg-plot-bg, #f8fafc)" rx="4"/>' +
      bandRects.join('') +
      '<polyline fill="none" stroke="' +
      lineColor +
      '" stroke-width="2" points="' +
      linePts.join(' ') +
      '"/>' +
      dots +
      labels.join('') +
      yTicks +
      '</svg>' +
      (unit ? '<span class="hist-seg-unit">' + unit + '</span>' : '');
  }

  function actualizarLeyenda(pts, inst) {
    const el = document.getElementById('histSeguimientoLeyenda');
    if (!el) return;
    if (!inst) {
      el.textContent = '';
      return;
    }
    const ult = pts.length ? pts[pts.length - 1] : null;
    const band = ult && ult.band ? ult.band : bandaEnFecha(inst, Date.now());
    const partes = [inst.emoji + ' ' + inst.nombre];
    if (band && band.variedadUnicaNombre) partes.push(band.variedadUnicaNombre);
    if (band && band.faseDominante) partes.push(tituloFaseHist(band.faseDominante));
    if (band && band.estrategia === 'manual') partes.push('EC/pH manual');
    if (band && band.mezclaFasesDistintas) partes.push('varias fases en torre');
    const vpdB = ult && ult.vpdBand ? ult.vpdBand : bandaVpdEnFecha(inst, Date.now(), band);
    if (vpdB && esInteriorCfg(inst.cfg)) {
      partes.push('VPD ' + vpdB.min + '–' + vpdB.max + ' kPa (' + tituloFaseHist(vpdB.fase) + ')');
    } else if (!esInteriorCfg(inst.cfg)) {
      partes.push('VPD teórico solo en interior');
    }
    if (band && band.conFaseReal === false && band.estrategia !== 'manual') {
      partes.push('añade fecha de planta para afinar la curva');
    }
    el.textContent = partes.join(' · ');
  }

  function renderHistorialSeguimiento(mediciones) {
    const wrap = document.getElementById('histSeguimientoWrap');
    const aviso = document.getElementById('histSeguimientoAviso');
    const ecEl = document.getElementById('histSegChartEc');
    const phEl = document.getElementById('histSegChartPh');
    const vpdEl = document.getElementById('histSegChartVpd');
    if (!wrap) return;

    const multi = state.torres && state.torres.length > 1;
    const filtro =
      typeof filtroTorreActivo !== 'undefined' && filtroTorreActivo != null ? filtroTorreActivo : null;

    if (multi && filtro == null) {
      wrap.classList.add('hist-seg-wrap--muted');
      if (aviso) {
        aviso.classList.remove('setup-hidden');
        aviso.textContent =
          'Con varias instalaciones, elige una arriba para ver la banda objetivo según variedad, fase y parámetros guardados.';
      }
      if (ecEl) ecEl.innerHTML = '';
      if (phEl) phEl.innerHTML = '';
      if (vpdEl) vpdEl.innerHTML = '';
      actualizarLeyenda([], null);
      return;
    }

    wrap.classList.remove('hist-seg-wrap--muted');
    if (aviso) aviso.classList.add('setup-hidden');

    const inst = histResolverInstalacion(filtro);
    const pts = buildPuntosSeguimiento(mediciones || [], histSegDias);

    if (pts.length < 2) {
      wrap.classList.add('hist-seg-wrap--muted');
      if (aviso) {
        aviso.classList.remove('setup-hidden');
        aviso.textContent =
          'Guarda al menos 2 mediciones en los últimos ' + histSegDias + ' días para ver el seguimiento.';
      }
    } else if (aviso) {
      aviso.classList.add('setup-hidden');
    }

    renderSeguimientoSvg(ecEl, pts, 'ec');
    renderSeguimientoSvg(phEl, pts, 'ph');
    renderSeguimientoSvg(vpdEl, pts, 'vpd');
    actualizarLeyenda(pts, inst);
  }

  function getUltimaAmbientalActiva() {
    const meds =
      typeof recolectarMedicionesTodasInstalaciones === 'function'
        ? recolectarMedicionesTodasInstalaciones()
        : state.mediciones || [];
    const ta = typeof getTorreActiva === 'function' ? getTorreActiva() : null;
    const tid = ta && ta.id != null ? String(ta.id) : null;
    for (let i = 0; i < meds.length; i++) {
      const m = meds[i];
      if (tid != null && m.torreId != null && String(m.torreId) !== tid) continue;
      const vpd = parseNum(m.vpd);
      const tAire = parseNum(m.tempAire);
      const hr = parseNum(m.humSala);
      if (Number.isFinite(vpd) || (Number.isFinite(tAire) && Number.isFinite(hr))) return m;
    }
    return null;
  }

  /** VPD/evolución: solo tras montaje verificado o modo operativo (no durante paso 2 montaje). */
  function shouldShowSalaSeguimientoCta() {
    try {
      if (typeof getInstalacionLifecycle === 'function') {
        const lc = getInstalacionLifecycle();
        if (lc && lc.operativaDiaria) return true;
        if (lc && lc.fase === 'sin_config') return false;
        const cfg =
          typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
        if (cfg.puestaMarchaChecks && cfg.puestaMarchaChecks.completedAt) return true;
        return false;
      }
    } catch (_) {}
    return false;
  }

  function renderSalaSeguimientoCta() {
    const el = document.getElementById('salaSeguimientoCta');
    if (!el) return;
    if (!shouldShowSalaSeguimientoCta()) {
      el.classList.add('setup-hidden');
      el.innerHTML = '';
      return;
    }
    el.classList.remove('setup-hidden');
    const ult = getUltimaAmbientalActiva();
    const edad = ult ? edadMedicionCorta(ult.fecha, ult.hora) : '';
    let stats = '';
    if (ult) {
      const bits = [];
      const vpd = parseNum(ult.vpd);
      if (Number.isFinite(vpd)) bits.push('<span class="sala-seg-cta-stat">VPD <strong>' + vpd + '</strong> kPa</span>');
      const hr = parseNum(ult.humSala);
      if (Number.isFinite(hr)) bits.push('<span class="sala-seg-cta-stat">HR <strong>' + hr + '</strong>%</span>');
      const ta = parseNum(ult.tempAire);
      if (Number.isFinite(ta)) bits.push('<span class="sala-seg-cta-stat">T° <strong>' + ta + '</strong>°C</span>');
      stats = bits.join('');
    }
    el.innerHTML =
      '<div class="sala-seg-cta-inner">' +
      '<div>' +
      (stats
        ? '<div class="sala-seg-cta-stats">' + stats + '</div>' + (edad ? '<div class="sala-seg-cta-edad">' + edad + '</div>' : '')
        : '<p class="sala-seg-cta-hint">Registra temp. aire y HR en <strong>Medir</strong> para calcular VPD y ver la evolución.</p>') +
      '</div>' +
      '<button type="button" class="btn btn-secondary btn-sm" onclick="hcIrHistorialSeguimiento()">Ver evolución →</button>' +
      '</div>';
  }

  function hcIrHistorialSeguimiento() {
    if (typeof goTab === 'function') goTab('historial');
    setTimeout(function () {
      if (typeof histTab === 'function') histTab('mediciones');
      if (typeof cargarHistorial === 'function') cargarHistorial();
      try {
        document.getElementById('histSeguimientoWrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (_) {}
    }, 120);
  }

  function bindHistSegPeriodo() {
    const row = document.getElementById('histSegPeriodo');
    if (!row || row.dataset.hcBound === '1') return;
    row.dataset.hcBound = '1';
    row.addEventListener('click', e => {
      const btn = e.target.closest('[data-hist-seg-dias]');
      if (!btn) return;
      const d = parseInt(btn.getAttribute('data-hist-seg-dias'), 10);
      if (!Number.isFinite(d) || d < 1) return;
      histSegDias = d;
      row.querySelectorAll('[data-hist-seg-dias]').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      if (typeof renderHistMediciones === 'function') renderHistMediciones();
    });
  }

  window.renderHistorialSeguimiento = renderHistorialSeguimiento;
  window.shouldShowSalaSeguimientoCta = shouldShowSalaSeguimientoCta;
  window.renderSalaSeguimientoCta = renderSalaSeguimientoCta;
  window.hcIrHistorialSeguimiento = hcIrHistorialSeguimiento;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bindHistSegPeriodo();
      renderSalaSeguimientoCta();
    });
  } else {
    bindHistSegPeriodo();
    renderSalaSeguimientoCta();
  }
})();
