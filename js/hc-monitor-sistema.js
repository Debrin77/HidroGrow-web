/**
 * HidroGrow — control y monitorización diaria/semanal del sistema + tendencias.
 * Une PROTOCOLO_MEDICION, mediciones guardadas y calendario.
 */
(function () {
  var CONTROL_FASE = {
    esqueje: {
      diario: [
        { field: 'temp', label: 'Temp. agua depósito', rangeKey: 'tempAgua', unit: '°C', scroll: 'inputTemp' },
        { field: 'tempAire', label: 'Temp. aire sala', rangeKey: 'tempAire', unit: '°C', scroll: 'inputTempAire' },
        { field: 'humSala', label: 'Humedad relativa', rangeKey: 'hr', unit: '%', scroll: 'inputHumSala' },
        { field: 'vpd', label: 'VPD (calculado)', rangeKey: 'vpd', unit: ' kPa', scroll: 'inputHumSala' },
        { field: 'ec', label: 'EC depósito', dynamicEc: true, unit: ' µS', scroll: 'inputEC' },
        { field: 'ph', label: 'pH depósito', dynamicPh: true, unit: '', scroll: 'inputPH' },
      ],
      semanal: [
        { id: 'ppfd', label: 'PPFD / lux bajo foco', field: 'ppfd', altField: 'lux', scroll: 'inputPPFD' },
        { id: 'aireador', label: 'Revisar aireador / oxígeno', virtual: true },
      ],
    },
    vegetativo: {
      diario: [
        { field: 'ec', label: 'EC depósito', dynamicEc: true, unit: ' µS', scroll: 'inputEC' },
        { field: 'ph', label: 'pH depósito', dynamicPh: true, unit: '', scroll: 'inputPH' },
        { field: 'temp', label: 'Temp. agua', rangeKey: 'tempAgua', unit: '°C', scroll: 'inputTemp' },
        { field: 'tempAire', label: 'Temp. aire sala', rangeKey: 'tempAire', unit: '°C', scroll: 'inputTempAire' },
        { field: 'humSala', label: 'HR → VPD', rangeKey: 'hr', unit: '%', scroll: 'inputHumSala', extraField: 'vpd' },
        { field: 'vol', label: 'Volumen depósito', unit: ' L', scroll: 'inputVol' },
      ],
      semanal: [
        { id: 'ppfd', label: 'PPFD / lux dosel', field: 'ppfd', altField: 'lux', scroll: 'inputPPFD' },
        { id: 'extractor', label: 'Extractor y circulación', virtual: true },
        { id: 'calibracion', label: 'Calibrar medidor EC/pH', virtual: true },
      ],
    },
    prefloracion: {
      diario: [
        { field: 'ec', label: 'EC + pH', dynamicEc: true, dynamicPh: true, unit: '', scroll: 'inputEC' },
        { field: 'ph', label: 'pH', dynamicPh: true, hidden: true },
        { field: 'temp', label: 'Temp. agua (<22 °C)', rangeKey: 'tempAgua', unit: '°C', scroll: 'inputTemp' },
        { field: 'humSala', label: 'HR (bajar)', rangeKey: 'hr', unit: '%', scroll: 'inputHumSala' },
        { field: 'vpd', label: 'VPD', rangeKey: 'vpd', unit: ' kPa', scroll: 'inputHumSala' },
        { field: 'tempAire', label: 'Temp. aire', rangeKey: 'tempAire', unit: '°C', scroll: 'inputTempAire' },
      ],
      semanal: [
        { id: 'ppfd', label: 'PPFD en copa', field: 'ppfd', altField: 'lux', scroll: 'inputPPFD' },
        { id: 'led_altura', label: 'Revisar stretch / altura lámpara', virtual: true },
      ],
    },
    floracion: {
      diario: [
        { field: 'ec', label: 'EC depósito', dynamicEc: true, unit: ' µS', scroll: 'inputEC' },
        { field: 'ph', label: 'pH depósito', dynamicPh: true, unit: '', scroll: 'inputPH' },
        { field: 'temp', label: 'Temp. agua', rangeKey: 'tempAgua', unit: '°C', scroll: 'inputTemp' },
        { field: 'humSala', label: 'HR cogollos', rangeKey: 'hr', unit: '%', scroll: 'inputHumSala' },
        { field: 'vpd', label: 'VPD', rangeKey: 'vpd', unit: ' kPa', scroll: 'inputHumSala' },
        { field: 'tempAire', label: 'Temp. aire (noche)', rangeKey: 'tempAire', unit: '°C', scroll: 'inputTempAire' },
      ],
      semanal: [
        { id: 'ppfd', label: 'PPFD', field: 'ppfd', altField: 'lux', scroll: 'inputPPFD' },
        { id: 'extractor', label: 'Extractor + filtro carbón', virtual: true },
        { id: 'pythium', label: 'Revisar Pythium si T° agua >22 °C', virtual: true },
      ],
    },
  };

  function hoyLocal0() {
    var h = new Date();
    h.setHours(0, 0, 0, 0);
    return h;
  }

  function parseMedFecha(str) {
    if (!str) return null;
    try {
      var p = String(str).split('/');
      if (p.length >= 3) {
        var d = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
        d.setHours(0, 0, 0, 0);
        return Number.isFinite(d.getTime()) ? d : null;
      }
    } catch (_) {}
    return null;
  }

  function campoTieneValor(v) {
    if (v == null || v === '') return false;
    var s = String(v).trim();
    return s !== '' && s !== '—';
  }

  function getCamposRegistradosEnDia(fechaRef) {
    var target = fechaRef || hoyLocal0();
    var out = {};
    var meds = (typeof state !== 'undefined' && state && state.mediciones) ? state.mediciones : [];
    meds.forEach(function (m) {
      var d = parseMedFecha(m.fecha);
      if (!d || d.getTime() !== target.getTime()) return;
      ['ec', 'ph', 'temp', 'vol', 'tempAire', 'humSala', 'vpd', 'ppfd', 'lux', 'tempExt', 'co2'].forEach(function (k) {
        if (campoTieneValor(m[k])) out[k] = { valor: m[k], hora: m.hora || '' };
      });
    });
    var um = (typeof state !== 'undefined' && state && state.ultimaMedicion) ? state.ultimaMedicion : null;
    if (um && um.fecha) {
      var du = parseMedFecha(um.fecha);
      if (du && du.getTime() === target.getTime()) {
        ['ec', 'ph', 'temp', 'vol', 'tempAire', 'humSala', 'vpd', 'ppfd', 'lux', 'tempExt', 'co2'].forEach(function (k) {
          if (campoTieneValor(um[k]) && !out[k]) out[k] = { valor: um[k], hora: um.hora || '' };
        });
      }
    }
    return out;
  }

  function getWeekKey(d) {
    d = d || hoyLocal0();
    var dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    var day = (dt.getDay() + 6) % 7;
    dt.setDate(dt.getDate() - day);
    return dt.getFullYear() + '-W' + String(Math.ceil((dt - new Date(dt.getFullYear(), 0, 1)) / 604800000)).padStart(2, '0');
  }

  function ensureMonitorState(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    if (!cfg.monitorSemanal || typeof cfg.monitorSemanal !== 'object') cfg.monitorSemanal = {};
    return cfg.monitorSemanal;
  }

  function getDateKey(d) {
    d = d || hoyLocal0();
    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0')
    );
  }

  function ensureTareasHoyDay(cfg, dateKey) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    if (!cfg.tareasHoyPorDia || typeof cfg.tareasHoyPorDia !== 'object') cfg.tareasHoyPorDia = {};
    var key = dateKey || getDateKey();
    if (!cfg.tareasHoyPorDia[key] || typeof cfg.tareasHoyPorDia[key] !== 'object') {
      cfg.tareasHoyPorDia[key] = { done: {}, unchecked: {} };
    }
    if (!cfg.tareasHoyPorDia[key].done) cfg.tareasHoyPorDia[key].done = {};
    if (!cfg.tareasHoyPorDia[key].unchecked) cfg.tareasHoyPorDia[key].unchecked = {};
    return cfg.tareasHoyPorDia[key];
  }

  function semanalMarcadoEstaSemana(id, cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    var ms = ensureMonitorState(cfg);
    return ms[id] === getWeekKey();
  }

  function itemRegistradoHoy(item, campos, dayState, cfg) {
    var tid = item.id || item.field;
    if (dayState) {
      if (dayState.unchecked && dayState.unchecked[tid]) return false;
      if (dayState.done && dayState.done[tid]) return true;
    }
    if (item.virtual) return semanalMarcadoEstaSemana(item.id, cfg);
    if (item.extraField === 'vpd') {
      return campoTieneValor(campos.vpd) ||
        (campoTieneValor(campos.humSala) && campoTieneValor(campos.tempAire));
    }
    if (item.field && campoTieneValor(campos[item.field])) return true;
    if (item.altField && campoTieneValor(campos[item.altField])) return true;
    if (item.extraField && campoTieneValor(campos[item.extraField])) return true;
    if (item.dynamicEc && item.dynamicPh) {
      return campoTieneValor(campos.ec) && campoTieneValor(campos.ph);
    }
    if (item.field === 'ec' && item.dynamicPh && !item.hidden) {
      return campoTieneValor(campos.ec) && campoTieneValor(campos.ph);
    }
    return false;
  }

  function formatRango(item, rangos, recEcPh) {
    if (item.dynamicEc && item.dynamicPh) {
      if (recEcPh && recEcPh.ec && recEcPh.ph) {
        return 'EC ' + recEcPh.ec.min + '–' + recEcPh.ec.max + ' µS · pH ' + recEcPh.ph.min + '–' + recEcPh.ph.max;
      }
    }
    if (item.dynamicEc && recEcPh && recEcPh.ec) {
      return recEcPh.ec.min + '–' + recEcPh.ec.max + ' µS';
    }
    if (item.dynamicPh && recEcPh && recEcPh.ph) {
      return recEcPh.ph.min + '–' + recEcPh.ph.max;
    }
    if (item.rangeKey && rangos && rangos[item.rangeKey]) {
      var r = rangos[item.rangeKey];
      return r.min + '–' + r.max + (item.unit || '');
    }
    if (item.field === 'vol') return 'Litros actuales en depósito';
    return '';
  }

  function getValorMostrar(item, campos) {
    if (item.virtual) return semanalMarcadoEstaSemana(item.id) ? '✓ esta semana' : '';
    if (item.dynamicEc && item.dynamicPh && !item.hidden) {
      var ec = campos.ec ? campos.ec.valor : '';
      var ph = campos.ph ? campos.ph.valor : '';
      if (ec || ph) return (ec || '—') + ' µS · pH ' + (ph || '—');
      return '';
    }
    if (item.field && campos[item.field]) return String(campos[item.field].valor) + (item.unit || '');
    if (item.altField && campos[item.altField]) return String(campos[item.altField].valor);
    return '';
  }

  function getEstadoControlSistema(fechaRef) {
    var fase = typeof getFaseCultivoActual === 'function' ? getFaseCultivoActual() : 'vegetativo';
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    var plan = CONTROL_FASE[fase] || CONTROL_FASE.vegetativo;
    var rangos = typeof getRangosFaseAmbiente === 'function' ? getRangosFaseAmbiente(fase) : {};
    var recEcPh = typeof getRecomendacionEcPhTorre === 'function' ? getRecomendacionEcPhTorre() : null;
    var campos = getCamposRegistradosEnDia(fechaRef);
    var interior = String(cfg.ubicacion || cfg.premiumSetup?.entorno || 'interior').toLowerCase() !== 'exterior';
    var dayState = ensureTareasHoyDay(cfg, getDateKey(fechaRef || hoyLocal0()));

  function evalItemValor(item, campos) {
    if (!item.field || !campos[item.field]) return null;
    var raw = campos[item.field].valor;
    if (typeof evaluarParametro !== 'function') return null;
    var fase = typeof getFaseCultivoActual === 'function' ? getFaseCultivoActual() : 'vegetativo';
    return evaluarParametro(item.field, raw, { fase: fase });
  }

  function mapItems(list, freq, campos) {
      return (list || []).filter(function (it) { return !it.hidden; }).map(function (it) {
        var ok = itemRegistradoHoy(it, campos, dayState, cfg);
        var evalRes = it.field && !it.virtual ? evalItemValor(it, campos) : null;
        var evalEstado = evalRes ? evalRes.estado : null;
        if (evalEstado === 'bad' || evalEstado === 'warn') ok = false;
        return {
          id: it.id || it.field,
          label: it.label,
          freq: freq,
          ok: ok,
          virtual: !!it.virtual,
          scroll: it.scroll || '',
          rango: formatRango(it, rangos, recEcPh),
          valor: getValorMostrar(it, campos),
          hora: it.field && campos[it.field] ? campos[it.field].hora : '',
          evalEstado: evalEstado,
          evalMsg: evalRes ? evalRes.msg : '',
          solucionTexto: evalRes ? evalRes.solucionTexto : '',
        };
      });
    }

    var diario = mapItems(plan.diario, 'diario', campos);
    var semanal = mapItems(plan.semanal, 'semanal', campos);
    var okD = diario.filter(function (x) { return x.ok; }).length;
    var okS = semanal.filter(function (x) { return x.ok; }).length;

    return {
      fase: fase,
      interior: interior,
      diario: diario,
      semanal: semanal,
      campos: campos,
      rangos: rangos,
      recEcPh: recEcPh,
      resumen: {
        diarioOk: okD,
        diarioTotal: diario.length,
        semanalOk: okS,
        semanalTotal: semanal.length,
        pctDiario: diario.length ? Math.round((okD / diario.length) * 100) : 0,
      },
    };
  }

  function buildControlDiarioCalendarioTexto(estado) {
    estado = estado || getEstadoControlSistema();
    var proto = typeof PROTOCOLO_MEDICION !== 'undefined' ? PROTOCOLO_MEDICION[estado.fase] : null;
    var tituloFase = proto ? proto.titulo : estado.fase;
    var partes = [];
    estado.diario.forEach(function (it) {
      var mark = it.ok ? '✓' : '○';
      var det = it.rango ? ' (' + it.rango + ')' : '';
      partes.push(mark + ' ' + it.label + det);
    });
    var pend = estado.resumen.diarioTotal - estado.resumen.diarioOk;
    var pie = pend > 0
      ? ' Pendiente hoy: ' + pend + ' de ' + estado.resumen.diarioTotal + '. Registra en Medir.'
      : ' Rutina diaria completa. Semanal: ' + estado.resumen.semanalOk + '/' + estado.resumen.semanalTotal + '.';
    return tituloFase + ' · ' + (estado.interior ? 'Interior' : 'Exterior') + '. ' + partes.join(' · ') + '.' + pie;
  }

  function buildRecordatorioMedicionTexto(estado, medidoHoy, diasSinMedir) {
    estado = estado || getEstadoControlSistema();
    var pend = estado.resumen.diarioTotal - estado.resumen.diarioOk;
    if (medidoHoy && pend === 0) {
      var iotHint =
        typeof hcIotGetCalendarContext === 'function' && hcIotGetCalendarContext().linked
          ? ' Con gateway IoT, revisa que los autocompletados coinciden con tu medidor manual de vez en cuando.'
          : '';
      return 'Rutina diaria completa (' + estado.resumen.diarioTotal + '/' + estado.resumen.diarioTotal +
        '). Revisa tareas semanales si toca (PPFD, calibración, extractor).' + iotHint;
    }
    if (medidoHoy && pend > 0) {
      return 'Parcial hoy: ' + estado.resumen.diarioOk + '/' + estado.resumen.diarioTotal +
        '. Falta: ' + estado.diario.filter(function (x) { return !x.ok; }).map(function (x) { return x.label; }).join(', ') + '.';
    }
    if (diasSinMedir != null && diasSinMedir >= 2) {
      return 'Llevas ' + diasSinMedir + ' d sin registro. Hoy toca ' + estado.resumen.diarioTotal +
        ' parámetros (' + tituloFase(estado) + '): ' +
        estado.diario.map(function (x) { return x.label; }).join(', ') + '.';
    }
    return 'Registra la rutina de ' + tituloFase(estado) + ': ' +
      estado.diario.map(function (x) { return x.label; }).join(', ') + '.' +
      (typeof hcIotGetCalendarContext === 'function' && hcIotGetCalendarContext().linked
        ? ' El gateway puede autocompletar campos en Medir; confirma antes de guardar.'
        : '');
  }

  function tituloFase(estado) {
    var proto = typeof PROTOCOLO_MEDICION !== 'undefined' ? PROTOCOLO_MEDICION[estado.fase] : null;
    return proto ? proto.titulo : estado.fase;
  }

  function scrollToMonitorCampo(scrollId) {
    if (!scrollId) return;
    var node = document.getElementById(scrollId);
    if (!node) return;
    var card = node.closest('.param-card') || node.closest('.card');
    if (card && card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () { node.focus(); }, 350);
  }

  function toggleMonitorSemanal(id) {
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    var ms = ensureMonitorState(cfg);
    var wk = getWeekKey();
    if (ms[id] === wk) delete ms[id];
    else ms[id] = wk;
    if (typeof saveState === 'function') saveState();
    if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    renderMonitorSistemaPanel();
    if (typeof renderCalendario === 'function') renderCalendario();
    if (typeof showToast === 'function') {
      showToast(ms[id] ? '✓ Tarea semanal registrada' : 'Tarea semanal desmarcada');
    }
  }

  function escAttr(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function logTareaEnRegistro(label, freq, fase) {
    if (typeof addRegistro !== 'function') return;
    addRegistro(
      'tareas_dia',
      {
        icono: '✅',
        tareaLabel: label,
        tareaFreq: freq,
        faseCultivo: fase || '',
      },
      true
    );
  }

  function toggleTareaHoyFromBtn(btn) {
    if (!btn || !btn.dataset) return;
    toggleTareaHoy(btn.dataset.tareaId, btn.dataset.tareaLabel || '', btn.dataset.tareaFreq || 'diario');
  }

  function toggleTareaHoy(id, label, freq) {
    if (!id) return;
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    var day = ensureTareasHoyDay(cfg);
    var estado = getEstadoControlSistema();
    var item = (freq === 'semanal' ? estado.semanal : estado.diario).find(function (x) {
      return x.id === id;
    });
    var willCheck = !(item && item.ok);
    if (willCheck) {
      day.done[id] = new Date().toISOString();
      delete day.unchecked[id];
      if (freq === 'semanal') ensureMonitorState(cfg)[id] = getWeekKey();
      logTareaEnRegistro(label || id, freq, estado.fase);
      if (typeof showToast === 'function') showToast('✓ Tarea registrada: ' + (label || id));
    } else {
      delete day.done[id];
      day.unchecked[id] = true;
      if (freq === 'semanal') delete ensureMonitorState(cfg)[id];
      if (typeof showToast === 'function') showToast('Tarea desmarcada');
    }
    if (typeof saveState === 'function') saveState();
    if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    renderMonitorSistemaPanel();
    if (typeof refreshMedirTareasHoyBadge === 'function') refreshMedirTareasHoyBadge();
    if (typeof renderCalendario === 'function') renderCalendario();
    if (typeof renderRegistro === 'function') renderRegistro();
  }

  function renderChecklistHtml(items, freq) {
    if (!items.length) return '<p class="hc-monitor-empty">Sin ítems para esta fase.</p>';
    return (
      '<ul class="hc-monitor-list" role="list">' +
      items.map(function (it) {
        var cls = 'hc-monitor-item' + (it.ok ? ' hc-monitor-item--ok' : ' hc-monitor-item--pend');
        var btn =
          '<button type="button" class="hc-monitor-check' +
          (it.ok ? ' hc-monitor-check--ok' : '') +
          '" data-tarea-id="' +
          escAttr(it.id) +
          '" data-tarea-label="' +
          escAttr(it.label) +
          '" data-tarea-freq="' +
          escAttr(freq) +
          '" onclick="toggleTareaHoyFromBtn(this)" aria-pressed="' +
          (it.ok ? 'true' : 'false') +
          '" title="Marcar tarea">' +
          (it.ok ? '✓' : '○') +
          '</button>';
        var jump = it.scroll && !it.virtual
          ? ' <button type="button" class="hc-monitor-jump" onclick="scrollToMonitorCampo(\'' + it.scroll + '\')">Ir →</button>'
          : '';
        var val = it.valor ? ' <span class="hc-monitor-val">' + it.valor + (it.hora ? ' · ' + it.hora : '') + '</span>' : '';
        var rng = it.rango ? ' <span class="hc-monitor-rango">' + it.rango + '</span>' : '';
        var alert =
          it.evalEstado === 'bad' || it.evalEstado === 'warn'
            ? ' <span class="hc-monitor-alert hc-monitor-alert--' +
              it.evalEstado +
              '" title="' +
              (it.solucionTexto || it.evalMsg || '') +
              '">⚠</span>'
            : '';
        var sol =
          it.solucionTexto && (it.evalEstado === 'bad' || it.evalEstado === 'warn')
            ? ' <span class="hc-monitor-sol">' + it.solucionTexto + '</span>'
            : '';
        return (
          '<li class="' + cls + '" role="listitem">' + btn +
          '<span class="hc-monitor-label">' + it.label + val + rng + alert + sol + jump + '</span></li>'
        );
      }).join('') +
      '</ul>'
    );
  }

  function getTendenciasMediciones(limit) {
    limit = limit || 14;
    var meds = (typeof state !== 'undefined' && state && state.mediciones) ? state.mediciones : [];
    var rows = [];
    meds.forEach(function (m) {
      if (!m.fecha) return;
      var has = campoTieneValor(m.ec) || campoTieneValor(m.ph) || campoTieneValor(m.vpd) || campoTieneValor(m.temp);
      if (!has) return;
      rows.push({
        fecha: m.fecha,
        ec: parseFloat(String(m.ec || '').replace(',', '.')),
        ph: parseFloat(String(m.ph || '').replace(',', '.')),
        temp: parseFloat(String(m.temp || '').replace(',', '.')),
        vpd: parseFloat(String(m.vpd || '').replace(',', '.')),
        humSala: parseFloat(String(m.humSala || '').replace(',', '.')),
      });
    });
    rows.reverse();
    if (rows.length > limit) rows = rows.slice(rows.length - limit);
    return rows;
  }

  function sparklineSvg(values, opts) {
    opts = opts || {};
    var w = opts.width || 280;
    var h = opts.height || 56;
    var color = opts.color || '#059669';
    var nums = values.filter(function (v) { return Number.isFinite(v); });
    if (nums.length < 2) {
      return '<svg class="hc-spark" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h +
        '"><text x="8" y="' + (h / 2) + '" class="hc-spark-empty">Sin datos aún</text></svg>';
    }
    var min = Math.min.apply(null, nums);
    var max = Math.max.apply(null, nums);
    if (max === min) { max += 1; min -= 1; }
    var pts = [];
    values.forEach(function (v, i) {
      if (!Number.isFinite(v)) return;
      var x = (i / Math.max(1, values.length - 1)) * (w - 16) + 8;
      var y = h - 8 - ((v - min) / (max - min)) * (h - 16);
      pts.push(x.toFixed(1) + ',' + y.toFixed(1));
    });
    var last = nums[nums.length - 1];
    return (
      '<svg class="hc-spark" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + (opts.label || '') + '">' +
      '<polyline fill="none" stroke="' + color + '" stroke-width="2" points="' + pts.join(' ') + '"/>' +
      '<text x="' + (w - 8) + '" y="14" text-anchor="end" class="hc-spark-last">' + last + (opts.unit || '') + '</text></svg>'
    );
  }

  function renderTendenciasHtml() {
    var rows = getTendenciasMediciones(14);
    if (!rows.length) {
      return '<p class="hc-monitor-trend-empty">Guarda mediciones para ver tendencias EC, pH, VPD y temp. agua (últimas 14).</p>';
    }
    var ec = rows.map(function (r) { return r.ec; });
    var ph = rows.map(function (r) { return r.ph; });
    var vpd = rows.map(function (r) { return r.vpd; });
    var temp = rows.map(function (r) { return r.temp; });
    return (
      '<div class="hc-monitor-trends">' +
      '<div class="hc-monitor-trend-row"><span class="hc-monitor-trend-lbl">EC µS</span>' +
      sparklineSvg(ec, { color: '#2563eb', label: 'EC', unit: '' }) + '</div>' +
      '<div class="hc-monitor-trend-row"><span class="hc-monitor-trend-lbl">pH</span>' +
      sparklineSvg(ph, { color: '#7c3aed', label: 'pH', unit: '' }) + '</div>' +
      '<div class="hc-monitor-trend-row"><span class="hc-monitor-trend-lbl">VPD</span>' +
      sparklineSvg(vpd, { color: '#059669', label: 'VPD', unit: '' }) + '</div>' +
      '<div class="hc-monitor-trend-row"><span class="hc-monitor-trend-lbl">T° agua</span>' +
      sparklineSvg(temp, { color: '#0891b2', label: 'Temp agua', unit: '°C' }) + '</div>' +
      '<p class="hc-monitor-trend-foot">' + rows.length + ' registros · izquierda = más antiguo</p></div>'
    );
  }

  function renderMonitorSistemaPanel() {
    var card = document.getElementById('medirMonitorCard');
    var panel = document.getElementById('medirMonitorPanel');
    if (!card || !panel) return;
    var estado = getEstadoControlSistema();
    var r = estado.resumen;
    var barPct = r.diarioTotal ? r.pctDiario : 0;
    var barCls = barPct >= 100 ? ' hc-monitor-bar-fill--ok' : barPct >= 50 ? ' hc-monitor-bar-fill--mid' : '';
    var avisoInst = '';
    try {
      if (typeof getInstalacionLifecycle === 'function') {
        var lc = getInstalacionLifecycle();
        if (lc && !lc.operativaDiaria && lc.fase !== 'sin_config') {
          avisoInst =
            '<div class="hc-monitor-inst-aviso" role="status">' +
            '<strong>Instalación al ' + lc.porcentaje + '%.</strong> ' +
            'Completa primero: <em>' + (lc.siguientePaso && lc.siguientePaso.label ? lc.siguientePaso.label : 'pasos pendientes') + '</em>. ' +
            '<button type="button" class="btn btn-primary btn-sm hc-monitor-inst-cta" onclick="hcEjecutarAccionInstalacion(\'' +
            (lc.siguientePaso && lc.siguientePaso.action ? lc.siguientePaso.action : 'irMontaje') +
            '\')">Continuar</button></div>';
        }
      }
    } catch (_) {}
    panel.innerHTML =
      avisoInst +
      '<div class="hc-monitor-head">' +
      '<div class="hc-monitor-progress">' +
      '<div class="hc-monitor-bar"><div class="hc-monitor-bar-fill' + barCls + '" style="width:' + barPct + '%"></div></div>' +
      '<span class="hc-monitor-pct">' +
      r.diarioOk +
      '/' +
      r.diarioTotal +
      ' diarias · ' +
      r.semanalOk +
      '/' +
      r.semanalTotal +
      ' semanales</span></div>' +
      '<span class="hc-monitor-fase-badge">' +
      tituloFase(estado) +
      '</span></div>' +
      '<p class="hc-monitor-tareas-hint">Marca cada tarea al completarla. Las mediciones en Medir también marcan automáticamente EC, pH, etc. Todo queda en <strong>Registro</strong>, <strong>Calendario</strong> y avisos <strong>Meteo</strong>.</p>' +
      '<div class="hc-monitor-cols">' +
      '<div><h4 class="hc-monitor-sub">Cada día</h4>' +
      renderChecklistHtml(estado.diario, 'diario') +
      '</div>' +
      '<div><h4 class="hc-monitor-sub">Esta semana</h4>' +
      renderChecklistHtml(estado.semanal, 'semanal') +
      '</div></div>' +
      '<details class="hc-monitor-trends-wrap"><summary>Tendencias (14 últimas mediciones)</summary>' +
      renderTendenciasHtml() + '</details>' +
      '<p class="hc-monitor-foot"><button type="button" class="btn btn-ghost btn-sm" onclick="goTab(\'historial\')">Ver registro completo →</button></p>';
  }

  function markMonitorSemanalHecho(id) {
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg || !id) return;
    ensureMonitorState(cfg)[id] = getWeekKey();
    if (typeof saveState === 'function') saveState();
    if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    renderMonitorSistemaPanel();
  }

  function refreshMonitorLive() {
    if (document.getElementById('medirMonitorPanel')) renderMonitorSistemaPanel();
    if (typeof refreshMedirTareasHoyBadge === 'function') refreshMedirTareasHoyBadge();
  }

  function refreshMedirTareasHoyBadge() {
    var badge = document.getElementById('medirTareasHoyBadge');
    if (!badge) return;
    var estado = getEstadoControlSistema();
    var r = estado.resumen;
    var total = r.diarioTotal + r.semanalTotal;
    var ok = r.diarioOk + r.semanalOk;
    badge.textContent = ok + '/' + total;
    badge.classList.toggle('medir-tareas-badge--ok', total > 0 && ok >= total);
    badge.classList.toggle('medir-tareas-badge--mid', total > 0 && ok > 0 && ok < total);
    badge.classList.toggle('medir-tareas-badge--pend', total > 0 && ok === 0);
    try {
      if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
    } catch (_) {}
    try {
      if (typeof refreshMedirOperativaUi === 'function') refreshMedirOperativaUi();
    } catch (_) {}
  }

  window.getEstadoControlSistema = getEstadoControlSistema;
  window.getCamposRegistradosEnDia = getCamposRegistradosEnDia;
  window.buildControlDiarioCalendarioTexto = buildControlDiarioCalendarioTexto;
  window.buildRecordatorioMedicionTexto = buildRecordatorioMedicionTexto;
  window.renderMonitorSistemaPanel = renderMonitorSistemaPanel;
  window.refreshMonitorLive = refreshMonitorLive;
  window.scrollToMonitorCampo = scrollToMonitorCampo;
  window.toggleMonitorSemanal = toggleMonitorSemanal;
  window.toggleTareaHoy = toggleTareaHoy;
  window.toggleTareaHoyFromBtn = toggleTareaHoyFromBtn;
  window.refreshMedirTareasHoyBadge = refreshMedirTareasHoyBadge;
  window.markMonitorSemanalHecho = markMonitorSemanalHecho;
  window.getTendenciasMediciones = getTendenciasMediciones;
})();
