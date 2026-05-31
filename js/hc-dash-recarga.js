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
