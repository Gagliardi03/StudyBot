from typing import List, Dict, Any, Optional, Union
import json
from app.core.config import settings

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.summarize import load_summarize_chain
import google.generativeai as genai


class GeminiService:
    """
    Serviço para interação com o modelo Gemini via LangChain
    """

    def __init__(self, api_key: str = None):
        """
        Inicializa o serviço Gemini

        Args:
            api_key: Chave de API do Google (opcional se configurada em settings)
        """
        self.api_key = api_key or settings.GOOGLE_API_KEY

        # Configura a API do Google
        genai.configure(api_key=self.api_key)

        # Inicializa o modelo LangChain
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.0-pro",  # Modelo atualizado
            google_api_key="SUA_CHAVE_API",
            temperature=0.7,
        )

    async def generate_response(self, prompt: str, temperature: float = 0.7) -> str:
        """
        Gera uma resposta simples usando o Gemini

        Args:
            prompt: Texto para gerar a resposta
            temperature: Temperatura para geração (0.0 a 1.0)

        Returns:
            Texto da resposta gerada
        """
        try:
            # Cria um template de prompt simples
            prompt_template = PromptTemplate.from_template("{input}")

            # Configura a chain
            chain = LLMChain(
                llm=self.llm, prompt=prompt_template, verbose=settings.DEBUG
            )

            # Executa a chain
            response = await chain.ainvoke({"input": prompt})
            return response["text"].strip()

        except Exception as e:
            print(f"Erro ao gerar resposta com Gemini: {str(e)}")
            return f"[Resposta simulada devido a erro na API: {str(e)}]"

    async def generate_flashcards(
        self, text: str, count: int = 5
    ) -> List[Dict[str, str]]:
        """
        Gera flashcards a partir de texto usando o Gemini

        Args:
            text: Texto das notas para gerar flashcards
            count: Número de flashcards a gerar

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

        try:
            response = await self.generate_response(prompt)

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
                print(f"Erro ao processar resposta do Gemini: {str(e)}")
                return [
                    {
                        "question": f"Pergunta gerada {i+1} sobre o texto",
                        "answer": f"Resposta gerada {i+1} para a pergunta",
                    }
                    for i in range(min(count, 3))
                ]

        except Exception as e:
            print(f"Erro ao gerar flashcards com Gemini: {str(e)}")
            return [
                {
                    "question": f"Erro ao gerar flashcard {i+1}",
                    "answer": f"Houve um erro na API: {str(e)}",
                }
                for i in range(min(count, 3))
            ]

    async def summarize_document(self, text: str, num_points: int = 5) -> List[str]:
        """
        Gera um resumo em tópicos a partir do texto usando LangChain

        Args:
            text: Texto a ser resumido
            num_points: Número de tópicos no resumo

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

        try:
            response = await self.generate_response(prompt)

            # Processa a resposta e extrai os pontos
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
            print(f"Erro ao resumir com Gemini: {str(e)}")
            return [
                f"Ponto resumido {i+1} sobre o texto (erro: {str(e)})"
                for i in range(num_points)
            ]

    async def summarize_large_document(
        self, text: str, num_points: int = 5
    ) -> List[str]:
        """
        Gera um resumo em tópicos para documentos grandes usando chain de resumo do LangChain

        Args:
            text: Texto a ser resumido
            num_points: Número de tópicos no resumo

        Returns:
            Lista de strings com os tópicos do resumo
        """
        try:
            # Divide o texto em partes menores
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=8000, chunk_overlap=1000
            )

            docs = [
                Document(page_content=chunk) for chunk in text_splitter.split_text(text)
            ]

            if not docs:
                return [f"Não foi possível processar o documento para resumo"]

            # Se houver apenas um chunk, use a função regular
            if len(docs) == 1:
                return await self.summarize_document(text, num_points)

            # Para documentos grandes, use a chain de resumo do LangChain
            chain = load_summarize_chain(
                self.llm, chain_type="map_reduce", verbose=settings.DEBUG
            )

            # Execute a chain de forma assíncrona (convert para sync temporariamente)
            # Obs: LangChain ainda não tem boa suporte para async em todas as chains
            import asyncio

            summary = await asyncio.to_thread(chain.run, docs)

            # Converter o resumo em pontos
            return await self.summarize_document(summary, num_points)

        except Exception as e:
            print(f"Erro ao resumir documento grande: {str(e)}")
            return [f"Erro ao resumir documento grande: {str(e)}"]

    async def answer_question(
        self, question: str, context: Optional[str] = None
    ) -> str:
        """
        Responde a uma pergunta, opcionalmente baseando-se em um contexto

        Args:
            question: Pergunta a ser respondida
            context: Contexto opcional (texto dos materiais) para basear a resposta

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

        return await self.generate_response(prompt)


# Cria uma instância do serviço para uso em toda a aplicação
gemini_service = GeminiService()
