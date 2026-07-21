# Pendientes locales - entrenamiento de visión

## Estado actual

- [x] Script de entrenamiento implementado en `vision/train.py`.
- [ ] Definir clases finales en `vision/dataset.yaml` (actualmente placeholder).
- [ ] Preparar dataset completo (`datasets/images|labels/{train,val,test}`).
- [ ] Ejecutar entrenamiento local y revisar métricas.
- [ ] Confirmar y versionar mejor modelo en `models/latest.pt`.

## Ejecución local sugerida

```bash
cd Chatbot.IA-Agent/vision
python train.py --run-name baseline_v1
```

## Resumen para compartir

Al terminar un run, compartir estos datos:

1. Nombre del run (`--run-name`).
2. Ruta del resumen generado en `vision/exports/<run>.summary.json`.
3. Métricas clave (mAP50, mAP50-95, precision, recall).
4. Decisión de despliegue (`models/latest.pt` actualizado o no).
