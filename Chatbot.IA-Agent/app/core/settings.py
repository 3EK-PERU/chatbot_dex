import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    yolo_model_path: str = os.getenv("YOLO_MODEL_PATH", "models/beverages.pt")
    score_threshold: float = float(os.getenv("YOLO_SCORE_THRESHOLD", "0.30"))


settings = Settings()
