from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from app.services.firebase_service import (
    store_material,
    get_user_materials,
    get_material,
    delete_material,
)
import uuid
from datetime import datetime

router = APIRouter()


@router.post("/upload")
async def upload_material(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    user_id: str = "test_user",
):
    """Faz upload de um arquivo de material de estudo"""
    try:
        # Em produção, você salvaria o arquivo no Firebase Storage
        # e processaria o conteúdo para extração de texto

        # Simulamos o processo para início rápido
        file_content = await file.read()
        file_size = len(file_content)

        # Dados do material
        material_data = {
            "title": title or file.filename,
            "filename": file.filename,
            "description": description or "",
            "size": file_size,
            "content_type": file.content_type,
            "text_content": f"Conteúdo simulado para {file.filename} ({file_size} bytes)",
        }

        # Armazena no "banco de dados"
        stored_material = await store_material(material_data, user_id)

        return stored_material
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload: {str(e)}")


@router.get("/")
async def list_materials(user_id: str = "test_user"):
    """Lista todos os materiais do usuário"""
    try:
        materials = await get_user_materials(user_id)
        return {"materials": materials}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao listar materiais: {str(e)}"
        )


@router.get("/{material_id}")
async def get_material_details(material_id: str, user_id: str = "test_user"):
    """Obtém detalhes de um material específico"""
    try:
        material = await get_material(material_id, user_id)
        if not material:
            raise HTTPException(status_code=404, detail="Material não encontrado")
        return material
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter material: {str(e)}")


@router.post("/{material_id}/summarize")
async def summarize_material(
    material_id: str, num_points: Optional[int] = 5, user_id: str = "test_user"
):
    """Gera um resumo do material de estudo"""
    try:
        material = await get_material(material_id, user_id)
        if not material:
            raise HTTPException(status_code=404, detail="Material não encontrado")

        # Em produção, você enviaria o conteúdo para o LLM para resumo
        # Aqui simulamos o resultado
        summary = [
            f"Ponto importante 1 sobre {material['title']}",
            f"Ponto importante 2 sobre {material['title']}",
            f"Ponto importante 3 sobre {material['title']}",
            f"Ponto importante 4 sobre {material['title']}",
            f"Ponto importante 5 sobre {material['title']}",
        ]

        return {"summary": summary[:num_points]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao resumir material: {str(e)}"
        )


@router.delete("/{material_id}")
async def delete_material_endpoint(material_id: str, user_id: str = "test_user"):
    """Remove um material"""
    try:
        deleted = await delete_material(material_id, user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Material não encontrado")
        return {"message": "Material removido com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao remover material: {str(e)}"
        )
