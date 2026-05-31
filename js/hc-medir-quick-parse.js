/**
 * Parseo rápido de lecturas: "EC 1350 pH 6.0 T 20 V 18" → campos Medir / wizard.
 */
(function () {
  function numFromAny(raw) {
    var s = String(raw == null ? '' : raw).trim().replace(',', '.');
    if (!s) return '';
    var n = Number(s);
    return Number.isFinite(n) ? String(n) : '';
  }

  function parseMedicionQuick(raw) {
    var norm = String(raw || '')
      .replace(/µS\/cm/gi, ' ')
      .replace(/[=;,]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!norm) return null;

    function grab(re) {
      var m = norm.match(re);
      return m ? numFromAny(m[1]) : '';
    }

    var out = {
      ec: grab(/\b(?:ec|ecs|conductividad)\s*([0-9]+(?:[.,][0-9]+)?)\b/i),
      ph: grab(/\bph\s*([0-9]+(?:[.,][0-9]+)?)\b/i),
      temp: grab(/\b(?:t|temp|temperatura)\s*([0-9]+(?:[.,][0-9]+)?)\b/i),
      vol: grab(/\b(?:v|vol|volumen|litros|l)\s*([0-9]+(?:[.,][0-9]+)?)\b/i),
    };

    if (!out.ec && !out.ph && !out.temp && !out.vol) {
      var nums = norm.match(/[0-9]+(?:[.,][0-9]+)?/g) || [];
      if (nums[0]) out.ec = numFromAny(nums[0]);
      if (nums[1]) out.ph = numFromAny(nums[1]);
      if (nums[2]) out.temp = numFromAny(nums[2]);
      if (nums[3]) out.vol = numFromAny(nums[3]);
    }

    if (!out.ec && !out.ph && !out.temp && !out.vol) return null;
    return out;
  }

  function setField(id, val) {
    if (!val) return;
    var node = document.getElementById(id);
    if (!node) return;
    node.value = val;
    try {
      node.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (_) {
      if (typeof evalParam === 'function') evalParam();
    }
  }

  function applyMedicionQuick(raw, targetMap) {
    var parsed = parseMedicionQuick(raw);
    if (!parsed) return false;
    var map = targetMap || {
      ec: 'inputEC',
      ph: 'inputPH',
      temp: 'inputTemp',
      vol: 'inputVol',
    };
    setField(map.ec, parsed.ec);
    setField(map.ph, parsed.ph);
    setField(map.temp, parsed.temp);
    setField(map.vol, parsed.vol);
    if (typeof evalParam === 'function') evalParam();
    return true;
  }

  function applyWizardQuick(raw) {
    return applyMedicionQuick(raw, {
      ec: 'wizEC',
      ph: 'wizPH',
      temp: 'wizTemp',
      vol: 'wizVol',
    });
  }

  function applyMedirTabQuick(raw) {
    var ok = applyMedicionQuick(raw);
    var hint = document.getElementById('medirQuickParseHint');
    if (hint) {
      hint.textContent = ok
        ? 'Valores aplicados. Revisa el estado y pulsa Guardar.'
        : 'No se reconoció la lectura. Prueba: EC 1350 pH 6.0 T 20 V 18';
      hint.classList.toggle('is-ok', !!ok);
      hint.classList.toggle('is-warn', !ok);
    }
    return ok;
  }

  window.hcParseMedicionQuick = parseMedicionQuick;
  window.hcApplyMedicionQuick = applyMedicionQuick;
  window.hcApplyMedirTabQuick = applyMedirTabQuick;
  window.hcApplyWizardMedQuick = applyWizardQuick;
})();
