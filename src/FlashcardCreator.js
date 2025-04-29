// FlashcardCreator.js - Componente para criação e exibição de flashcards (atualizado com integração à API)
import React, { useState, useEffect } from 'react';
import './FlashcardCreator.css';
import { BookOpen, Plus, Edit, Trash2, Check, X, Loader, BookOpenCheck, Tag } from 'lucide-react';
import {
    getFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    generateFlashcardsFromText
} from './services/api';

function FlashcardCreator() {
    const [flashcards, setFlashcards] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [notes, setNotes] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [flipped, setFlipped] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [selectedModel, setSelectedModel] = useState('gemini'); // gemini, mistral ou claude
    const [showModelSelector, setShowModelSelector] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [tags, setTags] = useState([]);

    // Carrega flashcards ao iniciar
    useEffect(() => {
        const loadFlashcards = async () => {
            try {
                setIsLoading(true);
                const data = await getFlashcards(selectedTag);
                setFlashcards(data);

                // Extrai tags únicas de todos os flashcards
                const allTags = data.reduce((acc, card) => {
                    if (card.tags && Array.isArray(card.tags)) {
                        card.tags.forEach(tag => {
                            if (!acc.includes(tag)) {
                                acc.push(tag);
                            }
                        });
                    }
                    return acc;
                }, []);

                setTags(allTags);
            } catch (error) {
                console.error("Erro ao carregar flashcards:", error);
                setError("Não foi possível carregar seus flashcards. Por favor, tente novamente mais tarde.");
            } finally {
                setIsLoading(false);
            }
        };

        loadFlashcards();
    }, [selectedTag]);

    // Função para gerar flashcards a partir de notas
    const generateFlashcardsFromNotes = async () => {
        if (!notes.trim()) return;

        try {
            setIsGenerating(true);
            // Envia as notas para a API
            const generatedCards = await generateFlashcardsFromText(notes, 5, selectedModel);

            // Adiciona os novos flashcards à lista
            setFlashcards(prev => [...prev, ...generatedCards]);
            setNotes('');

            // Mostra mensagem de sucesso temporária
            setError({
                type: 'success',
                message: `${generatedCards.length} flashcards gerados com sucesso!`
            });
        } catch (error) {
            console.error("Erro ao gerar flashcards:", error);
            setError({
                type: 'error',
                message: "Erro ao gerar flashcards. Tente novamente."
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // Adicionar ou atualizar flashcard
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!question.trim() || !answer.trim()) return;

        try {
            if (editingId !== null) {
                // Atualiza flashcard existente
                const updatedCard = await updateFlashcard(editingId, {
                    question,
                    answer,
                    tags: [] // Você pode implementar tags na interface se desejar
                });

                setFlashcards(flashcards.map(card =>
                    card.id === editingId ? updatedCard : card
                ));

            } else {
                // Adiciona novo flashcard
                const newCard = await createFlashcard({
                    question,
                    answer,
                    tags: [] // Você pode implementar tags na interface se desejar
                });

                setFlashcards([...flashcards, newCard]);
            }

            // Limpa o formulário
            setQuestion('');
            setAnswer('');
            setEditingId(null);
            setShowForm(false);

            // Mensagem de sucesso
            setError({
                type: 'success',
                message: editingId !== null ? "Flashcard atualizado com sucesso!" : "Flashcard criado com sucesso!"
            });

        } catch (error) {
            console.error("Erro ao salvar flashcard:", error);
            setError({
                type: 'error',
                message: "Erro ao salvar flashcard. Tente novamente."
            });
        }
    };

    // Editar flashcard
    const handleEdit = (card) => {
        setQuestion(card.question);
        setAnswer(card.answer);
        setEditingId(card.id);
        setShowForm(true);
    };

    // Excluir flashcard
    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir este flashcard?")) return;

        try {
            await deleteFlashcard(id);
            setFlashcards(flashcards.filter(card => card.id !== id));

            // Mensagem de sucesso
            setError({
                type: 'success',
                message: "Flashcard excluído com sucesso!"
            });
        } catch (error) {
            console.error("Erro ao excluir flashcard:", error);
            setError({
                type: 'error',
                message: "Erro ao excluir flashcard. Tente novamente."
            });
        }
    };

    // Virar flashcard
    const toggleFlip = (id) => {
        setFlipped(flipped === id ? null : id);
    };

    // Filtra por tag
    const handleTagSelect = (tag) => {
        setSelectedTag(selectedTag === tag ? null : tag);
    };

    // Limpa erro após 5 segundos
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div className="flashcard-container">
            <div className="flashcard-header">
                <div className="header-title">
                    <BookOpen className="header-icon" />
                    <h2>Flashcards</h2>
                </div>
                <div className="header-actions">
                    {/* Seletor de Modelo LLM */}
                    <div className="model-selector">
                        <button
                            className="model-button"
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
            </div>

            {/* Mensagem de erro/sucesso */}
            {error && (
                <div className={`notification ${error.type === 'success' ? 'success' : 'error'}`}>
                    <p>{error.message}</p>
                    <button onClick={() => setError(null)}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
                <div className="tags-container">
                    <div className="tags-header">
                        <Tag size={16} />
                        <span>Filtrar por tags:</span>
                    </div>
                    <div className="tags-list">
                        {tags.map(tag => (
                            <button
                                key={tag}
                                className={`tag-button ${selectedTag === tag ? 'active' : ''}`}
                                onClick={() => handleTagSelect(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
                    disabled={!notes.trim() || isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <Loader size={16} className="spinner" />
                            <span>Gerando...</span>
                        </>
                    ) : (
                        <>
                            <BookOpenCheck size={16} />
                            <span>Gerar Flashcards</span>
                        </>
                    )}
                </button>
            </div>

            <div className="flashcards-grid">
                {isLoading ? (
                    <div className="loading-container">
                        <Loader className="spinner" />
                        <p>Carregando flashcards...</p>
                    </div>
                ) : flashcards.length === 0 ? (
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
                            {/* Exibe tags se houver */}
                            {card.tags && card.tags.length > 0 && (
                                <div className="card-tags">
                                    {card.tags.map((tag, index) => (
                                        <span key={index} className="card-tag">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default FlashcardCreator;