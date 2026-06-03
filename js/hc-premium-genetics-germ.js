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
    if (vid && typeof showToast === 'function') {
      const cu = typeof getCultivoDB === 'function' ? getCultivoDB(vid) : null;
      showToast('Genética: ' + (cu && cu.nombre ? cu.nombre : vid), false);
    }
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

    if (sel && typeof listGeneticasGerminacionOptions === 'function') {
      sel.innerHTML = listGeneticasGerminacionOptions(vid, pref);
      sel.value = vid;
    }

    if (filtHint) {
      filtHint.textContent =
        pref === 'auto'
          ? 'Lista filtrada: solo autoflorecientes (coherente con el paso «Genética y método»).'
          : pref === 'foto'
            ? 'Lista filtrada: fotoperiódicas (sin autos).'
            : 'Todas las genéticas del catálogo.';
    }

    if (prev) {
      prev.innerHTML =
        vid && typeof renderGerminacionGeneticsCardHtml === 'function'
          ? renderGerminacionGeneticsCardHtml(vid)
          : '<p class="setup-field-hint">Sin genética elegida: en Inicio podrás elegirla, pero conviene definirla aquí.</p>';
    }

    const req = el('setupPremiumGeneticaGermReq');
    if (req) {
      req.classList.toggle('setup-hidden', !!vid);
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
})();
