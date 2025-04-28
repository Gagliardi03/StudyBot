// AppRoutes.js - Configuração de rotas e navegação da aplicação
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './AppRoutes.css';
import { BookOpen, Brain, FileText, User, Settings, LogOut } from 'lucide-react';

// Importação dos componentes
import App from './App'; // Componente principal (chat)
import FlashcardCreator from './FlashcardCreator';
import StudyMaterials from './StudyMaterials';

// Componente de layout principal
function MainLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="main-layout">
            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h1 className="app-name">StudyBot</h1>
                    <button
                        className="toggle-sidebar"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? '←' : '→'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/" className="nav-item">
                        <BookOpen size={20} />
                        <span className="nav-text">Chat</span>
                    </Link>
                    <Link to="/flashcards" className="nav-item">
                        <Brain size={20} />
                        <span className="nav-text">Flashcards</span>
                    </Link>
                    <Link to="/materials" className="nav-item">
                        <FileText size={20} />
                        <span className="nav-text">Materiais</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            <User size={24} />
                        </div>
                        <div className="user-details">
                            <p className="user-name">Estudante</p>
                            <p className="user-plan">Plano Gratuito</p>
                        </div>
                    </div>

                    <div className="footer-actions">
                        <button className="footer-button">
                            <Settings size={18} />
                            <span>Configurações</span>
                        </button>
                        <button className="footer-button logout">
                            <LogOut size={18} />
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="content-area">
                {children}
            </main>
        </div>
    );
}

// Componente principal de rotas
function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <MainLayout>
                        <App />
                    </MainLayout>
                } />
                <Route path="/flashcards" element={
                    <MainLayout>
                        <FlashcardCreator />
                    </MainLayout>
                } />
                <Route path="/materials" element={
                    <MainLayout>
                        <StudyMaterials />
                    </MainLayout>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;