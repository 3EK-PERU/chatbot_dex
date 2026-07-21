from fastapi import FastAPI

from app.api.analyze import router as analyze_router

app = FastAPI(title="Chatbot IA Agent", version="1.0.0")

app.include_router(analyze_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
