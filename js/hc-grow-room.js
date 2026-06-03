/**
 * HidroGrow — cálculo orientativo de sala (LED, extractor, filtro carbón).
 */
(function () {
  function el(id) {
    return document.getElementById(id);
  }
  function num(id) {
    const raw = String(el(id)?.value || '').trim().replace(',', '.');
    const n = Number(raw);
    return Number.isFinite(n) ? n : NaN;
  }
  function fmt(n, d) {
    if (!Number.isFinite(n)) return '—';
    return (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
  }
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function readDimFromCfg(cfg, key, domId) {
    const fromDom = num(domId);
    if (Number.isFinite(fromDom)) return fromDom;
    const v = Number(cfg && cfg[key]);
    return Number.isFinite(v) ? v : NaN;
  }

  function calcularGrowRoomInterno(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    const ancho = readDimFromCfg(cfg, 'growRoomAnchoM', 'growRoomAnchoM');
    const largo = readDimFromCfg(cfg, 'growRoomLargoM', 'growRoomLargoM');
    const alto = readDimFromCfg(cfg, 'growRoomAltoM', 'growRoomAltoM');
    const ledW = readDimFromCfg(cfg, 'growRoomLedW', 'growRoomLedW');
    const fase = String(el('growRoomFase')?.value || cfg.growRoomFase || 'vegetativo');
    const wM2 = (typeof GROW_ROOM_W_M2 !== 'undefined' && GROW_ROOM_W_M2[fase]) || GROW_ROOM_W_M2.vegetativo;

    if (!Number.isFinite(ancho) || !Number.isFinite(largo) || ancho <= 0 || largo <= 0) {
      return { error: 'Indica ancho y largo de la carpa (m).' };
    }
    const area = ancho * largo;
    const vol = area * (Number.isFinite(alto) && alto > 0 ? alto : 2);
    const ledObj = Math.round(area * wM2.obj);
    const ledMin = Math.round(area * wM2.min);
    const ledMax = Math.round(area * wM2.max);
    const ledUser = Number.isFinite(ledW) && ledW > 0 ? ledW : null;
    const densidad = ledUser != null ? ledUser / area : null;

    let ledEstado = 'ok';
    if (ledUser != null) {
      if (ledUser < ledMin * 0.85) ledEstado = 'warn';
      else if (ledUser > ledMax * 1.35) ledEstado = 'warn';
    }

    const exch = typeof GROW_ROOM_AIR_EXCHANGES !== 'undefined' ? GROW_ROOM_AIR_EXCHANGES : { obj: 60 };
    const m3hObj = Math.round(vol * exch.obj);
    const m3hMin = Math.round(vol * (exch.min || 30));
    const m3hMax = Math.round(vol * (exch.max || 90));
    const extractorUser = readDimFromCfg(cfg, 'growRoomExtractorM3h', 'growRoomExtractorM3h');
    let extEstado = 'ok';
    if (Number.isFinite(extractorUser) && extractorUser > 0) {
      if (extractorUser < m3hMin * 0.9) extEstado = 'warn';
      else if (extractorUser > m3hMax * 1.5) extEstado = 'warn';
    }

    const fotoperiodo =
      fase === 'floracion' ? '12/12' : fase === 'esqueje' ? '18/6 (luz suave)' : '18/6';

    return {
      area,
      vol,
      fase,
      ledMin,
      ledObj,
      ledMax,
      ledUser,
      densidad,
      ledEstado,
      m3hMin,
      m3hObj,
      m3hMax,
      extractorUser,
      extEstado,
      fotoperiodo,
    };
  }

  function renderGrowRoomResult(r) {
    const out = el('growRoomResultado');
    if (!out) return;
    if (r.error) {
      out.textContent = r.error;
      return;
    }
    const ledLine =
      r.ledUser != null
        ? 'Tu LED: <strong>' +
          fmt(r.ledUser, 0) +
          ' W</strong> (~' +
          fmt(r.densidad, 0) +
          ' W/m²) · objetivo ~' +
          fmt(r.ledObj, 0) +
          ' W (' +
          (r.ledEstado === 'ok' ? 'OK' : 'revisar') +
          ')'
        : 'LED sugerido: <strong>' +
          fmt(r.ledObj, 0) +
          ' W</strong> (rango ' +
          fmt(r.ledMin, 0) +
          '–' +
          fmt(r.ledMax, 0) +
          ' W)';
    const extLine =
      r.extractorUser != null
        ? 'Tu extractor: <strong>' +
          fmt(r.extractorUser, 0) +
          ' m³/h</strong> · objetivo ~' +
          fmt(r.m3hObj, 0) +
          ' m³/h (' +
          (r.extEstado === 'ok' ? 'OK' : 'revisar') +
          ')'
        : 'Extractor sugerido: <strong>' +
          fmt(r.m3hObj, 0) +
          ' m³/h</strong> (mín ~' +
          fmt(r.m3hMin, 0) +
          ')';
    out.innerHTML =
      '<div class="grow-room-result">' +
      '<p><strong>Sala ~' +
      fmt(r.area, 2) +
      ' m²</strong> · volumen ~' +
      fmt(r.vol, 1) +
      ' m³ · fase <strong>' +
      esc(r.fase) +
      '</strong> · fotoperiodo <strong>' +
      esc(r.fotoperiodo) +
      '</strong></p>' +
      '<p>' +
      ledLine +
      '</p>' +
      '<p>' +
      extLine +
      '</p>' +
      '<p class="grow-room-foot">Filtro de carbón: caudal ≥ extractor. Circulación interna (clip fan) aparte del extractor.</p>' +
      '</div>';
  }

  function persistGrowRoom() {
    if (typeof state === 'undefined' || !state) return;
    if (!state.configTorre) state.configTorre = {};
    const cfg = state.configTorre;
    cfg.growRoomAnchoM = num('growRoomAnchoM');
    cfg.growRoomLargoM = num('growRoomLargoM');
    cfg.growRoomAltoM = num('growRoomAltoM');
    cfg.growRoomLedW = num('growRoomLedW');
    cfg.growRoomExtractorM3h = num('growRoomExtractorM3h');
    cfg.growRoomFase = String(el('growRoomFase')?.value || 'vegetativo');
    cfg.growRoomTentPreset = String(el('growRoomTentPreset')?.value || '');
    const r = calcularGrowRoomInterno(cfg);
    if (!r.error) {
      cfg.growRoomLedObjW = r.ledObj;
      cfg.growRoomExtractorObjM3h = r.m3hObj;
    }
    if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    if (typeof saveState === 'function') saveState();
  }

  function aplicarPresetTenda() {
    const id = String(el('growRoomTentPreset')?.value || '');
    const list = typeof GROW_ROOM_TENTS !== 'undefined' ? GROW_ROOM_TENTS : [];
    const t = list.find(x => x.id === id);
    if (!t) return;
    if (el('growRoomAnchoM')) el('growRoomAnchoM').value = String(t.anchoM);
    if (el('growRoomLargoM')) el('growRoomLargoM').value = String(t.largoM);
    if (el('growRoomAltoM')) el('growRoomAltoM').value = String(t.altoM);
    persistGrowRoom();
    calcularGrowRoom();
  }

  function cargarGrowRoomUI() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const set = function (id, v) {
      const e = el(id);
      if (!e || v == null || !Number.isFinite(v)) return;
      e.value = String(v);
    };
    set('growRoomAnchoM', cfg.growRoomAnchoM);
    set('growRoomLargoM', cfg.growRoomLargoM);
    set('growRoomAltoM', cfg.growRoomAltoM);
    set('growRoomLedW', cfg.growRoomLedW);
    set('growRoomExtractorM3h', cfg.growRoomExtractorM3h);
    if (el('growRoomFase') && cfg.growRoomFase) el('growRoomFase').value = cfg.growRoomFase;
    const panel = el('panelGrowRoomSala');
    if (panel) panel.classList.remove('setup-hidden');
    calcularGrowRoom();
    if (typeof renderMedirEquipamientoPanel === 'function') renderMedirEquipamientoPanel();
  }

  function calcularGrowRoom() {
    persistGrowRoom();
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    renderGrowRoomResult(calcularGrowRoomInterno(cfg));
  }

  /** led | extractor | null — si el equipo del catálogo no cuadra con medidas de Sala. */
  function evalSalaRevisionCategoria(cfg, catKey) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    const interior =
      String(cfg.ubicacion || (cfg.premiumSetup && cfg.premiumSetup.entorno) || 'interior').toLowerCase() !==
      'exterior';
    if (!interior) return 'ok';
    const r = calcularGrowRoomInterno(cfg);
    if (r.error) return 'ok';
    if (catKey === 'led' && r.ledUser != null && r.ledEstado === 'warn') return 'warn';
    if (catKey === 'extractor' && r.extractorUser != null && r.extEstado === 'warn') return 'warn';
    return 'ok';
  }

  window.calcularGrowRoom = calcularGrowRoom;
  window.cargarGrowRoomUI = cargarGrowRoomUI;
  window.persistGrowRoom = persistGrowRoom;
  window.aplicarPresetTendaGrowRoom = aplicarPresetTenda;
  window.evalSalaRevisionCategoria = evalSalaRevisionCategoria;
})();
