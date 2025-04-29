from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
from app.schemas.flashcard import FlashcardCreate, FlashcardResponse
from app.services.firebase_service import (
    store_flashcards,
    get_user_flashcards,
    update_flashcard,
    delete_flashcard,
    get_material,
)
from app.services.llm_service import generate_flashcards_from_text
from app.api.dependencies import get_current_user

router = APIRouter()


@router.post("/generate", response_model=List[FlashcardResponse])
async def create_flashcards_from_notes(
    notes: str = Body(..., description="Notas de texto para gerar flashcards"),
    count: Optional[int] = Query(5, description="Número de flashcards a serem gerados"),
    model: Optional[str] = Query(
        None, description="Modelo LLM a utilizar (gemini, mistral, claude)"
    ),
    user_id: str = Depends(get_current_user),
):
    """Gera flashcards a partir de notas de texto"""
    try:
        # Gera flashcards usando o LLM
        flashcards = await generate_flashcards_from_text(notes, count, model=model)

        # Armazena os flashcards gerados
        stored_flashcards = await store_flashcards(flashcards, user_id)
        return stored_flashcards
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao gerar flashcards: {str(e)}"
        )


@router.post(
    "/generate-from-material/{material_id}", response_model=List[FlashcardResponse]
)
async def create_flashcards_from_material(
    material_id: str,
    count: Optional[int] = Query(5, description="Número de flashcards a serem gerados"),
    model: Optional[str] = Query(
        None, description="Modelo LLM a utilizar (gemini, mistral, claude)"
    ),
    user_id: str = Depends(get_current_user),
):
    """Gera flashcards a partir de um material de estudo existente"""
    try:
        # Busca o material pelo ID
        material = await get_material(material_id, user_id)
        if not material:
            raise HTTPException(status_code=404, detail="Material não encontrado")

        # Verifica se o material tem conteúdo de texto
        if "text_content" not in material or not material["text_content"]:
            raise HTTPException(
                status_code=400,
                detail="Material não possui conteúdo de texto para gerar flashcards",
            )

        # Gera flashcards usando o LLM
        flashcards = await generate_flashcards_from_text(
            material["text_content"], count, model=model
        )

        # Adiciona tag do material aos flashcards
        for flashcard in flashcards:
            if "tags" not in flashcard:
                flashcard["tags"] = []

            # Adiciona o título do material como tag
            material_tag = f"material:{material_id}"
            if material_tag not in flashcard["tags"]:
                flashcard["tags"].append(material_tag)

            title_tag = f"título:{material['title']}"
            if title_tag not in flashcard["tags"]:
                flashcard["tags"].append(title_tag)

        # Armazena os flashcards gerados
        stored_flashcards = await store_flashcards(flashcards, user_id)
        return stored_flashcards
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao gerar flashcards do material: {str(e)}"
        )


@router.post("/", response_model=FlashcardResponse)
async def create_flashcard(
    flashcard: FlashcardCreate, user_id: str = Depends(get_current_user)
):
    """Cria um novo flashcard manualmente"""
    try:
        created_flashcard = await store_flashcards([flashcard.dict()], user_id)
        return created_flashcard[0]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao criar flashcard: {str(e)}"
        )


@router.get("/", response_model=List[FlashcardResponse])
async def read_flashcards(
    tag: Optional[str] = Query(None, description="Filtrar por tag"),
    user_id: str = Depends(get_current_user),
):
    """Retorna todos os flashcards do usuário, opcionalmente filtrados por tag"""
    try:
        flashcards = await get_user_flashcards(user_id)

        # Aplica filtro por tag se especificado
        if tag:
            flashcards = [f for f in flashcards if "tags" in f and tag in f["tags"]]

        return flashcards
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao buscar flashcards: {str(e)}"
        )


@router.put("/{flashcard_id}", response_model=FlashcardResponse)
async def update_flashcard_endpoint(
    flashcard_id: str,
    flashcard_data: FlashcardCreate,
    user_id: str = Depends(get_current_user),
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
async def delete_flashcard_endpoint(
    flashcard_id: str, user_id: str = Depends(get_current_user)
):
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
