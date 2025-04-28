from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import chat, flashcards, materials

app = FastAPI(
    title="StudyBot API",
    description="API para o assistente pessoal de estudos",
    version="0.1.0",
)

# Configuração CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Endereço do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão das rotas
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(flashcards.router, prefix="/api/flashcards", tags=["Flashcards"])
app.include_router(materials.router, prefix="/api/materials", tags=["Materials"])


@app.get("/")
async def root():
    return {"message": "Bem-vindo à API do StudyBot"}


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "StudyBot API"}
