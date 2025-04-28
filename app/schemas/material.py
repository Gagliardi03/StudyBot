from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid


class MaterialBase(BaseModel):
    """Esquema base para materiais de estudo"""

    title: str
    description: Optional[str] = ""
    tags: List[str] = []


class MaterialCreate(MaterialBase):
    """Esquema para criação de materiais"""

    filename: str
    content_type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}


class MaterialUpdate(BaseModel):
    """Esquema para atualização de materiais"""

    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class MaterialResponse(MaterialBase):
    """Esquema para resposta de materiais"""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    content_type: Optional[str] = None
    size: int = 0
    storage_path: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=datetime.now)
    user_id: str
    metadata: Dict[str, Any] = {}

    class Config:
        """Configuração do Pydantic"""

        json_encoders = {datetime: lambda v: v.isoformat()}


class MaterialSummaryRequest(BaseModel):
    """Esquema para solicitação de resumo de material"""

    num_points: Optional[int] = 5
    max_tokens: Optional[int] = 1000


class MaterialSummaryResponse(BaseModel):
    """Esquema para resposta de resumo de material"""

    material_id: str
    summary: List[str]
    generated_at: datetime = Field(default_factory=datetime.now)


class MaterialListResponse(BaseModel):
    """Esquema para resposta de listagem de materiais"""

    materials: List[MaterialResponse]
    total: int
