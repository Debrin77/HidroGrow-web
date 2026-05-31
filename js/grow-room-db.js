/**
 * HidroGrow — plantillas de armario / carpa y reglas orientativas de sala.
 */
const GROW_ROOM_TENTS = [
  { id: '60x60', nombre: '60 × 60 cm', anchoM: 0.6, largoM: 0.6, altoM: 1.6, plantasTip: '1-2' },
  { id: '80x80', nombre: '80 × 80 cm', anchoM: 0.8, largoM: 0.8, altoM: 1.8, plantasTip: '2-4' },
  { id: '100x100', nombre: '100 × 100 cm', anchoM: 1, largoM: 1, altoM: 2, plantasTip: '4-6' },
  { id: '120x120', nombre: '120 × 120 cm', anchoM: 1.2, largoM: 1.2, altoM: 2, plantasTip: '6-9' },
  { id: '240x120', nombre: '240 × 120 cm', anchoM: 2.4, largoM: 1.2, altoM: 2, plantasTip: '12-16' },
];

/** W/m² orientativos por fase (cannabis interior LED). */
const GROW_ROOM_W_M2 = {
  esqueje: { min: 100, obj: 150, max: 200 },
  vegetativo: { min: 250, obj: 350, max: 450 },
  prefloracion: { min: 350, obj: 450, max: 550 },
  floracion: { min: 450, obj: 550, max: 700 },
};

/** Renovaciones de aire por hora (volumen sala). */
const GROW_ROOM_AIR_EXCHANGES = {
  min: 30,
  obj: 60,
  max: 90,
};
