from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.schemas.flashcard import FlashcardCreate, FlashcardResponse
from app.services.firebase_service import (
    store_flashcards,
    get_user_flashcards,
    update_flashcard,
    delete_flashcard,
)

router = APIRouter()


@router.post("/generate", response_model=List[FlashcardResponse])
async def create_flashcards_from_notes(
    notes: str,
    count: Optional[int] = Query(5, description="Número de flashcards a serem gerados"),
):
    """Gera flashcards a partir de notas de texto"""
    try:
        # Implementação simples para iniciar (sem LLM)
        # Em produção, use o LLM para gerar flashcards de verdade
        flashcards = [
            {
                "question": f"Pergunta de exemplo {i+1} baseada nas notas",
                "answer": f"Resposta de exemplo {i+1} baseada nas notas",
            }
            for i in range(min(count, 5))
        ]

        # Simula armazenamento (user_id fixo para testes)
        stored_flashcards = await store_flashcards(flashcards, "test_user")
        return stored_flashcards
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao gerar flashcards: {str(e)}"
        )


@router.post("/", response_model=FlashcardResponse)
async def create_flashcard(flashcard: FlashcardCreate, user_id: str = "test_user"):
    """Cria um novo flashcard manualmente"""
    try:
        created_flashcard = await store_flashcards([flashcard.dict()], user_id)
        return created_flashcard[0]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao criar flashcard: {str(e)}"
        )


@router.get("/", response_model=List[FlashcardResponse])
async def read_flashcards(user_id: str = "test_user"):
    """Retorna todos os flashcards do usuário"""
    try:
        flashcards = await get_user_flashcards(user_id)
        return flashcards
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao buscar flashcards: {str(e)}"
        )


@router.put("/{flashcard_id}", response_model=FlashcardResponse)
async def update_flashcard_endpoint(
    flashcard_id: str, flashcard_data: FlashcardCreate, user_id: str = "test_user"
):
    """Atualiza um flashcard existente"""
    try:
        updated = await update_flashcard(flashcard_id, user_id, flashcard_data.dict())
        if not updated:
            raise HTTPException(status_code=404, detail="Flashcard não encontrado")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao atualizar flashcard: {str(e)}"
        )


@router.delete("/{flashcard_id}")
async def delete_flashcard_endpoint(flashcard_id: str, user_id: str = "test_user"):
    """Remove um flashcard"""
    try:
        deleted = await delete_flashcard(flashcard_id, user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Flashcard não encontrado")
        return {"message": "Flashcard removido com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao remover flashcard: {str(e)}"
        )
