// src/services/api.js - Serviço para comunicação com o backend
import axios from 'axios';

// URL base da API - ajuste conforme seu ambiente
const API_URL = 'http://localhost:8000/api';

// Instância do axios configurada
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Adiciona o token de autenticação a todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ===== Serviços de Chat =====
export const sendChatMessage = async (message, contextMaterialId = null, model = null) => {
    try {
        const params = model ? { model } : {};
        const response = await api.post('/chat/message', {
            content: message,
            context_material_id: contextMaterialId
        }, { params });
        return response.data;
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        throw error;
    }
};

export const getChatHistory = async () => {
    try {
        const response = await api.get('/chat/history');
        return response.data.messages;
    } catch (error) {
        console.error('Erro ao obter histórico de chat:', error);
        throw error;
    }
};

export const clearChatHistory = async () => {
    try {
        const response = await api.delete('/chat/history');
        return response.data;
    } catch (error) {
        console.error('Erro ao limpar histórico de chat:', error);
        throw error;
    }
};

// ===== Serviços de Flashcards =====
export const getFlashcards = async (tag = null) => {
    try {
        const params = tag ? { tag } : {};
        const response = await api.get('/flashcards', { params });
        return response.data;
    } catch (error) {
        console.error('Erro ao obter flashcards:', error);
        throw error;
    }
};

export const createFlashcard = async (flashcardData) => {
    try {
        const response = await api.post('/flashcards', flashcardData);
        return response.data;
    } catch (error) {
        console.error('Erro ao criar flashcard:', error);
        throw error;
    }
};

export const updateFlashcard = async (id, flashcardData) => {
    try {
        const response = await api.put(`/flashcards/${id}`, flashcardData);
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar flashcard:', error);
        throw error;
    }
};

export const deleteFlashcard = async (id) => {
    try {
        const response = await api.delete(`/flashcards/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao excluir flashcard:', error);
        throw error;
    }
};

export const generateFlashcardsFromText = async (notes, count = 5, model = null) => {
    try {
        const params = model ? { count, model } : { count };
        const response = await api.post('/flashcards/generate', notes, {
            headers: { 'Content-Type': 'text/plain' },
            params
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao gerar flashcards do texto:', error);
        throw error;
    }
};

export const generateFlashcardsFromMaterial = async (materialId, count = 5, model = null) => {
    try {
        const params = model ? { count, model } : { count };
        const response = await api.post(`/flashcards/generate-from-material/${materialId}`, null, { params });
        return response.data;
    } catch (error) {
        console.error('Erro ao gerar flashcards do material:', error);
        throw error;
    }
};

// ===== Serviços de Materiais de Estudo =====
export const getMaterials = async (tag = null) => {
    try {
        const params = tag ? { tag } : {};
        const response = await api.get('/materials', { params });
        return response.data.materials;
    } catch (error) {
        console.error('Erro ao obter materiais:', error);
        throw error;
    }
};

export const getMaterial = async (id, includeContent = false) => {
    try {
        const response = await api.get(`/materials/${id}`, {
            params: { include_content: includeContent }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao obter detalhes do material:', error);
        throw error;
    }
};

export const uploadMaterial = async (file, title = null, description = null, tags = null) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        if (title) formData.append('title', title);
        if (description) formData.append('description', description);
        if (tags) formData.append('tags', tags);

        const response = await api.post('/materials/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                // Você pode usar isso para rastrear o progresso de upload
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`Upload progress: ${percentCompleted}%`);
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao fazer upload do material:', error);
        throw error;
    }
};

export const deleteMaterial = async (id) => {
    try {
        const response = await api.delete(`/materials/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao excluir material:', error);
        throw error;
    }
};

export const summarizeMaterial = async (id, numPoints = 5, model = null) => {
    try {
        const params = model ? { num_points: numPoints, model } : { num_points: numPoints };
        const response = await api.post(`/materials/${id}/summarize`, null, { params });
        return response.data;
    } catch (error) {
        console.error('Erro ao resumir material:', error);
        throw error;
    }
};

export default api;