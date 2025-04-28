from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

# Simulação do Firebase para início rápido
# Em produção, substitua por implementação real com firebase_admin

# Armazenamento temporário em memória
flashcards_db = {}
materials_db = {}


async def store_flashcards(
    flashcards_data: List[Dict[str, Any]], user_id: str
) -> List[Dict[str, Any]]:
    """
    Armazena flashcards no Firebase
    """
    stored_flashcards = []

    for flashcard in flashcards_data:
        # Gera ID único se não existir
        flashcard_id = flashcard.get("id", str(uuid.uuid4()))

        # Adiciona metadados
        complete_flashcard = {
            **flashcard,
            "id": flashcard_id,
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "updated_at": None,
            "review_count": 0,
            "last_reviewed": None,
        }

        # Armazena no "banco de dados" temporário
        if user_id not in flashcards_db:
            flashcards_db[user_id] = {}

        flashcards_db[user_id][flashcard_id] = complete_flashcard
        stored_flashcards.append(complete_flashcard)

    return stored_flashcards


async def get_user_flashcards(user_id: str) -> List[Dict[str, Any]]:
    """
    Recupera flashcards do usuário do Firebase
    """
    if user_id not in flashcards_db:
        return []

    return list(flashcards_db[user_id].values())


async def update_flashcard(
    flashcard_id: str, user_id: str, data: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """
    Atualiza um flashcard existente
    """
    if user_id not in flashcards_db or flashcard_id not in flashcards_db[user_id]:
        return None

    current_flashcard = flashcards_db[user_id][flashcard_id]
    updated_flashcard = {
        **current_flashcard,
        **data,
        "updated_at": datetime.now().isoformat(),
    }

    flashcards_db[user_id][flashcard_id] = updated_flashcard
    return updated_flashcard


async def delete_flashcard(flashcard_id: str, user_id: str) -> bool:
    """
    Remove um flashcard
    """
    if user_id not in flashcards_db or flashcard_id not in flashcards_db[user_id]:
        return False

    del flashcards_db[user_id][flashcard_id]
    return True


# Funções para materiais de estudo
async def store_material(file_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """
    Armazena um material de estudo no Firebase
    """
    material_id = str(uuid.uuid4())

    material = {
        **file_data,
        "id": material_id,
        "user_id": user_id,
        "uploaded_at": datetime.now().isoformat(),
    }

    if user_id not in materials_db:
        materials_db[user_id] = {}

    materials_db[user_id][material_id] = material
    return material


async def get_user_materials(user_id: str) -> List[Dict[str, Any]]:
    """
    Recupera materiais de estudo do usuário
    """
    if user_id not in materials_db:
        return []

    return list(materials_db[user_id].values())


async def get_material(material_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Recupera um material específico
    """
    if user_id not in materials_db or material_id not in materials_db[user_id]:
        return None

    return materials_db[user_id][material_id]


async def delete_material(material_id: str, user_id: str) -> bool:
    """
    Remove um material
    """
    if user_id not in materials_db or material_id not in materials_db[user_id]:
        return False

    del materials_db[user_id][material_id]
    return True
