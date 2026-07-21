from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.yolo_service import YoloService
from app.schemas import AnalyzeResponse

router = APIRouter(prefix="", tags=["vision"])
_service = YoloService()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(file: UploadFile = File(...)) -> AnalyzeResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    return _service.analyze(image_bytes)
