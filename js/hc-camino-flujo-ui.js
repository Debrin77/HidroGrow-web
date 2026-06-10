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
    semilla_propagador: {
      3: '<strong>Entorno:</strong> interior o exterior. En ambos casos confirma el <strong>municipio</strong> para la pestaña Meteo (previsión de tu zona).',
    },
    semilla_hidro: {
      1: '<strong>Camino:</strong> prep hidro → sala y montaje → DWC/RDWC → 6 fases en el cubo.',
      2: '<strong>Objetivo:</strong> semilla en net pot desde el inicio; el depósito se cierra antes de las 6 fases.',
      3: '<strong>Entorno:</strong> define interior/exterior para dimensionar sala y meteo.',
      4: '<strong>Espacio:</strong> sala (carpa, LED, extractor) y prep del cubo de germinación.',
      5: '<strong>Clima y luz:</strong> fotoperiodo de la sala antes de germinar en el hidro.',
      7: '<strong>Detalle:</strong> método SOG/SCROG, variedad, plan de semillas y fecha de siembra. Semillero opcional.',
      8: '<strong>DWC/RDWC:</strong> tipo de sistema; siguiente pantalla = medidas del cubo o circuito.',
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
      5: 'Nutriente y domo',
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
      typeof hcSetupSalaPreGermPropagadorEquip === 'function' &&
      hcSetupSalaPreGermPropagadorEquip() &&
      pagina === (typeof SETUP_PAGE_PREMIUM_3 !== 'undefined' ? SETUP_PAGE_PREMIUM_3 : 4)
    ) {
      box.classList.add('setup-hidden');
      box.innerHTML = '';
      return;
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
    var propagador =
      typeof esSetupPropagadorGermPaso3 === 'function'
        ? esSetupPropagadorGermPaso3()
        : typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
          hcCaminoSemillaPropagadorSetupGerm();
    return (
      propagador &&
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

  function hcSetupSalaPreGermPropagadorEquip() {
    return (
      typeof hcSetupEnFaseSalaPreGerm === 'function' &&
      hcSetupEnFaseSalaPreGerm() &&
      getCam() === 'semilla_propagador'
    );
  }

  function applySalaPreGermEquipMinimalChrome() {
    var show = hcSetupSalaPreGermPropagadorEquip();
    var germAhora = isGermAhoraPropagadorUi();
    var page3 = el('spagePremium3');
    var overlay = el('setupOverlay');
    if (overlay) overlay.classList.toggle('hc-sala-pre-germ-equip', !!show);
    if (page3) page3.classList.toggle('hc-sala-pre-germ-equip-page', !!show);
    var t3 = page3 ? page3.querySelector('.setup-title') : null;
    if (t3 && !germAhora) {
      t3.textContent = show ? 'Equipamiento de la sala' : 'Espacio y equipamiento';
    }
    var hideIds = [
      'setupPremium3Subtitle',
      'setupPremiumEquipOrigenBanner',
      'setupPremiumEquipGermReco',
      'setupPremium3EquipBlockTitle',
      'setupPremium3EquipHint',
      'setupPremiumEquipFaltantes',
      'setupPremiumSalaInterior',
      'setupPremiumExteriorHint',
      'setupPremiumGermAhoraHost',
      'setupCaminoStepBanner',
      'setupRoadmapMini',
      'setupGuiaPanel',
    ];
    hideIds.forEach(function (id) {
      var node = el(id);
      if (!node) return;
      if (show) {
        node.classList.add('setup-hidden');
        if (id === 'setupPremium3Subtitle' || id === 'setupPremium3EquipHint') node.textContent = '';
      }
    });
    if (!show && typeof refreshPremiumEntornoUI === 'function') {
      refreshPremiumEntornoUI();
    }
    var camBanner = el('setupCaminoStepBanner');
    if (camBanner && show) {
      camBanner.classList.add('setup-hidden');
      camBanner.innerHTML = '';
    }
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
      var planSec = el('setupPremiumGermPlanSection');
      if (
        getCam() === 'semilla_hidro' &&
        planSec &&
        typeof hcCaminoSemillaGermEnSetup === 'function' &&
        hcCaminoSemillaGermEnSetup()
      ) {
        var genSec6 = el('setupPremiumGeneticaGermSection');
        if (planSec.parentNode !== page6) {
          if (genSec6 && genSec6.parentNode === page6) {
            page6.insertBefore(planSec, genSec6.nextSibling);
          } else {
            page6.appendChild(planSec);
          }
        }
        planSec.classList.remove('setup-hidden');
      }
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
    applySalaPreGermEquipMinimalChrome();
    if (typeof applyPremiumPropagadorPaso4Chrome === 'function') applyPremiumPropagadorPaso4Chrome();
    if (typeof refreshPremiumGeneticaGermVis === 'function') refreshPremiumGeneticaGermVis();
    if (typeof renderPremiumGermPlanUI === 'function') renderPremiumGermPlanUI();
    if (typeof renderEquipamientoPremiumUI === 'function') renderEquipamientoPremiumUI();
    applyPremiumDetalleOrigChrome(showGerm);
  }

  function applyPremiumPropagadorPaso4Chrome() {
    var show = isGermAhoraPropagadorUi();
    var page4 = el('spagePremium4');
    if (page4) page4.classList.toggle('hc-prop-nutriente-page', !!show);
    var t4 = page4 ? page4.querySelector('.setup-title') : null;
    if (t4) {
      t4.textContent = show ? 'Nutriente y clima domo' : 'Clima, luz y fotoperiodo';
    }
    var sub = el('setupPremiumClimaSubtitle');
    if (sub && show) {
      sub.classList.remove('setup-hidden');
      sub.textContent = 'Fotoperiodo bajo domo; la EC de la bandeja la defines arriba con tu abono.';
    }
    var nutSec = el('setupPremiumNutrienteGermSection');
    if (nutSec && show) nutSec.classList.remove('setup-hidden');
    if (typeof refreshPremiumNutrienteGermSection === 'function') refreshPremiumNutrienteGermSection();
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
    if (typeof hcGerminacionBloqueada === 'function') {
      var b = hcGerminacionBloqueada(cfg);
      if (b === 'sala_config' || b === 'sala_montaje') return b;
    }
    if (typeof hcPropagadorSalaRecoEnGermHub === 'function') {
      return hcPropagadorSalaRecoEnGermHub(cfg);
    }
    return null;
  }

  function renderTrasladoSalaBannerHtml(cfg) {
    cfg = cfg || cfgActiva();
    var tipo = hcNecesitaBannerTrasladoSala(cfg);
    if (!tipo) return '';
    var cam = getCam(cfg);
    if (tipo === 'sala_config' || tipo === 'sala_config_soft') {
      if (
        tipo === 'sala_config_soft' &&
        typeof hcMostrarRecoEquipSalaInicio === 'function' &&
        hcMostrarRecoEquipSalaInicio(cfg)
      ) {
        return '';
      }
      var titCfg =
        tipo === 'sala_config_soft'
          ? 'Prepara la sala de cultivo'
          : cam === 'semilla_propagador'
            ? 'Germinación concluida · Sala'
            : 'Configura la sala';
      return (
        '<div class="hc-traslado-sala-banner setup-field-hint setup-field-hint--banner" role="status">' +
        '<strong>' +
        titCfg +
        '</strong> Carpa, LED, extractor y clima — puedes hacerlo <strong>durante la germinación</strong>. ' +
        'El DWC/RDWC del depósito va al traslado. ' +
        '<button type="button" class="btn btn-primary btn-sm" onclick="typeof abrirConfiguradorEquipamientoSalaPropagador===\'function\'?abrirConfiguradorEquipamientoSalaPropagador():(typeof abrirSetupFaseSala===\'function\'&&abrirSetupFaseSala())">Configurar sala</button></div>'
      );
    }
    var titMont =
      tipo === 'sala_montaje_soft' ? 'Puesta en marcha de sala' : 'Montaje de sala';
    return (
      '<div class="hc-traslado-sala-banner setup-field-hint setup-field-hint--banner" role="status">' +
      '<strong>' +
      titMont +
      '.</strong> Checklist físico en la pestaña Sala (carpa, LED, extractor…). ' +
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
    if (
      typeof hcMedirGermPreTrasladoActivo === 'function' &&
      hcMedirGermPreTrasladoActivo(cfg)
    ) {
      return '';
    }
    if (
      typeof hcPropagadorTrasladoCompletado === 'function' &&
      hcPropagadorTrasladoCompletado(cfg)
    ) {
      return (
        '<strong>Sistema hidropónico:</strong> registra <strong>EC</strong>, <strong>pH</strong>, <strong>T° del agua</strong> y <strong>volumen</strong> del depósito DWC/RDWC. ' +
        'Con <strong>sala montada</strong>, también el ambiente de cultivo (T°, HR, VPD y equipamiento).'
      );
    }
    var f =
      typeof getSistemaFaseCamino === 'function' ? getSistemaFaseCamino(cfg) : null;
    if (!f) return '';
    if (f === 'propagador') {
      return (
        '<strong>Propagador:</strong> registra <strong>T° del agua con nutrientes</strong>, <strong>HR</strong> y <strong>volumen</strong> del domo. ' +
        'EC/pH del agua cuando aplique por fase. Tras <strong>configurar sala y montaje</strong>, aparecen parámetros del equipamiento. ' +
        'El <strong>depósito DWC/RDWC</strong> se mide aquí solo <strong>después del traslado</strong> de las plántulas.'
      );
    }
    if (f === 'germ_cubo') {
      var camHint = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
      return camHint === 'semilla_hidro'
        ? '<strong>Germinación en cubo:</strong> registra <strong>T° del agua</strong>, <strong>HR</strong> y <strong>volumen</strong> del cubo. EC/pH según fase. ' +
            'Con sala montada: equipamiento abajo. El <strong>depósito DWC/RDWC</strong> solo <strong>después del registro en matriz</strong>.'
        : '<strong>Germinación activa.</strong> Registro del domo en ' +
            '<button type="button" class="btn btn-link btn-sm" onclick="typeof hcIrHubGerminacionOperativa===\'function\'&&hcIrHubGerminacionOperativa()">Inicio</button>. Medir también el cubo.';
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
    var ocultarRiego =
      typeof hcOcultarTabRiegoEnCaminoPropagador === 'function' &&
      hcOcultarTabRiegoEnCaminoPropagador(cfg);
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

    var btnRiego = el('btn-riego');
    if (btnRiego) {
      btnRiego.classList.toggle('hc-tab-camino-oculta', ocultarRiego);
      btnRiego.disabled = !!ocultarRiego;
      btnRiego.setAttribute('aria-hidden', ocultarRiego ? 'true' : 'false');
      btnRiego.tabIndex = ocultarRiego ? -1 : 0;
      if (ocultarRiego) {
        btnRiego.setAttribute(
          'title',
          'Riego del depósito: disponible al configurar DWC/RDWC (propagador usa ~2–3 mm en bandeja)'
        );
      } else {
        btnRiego.removeAttribute('title');
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
    document.body.classList.toggle('hc-modo-propagador-sin-riego', !!ocultarRiego);

    if (ocultarRiego && document.getElementById('tab-riego')?.classList.contains('active')) {
      setTimeout(function () {
        try {
          var riegoPanel = document.getElementById('tab-riego');
          if (riegoPanel && riegoPanel.classList.contains('active') && typeof goTab === 'function') {
            goTab('inicio');
          }
        } catch (_) {}
      }, 0);
    }
  }

  function propagadorSalaOcultaBannerHtml(cfg) {
    if (typeof getCaminoCultivo !== 'function' || getCaminoCultivo(cfg) !== 'semilla_propagador') {
      return '';
    }
    if (typeof salaPreGermConfigurada === 'function' && salaPreGermConfigurada(cfg)) {
      return '';
    }
    return (
      '<strong>Configura la sala cuando quieras</strong> (pestaña Sala o botón abajo): carpa, LED, extractor… ' +
      'Puedes hacerlo <strong>durante la germinación</strong>. El DWC/RDWC vendrá después, con la sala lista.'
    );
  }

  /** Tras checklist propagador o al entrar en operativa: Inicio + hub sincronizado. */
  function hcIrHubGerminacionOperativa(opts) {
    opts = opts || {};
    var cfg =
      typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
    try {
      if (typeof hcSyncGerminacionPlanCultivo === 'function') {
        hcSyncGerminacionPlanCultivo(cfg);
      }
      if (typeof hcGerminacionSyncDesdePremium === 'function') {
        hcGerminacionSyncDesdePremium(cfg);
      }
      if (typeof goTab === 'function') goTab('inicio');
      var run = function () {
        try {
          if (typeof refreshDashGerminacionHub === 'function') refreshDashGerminacionHub();
          if (!opts.sinScroll) {
            document
              .getElementById('dashGerminacionHub')
              ?.scrollIntoView({ behavior: opts.scrollSmooth === false ? 'auto' : 'smooth', block: 'start' });
          }
        } catch (_) {}
      };
      if (opts.inmediato) run();
      else requestAnimationFrame(run);
    } catch (_) {}
  }

  function refreshTabsOperativaCaminoForTab(tab) {
    var cfg = cfgActiva();
    aplicarVisibilidadTabsCamino(cfg);
    if (tab === 'inicio') {
      ensureOperativaBanner(
        'propagadorSalaOcultaBanner',
        propagadorSalaOcultaBannerHtml(cfg),
        'tab-inicio',
        'dashGerminacionHub'
      );
      var hub = el('dashGerminacionHub');
      if (typeof refreshDashSalaEquipRecoBanner === 'function') refreshDashSalaEquipRecoBanner(cfg);
      if (typeof refreshDashInicioVistaCamino === 'function') refreshDashInicioVistaCamino(cfg);
      hub = el('dashGerminacionHub');
      var hubVisible = hub && !hub.classList.contains('setup-hidden');
      if (!hubVisible) mountTrasladoBanner('hcTrasladoSalaBannerHost');
      else {
        var hostTr = el('hcTrasladoSalaBannerHost');
        if (hostTr) {
          var prevTr = hostTr.querySelector('.hc-traslado-sala-banner');
          if (prevTr) prevTr.remove();
        }
      }
      return;
    }
    if (tab === 'mediciones') {
      ensureOperativaBanner(
        'medirPropagadorFaseBanner',
        medirBannerHtml(cfg),
        'tab-mediciones',
        'medirTorreBanner'
      );
      if (typeof refreshMedirOperativaUi === 'function') refreshMedirOperativaUi();
      if (typeof refreshMedirGerminacionUi === 'function') refreshMedirGerminacionUi(cfg);
      if (typeof repositionMedirGuiaDiaTop === 'function') repositionMedirGuiaDiaTop();
      try {
        if (typeof refreshMedirLocalidadMeteoLeadUI === 'function') refreshMedirLocalidadMeteoLeadUI();
        if (typeof refreshAvisoUbicacionExteriorPendiente === 'function') {
          refreshAvisoUbicacionExteriorPendiente();
        }
      } catch (_) {}
      return;
    }
    if (tab === 'sala') {
      if (typeof refreshSalaSubTabsCaminoUi === 'function') refreshSalaSubTabsCaminoUi(cfg);
      if (typeof applySalaMontajeRecomendadoUi === 'function') applySalaMontajeRecomendadoUi(cfg);
      if (typeof refreshLuzOrigenUI === 'function') refreshLuzOrigenUI(cfg);
      return;
    }
    if (tab === 'sistema') {
      if (typeof hcRefreshSistemaFasePanel === 'function') hcRefreshSistemaFasePanel();
      else if (typeof hcRefreshSistemaPropagadorPanel === 'function') {
        hcRefreshSistemaPropagadorPanel();
      }
    }
  }

  var _refreshTabsFullTimer = null;

  function hcActiveMainTab() {
    var order = ['inicio', 'mediciones', 'sala', 'sistema', 'meteo', 'calendario', 'historial', 'riego', 'consejos', 'ayuda'];
    for (var i = 0; i < order.length; i++) {
      var panel = document.getElementById('tab-' + order[i]);
      if (panel && panel.classList.contains('active')) return order[i];
    }
    return 'inicio';
  }

  function refreshTabsOperativaCaminoCore(opts) {
    opts = opts || {};
    if (opts.allTabs) {
      ['inicio', 'mediciones', 'sistema', 'sala'].forEach(function (t) {
        refreshTabsOperativaCaminoCore({ tab: t });
      });
      return;
    }
    var cfg = cfgActiva();
    var tab = opts.tab || hcActiveMainTab();

    if (tab === 'inicio' || tab === 'mediciones' || tab === 'sistema' || tab === 'sala') {
      aplicarVisibilidadTabsCamino(cfg);
    }

    if (tab === 'inicio') {
      ensureOperativaBanner(
        'propagadorSalaOcultaBanner',
        propagadorSalaOcultaBannerHtml(cfg),
        'tab-inicio',
        'dashGerminacionHub'
      );
      var hub = el('dashGerminacionHub');
      if (typeof refreshDashSalaEquipRecoBanner === 'function') refreshDashSalaEquipRecoBanner(cfg);
      if (typeof refreshDashInicioVistaCamino === 'function') refreshDashInicioVistaCamino(cfg);
      hub = el('dashGerminacionHub');
      var hubVisible = hub && !hub.classList.contains('setup-hidden');
      if (!hubVisible) mountTrasladoBanner('hcTrasladoSalaBannerHost');
      else {
        var hostTr = el('hcTrasladoSalaBannerHost');
        if (hostTr) {
          var prevTr = hostTr.querySelector('.hc-traslado-sala-banner');
          if (prevTr) prevTr.remove();
        }
      }
      return;
    }

    if (tab === 'mediciones') {
      ensureOperativaBanner(
        'medirPropagadorFaseBanner',
        medirBannerHtml(cfg),
        'tab-mediciones',
        'medirTorreBanner'
      );
      if (typeof refreshMedirOperativaUi === 'function') {
        refreshMedirOperativaUi({ skipTabsUi: true });
      }
      if (typeof refreshMedirGerminacionUi === 'function') refreshMedirGerminacionUi(cfg);
      if (typeof repositionMedirGuiaDiaTop === 'function') repositionMedirGuiaDiaTop();
      try {
        if (typeof refreshMedirLocalidadMeteoLeadUI === 'function') refreshMedirLocalidadMeteoLeadUI();
        if (typeof refreshAvisoUbicacionExteriorPendiente === 'function') refreshAvisoUbicacionExteriorPendiente();
      } catch (_) {}
      return;
    }

    if (tab === 'sistema') {
      if (typeof hcRefreshSistemaFasePanel === 'function') {
        hcRefreshSistemaFasePanel();
      } else if (typeof hcRefreshSistemaPropagadorPanel === 'function') {
        hcRefreshSistemaPropagadorPanel();
      }
      return;
    }

    if (tab === 'sala') {
      if (typeof refreshSalaSubTabsCaminoUi === 'function') refreshSalaSubTabsCaminoUi(cfg);
      if (typeof applySalaMontajeRecomendadoUi === 'function') applySalaMontajeRecomendadoUi(cfg);
      if (typeof refreshLuzOrigenUI === 'function') refreshLuzOrigenUI(cfg);
      if (typeof refreshSalaVistaCamino === 'function') refreshSalaVistaCamino(cfg);
    }
  }

  function refreshTabsOperativaCamino(opts) {
    opts = opts || {};
    aplicarVisibilidadTabsCamino(cfgActiva());
    if (!opts.full) return;
    if (opts.inmediato) {
      refreshTabsOperativaCaminoCore(opts);
      return;
    }
    if (_refreshTabsFullTimer) clearTimeout(_refreshTabsFullTimer);
    _refreshTabsFullTimer = setTimeout(function () {
      _refreshTabsFullTimer = null;
      refreshTabsOperativaCaminoCore(opts);
    }, 48);
  }

  var _tabsHooked = false;
  function hookTabsOperativaRefresh() {
    if (_tabsHooked) return;
    _tabsHooked = true;
    var prev = global.refreshTabsOperativaUi;
    global.refreshTabsOperativaUi = function (opts) {
      opts = opts && typeof opts === 'object' ? opts : {};
      if (typeof prev === 'function') prev(opts);
      if (opts.full) {
        refreshTabsOperativaCamino({ full: true, inmediato: !!opts.inmediato });
        return;
      }
      if (opts.tab) {
        refreshTabsOperativaCaminoForTab(opts.tab);
        return;
      }
      refreshTabsOperativaCamino();
    };
  }

  global.refreshSetupCaminoStepBanner = refreshSetupCaminoStepBanner;
  global.getSetupStepLabelForPage = getSetupStepLabelForPage;
  global.syncPremiumGermSectionPlacement = syncPremiumGermSectionPlacement;
  global.hcSetupSalaPreGermPropagadorEquip = hcSetupSalaPreGermPropagadorEquip;
  global.applySalaPreGermEquipMinimalChrome = applySalaPreGermEquipMinimalChrome;
  global.applyPremiumPropagadorPaso4Chrome = applyPremiumPropagadorPaso4Chrome;
  global.refreshTabsOperativaCamino = refreshTabsOperativaCamino;
  global.refreshTabsOperativaCaminoForTab = refreshTabsOperativaCaminoForTab;
  global.renderTrasladoSalaBannerHtml = renderTrasladoSalaBannerHtml;
  global.hcNecesitaBannerTrasladoSala = hcNecesitaBannerTrasladoSala;
  global.hcIrHubGerminacionOperativa = hcIrHubGerminacionOperativa;

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
      if (
        tab === 'riego' &&
        typeof hcOcultarTabRiegoEnCaminoPropagador === 'function' &&
        hcOcultarTabRiegoEnCaminoPropagador()
      ) {
        if (typeof showToast === 'function') {
          showToast(
            'En propagador no hay riego de depósito: usa ~2–3 mm de agua con nutrientes en la bandeja (checklist del propagador).',
            false,
            { durationMs: 5600 }
          );
        }
        if (typeof hcOpenPropagadorMontajeChecklist === 'function') {
          hcOpenPropagadorMontajeChecklist();
          return prev('inicio');
        }
        tab = 'inicio';
        return prev(tab);
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
