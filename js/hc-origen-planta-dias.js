/**
 * Días medios pre-hidro por origen (cannabis / genéticas HidroGrow).
 * La fecha en ficha = trasplante al DWC/RDWC; el offset alinea EC, riego y avisos de cosecha.
 */
const HC_GRUPOS_CANNABIS = ['auto', 'indica', 'hibrida', 'sativa', 'cbd'];

/** Germinación propia: domo + rockwool hasta net pot (media orientativa ES). */
const HC_DIAS_PRE_HIDRO_GERMINACION = {
  auto: 13,
  indica: 16,
  hibrida: 17,
  sativa: 18,
  cbd: 17,
};

/** Esqueje / madre: enraizado en propagador antes del depósito. */
const HC_DIAS_PRE_HIDRO_CLON = {
  auto: 9,
  indica: 10,
  hibrida: 10,
  sativa: 12,
  cbd: 10,
};

/** Plántula ya enrockwool (clone shop); equivalente vivero hortícola. */
const HC_DIAS_VIVERO_CANNABIS = 18;

function esCultivoCannabis(cultivo) {
  if (!cultivo) return false;
  const g = String(cultivo.grupo || '').toLowerCase();
  return HC_GRUPOS_CANNABIS.indexOf(g) >= 0;
}

function hcGrupoCannabisDefault(cultivo) {
  const g = cultivo && String(cultivo.grupo || '').toLowerCase();
  return HC_GRUPOS_CANNABIS.indexOf(g) >= 0 ? g : 'hibrida';
}

/**
 * Días medios en plug/vivero (hortícolas). En HidroGrow solo cannabis en catálogo → 0 salvo vivero cannabis.
 */
function getDiasPlantonViveroEstimado(cultivo) {
  if (esCultivoCannabis(cultivo)) return HC_DIAS_VIVERO_CANNABIS;
  return 0;
}

/**
 * Offset de edad biológica según origen (solo cannabis; hortícolas: vivero vía getDiasPlantonViveroEstimado).
 * @param {object|null} cultivo
 * @param {string} origen normalizado: germinacion | clon | madre | vivero | ''
 */
function getDiasPreHidroPorOrigen(cultivo, origen) {
  const o = String(origen || '').toLowerCase();
  if (!o) return 0;
  if (!esCultivoCannabis(cultivo)) {
    if (o === 'vivero') return getDiasPlantonViveroEstimado(cultivo);
    return 0;
  }
  const g = hcGrupoCannabisDefault(cultivo);
  if (o === 'germinacion') {
    const d = HC_DIAS_PRE_HIDRO_GERMINACION[g];
    return Number.isFinite(d) && d > 0 ? Math.round(d) : 17;
  }
  if (o === 'clon' || o === 'madre') {
    const d = HC_DIAS_PRE_HIDRO_CLON[g];
    return Number.isFinite(d) && d > 0 ? Math.round(d) : 10;
  }
  if (o === 'vivero') return HC_DIAS_VIVERO_CANNABIS;
  return 0;
}

/** Offset unificado a partir de ficha + cultivo. */
function getDiasOffsetOrigenPlanta(c, cultivo) {
  if (!c) return 0;
  const orig =
    typeof normalizarOrigenPlanta === 'function'
      ? normalizarOrigenPlanta(c.origenPlanta)
      : String(c.origenPlanta || '').toLowerCase();
  if (!orig) return 0;
  const cu = cultivo || (typeof getCultivoDB === 'function' ? getCultivoDB(c.variedad) : null);
  return getDiasPreHidroPorOrigen(cu, orig);
}

function getDiasEnSistemaDesdeFecha(c, refFinMs) {
  if (!c || !c.fecha) return 0;
  const ms = new Date(c.fecha).getTime();
  if (!Number.isFinite(ms)) return 0;
  const fin = Number.isFinite(refFinMs) ? refFinMs : Date.now();
  return Math.max(0, Math.floor((fin - ms) / 86400000));
}

function etiquetaOffsetOrigenBreve(origen, diasOffset) {
  const o = String(origen || '').toLowerCase();
  if (!diasOffset || diasOffset <= 0) return '';
  if (o === 'germinacion') return '+' + diasOffset + ' d germ.';
  if (o === 'clon') return '+' + diasOffset + ' d enraiz.';
  if (o === 'madre') return '+' + diasOffset + ' d corte';
  if (o === 'vivero') return '+' + diasOffset + ' d plug';
  return '+' + diasOffset + ' d';
}

window.HC_GRUPOS_CANNABIS = HC_GRUPOS_CANNABIS;
window.esCultivoCannabis = esCultivoCannabis;
window.getDiasPlantonViveroEstimado = getDiasPlantonViveroEstimado;
window.getDiasPreHidroPorOrigen = getDiasPreHidroPorOrigen;
window.getDiasOffsetOrigenPlanta = getDiasOffsetOrigenPlanta;
window.getDiasEnSistemaDesdeFecha = getDiasEnSistemaDesdeFecha;
window.etiquetaOffsetOrigenBreve = etiquetaOffsetOrigenBreve;
