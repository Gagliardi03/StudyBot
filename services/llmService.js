// services/llmService.js - Serviço para integração com modelos de linguagem

// Configurações para integração com diferentes LLMs
const LLM_CONFIG = {
    // Configuração para Mistral 7B via Ollama (local)
    mistral: {
        baseUrl: 'http://localhost:11434/api', // URL padrão do Ollama
        modelName: 'mistral:7b',
        temperature: 0.7,
        maxTokens: 2048
    },
    // Configuração para Claude 3 Haiku via API da Anthropic
    claude: {
        baseUrl: 'https://api.anthropic.com/v1/messages',
        modelName: 'claude-3-haiku-20240307',
        temperature: 0.7,
        maxTokens: 2048
    }
};

// Escolha qual modelo usar (pode ser controlado por variável de ambiente ou configuração)
const ACTIVE_MODEL = 'mistral'; // ou 'claude'

/**
 * Envia uma pergunta para o LLM e obtém uma resposta
 * @param {string} question - A pergunta ou instrução a ser enviada ao LLM
 * @param {object} options - Opções adicionais (como temperatura, contexto, etc)
 * @returns {Promise<string>} - A resposta do LLM
 */
export async function askLLM(question, options = {}) {
    const config = LLM_CONFIG[ACTIVE_MODEL];

    try {
        if (ACTIVE_MODEL === 'mistral') {
            return await askMistral(question, { ...config, ...options });
        } else if (ACTIVE_MODEL === 'claude') {
            return await askClaude(question, { ...config, ...options });
        } else {
            throw new Error(`Modelo "${ACTIVE_MODEL}" não implementado`);
        }
    } catch (error) {
        console.error('Erro ao consultar o LLM:', error);
        throw error;
    }
}

/**
 * Envia uma pergunta para o Mistral via Ollama
 * @param {string} question - A pergunta ou instrução
 * @param {object} config - Configuração do modelo
 * @returns {Promise<string>} - A resposta do Mistral
 */
async function askMistral(question, config) {
    const response = await fetch(`${config.baseUrl}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: config.modelName,
            prompt: question,
            temperature: config.temperature,
            max_tokens: config.maxTokens
        })
    });

    if (!response.ok) {
        throw new Error(`Erro na requisição ao Ollama: ${response.status}`);
    }

    const data = await response.json();
    return data.response; // Ollama retorna a resposta diretamente
}

/**
 * Envia uma pergunta para o Claude via API da Anthropic
 * @param {string} question - A pergunta ou instrução
 * @param {object} config - Configuração do modelo
 * @returns {Promise<string>} - A resposta do Claude
 */
async function askClaude(question, config) {
    // Nota: Para usar Claude, é necessário obter uma chave de API da Anthropic
    const apiKey = process.env.ANTHROPIC_API_KEY || 'sua-chave-aqui';

    const response = await fetch(config.baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: config.modelName,
            messages: [
                { role: 'user', content: question }
            ],
            max_tokens: config.maxTokens,
            temperature: config.temperature
        })
    });

    if (!response.ok) {
        throw new Error(`Erro na requisição à API da Anthropic: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text; // API da Anthropic retorna a resposta nesse formato
}

/**
 * Gera flashcards a partir de notas de estudo
 * @param {string} notes - Notas de estudo
 * @param {number} numCards - Número de flashcards a gerar (opcional)
 * @returns {Promise<Array>} - Array de objetos de flashcards (pergunta/resposta)
 */
export async function generateFlashcards(notes, numCards = 5) {
    const prompt = `
      Gere ${numCards} flashcards educativos a partir das seguintes notas de estudo.
      Cada flashcard deve ter uma pergunta clara e uma resposta concisa.
      Foque nos conceitos mais importantes.
      
      NOTAS:
      ${notes}
      
      FORMATO DA RESPOSTA:
      Retorne apenas um array JSON no formato:
      [
        {"question": "Pergunta 1?", "answer": "Resposta 1"},
        {"question": "Pergunta 2?", "answer": "Resposta 2"}
      ]
    `;

    try {
        const response = await askLLM(prompt);
        // Extrai o array JSON da resposta
        const jsonStr = response.match(/\[\s*\{.*\}\s*\]/s)?.[0] || '[]';
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Erro ao gerar flashcards:', error);
        throw error;
    }
}

/**
 * Resumo de material de estudo
 * @param {string} content - Conteúdo a ser resumido
 * @param {number} numPoints - Número de tópicos no resumo (opcional)
 * @returns {Promise<string>} - Resumo em formato de tópicos
 */
export async function summarizeMaterial(content, numPoints = 5) {
    const prompt = `
      Resuma o seguinte conteúdo em ${numPoints} pontos-chave.
      Cada ponto deve ser conciso e capturar uma ideia importante.
      
      CONTEÚDO:
      ${content}
      
      FORMATO DA RESPOSTA:
      Retorne apenas os pontos numerados, sem texto adicional.
    `;

    try {
        return await askLLM(prompt);
    } catch (error) {
        console.error('Erro ao resumir material:', error);
        throw error;
    }
}

/**
 * Processa e responde a perguntas baseadas em materiais de estudo
 * @param {string} question - Pergunta do usuário
 * @param {Array<string>} materials - Array de conteúdos dos materiais relevantes
 * @returns {Promise<string>} - Resposta baseada nos materiais fornecidos
 */
export async function answerFromMaterials(question, materials) {
    // Concatena os materiais como contexto
    const context = materials.join('\n\n==========\n\n');

    const prompt = `
      Use apenas as informações fornecidas no CONTEXTO abaixo para responder à PERGUNTA.
      Se a resposta não puder ser encontrada no contexto, diga "Não encontrei essa informação nos materiais disponíveis."
      
      CONTEXTO:
      ${context}
      
      PERGUNTA:
      ${question}
      
      RESPOSTA:
    `;

    try {
        return await askLLM(prompt);
    } catch (error) {
        console.error('Erro ao responder com base nos materiais:', error);
        throw error;
    }
}

export default {
    askLLM,
    generateFlashcards,
    summarizeMaterial,
    answerFromMaterials
};