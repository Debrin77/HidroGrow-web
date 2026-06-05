# Camino `semilla_hidro` — mapa de pantallas y UX

Referencia para pruebas, soporte y copy. Resumen de los cuatro caminos: [FLUJO-CAMINOS.md](./FLUJO-CAMINOS.md). Contraste con propagador: [PROPAGADOR-CAMINO.md](./PROPAGADOR-CAMINO.md).

---

## Flujo en una línea

```
Asistente único (sala + equip + genética + fecha siembra + DWC/RDWC en el mismo paso)
  → Guardar → checklist prep hidro (ITEMS_PREP_HIDRO)
  → Sala configurada + montaje verificado
  → DWC/RDWC confirmado (asistente inicial, no segundo asistente)
  → Primer llenado depósito (EC baja para germinar en el cubo)
  → 6 fases obligatorias en Inicio (modo hidro_directo: misma maceta/net pot)
  → Checklist operativa + registro en matriz (NO «traslado desde propagador»)
  → Esquema DWC/RDWC completo + operativa cultivo
```

### Orden lógico (semilla en el mismo DWC/RDWC)

| # | Etapa | Dónde en la app | Notas |
|---|--------|-----------------|-------|
| 1 | Camino + objetivo + entorno | Asistente pasos 1–3 | `semilla_hidro` fija modo `hidro_directo` |
| 2 | Sala + equip prep cubo | Asistente paso 4 | Medidor, aire depósito, cúpulas opcionales |
| 3 | Clima / luz | Asistente paso 5 | Fotoperiodo bajo domo/cúpula |
| 4 | Genética + método | Asistente paso 6 | Obligatorio en «Detalle origen» |
| 5 | Plan semillas + sustrato + **fecha siembra** | Asistente paso 7 | Mismo paso que genética (hidro) |
| 6 | Tipo + geometría DWC/RDWC | Asistente paso 8 (`PREMIUM_END`) | **Un solo** asistente; no se repite tras germinar |
| 7 | Checklist prep hidro | Sistema → Prep hidro | Verificación física antes de germinar |
| 8 | Montaje sala | Sala | Obligatorio **antes** de las 6 fases |
| 9 | Primer llenado depósito | Checklist depósito / Medir | EC baja; agua en el cubo donde germina la semilla |
| 10 | 6 fases + registro diario | Inicio → hub germinación | Fase 6 = cerrar germ en matriz, no «traslado externo» |
| 11 | Checklist operativa | Inicio (modal) | EC, pH, aire, luz, cesta — mismo sistema |
| 12 | Registrar plántula en matriz | Modal «Registrar en matriz» | Asigna cesta en Cultivo e instalación |
| 13 | Operativa completa | Sistema (SVG torre) | Veg / flor sin repetir setup DWC |

**Diferencia clave vs propagador:** no hay bandeja aparte ni segundo asistente DWC. El «checklist traslado» del código (`checklistTrasladoOk`) en hidro directo es **checklist operativa + registro en matriz**, no mover la planta desde otro propagador.

---

## Pestañas principales (barra inferior)

| Pestaña | `id` panel | `id` botón | Fase prep / germ (sin esquema completo) |
|---------|------------|------------|----------------------------------------|
| Inicio | `tab-inicio` | `btn-inicio` | **Principal** — `#dashGerminacionHub` (tras prep cerrada) |
| Medir | `tab-mediciones` | `btn-mediciones` | Sala (si lista) + agua cubo/depósito; sin layout «solo domo» |
| Sala | `tab-sala` | `btn-sala` | **Visible desde el inicio** — equipamiento + montaje |
| Sistema | `tab-sistema` | `btn-sistema` | **Prep hidro** → **Germinación en cubo** (`#hcSistemaFaseHost`) |
| Calendario | `tab-calendario` | `btn-calendario` | Hitos germ + registro |
| Riego | `tab-riego` | `btn-riego` | Oculto hasta depósito operativo (`hcRecargaCompletaAplicaEnCamino`) |
| Meteo | `tab-meteo` | `btn-meteo` | Activa con municipio (como propagador en fase prep) |
| Consejos / Ayuda / Historial | — | — | Sin bloqueo específico |

Clases en `<body>`: `hc-modo-fase-prep_hidro`, `hc-modo-fase-germ_cubo` (no `hc-modo-propagador-sin-sala`).

---

## Inicio (`#tab-inicio`)

| Elemento | ID / selector | Función |
|----------|---------------|---------|
| Hub germinación | `#dashGerminacionHub` | 6 fases **obligatorias**, registro diario, fecha siembra |
| Checklist montaje genérico | `#hcMontajeInicioDetails` | **Visible** (no se oculta como en propagador) |
| Resumen camino | (dash camino) | `refreshDashCaminoResumen` |
| CTA sistema / depósito | banners en hub | Según `hcGerminacionBloqueada` |

**No** hay `#propagadorSalaOcultaBanner` (la pestaña Sala no se oculta).

Acciones clave:

- `guardarRegistroGerminacionDiario()` — registro del día
- `hcGerminacionCompletarFaseActual()` — marcar cada fase del rail
- `persistFechaSiembraGermDesdeInicio()` — `#hcGermFechaSiembraInicio`
- `hcGerminacionAbrirChecklistTraslado()` — tras las 6 fases

---

## Medir (`#tab-mediciones`)

| Elemento | Notas |
|----------|--------|
| Protocolo / guía del día | **Visibles** (no se aplican reglas `hc-modo-propagador` de Medir) |
| Domo propagador | No es el foco; mediciones de **depósito del cubo** + sala según equipamiento |
| `hcMedirSalaListaParaMedir` | Hidro: basta `salaPreGermConfigurada` (montaje verificado en propagador) |

---

## Sala (`#tab-sala`)

| Elemento | Notas |
|----------|--------|
| Equipamiento | Completo desde el asistente (no wizard mínimo tipo propagador post-germ) |
| Montaje | Checklist obligatorio **antes** de las 6 fases (`hcGerminacionBloqueadaPorSala`) |
| Paneles duplicados Medir | **No** se ocultan (`hcSalaOcultarPanelesDuplicadosMedir` solo propagador) |

---

## Sistema (`#tab-sistema`)

| Fase `getSistemaFaseCamino` | Título pestaña | Contenido |
|----------------------------|----------------|-----------|
| `prep_hidro` | Prep hidro | Checklist `ITEMS_PREP_HIDRO`, sala, montaje, depósito |
| `germ_cubo` | Germinación en cubo | Nutrientes/registro en cubo, mini esquema |
| `null` | Cultivo e instalación | SVG DWC/RDWC tras registro en matriz |

Modal checklist prep: `#modalPropagadorMontaje` (mismo host; copy «Confirmar prep hidro»).

---

## Asistente premium (modal setup)

Camino: `premiumSetup.caminoCultivo === 'semilla_hidro'`.

### Páginas visibles (bloque germinación)

No se omiten geometría ni **DWC/RDWC** (`SETUP_PAGE_PREMIUM_END`). Se omiten solo **Cultivos** y **Resumen** al final del bloque germ (`getSetupSkippedPagesForCamino`).

Orden orientativo: camino → objetivo → entorno → **espacio y prep** → clima/luz → genética/método → detalle → **instalación hidro** → guardar.

**Equipamiento (paso espacio):** bloque obligatorio «Prep germinación en cubo» = medidor EC/pH + bomba de aire del **depósito** (la semilla germina en net pot dentro del DWC/RDWC). Bloque **opcional** «microclima por maceta» = catálogo **Cúpula individual (por maceta)** (3 referencias + manual), badge **1 por maceta/cesta** — no la bandeja propagador de 10 modelos. Mat térmica sigue opcional (calor bajo maceta/depósito). Checklist prep: ítem `ph_domo_mini`.

Ciencia y oscuridad / foto vs auto: [GERMINACION-SEMILLA-REFERENCIA.md](./GERMINACION-SEMILLA-REFERENCIA.md).

Banners por paso: `STEP_BANNERS.semilla_hidro` en `hc-camino-flujo-ui.js`.

Último paso nueva torre: `SETUP_PAGE_PREMIUM_END` (incluye DWC/RDWC).

### Bloque «Germinación ahora» (plan semillas)

- `renderPremiumGermPlanUI` cuando `hcCaminoSemillaGermEnSetup()` (semillas, sustrato, **fecha siembra**).
- Genética obligatoria en paso **6** (`paginaGeneticaGermSetup`), no en paso 4 como propagador.

Tras guardar:

- Prep hidro + `germinacionFlow` modo `hidro_directo`
- `refreshTabsOperativaCamino` — **sin** ocultar Sala

Reaperturas:

- `abrirSetupFaseHidro()` — solo para corregir geometría DWC si quedó incompleta en el asistente inicial
- No hay segundo asistente DWC tras germinar (`hcCaminoRequiereConfigHidroPendiente` devuelve `false` en hidro directo)

---

## Estados de datos

| Fuente | Campos relevantes | Uso |
|--------|-------------------|-----|
| `configTorre.premiumSetup` | `caminoCultivo`, `variedadGerminacion`, `fechaSiembraGerm`, domo/sala | Asistente |
| `configTorre.germinacionFlow` | `pasos` (6 ids), `modo: hidro_directo`, `checklistTrasladoOk` | Hub Inicio |
| `configTorre` | `hidroInstalacionCerrada`, `depositoListo`, montajes | Bloqueos hub |

---

## Reglas de negocio (vs propagador)

| Tema | Propagador | Semilla hidro |
|------|------------|---------------|
| 6 fases rail | Guía opcional | **Obligatorias** (todas con `doneAt`) |
| % anillo hub | Días hacia objetivo | **% fases** (`pctProgreso`) |
| Conclusión germ | Días o manual | 6 fases + checklist operativa + matriz |
| Sala en barra | Oculta hasta concluir germ | **Siempre visible** |
| Asistente DWC | Segundo paso | **Primer** asistente (página END) |
| SVG Sistema | Bandeja propagador | Prep → cubo → torre DWC |
| Fecha siembra | Asistente + Inicio | Igual |

---

## Bloqueos del hub (`hcGerminacionBloqueada`)

Orden típico:

1. `propagador` — checklist prep hidro incompleto
2. `plan_germ` — falta genética/semillas/sustrato/fecha
3. `sala_config` / `sala_montaje` — sala antes de germinar
4. `hidro_config` — DWC no cerrado en config (raro si asistente completo)
5. `deposito_llenado` — primer llenado
6. `traslado` — checklist **operativa** + registro en matriz (copy distinto a propagador; mismo flag `checklistTrasladoOk`)

---

## Independencia de instalaciones

Cada entrada en `state.torres` / `configTorre` activa lleva su propio `caminoCultivo`, genética, fechas y fases. Cambiar de torre no mezcla germinación ni prep.

Al **cambiar de instalación** (`cambiarTorreActiva`):

1. `guardarEstadoTorreActual()` persiste el slot anterior antes de cargar el nuevo.
2. `cargarEstadoTorre` clona `config` + `torre` del slot (sin punteros compartidos).
3. `hcGerminacionSyncDesdePremium` fija `germinacionFlow.modo` según el camino del slot (`hidro_directo` vs `propagador`).
4. `hcSincronizarUiInstalacionActiva` repinta pestañas, resumen de camino y panel Sistema según la instalación activa.

En hidro directo el checklist de cierre se guarda también como `checklistOperativaOk` (alias de `checklistTrasladoOk` legacy).

---

## Checklist de prueba manual

1. Nuevo camino **Semilla en hidro** → asistente con sala + página DWC → guardar.
2. Inicio: sin banner «sala oculta»; hub bloqueado hasta prep + sala + depósito.
3. Sistema: título **Prep hidro** → checklist `ITEMS_PREP_HIDRO`.
4. Completar prep, sala, montaje, llenado → hub visible; anillo por **% fases**.
5. Marcar 6 fases → checklist operativa → registrar en matriz → SVG torre completo.
6. Medir: protocolo visible; cards depósito + sala según equipamiento.
7. Fecha siembra editable en Inicio; calendario día 1 alineado.

---

## Archivos clave

| Área | Archivo |
|------|---------|
| Caminos / skips / bloqueos | `js/hc-camino-cultivo.js` |
| Fase Sistema | `js/hc-camino-fase.js`, `js/hc-sistema-fase-camino.js` |
| Pestañas y banners setup | `js/hc-camino-flujo-ui.js` |
| Hub germinación | `js/hc-germinacion-flow.js` |
| Plan semillas / fecha | `js/hc-premium-germ-plan.js` |
| Prep checklist | `js/hc-propagador-montaje.js` |
| Medir germ | `js/hc-medir-germinacion.js` |
| Guardar setup | `js/hc-setup-calc-core.js` |
