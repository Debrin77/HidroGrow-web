/**
 * HidroGrow — motor único de evaluación de parámetros (rangos + soluciones).
 * Usado por Medir (guardar), monitor, wizard y alertas externas.
 */
(function (global) {
  'use strict';

  var PARAM_META = {
    ec: { label: 'EC', unit: ' µS/cm', field: 'ec' },
    ph: { label: 'pH', unit: '', field: 'ph' },
    temp: { label: 'Temp. agua', unit: ' °C', field: 'temp' },
    vol: { label: 'Volumen', unit: ' L', field: 'vol' },
    tempAire: { label: 'Temp. aire', unit: ' °C', field: 'tempAire' },
    humSala: { label: 'HR sala', unit: '%', field: 'humSala' },
    vpd: { label: 'VPD', unit: ' kPa', field: 'vpd' },
    ppfd: { label: 'PPFD', unit: ' µmol/m²/s', field: 'ppfd' },
    lux: { label: 'Lux', unit: ' lx', field: 'lux' },
    tempExt: { label: 'Temp. exterior', unit: ' °C', field: 'tempExt' },
    co2: { label: 'CO₂', unit: ' ppm', field: 'co2' },
  };

  function num(v) {
    if (v == null || v === '') return NaN;
    var n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  }

  function getFase(ctx) {
    if (ctx && ctx.fase) return ctx.fase;
    return typeof getFaseCultivoActual === 'function' ? getFaseCultivoActual() : 'vegetativo';
  }

  function getRangos(ctx) {
    var fase = getFase(ctx);
    return typeof getRangosFaseAmbiente === 'function' ? getRangosFaseAmbiente(fase) : {};
  }

  function evalRango(val, rango, label, unit) {
    if (!Number.isFinite(val)) return { estado: 'empty', msg: '', solucionTexto: '', solucionHtml: '' };
    if (!rango || !Number.isFinite(rango.min)) {
      return { estado: 'ok', msg: label + ': ' + val + unit, solucionTexto: '', solucionHtml: '' };
    }
    if (val >= rango.min && val <= rango.max) {
      return {
        estado: 'ok',
        msg: label + ' en rango (' + rango.min + '–' + rango.max + unit + ')',
        solucionTexto: '',
        solucionHtml: '',
      };
    }
    var warnLow = Number.isFinite(rango.warnLow) ? rango.warnLow : rango.min - (rango.max - rango.min) * 0.15;
    var warnHigh = Number.isFinite(rango.warnHigh) ? rango.warnHigh : rango.max + (rango.max - rango.min) * 0.15;
    var bad = val < warnLow || val > warnHigh;
    return {
      estado: bad ? 'bad' : 'warn',
      msg: label + ' fuera de rango (' + val + unit + ', objetivo ' + rango.min + '–' + rango.max + unit + ')',
      solucionTexto: '',
      solucionHtml: '',
    };
  }

  function equipHint(tipo) {
    return typeof getCorreccionEquipamientoSugerido === 'function'
      ? getCorreccionEquipamientoSugerido(tipo)
      : '';
  }

  function evalEC(val, ctx) {
    var meta = PARAM_META.ec;
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    var recEcPh =
      typeof getRecomendacionEcPhTorre === 'function' ? getRecomendacionEcPhTorre() : null;
    var ecOpt =
      typeof getECOptimaTorre === 'function' ? getECOptimaTorre() : { min: 800, max: 1400 };
    if (recEcPh && recEcPh.esquejesOverlay && recEcPh.esquejesOverlay.activo) {
      ecOpt = { min: recEcPh.esquejesOverlay.ec.min, max: recEcPh.esquejesOverlay.ec.max };
    }
    var mObj = cfg.checklistEcObjetivoUs;
    if (Number.isFinite(mObj) && mObj >= 200 && mObj <= 6000) {
      var tol =
        typeof EC_MEDICION_TOLERANCIA_OBJETIVO_US !== 'undefined'
          ? EC_MEDICION_TOLERANCIA_OBJETIVO_US
          : 150;
      ecOpt = { min: mObj - tol, max: mObj + tol };
    }
    var r = { min: ecOpt.min, max: ecOpt.max, warnLow: ecOpt.min - 100, warnHigh: ecOpt.max + 150 };
    var ev = evalRango(val, r, meta.label, meta.unit);
    if (ev.estado !== 'ok' && ev.estado !== 'empty') {
      if (val < r.min) {
        ev.solucionTexto = 'Subir EC: añadir nutriente según dosis del depósito.';
        ev.solucionHtml =
          '<div class="correccion-title">📈 EC baja</div><div class="correccion-muted">Ajusta A/B/C según checklist. Objetivo ' +
          ecOpt.min +
          '–' +
          ecOpt.max +
          ' µS/cm.</div>';
      } else {
        ev.solucionTexto = 'Bajar EC: diluir con agua osmosis/destilada.';
        ev.solucionHtml =
          '<div class="correccion-title">📉 EC alta</div><div class="correccion-muted">Diluye la mezcla o prepara recarga parcial.</div>';
      }
    }
    return Object.assign({ id: 'ec', valor: val }, ev);
  }

  function evalPH(val, ctx) {
    var phOpt = typeof getPhOptimaTorre === 'function' ? getPhOptimaTorre() : { min: 5.8, max: 6.2 };
    var r = {
      min: phOpt.min,
      max: phOpt.max,
      warnLow: phOpt.min - 0.25,
      warnHigh: phOpt.max + 0.25,
    };
    var ev = evalRango(val, r, 'pH', '');
    if (ev.estado !== 'ok' && ev.estado !== 'empty') {
      ev.solucionTexto =
        val < r.min
          ? 'Subir pH con pH+ (hidróxido de potasio) en pequeñas dosis.'
          : 'Bajar pH con pH− (ácido nítrico/fosfórico) en pequeñas dosis.';
      ev.solucionHtml =
        '<div class="correccion-title">⚗️ pH fuera de rango</div><div class="correccion-muted">' +
        ev.solucionTexto +
        ' Espera 15 min tras buffer y vuelve a medir.</div>';
    }
    return Object.assign({ id: 'ph', valor: val }, ev);
  }

  function evalTempAgua(val, ctx) {
    var fase = getFase(ctx);
    var rangos = getRangos(ctx);
    var r = rangos.tempAgua || { min: 18, max: 22, warnLow: 16, warnHigh: 24 };
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    var esKratky = typeof esDwcKratky === 'function' && esDwcKratky(cfg);
    if (esKratky) r = { min: 17, max: 21, warnLow: 14, warnHigh: 24 };
    var ev = evalRango(val, r, 'Temp. agua', ' °C');
    if (ev.estado !== 'ok' && ev.estado !== 'empty') {
      ev.solucionTexto =
        val < r.min
          ? 'Calentar solución (calentador depósito o ambiente).'
          : 'Enfriar depósito (sombra, hielo, bajar temp. sala).';
      ev.solucionHtml =
        '<div class="correccion-title">🌡️ Temp. agua</div><div class="correccion-muted">' +
        ev.solucionTexto +
        ' Objetivo fase ' +
        fase +
        ': ' +
        r.min +
        '–' +
        r.max +
        ' °C.</div>';
    }
    return Object.assign({ id: 'temp', valor: val }, ev);
  }

  function evalVol(val, ctx) {
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    var volTarget =
      typeof getVolumenMezclaLitros === 'function' ? getVolumenMezclaLitros(cfg) : NaN;
    if (!Number.isFinite(volTarget) || volTarget <= 0) {
      volTarget =
        typeof getVolumenDepositoMaxLitros === 'function' ? getVolumenDepositoMaxLitros(cfg) : NaN;
    }
    if (!Number.isFinite(val)) {
      return { id: 'vol', valor: val, estado: 'empty', msg: '', solucionTexto: '', solucionHtml: '' };
    }
    if (!Number.isFinite(volTarget) || volTarget <= 0) {
      return {
        id: 'vol',
        valor: val,
        estado: 'empty',
        msg: '',
        solucionTexto: '',
        solucionHtml: '',
      };
    }
    var umbralOk = Math.max(4, volTarget * 0.93);
    var umbralCrit = Math.max(2.5, volTarget * 0.68);
    if (val >= umbralOk) {
      return {
        id: 'vol',
        valor: val,
        estado: 'ok',
        msg: 'Volumen OK (~' + Math.round(volTarget) + ' L objetivo)',
        solucionTexto: '',
        solucionHtml: '',
      };
    }
    var litros = Math.max(0, Math.ceil((volTarget - val) * 10) / 10);
    var bad = val < umbralCrit;
    return {
      id: 'vol',
      valor: val,
      estado: bad ? 'bad' : 'warn',
      msg: 'Volumen bajo (' + val + ' L · objetivo ~' + Math.round(volTarget) + ' L)',
      solucionTexto: 'Añadir ~' + litros + ' L de agua/mezcla.',
      solucionHtml:
        '<div class="correccion-title">💧 Volumen bajo</div><div class="correccion-muted">Añade ~' +
        litros +
        ' L. Mide EC/pH tras reponer.</div>',
    };
  }

  function evalTempAire(val, ctx) {
    var r = getRangos(ctx).tempAire;
    var ev = evalRango(val, r, 'Temp. aire', ' °C');
    if (ev.estado !== 'ok' && ev.estado !== 'empty') {
      ev.solucionTexto =
        val > (r && r.max ? r.max : 26)
          ? 'Enfriar sala: extractor, AC, subir LED.'
          : 'Calentar ambiente; vigilar temp. agua ≥18 °C.';
      ev.solucionHtml =
        '<div class="correccion-title">🌡️ Temp. aire</div><div class="correccion-muted">' +
        ev.solucionTexto +
        '</div>';
    }
    return Object.assign({ id: 'tempAire', valor: val }, ev);
  }

  function evalHumSala(val, ctx) {
    var fase = getFase(ctx);
    var rangos = getRangos(ctx);
    var hrR = Object.assign({}, rangos.hr || {});
    if (rangos.hrFlorMax && (fase === 'floracion' || fase === 'prefloracion')) {
      hrR.max = Math.min(hrR.max || 60, rangos.hrFlorMax);
    }
    var ev = evalRango(val, hrR, 'HR sala', '%');
    if (ev.estado !== 'ok' && ev.estado !== 'empty') {
      var hum = equipHint('humidificar');
      var desh = equipHint('deshumidificar');
      var ext = equipHint('extractor');
      ev.solucionTexto =
        val > (hrR.max || 70)
          ? 'Bajar HR: ' + (desh || 'deshumidificador') + ' + ' + (ext || 'extractor') + '.'
          : 'Subir HR: ' + (hum || 'humidificador') + ' o bandeja de agua.';
      ev.solucionHtml =
        '<div class="correccion-title">💧 HR</div><div class="correccion-muted">' + ev.solucionTexto + '</div>';
    }
    return Object.assign({ id: 'humSala', valor: val }, ev);
  }

  function evalVPD(val, ctx) {
    var r = getRangos(ctx).vpd;
    var ev = evalRango(val, r, 'VPD', ' kPa');
    if (ev.estado !== 'ok' && ev.estado !== 'empty' && typeof correccionVPD === 'function') {
      var amb = ctx && ctx.amb ? ctx.amb : {};
      ev.solucionHtml = correccionVPD(val, r, amb.humSala, amb.tempAire);
      ev.solucionTexto = val > r.max ? 'Subir humedad o bajar temp.' : 'Más extracción / deshumidificar.';
    }
    return Object.assign({ id: 'vpd', valor: val }, ev);
  }

  function evalPPFD(val, ctx) {
    var r = getRangos(ctx).ppfd;
    var ev = evalRango(val, r, 'PPFD', ' µmol/m²/s');
    if (ev.estado !== 'ok' && ev.estado !== 'empty' && typeof correccionPPFD === 'function') {
      ev.solucionHtml = correccionPPFD(val, r);
      ev.solucionTexto = val < r.min ? 'Acercar LED o subir potencia.' : 'Alejar LED o bajar dimmer.';
    }
    return Object.assign({ id: 'ppfd', valor: val }, ev);
  }

  function evalLux(val, ctx) {
    if (!Number.isFinite(val)) {
      return { id: 'lux', valor: val, estado: 'empty', msg: '', solucionTexto: '', solucionHtml: '' };
    }
    var ppfdEst = val / 54.4;
    var ppfdEv = evalPPFD(ppfdEst, ctx);
    return {
      id: 'lux',
      valor: val,
      estado: ppfdEv.estado,
      msg: 'Lux ' + val + ' (~' + Math.round(ppfdEst) + ' PPFD)',
      solucionTexto: ppfdEv.solucionTexto,
      solucionHtml: ppfdEv.solucionHtml,
    };
  }

  function evalTempExt(val, ctx) {
    var r = { min: 15, max: 32, warnLow: 10, warnHigh: 38 };
    var ev = evalRango(val, r, 'Temp. exterior', ' °C');
    if (ev.estado !== 'ok' && ev.estado !== 'empty') {
      ev.solucionTexto = 'Sombrear depósito; vigilar temp. agua y oxígeno.';
      ev.solucionHtml =
        '<div class="correccion-title">☀️ Exterior caliente/frío</div><div class="correccion-muted">' +
        ev.solucionTexto +
        '</div>';
    }
    return Object.assign({ id: 'tempExt', valor: val }, ev);
  }

  function evalCo2(val, ctx) {
    var r = getRangos(ctx).co2 || { min: 400, max: 1200, warnLow: 350, warnHigh: 1500 };
    var ev = evalRango(val, r, 'CO₂', ' ppm');
    if (ev.estado !== 'ok' && ev.estado !== 'empty' && typeof correccionCO2 === 'function') {
      ev.solucionHtml = correccionCO2(val, r);
      ev.solucionTexto = val > r.max ? 'Ventilar sala / bajar CO₂.' : 'Renovar aire o enriquecer CO₂.';
    }
    return Object.assign({ id: 'co2', valor: val }, ev);
  }

  var EVALUATORS = {
    ec: evalEC,
    ph: evalPH,
    temp: evalTempAgua,
    vol: evalVol,
    tempAire: evalTempAire,
    humSala: evalHumSala,
    vpd: evalVPD,
    ppfd: evalPPFD,
    lux: evalLux,
    tempExt: evalTempExt,
    co2: evalCo2,
  };

  function evaluarParametro(id, rawVal, ctx) {
    ctx = ctx || {};
    var fn = EVALUATORS[id];
    if (!fn) return { id: id, valor: num(rawVal), estado: 'empty', msg: '', solucionTexto: '', solucionHtml: '' };
    return fn(num(rawVal), ctx);
  }

  function buildPayloadFromMedicion(m) {
    m = m || {};
    return {
      ec: m.ec,
      ph: m.ph,
      temp: m.temp,
      vol: m.vol,
      tempAire: m.tempAire,
      humSala: m.humSala,
      vpd: m.vpd,
      ppfd: m.ppfd,
      lux: m.lux,
      tempExt: m.tempExt,
      co2: m.co2,
      fase: m.fase,
    };
  }

  function evaluarMedicionCompleta(payload) {
    payload = payload || {};
    var ctx = {
      fase: payload.fase,
      amb: { humSala: num(payload.humSala), tempAire: num(payload.tempAire) },
    };
    var items = [];
    var hasPpfd = Number.isFinite(num(payload.ppfd));
    Object.keys(EVALUATORS).forEach(function (id) {
      if (id === 'lux' && hasPpfd) return;
      var v = num(payload[id]);
      if (!Number.isFinite(v)) return;
      items.push(evaluarParametro(id, v, ctx));
    });
    var alertas = items.filter(function (it) {
      return it.estado === 'warn' || it.estado === 'bad';
    });
    return { items: items, alertas: alertas, fase: getFase(ctx) };
  }

  function alertasToTexto(result) {
    if (!result || !result.alertas || !result.alertas.length) return '';
    return result.alertas
      .map(function (a) {
        return a.msg + (a.solucionTexto ? ' → ' + a.solucionTexto : '');
      })
      .join(' | ');
  }

  function alertasToHtml(result) {
    if (!result || !result.alertas || !result.alertas.length) return '';
    return (
      '<div class="hc-eval-alertas">' +
      result.alertas
        .map(function (a) {
          var cls = a.estado === 'bad' ? 'hc-eval-alerta--bad' : 'hc-eval-alerta--warn';
          return (
            '<div class="hc-eval-alerta ' +
            cls +
            '"><strong>' +
            (PARAM_META[a.id] ? PARAM_META[a.id].label : a.id) +
            '</strong>: ' +
            a.msg +
            (a.solucionHtml || (a.solucionTexto ? '<p class="hc-eval-sol">' + a.solucionTexto + '</p>' : '')) +
            '</div>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function showAlertasPostGuardado(result) {
    if (!result || !result.alertas || !result.alertas.length) return;
    var panel = document.getElementById('medirAlertasPanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'medirAlertasPanel';
      panel.className = 'medir-alertas-panel';
      panel.setAttribute('role', 'alert');
      var anchor = document.getElementById('medirMonitorCard');
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(panel, anchor);
    }
    panel.innerHTML =
      '<div class="medir-alertas-head">⚠️ Valores fuera de rango en el registro</div>' + alertasToHtml(result);
    panel.classList.remove('setup-hidden');
  }

  global.HC_PARAM_META = PARAM_META;
  global.evaluarParametro = evaluarParametro;
  global.evaluarMedicionCompleta = evaluarMedicionCompleta;
  global.alertasToTexto = alertasToTexto;
  global.alertasToHtml = alertasToHtml;
  global.showAlertasPostGuardado = showAlertasPostGuardado;
  global.buildPayloadFromMedicion = buildPayloadFromMedicion;
})(typeof window !== 'undefined' ? window : globalThis);
