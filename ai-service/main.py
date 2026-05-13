from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import nutrition, suggest, planner, chat

app = FastAPI(
    title="FlavorVerse AI Service",
    description="AI-powered nutrition analysis, recipe suggestions & meal planning",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(nutrition.router, prefix="/ai/nutrition", tags=["Nutrition"])
app.include_router(suggest.router,   prefix="/ai/suggest",   tags=["Suggestions"])
app.include_router(planner.router,   prefix="/ai/planner",   tags=["Planner"])
app.include_router(chat.router,      prefix="/ai/chat",       tags=["Chat"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "FlavorVerse AI"}
