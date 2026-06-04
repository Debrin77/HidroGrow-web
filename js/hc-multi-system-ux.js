/**
 * HidroGrow — multi-instalación (selector de torres).
 * Modal «Otra instalación» y coach desactivados (molestaban en cada arranque/nueva ranura).
 */
(function (global) {
  'use strict';

  function refreshMultiSystemCoach() {
    ['hcMultiCoachInicio', 'hcMultiCoachMedir'].forEach(function (id) {
      var host = document.getElementById(id);
      if (!host) return;
      host.classList.add('setup-hidden');
      host.innerHTML = '';
    });
  }

  function dismissCoach() {
    refreshMultiSystemCoach();
  }

  /** Sin modal: ir directo a la acción. */
  function openNuevoSistemaPrimer(thenFn) {
    if (typeof thenFn === 'function') thenFn();
  }

  function closeNuevoSistemaPrimer(ev) {
    if (ev && ev.target !== ev.currentTarget) return;
    var modal = document.getElementById('modalNuevoSistema');
    if (modal) modal.classList.remove('open');
  }

  function confirmNuevoSistemaPrimer() {
    closeNuevoSistemaPrimer();
  }

  global.hcRefreshMultiSystemCoach = refreshMultiSystemCoach;
  global.hcDismissMultiSystemCoach = dismissCoach;
  global.hcCloseNuevoSistemaPrimer = closeNuevoSistemaPrimer;
  global.hcConfirmNuevoSistemaPrimer = confirmNuevoSistemaPrimer;
  global.hcOpenNuevoSistemaPrimer = openNuevoSistemaPrimer;
})(typeof window !== 'undefined' ? window : globalThis);
