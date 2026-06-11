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

  /** Domo día a día (10 d) — alineado con Grodan / growshops: HR progresiva y dryback. */
  const DOMO_DIA_PASOS = [
    { id: 'd1', dia: 1, titulo: 'Día 1 · Corte + domo cerrado', desc: 'Gel enraizante · rockwool pH 5,5 · domo 100 % · HR ~80 % · sin luz directa fuerte.' },
    { id: 'd2', dia: 2, titulo: 'Día 2 · Vigilar turgor', desc: 'Domo cerrado · ventilar 30 s 1× · nebulizar domo si hojas se arrugan (sin encharcar cubo).' },
    { id: 'd3', dia: 3, titulo: 'Día 3 · Primera ventilación', desc: 'Abrir grieta pequeña o levantar domo 2×/día · HR ~75 % · revisar que no haya podredumbre en corte.' },
    { id: 'd4', dia: 4, titulo: 'Día 4 · Sin raíz aún = normal', desc: 'Ventilar 2× · comprobar humedad del cubo (húmedo, no goteando) · tijera y bandeja limpias.' },
    { id: 'd5', dia: 5, titulo: 'Día 5 · Bajar HR poco a poco', desc: 'Domo abierto ~1 h/día si no hay marchitamiento · HR objetivo ~70 % · opcional nebulizar con agua pH 5,5.' },
    { id: 'd6', dia: 6, titulo: 'Día 6 · Probar sin domo', desc: 'Medio día sin domo si turgencia OK · si se arrugan, volver a domo · 18/6 luz suave.' },
    { id: 'd7', dia: 7, titulo: 'Día 7 · Primeras raíces', desc: 'Buscar puntas blancas 1–2 cm · si hay raíz: EC muy baja 300–400 µS si riegas · no tirar del tallo.' },
    { id: 'd8', dia: 8, titulo: 'Día 8 · Domo casi fuera', desc: 'HR ~65 % · domo solo de noche o si estrés · ventilar bandeja · sativas pueden tardar +3 d.' },
    { id: 'd9', dia: 9, titulo: 'Día 9 · Raíces 3–5 cm', desc: 'Preparar net pot · EC 400–600 µS en cubo productivo · desinfectar tijera si trasplantas.' },
    { id: 'd10', dia: 10, titulo: 'Día 10 · Traslado a hidro', desc: 'Net pot en cubo DWC/RDWC · nivel alto tocando cubo 1ª semana · registrar fecha en ficha de la planta.' },
  ];

  const MANTENER_MADRE = [
    { id: 'm18_6', titulo: '18/6 permanente', desc: 'Nunca 12/12 en madre: florecería y dejaría de servir para clones.' },
    { id: 'mcorte', titulo: 'Esquejes cada 10–14 d', desc: 'Máx. ~30 % del follaje por sesión para no debilitarla.' },
    { id: 'mrenovar', titulo: 'Renovar cada 6–12 meses', desc: 'Nueva madre desde el esqueje más vigoroso (menos “fatiga”).' },
  ];

  /** IDs alineados con ITEMS_ENRAIZADO (modal checklist) — única fuente: esquejesProtocolo.montaje */
  const MONTAJE_ENRAIZADO_IDS = [
    'enr_domo',
    'enr_rockwool',
    'enr_higiene',
    'enr_luz',
    'enr_termo',
    'enr_aire',
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
        montaje: {},
        prepMadre: {},
        corte: {},
        enraizar: {},
        domoDias: {},
        mantener: {},
        montajeVerificadoAt: '',
        ultimaSesionEsquejes: '',
        proximaSesionEsquejes: '',
        fechaInicioMadre: '',
        intervaloSesionDias: INTERVALO_SESION_DIAS,
        notasMadre: '',
      };
    }
    const ep = cfg.esquejesProtocolo;
    if (!ep.montaje || typeof ep.montaje !== 'object') ep.montaje = {};
    if (!ep.intervaloSesionDias) ep.intervaloSesionDias = INTERVALO_SESION_DIAS;
    hcMigrarEnraizadoMontajeLegacy(cfg, ep);
    return ep;
  }

  function hcMigrarEnraizadoMontajeLegacy(cfg, ep) {
    if (!cfg || !ep || cfg._hcEnraizadoMontajeMigrado) return;
    const leg = cfg.enraizadoMontajeChecks;
    if (leg && typeof leg === 'object') {
      MONTAJE_ENRAIZADO_IDS.forEach(function (id) {
        if (leg[id]) ep.montaje[id] = true;
      });
      if (leg.completedAt && !ep.montajeVerificadoAt) {
        ep.montajeVerificadoAt = leg.completedAt;
      }
      try {
        delete cfg.enraizadoMontajeChecks;
      } catch (_) {}
    }
    cfg._hcEnraizadoMontajeMigrado = true;
  }

  function countMontajeEnraizado(ep) {
    ep = ep || ensureEsquejesState();
    let done = 0;
    MONTAJE_ENRAIZADO_IDS.forEach(function (id) {
      if (ep.montaje && ep.montaje[id]) done++;
    });
    return {
      done: done,
      total: MONTAJE_ENRAIZADO_IDS.length,
      verificado: !!ep.montajeVerificadoAt,
    };
  }

  /** Vista compatible con modal propagador (checks + completedAt). */
  function hcEnraizadoChecksViewFromProtocolo(cfg) {
    cfg =
      cfg ||
      (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    const ep = ensureEsquejesState(cfg);
    const ch = Object.assign({}, ep.montaje || {});
    if (ep.montajeVerificadoAt) ch.completedAt = ep.montajeVerificadoAt;
    return ch;
  }

  function hcGuardarEnraizadoChecksEnProtocolo(cfg, checks) {
    cfg =
      cfg ||
      (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    if (!cfg || !checks) return;
    const ep = ensureEsquejesState(cfg);
    ep.montaje = {};
    MONTAJE_ENRAIZADO_IDS.forEach(function (id) {
      if (checks[id]) ep.montaje[id] = true;
    });
    if (checks.completedAt) ep.montajeVerificadoAt = checks.completedAt;
    else delete ep.montajeVerificadoAt;
    try {
      delete cfg.enraizadoMontajeChecks;
    } catch (_) {}
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
    const map = { prep: 'prepMadre', corte: 'corte', enraizar: 'enraizar', domo: 'domoDias', mantener: 'mantener' };
    const key = map[grupo] || grupo;
    if (!ep[key]) ep[key] = {};
    ep[key][id] = !ep[key][id];
    if (typeof saveState === 'function') saveState();
    if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    renderEsquejesSetupUI();
    renderMedirEsquejesPanel();
    if (typeof refreshDashEnraizadoHub === 'function') refreshDashEnraizadoHub(cfg);
  }

  function getDomoDiaSugerido(ep) {
    ep = ep || ensureEsquejesState();
    const ultima = parseFechaEs(ep.ultimaSesionEsquejes);
    if (!ultima) return null;
    const dias = Math.round((hoyLocal0() - ultima) / 86400000) + 1;
    if (dias < 1 || dias > DOMO_DIA_PASOS.length) return null;
    return dias;
  }

  function renderEsquejesSetupUI() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const ep = ensureEsquejesState(cfg);
    const origen = String((cfg.premiumSetup && cfg.premiumSetup.origenPlanta) || cfg.origenPlanta || 'semilla').toLowerCase();
    const hint = el('setupPremiumEsquejesIntro');
    const secPrep = el('setupPremiumEsquejesPrep');
    const secCorte = el('setupPremiumEsquejesCorte');
    const secEnra = el('setupPremiumEsquejesEnraizar');
    const secDomo = el('setupPremiumEsquejesDomo');
    const secMadre = el('setupPremiumEsquejesMadre');
    const show = origen === 'clon' || origen === 'madre';
    [secPrep, secCorte, secEnra, secDomo, secMadre].forEach(function (s) {
      if (s) s.classList.toggle('setup-hidden', !show);
    });
    if (hint) {
      hint.classList.toggle('setup-hidden', !show);
      if (show) {
        hint.innerHTML = origen === 'madre'
          ? '<strong>Modo madre:</strong> mantén 1 planta en cubo DWC/RDWC bajo 18/6 y toma esquejes cada 10–14 d. ' +
            'Es la forma más productiva de repetir genética en hidro (docenas de clones por ciclo).'
          : '<strong>Esqueje al hidro:</strong> enraizado en domo (7–14 d) → net pot → depósito. ' +
            'No uses el bloque de preparación de madre; solo corte, domo y traslado.';
      }
    }
    if (!show) return;
    if (secPrep) secPrep.classList.toggle('setup-hidden', origen !== 'madre');
    if (origen === 'madre') {
      renderPasoGrid(el('setupPremiumEsquejesPrepGrid'), PREP_MADRE_PASOS, 'prep', ep.prepMadre);
    }
    renderPasoGrid(el('setupPremiumEsquejesCorteGrid'), CORTE_PASOS, 'corte', ep.corte);
    renderPasoGrid(el('setupPremiumEsquejesEnraizarGrid'), ENRAIZAR_PASOS, 'enraizar', ep.enraizar);
    if (secDomo) {
      secDomo.classList.toggle('setup-hidden', !show);
      const domoHint = el('setupPremiumEsquejesDomoHint');
      const diaSug = getDomoDiaSugerido(ep);
      if (domoHint) {
        domoHint.textContent = diaSug
          ? 'Sugerido hoy: día ' + diaSug + ' del domo (desde última sesión registrada en Medir).'
          : 'Marca cada día tras cortar esquejes; ventila el domo de forma progresiva (Grodan / growshops).';
      }
      renderPasoGrid(el('setupPremiumEsquejesDomoGrid'), DOMO_DIA_PASOS, 'domo', ep.domoDias);
    }
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
    ep.domoDias = {};
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
      const diaDomo = Math.min(DOMO_DIA_PASOS.length, rec.diasDesdeSesion + 1);
      const pasoDomo = DOMO_DIA_PASOS[diaDomo - 1];
      alerta = '<p class="medir-esquejes-alerta medir-esquejes-alerta--enra">💧 Día ' + (rec.diasDesdeSesion + 1) + ' post-corte · ' +
        (pasoDomo ? pasoDomo.titulo : 'vigila domo y EC baja') + '</p>';
    }

    const montProg = countMontajeEnraizado(ep);
    const montOk =
      typeof enraizadoMontajeCompleto === 'function' && enraizadoMontajeCompleto(cfg);
    const domoDone = countDone(ep.domoDias);
    const diaSug = getDomoDiaSugerido(ep);
    const domoHtml =
      '<details class="medir-esquejes-dome-details"' + (rec && rec.diasDesdeSesion != null && rec.diasDesdeSesion <= 10 ? ' open' : '') + '>' +
      '<summary>Domo día a día (' + domoDone + '/' + DOMO_DIA_PASOS.length + ')' +
      (diaSug ? ' · sugerido: día ' + diaSug : '') + '</summary>' +
      '<div class="medir-esquejes-dome-grid">' +
      DOMO_DIA_PASOS.map(function (p) {
        const ok = !!(ep.domoDias && ep.domoDias[p.id]);
        const sug = diaSug === p.dia;
        return (
          '<button type="button" class="equip-card equip-card-pad-12 medir-dome-paso' + (ok ? ' selected' : '') + (sug ? ' medir-dome-paso--hoy' : '') +
          '" onclick="toggleEsquejePaso(\'domo\',\'' + p.id + '\')" aria-pressed="' + (ok ? 'true' : 'false') + '">' +
          '<div class="setup-option-title-md">' + p.titulo + (sug ? ' ← hoy' : '') + '</div>' +
          '<div class="setup-option-desc-sm">' + p.desc + '</div></button>'
        );
      }).join('') +
      '</div></details>';

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
      (montOk
        ? ''
        : '<p class="medir-esquejes-alerta medir-esquejes-alerta--prep">🫧 Montaje domo: <strong>' +
          montProg.done +
          '/' +
          montProg.total +
          '</strong> · mismo checklist que el modal de Inicio/Sistema.' +
          ' <button type="button" class="btn btn-link btn-sm" onclick="typeof hcOpenPropagadorMontajeChecklist===\'function\'&&hcOpenPropagadorMontajeChecklist()">Abrir checklist</button></p>') +
      '<div class="medir-esquejes-stats">' +
      '<span>Montaje: <strong>' + montProg.done + '/' + montProg.total + '</strong></span> · ' +
      '<span>Prep: <strong>' + countDone(ep.prepMadre) + '/' + PREP_MADRE_PASOS.length + '</strong></span> · ' +
      '<span>Corte: <strong>' + countDone(ep.corte) + '/' + CORTE_PASOS.length + '</strong></span> · ' +
      '<span>Enraizar: <strong>' + countDone(ep.enraizar) + '/' + ENRAIZAR_PASOS.length + '</strong></span>' +
      ' · Domo: <strong>' + domoDone + '/' + DOMO_DIA_PASOS.length + '</strong>' +
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
      domoHtml +
      '<details class="medir-esquejes-details"><summary>Ver pasos completos</summary>' +
      '<p class="medir-esquejes-foot">Valores orientativos para hidro DWC/RDWC. Cada genética y semillero (pack, web del breeder) puede pedir EC, tiempos o HR distintos — prioriza su ficha oficial.</p>' +
      '<h4>Preparar madre (7–10 d antes)</h4><ul>' + PREP_MADRE_PASOS.map(function (p) { return '<li>' + p.titulo + ': ' + p.desc + '</li>'; }).join('') + '</ul>' +
      '<h4>Día del corte</h4><ul>' + CORTE_PASOS.map(function (p) { return '<li>' + p.titulo + ': ' + p.desc + '</li>'; }).join('') + '</ul>' +
      '<h4>Enraizamiento → DWC</h4><ul>' + ENRAIZAR_PASOS.map(function (p) { return '<li>' + p.titulo + ': ' + p.desc + '</li>'; }).join('') + '</ul>' +
      '<h4>Domo — 10 días</h4><ul>' + DOMO_DIA_PASOS.map(function (p) { return '<li>' + p.titulo + ': ' + p.desc + '</li>'; }).join('') + '</ul>' +
      (madre ? '<h4>Mantener madre</h4><ul>' + MANTENER_MADRE.map(function (p) { return '<li>' + p.titulo + ': ' + p.desc + '</li>'; }).join('') + '</ul>' : '') +
      '</details>';
    try {
      if (typeof renderMedirGeneticaBreederPanel === 'function') renderMedirGeneticaBreederPanel();
    } catch (_) {}
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
      if (diasDesde >= 0 && diasDesde <= DOMO_DIA_PASOS.length) {
        const paso = DOMO_DIA_PASOS[Math.min(DOMO_DIA_PASOS.length - 1, diasDesde)];
        eventos.push({
          tipo: 'esqueje',
          icono: '💧',
          titulo: paso ? paso.titulo : 'Enraizamiento clones (día ' + (diasDesde + 1) + ')',
          desc: paso
            ? paso.desc
            : 'Domo HR 70–80 % · EC ' + ESQUEJES_EC_PH.enraizamiento.ec.min + '–' + ESQUEJES_EC_PH.enraizamiento.ec.max + ' µS',
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
    } else if (rec && rec.diasDesdeSesion != null && rec.diasDesdeSesion >= 0 && rec.diasDesdeSesion < DOMO_DIA_PASOS.length) {
      const paso = DOMO_DIA_PASOS[rec.diasDesdeSesion];
      avisos.push({
        titulo: '💧 Domo día ' + (rec.diasDesdeSesion + 1) + ' · ' + nombre,
        cuerpo: paso ? paso.desc : 'Ventila domo y vigila EC baja en clones.',
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

  function escHtml(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function renderDashEnraizadoHubHtml(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    const ep = ensureEsquejesState(cfg);
    const montProg = countMontajeEnraizado(ep);
    const montOk =
      typeof enraizadoMontajeCompleto === 'function' && enraizadoMontajeCompleto(cfg);
    const montPct = montProg.total
      ? Math.round((montProg.done / montProg.total) * 100)
      : 0;
    if (!montOk) {
      return (
        '<div class="hc-germ-hub-card hc-germ-hub-card--compact hc-germ-hub-card--enraizado">' +
        '<div class="hc-germ-hub-head hc-germ-hub-head--compact">' +
        '<div class="hc-germ-hub-badge hc-germ-hub-badge--enraizado">Enraizado · montaje</div>' +
        '<div class="hc-germ-hub-pct-ring" style="--hc-germ-pct:' +
        montPct +
        '%" aria-hidden="true"><span>' +
        montProg.done +
        '/' +
        montProg.total +
        '</span></div>' +
        '<div class="hc-germ-hub-titles">' +
        '<h2 class="hc-germ-hub-title">Prepara el domo</h2>' +
        '<p class="hc-germ-hub-sub hc-germ-hub-sub--compact">Checklist único compartido con Sistema y Medir · <strong>' +
        montPct +
        '%</strong></p>' +
        '</div></div>' +
        '<p class="setup-field-hint setup-field-hint--banner">Domo, rockwool pH 5,5, higiene, luz 18/6 y aireación antes del corte.</p>' +
        '<p class="setup-field-hint">Tras el traslado al cubo: asigna cada clone en <strong>Sistema</strong> y añade una <strong>foto por cesta</strong> — aparecerá en el esquema.</p>' +
        '<p class="hc-germ-hub-sistema-cta">' +
        '<button type="button" class="btn btn-primary btn-sm" onclick="typeof hcOpenPropagadorMontajeChecklist===\'function\'&&hcOpenPropagadorMontajeChecklist()">Abrir checklist de enraizado</button> ' +
        '<button type="button" class="btn btn-secondary btn-sm" onclick="typeof goTab===\'function\'&&goTab(\'sistema\')">Ver pasos en Sistema</button>' +
        '</p></div>'
      );
    }
    const rec = getRecomendacionEcPhEsquejes(cfg);
    const fase = getFaseEsquejesActual(cfg);
    const domoDone = Object.keys(ep.domoDias || {}).filter(function (k) {
      return ep.domoDias[k];
    }).length;
    const pct = Math.round((domoDone / DOMO_DIA_PASOS.length) * 100);
    const diaSug = getDomoDiaSugerido(ep);
    const pasoHoy = diaSug ? DOMO_DIA_PASOS[diaSug - 1] : null;
    const diasDesde =
      rec && rec.diasDesdeSesion != null && rec.diasDesdeSesion >= 0 ? rec.diasDesdeSesion + 1 : null;
    const alerta =
      diasDesde != null && diasDesde <= DOMO_DIA_PASOS.length
        ? '<p class="setup-field-hint setup-field-hint--banner">Día <strong>' +
          diasDesde +
          '</strong> post-corte' +
          (pasoHoy ? ' · ' + escHtml(pasoHoy.titulo) : '') +
          '</p>'
        : '<p class="setup-field-hint">Registra la sesión de corte en Medir para activar el calendario domo día a día.</p>';
    const ecHtml = fase
      ? '<p class="hc-enr-hub-ec setup-field-hint">EC ' +
        fase.ec.min +
        '–' +
        fase.ec.max +
        ' µS · pH ' +
        fase.ph.min +
        '–' +
        fase.ph.max +
        '</p>'
      : '';
    return (
      '<div class="hc-germ-hub-card hc-germ-hub-card--compact hc-germ-hub-card--enraizado">' +
      '<div class="hc-germ-hub-head hc-germ-hub-head--compact">' +
      '<div class="hc-germ-hub-badge hc-germ-hub-badge--enraizado">Enraizado de esquejes</div>' +
      '<div class="hc-germ-hub-pct-ring" style="--hc-germ-pct:' +
      pct +
      '%" aria-hidden="true"><span>' +
      domoDone +
      '/' +
      DOMO_DIA_PASOS.length +
      '</span></div>' +
      '<div class="hc-germ-hub-titles">' +
      '<h2 class="hc-germ-hub-title">Domo y rockwool</h2>' +
      '<p class="hc-germ-hub-sub hc-germ-hub-sub--compact">Progreso domo <strong>' +
      pct +
      '%</strong> · HR 70–80 % · ventilar 2×/día</p>' +
      '</div></div>' +
      alerta +
      (pasoHoy
        ? '<div class="hc-enr-hub-hoy card"><strong>Hoy (día ' +
          pasoHoy.dia +
          ')</strong><p>' +
          escHtml(pasoHoy.desc) +
          '</p></div>'
        : '') +
      ecHtml +
      (diaSug != null && diaSug >= 8
        ? '<p class="setup-field-hint setup-field-hint--banner hc-enr-foto-tip">Al trasladar al net pot: en <strong>Sistema</strong> pulsa cada cesta → <strong>Fotos de seguimiento</strong>. La miniatura sustituye el icono genérico en el dibujo.</p>'
        : '<p class="setup-field-hint hc-enr-foto-tip">Cuando tengas raíces en rockwool y pases al cubo, una foto por cesta en Sistema ayuda a reconocer cada clone en el esquema.</p>') +
      '<p class="hc-germ-hub-sistema-cta">' +
      '<button type="button" class="btn btn-secondary btn-sm" onclick="typeof goTab===\'function\'&&goTab(\'sistema\')">Esquema domo → Sistema</button> ' +
      '<button type="button" class="btn btn-primary btn-sm" onclick="typeof goTab===\'function\'&&goTab(\'medir\')">Protocolo completo → Medir</button>' +
      '</p></div>'
    );
  }

  function refreshDashEnraizadoHub(cfg) {
    const host = el('dashEnraizadoHub');
    if (!host) return;
    const show =
      typeof hcEsquejeEnraizadoHubEsPrincipal === 'function' && hcEsquejeEnraizadoHubEsPrincipal(cfg);
    if (!show) {
      host.classList.add('setup-hidden');
      host.innerHTML = '';
      return;
    }
    host.classList.remove('setup-hidden');
    host.innerHTML = renderDashEnraizadoHubHtml(cfg);
  }

  function renderDashMadreHubHtml(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    const ep = ensureEsquejesState(cfg);
    const matOk = typeof cultivoMatrizListo === 'function' && cultivoMatrizListo();
    const depOk = typeof depositoListo === 'function' && depositoListo(cfg);
    const proxima = getProximaSesionFecha(ep);
    const proxTxt = proxima ? proxima.toLocaleDateString('es-ES') : '—';
    const fase = getFaseEsquejesActual(cfg);
    const ecHtml = fase
      ? '<p class="hc-enr-hub-ec setup-field-hint">' +
        escHtml(fase.label) +
        ' · EC ' +
        fase.ec.min +
        '–' +
        fase.ec.max +
        ' µS</p>'
      : '';
    return (
      '<div class="hc-germ-hub-card hc-germ-hub-card--compact hc-germ-hub-card--madre">' +
      '<div class="hc-germ-hub-head hc-germ-hub-head--compact">' +
      '<div class="hc-germ-hub-badge hc-germ-hub-badge--madre">Cubo madre · 18/6</div>' +
      '<div class="hc-germ-hub-titles">' +
      '<h2 class="hc-germ-hub-title">Mantener y esquejar</h2>' +
      '<p class="hc-germ-hub-sub hc-germ-hub-sub--compact">' +
      (matOk ? 'Madre en matriz' : 'Pendiente: asignar madre') +
      ' · ' +
      (depOk ? 'Depósito listo' : 'Pendiente: primer llenado') +
      '</p></div></div>' +
      '<p class="setup-field-hint">Próxima sesión estimada: <strong>' +
      escHtml(proxTxt) +
      '</strong> · máx. ~30 % follaje por corte</p>' +
      ecHtml +
      '<p class="hc-germ-hub-sistema-cta">' +
      '<button type="button" class="btn btn-secondary btn-sm" onclick="typeof goTab===\'function\'&&goTab(\'sistema\')">Esquema DWC → Sistema</button> ' +
      '<button type="button" class="btn btn-primary btn-sm" onclick="typeof goTab===\'function\'&&goTab(\'medir\')">Sesiones y EC → Medir</button>' +
      '</p></div>'
    );
  }

  function refreshDashMadreHub(cfg) {
    const host = el('dashMadreHub');
    if (!host) return;
    const show = typeof hcMadreHubEsPrincipal === 'function' && hcMadreHubEsPrincipal(cfg);
    if (!show) {
      host.classList.add('setup-hidden');
      host.innerHTML = '';
      return;
    }
    host.classList.remove('setup-hidden');
    host.innerHTML = renderDashMadreHubHtml(cfg);
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
  window.getDomoDiaSugerido = getDomoDiaSugerido;
  window.DOMO_DIA_PASOS = DOMO_DIA_PASOS;
  window.MONTAJE_ENRAIZADO_IDS = MONTAJE_ENRAIZADO_IDS;
  window.hcEnraizadoChecksViewFromProtocolo = hcEnraizadoChecksViewFromProtocolo;
  window.hcGuardarEnraizadoChecksEnProtocolo = hcGuardarEnraizadoChecksEnProtocolo;
  window.hcMigrarEnraizadoMontajeLegacy = hcMigrarEnraizadoMontajeLegacy;
  window.countMontajeEnraizado = countMontajeEnraizado;
  window.refreshDashEnraizadoHub = refreshDashEnraizadoHub;
  window.refreshDashMadreHub = refreshDashMadreHub;
  window.renderDashEnraizadoHubHtml = renderDashEnraizadoHubHtml;
  window.renderDashMadreHubHtml = renderDashMadreHubHtml;
})();
