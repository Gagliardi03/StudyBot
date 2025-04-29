from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from app.api.dependencies import get_current_user
from app.services.llm_service import answer_question
from app.services.firebase_service import get_material

# Criação do router
router = APIRouter()


# Modelo para mensagens
class Message(BaseModel):
    content: str
    context_material_id: Optional[str] = None


# Modelo para resposta de chat
class ChatResponse(BaseModel):
    id: str
    content: str
    sender: str
    timestamp: str


# Simulação de banco de dados em memória para chat
chat_history = {}


@router.post("/message", response_model=ChatResponse)
async def send_message(
    message: Message,
    model: Optional[str] = Query(
        None, description="Modelo LLM a utilizar (gemini, mistral, claude)"
    ),
    user_id: str = Depends(get_current_user),
):
    """Envia uma mensagem para o assistente e recebe uma resposta do LLM"""
    try:
        # Registra a mensagem do usuário
        if user_id not in chat_history:
            chat_history[user_id] = []

        user_message = {
            "id": str(uuid.uuid4()),
            "content": message.content,
            "sender": "user",
            "timestamp": datetime.now().isoformat(),
        }

        chat_history[user_id].append(user_message)

        # Processa a resposta usando o LLM
        context = None
        if message.context_material_id:
            # Busca o material pelo ID
            material = await get_material(message.context_material_id, user_id)
            if material and "text_content" in material:
                context = material["text_content"]

        # Usa o modelo especificado ou o padrão
        response_text = await answer_question(message.content, context, model=model)

        # Registra a resposta do assistente
        assistant_response = {
            "id": str(uuid.uuid4()),
            "content": response_text,
            "sender": "assistant",
            "timestamp": datetime.now().isoformat(),
        }

        chat_history[user_id].append(assistant_response)

        return ChatResponse(**assistant_response)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao processar mensagem: {str(e)}"
        )


@router.get("/history", response_model=Dict[str, List[Dict[str, Any]]])
async def get_chat_history(user_id: str = Depends(get_current_user)):
    """Obtém o histórico de chat"""
    if user_id not in chat_history:
        return {"messages": []}

    return {"messages": chat_history[user_id]}


@router.delete("/history")
async def clear_chat_history(user_id: str = Depends(get_current_user)):
    """Limpa o histórico de chat"""
    if user_id in chat_history:
        chat_history[user_id] = []

    return {"message": "Histórico de chat limpo com sucesso"}
