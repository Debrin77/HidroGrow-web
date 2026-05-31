/**
 * HidroGrow — protocolo madre + esquejes en DWC/RDWC.
 * Calendario, EC/pH por fase, avisos y checklist persistente.
 */
(function () {
  const INTERVALO_SESION_DIAS = 12;
  const PREP_DIAS_ANTES = 7;
  const ENRAIZAR_DIAS = 10;

  const ESQUEJES_EC_PH = {
    prep_madre: {
      key: 'prep_madre',
      label: 'Preparar madre (7–10 d antes del corte)',
      ec: { min: 800, max: 1000 },
      ph: { min: 5.6, max: 6.2 },
      nota: 'Baja EC ~20–30 % respecto a veg normal. CalMag estable.',
    },
    clonador_48h: {
      key: 'clonador_48h',
      label: 'Clonador / domo (primeras 48 h)',
      ec: { min: 0, max: 400 },
      ph: { min: 5.3, max: 5.8 },
      nota: 'Agua casi limpia o solución muy diluida. HR 70–80 %.',
    },
    enraizamiento: {
      key: 'enraizamiento',
      label: 'Enraizamiento en rockwool / domo',
      ec: { min: 300, max: 600 },
      ph: { min: 5.5, max: 6.0 },
      nota: 'Sube EC gradualmente cuando asomen raíces blancas.',
    },
    traslado_dwc: {
      key: 'traslado_dwc',
      label: 'Net pot → cubo productivo (1ª semana)',
      ec: { min: 400, max: 600 },
      ph: { min: 5.6, max: 6.2 },
      nota: 'Nivel alto tocando cubo; luego gap 2–3 cm de aire.',
    },
    madre_mantener: {
      key: 'madre_mantener',
      label: 'Madre en producción (18/6)',
      ec: { min: 1000, max: 1400 },
      ph: { min: 5.7, max: 6.3 },
      nota: 'Entre sesiones de esquejes. Poda ligera continua.',
    },
  };

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

  function parseFechaEs(str) {
    if (!str || typeof str !== 'string') return null;
    const p = str.split('/');
    if (p.length < 3) return null;
    const d = parseInt(p[0], 10);
    const m = parseInt(p[1], 10) - 1;
    const y = parseInt(p[2], 10);
    if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return null;
    const fecha = new Date(y, m, d, 0, 0, 0, 0);
    return Number.isFinite(fecha.getTime()) ? fecha : null;
  }

  function hoyLocal0() {
    const h = new Date();
    h.setHours(0, 0, 0, 0);
    return h;
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
        proximaSesionEsquejes: '',
        fechaInicioMadre: '',
        intervaloSesionDias: INTERVALO_SESION_DIAS,
        notasMadre: '',
      };
    }
    const ep = cfg.esquejesProtocolo;
    if (!ep.intervaloSesionDias) ep.intervaloSesionDias = INTERVALO_SESION_DIAS;
    return ep;
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

  function diasDesdeUltimaSesion(ep) {
    ep = ep || ensureEsquejesState();
    const f = parseFechaEs(ep.ultimaSesionEsquejes);
    if (!f) return null;
    return Math.round((hoyLocal0() - f) / 86400000);
  }

  function getProximaSesionFecha(ep) {
    ep = ep || ensureEsquejesState();
    const explicita = parseFechaEs(ep.proximaSesionEsquejes);
    if (explicita) return explicita;
    const ultima = parseFechaEs(ep.ultimaSesionEsquejes);
    const intervalo = ep.intervaloSesionDias || INTERVALO_SESION_DIAS;
    if (ultima) {
      return new Date(ultima.getTime() + intervalo * 86400000);
    }
    const inicio = parseFechaEs(ep.fechaInicioMadre);
    if (inicio) {
      return new Date(inicio.getTime() + 42 * 86400000);
    }
    return null;
  }

  function getGeneticsAdj(cfg) {
    if (typeof getGeneticsEsquejesAdjustments !== 'function') {
      return { diasEnraizarExtra: 0, intervaloSesionEsquejes: INTERVALO_SESION_DIAS, ecMultEsqueje: 1, notaEsqueje: '', notaBreeder: '', nombreGenetica: '' };
    }
    return getGeneticsEsquejesAdjustments(cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {}));
  }

  function enraizarDiasTotal(cfg) {
    const adj = getGeneticsAdj(cfg);
    return Math.max(7, ENRAIZAR_DIAS + (Number(adj.diasEnraizarExtra) || 0));
  }

  function aplicarGeneticaEcPh(fase, cfg) {
    if (!fase) return fase;
    const adj = getGeneticsAdj(cfg);
    const mult = adj.ecMultEsqueje || 1;
    const out = Object.assign({}, fase);
    if (out.ec && mult !== 1) {
      out.ec = {
        min: Math.max(0, Math.round(out.ec.min * mult)),
        max: Math.max(0, Math.round(out.ec.max * mult)),
      };
    }
    if (adj.notaEsqueje) out.notaGenetica = adj.notaEsqueje;
    if (adj.notaBreeder) out.notaBreeder = adj.notaBreeder;
    return out;
  }

  function getFaseEsquejesActual(cfg) {
    if (!origenEsMadreOClon()) return null;
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    const ep = ensureEsquejesState(cfg);
    const adj = getGeneticsAdj(cfg);
    if (!ep.intervaloSesionDias || ep.intervaloSesionDias === INTERVALO_SESION_DIAS) {
      ep.intervaloSesionDias = adj.intervaloSesionEsquejes || INTERVALO_SESION_DIAS;
    }
    const madre = esModoMadreActivo();
    const dias = diasDesdeUltimaSesion(ep);
    const intervalo = ep.intervaloSesionDias || adj.intervaloSesionEsquejes || INTERVALO_SESION_DIAS;
    const proxima = getProximaSesionFecha(ep);
    const hoy = hoyLocal0();
    const enraizarTotal = enraizarDiasTotal(cfg);

    if (dias != null && dias >= 0 && dias <= enraizarTotal) {
      if (dias <= 2) return aplicarGeneticaEcPh(Object.assign({ activo: true, diasDesdeSesion: dias }, ESQUEJES_EC_PH.clonador_48h), cfg);
      if (dias <= 7 + Math.max(0, adj.diasEnraizarExtra || 0)) {
        return aplicarGeneticaEcPh(Object.assign({ activo: true, diasDesdeSesion: dias }, ESQUEJES_EC_PH.enraizamiento), cfg);
      }
      return aplicarGeneticaEcPh(Object.assign({ activo: true, diasDesdeSesion: dias }, ESQUEJES_EC_PH.traslado_dwc), cfg);
    }

    if (madre && proxima) {
      const diasHasta = Math.round((proxima - hoy) / 86400000);
      if (diasHasta <= PREP_DIAS_ANTES && diasHasta >= 0) {
        return aplicarGeneticaEcPh(Object.assign({ activo: true, diasHastaSesion: diasHasta }, ESQUEJES_EC_PH.prep_madre), cfg);
      }
      if (diasHasta < 0) {
        return aplicarGeneticaEcPh(Object.assign({ activo: true, sesionVencida: true, diasHastaSesion: diasHasta }, ESQUEJES_EC_PH.prep_madre), cfg);
      }
      return aplicarGeneticaEcPh(Object.assign({ activo: true, diasHastaSesion: diasHasta, intervaloGenetica: intervalo }, ESQUEJES_EC_PH.madre_mantener), cfg);
    }

    if (madre) {
      return aplicarGeneticaEcPh(Object.assign({ activo: true }, ESQUEJES_EC_PH.madre_mantener), cfg);
    }

    return aplicarGeneticaEcPh(Object.assign({ activo: true }, ESQUEJES_EC_PH.enraizamiento), cfg);
  }

  function getEsquejesEcPhPorFase(faseKey, cfg) {
    const base = ESQUEJES_EC_PH[faseKey] || null;
    if (!base) return null;
    return aplicarGeneticaEcPh(base, cfg);
  }

  function getRecomendacionEcPhEsquejes(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    const fase = getFaseEsquejesActual(cfg);
    if (!fase || !fase.activo) return null;
    const adj = getGeneticsAdj(cfg);
    return {
      activo: true,
      fase: fase.key,
      label: fase.label,
      ec: fase.ec,
      ph: fase.ph,
      nota: fase.nota,
      notaGenetica: fase.notaGenetica || adj.notaEsqueje || '',
      notaBreeder: fase.notaBreeder || adj.notaBreeder || '',
      nombreGenetica: adj.nombreGenetica || '',
      sesionVencida: !!fase.sesionVencida,
      diasHastaSesion: fase.diasHastaSesion,
      diasDesdeSesion: fase.diasDesdeSesion,
      diasEnraizarTotal: enraizarDiasTotal(cfg),
    };
  }

  function getVariedadEsquejesHint() {
    try {
      const tor = (typeof state !== 'undefined' && state && state.torre) ? state.torre : [];
      for (let n = 0; n < tor.length; n++) {
        const row = tor[n] || [];
        for (let i = 0; i < row.length; i++) {
          const c = row[i];
          if (!c || !c.variedad) continue;
          const cu = typeof getCultivoDB === 'function' ? getCultivoDB(c.variedad) : null;
          if (cu && typeof geneticsPremiumConsejo === 'function') {
            return { nombre: cu.nombre || c.variedad, consejo: geneticsPremiumConsejo(cu) };
          }
        }
      }
    } catch (_) {}
    return null;
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
      if (!ep.fechaInicioMadre) {
        ep.fechaInicioMadre = hoyLocal0().toLocaleDateString('es-ES');
      }
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

  function persistEsquejesFechaMadre() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    const ep = ensureEsquejesState(cfg);
    ep.fechaInicioMadre = String(el('medirEsquejesFechaMadre')?.value || '').slice(0, 12);
    if (typeof saveState === 'function') saveState();
    if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    renderMedirEsquejesPanel();
    if (typeof renderCalendario === 'function') renderCalendario();
  }

  function registrarSesionEsquejes() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    const ep = ensureEsquejesState(cfg);
    const now = hoyLocal0();
    ep.ultimaSesionEsquejes = now.toLocaleDateString('es-ES');
    const intervalo = ep.intervaloSesionDias || INTERVALO_SESION_DIAS;
    const prox = new Date(now.getTime() + intervalo * 86400000);
    ep.proximaSesionEsquejes = prox.toLocaleDateString('es-ES');
    ep.corte = {};
    ep.enraizar = {};
    ep.prepMadre = {};
    if (typeof saveState === 'function') saveState();
    if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    if (typeof addRegistro === 'function') {
      addRegistro('apunte', {
        icono: '✂️',
        apunteTexto: 'Sesión de esquejes · próxima ~' + intervalo + ' d · EC clones 300–600 µS',
      }, true);
    }
    renderMedirEsquejesPanel();
    if (typeof renderCalendario === 'function') renderCalendario();
    if (typeof evalParam === 'function') evalParam();
    if (typeof showToast === 'function') showToast('✂️ Sesión registrada · prep madre en ~' + (intervalo - PREP_DIAS_ANTES) + ' d');
  }

  function renderEcPhFaseHtml(fase) {
    if (!fase) return '';
    return (
      '<div class="medir-esquejes-ecph">' +
      '<strong>Fase actual:</strong> ' + fase.label +
      '<br>EC objetivo: <strong>' + fase.ec.min + '–' + fase.ec.max + ' µS/cm</strong> · ' +
      'pH: <strong>' + fase.ph.min + '–' + fase.ph.max + '</strong>' +
      (fase.nota ? '<br><span class="medir-esquejes-ecph-nota">' + fase.nota + '</span>' : '') +
      '</div>'
    );
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
    const fase = getFaseEsquejesActual(cfg);
    const rec = getRecomendacionEcPhEsquejes(cfg);
    const genHint = getVariedadEsquejesHint();
    const countDone = function (obj) {
      return Object.keys(obj || {}).filter(function (k) { return obj[k]; }).length;
    };
    const proxima = getProximaSesionFecha(ep);
    const proxTxt = proxima ? proxima.toLocaleDateString('es-ES') : '—';
    let alerta = '';
    if (rec && rec.sesionVencida) {
      alerta = '<p class="medir-esquejes-alerta">⚠️ Sesión de esquejes vencida — conviene cortar pronto o reprogramar.</p>';
    } else if (rec && rec.diasHastaSesion != null && rec.diasHastaSesion <= PREP_DIAS_ANTES && rec.diasHastaSesion >= 0) {
      alerta = '<p class="medir-esquejes-alerta medir-esquejes-alerta--prep">🌿 Prep madre: baja EC y poda · sesión en <strong>' + rec.diasHastaSesion + ' d</strong></p>';
    } else if (rec && rec.diasDesdeSesion != null && rec.diasDesdeSesion <= ENRAIZAR_DIAS) {
      alerta = '<p class="medir-esquejes-alerta medir-esquejes-alerta--enra">💧 Día ' + (rec.diasDesdeSesion + 1) + ' post-corte · vigila domo y EC baja</p>';
    }

    panel.innerHTML =
      alerta +
      '<p class="medir-esquejes-lead">' + (madre
        ? 'Planta madre en DWC/RDWC: aprovecha brotes vegetativos sin volver a sembrar.'
        : 'Protocolo de clonación hacia net pot y cubo.') + '</p>' +
      renderEcPhFaseHtml(fase) +
      (rec && rec.notaGenetica
        ? '<p class="medir-esquejes-gen">🧬 <strong>Genética:</strong> ' + rec.notaGenetica + '</p>'
        : '') +
      (rec && rec.notaBreeder
        ? '<p class="medir-esquejes-gen">📋 <strong>Breeder:</strong> ' + rec.notaBreeder + '</p>'
        : '') +
      (genHint && !rec?.notaGenetica
        ? '<p class="medir-esquejes-gen">🧬 <strong>' + genHint.nombre + ':</strong> ' + genHint.consejo + '</p>'
        : '') +
      '<div class="medir-esquejes-stats">' +
      '<span>Prep: <strong>' + countDone(ep.prepMadre) + '/' + PREP_MADRE_PASOS.length + '</strong></span> · ' +
      '<span>Corte: <strong>' + countDone(ep.corte) + '/' + CORTE_PASOS.length + '</strong></span> · ' +
      '<span>Enraizar: <strong>' + countDone(ep.enraizar) + '/' + ENRAIZAR_PASOS.length + '</strong></span>' +
      (madre ? ' · Mantener: <strong>' + countDone(ep.mantener) + '/' + MANTENER_MADRE.length + '</strong>' : '') +
      '</div>' +
      (madre
        ? '<label class="medir-esquejes-fecha-lbl" for="medirEsquejesFechaMadre">Inicio madre</label>' +
          '<input type="text" id="medirEsquejesFechaMadre" class="setup-input-city medir-esquejes-fecha-inp" placeholder="dd/mm/aaaa" ' +
          'value="' + (ep.fechaInicioMadre || '') + '" onchange="persistEsquejesFechaMadre()" onblur="persistEsquejesFechaMadre()">'
        : '') +
      (ep.ultimaSesionEsquejes
        ? '<p class="medir-esquejes-last">Última sesión: <strong>' + ep.ultimaSesionEsquejes + '</strong>' +
          (proxTxt !== '—' ? ' · Próxima: <strong>' + proxTxt + '</strong>' : '') + '</p>'
        : '<p class="medir-esquejes-last">Sin sesión registrada · próxima estimada: <strong>' + proxTxt + '</strong></p>') +
      '<div class="medir-esquejes-actions">' +
      '<button type="button" class="btn btn-secondary btn-sm" onclick="registrarSesionEsquejes()">Registrar sesión hoy</button>' +
      '</div>' +
      '<details class="medir-esquejes-details"><summary>Ver pasos completos</summary>' +
      '<p class="medir-esquejes-foot">Valores orientativos para hidro DWC/RDWC. Cada genética y semillero (pack, web del breeder) puede pedir EC, tiempos o HR distintos — prioriza su ficha oficial.</p>' +
      '<h4>Preparar madre (7–10 d antes)</h4><ul>' + PREP_MADRE_PASOS.map(function (p) { return '<li>' + p.titulo + ': ' + p.desc + '</li>'; }).join('') + '</ul>' +
      '<h4>Día del corte</h4><ul>' + CORTE_PASOS.map(function (p) { return '<li>' + p.titulo + ': ' + p.desc + '</li>'; }).join('') + '</ul>' +
      '<h4>Enraizamiento → DWC</h4><ul>' + ENRAIZAR_PASOS.map(function (p) { return '<li>' + p.titulo + ': ' + p.desc + '</li>'; }).join('') + '</ul>' +
      (madre ? '<h4>Mantener madre</h4><ul>' + MANTENER_MADRE.map(function (p) { return '<li>' + p.titulo + ': ' + p.desc + '</li>'; }).join('') + '</ul>' : '') +
      '</details>';
  }

  function generarEventosEsquejesDia(fechaDia, hoyRef) {
    if (!origenEsMadreOClon()) return [];
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const ep = ensureEsquejesState(cfg);
    const madre = esModoMadreActivo();
    const eventos = [];
    const d = new Date(fechaDia);
    d.setHours(0, 0, 0, 0);
    const hoy = hoyRef || hoyLocal0();
    const diff = Math.round((d - hoy) / 86400000);
    const intervalo = ep.intervaloSesionDias || INTERVALO_SESION_DIAS;

    const ultima = parseFechaEs(ep.ultimaSesionEsquejes);
    if (ultima) {
      const diasDesde = Math.round((d - ultima) / 86400000);
      if (diasDesde >= 0 && diasDesde <= ENRAIZAR_DIAS) {
        eventos.push({
          tipo: 'esqueje',
          icono: '💧',
          titulo: 'Enraizamiento de clones (día ' + (diasDesde + 1) + ')',
          desc: 'Domo HR 70–80 % · EC ' + ESQUEJES_EC_PH.enraizamiento.ec.min + '–' + ESQUEJES_EC_PH.enraizamiento.ec.max + ' µS · pH ' +
            ESQUEJES_EC_PH.enraizamiento.ph.min + '–' + ESQUEJES_EC_PH.enraizamiento.ph.max,
        });
      }
    }

    if (!madre) return eventos;

    const base = ultima || parseFechaEs(ep.fechaInicioMadre) || hoy;
    base.setHours(0, 0, 0, 0);

    for (let n = 0; n <= 24; n++) {
      const sesion = new Date(base.getTime() + (ultima ? (n + 1) : n) * intervalo * 86400000);
      if (!ultima && n === 0 && parseFechaEs(ep.fechaInicioMadre)) {
        sesion.setTime(parseFechaEs(ep.fechaInicioMadre).getTime() + 42 * 86400000);
      }
      sesion.setHours(0, 0, 0, 0);
      const prep = new Date(sesion.getTime() - PREP_DIAS_ANTES * 86400000);
      prep.setHours(0, 0, 0, 0);

      if (d.getTime() === sesion.getTime()) {
        eventos.push({
          tipo: 'esqueje',
          icono: '✂️',
          titulo: diff === 0 ? 'Sesión de esquejes hoy' : 'Sesión de esquejes',
          desc: 'Cortar por la mañana · gel enraizante · rockwool pH 5.5 · registrar sesión en Medir.',
        });
      }
      if (d.getTime() === prep.getTime()) {
        eventos.push({
          tipo: 'esqueje',
          icono: '🌿',
          titulo: 'Prep madre (7 d antes del corte)',
          desc: 'Bajar EC a ~800–1000 µS · poda para brotes uniformes · sin foliar.',
        });
      }
    }

    return eventos;
  }

  function marcarEsquejesCalendarioGrid(addEvento, mes, año) {
    if (!origenEsMadreOClon()) return;
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const ep = ensureEsquejesState(cfg);
    const madre = esModoMadreActivo();
    const intervalo = ep.intervaloSesionDias || INTERVALO_SESION_DIAS;
    const ultima = parseFechaEs(ep.ultimaSesionEsquejes);
    const base = ultima || parseFechaEs(ep.fechaInicioMadre);
    if (!base && !madre) {
      if (!ultima) return;
    }
    const start = base ? new Date(base.getTime()) : hoyLocal0();
    start.setHours(0, 0, 0, 0);

    for (let n = 0; n <= 18; n++) {
      let sesion;
      if (ultima) {
        sesion = new Date(ultima.getTime() + (n + 1) * intervalo * 86400000);
      } else if (parseFechaEs(ep.fechaInicioMadre)) {
        sesion = new Date(parseFechaEs(ep.fechaInicioMadre).getTime() + (42 + n * intervalo) * 86400000);
      } else {
        sesion = new Date(start.getTime() + (n + 1) * intervalo * 86400000);
      }
      const prep = new Date(sesion.getTime() - PREP_DIAS_ANTES * 86400000);

      if (prep.getMonth() === mes && prep.getFullYear() === año) {
        addEvento(prep.getDate(), 'esqueje', '#0d9488', '🌿 Prep madre');
      }
      if (sesion.getMonth() === mes && sesion.getFullYear() === año) {
        addEvento(sesion.getDate(), 'esqueje', '#059669', '✂️ Esquejes');
      }

      if (ultima) {
        for (let k = 1; k <= ENRAIZAR_DIAS; k += 5) {
          const enr = new Date(ultima.getTime() + k * 86400000);
          if (enr.getMonth() === mes && enr.getFullYear() === año && n === 0) {
            addEvento(enr.getDate(), 'esqueje', '#6366f1', '💧 Clones en domo');
          }
        }
      }
    }
  }

  function evaluarAvisosEsquejesNotif(slot) {
    if (!origenEsMadreOClon()) return [];
    const cfg = (slot && slot.config) || (typeof state !== 'undefined' && state.configTorre) || {};
    const ep = ensureEsquejesState(cfg);
    const rec = getRecomendacionEcPhEsquejes(cfg);
    const avisos = [];
    const nombre = (slot && slot.nombre && String(slot.nombre).trim()) || 'Instalación';

    if (rec && rec.sesionVencida) {
      avisos.push({
        titulo: '✂️ Esquejes pendientes · ' + nombre,
        cuerpo: 'La sesión de esquejes estaba programada. Prep madre y corta, o reprograma en Medir.',
      });
    } else if (rec && rec.diasHastaSesion === 0) {
      avisos.push({
        titulo: '✂️ Sesión de esquejes hoy · ' + nombre,
        cuerpo: 'Corta por la mañana · gel enraizante · rockwool pH 5.5. Registra la sesión en Medir.',
      });
    } else if (rec && rec.diasHastaSesion === PREP_DIAS_ANTES) {
      avisos.push({
        titulo: '🌿 Prep madre · ' + nombre,
        cuerpo: 'Faltan 7 d para esquejes: baja EC a 800–1000 µS y poda para brotes uniformes.',
      });
    } else if (rec && rec.diasDesdeSesion != null && rec.diasDesdeSesion === 5) {
      avisos.push({
        titulo: '💧 Clones día 6 · ' + nombre,
        cuerpo: 'Revisa raíces en domo. EC objetivo 300–600 µS. Ventila domo 2×/día.',
      });
    }
    return avisos;
  }

  function persistEsquejesToConfig(cfg) {
    if (!cfg) return;
    const ep = ensureEsquejesState(cfg);
    cfg.esquejesProtocolo = JSON.parse(JSON.stringify(ep));
    if (String(cfg.origenPlanta || '').toLowerCase() === 'madre') {
      cfg.modoMadreHidro = true;
      if (!ep.fechaInicioMadre) {
        ep.fechaInicioMadre = hoyLocal0().toLocaleDateString('es-ES');
        cfg.esquejesProtocolo.fechaInicioMadre = ep.fechaInicioMadre;
      }
    }
  }

  window.toggleEsquejePaso = toggleEsquejePaso;
  window.renderEsquejesSetupUI = renderEsquejesSetupUI;
  window.renderMedirEsquejesPanel = renderMedirEsquejesPanel;
  window.registrarSesionEsquejes = registrarSesionEsquejes;
  window.persistEsquejesNotasMadre = persistEsquejesNotasMadre;
  window.persistEsquejesFechaMadre = persistEsquejesFechaMadre;
  window.persistEsquejesToConfig = persistEsquejesToConfig;
  window.origenEsMadreOClon = origenEsMadreOClon;
  window.esModoMadreActivo = esModoMadreActivo;
  window.getFaseEsquejesActual = getFaseEsquejesActual;
  window.getRecomendacionEcPhEsquejes = getRecomendacionEcPhEsquejes;
  window.getEsquejesEcPhPorFase = getEsquejesEcPhPorFase;
  window.generarEventosEsquejesDia = generarEventosEsquejesDia;
  window.marcarEsquejesCalendarioGrid = marcarEsquejesCalendarioGrid;
  window.evaluarAvisosEsquejesNotif = evaluarAvisosEsquejesNotif;
})();
