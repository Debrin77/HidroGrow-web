/**
 * HidroGrow — top 10 semilleros habituales en growshops españoles.
 * Perfiles orientativos; el usuario puede aceptarlos o editarlos manualmente.
 */
const SEMILLEROS_TOP10_ES = [
  'dinafem',
  'sweet_seeds',
  'royal_queen',
  'sensi_seeds',
  'dutch_passion',
  'fast_buds',
  'barneys_farm',
  'pyramid_seeds',
  'ripper_seeds',
  'philosopher_seeds',
];

const SEMILLEROS_DB = [
  {
    id: 'dinafem',
    nombre: 'Dinafem',
    bandera: '🇪🇸',
    pais: 'España',
    top_es: true,
    rank_es: 1,
    color: '#1a7f4b',
    perfil: {
      germTempMin: 20, germTempMax: 26,
      germDiasMin: 2, germDiasMax: 5,
      ecVegMin: 1100, ecVegMax: 1600,
      ecFlorMin: 1300, ecFlorMax: 2000,
      phMin: 5.8, phMax: 6.2,
      hidroNota: 'Muy adaptadas a hidro; ficha por variedad en web y QR en pack.',
      soportePack: 'Guía digital y soporte en español.',
    },
    nota: 'Referencia española en cannabis medicinal y clásicos feminizados.',
  },
  {
    id: 'sweet_seeds',
    nombre: 'Sweet Seeds',
    bandera: '🇪🇸',
    pais: 'España',
    top_es: true,
    rank_es: 2,
    color: '#c026d3',
    perfil: {
      germTempMin: 21, germTempMax: 26,
      germDiasMin: 2, germDiasMax: 4,
      ecVegMin: 1200, ecVegMax: 1700,
      ecFlorMin: 1400, ecFlorMax: 2100,
      phMin: 5.7, phMax: 6.2,
      hidroNota: 'Línea Sweet Auto® muy estable; S.A.D. y Cream Caramel en hidro.',
      soportePack: 'Tabla germinación en web por variedad.',
    },
    nota: 'Autos y fotos resinosas; muy presentes en tiendas ES.',
  },
  {
    id: 'royal_queen',
    nombre: 'Royal Queen Seeds',
    bandera: '🇳🇱',
    pais: 'Países Bajos',
    top_es: true,
    rank_es: 3,
    color: '#eab308',
    perfil: {
      germTempMin: 20, germTempMax: 25,
      germDiasMin: 2, germDiasMax: 5,
      ecVegMin: 1000, ecVegMax: 1500,
      ecFlorMin: 1300, ecFlorMax: 1900,
      phMin: 5.8, phMax: 6.3,
      hidroNota: 'Catálogo amplio; muchas variedades toleran DWC bien.',
      soportePack: 'Grow diaries y guías por genética en royalqueenseeds.es',
    },
    nota: 'Marca más vendida en Europa; buena relación precio/variedad.',
  },
  {
    id: 'sensi_seeds',
    nombre: 'Sensi Seeds',
    bandera: '🇳🇱',
    pais: 'Países Bajos',
    top_es: true,
    rank_es: 4,
    color: '#dc2626',
    perfil: {
      germTempMin: 20, germTempMax: 26,
      germDiasMin: 3, germDiasMax: 6,
      ecVegMin: 1100, ecVegMax: 1600,
      ecFlorMin: 1300, ecFlorMax: 2000,
      phMin: 5.8, phMax: 6.2,
      hidroNota: 'Genéticas clásicas (Northern Lights, Skunk); hidro estable con pH controlado.',
      soportePack: 'Fichas técnicas detalladas por strain.',
    },
    nota: 'Histórica; genéticas landrace e híbridos probados.',
  },
  {
    id: 'dutch_passion',
    nombre: 'Dutch Passion',
    bandera: '🇳🇱',
    pais: 'Países Bajos',
    top_es: true,
    rank_es: 5,
    color: '#2563eb',
    perfil: {
      germTempMin: 21, germTempMax: 26,
      germDiasMin: 2, germDiasMax: 5,
      ecVegMin: 1100, ecVegMax: 1650,
      ecFlorMin: 1350, ecFlorMax: 2050,
      phMin: 5.8, phMax: 6.2,
      hidroNota: 'Pioneros en autos; Blue Auto Mazar y Think Different en hidro.',
      soportePack: 'Blog técnico y tiempos por variedad.',
    },
    nota: 'Autos de referencia; seeds desde 1987.',
  },
  {
    id: 'fast_buds',
    nombre: 'Fast Buds',
    bandera: '🇺🇸',
    pais: 'USA / distrib. ES',
    top_es: true,
    rank_es: 6,
    color: '#f97316',
    perfil: {
      germTempMin: 22, germTempMax: 26,
      germDiasMin: 2, germDiasMax: 4,
      ecVegMin: 1000, ecVegMax: 1500,
      ecFlorMin: 1200, ecFlorMax: 1800,
      phMin: 5.7, phMax: 6.2,
      hidroNota: 'Solo autos; ciclo corto — no usar como madre. DWC con EC moderada.',
      soportePack: 'Fast Buds app y grow guide online.',
    },
    nota: 'Especialistas autoflorecientes; muy populares en SOG auto.',
  },
  {
    id: 'barneys_farm',
    nombre: "Barney's Farm",
    bandera: '🇳🇱',
    pais: 'Países Bajos',
    top_es: true,
    rank_es: 7,
    color: '#7c3aed',
    perfil: {
      germTempMin: 20, germTempMax: 26,
      germDiasMin: 2, germDiasMax: 5,
      ecVegMin: 1200, ecVegMax: 1700,
      ecFlorMin: 1400, ecFlorMax: 2200,
      phMin: 5.8, phMax: 6.2,
      hidroNota: 'Gorilla Glue, Liberty Haze — exigentes en EC en flor; buena oxigenación raíz.',
      soportePack: 'Descripción larga por variedad en web.',
    },
    nota: 'Premios internacionales; genéticas potentes.',
  },
  {
    id: 'pyramid_seeds',
    nombre: 'Pyramid Seeds',
    bandera: '🇪🇸',
    pais: 'España',
    top_es: true,
    rank_es: 8,
    color: '#0891b2',
    perfil: {
      germTempMin: 20, germTempMax: 26,
      germDiasMin: 2, germDiasMax: 5,
      ecVegMin: 1000, ecVegMax: 1500,
      ecFlorMin: 1300, ecFlorMax: 1900,
      phMin: 5.8, phMax: 6.3,
      hidroNota: 'Relación calidad/precio; Super OG Kush y Anesthesia en hidro.',
      soportePack: 'Ficha en español por producto.',
    },
    nota: 'Marca española accesible; catálogo amplio.',
  },
  {
    id: 'ripper_seeds',
    nombre: 'Ripper Seeds',
    bandera: '🇪🇸',
    pais: 'España',
    top_es: true,
    rank_es: 9,
    color: '#be123c',
    perfil: {
      germTempMin: 21, germTempMax: 27,
      germDiasMin: 2, germDiasMax: 5,
      ecVegMin: 1100, ecVegMax: 1650,
      ecFlorMin: 1350, ecFlorMax: 2100,
      phMin: 5.8, phMax: 6.2,
      hidroNota: 'Zombie Kush y Toxic — resinosas; vigilar HR en flor densa.',
      soportePack: 'Blog Ripper Seeds con tips de cultivo.',
    },
    nota: 'Breeder español premium; genéticas resinosas.',
  },
  {
    id: 'philosopher_seeds',
    nombre: 'Philosopher Seeds',
    bandera: '🇪🇸',
    pais: 'España',
    top_es: true,
    rank_es: 10,
    color: '#4d7c0f',
    perfil: {
      germTempMin: 20, germTempMax: 26,
      germDiasMin: 2, germDiasMax: 6,
      ecVegMin: 1000, ecVegMax: 1550,
      ecFlorMin: 1300, ecFlorMax: 1950,
      phMin: 5.8, phMax: 6.2,
      hidroNota: 'Enfoque clásico y CBD; Deep Chunk y Sugar Black Rose.',
      soportePack: 'Filosofía de cultivo en web; tiempos por strain.',
    },
    nota: 'Semillero boutique español; variedades seleccionadas.',
  },
];

function getSemillerosTop10ES() {
  return SEMILLEROS_TOP10_ES.map(function (id) {
    return SEMILLEROS_DB.find(function (s) { return s.id === id; });
  }).filter(Boolean);
}

function getSemilleroById(id) {
  return SEMILLEROS_DB.find(function (s) { return s.id === id; }) || null;
}

function mergeSemilleroPerfil(catalogo, custom) {
  const base = catalogo && catalogo.perfil ? JSON.parse(JSON.stringify(catalogo.perfil)) : {};
  if (custom && typeof custom === 'object') {
    Object.keys(custom).forEach(function (k) {
      if (custom[k] != null && custom[k] !== '') base[k] = custom[k];
    });
  }
  return base;
}

window.SEMILLEROS_TOP10_ES = SEMILLEROS_TOP10_ES;
window.SEMILLEROS_DB = SEMILLEROS_DB;
window.getSemillerosTop10ES = getSemillerosTop10ES;
window.getSemilleroById = getSemilleroById;
window.mergeSemilleroPerfil = mergeSemilleroPerfil;
