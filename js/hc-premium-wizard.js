/**
 * HidroGrow — asistente premium 7 bloques (setup pasos 1–7).
 */
(function () {
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
        faseSala: 'esqueje',
        horasLuz: 18,
        intensidadLuz: 'baja',
        climaManual: false,
        climaPresetCamino: 'semilla_propagador',
        geneticaPref: 'foto',
        origenPlanta: 'semilla',
        caminoCultivo: 'semilla_propagador',
        germinacionModoPreferido: 'propagador',
        variedadGerminacion: '',
        numSemillasGerm: 6,
        sustratoGerm: 'lana',
        bandejaGerm: 'auto',
        numSemillasGermManual: false,
        germinacionChecklist: {},
        metodoCultivo: 'scrog',
        metodoManual: false,
        geneticaManual: false,
        consejosModoUi: 'principiante',
      };
    }
    return setupData.premium;
  }

  function syncPremiumEntornoDesdeUbicacion() {
    const p = ensurePremiumSetup();
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const esNueva = typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre;
    if (!esNueva && cfg.premiumSetup && (cfg.premiumSetup.entorno === 'interior' || cfg.premiumSetup.entorno === 'exterior')) {
      p.entorno = cfg.premiumSetup.entorno;
      if (typeof setupData !== 'undefined') {
        setupData.ubicacion = p.entorno;
        if (typeof setupUbicacion !== 'undefined') setupUbicacion = p.entorno;
      }
      return;
    }
    if (p.entorno === 'interior' || p.entorno === 'exterior') {
      if (typeof setupData !== 'undefined') {
        setupData.ubicacion = p.entorno;
        if (typeof setupUbicacion !== 'undefined') setupUbicacion = p.entorno;
      }
      return;
    }
    if (typeof setupData !== 'undefined' && setupData.ubicacion) {
      p.entorno = setupData.ubicacion === 'exterior' ? 'exterior' : 'interior';
    }
  }

  function seleccionarPremiumObjetivo(obj) {
    ensurePremiumSetup().objetivo = obj === 'experimento' ? 'experimento' : 'autocultivo';
    el('setupPremiumObjAutocultivo')?.classList.toggle('selected', obj !== 'experimento');
    el('setupPremiumObjExperimento')?.classList.toggle('selected', obj === 'experimento');
  }

  function refreshPremiumEntornoMeteoUI() {
    const p = ensurePremiumSetup();
    const int = p.entorno !== 'exterior';
    el('setupPremiumEntornoMeteoWrap')?.classList.toggle('setup-hidden', int);
    el('setupPremiumEntornoMeteoHintInt')?.classList.toggle('setup-hidden', !int);
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    if (typeof setupData !== 'undefined' && !setupData.ciudad && cfg.ciudad) {
      setupData.ciudad = cfg.ciudad;
      setupData.lat = cfg.lat;
      setupData.lon = cfg.lon;
    }
    const nombre =
      (typeof setupData !== 'undefined' && setupData.ciudad) || cfg.ciudad || '';
    const lat =
      typeof setupData !== 'undefined' && setupData.lat != null
        ? setupData.lat
        : cfg.lat;
    const lon =
      typeof setupData !== 'undefined' && setupData.lon != null
        ? setupData.lon
        : cfg.lon;
    const input = el('setupPremiumCiudadMeteo');
    if (input && nombre) input.value = nombre;
    const uiSel = el('setupPremiumCiudadMeteoSeleccionada');
    const uiRes = el('setupPremiumCiudadMeteoResultados');
    if (uiRes) uiRes.classList.add('setup-hidden');
    if (nombre && uiSel) {
      if (typeof renderCiudadSetupConfirmado === 'function') {
        renderCiudadSetupConfirmado(
          { sel: uiSel, res: uiRes, input: input },
          nombre,
          lat,
          lon
        );
      } else {
        uiSel.classList.remove('setup-hidden');
      }
    } else if (uiSel) {
      uiSel.classList.add('setup-hidden');
    }
  }

  function seleccionarPremiumEntorno(entorno) {
    const p = ensurePremiumSetup();
    p.entorno = entorno === 'exterior' ? 'exterior' : 'interior';
    if (typeof setupData !== 'undefined') {
      setupData.ubicacion = p.entorno;
      setupUbicacion = p.entorno;
    }
    refreshPremiumEntornoUI();
    if (typeof renderEquipamientoPremiumUI === 'function') renderEquipamientoPremiumUI();
    if (typeof refreshSetupEquipEntornoVis === 'function') refreshSetupEquipEntornoVis();
  }

  function seleccionarPremiumOrigen(origen) {
    const o = origen === 'clon' ? 'clon' : origen === 'madre' ? 'madre' : 'semilla';
    const p = ensurePremiumSetup();
    p.origenPlanta = o;
    if (!p.caminoCultivo && typeof inferCaminoFromOrigen === 'function') {
      p.caminoCultivo = inferCaminoFromOrigen(o, p.germinacionModoPreferido);
    }
    if (typeof persistOrigenASetupData === 'function') persistOrigenASetupData(o);
    aplicarRecomendacionPremiumPorOrigen(o);
    if (typeof refreshPremiumOrigenPasoUI === 'function') refreshPremiumOrigenPasoUI();
    refreshPremiumGerminacionUI();
    refreshPremiumMetodoOrigenHint();
    if (typeof refreshPremiumSemilleroVis === 'function') refreshPremiumSemilleroVis();
    if (typeof refreshPremiumGeneticaGermVis === 'function') refreshPremiumGeneticaGermVis();
    if (typeof renderEquipamientoPremiumUI === 'function') renderEquipamientoPremiumUI();
    if (typeof refreshSetupEquipOrigenBanner === 'function') refreshSetupEquipOrigenBanner();
  }

  const ORIGEN_RECOMENDACIONES = {
    clon: {
      metodoCultivo: 'sog',
      geneticaPref: 'foto',
      recoOrigen:
        '<strong>Esqueje:</strong> sin las 6 fases de semilla. Enraizado en propagador → net pot → mismo DWC/RDWC → floración.',
      recoPaso6:
        'Checklist de corte y domo en este paso. Recomendación: <strong>SOG + fotoperíodo</strong>.',
      recoPaso5:
        'Origen <strong>esqueje</strong>: SOG + foto en Genética y método.',
    },
    semilla: {
      recoOrigen:
        '<strong>Semilla:</strong> no necesitas la sala LED al máximo el día 1 — sí propagador/domo y rockwool. ' +
        'Las <strong>6 fases</strong> las sigues en <strong>Inicio</strong>; luego traslado al DWC/RDWC y floración.',
      recoPaso6:
        'Marca <strong>genética</strong> y semillero (opcional). El propagador va en <strong>Espacio y equipamiento</strong>.',
      recoPaso5:
        'SOG/SCROG y foto/auto en el paso Genética y método.',
    },
    madre: {
      geneticaPref: 'foto',
      recoOrigen:
        '<strong>Madre:</strong> cubo en hidro a 18/6 (no floración de cosecha). Los esquejes que saques siguen el camino de <strong>clon</strong>.',
      recoPaso6:
        'Mantén la madre y planifica cortes. Los esquejes van a SOG/SCROG según Genética y método.',
      recoPaso5:
        'Madre siempre <strong>fotoperíodo 18/6</strong>.',
    },
  };

  function aplicarRecomendacionPremiumPorOrigen(origen) {
    const p = ensurePremiumSetup();
    const rec = ORIGEN_RECOMENDACIONES[origen] || ORIGEN_RECOMENDACIONES.semilla;
    let cambios = [];
    if (rec.metodoCultivo && !p.metodoManual) {
      p.metodoCultivo = rec.metodoCultivo;
      cambios.push('SOG');
      refreshPremiumMetodoUI();
    }
    if (rec.geneticaPref && !p.geneticaManual) {
      p.geneticaPref = rec.geneticaPref;
      cambios.push('fotoperíodo');
      el('setupPremiumGenFoto')?.classList.toggle('selected', rec.geneticaPref === 'foto');
      el('setupPremiumGenAuto')?.classList.toggle('selected', rec.geneticaPref === 'auto');
      refreshPremiumGeneticaHint();
    }
    p.ultimaRecoOrigen = origen;
    p.ultimaRecoAplicada = cambios.length > 0;
    refreshPremiumOrigenRecoUI(origen, cambios);
  }

  function refreshPremiumOrigenRecoUI(origen, cambios) {
    const box = el('setupPremiumOrigenReco');
    if (!box) return;
    box.classList.add('setup-hidden');
    box.innerHTML = '';
  }

  function refreshPremiumMetodoOrigenHint() {
    const hint = el('setupPremiumMetodoOrigenHint');
    if (!hint) return;
    if (
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm()
    ) {
      hint.classList.add('setup-hidden');
      hint.innerHTML = '';
      return;
    }
    const p = ensurePremiumSetup();
    const orig = p.origenPlanta || 'semilla';
    const rec = ORIGEN_RECOMENDACIONES[orig] || {};
    const txt = rec.recoPaso5 || '';
    if (!txt) {
      hint.classList.add('setup-hidden');
      hint.innerHTML = '';
      return;
    }
    hint.classList.remove('setup-hidden');
    hint.innerHTML = '<p class="setup-metodo-hint-l1">' + txt + '</p>';
  }

  const METODO_HINTS = {
    sog: {
      l1: '<strong>SOG</strong> (Sea of Green): muchas plantas bajas y juntas; veg corto y una cola principal por maceta.',
      l2: 'Más plantas/m², menos altura. Ideal para índicas, autos y salas compactas.',
    },
    scrog: {
      l1: '<strong>SCROG</strong> (Screen of Green): pocas plantas guiadas con red/pantalla ~40 cm sobre el sustrato.',
      l2: 'Copa plana y uniforme. Ideal para sativas e híbridas altas; menos macetas, más tiempo en veg.',
    },
  };

  function seleccionarPremiumMetodo(metodo) {
    const p = ensurePremiumSetup();
    p.metodoCultivo = metodo === 'sog' ? 'sog' : 'scrog';
    p.metodoManual = true;
    refreshPremiumMetodoUI();
    refreshPremiumGeneticaHint();
  }

  function seleccionarPremiumGenetica(pref) {
    const p = ensurePremiumSetup();
    p.geneticaPref = pref === 'auto' ? 'auto' : 'foto';
    p.geneticaManual = true;
    el('setupPremiumGenFoto')?.classList.toggle('selected', pref !== 'auto');
    el('setupPremiumGenAuto')?.classList.toggle('selected', pref === 'auto');
    refreshPremiumGeneticaHint();
    if (typeof refreshPremiumGeneticaGermVis === 'function') refreshPremiumGeneticaGermVis();
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

  function numValDomOrMem(inputId, memVal) {
    const n = numVal(inputId);
    if (Number.isFinite(n)) return n;
    if (Number.isFinite(memVal)) return memVal;
    return NaN;
  }

  function salaTieneMedidasDesdeEquipamiento(cfg) {
    cfg = cfg || (typeof getWizardEquipCfg === 'function' ? getWizardEquipCfg() : ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {}));
    const inst = cfg.equipamientoInstalado || {};
    const arm = inst.armario && inst.armario.specs ? inst.armario.specs : null;
    if (!arm) return false;
    const ancho = Number(arm.anchoM);
    const largo = Number(arm.largoM);
    return Number.isFinite(ancho) && ancho > 0 && Number.isFinite(largo) && largo > 0;
  }

  /** Antes de guardar: medidas de sala interior desde catálogo, premium o default 1.2×1.2 m. */
  function hcAsegurarMedidasSalaInteriorAntesGuardar() {
    const p = ensurePremiumSetup();
    if (!p || p.entorno === 'exterior') return;
    try {
      if (typeof syncSalaMedidasDesdeEquipamientoInstalado === 'function') {
        syncSalaMedidasDesdeEquipamientoInstalado();
      }
    } catch (_) {}
    persistPremiumSetupFromUI();
    const cfgW =
      typeof getWizardEquipCfg === 'function'
        ? getWizardEquipCfg()
        : (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (salaTieneMedidasDesdeEquipamiento(cfgW)) return;
    const r = calcularPremiumSalaInterno();
    if (!r.error) return;
    p.anchoM = 1.2;
    p.largoM = 1.2;
    if (!Number.isFinite(p.altoM) || p.altoM <= 0) p.altoM = 2;
    const setIfEmpty = (id, val) => {
      const node = el(id);
      if (node && !String(node.value || '').trim()) node.value = String(val);
    };
    setIfEmpty('setupPremiumAnchoM', p.anchoM);
    setIfEmpty('setupPremiumLargoM', p.largoM);
    setIfEmpty('setupPremiumAltoM', p.altoM);
  }

  function calcularPremiumSalaInterno() {
    const p = ensurePremiumSetup();
    const cfgTor = typeof getWizardEquipCfg === 'function' ? getWizardEquipCfg() : ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    const inst = cfgTor.equipamientoInstalado || {};
    const armSpecs = inst.armario && inst.armario.specs ? inst.armario.specs : null;
    const ledSpecs = inst.led && inst.led.specs ? inst.led.specs : null;
    const extSpecs = inst.extractor && inst.extractor.specs ? inst.extractor.specs : null;
    const ancho = numValDomOrMem('setupPremiumAnchoM', armSpecs && armSpecs.anchoM);
    const largo = numValDomOrMem('setupPremiumLargoM', armSpecs && armSpecs.largoM);
    const alto = numValDomOrMem('setupPremiumAltoM', armSpecs && armSpecs.altoM);
    const ledW = numValDomOrMem('setupPremiumLedW', ledSpecs && ledSpecs.watts);
    const extM3h = numValDomOrMem('setupPremiumExtractorM3h', extSpecs && extSpecs.m3h);
    const anchoEff = Number.isFinite(ancho) ? ancho : (Number.isFinite(p.anchoM) ? p.anchoM : NaN);
    const largoEff = Number.isFinite(largo) ? largo : (Number.isFinite(p.largoM) ? p.largoM : NaN);
    const altoEff = Number.isFinite(alto) ? alto : (Number.isFinite(p.altoM) ? p.altoM : NaN);
    const ledWEff = Number.isFinite(ledW) ? ledW : (Number.isFinite(p.ledW) ? p.ledW : NaN);
    const extM3hEff = Number.isFinite(extM3h) ? extM3h : (Number.isFinite(p.extractorM3h) ? p.extractorM3h : NaN);
    const fase = String(el('setupPremiumFase')?.value || p.faseSala || 'vegetativo');
    p.anchoM = Number.isFinite(anchoEff) ? anchoEff : null;
    p.largoM = Number.isFinite(largoEff) ? largoEff : null;
    p.altoM = Number.isFinite(altoEff) ? altoEff : null;
    p.ledW = Number.isFinite(ledWEff) ? ledWEff : null;
    p.extractorM3h = Number.isFinite(extM3hEff) ? extM3hEff : null;
    p.faseSala = fase;

    if (!Number.isFinite(anchoEff) || !Number.isFinite(largoEff) || anchoEff <= 0 || largoEff <= 0) {
      return { error: 'Indica ancho y largo de la sala (m) o elige carpa/armario en el catálogo.' };
    }
    const area = anchoEff * largoEff;
    const vol = area * (Number.isFinite(altoEff) && altoEff > 0 ? altoEff : 2);
    const wM2 = (typeof GROW_ROOM_W_M2 !== 'undefined' && GROW_ROOM_W_M2[fase]) || GROW_ROOM_W_M2.vegetativo;
    const ledObj = Math.round(area * wM2.obj);
    const ledMin = Math.round(area * wM2.min);
    const ledMax = Math.round(area * wM2.max);
    const densidad = Number.isFinite(ledWEff) && ledWEff > 0 ? ledWEff / area : null;
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

  /** Valores de clima/luz alineados con cada camino (domo, cubo, enraizado, madre). */
  const CLIMATE_PRESETS_BY_CAMINO = {
    semilla_propagador: {
      faseSala: 'esqueje',
      horasLuz: 18,
      intensidadLuz: 'baja',
      subtitle: '',
      resumenExtra:
        'Domo: HR <strong>70–80 %</strong>, ventilar <strong>2×/día</strong> (5 min), luz <strong>suave 18/6</strong> (no saturar plántulas).',
    },
    semilla_hidro: {
      faseSala: 'esqueje',
      horasLuz: 18,
      intensidadLuz: 'baja',
      subtitle:
        'Orientado a <strong>germinación en cubo</strong> (microdomo o HR alta). Subirás intensidad en veg de sala.',
      resumenExtra: 'Cubo con domo mini: luz tenue, T° agua 20–24 °C, HR alta en el microclima.',
    },
    esqueje_hidro: {
      faseSala: 'esqueje',
      horasLuz: 18,
      intensidadLuz: 'baja',
      subtitle: 'Clima para <strong>enraizado</strong> de esquejes bajo domo.',
      resumenExtra: 'Enraizado: HR 70–80 %, ventilar domo 2×/día, luz suave 18/6.',
    },
    madre_hidro: {
      faseSala: 'vegetativo',
      horasLuz: 18,
      intensidadLuz: 'media',
      subtitle: 'Madre en hidro: <strong>18/6 permanente</strong> (sin floración de cosecha).',
      resumenExtra: 'Planta madre: fotoperíodo estable 18/6 y VPD de vegetativo.',
    },
  };

  function getPremiumClimaPresetForCamino(caminoId) {
    return CLIMATE_PRESETS_BY_CAMINO[caminoId] || null;
  }

  function needsPremiumClimaPresetApply(cam, p) {
    if (!cam || !CLIMATE_PRESETS_BY_CAMINO[cam]) return false;
    if (p.climaManual) return false;
    if (p.climaPresetCamino !== cam) return true;
    const preset = CLIMATE_PRESETS_BY_CAMINO[cam];
    if (
      cam === 'semilla_propagador' &&
      (p.faseSala === 'vegetativo' || p.faseSala === 'floracion' || p.faseSala === 'prefloracion') &&
      p.intensidadLuz !== 'baja'
    ) {
      return true;
    }
    return (
      p.faseSala !== preset.faseSala ||
      Number(p.horasLuz) !== preset.horasLuz ||
      p.intensidadLuz !== preset.intensidadLuz
    );
  }

  function aplicarPremiumClimaPorCamino(caminoId, opts) {
    opts = opts || {};
    const preset = getPremiumClimaPresetForCamino(caminoId);
    if (!preset) return;
    const p = ensurePremiumSetup();
    if (p.climaManual && !opts.force) return;
    p.faseSala = preset.faseSala;
    p.horasLuz = preset.horasLuz;
    p.intensidadLuz = preset.intensidadLuz;
    p.climaPresetCamino = caminoId;
    if (el('setupPremiumFase')) el('setupPremiumFase').value = preset.faseSala;
    if (el('setupPremiumHorasLuz')) el('setupPremiumHorasLuz').value = String(preset.horasLuz);
    if (el('setupPremiumIntensidadLuz')) el('setupPremiumIntensidadLuz').value = preset.intensidadLuz;
    refreshPremiumClimaCaminoUI();
    if (typeof calcularPremiumSala === 'function') calcularPremiumSala();
    else refreshPremiumClimaResumen();
  }

  function marcarPremiumClimaManual() {
    ensurePremiumSetup().climaManual = true;
  }

  function refreshPremiumClimaCaminoUI() {
    const cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : '';
    const preset = getPremiumClimaPresetForCamino(cam);
    const sub = el('setupPremiumClimaSubtitle');
    if (sub) {
      var ocultarSubClima =
        cam === 'semilla_propagador' &&
        typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
        hcCaminoSemillaPropagadorSetupGerm();
      var textoSub = preset && preset.subtitle
        ? preset.subtitle
        : 'Fase y horas de luz → objetivos VPD y EC.';
      if (ocultarSubClima || !textoSub) {
        sub.innerHTML = '';
        sub.classList.add('setup-hidden');
      } else {
        sub.innerHTML = textoSub;
        sub.classList.remove('setup-hidden');
      }
    }
    const hint = el('setupPremiumClimaCaminoHint');
    if (hint) {
      var ocultarClimaHint =
        cam === 'semilla_propagador' &&
        typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
        hcCaminoSemillaPropagadorSetupGerm();
      if (ocultarClimaHint || !preset || !preset.resumenExtra) {
        hint.classList.add('setup-hidden');
        hint.innerHTML = '';
      } else {
        hint.classList.remove('setup-hidden');
        hint.innerHTML = preset.resumenExtra;
      }
    }
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
    const cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : '';
    const preset = getPremiumClimaPresetForCamino(cam);
    if (preset && preset.resumenExtra && !p.climaManual) {
      html += '<p class="setup-field-hint">' + preset.resumenExtra + '</p>';
    }
    out.innerHTML = html;
    refreshPremiumClimaCaminoUI();
  }

  function refreshPremiumMetodoHint() {
    const out = el('setupPremiumMetodoHint');
    if (!out) return;
    if (
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm()
    ) {
      out.classList.add('setup-hidden');
      out.innerHTML = '';
      return;
    }
    const m = ensurePremiumSetup().metodoCultivo || 'scrog';
    const h = METODO_HINTS[m] || METODO_HINTS.scrog;
    out.innerHTML = '<p class="setup-metodo-hint-l1">' + h.l1 + '</p><p class="setup-metodo-hint-l2">' + h.l2 + '</p>';
  }

  function refreshPremiumGeneticaHint() {
    const out = el('setupPremiumGeneticaHint');
    if (!out) return;
    const p = ensurePremiumSetup();
    const orig = p.origenPlanta || 'semilla';
    let gen =
      p.geneticaPref === 'auto'
        ? 'Autoflorecientes: ciclo fijo · evita trasplantes tardíos.'
        : 'Fotoperíodo: controlas veg con 18/6 y flor con 12/12.';
    if (orig === 'clon') {
      gen += ' Los esquejes suelen ser de genética <strong>foto</strong>.';
    } else if (orig === 'madre') {
      gen += ' La madre debe ser <strong>fotoperíodo</strong> (18/6).';
    }
    out.innerHTML = '<p>' + gen + '</p>';
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
    var soloPropagador =
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm();
    el('setupPremiumSalaInterior')?.classList.toggle('setup-hidden', !int || soloPropagador);
    el('setupPremiumExteriorHint')?.classList.toggle('setup-hidden', int);
    const sub = el('setupPremium3Subtitle');
    if (sub) {
      const cam =
        typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : '';
      const faseGerm =
        typeof hcSetupEnFaseGerminacion === 'function' && hcSetupEnFaseGerminacion();
      const faseSala =
        typeof hcSetupEnFaseSalaPreGerm === 'function' && hcSetupEnFaseSalaPreGerm();
      if (
        (typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
          hcCaminoSemillaPropagadorSetupGerm()) ||
        (faseGerm && cam === 'semilla_propagador')
      ) {
        sub.textContent = '';
        sub.classList.add('setup-hidden');
      } else if (faseSala && (cam === 'semilla_propagador' || cam === 'semilla_hidro')) {
        sub.classList.remove('setup-hidden');
        sub.textContent =
          'Configura la sala (carpa, LED, clima, circulación). El propagador ya lo diste en la fase anterior.';
      } else if (int) {
        sub.classList.remove('setup-hidden');
        sub.textContent =
          'Catálogo agrupado: carpa, LED, filtro carbón, circulación, timer… Luego revisa medidas de sala.';
      } else {
        sub.classList.remove('setup-hidden');
        sub.textContent =
          'Prioriza medidor, toldo/malla y herramientas. El municipio para meteo lo indicas en Entorno de cultivo.';
      }
    }
    const chk = el('setupPremiumCarpaReflectante');
    if (chk) chk.checked = !!p.carpaReflectante;
    refreshPremiumEntornoMeteoUI();
  }

  function refreshPremiumMetodoUI() {
    const m = ensurePremiumSetup().metodoCultivo || 'scrog';
    el('setupPremiumMetodoSOG')?.classList.toggle('selected', m === 'sog');
    el('setupPremiumMetodoSCROG')?.classList.toggle('selected', m === 'scrog');
    refreshPremiumMetodoHint();
  }

  /** Paso 5 (SOG/SCROG + foto/auto) se fusiona en paso 6 para semilla en propagador. */
  function syncPremiumMetodoGenPlacement() {
    const bundle = el('setupPremiumMetodoGenBundle');
    const host = el('setupPremiumMetodoGenGermHost');
    const page5 = el('spagePremium5');
    if (!bundle || !host || !page5) return;
    const enGerm =
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm();
    const sub6 = el('setupPremium6Subtitle');
    if (enGerm) {
      host.classList.add('setup-hidden');
      host.innerHTML = '';
      if (sub6) {
        sub6.classList.add('setup-hidden');
        sub6.textContent = '';
      }
      if (typeof refreshPremiumMetodoHint === 'function') refreshPremiumMetodoHint();
      if (typeof refreshPremiumMetodoOrigenHint === 'function') refreshPremiumMetodoOrigenHint();
    } else {
      host.classList.add('setup-hidden');
      if (sub6) {
        sub6.innerHTML =
          'Ya elegiste el camino en el <strong>paso 1</strong>. Aquí: genética, semillero (semilla) o checklist de esquejes/madre. ' +
          'Con <strong>semilla</strong>, el día a día de las 6 fases va en <strong>Inicio → Germinación</strong>.';
      }
      if (bundle.parentNode !== page5) {
        const anchor = el('setupPremiumMetodoGenBundleAnchor');
        if (anchor && anchor.parentNode === page5) {
          page5.insertBefore(bundle, anchor.nextSibling);
        } else {
          const sub = page5.querySelector('.setup-subtitle');
          if (sub && sub.nextSibling) page5.insertBefore(bundle, sub.nextSibling);
          else page5.appendChild(bundle);
        }
      }
      host.classList.add('setup-hidden');
    }
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
    } else if (typeof hcGerminacionRenderSetupPreview === 'function') {
      if (typeof refreshPremiumGeneticaGermVis === 'function') refreshPremiumGeneticaGermVis();
      if (
        typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
        hcCaminoSemillaPropagadorSetupGerm()
      ) {
        sec.innerHTML = '';
      } else {
        hcGerminacionRenderSetupPreview();
      }
      if (typeof hcGerminacionActivarDesdeSetup === 'function') hcGerminacionActivarDesdeSetup();
    } else {
      sec.innerHTML =
        '<div class="setup-germ-intro setup-box-info setup-mb-12" role="note">' +
        'Con <strong>semilla</strong>, el seguimiento de las 6 fases va en <strong>Inicio</strong> cuando termines el asistente.</div>';
    }
    if (typeof renderEsquejesSetupUI === 'function') renderEsquejesSetupUI();
    if (typeof enhancePremiumVisualUI === 'function') enhancePremiumVisualUI(orig);
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

  function persistPremiumFieldFromUI(inputId, p, key) {
    const n = numVal(inputId);
    if (Number.isFinite(n)) {
      p[key] = n;
      return;
    }
    if (!Number.isFinite(p[key])) p[key] = null;
  }

  function persistPremiumSetupFromUI() {
    const p = ensurePremiumSetup();
    persistPremiumFieldFromUI('setupPremiumAnchoM', p, 'anchoM');
    persistPremiumFieldFromUI('setupPremiumLargoM', p, 'largoM');
    persistPremiumFieldFromUI('setupPremiumAltoM', p, 'altoM');
    persistPremiumFieldFromUI('setupPremiumLedW', p, 'ledW');
    persistPremiumFieldFromUI('setupPremiumExtractorM3h', p, 'extractorM3h');
    p.faseSala = String(el('setupPremiumFase')?.value || 'vegetativo');
    p.tentPreset = String(el('setupPremiumTentPreset')?.value || '');
    p.carpaReflectante = !!el('setupPremiumCarpaReflectante')?.checked;
    p.horasLuz = parseInt(String(el('setupPremiumHorasLuz')?.value || p.horasLuz || 18), 10) || 18;
    p.intensidadLuz = String(el('setupPremiumIntensidadLuz')?.value || 'media');
    if (typeof setupData !== 'undefined') {
      setupData.ubicacion = p.entorno === 'exterior' ? 'exterior' : 'interior';
    }
    if (typeof getConsejosModoSetupActivo === 'function') {
      p.consejosModoUi = getConsejosModoSetupActivo();
      setupData.consejosModoUi = p.consejosModoUi;
    }
    if (typeof persistPremiumGermPlanFromUI === 'function') persistPremiumGermPlanFromUI(true);
    if (typeof persistPremiumNutrienteGermFromUI === 'function') persistPremiumNutrienteGermFromUI();
  }

  function cargarPremiumSetupUI(pagina) {
    syncPremiumEntornoDesdeUbicacion();
    const p = ensurePremiumSetup();
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    if (cfg.premiumSetup && !(typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre)) {
      Object.assign(p, cfg.premiumSetup);
    }
    if (cfg.consejosModoUi === 'avanzado' || cfg.consejosModoUi === 'principiante') {
      p.consejosModoUi = cfg.consejosModoUi;
      if (typeof setupData !== 'undefined') setupData.consejosModoUi = cfg.consejosModoUi;
    }
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

    var camClima = typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : p.caminoCultivo || '';
    if (camClima && needsPremiumClimaPresetApply(camClima, p)) {
      aplicarPremiumClimaPorCamino(camClima, { force: true });
    } else {
      refreshPremiumClimaCaminoUI();
    }

    seleccionarPremiumObjetivo(p.objetivo || 'autocultivo');
    if (pagina === SETUP_PAGE_PREMIUM_1 && typeof seleccionarConsejosModoSetup === 'function') {
      const modoConsejos =
        p.consejosModoUi ||
        (typeof getConsejosModoSetupActivo === 'function' ? getConsejosModoSetupActivo() : null) ||
        cfg.consejosModoUi ||
        'principiante';
      seleccionarConsejosModoSetup(modoConsejos);
    }
    refreshPremiumEntornoUI();
    refreshPremiumMetodoUI();
    seleccionarPremiumGenetica(p.geneticaPref || 'foto');
    if (typeof refreshPremiumOrigenPasoUI === 'function') refreshPremiumOrigenPasoUI();
    refreshPremiumGerminacionUI();
    calcularPremiumSala();
    refreshPremiumClimaResumen();
    if (typeof renderEquipamientoPremiumUI === 'function') renderEquipamientoPremiumUI();
    if (typeof renderSemillerosGrid === 'function') renderSemillerosGrid();
    if (typeof renderSemilleroPerfilPanel === 'function') renderSemilleroPerfilPanel();
    if (typeof refreshPremiumSemilleroVis === 'function') refreshPremiumSemilleroVis();
    if (typeof refreshPremiumGeneticaGermVis === 'function') refreshPremiumGeneticaGermVis();
    if (typeof enhancePremiumVisualUI === 'function') enhancePremiumVisualUI(p.origenPlanta || 'semilla');
    refreshPremiumMetodoOrigenHint();
    refreshPremiumOrigenRecoUI(p.origenPlanta || 'semilla', []);
    syncPremiumMetodoGenPlacement();
    if (typeof syncPremiumGermPlanFromConfig === 'function') syncPremiumGermPlanFromConfig(cfg);
    if (typeof syncPremiumGermSectionPlacement === 'function') syncPremiumGermSectionPlacement();
    if (typeof renderPremiumGermPlanUI === 'function') renderPremiumGermPlanUI();
    if (typeof refreshSetupCaminoStepBanner === 'function') refreshSetupCaminoStepBanner(pagina);

    if (pagina === SETUP_PAGE_ORIGEN) {
      if (typeof refreshPremiumOrigenPasoUI === 'function') refreshPremiumOrigenPasoUI();
    }
    if (pagina === SETUP_PAGE_PREMIUM_6) {
      syncPremiumMetodoGenPlacement();
      refreshPremiumGerminacionUI();
      if (typeof renderSemillerosGrid === 'function') renderSemillerosGrid();
      if (typeof renderSemilleroPerfilPanel === 'function') renderSemilleroPerfilPanel();
      if (typeof refreshPremiumSemilleroVis === 'function') refreshPremiumSemilleroVis();
      if (typeof refreshPremiumGeneticaGermVis === 'function') refreshPremiumGeneticaGermVis();
    }
    if (pagina === SETUP_PAGE_PREMIUM_3) {
      if (typeof refreshSetupEquipOrigenBanner === 'function') refreshSetupEquipOrigenBanner();
      if (p.entorno !== 'exterior' && typeof syncSalaMedidasDesdeEquipamientoInstalado === 'function') {
        syncSalaMedidasDesdeEquipamientoInstalado();
      }
      refreshPremiumEntornoUI();
      if (typeof renderEquipamientoPremiumUI === 'function') renderEquipamientoPremiumUI();
      calcularPremiumSala();
    }
    if (typeof SETUP_PAGE_PREMIUM_4 !== 'undefined' && pagina === SETUP_PAGE_PREMIUM_4) {
      if (typeof syncPremiumNutrienteGermFromConfig === 'function') {
        syncPremiumNutrienteGermFromConfig(
          typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {}
        );
      }
      if (typeof refreshPremiumNutrienteGermSection === 'function') refreshPremiumNutrienteGermSection();
      if (typeof applyPremiumPropagadorPaso4Chrome === 'function') applyPremiumPropagadorPaso4Chrome();
      var camP4 = typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : '';
      if (camP4 && needsPremiumClimaPresetApply(camP4, p)) {
        aplicarPremiumClimaPorCamino(camP4, { force: true });
      } else {
        refreshPremiumClimaCaminoUI();
        refreshPremiumClimaResumen();
      }
    }
    if (typeof syncPremiumNutrienteGermFromConfig === 'function') {
      syncPremiumNutrienteGermFromConfig(
        typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {}
      );
    }
  }

  function persistPremiumSetupToConfig(cfg) {
    const p = ensurePremiumSetup();
    persistPremiumSetupFromUI();
    cfg.premiumSetup = JSON.parse(JSON.stringify(p));
    if (p.caminoCultivo) cfg.caminoCultivo = p.caminoCultivo;
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
    cfg.origenPlanta =
      typeof normalizarOrigenPlanta === 'function'
        ? normalizarOrigenPlanta(p.origenPlanta || 'semilla')
        : p.origenPlanta === 'clon' || p.origenPlanta === 'madre'
          ? p.origenPlanta
          : 'germinacion';
    cfg.metodoCultivo = p.metodoCultivo;
    cfg.geneticaPref = p.geneticaPref;
    cfg.ubicacion = p.entorno;
    if (typeof persistEsquejesToConfig === 'function') persistEsquejesToConfig(cfg);
    if (typeof persistEquipamientoToConfig === 'function') persistEquipamientoToConfig(cfg);
    if (typeof persistSemilleroToConfig === 'function') persistSemilleroToConfig(cfg);
    if (typeof syncVariedadGermATorre === 'function') {
      syncVariedadGermATorre(p.variedadGerminacion || '');
    }
    if (typeof persistPremiumGermPlanToConfig === 'function') persistPremiumGermPlanToConfig(cfg);
    if (typeof persistPremiumNutrienteGermToConfig === 'function') persistPremiumNutrienteGermToConfig(cfg);
    if (typeof hcGerminacionSyncDesdePremium === 'function') hcGerminacionSyncDesdePremium(cfg);
    if (typeof setupData !== 'undefined' && setupData.ciudad) {
      cfg.ciudad = setupData.ciudad;
      cfg.lat = setupData.lat;
      cfg.lon = setupData.lon;
      const firstM = String(setupData.ciudad).split(',')[0].trim();
      if (firstM) cfg.localidadMeteo = firstM;
    }
    if (Number.isFinite(p.horasLuz)) cfg.horasLuz = p.horasLuz;
    if (p.intensidadLuz) cfg.interiorIntensidadLuz = p.intensidadLuz;
    if (typeof inferLuzFromPremium === 'function') cfg.luz = inferLuzFromPremium(p);
    else if (p.entorno === 'exterior') cfg.luz = 'natural';
    else cfg.luz = 'led';
    if (typeof syncLuzDesdeEquipamiento === 'function') syncLuzDesdeEquipamiento(cfg, { force: true });
    if (typeof getConsejosModoSetupActivo === 'function') {
      cfg.consejosModoUi = getConsejosModoSetupActivo() === 'avanzado' ? 'avanzado' : 'principiante';
    } else {
      cfg.consejosModoUi = p.consejosModoUi === 'avanzado' ? 'avanzado' : 'principiante';
    }
  }

  function validarPremiumSetupPaso(pagina) {
    persistPremiumSetupFromUI();
    if (pagina === SETUP_PAGE_ORIGEN) {
      const cam =
        typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : '';
      if (!cam || typeof getCaminoDef !== 'function' || !getCaminoDef(cam)) {
        if (typeof showToast === 'function') showToast('Elige una de las cuatro rutas de cultivo', true);
        return false;
      }
    }
    if (pagina === SETUP_PAGE_PREMIUM_END) {
      if (typeof setupTipoInstalacion !== 'undefined' &&
          setupTipoInstalacion !== 'dwc' &&
          setupTipoInstalacion !== 'rdwc') {
        if (typeof showToast === 'function') showToast('Elige DWC o RDWC antes de continuar', true);
        return false;
      }
    }
    if (pagina === SETUP_PAGE_PREMIUM_2) {
      if (ensurePremiumSetup().entorno === 'exterior') {
        const sd = typeof setupData !== 'undefined' ? setupData : {};
        const hasCity =
          sd.ciudad &&
          Number.isFinite(sd.lat) &&
          Number.isFinite(sd.lon);
        if (!hasCity) {
          if (typeof showToast === 'function') {
            showToast('Indica y confirma el municipio para datos meteorológicos', true);
          }
          return false;
        }
      }
    }
    if (pagina === SETUP_PAGE_PREMIUM_3) {
      if (
        typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
        hcCaminoSemillaPropagadorSetupGerm()
      ) {
        if (
          typeof validarGeneticaGermObligatoria === 'function' &&
          !validarGeneticaGermObligatoria()
        ) {
          return false;
        }
        if (typeof validarPremiumGermPlan === 'function' && !validarPremiumGermPlan()) {
          return false;
        }
        return true;
      }
    }
    if (pagina === SETUP_PAGE_PREMIUM_6) {
      if (
        typeof requiereGeneticaGermEnSetup === 'function' &&
        requiereGeneticaGermEnSetup()
      ) {
        if (
          typeof validarGeneticaGermObligatoria === 'function' &&
          !validarGeneticaGermObligatoria()
        ) {
          return false;
        }
      }
    }
    if (pagina === SETUP_PAGE_PREMIUM_3 && ensurePremiumSetup().entorno === 'interior') {
      if (typeof window.salaTieneMedidasDesdeEquipamiento === 'function' &&
          window.salaTieneMedidasDesdeEquipamiento()) {
        return true;
      }
      const r = calcularPremiumSalaInterno();
      if (r.error) {
        if (typeof showToast === 'function') showToast(r.error, true);
        return false;
      }
    }
    if (
      typeof SETUP_PAGE_PREMIUM_4 !== 'undefined' &&
      pagina === SETUP_PAGE_PREMIUM_4 &&
      typeof validarPremiumNutrienteGerm === 'function' &&
      !validarPremiumNutrienteGerm()
    ) {
      return false;
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
  window.aplicarRecomendacionPremiumPorOrigen = aplicarRecomendacionPremiumPorOrigen;
  window.refreshPremiumMetodoOrigenHint = refreshPremiumMetodoOrigenHint;
  window.seleccionarPremiumMetodo = seleccionarPremiumMetodo;
  window.seleccionarPremiumGenetica = seleccionarPremiumGenetica;
  window.togglePremiumCarpaReflectante = togglePremiumCarpaReflectante;
  window.aplicarPremiumTentPreset = aplicarPremiumTentPreset;
  window.calcularPremiumSala = calcularPremiumSala;
  window.refreshPremiumClimaResumen = refreshPremiumClimaResumen;
  window.aplicarPremiumClimaPorCamino = aplicarPremiumClimaPorCamino;
  window.marcarPremiumClimaManual = marcarPremiumClimaManual;
  window.refreshPremiumClimaCaminoUI = refreshPremiumClimaCaminoUI;
  window.togglePremiumGermPaso = togglePremiumGermPaso;
  window.cargarPremiumSetupUI = cargarPremiumSetupUI;
  window.persistPremiumSetupToConfig = persistPremiumSetupToConfig;
  window.validarPremiumSetupPaso = validarPremiumSetupPaso;
  window.validarPlantasVsSalaPremium = validarPlantasVsSalaPremium;
  window.ensurePremiumSetup = ensurePremiumSetup;
  window.syncPremiumMetodoGenPlacement = syncPremiumMetodoGenPlacement;
  window.salaTieneMedidasDesdeEquipamiento = salaTieneMedidasDesdeEquipamiento;
  window.hcAsegurarMedidasSalaInteriorAntesGuardar = hcAsegurarMedidasSalaInteriorAntesGuardar;
})();
