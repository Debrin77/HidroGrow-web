/**
 * HidroGrow — compatibilidad con el motor (espera CULTIVOS_DB).
 * Datos reales en genetics-db.js (GENETICS_DB).
 */
const CULTIVOS_DB =
  typeof GENETICS_DB !== 'undefined' && Array.isArray(GENETICS_DB) ? GENETICS_DB : [];
