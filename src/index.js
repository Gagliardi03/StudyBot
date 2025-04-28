// src/index.js - Ponto de entrada da aplicação
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRoutes from './AppRoutes';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
// Você precisará substituir isso com sua própria configuração do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "seu-message-sender-id",
    appId: "seu-app-id"
};

// Inicializa o Firebase (comentado até você configurar suas próprias credenciais)
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// Renderiza a aplicação
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AppRoutes />
    </React.StrictMode>
);

// Quando estiver pronto para produção, você pode adicionar configurações
// para melhorar o desempenho, como serviceWorker