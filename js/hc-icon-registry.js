/**
 * Mapeo emoji → sprite hc-i-* y helpers de markup para UI de app.
 * Los emojis de variedad en CULTIVOS_DB se mantienen como dato de catálogo.
 */
var HC_EMOJI_SYM = {
  '🏪': 'hc-i-building',
  '🫧': 'hc-i-bubbles',
  '📊': 'hc-i-chart',
  '🌸': 'hc-i-sparkle',
  '✂️': 'hc-i-scissors',
  '🌱': 'hc-i-sprout',
  '🫘': 'hc-i-nut',
  '⚗️': 'hc-i-flask',
  '🌿': 'hc-i-plant',
  '🍃': 'hc-i-plant',
  '🫙': 'hc-i-package',
  '🧹': 'hc-i-wrench',
  '🌙': 'hc-i-moon',
  '🔃': 'hc-i-refresh',
  '⏱️': 'hc-i-clock',
  '📅': 'hc-i-calendar',
  '🧩': 'hc-i-grid',
  '🔧': 'hc-i-wrench',
  '⚡': 'hc-i-bolt',
  '🟤': 'hc-i-droplet',
  '☀️': 'hc-i-sun',
  '🥶': 'hc-i-therm',
  '💨': 'hc-i-wind',
  '🌧️': 'hc-i-cloud-rain',
  '🟡': 'hc-i-alert-warn',
  '🐛': 'hc-i-alert-warn',
  '🦠': 'hc-i-alert-bad',
  '💡': 'hc-i-bulb',
  '❌': 'hc-i-x',
  '📡': 'hc-i-antenna',
  '🧪': 'hc-i-flask',
  '💧': 'hc-i-droplet',
  '📋': 'hc-i-clipboard',
  '🏷️': 'hc-i-note',
  '🏠': 'hc-i-home',
  '🔄': 'hc-i-refresh',
  '📸': 'hc-i-camera',
  '🏗': 'hc-i-building',
  '🏗️': 'hc-i-building',
  '📝': 'hc-i-note',
  '✅': 'hc-i-alert-ok',
  '⛔': 'hc-i-alert-bad',
  '⚠️': 'hc-i-alert-warn',
  '📌': 'hc-i-pin',
  '🗑': 'hc-i-trash',
  '🗑️': 'hc-i-trash',
  '🧭': 'hc-i-globe',
  '📖': 'hc-i-book',
  '♻️': 'hc-i-sys-rdwc',
  '🌲': 'hc-i-layers',
  '💚': 'hc-i-dot-green',
  '🟢': 'hc-i-alert-ok',
  '🔴': 'hc-i-alert-bad',
  '🌡️': 'hc-i-therm',
  '🪣': 'hc-i-bucket',
  '💊': 'hc-i-package',
  '⬆️': 'hc-i-arrows-v',
  '⬇️': 'hc-i-arrows-v',
  'ℹ️': 'hc-i-help',
  '🔬': 'hc-i-microscope',
  '✏️': 'hc-i-pencil',
  '📦': 'hc-i-package',
  '🥬': 'hc-i-plant',
  '🪴': 'hc-i-plant',
  '🌾': 'hc-i-plant',
  '🌻': 'hc-i-sun',
  '🫛': 'hc-i-sprout',
  '🎍': 'hc-i-plant',
  '⚙️': 'hc-i-cog',
  '🟩': 'hc-i-square',
};

var HC_GRUPO_SYM = {
  indica: 'hc-i-layers',
  sativa: 'hc-i-sun',
  hibrida: 'hc-i-plant',
  auto: 'hc-i-bolt',
  cbd: 'hc-i-dot-green',
};

var HC_HIST_TIPO_SYM = {
  medicion: 'hc-i-chart',
  recarga: 'hc-i-refresh',
  cosecha: 'hc-i-scissors',
  foto: 'hc-i-camera',
  foto_sistema: 'hc-i-building',
  reposicion: 'hc-i-droplet',
  apunte: 'hc-i-note',
  tareas_dia: 'hc-i-alert-ok',
};

var HC_GUIA_ICON_SYM = {
  '🫧': 'hc-i-bubbles',
  '💧': 'hc-i-droplet',
  '🏷️': 'hc-i-note',
  '📡': 'hc-i-antenna',
  '🏠': 'hc-i-home',
  '💡': 'hc-i-bulb',
  '🌬️': 'hc-i-fan',
  '🧪': 'hc-i-flask',
  '⚡': 'hc-i-bolt',
  '📊': 'hc-i-chart',
  '🔌': 'hc-i-plug',
  '📏': 'hc-i-ruler',
  '🔧': 'hc-i-wrench',
  '📖': 'hc-i-book',
  '🌡️': 'hc-i-therm',
  '✂️': 'hc-i-scissors',
};

/** Prefijos al inicio de frases (toast, alertas, títulos). */
var HC_LEADING_PREFIX = [
  ['✅ ', 'ok'],
  ['⚠️ ', 'warn'],
  ['⚠ ', 'warn'],
  ['ℹ️ ', 'info'],
  ['ℹ ', 'info'],
  ['❌ ', 'bad'],
  ['📸 ', 'hc-i-camera'],
  ['🔄 ', 'hc-i-refresh'],
  ['💡 ', 'hc-i-bulb'],
  ['🌿 ', 'hc-i-plant'],
  ['🗑 ', 'hc-i-trash'],
  ['🗑️ ', 'hc-i-trash'],
  ['📦 ', 'hc-i-package'],
  ['🧪 ', 'hc-i-flask'],
  ['⚡ ', 'hc-i-bolt'],
  ['✂️ ', 'hc-i-scissors'],
  ['🔬 ', 'hc-i-microscope'],
  ['⚙️ ', 'hc-i-cog'],
  ['✏️ ', 'hc-i-pencil'],
];

var HC_METRIC_SYM = {
  ec: 'hc-i-bolt',
  ph: 'hc-i-flask',
  temp: 'hc-i-therm',
  tempAire: 'hc-i-therm',
  vol: 'hc-i-bucket',
  hum: 'hc-i-droplet',
  ppfd: 'hc-i-bulb',
  lux: 'hc-i-bulb',
  co2: 'hc-i-wind',
  nota: 'hc-i-note',
  planta: 'hc-i-plant',
  calmag: 'hc-i-package',
  vega: 'hc-i-plant',
  phUp: 'hc-i-arrows-v',
  phDown: 'hc-i-arrows-v',
  fecha: 'hc-i-calendar',
  tarea: 'hc-i-alert-ok',
};

function hcSymbolFromIcon(icono, titulo) {
  var s = String(icono || '').trim();
  if (!s) return 'hc-i-sprout';
  if (s.indexOf('hc-i-') === 0) return s;
  if (HC_EMOJI_SYM[s]) return HC_EMOJI_SYM[s];
  var t = String(titulo || '').toLowerCase();
  if (/dwc|rdwc|oxigen|burbuj|hidro/.test(t)) return 'hc-i-bubbles';
  if (/cosech|esquej|tijera/.test(t)) return 'hc-i-scissors';
  if (/wifi|iot|gateway|esp32/.test(t)) return 'hc-i-antenna';
  if (/compatib|genétic|mezclar/.test(t)) return 'hc-i-grid';
  return 'hc-i-help';
}

function hcInlineIcon(symbolId, extraClass) {
  if (typeof hcIcon !== 'function') return '';
  return hcIcon(symbolId, (extraClass || 'hc-ico--inline').trim());
}

function hcMetricLine(metricKey, text) {
  var sym = HC_METRIC_SYM[metricKey] || 'hc-i-pin';
  var sep = String(text || '').trim();
  if (!sep) return '';
  if (typeof hcIcon !== 'function') return sep;
  return (
    '<span class="hc-metric-line">' +
    hcInlineIcon(sym) +
    '<span class="hc-metric-txt">' +
    sep +
    '</span></span>'
  );
}

function hcTextWithLeadingIcons(txt, hintKind) {
  var s = String(txt || '');
  if (typeof hcIcon !== 'function') return s;
  var i;
  for (i = 0; i < HC_LEADING_PREFIX.length; i++) {
    var pref = HC_LEADING_PREFIX[i][0];
    if (s.indexOf(pref) === 0) {
      var rule = HC_LEADING_PREFIX[i][1];
      var icon =
        String(rule).indexOf('hc-i-') === 0
          ? hcInlineIcon(rule)
          : hcStatusIconMarkup(rule || hintKind || 'info');
      return icon + s.slice(pref.length);
    }
  }
  if (hintKind && (hintKind === 'ok' || hintKind === 'warn' || hintKind === 'bad' || hintKind === 'info')) {
    return hcStatusIconMarkup(hintKind) + s;
  }
  return s;
}

function hcConsejoAlertaHtml(alerta) {
  if (!alerta) return '';
  var tipo = alerta.tipo || 'info';
  var kind = tipo === 'warn' ? 'warn' : tipo === 'ok' ? 'ok' : 'info';
  var body = hcTextWithLeadingIcons(alerta.txt, kind);
  return '<span class="consejo-alerta-inner">' + body + '</span>';
}

function hcToastHtml(msg, isError) {
  if (typeof hcIcon !== 'function') return null;
  var s = String(msg || '');
  var body = hcTextWithLeadingIcons(s, isError ? 'warn' : 'ok');
  if (body === s && !isError) return null;
  return '<span class="hc-toast-inner">' + body + '</span>';
}

function hcChevronMarkup(_expanded) {
  return (
    '<span class="config-section-collapse-chevron" aria-hidden="true">' +
    '<svg class="hc-ico hc-ico--collapse-chevron" focusable="false"><use href="#hc-i-chevron"/></svg>' +
    '</span>'
  );
}

function hcCompatEstadoMarkup(compat) {
  if (!compat) return '';
  if (compat.warn) return hcStatusIconMarkup('warn');
  if (compat.ok === false) return hcStatusIconMarkup('bad');
  return hcStatusIconMarkup('ok');
}

function hcConsejoIconMarkup(icono, titulo) {
  if (typeof hcIcon !== 'function') return String(icono || '');
  return hcIcon(hcSymbolFromIcon(icono, titulo), 'hc-ico--consejo');
}

function hcStatusIconMarkup(kind) {
  var sym =
    kind === 'ok' || kind === true
      ? 'hc-i-alert-ok'
      : kind === 'warn' || kind === 'warning'
        ? 'hc-i-alert-warn'
        : kind === 'bad' || kind === 'ban' || kind === false
          ? 'hc-i-alert-bad'
          : 'hc-i-help';
  return typeof hcIcon === 'function' ? hcIcon(sym, 'hc-ico--status') : '';
}

function hcGrupoCultivoIconMarkup(grupoKey) {
  var sym = HC_GRUPO_SYM[grupoKey] || 'hc-i-sprout';
  if (typeof hcIcon !== 'function') {
    return '<span class="setup-grupo-icon" aria-hidden="true">🌱</span>';
  }
  return '<span class="setup-grupo-icon" aria-hidden="true">' + hcIcon(sym, 'hc-ico--grupo') + '</span>';
}

function hcRegistroIconMarkup(icon) {
  if (typeof hcIcon !== 'function') return String(icon || '');
  var s = String(icon || '').trim();
  if (s.indexOf('hc-i-') === 0) return hcIcon(s, 'hc-ico--reg');
  return hcConsejoIconMarkup(s);
}

function hcHistTipoIconMarkup(tipo) {
  var sym = HC_HIST_TIPO_SYM[tipo] || 'hc-i-pin';
  return typeof hcIcon === 'function' ? hcIcon(sym, 'hc-ico--reg') : '📌';
}

function hcGuiaHeroIconMarkup(icon) {
  var s = String(icon || '').trim();
  var sym = HC_GUIA_ICON_SYM[s] || hcSymbolFromIcon(s);
  return typeof hcIcon === 'function' ? hcIcon(sym, 'hc-ico--guia') : s || '📖';
}

function hcInstalacionChipHtml(info, torreId, chipClass) {
  var nombre = (info && String(info.nombre || '').trim()) || 'Instalación';
  var icon = '';
  var tipo = null;
  var cls = chipClass || 'hist-torre-chip';
  if (torreId != null && typeof state !== 'undefined' && state.torres) {
    for (var i = 0; i < state.torres.length; i++) {
      if (state.torres[i].id === torreId) {
        if (typeof hcSistemaTipoDesdeTorreOCfg === 'function') {
          tipo = hcSistemaTipoDesdeTorreOCfg(state.torres[i]);
        } else if (typeof tipoInstalacionNormalizado === 'function' && state.torres[i].config) {
          tipo = tipoInstalacionNormalizado(state.torres[i].config);
        }
        break;
      }
    }
  }
  if (tipo && typeof hcSistemaIconMarkup === 'function') {
    icon = hcSistemaIconMarkup(tipo, 'hc-ico--chip');
  } else {
    icon = hcConsejoIconMarkup((info && info.emoji) || '🌿', nombre);
  }
  return (
    '<span class="' +
    cls +
    '">' +
    icon +
    ' <span class="hist-torre-chip-label">' +
    nombre +
    '</span></span>'
  );
}

function hcFiltroTorreBtnIcon(torre) {
  if (!torre || torre.id == null) {
    return typeof hcIcon === 'function' ? hcIcon('hc-i-chart', 'hc-ico--chip') : '📊';
  }
  if (torre.config && typeof hcSistemaIconMarkup === 'function' && typeof hcSistemaTipoDesdeTorreOCfg === 'function') {
    return hcSistemaIconMarkup(hcSistemaTipoDesdeTorreOCfg(torre), 'hc-ico--chip');
  }
  return hcConsejoIconMarkup(torre.emoji || '🌿', torre.nombre);
}

function hcEtapaCultivoIconMarkup(etapaKey) {
  var map = {
    plantula: 'hc-i-sprout',
    crecimiento: 'hc-i-plant',
    madurez: 'hc-i-plant',
    cosecha: 'hc-i-scissors',
  };
  var sym = map[etapaKey] || 'hc-i-sprout';
  return typeof hcIcon === 'function' ? hcIcon(sym, 'hc-ico--etapa') : '🌱';
}

/** Emoji de fase para SVG inline (no markup HTML de hcIcon). */
function hcEstadoEmojiChar(est) {
  var map = { plantula: '🌱', crecimiento: '🌿', madurez: '🥬', cosecha: '✂️' };
  return map[est] || '🌱';
}

/** PNG en cestas del esquema (sin foto del usuario). */
var HC_CESTA_HOJA_VEG_SRC = 'icons/cesta-hoja-veg.png';
/** Añadir asset y poner HC_CESTA_FLORACION_LISTO = true cuando esté listo. */
var HC_CESTA_FLORACION_SRC = 'icons/cesta-floracion.png';
var HC_CESTA_FLORACION_LISTO = false;

/**
 * Icono PNG de fase en cesta: 'hoja_veg' | 'floracion' | null.
 * @param {object|null} cultivo fila GENETICS_DB
 * @param {number} dias días efectivos de ciclo
 * @param {string} est getEstado (plantula|crecimiento|madurez|cosecha)
 */
function hcCestaFaseIconoKey(cultivo, dias, est) {
  if (!est || est === 'plantula' || est === 'cosecha') return null;
  if (!Number.isFinite(Number(dias))) return null;

  if (cultivo && typeof cultivoFaseDesdeDias === 'function') {
    var fd = cultivoFaseDesdeDias(cultivo, dias, { desdeTrasplante: true });
    if (fd && fd.key) {
      if (fd.key === 'floracion') return 'floracion';
      if (fd.key === 'fructificacion' || fd.key === 'madurez') return 'hoja_veg';
      if (fd.key === 'vegetativo' || fd.key === 'prefloracion' || fd.key === 'crecimiento') {
        return 'hoja_veg';
      }
    }
  }

  var dVeg = cultivo ? Number(cultivo.diasVeg) : 0;
  var dFlor = cultivo ? Number(cultivo.diasFlor) : 0;
  if (dVeg > 0 && dFlor > 0 && dias >= 7) {
    var finVeg = 7 + Math.round(dVeg);
    var finFlor = finVeg + Math.max(1, Math.round(dFlor * 0.7));
    if (dias < finVeg) return 'hoja_veg';
    if (dias < finFlor) return 'floracion';
    return 'hoja_veg';
  }

  if (est === 'crecimiento' || est === 'madurez') return 'hoja_veg';
  return null;
}

function hcCestaFasePngSrc(iconKey) {
  if (iconKey === 'hoja_veg') return HC_CESTA_HOJA_VEG_SRC;
  if (iconKey === 'floracion' && HC_CESTA_FLORACION_LISTO) return HC_CESTA_FLORACION_SRC;
  return '';
}

function hcCestaFasePngSvgMarkup(cx, cy, r, opts) {
  opts = opts || {};
  var iconKey = opts.iconKey;
  var src = hcCestaFasePngSrc(iconKey);
  if (!src) return '';
  var fx = typeof opts.fx === 'function' ? opts.fx : function (n) {
    return Number(n).toFixed(1);
  };
  var scale = opts.scale != null ? opts.scale : 0.58;
  var size = r * 2 * scale;
  var ix = cx - size / 2;
  var iy = cy - size / 2;
  var clipId = opts.clipId;
  var opacity = opts.opacity != null ? opts.opacity : 0.92;
  var cssClass =
    iconKey === 'floracion' ? 'hc-cesta-icono-floracion' : 'hc-cesta-hoja-veg';
  var out = '';
  if (clipId) {
    var shape = opts.clipShape || 'circle';
    out += '<defs><clipPath id="' + clipId + '">';
    if (shape === 'rect') {
      var pad = opts.clipPad != null ? opts.clipPad : 1.5;
      out +=
        '<rect x="' +
        fx(cx - r + pad) +
        '" y="' +
        fx(cy - r + pad) +
        '" width="' +
        fx((r - pad) * 2) +
        '" height="' +
        fx((r - pad) * 2) +
        '" rx="3"/>';
    } else if (shape === 'ellipse') {
      var erx = opts.erx != null ? opts.erx : r - 1;
      var ery = opts.ery != null ? opts.ery : r - 1;
      out +=
        '<ellipse cx="' +
        fx(cx) +
        '" cy="' +
        fx(cy) +
        '" rx="' +
        fx(erx) +
        '" ry="' +
        fx(ery) +
        '"/>';
    } else {
      out += '<circle cx="' + fx(cx) + '" cy="' + fx(cy) + '" r="' + fx(r - 1.2) + '"/>';
    }
    out += '</clipPath></defs>';
  }
  var clipAttr = clipId ? ' clip-path="url(#' + clipId + ')"' : '';
  return (
    out +
    '<image class="' +
    cssClass +
    '" href="' +
    src +
    '" x="' +
    fx(ix) +
    '" y="' +
    fx(iy) +
    '" width="' +
    fx(size) +
    '" height="' +
    fx(size) +
    '" preserveAspectRatio="xMidYMid meet"' +
    clipAttr +
    ' opacity="' +
    opacity +
    '" pointer-events="none"/>'
  );
}

/** @deprecated usar hcCestaFaseIconoKey + hcCestaFasePngSvgMarkup */
function hcCestaEtapaUsaHojaVeg(est) {
  return est === 'crecimiento' || est === 'madurez';
}

/** @deprecated usar hcCestaFasePngSvgMarkup */
function hcCestaHojaVegSvgMarkup(cx, cy, r, opts) {
  opts = opts || {};
  var iconKey =
    opts.iconKey ||
    (opts.est && hcCestaEtapaUsaHojaVeg(opts.est) ? 'hoja_veg' : null);
  if (!iconKey) return '';
  return hcCestaFasePngSvgMarkup(cx, cy, r, Object.assign({}, opts, { iconKey: iconKey }));
}

/** Emoji de fase/variedad en centro de cesta; PNG de fase sustituye texto en SVG. */
function hcCestaIconoFaseTexto(est, phaseEmoji, cultEmoji, tieneFoto, iconKey) {
  if (tieneFoto) return '';
  if (iconKey === 'hoja_veg') return '';
  if (iconKey === 'floracion') {
    return HC_CESTA_FLORACION_LISTO ? '' : '🌸';
  }
  return cultEmoji || phaseEmoji || '';
}

function hcCestaTieneIndicadorCultivo(est, phaseEmoji, cultEmoji, tieneFoto, iconKey) {
  if (tieneFoto) return true;
  if (iconKey === 'hoja_veg') return true;
  if (iconKey === 'floracion') return true;
  return !!(cultEmoji || phaseEmoji);
}
