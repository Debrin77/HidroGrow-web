/**
 * HidroGrow — catálogo orientativo de equipamiento (marcas habituales en España).
 * top_es + rank: referencia orientativa de los modelos más citados en growshops ES.
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
    hint: 'Recomendado en esquejes/veg si HR por debajo de 55%. La app lo sugerirá en correcciones VPD.',
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
];

const EQUIP_TOP_ES_LIMIT = 10;

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
window.getEquipCategorias = getEquipCategorias;
window.getEquipamientoByCategoria = getEquipamientoByCategoria;
window.getEquipamientoById = getEquipamientoById;
window.getEquipTopPorCategoria = getEquipTopPorCategoria;
