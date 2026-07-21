import cv2
import numpy as np
from ultralytics import YOLO

from app.core.settings import settings
from app.schemas import AnalyzeResponse, DetectionItem


class YoloService:
    def __init__(self) -> None:
        self._model = YOLO(settings.yolo_model_path)

    def analyze(self, image_bytes: bytes) -> AnalyzeResponse:
        np_image = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)

        if image is None:
            return AnalyzeResponse(detections=[])

        result = self._model.predict(source=image, conf=settings.score_threshold, verbose=False)[0]
        names = result.names

        detections: list[DetectionItem] = []
        for box in result.boxes:
            xyxy = box.xyxy[0].tolist()
            confidence = float(box.conf[0])
            class_idx = int(box.cls[0])

            x1, y1, x2, y2 = xyxy
            detections.append(
                DetectionItem(
                    className=str(names[class_idx]),
                    confidence=confidence,
                    x=float(x1),
                    y=float(y1),
                    width=float(x2 - x1),
                    height=float(y2 - y1),
                )
            )

        return AnalyzeResponse(detections=detections)
