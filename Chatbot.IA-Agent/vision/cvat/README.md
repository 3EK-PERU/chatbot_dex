# CVAT Local Setup

Este entorno levanta CVAT localmente con Docker Compose para etiquetar imagenes y exportar anotaciones en formato YOLO.

## 1) Preparar variables de entorno

Copiar el archivo de ejemplo:

```powershell
Copy-Item .\cvat\.env.example .\cvat\.env
```

Actualizar secretos y puertos si es necesario.

## 2) Levantar CVAT

Desde la carpeta `vision`:

```powershell
docker compose up -d
```

## 3) Acceso

- UI: http://localhost:8081
- API Server: http://localhost:8080

## 4) Flujo recomendado para dataset YOLO

1. Crear proyecto en CVAT.
2. Definir labels de productos (SKU/clases) con nomenclatura estable.
3. Crear tarea e importar imagenes desde `datasets/raw` o `datasets/images/train|val|test`.
4. Etiquetar cuadros (bounding boxes).
5. Exportar task o project en formato `Ultralytics YOLO Detection`.
6. Sincronizar archivos exportados hacia:
   - `datasets/images/{split}`
   - `datasets/labels/{split}`

## 5) Buenas practicas

- Mantener clases consistentes con `dataset.yaml`.
- Evitar renombrar labels una vez iniciado el entrenamiento.
- Revisar calidad de etiquetado antes de versionar con DVC.

## 6) Apagar entorno

```powershell
docker compose down
```
