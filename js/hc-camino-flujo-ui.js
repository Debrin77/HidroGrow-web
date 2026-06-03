/**
 * HidroGrow — UI de flujo por camino: banners del asistente, etiquetas de pasos,
 * genética en paso Espacio (propagador), pestañas acotadas en fase germinación.
 */
(function (global) {
  'use strict';

  function cfgActiva() {
    return typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
  }

  function el(id) {
    return document.getElementById(id);
  }

  function esc(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function getCam(cfg) {
    return typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
  }

  /** Semilla en propagador con germinación activa y sin traslado al cubo. */
  function hcOperativaFasePropagadorGerm(cfg) {
    cfg = cfg || cfgActiva();
    if (getCam(cfg) !== 'semilla_propagador') return false;
    if (typeof hcGerminacionActiva === 'function' && !hcGerminacionActiva(cfg)) return false;
    var g = cfg.germinacionFlow;
    if (g && g.trasladoAt) return false;
    return true;
  }

  var STEP_BANNERS = {
    semilla_propagador: {
      1: '<strong>Camino:</strong> propagador → 6 fases en Inicio → sala → traslado al hidro.',
      2: '<strong>Objetivo:</strong> uso personal; el nivel de Consejos ajusta el detalle técnico.',
      3: '<strong>Entorno:</strong> interior o exterior; en propagador la sala LED va después.',
      4: '<strong>Germinación ahora:</strong> domo, mat térmica y genética. Sin carpa ni LED en este paso.',
      5: '<strong>Clima del domo:</strong> horas de luz y fase inicial para el seguimiento diario.',
      7: '<strong>Plan de cultivo:</strong> SOG/SCROG, foto/auto y semillero (opcional). Guardar abre el checklist del propagador.',
    },
    semilla_hidro: {
      1: '<strong>Camino:</strong> prep hidro → sala y montaje → DWC/RDWC → 6 fases en el cubo.',
      2: '<strong>Objetivo:</strong> semilla en net pot desde el inicio; el depósito se cierra antes de las 6 fases.',
      3: '<strong>Entorno:</strong> define interior/exterior para dimensionar sala y meteo.',
      4: '<strong>Espacio:</strong> sala (carpa, LED, extractor) y prep del cubo de germinación.',
      5: '<strong>Clima y luz:</strong> fotoperiodo de la sala antes de germinar en el hidro.',
      6: '<strong>Genética y método:</strong> SOG/SCROG y cepa concreta para Inicio → Germinación.',
      7: '<strong>Detalle:</strong> semillero opcional. Tras guardar: checklist prep hidro, no propagador solo.',
    },
    esqueje_hidro: {
      1: '<strong>Esqueje:</strong> enraizado en domo → matriz → mismo DWC/RDWC que semilla.',
      4: '<strong>Equipamiento:</strong> propagador, sala y circuito hidro en un solo asistente.',
      7: '<strong>Checklists</strong> de corte y domo en este bloque.',
    },
    madre_hidro: {
      1: '<strong>Madre:</strong> cubo 18/6 permanente; esquejes con el camino de clon.',
      4: '<strong>Sala y depósito</strong> para la planta madre.',
    },
  };

  var STEP_LABELS = {
    semilla_propagador: {
      1: 'Camino',
      2: 'Objetivo',
      3: 'Entorno',
      4: 'Germinación ahora',
      5: 'Clima domo',
      7: 'Plan cultivo',
    },
    semilla_hidro: {
      1: 'Camino',
      2: 'Objetivo',
      3: 'Entorno',
      4: 'Espacio y prep',
      5: 'Clima y luz',
      6: 'Genética y método',
      7: 'Detalle origen',
    },
  };

  function refreshSetupCaminoStepBanner(pagina) {
    var box = el('setupCaminoStepBanner');
    if (!box) return;
    var cam = getCam();
    var map = STEP_BANNERS[cam];
    var html = map && map[pagina] ? map[pagina] : '';
    if (
      !html &&
      typeof hcSetupEnFaseSalaPreGerm === 'function' &&
      hcSetupEnFaseSalaPreGerm() &&
      pagina === (typeof SETUP_PAGE_PREMIUM_3 !== 'undefined' ? SETUP_PAGE_PREMIUM_3 : 4)
    ) {
      html =
        '<strong>Configurar sala:</strong> carpa, LED y extractor tras las 6 fases (o tras prep en hidro directo).';
    }
    if (!html) {
      box.classList.add('setup-hidden');
      box.innerHTML = '';
      return;
    }
    box.classList.remove('setup-hidden');
    box.innerHTML = html;
  }

  function getSetupStepLabelForPage(page) {
    var cam = getCam();
    var map = STEP_LABELS[cam];
    if (map && map[page]) return map[page];
    return null;
  }

  function syncPremiumGermSectionPlacement() {
    var sec = el('setupPremiumGeneticaGermSection');
    var host = el('setupPremiumGermAhoraHost');
    var page6 = el('spagePremium6');
    if (!sec) return;
    var enGerm =
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm();
    var orig =
      typeof getPremiumOrigenPlanta === 'function'
        ? getPremiumOrigenPlanta()
        : typeof ensurePremiumSetup === 'function'
          ? ensurePremiumSetup().origenPlanta
          : 'semilla';
    var showGerm = enGerm && orig === 'semilla';
    if (showGerm && host) {
      if (sec.parentNode !== host) host.appendChild(sec);
      host.classList.remove('setup-hidden');
    } else if (page6) {
      if (host) host.classList.add('setup-hidden');
      if (sec.parentNode !== page6) {
        var anchor = el('setupPremiumMetodoGenGermHost');
        if (anchor && anchor.parentNode === page6) {
          page6.insertBefore(sec, anchor.nextSibling);
        } else {
          var sem = el('setupPremiumSemilleroSection');
          if (sem) page6.insertBefore(sec, sem);
          else page6.appendChild(sec);
        }
      }
    }
    var t3 = document.querySelector('#spagePremium3 .setup-title');
    if (t3) {
      t3.textContent = showGerm ? 'Germinación ahora' : 'Espacio y equipamiento';
    }
    if (typeof refreshPremiumGeneticaGermVis === 'function') refreshPremiumGeneticaGermVis();
  }

  function hcNecesitaBannerTrasladoSala(cfg) {
    cfg = cfg || cfgActiva();
    if (typeof hcGerminacionBloqueada !== 'function') return null;
    var b = hcGerminacionBloqueada(cfg);
    if (b === 'sala_config' || b === 'sala_montaje') return b;
    return null;
  }

  function renderTrasladoSalaBannerHtml(cfg) {
    cfg = cfg || cfgActiva();
    var tipo = hcNecesitaBannerTrasladoSala(cfg);
    if (!tipo) return '';
    var cam = getCam(cfg);
    if (tipo === 'sala_config') {
      return (
        '<div class="hc-traslado-sala-banner setup-field-hint setup-field-hint--banner" role="status">' +
        '<strong>' +
        (cam === 'semilla_propagador' ? '6 fases completadas · Configura la sala' : 'Configura la sala') +
        '</strong> Carpa, LED y extractor antes del traslado al hidro. ' +
        '<button type="button" class="btn btn-primary btn-sm" onclick="typeof abrirSetupFaseSala===\'function\'&&abrirSetupFaseSala()">Configurar sala</button></div>'
      );
    }
    return (
      '<div class="hc-traslado-sala-banner setup-field-hint setup-field-hint--banner" role="status">' +
      '<strong>Montaje de sala.</strong> Verifica el checklist en Sala. ' +
      '<button type="button" class="btn btn-primary btn-sm" onclick="typeof hcIrMontajeSala===\'function\'&&hcIrMontajeSala()">Ir a montaje</button></div>'
    );
  }

  function mountTrasladoBanner(hostId) {
    var host = el(hostId);
    if (!host) return;
    var html = renderTrasladoSalaBannerHtml();
    var prev = host.querySelector('.hc-traslado-sala-banner');
    if (!html) {
      if (prev) prev.remove();
      return;
    }
    if (prev) {
      prev.outerHTML = html;
      return;
    }
    host.insertAdjacentHTML('afterbegin', html);
  }

  function ensureOperativaBanner(id, html, parentId, beforeId) {
    var ban = el(id);
    if (!html) {
      if (ban) ban.classList.add('setup-hidden');
      return;
    }
    if (!ban) {
      ban = document.createElement('div');
      ban.id = id;
      ban.className = 'setup-field-hint setup-field-hint--banner hc-camino-fase-banner';
      ban.setAttribute('role', 'note');
      var parent = el(parentId);
      if (!parent) return;
      var before = beforeId ? el(beforeId) : null;
      if (before && before.parentNode === parent) parent.insertBefore(ban, before);
      else parent.insertBefore(ban, parent.firstChild);
    }
    ban.classList.remove('setup-hidden');
    ban.innerHTML = html;
  }

  function refreshTabsOperativaCamino() {
    var cfg = cfgActiva();
    var prop = hcOperativaFasePropagadorGerm(cfg);

    ensureOperativaBanner(
      'medirPropagadorFaseBanner',
      prop
        ? '<strong>Fase propagador.</strong> Registra temp./HR del domo en <button type="button" class="btn btn-link btn-sm" onclick="goTab(\'inicio\');setTimeout(function(){document.getElementById(\'dashGerminacionHub\')?.scrollIntoView({behavior:\'smooth\'})},200)">Inicio → Germinación</button>. El depósito y EC/pH del cubo llegan después del traslado.'
        : '',
      'tab-mediciones',
      'medirTorreBanner'
    );

    ensureOperativaBanner(
      'salaPropagadorResumenBanner',
      prop
        ? '<strong>Sala (resumen).</strong> La carpa y el LED se configuran tras las 6 fases. Aquí verás equipamiento cuando completes el traslado.'
        : '',
      'tab-sala',
      null
    );

    var torreWrap = el('torreSVGWrap');
    var gate = el('hcSistemaFasePropagadorGate');
    if (prop) {
      if (!gate) {
        gate = document.createElement('section');
        gate.id = 'hcSistemaFasePropagadorGate';
        gate.className = 'hc-camino-fase-gate card';
        gate.setAttribute('role', 'region');
        gate.innerHTML =
          '<h2 class="hc-camino-fase-gate-title">Matriz DWC/RDWC — después del traslado</h2>' +
          '<p class="setup-field-hint">Mientras germinas en el propagador, la matriz de cestas y el sistema hidro se activan al terminar las 6 fases y configurar la sala.</p>' +
          '<button type="button" class="btn btn-primary btn-sm" onclick="goTab(\'inicio\');setTimeout(function(){document.getElementById(\'dashGerminacionHub\')?.scrollIntoView({behavior:\'smooth\'})},200)">Ir a Germinación</button>';
        var tab = el('tab-sistema');
        if (tab && torreWrap) tab.insertBefore(gate, torreWrap);
      }
      gate.classList.remove('setup-hidden');
      if (torreWrap) torreWrap.classList.add('setup-hidden');
      var torreCard = el('torreNombreCard');
      if (torreCard) torreCard.classList.add('setup-hidden');
    } else {
      if (gate) gate.classList.add('setup-hidden');
      if (torreWrap) torreWrap.classList.remove('setup-hidden');
      var torreCard2 = el('torreNombreCard');
      if (torreCard2) torreCard2.classList.remove('setup-hidden');
    }

    var hub = el('dashGerminacionHub');
    var hubVisible = hub && !hub.classList.contains('setup-hidden');
    if (!hubVisible) mountTrasladoBanner('hcTrasladoSalaBannerHost');
    else {
      var hostTr = el('hcTrasladoSalaBannerHost');
      if (hostTr) {
        var prevTr = hostTr.querySelector('.hc-traslado-sala-banner');
        if (prevTr) prevTr.remove();
      }
    }
    if (typeof refreshMedirOperativaUi === 'function') refreshMedirOperativaUi();
  }

  var _tabsHooked = false;
  function hookTabsOperativaRefresh() {
    if (_tabsHooked) return;
    _tabsHooked = true;
    var prev = global.refreshTabsOperativaUi;
    global.refreshTabsOperativaUi = function () {
      if (typeof prev === 'function') prev();
      refreshTabsOperativaCamino();
    };
  }

  global.hcOperativaFasePropagadorGerm = hcOperativaFasePropagadorGerm;
  global.refreshSetupCaminoStepBanner = refreshSetupCaminoStepBanner;
  global.getSetupStepLabelForPage = getSetupStepLabelForPage;
  global.syncPremiumGermSectionPlacement = syncPremiumGermSectionPlacement;
  global.refreshTabsOperativaCamino = refreshTabsOperativaCamino;
  global.renderTrasladoSalaBannerHtml = renderTrasladoSalaBannerHtml;
  global.hcNecesitaBannerTrasladoSala = hcNecesitaBannerTrasladoSala;

  hookTabsOperativaRefresh();
  document.addEventListener('DOMContentLoaded', function () {
    try {
      refreshTabsOperativaCamino();
    } catch (_) {}
  });
})(typeof window !== 'undefined' ? window : globalThis);
