/**
 * HidroGrow — nutriente en asistente premium (camino semilla + propagador).
 * EC objetivo según variedad y sustrato; dosis orientativa en bandeja del domo.
 */
(function (global) {
  'use strict';

  var VOL_BANDEJA_DEFAULT = 2;
  var _nutrientesCatalogoCompletoGerm = false;

  function el(id) {
    return document.getElementById(id);
  }

  function esc(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function getCfgNutriente() {
    return typeof state !== 'undefined' && state && state.configTorre
      ? state.configTorre
      : {};
  }

  /** Semilla en propagador (o prep hidro en germ): abono de bandeja, no depósito DWC. */
  function caminoUsaNutrienteBandejaPropagador(cfg) {
    cfg = cfg || getCfgNutriente();
    var cam =
      typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : cfg.caminoCultivo || '';
    if (cam === 'semilla_propagador') {
      if (typeof hidrogrowPropagadorEnFaseGermSinHidro === 'function') {
        return hidrogrowPropagadorEnFaseGermSinHidro(cfg);
      }
      return true;
    }
    if (cam === 'semilla_hidro') {
      return typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg);
    }
    return false;
  }

  function isPremiumNutrienteGermActivo(cfg) {
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam === 'semilla_propagador') return true;
    if (
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm()
    ) {
      return true;
    }
    return caminoUsaNutrienteBandejaPropagador(cfg);
  }

  function getNutrienteGermIdFromCfg(cfg) {
    cfg = cfg || getCfgNutriente();
    var g = cfg.germinacionFlow || {};
    var prem = cfg.premiumSetup || {};
    return String(g.nutrienteId || prem.nutrienteGerm || cfg.nutriente || '').trim();
  }

  function getNutrienteGermVolLFromCfg(cfg) {
    cfg = cfg || getCfgNutriente();
    var g = cfg.germinacionFlow || {};
    var prem = cfg.premiumSetup || {};
    var v = Number(g.nutrienteGermVolL != null ? g.nutrienteGermVolL : prem.nutrienteGermVolL);
    return Number.isFinite(v) && v > 0 ? v : VOL_BANDEJA_DEFAULT;
  }

  function etiquetaNutrienteGermConfig(cfg) {
    var id = getNutrienteGermIdFromCfg(cfg);
    if (!id || !Array.isArray(NUTRIENTES_DB)) return '';
    var nut = NUTRIENTES_DB.find(function (n) {
      return n && n.id === id;
    });
    return nut ? nut.nombre || nut.id : id;
  }

  function htmlResumenNutrienteGermConfig(cfg) {
    cfg = cfg || getCfgNutriente();
    var id = getNutrienteGermIdFromCfg(cfg);
    if (!id) return '';
    var nombre = etiquetaNutrienteGermConfig(cfg);
    var vol = getNutrienteGermVolLFromCfg(cfg);
    var ec = getEcObjetivoGermPropagador(cfg);
    return (
      '<div class="hc-sis-prop-nut-plan setup-box-info setup-mb-8" role="status">' +
      '<p><strong>Abono en bandeja:</strong> ' +
      esc(nombre) +
      ' · <strong>' +
      vol +
      ' L</strong> solución orientativa · EC objetivo ' +
      ec.min +
      '–' +
      ec.max +
      ' µS/cm</p></div>'
    );
  }

  function renderHcPropNutrienteGermFields(cfg) {
    cfg = cfg || getCfgNutriente();
    var id = getNutrienteGermIdFromCfg(cfg) || 'canna_aqua';
    var vol = getNutrienteGermVolLFromCfg(cfg);
    var list = getListaNutrientesPremiumGerm();
    var opts = list
      .map(function (n) {
        return (
          '<option value="' +
          esc(n.id) +
          '"' +
          (n.id === id ? ' selected' : '') +
          '>' +
          esc(n.nombre || n.id) +
          '</option>'
        );
      })
      .join('');
    return (
      '<div class="setup-mb-8" id="hcPropNutrienteGermBlock">' +
      '<div class="setup-block-title">Nutriente · bandeja del domo <span class="setup-required-tag">obligatorio</span></div>' +
      '<p class="setup-field-hint setup-mb-8">Agua con abono ~2–3 mm en la bandeja (checklist propagador). Se guarda en la instalación y en Sistema → Propagador.</p>' +
      '<label class="setup-field-label" for="hcPropNutrienteGerm">Línea de abono (veg / A+B)</label>' +
      '<select id="hcPropNutrienteGerm" class="setup-input-city setup-mb-8" onchange="persistHcPropPlanFromModal();hcPropPlanRefreshModalBody()">' +
      opts +
      '</select>' +
      '<label class="setup-field-label" for="hcPropNutrienteGermVolL">Volumen bandeja (L)</label>' +
      '<input type="number" id="hcPropNutrienteGermVolL" class="setup-input-city" min="0.5" max="10" step="0.5" value="' +
      vol +
      '" onchange="persistHcPropPlanFromModal();hcPropPlanRefreshModalBody()">' +
      '</div>'
    );
  }

  function persistNutrienteGermDesdePropModal(cfg) {
    cfg = cfg || getCfgNutriente();
    var sel = el('hcPropNutrienteGerm');
    var volInp = el('hcPropNutrienteGermVolL');
    var nid = sel ? String(sel.value || '').trim() : '';
    var vol = volInp
      ? parseFloat(String(volInp.value || '').replace(',', '.'))
      : getNutrienteGermVolLFromCfg(cfg);
    if (!nid) return;
    var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : null;
    if (p) {
      p.nutrienteGerm = nid;
      p.nutrienteGermVolL = Number.isFinite(vol) && vol >= 0.5 ? Math.round(vol * 10) / 10 : VOL_BANDEJA_DEFAULT;
    }
    if (typeof setupNutriente !== 'undefined') setupNutriente = nid;
    if (typeof persistPremiumNutrienteGermToConfig === 'function') {
      persistPremiumNutrienteGermToConfig(cfg);
    }
  }

  function ensurePremiumNutrienteGermFields() {
    if (typeof ensurePremiumSetup !== 'function') return {};
    var p = ensurePremiumSetup();
    if (p.nutrienteGermVolL == null || !Number.isFinite(Number(p.nutrienteGermVolL))) {
      p.nutrienteGermVolL = VOL_BANDEJA_DEFAULT;
    }
    return p;
  }

  function getPremiumGermVariedadId() {
    var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : {};
    return String(p.variedadGerminacion || '').trim();
  }

  function getPremiumGermSustratoId() {
    var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : {};
    return String(p.sustratoGerm || 'lana').trim() || 'lana';
  }

  function getEcObjetivoGermPropagador(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var p = cfg.premiumSetup || (typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : {});
    var vid = String(p.variedadGerminacion || cfg.variedadGerminacion || '').trim();
    var sustrato = String(p.sustratoGerm || cfg.sustratoGerm || 'lana').trim() || 'lana';
    var fakeCfg = { premiumSetup: p, sustratoGerm: sustrato };
    if (typeof getGerminacionRangosMonitoreo !== 'function') {
      return { min: 400, max: 550, fuente: 'default', ecCentro: 475, ecAplica: true };
    }
    var r = getGerminacionRangosMonitoreo(vid, 'domo', fakeCfg);
    if (r.ecAplica && r.ec && Number.isFinite(r.ecObjetivo)) {
      return {
        min: r.ec.min,
        max: r.ec.max,
        fuente: 'germinacion',
        ecCentro: r.ecObjetivo,
        ecAplica: true,
        rangos: r,
      };
    }
    var ecC = Number.isFinite(r.ecObjetivo) ? r.ecObjetivo : 450;
    return {
      min: Math.max(0, ecC - 80),
      max: ecC + 80,
      fuente: 'germinacion',
      ecCentro: ecC,
      ecAplica: !!r.ecAplica,
      rangos: r,
    };
  }

  function filtrarNutrientesGermLista(list) {
    if (!Array.isArray(list)) return [];
    return list.filter(function (n) {
      return n && (n.faseUso === 'veg' || n.faseUso === 'both');
    });
  }

  function getListaNutrientesPremiumGerm() {
    if (!Array.isArray(NUTRIENTES_DB)) return [];
    var list;
    if (_nutrientesCatalogoCompletoGerm) {
      list = NUTRIENTES_DB.filter(function (n) {
        return (
          n.faseUso !== 'bloom' ||
          !NUTRIENTES_TOP10_ES.some(function (id) {
            var top = NUTRIENTES_DB.find(function (t) {
              return t.id === id;
            });
            return top && top.par_flores === n.id;
          })
        );
      });
    } else {
      list =
        typeof getNutrientesTop10ES === 'function'
          ? getNutrientesTop10ES()
          : NUTRIENTES_DB.filter(function (n) {
              return n.top_es;
            });
    }
    return filtrarNutrientesGermLista(list);
  }

  function getPremiumNutrienteGermVolL() {
    var inp = el('setupPremiumNutrienteGermVolL');
    var raw = inp ? String(inp.value || '').replace(',', '.').trim() : '';
    var n = Number(raw);
    if (Number.isFinite(n) && n >= 0.5 && n <= 10) return Math.round(n * 10) / 10;
    var p = ensurePremiumNutrienteGermFields();
    var pv = Number(p.nutrienteGermVolL);
    return Number.isFinite(pv) && pv > 0 ? pv : VOL_BANDEJA_DEFAULT;
  }

  function persistPremiumNutrienteGermFromUI() {
    if (!isPremiumNutrienteGermActivo(getCfgNutriente())) return;
    var p = ensurePremiumNutrienteGermFields();
    var vol = getPremiumNutrienteGermVolL();
    p.nutrienteGermVolL = vol;
    var selDrop = el('setupPremiumNutrienteGermSelect');
    if (selDrop && selDrop.value) {
      p.nutrienteGerm = String(selDrop.value).trim();
      if (typeof setupNutriente !== 'undefined') setupNutriente = p.nutrienteGerm;
    } else if (typeof setupNutriente !== 'undefined' && setupNutriente) {
      p.nutrienteGerm = setupNutriente;
    }
  }

  function syncPremiumNutrienteGermFromConfig(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var p = ensurePremiumNutrienteGermFields();
    var nid = String(p.nutrienteGerm || cfg.nutriente || '').trim();
    if (!nid && typeof setupNutriente !== 'undefined') nid = setupNutriente;
    if (!nid) nid = 'canna_aqua';
    p.nutrienteGerm = nid;
    if (typeof setupNutriente !== 'undefined') setupNutriente = nid;
    var vol = Number(p.nutrienteGermVolL);
    if (!Number.isFinite(vol) || vol <= 0) p.nutrienteGermVolL = VOL_BANDEJA_DEFAULT;
    var inp = el('setupPremiumNutrienteGermVolL');
    if (inp) inp.value = String(p.nutrienteGermVolL);
    var selDrop = el('setupPremiumNutrienteGermSelect');
    if (selDrop) selDrop.value = nid;
  }

  function renderNutrienteCardHtmlGerm(n, opts) {
    opts = opts || {};
    var selectedId = opts.selectedId != null ? opts.selectedId : 'canna_aqua';
    var onSelect = opts.onSelect || 'selNutrientePremiumGerm';
    var cardId = (opts.idPrefix || 'nut-prem-') + n.id;
    return (
      '<button type="button" class="nutriente-card ' +
      (n.id === selectedId ? 'selected' : '') +
      '" id="' +
      cardId +
      '" data-nut-id="' +
      n.id +
      '" onclick="' +
      onSelect +
      "('" +
      n.id +
      '\')" aria-pressed="' +
      (n.id === selectedId ? 'true' : 'false') +
      '">' +
      '<span class="nutriente-nombre">' +
      esc(n.nombre || n.id) +
      '</span>' +
      '<span class="nutriente-detalle">' +
      esc(n.detalle || '') +
      '</span></button>'
    );
  }

  function renderPremiumNutrienteGermSelect() {
    var wrap = el('setupPremiumNutrienteGermSelectWrap');
    var selExisting = el('setupPremiumNutrienteGermSelect');
    if (!wrap && !selExisting) return;
    var list = getListaNutrientesPremiumGerm();
    if (!list.length && Array.isArray(NUTRIENTES_DB)) {
      list = filtrarNutrientesGermLista(
        NUTRIENTES_DB.filter(function (n) {
          return n && n.top_es;
        })
      );
    }
    var sel =
      typeof setupNutriente !== 'undefined' && setupNutriente
        ? setupNutriente
        : ensurePremiumNutrienteGermFields().nutrienteGerm || 'canna_aqua';
    if (selExisting && selExisting.options && selExisting.options.length > 0) {
      selExisting.value = sel;
      if (!selExisting.value) selExisting.value = 'canna_aqua';
      return;
    }
    var opts = list
      .map(function (n) {
        return (
          '<option value="' +
          esc(n.id) +
          '"' +
          (n.id === sel ? ' selected' : '') +
          '>' +
          esc(n.nombre || n.id) +
          '</option>'
        );
      })
      .join('');
    if (wrap) {
      wrap.innerHTML =
        '<label class="setup-field-label" for="setupPremiumNutrienteGermSelect">Línea de abono (veg / A+B) <span class="setup-required-tag">obligatorio</span></label>' +
        '<select id="setupPremiumNutrienteGermSelect" class="setup-input-city setup-mb-8" onchange="typeof onPremiumNutrienteGermSelectChange===\'function\'&&onPremiumNutrienteGermSelectChange()">' +
        opts +
        '</select>';
      wrap.classList.remove('setup-hidden');
    }
  }

  function onPremiumNutrienteGermSelectChange() {
    var sel = el('setupPremiumNutrienteGermSelect');
    if (!sel || !sel.value) return;
    selNutrientePremiumGerm(sel.value);
    persistPremiumNutrienteGermFromUI();
  }

  function renderNutrientesGridPremiumGerm() {
    var grid = el('nutrientesGridPremiumGerm');
    if (!grid) return;
    var list = getListaNutrientesPremiumGerm();
    var sel =
      typeof setupNutriente !== 'undefined' && setupNutriente
        ? setupNutriente
        : ensurePremiumNutrienteGermFields().nutrienteGerm || 'canna_aqua';
    var renderCard =
      typeof renderNutrienteCardHtml === 'function' ? renderNutrienteCardHtml : renderNutrienteCardHtmlGerm;
    if (!list.length) {
      grid.innerHTML =
        '<p class="setup-field-hint">Usa el desplegable de arriba para elegir el abono.</p>';
    } else {
      grid.innerHTML = list
        .map(function (n) {
          return renderCard(n, {
            selectedId: sel,
            idPrefix: 'nut-prem-',
            onSelect: 'selNutrientePremiumGerm',
          });
        })
        .join('');
    }
    var toggle = el('nutrientesToggleCatalogoPremiumGerm');
    if (toggle) {
      toggle.textContent = _nutrientesCatalogoCompletoGerm
        ? 'Ver top 10 España'
        : 'Ver catálogo completo';
      toggle.classList.toggle('setup-hidden', list.length < 4);
    }
    renderPremiumNutrienteGermSelect();
  }

  function renderPremiumNutrienteGermEcBanner() {
    var box = el('setupPremiumNutrienteGermEcBanner');
    if (!box) return;
    var ec = getEcObjetivoGermPropagador();
    var sub =
      typeof getSustratoGermAguaEc === 'function'
        ? getSustratoGermAguaEc(getPremiumGermSustratoId())
        : null;
    var subLbl = sub && sub.label ? sub.label : getPremiumGermSustratoId();
    var vid = getPremiumGermVariedadId();
    var varLbl = vid;
    if (vid && typeof getGerminacionSpecPorVariedad === 'function') {
      var spec = getGerminacionSpecPorVariedad(vid);
      if (spec && spec.nombreGenetica) varLbl = spec.nombreGenetica;
    }
    var html =
      '<p><strong>EC objetivo en bandeja:</strong> ' +
      ec.min +
      '–' +
      ec.max +
      ' µS/cm</p>';
    if (Number.isFinite(ec.ecCentro)) {
      html += '<p class="setup-field-hint">Centro orientativo ~' + ec.ecCentro + ' µS/cm (domo · ' + esc(subLbl) + ').</p>';
    }
    if (varLbl) {
      html += '<p class="setup-field-hint">Variedad: <strong>' + esc(varLbl) + '</strong>.</p>';
    }
    if (ec.ecAplica === false) {
      html +=
        '<p class="setup-field-hint">En este sustrato la EC en bandeja puede no aplicarse al inicio; elige nutriente igualmente para cuando subas la solución en el domo.</p>';
    }
    box.innerHTML = html;
    box.classList.remove('setup-hidden');
  }

  function renderPremiumNutrienteGermDosis() {
    var preview = el('nutProtocoloPreviewPremiumGerm');
    if (!preview) return;
    var nutId =
      typeof setupNutriente !== 'undefined' && setupNutriente
        ? setupNutriente
        : ensurePremiumNutrienteGermFields().nutrienteGerm;
    if (!nutId || !Array.isArray(NUTRIENTES_DB)) {
      preview.classList.add('setup-hidden');
      return;
    }
    var nut = NUTRIENTES_DB.find(function (n) {
      return n.id === nutId;
    });
    if (!nut) {
      preview.classList.add('setup-hidden');
      return;
    }
    var vol = getPremiumNutrienteGermVolL();
    var ecObj = getEcObjetivoGermPropagador();
    var ecMeta = Math.round((ecObj.min + ecObj.max) / 2);
    var aguaGrifo =
      typeof setupData !== 'undefined' && setupData.agua === 'grifo';
    var usarCalMag =
      typeof usarCalMagEnRecarga === 'function' ? usarCalMagEnRecarga() : false;
    var ctx = { modoSoft: !aguaGrifo, usarCalMag: !!(nut.calmagNecesario && usarCalMag) };
    var mlCalMag = 0;
    if (usarCalMag && nut.calmagNecesario && typeof mlCalMagParaAguaBlanda === 'function') {
      mlCalMag = Math.round(mlCalMagParaAguaBlanda(vol) * 10) / 10;
    } else if (usarCalMag && nut.calmagMl) {
      mlCalMag = Math.round(nut.calmagMl * (vol / 18) * 10) / 10;
    }
    var partes = nut.partes || 1;
    var orden =
      nut.orden && nut.orden.length >= partes
        ? nut.orden
        : ['Parte A', 'Parte B', 'Parte C'];
    var mlPorParte = [];
    for (var i = 0; i < partes; i++) {
      mlPorParte.push(
        typeof mlAbonoParteDinamica === 'function'
          ? mlAbonoParteDinamica(nut, i, vol, ecMeta, ctx)
          : typeof mlNutrientePorParte === 'function'
            ? mlNutrientePorParte(nut.id, i, vol)
            : 0
      );
    }
    var pHR =
      typeof torreGetPhRangoObjetivo === 'function'
        ? torreGetPhRangoObjetivo(nut, {})
        : nut.pHRango || [5.5, 6.5];

    var html = '<div class="nut-dosis-titulo">Dosis orientativa · bandeja propagador</div>';
    html +=
      '<div class="nut-dosis-ctx">Bandeja <strong>' +
      vol +
      ' L</strong> · EC objetivo <strong>' +
      ecObj.min +
      '–' +
      ecObj.max +
      ' µS/cm</strong> <span class="nut-dosis-ctx-tag--ok">(germinación)</span></div>';
    var paso = 1;
    if (mlCalMag > 0) {
      html +=
        '<div class="nut-dosis-row"><span class="nut-dosis-lab"><strong>' +
        paso++ +
        '.</strong> CalMag</span><span class="nut-dosis-val-green">' +
        mlCalMag +
        ' ml</span></div>';
    }
    if (partes === 1) {
      html +=
        '<div class="nut-dosis-row"><span class="nut-dosis-lab"><strong>' +
        paso++ +
        '.</strong> ' +
        esc(orden[0]) +
        '</span><span class="nut-dosis-val-green">' +
        mlPorParte[0] +
        ' ml</span></div>';
    } else if (partes === 2) {
      html +=
        '<div class="nut-dosis-row"><span class="nut-dosis-lab"><strong>' +
        paso++ +
        '.</strong> ' +
        esc(orden[0]) +
        '</span><span class="nut-dosis-val-green">' +
        mlPorParte[0] +
        ' ml</span></div>';
      html +=
        '<div class="nut-dosis-row"><span class="nut-dosis-lab"><strong>' +
        paso++ +
        '.</strong> ' +
        esc(orden[1]) +
        '</span><span class="nut-dosis-val-green">' +
        mlPorParte[1] +
        ' ml</span></div>';
    } else {
      for (var j = 0; j < partes; j++) {
        html +=
          '<div class="nut-dosis-row"><span class="nut-dosis-lab"><strong>' +
          paso++ +
          '.</strong> ' +
          esc(orden[j] || 'Parte ' + (j + 1)) +
          '</span><span class="nut-dosis-val-green">' +
          (mlPorParte[j] || 0) +
          ' ml</span></div>';
      }
    }
    html +=
      '<div class="nut-dosis-row nut-dosis-row--ph"><span class="nut-dosis-lab"><strong>' +
      paso +
      '.</strong> pH objetivo</span><span class="nut-dosis-val-blue">' +
      pHR[0] +
      '–' +
      pHR[1] +
      '</span></div>';
    if (nut.id === 'ghe_flora') {
      html +=
        '<div class="nut-dosis-ghe">GHE: FloraMicro siempre primero. No mezclar Micro con Bloom en concentrado.</div>';
    }
    html +=
      '<div class="nut-dosis-foot">Ajusta al medir EC en Medir (domo). Empieza por la mitad si la cepa es sensible.</div>';
    preview.classList.remove('setup-hidden');
    preview.innerHTML = html;
  }

  function refreshPremiumNutrienteGermSection() {
    var sec = el('setupPremiumNutrienteGermSection');
    var page4 = el('spagePremium4');
    var show = isPremiumNutrienteGermActivo(getCfgNutriente());
    if (sec) {
      sec.classList.toggle('setup-hidden', !show);
      if (show) {
        sec.classList.remove('setup-hidden');
        sec.setAttribute('aria-hidden', 'false');
      } else {
        sec.setAttribute('aria-hidden', 'true');
      }
    }
    if (page4) page4.classList.toggle('hc-prop-nutriente-page', !!show);
    if (!show) return;
    syncPremiumNutrienteGermFromConfig();
    renderPremiumNutrienteGermSelect();
    renderPremiumNutrienteGermEcBanner();
    renderNutrientesGridPremiumGerm();
    renderPremiumNutrienteGermDosis();
    var hint = el('setupPremiumNutrienteGermHint');
    if (hint) {
      hint.textContent =
        'Elige el abono (desplegable o tarjetas) para la solución de la bandeja (~2–3 mm de agua con nutriente en el domo).';
    }
  }

  function selNutrientePremiumGerm(id) {
    if (typeof setupNutriente !== 'undefined') setupNutriente = id;
    var p = ensurePremiumNutrienteGermFields();
    p.nutrienteGerm = id;
    var selDrop = el('setupPremiumNutrienteGermSelect');
    if (selDrop && selDrop.value !== id) selDrop.value = id;
    document.querySelectorAll('.nutriente-card[data-nut-id]').forEach(function (c) {
      var match = c.getAttribute('data-nut-id') === id;
      c.classList.toggle('selected', match);
      c.setAttribute('aria-pressed', match ? 'true' : 'false');
    });
    renderPremiumNutrienteGermDosis();
  }

  function toggleNutrientesCatalogoPremiumGerm() {
    _nutrientesCatalogoCompletoGerm = !_nutrientesCatalogoCompletoGerm;
    renderNutrientesGridPremiumGerm();
  }

  function onPremiumNutrienteGermVolChange() {
    persistPremiumNutrienteGermFromUI();
    renderPremiumNutrienteGermDosis();
  }

  function validarPremiumNutrienteGerm() {
    if (!isPremiumNutrienteGermActivo(getCfgNutriente())) return true;
    persistPremiumNutrienteGermFromUI();
    var nid =
      typeof setupNutriente !== 'undefined' && setupNutriente
        ? setupNutriente
        : ensurePremiumNutrienteGermFields().nutrienteGerm;
    if (!nid || !Array.isArray(NUTRIENTES_DB) || !NUTRIENTES_DB.some(function (n) { return n.id === nid; })) {
      if (typeof showToast === 'function') {
        showToast('Elige un nutriente para la solución del propagador', true);
      }
      return false;
    }
    var vol = getPremiumNutrienteGermVolL();
    if (!Number.isFinite(vol) || vol < 0.5) {
      if (typeof showToast === 'function') {
        showToast('Indica el volumen de la bandeja (litros)', true);
      }
      return false;
    }
    if (!getPremiumGermVariedadId()) {
      if (typeof showToast === 'function') {
        showToast('Vuelve al paso Germinación y elige la variedad (EC depende de la cepa)', true);
      }
      return false;
    }
    return true;
  }

  function syncNutrienteGermAGerminacionFlow(cfg) {
    if (!cfg) return;
    var p = cfg.premiumSetup || {};
    var nid = String(p.nutrienteGerm || cfg.nutriente || '').trim();
    if (!nid) return;
    if (typeof ensureGerminacionFlow !== 'function' || typeof origenEsSemilla !== 'function') {
      return;
    }
    if (!origenEsSemilla(cfg)) return;
    var g = ensureGerminacionFlow(cfg);
    g.nutrienteId = nid;
    g.nutrienteGermVolL = Number.isFinite(Number(p.nutrienteGermVolL))
      ? p.nutrienteGermVolL
      : getNutrienteGermVolLFromCfg(cfg);
  }

  function persistPremiumNutrienteGermToConfig(cfg) {
    cfg = cfg || getCfgNutriente();
    if (!cfg || !isPremiumNutrienteGermActivo(cfg)) return;
    persistPremiumNutrienteGermFromUI();
    var p = ensurePremiumNutrienteGermFields();
    if (!cfg.premiumSetup || typeof cfg.premiumSetup !== 'object') cfg.premiumSetup = {};
    cfg.premiumSetup.nutrienteGerm = p.nutrienteGerm;
    cfg.premiumSetup.nutrienteGermVolL = p.nutrienteGermVolL;
    if (p.nutrienteGerm) {
      cfg.nutriente = p.nutrienteGerm;
      if (typeof setupNutriente !== 'undefined') setupNutriente = p.nutrienteGerm;
    }
    syncNutrienteGermAGerminacionFlow(cfg);
  }

  global.caminoUsaNutrienteBandejaPropagador = caminoUsaNutrienteBandejaPropagador;
  global.getNutrienteGermIdFromCfg = getNutrienteGermIdFromCfg;
  global.getNutrienteGermVolLFromCfg = getNutrienteGermVolLFromCfg;
  global.etiquetaNutrienteGermConfig = etiquetaNutrienteGermConfig;
  global.htmlResumenNutrienteGermConfig = htmlResumenNutrienteGermConfig;
  global.renderHcPropNutrienteGermFields = renderHcPropNutrienteGermFields;
  global.persistNutrienteGermDesdePropModal = persistNutrienteGermDesdePropModal;
  global.isPremiumNutrienteGermActivo = isPremiumNutrienteGermActivo;
  global.getEcObjetivoGermPropagador = getEcObjetivoGermPropagador;
  global.refreshPremiumNutrienteGermSection = refreshPremiumNutrienteGermSection;
  global.syncPremiumNutrienteGermFromConfig = syncPremiumNutrienteGermFromConfig;
  global.persistPremiumNutrienteGermFromUI = persistPremiumNutrienteGermFromUI;
  global.persistPremiumNutrienteGermToConfig = persistPremiumNutrienteGermToConfig;
  global.validarPremiumNutrienteGerm = validarPremiumNutrienteGerm;
  global.selNutrientePremiumGerm = selNutrientePremiumGerm;
  global.toggleNutrientesCatalogoPremiumGerm = toggleNutrientesCatalogoPremiumGerm;
  global.onPremiumNutrienteGermVolChange = onPremiumNutrienteGermVolChange;
  global.onPremiumNutrienteGermSelectChange = onPremiumNutrienteGermSelectChange;
  global.renderPremiumNutrienteGermDosis = renderPremiumNutrienteGermDosis;
})();
