import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()


class Settings(BaseModel):
    """Configurações da aplicação"""

    # Informações básicas da API
    APP_NAME: str = "StudyBot API"
    API_PREFIX: str = "/api"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    # Segurança
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sua-chave-secreta-padrao")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )
    ALGORITHM: str = "HS256"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3000",  # Frontend React padrão
        "http://localhost:8080",
    ]

    # Firebase
    FIREBASE_API_KEY: Optional[str] = os.getenv("FIREBASE_API_KEY")
    FIREBASE_AUTH_DOMAIN: Optional[str] = os.getenv("FIREBASE_AUTH_DOMAIN")
    FIREBASE_PROJECT_ID: Optional[str] = os.getenv("FIREBASE_PROJECT_ID")
    FIREBASE_STORAGE_BUCKET: Optional[str] = os.getenv("FIREBASE_STORAGE_BUCKET")
    FIREBASE_MESSAGING_SENDER_ID: Optional[str] = os.getenv(
        "FIREBASE_MESSAGING_SENDER_ID"
    )
    FIREBASE_APP_ID: Optional[str] = os.getenv("FIREBASE_APP_ID")
    FIREBASE_DATABASE_URL: Optional[str] = os.getenv("FIREBASE_DATABASE_URL")

    # LLM
    LLM_MODEL: str = os.getenv("LLM_MODEL", "mistral")  # mistral ou claude
    MISTRAL_API_URL: str = os.getenv("MISTRAL_API_URL", "http://localhost:11434/api")
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")

    # Upload de arquivos
    MAX_UPLOAD_SIZE: int = int(
        os.getenv("MAX_UPLOAD_SIZE", "10485760")
    )  # 10MB por padrão
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "docx", "txt", "md"]


# Instância das configurações para uso em toda a aplicação
settings = Settings()
