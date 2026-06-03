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
    '</div></div></div>'
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

window.getGerminacionSpecPorVariedad = getGerminacionSpecPorVariedad;
window.getGerminacionDiasHitos = getGerminacionDiasHitos;
window.getGerminacionTareaDia = getGerminacionTareaDia;
window.getGerminacionHintFase = getGerminacionHintFase;
window.renderGerminacionGeneticsCardHtml = renderGerminacionGeneticsCardHtml;
window.listGeneticasGerminacionOptions = listGeneticasGerminacionOptions;
window.filtrarGeneticasGerminacionLista = filtrarGeneticasGerminacionLista;
window.cultivoCoincideGeneticaPref = cultivoCoincideGeneticaPref;
window.buildGerminacionDesdeCultivo = buildGerminacionDesdeCultivo;
