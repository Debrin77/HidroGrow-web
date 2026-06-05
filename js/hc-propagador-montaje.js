/**
 * HidroGrow — checklist de montaje del propagador / prep germinación en hidro.
 * Fase previa a las 6 fases de germinación (rutas semilla_propagador y semilla_hidro).
 */
(function (global) {
  'use strict';

  var ITEMS_PROPAGADOR = [
    { id: 'prop_domo', label: 'Domo / propagador montado', hint: 'Bandeja estable, tapa hermética y acceso para ventilar 2×/día.', accent: 'germ' },
    { id: 'prop_mat', label: 'Mat térmica bajo bandeja (si aplica)', hint: '22–26 °C en sustrato; termostato o termohigrómetro cerca.', accent: 'light' },
    {
      id: 'prop_dosis_sol',
      label: 'Dosificación preparada · 2 L agua destilada',
      hint:
        'Mezcla el abono del plan en agua destilada o RO (ver receta abajo). El sobrante, en botella oscura en nevera 3–5 días. Luego vierte solo ~2–3 mm en la bandeja.',
      accent: 'hydro',
    },
    {
      id: 'prop_agua_sustrato',
      label: 'Bandeja con solución (~2–3 mm)',
      hint:
        'Con el sustrato ya colocado (lana, jiffy, papel, coco…): capa fina de la solución dosificada en el fondo, sin encharcar. Revisa cada día que no se quede seca.',
      accent: 'hydro',
    },
    {
      id: 'prop_rockwool',
      label: 'Sustrato y semillas colocados',
      hint:
        'Cada alvéolo/cubo con el sustrato del setup. Si usas lana 4×4, remoja pH ~5,5; en papel/jiffy prioriza humedad constante.',
      accent: 'hydro',
    },
    { id: 'prop_termo', label: 'Termo-higrómetro en zona de germinación', hint: 'HR 70–80 % bajo domo; anota en el registro diario.', accent: 'iot' },
    { id: 'prop_luz', label: 'Luz suave 18/6 (tenue)', hint: 'No LED de floración encima del domo; fluorescente o LED muy bajo.', accent: 'light' },
    { id: 'prop_higiene', label: 'Higiene: tijeras y superficie limpias', hint: 'Alcohol 70 % en herramientas; evita tocar radículas.', accent: 'tool' },
    { id: 'prop_vent', label: 'Ventilación del domo probada', hint: 'Abre 2× al día 3–5 min; sin corrientes frías directas.', accent: 'air' },
  ];

  var ITEMS_ENRAIZADO = [
    { id: 'enr_domo', label: 'Domo de enraizado montado', hint: 'HR 70–80 %, 22–26 °C; ventilar 2×/día.', accent: 'germ' },
    { id: 'enr_rockwool', label: 'Cubos rockwool pH 5,5 listos', hint: 'Humedecidos, no encharcados; gel/polvo de enraizante a mano.', accent: 'hydro' },
    { id: 'enr_higiene', label: 'Tijeras y superficie esterilizadas', hint: 'Alcohol 70 %; corte 45° por la mañana si puedes.', accent: 'tool' },
    { id: 'enr_luz', label: 'Luz tenue 18/6 sobre el domo', hint: 'Sin LED de floración directo sobre esquejes tiernos.', accent: 'light' },
    { id: 'enr_termo', label: 'Termo-higrómetro en la zona de clones', hint: 'Anota T° y HR en el protocolo de esquejes.', accent: 'iot' },
    { id: 'enr_aire', label: 'Aireación del depósito/clonador comprobada', hint: 'Burbujeo suave; EC 0–400 µS las primeras 48 h si usas mini DWC.', accent: 'air' },
  ];

  var PREP_HIDRO_DIAS_OSCURIDAD = 2;
  /** Tras brote verde: ventilar cúpula antes de retirarla por completo (consenso hidro). */
  var PREP_HIDRO_HORAS_VENTILAR_CUPULA = '24–48';

  var ITEMS_PREP_HIDRO = [
    {
      id: 'ph_sem_una',
      label: '1 semilla por cubo de sustrato',
      hint:
        'Una semilla en cada cubo de lana/jiffy dentro de su net pot. No varias en el mismo cubo: compiten y hay que raear.',
      accent: 'germ',
    },
    {
      id: 'ph_netpot',
      label: 'Net pot y cubo en cada cesta del sistema',
      hint:
        'Semilla nunca suelta en el depósito: solo en cubo dentro de la maceta. N cestas = N semillas del plan.',
      accent: 'hydro',
    },
    {
      id: 'ph_nivel',
      label: 'Nivel de llenado del depósito (germinación)',
      hint:
        'Distancia nutriente → base del sustrato según medidas DWC/RDWC (fase plántula recién plantada). EC 200–400 µS; T° agua 20–24 °C.',
      accent: 'hydro',
    },
    {
      id: 'ph_domo_mini',
      label: 'Cúpula individual en cada cesta (opcional)',
      hint:
        'Una mini cúpula por net pot (no bandeja propagador). Cierra los primeros días; mantiene HR local sobre la semilla.',
      accent: 'germ',
    },
    {
      id: 'ph_oscuridad',
      label: 'Oscuridad · días 1 y ' + PREP_HIDRO_DIAS_OSCURIDAD + ' tras siembra',
      hint:
        'La semilla abre con humedad y calor, no con luz. Cúpula cerrada; sin LED directo sobre la semilla en el cubo.',
      accent: 'germ',
    },
    {
      id: 'ph_luz',
      label: 'Luz tenue 18/6 (desde día ' + (PREP_HIDRO_DIAS_OSCURIDAD + 1) + ' o brote verde)',
      hint:
        'En cuanto asoma el cotiledón, luz suave ~18 h/día. Si aún llevas cúpula, ábrela a ventilar antes de quitarla.',
      accent: 'light',
    },
    {
      id: 'ph_quitar_cupula',
      label: 'Quitar cúpulas al brote verde (por cesta)',
      hint:
        'Al ver cotiledón: ventila la cúpula ' +
        PREP_HIDRO_HORAS_VENTILAR_CUPULA +
        ' h → retírala por maceta. Si HR sala ≥70 %, antes; si es muy seco, un poco más. Burbujeo suave sin encharcar.',
      accent: 'germ',
    },
    { id: 'ph_medidor', label: 'Medidor EC/pH a mano listo', hint: 'Calibración reciente; anota en Medir cuando subas EC.', accent: 'iot' },
    { id: 'ph_aire', label: 'Aireación del depósito comprobada', hint: 'Burbujeo suave; sin burbujas fuertes sobre la semilla.', accent: 'air' },
  ];

  var PROP_ICONS = {
    prop_domo: '🫧',
    prop_mat: '🔥',
    prop_dosis_sol: '🧪',
    prop_agua_sustrato: '💧',
    prop_termo: '🌡️',
    prop_luz: '💡',
    prop_rockwool: '🧊',
    prop_higiene: '✂️',
    prop_vent: '💨',
    enr_domo: '🫧',
    enr_rockwool: '🧊',
    enr_higiene: '✂️',
    enr_luz: '💡',
    enr_termo: '🌡️',
    enr_aire: '🫧',
    ph_sem_una: '🌱',
    ph_netpot: '🪴',
    ph_nivel: '💧',
    ph_domo_mini: '🫧',
    ph_oscuridad: '🌑',
    ph_quitar_cupula: '🔓',
    ph_medidor: '📟',
    ph_aire: '💨',
    ph_luz: '💡',
  };

  function prepHidroSustratoKey(cfg) {
    cfg = cfg || getCfg();
    if (typeof resolveSustratoGermFromCfg === 'function') {
      return resolveSustratoGermFromCfg(cfg);
    }
    var prem = (cfg && cfg.premiumSetup) || {};
    return prem.sustratoGerm || cfg.sustratoGerm || 'lana';
  }

  function prepHidroSustratoEsCoco(cfg) {
    var sKey = prepHidroSustratoKey(cfg);
    if (typeof dwcSustratoFamiliaCoco === 'function' && typeof normalizaSustratoKey === 'function') {
      return dwcSustratoFamiliaCoco(normalizaSustratoKey(sKey));
    }
    return String(sKey).toLowerCase().indexOf('coco') >= 0;
  }

  function prepHidroFmtRangoCm(lo, hi) {
    var a = Number(lo);
    var b = Number(hi);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return '—';
    if (Math.abs(a - b) < 0.05) return String(Math.round(a * 10) / 10);
    return String(Math.round(a * 10) / 10) + '–' + String(Math.round(b * 10) / 10);
  }

  /** Rango cm nutriente → base del sustrato en fase «recién plantada» (germinación en cubo). */
  function prepHidroRangoLlenadoGermCm(cfg) {
    cfg = cfg || getCfg();
    var esCoco = prepHidroSustratoEsCoco(cfg);
    if (typeof dwcRangoCmPorFaseYFamilia === 'function') {
      var r = dwcRangoCmPorFaseYFamilia('recien', esCoco);
      return { lo: r[0], hi: r[1], esCoco: esCoco, fase: 'recien' };
    }
    return { lo: 0, hi: esCoco ? 0 : 0.5, esCoco: esCoco, fase: 'recien' };
  }

  function prepHidroLitrosLlenadoSeguro(cfg) {
    cfg = cfg || getCfg();
    try {
      if (typeof getDwcVolumenSeguroMaxLitrosDesdeConfig === 'function') {
        var lit = getDwcVolumenSeguroMaxLitrosDesdeConfig(cfg);
        if (Number.isFinite(lit) && lit > 0) return Math.round(lit * 10) / 10;
      }
    } catch (_) {}
    return null;
  }

  function prepHidroNumSemillasPlan(cfg) {
    cfg = cfg || getCfg();
    if (typeof hcNumSemillasGermConfig === 'function') {
      var n = hcNumSemillasGermConfig(cfg);
      if (n >= 1) return n;
    }
    return 0;
  }

  function renderPrepHidroOscuridadBannerHtml() {
    return (
      '<div class="hc-germ-oscuridad-banner" role="note" aria-live="polite">' +
      '<p class="hc-germ-oscuridad-title"><strong>Oscuridad · días 1 y ' +
      PREP_HIDRO_DIAS_OSCURIDAD +
      '</strong></p>' +
      '<p class="hc-germ-oscuridad-body">La semilla abre con <strong>humedad y calor</strong>, no con luz. Mantén oscuridad o luz muy tenue hasta que asoma el brote verde; entonces pasa a luz suave (~18 h/día).</p>' +
      '<p class="hc-germ-oscuridad-lugar setup-field-hint">Cúpula cerrada en cada cesta; sin LED directo sobre la semilla en el cubo.</p>' +
      '</div>'
    );
  }

  function renderPrepHidroCupulaBannerHtml() {
    return (
      '<div class="hc-germ-cupula-banner" role="note">' +
      '<p class="hc-germ-cupula-title"><strong>Cúpulas individuales · cuándo quitarlas</strong></p>' +
      '<p class="hc-germ-cupula-body">No es lo mismo que el propagador de bandeja: <strong>una cúpula por cesta/net pot</strong>. Tras el brote verde: <strong>ventila</strong> la cúpula ' +
      PREP_HIDRO_HORAS_VENTILAR_CUPULA +
      ' h y <strong>retírala por maceta</strong>. Dejarla demasiado tiempo en hidro favorece hongos y raíces blandas.</p>' +
      '</div>'
    );
  }

  function renderPrepHidroLlenadoBannerHtml(cfg) {
    cfg = cfg || getCfg();
    var r = prepHidroRangoLlenadoGermCm(cfg);
    var cmTxt = prepHidroFmtRangoCm(r.lo, r.hi);
    var litros = prepHidroLitrosLlenadoSeguro(cfg);
    var medidasOk =
      typeof dwcTieneMedidasCestaEnCfg === 'function' && dwcTieneMedidasCestaEnCfg(cfg);
    var litrosTxt = litros != null ? ' · <strong>' + litros + ' L</strong> útiles orientativos' : '';
    var medidasNote = medidasOk
      ? ''
      : '<p class="hc-germ-llenado-note setup-field-hint">Indica medidas del cubo y de la cesta en el asistente DWC/RDWC para afinar litros; el rango en cm ya es válido para germinar.</p>';
    return (
      '<div class="hc-germ-llenado-banner" role="note">' +
      '<p class="hc-germ-llenado-title"><strong>Llenado del depósito · germinación</strong></p>' +
      '<p class="hc-germ-llenado-value">Distancia nutriente → <strong>base del sustrato</strong>: <strong>' +
      esc(cmTxt) +
      ' cm</strong>' +
      litrosTxt +
      '</p>' +
      '<p class="hc-germ-llenado-body setup-field-hint">Medida vertical desde la superficie del agua hasta la base del cubo de lana en la tapa. Fase «plántula recién plantada» · sustrato ' +
      (r.esCoco ? 'coco' : 'lana/jiffy/esponja') +
      '. EC 200–400 µS hasta enraizar. Misma lógica en <strong>Cultivo e instalación</strong> y checklist de primer llenado.</p>' +
      medidasNote +
      '</div>'
    );
  }

  function renderPrepHidroSemillasBannerHtml(cfg) {
    cfg = cfg || getCfg();
    var n = prepHidroNumSemillasPlan(cfg);
    var nTxt =
      n >= 1
        ? '<strong>' + n + '</strong> semilla' + (n === 1 ? '' : 's') + ' → <strong>' + n + '</strong> cubo' + (n === 1 ? '' : 's') + ' / cesta' + (n === 1 ? '' : 's')
        : 'Indica cuántas semillas en el plan de germinación (arriba)';
    return (
      '<div class="hc-germ-sem-banner" role="note">' +
      '<p class="hc-germ-sem-title"><strong>1 semilla por sustrato</strong></p>' +
      '<p class="hc-germ-sem-body">' +
      nTxt +
      '. Nunca varias semillas en el mismo cubo.</p></div>'
    );
  }

  /** Bloque guía prep hidro: semillas, oscuridad, cúpulas y llenado (modal + Sistema). */
  function renderPrepHidroGuiaGermHtml(cfg) {
    cfg = cfg || getCfg();
    if (!esRutaGermHidro(cfg)) return '';
    return (
      '<div class="hc-prep-hidro-guia">' +
      renderPrepHidroSemillasBannerHtml(cfg) +
      renderPrepHidroOscuridadBannerHtml() +
      renderPrepHidroCupulaBannerHtml() +
      renderPrepHidroLlenadoBannerHtml(cfg) +
      '</div>'
    );
  }

  function getCfg() {
    if (typeof state !== 'undefined' && state && state.configTorre) return state.configTorre;
    try {
      if (typeof getTorreActiva === 'function') {
        var t = getTorreActiva();
        if (t && t.config) return t.config;
      }
    } catch (_) {}
    return {};
  }

  function getCamino(cfg) {
    return typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
  }

  function esRutaPropagador(cfg) {
    return getCamino(cfg) === 'semilla_propagador';
  }

  function esRutaGermHidro(cfg) {
    return getCamino(cfg) === 'semilla_hidro';
  }

  function esRutaEsqueje(cfg) {
    return getCamino(cfg) === 'esqueje_hidro';
  }

  function aplicaChecklistGerm(cfg) {
    cfg = cfg || getCfg();
    return esRutaPropagador(cfg) || esRutaGermHidro(cfg);
  }

  function aplicaChecklistEnraizado(cfg) {
    cfg = cfg || getCfg();
    return esRutaEsqueje(cfg);
  }

  function caminoGuardadoEnCfg(cfg) {
    return String(
      (cfg && cfg.caminoCultivo) ||
        (cfg && cfg.premiumSetup && cfg.premiumSetup.caminoCultivo) ||
        ''
    ).trim();
  }

  function getChecksKey(cfg) {
    cfg = cfg || getCfg();
    var cDirect = caminoGuardadoEnCfg(cfg);
    if (cDirect === 'semilla_hidro') return 'preparacionGermHidroChecks';
    if (cDirect === 'esqueje_hidro') return 'enraizadoMontajeChecks';
    if (esRutaEsqueje(cfg)) return 'enraizadoMontajeChecks';
    return esRutaGermHidro(cfg) ? 'preparacionGermHidroChecks' : 'propagadorMontajeChecks';
  }

  function getChecks(cfg) {
    cfg = cfg || getCfg();
    var key = getChecksKey(cfg);
    if (!cfg[key] || typeof cfg[key] !== 'object') cfg[key] = {};
    if (key === 'preparacionGermHidroChecks' && !cfg[key].completedAt) {
      var wrong = cfg.propagadorMontajeChecks;
      if (wrong && typeof wrong === 'object' && Object.keys(wrong).length) {
        Object.assign(cfg[key], wrong);
      }
    }
    return cfg[key];
  }

  function saveChecks(cfg, checks) {
    if (typeof state === 'undefined' || !state || !state.configTorre) return;
    var key = getChecksKey(cfg || getCfg());
    state.configTorre[key] = checks;
    try {
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
      if (typeof saveState === 'function') saveState();
    } catch (_) {}
  }

  function propagadorMontajeCompleto(cfg) {
    cfg = cfg || getCfg();
    if (!aplicaChecklistGerm(cfg)) return true;
    var ch = getChecks(cfg);
    return !!ch.completedAt;
  }

  function enraizadoMontajeCompleto(cfg) {
    cfg = cfg || getCfg();
    if (!aplicaChecklistEnraizado(cfg)) return true;
    var ch = getChecks(cfg);
    return !!ch.completedAt;
  }

  function hcGerminacionBloqueadaPorMontaje(cfg) {
    cfg = cfg || getCfg();
    if (!aplicaChecklistGerm(cfg)) return false;
    return !propagadorMontajeCompleto(cfg);
  }

  function buildItems(cfg) {
    cfg = cfg || getCfg();
    var base = esRutaEsqueje(cfg)
      ? ITEMS_ENRAIZADO.slice()
      : esRutaGermHidro(cfg)
        ? ITEMS_PREP_HIDRO.slice()
        : ITEMS_PROPAGADOR.slice();
    var inst = cfg.equipamientoInstalado || {};
    return base.map(function (it) {
      var copy = Object.assign({}, it);
      if (it.id === 'prop_domo' && inst.propagador && inst.propagador.marca) {
        copy.label += ' · ' + inst.propagador.marca + ' ' + (inst.propagador.modelo || '');
      }
      if (it.id === 'prop_mat' && inst.mat_termica_germ && inst.mat_termica_germ.marca) {
        copy.label += ' · ' + inst.mat_termica_germ.marca;
      }
      if (it.id === 'prop_dosis_sol' && esRutaPropagador(cfg)) {
        var volD =
          typeof getNutrienteGermVolLFromCfg === 'function' ? getNutrienteGermVolLFromCfg(cfg) : 2;
        var nomD =
          typeof etiquetaNutrienteGermConfig === 'function'
            ? etiquetaNutrienteGermConfig(cfg)
            : '';
        copy.label = 'Dosificación · ' + volD + ' L agua destilada';
        if (nomD) copy.label += ' · ' + nomD;
        copy.hint =
          'Jarra o botella: ' +
          volD +
          ' L de agua destilada/RO + abono' +
          (nomD ? ' (' + nomD + ')' : '') +
          ' según la receta de abajo. Cierra el sobrante en botella oscura en nevera (3–5 días). Después, solo ~2–3 mm en la bandeja del domo.';
      }
      if (esRutaGermHidro(cfg) && it.id === 'ph_nivel') {
        var rNiv = prepHidroRangoLlenadoGermCm(cfg);
        var litNiv = prepHidroLitrosLlenadoSeguro(cfg);
        copy.hint =
          'Nutriente → base del sustrato: ' +
          prepHidroFmtRangoCm(rNiv.lo, rNiv.hi) +
          ' cm (plántula recién en cubo)' +
          (litNiv != null ? '; ~' + litNiv + ' L útiles por cubo' : '') +
          '. EC 200–400 µS; T° agua 20–24 °C. Burbujeo suave.';
      }
      if (esRutaGermHidro(cfg) && it.id === 'ph_netpot') {
        var nPot = prepHidroNumSemillasPlan(cfg);
        if (nPot >= 1) {
          copy.hint += ' Plan: ' + nPot + ' semilla' + (nPot === 1 ? '' : 's') + ' en ' + nPot + ' cesta' + (nPot === 1 ? '' : 's') + '.';
        }
      }
      return copy;
    });
  }

  function countProgress(checks, items) {
    var done = 0;
    var total = items.length;
    items.forEach(function (it) {
      if (checks[it.id]) done++;
    });
    return { done: done, total: total };
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function propItemIcon(it) {
    return PROP_ICONS[it.id] || '🌱';
  }

  function renderPropProgressHtml(prog, verificada, titulo) {
    var pct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
    var r = 15.5;
    var c = 2 * Math.PI * r;
    var off = c * (1 - pct / 100);
    var badge = verificada ? 'Verificado' : prog.done + '/' + prog.total;
    var badgeCls =
      'hc-pm-progress-badge' + (verificada ? ' hc-pm-progress-badge--ok' : '');
    return (
      '<div class="hc-pm-progress hc-pm-progress--prop" role="status" aria-live="polite">' +
      '<div class="hc-pm-progress-ring" aria-hidden="true">' +
      '<svg viewBox="0 0 36 36" focusable="false">' +
      '<circle class="hc-pm-progress-ring-bg" cx="18" cy="18" r="' +
      r +
      '"></circle>' +
      '<circle class="hc-pm-progress-ring-fill" cx="18" cy="18" r="' +
      r +
      '" stroke-dasharray="' +
      c.toFixed(2) +
      '" stroke-dashoffset="' +
      off.toFixed(2) +
      '"></circle></svg>' +
      '<span class="hc-pm-progress-pct">' +
      pct +
      '%</span></div>' +
      '<div class="hc-pm-progress-meta">' +
      '<span class="hc-pm-progress-title">' +
      esc(titulo) +
      '</span>' +
      '<span class="hc-pm-progress-sub">' +
      prog.done +
      ' de ' +
      prog.total +
      ' puntos listos</span>' +
      '<div class="hc-pm-progress-bar" aria-hidden="true">' +
      '<div class="hc-pm-progress-fill" style="width:' +
      pct +
      '%"></div></div></div>' +
      '<span class="' +
      badgeCls +
      '">' +
      esc(badge) +
      '</span></div>'
    );
  }

  function renderCard(it, checks) {
    var on = !!checks[it.id];
    var safe = String(it.id || '').replace(/[^a-zA-Z0-9_]/g, '');
    var accent = it.accent || 'germ';
    var dot = it.label.indexOf(' · ');
    var title = dot > 0 ? it.label.slice(0, dot) : it.label;
    var sub = dot > 0 ? it.label.slice(dot + 3) : '';
    return (
      '<article class="hc-pm-card hc-pm-card--' +
      accent +
      (on ? ' hc-pm-card--checked' : '') +
      '" data-prop-id="' +
      esc(safe) +
      '" role="listitem" tabindex="0" aria-pressed="' +
      (on ? 'true' : 'false') +
      '" onclick="hcPropCardActivate(event,\'' +
      esc(safe) +
      '\')" onkeydown="hcPropCardKey(event,\'' +
      esc(safe) +
      '\')">' +
      '<label class="hc-pm-card-check' +
      (on ? ' is-on' : '') +
      '" aria-hidden="true">' +
      '<input type="checkbox" class="hc-pm-card-input" data-prop-input="' +
      esc(safe) +
      '"' +
      (on ? ' checked' : '') +
      ' tabindex="-1" onchange="hcPropagadorToggleItem(\'' +
      esc(safe) +
      '\', this.checked)">' +
      '<span class="hc-pm-card-check-icon"></span></label>' +
      '<div class="hc-pm-card-body">' +
      '<span class="hc-pm-card-icon" aria-hidden="true">' +
      propItemIcon(it) +
      '</span>' +
      '<div class="hc-pm-card-text">' +
      '<h4 class="hc-pm-card-title">' +
      esc(title) +
      '</h4>' +
      (sub ? '<p class="hc-pm-card-sub">' + esc(sub) + '</p>' : '') +
      '<p class="hc-pm-card-hint">' +
      esc(it.hint) +
      '</p></div></div>' +
      (on ? '<span class="hc-pm-card-done-badge" aria-hidden="true">OK</span>' : '') +
      '</article>'
    );
  }

  function hcPropCardActivate(ev, id) {
    if (ev && (ev.target.closest('.hc-pm-card-input') || ev.target.closest('button'))) return;
    var inp = document.querySelector('[data-prop-input="' + id + '"]');
    if (!inp || inp.disabled) return;
    inp.checked = !inp.checked;
    hcPropagadorToggleItem(id, inp.checked);
  }

  function hcPropCardKey(ev, id) {
    if (!ev || (ev.key !== 'Enter' && ev.key !== ' ')) return;
    ev.preventDefault();
    hcPropCardActivate(ev, id);
  }

  function renderBodyHtml(cfg) {
    cfg = cfg || getCfg();
    var checks = getChecks(cfg);
    var items = buildItems(cfg);
    var prog = countProgress(checks, items);
    var verificada = !!checks.completedAt;
    var titulo = esRutaGermHidro(cfg)
      ? 'Preparación · germinación en el hidro'
      : esRutaEsqueje(cfg)
        ? 'Checklist de enraizado'
        : 'Montaje del propagador / domo';
    var lead = esRutaGermHidro(cfg)
      ? 'Antes de las <strong>6 fases</strong>: <strong>1 semilla por cubo</strong>, cúpula opcional por cesta, oscuridad días 1–' +
        PREP_HIDRO_DIAS_OSCURIDAD +
        ' y llenado con distancia nutriente → sustrato (ver guía). Al brote: quita cúpulas. Luego sala, montaje y primer llenado.'
      : esRutaEsqueje(cfg)
        ? 'Domo, higiene y microclima antes de pasar esquejes a la matriz.'
        : 'Marca cada punto del montaje. Arriba debes tener <strong>genética, semillas y sustrato</strong> antes de confirmar.';
    var inst = cfg.equipamientoInstalado || {};
    var equipRef = '';
    if (inst.propagador && inst.propagador.marca) {
      equipRef =
        '<p class="hc-pm-equip-ref"><strong>En catálogo:</strong> ' +
        esc(inst.propagador.marca + ' ' + (inst.propagador.modelo || '')) +
        (inst.mat_termica_germ && inst.mat_termica_germ.marca
          ? ' · ' + esc(inst.mat_termica_germ.marca)
          : '') +
        '</p>';
    }
    var planBlock =
      typeof renderPlanGermModalBlock === 'function' ? renderPlanGermModalBlock(cfg) : '';
    var dosisBlock =
      esRutaPropagador(cfg) && typeof htmlDosisNutrienteGermChecklist === 'function'
        ? htmlDosisNutrienteGermChecklist(cfg)
        : '';
    var sustratoAgua =
      !esRutaEsqueje(cfg) && typeof renderSustratoGermAguaEcBlockHtml === 'function'
        ? renderSustratoGermAguaEcBlockHtml(
            typeof resolveSustratoGermFromCfg === 'function' ? resolveSustratoGermFromCfg(cfg) : 'lana',
            typeof hcGerminacionFaseActualId === 'function' ? hcGerminacionFaseActualId(cfg) : 'semilla',
            { compact: false }
          )
        : '';
    return (
      '<div class="hc-pm-shell hc-pm-shell--prop">' +
      planBlock +
      dosisBlock +
      sustratoAgua +
      '<div class="hc-prop-hero">' +
      '<span class="hc-prop-hero-ico" aria-hidden="true">' +
      (esRutaGermHidro(cfg) ? '💧' : esRutaEsqueje(cfg) ? '🌿' : '🫧') +
      '</span>' +
      '<div class="hc-prop-hero-text">' +
      '<h3 class="hc-prop-modal-title">' +
      esc(titulo) +
      '</h3>' +
      '<p class="hc-pm-lead">' +
      lead +
      '</p></div></div>' +
      equipRef +
      (esRutaGermHidro(cfg) ? renderPrepHidroGuiaGermHtml(cfg) : '') +
      renderPropProgressHtml(prog, verificada, 'Progreso del montaje') +
      '<div class="hc-pm-grid hc-pm-grid--prop" role="list">' +
      items
        .map(function (it) {
          return renderCard(it, checks);
        })
        .join('') +
      '</div></div>'
    );
  }

  function renderInlineEnGermHub() {
    var cfg = getCfg();
    if (!aplicaChecklistGerm(cfg) || !hcGerminacionActiva(cfg)) return '';
    if (
      esRutaGermHidro(cfg) &&
      typeof propagadorMontajeCompleto === 'function' &&
      propagadorMontajeCompleto(cfg) &&
      typeof hcSemillaHidroUiOperativaLista === 'function' &&
      hcSemillaHidroUiOperativaLista(cfg)
    ) {
      return '';
    }
    var checks = getChecks(cfg);
    var items = buildItems(cfg);
    var prog = countProgress(checks, items);
    var verificada = !!checks.completedAt;
    var esHidro = esRutaGermHidro(cfg);
    var titulo = esHidro ? 'Paso 1 · Preparar germinación en hidro' : 'Paso 1 · Montaje del propagador';
    var lead = esHidro
      ? 'Checklist <strong>prep en cubo</strong>: 1 semilla/cubo, cúpula por cesta, llenado (cm bajo sustrato), oscuridad días 1–' +
        PREP_HIDRO_DIAS_OSCURIDAD +
        ', quitar cúpulas al brote y aire suave. Luego <strong>sala, montaje y primer llenado</strong> antes de las 6 fases.'
      : 'Checklist del propagador: primero <strong>dosifica en 2 L de agua destilada</strong> (guarda el sobrante en botella); luego vierte solo <strong>~2–3 mm</strong> en la bandeja con el sustrato. Revisa a diario que no se quede seca. El <strong>riego del depósito DWC</strong> llega después de germinar.';
    var pct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
    return (
      '<div class="hc-prop-inline hc-prop-inline--premium" id="hcPropagadorMontajeInline">' +
      '<div class="hc-prop-inline-head">' +
      '<span class="hc-prop-inline-ico" aria-hidden="true">' +
      (esHidro ? '💧' : '🫧') +
      '</span>' +
      '<h3 class="hc-prop-inline-title">' +
      esc(titulo) +
      '</h3>' +
      '<span class="hc-prop-inline-pct' +
      (verificada ? ' hc-prop-inline-pct--ok' : '') +
      '">' +
      (verificada ? '✓ Listo' : prog.done + '/' + prog.total + ' · ' + pct + '%') +
      '</span></div>' +
      '<div class="hc-prop-inline-bar" aria-hidden="true"><span style="width:' +
      pct +
      '%"></span></div>' +
      '<p class="hc-prop-inline-lead">' + lead + '</p>' +
      '<button type="button" class="btn btn-primary btn-sm" onclick="hcOpenPropagadorMontajeChecklist()">' +
      (verificada ? 'Revisar checklist' : 'Abrir checklist de montaje') +
      '</button>' +
      (verificada &&
      typeof hcFaltaConfigurarSalaEquipPropagador === 'function' &&
      hcFaltaConfigurarSalaEquipPropagador(cfg)
        ? '<button type="button" class="btn btn-secondary btn-sm hc-prop-cta-sala" style="margin-left:8px" onclick="typeof abrirConfiguradorEquipamientoSalaPropagador===\'function\'&&abrirConfiguradorEquipamientoSalaPropagador()">Configurar equipamiento de sala</button>'
        : '') +
      '</div>'
    );
  }

  function refreshPropagadorMontajeUi() {
    try {
      if (typeof refreshDashGerminacionHub === 'function') refreshDashGerminacionHub();
    } catch (_) {}
    try {
      if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
    } catch (_) {}
    try {
      if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
    } catch (_) {}
    try {
      if (typeof refreshDashCaminoResumen === 'function') refreshDashCaminoResumen();
    } catch (_) {}
  }

  function hcPropagadorToggleItem(id, checked) {
    var cfg = getCfg();
    var checks = Object.assign({}, getChecks(cfg));
    if (!checked && checks.completedAt) {
      delete checks.completedAt;
      if (typeof showToast === 'function') {
        showToast('Verificación anulada: confirma de nuevo cuando esté listo.', false);
      }
    }
    checks[id] = !!checked;
    saveChecks(cfg, checks);
    var body = document.getElementById('propagadorMontajeBody');
    if (body) body.innerHTML = renderBodyHtml(cfg);
    refreshPropagadorMontajeUi();
  }

  function hcRerenderPropagadorMontajeModal() {
    var modal = document.getElementById('modalPropagadorMontaje');
    if (!modal || !modal.classList.contains('open')) return;
    var cfg = getCfg();
    var body = document.getElementById('propagadorMontajeBody');
    if (body) body.innerHTML = renderBodyHtml(cfg);
    if (typeof updatePropagadorMontajeFoot === 'function') updatePropagadorMontajeFoot(cfg);
  }

  function hcAvanzarSemillaHidroTrasPrepChecklist(cfg) {
    cfg = cfg || getCfg();
    if (!esRutaGermHidro(cfg)) return;
    var next =
      typeof hcSiguientePasoSemillaHidro === 'function' ? hcSiguientePasoSemillaHidro(cfg) : null;
    if (!next || !next.action || next.action === 'irPropagadorMontaje') return;
    setTimeout(function () {
      if (typeof hcEjecutarAccionInstalacion === 'function') {
        hcEjecutarAccionInstalacion(next.action);
      } else if (next.action === 'abrirSetupFaseSala' && typeof abrirSetupFaseSala === 'function') {
        abrirSetupFaseSala();
      } else if (next.action === 'abrirSetupFaseHidro' && typeof abrirSetupFaseHidro === 'function') {
        abrirSetupFaseHidro();
      } else if (next.action === 'irMontaje' && typeof hcAbrirMontajeSalaChecklist === 'function') {
        hcAbrirMontajeSalaChecklist({ delay: 0 });
      }
    }, 450);
  }

  function hcOpenPropagadorMontajeChecklist() {
    var modal = document.getElementById('modalPropagadorMontaje');
    if (!modal) {
      if (typeof showToast === 'function') showToast('Checklist no disponible.', true);
      return;
    }
    var cfg = getCfg();
    try {
      if (typeof hcGerminacionSyncDesdePremium === 'function') hcGerminacionSyncDesdePremium(cfg);
    } catch (_) {}
    var body = document.getElementById('propagadorMontajeBody');
    if (body) body.innerHTML = renderBodyHtml(cfg);
    var title = document.getElementById('propagadorMontajeTitle');
    var cfg = getCfg();
    if (title) {
      title.textContent = esRutaEsqueje(cfg)
        ? 'Checklist de enraizado'
        : esRutaGermHidro(cfg)
          ? 'Preparación germinación en hidro'
          : 'Montaje del propagador';
    }
    modal.classList.add('open');
    if (typeof updatePropagadorMontajeFoot === 'function') updatePropagadorMontajeFoot(cfg);
    try {
      if (typeof a11yDialogOpened === 'function') a11yDialogOpened(modal);
    } catch (_) {}
  }

  function hcClosePropagadorMontajeChecklist(ev) {
    if (ev && ev.target !== ev.currentTarget) return;
    var modal = document.getElementById('modalPropagadorMontaje');
    if (modal) modal.classList.remove('open');
  }

  function hcFinishPropagadorMontaje() {
    var cfg = getCfg();
    var checks = getChecks(cfg);
    var items = buildItems(cfg);
    var prog = countProgress(checks, items);
    if (prog.done < prog.total) {
      if (typeof showToast === 'function') {
        showToast('Marca todos los puntos (' + prog.done + '/' + prog.total + ').', true);
      }
      return;
    }
    if (
      typeof requiereValidacionPlanGerm === 'function' &&
      requiereValidacionPlanGerm(cfg) &&
      typeof validarPlanGerminacionCompleto === 'function'
    ) {
      if (typeof resolverNutrienteGermBandeja === 'function') {
        resolverNutrienteGermBandeja(cfg);
      } else if (typeof hcAsegurarNutrienteGermEnCfg === 'function') {
        hcAsegurarNutrienteGermEnCfg(cfg);
      }
      persistHcPropPlanFromModal();
      var planVal = validarPlanGerminacionCompleto(cfg);
      if (!planVal.ok) {
        if (typeof showToast === 'function') {
          showToast(
            planVal.message || 'Completa genética, semillas y sustrato en el bloque superior.',
            true,
            { durationMs: 6200 }
          );
        }
        try {
          document.getElementById('hcPropPlanGermBlock')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (_) {}
        return;
      }
    }
    var msgConfirm = esRutaEsqueje(cfg)
      ? '¿Confirmas que el domo de enraizado está listo?'
      : esRutaGermHidro(cfg)
        ? '¿Confirmas el preparativo en hidro?'
        : '¿Confirmas el propagador/domo?';
    if (!confirm(msgConfirm)) {
      return;
    }
    checks.completedAt = new Date().toISOString();
    saveChecks(cfg, checks);
    if (!propagadorMontajeCompleto(cfg)) {
      var keyFix = getChecksKey(cfg);
      if (typeof state !== 'undefined' && state && state.configTorre) {
        state.configTorre[keyFix] = checks;
        try {
          if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
          if (typeof saveState === 'function') saveState();
        } catch (_) {}
      }
    }
    try {
      if (typeof hcGerminacionSyncDesdePremium === 'function') hcGerminacionSyncDesdePremium(getCfg());
    } catch (_) {}
    hcClosePropagadorMontajeChecklist();
    try {
      if (typeof hcRefreshSistemaFasePanel === 'function') hcRefreshSistemaFasePanel();
      else if (typeof hcRefreshSistemaPropagadorPanel === 'function') {
        hcRefreshSistemaPropagadorPanel();
      }
      if (typeof refreshTabsOperativaCamino === 'function') refreshTabsOperativaCamino();
      if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
    } catch (_) {}
    refreshPropagadorMontajeUi();
    var nextHidro =
      esRutaGermHidro(cfg) && typeof hcSiguientePasoSemillaHidro === 'function'
        ? hcSiguientePasoSemillaHidro(getCfg())
        : null;
    if (typeof showToast === 'function') {
      showToast(
        esRutaEsqueje(cfg)
          ? '✓ Enraizado listo. Asigna clones en Cultivo e instalación.'
          : esRutaGermHidro(cfg)
            ? nextHidro && nextHidro.action !== 'irPropagadorMontaje'
              ? '✓ Prep listo. Siguiente: ' + nextHidro.label + '.'
              : '✓ Prep listo.'
            : '✓ Propagador listo.',
        false,
        { durationMs: 4200 }
      );
    }
    if (esRutaEsqueje(cfg)) {
      refreshPropagadorMontajeUi();
      return;
    }
    var cam =
      typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam === 'semilla_propagador') {
      if (typeof hcIrHubGerminacionOperativa === 'function') {
        hcIrHubGerminacionOperativa();
      }
      return;
    }
    if (cam === 'semilla_hidro') {
      hcAvanzarSemillaHidroTrasPrepChecklist(getCfg());
      return;
    }
  }

  function hcPropagadorMontajeSiguienteTrasGerminacion(cfg) {
    cfg = cfg || getCfg();
    if (!hcCaminoEsSemilla(getCamino(cfg))) return null;
    if (!propagadorMontajeCompleto(cfg)) {
      return { label: 'Montaje del propagador', action: 'irPropagadorMontaje' };
    }
    return null;
  }

  function montajeInicioUsaHubPropagador(cfg) {
    cfg = cfg || getCfg();
    if (!esRutaPropagador(cfg)) return false;
    if (typeof hidroInstalacionCerrada === 'function' && hidroInstalacionCerrada(cfg)) {
      return false;
    }
    return true;
  }

  function progSalaMontaje(cfg) {
    cfg = cfg || getCfg();
    var checks =
      cfg.puestaMarchaChecks && typeof cfg.puestaMarchaChecks === 'object'
        ? cfg.puestaMarchaChecks
        : {};
    var items =
      typeof hcBuildPuestaMarchaItems === 'function' ? hcBuildPuestaMarchaItems(cfg) : [];
    var done = 0;
    var total = 0;
    items.forEach(function (it) {
      if (it.optional) return;
      total++;
      if (checks[it.id]) done++;
      else if (it.id === 'sistema' && cfg.checklistInstalacionConfirmada) done++;
      else if (it.autoNombre) {
        var t =
          typeof getTorreActiva === 'function'
            ? getTorreActiva()
            : typeof state !== 'undefined' && state.torres
              ? state.torres[state.torreActiva || 0]
              : null;
        var n = t && t.nombre ? String(t.nombre).trim() : '';
        if (n.length > 2 && n.toLowerCase() !== 'instalación') done++;
      }
    });
    return {
      done: done,
      total: total,
      verificada: !!checks.completedAt,
    };
  }

  function renderMontajeInicioHubSubtitulo(cfg) {
    if (!montajeInicioUsaHubPropagador(cfg)) return '';
    var propCh = getChecks(cfg);
    var propIt = buildItems(cfg);
    var propProg = countProgress(propCh, propIt);
    var sala = progSalaMontaje(cfg);
    var partes = [];
    partes.push(
      'Propagador ' +
        (propCh.completedAt ? '✓' : propProg.done + '/' + propProg.total)
    );
    var salaCfgSub =
      typeof salaPreGermConfigurada === 'function' && salaPreGermConfigurada(cfg);
    partes.push(
      'Sala ' +
        (salaCfgSub ? 'config ✓' : 'config pendiente') +
        ' · montaje ' +
        (sala.verificada ? '✓' : sala.done + '/' + sala.total)
    );
    var concluida =
      typeof germinacionConcluida === 'function' && germinacionConcluida(cfg);
    partes.push(concluida ? 'Hidro pendiente' : 'Hidro tras germinación');
    return partes.join(' · ');
  }

  function refreshMontajeInicioHubVisibility(cfg) {
    cfg = cfg || getCfg();
    var det = document.getElementById('hcMontajeInicioDetails');
    if (!det) return;
    var ocultar =
      typeof montajeInicioUsaHubPropagador === 'function' && montajeInicioUsaHubPropagador(cfg);
    det.classList.toggle('setup-hidden', ocultar);
    if (ocultar) det.open = false;
  }

  function renderMontajeInicioHubPropagador(cfg) {
    cfg = cfg || getCfg();
    refreshMontajeInicioHubVisibility(cfg);
    if (!montajeInicioUsaHubPropagador(cfg)) return '';
    var propCh = getChecks(cfg);
    var propIt = buildItems(cfg);
    var propProg = countProgress(propCh, propIt);
    var propOk = !!propCh.completedAt;
    var sala = progSalaMontaje(cfg);
    var salaCfg =
      typeof salaPreGermConfigurada === 'function' && salaPreGermConfigurada(cfg);
    var g =
      typeof ensureGerminacionFlow === 'function' ? ensureGerminacionFlow(cfg) : {};
    var concluida =
      typeof germinacionConcluida === 'function' && germinacionConcluida(cfg);
    var hidroPend =
      typeof hcCaminoRequiereConfigHidroPendiente === 'function' &&
      hcCaminoRequiereConfigHidroPendiente(cfg);
    var diasObj =
      typeof diasObjetivoConclusionGerm === 'function'
        ? diasObjetivoConclusionGerm(cfg, g)
        : 12;
    var diaN = 1;
    var isoIni =
      typeof getFechaInicioGerminacion === 'function'
        ? getFechaInicioGerminacion(g, cfg)
        : g.startedAt;
    if (isoIni) {
      var d0 = new Date(isoIni + 'T12:00:00');
      d0.setHours(0, 0, 0, 0);
      var hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      diaN = Math.max(1, Math.floor((hoy - d0) / 86400000) + 1);
    }
    var nomVar = '';
    if (typeof getPlanGermEstado === 'function') {
      var st = getPlanGermEstado(cfg);
      if (st && st.nombreVar) nomVar = st.nombreVar;
    }

    var hidroCls = 'hc-montaje-inicio-card hc-montaje-inicio-card--hidro';
    var hidroBadge = '3 · Tras germinación';
    var hidroBody =
      'El asistente <strong>DWC/RDWC</strong>, tuberías, depósito y primer llenado <strong>no se abren ahora</strong> para no mezclar pasos con el propagador.';
    var hidroStatus = '';
    var hidroBtn = '';
    if (!concluida) {
      hidroCls += ' hc-montaje-inicio-card--locked';
      hidroBadge = '3 · Bloqueado';
      hidroBody +=
        ' Se desbloquea al <strong>dar por concluida la germinación</strong> (orientativo ~día ' +
        diasObj +
        ' según genética' +
        (nomVar ? ' · ' + esc(nomVar) : '') +
        '; vas por día ' +
        diaN +
        ').';
      hidroStatus =
        '<p class="hc-montaje-inicio-card-status hc-montaje-inicio-card-status--lock">🔒 No configurar hidro hasta el traslado</p>';
    } else if (hidroPend) {
      hidroBody = 'Germinación concluida. Configura el circuito hidropónico antes del traslado al depósito.';
      hidroStatus =
        '<p class="hc-montaje-inicio-card-status hc-montaje-inicio-card-status--ready">Listo para Fase 2</p>';
      hidroBtn =
        '<button type="button" class="btn btn-primary btn-sm" onclick="typeof abrirSetupFaseHidro===\'function\'&&abrirSetupFaseHidro()">Configurar DWC/RDWC</button>';
    } else {
      hidroStatus =
        '<p class="hc-montaje-inicio-card-status hc-montaje-inicio-card-status--ok">✓ Sistema hidro configurado</p>';
      hidroBtn =
        '<button type="button" class="btn btn-secondary btn-sm" onclick="goTab(\'sistema\')">Ver en Cultivo e instalación</button>';
    }

    var salaCfgStatus = salaCfg
      ? '<p class="hc-montaje-inicio-card-status hc-montaje-inicio-card-status--ok">✓ Equipamiento de sala registrado</p>'
      : '<p class="hc-montaje-inicio-card-status hc-montaje-inicio-card-status--ready">Pendiente: equipamiento en el configurador</p>';
    var salaActions = '';
    if (!salaCfg) {
      salaActions +=
        '<button type="button" class="btn btn-primary btn-sm" onclick="typeof abrirConfiguradorEquipamientoSalaPropagador===\'function\'&&abrirConfiguradorEquipamientoSalaPropagador()">Configurar equipamiento de sala</button> ';
    } else {
      salaActions +=
        '<button type="button" class="btn btn-secondary btn-sm" onclick="typeof abrirConfiguradorEquipamientoSalaPropagador===\'function\'&&abrirConfiguradorEquipamientoSalaPropagador()">Revisar equipamiento</button> ';
    }
    if (salaCfg) {
      salaActions +=
        '<button type="button" class="btn btn-primary btn-sm hc-btn-puesta-marcha" onclick="hcOpenPuestaMarchaChecklist()">' +
        (sala.verificada ? 'Revisar checklist sala' : 'Checklist montaje de sala') +
        '</button> ';
    }
    salaActions +=
      '<button type="button" class="btn btn-secondary btn-sm" onclick="goTab(\'sala\');setTimeout(function(){var d=document.getElementById(\'sistemaMontajeChecksDetails\');if(d)d.open=true},300)">Ir a Sala</button>';

    return (
      '<div class="hc-montaje-inicio-hub" role="region" aria-label="Checklists del camino semilla con propagador">' +
      '<p class="hc-montaje-inicio-hub-lead" role="note">' +
      '<strong>Tres bloques distintos.</strong> Primero el propagador físico; mientras germinas, ' +
      '<strong>te conviene ir preparando la sala</strong> en el asistente. Si la configuras y aceptas el resultado, ' +
      'queda definida la <strong>sala con su equipamiento</strong> y el <strong>propagador con las semillas</strong> dentro hasta que germinen. ' +
      'El DWC/RDWC del depósito es la Fase 3, tras el traslado.</p>' +
      '<ol class="hc-montaje-inicio-hub-list">' +
      '<li class="hc-montaje-inicio-card hc-montaje-inicio-card--prop">' +
      '<div class="hc-montaje-inicio-card-head">' +
      '<span class="hc-montaje-inicio-card-badge hc-montaje-inicio-card-badge--now">1 · Ahora</span>' +
      '<h4 class="hc-montaje-inicio-card-title">Checklist · Montaje del propagador</h4></div>' +
      '<p class="hc-montaje-inicio-card-desc">Domo, mat térmica, rockwool pH 5,5, higiene y ventilación. Checklist <strong>completo</strong> (todos los puntos).</p>' +
      '<p class="hc-montaje-inicio-card-status' +
      (propOk ? ' hc-montaje-inicio-card-status--ok' : '') +
      '">' +
      (propOk ? '✓ Verificado' : propProg.done + '/' + propProg.total + ' puntos') +
      '</p>' +
      '<button type="button" class="btn btn-primary btn-sm" onclick="hcOpenPropagadorMontajeChecklist()">' +
      (propOk ? 'Revisar checklist propagador' : 'Abrir checklist propagador') +
      '</button></li>' +
      '<li class="hc-montaje-inicio-card hc-montaje-inicio-card--sala">' +
      '<div class="hc-montaje-inicio-card-head">' +
      '<span class="hc-montaje-inicio-card-badge hc-montaje-inicio-card-badge--rec">2 · Recomendado</span>' +
      '<h4 class="hc-montaje-inicio-card-title">Sala · configuración y montaje</h4></div>' +
      '<p class="hc-montaje-inicio-card-desc">' +
      'Durante la germinación, prepara la <strong>configuración de la sala</strong> (carpa, LED, extractor, medidor, clima…). ' +
      'Al <strong>guardar y aceptar</strong> en el asistente, la instalación queda como <strong>sala montada con equipamiento</strong> ' +
      'y el <strong>propagador con las semillas</strong> en ese entorno hasta que concluyan. Luego el checklist confirma el montaje físico. ' +
      '<strong>Sin tuberías ni depósito DWC</strong> hasta Fase 3.</p>' +
      salaCfgStatus +
      '<p class="hc-montaje-inicio-card-status' +
      (sala.verificada ? ' hc-montaje-inicio-card-status--ok' : '') +
      '">' +
      (sala.verificada
        ? '✓ Montaje de sala verificado (checklist completo)'
        : 'Montaje físico: ' + sala.done + '/' + sala.total + ' puntos esenciales') +
      '</p>' +
      '<div class="hc-montaje-inicio-card-actions">' +
      salaActions +
      '</div></li>' +
      '<li class="' +
      hidroCls +
      '">' +
      '<div class="hc-montaje-inicio-card-head">' +
      '<span class="hc-montaje-inicio-card-badge hc-montaje-inicio-card-badge--later">' +
      esc(hidroBadge) +
      '</span>' +
      '<h4 class="hc-montaje-inicio-card-title">Sistema hidropónico DWC/RDWC</h4></div>' +
      '<p class="hc-montaje-inicio-card-desc">' +
      hidroBody +
      '</p>' +
      hidroStatus +
      (hidroBtn ? '<div class="hc-montaje-inicio-card-actions">' + hidroBtn + '</div>' : '') +
      '</li></ol></div>'
    );
  }

  global.propagadorMontajeCompleto = propagadorMontajeCompleto;
  global.enraizadoMontajeCompleto = enraizadoMontajeCompleto;
  global.aplicaChecklistEnraizado = aplicaChecklistEnraizado;
  global.hcGerminacionBloqueadaPorMontaje = hcGerminacionBloqueadaPorMontaje;
  global.hcOpenPropagadorMontajeChecklist = hcOpenPropagadorMontajeChecklist;
  global.hcClosePropagadorMontajeChecklist = hcClosePropagadorMontajeChecklist;
  global.hcFinishPropagadorMontaje = hcFinishPropagadorMontaje;
  global.hcPropagadorToggleItem = hcPropagadorToggleItem;
  global.hcPropCardActivate = hcPropCardActivate;
  global.hcPropCardKey = hcPropCardKey;
  global.renderPropagadorMontajeInlineHtml = renderInlineEnGermHub;
  global.hcPropagadorMontajeSiguienteTrasGerminacion = hcPropagadorMontajeSiguienteTrasGerminacion;
  global.hcRerenderPropagadorMontajeModal = hcRerenderPropagadorMontajeModal;
  global.montajeInicioUsaHubPropagador = montajeInicioUsaHubPropagador;
  global.renderMontajeInicioHubPropagador = renderMontajeInicioHubPropagador;
  global.renderMontajeInicioHubSubtitulo = renderMontajeInicioHubSubtitulo;
  global.refreshMontajeInicioHubVisibility = refreshMontajeInicioHubVisibility;
  global.PREP_HIDRO_DIAS_OSCURIDAD = PREP_HIDRO_DIAS_OSCURIDAD;
  global.PREP_HIDRO_HORAS_VENTILAR_CUPULA = PREP_HIDRO_HORAS_VENTILAR_CUPULA;
  global.prepHidroRangoLlenadoGermCm = prepHidroRangoLlenadoGermCm;
  global.prepHidroFmtRangoCm = prepHidroFmtRangoCm;
  global.renderPrepHidroGuiaGermHtml = renderPrepHidroGuiaGermHtml;
  global.renderPrepHidroOscuridadBannerHtml = renderPrepHidroOscuridadBannerHtml;
  global.renderPrepHidroCupulaBannerHtml = renderPrepHidroCupulaBannerHtml;
  global.renderPrepHidroLlenadoBannerHtml = renderPrepHidroLlenadoBannerHtml;
})(typeof window !== 'undefined' ? window : this);
