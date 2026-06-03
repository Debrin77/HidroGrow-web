/** Iconos SVG y emoji de respaldo por tipo de instalación hidropónica. */
function hcSistemaTipoDesdeTorreOCfg(x) {
  const cfg = x && x.config ? x.config : x;
  if (cfg && typeof getSistemaFaseCamino === 'function') {
    const fase = getSistemaFaseCamino(cfg);
    if (fase) return fase;
  }
  if (x && x.config && typeof tipoInstalacionNormalizado === 'function') {
    return tipoInstalacionNormalizado(x.config);
  }
  if (x && x.tipoInstalacion && typeof tipoInstalacionNormalizado === 'function') {
    return tipoInstalacionNormalizado(x);
  }
  if (x && x.config && x.config.tipoInstalacion) return String(x.config.tipoInstalacion);
  if (x && x.tipoInstalacion) return String(x.tipoInstalacion);
  return 'dwc';
}

/** ID del símbolo SVG en el sprite (#hc-i-sys-*). */
function hcSistemaSvgSymbolId(tipo) {
  const t = hcSistemaTipoDesdeTorreOCfg({ tipoInstalacion: tipo });
  if (t === 'rdwc') return 'hc-i-sys-rdwc';
  return 'hc-i-sys-dwc';
}

const HC_SISTEMA_FASE_EMOJI = {
  propagador: '🫧',
  germ_cubo: '🌱',
  prep_hidro: '💧',
  enraizado: '🌿',
  madre: '👑',
};

/** Markup SVG reutilizable (asistente, inicio, selector de torres). */
function hcSistemaIconMarkup(tipo, extraClass) {
  const em = HC_SISTEMA_FASE_EMOJI[tipo];
  if (em) {
    const cls = ('hc-ico hc-ico--sistema-emoji' + (extraClass ? ' ' + extraClass : '')).trim();
    return '<span class="' + cls + '" aria-hidden="true">' + em + '</span>';
  }
  const id = hcSistemaSvgSymbolId(tipo);
  const cls = ('hc-ico hc-ico--sistema' + (extraClass ? ' ' + extraClass : '')).trim();
  return '<svg class="' + cls + '" aria-hidden="true" focusable="false"><use href="#' + id + '"/></svg>';
}

function hcPintarSistemaIconoEnElemento(el, torreOCfg, extraClass) {
  if (!el) return;
  const tipo = hcSistemaTipoDesdeTorreOCfg(torreOCfg);
  el.innerHTML = hcSistemaIconMarkup(tipo, extraClass || '');
}

/** Emoji solo donde hace falta texto plano (checklist, historial). */
function emojiSistemaPorTipo(tipo) {
  const t = hcSistemaTipoDesdeTorreOCfg({ tipoInstalacion: tipo });
  if (t === 'rdwc') return '♻️';
  return '🫧';
}
