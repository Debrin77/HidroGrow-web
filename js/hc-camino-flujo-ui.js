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

  var STEP_BANNERS = {
    semilla_propagador: {},
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

  function ocultarBannerSuperiorPropagadorSetup() {
    return (
      getCam() === 'semilla_propagador' &&
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm()
    );
  }

  function refreshSetupCaminoStepBanner(pagina) {
    var box = el('setupCaminoStepBanner');
    if (!box) return;
    if (ocultarBannerSuperiorPropagadorSetup()) {
      box.classList.add('setup-hidden');
      box.innerHTML = '';
      return;
    }
    var cam = getCam();
    var map = STEP_BANNERS[cam];
    var html = map && map[pagina] ? map[pagina] : '';
    if (
      typeof hcSetupEnFaseSalaPreGerm === 'function' &&
      hcSetupEnFaseSalaPreGerm() &&
      pagina === (typeof SETUP_PAGE_PREMIUM_3 !== 'undefined' ? SETUP_PAGE_PREMIUM_3 : 4)
    ) {
      html =
        '<strong>Solo sala (1 paso):</strong> carpa, LED, extractor y medidor. Sin repetir fotoperiodo ni catálogo completo.';
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
    if (
      typeof hcSetupEnFaseSalaPreGerm === 'function' &&
      hcSetupEnFaseSalaPreGerm() &&
      page === (typeof SETUP_PAGE_PREMIUM_3 !== 'undefined' ? SETUP_PAGE_PREMIUM_3 : 4)
    ) {
      return 'Equipamiento sala';
    }
    if (
      typeof hcSetupEnFaseGerminacion === 'function' &&
      !hcSetupEnFaseGerminacion() &&
      typeof state !== 'undefined' &&
      state &&
      state.configTorre &&
      state.configTorre.hcSetupFase === 'hidro' &&
      page === (typeof SETUP_PAGE_PREMIUM_END !== 'undefined' ? SETUP_PAGE_PREMIUM_END : 8)
    ) {
      return 'DWC/RDWC';
    }
    var cam = getCam();
    var map = STEP_LABELS[cam];
    if (map && map[page]) return map[page];
    return null;
  }

  function isGermAhoraPropagadorUi() {
    return (
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm() &&
      (typeof getPremiumOrigenPlanta === 'function'
        ? getPremiumOrigenPlanta()
        : 'semilla') === 'semilla'
    );
  }

  function reorderGermAhoraHost(host) {
    if (!host) return;
    var plan = el('setupPremiumGermPlanSection');
    var genPref = el('setupPremiumGeneticaPrefBundle');
    var genSec = el('setupPremiumGeneticaGermSection');
    [plan, genPref, genSec].forEach(function (node) {
      if (node && node.parentNode === host) host.appendChild(node);
    });
  }

  function applyGermAhoraMinimalChrome(showGerm) {
    var page3 = el('spagePremium3');
    if (page3) page3.classList.toggle('hc-germ-ahora-page', !!showGerm);
    var sub = el('setupPremium3Subtitle');
    if (sub) sub.classList.toggle('setup-hidden', !!showGerm);
    var equipHint = el('setupPremium3EquipHint');
    if (equipHint) equipHint.classList.toggle('setup-hidden', !!showGerm);
    var equipTitle = el('setupPremium3EquipBlockTitle');
    if (equipTitle) {
      equipTitle.textContent = showGerm ? 'Domo y mat térmica' : 'Marca y modelo (catálogo ES)';
    }
    var germReco = el('setupPremiumEquipGermReco');
    if (germReco) germReco.classList.toggle('setup-hidden', !!showGerm);
    var origBanner = el('setupPremiumEquipOrigenBanner');
    if (origBanner) origBanner.classList.toggle('setup-hidden', !!showGerm);
    var falt = el('setupPremiumEquipFaltantes');
    if (falt && showGerm) falt.classList.add('setup-hidden');
    var camBanner = el('setupCaminoStepBanner');
    if (camBanner && (showGerm || ocultarBannerSuperiorPropagadorSetup())) {
      camBanner.classList.add('setup-hidden');
      camBanner.innerHTML = '';
    }
  }

  function syncPremiumGermSectionPlacement() {
    var sec = el('setupPremiumGeneticaGermSection');
    var host = el('setupPremiumGermAhoraHost');
    var page6 = el('spagePremium6');
    var genPref = el('setupPremiumGeneticaPrefBundle');
    var bundle = el('setupPremiumMetodoGenBundle');
    if (!sec) return;
    var showGerm = isGermAhoraPropagadorUi();
    if (showGerm && host) {
      host.classList.remove('setup-hidden');
      if (genPref && genPref.parentNode !== host) host.appendChild(genPref);
      if (sec.parentNode !== host) host.appendChild(sec);
      reorderGermAhoraHost(host);
    } else if (page6) {
      if (host) host.classList.add('setup-hidden');
      if (genPref && bundle && genPref.parentNode !== bundle) {
        var metHint = el('setupPremiumGeneticaHint');
        if (metHint && metHint.parentNode === bundle) {
          bundle.insertBefore(genPref, metHint);
        } else {
          var metodoHint = el('setupPremiumMetodoHint');
          if (metodoHint && metodoHint.parentNode === bundle) {
            bundle.insertBefore(genPref, metodoHint);
          } else {
            bundle.appendChild(genPref);
          }
        }
      }
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
    applyGermAhoraMinimalChrome(showGerm);
    if (typeof refreshPremiumGeneticaGermVis === 'function') refreshPremiumGeneticaGermVis();
    if (typeof renderPremiumGermPlanUI === 'function') renderPremiumGermPlanUI();
    if (typeof renderEquipamientoPremiumUI === 'function') renderEquipamientoPremiumUI();
    applyPremiumDetalleOrigChrome(showGerm);
  }

  function applyPremiumDetalleOrigChrome(showGerm) {
    var page6 = el('spagePremium6');
    if (page6) page6.classList.toggle('hc-prop-detalle-lite', !!showGerm);
    var sub6 = el('setupPremium6Subtitle');
    if (sub6) sub6.classList.toggle('setup-hidden', !!showGerm);
    var hostMet = el('setupPremiumMetodoGenGermHost');
    if (hostMet && showGerm) {
      hostMet.classList.add('setup-hidden');
      hostMet.innerHTML = '';
    }
    if (showGerm && typeof refreshPremiumSemilleroVis === 'function') {
      refreshPremiumSemilleroVis();
    }
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
        (cam === 'semilla_propagador' ? 'Germinación concluida · Sala (opcional)' : 'Configura la sala') +
        '</strong> Carpa, LED y extractor si quieres antes del traslado al hidro. ' +
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

  function medirBannerHtml(cfg) {
    var f =
      typeof getSistemaFaseCamino === 'function' ? getSistemaFaseCamino(cfg) : null;
    if (!f) return '';
    if (f === 'propagador' || f === 'germ_cubo') {
      return (
        '<strong>Seguimiento activo.</strong> Domo/cubo en <button type="button" class="btn btn-link btn-sm" onclick="goTab(\'inicio\');setTimeout(function(){document.getElementById(\'dashGerminacionHub\')?.scrollIntoView({behavior:\'smooth\'})},200)">Inicio → Germinación</button>. ' +
        (f === 'germ_cubo' ? 'Medir también el depósito del cubo.' : 'Sin medir el depósito DWC aún.')
      );
    }
    if (f === 'prep_hidro') {
      return '<strong>Prep hidro.</strong> Completa los pasos en la pestaña Sistema antes de las 6 fases en el cubo.';
    }
    if (f === 'enraizado') {
      return '<strong>Enraizado.</strong> Control del domo en Inicio/checklist; el depósito completo tras asignar clones.';
    }
    if (f === 'madre') {
      return '<strong>Cubo madre.</strong> 18/6 · asigna la madre en Sistema y el primer llenado del depósito.';
    }
    return '';
  }

  function aplicarVisibilidadTabsCamino(cfg) {
    cfg = cfg || cfgActiva();
    var ocultarSala =
      typeof hcOcultarTabSalaDuranteCamino === 'function' && hcOcultarTabSalaDuranteCamino(cfg);
    var faseSistema =
      typeof hcMostrarSistemaFaseCamino === 'function' && hcMostrarSistemaFaseCamino(cfg);
    var tituloTab =
      typeof hcTituloSistemaTab === 'function' ? hcTituloSistemaTab(cfg) : 'Cultivo e instalación';

    var btnSala = el('btn-sala');
    if (btnSala) {
      btnSala.classList.toggle('hc-tab-camino-oculta', ocultarSala);
      btnSala.disabled = !!ocultarSala;
      btnSala.setAttribute('aria-hidden', ocultarSala ? 'true' : 'false');
      btnSala.tabIndex = ocultarSala ? -1 : 0;
      if (ocultarSala) {
        btnSala.setAttribute(
          'title',
          'Sala disponible al concluir la germinación (Inicio → Germinación)'
        );
      } else {
        btnSala.setAttribute('title', 'Sala de cultivo');
      }
    }

    var btnSistema = el('btn-sistema');
    if (btnSistema) {
      btnSistema.setAttribute('title', tituloTab);
      btnSistema.setAttribute('aria-label', 'Ir a ' + tituloTab);
    }

    var tituloAccent = document.querySelector('#tab-sistema .section-title .accent');
    if (tituloAccent) tituloAccent.textContent = tituloTab;
    var hintSistema = el('tabContextHintSistema');
    if (hintSistema) hintSistema.classList.toggle('setup-hidden', !!faseSistema);
    document.body.classList.toggle('hc-modo-propagador-sistema', !!faseSistema);
    document.body.classList.toggle('hc-modo-propagador-sin-sala', !!ocultarSala);
  }

  function propagadorSalaOcultaBannerHtml(cfg) {
    if (typeof getCaminoCultivo !== 'function' || getCaminoCultivo(cfg) !== 'semilla_propagador') {
      return '';
    }
    if (
      typeof hcOcultarTabSalaDuranteCamino !== 'function' ||
      !hcOcultarTabSalaDuranteCamino(cfg)
    ) {
      return '';
    }
    return (
      '<strong>Sala aún no en la barra.</strong> En propagador configuras carpa y LED cuando la germinación esté concluida ' +
      '(días según genética o botón en Germinación abajo). La pestaña Sala aparecerá entonces.'
    );
  }

  function refreshTabsOperativaCamino() {
    var cfg = cfgActiva();
    aplicarVisibilidadTabsCamino(cfg);

    ensureOperativaBanner(
      'propagadorSalaOcultaBanner',
      propagadorSalaOcultaBannerHtml(cfg),
      'tab-inicio',
      'dashGerminacionHub'
    );

    ensureOperativaBanner(
      'medirPropagadorFaseBanner',
      medirBannerHtml(cfg),
      'tab-mediciones',
      'medirTorreBanner'
    );

    if (typeof hcRefreshSistemaFasePanel === 'function') {
      hcRefreshSistemaFasePanel();
    } else if (typeof hcRefreshSistemaPropagadorPanel === 'function') {
      hcRefreshSistemaPropagadorPanel();
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

  global.refreshSetupCaminoStepBanner = refreshSetupCaminoStepBanner;
  global.getSetupStepLabelForPage = getSetupStepLabelForPage;
  global.syncPremiumGermSectionPlacement = syncPremiumGermSectionPlacement;
  global.refreshTabsOperativaCamino = refreshTabsOperativaCamino;
  global.renderTrasladoSalaBannerHtml = renderTrasladoSalaBannerHtml;
  global.hcNecesitaBannerTrasladoSala = hcNecesitaBannerTrasladoSala;

  function hookGoTabCamino() {
    if (global._hcGoTabCaminoHooked) return;
    global._hcGoTabCaminoHooked = true;
    var prev = global.goTab;
    if (typeof prev !== 'function') return;
    global.goTab = function (tab) {
      if (
        tab === 'sala' &&
        typeof hcOcultarTabSalaDuranteCamino === 'function' &&
        hcOcultarTabSalaDuranteCamino()
      ) {
        if (typeof showToast === 'function') {
          showToast(
            'Sala se activa al concluir la germinación (botón en Inicio → Germinación).',
            false,
            { durationMs: 5200 }
          );
        }
        tab = 'inicio';
        var r = prev(tab);
        setTimeout(function () {
          try {
            document
              .getElementById('dashGerminacionHub')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } catch (_) {}
        }, 280);
        return r;
      }
      return prev(tab);
    };
  }

  hookTabsOperativaRefresh();
  hookGoTabCamino();
  document.addEventListener('DOMContentLoaded', function () {
    try {
      hookGoTabCamino();
      refreshTabsOperativaCamino();
    } catch (_) {}
  });

  global.aplicarVisibilidadTabsCamino = aplicarVisibilidadTabsCamino;
})(typeof window !== 'undefined' ? window : globalThis);
