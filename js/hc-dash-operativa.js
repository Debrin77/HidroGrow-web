/**
 * Inicio operativo: estado reciente, medición rápida, «qué añadir ahora», resumen semanal, recarga ref.
 * Tras app-hc-medicion-toast.js.
 */
(function () {
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function numVal(raw) {
    const s = String(raw == null ? '' : raw).trim().replace(',', '.');
    if (!s) return NaN;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }

  function strVal(raw) {
    const s = String(raw == null ? '' : raw).trim();
    return s || '';
  }

  function calcVpdKpaLocal(tempC, rhPct) {
    if (typeof window.calcVPDkPa === 'function') return window.calcVPDkPa(tempC, rhPct);
    if (!Number.isFinite(tempC) || !Number.isFinite(rhPct)) return NaN;
    const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
    return Math.round(svp * (1 - rhPct / 100) * 100) / 100;
  }

  function operativaVisible() {
    try {
      if (typeof hcTieneInstalacionesUsuario === 'function' && !hcTieneInstalacionesUsuario()) return false;
      if (typeof medicionesOperativasPermitidas === 'function' && !medicionesOperativasPermitidas()) return false;
      return true;
    } catch (_) {
      return false;
    }
  }

  function volDepositoSugerido() {
    try {
      const cfg = state && state.configTorre ? state.configTorre : {};
      if (typeof getVolumenNutrientesLitros === 'function') {
        const v = getVolumenNutrientesLitros(cfg);
        if (v != null && Number.isFinite(v) && v > 0) return Math.round(v * 10) / 10;
      }
      const um = state && state.ultimaMedicion ? state.ultimaMedicion.vol : null;
      if (um != null && String(um).trim() !== '') {
        const n = numVal(um);
        if (Number.isFinite(n) && n > 0) return n;
      }
    } catch (_) {}
    return '';
  }

  const salaFieldIds = ['dashQuickTempAire', 'dashQuickHumSala', 'dashQuickCO2', 'dashQuickPPFD'];
  const salaTouched = Object.create(null);

  function markSalaTouched(id) {
    if (id) salaTouched[id] = true;
    const el = document.getElementById(id);
    if (el) delete el.dataset.hcInherited;
  }

  function resetSalaTouchedState() {
    salaFieldIds.forEach(function (id) {
      delete salaTouched[id];
      const el = document.getElementById(id);
      if (el) delete el.dataset.hcInherited;
    });
  }

  function readSalaFieldForSave(id) {
    const el = document.getElementById(id);
    if (!el) return NaN;
    const raw = strVal(el.value);
    if (!raw) return NaN;
    if (el.dataset.hcInherited === '1' && !salaTouched[id]) return NaN;
    return numVal(raw);
  }

  function applySalaHintsFromUltima() {
    const um = state && state.ultimaMedicion ? state.ultimaMedicion : null;
    if (!um) return;
    const map = [
      ['dashQuickTempAire', um.tempAire],
      ['dashQuickHumSala', um.humSala],
      ['dashQuickCO2', um.co2],
      ['dashQuickPPFD', um.ppfd],
    ];
    map.forEach(function (pair) {
      const el = document.getElementById(pair[0]);
      if (!el || salaTouched[pair[0]]) return;
      if (String(el.value || '').trim()) return;
      if (pair[1] == null || String(pair[1]).trim() === '') return;
      el.value = String(pair[1]);
      el.dataset.hcInherited = '1';
    });
  }

  function prefillQuickMedir() {
    const volEl = document.getElementById('dashQuickVol');
    if (volEl && !String(volEl.value || '').trim()) {
      const sug = volDepositoSugerido();
      if (sug !== '') volEl.placeholder = String(sug);
    }
    const um = state && state.ultimaMedicion ? state.ultimaMedicion : null;
    if (!um) return;
    [
      ['dashQuickEC', um.ec],
      ['dashQuickPH', um.ph],
      ['dashQuickTemp', um.temp],
      ['dashQuickVol', um.vol],
    ].forEach(function (pair) {
      const el = document.getElementById(pair[0]);
      if (!el || String(el.value || '').trim()) return;
      if (pair[1] != null && String(pair[1]).trim() !== '') el.placeholder = String(pair[1]);
    });
    const details = document.getElementById('dashQuickSalaDetails');
    if (details && details.open) applySalaHintsFromUltima();
  }

  function parseMedFechaMs(str) {
    if (!str) return NaN;
    try {
      const p = String(str).split('/');
      if (p.length >= 3) {
        const d = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
        return d.getTime();
      }
    } catch (_) {}
    return NaN;
  }

  function edadMedicionTexto(fecha, hora) {
    const ts = parseMedFechaMs(fecha);
    if (!Number.isFinite(ts)) return 'Sin fecha';
    let ms = ts;
    if (hora && String(hora).trim()) {
      const hm = String(hora).match(/(\d{1,2}):(\d{2})/);
      if (hm) ms += (parseInt(hm[1], 10) * 60 + parseInt(hm[2], 10)) * 60000;
    }
    const diff = Date.now() - ms;
    if (diff < 0) return 'Ahora';
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Ahora mismo';
    if (min < 60) return 'Hace ' + min + ' min';
    const h = Math.floor(min / 60);
    if (h < 24) return 'Hace ' + h + ' h';
    const d = Math.floor(h / 24);
    if (d === 1) return 'Ayer';
    return 'Hace ' + d + ' d';
  }

  function tileMod(key, val) {
    if (!Number.isFinite(val) && key !== 'vpd') return '';
    try {
      if (typeof getTileClass === 'function') return getTileClass(key, val);
    } catch (_) {}
    return '';
  }

  function fmtParam(key, raw) {
    const n = numVal(raw);
    if (!Number.isFinite(n)) return '—';
    if (key === 'ec') return String(Math.round(n));
    if (key === 'hr' || key === 'co2' || key === 'ppfd') return String(Math.round(n));
    if (key === 'ph' || key === 'temp' || key === 'vol' || key === 'vpd') return (Math.round(n * 10) / 10).toFixed(1);
    return String(n);
  }

  function chipHtml(label, value, unit, mod) {
    const modCls = mod ? ' dash-estado-chip--' + mod : '';
    return (
      '<div class="dash-estado-chip' + modCls + '">' +
      '<span class="dash-estado-chip-lab">' + esc(label) + '</span>' +
      '<span class="dash-estado-chip-val">' + esc(value) + (unit ? ' <span class="dash-estado-chip-unit">' + esc(unit) + '</span>' : '') + '</span>' +
      '</div>'
    );
  }

  function refreshEstadoVivo() {
    const sec = document.getElementById('dashEstadoVivo');
    const body = document.getElementById('dashEstadoVivoBody');
    const edadEl = document.getElementById('dashEstadoVivoEdad');
    if (!sec || !body) return;
    if (!operativaVisible()) {
      sec.classList.add('setup-hidden');
      return;
    }
    const um = state && state.ultimaMedicion ? state.ultimaMedicion : null;
    if (!um || (!um.ec && !um.ph && !um.temp && !um.vol && !um.tempAire && !um.humSala)) {
      sec.classList.add('setup-hidden');
      return;
    }
    sec.classList.remove('setup-hidden');
    if (edadEl) edadEl.textContent = edadMedicionTexto(um.fecha, um.hora);

    const ec = numVal(um.ec);
    const ph = numVal(um.ph);
    const temp = numVal(um.temp);
    const vol = numVal(um.vol);
    const ta = numVal(um.tempAire);
    const hr = numVal(um.humSala);
    let vpd = numVal(um.vpd);
    if (!Number.isFinite(vpd) && Number.isFinite(ta) && Number.isFinite(hr)) {
      vpd = calcVpdKpaLocal(ta, hr);
    }

    let html = '<p class="dash-estado-vivo-meta">' + esc(um.fecha || '') + ' ' + esc(um.hora || '') + ' · datos guardados en este dispositivo</p>';
    html += '<div class="dash-estado-grupo"><span class="dash-estado-grupo-tit">Depósito</span><div class="dash-estado-chips">';
    if (Number.isFinite(ec) || um.ec) html += chipHtml('EC', fmtParam('ec', um.ec), 'µS/cm', tileMod('ec', ec));
    if (Number.isFinite(ph) || um.ph) html += chipHtml('pH', fmtParam('ph', um.ph), '', tileMod('ph', ph));
    if (Number.isFinite(temp) || um.temp) html += chipHtml('T° agua', fmtParam('temp', um.temp), '°C', tileMod('temp', temp));
    if (Number.isFinite(vol) || um.vol) html += chipHtml('Volumen', fmtParam('vol', um.vol), 'L', tileMod('vol', vol));
    html += '</div></div>';

    const tieneSala =
      Number.isFinite(ta) || Number.isFinite(hr) || Number.isFinite(vpd) ||
      numVal(um.co2) || numVal(um.ppfd);
    if (tieneSala) {
      html += '<div class="dash-estado-grupo"><span class="dash-estado-grupo-tit">Sala (última medición con ambiente)</span><div class="dash-estado-chips">';
      if (Number.isFinite(ta) || um.tempAire) html += chipHtml('T° aire', fmtParam('temp', um.tempAire), '°C', '');
      if (Number.isFinite(hr) || um.humSala) html += chipHtml('HR', fmtParam('hr', um.humSala), '%', '');
      if (Number.isFinite(vpd)) html += chipHtml('VPD', fmtParam('vpd', vpd), 'kPa', '');
      if (numVal(um.co2)) html += chipHtml('CO₂', fmtParam('co2', um.co2), 'ppm', '');
      if (numVal(um.ppfd)) html += chipHtml('PPFD', fmtParam('ppfd', um.ppfd), '', '');
      html += '</div></div>';
    } else {
      html += '<p class="dash-estado-vivo-sala-hint">Sin datos de sala en la última medición — despliega «Sala» al medir si quieres HR/VPD.</p>';
    }
    body.innerHTML = html;
  }

  function hcCapturarCorreccionDesdeValores(ec, ph, vol) {
    const saved = {};
    ['inputEC', 'inputPH', 'inputTemp', 'inputVol'].forEach(function (id) {
      const node = document.getElementById(id);
      if (node) saved[id] = node.value;
    });
    try {
      const ie = document.getElementById('inputEC');
      const ip = document.getElementById('inputPH');
      const iv = document.getElementById('inputVol');
      if (ie && Number.isFinite(ec)) ie.value = String(ec);
      if (ip && Number.isFinite(ph)) ip.value = String(ph);
      if (iv && Number.isFinite(vol)) iv.value = String(vol);
      if (typeof evalParam === 'function') evalParam();
      const ecNode = document.getElementById('correccionEC');
      const phNode = document.getElementById('correccionPH');
      return {
        ecHtml: ecNode && ecNode.classList.contains('show') ? ecNode.innerHTML : '',
        phHtml: phNode && phNode.classList.contains('show') ? phNode.innerHTML : '',
      };
    } catch (_) {
      return { ecHtml: '', phHtml: '' };
    } finally {
      ['inputEC', 'inputPH', 'inputTemp', 'inputVol'].forEach(function (id) {
        const node = document.getElementById(id);
        if (node && Object.prototype.hasOwnProperty.call(saved, id)) node.value = saved[id];
      });
      try {
        if (typeof evalParam === 'function') evalParam();
      } catch (_) {}
    }
  }

  function medicionesUltimosDias(dias) {
    const lim = Date.now() - dias * 86400000;
    const src = Array.isArray(state.mediciones) ? state.mediciones : [];
    return src.filter(function (m) {
      if (!m || (m.tipo && m.tipo !== 'medicion')) return false;
      const ts = parseMedFechaMs(m.fecha);
      return Number.isFinite(ts) && ts >= lim;
    });
  }

  function promedioCampo(list, key) {
    const vals = list.map(function (m) { return numVal(m[key]); }).filter(function (n) { return Number.isFinite(n); });
    if (!vals.length) return NaN;
    return Math.round((vals.reduce(function (a, b) { return a + b; }, 0) / vals.length) * 10) / 10;
  }

  function refreshResumenSemanal() {
    const sec = document.getElementById('dashResumenSemanal');
    const body = document.getElementById('dashResumenSemanalBody');
    if (!sec || !body) return;
    if (!operativaVisible()) {
      sec.classList.add('setup-hidden');
      return;
    }
    const sem = medicionesUltimosDias(7);
    sec.classList.remove('setup-hidden');
    if (!sem.length) {
      body.innerHTML = '<p>Sin mediciones en 7 días. Una medición rápida de EC/pH basta para empezar el seguimiento.</p>';
      return;
    }
    const ecAvg = promedioCampo(sem, 'ec');
    const phAvg = promedioCampo(sem, 'ph');
    const tempAvg = promedioCampo(sem, 'temp');
    const hrAvg = promedioCampo(sem, 'humSala');
    const ecTrend =
      typeof getTrendDirection === 'function'
        ? getTrendDirection(sem.slice(0, 6).map(function (m) { return m.ec; }).reverse())
        : 'flat';
    const trendLabel = ecTrend === 'up' ? '↑ sube' : ecTrend === 'down' ? '↓ baja' : '→ estable';
    const recargaTxt = state.ultimaRecarga ? String(state.ultimaRecarga).slice(0, 10) : '—';
    const fase = typeof getFaseCultivoActual === 'function' ? getFaseCultivoActual() : state.modo || 'vegetativo';
    body.innerHTML =
      '<ul>' +
      '<li><strong>' + sem.length + '</strong> mediciones en 7 días</li>' +
      (Number.isFinite(ecAvg) ? '<li>EC media: <strong>' + ecAvg + '</strong> µS/cm (' + trendLabel + ')</li>' : '') +
      (Number.isFinite(phAvg) ? '<li>pH media: <strong>' + phAvg + '</strong></li>' : '') +
      (Number.isFinite(tempAvg) ? '<li>T° agua media: <strong>' + tempAvg + '</strong> °C</li>' : '') +
      (Number.isFinite(hrAvg) ? '<li>HR sala media: <strong>' + hrAvg + '</strong> %</li>' : '') +
      '<li>Fase: <strong>' + esc(fase) + '</strong></li>' +
      '<li>Última recarga: <strong>' + esc(recargaTxt) + '</strong></li>' +
      '</ul>';
  }

  function refreshQueAnadir() {
    const sec = document.getElementById('dashQueAnadir');
    const body = document.getElementById('dashQueAnadirBody');
    if (!sec || !body) return;
    if (!operativaVisible()) {
      sec.classList.add('setup-hidden');
      return;
    }
    const um = state && state.ultimaMedicion ? state.ultimaMedicion : null;
    if (!um) {
      sec.classList.add('setup-hidden');
      return;
    }
    const ts = parseMedFechaMs(um.fecha);
    if (!Number.isFinite(ts) || Date.now() - ts > 72 * 3600000) {
      sec.classList.add('setup-hidden');
      return;
    }
    const ec = numVal(um.ec);
    const ph = numVal(um.ph);
    const vol = numVal(um.vol);
    const volUse = Number.isFinite(vol) && vol > 0 ? vol : numVal(volDepositoSugerido());
    const corr = hcCapturarCorreccionDesdeValores(ec, ph, volUse);
    sec.classList.remove('setup-hidden');
    if (!corr.ecHtml && !corr.phHtml) {
      if (Number.isFinite(ec) || Number.isFinite(ph)) {
        body.innerHTML =
          '<p class="dash-que-anadir-ok">✅ Depósito dentro de objetivo según la última medición (' +
          esc(um.fecha) + ' ' + esc(um.hora || '') + '). No hace falta corrección ahora.</p>';
        return;
      }
      sec.classList.add('setup-hidden');
      return;
    }
    let html = '<p class="dash-que-anadir-meta">Corrección sugerida · medición del ' + esc(um.fecha) + ' ' + esc(um.hora || '') + '</p>';
    if (corr.ecHtml) html += '<div class="dash-que-anadir-ec">' + corr.ecHtml + '</div>';
    if (corr.phHtml) html += '<div class="dash-que-anadir-ph">' + corr.phHtml + '</div>';
    body.innerHTML = html;
  }

  function refreshRecargaRef() {
    const sec = document.getElementById('dashRecargaRef');
    const body = document.getElementById('dashRecargaRefBody');
    if (!sec || !body) return;
    const cfg = state && state.configTorre ? state.configTorre : {};
    const ref = cfg.recargaReferenciaOk;
    if (!operativaVisible() || !ref || typeof ref !== 'object') {
      sec.classList.add('setup-hidden');
      return;
    }
    sec.classList.remove('setup-hidden');
    const parts = [];
    if (ref.volFinal) parts.push(ref.volFinal + ' L');
    if (ref.ecFinal) parts.push('EC ' + ref.ecFinal + ' µS/cm');
    if (ref.phFinal) parts.push('pH ' + ref.phFinal);
    if (ref.vegaAMl && ref.vegaBMl) parts.push('A ' + ref.vegaAMl + ' ml · B ' + ref.vegaBMl + ' ml');
    else if (ref.vegaAMl) parts.push(ref.vegaAMl + ' ml nutriente');
    body.textContent =
      (ref.fecha ? ref.fecha + ' — ' : '') +
      (parts.length ? parts.join(' · ') : 'Recarga confirmada') +
      (ref.nutrienteNombre ? ' (' + ref.nutrienteNombre + ')' : '');
  }

  function refreshDashOperativaHub() {
    const hub = document.getElementById('dashOperativaHub');
    if (!hub) return;
    if (!operativaVisible()) {
      hub.classList.add('setup-hidden');
      return;
    }
    hub.classList.remove('setup-hidden');
    prefillQuickMedir();
    refreshEstadoVivo();
    refreshQueAnadir();
    refreshResumenSemanal();
    refreshRecargaRef();
  }

  function buildPayloadFromQuickForm() {
    const ec = strVal(document.getElementById('dashQuickEC')?.value);
    const ph = strVal(document.getElementById('dashQuickPH')?.value);
    const temp = strVal(document.getElementById('dashQuickTemp')?.value);
    const vol = strVal(document.getElementById('dashQuickVol')?.value);
    const tempAire = readSalaFieldForSave('dashQuickTempAire');
    const humSala = readSalaFieldForSave('dashQuickHumSala');
    const co2 = readSalaFieldForSave('dashQuickCO2');
    const ppfd = readSalaFieldForSave('dashQuickPPFD');
    const notas = strVal(document.getElementById('dashQuickNotas')?.value);
    const vpd = calcVpdKpaLocal(tempAire, humSala);
    const fase = typeof getFaseCultivoActual === 'function' ? getFaseCultivoActual() : state.modo || '';

    if (!ec && !ph && !temp && !vol) return null;

    return {
      ec: ec,
      ph: ph,
      temp: temp,
      vol: vol,
      notas: notas,
      tempAire: Number.isFinite(tempAire) ? tempAire : '',
      humSala: Number.isFinite(humSala) ? humSala : '',
      vpd: Number.isFinite(vpd) ? vpd : '',
      co2: Number.isFinite(co2) ? co2 : '',
      ppfd: Number.isFinite(ppfd) ? ppfd : '',
      lux: '',
      tempExt: '',
      fase: fase,
      skipClearInputs: true,
      source: 'dash-quick',
    };
  }

  async function hcGuardarMedicionRapida() {
    const payload = buildPayloadFromQuickForm();
    const hint = document.getElementById('dashQuickParseHint');
    if (!payload) {
      if (hint) {
        hint.textContent = 'Introduce al menos EC o pH del depósito.';
        hint.classList.add('is-warn');
        hint.classList.remove('is-ok');
      }
      document.getElementById('dashQuickEC')?.focus();
      return;
    }
    if (hint) {
      hint.textContent = '';
      hint.classList.remove('is-warn', 'is-ok');
    }
    try {
      await guardarMedicion(payload);
    } catch (e) {
      if (typeof showToast === 'function') showToast('Error al guardar: ' + (e && e.message ? e.message : e), true);
      return;
    }
    ['dashQuickEC', 'dashQuickPH', 'dashQuickTemp', 'dashQuickNotas'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    salaFieldIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    resetSalaTouchedState();
    if (hint) {
      const sala =
        payload.tempAire !== '' || payload.humSala !== '' || payload.co2 !== '' || payload.ppfd !== ''
          ? ' · sala incluida'
          : ' · solo depósito';
      hint.textContent = 'Guardado' + sala + '. Estado y corrección actualizados arriba.';
      hint.classList.add('is-ok');
    }
    refreshDashOperativaHub();
  }

  function hcGuardarRecargaReferencia(recargaData) {
    if (!state.configTorre || typeof state.configTorre !== 'object') return;
    if (!recargaData || typeof recargaData !== 'object') return;
    state.configTorre.recargaReferenciaOk = {
      capturedAt: new Date().toISOString(),
      fecha: recargaData.fecha || '',
      volFinal: recargaData.volFinal || '',
      ecFinal: recargaData.ecFinal || '',
      phFinal: recargaData.phFinal || '',
      vegaAMl: recargaData.vegaAMl || '',
      vegaBMl: recargaData.vegaBMl || '',
      vegaCMl: recargaData.vegaCMl || '',
      nutrienteNombre: recargaData.nutrienteNombre || '',
    };
    try {
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
      if (typeof saveState === 'function') saveState();
    } catch (_) {}
  }

  window.refreshDashOperativaHub = refreshDashOperativaHub;
  window.hcGuardarMedicionRapida = hcGuardarMedicionRapida;
  window.hcGuardarRecargaReferencia = hcGuardarRecargaReferencia;

  document.addEventListener('DOMContentLoaded', function () {
    const quickEc = document.getElementById('dashQuickEC');
    if (quickEc) {
      quickEc.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        hcGuardarMedicionRapida();
      });
    }
    salaFieldIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', function () { markSalaTouched(id); });
      el.addEventListener('change', function () { markSalaTouched(id); });
    });
    const salaDetails = document.getElementById('dashQuickSalaDetails');
    if (salaDetails) {
      salaDetails.addEventListener('toggle', function () {
        if (salaDetails.open) applySalaHintsFromUltima();
      });
    }
  });
})();
