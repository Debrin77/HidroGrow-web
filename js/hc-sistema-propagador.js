/**
 * Camino semilla_propagador: la pestaña Sistema muestra el propagador (no DWC/RDWC)
 * hasta cerrar el asistente hidro. Resumen semillas, sustrato, equipamiento y nutrientes.
 */
(function (global) {
  'use strict';

  function cfgActiva() {
    return typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
  }

  function esc(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  /** Propagador como «sistema» activo hasta DWC/RDWC confirmado. */
  function hcMostrarSistemaPropagador(cfg) {
    cfg = cfg || cfgActiva();
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam !== 'semilla_propagador') return false;
    if (typeof hidroInstalacionCerrada === 'function' && hidroInstalacionCerrada(cfg)) {
      return false;
    }
    return true;
  }

  function etiquetaSustrato(cfg) {
    var key = cfg.sustrato || cfg.configSustrato || '';
    if (!key && cfg.premiumSetup && cfg.premiumSetup.sustratoGerm) {
      key = cfg.premiumSetup.sustratoGerm;
    }
    var map = {
      lana: 'Lana de roca',
      esponja: 'Esponja / jiffy',
      tierra: 'Sustrato ligero',
      coco: 'Coco',
    };
    return map[key] || (key ? String(key) : 'No indicado en el asistente');
  }

  function resumenPropagadorInstalado(cfg) {
    var inst = cfg.equipamientoInstalado || {};
    var p = inst.propagador;
    if (p && p.marca) {
      return esc(p.marca + (p.modelo ? ' ' + p.modelo : ''));
    }
    var g =
      typeof ensureGerminacionFlow === 'function' ? ensureGerminacionFlow(cfg) : null;
    if (g && g.equip && g.equip.domo) return 'Domo / propagador (equip. marcado)';
    return 'Configura marca en el asistente o marca «domo» en Germinación';
  }

  function htmlNutrientesGerm(g) {
    var rows = [];
    if (Array.isArray(g.nutrientesAplicados)) rows = g.nutrientesAplicados.slice(0, 12);
    (g.registroDiario || []).forEach(function (r) {
      if (r.nutProducto || r.nutEc != null || r.nutPh != null) {
        rows.push({
          fecha: r.fecha || r.fechaIso,
          producto: r.nutProducto,
          ec: r.nutEc,
          ph: r.nutPh,
          ml: r.nutMl,
          nota: r.nota,
        });
      }
    });
    if (!rows.length) {
      return (
        '<p class="hc-sis-prop-nut-empty setup-field-hint">Sin nutrientes registrados en el agua del propagador. ' +
        'Anótalos en el registro diario (Inicio o abajo en Medir → Germinación).</p>'
      );
    }
    return (
      '<ul class="hc-sis-prop-nut-list">' +
      rows
        .map(function (n) {
          var det = [];
          if (n.producto) det.push(esc(n.producto));
          if (n.ec != null && n.ec !== '') det.push('EC ' + esc(String(n.ec)));
          if (n.ph != null && n.ph !== '') det.push('pH ' + esc(String(n.ph)));
          if (n.ml != null && n.ml !== '') det.push(esc(String(n.ml)) + ' ml');
          return (
            '<li><span class="hc-sis-prop-nut-meta">' +
            esc(n.fecha || '') +
            '</span> ' +
            (det.length ? det.join(' · ') : esc(n.nota || 'Aporte')) +
            '</li>'
          );
        })
        .join('') +
      '</ul>'
    );
  }

  function htmlAvisoHidro(cfg) {
    if (typeof germinacionConcluida !== 'function' || !germinacionConcluida(cfg)) {
      return (
        '<div class="hc-sis-prop-alerta setup-field-hint setup-field-hint--banner" role="status">' +
        '<strong>Modo propagador.</strong> Completa el seguimiento diario. Cuando la germinación esté lista por días, ' +
        'márcala como concluida en <button type="button" class="btn btn-link btn-sm" onclick="goTab(\'inicio\');setTimeout(function(){document.getElementById(\'dashGerminacionHub\')?.scrollIntoView({behavior:\'smooth\'})},200)">Inicio → Germinación</button>.</div>'
      );
    }
    if (typeof hcCaminoRequiereConfigHidroPendiente === 'function' && hcCaminoRequiereConfigHidroPendiente(cfg)) {
      return (
        '<div class="hc-sis-prop-alerta hc-sis-prop-alerta--hidro setup-field-hint setup-field-hint--banner" role="alert">' +
        '<strong>Germinación concluida · Configura el sistema hidropónico</strong> para el traslado del propagador al DWC/RDWC. ' +
        'Después verificarás sala (opcional) y puesta en marcha.' +
        '<button type="button" class="btn btn-primary btn-sm" style="margin-left:8px" onclick="typeof abrirSetupFaseHidro===\'function\'&&abrirSetupFaseHidro()">Asistente DWC/RDWC</button></div>'
      );
    }
    return '';
  }

  function hcRefreshSistemaPropagadorPanel() {
    var cfg = cfgActiva();
    var panel = document.getElementById('hcSistemaPropagadorPanel');
    var torreWrap = document.getElementById('torreSVGWrap');
    var torreCard = document.getElementById('torreNombreCard');
    var resumenSup = document.querySelector('#tab-sistema .torre-tab-resumen-superior');
    var dwcCard = document.getElementById('sistemaDwcAyudaCard');
    var activo = hcMostrarSistemaPropagador(cfg);

    if (!panel) return;

    if (!activo) {
      panel.classList.add('setup-hidden');
      panel.innerHTML = '';
      if (torreWrap) torreWrap.classList.remove('setup-hidden');
      if (torreCard) torreCard.classList.remove('setup-hidden');
      if (resumenSup) resumenSup.classList.remove('setup-hidden');
      if (dwcCard) dwcCard.style.display = '';
      var gate = document.getElementById('hcSistemaFasePropagadorGate');
      if (gate) gate.classList.add('setup-hidden');
      return;
    }

    var g = typeof ensureGerminacionFlow === 'function' ? ensureGerminacionFlow(cfg) : {};
    var tray =
      typeof renderGermTrayViz === 'function'
        ? renderGermTrayViz(g)
        : '<p class="setup-field-hint">Gráfico del propagador en Inicio → Germinación.</p>';
    var diaN =
      typeof diasDesdeInicio === 'function' ? diasDesdeInicio(g) + 1 : 1;
    var concl =
      typeof germinacionConcluida === 'function' && germinacionConcluida(cfg);

    panel.classList.remove('setup-hidden');
    panel.innerHTML =
      '<section class="hc-sis-prop card" aria-label="Sistema propagador">' +
      '<h2 class="hc-sis-prop-title">🫧 Sistema · propagador</h2>' +
      '<p class="hc-sis-prop-lead">Esta instalación está en <strong>germinación en propagador</strong>. ' +
      'Sala es opcional hasta que decidas trasladar al hidro. El esquema DWC/RDWC aparecerá al configurar el sistema.</p>' +
      htmlAvisoHidro(cfg) +
      '<div class="hc-sis-prop-grid">' +
      '<div class="hc-sis-prop-stat"><span class="hc-sis-prop-stat-lbl">Propagador</span><strong>' +
      resumenPropagadorInstalado(cfg) +
      '</strong></div>' +
      '<div class="hc-sis-prop-stat"><span class="hc-sis-prop-stat-lbl">Semillas</span><strong>' +
      esc(String(g.numSemillas || 1)) +
      '</strong> <span class="hc-sis-prop-stat-sub">(' +
      esc(String(g.semillasActivas != null ? g.semillasActivas : g.numSemillas)) +
      ' activas)</span></div>' +
      '<div class="hc-sis-prop-stat"><span class="hc-sis-prop-stat-lbl">Sustrato</span><strong>' +
      esc(etiquetaSustrato(cfg)) +
      '</strong></div>' +
      '<div class="hc-sis-prop-stat"><span class="hc-sis-prop-stat-lbl">Seguimiento</span><strong>Día ' +
      esc(String(diaN)) +
      '</strong>' +
      (concl ? ' · <span class="hc-sis-prop-ok">Concluida</span>' : '') +
      '</div></div>' +
      tray +
      '<div class="hc-sis-prop-nut">' +
      '<h3 class="hc-sis-prop-subtitle">Nutrientes en el agua (germinación)</h3>' +
      htmlNutrientesGerm(g) +
      '</div>' +
      '<p class="hc-sis-prop-foot">' +
      '<button type="button" class="btn btn-secondary btn-sm" onclick="goTab(\'inicio\');setTimeout(function(){document.getElementById(\'dashGerminacionHub\')?.scrollIntoView({behavior:\'smooth\'})},200)">Registro diario</button> ' +
      '<button type="button" class="btn btn-ghost btn-sm" onclick="typeof hcOpenPropagadorMontajeChecklist===\'function\'&&hcOpenPropagadorMontajeChecklist()">Checklist propagador</button></p>' +
      '</section>';

    if (torreWrap) torreWrap.classList.add('setup-hidden');
    if (torreCard) torreCard.classList.add('setup-hidden');
    if (resumenSup) resumenSup.classList.add('setup-hidden');
    if (dwcCard) {
      dwcCard.style.display = 'none';
      dwcCard.hidden = true;
    }
    var gate = document.getElementById('hcSistemaFasePropagadorGate');
    if (gate) gate.classList.add('setup-hidden');
  }

  global.hcMostrarSistemaPropagador = hcMostrarSistemaPropagador;
  global.hcRefreshSistemaPropagadorPanel = hcRefreshSistemaPropagadorPanel;
})(typeof window !== 'undefined' ? window : globalThis);
