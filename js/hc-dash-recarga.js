/** Colapsar tarjeta recarga en Inicio */
function toggleDashRecargaCard() {
  var body = document.getElementById('dashRecargaBody');
  var head = document.getElementById('btnDashRecarga');
  if (!body || !head) return;
  var open = body.hidden;
  body.hidden = !open;
  head.classList.toggle('is-collapsed', !open);
  head.setAttribute('aria-expanded', open ? 'true' : 'false');
  try {
    localStorage.setItem('hcDashRecargaOpen', open ? '1' : '0');
  } catch (_) {}
}

/** Inicio → checklist recarga completa (Medir + modal checklist). */
function hcIrChecklistRecargaDesdeDash() {
  try {
    if (typeof goTab === 'function') goTab('mediciones');
  } catch (_) {}
  setTimeout(function () {
    try {
      if (typeof ensureRecargaCardEnMedirTab === 'function') ensureRecargaCardEnMedirTab();
    } catch (_) {}
    if (typeof confirmarReposicionDeposito === 'function') {
      confirmarReposicionDeposito('con_nutrientes');
      return;
    }
    if (typeof intentarAbrirChecklistDesdeInicio === 'function') {
      intentarAbrirChecklistDesdeInicio(false);
    }
  }, 240);
}

/** Inicio → reposición parcial y avisos (en Medir, no Sala). */
function hcIrReposicionAvisosMedir() {
  try {
    if (typeof goTab === 'function') goTab('mediciones');
  } catch (_) {}
  setTimeout(function () {
    try {
      if (typeof ocultarRecargaUiSemillaHidro === 'function') {
        ocultarRecargaUiSemillaHidro();
      } else if (typeof ensureRecargaCardEnMedirTab === 'function') {
        ensureRecargaCardEnMedirTab();
      }
      if (typeof scheduleInitMedirSalaLayout === 'function') scheduleInitMedirSalaLayout();
    } catch (_) {}
    var cfg = typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
    var esSh = typeof hcMedirEsSemillaHidro === 'function' && hcMedirEsSemillaHidro(cfg);
    var target = esSh
      ? document.getElementById('medirRecargaVolAvisoSlim')
      : document.getElementById('recargaCardMediciones');
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (!esSh) {
      var body = document.getElementById('collapseBodyRecargaProxima');
      var head = document.getElementById('btnCollapseRecargaProxima');
      if (body) {
        body.hidden = false;
        body.removeAttribute('hidden');
      }
      if (head) {
        head.classList.remove('is-collapsed');
        head.setAttribute('aria-expanded', 'true');
      }
    }
    try {
      if (typeof updateRecargaBar === 'function') updateRecargaBar();
      if (!esSh && typeof actualizarResumenReposicionParcialUI === 'function') {
        actualizarResumenReposicionParcialUI();
      }
    } catch (_) {}
  }, 260);
}

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var body = document.getElementById('dashRecargaBody');
    var head = document.getElementById('btnDashRecarga');
    if (!body || !head) return;
    var open = true;
    try {
      open = localStorage.getItem('hcDashRecargaOpen') !== '0';
    } catch (_) {}
    body.hidden = !open;
    head.classList.toggle('is-collapsed', !open);
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();
