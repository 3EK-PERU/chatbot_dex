# Chatbot IA Agent

Servicio de vision para deteccion de productos con YOLOv8.

## Responsabilidad

Este servicio solo detecta objetos en una imagen y devuelve datos estructurados.
No contiene reglas de negocio ni respuestas conversacionales.

## Ejecutar localmente

1. Instalar dependencias:

```bash
pip install -r requirements.txt
```

2. Configurar modelo (opcional):

```bash
set YOLO_MODEL_PATH=models/beverages.pt
set YOLO_SCORE_THRESHOLD=0.30
```

3. Levantar API:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Endpoint

- `POST /analyze`
  - Entrada: multipart/form-data con campo `file`
  - Salida: JSON con detecciones (`className`, `confidence`, `x`, `y`, `width`, `height`)
