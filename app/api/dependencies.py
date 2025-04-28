from fastapi import Header, HTTPException, Depends
from typing import Optional
from app.core.security import decode_token


async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """
    Valida o token de autorização e retorna o ID do usuário

    Na versão simplificada, retornamos um ID de usuário fixo para testes
    Em produção, este método validaria o token JWT e retornaria o ID do usuário real
    """
    if authorization is None:
        # Para fins de desenvolvimento, permite acesso sem token
        return "test_user"

    # Remove o prefixo "Bearer " se presente
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization

    try:
        # Em produção, decodificaria o token JWT
        # user_id = decode_token(token)

        # Por enquanto, simplesmente retorna o usuário de teste
        user_id = "test_user"
        return user_id
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Token de autorização inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Função dummy para simular limitação de taxa
async def rate_limit(user_id: str = Depends(get_current_user)):
    """
    Limita o número de requisições por usuário

    Em produção, implementaria um sistema real de limitação de taxa
    Por enquanto, é apenas um placeholder
    """
    # Aqui você implementaria verificação de limites de taxa
    # Exemplo: verificar Redis para ver se o usuário excedeu o limite
    return True
