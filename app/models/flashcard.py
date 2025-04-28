from datetime import datetime
from typing import List, Optional, Dict, Any


class Flashcard:
    """
    Modelo de dados para Flashcard

    Em uma implementação com ORM, isso seria uma classe SQLAlchemy ou MongoDB
    Para nossa versão simples, é apenas uma classe Python com métodos utilitários
    """

    def __init__(
        self,
        id: str,
        question: str,
        answer: str,
        user_id: str,
        tags: Optional[List[str]] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        review_count: int = 0,
        last_reviewed: Optional[datetime] = None,
    ):
        self.id = id
        self.question = question
        self.answer = answer
        self.user_id = user_id
        self.tags = tags or []
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at
        self.review_count = review_count
        self.last_reviewed = last_reviewed

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Flashcard":
        """Cria uma instância de Flashcard a partir de um dicionário"""
        created_at = data.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)

        updated_at = data.get("updated_at")
        if isinstance(updated_at, str) and updated_at:
            updated_at = datetime.fromisoformat(updated_at)

        last_reviewed = data.get("last_reviewed")
        if isinstance(last_reviewed, str) and last_reviewed:
            last_reviewed = datetime.fromisoformat(last_reviewed)

        return cls(
            id=data["id"],
            question=data["question"],
            answer=data["answer"],
            user_id=data["user_id"],
            tags=data.get("tags", []),
            created_at=created_at,
            updated_at=updated_at,
            review_count=data.get("review_count", 0),
            last_reviewed=last_reviewed,
        )

    def to_dict(self) -> Dict[str, Any]:
        """Converte o objeto Flashcard em um dicionário"""
        return {
            "id": self.id,
            "question": self.question,
            "answer": self.answer,
            "user_id": self.user_id,
            "tags": self.tags,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "review_count": self.review_count,
            "last_reviewed": (
                self.last_reviewed.isoformat() if self.last_reviewed else None
            ),
        }

    def update(self, data: Dict[str, Any]) -> None:
        """Atualiza o flashcard com novos dados"""
        if "question" in data:
            self.question = data["question"]
        if "answer" in data:
            self.answer = data["answer"]
        if "tags" in data:
            self.tags = data["tags"]

        self.updated_at = datetime.now()

    def record_review(self, success: bool = True) -> None:
        """Registra uma revisão do flashcard"""
        self.review_count += 1
        self.last_reviewed = datetime.now()
