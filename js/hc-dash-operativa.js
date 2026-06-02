/**
 * Inicio operativo: medición rápida, «qué añadir ahora», resumen semanal, recarga ref, QR.
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

  function prefillQuickMedir() {
    const volEl = document.getElementById('dashQuickVol');
    if (!volEl || String(volEl.value || '').trim()) return;
    const sug = volDepositoSugerido();
    if (sug !== '') volEl.placeholder = String(sug);
    const um = state && state.ultimaMedicion ? state.ultimaMedicion : null;
    if (!um) return;
    const map = [
      ['dashQuickEC', um.ec],
      ['dashQuickPH', um.ph],
      ['dashQuickTemp', um.temp],
      ['dashQuickVol', um.vol],
      ['dashQuickTempAire', um.tempAire],
      ['dashQuickHumSala', um.humSala],
      ['dashQuickCO2', um.co2],
      ['dashQuickPPFD', um.ppfd],
    ];
    map.forEach(function (pair) {
      const el = document.getElementById(pair[0]);
      if (!el || String(el.value || '').trim()) return;
      if (pair[1] != null && String(pair[1]).trim() !== '') el.placeholder = String(pair[1]);
    });
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
    const vals = list
      .map(function (m) {
        return numVal(m[key]);
      })
      .filter(function (n) {
        return Number.isFinite(n);
      });
    if (!vals.length) return NaN;
    return Math.round((vals.reduce(function (a, b) {
      return a + b;
    }, 0) / vals.length) * 10) / 10;
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
      body.innerHTML = '<p>Aún no hay mediciones esta semana. Usa la medición rápida arriba.</p>';
      return;
    }
    const ecAvg = promedioCampo(sem, 'ec');
    const phAvg = promedioCampo(sem, 'ph');
    const tempAvg = promedioCampo(sem, 'temp');
    const ecTrend =
      typeof getTrendDirection === 'function'
        ? getTrendDirection(
            sem
              .slice(0, 6)
              .map(function (m) {
                return m.ec;
              })
              .reverse()
          )
        : 'flat';
    const trendLabel = ecTrend === 'up' ? '↑ sube' : ecTrend === 'down' ? '↓ baja' : '→ estable';
    let recargaTxt = '—';
    try {
      if (typeof updateRecargaBar === 'function') {
        /* bar updated elsewhere */
      }
      if (state.ultimaRecarga) {
        recargaTxt = String(state.ultimaRecarga).slice(0, 10);
      }
    } catch (_) {}
    const fase =
      typeof getFaseCultivoActual === 'function'
        ? getFaseCultivoActual()
        : state.modo || 'vegetativo';
    body.innerHTML =
      '<ul>' +
      '<li><strong>' +
      sem.length +
      '</strong> mediciones (7 d)</li>' +
      (Number.isFinite(ecAvg) ? '<li>EC media: <strong>' + ecAvg + '</strong> µS/cm (' + trendLabel + ')</li>' : '') +
      (Number.isFinite(phAvg) ? '<li>pH media: <strong>' + phAvg + '</strong></li>' : '') +
      (Number.isFinite(tempAvg) ? '<li>T° agua media: <strong>' + tempAvg + '</strong> °C</li>' : '') +
      '<li>Fase: <strong>' +
      esc(fase) +
      '</strong></li>' +
      '<li>Última recarga: <strong>' +
      esc(recargaTxt) +
      '</strong></li>' +
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
    if (!corr.ecHtml && !corr.phHtml) {
      sec.classList.add('setup-hidden');
      return;
    }
    sec.classList.remove('setup-hidden');
    let html = '<p class="dash-que-anadir-meta">Basado en medición del ' + esc(um.fecha) + ' ' + esc(um.hora || '') + '</p>';
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

  function hcBuildDeepLinkUrl(opts) {
    opts = opts || {};
    const base = location.origin + location.pathname;
    const idx = state.torreActiva || 0;
    let frag = 'hc=i:' + idx;
    if (opts.nivel != null && opts.cesta != null) {
      frag = 'hc=p:' + idx + ':' + opts.nivel + ':' + opts.cesta;
    }
    return base + '#' + frag;
  }

  function refreshQrAcceso() {
    const sec = document.getElementById('dashQrAcceso');
    const img = document.getElementById('dashQrImg');
    const urlEl = document.getElementById('dashQrUrl');
    if (!sec || !img || !urlEl) return;
    if (!operativaVisible()) {
      sec.classList.add('setup-hidden');
      return;
    }
    sec.classList.remove('setup-hidden');
    const url = hcBuildDeepLinkUrl();
    urlEl.textContent = url;
    img.alt = 'QR instalación activa';
    img.src =
      'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=' + encodeURIComponent(url);
    img.hidden = false;
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
    refreshQueAnadir();
    refreshResumenSemanal();
    refreshRecargaRef();
    refreshQrAcceso();
  }

  function buildPayloadFromQuickForm() {
    const ec = strVal(document.getElementById('dashQuickEC')?.value);
    const ph = strVal(document.getElementById('dashQuickPH')?.value);
    const temp = strVal(document.getElementById('dashQuickTemp')?.value);
    let vol = strVal(document.getElementById('dashQuickVol')?.value);
    const tempAire = numVal(document.getElementById('dashQuickTempAire')?.value);
    const humSala = numVal(document.getElementById('dashQuickHumSala')?.value);
    const co2 = numVal(document.getElementById('dashQuickCO2')?.value);
    const ppfd = numVal(document.getElementById('dashQuickPPFD')?.value);
    const notas = strVal(document.getElementById('dashQuickNotas')?.value);
    const vpd = calcVpdKpaLocal(tempAire, humSala);
    const fase =
      typeof getFaseCultivoActual === 'function'
        ? getFaseCultivoActual()
        : state.modo || '';

    if (!ec && !ph && !temp && !vol) {
      return null;
    }

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
    const salaOpen = document.getElementById('dashQuickSalaDetails');
    if (salaOpen && salaOpen.open) {
      ['dashQuickTempAire', 'dashQuickHumSala', 'dashQuickCO2', 'dashQuickPPFD'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    }
    if (hint) {
      const sala =
        payload.tempAire !== '' || payload.humSala !== '' || payload.co2 !== '' || payload.ppfd !== ''
          ? ' · sala incluida'
          : ' · solo depósito';
      hint.textContent = 'Guardado' + sala + '. Revisa «Qué añadir ahora» si hace falta corregir.';
      hint.classList.add('is-ok');
    }
    refreshDashOperativaHub();
  }

  function hcCopiarEnlaceQr() {
    const url = hcBuildDeepLinkUrl();
    const done = function () {
      if (typeof showToast === 'function') showToast('Enlace copiado');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(function () {
        if (typeof showToast === 'function') showToast(url, false, { durationMs: 6000 });
      });
      return;
    }
    if (typeof showToast === 'function') showToast(url, false, { durationMs: 6000 });
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

  function hcProcesarDeepLinkHash() {
    const raw = String(location.hash || '').replace(/^#/, '');
    if (!raw || raw.indexOf('hc=') !== 0) return;
    const spec = raw.slice(3);
    const parts = spec.split(':');
    if (parts[0] === 'i' && parts.length >= 2) {
      const idx = parseInt(parts[1], 10);
      if (Number.isFinite(idx) && typeof cambiarTorreActiva === 'function') {
        cambiarTorreActiva(idx);
        goTab('inicio');
        if (typeof showToast === 'function') showToast('Instalación abierta desde enlace');
      }
      return;
    }
    if (parts[0] === 'p' && parts.length >= 4) {
      const idx = parseInt(parts[1], 10);
      const n = parseInt(parts[2], 10);
      const c = parseInt(parts[3], 10);
      if (Number.isFinite(idx) && typeof cambiarTorreActiva === 'function') cambiarTorreActiva(idx);
      goTab('sistema');
      if (typeof showToast === 'function') {
        showToast('Instalación abierta · maceta N' + (n + 1) + ' C' + (c + 1));
      }
    }
  }

  window.refreshDashOperativaHub = refreshDashOperativaHub;
  window.hcGuardarMedicionRapida = hcGuardarMedicionRapida;
  window.hcCopiarEnlaceQr = hcCopiarEnlaceQr;
  window.hcGuardarRecargaReferencia = hcGuardarRecargaReferencia;
  window.hcProcesarDeepLinkHash = hcProcesarDeepLinkHash;
  window.hcBuildDeepLinkUrl = hcBuildDeepLinkUrl;

  document.addEventListener('DOMContentLoaded', function () {
    const quickEc = document.getElementById('dashQuickEC');
    if (quickEc) {
      quickEc.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        hcGuardarMedicionRapida();
      });
    }
  });
})();
