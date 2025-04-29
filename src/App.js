// App.js - Componente principal do Assistente de Estudos (atualizado com integração à API)
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Send, FileUp, Brain, BookOpen, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage, getChatHistory, clearChatHistory, uploadMaterial } from './services/api';

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedModel, setSelectedModel] = useState('gemini'); // gemini, mistral ou claude
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [showModelSelector, setShowModelSelector] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Carrega histórico de mensagens ao iniciar
    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                setLoading(true);
                const history = await getChatHistory();

                if (history && history.length > 0) {
                    setMessages(history.map(msg => ({
                        id: msg.id,
                        text: msg.content,
                        sender: msg.sender,
                        timestamp: new Date(msg.timestamp)
                    })));
                } else {
                    // Se não houver histórico, adiciona mensagem de boas-vindas
                    setMessages([{
                        id: Date.now(),
                        text: "Olá! Sou seu assistente de estudos. Como posso te ajudar hoje?",
                        sender: "assistant",
                        timestamp: new Date()
                    }]);
                }
            } catch (error) {
                console.error("Erro ao carregar histórico:", error);
                // Mensagem de erro amigável
                setMessages([{
                    id: Date.now(),
                    text: "Olá! Sou seu assistente de estudos. Como posso te ajudar hoje?",
                    sender: "assistant",
                    timestamp: new Date()
                }]);
            } finally {
                setLoading(false);
            }
        };

        loadChatHistory();
    }, []);

    // Função para lidar com o envio da mensagem
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() === '') return;

        // Adiciona mensagem do usuário ao chat
        const userMessage = {
            id: Date.now(),
            text: input,
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Envia mensagem para a API
            const contextId = selectedMaterial ? selectedMaterial.id : null;
            const response = await sendChatMessage(input, contextId, selectedModel);

            const botResponse = {
                id: response.id || Date.now() + 1,
                text: response.content,
                sender: "assistant",
                timestamp: new Date(response.timestamp || Date.now())
            };

            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            // Adiciona mensagem de erro
            const errorMessage = {
                id: Date.now() + 1,
                text: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
                sender: "assistant",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    // Função para lidar com upload de arquivos
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setLoading(true);

        for (const file of files) {
            try {
                // Informa o usuário sobre o upload
                const uploadingMsg = {
                    id: Date.now() + Math.random(),
                    text: `Carregando arquivo: ${file.name}...`,
                    sender: "assistant",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, uploadingMsg]);

                // Envia o arquivo para a API
                const result = await uploadMaterial(file);

                // Atualiza a lista de arquivos carregados
                setUploadedFiles(prev => [...prev, result]);

                // Confirma ao usuário
                const confirmationMsg = {
                    id: Date.now() + Math.random(),
                    text: `Arquivo '${result.title}' carregado com sucesso! Você já pode fazer perguntas sobre ele.`,
                    sender: "assistant",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, confirmationMsg]);

                // Seleciona automaticamente este material como contexto
                setSelectedMaterial(result);

            } catch (error) {
                console.error("Erro ao fazer upload:", error);
                // Adiciona mensagem de erro
                const errorMessage = {
                    id: Date.now() + Math.random(),
                    text: `Erro ao carregar arquivo ${file.name}. Por favor, tente novamente.`,
                    sender: "assistant",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        }

        setLoading(false);
    };

    // Limpa o histórico de chat
    const handleClearChat = async () => {
        if (window.confirm("Tem certeza que deseja limpar todo o histórico de conversa?")) {
            try {
                await clearChatHistory();
                setMessages([{
                    id: Date.now(),
                    text: "Histórico limpo. Como posso ajudar?",
                    sender: "assistant",
                    timestamp: new Date()
                }]);
                setSelectedMaterial(null);
            } catch (error) {
                console.error("Erro ao limpar histórico:", error);
            }
        }
    };

    // Navega para a página de materiais ou flashcards
    const navigateTo = (path) => {
        navigate(path);
    };

    // Scroll automático para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="logo">
                    <BookOpen className="logo-icon" />
                    <h1>StudyBot</h1>
                </div>
                <div className="header-actions">
                    <button className="header-button" onClick={() => navigateTo('/flashcards')}>
                        <Brain />
                        <span>Flashcards</span>
                    </button>
                    <button className="header-button" onClick={() => navigateTo('/materials')}>
                        <BookOpen />
                        <span>Materiais</span>
                    </button>
                    {/* Seletor de Modelo */}
                    <div className="model-selector">
                        <button
                            className="header-button model-button"
                            onClick={() => setShowModelSelector(!showModelSelector)}
                        >
                            <span>LLM: {selectedModel}</span>
                        </button>
                        {showModelSelector && (
                            <div className="model-dropdown">
                                <button
                                    className={`model-option ${selectedModel === 'gemini' ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedModel('gemini');
                                        setShowModelSelector(false);
                                    }}
                                >
                                    Gemini
                                </button>
                                <button
                                    className={`model-option ${selectedModel === 'mistral' ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedModel('mistral');
                                        setShowModelSelector(false);
                                    }}
                                >
                                    Mistral
                                </button>
                                <button
                                    className={`model-option ${selectedModel === 'claude' ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedModel('claude');
                                        setShowModelSelector(false);
                                    }}
                                >
                                    Claude
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Botão de limpar chat */}
                    <button className="header-button clear-button" onClick={handleClearChat}>
                        <X size={18} />
                        <span>Limpar Chat</span>
                    </button>
                </div>
            </header>

            {/* Exibe material selecionado como contexto */}
            {selectedMaterial && (
                <div className="context-bar">
                    <div className="context-info">
                        <span>Contexto atual: {selectedMaterial.title}</span>
                    </div>
                    <button
                        className="context-close"
                        onClick={() => setSelectedMaterial(null)}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Lista de arquivos carregados */}
            {uploadedFiles.length > 0 && (
                <div className="uploaded-files-section">
                    <h4>Materiais carregados:</h4>
                    <ul>
                        {uploadedFiles.map((file) => (
                            <li key={file.id}>
                                <button
                                    onClick={() => setSelectedMaterial(file)}
                                    className={selectedMaterial?.id === file.id ? "active-file" : ""}
                                >
                                    {file.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <main className="chat-container">
                <div className="messages">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message ${msg.sender === "assistant" ? "bot-message" : "user-message"}`}
                        >
                            <div className="message-bubble">
                                {msg.text}
                            </div>
                            <div className="message-time">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message bot-message">
                            <div className="message-bubble typing">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="input-area">
                <form onSubmit={handleSendMessage} className="message-form">
                    <label className="file-upload">
                        <FileUp />
                        <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            accept=".pdf,.docx,.doc,.txt,.pptx,.ppt,.md"
                        />
                    </label>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={selectedMaterial
                            ? `Faça uma pergunta sobre ${selectedMaterial.title}...`
                            : "Faça uma pergunta ou envie suas anotações..."}
                        className="message-input"
                    />
                    <button type="submit" className="send-button" disabled={input.trim() === ''}>
                        <Send />
                    </button>
                </form>
            </footer>
        </div>
    );
}

export default App;