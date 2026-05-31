/**
 * Lógica pura multi-torre / modo cultivo (compartida con tests Node).
 * Debe coincidir con MODOS_CULTIVO en la app: vegetativo, floracion, esquejes, intensivo.
 */
(function (g) {
  var VALID_MODOS = ['vegetativo', 'floracion', 'esquejes', 'intensivo'];

  function normalizeTorreModoActual(raw) {
    var m = raw == null || raw === '' ? 'vegetativo' : String(raw);
    if (m === 'lechugas' || m === 'lechuga' || m === 'mixto' || m === 'mini') m = 'vegetativo';
    return VALID_MODOS.indexOf(m) !== -1 ? m : 'vegetativo';
  }

  g.normalizeTorreModoActual = normalizeTorreModoActual;
  g._HC_VALID_MODOS_CULTIVO = VALID_MODOS;
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : self);
