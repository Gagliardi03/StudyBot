// FlashcardCreator.js - Componente para criação e exibição de flashcards
import React, { useState, useEffect } from 'react';
import './FlashcardCreator.css';
import { BookOpen, Plus, Edit, Trash2, Check, X } from 'lucide-react';

function FlashcardCreator() {
    const [flashcards, setFlashcards] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [notes, setNotes] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [flipped, setFlipped] = useState(null);

    // Função para simular a geração automática de flashcards
    // Na implementação real, isso seria feito pelo LLM
    const generateFlashcardsFromNotes = () => {
        if (!notes.trim()) return;

        // Simula processamento de notas pelo LLM
        // Em produção, você enviaria as notas para seu backend com FastAPI
        const generatedCards = [
            {
                id: Date.now(),
                question: "O que é um modelo de linguagem?",
                answer: "Um modelo computacional treinado para entender e gerar texto em linguagem natural."
            },
            {
                id: Date.now() + 1,
                question: "Qual a diferença entre Mistral e Claude?",
                answer: "Mistral é um modelo open-source que pode rodar localmente, enquanto Claude é um modelo proprietário da Anthropic acessado via API."
            }
        ];

        setFlashcards([...flashcards, ...generatedCards]);
        setNotes('');
    };

    // Adicionar ou atualizar flashcard
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!question.trim() || !answer.trim()) return;

        if (editingId !== null) {
            // Atualiza flashcard existente
            setFlashcards(flashcards.map(card =>
                card.id === editingId ? { ...card, question, answer } : card
            ));
            setEditingId(null);
        } else {
            // Adiciona novo flashcard
            const newCard = {
                id: Date.now(),
                question,
                answer
            };
            setFlashcards([...flashcards, newCard]);
        }

        // Limpa o formulário
        setQuestion('');
        setAnswer('');
        setShowForm(false);
    };

    // Editar flashcard
    const handleEdit = (card) => {
        setQuestion(card.question);
        setAnswer(card.answer);
        setEditingId(card.id);
        setShowForm(true);
    };

    // Excluir flashcard
    const handleDelete = (id) => {
        setFlashcards(flashcards.filter(card => card.id !== id));
    };

    // Virar flashcard
    const toggleFlip = (id) => {
        setFlipped(flipped === id ? null : id);
    };

    return (
        <div className="flashcard-container">
            <div className="flashcard-header">
                <div className="header-title">
                    <BookOpen className="header-icon" />
                    <h2>Flashcards</h2>
                </div>
                <button
                    className="create-button"
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setQuestion('');
                        setAnswer('');
                    }}
                >
                    <Plus size={20} />
                    <span>Criar Flashcard</span>
                </button>
            </div>

            {showForm && (
                <form className="flashcard-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="question">Pergunta:</label>
                        <input
                            type="text"
                            id="question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Escreva a pergunta"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="answer">Resposta:</label>
                        <textarea
                            id="answer"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Escreva a resposta"
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="cancel-button" onClick={() => setShowForm(false)}>
                            <X size={16} />
                            <span>Cancelar</span>
                        </button>
                        <button type="submit" className="submit-button">
                            <Check size={16} />
                            <span>{editingId !== null ? 'Atualizar' : 'Criar'}</span>
                        </button>
                    </div>
                </form>
            )}

            <div className="notes-section">
                <h3>Gerar flashcards a partir de anotações</h3>
                <textarea
                    className="notes-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Cole suas anotações aqui para gerar flashcards automaticamente..."
                />
                <button
                    className="generate-button"
                    onClick={generateFlashcardsFromNotes}
                    disabled={!notes.trim()}
                >
                    Gerar Flashcards
                </button>
            </div>

            <div className="flashcards-grid">
                {flashcards.length === 0 ? (
                    <div className="empty-state">
                        <p>Você ainda não tem flashcards. Crie manualmente ou gere a partir de suas anotações!</p>
                    </div>
                ) : (
                    flashcards.map(card => (
                        <div
                            key={card.id}
                            className={`flashcard ${flipped === card.id ? 'flipped' : ''}`}
                            onClick={() => toggleFlip(card.id)}
                        >
                            <div className="flashcard-inner">
                                <div className="flashcard-front">
                                    <p>{card.question}</p>
                                </div>
                                <div className="flashcard-back">
                                    <p>{card.answer}</p>
                                </div>
                            </div>
                            <div className="card-actions">
                                <button
                                    className="edit-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(card);
                                    }}
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(card.id);
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default FlashcardCreator;