# HidroGrow — Diagrama de flujo completo

**Versión:** 2026-05-31 · **Sistemas:** DWC y RDWC únicamente · **PDF:** [`HidroGrow-diagrama-flujo-completo.pdf`](HidroGrow-diagrama-flujo-completo.pdf)

Regenerar PDF:

```bash
npm run docs:flujo-pdf
```

---

## 1. Arranque y onboarding

```mermaid
flowchart TD
  A[Abrir app / PWA] --> B{Primera vez?}
  B -->|Sí| C[Bienvenida — carrusel funciones]
  B -->|No| H[Inicio]
  C --> D[Coach barra pestañas]
  D --> E{Instalación vacía?}
  E -->|Sí| F[Asistente configuración]
  E -->|No| H
  F --> H
  C -->|Cerrar / Entrar| H
```

---

## 2. Asistente de configuración (15 pasos)

```mermaid
flowchart LR
  subgraph P0[P0 Tipo]
    P0a[DWC o RDWC]
  end
  subgraph Premium[P1–P7 Premium]
    P1[Objetivo legal]
    P2[Entorno int/ext]
    P3[Espacio equip]
    P4[Clima luz]
    P5[SOG SCROG genética]
    P6[Origen planta]
    P7[Puente montaje]
  end
  subgraph Tecnico[S1–S7 Técnico]
    S1[Geometría sistema]
    S2[Equip hidráulico]
    S3[Agua cestas]
    S4[Nutriente]
    S5[Meteo]
    S6[Cultivos]
    S7[Resumen guardar]
  end
  P0 --> P1 --> P2 --> P3 --> P4 --> P5 --> P6 --> P7 --> S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7
  S7 --> L[Lifecycle Inicio]
```

---

## 3. Ciclo de instalación (hub Inicio)

```mermaid
flowchart TD
  L[Config guardada] --> M[2 Montaje sala — checklist Sala]
  M --> C[3 Cultivo — variedad y fecha por cesta]
  C --> D[4 Primer llenado — checklist depósito]
  D --> O[✓ Operativa diaria]
  O --> M1[Medir EC pH vol]
  O --> M2[Historial gráficos]
  O --> M3[Calendario Meteo]
```

---

## 4. Origen de planta (ramas)

```mermaid
flowchart TD
  O6[P6 Origen] --> SEM[Semilla]
  O6 --> CLON[Clon esqueje]
  O6 --> MAD[Madre]
  SEM --> G[Hub Germinación Inicio]
  G --> G1[F1 germinador]
  G1 --> G2[F2 radícula]
  G2 --> G3[F3 rockwool pH]
  G3 --> G4[F4 domo 18/6]
  G4 --> G5[F5 net pot]
  G5 --> G6[F6 traslado DWC/RDWC]
  G6 --> C
  CLON --> CK[Checklists prep corte domo]
  CK --> C
  MAD --> MD[18/6 sesiones esqueje]
  MD --> C
```

---

## 5. Pestañas y rutina diaria

```mermaid
flowchart LR
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
  O[Operativa] --> Me
  Me --> Hi
  Me --> Ca
  I --> G
  I --> L
```

| Pestaña | Uso principal |
|---------|----------------|
| Inicio | Progreso, germinación, resumen, accesos |
| Medir | Registro, asistente, PRO, IoT, recarga |
| Sala | Montaje, LED, clima sala |
| Sistema | Matriz, diagrama DWC/RDWC |
| Historial | Gráficos, seguimiento vs teórico |
| Calendario | Recordatorios, esquejes |
| Consejos | Guías, flujo app, genéticas |
| Ayuda | FAQ, backup, reabrir bienvenida |

---

## 6. Notas

- **Tienda de semillas** (top 10 en asistente) ≠ **propagador** (equipamiento en hub Germinación).
- Datos en `hidrogrow_v2` (local). Sin servidor obligatorio.
- Valores EC/pH/VPD son orientativos; priorizar medidor y ficha de variedad.
