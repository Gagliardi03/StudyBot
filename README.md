# StudyBot - Backend API

Backend da aplicação StudyBot, um assistente pessoal para estudos que utiliza modelos de linguagem para processar materiais de estudo e gerar flashcards automaticamente.

## Tecnologias Utilizadas

- **Framework**: FastAPI (Python)
- **LLM**: Mistral 7B via Ollama (local) ou Claude 3 Haiku (API)
- **Banco de Dados**: Firebase Firestore
- **Autenticação**: Firebase Auth
- **Processamento de Documentos**: PyPDF2, Python-docx

## Estrutura do Projeto

```
backend/
│
├── app/
│   ├── __init__.py             # Inicializa o pacote Python
│   ├── main.py                 # Ponto de entrada da aplicação FastAPI
│   │
│   ├── api/                    # Contém endpoints agrupados
│   │   ├── __init__.py
│   │   ├── routes/             # Rotas da API
│   │   │   ├── __init__.py
│   │   │   ├── chat.py         # Endpoints para o chat
│   │   │   ├── flashcards.py   # Endpoints para flashcards
│   │   │   └── materials.py    # Endpoints para materiais de estudo
│   │   │
│   │   └── dependencies.py     # Dependências compartilhadas
│   │
│   ├── core/                   # Configurações centrais
│   │   ├── __init__.py
│   │   ├── config.py           # Configurações da aplicação
│   │   └── security.py         # Funções de autenticação/segurança
│   │
│   ├── models/                 # Definições de dados
│   │   ├── __init__.py
│   │   ├── flashcard.py        # Modelo de dados para flashcards
│   │   └── material.py         # Modelo de dados para materiais
│   │
│   ├── schemas/                # Esquemas Pydantic
│   │   ├── __init__.py
│   │   ├── flashcard.py        # Esquemas para flashcards
│   │   └── material.py         # Esquemas para materiais
│   │
│   └── services/               # Lógica de negócios
│       ├── __init__.py
│       ├── llm_service.py      # Integração com o LLM
│       ├── firebase_service.py # Integração com Firebase
│       └── pdf_service.py      # Processamento de PDFs
│
├── tests/                      # Testes
│   ├── __init__.py
│   ├── test_chat.py
│   ├── test_flashcards.py
│   └── test_materials.py
│
├── .env                        # Variáveis de ambiente (não versionado)
├── .env.example                # Exemplo de variáveis de ambiente
├── requirements.txt            # Dependências Python
└── README.md                   # Este arquivo
```

## Funcionalidades da API

### Chat

- **POST /api/chat/message**: Envia uma mensagem para o assistente
- **GET /api/chat/history/{user_id}**: Obtém o histórico de chat
- **DELETE /api/chat/history/{user_id}**: Limpa o histórico de chat

### Flashcards

- **POST /api/flashcards/generate**: Gera flashcards a partir de texto
- **POST /api/flashcards**: Cria um novo flashcard
- **GET /api/flashcards**: Lista flashcards do usuário
- **PUT /api/flashcards/{id}**: Atualiza um flashcard
- **DELETE /api/flashcards/{id}**: Remove um flashcard

### Materiais de Estudo

- **POST /api/materials/upload**: Faz upload de um arquivo
- **GET /api/materials**: Lista materiais do usuário
- **GET /api/materials/{id}**: Obtém detalhes de um material
- **POST /api/materials/{id}/summarize**: Gera resumo de um material
- **DELETE /api/materials/{id}**: Remove um material

## Configuração do Ambiente

### Pré-requisitos

- Python 3.8+
- [Opcional] Ollama instalado para execução do modelo Mistral 7B localmente
- Uma conta no Firebase para utilização do Firestore

### Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/studybot.git
   cd studybot/backend
   ```

2. Crie um ambiente virtual
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   venv\Scripts\activate     # Windows
   ```

3. Instale as dependências
   ```bash
   pip install -r requirements.txt
   ```

4. Configure as variáveis de ambiente
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

### Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Adicione o Firestore e Authentication ao seu projeto
3. Gere uma chave de conta de serviço (Project Settings > Service Accounts)
4. Salve o arquivo de chave como `firebase-key.json` na pasta `app/core/`

### Configuração do LLM

#### Para Mistral (local)

1. Instale o Ollama em sua máquina
   ```bash
   # Linux (exemplo)
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. Baixe o modelo Mistral
   ```bash
   ollama pull mistral:7b
   ```

3. Configure o `.env` para usar Mistral
   ```
   LLM_MODEL=mistral
   MISTRAL_API_URL=http://localhost:11434/api
   ```

#### Para Claude (API)

1. Obtenha uma chave de API da Anthropic
2. Configure o `.env` para usar Claude
   ```
   LLM_MODEL=claude
   ANTHROPIC_API_KEY=your_api_key_here
   ```

## Executando a API

### Desenvolvimento

```bash
cd backend
uvicorn app.main:app --reload
```

A API estará disponível em: http://localhost:8000

### Documentação da API

Acesse a documentação automática da API em: http://localhost:8000/docs

## Testes

```bash
pytest
```

## Implantação em Produção

Para ambientes de produção, considere:

1. Usar Gunicorn como servidor WSGI
   ```bash
   gunicorn -k uvicorn.workers.UvicornWorker app.main:app
   ```

2. Configurar um serviço systemd (Linux) ou um contêiner Docker
3. Usar um proxy reverso como Nginx ou Traefik
4. Ativar HTTPS com certificados válidos

## Contribuição

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.