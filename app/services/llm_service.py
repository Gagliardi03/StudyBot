import httpx
import json
from typing import List, Dict, Any, Optional, Union
from app.core.config import settings
import asyncio


async def query_mistral(
    prompt: str, max_tokens: int = 2048, temperature: float = 0.7, top_p: float = 0.9
) -> str:
    """
    Envia uma query para o Mistral via Ollama

    Args:
        prompt: Texto para gerar a resposta
        max_tokens: Número máximo de tokens na resposta
        temperature: Temperatura para geração (0.0 a 1.0)
        top_p: Probabilidade cumulativa para amostragem nuclear

    Returns:
        Texto da resposta gerada
    """
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{settings.MISTRAL_API_URL}/generate",
                json={
                    "model": "mistral:7b",
                    "prompt": prompt,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "top_p": top_p,
                },
            )

            if response.status_code != 200:
                raise Exception(f"Erro ao consultar Mistral: {response.text}")

            return response.json()["response"]
        except Exception as e:
            # Fallback para resposta simulada em caso de erro
            print(f"Erro ao chamar Mistral: {str(e)}")
            return f"[Resposta simulada devido a erro na API: {str(e)}]"


async def query_claude(
    prompt: str, max_tokens: int = 2048, temperature: float = 0.7
) -> str:
    """
    Envia uma query para o Claude via API da Anthropic

    Args:
        prompt: Texto para gerar a resposta
        max_tokens: Número máximo de tokens na resposta
        temperature: Temperatura para geração (0.0 a 1.0)

    Returns:
        Texto da resposta gerada
    """
    if not settings.ANTHROPIC_API_KEY:
        return "[API Key da Anthropic não configurada]"

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-3-haiku-20240307",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                },
            )

            if response.status_code != 200:
                raise Exception(f"Erro ao consultar Claude: {response.text}")

            return response.json()["content"][0]["text"]
        except Exception as e:
            # Fallback para resposta simulada em caso de erro
            print(f"Erro ao chamar Claude: {str(e)}")
            return f"[Resposta simulada devido a erro na API: {str(e)}]"


async def query_llm(
    prompt: str,
    max_tokens: int = 2048,
    temperature: float = 0.7,
    model: Optional[str] = None,
) -> str:
    """
    Escolhe o LLM correto com base na configuração ou no parâmetro model

    Args:
        prompt: Texto para gerar a resposta
        max_tokens: Número máximo de tokens na resposta
        temperature: Temperatura para geração (0.0 a 1.0)
        model: Modelo a ser usado (mistral ou claude)

    Returns:
        Texto da resposta gerada
    """
    model_to_use = model or settings.LLM_MODEL.lower()

    if model_to_use == "mistral":
        return await query_mistral(prompt, max_tokens, temperature)
    elif model_to_use == "claude":
        return await query_claude(prompt, max_tokens, temperature)
    else:
        raise ValueError(f"Modelo LLM não suportado: {model_to_use}")


async def generate_flashcards_from_text(
    text: str, count: int = 5, temperature: float = 0.7
) -> List[Dict[str, str]]:
    """
    Gera flashcards a partir de texto usando o LLM configurado

    Args:
        text: Texto das notas para gerar flashcards
        count: Número de flashcards a gerar
        temperature: Temperatura para geração (0.0 a 1.0)

    Returns:
        Lista de dicionários com perguntas e respostas
    """
    prompt = f"""
    Gere {count} flashcards educativos a partir do texto abaixo.
    Cada flashcard deve ter uma pergunta clara e uma resposta concisa.
    Foque nos conceitos mais importantes.
    
    TEXTO:
    {text}
    
    FORMATO DA RESPOSTA:
    Retorne apenas um array JSON no formato:
    [
      {{"question": "Pergunta 1?", "answer": "Resposta 1"}},
      {{"question": "Pergunta 2?", "answer": "Resposta 2"}}
    ]
    """

    response = await query_llm(prompt, temperature=temperature)

    # Extrai o array JSON da resposta
    try:
        # Procura por um array JSON na resposta
        json_match = response.strip()
        if not json_match.startswith("["):
            # Se não começar com '[', tenta encontrar o array no texto
            import re

            json_match = re.search(r"\[\s*\{.*\}\s*\]", response, re.DOTALL)
            if json_match:
                json_match = json_match.group(0)
            else:
                raise ValueError("Não foi possível extrair o JSON da resposta")

        flashcards = json.loads(json_match)
        return flashcards
    except Exception as e:
        # Em caso de erro, cria flashcards de exemplo
        print(f"Erro ao processar resposta do LLM: {str(e)}")
        return [
            {
                "question": f"Pergunta gerada {i+1} sobre o texto",
                "answer": f"Resposta gerada {i+1} para a pergunta",
            }
            for i in range(min(count, 3))
        ]


async def summarize_text(
    text: str, num_points: int = 5, temperature: float = 0.7
) -> List[str]:
    """
    Gera um resumo em tópicos a partir do texto

    Args:
        text: Texto a ser resumido
        num_points: Número de tópicos no resumo
        temperature: Temperatura para geração (0.0 a 1.0)

    Returns:
        Lista de strings com os tópicos do resumo
    """
    prompt = f"""
    Resuma o seguinte texto em {num_points} pontos principais.
    Cada ponto deve ser conciso e capturar uma ideia importante do texto.
    
    TEXTO:
    {text}
    
    FORMATO DA RESPOSTA:
    Retorne apenas uma lista numerada com os pontos principais, sem texto adicional.
    Exemplo:
    1. Primeiro ponto importante
    2. Segundo ponto importante
    ...
    """

    response = await query_llm(prompt, temperature=temperature)

    # Processa a resposta e extrai os pontos
    try:
        # Divide a resposta em linhas e filtra linhas numeradas
        import re

        points = []
        lines = response.strip().split("\n")

        for line in lines:
            # Procura por linhas que começam com números ou bullets
            match = re.match(r"^\s*(\d+\.|\*|\-)\s*(.*)", line)
            if match:
                point_text = match.group(2).strip()
                if point_text:
                    points.append(point_text)

        # Se não encontrou pontos no formato esperado, tenta dividir o texto
        if not points:
            # Remove quebras de linha extras e divide em sentenças
            response_clean = re.sub(r"\n+", " ", response).strip()
            sentences = re.split(r"(?<=[.!?])\s+", response_clean)
            points = [s for s in sentences if len(s) > 10]

        return points[:num_points]
    except Exception as e:
        # Em caso de erro, cria pontos de exemplo
        print(f"Erro ao processar resumo do LLM: {str(e)}")
        return [f"Ponto resumido {i+1} sobre o texto" for i in range(num_points)]


async def answer_question(
    question: str, context: Optional[str] = None, temperature: float = 0.7
) -> str:
    """
    Responde a uma pergunta, opcionalmente baseando-se em um contexto

    Args:
        question: Pergunta a ser respondida
        context: Contexto opcional (texto dos materiais) para basear a resposta
        temperature: Temperatura para geração (0.0 a 1.0)

    Returns:
        Texto da resposta
    """
    if context:
        prompt = f"""
        Use apenas as informações fornecidas no CONTEXTO abaixo para responder à PERGUNTA.
        Se a resposta não puder ser encontrada no contexto, diga "Não encontrei essa informação nos materiais disponíveis."
        
        CONTEXTO:
        {context}
        
        PERGUNTA:
        {question}
        
        RESPOSTA:
        """
    else:
        prompt = f"""
        Responda à seguinte pergunta de forma clara e concisa:
        
        PERGUNTA:
        {question}
        
        RESPOSTA:
        """

    return await query_llm(prompt, temperature=temperature)
