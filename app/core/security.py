from datetime import datetime, timedelta
from typing import Optional
import jwt
from app.core.config import settings


def create_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Cria um token JWT para o usuário

    Args:
        subject: ID do usuário ou assunto do token
        expires_delta: Tempo de expiração opcional

    Returns:
        Token JWT codificado
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.utcnow(),
    }

    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    return encoded_jwt


def decode_token(token: str) -> str:
    """
    Decodifica um token JWT e retorna o ID do usuário

    Args:
        token: Token JWT codificado

    Returns:
        ID do usuário extraído do token

    Raises:
        jwt.PyJWTError: Se o token for inválido
    """
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

    return payload["sub"]
