/**
 * HidroGrow — guía multi-instalación para usuarios inexpertos.
 * Germinación / esquejes / veg / flor como sistemas separados (opcional).
 */
(function (global) {
  'use strict';

  var COACH_KEY = 'hcMultiSystemCoachDismissed';
  var PRIMER_KEY = 'hcNuevoSistemaPrimerSeen';

  var ESCENARIOS = [
    { emoji: '🌱', name: 'Germinación / domo', hint: 'Referencia EC; no necesita cubo DWC salvo que uses uno dedicado.' },
    { emoji: '✂️', name: 'Esquejes / madre', hint: 'Clon en cubo o bandeja; EC baja y HR alta.' },
    { emoji: '🌿', name: 'Vegetativo 18/6', hint: 'Sala de crecimiento; una instalación con fase vegetativo.' },
    { emoji: '🌸', name: 'Floración 12/12', hint: 'Otra instalación con fase flor; datos y EC independientes.' },
  ];

  function getTorresCount() {
    return typeof state !== 'undefined' && state && state.torres ? state.torres.length : 0;
  }

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderCoachBanner(hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;
    if (getTorresCount() < 2) {
      host.classList.add('setup-hidden');
      host.innerHTML = '';
      return;
    }
    try {
      if (localStorage.getItem(COACH_KEY) === '1') {
        host.classList.add('setup-hidden');
        return;
      }
    } catch (_) {}
    var activa =
      typeof state !== 'undefined' && state && state.torres && state.torres[state.torreActiva]
        ? state.torres[state.torreActiva].nombre
        : 'Instalación';
    host.classList.remove('setup-hidden');
    host.innerHTML =
      '<div class="hc-multi-coach-inner">' +
      '<p class="hc-multi-coach-text"><strong>Tienes varios sistemas.</strong> EC, checklist, riego y mediciones usan la instalación activa: <em>' +
      escHtml(activa) +
      '</em>. Cámbiala antes de medir otra sala.</p>' +
      '<button type="button" class="btn btn-sm btn-ghost hc-multi-coach-btn" onclick="hcDismissMultiSystemCoach()">Entendido</button>' +
      '<button type="button" class="btn btn-sm btn-secondary hc-multi-coach-btn" onclick="abrirSelectorTorres()">Cambiar ›</button>' +
      '</div>';
  }

  function refreshMultiSystemCoach() {
    renderCoachBanner('hcMultiCoachInicio');
    renderCoachBanner('hcMultiCoachMedir');
  }

  function dismissCoach() {
    try {
      localStorage.setItem(COACH_KEY, '1');
    } catch (_) {}
    refreshMultiSystemCoach();
  }

  function renderNuevoSistemaPrimer() {
    var body = document.getElementById('nuevoSistemaPrimerBody');
    if (!body) return;
    var n = getTorresCount();
    body.innerHTML =
      '<p class="hc-nuevo-sis-lead">Cada instalación guarda <strong>sus propias</strong> mediciones, plantas, nutriente y clima. Puedes mezclar DWC y RDWC.</p>' +
      '<p class="hc-nuevo-sis-lead">Ejemplos de nombres claros:</p>' +
      '<ul class="hc-nuevo-sis-list">' +
      ESCENARIOS.map(function (s) {
        return (
          '<li><span class="hc-nuevo-sis-emoji" aria-hidden="true">' +
          s.emoji +
          '</span><span><strong>' +
          escHtml(s.name) +
          '</strong><br><span class="hc-nuevo-sis-hint">' +
          escHtml(s.hint) +
          '</span></span></li>'
        );
      }).join('') +
      '</ul>' +
      (n > 0
        ? '<p class="hc-nuevo-sis-note">Instalaciones actuales: <strong>' +
          n +
          '</strong>. Tras configurar, cambia entre ellas con «Cambiar ›» en Inicio o Medir.</p>'
        : '');
  }

  function openNuevoSistemaPrimer(thenFn) {
    var modal = document.getElementById('modalNuevoSistema');
    if (!modal) {
      if (typeof thenFn === 'function') thenFn();
      return;
    }
    renderNuevoSistemaPrimer();
    modal._hcThen = thenFn;
    modal.classList.add('open');
  }

  function closeNuevoSistemaPrimer(ev) {
    if (ev && ev.target !== ev.currentTarget) return;
    var modal = document.getElementById('modalNuevoSistema');
    if (!modal) return;
    modal.classList.remove('open');
    try {
      localStorage.setItem(PRIMER_KEY, '1');
    } catch (_) {}
    var thenFn = modal._hcThen;
    modal._hcThen = null;
    if (typeof thenFn === 'function') thenFn();
  }

  function confirmNuevoSistemaPrimer() {
    closeNuevoSistemaPrimer();
  }

  function wrapAbrirSetupNuevaTorre() {
    var orig = global.abrirSetupNuevaTorre;
    if (typeof orig !== 'function' || orig._hcMultiWrapped) return;
    function wrapped() {
      openNuevoSistemaPrimer(function () {
        orig.apply(global, arguments);
      });
    }
    wrapped._hcMultiWrapped = true;
    global.abrirSetupNuevaTorre = wrapped;
  }

  document.addEventListener('DOMContentLoaded', function () {
    wrapAbrirSetupNuevaTorre();
    refreshMultiSystemCoach();
  });

  global.hcRefreshMultiSystemCoach = refreshMultiSystemCoach;
  global.hcDismissMultiSystemCoach = dismissCoach;
  global.hcCloseNuevoSistemaPrimer = closeNuevoSistemaPrimer;
  global.hcConfirmNuevoSistemaPrimer = confirmNuevoSistemaPrimer;
})(typeof window !== 'undefined' ? window : globalThis);
