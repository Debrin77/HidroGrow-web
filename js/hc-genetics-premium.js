/**
 * HidroGrow — campos premium derivados de genéticas (altura, stretch, método, VPD).
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
  },
  indica: {
    alturaMaxCm: 120,
    stretchPct: 35,
    feedIntensity: 'media',
    humedadFlorMax: 50,
    metodoSugerido: 'SOG',
    calMag: 'moderado',
    ppfdFlorMin: 450,
  },
  hibrida: {
    alturaMaxCm: 140,
    stretchPct: 50,
    feedIntensity: 'media-alta',
    humedadFlorMax: 48,
    metodoSugerido: 'SCROG',
    calMag: 'moderado',
    ppfdFlorMin: 500,
  },
  sativa: {
    alturaMaxCm: 180,
    stretchPct: 75,
    feedIntensity: 'alta',
    humedadFlorMax: 45,
    metodoSugerido: 'SCROG',
    calMag: 'alto',
    ppfdFlorMin: 550,
  },
  cbd: {
    alturaMaxCm: 130,
    stretchPct: 40,
    feedIntensity: 'baja',
    humedadFlorMax: 52,
    metodoSugerido: 'SOG',
    calMag: 'moderado',
    ppfdFlorMin: 400,
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
  ];
  keys.forEach(function (k) {
    if (cultivo[k] != null) base[k] = cultivo[k];
  });
  if (cultivo.dificultad === 'fácil') base.feedIntensity = 'media';
  if (cultivo.dificultad === 'difícil') base.feedIntensity = 'alta';
  return base;
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
window.geneticsPremiumConsejo = geneticsPremiumConsejo;
