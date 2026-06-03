/**
 * Referencia orientativa: cesta (Ø), canal, profundidad SRF, etc. por grupo de genética,
 * sistema hidropónico y objetivo (flor completa vs SOG/esquejes).
 */
const HC_CESTA_MATRIX_GRUPOS = [
  { key: 'indica', label: 'Índica' },
  { key: 'hibrida', label: 'Híbrida' },
  { key: 'sativa', label: 'Sativa' },
  { key: 'auto', label: 'Autofloreciente' },
  { key: 'cbd', label: 'CBD / perfil suave' },
];

const HC_CESTA_MATRIX_SISTEMAS = [
  { id: 'dwc', label: 'DWC (cubos aireados)' },
  { id: 'rdwc', label: 'RDWC (recirculación)' },
];

function hcCultivoObjetivoEsBaby(objetivo) {
  const v = String(objetivo || '')
    .trim()
    .toLowerCase();
  return v === 'baby' || v === 'baby_leaf' || v === 'micro' || v === 'sog';
}

/** Celda de la matriz: textos para tabla Consejos y valores numéricos para “Aplicar” en asistente. */
function hcCultivoCestaRecoCelda(grupo, sistemaId, objetivo) {
  const g = String(grupo || 'hibrida').trim().toLowerCase();
  const sys = String(sistemaId || 'dwc').trim().toLowerCase();
  const baby = hcCultivoObjetivoEsBaby(objetivo);
  const compact = g === 'indica' || g === 'auto' || g === 'cbd';
  const tall = g === 'sativa';

  if (sys === 'dwc' || sys === 'rdwc') {
    const pref = sys === 'rdwc' ? 'Cubo ' : '';
    if (baby) {
      return {
        txt: pref + 'Ø 50 mm · clones / plántula',
        rimReco: 50,
        heightReco: 60,
      };
    }
    if (tall) {
      const bucket = sys === 'rdwc' ? ' · cubo 30–40 L' : ' · cubo 20–30 L';
      return {
        txt: pref + 'Ø 100 mm (4")' + bucket,
        rimReco: 100,
        heightReco: 100,
      };
    }
    const bucket = sys === 'rdwc' ? ' · cubo 20–30 L' : '';
    return {
      txt: pref + (compact ? 'Ø 75 mm (3")' : 'Ø 75–100 mm') + bucket,
      rimReco: compact ? 75 : 90,
      heightReco: compact ? 85 : 100,
    };
  }

  return { txt: '—' };
}

/** true = asistente «Nueva instalación» (sin heredar otra ranura activa). */
function hcSetupAsistenteInstalacionNueva() {
  try {
    return !!(typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre);
  } catch (_) {
    return false;
  }
}

function hcContarGrupoDominanteDesdeClaves(keys) {
  const cnt = {};
  (keys || []).forEach(k => {
    const g = String(k || '').trim().toLowerCase();
    if (!g) return;
    cnt[g] = (cnt[g] || 0) + 1;
  });
  let best = '';
  let bestN = -1;
  Object.keys(cnt).forEach(k => {
    if (cnt[k] > bestN) {
      best = k;
      bestN = cnt[k];
    }
  });
  return best;
}

/** Grupo de genética dominante: en instalación nueva solo paso Cultivos del asistente. */
function hcGrupoCultivoDominanteDesdeConfig(cfg) {
  cfg = cfg || {};
  const claves = [];
  try {
    if (typeof setupPlantasSeleccionadas !== 'undefined' && setupPlantasSeleccionadas.size > 0) {
      setupPlantasSeleccionadas.forEach(k => claves.push(k));
    }
  } catch (_) {}
  if (hcSetupAsistenteInstalacionNueva()) {
    return hcContarGrupoDominanteDesdeClaves(claves) || 'hibrida';
  }
  try {
    const tor = state.torre || [];
    for (let i = 0; i < tor.length; i++) {
      const row = tor[i] || [];
      for (let j = 0; j < row.length; j++) {
        const v = row[j] && row[j].variedad;
        if (!v || typeof getCultivoDB !== 'function') continue;
        const cult = getCultivoDB(v);
        if (cult && cult.grupo) claves.push(cult.grupo);
      }
    }
  } catch (_) {}
  if (Array.isArray(cfg.cultivosIniciales)) {
    cfg.cultivosIniciales.forEach(v => {
      if (v) claves.push(v);
    });
  }
  const best = hcContarGrupoDominanteDesdeClaves(claves);
  if (best) return best;
  const mk = typeof normalizeTorreModoActual === 'function' ? normalizeTorreModoActual(modoActual) : modoActual;
  if (mk === 'intensivo') return 'indica';
  if (mk === 'esquejes' || mk === 'mini') return 'auto';
  if (mk === 'floracion') return 'hibrida';
  return 'hibrida';
}

/** ¿Hay cultivos elegidos en el paso Cultivos del asistente (sin leer otra instalación)? */
function hcSetupHayCultivosEnAsistente(draft) {
  try {
    if (typeof setupPlantasSeleccionadas !== 'undefined' && setupPlantasSeleccionadas.size > 0) return true;
  } catch (_) {}
  if (hcSetupAsistenteInstalacionNueva()) return false;
  return !!(draft && Array.isArray(draft.cultivosIniciales) && draft.cultivosIniciales.length > 0);
}

function hcObjetivoCultivoDesdeConfig(cfg, tipo) {
  cfg = cfg || {};
  const t = String(tipo || cfg.tipoInstalacion || '').toLowerCase();
  if (t === 'rdwc' || t === 'dwc') {
    if (typeof dwcGetObjetivoCultivo === 'function') return dwcGetObjetivoCultivo(cfg);
  }
  if (cfg.objetivoCultivo) return hcCultivoObjetivoEsBaby(cfg.objetivoCultivo) ? 'baby' : 'final';
  return 'final';
}

const HC_FASE_PLANTA_LABELS = {
  germinacion: 'Germinación',
  plantula: 'Plántula',
  vegetativo: 'Vegetativo',
  prefloracion: 'Prefloración',
  floracion: 'Floración',
  fructificacion: 'Fructificación',
  crecimiento: 'Crecimiento',
  madurez: 'Madurez',
  cosecha: 'Cosecha',
};

/** Etiqueta de posición (maceta, módulo, hueco…) según tipo de instalación activa. */
function hcLabelUbicacionCultivo(nivel, cesta, cfg) {
  const c = cfg || (typeof state !== 'undefined' ? state.configTorre : null) || {};
  const ci = Number(cesta) + 1;
  const enPropagador =
    c.germinacionEnPropagador ||
    (typeof getSistemaFaseCamino === 'function' && getSistemaFaseCamino(c) === 'propagador');
  if (enPropagador) return 'Alvéolo ' + ci;
  const tipo =
    typeof tipoInstalacionNormalizado === 'function'
      ? tipoInstalacionNormalizado(c)
      : String(c.tipoInstalacion || 'dwc').toLowerCase();
  const n = Number(nivel) + 1;
  if (tipo === 'rdwc') return 'Módulo ' + n + '-' + ci;
  return 'Maceta ' + n + '-' + ci;
}

function hcFasePlantaLabelTexto(cultivo, cesta) {
  if (cesta && String(cesta.origenPlanta || '').toLowerCase() === 'germinacion') {
    const cfg = typeof state !== 'undefined' ? state.configTorre || {} : {};
    if (
      cfg.germinacionEnPropagador ||
      (typeof getSistemaFaseCamino === 'function' && getSistemaFaseCamino(cfg) === 'propagador')
    ) {
      return 'Germinación';
    }
  }
  if (!cultivo || !cesta || !cesta.fecha) return 'Sin fecha';
  const ms = new Date(cesta.fecha).getTime();
  if (!Number.isFinite(ms)) return 'Sin fecha';
  if (typeof cultivoFaseDesdeDias === 'function') {
    const dias =
      typeof getDiasEfectivosCicloBiologico === 'function'
        ? getDiasEfectivosCicloBiologico(cesta, cultivo, Date.now())
        : Math.max(0, Math.floor((Date.now() - ms) / 86400000));
    const f = cultivoFaseDesdeDias(cultivo, dias, { desdeTrasplante: true });
    if (f && f.key) return HC_FASE_PLANTA_LABELS[f.key] || f.key;
  }
  if (typeof getEstado === 'function') {
    const dias =
      typeof getDiasEfectivosCicloBiologico === 'function'
        ? getDiasEfectivosCicloBiologico(cesta, cultivo, Date.now())
        : Math.max(0, Math.floor((Date.now() - ms) / 86400000));
    const est = getEstado(cultivo.id || cultivo.nombre, dias);
    if (est === 'plantula') return 'Plántula';
    if (est === 'crecimiento') return 'Vegetativo';
    if (est === 'madurez' || est === 'cosecha') {
      return cultivo.fructificacion ? 'Fructificación' : 'Floración';
    }
  }
  return '—';
}

/** Plantas con variedad asignada en la matriz de la instalación activa. */
function hcCollectPlantasInstalacionActiva() {
  const items = [];
  const cfg = typeof state !== 'undefined' ? state.configTorre || {} : {};
  const niveles =
    typeof getNivelesActivos === 'function'
      ? getNivelesActivos()
      : (state.torre || []).map((_, i) => i);
  niveles.forEach(n => {
    (state.torre[n] || []).forEach((c, ci) => {
      if (!c || !c.variedad) return;
      const cult = typeof getCultivoDB === 'function' ? getCultivoDB(c.variedad) : null;
      const nombre =
        typeof cultivoNombreLista === 'function'
          ? cultivoNombreLista(cult, c.variedad)
          : String(c.variedad || '—');
      const tieneFecha =
        typeof cestaTieneFechaValida === 'function' ? cestaTieneFechaValida(c.fecha) : !!c.fecha;
      let dias = null;
      if (tieneFecha && cult) {
        dias =
          typeof getDiasEfectivosCicloBiologico === 'function'
            ? getDiasEfectivosCicloBiologico(c, cult, Date.now())
            : Math.max(0, Math.floor((Date.now() - new Date(c.fecha).getTime()) / 86400000));
      }
      const origen =
        typeof etiquetaOrigenPlantaBreve === 'function'
          ? etiquetaOrigenPlantaBreve(c.origenPlanta)
          : '';
      items.push({
        nivel: n,
        cesta: ci,
        ubicacion: hcLabelUbicacionCultivo(n, ci, cfg),
        variedad: c.variedad,
        nombre,
        emoji: cult && cult.emoji ? cult.emoji : '🌿',
        dias: Number.isFinite(dias) ? dias : null,
        fase: tieneFecha ? hcFasePlantaLabelTexto(cult, c) : 'Sin fecha',
        origen,
        sinFecha: !tieneFecha,
      });
    });
  });
  return items;
}
