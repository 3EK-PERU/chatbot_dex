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
