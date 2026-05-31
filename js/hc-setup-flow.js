/**
 * HidroGrow — flujo coherente del asistente: sin repetir datos, saltos inteligentes, defaults desde premium.
 */
(function (global) {
  'use strict';

  function ensurePremium() {
    return typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : null;
  }

  function inferSustratoFromOrigen(origen) {
    if (origen === 'clon') return 'mixto';
    if (origen === 'madre') return 'lana';
    return 'lana';
  }

  function inferLuzFromPremium(p) {
    if (!p) return 'led';
    if (p.entorno === 'exterior') return 'natural';
    if (Number.isFinite(p.ledW) && p.ledW >= 80) return 'led';
    if (p.intensidadLuz === 'baja') return 'fluorescente';
    return 'led';
  }

  /** Copia premium → setupData (ubicación, luz, horas, sustrato sugerido). */
  function syncSetupDataFromPremium() {
    const p = ensurePremium();
    if (!p || typeof setupData === 'undefined') return;
    setupData.ubicacion = p.entorno === 'exterior' ? 'exterior' : 'interior';
    if (typeof setupUbicacion !== 'undefined') setupUbicacion = setupData.ubicacion;
    if (Number.isFinite(p.horasLuz)) {
      setupData.horasLuz = Math.max(12, Math.min(20, Math.round(p.horasLuz)));
    }
    setupData.luz = inferLuzFromPremium(p);
    if (!setupData._sustratoManual) {
      setupData.sustrato = inferSustratoFromOrigen(p.origenPlanta || 'semilla');
      setupData._sustratoAuto = true;
    }
    if (!setupData.agua) setupData.agua = 'osmosis';
    if (p.consejosModoUi === 'avanzado' || p.consejosModoUi === 'principiante') {
      setupData.consejosModoUi = p.consejosModoUi;
    }
  }

  function getSetupSkippedPages() {
    const skip = new Set();
    if (typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre) {
      skip.add(typeof SETUP_PAGE_RESUMEN !== 'undefined' ? SETUP_PAGE_RESUMEN : 14);
    }
    if (setupFlowCanSkipUbicacion()) {
      skip.add(typeof SETUP_PAGE_UBICACION !== 'undefined' ? SETUP_PAGE_UBICACION : 12);
    }
    return skip;
  }

  function getSetupVisiblePages() {
    const total = typeof SETUP_TOTAL_PAGES !== 'undefined' ? SETUP_TOTAL_PAGES : 15;
    const skip = getSetupSkippedPages();
    const out = [];
    for (let i = 0; i < total; i++) {
      if (!skip.has(i)) out.push(i);
    }
    return out;
  }

  function getSetupDisplayStepInfo(page) {
    const visible = getSetupVisiblePages();
    const idx = visible.indexOf(page);
    return {
      step: idx >= 0 ? idx + 1 : page + 1,
      total: visible.length,
      visible: idx >= 0,
    };
  }

  function setupFlowAdvancePage(delta) {
    const total = typeof SETUP_TOTAL_PAGES !== 'undefined' ? SETUP_TOTAL_PAGES : 15;
    const skip = getSetupSkippedPages();
    let p = typeof setupPagina !== 'undefined' ? setupPagina : 0;
    const step = delta > 0 ? 1 : -1;
    for (let guard = 0; guard < total + 2; guard++) {
      p += step;
      if (p < 0 || p >= total) return p;
      if (!skip.has(p)) return p;
    }
    return p;
  }

  function hasExteriorCiudadCompleta() {
    try {
      const ciudad = String(
        (typeof setupCoordenadas !== 'undefined' && setupCoordenadas && setupCoordenadas.ciudad) ||
          setupData.ciudad ||
          ''
      ).trim();
      const lat =
        typeof setupCoordenadas !== 'undefined' && setupCoordenadas
          ? setupCoordenadas.lat
          : setupData.lat;
      const lon =
        typeof setupCoordenadas !== 'undefined' && setupCoordenadas
          ? setupCoordenadas.lon
          : setupData.lon;
      return !!(ciudad && Number.isFinite(Number(lat)) && Number.isFinite(Number(lon)));
    } catch (_) {
      return false;
    }
  }

  function setupFlowCanSkipUbicacion() {
    const p = ensurePremium();
    if (!p) return false;
    syncSetupDataFromPremium();
    if (p.entorno === 'interior') return true;
    return hasExteriorCiudadCompleta();
  }

  function sustratoLabel(key) {
    const map = {
      lana: 'Lana de roca',
      esponja: 'Esponja hidropónica',
      arcilla: 'Arcilla expandida',
      mixto: 'Mixto (esponja + arcilla)',
      perlita: 'Perlita',
      coco: 'Fibra de coco',
      vermiculita: 'Vermiculita',
      turba_enraiz: 'Turba biodegradable',
    };
    return map[key] || key;
  }

  function aguaLabel(key) {
    const map = { destilada: 'Destilada', osmosis: 'Ósmosis', grifo: 'Grifo' };
    return map[key] || key;
  }

  function origenLabel(origen) {
    const map = { semilla: 'semilla', clon: 'clon/esqueje', madre: 'planta madre' };
    return map[origen] || origen;
  }

  function renderSetupAguaRecap() {
    const panel = document.getElementById('setupAguaRecapPanel');
    if (!panel) return;
    syncSetupDataFromPremium();
    const p = ensurePremium();
    const origen = (p && p.origenPlanta) || 'semilla';
    const su = setupData.sustrato || inferSustratoFromOrigen(origen);
    const agua = setupData.agua || 'osmosis';
    const autoNote = setupData._sustratoAuto
      ? ' Sugerido según origen <strong>' + origenLabel(origen) + '</strong> (paso Planta).'
      : '';
    panel.innerHTML =
      '<p><strong>Agua de mezcla:</strong> ' +
      aguaLabel(agua) +
      ' · <strong>Fijación en net pot:</strong> ' +
      sustratoLabel(su) +
      '.' +
      autoNote +
      ' El cubo de germinación (lana 4×4) ya lo marcaste en Germinación; aquí confirmas el medio en la cesta del sistema.</p>';
    panel.classList.remove('setup-hidden');
  }

  function renderSetupUbicacionRecap() {
    const panel = document.getElementById('setupUbicacionRecapPanel');
    if (!panel) return;
    syncSetupDataFromPremium();
    const p = ensurePremium();
    if (!p) {
      panel.classList.add('setup-hidden');
      return;
    }
    const int = p.entorno !== 'exterior';
    panel.innerHTML =
      '<p><strong>Ya definido en pasos anteriores:</strong> ' +
      (int ? 'Interior' : 'Exterior') +
      ' · ' +
      (Number.isFinite(p.horasLuz) ? p.horasLuz + ' h luz/día' : '—') +
      (int && Number.isFinite(p.ledW) ? ' · LED ~' + p.ledW + ' W' : '') +
      '.</p>' +
      (int
        ? '<p class="setup-flow-recap-sub">No hace falta repetir ubicación ni tipo de foco.</p>'
        : '<p class="setup-flow-recap-sub">Solo falta confirmar la ciudad para meteo (abajo).</p>');
    panel.classList.remove('setup-hidden');
  }

  function applySetupFlowCondensedUI(page) {
    syncSetupDataFromPremium();
    const p = ensurePremium();
    const premiumActive = !!p;

    if (page === typeof SETUP_PAGE_GEOMETRY !== 'undefined' ? SETUP_PAGE_GEOMETRY : 8) {
      const hint = document.getElementById('setupFlowTipoHint');
      const inline = document.getElementById('setupTipoInstalacionInline');
      const tipoOk =
        typeof setupTipoInstalacion !== 'undefined' &&
        (setupTipoInstalacion === 'dwc' || setupTipoInstalacion === 'rdwc');
      if (inline && tipoOk && typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre) {
        inline.classList.add('setup-flow-tipo-done');
        if (hint) hint.classList.remove('setup-hidden');
      } else {
        if (inline) inline.classList.remove('setup-flow-tipo-done');
        if (hint) hint.classList.add('setup-hidden');
      }
    }

    if (page === typeof SETUP_PAGE_AGUA !== 'undefined' ? SETUP_PAGE_AGUA : 10) {
      renderSetupAguaRecap();
      if (typeof seleccionarAgua === 'function' && setupData.agua) {
        seleccionarAgua(setupData.agua);
      }
      if (typeof seleccionarSustrato === 'function' && setupData.sustrato) {
        seleccionarSustrato(setupData.sustrato, false);
      }
    }

    if (page === typeof SETUP_PAGE_UBICACION !== 'undefined' ? SETUP_PAGE_UBICACION : 12) {
      const dupLoc = document.getElementById('setupUbicacionDuplicadaWrap');
      const dupLuz = document.getElementById('seccionIluminacion');
      const extras = document.getElementById('setupUbicacionExtrasWrap');
      if (premiumActive && dupLoc) dupLoc.classList.add('setup-hidden');
      if (premiumActive && dupLuz) dupLuz.classList.add('setup-hidden');
      if (premiumActive && extras) extras.classList.add('setup-hidden');
      const ciudadSec = document.getElementById('seccionCiudadUbicacion');
      if (ciudadSec) {
        const ext = p && p.entorno === 'exterior';
        ciudadSec.classList.toggle('setup-hidden', !ext);
      }
      renderSetupUbicacionRecap();
      if (typeof syncWizardLuzUI === 'function' && !premiumActive) syncWizardLuzUI();
    }
  }

  function markSustratoManual() {
    if (typeof setupData !== 'undefined') setupData._sustratoManual = true;
  }

  global.inferLuzFromPremium = inferLuzFromPremium;
  global.syncSetupDataFromPremium = syncSetupDataFromPremium;
  global.inferSustratoFromOrigen = inferSustratoFromOrigen;
  global.setupFlowCanSkipUbicacion = setupFlowCanSkipUbicacion;
  global.setupFlowAdvancePage = setupFlowAdvancePage;
  global.getSetupVisiblePages = getSetupVisiblePages;
  global.getSetupDisplayStepInfo = getSetupDisplayStepInfo;
  global.applySetupFlowCondensedUI = applySetupFlowCondensedUI;
  global.renderSetupAguaRecap = renderSetupAguaRecap;
  global.markSustratoManual = markSustratoManual;
})(typeof window !== 'undefined' ? window : globalThis);
