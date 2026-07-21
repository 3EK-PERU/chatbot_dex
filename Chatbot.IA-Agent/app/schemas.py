from pydantic import BaseModel, Field


class DetectionItem(BaseModel):
    class_name: str = Field(..., alias="className")
    confidence: float
    x: float
    y: float
    width: float
    height: float


class AnalyzeResponse(BaseModel):
    detections: list[DetectionItem]
