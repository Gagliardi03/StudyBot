// App.js - Componente principal do Assistente de Estudos
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Send, FileUp, Book, Brain, BookOpen } from 'lucide-react';

function App() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Olá! Sou seu assistente de estudos. Como posso te ajudar hoje?",
            sender: "bot",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const messagesEndRef = useRef(null);

    // Função para lidar com o envio da mensagem
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() === '') return;

        // Adiciona mensagem do usuário ao chat
        const userMessage = {
            id: messages.length + 1,
            text: input,
            sender: "user",
            timestamp: new Date()
        };

        setMessages([...messages, userMessage]);
        setInput('');
        setLoading(true);

        // Simula resposta do backend (LLM)
        // Na implementação real, você faria uma chamada API para seu backend FastAPI
        setTimeout(() => {
            const botResponse = {
                id: messages.length + 2,
                text: "Esta é uma resposta de demonstração. Aqui seria processada sua pergunta pelo LLM (Mistral ou Claude).",
                sender: "bot",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
            setLoading(false);
        }, 1500);
    };

    // Função para lidar com upload de arquivos
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploadedFiles(prev => [...prev, ...files]);

        // Mensagem de confirmação
        const confirmationMsg = {
            id: messages.length + 1,
            text: `Arquivo(s) carregado(s): ${files.map(f => f.name).join(', ')}`,
            sender: "bot",
            timestamp: new Date()
        };
        setMessages([...messages, confirmationMsg]);
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
                    <button className="header-button">
                        <Brain />
                        <span>Flashcards</span>
                    </button>
                    <button className="header-button">
                        <Book />
                        <span>Materiais</span>
                    </button>
                </div>
            </header>

            <main className="chat-container">
                <div className="messages">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message ${msg.sender === "bot" ? "bot-message" : "user-message"}`}
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
                        />
                    </label>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Faça uma pergunta ou envie suas anotações..."
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