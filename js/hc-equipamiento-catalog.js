/**
 * HidroGrow — catálogo orientativo de equipamiento (marcas habituales en España).
 * top_es + rank: referencia orientativa de los modelos más citados en growshops ES.
 */
const EQUIP_CATEGORIAS = {
  armario: {
    id: 'armario',
    label: 'Armario / carpa',
    icon: '🏠',
    entorno: 'interior',
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
    entorno: 'interior',
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
    entorno: 'interior',
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
    entorno: 'interior',
    indispensable: false,
    campos: [{ key: 'capacidadLh', label: 'Capacidad (L/h)', type: 'number' }],
    hint: 'Recomendado en esquejes/veg si HR por debajo de 55%. La app lo sugerirá en correcciones VPD.',
  },
  deshumidificador: {
    id: 'deshumidificador',
    label: 'Deshumidificador',
    icon: '🌫️',
    entorno: 'interior',
    indispensable: false,
    campos: [{ key: 'capacidadLh', label: 'Extracción (L/h)', type: 'number' }],
    hint: 'Crítico en floración densa (HR >50%). Prioridad en cogollos compactos.',
  },
  medidor: {
    id: 'medidor',
    label: 'Medidor EC/pH / combo',
    icon: '📊',
    entorno: 'both',
    indispensable: true,
    campos: [
      { key: 'tipo', label: 'Tipo', type: 'text' },
      { key: 'calibracionDias', label: 'Calibrar cada (días)', type: 'number' },
    ],
    hint: 'Medidor pen o combo continuo. Calibración periódica en protocolo semanal.',
  },
  bomba_aire: {
    id: 'bomba_aire',
    label: 'Bomba de aire / oxigenador',
    icon: '🫧',
    indispensable: false,
    campos: [
      { key: 'lpm', label: 'Caudal (L/min)', type: 'number' },
      { key: 'watts', label: 'W', type: 'number' },
    ],
    hint: 'Esencial en DWC/RDWC. Dimensiona L/min según litros del depósito y número de difusores.',
  },
  bomba_recirc: {
    id: 'bomba_recirc',
    label: 'Bomba de agua / recirculación',
    icon: '⚙️',
    indispensable: false,
    campos: [
      { key: 'lph', label: 'Caudal (L/h)', type: 'number' },
      { key: 'headM', label: 'Head (m)', type: 'number' },
    ],
    hint: 'RDWC/NFT/torre: caudal y altura manométrica según circuito. Revisa en montaje.',
  },
  co2: {
    id: 'co2',
    label: 'CO₂ / enriquecedor',
    icon: '🌬️',
    entorno: 'interior',
    indispensable: false,
    campos: [{ key: 'tipo', label: 'Sistema', type: 'text' }],
    hint: 'Botella + regulador o generador. Opcional; la app sugiere enriquecer si CO₂ bajo en Medir.',
  },
  filtro_carbon: {
    id: 'filtro_carbon',
    label: 'Filtro de carbón',
    icon: '🧫',
    entorno: 'interior',
    indispensable: false,
    recommended: true,
    campos: [
      { key: 'm3h', label: 'Caudal máx. (m³/h)', type: 'number' },
      { key: 'diametroMm', label: 'Diámetro (mm)', type: 'number' },
      { key: 'longitudCm', label: 'Longitud (cm)', type: 'number' },
    ],
    hint: 'Caudal ≥ extractor. Imprescindible contra olores en floración.',
  },
  ventilador_circ: {
    id: 'ventilador_circ',
    label: 'Ventilador circulación',
    icon: '🌀',
    entorno: 'both',
    indispensable: false,
    recommended: true,
    campos: [{ key: 'diametroMm', label: 'Diámetro (mm)', type: 'number' }],
    hint: 'Clip fan aparte del extractor: mueve aire en el dosel y reduce riesgo de moho.',
  },
  temporizador: {
    id: 'temporizador',
    label: 'Temporizador LED',
    icon: '⏱️',
    entorno: 'interior',
    indispensable: false,
    recommended: true,
    campos: [{ key: 'canales', label: 'Canales', type: 'number' }],
    hint: 'Fotoperiodo 18/6 veg · 12/12 flor. Un canal por panel LED.',
  },
  toldo_malla: {
    id: 'toldo_malla',
    label: 'Toldo / malla sombreo',
    icon: '⛱️',
    entorno: 'exterior',
    indispensable: false,
    recommended: true,
    campos: [{ key: 'sombreoPct', label: 'Sombreo (%)', type: 'number' }],
    hint: 'Protege del sol fuerte (>6 h directas en verano) y reduce estrés térmico.',
  },
  tijeras: {
    id: 'tijeras',
    label: 'Tijeras de poda',
    icon: '✂️',
    entorno: 'both',
    indispensable: false,
    campos: [{ key: 'tipo', label: 'Tipo', type: 'text' }],
    hint: 'Poda, defoliación y esquejes. Desinfecta con alcohol 70 % entre cortes.',
  },
  lupa: {
    id: 'lupa',
    label: 'Lupa tricomas',
    icon: '🔍',
    entorno: 'both',
    indispensable: false,
    campos: [{ key: 'aumento', label: 'Aumento', type: 'text' }],
    hint: '30×–60× para confirmar cosecha (lechoso → ámbar).',
  },
  propagador: {
    id: 'propagador',
    label: 'Domo / propagador',
    icon: '🫧',
    entorno: 'both',
    indispensable: false,
    recommended: true,
    campos: [
      { key: 'tipo', label: 'Tipo', type: 'text' },
      { key: 'bandejas', label: 'Bandejas / celdas', type: 'number' },
    ],
    hint: 'Bandeja con domo: 22–26 °C, HR 70–80 %, ventilar 2×/día. Imprescindible para germinar semilla antes del cubo rockwool.',
  },
  /** Semilla en hidro (DWC/RDWC): una cúpula por maceta, no bandeja propagador multicelda. */
  cupula_maceta: {
    id: 'cupula_maceta',
    label: 'Cúpula individual (por maceta)',
    icon: '🪴',
    entorno: 'both',
    indispensable: false,
    recommended: false,
    perMaceta: true,
    campos: [{ key: 'diametroCm', label: 'Ø aprox. (cm)', type: 'number' }],
    hint: 'Una unidad por cada net pot/cesta en el DWC/RDWC (no es propagador de 24–77 celdas). Oscuridad + HR los primeros días; quítala cuando el brote aguante.',
  },
  mat_termica_germ: {
    id: 'mat_termica_germ',
    label: 'Mat térmica (germinador)',
    icon: '🔥',
    entorno: 'interior',
    indispensable: false,
    recommended: true,
    campos: [{ key: 'watts', label: 'Potencia (W)', type: 'number' }],
    hint: 'Recomendada con semilla en invierno o estancia fría. También útil en esquejes bajo domo.',
  },
};

/** Marcas habituales en growshops españoles — datos orientativos del fabricante. */
const EQUIPAMIENTO_CATALOG = [
  { id: 'sj_dark_room_120', categoria: 'armario', marca: 'Secret Jardin', modelo: 'Dark Room 120', top_es: true, rank: 1,
    specs: { anchoM: 1.2, largoM: 1.2, altoM: 2.0 }, nota: 'Carpa 120×120×200 cm · la más vendida en ES.' },
  { id: 'sj_dark_room_100', categoria: 'armario', marca: 'Secret Jardin', modelo: 'Dark Room 100', top_es: true, rank: 2,
    specs: { anchoM: 1, largoM: 1, altoM: 2.0 }, nota: '100×100×200 cm · 4–6 plantas SOG.' },
  { id: 'sj_dark_room_150', categoria: 'armario', marca: 'Secret Jardin', modelo: 'Dark Room 150', top_es: true, rank: 3,
    specs: { anchoM: 1.5, largoM: 1.5, altoM: 2.0 }, nota: '150×150×200 cm · SCROG amplio.' },
  { id: 'mammoth_pro_120', categoria: 'armario', marca: 'Mammoth', modelo: 'Pro+ 120', top_es: true, rank: 4,
    specs: { anchoM: 1.2, largoM: 1.2, altoM: 2.0 }, nota: 'Refuerzo Pro+ · muy habitual en tiendas ES.' },
  { id: 'mammoth_pro_100', categoria: 'armario', marca: 'Mammoth', modelo: 'Pro+ 100', top_es: true, rank: 5,
    specs: { anchoM: 1, largoM: 1, altoM: 2.0 }, nota: 'Pro+ 100×100 · estructura rígida.' },
  { id: 'ghp_masters_tent_100', categoria: 'armario', marca: 'Garden Highpro', modelo: 'Master Tent 100', top_es: true, rank: 6,
    specs: { anchoM: 1, largoM: 1, altoM: 2.0 }, nota: 'Relación calidad/precio habitual en ES.' },
  { id: 'ghp_masters_tent_120', categoria: 'armario', marca: 'Garden Highpro', modelo: 'Master Tent 120', top_es: true, rank: 7,
    specs: { anchoM: 1.2, largoM: 1.2, altoM: 2.0 }, nota: '120×120 · opacidad y zip reforzados.' },
  { id: 'hydropony_focus_100', categoria: 'armario', marca: 'Hydropony', modelo: 'Focus 100', top_es: true, rank: 8,
    specs: { anchoM: 1, largoM: 1, altoM: 2.0 }, nota: 'Marca española · entrada growshop.' },
  { id: 'pure_tent_120', categoria: 'armario', marca: 'Pure Tent', modelo: '120', top_es: true, rank: 9,
    specs: { anchoM: 1.2, largoM: 1.2, altoM: 2.0 }, nota: 'Carpa económica muy repartida en ES.' },
  { id: 'sj_cable_room_90', categoria: 'armario', marca: 'Secret Jardin', modelo: 'Cable Room 90', top_es: true, rank: 10,
    specs: { anchoM: 0.9, largoM: 0.9, altoM: 1.6 }, nota: '90×90×160 cm · salas compactas / SOG.' },

  { id: 'mars_ts1000', categoria: 'led', marca: 'Mars Hydro', modelo: 'TS-1000', top_es: true, rank: 1,
    specs: { watts: 150, coberturaM2: 0.76, ppfdMax: 900 }, nota: '~150 W reales · flor 60×60–75×75 cm.' },
  { id: 'mars_fc6500', categoria: 'led', marca: 'Mars Hydro', modelo: 'FC6500', top_es: true, rank: 2,
    specs: { watts: 730, coberturaM2: 1.5, ppfdMax: 1100 }, nota: 'Barra full spectrum · 120×120 cm.' },
  { id: 'mars_sp3000', categoria: 'led', marca: 'Mars Hydro', modelo: 'SP-3000', top_es: true, rank: 3,
    specs: { watts: 300, coberturaM2: 0.9, ppfdMax: 1000 }, nota: 'Barra 2×120 cm · veg/ flor 90×90.' },
  { id: 'lumatek_zeus_600w', categoria: 'led', marca: 'Lumatek', modelo: 'Zeus 600W Pro', top_es: true, rank: 4,
    specs: { watts: 600, coberturaM2: 1.44, ppfdMax: 1200 }, nota: 'Dimmer 25–100 % · referencia pro ES.' },
  { id: 'lumatek_ats200w', categoria: 'led', marca: 'Lumatek', modelo: 'ATS 200W PRO', top_es: true, rank: 5,
    specs: { watts: 200, coberturaM2: 0.8, ppfdMax: 950 }, nota: 'ATS compacto · 80×80–100×100 cm.' },
  { id: 'sanlight_evo_4_80', categoria: 'led', marca: 'SANlight', modelo: 'EVO 4-80', top_es: true, rank: 6,
    specs: { watts: 210, coberturaM2: 0.8, ppfdMax: 950 }, nota: 'Premium austriaco · muy valorado en ES.' },
  { id: 'spider_sf2000', categoria: 'led', marca: 'Spider Farmer', modelo: 'SF-2000 EVO', top_es: true, rank: 7,
    specs: { watts: 200, coberturaM2: 0.9, ppfdMax: 980 }, nota: 'Samsung diodes · 90×90–100×100 cm.' },
  { id: 'nanolux_zx630', categoria: 'led', marca: 'Nanolux', modelo: 'ZX 630W', top_es: true, rank: 8,
    specs: { watts: 630, coberturaM2: 1.44, ppfdMax: 1150 }, nota: 'Barra 120×120 · growshops pro.' },
  { id: 'lumagrow_flash720', categoria: 'led', marca: 'Lumagrow', modelo: 'Flashmax 720W', top_es: true, rank: 9,
    specs: { watts: 720, coberturaM2: 1.5, ppfdMax: 1100 }, nota: '720 W barra · salas 120×120 densas.' },
  { id: 'greenception_x2000', categoria: 'led', marca: 'Greenception', modelo: 'LED X2000', top_es: true, rank: 10,
    specs: { watts: 200, coberturaM2: 0.75, ppfdMax: 920 }, nota: 'Alemana · distribución habitual ES.' },

  { id: 'rvk_sileo_125', categoria: 'extractor', marca: 'RVK', modelo: 'SILEO EC 125', top_es: true, rank: 1,
    specs: { m3h: 428, diametroMm: 125 }, nota: 'EC motor · silencioso · 125 mm · estándar ES.' },
  { id: 'rvk_sileo_150', categoria: 'extractor', marca: 'RVK', modelo: 'SILEO EC 150', top_es: true, rank: 2,
    specs: { m3h: 780, diametroMm: 150 }, nota: 'Salas 120×120 con filtro de carbón.' },
  { id: 'rvk_sileo_100', categoria: 'extractor', marca: 'RVK', modelo: 'SILEO EC 100', top_es: true, rank: 3,
    specs: { m3h: 280, diametroMm: 100 }, nota: '100 mm · carpas 80–100 cm.' },
  { id: 'prima_klima_pk125', categoria: 'extractor', marca: 'Prima Klima', modelo: 'PK125-TC', top_es: true, rank: 4,
    specs: { m3h: 400, diametroMm: 125 }, nota: 'Control temp. opcional TC.' },
  { id: 'prima_klima_pk160', categoria: 'extractor', marca: 'Prima Klima', modelo: 'PK160-TC', top_es: true, rank: 5,
    specs: { m3h: 800, diametroMm: 160 }, nota: '160 mm · salas 1.2–1.5 m con filtro XL.' },
  { id: 'vents_tt125', categoria: 'extractor', marca: 'Vents', modelo: 'TT 125', top_es: true, rank: 6,
    specs: { m3h: 280, diametroMm: 125 }, nota: 'Económico · muy usado como intractor.' },
  { id: 'can_fan_max_150', categoria: 'extractor', marca: 'Can-Fan', modelo: 'Max-Fan Pro 150', top_es: true, rank: 7,
    specs: { m3h: 720, diametroMm: 150 }, nota: 'Can-Fan · presión alta con filtro.' },
  { id: 'soler_palau_td350', categoria: 'extractor', marca: 'Soler & Palau', modelo: 'TD-350/100', top_es: true, rank: 8,
    specs: { m3h: 370, diametroMm: 100 }, nota: 'TD silencioso · instalación ducto rígido.' },
  { id: 'torin_ac_315', categoria: 'extractor', marca: 'Torin', modelo: 'AC Silent 315', top_es: true, rank: 9,
    specs: { m3h: 1750, diametroMm: 315 }, nota: 'Salas grandes / RDWC multi-cubo.' },
  { id: 'systemair_vk125', categoria: 'extractor', marca: 'Systemair', modelo: 'VK 125', top_es: true, rank: 10,
    specs: { m3h: 350, diametroMm: 125 }, nota: 'VK radial · grow industrial.' },

  { id: 'progrow_ultrasonic', categoria: 'humidificador', marca: 'ProGrow', modelo: 'Ultrasonic 8L', top_es: true, rank: 1,
    specs: { capacidadLh: 0.35 }, nota: 'Ultrasónico grow · bandeja o manguera.' },
  { id: 'boneco_u7145', categoria: 'humidificador', marca: 'Boneco', modelo: 'U7145', top_es: true, rank: 2,
    specs: { capacidadLh: 0.5 }, nota: 'Ultrasónico · salas pequeñas 80–120 cm.' },
  { id: 'magic_humidifier_12', categoria: 'humidificador', marca: 'Magic Humidifier', modelo: '12L', top_es: true, rank: 3,
    specs: { capacidadLh: 0.4 }, nota: 'Marca grow ES · depósito 12 L.' },
  { id: 'stadler_oskar', categoria: 'humidificador', marca: 'Stadler Form', modelo: 'Oskar', top_es: true, rank: 4,
    specs: { capacidadLh: 0.3 }, nota: 'Evaporativo silencioso · HR estable.' },
  { id: 'platinium_humidistat', categoria: 'humidificador', marca: 'Platinium', modelo: 'Humidistat 8L', top_es: true, rank: 5,
    specs: { capacidadLh: 0.35 }, nota: 'Humidistato integrado · Secret Jardin line.' },
  { id: 'vicks_v745', categoria: 'humidificador', marca: 'Vicks', modelo: 'V745A', top_es: true, rank: 6,
    specs: { capacidadLh: 0.25 }, nota: 'Vapor cálido · esquejes en bandeja.' },
  { id: 'carel_hume', categoria: 'humidificador', marca: 'Carel', modelo: 'humiSonic', top_es: true, rank: 7,
    specs: { capacidadLh: 0.5 }, nota: 'Ultrasónico industrial · salas medianas.' },
  { id: 'essick_air', categoria: 'humidificador', marca: 'Essick Air', modelo: 'AIRCARE 831000', top_es: true, rank: 8,
    specs: { capacidadLh: 0.4 }, nota: 'Evaporativo grande · HR veg estable.' },
  { id: 'rommelsbacher_ru', categoria: 'humidificador', marca: 'Rommelsbacher', modelo: 'RU 150', top_es: true, rank: 9,
    specs: { capacidadLh: 0.3 }, nota: 'Compacto · armarios 100 cm.' },
  { id: 'hygroset_humid', categoria: 'humidificador', marca: 'Hydropony', modelo: 'Humid Pro 6L', top_es: true, rank: 10,
    specs: { capacidadLh: 0.32 }, nota: 'Ultrasónico · growshop español.' },

  { id: 'trotec_ttk40e', categoria: 'deshumidificador', marca: 'TROTEC', modelo: 'TTK 40 E', top_es: true, rank: 1,
    specs: { capacidadLh: 0.85 }, nota: '~16 L/día · floración 120×120.' },
  { id: 'meaco_12l', categoria: 'deshumidificador', marca: 'Meaco', modelo: '12L Low Energy', top_es: true, rank: 2,
    specs: { capacidadLh: 0.5 }, nota: 'Compacto · salas medianas.' },
  { id: 'inventor_eva2', categoria: 'deshumidificador', marca: 'Inventor', modelo: 'EVA II 20L', top_es: true, rank: 3,
    specs: { capacidadLh: 0.6 }, nota: '20 L/día · muy vendido en Amazon ES.' },
  { id: 'midea_20l', categoria: 'deshumidificador', marca: 'Midea', modelo: '20L', top_es: true, rank: 4,
    specs: { capacidadLh: 0.55 }, nota: 'Compresor · floración densa.' },
  { id: 'stadler_albert', categoria: 'deshumidificador', marca: 'Stadler Form', modelo: 'Albert', top_es: true, rank: 5,
    specs: { capacidadLh: 0.45 }, nota: 'Diseño · salas 100–120 cm.' },
  { id: 'trotec_ttk75e', categoria: 'deshumidificador', marca: 'TROTEC', modelo: 'TTK 75 E', top_es: true, rank: 6,
    specs: { capacidadLh: 1.1 }, nota: '~26 L/día · salas 150×150.' },
  { id: 'meaco_dryabc', categoria: 'deshumidificador', marca: 'Meaco', modelo: 'Dry ABC 12L', top_es: true, rank: 7,
    specs: { capacidadLh: 0.5 }, nota: 'Bajo consumo · armarios floración.' },
  { id: 'cecotec_bigdry', categoria: 'deshumidificador', marca: 'Cecotec', modelo: 'BigDry 4000', top_es: true, rank: 8,
    specs: { capacidadLh: 0.4 }, nota: 'Económico · terraza/jardín interiorizado.' },
  { id: 'prima_klima_dh', categoria: 'deshumidificador', marca: 'Prima Klima', modelo: 'DH 60', top_es: true, rank: 9,
    specs: { capacidadLh: 0.7 }, nota: 'Grow · 60 L/día nominal comercial.' },
  { id: 'dantherm_cdp', categoria: 'deshumidificador', marca: 'Dantherm', modelo: 'CDP 40', top_es: true, rank: 10,
    specs: { capacidadLh: 0.65 }, nota: 'Profesional · salas con HR alta persistente.' },

  { id: 'bluelab_combo', categoria: 'medidor', marca: 'Bluelab', modelo: 'Combo Meter', top_es: true, rank: 1,
    specs: { tipo: 'EC+pH pen', calibracionDias: 30 }, nota: 'Referencia pro · calibrar mensual.' },
  { id: 'hm_digital_com83', categoria: 'medidor', marca: 'HM Digital', modelo: 'COM-83', top_es: true, rank: 2,
    specs: { tipo: 'EC+pH combo', calibracionDias: 30 }, nota: 'Económico · calibración frecuente.' },
  { id: 'adwa_ph_ec', categoria: 'medidor', marca: 'Adwa', modelo: 'pH/EC AD12', top_es: true, rank: 3,
    specs: { tipo: 'EC+pH pen', calibracionDias: 14 }, nota: 'Entrada habitual · calibrar cada 2 sem.' },
  { id: 'apera_ph60', categoria: 'medidor', marca: 'Apera', modelo: 'PH60', top_es: true, rank: 4,
    specs: { tipo: 'pH pen', calibracionDias: 30 }, nota: 'pH premium · buffer incluido.' },
  { id: 'milwaukee_mw102', categoria: 'medidor', marca: 'Milwaukee', modelo: 'MW102', top_es: true, rank: 5,
    specs: { tipo: 'pH bench', calibracionDias: 30 }, nota: 'Mesa · laboratorio pequeño.' },
  { id: 'bluelab_pulse', categoria: 'medidor', marca: 'Bluelab', modelo: 'Pulse Meter', top_es: true, rank: 6,
    specs: { tipo: 'EC+pH+suelo', calibracionDias: 30 }, nota: 'Sustrato + solución · app opcional.' },
  { id: 'growth_control_gc', categoria: 'medidor', marca: 'Growth Control', modelo: 'GC Pro', top_es: true, rank: 7,
    specs: { tipo: 'EC+pH combo', calibracionDias: 21 }, nota: 'Distribución growshop ES.' },
  { id: 'horticare_ph_ec', categoria: 'medidor', marca: 'Horticare', modelo: 'pH/EC Test', top_es: true, rank: 8,
    specs: { tipo: 'EC+pH combo', calibracionDias: 14 }, nota: 'Kit entrada · calibración quincenal.' },
  { id: 'essentials_ec', categoria: 'medidor', marca: 'Essentials', modelo: 'EC Truncheon', top_es: true, rank: 9,
    specs: { tipo: 'EC pen', calibracionDias: 30 }, nota: 'EC rápido · sin pH.' },
  { id: 'atago_pal_ec', categoria: 'medidor', marca: 'Atago', modelo: 'PAL-EC', top_es: true, rank: 10,
    specs: { tipo: 'EC digital', calibracionDias: 60 }, nota: 'Óptico · precisión laboratorio.' },

  { id: 'hailea_aco5505', categoria: 'bomba_aire', marca: 'Hailea', modelo: 'ACO-5505', top_es: true, rank: 1,
    specs: { lpm: 5.5, watts: 5 }, nota: '5,5 L/min · depósitos 40–120 L · estándar grow ES.' },
  { id: 'hailea_aco9810', categoria: 'bomba_aire', marca: 'Hailea', modelo: 'ACO-9810', top_es: true, rank: 2,
    specs: { lpm: 10, watts: 12 }, nota: '10 L/min · RDWC multi-cubo o depósitos grandes.' },
  { id: 'seco_el40', categoria: 'bomba_aire', marca: 'Secoh', modelo: 'EL-40', top_es: true, rank: 3,
    specs: { lpm: 40, watts: 38 }, nota: 'Silenciosa · salas medianas · muy valorada en foros ES.' },
  { id: 'superfish_aquapro', categoria: 'bomba_aire', marca: 'SuperFish', modelo: 'AquaPro 3000', top_es: true, rank: 4,
    specs: { lpm: 3.5, watts: 3 }, nota: 'Compacta · DWC 1–2 cubos.' },
  { id: 'eheim_400', categoria: 'bomba_aire', marca: 'Eheim', modelo: 'Air Pump 400', top_es: true, rank: 5,
    specs: { lpm: 4, watts: 4 }, nota: 'Alemana · silenciosa · distribución growshop.' },
  { id: 'aquael_oxypro', categoria: 'bomba_aire', marca: 'Aquael', modelo: 'OxyPro 1500', top_es: true, rank: 6,
    specs: { lpm: 3, watts: 2.5 }, nota: 'Económica · armarios pequeños.' },
  { id: 'schego_optimal', categoria: 'bomba_aire', marca: 'Schego', modelo: 'Optimal', top_es: true, rank: 7,
    specs: { lpm: 6, watts: 5 }, nota: 'Premium · bajo ruido · referencia pro.' },
  { id: 'resun_lp100', categoria: 'bomba_aire', marca: 'Resun', modelo: 'LP-100', top_es: true, rank: 8,
    specs: { lpm: 3.5, watts: 3 }, nota: 'Entrada · muy repartida en tiendas ES.' },
  { id: 'eden_283', categoria: 'bomba_aire', marca: 'Eden', modelo: '283', top_es: true, rank: 9,
    specs: { lpm: 2.5, watts: 2 }, nota: 'Mini · esquejes / cubos pequeños.' },
  { id: 'sicce_micro', categoria: 'bomba_aire', marca: 'Sicce', modelo: 'Micro', top_es: true, rank: 10,
    specs: { lpm: 4, watts: 3 }, nota: 'Italiana · silenciosa · growshops pro.' },

  { id: 'eheim_compact600', categoria: 'bomba_recirc', marca: 'Eheim', modelo: 'Compact+ 600', top_es: true, rank: 1,
    specs: { lph: 600, headM: 1.2 }, nota: '600 L/h · RDWC pequeño / retorno depósito.' },
  { id: 'sicce_syncra15', categoria: 'bomba_recirc', marca: 'Sicce', modelo: 'Syncra Silent 1.5', top_es: true, rank: 2,
    specs: { lph: 1400, headM: 1.8 }, nota: 'Silenciosa · circuito RDWC habitual ES.' },
  { id: 'hailea_hx4500', categoria: 'bomba_recirc', marca: 'Hailea', modelo: 'HX-4500', top_es: true, rank: 3,
    specs: { lph: 4500, headM: 3.5 }, nota: 'Alto caudal · torres / NFT largo.' },
  { id: 'newjet_njp450', categoria: 'bomba_recirc', marca: 'New Jet', modelo: 'NJP-450', top_es: true, rank: 4,
    specs: { lph: 1800, headM: 2.5 }, nota: 'Relación calidad/precio · growshop español.' },
  { id: 'resun_king4a', categoria: 'bomba_recirc', marca: 'Resun', modelo: 'King 4A', top_es: true, rank: 5,
    specs: { lph: 2400, headM: 3 }, nota: 'Potente · multi-módulo RDWC.' },
  { id: 'eden_506', categoria: 'bomba_recirc', marca: 'Eden', modelo: '506', top_es: true, rank: 6,
    specs: { lph: 800, headM: 1 }, nota: 'Compacta · DWC con retorno suave.' },
  { id: 'aquaticlife_pump', categoria: 'bomba_recirc', marca: 'Aquatic Life', modelo: 'Return Pump 1200', top_es: true, rank: 7,
    specs: { lph: 1200, headM: 2 }, nota: 'Retorno depósito · distribución ES.' },
  { id: 'danner_mag3', categoria: 'bomba_recirc', marca: 'Danner', modelo: 'Mag-Drive 3', top_es: true, rank: 8,
    specs: { lph: 1200, headM: 3 }, nota: 'Magnética · depósitos exteriores.' },
  { id: 'sicce_sdc', categoria: 'bomba_recirc', marca: 'Sicce', modelo: 'SDC 2.0', top_es: true, rank: 9,
    specs: { lph: 2000, headM: 2.2 }, nota: 'Controllable · salas pro.' },
  { id: 'maxspect_xmp', categoria: 'bomba_recirc', marca: 'Maxspect', modelo: 'XMP 2000', top_es: true, rank: 10,
    specs: { lph: 2000, headM: 2.5 }, nota: 'Variable · RDWC con control fino.' },

  { id: 'autopilot_co2', categoria: 'co2', marca: 'Autopilot', modelo: 'APCECO2', top_es: true, rank: 1,
    specs: { tipo: 'Botella + regulador digital' }, nota: 'Control ppm · floración · muy habitual en ES.' },
  { id: 'titan_co2', categoria: 'co2', marca: 'Titan Controls', modelo: 'Atlas 2', top_es: true, rank: 2,
    specs: { tipo: 'Botella + regulador' }, nota: 'Dosificación por fotoperiodo · armarios cerrados.' },
  { id: 'gse_co2', categoria: 'co2', marca: 'GSE', modelo: 'CO₂ controller', top_es: true, rank: 3,
    specs: { tipo: 'Regulador + electroválvula' }, nota: 'Marca europea · growshops españoles.' },

  { id: 'rhino_pro4_125', categoria: 'filtro_carbon', marca: 'Rhino', modelo: 'Pro Filter 4" 125', top_es: true, rank: 1,
    specs: { m3h: 600, diametroMm: 125, longitudCm: 50 }, nota: '125 mm · salas 100×100 · referencia ES.' },
  { id: 'rhino_pro4_150', categoria: 'filtro_carbon', marca: 'Rhino', modelo: 'Pro Filter 4" 150', top_es: true, rank: 2,
    specs: { m3h: 780, diametroMm: 150, longitudCm: 50 }, nota: '150 mm · 120×120 con RVK 150.' },
  { id: 'rhino_pro4_160', categoria: 'filtro_carbon', marca: 'Rhino', modelo: 'Pro Filter 6" 160', top_es: true, rank: 3,
    specs: { m3h: 900, diametroMm: 160, longitudCm: 60 }, nota: '160 mm · salas 1.2–1.5 m.' },
  { id: 'pk_pk125', categoria: 'filtro_carbon', marca: 'Prima Klima', modelo: 'PK125-TC', top_es: true, rank: 4,
    specs: { m3h: 580, diametroMm: 125, longitudCm: 40 }, nota: 'PK125 · muy habitual con RVK 125.' },
  { id: 'pk_pk150', categoria: 'filtro_carbon', marca: 'Prima Klima', modelo: 'PK150-TC', top_es: true, rank: 5,
    specs: { m3h: 760, diametroMm: 150, longitudCm: 50 }, nota: 'PK150 · par con extractor 150 mm.' },
  { id: 'can_filter_38_100', categoria: 'filtro_carbon', marca: 'Can Filter', modelo: '38 100 mm', top_es: true, rank: 6,
    specs: { m3h: 420, diametroMm: 100, longitudCm: 33 }, nota: '100 mm · armarios compactos.' },
  { id: 'vents_k125', categoria: 'filtro_carbon', marca: 'Vents', modelo: 'K125', top_es: true, rank: 7,
    specs: { m3h: 550, diametroMm: 125, longitudCm: 40 }, nota: 'Relación calidad/precio · growshop ES.' },
  { id: 'carbon_active_150', categoria: 'filtro_carbon', marca: 'Active Carbon', modelo: '150×500', top_es: true, rank: 8,
    specs: { m3h: 720, diametroMm: 150, longitudCm: 50 }, nota: 'Carbón activado · floración densa.' },

  { id: 'sj_monkey_fan', categoria: 'ventilador_circ', marca: 'Secret Jardin', modelo: 'Monkey Fan 16 cm', top_es: true, rank: 1,
    specs: { diametroMm: 160 }, nota: 'Clip fan · el más vendido en carpas ES.' },
  { id: 'ram_clip_15', categoria: 'ventilador_circ', marca: 'RAM', modelo: 'Clip Fan 15 cm', top_es: true, rank: 2,
    specs: { diametroMm: 150 }, nota: 'Silencioso · dosel y ramas bajas.' },
  { id: 'pk_clip_20', categoria: 'ventilador_circ', marca: 'Prima Klima', modelo: 'PK Clip Fan 20 cm', top_es: true, rank: 3,
    specs: { diametroMm: 200 }, nota: '20 cm · circulación en salas 120+.' },
  { id: 'gse_clip_15', categoria: 'ventilador_circ', marca: 'GSE', modelo: 'Clip Fan 15 cm', top_es: true, rank: 4,
    specs: { diametroMm: 150 }, nota: 'Oscilación · anti-puntos muertos.' },
  { id: 'hyperfan_clip', categoria: 'ventilador_circ', marca: 'Hyper Fan', modelo: 'Clip 20 cm', top_es: true, rank: 5,
    specs: { diametroMm: 200 }, nota: 'EC · bajo consumo en floración larga.' },

  { id: 'gse_timer_2ch', categoria: 'temporizador', marca: 'GSE', modelo: 'Timer 2 canales', top_es: true, rank: 1,
    specs: { canales: 2 }, nota: 'LED + auxiliar · fotoperiodo digital.' },
  { id: 'lumatek_timer', categoria: 'temporizador', marca: 'Lumatek', modelo: 'Digital Timer', top_es: true, rank: 2,
    specs: { canales: 1 }, nota: 'Precisión minuto · LED full spectrum.' },
  { id: 'grasslin_timer', categoria: 'temporizador', marca: 'Grasslin', modelo: 'Tal 176', top_es: true, rank: 3,
    specs: { canales: 1 }, nota: 'Mecánico fiable · cuadro eléctrico.' },
  { id: 'titan_timer', categoria: 'temporizador', marca: 'Titan Controls', modelo: 'Apollo 9', top_es: true, rank: 4,
    specs: { canales: 2 }, nota: '2 salidas · veg/flor con backup.' },

  { id: 'ghp_malla_70', categoria: 'toldo_malla', marca: 'Garden Highpro', modelo: 'Malla 70 %', top_es: true, rank: 1,
    specs: { sombreoPct: 70 }, nota: 'Verano mediterráneo · terraza/jardín.' },
  { id: 'ghp_malla_50', categoria: 'toldo_malla', marca: 'Garden Highpro', modelo: 'Malla 50 %', top_es: true, rank: 2,
    specs: { sombreoPct: 50 }, nota: 'Primavera/otoño · menos estrés que 70%.' },
  { id: 'secret_toldo', categoria: 'toldo_malla', marca: 'Secret Jardin', modelo: 'Shade Net', top_es: true, rank: 3,
    specs: { sombreoPct: 60 }, nota: 'Malla reflectante · exterior hidro.' },

  { id: 'chikamasa_t550', categoria: 'tijeras', marca: 'Chikamasa', modelo: 'T-550', top_es: true, rank: 1,
    specs: { tipo: 'Curva · acero inox · 155 mm' }, nota: 'La más citada en growshops ES · trim y esquejes.' },
  { id: 'chikamasa_b500slf', categoria: 'tijeras', marca: 'Chikamasa', modelo: 'B-500SLF', top_es: true, rank: 2,
    specs: { tipo: 'Recta · muelle · fluor' }, nota: 'Muy vendida · defoliación rápida sin fatiga de mano.' },
  { id: 'ars_hp130dx', categoria: 'tijeras', marca: 'ARS', modelo: 'HP-130DX', top_es: true, rank: 3,
    specs: { tipo: 'Curva · acero japonés' }, nota: 'Top valorada en foros ES · corte fino en cogollos.' },
  { id: 'fiskars_micro', categoria: 'tijeras', marca: 'Fiskars', modelo: 'Micro-Tip SP-13', top_es: true, rank: 4,
    specs: { tipo: 'Punta fina · bypass' }, nota: 'Amazon y bricolaje ES · defoliación delicada.' },
  { id: 'okatsune_103', categoria: 'tijeras', marca: 'Okatsune', modelo: '103', top_es: true, rank: 5,
    specs: { tipo: 'Bypass · forjada · 200 mm' }, nota: 'Calidad pro · poda y limpieza de bajos en SCROG.' },
  { id: 'chikamasa_b130', categoria: 'tijeras', marca: 'Chikamasa', modelo: 'B-130', top_es: true, rank: 6,
    specs: { tipo: 'Recta corta · 130 mm' }, nota: 'Hoja corta · clones y manicura en maceta pequeña.' },
  { id: 'bahco_p121', categoria: 'tijeras', marca: 'Bahco', modelo: 'P121-20-F', top_es: true, rank: 7,
    specs: { tipo: 'Bypass · 200 mm' }, nota: 'Ferretería y growshop · ramas medias y limpieza de tallo.' },
  { id: 'ars_ses60c', categoria: 'tijeras', marca: 'ARS', modelo: 'SES-60C', top_es: true, rank: 8,
    specs: { tipo: 'Curva compacta · 155 mm' }, nota: 'Versión pequeña ARS · manicura densa en floración.' },
  { id: 'fiskars_solid', categoria: 'tijeras', marca: 'Fiskars', modelo: 'Solid P362', top_es: true, rank: 9,
    specs: { tipo: 'Bypass reforzado' }, nota: 'Ramas gruesas · topping y poda estructural en veg.' },
  { id: 'vivosun_pruner', categoria: 'tijeras', marca: 'Vivosun', modelo: 'Precision Pruner', top_es: true, rank: 10,
    specs: { tipo: 'Curva · resorte' }, nota: 'Muy vendida online ES · pack 2 uds · relación calidad/precio.' },

  { id: 'carson_30x', categoria: 'lupa', marca: 'Carson', modelo: '30× LED', top_es: true, rank: 1,
    specs: { aumento: '30×' }, nota: 'Lupa LED · tricomas lechosos/ámbar.' },
  { id: 'active_eye_30x', categoria: 'lupa', marca: 'Active Eye', modelo: '30×', top_es: true, rank: 2,
    specs: { aumento: '30×' }, nota: 'Clásica growshop · revisión semanal flor.' },
  { id: 'carson_60x', categoria: 'lupa', marca: 'Carson', modelo: '60× LED', top_es: true, rank: 3,
    specs: { aumento: '60×' }, nota: 'Detalle fino · confirmar cosecha.' },
  { id: 'jeweler_40x', categoria: 'lupa', marca: 'Generic', modelo: '40× jeweler', top_es: true, rank: 4,
    specs: { aumento: '40×' }, nota: 'Intermedio 30–60× · buena relación calidad/precio.' },

  { id: 'sj_propagator_l', categoria: 'propagador', marca: 'Secret Jardin', modelo: 'Propagator L', top_es: true, rank: 1,
    specs: { tipo: 'domo rígido', bandejas: 1, celdas: 77 }, nota: 'Bandeja 77 alvéolos · autocultivo: 6–12 semillas suele bastar.' },
  { id: 'garland_prop_large', categoria: 'propagador', marca: 'Garland', modelo: 'Large High Dome', top_es: true, rank: 2,
    specs: { tipo: 'domo alto', bandejas: 1, celdas: 77 }, nota: '59×39 cm · cabe bandeja Grodan 77.' },
  { id: 'garland_prop_std', categoria: 'propagador', marca: 'Garland', modelo: 'Standard Propagator', top_es: true, rank: 3,
    specs: { tipo: 'domo estándar', bandejas: 1, celdas: 77 }, nota: 'El más vendido en ES · no llenes todos los alvéolos.' },
  { id: 'platinium_prop', categoria: 'propagador', marca: 'Platinium', modelo: 'Propagator', top_es: true, rank: 4,
    specs: { tipo: 'domo', bandejas: 1 }, nota: 'Línea Platinium / Secret Jardin en tiendas ES.' },
  { id: 'biogreen_prop', categoria: 'propagador', marca: 'Biogreen', modelo: 'Propagator S', top_es: true, rank: 5,
    specs: { tipo: 'domo', bandejas: 1 }, nota: 'Compacto · 1 bandeja semilla o clones.' },
  { id: 'hydropony_prop', categoria: 'propagador', marca: 'Hydropony', modelo: 'Propagador 24', top_es: true, rank: 6,
    specs: { tipo: 'domo', bandejas: 1, celdas: 24 }, nota: '24 celdas · típico 4–12 semillas en casa.' },
  { id: 'dome_flexible', categoria: 'propagador', marca: 'Generic', modelo: 'Domo flexible', top_es: true, rank: 7,
    specs: { tipo: 'domo PVC', bandejas: 1 }, nota: 'Domo sobre bandeja estándar · bajo coste.' },
  { id: 'propagator_xl', categoria: 'propagador', marca: 'Garland', modelo: 'XL High Dome', top_es: true, rank: 8,
    specs: { tipo: 'domo XL', bandejas: 1 }, nota: 'Varias decenas de semillas / clones.' },
  { id: 'heated_prop', categoria: 'propagador', marca: 'Garland', modelo: 'Heated Propagator', top_es: true, rank: 9,
    specs: { tipo: 'domo + calor', bandejas: 1 }, nota: 'Base calefactora integrada · invierno.' },
  { id: 'sj_dark_prop', categoria: 'propagador', marca: 'Secret Jardin', modelo: 'Dark Propagator', top_es: true, rank: 10,
    specs: { tipo: 'domo opaco', bandejas: 1 }, nota: 'Opacidad · raíz más sana en germinación.' },

  { id: 'cupula_cloche_10', categoria: 'cupula_maceta', marca: 'Genérico', modelo: 'Cloche / vaso domo 10–12 cm', top_es: true, rank: 1,
    specs: { diametroCm: 10 }, nota: '1 unidad por maceta en DWC/RDWC.' },
  { id: 'cupula_garland_lid', categoria: 'cupula_maceta', marca: 'Garland', modelo: 'Tapa ventilada (1 planta)', top_es: true, rank: 2,
    specs: { diametroCm: 12 }, nota: 'Mini domo puntual, no bandeja completa.' },
  { id: 'cupula_diy_botella', categoria: 'cupula_maceta', marca: 'DIY', modelo: 'Botella cortada / vaso', top_es: true, rank: 3,
    specs: { diametroCm: 8 }, nota: 'Opción casera por cesta.' },

  { id: 'garland_mat_25', categoria: 'mat_termica_germ', marca: 'Garland', modelo: 'Heat Mat 25W', top_es: true, rank: 1,
    specs: { watts: 25 }, nota: '25 W · bandeja pequeña / domo.' },
  { id: 'garland_mat_45', categoria: 'mat_termica_germ', marca: 'Garland', modelo: 'Heat Mat 45W', top_es: true, rank: 2,
    specs: { watts: 45 }, nota: '45 W · propagador mediano.' },
  { id: 'biogreen_mat', categoria: 'mat_termica_germ', marca: 'Biogreen', modelo: 'Heat Mat 25W', top_es: true, rank: 3,
    specs: { watts: 25 }, nota: 'Muy usada bajo domo en ES.' },
  { id: 'hydropony_mat', categoria: 'mat_termica_germ', marca: 'Hydropony', modelo: 'Manta 21W', top_es: true, rank: 4,
    specs: { watts: 21 }, nota: 'Entrada de gama · germinador doméstico.' },
];

const EQUIP_TOP_ES_LIMIT = 10;

const EQUIP_CATALOG_GROUPS = {
  interior: [
    { id: 'sala', label: 'Sala interior', icon: '🏠', keys: ['armario', 'led', 'extractor', 'filtro_carbon', 'ventilador_circ', 'temporizador', 'humidificador', 'deshumidificador', 'co2'] },
    { id: 'hidro', label: 'Circuito hidro', icon: '🫧', keys: ['medidor', 'bomba_aire', 'bomba_recirc'] },
    { id: 'tools', label: 'Herramientas cultivo', icon: '✂️', keys: ['tijeras', 'lupa'] },
  ],
  exterior: [
    { id: 'ext', label: 'Exterior', icon: '☀️', keys: ['toldo_malla', 'ventilador_circ'] },
    { id: 'hidro', label: 'Circuito hidro', icon: '🫧', keys: ['medidor', 'bomba_aire', 'bomba_recirc'] },
    { id: 'tools', label: 'Herramientas cultivo', icon: '✂️', keys: ['tijeras', 'lupa'] },
  ],
};

const EQUIP_GERMINACION_GROUP = {
  id: 'germinacion',
  label: 'Germinación (semilla)',
  icon: '🌱',
  keys: ['propagador', 'mat_termica_germ'],
};

const EQUIP_ENRAIZADO_GROUP = {
  id: 'enraizado',
  label: 'Enraizado (esqueje)',
  icon: '💧',
  keys: ['propagador', 'mat_termica_germ'],
};

/** Semilla en hidro: germina en el depósito/cubo (DWC/RDWC), no en bandeja propagador aparte. */
const EQUIP_PREP_HIDRO_GROUP = {
  id: 'prep_hidro',
  label: 'Prep germinación en cubo',
  icon: '🪴',
  keys: ['medidor', 'bomba_aire'],
  hint: 'La semilla va en net pot dentro del DWC/RDWC (agua + burbujeo). Medidor y oxigenador del depósito. Mini domo sobre la maceta es opcional (checklist prep), no hace falta bandeja propagador.',
};

function getPremiumOrigenPlanta() {
  try {
    if (typeof ensurePremiumSetup === 'function') {
      const p = ensurePremiumSetup();
      const o = String(p.origenPlanta || 'semilla').toLowerCase();
      if (o === 'semilla' || o === 'clon' || o === 'madre') return o;
    }
  } catch (_) {}
  try {
    const cfg = typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
    const o2 = String(cfg.origenPlanta || (cfg.premiumSetup && cfg.premiumSetup.origenPlanta) || 'semilla').toLowerCase();
    if (o2 === 'semilla' || o2 === 'clon' || o2 === 'madre') return o2;
  } catch (_) {}
  return 'semilla';
}

function getEquipCatalogGroups(entorno) {
  const origen = getPremiumOrigenPlanta();
  const camino =
    typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : '';
  const faseGerm =
    typeof hcSetupEnFaseGerminacion === 'function' && hcSetupEnFaseGerminacion();
  const faseSala =
    typeof hcSetupEnFaseSalaPreGerm === 'function' && hcSetupEnFaseSalaPreGerm();
  const base = entorno === 'exterior' ? EQUIP_CATALOG_GROUPS.exterior.slice() : EQUIP_CATALOG_GROUPS.interior.slice();
  const germKeys = ['propagador', 'mat_termica_germ'];

  if (faseSala && camino === 'semilla_propagador') {
    return base
      .filter(function (g) {
        return g.id !== 'hidro';
      })
      .map(function (g) {
        return Object.assign({}, g, {
          keys: (g.keys || []).filter(function (k) {
            return germKeys.indexOf(k) < 0;
          }),
          hint:
            g.id === 'sala'
              ? 'Carpa, LED, extractor y clima. El circuito DWC/RDWC lo configurarás tras la germinación.'
              : g.hint,
        });
      })
      .filter(function (g) {
        return g.keys && g.keys.length;
      });
  }

  if (faseSala && camino === 'semilla_hidro') {
    return base
      .map(function (g) {
        return Object.assign({}, g, {
          keys: (g.keys || []).filter(function (k) {
            return germKeys.indexOf(k) < 0;
          }),
        });
      })
      .filter(function (g) {
        return g.keys && g.keys.length;
      });
  }

  var propagadorSoloAhora =
    camino === 'semilla_propagador' &&
    !faseSala &&
    (faseGerm ||
      (typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
        hcCaminoSemillaPropagadorSetupGerm()));

  if (propagadorSoloAhora) {
    return [
      Object.assign({}, EQUIP_GERMINACION_GROUP, {
        label: 'Domo y mat térmica',
        required: true,
        hint: '',
      }),
    ];
  }

  var hidroGermEquip =
    camino === 'semilla_hidro' &&
    (faseGerm ||
      (typeof hcCaminoSemillaGermEnSetup === 'function' && hcCaminoSemillaGermEnSetup()));

  if (hidroGermEquip) {
    return [
      Object.assign({}, EQUIP_PREP_HIDRO_GROUP, {
        required: true,
        hint:
          EQUIP_PREP_HIDRO_GROUP.hint +
          ' Debajo: sala (carpa, LED) y circuito hidro del asistente.',
      }),
      {
        id: 'germ_opcional_hidro',
        label: 'Opcional · microclima por maceta',
        icon: '🪴',
        keys: ['cupula_maceta', 'mat_termica_germ'],
        required: false,
        optional: true,
        hint:
          'No sustituye germinar en el cubo. Si usas cúpula: una por cada net pot/cesta (DWC/RDWC), no bandeja propagador de muchas celdas.',
      },
    ].concat(
      base.map(function (g) {
        return Object.assign({}, g, { required: g.id === 'sala' || g.id === 'hidro' });
      })
    );
  }

  if (camino === 'semilla_hidro') {
    return base;
  }

  if (origen === 'semilla' || camino === 'semilla_propagador') {
    const germGrp = Object.assign({}, EQUIP_GERMINACION_GROUP, {
      label: faseGerm || propagadorSoloAhora
        ? 'Germinación — imprescindible ahora'
        : 'Germinación (semilla) — recomendado',
      required: !!(faseGerm || propagadorSoloAhora),
    });
    if (faseGerm || propagadorSoloAhora) {
      return [germGrp];
    }
    return [Object.assign({}, germGrp, { label: 'Germinación (semilla) — recomendado' })].concat(base);
  }
  if (origen === 'clon') {
    return [Object.assign({}, EQUIP_ENRAIZADO_GROUP, { label: 'Enraizado (esqueje) — imprescindible' })].concat(base);
  }
  return base;
}

function getEquipCategorias() {
  return EQUIP_CATEGORIAS;
}

function getEquipamientoByCategoria(catId) {
  return EQUIPAMIENTO_CATALOG.filter(function (e) { return e.categoria === catId; });
}

function getEquipamientoById(id) {
  return EQUIPAMIENTO_CATALOG.find(function (e) { return e.id === id; }) || null;
}

function getEquipTopPorCategoria(catId, limit, includeId) {
  limit = limit == null ? EQUIP_TOP_ES_LIMIT : Math.max(1, limit);
  var list = getEquipamientoByCategoria(catId).filter(function (e) { return e.top_es; });
  list.sort(function (a, b) {
    var ra = Number.isFinite(a.rank) ? a.rank : 99;
    var rb = Number.isFinite(b.rank) ? b.rank : 99;
    return ra - rb;
  });
  var top = list.slice(0, limit);
  if (includeId && !top.some(function (e) { return e.id === includeId; })) {
    var extra = getEquipamientoById(includeId);
    if (extra && extra.categoria === catId) top = top.concat([extra]);
  }
  return top;
}

window.EQUIP_CATEGORIAS = EQUIP_CATEGORIAS;
window.EQUIPAMIENTO_CATALOG = EQUIPAMIENTO_CATALOG;
window.EQUIP_TOP_ES_LIMIT = EQUIP_TOP_ES_LIMIT;
window.getEquipCatalogGroups = getEquipCatalogGroups;
window.getEquipCategorias = getEquipCategorias;
window.getEquipamientoByCategoria = getEquipamientoByCategoria;
window.getEquipamientoById = getEquipamientoById;
window.getEquipTopPorCategoria = getEquipTopPorCategoria;
window.getPremiumOrigenPlanta = getPremiumOrigenPlanta;
