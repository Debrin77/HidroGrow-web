# HidroGrow — Diagrama de flujo completo

**Versión:** 2026-06-01 · **Build:** perf60 · **Sistemas:** DWC y RDWC · **PDF:** [`HidroGrow-diagrama-flujo-completo.pdf`](HidroGrow-diagrama-flujo-completo.pdf)

Regenerar PDF:

```bash
npm run docs:flujo-pdf
```

**Regla de oro:** cada instalación (ranura/torre) es **independiente**. Varios caminos pueden coexistir; no comparten progreso ni config.

---

## 1. Arranque y onboarding

```mermaid
flowchart TD
  A[Abrir app / PWA] --> PIN[PIN 4 dígitos]
  PIN --> B{Primera vez?}
  B -->|Sí| C[Bienvenida — carrusel]
  B -->|No| H[Inicio]
  C --> D[Coach barra pestañas]
  D --> E{Instalación vacía?}
  E -->|Sí| F[Asistente configuración]
  E -->|No| H
  F --> H
  C -->|Entrar| H
```

**Persistencia:** `localStorage` clave `hidrogrow_v2` · ranuras en `state.torres[]` · activa en `state.torreActiva`.

---

## 2. Asistente de configuración

```mermaid
flowchart LR
  subgraph P0[P0 Tipo]
    P0a[DWC o RDWC]
  end
  subgraph Premium[P1–P7 Premium]
    P1[Objetivo legal]
    P2[Entorno int/ext]
    P3[Espacio equip]
    P4[Clima luz VPD]
    P5[SOG SCROG genética]
    P6[Origen + camino cultivo]
    P7[Puente montaje]
  end
  subgraph Tecnico[S1–S7 Técnico]
    S1[Geometría sistema]
    S2[Equip hidráulico]
    S3[Agua cestas]
    S4[Nutriente]
    S5[Meteo municipio]
    S6[Cultivos / plan]
    S7[Resumen guardar]
  end
  P0 --> P1 --> P2 --> P3 --> P4 --> P5 --> P6 --> P7 --> S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7
  S7 --> CAM{Camino elegido}
```

**P6 define el camino** (no mezclable por ranura):

| ID camino | Origen | Asistente inicial |
|-----------|--------|-------------------|
| `semilla_propagador` | Semilla | Sin sala ni DWC (solo domo) |
| `semilla_hidro` | Semilla | Sala + DWC/RDWC en un solo asistente |
| `esqueje_hidro` | Esqueje/clon | Sala + DWC/RDWC |
| `madre_hidro` | Madre | Sala + DWC/RDWC (18/6) |

---

## 3. Cuatro caminos — vista global

```mermaid
flowchart TB
  subgraph INDEP[Instalaciones independientes]
    T1[Torre 1 · semilla_hidro]
    T2[Torre 2 · semilla_propagador]
    T3[Torre 3 · esqueje_hidro]
    T4[Torre 4 · madre_hidro]
  end

  subgraph META[Misma meta final]
    OP[Cultivo operativo en casa · matriz + depósito + Medir]
  end

  T1 --> OP
  T2 --> OP
  T3 --> OP
  T4 --> OP
```

Módulo central de fases: `getSistemaFaseCamino()` en `hc-camino-fase.js`.  
Cadena de “siguiente paso”: `hcSiguientePasoInstalacion()` → delega en `hcSiguientePaso*Hidro` por camino.

---

## 4. Camino A — Semilla propagador

```mermaid
flowchart TD
  A1[Asistente: domo + genética] --> A2[Checklist montaje propagador]
  A2 --> A3[Inicio: germinación oculta o ruta propagador]
  A3 --> A4[Sistema: SVG domo + panel bandeja]
  A3 --> A5[Medir: T° HR domo · sin depósito DWC]
  A4 --> A6[Germinación concluida]
  A6 --> A7[Asistente DWC/RDWC traslado]
  A7 --> A8[Sala + montaje]
  A8 --> A9[Traslado a matriz]
  A9 --> A10[Operativa: esquema DWC completo]
```

**Inicio en germ activa:** hub germ oculto; monitor en Sala.  
**Post-traslado:** `germinacionFlow.trasladoAt` → Medir permite depósito; Sistema modo hidro.

---

## 5. Camino B — Semilla hidro

```mermaid
flowchart TD
  B1[Prep hidro checklist] --> B2[Sala configurada]
  B2 --> B3[Montaje sala verificado]
  B3 --> B4[DWC/RDWC cerrado en asistente]
  B4 --> B5[Primer llenado depósito]
  B5 --> B6[Inicio: hub 6 fases germinación]
  B6 --> B7[Sistema: esquema DWC + fase cubo]
  B6 --> B8[Medir: cubo pre-matriz]
  B6 --> B9[Registrar plántula en matriz]
  B9 --> B10[Operativa diaria]
```

**Separación UX (perf58):** Inicio = solo 6 fases; Sistema = esquema DWC; sin matriz/llenado duplicados en Inicio.

---

## 6. Camino C — Esqueje hidro

```mermaid
flowchart TD
  C1[Asistente sala + DWC] --> C2[Montaje sala]
  C2 --> C3[DWC confirmado checklistInstalacion]
  C3 --> C4{Montaje domo verificado?}
  C4 -->|No| C4a[Inicio: hub PREPARA domo]
  C4a --> C4b[Modal checklist enraizado · 6 ítems]
  C4b --> C4c[esquejesProtocolo.montaje]
  C4 -->|Sí| C5[Inicio: hub domo día a día]
  C5 --> C6[Sistema: SVG domo + pasos enraizado]
  C5 --> C7[Medir: protocolo corte + domo 10d]
  C7 --> C8[Asignar clones en matriz]
  C8 --> C9[Primer llenado depósito]
  C9 --> C10[Operativa]
```

**Fuente única montaje (perf60):** `esquejesProtocolo.montaje` + `montajeVerificadoAt` (modal, Inicio, Medir, Sistema sincronizados).  
**Operativa post-corte:** prep → corte → enraizar → `domoDias` (10 d) en Medir.

---

## 7. Camino D — Madre hidro

```mermaid
flowchart TD
  D1[Asistente sala + DWC 18/6] --> D2[Montaje sala]
  D2 --> D3[DWC confirmado]
  D3 --> D4[Inicio: hub cubo madre]
  D4 --> D5[Sistema: esquema DWC + pasos madre]
  D4 --> D6[Medir: sesiones esqueje EC/pH]
  D6 --> D7[Asignar madre en matriz]
  D7 --> D8[Primer llenado depósito]
  D8 --> D9[Operativa 18/6 + cortes cada 10–14 d]
```

---

## 8. Tres capas de UI por fase

```mermaid
flowchart LR
  subgraph INICIO[Inicio — seguimiento del día]
    I1[Hub germ / enraizado / madre]
    I2[Lifecycle instalación]
    I3[Resumen camino]
  end
  subgraph SISTEMA[Sistema — esquema + checklist]
    S1[SVG propagador o DWC]
    S2[Panel fase camino]
    S3[Matriz cuando operativa]
  end
  subgraph MEDIR[Medir — registro y protocolo]
    M1[EC pH T° vol]
    M2[Equipamiento sala]
    M3[Panel esquejes/madre]
  end
  INICIO --> SISTEMA
  INICIO --> MEDIR
```

| Fase | Inicio | Sistema | Medir |
|------|--------|---------|-------|
| Propagador germ | Ruta / oculto | SVG domo | Domo, sin depósito |
| Semilla hidro germ | 6 fases | Esquema DWC | Cubo pre-matriz |
| Esqueje enraizado | Hub domo | SVG domo | Protocolo completo |
| Madre | Hub 18/6 | Esquema DWC | Sesiones + EC |

---

## 9. Ciclo lifecycle genérico (Inicio)

```mermaid
flowchart TD
  L1[1 Configurar asistente] --> L2[2 Montaje sala]
  L2 --> L3[3 Cultivo matriz]
  L3 --> L4[4 Primer llenado]
  L4 --> L5[✓ Operativa diaria]
  L5 --> M[Medir · Historial · Calendario]
```

CTA único: `hcSiguientePasoInstalacion()` evita botones divergentes entre rail, hub y banners.

---

## 10. Pestañas de la app

```mermaid
flowchart TB
  subgraph Tabs[Barra inferior]
    I[Inicio]
    Me[Medir]
    Sa[Sala]
    Si[Sistema]
    Ca[Calendario]
    Ri[Riego]
    Mt[Meteo]
    Hi[Historial]
    Co[Consejos]
    Ay[Ayuda]
  end
  I --> Me
  Me --> Hi
  Si --> I
  Sa --> Me
```

| Pestaña | Rol |
|---------|-----|
| **Inicio** | Hub fase activa, lifecycle, accesos rápidos |
| **Medir** | Mediciones, recarga, protocolo clones/madre |
| **Sala** | Equipamiento, montaje, clima sala |
| **Sistema** | Fase camino + esquema SVG + matriz |
| **Calendario** | Domo día a día, sesiones esqueje, recargas |
| **Historial** | Gráficos EC/pH vs objetivo |
| **Consejos** | Guías, genéticas, equipamiento |
| **Ayuda** | FAQ, backup, reabrir bienvenida |

---

## 11. Datos clave por ranura

| Clave / objeto | Uso |
|----------------|-----|
| `caminoCultivo` | semilla_propagador · semilla_hidro · esqueje_hidro · madre_hidro |
| `germinacionFlow` | Semilla: fases, traslado, registro diario |
| `propagadorMontajeChecks` | Propagador: domo verificado |
| `preparacionGermHidroChecks` | Semilla hidro: prep cubo |
| `esquejesProtocolo` | Esqueje/madre: montaje, corte, domo 10d, sesiones |
| `puestaMarchaChecks` | Montaje sala verificado |
| `checklistInstalacionConfirmada` | Asistente DWC cerrado |
| `instalacionPrimerLlenadoAt` | Depósito operativo |

---

## 12. Archivos principales

| Área | JavaScript |
|------|------------|
| Fases camino | `hc-camino-fase.js` |
| Panel Sistema | `hc-sistema-fase-camino.js` |
| Caminos / pasos | `hc-camino-cultivo.js` |
| UI pestañas | `hc-camino-flujo-ui.js` |
| Germinación | `hc-germinacion-flow.js` |
| Checklists domo | `hc-propagador-montaje.js` |
| Esquejes / madre | `hc-esquejes-madre.js` |
| Lifecycle CTAs | `hc-instalacion-lifecycle.js` |
| Torres / multi-install | `hc-bootstrap-state.js`, `app-hc-torres-badges-notifs.js` |

---

## 13. Mapas detallados por camino

| Camino | Documento |
|--------|-----------|
| Propagador | [PROPAGADOR-CAMINO.md](./PROPAGADOR-CAMINO.md) |
| Semilla hidro | [SEMILLA-HIDRO-CAMINO.md](./SEMILLA-HIDRO-CAMINO.md) |
| Cuatro caminos | [FLUJO-CAMINOS.md](./FLUJO-CAMINOS.md) |

---

## 14. Notas

- Valores EC/pH/HR son orientativos; priorizar medidor y ficha del breeder.
- **Tienda semillas** (top 10 asistente) ≠ **propagador** (equipamiento germinación).
- Sin servidor obligatorio; datos locales en el dispositivo.
