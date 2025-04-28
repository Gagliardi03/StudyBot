from datetime import datetime
from typing import Optional, Dict, Any, List


class Material:
    """
    Modelo de dados para Material de Estudo

    Em uma implementação com ORM, isso seria uma classe SQLAlchemy ou MongoDB
    Para nossa versão simples, é apenas uma classe Python com métodos utilitários
    """

    def __init__(
        self,
        id: str,
        user_id: str,
        title: str,
        filename: str,
        description: Optional[str] = None,
        content_type: Optional[str] = None,
        size: int = 0,
        text_content: Optional[str] = None,
        storage_path: Optional[str] = None,
        uploaded_at: Optional[datetime] = None,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.id = id
        self.user_id = user_id
        self.title = title
        self.filename = filename
        self.description = description or ""
        self.content_type = content_type
        self.size = size
        self.text_content = text_content
        self.storage_path = storage_path
        self.uploaded_at = uploaded_at or datetime.now()
        self.tags = tags or []
        self.metadata = metadata or {}

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Material":
        """Cria uma instância de Material a partir de um dicionário"""
        uploaded_at = data.get("uploaded_at")
        if isinstance(uploaded_at, str):
            uploaded_at = datetime.fromisoformat(uploaded_at)

        return cls(
            id=data["id"],
            user_id=data["user_id"],
            title=data["title"],
            filename=data["filename"],
            description=data.get("description", ""),
            content_type=data.get("content_type"),
            size=data.get("size", 0),
            text_content=data.get("text_content"),
            storage_path=data.get("storage_path"),
            uploaded_at=uploaded_at,
            tags=data.get("tags", []),
            metadata=data.get("metadata", {}),
        )

    def to_dict(self) -> Dict[str, Any]:
        """Converte o objeto Material em um dicionário"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "filename": self.filename,
            "description": self.description,
            "content_type": self.content_type,
            "size": self.size,
            "storage_path": self.storage_path,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "tags": self.tags,
            "metadata": self.metadata,
        }

    def update(self, data: Dict[str, Any]) -> None:
        """Atualiza o material com novos dados"""
        if "title" in data:
            self.title = data["title"]
        if "description" in data:
            self.description = data["description"]
        if "tags" in data:
            self.tags = data["tags"]
        if "metadata" in data and isinstance(data["metadata"], dict):
            self.metadata.update(data["metadata"])

    @property
    def extension(self) -> str:
        """Retorna a extensão do arquivo"""
        return self.filename.split(".")[-1].lower() if "." in self.filename else ""

    @property
    def is_text_document(self) -> bool:
        """Verifica se o material é um documento de texto"""
        text_extensions = ["txt", "md", "rtf"]
        return self.extension in text_extensions

    @property
    def is_pdf(self) -> bool:
        """Verifica se o material é um PDF"""
        return self.extension == "pdf"

    @property
    def is_word_document(self) -> bool:
        """Verifica se o material é um documento Word"""
        word_extensions = ["doc", "docx"]
        return self.extension in word_extensions
