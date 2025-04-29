from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Query
from typing import List, Optional, Dict, Any
from app.services.firebase_service import (
    store_material,
    get_user_materials,
    get_material,
    delete_material,
)
from app.services.pdf_service import extract_text_from_upload
from app.services.llm_service import summarize_text
from app.api.dependencies import get_current_user
import uuid
from datetime import datetime

from app.core.config import Settings

router = APIRouter()


@router.post("/upload")
async def upload_material(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),  # formato: "tag1,tag2,tag3"
    user_id: str = Depends(get_current_user),
):
    """Faz upload de um arquivo de material de estudo"""
    try:
        # Extrai texto do arquivo baseado no tipo
        text_content, metadata = await extract_text_from_upload(file)

        # Processa tags
        tag_list = []
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]

        # Dados do material
        material_data = {
            "title": title or file.filename,
            "filename": file.filename,
            "description": description or "",
            "size": metadata.get("size", 0),
            "content_type": file.content_type,
            "text_content": text_content,
            "tags": tag_list,
            "metadata": metadata,
        }

        # Armazena no banco de dados
        stored_material = await store_material(material_data, user_id)

        return stored_material
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload: {str(e)}")


@router.get("/")
async def list_materials(
    tag: Optional[str] = Query(None, description="Filtrar por tag"),
    user_id: str = Depends(get_current_user),
):
    """Lista todos os materiais do usuário, opcionalmente filtrados por tag"""
    try:
        materials = await get_user_materials(user_id)

        # Filtra por tag se especificado
        if tag:
            materials = [m for m in materials if "tags" in m and tag in m["tags"]]

        return {"materials": materials, "total": len(materials)}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao listar materiais: {str(e)}"
        )


@router.get("/{material_id}")
async def get_material_details(
    material_id: str,
    include_content: bool = Query(
        False, description="Incluir conteúdo de texto completo"
    ),
    user_id: str = Depends(get_current_user),
):
    """Obtém detalhes de um material específico"""
    try:
        material = await get_material(material_id, user_id)
        if not material:
            raise HTTPException(status_code=404, detail="Material não encontrado")

        # Remove o conteúdo de texto completo se não solicitado
        if not include_content and "text_content" in material:
            # Mantém apenas um trecho para visualização
            preview_length = min(500, len(material["text_content"]))
            material["text_preview"] = material["text_content"][:preview_length] + "..."
            del material["text_content"]

        return material
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter material: {str(e)}")


@router.post("/{material_id}/summarize")
async def summarize_material(
    material_id: str,
    num_points: Optional[int] = Query(5, description="Número de pontos no resumo"),
    model: Optional[str] = Query(
        None, description="Modelo LLM a utilizar (gemini, mistral, claude)"
    ),
    user_id: str = Depends(get_current_user),
):
    """Gera um resumo do material de estudo"""
    try:
        material = await get_material(material_id, user_id)
        if not material:
            raise HTTPException(status_code=404, detail="Material não encontrado")

        if "text_content" not in material or not material["text_content"]:
            raise HTTPException(
                status_code=400,
                detail="Material não possui conteúdo de texto para resumir",
            )

        # Gera o resumo usando o LLM
        summary = await summarize_text(
            material["text_content"], num_points=num_points, model=model
        )

        return {
            "material_id": material_id,
            "title": material.get("title"),
            "summary": summary,
            "generated_at": datetime.now().isoformat(),
            "model_used": model or Settings.LLM_MODEL,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao resumir material: {str(e)}"
        )


@router.put("/{material_id}")
async def update_material_metadata(
    material_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),  # formato: "tag1,tag2,tag3"
    user_id: str = Depends(get_current_user),
):
    """Atualiza metadados de um material"""
    try:
        material = await get_material(material_id, user_id)
        if not material:
            raise HTTPException(status_code=404, detail="Material não encontrado")

        # Dados para atualização
        update_data = {}

        if title is not None:
            update_data["title"] = title

        if description is not None:
            update_data["description"] = description

        if tags is not None:
            tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
            update_data["tags"] = tag_list

        # Em produção, implementar a atualização no Firebase
        # Por enquanto, simulamos a atualização
        for key, value in update_data.items():
            material[key] = value

        material["updated_at"] = datetime.now().isoformat()

        return material
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao atualizar material: {str(e)}"
        )


@router.delete("/{material_id}")
async def delete_material_endpoint(
    material_id: str, user_id: str = Depends(get_current_user)
):
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
