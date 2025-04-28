// StudyMaterials.js - Componente para gerenciar materiais de estudo
import React, { useState, useEffect } from 'react';
import './StudyMaterials.css';
import { File, FileText, FilePlus, Trash2, Search, BookOpen } from 'lucide-react';

function StudyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Simula dados iniciais de materiais
  useEffect(() => {
    // Em produção, isso seria carregado do Firebase
    const demoMaterials = [
      {
        id: '1',
        name: 'Introdução às Redes Neurais.pdf',
        type: 'pdf',
        size: '2.4 MB',
        uploadDate: new Date('2025-04-20'),
        thumbnail: null
      },
      {
        id: '2',
        name: 'Resumo de Algoritmos.txt',
        type: 'txt',
        size: '156 KB',
        uploadDate: new Date('2025-04-22'),
        thumbnail: null
      },
      {
        id: '3',
        name: 'Slides Aula 5 - Processamento de Linguagem Natural.pptx',
        type: 'pptx',
        size: '4.7 MB',
        uploadDate: new Date('2025-04-25'),
        thumbnail: null
      }
    ];

    setMaterials(demoMaterials);
  }, []);

  // Filtra materiais por busca
  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simula upload de arquivo
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    // Simula progresso de upload
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        // Adiciona novos arquivos à lista
        const newMaterials = files.map(file => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          name: file.name,
          type: file.name.split('.').pop().toLowerCase(),
          size: (file.size / 1024).toFixed(1) + ' KB',
          uploadDate: new Date(),
          thumbnail: null
        }));

        setMaterials([...materials, ...newMaterials]);
        setIsUploading(false);
        setUploadProgress(0);
      }
    }, 300);
  };

  // Remove material
  const handleDelete = (id) => {
    setMaterials(materials.filter(material => material.id !== id));
    if (selectedMaterial && selectedMaterial.id === id) {
      setSelectedMaterial(null);
    }
  };

  // Seleciona material para visualização
  const handleSelect = (material) => {
    setSelectedMaterial(material);
  };

  // Ícone baseado no tipo de arquivo
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText color="#FF5252" />;
      case 'txt':
        return <File color="#4C6EF5" />;
      case 'doc':
      case 'docx':
        return <FileText color="#2196F3" />;
      case 'ppt':
      case 'pptx':
        return <FileText color="#FF9800" />;
      case 'xls':
      case 'xlsx':
        return <FileText color="#4CAF50" />;
      default:
        return <File color="#757575" />;
    }
  };

  // Formata data de upload
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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
          <label className="upload-button">
            <FilePlus />
            <span>Adicionar</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

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
          {filteredMaterials.length === 0 ? (
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
                  {getFileIcon(material.type)}
                </div>
                <div className="material-info">
                  <h3 className="material-name">{material.name}</h3>
                  <div className="material-meta">
                    <span className="material-size">{material.size}</span>
                    <span className="material-date">{formatDate(material.uploadDate)}</span>
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
          {selectedMaterial ? (
            <div className="preview-content">
              <h3>{selectedMaterial.name}</h3>
              {selectedMaterial.type === 'pdf' ? (
                <div className="pdf-preview">
                  <p>Visualização de PDF não disponível neste protótipo.</p>
                  <p>Em uma implementação completa, aqui seria exibido o conteúdo do PDF.</p>
                </div>
              ) : (
                <div className="text-preview">
                  <p>Visualização de conteúdo não disponível neste protótipo.</p>
                  <p>Em uma implementação completa, aqui seria exibido o conteúdo do arquivo.</p>
                </div>
              )}
              <div className="preview-actions">
                <button className="action-button summarize">
                  <span>Resumir conteúdo</span>
                </button>
                <button className="action-button flashcards">
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