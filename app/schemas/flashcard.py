from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class FlashcardBase(BaseModel):
    question: str
    answer: str
    
class FlashcardCreate(FlashcardBase):
    tags: Optional[List[str]] = []
    
class FlashcardResponse(FlashcardBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    review_count: int = 0
    last_reviewed: Optional[datetime] = None