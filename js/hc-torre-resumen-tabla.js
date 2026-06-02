/**
 * Tabla resumen bajo el esquema (Cultivo e instalación) — solo DWC y RDWC.
 * Tras hc-setup-wizard-dwc.js; antes de torre-render-main.js.
 */
function renderTorreSistemaResumenTabla(cfg) {
  const mount = document.getElementById('torreSistemaResumenWrap');
  if (!mount) return;
  cfg = cfg || state.configTorre || {};
  const tipo =
    typeof tipoInstalacionNormalizado === 'function'
      ? tipoInstalacionNormalizado(cfg)
      : cfg.tipoInstalacion === 'rdwc'
        ? 'rdwc'
        : 'dwc';
  const rows = [];
  let t = null;
  try {
    t = typeof getTorreActiva === 'function' ? getTorreActiva() : null;
  } catch (_) {
    t = null;
  }
  const nombre = (t && t.nombre ? String(t.nombre).trim() : '') || '';

  if (tipo === 'rdwc') {
    const cR =
      typeof rdwcEnsureConfigDefaults === 'function' ? rdwcEnsureConfigDefaults(Object.assign({}, cfg)) : cfg;
    const sites = Math.max(2, Math.round(Number(cR.rdwcSites) || 4));
    const rowsN = Math.max(1, Math.round(Number(cR.rdwcRows) || 1));
    const volCtl = Math.max(10, Math.round(Number(cR.rdwcControlVolL || cR.volDeposito) || 40));
    const vMez =
      typeof getRdwcVolumenControlTrabajoLitros === 'function'
        ? getRdwcVolumenControlTrabajoLitros(cR)
        : cR.volMezclaLitros;
    const total =
      typeof getRdwcVolumenSolucionTotalLitros === 'function'
        ? getRdwcVolumenSolucionTotalLitros(cR)
        : null;
    const tubes =
      typeof getRdwcTuberiasEffectiveMm === 'function' ? getRdwcTuberiasEffectiveMm(cR) : null;
    const lenM =
      typeof rdwcEstimateRecirculationPipeLengthM === 'function'
        ? rdwcEstimateRecirculationPipeLengthM(cR)
        : null;
    const pipeL =
      typeof getRdwcTuberiasVolumeLitros === 'function' ? getRdwcTuberiasVolumeLitros(cR) : null;
    const presetLbl =
      cR.rdwcPresetId && typeof rdwcPresetById === 'function'
        ? (rdwcPresetById(cR.rdwcPresetId) || {}).label || cR.rdwcPresetId
        : '';
    if (nombre) rows.push(['Nombre', escHtmlUi(nombre)]);
    rows.push(['Cultivo e instalación', 'RDWC']);
    if (presetLbl) rows.push(['Plantilla asistente', escHtmlUi(presetLbl)]);
    rows.push(['Sitios / cubos', String(sites)]);
    rows.push(['Filas', String(rowsN)]);
    rows.push(['Cubo nominal', escHtmlUi(String(Math.round(Number(cR.rdwcBucketVolL) || 20)) + ' L')]);
    rows.push([
      'Depósito de control',
      escHtmlUi(
        volCtl +
          ' L máx' +
          (vMez != null && Number(vMez) < volCtl - 0.05 ? ' · útiles ~' + vMez + ' L' : '')
      ),
    ]);
    if (total != null && Number.isFinite(total) && total > 0) {
      rows.push(['Agua útil en circuito', escHtmlUi('≈ ' + total + ' L (control + cubos + tuberías)')]);
    }
    rows.push([
      'Separación entre cubos',
      escHtmlUi(String(Math.round(Number(cR.rdwcCenterSpacingCm) || 45)) + ' cm (centro a centro)'),
    ]);
    if (tubes) {
      rows.push([
        'Tuberías',
        escHtmlUi(
          'Impulsión Ø' +
            tubes.supplyMm +
            ' mm · retorno Ø' +
            tubes.returnMm +
            ' mm' +
            (lenM != null ? ' · ~' + lenM + ' m/tramo' : '') +
            (pipeL != null && pipeL > 0 ? ' · ~' + pipeL + ' L en tuberías' : '')
        ),
      ]);
    }
    const rim = cR.rdwcNetPotMm;
    const hp = cR.rdwcNetPotHeightMm;
    if (rim != null || hp != null) {
      rows.push([
        'Cesta (net pot)',
        escHtmlUi(
          (rim != null ? 'Ø ' + rim + ' mm' : '—') + (hp != null ? ' · alto ' + hp + ' mm' : '')
        ),
      ]);
    }
    const recW = cR.rdwcRecircPumpW != null ? Math.round(Number(cR.rdwcRecircPumpW)) : null;
    const airW = cR.rdwcAirPumpW != null ? Math.round(Number(cR.rdwcAirPumpW)) : null;
    const airLpm = Math.round(Number(cR.rdwcAirLpm) || 20);
    rows.push([
      'Bombas',
      escHtmlUi(
        'Impulsión ' +
          (recW != null && recW > 0 ? recW + ' W' : '—') +
          ' · aire ' +
          airLpm +
          ' L/min' +
          (airW != null && airW > 0 ? ' · ' + airW + ' W' : '')
      ),
    ]);
  } else {
    const N = cfg.numNiveles || window.NUM_NIVELES_ACTIVO || (typeof NUM_NIVELES !== 'undefined' ? NUM_NIVELES : 4);
    const C = cfg.numCestas || window.NUM_CESTAS_ACTIVO || (typeof NUM_CESTAS !== 'undefined' ? NUM_CESTAS : 5);
    const vol = typeof getVolumenDepositoMaxLitros === 'function' ? getVolumenDepositoMaxLitros(cfg) : null;
    const vMez = typeof getVolumenMezclaLitros === 'function' ? getVolumenMezclaLitros(cfg) : null;
    if (nombre) rows.push(['Nombre', escHtmlUi(nombre)]);
    rows.push(['Cultivo e instalación', 'DWC']);
    rows.push(['Filas', String(N)]);
    rows.push(['Cestas por fila', String(C)]);
    rows.push(['Cestas totales', String(N * C)]);
    const mezExplicito =
      cfg.volMezclaLitros != null &&
      Number.isFinite(Number(cfg.volMezclaLitros)) &&
      Number(cfg.volMezclaLitros) > 0 &&
      vol != null &&
      Number(cfg.volMezclaLitros) < vol - 0.05;
    rows.push([
      'Depósito (cap. máx)',
      vol != null && Number.isFinite(vol) && vol > 0
        ? String(vol) + ' L' + (mezExplicito ? ' · mezcla ' + Number(cfg.volMezclaLitros) + ' L' : '')
        : 'Indica litros en Cultivo e instalación o asistente',
    ]);
    rows.push([
      'Nivel de solución (DWC)',
      escHtmlUi(
        'En DWC el líquido suele quedar por debajo del tope geométrico: hace falta una cámara de aire entre la superficie del nutriente y la base del sustrato en las cestas; al crecer las raíces ese hueco suele aumentar. Indica «litros de mezcla» por debajo del máximo si no llenas al borde.'
      ),
    ]);
    const eqArrDw = cfg.equipamiento;
    if (Array.isArray(eqArrDw) && eqArrDw.length) {
      const bitsD = [];
      if (eqArrDw.includes('calentador')) bitsD.push('Calentador');
      if (eqArrDw.includes('difusor')) bitsD.push('Aireador / difusor');
      if (bitsD.length) rows.push(['Equipo habitual', bitsD.join(' · ')]);
    }
    const suK =
      typeof normalizaSustratoKey === 'function'
        ? normalizaSustratoKey(cfg.sustrato || state.configSustrato || 'esponja')
        : 'esponja';
    const suN =
      typeof CONFIG_SUSTRATO !== 'undefined' && CONFIG_SUSTRATO[suK]
        ? CONFIG_SUSTRATO[suK].nombre
        : suK;
    rows.push(['Sustrato (referencia cestas)', escHtmlUi(suN)]);
    const formaDw =
      typeof dwcNormalizeDepositoForma === 'function'
        ? dwcNormalizeDepositoForma(cfg.dwcDepositoForma)
        : 'prismatico';
    const l = cfg.dwcDepositoLargoCm;
    const w = cfg.dwcDepositoAnchoCm;
    const p = cfg.dwcDepositoProfCm;
    if (formaDw === 'cilindrico') {
      const dCm =
        typeof dwcDiametroInteriorCmDesdeLW === 'function' ? dwcDiametroInteriorCmDesdeLW(l, w) : null;
      const dStr = dCm != null ? 'Ø ' + Math.round(dCm * 10) / 10 + ' cm' : '—';
      const dP = p != null ? p + ' cm' : '—';
      if (dCm != null || p != null) {
        rows.push(['Depósito físico (Ø interior × prof. útil)', escHtmlUi(dStr + ' × ' + dP)]);
      }
    } else if (formaDw === 'troncopiramidal') {
      const vm = cfg.dwcDepositoVolManualL;
      if (vm != null && Number(vm) > 0) {
        rows.push(['Depósito (volumen útil medido)', escHtmlUi(String(vm) + ' L')]);
      }
      if (l != null || w != null) {
        const dL = l != null ? l + ' cm' : '—';
        const dW = w != null ? w + ' cm' : '—';
        rows.push(['Tapa / referencia lateral (cm)', escHtmlUi(dL + ' × ' + dW)]);
      }
    } else if (l != null || w != null || p != null) {
      const dL = l != null ? l + ' cm' : '—';
      const dW = w != null ? w + ' cm' : '—';
      const dP = p != null ? p + ' cm' : '—';
      rows.push(['Depósito físico (largo × ancho × prof.)', escHtmlUi(dL + ' × ' + dW + ' × ' + dP)]);
    }
    const rim = cfg.dwcNetPotRimMm;
    const hp = cfg.dwcNetPotHeightMm;
    if (rim != null || hp != null) {
      rows.push([
        'Cesta (net pot)',
        escHtmlUi(
          (rim != null ? 'Ø ' + rim + ' mm' : '—') +
            (hp != null ? ' · alto ' + hp + ' mm' : '') +
            ' · ref. 27–50 mm o personalizado (asistente)'
        ),
      ]);
    } else {
      rows.push([
        'Cesta (net pot)',
        escHtmlUi('Indica Ø en mm en Cultivo e instalación o asistente · ref. 27–50 mm o personalizado'),
      ]);
    }
    const mTap = cfg.dwcTapaMarcoPorLadoMm;
    const hTap = cfg.dwcTapaHuecoMm;
    if ((mTap != null && Number.isFinite(Number(mTap))) || (hTap != null && Number.isFinite(Number(hTap)))) {
      const mTxt = mTap != null && Number.isFinite(Number(mTap)) ? Number(mTap) + ' mm/lado' : '—';
      const hTxt = hTap != null && Number.isFinite(Number(hTap)) ? Number(hTap) + ' mm' : 'def. 4 mm';
      rows.push(['Tapa (rejilla · referencia)', escHtmlUi('Marco ' + mTxt + ' · entre cestas ' + hTxt)]);
    }
    const acc = [];
    if (cfg.dwcCupulas === true) acc.push('Cúpulas / humedad');
    if (cfg.dwcEntradaAireManguera === true) acc.push('Entrada manguera de aire');
    if (acc.length) rows.push(['Accesorios', escHtmlUi(acc.join(' · '))]);
  }

  let body = '';
  for (let i = 0; i < rows.length; i++) {
    body +=
      '<tr><th scope="row">' +
      escHtmlUi(rows[i][0]) +
      '</th><td>' +
      rows[i][1] +
      '</td></tr>';
  }
  const capTable =
    '<table class="torre-sistema-resumen-table">' +
    '<caption class="visually-hidden">' +
    escHtmlUi('Valores principales de la instalación según la configuración guardada') +
    '</caption><tbody>' +
    body +
    '</tbody></table>';
  const disclosureHead =
    '<button type="button" id="btnToggleTorreSistemaResumen" ' +
    'class="config-section-collapse-head medir-disclosure-main-head" ' +
    'aria-expanded="true" aria-controls="torreSistemaResumenInner" onclick="toggleTorreSistemaResumenPanel()">' +
    '<span class="config-section-collapse-title-wrap">' +
    '<span class="config-section-collapse-title">' +
    escHtmlUi('Resumen de la instalación configurada') +
    '</span></span>' +
    '<span class="config-section-collapse-chevron" aria-hidden="true">▼</span></button>';
  const disclosureBody =
    '<div id="torreSistemaResumenInner" class="config-section-collapse-body recarga-proxima-collapse-body torre-sistema-resumen-dwc-inner">' +
    capTable +
    '</div>';
  mount.innerHTML =
    '<div class="recarga-card config-section-collapsible torre-sistema-resumen-disclosure">' +
    disclosureHead +
    disclosureBody +
    '</div>';
  applyTorreSistemaResumenCollapseUI();
  mount.removeAttribute('hidden');
}

function torreSistemaResumenColapsoStorageKey() {
  const t =
    typeof tipoInstalacionNormalizado === 'function'
      ? tipoInstalacionNormalizado(state.configTorre || {})
      : 'dwc';
  return t === 'rdwc' ? 'uiTorreSistemaResumenRdwcColapsado' : 'uiTorreSistemaResumenDwcColapsado';
}

function applyTorreSistemaResumenCollapseUI() {
  const cfg = state.configTorre || {};
  const btn = document.getElementById('btnToggleTorreSistemaResumen');
  const inner = document.getElementById('torreSistemaResumenInner');
  if (!btn || !inner) return;
  const key = torreSistemaResumenColapsoStorageKey();
  const col = cfg[key] === true;
  inner.hidden = col;
  btn.setAttribute('aria-expanded', col ? 'false' : 'true');
}

function toggleTorreSistemaResumenPanel() {
  if (!state.configTorre) return;
  const key = torreSistemaResumenColapsoStorageKey();
  const cur = state.configTorre[key] === true;
  state.configTorre[key] = !cur;
  try {
    guardarEstadoTorreActual();
    saveState();
  } catch (_) {}
  applyTorreSistemaResumenCollapseUI();
}
