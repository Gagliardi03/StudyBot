from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
import uuid

# Criação do router (este era o problema - faltava definir o router explicitamente)
router = APIRouter()


# Modelo para mensagens
class Message(BaseModel):
    content: str


# Simulação de banco de dados em memória para chat
chat_history = {}


@router.post("/message")
async def send_message(message: Message, user_id: str = "test_user"):
    """Envia uma mensagem para o assistente"""
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

        # Simula uma resposta do assistente (em produção, usaria o LLM)
        assistant_response = {
            "id": str(uuid.uuid4()),
            "content": f"Esta é uma resposta de teste para: {message.content}",
            "sender": "assistant",
            "timestamp": datetime.now().isoformat(),
        }

        chat_history[user_id].append(assistant_response)

        return assistant_response
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao processar mensagem: {str(e)}"
        )


@router.get("/history")
async def get_chat_history(user_id: str = "test_user"):
    """Obtém o histórico de chat"""
    if user_id not in chat_history:
        return {"messages": []}

    return {"messages": chat_history[user_id]}


@router.delete("/history")
async def clear_chat_history(user_id: str = "test_user"):
    """Limpa o histórico de chat"""
    if user_id in chat_history:
        chat_history[user_id] = []

    return {"message": "Histórico de chat limpo com sucesso"}
