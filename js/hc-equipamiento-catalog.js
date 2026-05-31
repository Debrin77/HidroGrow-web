/**
 * HidroGrow — catálogo orientativo de equipamiento (marcas habituales en España).
 * La app solicita los datos indispensables por categoría para dimensionar, monitorizar y registrar.
 */
const EQUIP_CATEGORIAS = {
  armario: {
    id: 'armario',
    label: 'Armario / carpa',
    icon: '🏠',
    indispensable: true,
    campos: [
      { key: 'anchoM', label: 'Ancho (m)', type: 'number' },
      { key: 'largoM', label: 'Largo (m)', type: 'number' },
      { key: 'altoM', label: 'Alto (m)', type: 'number' },
    ],
    hint: 'Dimensiones interiores útiles. Define m², volumen y plantas típicas.',
  },
  led: {
    id: 'led',
    label: 'LED / iluminación',
    icon: '💡',
    indispensable: true,
    campos: [
      { key: 'watts', label: 'W consumo real', type: 'number' },
      { key: 'coberturaM2', label: 'Cobertura (m²)', type: 'number' },
      { key: 'ppfdMax', label: 'PPFD máx. (µmol)', type: 'number' },
    ],
    hint: 'W reales (no solo nombre comercial). Necesario para PPFD y distancia al dosel.',
  },
  extractor: {
    id: 'extractor',
    label: 'Extractor / intractor',
    icon: '💨',
    indispensable: true,
    campos: [
      { key: 'm3h', label: 'Caudal (m³/h)', type: 'number' },
      { key: 'diametroMm', label: 'Diámetro (mm)', type: 'number' },
    ],
    hint: 'Caudal a 0 Pa y diámetro de boca. Comparar con renovaciones/h de la sala.',
  },
  humidificador: {
    id: 'humidificador',
    label: 'Humidificador',
    icon: '💧',
    indispensable: false,
    campos: [{ key: 'capacidadLh', label: 'Capacidad (L/h)', type: 'number' }],
    hint: 'Recomendado en esquejes/veg si HR <55%. La app lo sugerirá en correcciones VPD.',
  },
  deshumidificador: {
    id: 'deshumidificador',
    label: 'Deshumidificador',
    icon: '🌫️',
    indispensable: false,
    campos: [{ key: 'capacidadLh', label: 'Extracción (L/h)', type: 'number' }],
    hint: 'Crítico en floración densa (HR >50%). Prioridad en cogollos compactos.',
  },
  medidor: {
    id: 'medidor',
    label: 'Medidor EC/pH / combo',
    icon: '📊',
    indispensable: true,
    campos: [
      { key: 'tipo', label: 'Tipo', type: 'text' },
      { key: 'calibracionDias', label: 'Calibrar cada (días)', type: 'number' },
    ],
    hint: 'Medidor pen o combo continuo. Calibración periódica en protocolo semanal.',
  },
};

/** Marcas habituales en growshops españoles — datos orientativos del fabricante. */
const EQUIPAMIENTO_CATALOG = [
  { id: 'sj_dark_room_120', categoria: 'armario', marca: 'Secret Jardin', modelo: 'Dark Room 120', top_es: true,
    specs: { anchoM: 1.2, largoM: 1.2, altoM: 2.0 }, nota: 'Carpa 120×120×200 cm clásica.' },
  { id: 'sj_dark_room_100', categoria: 'armario', marca: 'Secret Jardin', modelo: 'Dark Room 100', top_es: true,
    specs: { anchoM: 1, largoM: 1, altoM: 2.0 }, nota: '100×100×200 cm · 4–6 plantas SOG.' },
  { id: 'mammoth_pro_120', categoria: 'armario', marca: 'Mammoth', modelo: 'Pro+ 120', top_es: true,
    specs: { anchoM: 1.2, largoM: 1.2, altoM: 2.0 }, nota: 'Refuerzo Pro+ · buena opacidad.' },
  { id: 'ghp_masters_tent_100', categoria: 'armario', marca: 'Garden Highpro', modelo: 'Master Tent 100', top_es: true,
    specs: { anchoM: 1, largoM: 1, altoM: 2.0 }, nota: 'Relación calidad/precio habitual en ES.' },

  { id: 'mars_ts1000', categoria: 'led', marca: 'Mars Hydro', modelo: 'TS-1000', top_es: true,
    specs: { watts: 150, coberturaM2: 0.76, ppfdMax: 900 }, nota: '~150 W reales · flor 60×60–75×75 cm.' },
  { id: 'mars_fc6500', categoria: 'led', marca: 'Mars Hydro', modelo: 'FC6500', top_es: true,
    specs: { watts: 730, coberturaM2: 1.5, ppfdMax: 1100 }, nota: 'Barra full spectrum · 120×120 cm.' },
  { id: 'lumatek_zeus_600w', categoria: 'led', marca: 'Lumatek', modelo: 'Zeus 600W Pro', top_es: true,
    specs: { watts: 600, coberturaM2: 1.44, ppfdMax: 1200 }, nota: 'Dimmer 25–100 % · alta eficiencia.' },
  { id: 'sanlight_evo_4_80', categoria: 'led', marca: 'SANlight', modelo: 'EVO 4-80', top_es: true,
    specs: { watts: 210, coberturaM2: 0.8, ppfdMax: 950 }, nota: 'Premium ES · espectro 3.0.' },

  { id: 'rvk_sileo_125', categoria: 'extractor', marca: 'RVK', modelo: 'SILEO EC 125', top_es: true,
    specs: { m3h: 428, diametroMm: 125 }, nota: 'EC motor · silencioso · 125 mm.' },
  { id: 'rvk_sileo_150', categoria: 'extractor', marca: 'RVK', modelo: 'SILEO EC 150', top_es: true,
    specs: { m3h: 780, diametroMm: 150 }, nota: 'Salas 1–1.5 m³/min según filtro.' },
  { id: 'prima_klima_pk125', categoria: 'extractor', marca: 'Prima Klima', modelo: 'PK125-TC', top_es: true,
    specs: { m3h: 400, diametroMm: 125 }, nota: 'Control temp. opcional TC.' },
  { id: 'torin_ac_315', categoria: 'extractor', marca: 'Torin', modelo: 'AC Silent 315', top_es: true,
    specs: { m3h: 1750, diametroMm: 315 }, nota: 'Salas grandes / RDWC multi-cubo.' },

  { id: 'progrow_ultrasonic', categoria: 'humidificador', marca: 'ProGrow', modelo: 'Ultrasonic 8L', top_es: true,
    specs: { capacidadLh: 0.35 }, nota: 'Ultrasónico grow · bandeja o manguera.' },
  { id: 'boneco_u7145', categoria: 'humidificador', marca: 'Boneco', modelo: 'U7145', top_es: true,
    specs: { capacidadLh: 0.5 }, nota: 'Uso doméstico/sala pequeña.' },

  { id: 'trotec_ttk40e', categoria: 'deshumidificador', marca: 'TROTEC', modelo: 'TTK 40 E', top_es: true,
    specs: { capacidadLh: 0.85 }, nota: '~16 L/día · floración 120×120.' },
  { id: 'meaco_12l', categoria: 'deshumidificador', marca: 'Meaco', modelo: '12L Low Energy', top_es: true,
    specs: { capacidadLh: 0.5 }, nota: 'Compacto · salas medianas.' },

  { id: 'bluelab_combo', categoria: 'medidor', marca: 'Bluelab', modelo: 'Combo Meter', top_es: true,
    specs: { tipo: 'EC+pH pen', calibracionDias: 30 }, nota: 'Referencia pro · calibrar mensual.' },
  { id: 'hm_digital_com83', categoria: 'medidor', marca: 'HM Digital', modelo: 'COM-83', top_es: true,
    specs: { tipo: 'EC+pH combo', calibracionDias: 30 }, nota: 'Económico · calibración frecuente.' },
  { id: 'adwa_ph_ec', categoria: 'medidor', marca: 'Adwa', modelo: 'pH/EC AD12', top_es: true,
    specs: { tipo: 'EC+pH pen', calibracionDias: 14 }, nota: 'Entrada habitual · calibrar cada 2 sem.' },
];

function getEquipCategorias() {
  return EQUIP_CATEGORIAS;
}

function getEquipamientoByCategoria(catId) {
  return EQUIPAMIENTO_CATALOG.filter(function (e) { return e.categoria === catId; });
}

function getEquipamientoById(id) {
  return EQUIPAMIENTO_CATALOG.find(function (e) { return e.id === id; }) || null;
}

function getEquipTopPorCategoria(catId) {
  return getEquipamientoByCategoria(catId).filter(function (e) { return e.top_es; });
}

window.EQUIP_CATEGORIAS = EQUIP_CATEGORIAS;
window.EQUIPAMIENTO_CATALOG = EQUIPAMIENTO_CATALOG;
window.getEquipCategorias = getEquipCategorias;
window.getEquipamientoByCategoria = getEquipamientoByCategoria;
window.getEquipamientoById = getEquipamientoById;
window.getEquipTopPorCategoria = getEquipTopPorCategoria;
