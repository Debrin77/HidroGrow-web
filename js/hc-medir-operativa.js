/**
 * Medir / Mediciones en modo operativo: seguimiento diario (manual o IoT)
 * tras montaje + primer llenado. Enlaza tareas, rangos del sistema, calendario e historial.
 */
(function (global) {
  'use strict';

  function getLc() {
    return typeof getInstalacionLifecycle === 'function' ? getInstalacionLifecycle() : { operativaDiaria: true, fase: 'operativa' };
  }

  function esc(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function buildRangosHtml(cfg) {
    var parts = [];
    try {
      if (typeof getECOptimaTorre === 'function') {
        var ec = getECOptimaTorre();
        if (ec && ec.min != null && ec.max != null) {
          parts.push('<span class="medir-op-hub-chip"><strong>EC</strong> ' + ec.min + '–' + ec.max + ' µS/cm</span>');
        }
      }
    } catch (_) {}
    try {
      var nut = typeof getNutrienteTorre === 'function' ? getNutrienteTorre() : null;
      if (nut && typeof torreGetPhRangoObjetivo === 'function') {
        var phR = torreGetPhRangoObjetivo(nut, cfg);
        if (phR && phR.length >= 2) {
          parts.push('<span class="medir-op-hub-chip"><strong>pH</strong> ' + phR[0] + '–' + phR[1] + '</span>');
        }
      }
    } catch (_) {}
    try {
      if (typeof getVolumenDepositoMaxLitros === 'function') {
        var vmax = getVolumenDepositoMaxLitros(cfg);
        if (vmax != null && Number.isFinite(vmax) && vmax > 0) {
          parts.push('<span class="medir-op-hub-chip"><strong>Depósito</strong> ' + vmax + ' L</span>');
        }
      }
    } catch (_) {}
    try {
      var tipo =
        typeof tipoInstalacionNormalizado === 'function'
          ? tipoInstalacionNormalizado(cfg)
          : cfg.tipoInstalacion || '';
      if (tipo) {
        var lab =
          typeof etiquetaSistemaHidroponicoBreve === 'function'
            ? etiquetaSistemaHidroponicoBreve(cfg)
            : String(tipo).toUpperCase();
        parts.push('<span class="medir-op-hub-chip"><strong>Sistema</strong> ' + esc(lab) + '</span>');
      }
    } catch (_) {}
    if (!parts.length) return '';
    return '<div class="medir-op-hub-rangos-inner">' + parts.join('') + '</div>';
  }

  function scrollToMedirEntrada() {
    var flow = document.getElementById('medirFlow');
    if (flow && typeof flow.scrollIntoView === 'function') {
      flow.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(function () {
      var ec = document.getElementById('inputEC');
      if (ec) ec.focus();
    }, 400);
  }

  function medicionesOperativasPermitidas() {
    return !!getLc().operativaDiaria;
  }

  var TABS_POST_OPERATIVA = ['riego', 'meteo'];

  function refreshTabsOperativaUi() {
    var operativa = medicionesOperativasPermitidas();
    TABS_POST_OPERATIVA.forEach(function (t) {
      var btn = document.getElementById('btn-' + t);
      if (btn) btn.classList.toggle('setup-hidden', !operativa);
    });
    var tabActiva =
      typeof currentTab !== 'undefined' && currentTab ? currentTab : null;
    if (!tabActiva) {
      TABS_POST_OPERATIVA.some(function (t) {
        var panel = document.getElementById('tab-' + t);
        if (panel && panel.classList.contains('active')) {
          tabActiva = t;
          return true;
        }
        return false;
      });
    }
    if (!operativa && tabActiva && TABS_POST_OPERATIVA.indexOf(tabActiva) >= 0) {
      try {
        if (typeof goTab === 'function') goTab('inicio');
      } catch (_) {}
    }
  }

  function refreshMedirOperativaUi() {
    var lc = getLc();
    var operativa = !!lc.operativaDiaria;
    var pendiente = !operativa && lc.fase !== 'sin_config';
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};

    var preGate = document.getElementById('medirPreOperativaGate');
    var hub = document.getElementById('medirOperativaHub');
    var flow = document.getElementById('medirFlow');
    var pmCard = document.getElementById('medirPuestaMarchaCard');
    var monitorCard = document.getElementById('medirMonitorCard');
    var guiaCard = document.getElementById('medirGuiaDiaCard');

    if (preGate) {
      preGate.classList.toggle('setup-hidden', !pendiente);
      if (pendiente) {
        var nextEl = document.getElementById('medirPreOperativaNext');
        var ctaEl = document.getElementById('medirPreOperativaCta');
        if (nextEl && lc.siguientePaso) {
          nextEl.innerHTML = 'Pendiente: <strong>' + esc(lc.siguientePaso.label) + '</strong> (' + lc.porcentaje + '% instalación).';
        }
        if (ctaEl && lc.siguientePaso) {
          ctaEl.textContent = lc.siguientePaso.label;
          ctaEl.onclick = function () {
            if (typeof hcEjecutarAccionInstalacion === 'function') {
              hcEjecutarAccionInstalacion(lc.siguientePaso.action);
            }
          };
        }
      }
    }

    if (hub) {
      hub.classList.toggle('setup-hidden', !operativa);
      if (operativa) {
        var sub = document.getElementById('medirOpHubSub');
        var rangos = document.getElementById('medirOpHubRangos');
        var badge = document.getElementById('medirOpHubTareasBadge');
        var nut = typeof getNutrienteTorre === 'function' ? getNutrienteTorre() : null;
        if (sub) {
          sub.textContent =
            'EC, pH, temperatura y volumen según tu ' +
            (nut ? nut.nombre : 'nutriente') +
            ' configurado.';
        }
        if (rangos) rangos.innerHTML = buildRangosHtml(cfg);
        try {
          if (typeof getEstadoControlSistema === 'function') {
            var est = getEstadoControlSistema();
            if (est && est.resumen && badge) {
              var tot = est.resumen.diarioTotal + est.resumen.semanalTotal;
              var ok = est.resumen.diarioOk + est.resumen.semanalOk;
              badge.textContent = ok + '/' + tot;
              badge.classList.toggle('medir-tareas-badge--ok', tot > 0 && ok >= tot);
              badge.classList.toggle('medir-tareas-badge--pend', tot > 0 && ok < tot);
            }
          }
        } catch (_) {}
        var iotEl = document.getElementById('medirOpHubIot');
        if (iotEl) {
          var iotTxt = 'Manual';
          try {
            if (typeof hcIotGetCalendarContext === 'function') {
              var iot = hcIotGetCalendarContext();
              if (iot && iot.linked) iotTxt = 'Gateway IoT vinculado';
            }
          } catch (_) {}
          iotEl.textContent = iotTxt;
        }
      }
    }

    if (flow) {
      flow.classList.toggle('medir-flow--pre-operativa', !!pendiente);
      flow.setAttribute('aria-hidden', pendiente ? 'true' : 'false');
      var lead = flow.querySelector('.medir-flow-lead');
      if (lead) {
        lead.innerHTML = operativa
          ? 'Registra los parámetros del <strong>depósito configurado</strong> (EC, pH, T°, volumen). Evaluación al instante frente a los rangos de tu instalación.'
          : 'Introduce los valores del <strong>depósito</strong> o pega la lectura del medidor. Evaluación al instante.';
      }
    }

    if (pmCard) {
      var ocultarPm = operativa || lc.fase === 'sin_config';
      pmCard.classList.toggle('setup-hidden', !!ocultarPm);
    }

    if (monitorCard) monitorCard.classList.toggle('medir-monitor-card--operativa', operativa);
    if (guiaCard) guiaCard.classList.toggle('medir-guia-card--operativa', operativa);

    try {
      if (typeof actualizarRangosParametrosMedir === 'function') actualizarRangosParametrosMedir(cfg);
    } catch (_) {}
    refreshTabsOperativaUi();
  }

  function avisarPrimeraMedicionOperativa() {
    if (typeof showToast === 'function') {
      showToast(
        '✓ Instalación operativa. Registra tu primera medición diaria en Medir (manual o IoT).',
        false,
        { durationMs: 6200, prominent: true }
      );
    }
  }

  function hcIrRutinaDiaOperativa() {
    try {
      if (typeof goTab === 'function') goTab('mediciones');
    } catch (_) {}
    setTimeout(function () {
      refreshMedirOperativaUi();
      try {
        if (typeof renderMonitorSistemaPanel === 'function') renderMonitorSistemaPanel();
        if (typeof refreshMedirTareasHoyBadge === 'function') refreshMedirTareasHoyBadge();
      } catch (_) {}
      var lc = getLc();
      if (lc.operativaDiaria) scrollToMedirEntrada();
    }, 160);
  }

  global.refreshMedirOperativaUi = refreshMedirOperativaUi;
  global.refreshTabsOperativaUi = refreshTabsOperativaUi;
  global.medicionesOperativasPermitidas = medicionesOperativasPermitidas;
  global.scrollToMedirEntrada = scrollToMedirEntrada;
  global.avisarPrimeraMedicionOperativa = avisarPrimeraMedicionOperativa;
  global.hcIrRutinaDiaOperativa = hcIrRutinaDiaOperativa;

  function refreshAyudaInstalacionUi() {
    var box = document.getElementById('ayudaEstadoInstalacion');
    if (!box || typeof getInstalacionLifecycle !== 'function') return;
    var lc = getInstalacionLifecycle();
    if (!lc || lc.fase === 'sin_config') {
      box.classList.add('setup-hidden');
      box.textContent = '';
      return;
    }
    box.classList.remove('setup-hidden');
    if (lc.operativaDiaria) {
      box.innerHTML =
        '<strong>Estado:</strong> instalación operativa · usa <button type="button" class="btn btn-link btn-sm" onclick="hcIrRutinaDiaOperativa()">Medir</button> para la rutina diaria.';
    } else {
      box.innerHTML =
        '<strong>Instalación al ' +
        lc.porcentaje +
        '%.</strong> Pendiente: <em>' +
        (lc.siguientePaso ? lc.siguientePaso.label : '—') +
        '</em>. <button type="button" class="btn btn-link btn-sm" onclick="hcEjecutarAccionInstalacion(\'' +
        (lc.siguientePaso && lc.siguientePaso.action ? lc.siguientePaso.action : 'irMontaje') +
        '\')">Continuar</button>';
    }
  }

  global.refreshAyudaInstalacionUi = refreshAyudaInstalacionUi;
})(typeof window !== 'undefined' ? window : globalThis);
