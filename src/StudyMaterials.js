// StudyMaterials.js - Componente para gerenciar materiais de estudo (atualizado com integração à API)
import React, { useState, useEffect } from 'react';
import './StudyMaterials.css';
import { File, FileText, FilePlus, Trash2, Search, BookOpen, FileType, X, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getMaterials,
  getMaterial,
  uploadMaterial,
  deleteMaterial,
  summarizeMaterial,
  generateFlashcardsFromMaterial
} from './services/api';

function StudyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [materialDetail, setMaterialDetail] = useState(null);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini'); // gemini, mistral ou claude
  const [showModelSelector, setShowModelSelector] = useState(false);

  const navigate = useNavigate();

  // Carrega a lista de materiais
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setIsLoading(true);
        const data = await getMaterials();
        setMaterials(data);
      } catch (error) {
        console.error("Erro ao carregar materiais:", error);
        setError("Não foi possível carregar seus materiais. Por favor, tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMaterials();
  }, []);

  // Filtra materiais por busca
  const filteredMaterials = materials.filter(material =>
    material.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Carrega detalhes do material quando um é selecionado
  useEffect(() => {
    const loadMaterialDetail = async () => {
      if (!selectedMaterial) {
        setMaterialDetail(null);
        setSummary(null);
        return;
      }

      try {
        setIsLoading(true);
        const detail = await getMaterial(selectedMaterial.id, true);
        setMaterialDetail(detail);
      } catch (error) {
        console.error("Erro ao carregar detalhes do material:", error);
        setError("Erro ao carregar detalhes do material selecionado.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMaterialDetail();
  }, [selectedMaterial]);

  // Upload de arquivo
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Processa cada arquivo
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Simula progresso durante o upload
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = prev + 5;
            if (newProgress >= 90) {
              clearInterval(interval);
            }
            return newProgress < 90 ? newProgress : 90;
          });
        }, 300);

        // Faz o upload real
        const uploadedMaterial = await uploadMaterial(file);
        clearInterval(interval);
        setUploadProgress(100);

        // Atualiza a lista de materiais
        setMaterials(prev => [...prev, uploadedMaterial]);

        // Seleciona o material recém-upado
        setSelectedMaterial(uploadedMaterial);

        // Reset após um tempo
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 1000);
      } catch (error) {
        console.error("Erro no upload:", error);
        setError(`Erro ao fazer upload de ${file.name}. Tente novamente.`);
        setUploadProgress(0);
        setIsUploading(false);
      }
    }
  };

  // Remove material
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este material?")) return;

    try {
      await deleteMaterial(id);
      setMaterials(materials.filter(material => material.id !== id));
      if (selectedMaterial && selectedMaterial.id === id) {
        setSelectedMaterial(null);
      }
    } catch (error) {
      console.error("Erro ao excluir material:", error);
      setError("Erro ao excluir o material. Tente novamente.");
    }
  };

  // Seleciona material para visualização
  const handleSelect = (material) => {
    setSelectedMaterial(material);
    setSummary(null); // Limpa o resumo ao trocar de material
  };

  // Gera resumo do material
  const handleSummarize = async () => {
    if (!selectedMaterial) return;

    try {
      setIsSummarizing(true);
      const result = await summarizeMaterial(selectedMaterial.id, 5, selectedModel);
      setSummary(result.summary);
    } catch (error) {
      console.error("Erro ao resumir material:", error);
      setError("Não foi possível gerar o resumo. Tente novamente mais tarde.");
    } finally {
      setIsSummarizing(false);
    }
  };

  // Gera flashcards a partir do material
  const handleGenerateFlashcards = async () => {
    if (!selectedMaterial) return;

    try {
      await generateFlashcardsFromMaterial(selectedMaterial.id, 5, selectedModel);
      // Redireciona para a página de flashcards
      navigate('/flashcards');
    } catch (error) {
      console.error("Erro ao gerar flashcards:", error);
      setError("Não foi possível gerar flashcards. Tente novamente mais tarde.");
    }
  };

  // Ícone baseado no tipo de arquivo
  const getFileIcon = (type) => {
    const fileType = type ? type.toLowerCase() : '';

    if (fileType.includes('pdf')) {
      return <FileText color="#FF5252" />;
    } else if (fileType.includes('text') || fileType.endsWith('txt')) {
      return <File color="#4C6EF5" />;
    } else if (fileType.includes('word') || fileType.endsWith('doc') || fileType.endsWith('docx')) {
      return <FileText color="#2196F3" />;
    } else if (fileType.includes('presentation') || fileType.endsWith('ppt') || fileType.endsWith('pptx')) {
      return <FileText color="#FF9800" />;
    } else if (fileType.includes('sheet') || fileType.endsWith('xls') || fileType.endsWith('xlsx')) {
      return <FileText color="#4CAF50" />;
    } else {
      return <File color="#757575" />;
    }
  };

  // Formata data de upload
  const formatDate = (dateString) => {
    if (!dateString) return 'Data desconhecida';

    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formata tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Exibe uma mensagem de erro temporária
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="materials-container">
      <div className="materials-header">
        <div className="header-title">
          <BookOpen className="header-icon" />
          <h2>Materiais de Estudo</h2>
        </div>
        <div className="header-actions">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Buscar materiais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

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

          <label className="upload-button">
            <FilePlus />
            <span>Adicionar</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              accept=".pdf,.docx,.doc,.txt,.pptx,.ppt,.md"
            />
          </label>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="error-notification">
          <p>{error}</p>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span>{uploadProgress}% completo</span>
        </div>
      )}

      <div className="materials-content">
        <div className="materials-list">
          {isLoading && materials.length === 0 ? (
            <div className="loading-container">
              <Loader className="spinner" />
              <p>Carregando materiais...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="empty-list">
              <p>Nenhum material encontrado. Faça upload de PDFs, documentos ou anotações.</p>
            </div>
          ) : (
            filteredMaterials.map(material => (
              <div
                key={material.id}
                className={`material-item ${selectedMaterial && selectedMaterial.id === material.id ? 'selected' : ''}`}
                onClick={() => handleSelect(material)}
              >
                <div className="material-icon">
                  {getFileIcon(material.content_type)}
                </div>
                <div className="material-info">
                  <h3 className="material-name">{material.title}</h3>
                  <div className="material-meta">
                    <span className="material-size">{formatFileSize(material.size)}</span>
                    <span className="material-date">{formatDate(material.uploaded_at)}</span>
                  </div>
                </div>
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(material.id);
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="material-preview">
          {isLoading && selectedMaterial ? (
            <div className="loading-container">
              <Loader className="spinner" />
              <p>Carregando detalhes...</p>
            </div>
          ) : selectedMaterial ? (
            <div className="preview-content">
              <h3>{materialDetail?.title || selectedMaterial.title}</h3>

              {isSummarizing ? (
                <div className="summary-loading">
                  <Loader className="spinner" />
                  <p>Gerando resumo com {selectedModel}...</p>
                </div>
              ) : summary ? (
                <div className="summary-container">
                  <h4>Resumo gerado por {selectedModel}:</h4>
                  <ul className="summary-points">
                    {summary.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <>
                  {materialDetail?.text_content ? (
                    <div className="text-preview">
                      <p className="preview-text">{materialDetail.text_content.substring(0, 500)}...</p>
                      <p className="content-notice">Conteúdo truncado para visualização. O texto completo está disponível para análise.</p>
                    </div>
                  ) : materialDetail?.text_preview ? (
                    <div className="text-preview">
                      <p className="preview-text">{materialDetail.text_preview}</p>
                    </div>
                  ) : (
                    <div className="file-preview">
                      <FileType size={48} />
                      <p>Visualização não disponível para este tipo de arquivo.</p>
                      <p>Você ainda pode gerar resumos e flashcards a partir do conteúdo.</p>
                    </div>
                  )}
                </>
              )}

              <div className="preview-actions">
                <button
                  className="action-button summarize"
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                >
                  <span>{summary ? "Gerar novo resumo" : "Resumir conteúdo"}</span>
                </button>
                <button
                  className="action-button flashcards"
                  onClick={handleGenerateFlashcards}
                >
                  <span>Gerar flashcards</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="no-preview">
              <p>Selecione um material para visualizar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudyMaterials;