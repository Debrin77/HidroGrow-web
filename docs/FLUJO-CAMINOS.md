# Flujos por camino de cultivo (HidroGrow)

Referencia para **semilla en propagador** y **semilla en hidro**. Los otros caminos (`esqueje_hidro`, `madre_hidro`) siguen el asistente hidro completo.

## Semilla en propagador (`semilla_propagador`)

### Asistente (7 pasos visibles)

| Paso | Etiqueta | Contenido |
|------|----------|-----------|
| 1 | Camino | Cuatro rutas + resumen del orden |
| 2 | Objetivo | Legal, objetivo, nivel Consejos |
| 3 | Entorno | Interior / exterior |
| 4 | Germinación ahora | Domo, mat térmica, **genética concreta (obligatoria)** |
| 5 | Clima domo | Fotoperiodo inicial (sin sala LED) |
| 6 | *(omitido)* | SOG/SCROG + foto/auto fusionados en paso 7 |
| 7 | Plan cultivo | Método, genética, semillero (opcional) |

Tras **Guardar**: solo **checklist propagador** → **Inicio → Germinación** (6 fases + registro diario).

### Después del asistente

1. Checklist propagador/domo  
2. **6 fases** en Inicio (Medir del domo vía Germinación, no depósito)  
3. **Configurar sala** (asistente + montaje)  
4. Checklist traslado → DWC/RDWC → depósito → operativa  

### Pestañas en fase propagador

- **Inicio**: hub Germinación + banner traslado/sala cuando toque  
- **Medir**: aviso — domo en Inicio; depósito tras traslado  
- **Sala**: resumen; montaje completo tras las 6 fases  
- **Sistema**: mensaje “matriz después del traslado” (torre oculta)  
- **Calendario / Historial**: sync germinación  

---

## Semilla en hidro (`semilla_hidro`)

### Asistente

| Paso | Etiqueta | Contenido |
|------|----------|-----------|
| 4 | Espacio y prep | Sala + prep cubo (no solo domo) |
| 5 | Clima y luz | Sala |
| 6 | Genética y método | SOG/SCROG, foto/auto, cepa |
| 7 | Detalle origen | Semillero opcional |

Tras **Guardar**: **checklist prep hidro** (no el del propagador solo) → **configurar sala** → montaje → DWC/RDWC + primer llenado → **6 fases** en el cubo.

### Orden operativo

1. Prep hidro (modal checklist)  
2. Sala (asistente `abrirSetupFaseSala`)  
3. Montaje sala  
4. Sistema hidro + depósito  
5. 6 fases en Inicio  
6. Traslado / operativa definitiva  

---

## CTAs unificados

- **Configurar sala**: `abrirSetupFaseSala()` — propagador solo tras 6/6 fases; hidro antes de germinar.  
- **Siguiente paso instalación**: `hcSiguientePasoInstalacion()` en lifecycle / Medir / rail.  
- **Traslado al cubo**: `hcGerminacionAbrirTraslado()` tras checklist de traslado.  

## Archivos clave

| Área | JS |
|------|-----|
| Caminos y skips | `hc-camino-cultivo.js` |
| Banners y pestañas | `hc-camino-flujo-ui.js` |
| Wizard premium | `hc-premium-wizard.js`, `hc-setup-wizard-pages.js` |
| Post-guardado | `hc-setup-calc-core.js`, `hc-instalacion-lifecycle.js` |
| Germinación | `hc-germinacion-flow.js` |
| Checklists | `hc-propagador-montaje.js` |
