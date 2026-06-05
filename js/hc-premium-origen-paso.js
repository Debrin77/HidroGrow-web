/**
 * HidroGrow — paso 1 del asistente: origen semilla / clon / madre (antes de sala y equipamiento).
 */
(function () {
  'use strict';

  function el(id) {
    return document.getElementById(id);
  }

  function esc(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  var RUTAS = {
    semilla: {
      titulo: 'Semilla → floración',
      pasos: [
        'Germinador o domo (22–26 °C)',
        '6 fases en Inicio (rockwool → net pot)',
        'Traslado al DWC/RDWC',
        'Veg → flor (foto o auto)',
      ],
      equip: 'Propagador recomendado en paso Espacio · sala LED completa para veg/flor.',
    },
    clon: {
      titulo: 'Esqueje → floración',
      pasos: [
        'Corte de madre o compra de clon',
        'Domo de enraizado ~7–14 d',
        'Net pot en el depósito',
        'Veg → floración',
      ],
      equip: 'Propagador en paso Espacio · no hace falta semillero ni 6 fases de germinación.',
    },
    madre: {
      titulo: 'Madre → esquejes → floración',
      pasos: [
        'Cubo madre 18/6 permanente',
        'Cortes cada 10–14 d',
        'Enraizado en domo (como clon)',
        'Esquejes al hidro → flor',
      ],
      equip: 'Sala y depósito para madre + zona de esquejes; sin camino de semilla.',
    },
  };

  function renderOrigenFlowDiagram(origen) {
    var host = el('setupPremiumOrigenFlow');
    if (!host) return;
    host.classList.add('setup-hidden');
    host.innerHTML = '';
  }

  function persistOrigenASetupData(origen) {
    try {
      if (typeof setupData !== 'undefined') {
        setupData.origenPlanta = origen;
      }
      if (typeof state !== 'undefined' && state && state.configTorre) {
        var cfg = state.configTorre;
        if (!cfg.premiumSetup || typeof cfg.premiumSetup !== 'object') cfg.premiumSetup = {};
        cfg.premiumSetup.origenPlanta = origen;
        cfg.origenPlanta =
          typeof normalizarOrigenPlanta === 'function'
            ? normalizarOrigenPlanta(origen)
            : origen === 'clon' || origen === 'madre'
              ? origen
              : 'germinacion';
      }
    } catch (_) {}
  }

  function ocultarBannerRutaGermAhora() {
    return (
      typeof hcCaminoSemillaGermEnSetup === 'function' && hcCaminoSemillaGermEnSetup()
    );
  }

  function refreshSetupEquipOrigenBanner() {
    var box = el('setupPremiumEquipOrigenBanner');
    if (!box) return;
    if (ocultarBannerRutaGermAhora()) {
      box.classList.add('setup-hidden');
      box.innerHTML = '';
      return;
    }
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : '';
    var def = typeof getCaminoDef === 'function' ? getCaminoDef(cam) : null;
    var faseGerm =
      typeof hcSetupEnFaseGerminacion === 'function' && hcSetupEnFaseGerminacion();
    var txt = '';
    if (cam === 'semilla_propagador') {
      txt = faseGerm
        ? '<strong>Ruta: semilla en propagador.</strong> En <strong>Espacio</strong> solo domo y mat térmica → checklist → ' +
          '<strong>6 fases con registro diario</strong>. La sala va <em>después</em> de las 6 fases.'
        : '<strong>Ruta: semilla en propagador.</strong> Domo y mat térmica en Fase 1. Tras el checklist del propagador: ' +
          '<strong>configura la sala</strong>, montaje, <strong>6 fases</strong> en Inicio y luego DWC/RDWC.';
    } else if (cam === 'semilla_hidro') {
      txt = faseGerm
        ? '<strong>Ruta: semilla en hidro.</strong> Equipamiento de <strong>sala + prep cubo</strong> → montaje → ' +
          'DWC/RDWC y <strong>primer llenado</strong> → luego las 6 fases en Inicio.'
        : '<strong>Ruta: semilla en hidro.</strong> Prep en cubo → <strong>sala, montaje y primer llenado</strong> → 6 fases en Inicio → checklist operativa y matriz. ' +
          'El DWC/RDWC se configuró en el mismo asistente (no hay segundo paso hidro).';
    } else if (cam === 'esqueje_hidro') {
      txt =
        '<strong>Ruta: esqueje.</strong> <strong>Propagador</strong> para enraizar + sala y circuito hidro en este asistente.';
    } else if (cam === 'madre_hidro') {
      txt =
        '<strong>Ruta: madre.</strong> Sala y depósito para la madre (18/6); esquejes con checklist de clon.';
    } else if (def) {
      txt = '<strong>' + def.label + '</strong>';
    }
    box.classList.remove('setup-hidden');
    box.innerHTML = txt;
  }

  function refreshPremiumOrigenPasoUI() {
    if (typeof refreshCaminoCultivoUI === 'function') {
      refreshCaminoCultivoUI();
      return;
    }
    var orig =
      typeof getPremiumOrigenPlanta === 'function'
        ? getPremiumOrigenPlanta()
        : 'semilla';
    renderOrigenFlowDiagram(orig);
  }

  window.renderOrigenFlowDiagram = renderOrigenFlowDiagram;
  window.persistOrigenASetupData = persistOrigenASetupData;
  window.refreshSetupEquipOrigenBanner = refreshSetupEquipOrigenBanner;
  window.refreshPremiumOrigenPasoUI = refreshPremiumOrigenPasoUI;
})();
