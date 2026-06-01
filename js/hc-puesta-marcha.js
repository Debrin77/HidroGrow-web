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
      label: 'Temporizador / programador',
      hint: 'Luz y/o bomba en horarios correctos.',
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
      (def.icon || '📖') +
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
    var label = compact ? 'Guía' : '📖 Guía';
    return (
      '<button type="button" class="' +
      cls +
      '" onclick="event.preventDefault();event.stopPropagation();hcOpenPmGuia(\'' +
      safe +
      '\')">' +
      label +
      '</button>'
    );
  }

  function renderPmChecklistItem(it, cfg, checks) {
    var auto = isAutoDone(it, cfg);
    var checked = auto || !!checks[it.id];
    return (
      '<li class="hc-pm-item' +
      (it.optional ? ' hc-pm-item--opt' : '') +
      (checked ? ' hc-pm-item--checked' : '') +
      '">' +
      '<div class="hc-pm-item-row">' +
      '<label class="hc-pm-lbl">' +
      '<input type="checkbox" data-pm-id="' +
      it.id +
      '"' +
      (checked ? ' checked' : '') +
      (auto ? ' disabled' : '') +
      ' onchange="hcPuestaMarchaToggle(\'' +
      it.id +
      '\', this.checked)">' +
      '<span class="hc-pm-lbl-text"><strong>' +
      esc(it.label) +
      '</strong>' +
      (it.optional ? ' <span class="hc-pm-opt">(opcional)</span>' : '') +
      '<span class="hc-pm-hint">' +
      esc(it.hint) +
      '</span></span></label>' +
      guiaBtnHtml(it.id, false) +
      '</div></li>'
    );
  }

  function buildItemsForConfig(cfg) {
    cfg = cfg || getCfg();
    var items = ITEMS_BASE.slice();
    var inst = cfg.equipamientoInstalado && typeof cfg.equipamientoInstalado === 'object' ? cfg.equipamientoInstalado : {};
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
      items.push({
        id: 'exterior_ubic',
        label: 'Ubicación exterior confirmada',
        hint: 'Clima del municipio y protección frente a lluvia / viento.',
      });
    }

    var eqArr = Array.isArray(cfg.equipamiento) ? cfg.equipamiento : [];
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
      if (tipo === 'dwc' || tipo === 'rdwc' || tipo === 'torre' || tipo === 'nft') {
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
    var inst = cfg.equipamientoInstalado || {};
    var equipList = Object.keys(inst)
      .filter(function (k) { return inst[k] && (inst[k].marca || inst[k].id); })
      .map(function (k) { return equipLabel(inst[k], k); })
      .join(', ');

    host.innerHTML =
      '<p class="hc-pm-lead">Revisa el montaje <strong>una vez</strong> por instalación. Pulsa <strong>📖 Guía</strong> en cada paso para ver cómo montarlo según tu catálogo. No sustituye al checklist de <strong>recarga</strong>.</p>' +
      (equipList
        ? '<p class="hc-pm-equip-ref"><strong>En catálogo:</strong> ' + equipList + '</p>'
        : '<p class="hc-pm-equip-ref hc-pm-equip-ref--warn">Sin equipamiento en catálogo: completa el asistente (Espacio y equipamiento) o la pestaña <strong>Sala</strong>.</p>') +
      '<p class="hc-pm-prog">' +
      prog.done +
      '/' +
      prog.total +
      ' puntos esenciales</p>' +
      '<ul class="hc-pm-list">' +
      items.map(function (it) { return renderPmChecklistItem(it, cfg, checks); }).join('') +
      '</ul>';
  }

  function buildPuestaMarchaInlineHtml(cfg, checks, prog, verificada, items) {
    items = items || buildItemsForConfig(cfg);
    var inst = cfg.equipamientoInstalado || {};
    var nEquip = Object.keys(inst).filter(function (k) {
      return inst[k] && (inst[k].marca || inst[k].id);
    }).length;
    return (
      '<p class="hc-pm-inline-lead">Revisa el montaje <strong>una vez</strong> por instalación' +
      (nEquip ? ' (' + nEquip + ' componentes en catálogo)' : '') +
      '. Cada paso tiene enlace <strong>Guía</strong>. No sustituye al checklist de recarga.</p>' +
      '<p class="hc-pm-prog">' +
      (verificada ? '✓ Puesta en marcha verificada · ' : '') +
      prog.done +
      '/' +
      prog.total +
      ' puntos esenciales</p>' +
      '<ul class="hc-pm-list hc-pm-list--inline">' +
      items
        .map(function (it) {
          if (it.optional) return '';
          var auto = isAutoDone(it, cfg);
          var checked = auto || !!checks[it.id];
          return (
            '<li class="hc-pm-item hc-pm-item--inline' +
            (checked ? ' hc-pm-item--done' : '') +
            '">' +
            '<span class="hc-pm-inline-mark" aria-hidden="true">' +
            (checked ? '✓' : '○') +
            '</span> ' +
            '<span class="hc-pm-inline-label">' +
            esc(it.label) +
            '</span> ' +
            guiaBtnHtml(it.id, true) +
            '</li>'
          );
        })
        .join('') +
      '</ul>' +
      '<p class="hc-pm-inline-actions">' +
      '<button type="button" class="btn btn-secondary btn-sm hc-btn-puesta-marcha" onclick="hcOpenPuestaMarchaChecklist()">' +
      (verificada ? '✓ Puesta en marcha verificada' : 'Abrir checklist de montaje') +
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
    var btnTxt = verificada ? '✓ Puesta en marcha verificada' : 'Verificar puesta en marcha';
    document.querySelectorAll('.hc-btn-puesta-marcha').forEach(function (btn) {
      btn.textContent = btnTxt;
      btn.classList.toggle('hc-btn-puesta-marcha--ok', verificada);
      btn.setAttribute('aria-pressed', verificada ? 'true' : 'false');
    });
    var status = document.getElementById('medirPuestaMarchaStatus');
    if (status) {
      status.textContent = verificada
        ? 'Puesta en marcha verificada para esta instalación (' + prog.total + '/' + prog.total + ' puntos).'
        : prog.done + '/' + prog.total + ' puntos esenciales · revisa montaje según equipamiento en Sala.';
    }
    var kicker = document.getElementById('medirPuestaMarchaKicker');
    if (kicker) {
      kicker.textContent = verificada ? '✓ Puesta en marcha verificada' : 'Montaje de la instalación activa';
    }
    var card = document.getElementById('medirPuestaMarchaCard');
    if (card) card.classList.toggle('medir-pm-card--ok', verificada);
    var resumen = document.getElementById('sistemaMontajeChecksResumen');
    if (resumen) {
      resumen.textContent = verificada
        ? '✓ Verificada'
        : prog.done + '/' + prog.total + ' esenciales';
    }
    var inicioSub = document.getElementById('hcMontajeInicioSub');
    if (inicioSub) {
      inicioSub.textContent = verificada
        ? '✓ Verificada · ' + prog.total + '/' + prog.total
        : prog.done + '/' + prog.total + ' esenciales';
    }
    var modalTitle = document.getElementById('puestaMarchaTitle');
    if (modalTitle) {
      modalTitle.textContent = verificada ? '✓ Puesta en marcha verificada' : 'Puesta en marcha';
    }
    renderPuestaMarchaInlinePreview();
  }

  function openPmGuia(key) {
    var safe = String(key || '').replace(/[^a-zA-Z0-9_]/g, '');
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
    if (modal) modal.classList.add('open');
  }

  function closePmGuia(ev) {
    if (ev && ev.target !== ev.currentTarget) return;
    var modal = document.getElementById('modalPmGuia');
    if (modal) modal.classList.remove('open');
    _pmGuiaKeyOpen = null;
  }

  function pmGuiaMarkDone() {
    if (!_pmGuiaKeyOpen) return;
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
    var cfg = getCfg();
    var checks = Object.assign({}, getChecks(cfg));
    checks[id] = !!checked;
    if (checked) checks[id + 'At'] = new Date().toISOString();
    saveChecks(checks);
    renderPuestaMarchaBody();
    refreshPuestaMarchaUi();
  }

  function finishPuestaMarcha() {
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
    checks.completedAt = new Date().toISOString();
    saveChecks(checks);
    closePuestaMarchaChecklist();
    refreshPuestaMarchaUi();
    if (typeof showToast === 'function') showToast('✓ Puesta en marcha verificada para esta instalación.');
  }

  function maybeOfferAfterSetup() {
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
  global.hcOpenPmGuia = openPmGuia;
  global.hcClosePmGuia = closePmGuia;
  global.hcPmGuiaMarkDone = pmGuiaMarkDone;
  global.hcPuestaMarchaToggle = toggleItem;
  global.hcFinishPuestaMarcha = finishPuestaMarcha;
  global.hcMaybeOfferPuestaMarcha = maybeOfferAfterSetup;
  global.hcRefreshPuestaMarchaUi = refreshPuestaMarchaUi;
  global.hcBuildPuestaMarchaItems = buildItemsForConfig;
})(typeof window !== 'undefined' ? window : globalThis);
