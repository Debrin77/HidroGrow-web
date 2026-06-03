/**
 * HidroGrow — genética concreta en setup (paso semilla) → germinación en Inicio.
 */
(function () {
  'use strict';

  function el(id) {
    return document.getElementById(id);
  }

  function ensurePremium() {
    return typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : {};
  }

  function filtroGeneticaPref() {
    const p = ensurePremium();
    return p.geneticaPref === 'auto' ? 'auto' : p.geneticaPref === 'foto' ? 'foto' : '';
  }

  /** Semilla en fase germ del asistente: genética obligatoria (paso 4 propagador o 6 hidro). */
  function requiereGeneticaGermEnSetup() {
    var orig =
      typeof getPremiumOrigenPlanta === 'function'
        ? getPremiumOrigenPlanta()
        : ensurePremium().origenPlanta || 'semilla';
    if (orig !== 'semilla') return false;
    if (typeof hcSetupEnFaseGerminacion === 'function' && !hcSetupEnFaseGerminacion()) {
      return false;
    }
    if (typeof hcSetupEnFaseSalaPreGerm === 'function' && hcSetupEnFaseSalaPreGerm()) {
      return false;
    }
    return true;
  }

  function paginaGeneticaGermSetup() {
    if (
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm()
    ) {
      return typeof SETUP_PAGE_PREMIUM_3 !== 'undefined' ? SETUP_PAGE_PREMIUM_3 : 4;
    }
    return typeof SETUP_PAGE_PREMIUM_6 !== 'undefined' ? SETUP_PAGE_PREMIUM_6 : 7;
  }

  function validarGeneticaGermObligatoria() {
    if (!requiereGeneticaGermEnSetup()) return true;
    persistVariedadGermFromUI();
    var vid = String(ensurePremium().variedadGerminacion || '').trim();
    var sel = el('setupPremiumVariedadGermSelect');
    var req = el('setupPremiumGeneticaGermReq');
    if (!vid) {
      if (req) {
        req.classList.remove('setup-hidden');
        req.setAttribute('role', 'alert');
        req.textContent = isGermAhoraCompactUi()
          ? 'Elige variedad.'
          : 'Obligatorio: elige la variedad del catálogo.';
      }
      if (sel) {
        sel.setAttribute('aria-invalid', 'true');
        try {
          sel.focus();
        } catch (_) {}
      }
      if (typeof showToast === 'function') {
        showToast('Elige la variedad antes de continuar', true);
      }
      return false;
    }
    if (sel) sel.removeAttribute('aria-invalid');
    if (req) req.setAttribute('role', 'note');
    return true;
  }

  function syncVariedadGermATorre(variedadId) {
    const vid = String(variedadId || '').trim();
    const p = ensurePremium();
    p.variedadGerminacion = vid;
    try {
      if (typeof setupData !== 'undefined' && setupData.premium) {
        setupData.premium.variedadGerminacion = vid;
      }
      if (typeof state !== 'undefined' && state && state.configTorre) {
        if (!state.configTorre.premiumSetup) state.configTorre.premiumSetup = {};
        state.configTorre.premiumSetup.variedadGerminacion = vid;
        if (typeof ensureGerminacionFlow === 'function') {
          const g = ensureGerminacionFlow(state.configTorre);
          g.variedadId = vid;
        }
      }
      if (typeof saveState === 'function') saveState();
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    } catch (_) {}
    if (typeof refreshPremiumNutrienteGermSection === 'function') refreshPremiumNutrienteGermSection();
  }

  function seleccionarPremiumVariedadGerminacion(variedadId) {
    const vid = String(variedadId || '').trim();
    const pref = filtroGeneticaPref();
    if (vid && typeof getCultivoDB === 'function' && typeof cultivoCoincideGeneticaPref === 'function') {
      const cu = getCultivoDB(vid);
      if (cu && pref && !cultivoCoincideGeneticaPref(cu, pref)) {
        if (typeof showToast === 'function') {
          showToast('Esa genética no encaja con foto/auto elegido en el paso anterior', true);
        }
        const sel = el('setupPremiumVariedadGermSelect');
        if (sel) sel.value = '';
        syncVariedadGermATorre('');
        renderSetupPremiumGeneticaGerm();
        return;
      }
    }
    syncVariedadGermATorre(vid);
    renderSetupPremiumGeneticaGerm();
    if (typeof hcGerminacionRenderSetupPreview === 'function') hcGerminacionRenderSetupPreview();
    if (typeof refreshDashGerminacionHub === 'function') refreshDashGerminacionHub();
    if (vid && typeof showToast === 'function' && !isGermAhoraCompactUi()) {
      const cu = typeof getCultivoDB === 'function' ? getCultivoDB(vid) : null;
      showToast('Variedad: ' + (cu && cu.nombre ? cu.nombre : vid), false);
    }
  }

  function isGermAhoraCompactUi() {
    return (
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm()
    );
  }

  function renderSetupPremiumGeneticaGerm() {
    const sec = el('setupPremiumGeneticaGermSection');
    const sel = el('setupPremiumVariedadGermSelect');
    const prev = el('setupPremiumGeneticaGermPreview');
    const filtHint = el('setupPremiumGeneticaGermFiltro');
    if (!sec) return;

    const p = ensurePremium();
    const pref = filtroGeneticaPref();
    const vid = p.variedadGerminacion || '';
    const compact = isGermAhoraCompactUi();

    if (sel && typeof listGeneticasGerminacionOptions === 'function') {
      sel.innerHTML = listGeneticasGerminacionOptions(vid, pref);
      sel.value = vid;
    }

    if (filtHint) {
      filtHint.classList.add('setup-hidden');
      filtHint.textContent = '';
    }

    if (prev) {
      prev.classList.add('setup-hidden');
      prev.innerHTML = '';
    }

    const req = el('setupPremiumGeneticaGermReq');
    const oblig = requiereGeneticaGermEnSetup();
    if (req) {
      if (compact) {
        if (oblig && !vid) {
          req.classList.remove('setup-hidden', 'setup-genetica-req--pendiente');
          req.setAttribute('role', 'alert');
          req.textContent = 'Elige variedad.';
        } else {
          req.classList.add('setup-hidden');
          req.textContent = '';
        }
      } else if (oblig && !vid) {
        req.classList.remove('setup-hidden');
        req.classList.add('setup-genetica-req--pendiente');
        req.setAttribute('role', 'note');
        req.textContent =
          'Obligatorio: elige la variedad del catálogo (coherente con foto/auto).';
      } else {
        req.classList.remove('setup-genetica-req--pendiente');
        req.classList.toggle('setup-hidden', !!vid || !oblig);
        if (!vid && !oblig) {
          req.textContent = 'Recomendado: elige la variedad ahora.';
          req.classList.remove('setup-hidden');
        }
      }
    }
    if (sel) {
      if (oblig) {
        sel.setAttribute('aria-required', 'true');
        sel.required = true;
      } else {
        sel.removeAttribute('aria-required');
        sel.required = false;
      }
    }
  }

  function refreshPremiumGeneticaGermVis() {
    const sec = el('setupPremiumGeneticaGermSection');
    if (!sec) return;
    const orig =
      typeof getPremiumOrigenPlanta === 'function'
        ? getPremiumOrigenPlanta()
        : ensurePremium().origenPlanta || 'semilla';
    const show = orig === 'semilla';
    sec.classList.toggle('setup-hidden', !show);
    if (!show) return;

    var reqTag = el('setupPremiumGeneticaGermRequiredTag');
    var oblig = requiereGeneticaGermEnSetup();
    if (reqTag) reqTag.classList.toggle('setup-hidden', !oblig);

    const p = ensurePremium();
    const pref = filtroGeneticaPref();
    if (p.variedadGerminacion && typeof getCultivoDB === 'function' && typeof cultivoCoincideGeneticaPref === 'function') {
      const cu = getCultivoDB(p.variedadGerminacion);
      if (cu && pref && !cultivoCoincideGeneticaPref(cu, pref)) {
        syncVariedadGermATorre('');
      }
    }
    renderSetupPremiumGeneticaGerm();
  }

  function persistVariedadGermFromUI() {
    const sel = el('setupPremiumVariedadGermSelect');
    if (!sel) return;
    syncVariedadGermATorre(sel.value);
  }

  window.seleccionarPremiumVariedadGerminacion = seleccionarPremiumVariedadGerminacion;
  window.renderSetupPremiumGeneticaGerm = renderSetupPremiumGeneticaGerm;
  window.refreshPremiumGeneticaGermVis = refreshPremiumGeneticaGermVis;
  window.persistVariedadGermFromUI = persistVariedadGermFromUI;
  window.syncVariedadGermATorre = syncVariedadGermATorre;
  window.requiereGeneticaGermEnSetup = requiereGeneticaGermEnSetup;
  window.validarGeneticaGermObligatoria = validarGeneticaGermObligatoria;
  window.paginaGeneticaGermSetup = paginaGeneticaGermSetup;
})();
