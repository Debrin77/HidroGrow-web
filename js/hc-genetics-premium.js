/**
 * HidroGrow — perfiles premium por genética (altura, stretch, VPD, esquejes).
 */
const GENETICS_PREMIUM_BY_GRUPO = {
  auto: {
    alturaMaxCm: 100,
    stretchPct: 25,
    feedIntensity: 'media',
    humedadFlorMax: 55,
    metodoSugerido: 'SOG',
    calMag: 'moderado',
    ppfdFlorMin: 400,
    diasEnraizarExtra: 0,
    intervaloSesionEsquejes: 12,
    ecMultEsqueje: 1.0,
    notaEsqueje: 'Autofloreciente: no usar como madre clásica; clones de auto enraizan bien pero ciclo corto.',
  },
  indica: {
    alturaMaxCm: 120,
    stretchPct: 35,
    feedIntensity: 'media',
    humedadFlorMax: 50,
    metodoSugerido: 'SOG',
    calMag: 'moderado',
    ppfdFlorMin: 450,
    diasEnraizarExtra: -1,
    intervaloSesionEsquejes: 12,
    ecMultEsqueje: 1.0,
    notaEsqueje: 'Indica: enraizamiento rápido (4–8 d típico). Brotes compactos en madre.',
  },
  hibrida: {
    alturaMaxCm: 140,
    stretchPct: 50,
    feedIntensity: 'media-alta',
    humedadFlorMax: 48,
    metodoSugerido: 'SCROG',
    calMag: 'moderado',
    ppfdFlorMin: 500,
    diasEnraizarExtra: 0,
    intervaloSesionEsquejes: 12,
    ecMultEsqueje: 1.0,
    notaEsqueje: 'Híbrida: perfil medio. Consulta ficha del breeder para tiempos exactos.',
  },
  sativa: {
    alturaMaxCm: 180,
    stretchPct: 75,
    feedIntensity: 'alta',
    humedadFlorMax: 45,
    metodoSugerido: 'SCROG',
    calMag: 'alto',
    ppfdFlorMin: 550,
    diasEnraizarExtra: 3,
    intervaloSesionEsquejes: 14,
    ecMultEsqueje: 1.05,
    notaEsqueje: 'Sativa: +3 d enraizamiento típico; madre vigorosa — no cortes >30 % follaje por sesión.',
  },
  cbd: {
    alturaMaxCm: 130,
    stretchPct: 40,
    feedIntensity: 'baja',
    humedadFlorMax: 52,
    metodoSugerido: 'SOG',
    calMag: 'moderado',
    ppfdFlorMin: 400,
    diasEnraizarExtra: 1,
    intervaloSesionEsquejes: 12,
    ecMultEsqueje: 0.9,
    notaEsqueje: 'CBD / ratio alto: EC esqueje ~10 % más baja; crecimiento más pausado.',
  },
};

function getGeneticsPremiumProfile(cultivo) {
  if (!cultivo) return Object.assign({}, GENETICS_PREMIUM_BY_GRUPO.hibrida);
  const grupo = cultivo.grupo || 'hibrida';
  const base = Object.assign({}, GENETICS_PREMIUM_BY_GRUPO[grupo] || GENETICS_PREMIUM_BY_GRUPO.hibrida);
  if (cultivo.tipoFloracion === 'auto') {
    Object.assign(base, GENETICS_PREMIUM_BY_GRUPO.auto);
  }
  const keys = [
    'alturaMaxCm', 'stretchPct', 'feedIntensity', 'humedadFlorMax',
    'metodoSugerido', 'calMag', 'ppfdFlorMin',
    'diasEnraizarExtra', 'intervaloSesionEsquejes', 'ecMultEsqueje', 'notaEsqueje',
  ];
  keys.forEach(function (k) {
    if (cultivo[k] != null) base[k] = cultivo[k];
  });
  if (cultivo.dificultad === 'fácil') base.feedIntensity = 'media';
  if (cultivo.dificultad === 'difícil') base.feedIntensity = 'alta';
  return base;
}

/** Ajustes de protocolo esquejes según genética activa en torre o preferencia premium. */
function getGeneticsEsquejesAdjustments(cultivoOrCfg) {
  let cultivo = cultivoOrCfg;
  if (cultivoOrCfg && typeof cultivoOrCfg === 'object' && !cultivoOrCfg.grupo && !cultivoOrCfg.nombre) {
    const cfg = cultivoOrCfg;
    cultivo = null;
    try {
      const tor = (typeof state !== 'undefined' && state && state.torre) ? state.torre : [];
      for (let n = 0; n < tor.length && !cultivo; n++) {
        (tor[n] || []).forEach(function (c) {
          if (c && c.variedad && typeof getCultivoDB === 'function') {
            cultivo = getCultivoDB(c.variedad);
          }
        });
      }
    } catch (_) {}
    if (!cultivo && cfg.geneticaPref && typeof getCultivoDB === 'function') {
      const g = String(cfg.geneticaPref).toLowerCase();
      if (g === 'auto') cultivo = { grupo: 'auto', tipoFloracion: 'auto', nombre: 'Autofloreciente' };
      else cultivo = { grupo: 'hibrida', tipoFloracion: 'foto', nombre: 'Fotodependiente' };
    }
  }
  const p = getGeneticsPremiumProfile(cultivo);
  return {
    diasEnraizarExtra: Number(p.diasEnraizarExtra) || 0,
    intervaloSesionEsquejes: Math.max(10, Math.min(16, Number(p.intervaloSesionEsquejes) || 12)),
    ecMultEsqueje: Math.max(0.75, Math.min(1.15, Number(p.ecMultEsqueje) || 1)),
    notaEsqueje: p.notaEsqueje || '',
    nombreGenetica: cultivo ? (cultivo.nombre || cultivo.id || '') : '',
    notaBreeder: cultivo && cultivo.nota ? String(cultivo.nota).slice(0, 220) : '',
    humedadFlorMax: p.humedadFlorMax,
    ppfdFlorMin: p.ppfdFlorMin,
  };
}

function geneticsPremiumConsejo(cultivo) {
  const p = getGeneticsPremiumProfile(cultivo);
  const parts = [];
  parts.push('Altura orientativa ~' + p.alturaMaxCm + ' cm');
  parts.push('estiramiento ~' + p.stretchPct + '% en 12/12');
  parts.push('método ' + p.metodoSugerido);
  parts.push('HR flor ≤' + p.humedadFlorMax + '%');
  if (cultivo && cultivo.tipoFloracion === 'auto') {
    parts.push('autofloreciente: no cambiar fotoperiodo');
  }
  return parts.join(' · ');
}

window.getGeneticsPremiumProfile = getGeneticsPremiumProfile;
window.getGeneticsEsquejesAdjustments = getGeneticsEsquejesAdjustments;
window.geneticsPremiumConsejo = geneticsPremiumConsejo;
