/**
 * Programación de microriegos coco DTW en tiempo real.
 * Por maceta (matriz multi-genética), ajuste VPD y EC runoff desde Medir.
 */
(function (global) {
  'use strict';

  var GRUPO_FACTORS = {
    indica: { eventMult: 0.92, volMult: 0.95, drybackMult: 1.0, maxEvents: 7 },
    sativa: { eventMult: 1.12, volMult: 1.08, drybackMult: 0.92, maxEvents: 8 },
    hibrida: { eventMult: 1.0, volMult: 1.0, drybackMult: 1.0, maxEvents: 8 },
    auto: { eventMult: 0.88, volMult: 0.9, drybackMult: 1.08, maxEvents: 5 },
    cbd: { eventMult: 0.82, volMult: 0.85, drybackMult: 1.1, maxEvents: 5 },
  };

  var MICROFASE_EVENTS = {
    plántula: { auto: 1, min: 1, max: 2, dryback: { min: 8, max: 12 } },
    esqueje: { auto: 2, min: 1, max: 3, dryback: { min: 10, max: 14 } },
    veg_temprano: { auto: 3, min: 2, max: 4, dryback: { min: 10, max: 15 } },
    veg_tarde: { auto: 4, min: 3, max: 6, dryback: { min: 10, max: 15 } },
    prefloracion: { auto: 4, min: 3, max: 6, dryback: { min: 12, max: 18 } },
    flor_temprana: { auto: 5, min: 4, max: 6, dryback: { min: 12, max: 18 } },
    flor_pico: { auto: 7, min: 5, max: 8, dryback: { min: 15, max: 22 } },
    flor_tardia: { auto: 5, min: 3, max: 6, dryback: { min: 15, max: 25 } },
    flush: { auto: 2, min: 1, max: 3, dryback: { min: 10, max: 15 } },
  };

  function cfgActiva() {
    return (typeof state !== 'undefined' && state && state.configTorre) || {};
  }

  function torreActiva() {
    return (typeof state !== 'undefined' && state && state.torre) || [];
  }

  function getCultivo(id) {
    if (!id || typeof getCultivoDB !== 'function') return null;
    return getCultivoDB(id);
  }

  function diasDesdeFecha(iso) {
    if (!iso) return 0;
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return 0;
      return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
    } catch (_) {
      return 0;
    }
  }

  function celdaKey(n, c) {
    return String(n) + '_' + String(c);
  }

  function parseCeldaKey(key) {
    var p = String(key || '').split('_');
    return { n: parseInt(p[0], 10) || 0, c: parseInt(p[1], 10) || 0 };
  }

  function enumerateCocoDripCeldas(cfg, torre) {
    cfg = cfg || cfgActiva();
    torre = torre || torreActiva();
    var out = [];
    for (var n = 0; n < torre.length; n++) {
      var row = torre[n] || [];
      for (var c = 0; c < row.length; c++) {
        var cell = row[c];
        if (!cell || !cell.variedad) continue;
        out.push({
          n: n,
          c: c,
          key: celdaKey(n, c),
          variedadId: cell.variedad,
          cult: getCultivo(cell.variedad),
          dias: diasDesdeFecha(cell.fecha),
          cell: cell,
        });
      }
    }
    return out;
  }

  function resolveCocoDripCultivoDominante(cfg, torre) {
    var celdas = enumerateCocoDripCeldas(cfg, torre);
    if (celdas.length) {
      celdas.sort(function (a, b) {
        var ga = (a.cult && GRUPO_FACTORS[a.cult.grupo]) || GRUPO_FACTORS.hibrida;
        var gb = (b.cult && GRUPO_FACTORS[b.cult.grupo]) || GRUPO_FACTORS.hibrida;
        return gb.eventMult - ga.eventMult;
      });
      var top = celdas[0];
      return {
        cult: top.cult,
        variedadId: top.variedadId,
        dias: top.dias,
        fuente: 'matriz',
        n: top.n,
        c: top.c,
      };
    }
    cfg = cfg || cfgActiva();
    var vid =
      cfg.variedadGerminacion ||
      (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) ||
      '';
    if (vid) {
      var c0 = getCultivo(vid);
      if (c0) {
        return { cult: c0, variedadId: vid, dias: 0, fuente: 'germinacion' };
      }
    }
    return null;
  }

  function resolveCocoDripMicrofase(cultivo, diasDesdeTrasplante, cfg) {
    cfg = cfg || cfgActiva();
    var dias = Math.max(0, Number(diasDesdeTrasplante) || 0);

    if (cultivo && cultivo.fases && typeof cultivoFaseDesdeDias === 'function') {
      var fd = cultivoFaseDesdeDias(cultivo, dias, { desdeTrasplante: true });
      if (fd && fd.key) return mapFaseCatalogoAMicrofase(fd.key, cultivo, dias, cfg);
    }

    if (!cultivo) {
      var fManual = String(cfg.cocoDripFaseCultivo || '').toLowerCase();
      if (fManual.indexOf('flor') >= 0) return 'flor_pico';
      if (fManual.indexOf('preflor') >= 0) return 'prefloracion';
      if (fManual.indexOf('flush') >= 0) return 'flush';
      if (dias <= 10) return 'plántula';
      return 'veg_temprano';
    }

    if (cultivo.tipoFloracion === 'auto') return microfaseAuto(cultivo, dias);
    return microfaseFotoperiodo(cultivo, dias, cfg);
  }

  function microfaseAuto(cultivo, dias) {
    var total = cultivo.dias || 70;
    var pct = dias / total;
    if (dias <= 10) return 'plántula';
    if (pct < 0.35) return 'veg_temprano';
    if (pct < 0.45) return 'veg_tarde';
    if (pct < 0.55) return 'prefloracion';
    if (pct < 0.7) return 'flor_pico';
    if (pct < 0.92) return 'flor_tardia';
    return 'flush';
  }

  function microfaseFotoperiodo(cultivo, dias, cfg) {
    var dv = cultivo.diasVeg || 35;
    var df = cultivo.diasFlor || 56;
    if (dias <= 7) return 'plántula';
    if (dias <= 14) return 'esqueje';

    var enFlor =
      String(cfg.cocoDripFaseCultivo || '').indexOf('flor') >= 0 ||
      String(cfg.growRoomFase || '').indexOf('flor') >= 0 ||
      (cfg.premiumSetup && String(cfg.premiumSetup.faseSala || '').indexOf('flor') >= 0) ||
      (cfg.premiumSetup && Number(cfg.premiumSetup.horasLuz) === 12);

    if (!enFlor && dias <= dv) {
      return dias < dv * 0.45 ? 'veg_temprano' : 'veg_tarde';
    }

    var diasFlor = enFlor ? dias - dv : Math.max(0, dias - dv);
    if (diasFlor <= 0 && dias > dv) diasFlor = dias - dv;
    if (diasFlor <= 0) return dias < dv * 0.45 ? 'veg_temprano' : 'veg_tarde';

    if (diasFlor <= 14) return 'flor_temprana';
    if (diasFlor <= df * 0.65) return 'flor_pico';
    if (diasFlor <= df) return 'flor_tardia';
    return 'flush';
  }

  function mapFaseCatalogoAMicrofase(key, cultivo, dias, cfg) {
    var k = String(key || '').toLowerCase();
    if (k === 'germinacion' || k === 'plantula') return 'plántula';
    if (k === 'vegetativo') {
      var dv = (cultivo && cultivo.diasVeg) || 35;
      return Math.min(dias, dv) < dv * 0.45 ? 'veg_temprano' : 'veg_tarde';
    }
    if (k === 'prefloracion') return 'prefloracion';
    if (k === 'floracion' || k === 'fructificacion') {
      var df = (cultivo && cultivo.diasFlor) || 56;
      var dv2 = (cultivo && cultivo.diasVeg) || 35;
      var diasFlor = Math.max(0, dias - dv2);
      if (diasFlor <= 14) return 'flor_temprana';
      if (diasFlor <= df * 0.65) return 'flor_pico';
      if (diasFlor <= df) return 'flor_tardia';
      return 'flush';
    }
    return microfaseFotoperiodo(cultivo, dias, cfg);
  }

  function horasLuzEfectivas(cfg, cultivo, microfase) {
    cfg = cfg || cfgActiva();
    var h =
      Number(cfg.horasLuz) ||
      (cfg.premiumSetup && Number(cfg.premiumSetup.horasLuz)) ||
      NaN;
    if (cultivo && cultivo.tipoFloracion === 'auto') {
      return Number.isFinite(h) ? h : 18;
    }
    if (microfase.indexOf('flor') === 0 || microfase === 'prefloracion') {
      return Number.isFinite(h) ? h : 12;
    }
    return Number.isFinite(h) ? h : 18;
  }

  function ajusteEventosPorVpd(cfg) {
    cfg = cfg || cfgActiva();
    var vpd = NaN;
    try {
      if (typeof resolveCocoDripVpdKpa === 'function') {
        var vRes = resolveCocoDripVpdKpa(cfg);
        if (vRes && Number.isFinite(vRes.vpd)) vpd = vRes.vpd;
      } else if (cfg.ultimaMedicion && Number.isFinite(Number(cfg.ultimaMedicion.vpd))) {
        vpd = Number(cfg.ultimaMedicion.vpd);
      } else if (typeof state !== 'undefined' && state.ultimaMedicion) {
        vpd = Number(state.ultimaMedicion.vpd);
      }
    } catch (_) {}
    if (!Number.isFinite(vpd)) return 0;
    if (vpd >= 1.6) return 1;
    if (vpd <= 0.85) return -1;
    return 0;
  }

  function getCocoDripRunoffCelda(cfg, key) {
    cfg = cfg || cfgActiva();
    var store = cfg.cocoDripRunoffPorCelda;
    if (!store || typeof store !== 'object') return null;
    return store[key] || null;
  }

  /**
   * Ajuste del siguiente pulso según EC runoff vs entrada (CFC / PhenoDB).
   */
  function ajustePorRunoff(cfg, key) {
    var ro = getCocoDripRunoffCelda(cfg, key);
    if (!ro) {
      return { eventDelta: 0, volMult: 1, duracionDelta: 0, nota: '', deltaEc: null };
    }
    var ecIn = Number(ro.ecEntrada);
    var ecOut = Number(ro.ecRunoff);
    var pct = Number(ro.runoffPct);
    var eventDelta = 0;
    var volMult = 1;
    var duracionDelta = 0;
    var notas = [];
    var deltaEc = null;

    if (Number.isFinite(ecIn) && Number.isFinite(ecOut)) {
      deltaEc = ecOut - ecIn;
      if (deltaEc > 600) {
        eventDelta = -1;
        volMult = 0.9;
        notas.push('Runoff EC +' + deltaEc + ' µS: bajar EC reservorio o pulso');
      } else if (deltaEc > 350) {
        volMult = 0.95;
        notas.push('Runoff EC +' + deltaEc + ' µS: vigilar acumulación');
      } else if (deltaEc < -250) {
        duracionDelta = 1;
        volMult = 1.08;
        notas.push('Runoff EC ' + deltaEc + ' µS: subir dosis o +1 min');
      } else if (deltaEc < -100) {
        duracionDelta = 1;
        notas.push('Runoff EC bajo: +1 min pulso');
      }
    }
    if (Number.isFinite(pct)) {
      if (pct < 10) {
        duracionDelta = Math.max(duracionDelta, 1);
        notas.push('Runoff ' + pct + '% (<10%): alargar pulso');
      } else if (pct > 22) {
        duracionDelta = Math.min(duracionDelta - 1, -1);
        volMult *= 0.93;
        notas.push('Runoff ' + pct + '% (>20%): acortar pulso');
      }
    }
    return {
      eventDelta: eventDelta,
      volMult: volMult,
      duracionDelta: duracionDelta,
      nota: notas.join(' · '),
      deltaEc: deltaEc,
      medidoEn: ro.fecha || '',
    };
  }

  function buildCocoDripProgramacionCelda(cfg, torre, n, c, opts) {
    opts = opts || {};
    if (typeof buildCocoDripProgramacion !== 'function') return null;
    cfg = cfg || cfgActiva();
    torre = torre || torreActiva();
    var row = torre[n];
    var cell = row && row[c];
    if (!cell || !cell.variedad) return null;

    var cult = getCultivo(cell.variedad);
    var dias = diasDesdeFecha(cell.fecha);
    var key = celdaKey(n, c);
    var microfase = resolveCocoDripMicrofase(cult, dias, cfg);
    var meta = MICROFASE_EVENTS[microfase] || MICROFASE_EVENTS.veg_temprano;
    var grupo = (cult && cult.grupo) || 'hibrida';
    var gf = GRUPO_FACTORS[grupo] || GRUPO_FACTORS.hibrida;
    var runoffAdj = ajustePorRunoff(cfg, key);

    var eventos =
      Math.round(meta.auto * gf.eventMult) +
      ajusteEventosPorVpd(cfg) +
      runoffAdj.eventDelta;
    eventos = Math.max(meta.min, Math.min(Math.min(meta.max, gf.maxEvents), eventos));

    var horasLuz = horasLuzEfectivas(cfg, cult, microfase);
    var tamano = cfg.cocoDripTamanoMacetas || 'medium';
    var volBase =
      typeof getCocoDripVolumenEventoMl === 'function'
        ? getCocoDripVolumenEventoMl(tamano)
        : 945;
    var volMl = Math.round(volBase * gf.volMult * runoffAdj.volMult);

    var emitterLph = Number(cfg.cocoDripEmitterFlowLph) || 2;
    var duracionMin = Number(cfg.cocoDripDuracionRiegoMin) || 3;
    if (emitterLph > 0) {
      var flowLpm = emitterLph / 60;
      duracionMin = Math.max(1, Math.min(15, Math.ceil(volMl / flowLpm / 1000)));
    }
    duracionMin = Math.max(1, Math.min(15, duracionMin + runoffAdj.duracionDelta));

    var dryback = {
      min: Math.round(meta.dryback.min * gf.drybackMult),
      max: Math.round(meta.dryback.max * gf.drybackMult),
    };

    var ecRango = null;
    if (typeof getEcPhSaltonVerde === 'function') {
      var svPh = getEcPhSaltonVerde(microfase);
      if (svPh && svPh.ec) {
        ecRango = {
          min: svPh.ec.min,
          max: svPh.ec.max,
          label: svPh.label,
          phMin: svPh.ph.min,
          phMax: svPh.ph.max,
          fuente: 'saltonverde',
        };
      }
    }
    if (!ecRango && cult && cult.ecMin && cult.ecMax) {
      ecRango = { min: cult.ecMin, max: cult.ecMax };
    }

    var prog = buildCocoDripProgramacion({
      fase: microfase,
      horasLuz: horasLuz,
      lightsOnHour: cfg.cocoDripLightsOnHour != null ? cfg.cocoDripLightsOnHour : 6,
      eventos: eventos,
      eventosMin: meta.min,
      eventosMax: Math.min(meta.max, gf.maxEvents),
      tamanoMaceta: tamano,
      volumenMlPorMaceta: volMl,
      drybackNochePct: dryback,
      duracionMin: duracionMin,
      modo: 'auto',
    });

    if (!prog) return null;

    prog.celdaN = n;
    prog.celdaC = c;
    prog.celdaKey = key;
    prog.microfase = microfase;
    prog.grupoGenetica = grupo;
    prog.variedadId = cell.variedad;
    prog.variedadNombre = cult ? cult.nombre : cell.variedad;
    prog.diasDesdeTraslado = dias;
    prog.ecRangoUs = ecRango;
    prog.ajusteVpd = ajusteEventosPorVpd(cfg);
    prog.ajusteRunoff = runoffAdj;
    prog.proximoEvento = resolveProximoEventoCoco(prog);
    return prog;
  }

  function buildCocoDripProgramacionTiempoReal(cfg, torre) {
    cfg = cfg || cfgActiva();
    torre = torre || torreActiva();
    if (typeof buildCocoDripProgramacion !== 'function') return null;

    var celdas = enumerateCocoDripCeldas(cfg, torre);
    var porCelda = {};
    var progs = [];

    if (celdas.length) {
      for (var i = 0; i < celdas.length; i++) {
        var item = celdas[i];
        var p = buildCocoDripProgramacionCelda(cfg, torre, item.n, item.c, {});
        if (p) {
          porCelda[item.key] = p;
          progs.push(p);
        }
      }
    }

    if (!progs.length) {
      var dom = resolveCocoDripCultivoDominante(cfg, torre);
      var cult = dom && dom.cult;
      var dias = dom ? dom.dias : 0;
      var microfase = resolveCocoDripMicrofase(cult, dias, cfg);
      var meta = MICROFASE_EVENTS[microfase] || MICROFASE_EVENTS.veg_temprano;
      var grupo = (cult && cult.grupo) || 'hibrida';
      var gf = GRUPO_FACTORS[grupo] || GRUPO_FACTORS.hibrida;
      var eventos = Math.round(meta.auto * gf.eventMult) + ajusteEventosPorVpd(cfg);
      eventos = Math.max(meta.min, Math.min(Math.min(meta.max, gf.maxEvents), eventos));
      var horasLuz = horasLuzEfectivas(cfg, cult, microfase);
      var tamano = cfg.cocoDripTamanoMacetas || 'medium';
      var volMl =
        typeof getCocoDripVolumenEventoMl === 'function'
          ? Math.round(getCocoDripVolumenEventoMl(tamano) * gf.volMult)
          : 945;
      var duracionMin = Number(cfg.cocoDripDuracionRiegoMin) || 3;
      var dryback = {
        min: Math.round(meta.dryback.min * gf.drybackMult),
        max: Math.round(meta.dryback.max * gf.drybackMult),
      };
      var prog0 = buildCocoDripProgramacion({
        fase: microfase,
        horasLuz: horasLuz,
        lightsOnHour: cfg.cocoDripLightsOnHour != null ? cfg.cocoDripLightsOnHour : 6,
        eventos: eventos,
        eventosMin: meta.min,
        eventosMax: Math.min(meta.max, gf.maxEvents),
        tamanoMaceta: tamano,
        volumenMlPorMaceta: volMl,
        drybackNochePct: dryback,
        duracionMin: duracionMin,
        modo: 'auto',
      });
      if (!prog0) return null;
      prog0.microfase = microfase;
      prog0.grupoGenetica = grupo;
      prog0.variedadId = dom ? dom.variedadId : '';
      prog0.variedadNombre = cult ? cult.nombre : '';
      prog0.diasDesdeTraslado = dias;
      prog0.fuenteCultivo = dom ? dom.fuente : 'manual';
      prog0.porCelda = {};
      prog0.proximoEvento = resolveProximoEventoCoco(prog0);
      prog0.calculadoEn = new Date().toISOString();
      return prog0;
    }

    var maxEventos = 0;
    var maxDur = 3;
    var refProg = progs[0];
    for (var j = 0; j < progs.length; j++) {
      var pj = progs[j];
      if (pj.eventosDia > maxEventos) {
        maxEventos = pj.eventosDia;
        refProg = pj;
      }
      if (pj.duracionMinPorEvento > maxDur) maxDur = pj.duracionMinPorEvento;
    }

    var salaProg = buildCocoDripProgramacion({
      fase: refProg.microfase,
      horasLuz: refProg.horasLuz,
      lightsOnHour: cfg.cocoDripLightsOnHour != null ? cfg.cocoDripLightsOnHour : 6,
      eventos: maxEventos,
      eventosMin: 1,
      eventosMax: 8,
      tamanoMaceta: cfg.cocoDripTamanoMacetas || 'medium',
      volumenMlPorMaceta: refProg.volumenMlPorMaceta,
      drybackNochePct: refProg.drybackNochePct,
      duracionMin: maxDur,
      modo: 'auto',
    });

    if (!salaProg) return null;

    var variedades = {};
    progs.forEach(function (p) {
      variedades[p.variedadId] = (variedades[p.variedadId] || 0) + 1;
    });

    salaProg.microfase = refProg.microfase;
    salaProg.grupoGenetica = refProg.grupoGenetica;
    salaProg.variedadId = refProg.variedadId;
    salaProg.variedadNombre = refProg.variedadNombre;
    salaProg.diasDesdeTraslado = refProg.diasDesdeTraslado;
    salaProg.porCelda = porCelda;
    salaProg.celdasResumen = progs.map(function (p) {
      return {
        key: p.celdaKey,
        n: p.celdaN,
        c: p.celdaC,
        nombre: p.variedadNombre,
        microfase: p.microfase,
        eventosDia: p.eventosDia,
        duracionMin: p.duracionMinPorEvento,
        volumenMl: p.volumenMlPorMaceta,
        ajusteRunoff: p.ajusteRunoff,
      };
    });
    salaProg.multiGenetica = Object.keys(variedades).length > 1;
    salaProg.numMacetas = progs.length;
    salaProg.fuenteCultivo = 'matriz';
    salaProg.ajusteVpd = ajusteEventosPorVpd(cfg);
    salaProg.calculadoEn = new Date().toISOString();
    salaProg.proximoEvento = resolveProximoEventoCoco(salaProg);
    return salaProg;
  }

  function resolveProximoEventoCoco(prog) {
    if (!prog || !prog.eventos || !prog.eventos.length) return null;
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var candidatos = prog.eventos.map(function (ev) {
      var abs = ev.hora * 60 + ev.minuto;
      var delta = abs - nowMin;
      if (delta < 0) delta += 24 * 60;
      return { ev: ev, deltaMin: delta };
    });
    candidatos.sort(function (a, b) {
      return a.deltaMin - b.deltaMin;
    });
    var best = candidatos[0];
    if (!best) return null;
    return {
      label: best.ev.label,
      enMinutos: best.deltaMin,
      duracionMin: best.ev.duracionMin,
      nota: best.ev.nota,
    };
  }

  function registrarCocoDripRunoffMedicion(cfg, data) {
    cfg = cfg || cfgActiva();
    if (!data || typeof data !== 'object') return null;
    if (!cfg.cocoDripRunoffPorCelda) cfg.cocoDripRunoffPorCelda = {};

    var key = data.celdaKey;
    if (!key && data.celdaN != null && data.celdaC != null) {
      key = celdaKey(data.celdaN, data.celdaC);
    }
    if (!key) key = '0_0';

    var ecEntrada = Number(data.ecEntrada);
    var ecRunoff = Number(data.ecRunoff);
    var runoffPct = Number(data.runoffPct);
    var phRunoff = data.phRunoff != null ? Number(data.phRunoff) : null;

    if (!Number.isFinite(ecEntrada) && !Number.isFinite(ecRunoff) && !Number.isFinite(runoffPct)) {
      return null;
    }

    var entry = {
      celdaKey: key,
      ecEntrada: Number.isFinite(ecEntrada) ? ecEntrada : null,
      ecRunoff: Number.isFinite(ecRunoff) ? ecRunoff : null,
      phRunoff: Number.isFinite(phRunoff) ? phRunoff : null,
      runoffPct: Number.isFinite(runoffPct) ? runoffPct : null,
      fecha: new Date().toISOString(),
    };

    cfg.cocoDripRunoffPorCelda[key] = entry;
    cfg.cocoDripUltimoRunoff = entry;
    return entry;
  }

  function registrarCocoDripRunoffDesdeMedir(cfg, payload) {
    cfg = cfg || cfgActiva();
    payload = payload || {};
    var ecEntrada = payload.ecEntrada != null ? payload.ecEntrada : payload.ec;
    return registrarCocoDripRunoffMedicion(cfg, {
      celdaKey: payload.cocoDripCeldaKey,
      celdaN: payload.cocoDripCeldaN,
      celdaC: payload.cocoDripCeldaC,
      ecEntrada: ecEntrada,
      ecRunoff: payload.ecRunoff,
      phRunoff: payload.phRunoff,
      runoffPct: payload.runoffPct,
    });
  }

  function refreshCocoDripProgramacionEnCfg(cfg) {
    cfg = cfg || cfgActiva();
    var prog = buildCocoDripProgramacionTiempoReal(cfg);
    if (prog) {
      cfg.cocoDripProgramacion = prog;
      cfg.cocoDripProgramacionPorCelda = prog.porCelda || {};
      cfg.cocoDripFrecuenciaRiego = prog.eventosDia;
      cfg.cocoDripFaseCultivo = prog.multiGenetica ? 'multi' : prog.microfase;
    }
    return prog;
  }

  function renderCocoDripCeldasTableHtml(prog) {
    if (!prog || !prog.celdasResumen || prog.celdasResumen.length < 2) return '';
    var rows = prog.celdasResumen
      .map(function (r) {
        var adj =
          r.ajusteRunoff && r.ajusteRunoff.nota
            ? '<br><span class="setup-field-hint">' + r.ajusteRunoff.nota + '</span>'
            : '';
        return (
          '<tr><td>' +
          (r.n + 1) +
          '-' +
          (r.c + 1) +
          '</td><td>' +
          r.nombre +
          '</td><td>' +
          r.microfase +
          '</td><td>' +
          r.eventosDia +
          '× · ' +
          r.duracionMin +
          ' min · ' +
          r.volumenMl +
          ' ml</td></tr>' +
          (adj ? '<tr><td colspan="4">' + adj + '</td></tr>' : '')
        );
      })
      .join('');
    return (
      '<div class="setup-coco-drip-celdas-table-wrap">' +
      '<p class="setup-field-hint"><strong>Programa por maceta</strong> (' +
      prog.celdasResumen.length +
      ' genéticas)</p>' +
      '<table class="setup-coco-drip-celdas-table"><thead><tr><th>#</th><th>Variedad</th><th>Fase</th><th>Riego</th></tr></thead><tbody>' +
      rows +
      '</tbody></table>' +
      '<p class="setup-field-hint">Horarios de sala: frecuencia máxima (' +
      prog.eventosDia +
      '×/día) para cubrir la maceta más exigente.</p></div>'
    );
  }

  function renderCocoDripProgramacionRealtimeHtml(prog) {
    if (!prog) return '';
    var base =
      typeof renderCocoDripProgramacionHtml === 'function'
        ? renderCocoDripProgramacionHtml(prog)
        : '';
    var head =
      '<p class="setup-field-hint setup-coco-drip-realtime-head">' +
      (prog.multiGenetica
        ? '<strong>' + prog.numMacetas + ' macetas</strong> · multi-genética · '
        : prog.variedadNombre
          ? '<strong>' + prog.variedadNombre + '</strong> · '
          : '') +
      (prog.multiGenetica ? '' : 'Día ' + (prog.diasDesdeTraslante || 0) + ' · ') +
      'microfase <strong>' +
      (prog.multiGenetica ? 'varía' : prog.microfase) +
      '</strong>' +
      (prog.grupoGenetica && !prog.multiGenetica ? ' (' + prog.grupoGenetica + ')' : '') +
      '</p>';
    var prox =
      prog.proximoEvento && prog.proximoEvento.enMinutos != null
        ? '<p class="setup-field-hint">Próximo riego sala: <strong>' +
          prog.proximoEvento.label +
          '</strong> (~' +
          prog.proximoEvento.enMinutos +
          ' min)</p>'
        : '';
    return head + renderCocoDripCeldasTableHtml(prog) + base + prox;
  }

  function renderCocoDripDashHtml(prog) {
    if (!prog) return '';
    var prox =
      prog.proximoEvento && prog.proximoEvento.label
        ? ' · próximo <strong>' + prog.proximoEvento.label + '</strong>'
        : '';
    var html =
      '<p><strong>' +
      prog.eventosDia +
      '×/día</strong> goteo DTW' +
      prox +
      '</p>';
    if (prog.celdasResumen && prog.celdasResumen.length > 1) {
      html += '<ul class="dash-coco-drip-celdas">';
      prog.celdasResumen.forEach(function (r) {
        html +=
          '<li>Maceta ' +
          (r.n + 1) +
          '-' +
          (r.c + 1) +
          ' <strong>' +
          r.nombre +
          '</strong>: ' +
          r.eventosDia +
          '× · ' +
          r.microfase;
        if (r.ajusteRunoff && r.ajusteRunoff.nota) {
          html += ' <span class="dash-coco-drip-adj">(' + r.ajusteRunoff.nota + ')</span>';
        }
        html += '</li>';
      });
      html += '</ul>';
    } else if (prog.variedadNombre) {
      html +=
        '<p class="dash-coco-drip-meta">' +
        prog.variedadNombre +
        ' · día ' +
        (prog.diasDesdeTraslante || 0) +
        ' · ' +
        prog.microfase +
        '</p>';
    }
    return html;
  }

  global.COCO_DRIP_MICROFASE_EVENTS = MICROFASE_EVENTS;
  global.COCO_DRIP_GRUPO_FACTORS = GRUPO_FACTORS;
  global.celdaKeyCocoDrip = celdaKey;
  global.parseCeldaKeyCocoDrip = parseCeldaKey;
  global.enumerateCocoDripCeldas = enumerateCocoDripCeldas;
  global.resolveCocoDripCultivoDominante = resolveCocoDripCultivoDominante;
  global.resolveCocoDripMicrofase = resolveCocoDripMicrofase;
  global.buildCocoDripProgramacionCelda = buildCocoDripProgramacionCelda;
  global.buildCocoDripProgramacionTiempoReal = buildCocoDripProgramacionTiempoReal;
  global.getCocoDripRunoffCelda = getCocoDripRunoffCelda;
  global.ajustePorRunoffCocoDrip = ajustePorRunoff;
  global.registrarCocoDripRunoffMedicion = registrarCocoDripRunoffMedicion;
  global.registrarCocoDripRunoffDesdeMedir = registrarCocoDripRunoffDesdeMedir;
  global.refreshCocoDripProgramacionEnCfg = refreshCocoDripProgramacionEnCfg;
  global.resolveProximoEventoCoco = resolveProximoEventoCoco;
  global.ajusteEventosPorVpdCocoDrip = ajusteEventosPorVpd;
  global.renderCocoDripProgramacionRealtimeHtml = renderCocoDripProgramacionRealtimeHtml;
  global.renderCocoDripDashHtml = renderCocoDripDashHtml;
  global.renderCocoDripCeldasTableHtml = renderCocoDripCeldasTableHtml;
})(typeof window !== 'undefined' ? window : globalThis);
