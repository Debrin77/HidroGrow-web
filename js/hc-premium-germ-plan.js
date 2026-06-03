/**
 * Plan de germinación en asistente: cantidad de semillas + sustrato (camino propagador / semilla hidro).
 */
(function (global) {
  'use strict';

  function hintSustratoGerm(id) {
    if (typeof getSustratoGermAguaEc !== 'function') {
      var fb = {
        lana: 'Remojo pH 5,5 · bandeja 2–5 mm · EC propagador 0–500 µS.',
        esponja: 'Pellet tibio pH 5,8 · sin charco · EC 0–400 µS.',
        papel: 'Papel húmedo sin EC · traslado a cubo con radícula.',
        coco: 'Plug pH 5,6 · EC remojo 400–600 µS · bandeja ligera.',
      };
      return fb[id] || '';
    }
    var s = getSustratoGermAguaEc(id);
    var rm = s.remojo || {};
    var bd = s.bandeja || {};
    var pr = s.propagador || {};
    var bits = [];
    if (rm.phRango) bits.push('pH ' + rm.phRango);
    if (rm.ecUs) bits.push('EC ' + rm.ecUs);
    if (bd.agua) bits.push(bd.agua);
    if (Array.isArray(pr.ecUs)) bits.push('domo ' + pr.ecUs[0] + '–' + pr.ecUs[1] + ' µS');
    return bits.join(' · ');
  }

  var SUSTRATO_GERM_OPTS = [
    { id: 'lana', label: 'Lana de roca 4×4', hint: hintSustratoGerm('lana') },
    { id: 'esponja', label: 'Jiffy / esponja', hint: hintSustratoGerm('esponja') },
    { id: 'papel', label: 'Papel de germinación', hint: hintSustratoGerm('papel') },
    { id: 'coco', label: 'Coco / plug', hint: hintSustratoGerm('coco') },
  ];

  var BANDEJA_OPTS = [
    { id: 'auto', label: 'Según mi propagador (catálogo)' },
    { id: '77', label: 'Bandeja 77 alvéolos (Grodan / Cultilene)' },
    { id: '24', label: 'Propagador 24 celdas (p. ej. Hydropony)' },
    { id: '84', label: 'Bandeja Jiffy ~84 pellets' },
    { id: 'manual', label: 'Otra / a mano' },
  ];

  /** Capacidad orientativa por modelo top ES (catálogo). */
  var PROPAGADOR_CAPACIDAD = {
    sj_propagator_l: { celdas: 77, semillasTip: '6–12', nota: 'Domo L · 1 bandeja 77 alvéolos.' },
    garland_prop_large: { celdas: 77, semillasTip: '6–12', nota: 'Domo alto · bandeja estándar 59×39 cm.' },
    garland_prop_std: { celdas: 77, semillasTip: '4–10', nota: 'Domo estándar · autocultivo suele usar pocos cubos.' },
    platinium_prop: { celdas: 77, semillasTip: '6–12', nota: 'Misma lógica que domo Secret Jardin / Garland.' },
    biogreen_prop: { celdas: 24, semillasTip: '3–8', nota: 'Compacto · menos celdas visibles.' },
    hydropony_prop: { celdas: 24, semillasTip: '4–12', nota: '24 celdas integradas · no hace falta llenar todas.' },
    dome_flexible: { celdas: 77, semillasTip: '6–12', nota: 'Sobre bandeja 77 o Jiffy 84.' },
    propagator_xl: { celdas: 77, semillasTip: '8–20', nota: 'XL · más clones o varias filas.' },
    heated_prop: { celdas: 77, semillasTip: '6–12', nota: 'Con calefacción · invierno.' },
    sj_dark_prop: { celdas: 77, semillasTip: '6–12', nota: 'Domo opaco · germinación.' },
  };

  function el(id) {
    return document.getElementById(id);
  }

  function ensurePremiumGermFields(p) {
    if (!Number.isFinite(p.numSemillasGerm) || p.numSemillasGerm < 1) p.numSemillasGerm = 6;
    if (!p.sustratoGerm) p.sustratoGerm = 'lana';
    if (!p.bandejaGerm) p.bandejaGerm = 'auto';
    return p;
  }

  function getWizardCfg() {
    if (typeof getWizardEquipCfg === 'function') return getWizardEquipCfg();
    return typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
  }

  function capacidadDesdePropagadorInstalado(cfg) {
    cfg = cfg || getWizardCfg();
    var inst = cfg.equipamientoInstalado || {};
    var prop = inst.propagador;
    if (!prop || !prop.id) return null;
    var cap = PROPAGADOR_CAPACIDAD[prop.id];
    if (cap) return cap;
    var band = prop.specs && Number(prop.specs.bandejas);
    var celdas = prop.specs && Number(prop.specs.celdas);
    if (Number.isFinite(celdas) && celdas > 0) {
      return {
        celdas: celdas,
        semillasTip: Math.min(12, Math.max(3, Math.round(celdas * 0.5))) + '',
        nota: (prop.marca || '') + ' ' + (prop.modelo || ''),
      };
    }
    if (band === 24) return PROPAGADOR_CAPACIDAD.hydropony_prop;
    return { celdas: 77, semillasTip: '6–12', nota: 'Domo genérico · bandeja 77 alvéolos habitual en ES.' };
  }

  function sugerirNumSemillas(cfg, p) {
    p = ensurePremiumGermFields(p || (typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : {}));
    if (p.numSemillasGermManual) return p.numSemillasGerm;
    var cap = capacidadDesdePropagadorInstalado(cfg);
    var bandeja = p.bandejaGerm || 'auto';
    var maxCeldas = 77;
    if (bandeja === '24') maxCeldas = 24;
    else if (bandeja === '84') maxCeldas = 84;
    else if (bandeja === '77') maxCeldas = 77;
    else if (cap && cap.celdas) maxCeldas = cap.celdas;
    var def = 6;
    if (maxCeldas <= 24) def = Math.min(8, Math.max(4, Math.round(maxCeldas * 0.35)));
    else def = Math.min(12, Math.max(4, Math.round(maxCeldas * 0.12)));
    return Math.min(72, Math.max(1, def));
  }

  function etiquetaSustratoGerm(key) {
    var o = SUSTRATO_GERM_OPTS.find(function (x) {
      return x.id === key;
    });
    return o ? o.label : key || '—';
  }

  function ensureGermPlanHost() {
    var host = el('setupPremiumGermAhoraHost');
    if (!host) return null;
    var sec = el('setupPremiumGermPlanSection');
    if (!sec) {
      sec = document.createElement('div');
      sec.id = 'setupPremiumGermPlanSection';
      sec.className = 'setup-mb-12';
      sec.setAttribute('role', 'group');
      sec.setAttribute('aria-label', 'Plan de germinación');
      if (host.firstChild) host.insertBefore(sec, host.firstChild);
      else host.appendChild(sec);
    }
    return sec;
  }

  function renderPremiumGermPlanUI() {
    var sec = ensureGermPlanHost();
    if (!sec) return;
    var show =
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm();
    if (!show) {
      sec.classList.add('setup-hidden');
      sec.innerHTML = '';
      return;
    }
    sec.classList.remove('setup-hidden');
    var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : {};
    ensurePremiumGermFields(p);
    var cfg = getWizardCfg();
    var cap = capacidadDesdePropagadorInstalado(cfg);
    if (!p.numSemillasGermManual) {
      p.numSemillasGerm = sugerirNumSemillas(cfg, p);
    }
    var capHtml = '';
    if (!cap) {
      capHtml =
        '<p class="setup-field-hint setup-mb-8" id="setupPremiumGermCapHint">Elige domo arriba para sugerir semillas.</p>';
    }
    var sustratoBtns = SUSTRATO_GERM_OPTS.map(function (o) {
      var sel = p.sustratoGerm === o.id ? ' selected' : '';
      return (
        '<button type="button" class="equip-card equip-card-pad-12' +
        sel +
        '" data-sustrato-germ="' +
        o.id +
        '" onclick="seleccionarPremiumSustratoGerm(\'' +
        o.id +
        '\')" title="' +
        String(o.hint || '').replace(/"/g, '&quot;') +
        '">' +
        '<div class="setup-option-title-md">' +
        o.label +
        '</div>' +
        (o.hint ? '<div class="setup-field-hint setup-mt-4">' + o.hint + '</div>' : '') +
        '</button>'
      );
    }).join('');
    var sustratoAguaHtml =
      typeof renderSustratoGermAguaEcBlockHtml === 'function'
        ? renderSustratoGermAguaEcBlockHtml(p.sustratoGerm || 'lana', 'semilla', { compact: false })
        : '';
    var bandOpts = BANDEJA_OPTS.map(function (o) {
      return (
        '<option value="' +
        o.id +
        '"' +
        (p.bandejaGerm === o.id ? ' selected' : '') +
        '>' +
        o.label +
        '</option>'
      );
    }).join('');
    sec.innerHTML =
      '<div class="setup-block-title setup-mb-8">Plan en el propagador</div>' +
      capHtml +
      '<div class="setup-grid-2 setup-grid-gap-8 setup-mb-8">' +
      '<div><label class="setup-field-label" for="setupPremiumNumSemillasGerm">Semillas</label>' +
      '<input type="number" id="setupPremiumNumSemillasGerm" class="setup-input-city" min="1" max="72" step="1" value="' +
      p.numSemillasGerm +
      '" oninput="persistPremiumGermPlanFromUI(true)" onchange="persistPremiumGermPlanFromUI(true)"></div>' +
      '<div><label class="setup-field-label" for="setupPremiumBandejaGerm">Bandeja</label>' +
      '<select id="setupPremiumBandejaGerm" class="setup-input-city" onchange="persistPremiumGermPlanFromUI(false)">' +
      bandOpts +
      '</select></div></div>' +
      '<label class="setup-field-label setup-mb-4">Sustrato</label>' +
      '<div class="setup-grid-2 setup-grid-gap-8 setup-mb-4 hc-germ-ahora-sustrato">' +
      sustratoBtns +
      '</div>' +
      '<div id="setupPremiumGermSustratoAguaHost" class="setup-mb-8">' +
      sustratoAguaHtml +
      '</div>' +
      '<p id="setupPremiumGermPlanReq" class="setup-field-hint setup-hidden" role="note"></p>';
    refreshPremiumGermPlanReq();
  }

  function refreshPremiumGermPlanReq() {
    var req = el('setupPremiumGermPlanReq');
    if (!req) return;
    var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : {};
    var n = Number(p.numSemillasGerm);
    if (!Number.isFinite(n) || n < 1) {
      req.classList.remove('setup-hidden');
      req.className = 'setup-field-hint setup-mb-4';
      req.textContent = 'Indica al menos 1 semilla.';
      return;
    }
    req.classList.add('setup-hidden');
    req.textContent = '';
  }

  function seleccionarPremiumSustratoGerm(id) {
    var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : null;
    if (!p) return;
    var ok = SUSTRATO_GERM_OPTS.some(function (o) {
      return o.id === id;
    });
    p.sustratoGerm = ok ? id : 'lana';
    renderPremiumGermPlanUI();
    syncGermPlanATorreDraft();
  }

  function persistPremiumGermPlanFromUI(manualSemillas) {
    var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : null;
    if (!p) return;
    var n = parseInt(String(el('setupPremiumNumSemillasGerm')?.value || p.numSemillasGerm || 6), 10);
    p.numSemillasGerm = Math.min(72, Math.max(1, Number.isFinite(n) ? n : 6));
    if (manualSemillas) p.numSemillasGermManual = true;
    p.bandejaGerm = String(el('setupPremiumBandejaGerm')?.value || p.bandejaGerm || 'auto');
    if (!manualSemillas && p.bandejaGerm !== 'manual') {
      p.numSemillasGermManual = false;
      p.numSemillasGerm = sugerirNumSemillas(getWizardCfg(), p);
      var inp = el('setupPremiumNumSemillasGerm');
      if (inp) inp.value = String(p.numSemillasGerm);
    }
    refreshPremiumGermPlanReq();
    syncGermPlanATorreDraft();
    if (typeof refreshDashGerminacionHub === 'function') refreshDashGerminacionHub();
    if (typeof hcRefreshSistemaFasePanel === 'function') hcRefreshSistemaFasePanel();
  }

  function syncGermPlanATorreDraft() {
    var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : null;
    if (!p) return;
    var cfg =
      typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : null;
    if (!cfg) return;
    if (!cfg.premiumSetup || typeof cfg.premiumSetup !== 'object') cfg.premiumSetup = {};
    cfg.premiumSetup.numSemillasGerm = p.numSemillasGerm;
    cfg.premiumSetup.sustratoGerm = p.sustratoGerm;
    cfg.premiumSetup.bandejaGerm = p.bandejaGerm;
    cfg.sustratoGerm = p.sustratoGerm;
    if (p.sustratoGerm === 'lana' || p.sustratoGerm === 'coco') {
      cfg.sustrato = p.sustratoGerm;
    } else if (p.sustratoGerm === 'esponja') {
      cfg.sustrato = 'esponja';
    }
    if (typeof setupData !== 'undefined' && setupData) {
      setupData.sustrato = cfg.sustrato;
    }
    if (typeof ensureGerminacionFlow === 'function') {
      var g = ensureGerminacionFlow(cfg);
      g.numSemillas = p.numSemillasGerm;
      g.semillasActivas = p.numSemillasGerm;
      g.sustratoGerm = p.sustratoGerm;
    }
  }

  function syncPremiumGermPlanFromConfig(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : null;
    if (!p) return;
    var prem = cfg.premiumSetup || {};
    if (Number.isFinite(prem.numSemillasGerm)) p.numSemillasGerm = prem.numSemillasGerm;
    if (prem.sustratoGerm) p.sustratoGerm = prem.sustratoGerm;
    if (prem.bandejaGerm) p.bandejaGerm = prem.bandejaGerm;
    if (cfg.germinacionFlow && Number.isFinite(cfg.germinacionFlow.numSemillas)) {
      p.numSemillasGerm = cfg.germinacionFlow.numSemillas;
    }
    if (cfg.germinacionFlow && cfg.germinacionFlow.sustratoGerm) {
      p.sustratoGerm = cfg.germinacionFlow.sustratoGerm;
    }
    if (cfg.sustratoGerm) p.sustratoGerm = cfg.sustratoGerm;
    ensurePremiumGermFields(p);
  }

  function persistPremiumGermPlanToConfig(cfg) {
    var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : null;
    if (!p || !cfg) return;
    persistPremiumGermPlanFromUI(!!p.numSemillasGermManual);
    if (!cfg.premiumSetup || typeof cfg.premiumSetup !== 'object') cfg.premiumSetup = {};
    cfg.premiumSetup.numSemillasGerm = p.numSemillasGerm;
    cfg.premiumSetup.sustratoGerm = p.sustratoGerm;
    cfg.premiumSetup.bandejaGerm = p.bandejaGerm;
    cfg.sustratoGerm = p.sustratoGerm;
    if (p.sustratoGerm === 'lana' || p.sustratoGerm === 'coco' || p.sustratoGerm === 'esponja') {
      cfg.sustrato = p.sustratoGerm === 'papel' ? 'esponja' : p.sustratoGerm;
    }
    if (typeof ensureGerminacionFlow === 'function' && typeof origenEsSemilla === 'function' && origenEsSemilla(cfg)) {
      var g = ensureGerminacionFlow(cfg);
      g.numSemillas = Math.min(72, Math.max(1, Math.round(Number(p.numSemillasGerm) || 1)));
      g.semillasActivas = g.numSemillas;
      g.sustratoGerm = p.sustratoGerm;
    }
    cfg.numSemillasGerm = p.numSemillasGerm;
    cfg.sustratoGerm = p.sustratoGerm;
  }

  function requiereValidacionPlanGerm(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    return cam === 'semilla_propagador' || cam === 'semilla_hidro';
  }

  function resolveNumSemillasGermPlan(cfg, g, prem) {
    prem = prem || (cfg && cfg.premiumSetup) || {};
    g = g || {};
    var nPrem = Math.round(Number(prem.numSemillasGerm));
    var nFlow = Math.round(Number(g.numSemillas));
    if (Number.isFinite(nPrem) && nPrem >= 1) {
      if (prem.numSemillasGermManual || !Number.isFinite(nFlow) || nFlow < 1) {
        return nPrem;
      }
      return Math.max(nPrem, nFlow);
    }
    return Number.isFinite(nFlow) && nFlow >= 1 ? nFlow : 0;
  }

  function getPlanGermEstado(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (typeof hcGerminacionSyncDesdePremium === 'function') {
      hcGerminacionSyncDesdePremium(cfg);
    }
    var g = typeof ensureGerminacionFlow === 'function' ? ensureGerminacionFlow(cfg) : {};
    var prem = cfg.premiumSetup || {};
    var variedad = String(g.variedadId || prem.variedadGerminacion || '').trim();
    var n = resolveNumSemillasGermPlan(cfg, g, prem);
    var sustrato = String(g.sustratoGerm || prem.sustratoGerm || cfg.sustratoGerm || '').trim();
    var inst = cfg.equipamientoInstalado || {};
    var propagador = !!(inst.propagador && (inst.propagador.id || inst.propagador.marca));
    var nombreVar = '';
    if (variedad && typeof getCultivoDB === 'function') {
      var cu = getCultivoDB(variedad);
      if (cu && cu.nombre) nombreVar = cu.nombre;
    }
    return {
      variedad: variedad,
      nombreVar: nombreVar || variedad,
      numSemillas: Number.isFinite(n) && n >= 1 ? n : 0,
      sustrato: sustrato,
      propagador: propagador,
    };
  }

  function validarPlanGerminacionCompleto(cfg, opts) {
    opts = opts || {};
    if (!requiereValidacionPlanGerm(cfg)) {
      return { ok: true, missing: [], message: '' };
    }
    var st = getPlanGermEstado(cfg);
    var missing = [];
    if (!st.variedad) missing.push('genética');
    if (!st.numSemillas || st.numSemillas < 1) missing.push('número de semillas');
    if (!st.sustrato) missing.push('sustrato en propagador');
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (opts.requierePropagador !== false && cam === 'semilla_propagador' && !st.propagador) {
      missing.push('propagador/domo en catálogo');
    }
    var ok = missing.length === 0;
    return {
      ok: ok,
      missing: missing,
      message: ok
        ? ''
        : 'Falta: ' + missing.join(', ') + '.',
      estado: st,
    };
  }

  function persistHcPropPlanFromModal() {
    var cfg = typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : null;
    if (!cfg) return;
    var vid = String(el('hcPropVariedadGerm')?.value || '').trim();
    if (vid && typeof syncVariedadGermATorre === 'function') {
      syncVariedadGermATorre(vid);
    }
    var n = parseInt(String(el('hcPropNumSemillas')?.value || ''), 10);
    var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : null;
    if (p) {
      p.numSemillasGerm = Math.min(72, Math.max(1, Number.isFinite(n) ? n : p.numSemillasGerm || 6));
      p.numSemillasGermManual = true;
      var sub = el('hcPropSustratoGerm');
      if (sub) p.sustratoGerm = String(sub.value || p.sustratoGerm || 'lana');
    }
    if (typeof persistPremiumGermPlanToConfig === 'function') persistPremiumGermPlanToConfig(cfg);
    try {
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
      if (typeof saveState === 'function') saveState();
    } catch (_) {}
  }

  function renderPlanGermModalBlock(cfg) {
    if (!requiereValidacionPlanGerm(cfg)) return '';
    var st = getPlanGermEstado(cfg);
    var v = validarPlanGerminacionCompleto(cfg);
    var prem = cfg.premiumSetup || {};
    var pref = prem.geneticaPref === 'auto' ? 'auto' : prem.geneticaPref === 'foto' ? 'foto' : '';
    var opts =
      typeof listGeneticasGerminacionOptions === 'function'
        ? listGeneticasGerminacionOptions(st.variedad, pref)
        : '<option value="">— Elige genética —</option>';
    var sustratoBtns = SUSTRATO_GERM_OPTS.map(function (o) {
      var sel = st.sustrato === o.id ? ' selected' : '';
      return (
        '<button type="button" class="equip-card equip-card-pad-8 hc-prop-plan-sus' +
        sel +
        '" data-sus="' +
        o.id +
        '" onclick="hcPropPlanSeleccionarSustrato(\'' +
        o.id +
        '\')">' +
        o.label +
        '</button>'
      );
    }).join('');
    var alertCls = v.ok ? 'setup-box-info' : 'setup-box-warn';
    return (
      '<section class="hc-prop-plan-block setup-mb-12" id="hcPropPlanGermBlock" aria-label="Plan de germinación">' +
      '<div class="setup-block-title">Plan de germinación <span class="setup-required-tag">obligatorio</span></div>' +
      '<p class="setup-field-hint setup-mb-8">Antes de cerrar el checklist: define genética, cuántas semillas y sustrato. Se verán en <strong>Sistema → Propagador</strong>.</p>' +
      '<div class="' +
      alertCls +
      ' setup-mb-8" id="hcPropPlanGermStatus" role="status">' +
      (v.ok
        ? '<strong>✓ Plan listo:</strong> ' +
          esc(st.nombreVar) +
          ' · ' +
          st.numSemillas +
          ' semilla(s) · ' +
          etiquetaSustratoGerm(st.sustrato) +
          (st.propagador ? '' : ' · <em>sin domo en catálogo</em>')
        : '<strong>Pendiente:</strong> ' +
          esc(v.message) +
          ' Complétalo aquí o en el asistente (Germinación ahora).') +
      '</div>' +
      '<label class="setup-field-label" for="hcPropVariedadGerm">Genética (semilla)</label>' +
      '<select id="hcPropVariedadGerm" class="setup-input-city setup-mb-8" onchange="persistHcPropPlanFromModal();hcPropPlanRefreshModalBody()">' +
      opts +
      '</select>' +
      '<div class="setup-grid-2 setup-grid-gap-8 setup-mb-8">' +
      '<div><label class="setup-field-label" for="hcPropNumSemillas">Semillas a germinar</label>' +
      '<input type="number" id="hcPropNumSemillas" class="setup-input-city" min="1" max="72" step="1" value="' +
      (st.numSemillas || 6) +
      '" onchange="persistHcPropPlanFromModal();hcPropPlanRefreshModalBody()"></div>' +
      '<div><label class="setup-field-label" for="hcPropSustratoGerm">Sustrato</label>' +
      '<select id="hcPropSustratoGerm" class="setup-input-city" onchange="persistHcPropPlanFromModal();hcPropPlanRefreshModalBody()">' +
      SUSTRATO_GERM_OPTS.map(function (o) {
        return (
          '<option value="' +
          o.id +
          '"' +
          (st.sustrato === o.id ? ' selected' : '') +
          '>' +
          o.label +
          '</option>'
        );
      }).join('') +
      '</select></div></div>' +
      '<div class="setup-grid-2 setup-grid-gap-6 hc-prop-plan-sus-grid setup-hidden" aria-hidden="true">' +
      sustratoBtns +
      '</div></section>'
    );
  }

  function esc(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function hcPropPlanSeleccionarSustrato(id) {
    var sel = el('hcPropSustratoGerm');
    if (sel) sel.value = id;
    persistHcPropPlanFromModal();
    hcPropPlanRefreshModalBody();
  }

  function hcPropPlanRefreshModalBody() {
    if (typeof hcRerenderPropagadorMontajeModal === 'function') hcRerenderPropagadorMontajeModal();
  }

  function updatePropagadorMontajeFoot(cfg) {
    var btn = document.querySelector('#modalPropagadorMontaje .hc-pm-foot .btn-primary');
    if (!btn) return;
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam === 'esqueje_hidro') {
      btn.textContent = 'Confirmar enraizado';
      return;
    }
    if (cam === 'semilla_hidro') {
      btn.textContent = validarPlanGerminacionCompleto(cfg).ok
        ? 'Confirmar prep hidro'
        : 'Completa el plan de germinación';
      return;
    }
    btn.textContent = validarPlanGerminacionCompleto(cfg).ok
      ? 'Confirmar propagador'
      : 'Completa genética y semillas';
  }

  function hcGerminacionBloqueadaPorPlanDatos(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (!requiereValidacionPlanGerm(cfg)) return false;
    if (typeof propagadorMontajeCompleto === 'function' && !propagadorMontajeCompleto(cfg)) {
      return false;
    }
    return !validarPlanGerminacionCompleto(cfg).ok;
  }

  function validarPremiumGermPlan() {
    if (
      typeof hcCaminoSemillaPropagadorSetupGerm !== 'function' ||
      !hcCaminoSemillaPropagadorSetupGerm()
    ) {
      return true;
    }
    persistPremiumGermPlanFromUI(true);
    var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : {};
    if (!Number.isFinite(p.numSemillasGerm) || p.numSemillasGerm < 1) {
      if (typeof showToast === 'function') showToast('Indica cuántas semillas vas a germinar en el propagador', true);
      return false;
    }
    if (!p.sustratoGerm) {
      if (typeof showToast === 'function') showToast('Elige el sustrato del propagador (lana, jiffy, papel…)', true);
      return false;
    }
    return true;
  }

  function onPropagadorEquipSeleccionado() {
    var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : null;
    if (!p || p.numSemillasGermManual) {
      renderPremiumGermPlanUI();
      return;
    }
    p.numSemillasGerm = sugerirNumSemillas(getWizardCfg(), p);
    renderPremiumGermPlanUI();
    syncGermPlanATorreDraft();
  }

  global.renderPremiumGermPlanUI = renderPremiumGermPlanUI;
  global.persistPremiumGermPlanFromUI = persistPremiumGermPlanFromUI;
  global.persistPremiumGermPlanToConfig = persistPremiumGermPlanToConfig;
  global.syncPremiumGermPlanFromConfig = syncPremiumGermPlanFromConfig;
  global.seleccionarPremiumSustratoGerm = seleccionarPremiumSustratoGerm;
  global.validarPremiumGermPlan = validarPremiumGermPlan;
  global.onPropagadorEquipSeleccionado = onPropagadorEquipSeleccionado;
  global.etiquetaSustratoGerm = etiquetaSustratoGerm;
  global.PROPAGADOR_CAPACIDAD_ES = PROPAGADOR_CAPACIDAD;
  global.sugerirNumSemillasGerm = sugerirNumSemillas;
  global.getPlanGermEstado = getPlanGermEstado;
  global.validarPlanGerminacionCompleto = validarPlanGerminacionCompleto;
  global.renderPlanGermModalBlock = renderPlanGermModalBlock;
  global.persistHcPropPlanFromModal = persistHcPropPlanFromModal;
  global.hcPropPlanSeleccionarSustrato = hcPropPlanSeleccionarSustrato;
  global.hcPropPlanRefreshModalBody = hcPropPlanRefreshModalBody;
  global.updatePropagadorMontajeFoot = updatePropagadorMontajeFoot;
  global.hcGerminacionBloqueadaPorPlanDatos = hcGerminacionBloqueadaPorPlanDatos;
  global.requiereValidacionPlanGerm = requiereValidacionPlanGerm;
})(typeof window !== 'undefined' ? window : globalThis);
