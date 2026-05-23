// ============================================================
// services/api.js
// Service centralisé pour tous les appels API
// Toutes les pages utilisent ce fichier pour communiquer
// avec le backend Node.js
// ============================================================

import axios from 'axios';

// URL de base du backend Node.js
const API_URL = 'http://localhost:3001/api';

// Crée une instance axios configurée
// avec l'URL de base et les headers par défaut
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    // Timeout de 30 secondes
    // Les appels OpenAI peuvent prendre du temps
    timeout: 30000
});

// ── Projets ──────────────────────────────────────────────────

// Crée un nouveau client + projet
export const creerProjet = async (donneesFormulaire) => {
    const response = await api.post('/projets', donneesFormulaire);
    return response.data;
};

// Récupère la liste de tous les projets
export const listerProjets = async () => {
    const response = await api.get('/projets');
    return response.data;
};

// Récupère le détail d'un projet
export const getProjet = async (projetId) => {
    const response = await api.get(`/projets/${projetId}`);
    return response.data;
};

// ── Agents ───────────────────────────────────────────────────

// Lance le pipeline multi-agents pour un projet
export const lancerGeneration = async (projetId) => {
    const response = await api.post(`/agents/generer/${projetId}`);
    return response.data;
};

// Récupère le statut d'une session
export const getSession = async (sessionUuid) => {
    const response = await api.get(`/agents/session/${sessionUuid}`);
    return response.data;
};

// ── Documents CDC ─────────────────────────────────────────────

// Récupère la liste de tous les CDC
export const listerCDC = async () => {
    const response = await api.get('/documents/cdc');
    return response.data;
};

// Récupère le contenu complet d'un CDC
export const getCDC = async (cdcId) => {
    const response = await api.get(`/documents/cdc/${cdcId}`);
    return response.data;
};

// Télécharge le CDC en Markdown
export const telechargerMarkdown = (cdcId) => {
    // Ouvre directement dans le navigateur pour télécharger
    window.open(`${API_URL}/documents/cdc/${cdcId}/markdown`, '_blank');
};

// Télécharge le CDC en PDF
export const telechargerPDF = (cdcId) => {
    window.open(`${API_URL}/documents/cdc/${cdcId}/pdf`, '_blank');
};

export default api;