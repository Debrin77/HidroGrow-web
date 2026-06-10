# HidroGrow — Diagrama de flujo completo (todos los pasos)

**Versión:** 2026-06-01 · **Build:** perf60+ · **PDF resumen:** [`HidroGrow-diagrama-flujo-completo.pdf`](HidroGrow-diagrama-flujo-completo.pdf)

Regenerar PDF resumido: `npm run docs:flujo-pdf`

**Regla de oro:** cada instalación (ranura/torre) es **independiente**. Varios caminos coexisten; no comparten progreso.

---

## Índice

1. [Arranque y onboarding](#1-arranque-y-onboarding)
2. [Asistente — 15 pasos detallados](#2-asistente--15-pasos-detallados)
3. [Checklists físicos — ítems uno a uno](#3-checklists-físicos--ítems-uno-a-uno)
4. [6 fases de germinación (semilla)](#4-6-fases-de-germinación-semilla)
5. [Camino A — semilla_propagador (paso a paso)](#5-camino-a--semilla_propagador-paso-a-paso)
6. [Camino B — semilla_hidro (paso a paso)](#6-camino-b--semilla_hidro-paso-a-paso)
7. [Camino C — esqueje_hidro (paso a paso)](#7-camino-c--esqueje_hidro-paso-a-paso)
8. [Camino D — madre_hidro (paso a paso)](#8-camino-d--madre_hidro-paso-a-paso)
9. [Operativa diaria (post-instalación)](#9-operativa-diaria-post-instalación)
10. [Pestañas y capas UI](#10-pestañas-y-capas-ui)
11. [Datos persistidos por ranura](#11-datos-persistidos-por-ranura)
12. [Archivos de código](#12-archivos-de-código)

---

## 1. Arranque y onboarding

```mermaid
flowchart TD
  A1[1 · Abrir PWA / navegador] --> A2[2 · Service worker + caché assets]
  A2 --> A3[3 · Cargar scripts boot manifest]
  A3 --> A4[4 · Leer localStorage hidrogrow_v2]
  A4 --> A5[5 · Pantalla PIN — 4 dígitos]
  A5 --> A6{6 · Primera apertura?}
  A6 -->|Sí| A7[7 · Modal bienvenida — carrusel funciones]
  A6 -->|No| A14[14 · Inicio tab]
  A7 --> A8[8 · Legal plegable · aceptar]
  A8 --> A9[9 · Coach barra pestañas — una vez]
  A9 --> A10{10 · Hay instalación guardada?}
  A10 -->|No| A11[11 · CTA abrir asistente]
  A10 -->|Sí| A14
  A11 --> A12[12 · Modal setup premium + técnico]
  A12 --> A13[13 · Guardar → initTorres / ranura]
  A13 --> A14
  A7 -->|Entrar sin coach| A14
  A14 --> A15[15 · refreshDashInicioVistaCamino por camino activo]
```

---

## 2. Asistente — 15 pasos detallados

```mermaid
flowchart TD
  subgraph P0[P0 — Tipo sistema]
    P0a[P0.1 Elegir DWC o RDWC]
  end
  subgraph PR[P1–P7 Premium]
    P1[P1.1 Objetivo cultivo]
    P1b[P1.2 Legalidad / uso responsable]
    P2[P2.1 Entorno interior o exterior]
    P3[P3.1 Dimensiones sala / carpa]
    P3b[P3.2 Catálogo equip ES — LED extractor propagador]
    P4[P4.1 Clima objetivo T° HR]
    P4b[P4.2 Luz fotoperiodo VPD orientativo]
    P5[P5.1 SOG o SCROG]
    P5b[P5.2 Genética foto / auto]
    P6[P6.1 Origen semilla clon madre]
    P6b[P6.2 Camino cultivo — 4 rutas]
    P7[P7.1 Puente montaje · resumen premium]
  end
  subgraph ST[S1–S7 Técnico hidro]
    S1[S1.1 Filas × cestas / módulos RDWC]
    S1b[S1.2 Litros depósito · cubos independientes]
    S2[S2.1 Bomba aire · difusores · medidor]
    S3[S3.1 Fijación net pots · nivel agua diseño]
    S4[S4.1 Nutriente · dosis orientativas EC pH]
    S5[S5.1 Municipio AEMET · preferencias]
    S6[S6.1 Variedades en matriz planificadas]
    S7[S7.1 Nombre instalación · guardar config]
  end
  P0a --> P1 --> P1b --> P2 --> P3 --> P3b --> P4 --> P4b --> P5 --> P5b --> P6 --> P6b --> P7
  P7 --> S1 --> S1b --> S2 --> S3 --> S4 --> S5 --> S6 --> S7
  S7 --> CAM{Camino guardado}
```

| Paso | Contenido | Varía por camino |
|------|-----------|------------------|
| P0 | DWC / RDWC | Igual |
| P1–P5 | Objetivo, sala, clima, genética | Igual |
| P6 | Origen + **caminoCultivo** | **Define toda la ruta** |
| P7 | Puente | Igual |
| S1–S7 | Geometría hidro | Propagador: **omitido** (sin S1–S7 completo) |
| Post-guardar | Checklist según camino | Ver secciones 5–8 |

---

## 3. Checklists físicos — ítems uno a uno

### 3.1 Propagador (`propagadorMontajeChecks`) — 7 ítems

```mermaid
flowchart LR
  PM1[1 prop_domo Domo montado] --> PM2[2 prop_mat Mat térmica]
  PM2 --> PM3[3 prop_dosis_sol Dosificación 2L]
  PM3 --> PM4[4 prop_agua_sustrato Bandeja 2-3mm]
  PM4 --> PM5[5 prop_rockwool Sustrato + semillas]
  PM5 --> PM6[6 prop_termo Termo-higrómetro]
  PM6 --> PM7[7 prop_vent Ventilación domo]
  PM7 --> PMV[Verificar checklist]
```

### 3.2 Prep hidro semilla (`preparacionGermHidroChecks`) — 6 ítems

```mermaid
flowchart LR
  PH1[1 ph_sem_una 1 semilla/cubo] --> PH2[2 ph_netpot Net pot en cesta]
  PH2 --> PH3[3 ph_nivel Nivel llenado germ]
  PH3 --> PH4[4 ph_domo_mini Cúpula opcional]
  PH4 --> PH5[5 ph_medidor EC/pH calibrado]
  PH5 --> PH6[6 ph_aire Aireación depósito]
  PH6 --> PHV[Verificar prep hidro]
```

### 3.3 Enraizado esqueje (`esquejesProtocolo.montaje`) — 6 ítems

```mermaid
flowchart LR
  EN1[1 enr_domo Domo enraizado] --> EN2[2 enr_rockwool Rockwool pH5.5]
  EN2 --> EN3[3 enr_higiene Tijeras esterilizadas]
  EN3 --> EN4[4 enr_luz Luz tenue 18/6]
  EN4 --> EN5[5 enr_termo Termo-higrómetro clones]
  EN5 --> EN6[6 enr_aire Aireación clonador]
  EN6 --> ENV[montajeVerificadoAt]
```

### 3.4 Montaje sala (`puestaMarchaChecks`)

Checklist dinámico según equipamiento registrado (LED, extractor, filtro, etc.). Requiere `completedAt` + fingerprint equipamiento (`hcPmEquipFpAtVerify`).

### 3.5 Primer llenado depósito

Checklist depósito (`instalacionPrimerLlenadoAt`) — EC, pH, volumen, oxigenación, limpieza.

---

## 4. 6 fases de germinación (semilla)

Aplican a **semilla_propagador** y **semilla_hidro** (hub `#dashGerminacionHub`).

```mermaid
flowchart TD
  F1[F1 semilla · Germinador papel/domo oscuridad 1-3d]
  F2[F2 taproot · Radícula 5-10 mm visible]
  F3[F3 rockwool · Cubo lana pH 5.5]
  F4[F4 domo · Domo + luz suave 18/6 HR 70-80%]
  F5[F5 netpot · Net pot + arcilla expandida]
  F6[F6 dwc · Plántula en cubo / registrar matriz]
  F1 --> F2 --> F3 --> F4 --> F5 --> F6
  F6 --> REG[Registro diario cada día en Inicio]
  REG --> CONC{Germinación concluida?}
  CONC -->|Propagador| TRAS[Traslado externo al DWC]
  CONC -->|Hidro directo| OPCHK[Checklist operativa + matriz mismo cubo]
```

| Fase | ID | Acción usuario |
|------|-----|----------------|
| 1 | `semilla` | Marcar en hub · registro diario |
| 2 | `taproot` | Marcar cuando radícula visible |
| 3 | `rockwool` | Semilla en cubo |
| 4 | `domo` | Domo/cúpula + luz |
| 5 | `netpot` | Net pot preparado |
| 6 | `dwc` | En cubo productivo / matriz |

---

## 5. Camino A — semilla_propagador (paso a paso)

```mermaid
flowchart TD
  subgraph ASIS[Asistente inicial — sin sala ni DWC]
    AP1[A1 Elegir camino semilla_propagador]
    AP2[A2 Domo / propagador en equipamiento]
    AP3[A3 Genética + num semillas + sustrato]
    AP4[A4 Clima orientativo domo]
    AP5[A5 Resumen · guardar]
  end
  subgraph PREP[Prep propagador]
    AP6[A6 Abrir checklist montaje propagador]
    AP7[A7 Marcar 7 ítems ITEMS_PROPAGADOR]
    AP8[A8 Verificar checklist completedAt]
  end
  subgraph GERM[Germinación activa]
    AP9[A9 Inicio hub germinación 6 fases]
    AP10[A10 Registro diario T° HR nutrientes]
    AP11[A11 Medición domo en Medir]
    AP12[A12 Sistema SVG bandeja + panel propagador]
    AP13[A13 Sala tab OCULTA hasta concluir germ]
    AP14[A14 Marcar fases F1→F6]
    AP15[A15 Opcional: configurar sala en paralelo tras prep]
    AP16[A16 Germinación concluida días o manual]
  end
  subgraph TRAS[Traslado al hidro]
    AP17[A17 Asistente fase hidro abrirSetupFaseHidro]
    AP18[A18 Configurar DWC/RDWC geometría]
    AP19[A19 Confirmar checklistInstalacionConfirmada]
    AP20[A20 Configurar sala abrirSetupFaseSala]
    AP21[A21 Montaje sala puestaMarchaChecks]
    AP22[A22 Checklist traslado desde Inicio]
    AP23[A23 Registrar plántulas en matriz Sistema]
    AP24[A24 germinacionFlow.trasladoAt]
  end
  subgraph OP[Operativa]
    AP25[A25 Primer llenado depósito]
    AP26[A26 getSistemaFaseCamino null — esquema completo]
    AP27[A27 Medir depósito + sala + recarga]
    AP28[A28 Historial Calendario Riego]
  end
  AP1 --> AP2 --> AP3 --> AP4 --> AP5 --> AP6 --> AP7 --> AP8
  AP8 --> AP9 --> AP10 --> AP11 --> AP12
  AP9 --> AP14 --> AP16
  AP16 --> AP17 --> AP18 --> AP19 --> AP20 --> AP21 --> AP22 --> AP23 --> AP24
  AP24 --> AP25 --> AP26 --> AP27 --> AP28
```

**Resumen Inicio (`getCaminoResumenPasos`):** Montaje propagador → Sala cfg → Montaje sala → Germ 6 fases → (si concluida) DWC → Traslado → Matriz → Depósito.

---

## 6. Camino B — semilla_hidro (paso a paso)

```mermaid
flowchart TD
  subgraph ASIS[Asistente único — sala + DWC en mismo flujo]
    BH1[B1 Camino semilla_hidro hidro_directo]
    BH2[B2 Sala + medidor + aire + cúpulas]
    BH3[B3 Clima luz 18/6 baja]
    BH4[B4 Genética + fecha siembra + num cubos]
    BH5[B5 Geometría DWC/RDWC S1]
    BH6[B6 Equip hidráulico nutriente meteo S2-S5]
    BH7[B7 Guardar · checklistInstalacionConfirmada]
  end
  subgraph PREP[Prep física]
    BH8[B8 Checklist ITEMS_PREP_HIDRO — 6 ítems]
    BH9[B9 Verificar preparacionGermHidroChecks]
    BH10[B10 Configurar sala equipamiento]
    BH11[B11 Montaje sala verificado]
    BH12[B12 hidroInstalacionCerrada — ya en asistente]
    BH13[B13 Primer llenado EC baja germinar]
  end
  subgraph GERM[Germinación en cubo]
    BH14[B14 Inicio hub 6 fases compacto]
    BH15[B15 Sistema fase prep_hidro o germ_cubo]
    BH16[B16 Sistema esquema SVG DWC durante germ]
    BH17[B17 Medir cubo + sala — sin depósito pleno hasta matriz]
    BH18[B18 Marcar F1→F6 + registro diario]
    BH19[B19 Oscuridad días 1-2 cúpula si aplica]
  end
  subgraph CIERRE[Cierre — mismo cubo]
    BH20[B20 Checklist operativa hcGerminacionAbrirChecklistTraslado]
    BH21[B21 Registrar en matriz — NO traslado externo]
    BH22[B22 germinacionFlow.trasladoAt + checklistTrasladoOk]
  end
  subgraph OP[Operativa]
    BH23[B23 getSistemaFaseCamino null]
    BH24[B24 Esquema DWC operativo veg/flor]
    BH25[B25 Medir depósito rutina diaria]
  end
  BH1 --> BH2 --> BH3 --> BH4 --> BH5 --> BH6 --> BH7
  BH7 --> BH8 --> BH9 --> BH10 --> BH11 --> BH12 --> BH13
  BH13 --> BH14 --> BH15 --> BH16 --> BH17 --> BH18 --> BH19
  BH18 --> BH20 --> BH21 --> BH22 --> BH23 --> BH24 --> BH25
```

**Cadena CTA (`hcSiguientePasoSemillaHidro`):** Prep hidro → Sala → Montaje → DWC (si falta) → Depósito → 6 fases Inicio.

**Resumen Inicio:** Prep hidro → Sala → Montaje → DWC cerrado → Depósito germ → 6 fases → Checklist operativa → Matriz.

---

## 7. Camino C — esqueje_hidro (paso a paso)

```mermaid
flowchart TD
  subgraph ASIS[Asistente]
    E1[E1 Camino esqueje_hidro origen clon/esqueje]
    E2[E2 Sala + equip 18/6]
    E3[E3 DWC/RDWC completo]
    E4[E4 Guardar config]
  end
  subgraph SALA[Sala e hidro]
    E5[E5 salaPreGermConfigAt]
    E6[E6 Montaje sala puestaMarchaChecks]
    E7[E7 checklistInstalacionConfirmada]
    E8[E8 getSistemaFaseCamino enraizado activo]
  end
  subgraph MONT[Montaje domo — esquejesProtocolo.montaje]
    E9[E9 Inicio hub PREPARA domo si montaje incompleto]
    E10[E10 Modal checklist 6 ítems enr_*]
    E11[E11 montajeVerificadoAt]
  end
  subgraph CORTE[Protocolo Medir — esquejesProtocolo]
    E12[E12 Prep madre 5 pasos — si desde madre ajena]
    E13[E13 Corte: hora técnica gel rockwool — 4 pasos]
    E14[E14 registrarSesionEsquejes — ultimaSesionEsquejes]
  end
  subgraph DOMO[Domo 10 días — domoDias d1-d10]
    E15[E15 D1 Corte + domo cerrado HR 80%]
    E16[E16 D2 Vigilar turgor ventilar 30s]
    E17[E17 D3 Primera ventilación HR 75%]
    E18[E18 D4 Sin raíz = normal]
    E19[E19 D5 Bajar HR ~70%]
    E20[E20 D6 Probar sin domo medio día]
    E21[E21 D7 Primeras raíces 1-2cm]
    E22[E22 D8 Domo casi fuera HR 65%]
    E23[E23 D9 Raíces 3-5cm prep net pot]
    E24[E24 D10 Traslado net pot → cubo DWC]
  end
  subgraph ENR[Enraizar — 4 pasos operativos]
    E25[E25 domo_hr HR 70-80%]
    E26[E26 clon_aire opcional mini DWC]
    E27[E27 raiz_visible 3-5cm]
    E28[E28 traslado_np EC 400-600]
  end
  subgraph UI[Capas UI durante enraizado]
    E29[E29 Inicio hub domo día sugerido]
    E30[E30 Sistema SVG domo clones]
    E31[E31 Medir panel esquejes EC/pH por fase]
  end
  subgraph FIN[Cierre instalación]
    E32[E32 Asignar clones en matriz Sistema]
    E33[E33 cultivoMatrizListo]
    E34[E34 Primer llenado depósito]
    E35[E35 getSistemaFaseCamino null operativa]
  end
  E1 --> E2 --> E3 --> E4 --> E5 --> E6 --> E7 --> E8
  E8 --> E9 --> E10 --> E11
  E11 --> E12 --> E13 --> E14
  E14 --> E15 --> E16 --> E17 --> E18 --> E19 --> E20 --> E21 --> E22 --> E23 --> E24
  E14 --> E25 --> E26 --> E27 --> E28
  E11 --> E29 --> E30 --> E31
  E24 --> E32 --> E33 --> E34 --> E35
```

**Cadena CTA (`hcSiguientePasoEsquejeHidro`):** Asistente → Sala → Montaje → DWC → Checklist enraizado → Matriz → Depósito → Hub domo.

**EC/pH por fase (Medir):** clonador 48h 0-400 µS → enraizamiento 300-600 → traslado dwc 400-600.

---

## 8. Camino D — madre_hidro (paso a paso)

```mermaid
flowchart TD
  subgraph ASIS[Asistente]
    M1[M1 Camino madre_hidro origen madre]
    M2[M2 Sala 18/6 permanente]
    M3[M3 DWC/RDWC 1 cubo madre]
    M4[M4 Guardar config]
  end
  subgraph INST[Instalación]
    M5[M5 salaPreGermConfigAt]
    M6[M6 Montaje sala]
    M7[M7 checklistInstalacionConfirmada]
    M8[M8 getSistemaFaseCamino madre]
  end
  subgraph HUB[Inicio + Sistema]
    M9[M9 Inicio hub cubo madre 18/6]
    M10[M10 Sistema esquema DWC + pasos madre]
    M11[M11 Asignar madre en matriz]
    M12[M12 Primer llenado depósito madre]
  end
  subgraph PROTO[Protocolo Medir — esquejesProtocolo]
    M13[M13 fechaInicioMadre]
    M14[M14 Prep madre 5 pasos antes corte]
    M15[M15 madre_edad ≥5-6 sem veg]
    M16[M16 madre_poda 14-21d antes]
    M17[M17 madre_lean EC 800-1000 7-10d]
    M18[M18 madre_turgor día anterior]
    M19[M19 madre_higiene día corte]
  end
  subgraph SES[Sesiones esqueje ciclo]
    M20[M20 registrarSesionEsquejes]
    M21[M21 Corte 4 pasos CORTE_PASOS]
    M22[M22 Domo 10d si clones nuevos]
    M23[M23 proximaSesion ~12d intervalo]
    M24[M24 Mantener madre 3 pasos MANTENER_MADRE]
    M25[M25 m18_6 nunca 12/12]
    M26[M26 mcorte max 30% follaje]
    M27[M27 mrenovar cada 6-12 meses]
  end
  subgraph OP[Operativa]
    M28[M28 EC madre 1000-1400 µS]
    M29[M29 Medir rutina diaria depósito]
    M30[M30 Calendario avisos sesión]
  end
  M1 --> M2 --> M3 --> M4 --> M5 --> M6 --> M7 --> M8
  M8 --> M9 --> M10 --> M11 --> M12
  M12 --> M13 --> M14 --> M15 --> M16 --> M17 --> M18 --> M19
  M19 --> M20 --> M21 --> M22 --> M23 --> M24 --> M25 --> M26 --> M27
  M12 --> M28 --> M29 --> M30
```

**Cadena CTA (`hcSiguientePasoMadreHidro`):** Asistente → Sala → Montaje → DWC → Matriz madre → Depósito → Medir.

---

## 9. Operativa diaria (post-instalación)

```mermaid
flowchart TD
  O1[1 Abrir Inicio — alertas germ/enraizado/madre]
  O2[2 Revisar tareas día checklist automático]
  O3[3 Ir a Medir]
  O4[4 Registrar EC pH T° agua volumen]
  O5[5 IoT / PRO si configurado]
  O6[6 Comparar rangos fase vegetativo/flor]
  O7[7 Revisar VPD sala si montaje OK]
  O8[8 Historial — tendencias gráficas]
  O9[9 Calendario — recargas esquejes domo]
  O10[10 Recarga completa si aplica camino]
  O11[11 Sistema — estado matriz cubos]
  O12[12 Consejos / genética breeder]
  O1 --> O2 --> O3 --> O4 --> O5 --> O6 --> O7 --> O8 --> O9 --> O10 --> O11 --> O12
```

---

## 10. Pestañas y capas UI

### 10.1 Barra inferior (10 pestañas)

| # | Pestaña | ID | Cuándo principal |
|---|---------|-----|------------------|
| 1 | Inicio | `tab-inicio` | Hubs fase + lifecycle |
| 2 | Medir | `tab-mediciones` | Registro diario |
| 3 | Sala | `tab-sala` | Equip + montaje |
| 4 | Sistema | `tab-sistema` | SVG + matriz |
| 5 | Calendario | `tab-calendario` | Hitos |
| 6 | Riego | `tab-riego` | Post-depósito |
| 7 | Meteo | `tab-meteo` | AEMET |
| 8 | Historial | `tab-historial` | Gráficos |
| 9 | Consejos | `tab-consejos` | Guías |
| 10 | Ayuda | `tab-ayuda` | FAQ backup |

### 10.2 Matriz Inicio / Sistema / Medir por fase

| Fase | Inicio | Sistema | Medir |
|------|--------|---------|-------|
| Propagador | Hub germ / ruta oculta | SVG domo + panel | Domo T° HR |
| prep_hidro | Resumen camino | Checklist prep | Prep cubo |
| germ_cubo | Hub 6 fases | Esquema DWC | Cubo pre-matriz |
| enraizado | Hub montaje / domo | SVG domo | Protocolo completo |
| madre | Hub 18/6 | Esquema DWC | Sesiones EC/pH |
| null operativa | Rutina + recarga | Matriz completa | Depósito + sala |

---

## 11. Datos persistidos por ranura

| Clave | Contenido |
|-------|-----------|
| `caminoCultivo` | Ruta activa |
| `premiumSetup` | Borrador asistente |
| `germinacionFlow` | Fases semilla, traslado, registro |
| `propagadorMontajeChecks` | 7 ítems propagador |
| `preparacionGermHidroChecks` | 6 ítems prep cubo |
| `esquejesProtocolo.montaje` | 6 ítems enraizado |
| `esquejesProtocolo.montajeVerificadoAt` | Checklist enraizado OK |
| `esquejesProtocolo.corte` | 4 pasos corte |
| `esquejesProtocolo.domoDias` | 10 días d1-d10 |
| `esquejesProtocolo.prepMadre` | 5 pasos prep madre |
| `esquejesProtocolo.mantener` | 3 pasos mantener |
| `puestaMarchaChecks` | Montaje sala |
| `checklistInstalacionConfirmada` | Asistente DWC cerrado |
| `instalacionPrimerLlenadoAt` | Depósito operativo |

---

## 12. Archivos de código

| Módulo | Archivo |
|--------|---------|
| Fases | `js/hc-camino-fase.js` |
| Panel Sistema | `js/hc-sistema-fase-camino.js` |
| Caminos / resumen pasos | `js/hc-camino-cultivo.js` |
| UI pestañas | `js/hc-camino-flujo-ui.js` |
| Germinación 6 fases | `js/hc-germinacion-flow.js` |
| Checklists domo/prep | `js/hc-propagador-montaje.js` |
| Esquejes / madre / domo 10d | `js/hc-esquejes-madre.js` |
| Lifecycle CTAs | `js/hc-instalacion-lifecycle.js` |
| Torres multi-install | `js/hc-bootstrap-state.js` |
| SVG propagador | `js/diagrams/propagador/propagador-diagram.js` |

---

## Mapas detallados por camino

| Camino | Documento |
|--------|-----------|
| Propagador | [PROPAGADOR-CAMINO.md](./PROPAGADOR-CAMINO.md) |
| Semilla hidro | [SEMILLA-HIDRO-CAMINO.md](./SEMILLA-HIDRO-CAMINO.md) |
| Cuatro caminos | [FLUJO-CAMINOS.md](./FLUJO-CAMINOS.md) |

---

## Notas

- EC/pH/HR orientativos; priorizar medidor y ficha breeder.
- Tienda semillas (top 10) ≠ propagador equipamiento germinación.
- Datos locales `hidrogrow_v2`; sin servidor obligatorio.
