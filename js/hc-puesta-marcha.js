/**
 * HidroGrow — checklist de puesta en marcha (montaje, accesorios, IoT opcional).
 * Separado del checklist de recarga de nutrientes.
 * Genera pasos según equipamientoInstalado y equipamiento hidro (difusor, bomba…).
 */
(function (global) {
  'use strict';

  var ITEMS_BASE = [
    {
      id: 'sistema',
      label: 'Sistema hidro configurado',
      hint: 'Asistente completado: DWC/RDWC, litros, cestas y nutriente.',
      auto: true,
    },
    {
      id: 'fugas',
      label: 'Tuberías y conexiones sin fugas',
      hint: 'Especialmente en RDWC: revisar racores y nivel.',
    },
    {
      id: 'nombre',
      label: 'Instalación con nombre claro',
      hint: 'Si tienes varias salas: «Veg», «Flor», «Esquejes»…',
      autoNombre: true,
    },
    {
      id: 'iot',
      label: 'Gateway WiFi IoT probado (opcional)',
      hint: 'Solo si usas sensores. Si no, ignora este punto.',
      optional: true,
    },
  ];

  var MONTAJE_POR_CATEGORIA = {
    armario: {
      id: 'eq_armario',
      label: 'Carpa / armario montado',
      hint: 'Estructura nivelada, opacidad y acceso. Comprueba medidas interiores vs. plano de sala.',
      cat: 'armario',
    },
    led: {
      id: 'eq_led',
      label: 'LED colgado y cableado',
      hint: 'Altura al dosel, disipación y fotoperiodo según fase (18/6 veg, 12/12 flor).',
      cat: 'led',
    },
    extractor: {
      id: 'eq_extractor',
      label: 'Extractor e intracción de aire',
      hint: 'Renovación de aire, filtro de carbón si aplica y temperatura bajo control.',
      cat: 'extractor',
    },
    humidificador: {
      id: 'eq_humidificador',
      label: 'Humidificador instalado',
      hint: 'Depósito lleno y HR estable en esquejes/veg si la sala lo pide.',
      cat: 'humidificador',
    },
    deshumidificador: {
      id: 'eq_deshumidificador',
      label: 'Deshumidificador instalado',
      hint: 'Bandeja de condensado y HR en floración (<50–55 % orientativo).',
      cat: 'deshumidificador',
    },
    medidor: {
      id: 'eq_medidor',
      label: 'Medidor EC/pH calibrado',
      hint: 'Solución buffer 4,0 / 7,0 (pH) y estándar EC si aplica.',
      cat: 'medidor',
    },
    filtro_carbon: {
      id: 'eq_filtro_carbon',
      label: 'Filtro de carbón instalado',
      hint: 'En serie con extractor; caudal del filtro ≥ caudal del ventilador.',
      cat: 'filtro_carbon',
    },
    ventilador_circ: {
      id: 'eq_ventilador_circ',
      label: 'Ventilador de circulación (clip fan)',
      hint: 'Aparte del extractor: mueve aire en el dosel y reduce puntos muertos / moho.',
      cat: 'ventilador_circ',
    },
    temporizador: {
      id: 'eq_temporizador',
      label: 'Temporizador LED cableado',
      hint: 'Fotoperiodo 18/6 veg · 12/12 flor. Comprueba hora tras corte de luz.',
      cat: 'temporizador',
    },
    toldo_malla: {
      id: 'eq_toldo_malla',
      label: 'Toldo / malla sombreo',
      hint: 'Protege del sol fuerte y reduce estrés térmico en verano.',
      cat: 'toldo_malla',
    },
    tijeras: {
      id: 'eq_tijeras',
      label: 'Tijeras de poda listas',
      hint: 'Limpias y afiladas; alcohol 70 % entre cortes.',
      cat: 'tijeras',
    },
    lupa: {
      id: 'eq_lupa',
      label: 'Lupa tricomas (30×–60×)',
      hint: 'Para confirmar cosecha: lechoso → ámbar según efecto buscado.',
      cat: 'lupa',
    },
  };

  var MONTAJE_EXTERIOR = {
    exterior_ubic: {
      id: 'ext_ubic',
      label: 'Municipio y clima confirmados',
      hint: 'Ciudad guardada para meteo, lluvia y alertas de frío.',
    },
    ext_deposito: {
      id: 'ext_deposito',
      label: 'Depósito protegido de lluvia y sol',
      hint: 'Cubre depósito, bomba y electrónica; evita calentamiento >28 °C en nutriente.',
    },
    ext_drenaje: {
      id: 'ext_drenaje',
      label: 'Base nivelada y drenaje',
      hint: 'Sin charcos bajo cubos; desagüe si hay rebalse de RDWC.',
    },
    ext_viento: {
      id: 'ext_viento',
      label: 'Anclaje ante viento',
      hint: 'Toldo, malla y tuberías fijados; plantas altas con tutor si hace falta.',
    },
    ext_sombra: {
      id: 'ext_sombra',
      label: 'Toldo / malla sombreo',
      hint: '50–70 % si >6 h de sol directo en verano.',
      eq: 'toldo',
      cat: 'toldo_malla',
    },
  };

  var MONTAJE_TOGGLES = {
    filtroCarbon: {
      id: 'tog_filtro_carbon',
      label: 'Filtro de carbón montado',
      hint: 'Manguera sellada al extractor; carbón nuevo o <12 meses de uso.',
      cat: 'filtro_carbon',
    },
    circulacion: {
      id: 'tog_ventilador_circ',
      label: 'Ventilación interior / clip fan',
      hint: 'Apunta al dosel; no soplar directo a cogollos húmedos en floración.',
      cat: 'ventilador_circ',
    },
    timer: {
      id: 'tog_temporizador',
      label: 'Temporizador LED programado',
      hint: '18/6 veg · 12/12 flor según fase actual.',
      cat: 'temporizador',
    },
    tijeras: {
      id: 'tog_tijeras',
      label: 'Tijeras de poda',
      hint: 'Desinfectadas; reserva solo para cultivo.',
      cat: 'tijeras',
    },
    lupa: {
      id: 'tog_lupa',
      label: 'Lupa tricomas disponible',
      hint: '30×–60× para revisar maduración antes de cortar.',
      cat: 'lupa',
    },
    toldo: {
      id: 'tog_toldo',
      label: 'Toldo / malla exterior',
      hint: 'Sombreo y protección UV en horas punta.',
      cat: 'toldo_malla',
    },
  };

  /** Mini-guías de montaje (contenido fijo + datos del catálogo en runtime). */
  var GUIAS = {
    sistema: {
      icon: '🫧',
      accent: 'hydro',
      title: 'Sistema hidro listo',
      steps: [
        'Comprueba que el asistente guardó tipo (DWC/RDWC), litros de depósito y rejilla de plantas.',
        'Rellena al menos una maceta/módulo con variedad si ya tienes material en mano.',
        'Anota el nutriente elegido: el checklist de recarga usará esos datos después.',
      ],
      verificar: ['Depósito o cubo con volumen coherente con el asistente', 'Sin errores rojos en el esquema de cultivo'],
    },
    fugas: {
      icon: '💧',
      accent: 'hydro',
      title: 'Tuberías y estanques sin fugas',
      steps: [
        'Llena depósito de control hasta nivel de trabajo (no al borde).',
        'Enciende bomba de recirculación 10–15 min y revisa cada racord y manguera.',
        'En RDWC: revisa retorno al depósito y que ningún cubo se vacía solo.',
      ],
      verificar: ['Sin gotas en suelo tras 15 min', 'Nivel estable en depósito de control'],
      cuidado: 'Una fuga pequeña en RDWC puede vaciar el depósito central en horas.',
    },
    nombre: {
      icon: '🏷️',
      accent: 'neutral',
      title: 'Nombre de la instalación',
      steps: [
        'Usa un nombre que identifique fase o sala: «Veg 120», «Flor RDWC», «Esquejes».',
        'Si tienes varias instalaciones, evita «Instalación» o «DWC 1» sin contexto.',
      ],
      verificar: ['Nombre visible en el selector de instalación arriba'],
    },
    iot: {
      icon: '📡',
      accent: 'iot',
      title: 'Gateway WiFi IoT',
      steps: [
        'Conecta el ESP32 a la red 2,4 GHz (misma que el móvil para probar).',
        'Comprueba que los sensores envían lectura en Sala → IoT.',
        'Si no usas IoT, puedes ignorar este paso.',
      ],
      verificar: ['Última lectura &lt; 5 min en panel IoT'],
      optional: true,
    },
    eq_armario: {
      icon: '🏠',
      accent: 'sala',
      title: 'Carpa / armario',
      cat: 'armario',
      steps: [
        'Monta el armazón en suelo nivelado; tensa la tela sin arrugas que dejen entrar luz.',
        'Comprueba cremalleras y ventanas de paso de cables (light leaks).',
        'Mide interior útil y confirma que coincide con el modelo del configurador.',
      ],
      verificar: ['Opaco con luces de sala apagadas', 'Altura suficiente para colgar LED'],
    },
    led: {
      icon: '💡',
      accent: 'light',
      title: 'LED / iluminación',
      cat: 'led',
      steps: [
        'Cuelga el driver a altura que permita subir/bajar el panel en floración.',
        'Cablea a temporizador o reloj de cuadro (18/6 veg · 12/12 flor).',
        'Distancia inicial orientativa: 40–60 cm en veg; acerca en flor según hoja.',
      ],
      verificar: ['Encendido estable sin parpadeo', 'Disipación: no tocar el radiador en caliente'],
    },
    eq_led: { extends: 'led' },
    eq_extractor: {
      icon: '💨',
      accent: 'air',
      title: 'Extractor e intracción',
      cat: 'extractor',
      steps: [
        'Coloca extractor arriba (sale aire caliente) e intractor abajo si lo tienes.',
        'Manguera rígida o flexible al filtro de carbón; sella con abrazaderas.',
        'Regula velocidad: suficiente para mover hojas sin estrés excesivo.',
      ],
      verificar: ['Depresión ligera al cerrar la carpa', 'Temperatura estable tras 30 min encendido'],
    },
    extractor: { extends: 'eq_extractor' },
    eq_humidificador: {
      icon: '💧',
      accent: 'air',
      title: 'Humidificador',
      cat: 'humidificador',
      steps: [
        'Depósito lleno con agua osmotizada o destilada.',
        'Apunta el vapor hacia el flujo del extractor (no directo a las puntas).',
        'En esquejes/veg: objetivo HR 65–75 % si la sala está seca.',
      ],
      verificar: ['HR sube en 20–30 min en Medir → ambiente'],
    },
    eq_deshumidificador: {
      icon: '🌫️',
      accent: 'air',
      title: 'Deshumidificador',
      cat: 'deshumidificador',
      steps: [
        'Vacía la bandeja o conecta desagüe continuo en floración larga.',
        'Colócalo donde recircule el aire de la sala (no en un rincón cerrado).',
        'En flor densa: mantén HR 45–55 % para evitar botrytis.',
      ],
      verificar: ['Bandeja no desborda', 'HR baja cuando el equipo está en marcha'],
    },
    eq_medidor: {
      icon: '📊',
      accent: 'tool',
      title: 'Medidor EC/pH',
      cat: 'medidor',
      steps: [
        'Calibra pH con buffer 4,0 y 7,0 (o según manual del pen).',
        'Calibra EC con solución estándar 1,413 o 2,77 mS/cm según rango del medidor.',
        'Enjuaga la sonda con agua osmotizada entre muestras; guarda en solución de almacenamiento si aplica.',
      ],
      verificar: ['Lectura estable en buffer', 'Registra calibración en Sala si la app lo ofrece'],
    },
    medidor: { extends: 'eq_medidor' },
    hyd_difusor: {
      icon: '🫧',
      accent: 'hydro',
      title: 'Aireador / difusor',
      hydro: 'difusor',
      steps: [
        'Piedra porosa o difusor al fondo del depósito (máxima profundidad útil).',
        'Bomba de aire por encima del nivel máximo de agua (evita reflujo).',
        'Comprueba burbujeo uniforme en todo el depósito o cubo.',
      ],
      verificar: ['Burbujas finas y constantes', 'Ruido de bomba estable'],
    },
    aireador: { extends: 'hyd_difusor' },
    hyd_bomba: {
      icon: '⚙️',
      accent: 'hydro',
      title: 'Bomba de recirculación',
      hydro: 'bomba',
      steps: [
        'RDWC: bomba en depósito de control → línea principal → derivaciones a cubos.',
        'Orienta la salida para crear ligera corriente en el depósito (mezcla EC).',
        'Prueba 15 min: todos los cubos reciben retorno visible.',
      ],
      verificar: ['Caudal sin cavitación (ruido de grava)', 'Racores apretados a mano + ¼ giro'],
      cuidado: 'No dejes la bomba seca: siempre sumergida o con cebado según modelo.',
    },
    hyd_calentador: {
      icon: '🌡️',
      accent: 'hydro',
      title: 'Calentador de depósito',
      hydro: 'calentador',
      steps: [
        'Sumerge el resistivo donde la corriente mezcle (no pegado al fondo sin flujo).',
        'Consigna según cultivo (p. ej. 18–20 °C invierno en raíz).',
        'Conecta a termostato o control de la instalación si lo tienes.',
      ],
      verificar: ['Temperatura de solución estable en 30 min', 'Sin condensación en enchufes'],
    },
    hyd_timer: {
      icon: '⏱️',
      accent: 'neutral',
      title: 'Temporizador / programador',
      hydro: 'timer',
      steps: [
        'Luz: programa fotoperiodo de fase actual (veg 18/6, flor 12/12).',
        'Bomba RDWC: muchos cultivadores usan 15 min on / 15 off o continuo según volumen.',
        'Comprueba hora real del reloj tras un corte de luz.',
      ],
      verificar: ['Encendido/apagado a la hora esperada', 'Un solo programa activo por canal'],
    },
    hyd_medidor_ec: {
      icon: '📈',
      accent: 'tool',
      title: 'Sonda EC/pH continua',
      hydro: 'medidorEC',
      steps: [
        'Coloca la sonda en zona de mezcla (no en un rincón muerto del depósito).',
        'Calibra según manual del fabricante (pensan distinto que un pen de mano).',
        'Comprueba lectura frente a tu medidor manual la primera semana.',
      ],
      verificar: ['Lectura coherente con muestra manual ±0,2 EC / 0,2 pH'],
    },
    exterior_ubic: {
      icon: '☀️',
      accent: 'neutral',
      title: 'Cultivo en exterior',
      steps: [
        'Confirma municipio en Sala para clima y alertas de lluvia/frío.',
        'Protege depósito y electrónica de lluvia directa y sol extremo.',
        'Toldo o malla de sombreo si el sol pega más de 6 h en verano.',
      ],
      verificar: ['Ubicación guardada en configuración', 'Acceso fácil para medir EC/pH'],
    },
    ext_ubic: { extends: 'exterior_ubic' },
    ext_deposito: {
      icon: '🛢️',
      accent: 'hydro',
      title: 'Depósito protegido',
      steps: [
        'Cubre el depósito de control con lona reflectante o caja aislada.',
        'Aleja enchufes y regletas del suelo por si hay lluvia.',
        'En verano: sombrear para mantener nutriente <26 °C.',
      ],
      verificar: ['Sin agua de lluvia dentro del depósito', 'Temp. nutriente estable en Medir'],
    },
    ext_drenaje: {
      icon: '💧',
      accent: 'hydro',
      title: 'Drenaje y base',
      steps: [
        'Nivela cubos y depósito; evita inclinación que vacíe un módulo RDWC.',
        'Canaliza el rebalse lejos de raíces y enchufes.',
        'Comprueba tras un riego fuerte simulado (manguera 2 min).',
      ],
      verificar: ['Sin charcos permanentes bajo la instalación'],
    },
    ext_viento: {
      icon: '🌬️',
      accent: 'air',
      title: 'Protección ante viento',
      steps: [
        'Fija toldo/malla con tensor y anclajes al suelo o pared.',
        'Sujeta mangueras RDWC para que no tiren de racores.',
        'Plantas altas: tutor discreto si zona ventosa.',
      ],
      verificar: ['Toldo no vibra peligrosamente', 'Racores sin tensión excesiva'],
    },
    ext_sombra: {
      icon: '⛱️',
      accent: 'light',
      title: 'Toldo / malla sombreo',
      cat: 'toldo_malla',
      steps: [
        'Monta malla 50–70 % sobre la zona de plantas (no solo el depósito).',
        'Deja ventilación lateral; no encerrar en “invernadero” sin aire.',
        'Ajusta según estación: más sombra en julio–agosto.',
      ],
      verificar: ['Hojas sin quemaduras al mediodía', 'Sigue entrando brisa entre plantas'],
    },
    eq_filtro_carbon: {
      icon: '🧫',
      accent: 'air',
      title: 'Filtro de carbón',
      cat: 'filtro_carbon',
      steps: [
        'Coloca filtro en la boca de salida del extractor (o intractor según montaje).',
        'Abrazaderas bien apretadas; sin fugas de aire en juntas.',
        'Prefiltro lavable si el modelo lo trae; revisa cada mes en floración.',
      ],
      verificar: ['Caudal filtro ≥ caudal extractor', 'Sin olor en salida de aire'],
    },
    eq_ventilador_circ: {
      icon: '🌀',
      accent: 'air',
      title: 'Ventilación interior',
      cat: 'ventilador_circ',
      steps: [
        'Clip fan a media altura apuntando al dosel (no directo a cogollos húmedos).',
        'Oscilación suave si el modelo lo permite.',
        'En floración densa: combina con deshumidificador si HR >55 %.',
      ],
      verificar: ['Hojas se mueven ligeramente', 'HR más uniforme en Medir → ambiente'],
    },
    eq_temporizador: {
      icon: '⏱️',
      accent: 'light',
      title: 'Temporizador LED',
      cat: 'temporizador',
      steps: [
        'Programa fotoperiodo de fase: 18/6 veg · 12/12 flor.',
        'Un canal por panel; no mezclar bomba de aire en el mismo timer si parpadea.',
        'Tras corte eléctrico: comprueba que la hora del timer es correcta.',
      ],
      verificar: ['Encendido/apagado a la hora esperada', 'Sin parpadeos en driver LED'],
    },
    eq_tijeras: {
      icon: '✂️',
      accent: 'tool',
      title: 'Tijeras de poda',
      cat: 'tijeras',
      steps: [
        'Reserva un par solo para cultivo (no cocina/jardín).',
        'Limpia con alcohol 70 % antes de poda y esquejes.',
        'Afila o sustituye si aplasta el tallo en lugar de cortar.',
      ],
      verificar: ['Corte limpio en tallo de prueba', 'Sin restos de óxido en hojas'],
    },
    eq_lupa: {
      icon: '🔍',
      accent: 'tool',
      title: 'Lupa tricomas',
      cat: 'lupa',
      steps: [
        'Revisa cogollo de la zona media-superior (más representativo).',
        '30×: visión general; 60×: detalle ámbar vs lechoso.',
        'No cortes solo por calendario: confirma con lupa 2–3 días seguidos.',
      ],
      verificar: ['Tricomas visibles con nitidez', 'Decisión de cosecha anotada en diario'],
    },
    tog_filtro_carbon: { extends: 'eq_filtro_carbon' },
    tog_ventilador_circ: { extends: 'eq_ventilador_circ' },
    tog_temporizador: { extends: 'eq_temporizador' },
    tog_tijeras: { extends: 'eq_tijeras' },
    tog_lupa: { extends: 'eq_lupa' },
    tog_toldo: { extends: 'ext_sombra' },
  };

  var MONTAJE_HIDRO = {
    difusor: {
      id: 'hyd_difusor',
      label: 'Aireador / difusor en depósito',
      hint: 'Burbujeo uniforme en el depósito de control o cubo DWC.',
      eq: 'difusor',
    },
    bomba: {
      id: 'hyd_bomba',
      label: 'Bomba de recirculación / riego',
      hint: 'En RDWC: bomba de retorno y caudal según sitios; en DWC: circulación si aplica.',
      eq: 'bomba',
    },
    calentador: {
      id: 'hyd_calentador',
      label: 'Calentador de depósito',
      hint: 'Consigna según cultivo; revisar termostato y seguridad eléctrica.',
      eq: 'calentador',
    },
    timer: {
      id: 'hyd_timer',
      label: 'Temporizador LED / programador',
      hint: 'Fotoperiodo 18/6 veg · 12/12 flor (interior).',
      eq: 'timer',
    },
    medidorEC: {
      id: 'hyd_medidor_ec',
      label: 'Sonda o medidor de solución',
      hint: 'Complementa el medidor de mano si usas lectura continua.',
      eq: 'medidorEC',
    },
  };

  function getCfg() {
    if (typeof state !== 'undefined' && state && state.configTorre && typeof state.configTorre === 'object') {
      if (Object.keys(state.configTorre).length > 1 || state.configTorre.checklistInstalacionConfirmada) {
        return state.configTorre;
      }
    }
    try {
      if (typeof getTorreActiva === 'function') {
        var t = getTorreActiva();
        if (t && t.config && typeof t.config === 'object') return t.config;
      }
    } catch (_) {}
    return (typeof state !== 'undefined' && state && state.configTorre) || {};
  }

  function getChecks(cfg) {
    cfg = cfg || getCfg();
    if (!cfg.puestaMarchaChecks || typeof cfg.puestaMarchaChecks !== 'object') {
      cfg.puestaMarchaChecks = {};
    }
    return cfg.puestaMarchaChecks;
  }

  function saveChecks(checks) {
    if (typeof state === 'undefined' || !state || !state.configTorre) return;
    state.configTorre.puestaMarchaChecks = checks;
    try {
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
      if (typeof saveState === 'function') saveState();
    } catch (_) {}
  }

  var _pmGuiaKeyOpen = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function equipLabel(entry, catKey) {
    if (!entry) return '';
    var marca = String(entry.marca || '').trim();
    var modelo = String(entry.modelo || '').trim();
    var nom = (marca + ' ' + modelo).trim();
    if (nom) return nom;
    var cats =
      typeof getEquipCategorias === 'function'
        ? getEquipCategorias()
        : typeof EQUIP_CATEGORIAS !== 'undefined'
          ? EQUIP_CATEGORIAS
          : {};
    var cat = cats[catKey];
    return cat && cat.label ? cat.label : catKey;
  }

  function resolveGuiaDef(key) {
    var def = GUIAS[key];
    if (!def) return null;
    if (def.extends) {
      var base = GUIAS[def.extends];
      if (!base) return def;
      def = Object.assign({}, base, def);
      delete def.extends;
    }
    return def;
  }

  function specsChips(entry, catKey) {
    if (!entry || !entry.specs || typeof entry.specs !== 'object') return [];
    var s = entry.specs;
    var chips = [];
    if (catKey === 'armario') {
      if (s.anchoM && s.largoM) chips.push(s.anchoM + '×' + s.largoM + ' m');
      if (s.altoM) chips.push('alto ' + s.altoM + ' m');
    } else if (catKey === 'led') {
      if (s.watts) chips.push(s.watts + ' W');
      if (s.coberturaM2) chips.push('~' + s.coberturaM2 + ' m²');
    } else if (catKey === 'extractor') {
      if (s.m3h) chips.push(s.m3h + ' m³/h');
      if (s.diametroMm) chips.push('Ø ' + s.diametroMm + ' mm');
    } else if (catKey === 'medidor' && s.calibracionDias) {
      chips.push('cal. cada ' + s.calibracionDias + ' d');
    }
    return chips;
  }

  function buildGuiaContent(key, cfg) {
    var def = resolveGuiaDef(key);
    if (!def) return null;
    cfg = cfg || getCfg();
    var inst = cfg.equipamientoInstalado || {};
    var catKey = def.cat || null;
    var entry = catKey && inst[catKey] ? inst[catKey] : null;
    var producto = entry ? equipLabel(entry, catKey) : '';
    var chips = catKey ? specsChips(entry, catKey) : [];
    var tipo = String(cfg.tipoInstalacion || 'dwc').toUpperCase();
    var hero =
      '<div class="hc-pm-guia-hero-inner hc-pm-guia-hero--' + esc(def.accent || 'neutral') + '">' +
      '<span class="hc-pm-guia-hero-icon" aria-hidden="true">' +
      (typeof hcGuiaHeroIconMarkup === 'function'
        ? hcGuiaHeroIconMarkup(def.icon || '📖')
        : def.icon || '📖') +
      '</span>' +
      '<div class="hc-pm-guia-hero-text">' +
      '<span class="hc-pm-guia-hero-kicker">Mini-guía de montaje</span>' +
      '<span class="hc-pm-guia-hero-title">' +
      esc(def.title) +
      '</span>' +
      (producto
        ? '<span class="hc-pm-guia-hero-product">Según configurador: <strong>' + esc(producto) + '</strong></span>'
        : '<span class="hc-pm-guia-hero-product hc-pm-guia-hero-product--muted">Modelo definido en el configurador (asistente)</span>') +
      (chips.length
        ? '<span class="hc-pm-guia-specs">' +
          chips.map(function (c) {
            return '<span class="hc-pm-guia-spec">' + esc(c) + '</span>';
          }).join('') +
          '</span>'
        : '') +
      '</div></div>';
    var steps = (def.steps || []).slice();
    if (key === 'fugas' && tipo === 'RDWC') {
      steps.push('RDWC activo: revisa también la línea de retorno al depósito central.');
    }
    var body =
      '<ol class="hc-pm-guia-steps">' +
      steps
        .map(function (st, i) {
          return (
            '<li class="hc-pm-guia-step"><span class="hc-pm-guia-step-n">' +
            (i + 1) +
            '</span><span class="hc-pm-guia-step-t">' +
            esc(st) +
            '</span></li>'
          );
        })
        .join('') +
      '</ol>';
    if (def.verificar && def.verificar.length) {
      body +=
        '<div class="hc-pm-guia-checkbox">' +
        '<p class="hc-pm-guia-checkbox-title">Antes de marcar ✓</p><ul>' +
        def.verificar
          .map(function (v) {
            return '<li>' + esc(v) + '</li>';
          })
          .join('') +
        '</ul></div>';
    }
    if (def.cuidado) {
      body += '<p class="hc-pm-guia-cuidado"><strong>⚠️</strong> ' + esc(def.cuidado) + '</p>';
    }
    if (entry && entry.nota) {
      body += '<p class="hc-pm-guia-nota">' + esc(entry.nota) + '</p>';
    }
    body +=
      '<p class="hc-pm-guia-footnote">El equipamiento no se edita aquí: solo resumen en Sala. Para cambiar modelo, usa el <strong>configurador</strong>.</p>';
    return { hero: hero, body: body, title: def.title, optional: !!def.optional };
  }

  function guiaBtnHtml(itemId, compact) {
    var safe = String(itemId || '').replace(/[^a-zA-Z0-9_]/g, '');
    if (!safe) return '';
    var cls = compact ? 'hc-pm-guia-chip' : 'hc-pm-guia-btn';
    var label = compact ? 'Guía' : 'Guía';
    return (
      '<button type="button" class="' +
      cls +
      '" onclick="event.preventDefault();event.stopPropagation();hcOpenPmGuia(\'' +
      safe +
      '\')" aria-label="Abrir guía: ' +
      esc(safe) +
      '">' +
      label +
      '</button>'
    );
  }

  var PM_ICON_FALLBACK = {
    sistema: 'hc-i-cog',
    fugas: 'hc-i-droplet',
    nombre: 'hc-i-note',
    iot: 'hc-i-signal',
    led: 'hc-i-bulb',
    extractor: 'hc-i-fan',
    medidor: 'hc-i-chart',
    aireador: 'hc-i-bubbles',
    eq_armario: 'hc-i-home',
    eq_filtro_carbon: 'hc-i-wind',
    eq_ventilador_circ: 'hc-i-fan',
    eq_temporizador: 'hc-i-calendar',
    eq_tijeras: 'hc-i-wrench',
    eq_lupa: 'hc-i-microscope',
    ext_ubic: 'hc-i-pin',
    ext_deposito: 'hc-i-bucket',
    ext_viento: 'hc-i-wind',
    ext_sombra: 'hc-i-sun',
    hyd_difusor: 'hc-i-bubbles',
    hyd_bomba: 'hc-i-cog',
    hyd_calentador: 'hc-i-therm',
    hyd_timer: 'hc-i-calendar',
    hyd_medidor_ec: 'hc-i-trend',
  };

  function pmItemIcon(it) {
    var id = PM_ICON_FALLBACK[it.id] || 'hc-i-alert-ok';
    if (typeof hcIcon === 'function') return hcIcon(id, 'hc-pm-card-ico-svg');
    return '<span class="hc-pm-card-ico-fallback" aria-hidden="true">•</span>';
  }

  function pmItemAccent(it) {
    var def = resolveGuiaDef(it.id);
    return (def && def.accent) || 'neutral';
  }

  function buildPmProgressHtml(prog, verificada, bloqueada) {
    var pct = prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0;
    var r = 15.5;
    var c = 2 * Math.PI * r;
    var off = c - (pct / 100) * c;
    var badge = bloqueada
      ? 'Cerrado'
      : verificada
        ? 'Verificado'
        : prog.done >= prog.total
          ? 'Listo'
          : 'En curso';
    var badgeCls =
      'hc-pm-progress-badge' +
      (verificada ? ' hc-pm-progress-badge--ok' : '') +
      (bloqueada ? ' hc-pm-progress-badge--lock' : '');
    return (
      '<div class="hc-pm-progress" role="status" aria-live="polite">' +
      '<div class="hc-pm-progress-ring" aria-hidden="true">' +
      '<svg viewBox="0 0 36 36" focusable="false">' +
      '<circle class="hc-pm-progress-ring-bg" cx="18" cy="18" r="' +
      r +
      '"></circle>' +
      '<circle class="hc-pm-progress-ring-fill" cx="18" cy="18" r="' +
      r +
      '" stroke-dasharray="' +
      c.toFixed(2) +
      '" stroke-dashoffset="' +
      off.toFixed(2) +
      '"></circle></svg>' +
      '<span class="hc-pm-progress-pct">' +
      pct +
      '%</span></div>' +
      '<div class="hc-pm-progress-meta">' +
      '<span class="hc-pm-progress-title">Checklist de montaje</span>' +
      '<span class="hc-pm-progress-sub">' +
      prog.done +
      ' / ' +
      prog.total +
      ' puntos esenciales</span>' +
      '<div class="hc-pm-progress-bar" aria-hidden="true">' +
      '<div class="hc-pm-progress-fill" style="width:' +
      pct +
      '%"></div></div></div>' +
      '<span class="' +
      badgeCls +
      '">' +
      esc(badge) +
      '</span></div>'
    );
  }

  function itemSalaRevisionWarn(cfg, it) {
    if (!it) return false;
    var cat = it.fromEquip || (it.cat && String(it.cat)) || null;
    if (!cat && it.fromToggle && MONTAJE_TOGGLES[it.fromToggle]) {
      cat = MONTAJE_TOGGLES[it.fromToggle].cat;
    }
    if (!cat) return false;
    try {
      if (typeof evalSalaRevisionCategoria === 'function') {
        return evalSalaRevisionCategoria(cfg, cat) === 'warn';
      }
    } catch (_) {}
    return false;
  }

  function buildPmEquipRefHtml(cfg) {
    var inst = cfg.equipamientoInstalado || {};
    var equipList = Object.keys(inst)
      .filter(function (k) {
        return inst[k] && (inst[k].marca || inst[k].id);
      })
      .map(function (k) {
        return equipLabel(inst[k], k);
      })
      .join(', ');
    var warnCats = [];
    Object.keys(inst).forEach(function (k) {
      if (inst[k] && (inst[k].marca || inst[k].id) && itemSalaRevisionWarn(cfg, { fromEquip: k })) {
        warnCats.push(k);
      }
    });
    var html = '';
    if (equipList) {
      html +=
        '<p class="hc-pm-equip-ref"><strong>En catálogo:</strong> ' +
        esc(equipList) +
        ' · revisa medidas en <button type="button" class="hc-pm-equip-link" onclick="hcPmIrRevisarSalaEquip()">Sala → equipamiento</button></p>';
    } else {
      html +=
        '<p class="hc-pm-equip-ref hc-pm-equip-ref--warn">' +
        'Sin equipamiento en catálogo: completa el asistente (Espacio y equipamiento) o la pestaña <strong>Sala</strong>.' +
        '</p>';
    }
    if (warnCats.length) {
      html +=
        '<p class="hc-pm-equip-ref hc-pm-equip-ref--sala-warn" role="note">' +
        '<span class="hc-pm-sala-warn-ico" aria-hidden="true">⚠️</span> ' +
        '<strong>Revisar en Sala:</strong> LED o extractor pueden no cuadrar con m² y volumen de la carpa (marca «revisar» en el resumen de sala).' +
        '</p>';
    }
    return html;
  }

  function hcPmIrRevisarSalaEquip() {
    try {
      if (typeof goTab === 'function') goTab('sala');
      setTimeout(function () {
        var det = document.getElementById('sistemaEquipDetails');
        if (det) det.open = true;
        try {
          det.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (_) {}
        if (typeof calcularGrowRoom === 'function') calcularGrowRoom();
      }, 200);
    } catch (_) {}
  }

  function buildPmCestaRecoHtml(cfg) {
    cfg = cfg || getCfg();
    try {
      if (typeof hcCultivoCestaRecoCelda !== 'function') return '';
      var tipo =
        typeof tipoInstalacionNormalizado === 'function'
          ? tipoInstalacionNormalizado(cfg)
          : String(cfg.tipoInstalacion || 'dwc').toLowerCase();
      if (tipo !== 'dwc' && tipo !== 'rdwc') return '';
      var grupo =
        typeof hcGrupoCultivoDominanteDesdeConfig === 'function'
          ? hcGrupoCultivoDominanteDesdeConfig(cfg)
          : 'hibrida';
      var objetivo =
        typeof hcObjetivoCultivoDesdeConfig === 'function'
          ? hcObjetivoCultivoDesdeConfig(cfg, tipo)
          : 'final';
      var celda = hcCultivoCestaRecoCelda(grupo, tipo, objetivo);
      if (!celda || !celda.txt) return '';
      var actual =
        tipo === 'rdwc'
          ? Number(cfg.rdwcNetPotMm || 0)
          : Number(cfg.dwcNetPotRimMm || 0);
      var txtActual = Number.isFinite(actual) && actual > 0 ? actual + ' mm' : 'sin definir';
      return (
        '<p class="hc-pm-cesta-reco">' +
        '<strong>Cesta recomendada según cultivo:</strong> ' +
        esc(celda.txt) +
        ' · actual: ' +
        esc(txtActual) +
        '</p>'
      );
    } catch (_) {
      return '';
    }
  }

  function renderPmCard(it, cfg, checks, mode) {
    var auto = isAutoDone(it, cfg);
    var checked = auto || !!checks[it.id];
    var bloqueada = montajeEdicionBloqueada();
    var disabled = auto || bloqueada;
    var safe = String(it.id || '').replace(/[^a-zA-Z0-9_]/g, '');
    var accent = pmItemAccent(it);
    var compact = mode === 'inline';
    var labelMain = it.label;
    var dot = labelMain.indexOf(' · ');
    var title = dot > 0 ? labelMain.slice(0, dot) : labelMain;
    var sub = dot > 0 ? labelMain.slice(dot + 3) : '';
    var salaWarn = itemSalaRevisionWarn(cfg, it);
    return (
      '<article class="hc-pm-card hc-pm-card--' +
      accent +
      (checked ? ' hc-pm-card--checked' : '') +
      (disabled ? ' hc-pm-card--disabled' : '') +
      (it.optional ? ' hc-pm-card--opt' : '') +
      (compact ? ' hc-pm-card--compact' : '') +
      (salaWarn ? ' hc-pm-card--sala-warn' : '') +
      '" data-pm-id="' +
      esc(safe) +
      '" role="listitem" tabindex="' +
      (disabled ? '-1' : '0') +
      '" aria-pressed="' +
      (checked ? 'true' : 'false') +
      '" onclick="hcPmCardActivate(event,\'' +
      safe +
      '\')" onkeydown="hcPmCardKey(event,\'' +
      safe +
      '\')">' +
      '<label class="hc-pm-card-check' +
      (checked ? ' is-on' : '') +
      '" aria-hidden="true">' +
      '<input type="checkbox" class="hc-pm-card-input" data-pm-input="' +
      esc(safe) +
      '"' +
      (checked ? ' checked' : '') +
      (disabled ? ' disabled' : '') +
      ' tabindex="-1">' +
      '<span class="hc-pm-card-check-icon"></span></label>' +
      '<div class="hc-pm-card-body">' +
      '<span class="hc-pm-card-icon" aria-hidden="true">' +
      pmItemIcon(it) +
      '</span>' +
      '<div class="hc-pm-card-text">' +
      '<h4 class="hc-pm-card-title">' +
      esc(title) +
      (salaWarn
        ? ' <span class="hc-pm-sala-warn-badge" title="Revisar medidas en Sala → equipamiento">⚠️ Sala</span>'
        : '') +
      (it.optional ? ' <span class="hc-pm-opt">(opcional)</span>' : '') +
      '</h4>' +
      (sub ? '<p class="hc-pm-card-sub">' + esc(sub) + '</p>' : '') +
      '<p class="hc-pm-card-hint">' +
      esc(it.hint) +
      '</p></div></div>' +
      (auto ? '<span class="hc-pm-card-auto">Auto</span>' : guiaBtnHtml(it.id, compact)) +
      '</article>'
    );
  }

  function buildPmCardsGrid(cfg, checks, mode) {
    var items = buildItemsForConfig(cfg);
    var essential = [];
    var optional = [];
    items.forEach(function (it) {
      if (it.optional) optional.push(it);
      else essential.push(it);
    });
    var html =
      '<div class="hc-pm-grid' +
      (mode === 'inline' ? ' hc-pm-grid--inline' : '') +
      '" role="list">' +
      essential
        .map(function (it) {
          return renderPmCard(it, cfg, checks, mode);
        })
        .join('') +
      '</div>';
    if (optional.length) {
      html +=
        '<details class="hc-pm-optional-block">' +
        '<summary class="hc-pm-optional-summary">Puntos opcionales (' +
        optional.length +
        ')</summary>' +
        '<div class="hc-pm-grid hc-pm-grid--optional" role="list">' +
        optional
          .map(function (it) {
            return renderPmCard(it, cfg, checks, mode);
          })
          .join('') +
        '</div></details>';
    }
    return html;
  }

  function buildPmShellHtml(cfg, checks, prog, verificada, bloqueada, mode) {
    var ventanaTxt = bloqueada
      ? 'Montaje cerrado tras el primer llenado del depósito.'
      : mode === 'inline'
        ? 'Revisa el montaje hasta el <strong>primer llenado del depósito</strong>. Toca una tarjeta para marcarla.'
        : 'Editable hasta el <strong>primer llenado del depósito</strong>. Toca cada tarjeta o usa la casilla.';
    return (
      '<div class="hc-pm-shell hc-pm-shell--' +
      mode +
      '">' +
      buildPmProgressHtml(prog, verificada, bloqueada) +
      '<p class="hc-pm-lead">' +
      ventanaTxt +
      '</p>' +
      buildPmEquipRefHtml(cfg) +
      buildPmCestaRecoHtml(cfg) +
      buildPmCardsGrid(cfg, checks, mode) +
      '</div>'
    );
  }

  function hcPmCardActivate(ev, id) {
    if (ev && (ev.target.closest('.hc-pm-guia-btn') || ev.target.closest('.hc-pm-guia-chip'))) return;
    var card = ev && ev.currentTarget;
    var inp =
      (card && card.querySelector('.hc-pm-card-input')) ||
      document.querySelector('.hc-pm-card-input[data-pm-input="' + id + '"]');
    if (!inp || inp.disabled) return;
    inp.checked = !inp.checked;
    toggleItem(id, inp.checked);
  }

  function hcPmCardKey(ev, id) {
    if (!ev || (ev.key !== 'Enter' && ev.key !== ' ')) return;
    ev.preventDefault();
    hcPmCardActivate(ev, id);
  }

  function renderPmChecklistItem(it, cfg, checks) {
    return renderPmCard(it, cfg, checks, 'modal');
  }

  function buildItemsForConfig(cfg) {
    cfg = cfg || getCfg();
    var items = ITEMS_BASE.slice();
    var cam =
      cfg.caminoCultivo ||
      (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo) ||
      '';
    var esperaHidro =
      (cam === 'semilla_propagador' || cam === 'semilla_hidro') &&
      cfg.tipoInstalacion !== 'dwc' &&
      cfg.tipoInstalacion !== 'rdwc';
    if (esperaHidro) {
      items = items.filter(function (it) {
        return it.id !== 'sistema' && it.id !== 'fugas';
      });
    }
    var inst = cfg.equipamientoInstalado && typeof cfg.equipamientoInstalado === 'object' ? cfg.equipamientoInstalado : {};
    var eqArr = Array.isArray(cfg.equipamiento) ? cfg.equipamiento : [];
    var interior =
      String(cfg.ubicacion || (cfg.premiumSetup && cfg.premiumSetup.entorno) || 'interior').toLowerCase() !==
      'exterior';

    if (interior) {
      Object.keys(MONTAJE_POR_CATEGORIA).forEach(function (key) {
        var def = MONTAJE_POR_CATEGORIA[key];
        if (!inst[key] || !inst[key].marca) return;
        var nom = equipLabel(inst[key], key);
        items.push({
          id: def.id,
          label: def.label + (nom ? ' · ' + nom : ''),
          hint: def.hint + (inst[key].nota ? ' — ' + inst[key].nota : ''),
          fromEquip: key,
          cat: key,
        });
      });
      if (!inst.led && !items.some(function (it) { return it.id === 'eq_led'; })) {
        items.splice(1, 0, {
          id: 'led',
          label: 'LED / lámpara instalada y encendida',
          hint: 'Altura y fotoperiodo según fase (18/6 veg, 12/12 flor).',
        });
      }
      if (!inst.extractor && !items.some(function (it) { return it.id === 'eq_extractor'; })) {
        items.push({
          id: 'extractor',
          label: 'Extractor e intracción de aire',
          hint: 'Renovación de aire y temperatura bajo control.',
        });
      }
      if (!inst.medidor && !items.some(function (it) { return it.id === 'eq_medidor'; })) {
        items.push({
          id: 'medidor',
          label: 'Medidor EC/pH calibrado',
          hint: 'Solución buffer 4,0 / 7,0 (pH) y estándar EC si aplica.',
        });
      }
    } else {
      Object.keys(MONTAJE_EXTERIOR).forEach(function (key) {
        var def = MONTAJE_EXTERIOR[key];
        if (key === 'ext_sombra') {
          if (eqArr.indexOf('toldo') < 0 && !(inst.toldo_malla && inst.toldo_malla.marca)) return;
        }
        var nom = def.cat && inst[def.cat] ? equipLabel(inst[def.cat], def.cat) : '';
        items.push({
          id: def.id,
          label: def.label + (nom ? ' · ' + nom : ''),
          hint: def.hint,
          fromExterior: key,
        });
      });
    }

    Object.keys(MONTAJE_TOGGLES).forEach(function (key) {
      if (eqArr.indexOf(key) < 0) return;
      if (interior && key === 'toldo') return;
      if (!interior && (key === 'filtroCarbon' || key === 'timer')) return;
      var def = MONTAJE_TOGGLES[key];
      if (items.some(function (it) { return it.id === def.id; })) return;
      var catEntry = def.cat && inst[def.cat] ? inst[def.cat] : null;
      var nom = catEntry ? equipLabel(catEntry, def.cat) : '';
      if (catEntry && inst[def.cat] && inst[def.cat].marca && items.some(function (it) {
        return it.fromEquip === def.cat || it.id === 'eq_' + def.cat;
      })) {
        return;
      }
      items.push({
        id: def.id,
        label: def.label + (nom ? ' · ' + nom : ''),
        hint: def.hint,
        fromToggle: key,
      });
    });

    if (esperaHidro) {
      return items;
    }

    Object.keys(MONTAJE_HIDRO).forEach(function (key) {
      var def = MONTAJE_HIDRO[key];
      if (eqArr.indexOf(def.eq) < 0) return;
      if (items.some(function (it) { return it.id === def.id; })) return;
      items.push({
        id: def.id,
        label: def.label,
        hint: def.hint,
        fromHydro: def.eq,
      });
    });

    if (!eqArr.includes('difusor') && !items.some(function (it) { return it.id === 'hyd_difusor' || it.id === 'aireador'; })) {
      var tipo = String(cfg.tipoInstalacion || '').toLowerCase();
      if (tipo === 'dwc' || tipo === 'rdwc') {
        items.push({
          id: 'aireador',
          label: 'Aireador / bomba de depósito OK',
          hint: 'Burbujeo uniforme; en RDWC también bomba de recirculación.',
        });
      }
    }

    return items;
  }

  function isAutoDone(item, cfg) {
    if (item.id === 'sistema') {
      return !!(cfg && cfg.checklistInstalacionConfirmada);
    }
    if (item.autoNombre) {
      var t =
        typeof getTorreActiva === 'function'
          ? getTorreActiva()
          : state && state.torres
            ? state.torres[state.torreActiva || 0]
            : null;
      var n = t && t.nombre ? String(t.nombre).trim() : '';
      return n.length > 2 && n.toLowerCase() !== 'instalación';
    }
    return false;
  }

  function montajeEdicionBloqueada() {
    return typeof montajePuedeEditarse === 'function' && !montajePuedeEditarse();
  }

  function limpiarVerificacionMontaje(checks) {
    if (checks && checks.completedAt) {
      delete checks.completedAt;
      return true;
    }
    return false;
  }

  function refreshPuestaMarchaModalFoot(cfg, checks) {
    var foot = document.querySelector('#modalPuestaMarcha .hc-pm-foot');
    if (!foot) return;
    var bloqueada = montajeEdicionBloqueada();
    var verificada = !!(checks && checks.completedAt);
    var finishBtn = document.getElementById('hcPmBtnFinish');
    var hintEl = document.getElementById('hcPmFootHint');
    if (finishBtn) {
      finishBtn.style.display = bloqueada || verificada ? 'none' : '';
      finishBtn.disabled = !!bloqueada;
    }
    if (!hintEl) {
      hintEl = document.createElement('p');
      hintEl.id = 'hcPmFootHint';
      hintEl.className = 'hc-pm-foot-hint';
      foot.insertBefore(hintEl, foot.firstChild);
    }
    if (bloqueada) {
      hintEl.innerHTML =
        '🔒 Montaje cerrado tras el primer llenado del depósito.';
    } else if (verificada) {
      hintEl.innerHTML =
        '✓ Montaje verificado. Editable hasta el primer llenado del depósito.';
    } else {
      hintEl.innerHTML =
        'Verifica el montaje. Editable hasta el primer llenado del depósito.';
    }
  }

  function countProgress(checks, cfg, items) {
    items = items || buildItemsForConfig(cfg);
    var done = 0;
    var total = 0;
    items.forEach(function (it) {
      if (it.optional) return;
      total++;
      if (checks[it.id] || isAutoDone(it, cfg)) done++;
    });
    return { done: done, total: total };
  }

  function renderPuestaMarchaBody() {
    var host = document.getElementById('puestaMarchaBody');
    if (!host) return;
    var cfg = getCfg();
    var checks = getChecks(cfg);
    var items = buildItemsForConfig(cfg);
    var prog = countProgress(checks, cfg, items);
    var bloqueada = montajeEdicionBloqueada();

    host.innerHTML =
      buildPmShellHtml(cfg, checks, prog, !!checks.completedAt, bloqueada, 'modal') +
      (!bloqueada
        ? '<p class="hc-pm-config-link"><button type="button" class="btn btn-ghost btn-sm" onclick="hcAbrirConfiguradorDesdeMontaje()">Cambiar equipamiento o sistema (configurador)</button></p>'
        : '');
    refreshPuestaMarchaModalFoot(cfg, checks);
  }

  function buildPuestaMarchaInlineHtml(cfg, checks, prog, verificada, items) {
    items = items || buildItemsForConfig(cfg);
    var bloqueada = montajeEdicionBloqueada();
    var btnLabel = bloqueada
      ? 'Ver montaje (solo lectura)'
      : verificada
        ? 'Revisar montaje'
        : 'Abrir checklist completo';
    return (
      buildPmShellHtml(cfg, checks, prog, verificada, bloqueada, 'inline') +
      (!bloqueada
        ? '<p class="hc-pm-inline-config"><button type="button" class="btn btn-ghost btn-sm" onclick="hcAbrirConfiguradorDesdeMontaje()">Cambiar equipamiento (configurador)</button></p>'
        : '') +
      '<p class="hc-pm-inline-actions">' +
      '<button type="button" class="btn btn-primary btn-sm hc-btn-puesta-marcha" onclick="hcOpenPuestaMarchaChecklist()">' +
      btnLabel +
      '</button></p>'
    );
  }

  function renderPuestaMarchaInlinePreview() {
    var cfg = getCfg();
    var checks = getChecks(cfg);
    var items = buildItemsForConfig(cfg);
    var prog = countProgress(checks, cfg, items);
    var verificada = !!checks.completedAt;
    var html = buildPuestaMarchaInlineHtml(cfg, checks, prog, verificada, items);
    if (!html || !String(html).trim()) {
      html =
        '<p class="hc-pm-inline-lead">Configura una instalación con el asistente para ver el checklist de montaje.</p>' +
        '<p class="hc-pm-inline-actions"><button type="button" class="btn btn-primary btn-sm" onclick="typeof abrirSetupNuevaTorre===\'function\'?abrirSetupNuevaTorre():abrirSetup()">Configurar instalación</button></p>';
    }
    ['sistemaMontajeChecksBody', 'hcMontajeInicioBody'].forEach(function (id) {
      var host = document.getElementById(id);
      if (host) host.innerHTML = html;
    });
  }

  function refreshPuestaMarchaUi() {
    var cfg = getCfg();
    var checks = getChecks(cfg);
    var items = buildItemsForConfig(cfg);
    var prog = countProgress(checks, cfg, items);
    var verificada = !!checks.completedAt;
    var bloqueada = montajeEdicionBloqueada();
    var btnTxt = bloqueada
      ? 'Ver montaje'
      : verificada
        ? 'Revisar montaje'
        : 'Verificar puesta en marcha';
    document.querySelectorAll('.hc-btn-puesta-marcha').forEach(function (btn) {
      btn.textContent = btnTxt;
      btn.classList.toggle('hc-btn-puesta-marcha--ok', verificada && !bloqueada);
      btn.setAttribute('aria-pressed', verificada ? 'true' : 'false');
    });
    var status = document.getElementById('medirPuestaMarchaStatus');
    if (status) {
      if (bloqueada) {
        status.textContent = 'Montaje verificado · cerrado tras primer llenado del depósito.';
      } else if (verificada) {
        status.textContent =
          'Verificado · editable hasta el primer llenado (' + prog.total + '/' + prog.total + ' puntos).';
      } else {
        status.textContent = prog.done + '/' + prog.total + ' puntos esenciales · revisa montaje en Sala.';
      }
    }
    var kicker = document.getElementById('medirPuestaMarchaKicker');
    if (kicker) {
      if (bloqueada) {
        kicker.textContent = '✓ Montaje cerrado';
      } else if (verificada) {
        kicker.textContent = '✓ Verificado · editable hasta depósito';
      } else {
        kicker.textContent = 'Montaje de la instalación activa';
      }
    }
    var card = document.getElementById('medirPuestaMarchaCard');
    if (card) card.classList.toggle('medir-pm-card--ok', verificada);
    var resumen = document.getElementById('sistemaMontajeChecksResumen');
    if (resumen) {
      if (bloqueada) {
        resumen.textContent = '✓ Cerrado';
      } else if (verificada) {
        resumen.textContent = '✓ Editable';
      } else {
        resumen.textContent = prog.done + '/' + prog.total + ' esenciales';
      }
    }
    var inicioSub = document.getElementById('hcMontajeInicioSub');
    if (inicioSub) {
      if (bloqueada) {
        inicioSub.textContent = '✓ Cerrado tras depósito';
      } else if (verificada) {
        inicioSub.textContent = '✓ Editable hasta depósito';
      } else {
        inicioSub.textContent = prog.done + '/' + prog.total + ' esenciales';
      }
    }
    var modalTitle = document.getElementById('puestaMarchaTitle');
    if (modalTitle) {
      if (bloqueada) {
        modalTitle.textContent = 'Montaje (solo lectura)';
      } else if (verificada) {
        modalTitle.textContent = 'Revisar montaje';
      } else {
        modalTitle.textContent = 'Puesta en marcha';
      }
    }
    renderPuestaMarchaInlinePreview();
    try {
      if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
      if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
    } catch (_) {}
  }

  function openPmGuia(key) {
    var safe = String(key || '').replace(/[^a-zA-Z0-9_]/g, '');
    if (!safe) return;
    var content = buildGuiaContent(safe, getCfg());
    if (!content) {
      if (typeof showToast === 'function') showToast('Guía no disponible para este paso.', true);
      return;
    }
    _pmGuiaKeyOpen = safe;
    var hero = document.getElementById('pmGuiaHero');
    var body = document.getElementById('pmGuiaBody');
    var title = document.getElementById('pmGuiaTitle');
    var modal = document.getElementById('modalPmGuia');
    var markBtn = document.getElementById('pmGuiaMarkBtn');
    if (hero) hero.innerHTML = content.hero;
    if (body) body.innerHTML = content.body;
    if (title) title.textContent = content.title;
    if (markBtn) {
      markBtn.style.display = content.optional ? 'none' : '';
      markBtn.textContent = 'Marcar paso hecho';
    }
    if (!modal) {
      if (typeof showToast === 'function') showToast('No se pudo abrir la guía (modal ausente).', true);
      return;
    }
    modal.classList.add('open');
    try {
      if (typeof a11yDialogOpened === 'function') a11yDialogOpened(modal);
    } catch (_) {}
    try {
      modal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (_) {}
  }

  function closePmGuia(ev) {
    if (ev && ev.target !== ev.currentTarget) return;
    var modal = document.getElementById('modalPmGuia');
    if (modal) {
      modal.classList.remove('open');
      try {
        if (typeof a11yDialogClosed === 'function') a11yDialogClosed(modal);
      } catch (_) {}
    }
    _pmGuiaKeyOpen = null;
  }

  function ensurePmGuiaClickDelegation() {
    if (ensurePmGuiaClickDelegation._ready) return;
    ensurePmGuiaClickDelegation._ready = true;
    document.addEventListener(
      'click',
      function (ev) {
        var btn = ev.target && ev.target.closest ? ev.target.closest('.hc-pm-guia-btn, .hc-pm-guia-chip') : null;
        if (!btn) return;
        var card = btn.closest('[data-pm-id]');
        var id = card ? card.getAttribute('data-pm-id') : '';
        if (!id) return;
        ev.preventDefault();
        ev.stopPropagation();
        openPmGuia(id);
      },
      true
    );
  }

  function pmGuiaMarkDone() {
    if (!_pmGuiaKeyOpen) return;
    if (montajeEdicionBloqueada()) {
      if (typeof showToast === 'function') showToast('Montaje cerrado tras el primer llenado.', true);
      return;
    }
    toggleItem(_pmGuiaKeyOpen, true);
    closePmGuia();
    if (typeof showToast === 'function') showToast('Paso marcado en el checklist.');
  }

  function openPuestaMarchaChecklist() {
    var modal = document.getElementById('modalPuestaMarcha');
    if (!modal) {
      if (typeof showToast === 'function') {
        showToast('No se pudo abrir el checklist de montaje.', true);
      }
      return;
    }
    renderPuestaMarchaBody();
    modal.classList.add('open');
    refreshPuestaMarchaModalFoot(getCfg(), getChecks(getCfg()));
    try {
      modal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (_) {}
  }

  function closePuestaMarchaChecklist(ev) {
    if (ev && ev.target !== ev.currentTarget) return;
    var modal = document.getElementById('modalPuestaMarcha');
    if (modal) modal.classList.remove('open');
  }

  function toggleItem(id, checked) {
    if (montajeEdicionBloqueada()) {
      if (typeof showToast === 'function') {
        showToast('Montaje cerrado: ya completaste el primer llenado del depósito.', true);
      }
      return;
    }
    var cfg = getCfg();
    var checks = Object.assign({}, getChecks(cfg));
    var items = buildItemsForConfig(cfg);
    var item = items.find(function (it) { return it.id === id; });
    if (!checked && item && !item.optional && checks.completedAt) {
      limpiarVerificacionMontaje(checks);
      if (typeof showToast === 'function') {
        showToast('Verificación anulada: revisa el montaje y confirma de nuevo cuando esté listo.');
      }
      try {
        if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
        if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
      } catch (_) {}
    }
    checks[id] = !!checked;
    if (checked) checks[id + 'At'] = new Date().toISOString();
    else delete checks[id + 'At'];
    saveChecks(checks);
    renderPuestaMarchaBody();
    refreshPuestaMarchaUi();
  }

  function hcAbrirConfiguradorDesdeMontaje() {
    if (montajeEdicionBloqueada()) {
      if (typeof showToast === 'function') {
        showToast('Configurador bloqueado tras el primer llenado del depósito.', true);
      }
      return;
    }
    if (
      !confirm(
        '¿Abrir el configurador?\n\nPodrás cambiar equipamiento y parámetros del sistema. ' +
          'Revisa el checklist de montaje después si cambias algo físico.\n\n' +
          'Disponible hasta completar el primer llenado del depósito.'
      )
    ) {
      return;
    }
    try {
      if (typeof hcClosePuestaMarchaChecklist === 'function') hcClosePuestaMarchaChecklist();
    } catch (_) {}
    if (typeof abrirSetup === 'function') abrirSetup();
  }

  function finishPuestaMarcha() {
    if (montajeEdicionBloqueada()) {
      if (typeof showToast === 'function') showToast('Montaje ya cerrado tras el primer llenado.', true);
      return;
    }
    var cfg = getCfg();
    var checks = getChecks(cfg);
    var items = buildItemsForConfig(cfg);
    var prog = countProgress(checks, cfg, items);
    if (prog.done < prog.total) {
      if (typeof showToast === 'function') {
        showToast('Marca los puntos esenciales antes de finalizar (' + prog.done + '/' + prog.total + ').', true);
      }
      return;
    }
    if (
      !confirm(
        '¿Confirmas que el montaje funciona correctamente?\n\n' +
          'Podrás revisarlo y modificarlo hasta completar el primer llenado del depósito (mezcla de nutrientes).'
      )
    ) {
      return;
    }
    var tipo = String(cfg.tipoInstalacion || 'dwc').toLowerCase();
    var eqArr = Array.isArray(cfg.equipamiento) ? cfg.equipamiento : [];
    var esKratky = typeof esDwcKratky === 'function' && esDwcKratky(cfg);
    var sinDifusor = eqArr.indexOf('difusor') < 0;
    if ((tipo === 'dwc' || tipo === 'rdwc') && !esKratky && sinDifusor) {
      if (
        !confirm(
          'No tienes marcado aireador/difusor en el equipamiento.\n\n' +
            'En DWC/RDWC el oxígeno 24 h es crítico para evitar Pythium. ¿Confirmar montaje igualmente?'
        )
      ) {
        return;
      }
    }
    checks.completedAt = new Date().toISOString();
    saveChecks(checks);
    closePuestaMarchaChecklist();
    refreshPuestaMarchaUi();
    if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
    if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
    if (typeof refreshDashCaminoResumen === 'function') refreshDashCaminoResumen();
    if (typeof showToast === 'function') {
      var cam =
        cfg.caminoCultivo ||
        (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo) ||
        '';
      var germAun =
        (cam === 'semilla_propagador' || cam === 'semilla_hidro') &&
        typeof germinacionListaParaConfigHidro === 'function' &&
        !germinacionListaParaConfigHidro(cfg);
      var msgGermSala =
        germAun
          ? '✓ Montaje de sala listo. Sigue las 6 fases en Inicio; al terminar cierras DWC/RDWC (sin repetir germinación en el depósito).'
          : cam === 'semilla_propagador' || cam === 'semilla_hidro'
            ? '✓ Montaje verificado. Si falta hidro en la lista, complétalo; luego cultivo y primer llenado.'
            : '✓ Montaje verificado. Siguiente: cultivos en el esquema y luego primer llenado del depósito.';
      showToast(msgGermSala, false, { durationMs: 5600 });
    }
    if (
      (cfg.caminoCultivo === 'semilla_propagador' || cfg.caminoCultivo === 'semilla_hidro') &&
      typeof germinacionListaParaConfigHidro === 'function' &&
      !germinacionListaParaConfigHidro(cfg)
    ) {
      setTimeout(function () {
        try {
          if (typeof goTab === 'function') goTab('inicio');
          document.getElementById('dashGerminacionHub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (typeof refreshDashGerminacionHub === 'function') refreshDashGerminacionHub();
        } catch (_) {}
      }, 500);
    } else if (
      cfg.caminoCultivo === 'esqueje_hidro' &&
      typeof enraizadoMontajeCompleto === 'function' &&
      !enraizadoMontajeCompleto(cfg)
    ) {
      setTimeout(function () {
        if (typeof hcOpenPropagadorMontajeChecklist === 'function') hcOpenPropagadorMontajeChecklist();
      }, 600);
    }
  }

  function montajeVerificacionVigente(cfg) {
    cfg = cfg || getCfg();
    var checks = getChecks(cfg);
    if (!checks.completedAt) return false;
    var items = buildItemsForConfig(cfg);
    var prog = countProgress(checks, cfg, items);
    return prog.total > 0 && prog.done >= prog.total;
  }

  function limpiarVerificacionMontajeSiHidroPendiente(cfg) {
    cfg = cfg || getCfg();
    if (cfg.checklistInstalacionConfirmada === true) return;
    var cam =
      cfg.caminoCultivo || (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo) || '';
    if (cam !== 'semilla_propagador' && cam !== 'semilla_hidro') return;
    var checks = getChecks(cfg);
    if (!checks.completedAt) return;
    if (!limpiarVerificacionMontaje(checks)) return;
    saveChecks(checks);
    refreshPuestaMarchaUi();
    if (typeof showToast === 'function') {
      showToast(
        'Tras configurar DWC/RDWC, completa los puntos de sistema hidro en montaje de sala.',
        false,
        { durationMs: 5200 }
      );
    }
  }

  function maybeOfferAfterSetup() {
    try {
      if (window._hcSetupWizardCompletadoTs && Date.now() - window._hcSetupWizardCompletadoTs < 12000) {
        return;
      }
    } catch (_) {}
    var cfg = getCfg();
    var checks = getChecks(cfg);
    if (checks.completedAt) return;
    setTimeout(function () {
      if (typeof showToast === 'function') {
        showToast(
          '💡 Revisa montaje en Sala (checklist) o pulsa «Verificar puesta en marcha» en Medir.',
          false
        );
      }
    }, 6200);
  }

  global.hcOpenPuestaMarchaChecklist = openPuestaMarchaChecklist;
  global.hcClosePuestaMarchaChecklist = closePuestaMarchaChecklist;
  ensurePmGuiaClickDelegation();

  global.hcOpenPmGuia = openPmGuia;
  global.hcClosePmGuia = closePmGuia;
  global.hcPmGuiaMarkDone = pmGuiaMarkDone;
  global.hcPuestaMarchaToggle = toggleItem;
  global.hcPmCardActivate = hcPmCardActivate;
  global.hcPmCardKey = hcPmCardKey;
  global.hcFinishPuestaMarcha = finishPuestaMarcha;
  global.hcMaybeOfferPuestaMarcha = maybeOfferAfterSetup;
  global.hcRefreshPuestaMarchaUi = refreshPuestaMarchaUi;
  global.hcBuildPuestaMarchaItems = buildItemsForConfig;
  global.hcPmIrRevisarSalaEquip = hcPmIrRevisarSalaEquip;
  global.hcAbrirConfiguradorDesdeMontaje = hcAbrirConfiguradorDesdeMontaje;
  global.montajeEdicionBloqueada = montajeEdicionBloqueada;
  global.montajeVerificacionVigente = montajeVerificacionVigente;
  global.limpiarVerificacionMontajeSiHidroPendiente = limpiarVerificacionMontajeSiHidroPendiente;
})(typeof window !== 'undefined' ? window : globalThis);
