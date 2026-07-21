# Vision Training Platform

Plataforma MLOps para entrenamiento y despliegue de deteccion de productos en EDF y racks.

## Alcance de la fase base

- Estructura estandar de carpetas para datos, entrenamiento, inferencia y configuracion.
- Configuracion centralizada por YAML.
- Separacion estricta entre entrenamiento e inferencia.

## Convenciones

- Dataset en formato YOLO.
- Configuracion sin valores hardcodeados en codigo.
- FastAPI se utiliza solo para servir inferencia de modelos entrenados.

## CVAT local

La configuracion de etiquetado local con Docker Compose esta en [cvat/README.md](cvat/README.md).

## Entrenamiento

El entrypoint de entrenamiento se ejecuta desde esta carpeta:

```bash
python train.py --run-name baseline_v1
```

Se generan artefactos en `models/` y un resumen por corrida en `exports/<run>.summary.json`.

Para seguimiento de trabajo pendiente en local, revisar `PENDIENTES_LOCAL.md`.
