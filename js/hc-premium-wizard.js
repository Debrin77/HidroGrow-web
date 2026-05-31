/**
 * HidroGrow — asistente premium 7 bloques (setup pasos 1–7).
 */
(function () {
  const GERMINACION_HIDRO_PASOS = [
    { id: 'semilla', titulo: 'Semilla en germinador', desc: 'Papel húmedo o domo 22–26 °C; no enterrar >5 mm.' },
    { id: 'taproot', titulo: 'Radícula 5–10 mm', desc: 'Trasladar con cuidado; no manipular la punta.' },
    { id: 'rockwool', titulo: 'Cubo lana de roca 4×4 cm', desc: 'Remojar pH 5.5; colocar semilla en hueco central.' },
    { id: 'domo', titulo: 'Domo + luz tenue 18/6', desc: 'HR 70–80%; ventilar domo 2×/día contra moho.' },
    { id: 'netpot', titulo: 'Net pot + bolas de arcilla', desc: 'Raíz visible por fuera del cubo antes del traslado.' },
    { id: 'dwc', titulo: 'DWC/RDWC (NO semilla directa)', desc: 'Solo plántula con raíz en net pot; EC inicial 400–600 µS.' },
  ];

  function el(id) {
    return document.getElementById(id);
  }

  function numVal(id) {
    const raw = String(el(id)?.value || '').replace(',', '.').trim();
    const n = Number(raw);
    return Number.isFinite(n) ? n : NaN;
  }

  function ensurePremiumSetup() {
    if (typeof setupData === 'undefined') return {};
    if (!setupData.premium) {
      setupData.premium = {
        objetivo: 'autocultivo',
        entorno: 'interior',
        carpaReflectante: true,
        tentPreset: '',
        anchoM: null,
        largoM: null,
        altoM: null,
        ledW: null,
        extractorM3h: null,
        faseSala: 'vegetativo',
        horasLuz: 18,
        intensidadLuz: 'media',
        geneticaPref: 'foto',
        origenPlanta: 'semilla',
        germinacionChecklist: {},
        metodoCultivo: 'scrog',
      };
    }
    return setupData.premium;
  }

  function syncPremiumEntornoDesdeUbicacion() {
    const p = ensurePremiumSetup();
    if (typeof setupData !== 'undefined' && setupData.ubicacion) {
      p.entorno = setupData.ubicacion === 'exterior' ? 'exterior' : 'interior';
    }
  }

  function seleccionarPremiumObjetivo(obj) {
    ensurePremiumSetup().objetivo = obj === 'experimento' ? 'experimento' : 'autocultivo';
    el('setupPremiumObjAutocultivo')?.classList.toggle('selected', obj !== 'experimento');
    el('setupPremiumObjExperimento')?.classList.toggle('selected', obj === 'experimento');
  }

  function seleccionarPremiumEntorno(entorno) {
    const p = ensurePremiumSetup();
    p.entorno = entorno === 'exterior' ? 'exterior' : 'interior';
    if (typeof setupData !== 'undefined') {
      setupData.ubicacion = p.entorno;
      setupUbicacion = p.entorno;
    }
    refreshPremiumEntornoUI();
  }

  function seleccionarPremiumOrigen(origen) {
    const o = origen === 'clon' ? 'clon' : origen === 'madre' ? 'madre' : 'semilla';
    ensurePremiumSetup().origenPlanta = o;
    refreshPremiumGerminacionUI();
  }

  function seleccionarPremiumMetodo(metodo) {
    ensurePremiumSetup().metodoCultivo = metodo === 'sog' ? 'sog' : 'scrog';
    refreshPremiumMetodoUI();
    refreshPremiumGeneticaHint();
  }

  function seleccionarPremiumGenetica(pref) {
    ensurePremiumSetup().geneticaPref = pref === 'auto' ? 'auto' : 'foto';
    el('setupPremiumGenFoto')?.classList.toggle('selected', pref !== 'auto');
    el('setupPremiumGenAuto')?.classList.toggle('selected', pref === 'auto');
    refreshPremiumGeneticaHint();
  }

  function togglePremiumCarpaReflectante() {
    const p = ensurePremiumSetup();
    p.carpaReflectante = !p.carpaReflectante;
    const chk = el('setupPremiumCarpaReflectante');
    if (chk) chk.checked = p.carpaReflectante;
  }

  function aplicarPremiumTentPreset() {
    const p = ensurePremiumSetup();
    const id = String(el('setupPremiumTentPreset')?.value || '');
    p.tentPreset = id;
    const list = typeof GROW_ROOM_TENTS !== 'undefined' ? GROW_ROOM_TENTS : [];
    const t = list.find(function (x) { return x.id === id; });
    if (!t) {
      calcularPremiumSala();
      return;
    }
    if (el('setupPremiumAnchoM')) el('setupPremiumAnchoM').value = String(t.anchoM);
    if (el('setupPremiumLargoM')) el('setupPremiumLargoM').value = String(t.largoM);
    if (el('setupPremiumAltoM')) el('setupPremiumAltoM').value = String(t.altoM);
    calcularPremiumSala();
  }

  function calcularPremiumSalaInterno() {
    const p = ensurePremiumSetup();
    const ancho = numVal('setupPremiumAnchoM');
    const largo = numVal('setupPremiumLargoM');
    const alto = numVal('setupPremiumAltoM');
    const ledW = numVal('setupPremiumLedW');
    const extM3h = numVal('setupPremiumExtractorM3h');
    const fase = String(el('setupPremiumFase')?.value || p.faseSala || 'vegetativo');
    p.anchoM = Number.isFinite(ancho) ? ancho : null;
    p.largoM = Number.isFinite(largo) ? largo : null;
    p.altoM = Number.isFinite(alto) ? alto : null;
    p.ledW = Number.isFinite(ledW) ? ledW : null;
    p.extractorM3h = Number.isFinite(extM3h) ? extM3h : null;
    p.faseSala = fase;

    if (!Number.isFinite(ancho) || !Number.isFinite(largo) || ancho <= 0 || largo <= 0) {
      return { error: 'Indica ancho y largo de la sala (m).' };
    }
    const area = ancho * largo;
    const vol = area * (Number.isFinite(alto) && alto > 0 ? alto : 2);
    const wM2 = (typeof GROW_ROOM_W_M2 !== 'undefined' && GROW_ROOM_W_M2[fase]) || GROW_ROOM_W_M2.vegetativo;
    const ledObj = Math.round(area * wM2.obj);
    const ledMin = Math.round(area * wM2.min);
    const ledMax = Math.round(area * wM2.max);
    const densidad = Number.isFinite(ledW) && ledW > 0 ? ledW / area : null;
    const exch = typeof GROW_ROOM_AIR_EXCHANGES !== 'undefined' ? GROW_ROOM_AIR_EXCHANGES : { obj: 60, min: 30 };
    const m3hObj = Math.round(vol * exch.obj);
    const m3hMin = Math.round(vol * (exch.min || 30));
    const preset = String(el('setupPremiumTentPreset')?.value || '');
    const tent = (typeof GROW_ROOM_TENTS !== 'undefined' ? GROW_ROOM_TENTS : []).find(function (x) {
      return x.id === preset;
    });
    return {
      area, vol, fase, ledObj, ledMin, ledMax, ledW, densidad, m3hObj, m3hMin, extM3h,
      plantasTip: tent ? tent.plantasTip : null,
      fotoperiodo: fase === 'floracion' ? '12/12' : '18/6',
    };
  }

  function renderPremiumSalaResult(r) {
    const out = el('setupPremiumSalaResult');
    if (!out) return;
    if (r.error) {
      out.textContent = r.error;
      return;
    }
    let html =
      '<p><strong>~' + r.area.toFixed(2) + ' m²</strong> · ~' + r.vol.toFixed(1) + ' m³ · ' +
      r.fotoperiodo + ' · LED ~<strong>' + r.ledObj + ' W</strong></p>';
    if (Number.isFinite(r.ledW) && r.ledW > 0) {
      html += '<p>Tu LED: <strong>' + Math.round(r.ledW) + ' W</strong> (~' + Math.round(r.densidad) + ' W/m²)</p>';
    }
    html += '<p>Extractor ~<strong>' + r.m3hObj + ' m³/h</strong></p>';
    if (r.plantasTip) html += '<p>Carpa típica: <strong>' + r.plantasTip + ' plantas</strong>.</p>';
    out.innerHTML = html;
  }

  function calcularPremiumSala() {
    renderPremiumSalaResult(calcularPremiumSalaInterno());
    refreshPremiumClimaResumen();
  }

  function refreshPremiumClimaResumen() {
    const out = el('setupPremiumClimaResumen');
    if (!out) return;
    const p = ensurePremiumSetup();
    const fase = String(el('setupPremiumFase')?.value || p.faseSala || 'vegetativo');
    p.faseSala = fase;
    const horas = parseInt(String(el('setupPremiumHorasLuz')?.value || p.horasLuz || 18), 10) || 18;
    p.horasLuz = horas;
    p.intensidadLuz = String(el('setupPremiumIntensidadLuz')?.value || p.intensidadLuz || 'media');
    const rangos = typeof getRangosFaseAmbiente === 'function' ? getRangosFaseAmbiente(fase) : null;
    const foto = fase === 'floracion' || fase === 'prefloracion' ? '12/12' : horas + '/6';
    let html = '<p><strong>Fotoperiodo orientativo:</strong> ' + foto + '</p>';
    if (rangos) {
      html += '<p>VPD objetivo <strong>' + rangos.vpd.min + '–' + rangos.vpd.max + ' kPa</strong> · HR ' +
        rangos.hr.min + '–' + rangos.hr.max + '% · PPFD ' + rangos.ppfd.min + '–' + rangos.ppfd.max + ' µmol/m²/s</p>';
    }
    out.innerHTML = html;
  }

  function refreshPremiumGeneticaHint() {
    const out = el('setupPremiumGeneticaHint');
    if (!out) return;
    const p = ensurePremiumSetup();
    const met = p.metodoCultivo === 'sog' ? 'SOG (plantas bajas, muchas macetas)' : 'SCROG (red, pocas plantas, sativas)';
    const gen = p.geneticaPref === 'auto' ? 'Autoflorecientes: ciclo fijo, evita trasplantes tardíos.' : 'Fotoperíodo: controlas veg con 18/6 y flor con 12/12.';
    out.innerHTML = '<p>' + met + '</p><p>' + gen + '</p>';
  }

  function togglePremiumGermPaso(id) {
    const p = ensurePremiumSetup();
    if (!p.germinacionChecklist) p.germinacionChecklist = {};
    p.germinacionChecklist[id] = !p.germinacionChecklist[id];
    refreshPremiumGerminacionUI();
  }

  function refreshPremiumEntornoUI() {
    const p = ensurePremiumSetup();
    const int = p.entorno !== 'exterior';
    el('setupPremiumLocInterior')?.classList.toggle('selected', int);
    el('setupPremiumLocExterior')?.classList.toggle('selected', !int);
    el('setupPremiumSalaInterior')?.classList.toggle('setup-hidden', !int);
    el('setupPremiumExteriorHint')?.classList.toggle('setup-hidden', int);
    const chk = el('setupPremiumCarpaReflectante');
    if (chk) chk.checked = !!p.carpaReflectante;
  }

  function refreshPremiumMetodoUI() {
    const m = ensurePremiumSetup().metodoCultivo || 'scrog';
    el('setupPremiumMetodoSOG')?.classList.toggle('selected', m === 'sog');
    el('setupPremiumMetodoSCROG')?.classList.toggle('selected', m === 'scrog');
  }

  function refreshPremiumGerminacionUI() {
    const p = ensurePremiumSetup();
    const orig = p.origenPlanta || 'semilla';
    const esSemilla = orig === 'semilla';
    const esClon = orig === 'clon';
    const esMadre = orig === 'madre';
    el('setupPremiumOrigenSemilla')?.classList.toggle('selected', esSemilla);
    el('setupPremiumOrigenClon')?.classList.toggle('selected', esClon);
    el('setupPremiumOrigenMadre')?.classList.toggle('selected', esMadre);
    const sec = el('setupPremiumGerminacionPasos');
    if (!sec) {
      if (typeof renderEsquejesSetupUI === 'function') renderEsquejesSetupUI();
      return;
    }
    if (esClon) {
      sec.innerHTML =
        '<div class="setup-box-warn">Clon en rockwool/jiffy → net pot cuando asome la raíz. EC inicial 300–500 µS.</div>';
    } else if (esMadre) {
      sec.innerHTML =
        '<div class="setup-box-info">Cubo dedicado en DWC/RDWC · <strong>18/6</strong> permanente. ' +
        'Tras 5–6 sem en veg estable, toma esquejes cada 10–14 d sin volver a sembrar.</div>';
    } else {
      const done = p.germinacionChecklist || {};
      sec.innerHTML = GERMINACION_HIDRO_PASOS.map(function (paso) {
        const ok = !!done[paso.id];
        return (
          '<button type="button" class="equip-card equip-card-pad-12' + (ok ? ' selected' : '') +
          '" onclick="togglePremiumGermPaso(\'' + paso.id + '\')" aria-pressed="' + (ok ? 'true' : 'false') + '">' +
          '<div class="setup-option-title-md">' + paso.titulo + '</div>' +
          '<div class="setup-option-desc-sm">' + paso.desc + '</div></button>'
        );
      }).join('');
    }
    if (typeof renderEsquejesSetupUI === 'function') renderEsquejesSetupUI();
  }

  function populatePremiumTentSelect() {
    const sel = el('setupPremiumTentPreset');
    if (!sel || sel.options.length > 1) return;
    const list = typeof GROW_ROOM_TENTS !== 'undefined' ? GROW_ROOM_TENTS : [];
    sel.innerHTML = '<option value="">Medidas personalizadas</option>' +
      list.map(function (t) {
        return '<option value="' + t.id + '">' + t.nombre + ' · ' + t.plantasTip + ' pl.</option>';
      }).join('');
  }

  function persistPremiumSetupFromUI() {
    const p = ensurePremiumSetup();
    p.anchoM = numVal('setupPremiumAnchoM');
    p.largoM = numVal('setupPremiumLargoM');
    p.altoM = numVal('setupPremiumAltoM');
    p.ledW = numVal('setupPremiumLedW');
    p.extractorM3h = numVal('setupPremiumExtractorM3h');
    p.faseSala = String(el('setupPremiumFase')?.value || 'vegetativo');
    p.tentPreset = String(el('setupPremiumTentPreset')?.value || '');
    p.carpaReflectante = !!el('setupPremiumCarpaReflectante')?.checked;
    p.horasLuz = parseInt(String(el('setupPremiumHorasLuz')?.value || p.horasLuz || 18), 10) || 18;
    p.intensidadLuz = String(el('setupPremiumIntensidadLuz')?.value || 'media');
    if (typeof setupData !== 'undefined') setupData.ubicacion = p.entorno;
  }

  function cargarPremiumSetupUI(pagina) {
    syncPremiumEntornoDesdeUbicacion();
    const p = ensurePremiumSetup();
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    if (cfg.premiumSetup) Object.assign(p, cfg.premiumSetup);
    if (cfg.growRoomAnchoM && !p.anchoM) p.anchoM = cfg.growRoomAnchoM;
    if (cfg.growRoomLargoM && !p.largoM) p.largoM = cfg.growRoomLargoM;
    if (cfg.growRoomAltoM && !p.altoM) p.altoM = cfg.growRoomAltoM;
    if (cfg.growRoomLedW && !p.ledW) p.ledW = cfg.growRoomLedW;
    if (cfg.growRoomExtractorM3h && !p.extractorM3h) p.extractorM3h = cfg.growRoomExtractorM3h;
    if (cfg.growRoomFase) p.faseSala = cfg.growRoomFase;
    if (cfg.growRoomTentPreset) p.tentPreset = cfg.growRoomTentPreset;

    populatePremiumTentSelect();
    const set = function (id, v) {
      const e = el(id);
      if (e && v != null && Number.isFinite(v)) e.value = String(v);
    };
    set('setupPremiumAnchoM', p.anchoM);
    set('setupPremiumLargoM', p.largoM);
    set('setupPremiumAltoM', p.altoM);
    set('setupPremiumLedW', p.ledW);
    set('setupPremiumExtractorM3h', p.extractorM3h);
    if (el('setupPremiumFase') && p.faseSala) el('setupPremiumFase').value = p.faseSala;
    if (el('setupPremiumTentPreset') && p.tentPreset) el('setupPremiumTentPreset').value = p.tentPreset;
    if (el('setupPremiumHorasLuz')) el('setupPremiumHorasLuz').value = String(p.horasLuz || 18);
    if (el('setupPremiumIntensidadLuz') && p.intensidadLuz) el('setupPremiumIntensidadLuz').value = p.intensidadLuz;

    seleccionarPremiumObjetivo(p.objetivo || 'autocultivo');
    refreshPremiumEntornoUI();
    refreshPremiumMetodoUI();
    seleccionarPremiumGenetica(p.geneticaPref || 'foto');
    refreshPremiumGerminacionUI();
    calcularPremiumSala();
    refreshPremiumClimaResumen();
    if (typeof renderEquipamientoPremiumUI === 'function') renderEquipamientoPremiumUI();

    if (pagina === SETUP_PAGE_PREMIUM_6) refreshPremiumGerminacionUI();
    if (pagina === SETUP_PAGE_PREMIUM_3 && typeof renderEquipamientoPremiumUI === 'function') renderEquipamientoPremiumUI();
  }

  function persistPremiumSetupToConfig(cfg) {
    const p = ensurePremiumSetup();
    persistPremiumSetupFromUI();
    cfg.premiumSetup = JSON.parse(JSON.stringify(p));
    cfg.faseCultivoAmbiental = p.faseSala;
    if (p.entorno === 'interior') {
      cfg.growRoomAnchoM = p.anchoM;
      cfg.growRoomLargoM = p.largoM;
      cfg.growRoomAltoM = p.altoM;
      cfg.growRoomLedW = p.ledW;
      cfg.growRoomExtractorM3h = p.extractorM3h;
      cfg.growRoomFase = p.faseSala;
      cfg.growRoomTentPreset = p.tentPreset || '';
      const r = calcularPremiumSalaInterno();
      if (!r.error) {
        cfg.growRoomLedObjW = r.ledObj;
        cfg.growRoomExtractorObjM3h = r.m3hObj;
      }
      cfg.carpaReflectante = !!p.carpaReflectante;
    }
    cfg.origenPlanta = p.origenPlanta;
    cfg.metodoCultivo = p.metodoCultivo;
    cfg.geneticaPref = p.geneticaPref;
    cfg.ubicacion = p.entorno;
    if (typeof persistEsquejesToConfig === 'function') persistEsquejesToConfig(cfg);
    if (typeof persistEquipamientoToConfig === 'function') persistEquipamientoToConfig(cfg);
    if (Number.isFinite(p.horasLuz)) cfg.horasLuz = p.horasLuz;
    if (p.intensidadLuz) cfg.interiorIntensidadLuz = p.intensidadLuz;
  }

  function validarPremiumSetupPaso(pagina) {
    persistPremiumSetupFromUI();
    if (pagina === SETUP_PAGE_PREMIUM_3 && ensurePremiumSetup().entorno === 'interior') {
      const r = calcularPremiumSalaInterno();
      if (r.error) {
        if (typeof showToast === 'function') showToast(r.error, true);
        return false;
      }
    }
    return true;
  }

  function validarPlantasVsSalaPremium(numPlantas) {
    const p = ensurePremiumSetup();
    if (p.entorno !== 'interior') return { ok: true };
    const r = calcularPremiumSalaInterno();
    if (r.error || !Number.isFinite(r.area)) return { ok: true };
    const maxComfort = Math.max(1, Math.floor(r.area * 4));
    const n = Number(numPlantas) || 0;
    if (n > maxComfort) {
      return {
        ok: false,
        msg: n + ' plantas en ~' + r.area.toFixed(1) + ' m² puede ir justo (≤' + maxComfort + ' orientativo).',
      };
    }
    return { ok: true };
  }

  window.seleccionarPremiumObjetivo = seleccionarPremiumObjetivo;
  window.seleccionarPremiumEntorno = seleccionarPremiumEntorno;
  window.seleccionarPremiumOrigen = seleccionarPremiumOrigen;
  window.seleccionarPremiumMetodo = seleccionarPremiumMetodo;
  window.seleccionarPremiumGenetica = seleccionarPremiumGenetica;
  window.togglePremiumCarpaReflectante = togglePremiumCarpaReflectante;
  window.aplicarPremiumTentPreset = aplicarPremiumTentPreset;
  window.calcularPremiumSala = calcularPremiumSala;
  window.refreshPremiumClimaResumen = refreshPremiumClimaResumen;
  window.togglePremiumGermPaso = togglePremiumGermPaso;
  window.cargarPremiumSetupUI = cargarPremiumSetupUI;
  window.persistPremiumSetupToConfig = persistPremiumSetupToConfig;
  window.validarPremiumSetupPaso = validarPremiumSetupPaso;
  window.validarPlantasVsSalaPremium = validarPlantasVsSalaPremium;
  window.ensurePremiumSetup = ensurePremiumSetup;
})();
