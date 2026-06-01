/**
 * HidroGrow — checklist de puesta en marcha (montaje, accesorios, IoT opcional).
 * Separado del checklist de recarga de nutrientes.
 */
(function (global) {
  'use strict';

  var ITEMS = [
    {
      id: 'sistema',
      label: 'Sistema hidro configurado',
      hint: 'Asistente completado: DWC/RDWC, litros, cestas y nutriente.',
      auto: true,
    },
    {
      id: 'led',
      label: 'LED / lámpara instalada y encendida',
      hint: 'Altura y fotoperiodo según fase (18/6 veg, 12/12 flor).',
    },
    {
      id: 'extractor',
      label: 'Extractor e intracción de aire',
      hint: 'Renovación de aire y temperatura bajo control.',
    },
    {
      id: 'aireador',
      label: 'Aireador / bomba de depósito OK',
      hint: 'Burbujeo uniforme; en RDWC también bomba de recirculación.',
    },
    {
      id: 'medidor',
      label: 'Medidor EC/pH calibrado',
      hint: 'Solución buffer 4,0 / 7,0 (pH) y estándar EC si aplica.',
    },
    {
      id: 'fugas',
      label: 'Tuberías y conexiones sin fugas',
      hint: 'Especialmente en RDWC: revisar racores y nivel.',
    },
    {
      id: 'nombre',
      label: 'Instalación con nombre claro',
      hint: 'Si tienes varias salas: «Veg», «Flor», «Esquejes»…',
      autoNombre: true,
    },
    {
      id: 'iot',
      label: 'Gateway WiFi IoT probado (opcional)',
      hint: 'Solo si usas sensores. Si no, ignora este punto.',
      optional: true,
    },
  ];

  function getChecks(cfg) {
    cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
    if (!cfg.puestaMarchaChecks || typeof cfg.puestaMarchaChecks !== 'object') {
      cfg.puestaMarchaChecks = {};
    }
    return cfg.puestaMarchaChecks;
  }

  function saveChecks(checks) {
    if (typeof state === 'undefined' || !state || !state.configTorre) return;
    state.configTorre.puestaMarchaChecks = checks;
    try {
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
      if (typeof saveState === 'function') saveState();
    } catch (_) {}
  }

  function isAutoDone(item, cfg) {
    if (item.id === 'sistema') {
      return !!(cfg && cfg.checklistInstalacionConfirmada);
    }
    if (item.autoNombre) {
      var t =
        typeof getTorreActiva === 'function'
          ? getTorreActiva()
          : state && state.torres
            ? state.torres[state.torreActiva || 0]
            : null;
      var n = t && t.nombre ? String(t.nombre).trim() : '';
      return n.length > 2 && n.toLowerCase() !== 'instalación';
    }
    return false;
  }

  function countProgress(checks, cfg) {
    var done = 0;
    var total = 0;
    ITEMS.forEach(function (it) {
      if (it.optional) return;
      total++;
      if (checks[it.id] || isAutoDone(it, cfg)) done++;
    });
    return { done: done, total: total };
  }

  function renderPuestaMarchaBody() {
    var host = document.getElementById('puestaMarchaBody');
    if (!host) return;
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) || {};
    var checks = getChecks(cfg);
    var prog = countProgress(checks, cfg);

    host.innerHTML =
      '<p class="hc-pm-lead">Revisa el montaje <strong>una vez</strong> por instalación. No sustituye al checklist de <strong>recarga de nutrientes</strong>.</p>' +
      '<p class="hc-pm-prog">' +
      prog.done +
      '/' +
      prog.total +
      ' puntos esenciales</p>' +
      '<ul class="hc-pm-list">' +
      ITEMS.map(function (it) {
        var auto = isAutoDone(it, cfg);
        var checked = auto || !!checks[it.id];
        return (
          '<li class="hc-pm-item' +
          (it.optional ? ' hc-pm-item--opt' : '') +
          '">' +
          '<label class="hc-pm-lbl">' +
          '<input type="checkbox" data-pm-id="' +
          it.id +
          '"' +
          (checked ? ' checked' : '') +
          (auto ? ' disabled' : '') +
          ' onchange="hcPuestaMarchaToggle(\'' +
          it.id +
          '\', this.checked)">' +
          '<span><strong>' +
          it.label +
          '</strong>' +
          (it.optional ? ' <span class="hc-pm-opt">(opcional)</span>' : '') +
          '<br><span class="hc-pm-hint">' +
          it.hint +
          '</span></span></label></li>'
        );
      }).join('') +
      '</ul>';
  }

  function buildPuestaMarchaInlineHtml(cfg, checks, prog, verificada) {
    return (
      '<p class="hc-pm-inline-lead">Revisa el montaje <strong>una vez</strong> por instalación (DWC/RDWC, aire, LED, medidor…). No sustituye al checklist de recarga de nutrientes.</p>' +
      '<p class="hc-pm-prog">' +
      (verificada ? '✓ Puesta en marcha verificada · ' : '') +
      prog.done +
      '/' +
      prog.total +
      ' puntos esenciales</p>' +
      '<ul class="hc-pm-list hc-pm-list--inline">' +
      ITEMS.map(function (it) {
        if (it.optional) return '';
        var auto = isAutoDone(it, cfg);
        var checked = auto || !!checks[it.id];
        return (
          '<li class="hc-pm-item hc-pm-item--inline' +
          (checked ? ' hc-pm-item--done' : '') +
          '">' +
          '<span class="hc-pm-inline-mark" aria-hidden="true">' +
          (checked ? '✓' : '○') +
          '</span> ' +
          it.label +
          '</li>'
        );
      }).join('') +
      '</ul>' +
      '<p class="hc-pm-inline-actions">' +
      '<button type="button" class="btn btn-secondary btn-sm hc-btn-puesta-marcha" onclick="hcOpenPuestaMarchaChecklist()">' +
      (verificada ? '✓ Puesta en marcha verificada' : 'Abrir checklist de montaje') +
      '</button></p>'
    );
  }

  function renderPuestaMarchaInlinePreview() {
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) || {};
    var checks = getChecks(cfg);
    var prog = countProgress(checks, cfg);
    var verificada = !!checks.completedAt;
    var html = buildPuestaMarchaInlineHtml(cfg, checks, prog, verificada);
    ['sistemaMontajeChecksBody', 'hcMontajeInicioBody'].forEach(function (id) {
      var host = document.getElementById(id);
      if (host) host.innerHTML = html;
    });
  }

  function refreshPuestaMarchaUi() {
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) || {};
    var checks = getChecks(cfg);
    var prog = countProgress(checks, cfg);
    var verificada = !!checks.completedAt;
    var btnTxt = verificada ? '✓ Puesta en marcha verificada' : 'Verificar puesta en marcha';
    document.querySelectorAll('.hc-btn-puesta-marcha').forEach(function (btn) {
      btn.textContent = btnTxt;
      btn.classList.toggle('hc-btn-puesta-marcha--ok', verificada);
      btn.setAttribute('aria-pressed', verificada ? 'true' : 'false');
    });
    var status = document.getElementById('medirPuestaMarchaStatus');
    if (status) {
      status.textContent = verificada
        ? 'Puesta en marcha verificada para esta instalación (' + prog.total + '/' + prog.total + ' puntos).'
        : prog.done + '/' + prog.total + ' puntos esenciales · revisa montaje, aireación y accesorios.';
    }
    var kicker = document.getElementById('medirPuestaMarchaKicker');
    if (kicker) {
      kicker.textContent = verificada ? '✓ Puesta en marcha verificada' : 'Montaje de la instalación activa';
    }
    var card = document.getElementById('medirPuestaMarchaCard');
    if (card) card.classList.toggle('medir-pm-card--ok', verificada);
    var resumen = document.getElementById('sistemaMontajeChecksResumen');
    if (resumen) {
      resumen.textContent = verificada
        ? '✓ Verificada'
        : prog.done + '/' + prog.total + ' esenciales';
    }
    var inicioSub = document.getElementById('hcMontajeInicioSub');
    if (inicioSub) {
      inicioSub.textContent = verificada
        ? '✓ Verificada · ' + prog.total + '/' + prog.total
        : prog.done + '/' + prog.total + ' esenciales';
    }
    var modalTitle = document.getElementById('puestaMarchaTitle');
    if (modalTitle) {
      modalTitle.textContent = verificada ? '✓ Puesta en marcha verificada' : 'Puesta en marcha';
    }
    renderPuestaMarchaInlinePreview();
  }

  function openPuestaMarchaChecklist() {
    var modal = document.getElementById('modalPuestaMarcha');
    if (!modal) return;
    renderPuestaMarchaBody();
    modal.classList.add('open');
  }

  function closePuestaMarchaChecklist(ev) {
    if (ev && ev.target !== ev.currentTarget) return;
    var modal = document.getElementById('modalPuestaMarcha');
    if (modal) modal.classList.remove('open');
  }

  function toggleItem(id, checked) {
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) || {};
    var checks = Object.assign({}, getChecks(cfg));
    checks[id] = !!checked;
    if (checked) checks[id + 'At'] = new Date().toISOString();
    saveChecks(checks);
    renderPuestaMarchaBody();
    refreshPuestaMarchaUi();
  }

  function finishPuestaMarcha() {
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) || {};
    var checks = getChecks(cfg);
    var prog = countProgress(checks, cfg);
    if (prog.done < prog.total) {
      if (typeof showToast === 'function') {
        showToast('Marca los puntos esenciales antes de finalizar (' + prog.done + '/' + prog.total + ').', true);
      }
      return;
    }
    checks.completedAt = new Date().toISOString();
    saveChecks(checks);
    closePuestaMarchaChecklist();
    refreshPuestaMarchaUi();
    if (typeof showToast === 'function') showToast('✓ Puesta en marcha verificada para esta instalación.');
  }

  function maybeOfferAfterSetup() {
    var cfg = (typeof state !== 'undefined' && state && state.configTorre) || {};
    var checks = getChecks(cfg);
    if (checks.completedAt) return;
    setTimeout(function () {
      if (typeof showToast === 'function') {
        showToast('💡 Revisa montaje y accesorios: «Verificar puesta en marcha» en Cultivo e instalación.', false);
      }
    }, 2500);
  }

  global.hcOpenPuestaMarchaChecklist = openPuestaMarchaChecklist;
  global.hcClosePuestaMarchaChecklist = closePuestaMarchaChecklist;
  global.hcPuestaMarchaToggle = toggleItem;
  global.hcFinishPuestaMarcha = finishPuestaMarcha;
  global.hcMaybeOfferPuestaMarcha = maybeOfferAfterSetup;
  global.hcRefreshPuestaMarchaUi = refreshPuestaMarchaUi;
})(typeof window !== 'undefined' ? window : globalThis);
