/**
 * Germinación cannabis — perfil por genética (GENETICS_DB / CULTIVOS_DB).
 * Base por grupo (auto, índica, híbrida, sativa, CBD) + ajuste por cepa (nota, tipoFloracion, EC, dificultad).
 */

const GERMINACION_GRUPO = {
  auto: {
    osc: '1–3 d en domo húmedo 22–26 °C (papel, jiffy o rockwool).',
    emerg: '2–5 d hasta radícula visible.',
    planton: '10–14 d en cubo lana de roca pH 5.5 antes de net pot DWC.',
    nota: 'Autofloreciente: no trasplantar tarde; raíz estable desde inicio. NO semilla directa en depósito.',
  },
  indica: {
    osc: '1–3 d en germinador 22–26 °C.',
    emerg: '2–5 d.',
    planton: '12–18 d en lana de roca hasta raíz por fuera del cubo.',
    nota: 'Ruta hidro: rockwool → net pot + arcilla → DWC/RDWC con EC 400–600 µS inicial.',
  },
  hibrida: {
    osc: '1–3 d en germinador 22–26 °C.',
    emerg: '2–5 d.',
    planton: '12–20 d en rockwool antes de traslado.',
    nota: 'Vigilar estiramiento si luz baja; pH cubo 5.5 antes del sistema.',
  },
  sativa: {
    osc: '1–3 d; sativas largas pueden tardar 3–6 d en emergencia.',
    emerg: '3–7 d.',
    planton: '14–21 d; plantón vigoroso antes de net pot.',
    nota: 'Planifica altura en SCROG; no sumergir semilla en depósito DWC.',
  },
  cbd: {
    osc: '1–3 d en germinador.',
    emerg: '3–6 d.',
    planton: '14–20 d en rockwool.',
    nota: 'EC inicial más baja que genéticas THC altas.',
  },
};

/** Overrides manuales puntuales (se fusionan tras el cálculo por cepa). */
const GERMINACION_POR_NOMBRE = {
  'Amnesia Haze Auto': { planton: '12–18 d.', nota: 'Auto sativa larga: no retrasar traslado al net pot.' },
};

const HC_GRUPOS_GERMINACION = ['auto', 'indica', 'hibrida', 'sativa', 'cbd'];

const HC_GERMINACION_SESGO = {
  auto: { emerg: 0, planton: -2 },
  indica: { emerg: 0, planton: -1 },
  hibrida: { emerg: 0, planton: 0 },
  sativa: { emerg: 1, planton: 3 },
  cbd: { emerg: 0, planton: 1 },
};

function parseRangoDiasGerm(txt) {
  const s = String(txt || '');
  let m = s.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (m) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    return { min: a, max: b, medio: Math.round((a + b) / 2) };
  }
  m = s.match(/(\d+)/);
  if (m) {
    const n = parseInt(m[1], 10);
    return { min: n, max: n, medio: n };
  }
  return { min: 0, max: 0, medio: 0 };
}

function formatoRangoDiasGerm(min, max, sufijo) {
  const suf = sufijo ? ' ' + sufijo : '';
  if (min <= 0 && max <= 0) return '';
  if (min === max) return min + ' d' + suf;
  return min + '–' + max + ' d' + suf;
}

function ecInicialGerminacionUs(cultivo) {
  const ecMin = cultivo && Number(cultivo.ecMin);
  if (!Number.isFinite(ecMin) || ecMin <= 0) return 500;
  return Math.max(350, Math.min(650, Math.round(ecMin * 0.35)));
}

function etiquetaGrupoCannabisGerm(grupo) {
  const g = String(grupo || '').toLowerCase();
  const map = {
    auto: 'Autofloreciente',
    indica: 'Índica',
    hibrida: 'Híbrida',
    sativa: 'Sativa',
    cbd: 'CBD / perfil suave',
  };
  return map[g] || 'Híbrida';
}

function etiquetaTipoFloracionGerm(cultivo) {
  const t = cultivo && (cultivo.tipoFloracion || (cultivo.grupo === 'auto' ? 'auto' : 'foto'));
  return t === 'auto' ? 'Auto (fotoperiodo fijo)' : 'Fotoperiódica';
}

function buildGerminacionDesdeCultivo(cultivo) {
  if (!cultivo) return null;
  const grupo =
    cultivo.grupo && HC_GRUPOS_GERMINACION.indexOf(cultivo.grupo) >= 0 ? cultivo.grupo : 'hibrida';
  const base = Object.assign({}, GERMINACION_GRUPO[grupo]);
  const sesgo = HC_GERMINACION_SESGO[grupo] || { emerg: 0, planton: 0 };

  const emergR = parseRangoDiasGerm(base.emerg);
  const plantR = parseRangoDiasGerm(base.planton);

  let emergMed = emergR.medio + sesgo.emerg;
  let plantMed = plantR.medio + sesgo.planton;

  if (cultivo.tipoFloracion === 'auto' || grupo === 'auto') {
    plantMed = Math.max(9, plantMed - 1);
    emergMed = Math.max(2, emergMed);
  }
  const dif = String(cultivo.dificultad || '').toLowerCase();
  if (dif === 'fácil' || dif === 'facil') plantMed -= 1;
  if (dif === 'difícil' || dif === 'dificil' || dif === 'avanzada') plantMed += 2;

  const emergMin = Math.max(1, emergR.min + Math.min(0, sesgo.emerg));
  const emergMax = Math.max(emergMin, emergR.max + Math.max(0, sesgo.emerg));
  const plantMin = Math.max(8, plantMed - 2);
  const plantMax = Math.max(plantMin, plantMed + 2);

  const strainNota = String(cultivo.nota || '').trim();
  const diasPreHidro = Math.max(10, Math.min(28, Math.round(emergMed * 0.35 + plantMed * 0.65)));

  const spec = {
    osc: base.osc,
    emerg: formatoRangoDiasGerm(emergMin, emergMax, 'hasta radícula o emergencia'),
    planton: formatoRangoDiasGerm(plantMin, plantMax, 'en rockwool antes del net pot'),
    nota: strainNota ? base.nota + ' · ' + strainNota : base.nota,
    strainNota,
    nombreGenetica: cultivo.nombre || cultivo.id || '',
    idGenetica: cultivo.id || '',
    grupo,
    grupoLabel: etiquetaGrupoCannabisGerm(grupo),
    tipoFloracion: cultivo.tipoFloracion || (grupo === 'auto' ? 'auto' : 'foto'),
    tipoFloracionLabel: etiquetaTipoFloracionGerm(cultivo),
    abrev: cultivo.abrev || '',
    emoji: cultivo.emoji || '🌿',
    dificultad: cultivo.dificultad || '',
    diasEmergMedio: emergMed,
    diasPlantonMedio: plantMed,
    diasPreHidro,
    ecInicialUs: ecInicialGerminacionUs(cultivo),
    phCubo: '5.5',
  };

  const manual = GERMINACION_POR_NOMBRE[spec.nombreGenetica];
  if (manual) {
    if (manual.emerg) spec.emerg = manual.emerg;
    if (manual.planton) {
      spec.planton = manual.planton;
      const pr = parseRangoDiasGerm(manual.planton);
      if (pr.medio > 0) spec.diasPlantonMedio = pr.medio;
    }
    if (manual.osc) spec.osc = manual.osc;
    if (manual.nota) spec.nota = manual.nota;
  }

  return spec;
}

function resolveCultivoGerminacion(ref) {
  const key = String(ref || '').trim();
  if (!key) return null;
  if (typeof getCultivoDB === 'function') {
    const c = getCultivoDB(key);
    if (c && (typeof esCultivoCannabis !== 'function' || esCultivoCannabis(c))) return c;
  }
  return null;
}

function getGerminacionSpecPorVariedad(nombreVariedad) {
  const c = resolveCultivoGerminacion(nombreVariedad);
  if (c) return buildGerminacionDesdeCultivo(c);
  return Object.assign({}, GERMINACION_GRUPO.hibrida, {
    grupo: 'hibrida',
    grupoLabel: 'Híbrida',
    tipoFloracion: 'foto',
    tipoFloracionLabel: 'Fotoperiódica',
    diasEmergMedio: 4,
    diasPlantonMedio: 16,
    diasPreHidro: 17,
    ecInicialUs: 500,
    phCubo: '5.5',
  });
}

function getGerminacionDiasHitos(ref) {
  const spec = getGerminacionSpecPorVariedad(ref);
  return {
    emerg: spec.diasEmergMedio || 4,
    planton: spec.diasPlantonMedio || 16,
    preHidro: spec.diasPreHidro || 17,
  };
}

/** Metadatos de las 6 fases del hub (ids alineados con HC_GERMINACION_PASOS). */
const GERMINACION_FASES_CAL_META = [
  { id: 'semilla', paso: 1, tituloCorto: 'Germinador' },
  { id: 'taproot', paso: 2, tituloCorto: 'Radícula' },
  { id: 'rockwool', paso: 3, tituloCorto: 'Rockwool' },
  { id: 'domo', paso: 4, tituloCorto: 'Domo + luz' },
  { id: 'netpot', paso: 5, tituloCorto: 'Net pot' },
  { id: 'dwc', paso: 6, tituloCorto: 'Traslado DWC' },
];

/**
 * Reparte días orientativos entre las 6 fases según genética (no sustituye marcar la fase a mano).
 */
function getGerminacionFasesCalendario(ref) {
  const spec = getGerminacionSpecPorVariedad(ref);
  const osc = parseRangoDiasGerm(spec.osc);
  const emerg = spec.diasEmergMedio || 4;
  const plant = spec.diasPlantonMedio || 16;
  const totalObj = Math.max(10, spec.diasPreHidro || Math.round(emerg * 0.35 + plant * 0.65));

  const pesos = [
    Math.max(1, osc.medio || 2),
    Math.max(1, Math.round(emerg * 0.35)),
    Math.max(2, Math.round(emerg * 0.3)),
    Math.max(4, Math.round(plant * 0.45)),
    Math.max(2, Math.round(plant * 0.4)),
    1,
  ];
  let sumP = pesos.reduce(function (a, b) {
    return a + b;
  }, 0);
  const dias = pesos.map(function (p) {
    return Math.max(1, Math.round((p / sumP) * totalObj));
  });
  let sumD = dias.reduce(function (a, b) {
    return a + b;
  }, 0);
  while (sumD > totalObj) {
    const idx = dias[3] > 2 ? 3 : dias[4] > 2 ? 4 : 2;
    dias[idx]--;
    sumD--;
  }
  while (sumD < totalObj) {
    dias[3]++;
    sumD++;
  }

  let acum = 0;
  const fases = GERMINACION_FASES_CAL_META.map(function (meta, i) {
    const d = dias[i];
    const desde = acum + 1;
    acum += d;
    return Object.assign({}, meta, {
      dias: d,
      diasLabel: d === 1 ? '~1 d' : '~' + d + ' d',
      diaDesde: desde,
      diaHasta: acum,
    });
  });

  const emergR = parseRangoDiasGerm(spec.emerg);
  const plantR = parseRangoDiasGerm(spec.planton);
  const totalMin = Math.max(10, emergR.min + plantR.min - 2);
  const totalMax = Math.min(28, emergR.max + plantR.max + 2);

  return {
    spec: spec,
    fases: fases,
    totalOrientativo: totalObj,
    totalRangoLabel:
      totalMin === totalMax
        ? totalMin + ' d'
        : totalMin + '–' + totalMax + ' d',
    avisoManual:
      'Las 6 fases no avanzan solas: las marcas cuando la planta lo pide. Los días son guía según tu genética.',
  };
}

/**
 * Aviso si la fase actual supera días orientativos (por tiempo en fase o día global del camino).
 */
function getGerminacionAvisoRetrasoFase(ref, faseId, diasEnFase, diaSeguimiento) {
  const cal = getGerminacionFasesCalendario(ref);
  const f = cal.fases.find(function (x) {
    return x.id === faseId;
  });
  if (!f) return null;
  const enFase = Math.max(0, diasEnFase | 0);
  const diaCam = diaSeguimiento != null ? diaSeguimiento | 0 : 0;
  const porFase = enFase > f.dias + 1;
  const porCamino = diaCam > 0 && diaCam > f.diaHasta + 1;
  if (!porFase && !porCamino) return null;
  const motivo = porFase
    ? 'Llevas <strong>' +
      enFase +
      ' d</strong> en esta fase (orientativo ' +
      f.diasLabel +
      ').'
    : 'Vas por el <strong>día ' +
      diaCam +
      '</strong> del camino y esta fase suele cerrarse antes del día ' +
      (f.diaHasta + 1) +
      '.';
  return {
    faseId: f.id,
    fasePaso: f.paso,
    diasOrientativos: f.dias,
    mensaje:
      motivo +
      ' Revisa T°, HR y humedad del cubo; si la planta va bien, marca la fase completada. Si no avanza, cambia método o genética.',
  };
}

function renderGerminacionFasesCalendarioHtml(ref, opts) {
  const o = opts && typeof opts === 'object' ? opts : {};
  const cal = getGerminacionFasesCalendario(ref);
  const esc =
    typeof meteoEscHtml === 'function'
      ? meteoEscHtml
      : function (s) {
          return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
        };
  const tieneGenetica = !!(cal.spec && cal.spec.nombreGenetica);
  const nom = tieneGenetica
    ? esc(cal.spec.nombreGenetica)
    : 'perfil híbrida por defecto';
  const perfilNota = tieneGenetica
    ? ''
    : '<p class="hc-germ-fases-cal-default setup-field-hint">Sin genética en el asistente: usamos tiempos de <strong>híbrida fotoperiódica</strong>. Elige cepa en Configuración para afinar.</p>';
  const faseAct = o.faseId || '';
  const avisoRetraso =
    faseAct && typeof getGerminacionAvisoRetrasoFase === 'function'
      ? getGerminacionAvisoRetrasoFase(ref, faseAct, o.diasEnFase, o.diaSeguimiento)
      : null;
  const items = cal.fases
    .map(function (f) {
      const isCur = faseAct && f.id === faseAct;
      const isLate = isCur && avisoRetraso;
      return (
        '<li class="hc-germ-fases-cal-item' +
        (isCur ? ' hc-germ-fases-cal-item--current' : '') +
        (isLate ? ' hc-germ-fases-cal-item--late' : '') +
        '">' +
        '<span class="hc-germ-fases-cal-paso">' +
        f.paso +
        '</span>' +
        '<span class="hc-germ-fases-cal-nom">' +
        esc(f.tituloCorto) +
        (isCur ? ' <span class="hc-germ-fases-cal-ahora">(ahora)</span>' : '') +
        '</span>' +
        '<span class="hc-germ-fases-cal-dias">' +
        esc(f.diasLabel) +
        '</span>' +
        '<span class="hc-germ-fases-cal-rango">días ' +
        f.diaDesde +
        '–' +
        f.diaHasta +
        ' del camino</span></li>'
      );
    })
    .join('');

  const retrasoHtml = avisoRetraso
    ? '<div class="hc-germ-fases-cal-retraso setup-field-hint setup-field-hint--banner" role="status">' +
      '⏱ ' +
      avisoRetraso.mensaje +
      '</div>'
    : '';

  return (
    '<div class="hc-germ-fases-cal" role="region" aria-label="Días orientativos por fase">' +
    '<h4 class="hc-germ-block-lbl">Calendario orientativo · 6 fases</h4>' +
    '<p class="hc-germ-fases-cal-lead">' +
    esc(cal.avisoManual) +
    ' Para <strong>' +
    nom +
    '</strong>: unos <strong>' +
    cal.totalOrientativo +
    ' d</strong> hasta el traslado (rango típico ' +
    esc(cal.totalRangoLabel) +
    ').</p>' +
    perfilNota +
    retrasoHtml +
    '<ol class="hc-germ-fases-cal-list">' +
    items +
    '</ol></div>'
  );
}

/**
 * Tarea diaria orientada por genética + fase (cannabis).
 */
function getGerminacionTareaDia(ref, pasoId, modo) {
  const spec = getGerminacionSpecPorVariedad(ref);
  const g = spec.grupo || 'hibrida';
  const auto = spec.tipoFloracion === 'auto' || g === 'auto';
  const hidro = modo === 'hidro_directo';
  const ec = spec.ecInicialUs || 500;

  const porFase = {
    semilla: auto
      ? 'Auto: domo estable 22–26 °C; no retrasar después la entrada al net pot.'
      : g === 'sativa'
        ? 'Sativa: puede tardar más en asomar; paciencia sin secar el medio.'
        : 'Semilla en papel/jiffy o domo; T° 22–26 °C.',
    taproot: 'Radícula 5–10 mm: prepara cubo rockwool pH ' + (spec.phCubo || '5.5') + '; no tocar la punta.',
    rockwool: 'Cubo en net pot; EC depósito orientativa ~' + ec + ' µS cuando toque el agua.',
    domo: (hidro ? 'Microdomo sobre maceta; ' : 'Ventila domo 2×/día; ') + 'luz suave 18/6; HR 70–80 %.',
    netpot: auto
      ? 'Auto: raíz por fuera del cubo → net pot ya; no esperes plantón enorme.'
      : g === 'sativa'
        ? 'Sativa: plantón vigoroso antes de sumergir más raíz en el depósito.'
        : 'Raíz blanca visible por agujeros → sube nivel de agua poco a poco.',
    dwc: 'Checklist al hidro: EC ~' + ec + ' µS, pH 5.5–5.8, aireación activa.',
  };
  return porFase[pasoId] || 'Registra T°, HR y estado de la plántula en el diario del día.';
}

function getGerminacionHintFase(ref, pasoId) {
  const spec = getGerminacionSpecPorVariedad(ref);
  if (pasoId === 'semilla' || pasoId === 'taproot') return spec.osc || '';
  if (pasoId === 'rockwool' || pasoId === 'domo') return spec.emerg || '';
  if (pasoId === 'netpot' || pasoId === 'dwc') {
    const lead = spec.planton || '';
    if (pasoId === 'dwc' && spec.strainNota) return lead + ' — ' + spec.strainNota;
    return lead;
  }
  return spec.strainNota || spec.nota || '';
}

function renderGerminacionGeneticsCardHtml(ref) {
  const spec = getGerminacionSpecPorVariedad(ref);
  if (!spec.nombreGenetica) return '';
  const esc =
    typeof meteoEscHtml === 'function'
      ? meteoEscHtml
      : function (s) {
          return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
        };
  return (
    '<div class="hc-germ-genetics-card" role="region" aria-label="Perfil de genética">' +
    '<span class="hc-germ-genetics-emoji" aria-hidden="true">' +
    esc(spec.emoji) +
    '</span>' +
    '<div class="hc-germ-genetics-body">' +
    '<div class="hc-germ-genetics-name">' +
    esc(spec.nombreGenetica) +
    (spec.abrev ? ' <span class="hc-germ-genetics-abrev">(' + esc(spec.abrev) + ')</span>' : '') +
    '</div>' +
    '<div class="hc-germ-genetics-meta">' +
    esc(spec.grupoLabel) +
    ' · ' +
    esc(spec.tipoFloracionLabel) +
    (spec.dificultad ? ' · ' + esc(spec.dificultad) : '') +
    '</div>' +
    '<div class="hc-germ-genetics-times">' +
    'Emerg. ~<strong>' +
    spec.diasEmergMedio +
    ' d</strong> · Plantón ~<strong>' +
    spec.diasPlantonMedio +
    ' d</strong> · EC inicial ~<strong>' +
    spec.ecInicialUs +
    ' µS</strong>' +
    '</div>' +
    (function () {
      const r = getGerminacionRangosMonitoreo(ref, 'domo');
      return (
        '<div class="hc-germ-genetics-rangos">T° ' +
        r.temp.min +
        '–' +
        r.temp.max +
        ' °C · HR ' +
        r.hr.min +
        '–' +
        r.hr.max +
        '% · pH ~' +
        r.phObjetivo +
        '</div>'
      );
    })() +
    '</div></div>'
  );
}

function filtrarGeneticasGerminacionLista(filtroPref) {
  if (typeof CULTIVOS_DB === 'undefined' || !CULTIVOS_DB.length) return [];
  const pref = String(filtroPref || '').toLowerCase();
  return CULTIVOS_DB.filter(function (c) {
    if (!c || !c.id) return false;
    if (typeof esCultivoCannabis === 'function' && !esCultivoCannabis(c)) return false;
    const esAuto = c.grupo === 'auto' || c.tipoFloracion === 'auto';
    if (pref === 'auto') return esAuto;
    if (pref === 'foto') return !esAuto;
    return true;
  }).sort(function (a, b) {
    return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
  });
}

function listGeneticasGerminacionOptions(selectedId, filtroPref) {
  const esc =
    typeof meteoEscHtml === 'function'
      ? meteoEscHtml
      : function (s) {
          return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
        };
  const sel = String(selectedId || '');
  const list = filtrarGeneticasGerminacionLista(filtroPref);
  let html = '<option value="">— Elige genética —</option>';
  list.forEach(function (c) {
    html +=
      '<option value="' +
      esc(c.id) +
      '"' +
      (sel === c.id ? ' selected' : '') +
      '>' +
      esc(c.nombre || c.id) +
      ' · ' +
      esc(etiquetaGrupoCannabisGerm(c.grupo)) +
      '</option>';
  });
  return html;
}

function cultivoCoincideGeneticaPref(cultivo, filtroPref) {
  if (!cultivo || !filtroPref) return true;
  const esAuto = cultivo.grupo === 'auto' || cultivo.tipoFloracion === 'auto';
  if (filtroPref === 'auto') return esAuto;
  if (filtroPref === 'foto') return !esAuto;
  return true;
}

function etiquetaOrigenPlantaBreve(val) {
  const o = typeof normalizarOrigenPlanta === 'function' ? normalizarOrigenPlanta(val) : '';
  if (o === 'vivero') return '🏪 Vivero';
  if (o === 'germinacion') return '🫘 Germ. propia';
  if (o === 'clon') return '✂️ Esqueje';
  if (o === 'madre') return '🌿 Madre';
  return '';
}

function hcGerminacionPanelHtmlCompleto(nombreVariedad) {
  const nom = String(nombreVariedad || '').trim();
  const spec = getGerminacionSpecPorVariedad(nom);
  const esc = typeof meteoEscHtml === 'function' ? meteoEscHtml : (s) => String(s || '').replace(/</g, '&lt;').replace(/&/g, '&amp;');
  const cult = resolveCultivoGerminacion(nom);
  const diasOff =
    typeof getDiasPreHidroPorOrigen === 'function'
      ? getDiasPreHidroPorOrigen(cult, 'germinacion')
      : spec.diasPreHidro || 0;
  const lead = nom
    ? '<p class="hc-origen-hint-p">Perfil <strong>' +
      esc(spec.nombreGenetica || nom) +
      '</strong> · ' +
      esc(spec.grupoLabel) +
      ' · ' +
      esc(spec.tipoFloracionLabel) +
      '.</p>'
    : '<p class="hc-origen-hint-p"><strong>Elige una genética</strong> del catálogo HidroGrow.</p>';
  const pasos =
    '<p class="hc-origen-hint-p"><strong>Camino en HidroGrow (6 fases)</strong></p>' +
    '<ol class="hc-origen-hint-ol">' +
    '<li>Germinador → radícula 5–10 mm.</li>' +
    '<li>Rockwool pH 5.5 → domo + luz 18/6.</li>' +
    '<li>Net pot → DWC/RDWC (EC ~' +
    (spec.ecInicialUs || 500) +
    ' µS inicial).</li>' +
    '</ol>';
  const dl =
    '<dl class="hc-germ-spec-dl">' +
    '<dt>Oscuridad / uniformidad</dt><dd>' +
    esc(spec.osc) +
    '</dd>' +
    '<dt>Hasta emergencia</dt><dd>' +
    esc(spec.emerg) +
    ' <span class="hc-germ-spec-medio">(~' +
    spec.diasEmergMedio +
    ' d media)</span></dd>' +
    '<dt>Hasta plantón</dt><dd>' +
    esc(spec.planton) +
    ' <span class="hc-germ-spec-medio">(~' +
    spec.diasPlantonMedio +
    ' d media)</span></dd>' +
    (spec.nota ? '<dt>Nota cepa</dt><dd>' + esc(spec.nota) + '</dd>' : '') +
    '</dl>' +
    (diasOff > 0
      ? '<p class="hc-origen-hint-foot">Con germinación propia, la app suma ~' + diasOff + ' d al ciclo hasta el traslante al hidro.</p>'
      : '<p class="hc-origen-hint-foot">El sobre del breeder y la Tª real marcan el ritmo.</p>');
  const inner = lead + (nom ? renderGerminacionGeneticsCardHtml(nom) : '') + dl + pasos;
  const sum = nom ? 'Germinación · ' + esc(spec.nombreGenetica || nom) : 'Germinación cannabis';
  return typeof hcWrapOrigenDetails === 'function'
    ? hcWrapOrigenDetails(inner, sum, false)
    : inner;
}

function getGerminacionRangosMonitoreo(variedadId, faseId) {
  const spec = getGerminacionSpecPorVariedad(variedadId);
  const ecT = spec.ecInicialUs || 500;
  const phT = parseFloat(spec.phCubo) || 5.5;
  const grupo = spec.grupo || 'hibrida';
  let temp = { min: 22, max: 26, warnLow: 20, warnHigh: 28 };
  if (grupo === 'sativa') temp = { min: 22, max: 27, warnLow: 20, warnHigh: 29 };
  else if (grupo === 'indica' || grupo === 'cbd') temp = { min: 21, max: 25, warnLow: 19, warnHigh: 27 };
  else if (grupo === 'auto') temp = { min: 22, max: 26, warnLow: 21, warnHigh: 28 };
  const hr = { min: 70, max: 80, warnLow: 62, warnHigh: 88 };
  const ph = {
    min: phT - 0.12,
    max: phT + 0.12,
    warnLow: phT - 0.35,
    warnHigh: phT + 0.45,
  };
  const ec = {
    min: ecT - 80,
    max: ecT + 80,
    warnLow: ecT - 180,
    warnHigh: ecT + 200,
  };
  const vpd = { min: 0.45, max: 1.15, warnLow: 0.3, warnHigh: 1.45 };
  return { spec, ecObjetivo: ecT, phObjetivo: phT, temp, hr, ph, ec, vpd, faseId: faseId || 'semilla' };
}

/** Cuadros indispensables en Inicio según fase del camino y genética. */
function getGerminacionDashTilesPlan(cfg) {
  cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
  const g =
    typeof ensureGerminacionFlow === 'function' ? ensureGerminacionFlow(cfg) : cfg.germinacionFlow || {};
  const faseId =
    typeof hcGerminacionFaseActualId === 'function'
      ? hcGerminacionFaseActualId(cfg)
      : 'semilla';
  const vid = String(
    g.variedadId || (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) || ''
  ).trim();
  const r = getGerminacionRangosMonitoreo(vid, faseId);
  const tiles = [];

  function add(slot, key, label, unit, iconId) {
    tiles.push({
      slot,
      key,
      label,
      unit: unit || '',
      iconId: iconId || 'hc-i-therm',
      rango: r[key],
    });
  }

  add('EC', 'temp', 'T° domo', '°C', 'hc-i-therm');
  add('PH', 'hr', 'Humedad', '%', 'hc-i-droplet');

  if (faseId === 'taproot') {
    add('Temp', 'ph', 'pH cubo', '', 'hc-i-flask');
  } else if (faseId === 'rockwool' || faseId === 'netpot' || faseId === 'dwc') {
    add('Temp', 'ec', 'EC agua', 'µS', 'hc-i-bolt');
    add('Vol', 'ph', 'pH cubo', '', 'hc-i-flask');
  } else if (faseId === 'domo') {
    add('Temp', 'vpd', 'VPD', 'kPa', 'hc-i-wind');
  }

  const faseMeta = GERMINACION_FASES_CAL_META.find(function (x) {
    return x.id === faseId;
  });
  return {
    tiles,
    faseId,
    variedadId: vid,
    faseLabel: faseMeta ? faseMeta.tituloCorto : faseId,
    spec: r.spec,
    ecObjetivo: r.ecObjetivo,
    phObjetivo: r.phObjetivo,
    tempRango: r.temp,
    hrRango: r.hr,
  };
}

function getGerminacionLecturasParaDash(cfg) {
  cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
  const g =
    typeof ensureGerminacionFlow === 'function' ? ensureGerminacionFlow(cfg) : cfg.germinacionFlow || {};
  const domo = g.ultimaDomo || {};
  let temp = domo.temp;
  let hr = domo.hr;
  let vpd = domo.vpd;
  let ec = null;
  let ph = null;
  const reg = Array.isArray(g.registroDiario) && g.registroDiario.length ? g.registroDiario[0] : null;
  if (reg) {
    if (temp == null && reg.temp != null) temp = reg.temp;
    if (hr == null && reg.hr != null) hr = reg.hr;
    if (reg.nutEc != null) ec = reg.nutEc;
    if (reg.nutPh != null) ph = reg.nutPh;
  }
  const st = typeof state !== 'undefined' ? state : null;
  const um = st && st.ultimaMedicion ? st.ultimaMedicion : null;
  if (um) {
    const ta = parseFloat(um.tempAire);
    const hs = parseFloat(um.humSala);
    if (temp == null && Number.isFinite(ta)) temp = ta;
    if (hr == null && Number.isFinite(hs)) hr = hs;
    const vp = parseFloat(um.vpd);
    if (vpd == null && Number.isFinite(vp)) vpd = vp;
    const uec = parseFloat(um.ec);
    const uph = parseFloat(um.ph);
    if (ec == null && Number.isFinite(uec) && uec < 1200) ec = uec;
    if (ph == null && Number.isFinite(uph) && uph > 0 && uph < 8) ph = uph;
  }
  if (
    vpd == null &&
    typeof calcVPDkPa === 'function' &&
    Number.isFinite(temp) &&
    Number.isFinite(hr)
  ) {
    const v = calcVPDkPa(temp, hr);
    if (Number.isFinite(v)) vpd = v;
  }
  return {
    temp,
    hr,
    vpd,
    ec,
    ph,
    fecha: domo.fecha || (reg && reg.fecha) || (um && um.fecha) || '',
    hora: domo.hora || (reg && reg.hora) || (um && um.hora) || '',
  };
}

function getDashTileClassGerm(key, val, rango) {
  const n = typeof val === 'number' ? val : parseFloat(val);
  if (!Number.isFinite(n)) return 'empty';
  if (!rango) return 'empty';
  if (n >= rango.min && n <= rango.max) return 'ok';
  if (n >= rango.warnLow && n <= rango.warnHigh) return 'warn';
  return 'bad';
}

function germRangoLabel(key, r) {
  if (!r) return '—';
  if (key === 'temp') return r.temp.min + '–' + r.temp.max + ' °C';
  if (key === 'hr') return r.hr.min + '–' + r.hr.max + ' %';
  if (key === 'ec') return r.ec.min + '–' + r.ec.max + ' µS (obj. ~' + r.ecObjetivo + ')';
  if (key === 'ph') return r.phObjetivo + ' (' + r.ph.min + '–' + r.ph.max + ')';
  if (key === 'vpd') return r.vpd.min + '–' + r.vpd.max + ' kPa';
  return '—';
}

const GERMIN_CORRECCION = {
  temp: {
    low: 'Sube T°: mat térmica, domo más cerrado o acerca calor suave (no LED de floración).',
    high: 'Baja T°: ventila el domo 3–5 min, aleja corrientes frías o baja extracción cerca.',
    ok: 'T° en banda orientativa para esta genética.',
  },
  hr: {
    low: 'Sube HR: domo hermético, bandeja con agua, humidificador pequeño cerca.',
    high: 'Baja HR: ventila 2×/día; evita secar el sustrato.',
    ok: 'HR en rango bajo domo.',
  },
  ec: {
    low: 'EC baja: añade poco nutriente/enraizador; en germinación suele ir bajo.',
    high: 'EC alta: diluye el agua del propagador; riesgo de quemar radícula.',
    ok: 'EC en banda orientativa de la cepa.',
  },
  ph: {
    low: 'pH bajo: alcaliniza suavemente el agua del cubo (objetivo ~5,5).',
    high: 'pH alto: baja con ácido pH diluido sobre el cubo.',
    ok: 'pH del cubo en rango.',
  },
  vpd: {
    low: 'VPD bajo: sube T° o baja HR un poco (más humedad).',
    high: 'VPD alto: baja T° o sube HR (domo más húmedo).',
    ok: 'VPD coherente con T° y HR.',
  },
};

/**
 * Evalúa una lectura de germinación vs rangos de la variedad: nivel, desfase y corrección.
 */
function evalGerminacionMedicion(key, val, variedadId, faseId) {
  const r = getGerminacionRangosMonitoreo(variedadId, faseId);
  const rango = r[key];
  const n = typeof val === 'number' ? val : parseFloat(val);
  const rangoLabel = germRangoLabel(key, r);
  if (!Number.isFinite(n) || !rango) {
    return {
      key: key,
      nivel: 'empty',
      valor: null,
      desfase: null,
      desfaseTxt: 'Sin lectura',
      correccion: '',
      rangoLabel: rangoLabel,
      rango: rango,
    };
  }
  const nivel = getDashTileClassGerm(key, n, rango);
  const unit =
    key === 'temp' ? ' °C' : key === 'hr' ? ' %' : key === 'ec' ? ' µS' : key === 'vpd' ? ' kPa' : '';
  let desfase = 0;
  let desfaseTxt = '';
  if (n >= rango.min && n <= rango.max) {
    const center = Math.round(((rango.min + rango.max) / 2) * 10) / 10;
    desfase = Math.round((n - center) * 10) / 10;
    desfaseTxt =
      Math.abs(desfase) < 0.05
        ? 'En rango · ' + rangoLabel
        : (desfase > 0 ? '+' + desfase + unit + ' vs centro del rango' : desfase + unit + ' vs centro del rango');
  } else if (n < rango.min) {
    desfase = Math.round((n - rango.min) * 10) / 10;
    desfaseTxt = desfase + unit + ' bajo objetivo (' + rangoLabel + ')';
  } else {
    desfase = Math.round((n - rango.max) * 10) / 10;
    desfaseTxt = '+' + desfase + unit + ' sobre objetivo (' + rangoLabel + ')';
  }
  const corr = GERMIN_CORRECCION[key] || {};
  const correccion =
    nivel === 'ok' ? corr.ok || '' : n < rango.min ? corr.low || '' : corr.high || '';
  return {
    key: key,
    nivel: nivel,
    valor: n,
    desfase: desfase,
    desfaseTxt: desfaseTxt,
    correccion: correccion,
    rangoLabel: rangoLabel,
    rango: rango,
  };
}

function renderGerminacionRangosPanelHtml(cfg, opts) {
  cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
  opts = opts && typeof opts === 'object' ? opts : {};
  const g =
    typeof ensureGerminacionFlow === 'function' ? ensureGerminacionFlow(cfg) : cfg.germinacionFlow || {};
  const vid = String(
    g.variedadId || (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) || ''
  ).trim();
  const faseId =
    typeof hcGerminacionFaseActualId === 'function' ? hcGerminacionFaseActualId(cfg) : 'semilla';
  const r = getGerminacionRangosMonitoreo(vid, faseId);
  const spec = r.spec || {};
  const esc =
    typeof meteoEscHtml === 'function'
      ? meteoEscHtml
      : function (s) {
          return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
        };
  const faseNut = faseId === 'semilla' || faseId === 'taproot';
  const showEc = !!opts.forMedir || !faseNut;
  const showPh = opts.forMedir ? faseId !== 'semilla' : !faseNut;
  const ecLine = showEc
    ? '<li><span class="hc-germ-rangos-k">EC propagador</span><strong>' +
      r.ec.min +
      '–' +
      r.ec.max +
      ' µS</strong> <span class="hc-germ-rangos-sub">(centro ~' +
      r.ecObjetivo +
      ')</span></li>'
    : '';
  const phLine = showPh
    ? '<li><span class="hc-germ-rangos-k">pH cubo</span><strong>' +
      r.phObjetivo +
      '</strong> <span class="hc-germ-rangos-sub">(' +
      r.ph.min +
      '–' +
      r.ph.max +
      ')</span></li>'
    : '';
  const items =
    '<li><span class="hc-germ-rangos-k">T° domo</span><strong>' +
    r.temp.min +
    '–' +
    r.temp.max +
    ' °C</strong></li>' +
    '<li><span class="hc-germ-rangos-k">HR domo</span><strong>' +
    r.hr.min +
    '–' +
    r.hr.max +
    ' %</strong></li>' +
    ecLine +
    phLine;
  return (
    '<div class="hc-germ-rangos-panel" role="region" aria-label="Rangos de medición según genética">' +
    '<p class="hc-germ-rangos-lead">Objetivos para <strong>' +
    esc(spec.nombreGenetica || 'tu variedad') +
    '</strong> (' +
    esc(spec.grupoLabel || 'perfil') +
    ') · fase <strong>' +
    esc(faseId) +
    '</strong>. Al medir verás el <strong>desfase</strong> respecto a estos rangos.</p>' +
    '<ul class="hc-germ-rangos-list">' +
    items +
    '</ul></div>'
  );
}

function renderGerminacionMedEvalBlockHtml(cfg, lecturas) {
  cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
  const g =
    typeof ensureGerminacionFlow === 'function' ? ensureGerminacionFlow(cfg) : cfg.germinacionFlow || {};
  const vid = String(
    g.variedadId || (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) || ''
  ).trim();
  const faseId =
    typeof hcGerminacionFaseActualId === 'function' ? hcGerminacionFaseActualId(cfg) : 'semilla';
  const esc =
    typeof meteoEscHtml === 'function'
      ? meteoEscHtml
      : function (s) {
          return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
        };
  lecturas = lecturas || {};
  const keys = [];
  if (Number.isFinite(lecturas.temp)) keys.push({ key: 'temp', val: lecturas.temp, lbl: 'T° domo' });
  if (Number.isFinite(lecturas.hr)) keys.push({ key: 'hr', val: lecturas.hr, lbl: 'HR' });
  if (Number.isFinite(lecturas.vpd)) keys.push({ key: 'vpd', val: lecturas.vpd, lbl: 'VPD' });
  if (Number.isFinite(lecturas.ec)) keys.push({ key: 'ec', val: lecturas.ec, lbl: 'EC' });
  if (Number.isFinite(lecturas.ph)) keys.push({ key: 'ph', val: lecturas.ph, lbl: 'pH' });
  if (!keys.length) {
    return '<p class="hc-germ-med-eval hc-germ-med-eval--empty">Introduce T° y HR (y EC/pH si aplica) para ver desfase y corrección según tu genética.</p>';
  }
  const rows = keys
    .map(function (item) {
      const ev = evalGerminacionMedicion(item.key, item.val, vid, faseId);
      const cls = 'hc-germ-med-eval-row hc-germ-med-eval-row--' + ev.nivel;
      return (
        '<div class="' +
        cls +
        '">' +
        '<div class="hc-germ-med-eval-head"><strong>' +
        esc(item.lbl) +
        '</strong> <span class="hc-germ-med-eval-val">' +
        esc(String(item.val)) +
        '</span></div>' +
        '<div class="hc-germ-med-eval-desfase">' +
        esc(ev.desfaseTxt) +
        '</div>' +
        (ev.correccion
          ? '<div class="hc-germ-med-eval-corr"><span class="hc-germ-med-eval-corr-k">Corrección</span> ' +
            esc(ev.correccion) +
            '</div>'
          : '') +
        '</div>'
      );
    })
    .join('');
  return '<div class="hc-germ-med-eval" role="status" aria-live="polite">' + rows + '</div>';
}

function collectGerminacionLecturasDesdeInputs() {
  const t = parseFloat(String(document.getElementById('hcGermDomoTemp')?.value || '').replace(',', '.'));
  const h = parseFloat(String(document.getElementById('hcGermDomoHr')?.value || '').replace(',', '.'));
  const ec = parseFloat(String(document.getElementById('hcGermNutEc')?.value || '').replace(',', '.'));
  const ph = parseFloat(String(document.getElementById('hcGermNutPh')?.value || '').replace(',', '.'));
  let vpd = NaN;
  if (typeof calcVPDkPa === 'function' && Number.isFinite(t) && Number.isFinite(h)) {
    vpd = calcVPDkPa(t, h);
  }
  return {
    temp: Number.isFinite(t) ? t : null,
    hr: Number.isFinite(h) ? h : null,
    vpd: Number.isFinite(vpd) ? vpd : null,
    ec: Number.isFinite(ec) ? ec : null,
    ph: Number.isFinite(ph) ? ph : null,
  };
}

function hcRefreshGerminacionMedEvaluacion(cfg) {
  cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
  const host = document.getElementById('hcGermMedEvalHost');
  if (!host || typeof renderGerminacionMedEvalBlockHtml !== 'function') return;
  host.innerHTML = renderGerminacionMedEvalBlockHtml(cfg, collectGerminacionLecturasDesdeInputs());
}

var _hcGermMedEvalTimer = null;
function hcRefreshGerminacionMedEvaluacionDebounced(cfg) {
  if (_hcGermMedEvalTimer) clearTimeout(_hcGermMedEvalTimer);
  _hcGermMedEvalTimer = setTimeout(function () {
    hcRefreshGerminacionMedEvaluacion(cfg);
    if (typeof updateDashboard === 'function') updateDashboard();
  }, 280);
}

function hcBindGerminacionMedInputs(cfg) {
  ['hcGermDomoTemp', 'hcGermDomoHr', 'hcGermNutEc', 'hcGermNutPh'].forEach(function (id) {
    const el = document.getElementById(id);
    if (!el || el.dataset.hcGermEvalBound === '1') return;
    el.dataset.hcGermEvalBound = '1';
    el.addEventListener('input', function () {
      hcRefreshGerminacionMedEvaluacionDebounced(cfg);
    });
  });
}

window.getGerminacionRangosMonitoreo = getGerminacionRangosMonitoreo;
window.getGerminacionDashTilesPlan = getGerminacionDashTilesPlan;
window.getGerminacionLecturasParaDash = getGerminacionLecturasParaDash;
window.getDashTileClassGerm = getDashTileClassGerm;
window.evalGerminacionMedicion = evalGerminacionMedicion;
window.renderGerminacionRangosPanelHtml = renderGerminacionRangosPanelHtml;
window.renderGerminacionMedEvalBlockHtml = renderGerminacionMedEvalBlockHtml;
window.hcRefreshGerminacionMedEvaluacion = hcRefreshGerminacionMedEvaluacion;
window.hcBindGerminacionMedInputs = hcBindGerminacionMedInputs;
window.getGerminacionSpecPorVariedad = getGerminacionSpecPorVariedad;
window.getGerminacionDiasHitos = getGerminacionDiasHitos;
window.getGerminacionFasesCalendario = getGerminacionFasesCalendario;
window.getGerminacionAvisoRetrasoFase = getGerminacionAvisoRetrasoFase;
window.renderGerminacionFasesCalendarioHtml = renderGerminacionFasesCalendarioHtml;
window.getGerminacionTareaDia = getGerminacionTareaDia;
window.getGerminacionHintFase = getGerminacionHintFase;
window.renderGerminacionGeneticsCardHtml = renderGerminacionGeneticsCardHtml;
window.listGeneticasGerminacionOptions = listGeneticasGerminacionOptions;
window.filtrarGeneticasGerminacionLista = filtrarGeneticasGerminacionLista;
window.cultivoCoincideGeneticaPref = cultivoCoincideGeneticaPref;
window.buildGerminacionDesdeCultivo = buildGerminacionDesdeCultivo;
