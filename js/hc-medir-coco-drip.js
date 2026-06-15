/**
 * Medir — runoff coco DTW por maceta y preview de ajuste de pulso.
 */
(function (global) {
  'use strict';

  function cfgActiva() {
    return (typeof state !== 'undefined' && state && state.configTorre) || {};
  }

  function esCocoDripActivo(cfg) {
    cfg = cfg || cfgActiva();
    return (
      typeof hcMedirEsCocoDripCamino === 'function' && hcMedirEsCocoDripCamino(cfg)
    );
  }

  function readNum(id) {
    var el = document.getElementById(id);
    if (!el) return NaN;
    var v = parseFloat(String(el.value || '').replace(',', '.'));
    return Number.isFinite(v) ? v : NaN;
  }

  function poblarSelectCeldasCoco() {
    var sel = document.getElementById('inputCocoDripCeldaRunoff');
    if (!sel) return;
    var cfg = cfgActiva();
    var torre = (typeof state !== 'undefined' && state.torre) || [];
    var prev = sel.value;
    sel.innerHTML = '';
    var celdas =
      typeof enumerateCocoDripCeldas === 'function'
        ? enumerateCocoDripCeldas(cfg, torre)
        : [];
    if (!celdas.length) {
      var opt = document.createElement('option');
      opt.value = '0_0';
      opt.textContent = 'Maceta 1-1 (sin planta en matriz)';
      sel.appendChild(opt);
      return;
    }
    celdas.forEach(function (item) {
      var o = document.createElement('option');
      o.value = item.key;
      var nom = item.cult && item.cult.nombre ? item.cult.nombre : item.variedadId;
      o.textContent = 'Maceta ' + (item.n + 1) + '-' + (item.c + 1) + ': ' + nom;
      sel.appendChild(o);
    });
    if (prev && sel.querySelector('option[value="' + prev + '"]')) sel.value = prev;
  }

  function evalCocoDripRunoffPreview() {
    var preview = document.getElementById('cocoDripRunoffAjustePreview');
    if (!preview) return;
    var cfg = cfgActiva();
    var sel = document.getElementById('inputCocoDripCeldaRunoff');
    var key = sel ? sel.value : '0_0';
    var ecIn = readNum('inputCocoDripEcEntrada');
    var ecOut = readNum('inputCocoDripEcRunoff');
    var pct = readNum('inputCocoDripRunoffPct');

    if (!Number.isFinite(ecIn) && !Number.isFinite(ecOut) && !Number.isFinite(pct)) {
      preview.textContent = '';
      preview.classList.add('setup-hidden');
      return;
    }

    var draft = Object.assign({}, cfg.cocoDripRunoffPorCelda || {});
    draft[key] = {
      ecEntrada: Number.isFinite(ecIn) ? ecIn : null,
      ecRunoff: Number.isFinite(ecOut) ? ecOut : null,
      runoffPct: Number.isFinite(pct) ? pct : null,
      fecha: new Date().toISOString(),
    };
    var cfgDraft = Object.assign({}, cfg, { cocoDripRunoffPorCelda: draft });
    var adj =
      typeof ajustePorRunoffCocoDrip === 'function'
        ? ajustePorRunoffCocoDrip(cfgDraft, key)
        : null;

    if (adj && adj.nota) {
      preview.textContent = 'Ajuste próximo pulso: ' + adj.nota;
      preview.classList.remove('setup-hidden');
    } else if (Number.isFinite(ecIn) && Number.isFinite(ecOut)) {
      var delta = ecOut - ecIn;
      preview.textContent =
        'ΔEC runoff ' +
        (delta >= 0 ? '+' : '') +
        delta +
        ' µS — dentro de margen orientativo';
      preview.classList.remove('setup-hidden');
    } else {
      preview.textContent = '';
      preview.classList.add('setup-hidden');
    }
  }

  function syncEcEntradaDesdeDeposito() {
    var ecDep = readNum('inputEC');
    var ecIn = document.getElementById('inputCocoDripEcEntrada');
    if (ecIn && !ecIn.value && Number.isFinite(ecDep)) {
      ecIn.value = String(Math.round(ecDep));
    }
  }

  function refreshMedirCocoDripUi() {
    var card = document.getElementById('medirCocoDripCard');
    if (!card) return;
    var cfg = cfgActiva();
    var show = esCocoDripActivo(cfg);
    card.classList.toggle('setup-hidden', !show);
    if (!show) return;
    poblarSelectCeldasCoco();
    syncEcEntradaDesdeDeposito();
    evalCocoDripRunoffPreview();
    var progEl = document.getElementById('medirCocoDripProgResumen');
    if (progEl && typeof buildCocoDripProgramacionTiempoReal === 'function') {
      var prog = buildCocoDripProgramacionTiempoReal(cfg);
      if (prog && typeof renderCocoDripDashHtml === 'function') {
        progEl.innerHTML = renderCocoDripDashHtml(prog);
      }
    }
  }

  function collectCocoDripRunoffPayload() {
    if (!esCocoDripActivo()) return null;
    var sel = document.getElementById('inputCocoDripCeldaRunoff');
    var key = sel ? sel.value : '0_0';
    var parts = key.split('_');
    var ecEntrada = readNum('inputCocoDripEcEntrada');
    var ecRunoff = readNum('inputCocoDripEcRunoff');
    var runoffPct = readNum('inputCocoDripRunoffPct');
    var phRunoff = readNum('inputCocoDripPhRunoff');
    if (!Number.isFinite(ecEntrada) && !Number.isFinite(ecRunoff) && !Number.isFinite(runoffPct)) {
      return null;
    }
    return {
      cocoDripCeldaKey: key,
      cocoDripCeldaN: parseInt(parts[0], 10) || 0,
      cocoDripCeldaC: parseInt(parts[1], 10) || 0,
      ecEntrada: Number.isFinite(ecEntrada) ? ecEntrada : '',
      ecRunoff: Number.isFinite(ecRunoff) ? ecRunoff : '',
      phRunoff: Number.isFinite(phRunoff) ? phRunoff : '',
      runoffPct: Number.isFinite(runoffPct) ? runoffPct : '',
    };
  }

  function onMedirCocoDripInput() {
    syncEcEntradaDesdeDeposito();
    evalCocoDripRunoffPreview();
  }

  global.refreshMedirCocoDripUi = refreshMedirCocoDripUi;
  global.collectCocoDripRunoffPayload = collectCocoDripRunoffPayload;
  global.evalCocoDripRunoffPreview = evalCocoDripRunoffPreview;
  global.onMedirCocoDripInput = onMedirCocoDripInput;
})(typeof window !== 'undefined' ? window : globalThis);
