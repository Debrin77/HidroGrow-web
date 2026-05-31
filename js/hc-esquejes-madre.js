/**
 * HidroGrow — protocolo madre + esquejes en DWC/RDWC.
 * Una planta madre en hidro puede aportar docenas de clones si se mantiene en 18/6.
 */
(function () {
  const PREP_MADRE_PASOS = [
    { id: 'madre_edad', titulo: 'Madre ≥5–6 sem veg', desc: 'En DWC/RDWC estable, sin estrés ni clorosis. Solo fotoperíodo 18/6.' },
    { id: 'madre_poda', titulo: 'Poda 14–21 d antes', desc: 'Topping / limpieza baja para brotes uniformes de 10–15 cm.' },
    { id: 'madre_lean', titulo: 'EC −20–30 % (7–10 d)', desc: 'Bajar a ~800–1000 µS; CalMag estable. Sin foliar 7 d antes del corte.' },
    { id: 'madre_turgor', titulo: 'Día anterior: turgor', desc: 'Depósito bien oxigenado; planta hidratada, sin sequía.' },
    { id: 'madre_higiene', titulo: 'Higiene día corte', desc: 'Tijera esterilizada, guantes, sin corrientes frías sobre la copa.' },
  ];

  const CORTE_PASOS = [
    { id: 'corte_hora', titulo: 'Cortar por la mañana', desc: '24–25 °C en sala; turgor máximo.' },
    { id: 'corte_tecnica', titulo: 'Corte 45° bajo nodo', desc: '10–15 cm, grosor lápiz; 2/3 hojas inferiores fuera.' },
    { id: 'corte_gel', titulo: 'Gel / polvo enraizante', desc: 'Inmediatamente tras el corte; no tocar la punta del tallo.' },
    { id: 'corte_rockwool', titulo: 'Cubo rockwool pH 5.5', desc: 'Humedecido, no encharcado; encajar sin apretar demasiado.' },
  ];

  const ENRAIZAR_PASOS = [
    { id: 'domo_hr', titulo: 'Domo HR 70–80 %', desc: '22–26 °C · luz tenue 18/6 · ventilar domo 2×/día.' },
    { id: 'clon_aire', titulo: 'Opcional: clonador DWC', desc: 'Mini cubo + aireador; EC 0–400 µS las primeras 48 h.' },
    { id: 'raiz_visible', titulo: 'Raíces 3–5 cm', desc: '5–10 d típico en hidro bien aireado; no tirar del tallo.' },
    { id: 'traslado_np', titulo: 'Net pot → cubo productivo', desc: 'EC 400–600 µS; nivel alto la 1ª semana; luego gap 2–3 cm aire.' },
  ];

  const MANTENER_MADRE = [
    { id: 'm18_6', titulo: '18/6 permanente', desc: 'Nunca 12/12 en madre: florecería y dejaría de servir para clones.' },
    { id: 'mcorte', titulo: 'Esquejes cada 10–14 d', desc: 'Máx. ~30 % del follaje por sesión para no debilitarla.' },
    { id: 'mrenovar', titulo: 'Renovar cada 6–12 meses', desc: 'Nueva madre desde el esqueje más vigoroso (menos “fatiga”).' },
  ];

  function el(id) {
    return document.getElementById(id);
  }

  function ensureEsquejesState(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    if (!cfg.esquejesProtocolo) {
      cfg.esquejesProtocolo = {
        prepMadre: {},
        corte: {},
        enraizar: {},
        mantener: {},
        ultimaSesionEsquejes: '',
        notasMadre: '',
      };
    }
    return cfg.esquejesProtocolo;
  }

  function origenEsMadreOClon() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const prem = cfg.premiumSetup || {};
    const o = String(cfg.origenPlanta || prem.origenPlanta || '').toLowerCase();
    return o === 'clon' || o === 'madre' || o === 'esqueje';
  }

  function esModoMadreActivo() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const prem = cfg.premiumSetup || {};
    return String(cfg.origenPlanta || prem.origenPlanta || '').toLowerCase() === 'madre';
  }

  function renderPasoGrid(container, pasos, grupo, checklist) {
    if (!container) return;
    container.innerHTML = pasos.map(function (paso) {
      const ok = !!(checklist && checklist[paso.id]);
      return (
        '<button type="button" class="equip-card equip-card-pad-12 setup-premium-germ-paso' + (ok ? ' selected' : '') +
        '" onclick="toggleEsquejePaso(\'' + grupo + '\',\'' + paso.id + '\')" aria-pressed="' + (ok ? 'true' : 'false') + '">' +
        '<div class="setup-option-title-md">' + paso.titulo + '</div>' +
        '<div class="setup-option-desc-sm">' + paso.desc + '</div></button>'
      );
    }).join('');
  }

  function toggleEsquejePaso(grupo, id) {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    const ep = ensureEsquejesState(cfg);
    const map = { prep: 'prepMadre', corte: 'corte', enraizar: 'enraizar', mantener: 'mantener' };
    const key = map[grupo] || grupo;
    if (!ep[key]) ep[key] = {};
    ep[key][id] = !ep[key][id];
    if (typeof saveState === 'function') saveState();
    if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    renderEsquejesSetupUI();
    renderMedirEsquejesPanel();
  }

  function renderEsquejesSetupUI() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const ep = ensureEsquejesState(cfg);
    const origen = String((cfg.premiumSetup && cfg.premiumSetup.origenPlanta) || cfg.origenPlanta || 'semilla').toLowerCase();
    const hint = el('setupPremiumEsquejesIntro');
    const secPrep = el('setupPremiumEsquejesPrep');
    const secCorte = el('setupPremiumEsquejesCorte');
    const secEnra = el('setupPremiumEsquejesEnraizar');
    const secMadre = el('setupPremiumEsquejesMadre');
    const show = origen === 'clon' || origen === 'madre';
    [secPrep, secCorte, secEnra, secMadre].forEach(function (s) {
      if (s) s.classList.toggle('setup-hidden', !show);
    });
    if (hint) {
      hint.classList.toggle('setup-hidden', !show);
      if (show) {
        hint.innerHTML = origen === 'madre'
          ? '<strong>Modo madre:</strong> mantén 1 planta en cubo DWC/RDWC bajo 18/6 y toma esquejes cada 10–14 d. ' +
            'Es la forma más productiva de repetir genética en hidro (docenas de clones por ciclo).'
          : '<strong>Clon recibido o propio:</strong> sigue enraizamiento bajo domo antes del net pot. ' +
            'Si más adelante quieres madre, deja una planta en veg y marca «Madre» en este paso.';
      }
    }
    if (!show) return;
    renderPasoGrid(el('setupPremiumEsquejesPrepGrid'), PREP_MADRE_PASOS, 'prep', ep.prepMadre);
    renderPasoGrid(el('setupPremiumEsquejesCorteGrid'), CORTE_PASOS, 'corte', ep.corte);
    renderPasoGrid(el('setupPremiumEsquejesEnraizarGrid'), ENRAIZAR_PASOS, 'enraizar', ep.enraizar);
    if (secMadre) secMadre.classList.toggle('setup-hidden', origen !== 'madre');
    if (origen === 'madre') {
      renderPasoGrid(el('setupPremiumEsquejesMadreGrid'), MANTENER_MADRE, 'mantener', ep.mantener);
    }
    const notas = el('setupPremiumNotasMadre');
    if (notas && document.activeElement !== notas) notas.value = ep.notasMadre || '';
  }

  function persistEsquejesNotasMadre() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    const ep = ensureEsquejesState(cfg);
    ep.notasMadre = String(el('setupPremiumNotasMadre')?.value || '').slice(0, 200);
    if (typeof saveState === 'function') saveState();
  }

  function registrarSesionEsquejes() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    const ep = ensureEsquejesState(cfg);
    const now = new Date();
    ep.ultimaSesionEsquejes = now.toLocaleDateString('es-ES');
    if (typeof saveState === 'function') saveState();
    if (typeof addRegistro === 'function') {
      addRegistro('apunte', {
        icono: '✂️',
        apunteTexto: 'Sesión de esquejes registrada · revisar checklist prep/corte/enraizar',
      }, true);
    }
    renderMedirEsquejesPanel();
    if (typeof showToast === 'function') showToast('✂️ Sesión de esquejes registrada');
  }

  function renderMedirEsquejesPanel() {
    const card = el('medirEsquejesCard');
    const panel = el('medirEsquejesPanel');
    if (!card || !panel) return;
    const show = origenEsMadreOClon();
    card.classList.toggle('setup-hidden', !show);
    if (!show) return;
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const ep = ensureEsquejesState(cfg);
    const madre = esModoMadreActivo();
    const countDone = function (obj) {
      return Object.keys(obj || {}).filter(function (k) { return obj[k]; }).length;
    };
    panel.innerHTML =
      '<p class="medir-esquejes-lead">' + (madre
        ? 'Planta madre en DWC/RDWC: aprovecha brotes vegetativos sin volver a sembrar.'
        : 'Protocolo de clonación hacia net pot y cubo.') + '</p>' +
      '<div class="medir-esquejes-stats">' +
      '<span>Prep madre: <strong>' + countDone(ep.prepMadre) + '/' + PREP_MADRE_PASOS.length + '</strong></span> · ' +
      '<span>Corte: <strong>' + countDone(ep.corte) + '/' + CORTE_PASOS.length + '</strong></span> · ' +
      '<span>Enraizar: <strong>' + countDone(ep.enraizar) + '/' + ENRAIZAR_PASOS.length + '</strong></span>' +
      (madre ? ' · Mantener: <strong>' + countDone(ep.mantener) + '/' + MANTENER_MADRE.length + '</strong>' : '') +
      '</div>' +
      (ep.ultimaSesionEsquejes
        ? '<p class="medir-esquejes-last">Última sesión: <strong>' + ep.ultimaSesionEsquejes + '</strong></p>'
        : '<p class="medir-esquejes-last">Sin sesión de esquejes registrada aún.</p>') +
      '<div class="medir-esquejes-actions">' +
      '<button type="button" class="btn btn-secondary btn-sm" onclick="registrarSesionEsquejes()">Registrar sesión hoy</button>' +
      '</div>' +
      '<details class="medir-esquejes-details"><summary>Ver pasos completos</summary>' +
      '<h4>Preparar madre (7–10 d antes)</h4><ul>' + PREP_MADRE_PASOS.map(function (p) { return '<li>' + p.titulo + ': ' + p.desc + '</li>'; }).join('') + '</ul>' +
      '<h4>Día del corte</h4><ul>' + CORTE_PASOS.map(function (p) { return '<li>' + p.titulo + ': ' + p.desc + '</li>'; }).join('') + '</ul>' +
      '<h4>Enraizamiento → DWC</h4><ul>' + ENRAIZAR_PASOS.map(function (p) { return '<li>' + p.titulo + ': ' + p.desc + '</li>'; }).join('') + '</ul>' +
      (madre ? '<h4>Mantener madre</h4><ul>' + MANTENER_MADRE.map(function (p) { return '<li>' + p.titulo + ': ' + p.desc + '</li>'; }).join('') + '</ul>' : '') +
      '</details>';
  }

  function persistEsquejesToConfig(cfg) {
    if (!cfg) return;
    const ep = ensureEsquejesState(cfg);
    cfg.esquejesProtocolo = JSON.parse(JSON.stringify(ep));
    if (String(cfg.origenPlanta || '').toLowerCase() === 'madre') {
      cfg.modoMadreHidro = true;
    }
  }

  window.toggleEsquejePaso = toggleEsquejePaso;
  window.renderEsquejesSetupUI = renderEsquejesSetupUI;
  window.renderMedirEsquejesPanel = renderMedirEsquejesPanel;
  window.registrarSesionEsquejes = registrarSesionEsquejes;
  window.persistEsquejesNotasMadre = persistEsquejesNotasMadre;
  window.persistEsquejesToConfig = persistEsquejesToConfig;
  window.origenEsMadreOClon = origenEsMadreOClon;
  window.esModoMadreActivo = esModoMadreActivo;
})();
