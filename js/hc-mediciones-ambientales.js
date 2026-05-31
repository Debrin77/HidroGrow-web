/**
 * HidroGrow — mediciones ambientales (VPD, HR, PPFD, temp aire/depósito/exterior)
 * y protocolo por fase para cannabis DWC/RDWC.
 */
(function () {
  const FASES = ['esqueje', 'vegetativo', 'prefloracion', 'floracion'];

  /** Rangos orientativos cannabis (interior; exterior usa meteo como ref.). */
  const AMBIENTE_RANGOS = {
    esqueje: {
      vpd: { min: 0.4, max: 0.8, warnLow: 0.3, warnHigh: 1.0 },
      hr: { min: 65, max: 85, warnLow: 55, warnHigh: 90 },
      tempAire: { min: 20, max: 26, warnLow: 18, warnHigh: 28 },
      tempAgua: { min: 18, max: 22, warnLow: 16, warnHigh: 24 },
      ppfd: { min: 100, max: 350, warnLow: 80, warnHigh: 450 },
      hrFlorMax: null,
    },
    vegetativo: {
      vpd: { min: 0.8, max: 1.2, warnLow: 0.6, warnHigh: 1.4 },
      hr: { min: 55, max: 70, warnLow: 45, warnHigh: 75 },
      tempAire: { min: 22, max: 28, warnLow: 18, warnHigh: 30 },
      tempAgua: { min: 18, max: 22, warnLow: 16, warnHigh: 24 },
      ppfd: { min: 400, max: 600, warnLow: 300, warnHigh: 750 },
      hrFlorMax: null,
    },
    prefloracion: {
      vpd: { min: 1.0, max: 1.3, warnLow: 0.8, warnHigh: 1.5 },
      hr: { min: 50, max: 60, warnLow: 42, warnHigh: 65 },
      tempAire: { min: 20, max: 26, warnLow: 18, warnHigh: 28 },
      tempAgua: { min: 18, max: 21, warnLow: 16, warnHigh: 23 },
      ppfd: { min: 550, max: 800, warnLow: 450, warnHigh: 900 },
      hrFlorMax: 55,
    },
    floracion: {
      vpd: { min: 1.0, max: 1.5, warnLow: 0.8, warnHigh: 1.7 },
      hr: { min: 40, max: 55, warnLow: 35, warnHigh: 60 },
      tempAire: { min: 20, max: 26, warnLow: 18, warnHigh: 28 },
      tempAgua: { min: 18, max: 21, warnLow: 16, warnHigh: 23 },
      ppfd: { min: 700, max: 1000, warnLow: 550, warnHigh: 1100 },
      hrFlorMax: 50,
    },
  };

  /** Protocolo de qué registrar y con qué frecuencia. */
  const PROTOCOLO_MEDICION = {
    esqueje: {
      titulo: 'Esqueje / plántula',
      diario: ['Temp agua depósito', 'Temp aire sala', 'HR %', 'VPD (calculado)', 'EC baja 400–700 µS', 'pH 5.5–6.0'],
      semanal: ['PPFD/lux bajo foco', 'Revisar aireador / oxígeno'],
      nota: 'HR alta (65–85%) y VPD bajo. Luz suave; no saturar raíces.',
    },
    vegetativo: {
      titulo: 'Vegetativo',
      diario: ['EC + pH depósito', 'Temp agua', 'Temp aire + HR → VPD', 'Volumen depósito'],
      semanal: ['PPFD / W/m² dosel', 'Extractor y circulación', 'Calibrar medidor EC/pH'],
      nota: 'VPD objetivo 0.8–1.2 kPa · 18/6 · subir EC de forma gradual.',
    },
    prefloracion: {
      titulo: 'Prefloración',
      diario: ['EC + pH', 'Temp agua (<22 °C)', 'VPD + HR (bajar HR)', 'Temp aire'],
      semanal: ['PPFD en copa', 'Revisar stretch / altura lámpara'],
      nota: 'Transición 12/12 · vigilar estiramiento · HR ≤55%.',
    },
    floracion: {
      titulo: 'Floración',
      diario: ['EC + pH', 'Temp agua', 'HR cogollos ≤50%', 'VPD 1.0–1.5 kPa', 'Temp aire noche'],
      semanal: ['PPFD', 'Extractor + filtro carbón', 'Revisar Pythium si T° agua >22 °C'],
      nota: 'Cogollos densos: priorizar flujo de aire y deshumidificar si HR >50%.',
    },
  };

  function el(id) {
    return document.getElementById(id);
  }

  function numRaw(id) {
    const raw = String(el(id)?.value || '').trim().replace(',', '.');
    if (!raw) return NaN;
    const n = Number(raw);
    return Number.isFinite(n) ? n : NaN;
  }

  function calcVPDkPa(tempC, rhPct) {
    if (typeof riegoVPDkPa === 'function') return riegoVPDkPa(tempC, rhPct);
    const T = Math.max(-5, Math.min(50, Number(tempC) || 0));
    const rh = Math.max(5, Math.min(100, Number(rhPct) || 50));
    const es = 0.6108 * Math.exp((17.27 * T) / (T + 237.3));
    return Math.round(es * (1 - rh / 100) * 1000) / 1000;
  }

  function luxToPpfdApprox(lux) {
    const L = Number(lux);
    if (!Number.isFinite(L) || L <= 0) return NaN;
    return Math.round(L / 54.4);
  }

  function getFaseCultivoActual() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const prem = cfg.premiumSetup || {};
    const f = String(
      prem.faseSala || cfg.growRoomFase || cfg.faseCultivoAmbiental || 'vegetativo'
    ).toLowerCase();
    if (FASES.indexOf(f) >= 0) return f;
    if (f.indexOf('flor') >= 0) return 'floracion';
    if (f.indexOf('preflor') >= 0 || f.indexOf('pre_flor') >= 0) return 'prefloracion';
    if (f.indexOf('esquej') >= 0 || f.indexOf('plant') >= 0) return 'esqueje';
    return 'vegetativo';
  }

  function getRangosFase(fase) {
    const base = AMBIENTE_RANGOS[fase] || AMBIENTE_RANGOS.vegetativo;
    const out = JSON.parse(JSON.stringify(base));
    try {
      let cu = null;
      const tor = (typeof state !== 'undefined' && state && state.torre) ? state.torre : [];
      for (let n = 0; n < tor.length && !cu; n++) {
        (tor[n] || []).forEach(function (c) {
          if (c && c.variedad && typeof getCultivoDB === 'function') cu = getCultivoDB(c.variedad);
        });
      }
      if (cu && typeof getGeneticsPremiumProfile === 'function') {
        const gp = getGeneticsPremiumProfile(cu);
        if (Number.isFinite(gp.ppfdFlorMin) && (fase === 'floracion' || fase === 'prefloracion')) {
          out.ppfd.min = Math.max(out.ppfd.min, gp.ppfdFlorMin - 50);
          out.ppfd.max = Math.max(out.ppfd.max, gp.ppfdFlorMin + 200);
        }
        if (Number.isFinite(gp.humedadFlorMax) && (fase === 'floracion' || fase === 'prefloracion')) {
          out.hrFlorMax = gp.humedadFlorMax;
          out.hr.max = Math.min(out.hr.max, gp.humedadFlorMax + 5);
        }
      }
    } catch (_) {}
    return out;
  }

  function getRangosFaseAmbiente(fase) {
    return getRangosFase(fase);
  }

  function esInteriorActivo() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const u = String(cfg.ubicacion || cfg.premiumSetup?.entorno || 'interior').toLowerCase();
    return u !== 'exterior';
  }

  function actualizarVPDEnUI() {
    const t = numRaw('inputTempAire');
    const h = numRaw('inputHumSala');
    const vpdEl = el('inputVPD');
    if (!vpdEl) return NaN;
    if (!Number.isFinite(t) || !Number.isFinite(h)) {
      vpdEl.value = '';
      return NaN;
    }
    const v = calcVPDkPa(t, h);
    vpdEl.value = String(v);
    return v;
  }

  function syncLuxPpfd(source) {
    const ppfdEl = el('inputPPFD');
    const luxEl = el('inputLux');
    if (!ppfdEl || !luxEl) return;
    if (source === 'lux') {
      const ppfd = luxToPpfdApprox(numRaw('inputLux'));
      if (Number.isFinite(ppfd)) ppfdEl.value = String(ppfd);
    } else if (source === 'ppfd') {
      const ppfd = numRaw('inputPPFD');
      if (Number.isFinite(ppfd)) luxEl.value = String(Math.round(ppfd * 54.4));
    }
  }

  function collectAmbienteMedicion() {
    actualizarVPDEnUI();
    const ppfd = numRaw('inputPPFD');
    const lux = numRaw('inputLux');
    return {
      tempAire: numRaw('inputTempAire'),
      humSala: numRaw('inputHumSala'),
      vpd: numRaw('inputVPD'),
      ppfd: Number.isFinite(ppfd) ? ppfd : luxToPpfdApprox(lux),
      lux: numRaw('inputLux'),
      tempExt: numRaw('inputTempExt'),
      fase: getFaseCultivoActual(),
    };
  }

  function setAmbStatus(id, tipo, icono, texto) {
    if (typeof setStatus === 'function') {
      setStatus(id, tipo, icono, texto);
      return;
    }
    const node = el(id);
    if (!node) return;
    node.className = 'param-status ' + (tipo || 'empty');
    node.innerHTML = icono ? '<span>' + icono + '</span><span>' + texto + '</span>' : '';
  }

  function showAmbCorreccion(id, html) {
    if (typeof showCorreccion === 'function') showCorreccion(id, html);
    else {
      const node = el(id);
      if (!node) return;
      if (html) {
        node.classList.add('show');
        node.innerHTML = html;
      } else {
        node.classList.remove('show');
        node.innerHTML = '';
      }
    }
  }

  function evalRangoSimple(val, rango, label, unit) {
    if (!Number.isFinite(val)) return { estado: 'empty', msg: '' };
    if (val >= rango.min && val <= rango.max) {
      return { estado: 'ok', msg: label + ' en rango (' + rango.min + '–' + rango.max + unit + ')' };
    }
    if (val < rango.warnLow || val > rango.warnHigh) {
      return { estado: 'bad', msg: label + ' fuera de margen seguro (' + val + unit + ')' };
    }
    return { estado: 'warn', msg: label + ' ligeramente fuera (' + val + unit + ')' };
  }

  function correccionVPD(vpd, rango, hr, tempAire) {
    const humEquip = typeof getCorreccionEquipamientoSugerido === 'function' ? getCorreccionEquipamientoSugerido('humidificar') : '';
    const deshEquip = typeof getCorreccionEquipamientoSugerido === 'function' ? getCorreccionEquipamientoSugerido('deshumidificar') : '';
    const extEquip = typeof getCorreccionEquipamientoSugerido === 'function' ? getCorreccionEquipamientoSugerido('extractor') : '';
    if (vpd > rango.max) {
      return (
        '<div class="correccion-title">💧 VPD alto (' + vpd + ' kPa)</div>' +
        '<div class="correccion-item"><span>Subir humedad</span><span class="correccion-valor">' +
        (humEquip || 'Humidificador / bandeja agua') + '</span></div>' +
        '<div class="correccion-item"><span>Bajar extracción</span><span class="correccion-valor">' +
        (extEquip ? extEquip + ' · menos rpm' : 'Menos renovaciones/h') + '</span></div>' +
        (Number.isFinite(tempAire) && tempAire > 26
          ? '<div class="correccion-item"><span>Enfriar sala</span><span class="correccion-valor">AC / extraer aire caliente</span></div>'
          : '') +
        '<div class="correccion-muted">Objetivo fase: ' + rango.min + '–' + rango.max + ' kPa</div>'
      );
    }
    if (vpd < rango.min) {
      return (
        '<div class="correccion-title">🌫️ VPD bajo (' + vpd + ' kPa)</div>' +
        '<div class="correccion-item"><span>Más extracción</span><span class="correccion-valor">' +
        (extEquip ? extEquip + ' · subir rpm' : 'Subir m³/h extractor') + '</span></div>' +
        '<div class="correccion-item"><span>Deshumidificar</span><span class="correccion-valor">' +
        (deshEquip || 'HR actual ~' + (hr || '—') + '%') + '</span></div>' +
        '<div class="correccion-item"><span>Circulación</span><span class="correccion-valor">Clip fan bajo copa</span></div>' +
        '<div class="correccion-muted">HR muy alta en floración → riesgo de moho en cogollos.</div>'
      );
    }
    return '';
  }

  function correccionPPFD(ppfd, rango) {
    if (!Number.isFinite(ppfd)) return '';
    const ledEquip = typeof getCorreccionEquipamientoSugerido === 'function' ? getCorreccionEquipamientoSugerido('led') : '';
    if (ppfd < rango.min) {
      return (
        '<div class="correccion-title">💡 PPFD bajo (' + ppfd + ' µmol/m²/s)</div>' +
        '<div class="correccion-item"><span>Acercar LED</span><span class="correccion-valor">' +
        (ledEquip || 'Objetivo ' + rango.min + '–' + rango.max) + '</span></div>' +
        '<div class="correccion-item"><span>Potencia</span><span class="correccion-valor">Revisar % dimmer / W totales</span></div>'
      );
    }
    if (ppfd > rango.max) {
      return (
        '<div class="correccion-title">🔆 PPFD alto (' + ppfd + ' µmol/m²/s)</div>' +
        '<div class="correccion-item"><span>Subir lámpara</span><span class="correccion-valor">Evitar quemaduras / estrés</span></div>' +
        '<div class="correccion-item"><span>Reducir intensidad</span><span class="correccion-valor">Bajar % o horas pico</span></div>'
      );
    }
    return '';
  }

  function evalAmbiente() {
    const fase = getFaseCultivoActual();
    const rangos = getRangosFase(fase);
    const interior = esInteriorActivo();
    const amb = collectAmbienteMedicion();
    const tempAgua = numRaw('inputTemp');

    if (Number.isFinite(amb.tempAire)) {
      const ev = evalRangoSimple(amb.tempAire, rangos.tempAire, 'Temp. aire', ' °C');
      setAmbStatus('statusTempAire', ev.estado, ev.estado === 'ok' ? '✅' : ev.estado === 'bad' ? '🔴' : ev.estado === 'warn' ? '🟡' : '', ev.msg);
      if (ev.estado === 'bad' || ev.estado === 'warn') {
        const html =
          amb.tempAire > rangos.tempAire.max
            ? '<div class="correccion-title">🌡️ Sala caliente</div><div class="correccion-muted">Extrae aire caliente arriba, revisa LED/calor, AC o cultivo nocturno si es verano.</div>'
            : '<div class="correccion-title">🌡️ Sala fría</div><div class="correccion-muted">Calienta ambiente; raíces en DWC no deben bajar de 18 °C en agua.</div>';
        showAmbCorreccion('correccionTempAire', html);
      } else showAmbCorreccion('correccionTempAire', '');
    } else {
      setAmbStatus('statusTempAire', 'empty', '', '');
      showAmbCorreccion('correccionTempAire', '');
    }

    if (Number.isFinite(amb.humSala)) {
      let hrRango = Object.assign({}, rangos.hr);
      if (rangos.hrFlorMax && (fase === 'floracion' || fase === 'prefloracion')) {
        hrRango.max = Math.min(hrRango.max, rangos.hrFlorMax);
      }
      const ev = evalRangoSimple(amb.humSala, hrRango, 'HR sala', '%');
      setAmbStatus('statusHumSala', ev.estado, ev.estado === 'ok' ? '✅' : ev.estado === 'bad' ? '🔴' : ev.estado === 'warn' ? '🟡' : '', ev.msg);
      if (ev.estado !== 'ok' && ev.estado !== 'empty') {
        showAmbCorreccion('correccionHumSala',
          amb.humSala > hrRango.max
            ? '<div class="correccion-title">💦 HR alta</div><div class="correccion-muted">Extractor + deshumidificador; circulación bajo cogollos; en floración mantener ≤' + (rangos.hrFlorMax || 55) + '%.</div>'
            : '<div class="correccion-title">🏜️ HR baja</div><div class="correccion-muted">Humidificador o bandeja agua; VPD subirá si no compensas.</div>');
      } else showAmbCorreccion('correccionHumSala', '');
    } else {
      setAmbStatus('statusHumSala', 'empty', '', '');
      showAmbCorreccion('correccionHumSala', '');
    }

    if (Number.isFinite(amb.vpd)) {
      const ev = evalRangoSimple(amb.vpd, rangos.vpd, 'VPD', ' kPa');
      setAmbStatus('statusVPD', ev.estado, ev.estado === 'ok' ? '✅' : ev.estado === 'bad' ? '🔴' : ev.estado === 'warn' ? '🟡' : '', ev.msg);
      showAmbCorreccion('correccionVPD', ev.estado === 'ok' || ev.estado === 'empty' ? '' : correccionVPD(amb.vpd, rangos.vpd, amb.humSala, amb.tempAire));
    } else if (Number.isFinite(amb.tempAire) && Number.isFinite(amb.humSala)) {
      setAmbStatus('statusVPD', 'empty', '', 'VPD calculado: ' + calcVPDkPa(amb.tempAire, amb.humSala) + ' kPa');
      showAmbCorreccion('correccionVPD', '');
    } else {
      setAmbStatus('statusVPD', 'empty', '', interior ? 'Indica temp. aire y HR para VPD' : 'Opcional en exterior');
      showAmbCorreccion('correccionVPD', '');
    }

    if (Number.isFinite(amb.ppfd)) {
      const ev = evalRangoSimple(amb.ppfd, rangos.ppfd, 'PPFD', ' µmol/m²/s');
      setAmbStatus('statusPPFD', ev.estado, ev.estado === 'ok' ? '✅' : ev.estado === 'bad' ? '🔴' : ev.estado === 'warn' ? '🟡' : '', ev.msg);
      showAmbCorreccion('correccionPPFD', ev.estado === 'ok' || ev.estado === 'empty' ? '' : correccionPPFD(amb.ppfd, rangos.ppfd));
    } else {
      setAmbStatus('statusPPFD', 'empty', '', 'PPFD semanal recomendado');
      showAmbCorreccion('correccionPPFD', '');
    }

    if (!interior && Number.isFinite(amb.tempExt)) {
      const rExt = { min: 15, max: 32, warnLow: 10, warnHigh: 38 };
      const ev = evalRangoSimple(amb.tempExt, rExt, 'Temp. exterior', ' °C');
      setAmbStatus('statusTempExt', ev.estado, ev.estado === 'ok' ? '✅' : '🟡', ev.msg);
      if (amb.tempExt > 32) {
        showAmbCorreccion('correccionTempExt', '<div class="correccion-title">☀️ Calor exterior</div><div class="correccion-muted">Sombrear depósito, subir aireador, vigilar temp. agua y Pythium.</div>');
      } else showAmbCorreccion('correccionTempExt', '');
    } else {
      setAmbStatus('statusTempExt', 'empty', '', '');
      showAmbCorreccion('correccionTempExt', '');
    }

    const rangeEl = el('paramRangeVPD');
    if (rangeEl) rangeEl.textContent = rangos.vpd.min + ' – ' + rangos.vpd.max + ' kPa (' + fase + ')';
    const ppfdRange = el('paramRangePPFD');
    if (ppfdRange) ppfdRange.textContent = rangos.ppfd.min + ' – ' + rangos.ppfd.max + ' µmol/m²/s';
  }

  function renderProtocoloMedicionPanel() {
    const host = el('medirProtocoloPanel');
    if (!host) return;
    const fase = getFaseCultivoActual();
    const proto = PROTOCOLO_MEDICION[fase] || PROTOCOLO_MEDICION.vegetativo;
    const rangos = getRangosFase(fase);
    const interior = esInteriorActivo();
    host.innerHTML =
      '<div class="medir-protocolo-head">' +
      '<span class="medir-protocolo-fase">' + proto.titulo + '</span>' +
      '<span class="medir-protocolo-badge">' + (interior ? 'Interior' : 'Exterior') + '</span></div>' +
      '<p class="medir-protocolo-nota">' + proto.nota + '</p>' +
      '<div class="medir-protocolo-cols">' +
      '<div><strong>Cada día</strong><ul>' + proto.diario.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' +
      '<div><strong>Semanal</strong><ul>' + proto.semanal.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div></div>' +
      '<div class="medir-protocolo-rangos">VPD ' + rangos.vpd.min + '–' + rangos.vpd.max + ' kPa · HR ' + rangos.hr.min + '–' + rangos.hr.max + '% · Agua ' + rangos.tempAgua.min + '–' + rangos.tempAgua.max + ' °C · PPFD ' + rangos.ppfd.min + '–' + rangos.ppfd.max + '</div>';
  }

  function cargarAmbienteDesdeUltimaMedicion() {
    const m = (typeof state !== 'undefined' && state && state.ultimaMedicion) ? state.ultimaMedicion : null;
    if (!m) return;
    const set = function (id, v) {
      const e = el(id);
      if (e && v != null && v !== '' && Number.isFinite(Number(v))) e.value = String(v);
    };
    set('inputTempAire', m.tempAire);
    set('inputHumSala', m.humSala);
    set('inputVPD', m.vpd);
    set('inputPPFD', m.ppfd);
    set('inputLux', m.lux);
    set('inputTempExt', m.tempExt);
    actualizarVPDEnUI();
    evalAmbiente();
  }

  function ambienteAlertasTexto(amb) {
    const alertas = [];
    if (!amb) return '';
    const fase = amb.fase || getFaseCultivoActual();
    const r = getRangosFase(fase);
    if (Number.isFinite(amb.vpd)) {
      if (amb.vpd < r.vpd.min) alertas.push('VPD bajo ' + amb.vpd + ' kPa');
      else if (amb.vpd > r.vpd.max) alertas.push('VPD alto ' + amb.vpd + ' kPa');
    }
    if (Number.isFinite(amb.humSala) && amb.humSala > (r.hrFlorMax || r.hr.max)) {
      alertas.push('HR ' + amb.humSala + '% alta para ' + fase);
    }
    if (Number.isFinite(amb.ppfd)) {
      if (amb.ppfd < r.ppfd.min) alertas.push('PPFD bajo');
      else if (amb.ppfd > r.ppfd.max) alertas.push('PPFD alto');
    }
    return alertas.join(' | ');
  }

  window.calcVPDkPa = calcVPDkPa;
  window.getFaseCultivoActual = getFaseCultivoActual;
  window.getRangosFaseAmbiente = getRangosFaseAmbiente;
  window.evalAmbiente = evalAmbiente;
  window.actualizarVPDEnUI = actualizarVPDEnUI;
  window.syncLuxPpfd = syncLuxPpfd;
  window.collectAmbienteMedicion = collectAmbienteMedicion;
  window.renderProtocoloMedicionPanel = renderProtocoloMedicionPanel;
  window.cargarAmbienteDesdeUltimaMedicion = cargarAmbienteDesdeUltimaMedicion;
  window.ambienteAlertasTexto = ambienteAlertasTexto;
  window.PROTOCOLO_MEDICION = PROTOCOLO_MEDICION;

  function syncWizardAmbienteFromWiz() {
    const map = [
      ['wizTempAire', 'inputTempAire'],
      ['wizHumSala', 'inputHumSala'],
      ['wizPPFD', 'inputPPFD'],
    ];
    map.forEach(function (pair) {
      const src = el(pair[0]);
      const dst = el(pair[1]);
      if (src && dst) dst.value = src.value;
    });
    if (typeof actualizarVPDEnUI === 'function') actualizarVPDEnUI();
    if (typeof evalAmbiente === 'function') evalAmbiente();
  }

  function syncWizFromAmbienteInputs() {
    const map = [
      ['wizTempAire', 'inputTempAire'],
      ['wizHumSala', 'inputHumSala'],
      ['wizPPFD', 'inputPPFD'],
    ];
    map.forEach(function (pair) {
      const dst = el(pair[0]);
      const src = el(pair[1]);
      if (src && dst && src.value) dst.value = src.value;
    });
  }

  window.syncWizardAmbienteFromWiz = syncWizardAmbienteFromWiz;
  window.syncWizFromAmbienteInputs = syncWizFromAmbienteInputs;
})();
