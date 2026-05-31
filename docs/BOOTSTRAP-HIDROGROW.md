# HidroGrow — arranque del proyecto

Proyecto independiente de **HidroCultivo** (mismo motor hidráulico, otra marca y datos).

## Carpeta y GitHub

| | |
|---|---|
| Carpeta local | `C:\Git\hidroGrow-web` |
| Repositorio | `https://github.com/Debrin77/HidroGrow-web` |
| HidroCultivo (no tocar) | `...\GitHub\HidroCultivo-web` |

## Separación técnica (hecho)

- `STORAGE_KEY`: `hidrogrow_v1` (no comparte cultivos con `cultiva_v1`)
- Backup JSON: `hidrogrowBackup`, `app: "HidroGrow"`, archivos `hidrogrow-backup-*.json`
- Import acepta copias HidroGrow y, por migración, copias antiguas `hidrocultivoBackup`
- PWA: `manifest.json` + service worker `hidrogrow-shell-v1`
- Capacitor: `es.hidrogrow.app` / `HidroGrow`

## Probar en local

```powershell
cd C:\Git\hidroGrow-web
npm run rpi:serve
```

Abre `http://localhost:5173`. Si ves datos viejos: DevTools → Application → borrar datos de `localhost:5173` o usa puerto `5174`.

## Siguientes fases de producto

1. Iconos y colores propios (sustituir splash provisional).
2. `genetics-db.js` — genéticas cannabis.
3. Módulo sala (LED, extractor, carpa).
4. Nutrientes y cultivos orientados a cannabis.
