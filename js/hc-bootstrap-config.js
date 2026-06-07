/**
 * Constantes de app, Sheets, torre, helpers de cultivo y grupos (GRUPOS_CULTIVO, MODOS_CULTIVO).
 * Tras cultivos-db.js; antes de estado.
 */
// ══════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzhqlYED_glpvCQQC-ZhCHKiwrzcuyvKUYbvfd_F6X8IpVD9x6dmudRcfKWfPs4pPC/exec';

/** Aviso si falla el envío opcional a Google Sheets (datos locales ya guardados). */
function hcSheetsNotifyFailure() {
  try {
    if (typeof showToast === 'function') {
      showToast('Sin conexión o error al enviar a la hoja. Los datos siguen en este dispositivo.', true);
    }
  } catch (_) {}
}

/**
 * POST a Apps Script (no-cors: no se lee respuesta). Offline o fallo de red → toast.
 * @returns {Promise<boolean>} true si se lanzó fetch sin throw
 */
async function hcPostSheets(payload) {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    hcSheetsNotifyFailure();
    return false;
  }
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    return true;
  } catch (e) {
    console.error('HidroGrow Sheets:', e);
    hcSheetsNotifyFailure();
    return false;
  }
}

const PIN = '2506';
const AUTH_REMEMBER_MIN_KEY = 'hc_auth_remember_min';
const AUTH_TS_KEY = 'hc_auth';
const STORAGE_KEY = 'hidrogrow_v2';
/** Debe coincidir con app-hc-pwa-fotodb.js */
const FOTO_DB_NAME = 'cultivaFotos';
const APP_BUILD_VERSION = '2026-06-01-perf3';
const APP_BUILD_VERSION_KEY = 'hg_app_build_version';
const AUTO_RESTORE_POINT_KEY = 'hg_auto_restore_point_v1';
const AUTO_RESTORE_POINT_TRANSITION_KEY = 'hg_auto_restore_transition_v1';
/** Tutorial contextual “Asignar cultivo” (1 = usuario pidió no volver a mostrar) */
const TUTORIAL_ASIGNAR_LS = 'hidrogrow_tutorial_asignar_v1';
const TUTORIAL_EDITAR_LS = 'hidrogrow_tutorial_editar_v1';
/** Bienvenida pestaña Torre (1 = ya no auto-mostrar al entrar en Torre) */
const TUTORIAL_TORRE_TAB_LS = 'hidrogrow_tutorial_torre_pestana_v1';
/** Ocultar texto “desliza para girar” tras primera interacción con el esquema */
const TORRE_SWIPE_HINT_LS = 'hidrogrow_torre_swipe_hint_v1';

// Torre: 5 niveles, 5 cestas cada uno
// Niveles activos: 1, 3 y 5 (índice 0, 2, 4)
const NIVELES_ACTIVOS = [0, 2, 4];
const NUM_NIVELES = 5;
const NUM_CESTAS = 5;

// CULTIVOS_DB — ver js/cultivos-db.js
/**
 * Icono en UI = emoji de CULTIVOS_DB. Texto en listas = cultivoNombreLista (abrev · nombre si hay abrev).
 */
function escOptionHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escHtmlUi(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Desplegable técnico unificado (&lt;details&gt;): NFT, guías de origen, tablas largas.
 * @param {string} innerHtml
 * @param {string} [summaryLabel]
 * @param {boolean} [openDefault]
 * @param {string} [variant] '' neutro (pizarra) | 'origen' acento cultivo/agua
 */
function hcWrapDetailsTech(innerHtml, summaryLabel, openDefault, variant) {
  const defLab = variant === 'origen' ? 'Ver guía' : 'Ver detalle técnico y cifras';
  const lab =
    summaryLabel != null && String(summaryLabel).trim() !== ''
      ? String(summaryLabel).trim()
      : defLab;
  const op = openDefault ? ' open' : '';
  const mod = variant === 'origen' ? ' hc-details-tech--origen' : '';
  return (
    '<details class="hc-details-tech' + mod + '"' + op + '>' +
    '<summary class="hc-details-tech-sum">' +
    escHtmlUi(lab) +
    '</summary>' +
    '<div class="hc-details-tech-body">' +
    innerHtml +
    '</div></details>'
  );
}

/**
 * @param {string} innerHtml
 * @param {string} [summaryLabel]
 * @param {boolean} [openDefault]
 */
function hcWrapOrigenDetails(innerHtml, summaryLabel, openDefault) {
  return hcWrapDetailsTech(innerHtml, summaryLabel, openDefault, 'origen');
}

/** Etiqueta en listas/selects/torre; state.variedad sigue siendo el nombre canónico (sin prefijo). */
function cultivoNombreLista(cultivo, variedadGuardada) {
  if (cultivo && cultivo.abrev) return cultivo.abrev + ' · ' + cultivo.nombre;
  if (cultivo) return cultivo.nombre;
  const v = variedadGuardada != null ? String(variedadGuardada).trim() : '';
  return v || '—';
}

function cultivoEmoji(cultivo) {
  if (!cultivo) return '⚪';
  return cultivo.emoji || '🌱';
}

/** @param {object|null} cultivo fila CULTIVOS_DB; @param {number} [fontRem] tamaño relativo en rem */
function cultivoEmojiHtml(cultivo, fontRem) {
  const em = cultivoEmoji(cultivo);
  if (!fontRem) return '<span class="cultivo-emoji-mark" aria-hidden="true">' + em + '</span>';
  if (fontRem === 1.05) return '<span class="cultivo-emoji-mark cultivo-emoji-mark--105" aria-hidden="true">' + em + '</span>';
  if (fontRem === 1.35) return '<span class="cultivo-emoji-mark cultivo-emoji-mark--135" aria-hidden="true">' + em + '</span>';
  if (fontRem === 1.4) return '<span class="cultivo-emoji-mark cultivo-emoji-mark--140" aria-hidden="true">' + em + '</span>';
  if (fontRem === 1.5) return '<span class="cultivo-emoji-mark cultivo-emoji-mark--150" aria-hidden="true">' + em + '</span>';
  return '<span class="cultivo-emoji-mark" aria-hidden="true" style="--cultivo-emoji-rem:' + fontRem + 'rem">' + em + '</span>';
}

const GRUPO_EMOJI_REP = {
  indica: '🌲', sativa: '☀️', hibrida: '🌿', auto: '⚡', cbd: '💚',
};

function grupoEmojiHtml(grupoKey) {
  if (typeof hcGrupoCultivoIconMarkup === 'function') return hcGrupoCultivoIconMarkup(grupoKey);
  const em = GRUPO_EMOJI_REP[grupoKey] || '🌱';
  return '<span class="setup-grupo-icon" aria-hidden="true">' + em + '</span>';
}

function hcCultivosDbSafe() {
  return typeof CULTIVOS_DB !== 'undefined' && Array.isArray(CULTIVOS_DB) ? CULTIVOS_DB : [];
}

function refEcPhRowEmojiHtml(row) {
  const db = hcCultivosDbSafe();
  const s = String(row.cultivo || '');
  const byId = function(id) {
    const c = id ? db.find(x => x.id === id) : null;
    if (!c) return '<span class="cultivo-emoji-mark cultivo-emoji-mark--135" aria-hidden="true">🌱</span>';
    return cultivoEmojiHtml(c, 1.35);
  };
  const hit = CULTIVOS_DB.find(c => c.nombre === s || (c.abrev && s.indexOf(c.abrev) >= 0));
  if (hit) return cultivoEmojiHtml(hit, 1.35);
  return byId(null);
}

function hcPlantasPorGrupoCultivo(grupo) {
  return hcCultivosDbSafe().filter(function (c) { return c.grupo === grupo; }).map(function (c) { return c.nombre; });
}

// Grupos de genética (HidroGrow)
const GRUPOS_CULTIVO = {
  indica: {
    nombre: 'Índica',
    color: '#7c3aed',
    ec: '1200-2000',
    ph: '5.8-6.2',
    plantas: hcPlantasPorGrupoCultivo('indica'),
    nota: 'Ciclo más corto, perfil compacto. Ideal DWC/RDWC en salas pequeñas.',
  },
  sativa: {
    nombre: 'Sativa',
    color: '#eab308',
    ec: '1300-2300',
    ph: '5.8-6.3',
    plantas: hcPlantasPorGrupoCultivo('sativa'),
    nota: 'Mayor estiramiento en floración. Planifica altura de lámpara y extractor.',
  },
  hibrida: {
    nombre: 'Híbrida',
    color: '#22c55e',
    ec: '1300-2400',
    ph: '5.8-6.2',
    plantas: hcPlantasPorGrupoCultivo('hibrida'),
    nota: 'Equilibrio vigor/altura. La mayoría de genéticas comerciales actuales.',
  },
  auto: {
    nombre: 'Autofloreciente',
    color: '#06b6d4',
    ec: '1200-2100',
    ph: '5.8-6.2',
    plantas: hcPlantasPorGrupoCultivo('auto'),
    nota: 'Fotoperiodo fijo (~18/6). No mezclar con fotodependientes en la misma sala.',
  },
  cbd: {
    nombre: 'CBD / perfil suave',
    color: '#34d399',
    ec: '1000-1600',
    ph: '5.9-6.3',
    plantas: hcPlantasPorGrupoCultivo('cbd'),
    nota: 'EC más baja que genéticas THC altas. Vigilar pH estable.',
  },
};

const COMPAT_MATRIZ = {
  indica: ['indica', 'hibrida'],
  sativa: ['sativa', 'hibrida'],
  hibrida: ['indica', 'sativa', 'hibrida'],
  auto: ['auto'],
  cbd: ['cbd', 'indica', 'hibrida'],
};

const GRUPOS_CULTIVO_OLD = {
  A: GRUPOS_CULTIVO.hibrida,
  B: GRUPOS_CULTIVO.indica,
  C: GRUPOS_CULTIVO.sativa,
  D: GRUPOS_CULTIVO.auto,
};

const DIAS_COSECHA = (function buildDiasCosechaIndex() {
  const db = typeof CULTIVOS_DB !== 'undefined' && Array.isArray(CULTIVOS_DB) ? CULTIVOS_DB : [];
  const out = {};
  db.forEach(function (c) {
    if (!c) return;
    if (c.nombre) out[c.nombre] = c.dias;
    if (c.id) out[c.id] = c.dias;
  });
  return out;
})();

/** Días hasta cosecha por id o nombre de genética (catálogo cannabis). */
function getDiasCosechaVariedad(variedad) {
  const v = String(variedad || '').trim();
  if (!v) return 50;
  if (typeof getCultivoDB === 'function') {
    const c = getCultivoDB(v);
    if (c && Number.isFinite(c.dias)) return c.dias;
  }
  if (typeof DIAS_COSECHA !== 'undefined' && DIAS_COSECHA[v] != null) {
    return Number(DIAS_COSECHA[v]);
  }
  return 50;
}

const COMPATIBILIDAD = {
  'A-A': { ok: true, icono: '✅', texto: 'Compatibles — mismo depósito' },
  'A-B': { ok: true, icono: '✅', texto: 'Compatibles con ajuste de EC' },
  'A-C': { ok: true, warn: true, icono: '⚠️', texto: 'Compatibles — vigilar estiramiento sativa' },
  'A-D': { ok: false, icono: '⛔', texto: 'No mezclar auto con foto en misma instalación' },
  'B-B': { ok: true, icono: '✅', texto: 'Compatibles' },
  'B-C': { ok: true, warn: true, icono: '⚠️', texto: 'Compatibles — EC intermedia' },
  'B-D': { ok: false, icono: '⛔', texto: 'Autos en instalación separada' },
  'C-C': { ok: true, icono: '✅', texto: 'Compatibles' },
  'C-D': { ok: false, icono: '⛔', texto: 'Autos en instalación separada' },
  'D-D': { ok: true, icono: '✅', texto: 'Solo autoflorecientes juntas' },
};

/** Sistemas hidropónicos soportados (cannabis — referencia cultivadores y fabricantes). */
const HIDROGROW_SISTEMAS = ['dwc', 'rdwc'];

/** Camino semilla + propagador: sin circuito DWC/RDWC hasta germinación concluida y asistente hidro cerrado. */
function hidrogrowPropagadorEnFaseGermSinHidro(cfg) {
  if (!cfg || typeof cfg !== 'object') return false;
  const cam =
    (typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '') ||
    cfg.caminoCultivo ||
    (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo) ||
    '';
  if (cam !== 'semilla_propagador') return false;
  if (
    typeof germinacionConcluida === 'function' &&
    !germinacionConcluida(cfg)
  ) {
    return true;
  }
  if (cfg.hcSetupFase !== 'hidro') return true;
  const t = String(cfg.tipoInstalacion || '').toLowerCase();
  if (
    (t === 'dwc' || t === 'rdwc') &&
    cfg.checklistInstalacionConfirmada === true
  ) {
    return false;
  }
  return true;
}

/** Normaliza tipo: DWC/RDWC; en propagador sin hidro el tipo queda vacío (no forzar DWC). */
function hidrogrowTipoInstalacionRaw(cfg) {
  if (hidrogrowPropagadorEnFaseGermSinHidro(cfg)) return '';
  const t = cfg && cfg.tipoInstalacion;
  if (!t || String(t).trim() === '') {
    if (typeof getSistemaFaseCamino === 'function' && getSistemaFaseCamino(cfg)) return '';
    return 'dwc';
  }
  if (t === 'rdwc') return 'rdwc';
  return 'dwc';
}

/** Elimina claves de NFT, SRF y torre vertical que podrían alterar volúmenes o cálculos. */
function hidrogrowPurgarClavesLegacyInstalacion(cfg) {
  if (!cfg || typeof cfg !== 'object') return false;
  let purged = false;
  Object.keys(cfg).forEach((k) => {
    if (/^nft/i.test(k) || /^srf/i.test(k)) {
      delete cfg[k];
      purged = true;
    }
  });
  [
    'torreObjetivoCultivo',
    'torreMontajeOrigen',
    'torreBombaUsuarioCaudalLh',
    'torreBombaUsuarioPotenciaW',
    'alturaTorre',
    'diametroTubo',
    'antiRaices',
    'hidrogrowMigradoDesde',
  ].forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(cfg, k)) {
      delete cfg[k];
      purged = true;
    }
  });
  return purged;
}

/**
 * Migra config legacy: tipo canónico DWC/RDWC, purga campos obsoletos y marca revisión si venía de otro sistema.
 * @returns {boolean} true si hubo cambios que conviene persistir
 */
function hidrogrowMigrarConfigInstalacion(cfg) {
  if (!cfg || typeof cfg !== 'object') return false;
  let changed = false;
  if (hidrogrowPropagadorEnFaseGermSinHidro(cfg)) {
    if (cfg.tipoInstalacion !== '') {
      cfg.tipoInstalacion = '';
      changed = true;
    }
    if (cfg.checklistInstalacionConfirmada === true && cfg.hcSetupFase !== 'hidro') {
      cfg.checklistInstalacionConfirmada = false;
      changed = true;
    }
    if (hidrogrowPurgarClavesLegacyInstalacion(cfg)) changed = true;
    return changed;
  }
  const prev = String(cfg.tipoInstalacion || '').toLowerCase();
  const wasLegacy = prev === 'nft' || prev === 'torre' || prev === 'srf';
  const norm = hidrogrowTipoInstalacionRaw(cfg);
  changed = wasLegacy || prev !== norm;
  cfg.tipoInstalacion = norm;
  if (hidrogrowPurgarClavesLegacyInstalacion(cfg)) changed = true;
  if (wasLegacy) {
    cfg.hcRequiereRevisionMontaje = true;
    changed = true;
  }
  return changed;
}

/** Migra estado global (modo cultivo + todas las instalaciones). @returns {boolean} */
function hidrogrowMigrarStateCompleto(s) {
  if (!s || typeof s !== 'object') return false;
  let dirty = false;
  const modosLegacy = { lechuga: 'vegetativo', lechugas: 'vegetativo', mixto: 'vegetativo', mini: 'esquejes' };
  if (modosLegacy[s.modo]) {
    s.modo = modosLegacy[s.modo];
    dirty = true;
  }
  if (s.configTorre && hidrogrowMigrarConfigInstalacion(s.configTorre)) dirty = true;
  if (Array.isArray(s.torres)) {
    s.torres.forEach((t) => {
      if (t && t.config && hidrogrowMigrarConfigInstalacion(t.config)) dirty = true;
    });
  }
  return dirty;
}

const MODOS_CULTIVO = {
  vegetativo: {
    niveles: [0, 1, 2, 3, 4],
    nombre: 'Vegetativo',
    desc: '18/6 · EC ~1000–1600 µS/cm · piedras de aire en cada cubo',
  },
  floracion: {
    niveles: [0, 1, 2, 3, 4],
    nombre: 'Floración',
    desc: '12/12 (foto) · subir EC gradual · RH bajo 55% en cogollos densos',
  },
  esquejes: {
    niveles: [0, 1],
    nombre: 'Esquejes / plántulas',
    desc: 'Luz suave · EC baja · oxígeno disuelto alto',
  },
  intensivo: {
    niveles: [0, 1, 2, 3, 4, 5, 6, 7],
    nombre: 'SOG / muchas macetas',
    desc: 'Alta densidad · solo índicas/autos compactas',
  },
};

