// ============================================================
// pages/GenerationPage.jsx
// Page de génération en temps réel
// Pipeline automatique + suivi Socket.IO
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjet } from '../services/api.js';
import {
    rejoindreSession,
    quitterSession,
    ecouterEvenement,
    arreterEcoute,
    estConnecte
} from '../services/socket.js';

import './GenerationPage.css';

function GenerationPage() {
    const { projetId } = useParams();
    const navigate = useNavigate();

    const [projet, setProjet] = useState(null);
    const [sessionUuid, setSessionUuid] = useState(null);
    const [messages, setMessages] = useState([]);
    const [statut, setStatut] = useState('initialisation');
    const [progressionGlobale, setProgressionGlobale] = useState(0);
    const [resultatFinal, setResultatFinal] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [pipelineLance, setPipelineLance] = useState(false);

    const [agentsStatuts, setAgentsStatuts] = useState({
        CollecteAgent:   { status: 'pending', progress: 0, message: '' },
        AnalyseAgent:    { status: 'pending', progress: 0, message: '' },
        GenerationAgent: { status: 'pending', progress: 0, message: '' },
        ValidationAgent: { status: 'pending', progress: 0, message: '' }
    });

    const messagesEndRef = useRef(null);

    const agentsConfig = {
        CollecteAgent:   { nom: 'Agent Collecte',    role: 'Extraction des besoins', icone: '🔍', couleur: '#3b82f6', ordre: 1 },
        AnalyseAgent:    { nom: 'Agent Analyse',     role: 'Classification & RAG',   icone: '📊', couleur: '#8b5cf6', ordre: 2 },
        GenerationAgent: { nom: 'Agent Génération',  role: 'Rédaction du CDC',       icone: '✍️', couleur: '#10b981', ordre: 3 },
        ValidationAgent: { nom: 'Agent Validation',  role: 'Contrôle qualité',       icone: '✅', couleur: '#f59e0b', ordre: 4 }
    };

    // Scroll en haut au chargement
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Scroll automatique des logs
    useEffect(() => {
        const container = document.querySelector('.gen-logs-list');
        if (container) {
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
            if (isNearBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [messages]);

    // Calcul progression globale
    useEffect(() => {
        const totalProgress = Object.values(agentsStatuts).reduce((acc, agent) => acc + agent.progress, 0);
        setProgressionGlobale(Math.floor(totalProgress / 4));
    }, [agentsStatuts]);

    const telechargerCDC = (cdcId, format) => {
        const url = `http://localhost:3001/api/documents/cdc/${cdcId}/format?format=${format}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = `cdc_${format}.${format === 'markdown' ? 'md' : 'pdf'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addMessage(`Téléchargement ${format.toUpperCase()} lancé`, 'info');
    };

    const addMessage = (message, type = 'info') => {
        setMessages(prev => [...prev, { message, type, timestamp: new Date() }]);
    };

    // Initialisation + Socket
    useEffect(() => {
        let annule = false;

        const initialiser = async () => {
            try {
                setStatut('connexion');
                addMessage('Connexion au serveur...', 'info');

                const reponse = await getProjet(projetId);
                if (annule) return;
                setProjet(reponse.data);
                addMessage(`Projet: ${reponse.data.titre}`, 'info');

                const uuid = crypto.randomUUID();
                setSessionUuid(uuid);

                rejoindreSession(uuid);
                addMessage('Connexion Socket.IO en cours...', 'info');

                const waitForSocket = () => new Promise((resolve) => {
                    if (estConnecte()) { resolve(); return; }
                    const checkInterval = setInterval(() => {
                        if (estConnecte()) { clearInterval(checkInterval); resolve(); }
                    }, 200);
                    setTimeout(() => clearInterval(checkInterval), 5000);
                });

                await waitForSocket();
                if (annule) return;

                if (estConnecte()) {
                    addMessage('Socket.IO connecté', 'success');
                } else {
                    addMessage('Socket.IO non connecté, tentative...', 'warning');
                    setTimeout(() => rejoindreSession(uuid), 2000);
                }

                setStatut('lancement');
                addMessage('Lancement du pipeline...', 'info');

                const pipelineResponse = await fetch(
                    `http://localhost:3001/api/agents/generer/${projetId}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionUuid: uuid })
                    }
                );
                if (annule) return;

                const pipelineData = await pipelineResponse.json();
                if (pipelineData.succes) {
                    setStatut('en_cours');
                    setPipelineLance(true);
                    addMessage('Pipeline démarré avec succès', 'success');
                } else {
                    setStatut('erreur');
                    setErreur(pipelineData.message);
                    addMessage(`❌ Erreur: ${pipelineData.message}`, 'error');
                }
            } catch (error) {
                if (annule) return;
                console.error('❌ Erreur initialisation:', error);
                setStatut('erreur');
                setErreur(error.message);
                addMessage(`❌ Erreur: ${error.message}`, 'error');
            }
        };

        // Listeners Socket.IO
        ecouterEvenement('connect_confirme', (data) => {
            addMessage('Connexion Socket.IO confirmée', 'success');
        });

        ecouterEvenement('pipeline_demarre', (data) => {
            setStatut('en_cours');
            addMessage(`${data.message || 'Pipeline démarré'}`, 'info');
        });

        ecouterEvenement('agent_actif', (data) => {
            const agentKey = data.agent;
            setAgentsStatuts(prev => ({
                ...prev,
                [agentKey]: { ...prev[agentKey], status: 'active', progress: 10, message: 'Démarrage...' }
            }));
            addMessage(`${data.nom || agentKey} commence`, 'info');
        });

        ecouterEvenement('agent_etape', (data) => {
            const agentKey = data.agent;
            if (agentsConfig[agentKey]) {
                setAgentsStatuts(prev => ({
                    ...prev,
                    [agentKey]: {
                        ...prev[agentKey],
                        status: 'active',
                        message: data.message,
                        progress: Math.min((prev[agentKey]?.progress || 0) + 15, 95)
                    }
                }));
            }
            addMessage(`${data.agent}: ${data.message}`, 'agent');
        });

        ecouterEvenement('pipeline_termine', (data) => {
            setStatut('termine');
            setResultatFinal(data);
            setAgentsStatuts(prev => {
                const updated = {};
                Object.keys(prev).forEach(key => {
                    updated[key] = { ...prev[key], status: 'completed', progress: 100, message: 'Terminé' };
                });
                return updated;
            });
            addMessage(`CDC généré - Score: ${data.score}/100`, 'success');
            if (data.verdict) addMessage(`Verdict: ${data.verdict}`, 'success');
        });

        ecouterEvenement('pipeline_erreur', (data) => {
            setStatut('erreur');
            setErreur(data.message);
            addMessage(`❌ Erreur: ${data.message}`, 'error');
        });

        ecouterEvenement('session_jointe', (data) => {
            addMessage(`Session rejointe: ${data.sessionUuid}`, 'info');
        });

        initialiser();

        return () => {
            annule = true;
            ['connect_confirme', 'pipeline_demarre', 'agent_actif', 'agent_etape',
             'pipeline_termine', 'pipeline_erreur', 'session_jointe'].forEach(arreterEcoute);
            quitterSession();
        };
    }, [projetId]);

    // Rendu
    return (
        <div className="generation-page">
            <div className="container">
                <div className="gen-header">
                    <h1 className="gen-title">
                        {statut === 'termine' && '✅ CDC généré avec succès !'}
                        {statut === 'erreur' && '❌ Une erreur est survenue'}
                        {statut === 'initialisation' && '⏳ Initialisation...'}
                        {statut === 'connexion' && '🔄 Connexion au serveur...'}
                        {statut === 'lancement' && '🚀 Lancement du pipeline...'}
                        {statut === 'en_cours' && '⚙️ Génération en cours...'}
                    </h1>
                    {projet && (
                        <div className="gen-project-badge">
                            📁 {projet.titre}
                        </div>
                    )}
                </div>

                <div className={`socket-status ${estConnecte() ? 'connected' : 'disconnected'}`}>
                    {estConnecte() ? '🟢 Socket connecté' : '🔴 Socket déconnecté'}
                    {sessionUuid && ` | Session: ${sessionUuid.substring(0, 8)}...`}
                </div>

                {(statut === 'en_cours' || statut === 'lancement') && (
                    <div className="gen-global-progress">
                        <div className="gen-global-progress-header">
                            <span>Progression globale</span>
                            <span>{progressionGlobale}%</span>
                        </div>
                        <div className="gen-global-progress-bar">
                            <div className="gen-global-progress-fill" style={{ width: `${progressionGlobale}%` }} />
                        </div>
                    </div>
                )}

                <div className="gen-agents-grid">
                    {Object.entries(agentsConfig).map(([key, config]) => {
                        const agentStatus = agentsStatuts[key];
                        return (
                            <div key={key} className={`gen-agent-card ${agentStatus?.status || 'pending'}`}>
                                <div className="gen-agent-header">
                                    <span className="gen-agent-icon">{config.icone}</span>
                                    <div className="gen-agent-info">
                                        <h3 className="gen-agent-name">{config.nom}</h3>
                                        <p className="gen-agent-role">{config.role}</p>
                                    </div>
                                    <span className={`status-dot ${agentStatus?.status}`} />
                                </div>
                                {agentStatus?.status !== 'pending' && (
                                    <div className="gen-agent-progress">
                                        <div className="agent-progress-bar">
                                            <div className="agent-progress-fill" style={{
                                                width: `${agentStatus?.progress || 0}%`,
                                                backgroundColor: config.couleur
                                            }} />
                                        </div>
                                        <span className="agent-progress-value">{agentStatus?.progress || 0}%</span>
                                    </div>
                                )}
                                {agentStatus?.message && agentStatus.status === 'active' && (
                                    <p className="gen-agent-message">{agentStatus.message}</p>
                                )}
                                <span className="agent-status-label">
                                    {agentStatus?.status === 'completed' && '✅ Terminé'}
                                    {agentStatus?.status === 'active' && '⏳ En cours...'}
                                    {agentStatus?.status === 'error' && '❌ Erreur'}
                                    {agentStatus?.status === 'pending' && '⏸ En attente'}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="gen-logs-container">
                    <div className="gen-logs-header">
                        <span>📋 Console de suivi</span>
                        <span className="logs-count">{messages.length} événements</span>
                    </div>
                    <div className="gen-logs-list">
                        {messages.length === 0 ? (
                            <div className="logs-empty">En attente des événements...</div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`gen-log-item ${msg.type}`}>
                                    <span className="log-time">{msg.timestamp.toLocaleTimeString()}</span>
                                    <span className="log-message">{msg.message}</span>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {statut === 'termine' && resultatFinal && (
                    <div className="gen-result-container">
                        <div className="gen-result-card">
                            <h2>✅ Génération terminée</h2>
                            <div className="result-score">
                                <span>Score de complétude</span>
                                <div className="score-bar-container">
                                    <div className="score-bar" style={{
                                        width: `${resultatFinal.score}%`,
                                        background: resultatFinal.score >= 80 ? '#10b981' : 
                                                     resultatFinal.score >= 60 ? '#f59e0b' : '#ef4444'
                                    }} />
                                </div>
                                <span className="score-value">{resultatFinal.score}/100</span>
                            </div>
                            <div className="result-verdict">
                                <span className="verdict-badge">
                                    {resultatFinal.score >= 80 ? '🏆 Excellent' :
                                     resultatFinal.score >= 60 ? '👍 Satisfaisant' : '📝 À améliorer'}
                                </span>
                                <p>{resultatFinal.verdict}</p>
                            </div>
                            <div className="result-export-section">
                                <h3>📥 Exporter le CDC</h3>
                                <div className="export-buttons">
                                    <button className="btn-export btn-markdown" onClick={() => telechargerCDC(resultatFinal.cdcId, 'markdown')}>
                                        📝 Markdown
                                    </button>
                                    <button className="btn-export btn-pdf" onClick={() => telechargerCDC(resultatFinal.cdcId, 'pdf')}>
                                        📄 PDF
                                    </button>
                                </div>
                            </div>
                            <div className="result-actions">
                                <button className="btn-resultat" onClick={() => navigate(`/resultat/${resultatFinal.cdcId}`)}>
                                    📄 Voir le CDC
                                </button>
                                <button className="btn-secondary-resultat" onClick={() => navigate('/nouveau-projet')}>
                                    ✨ Nouveau projet
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {statut === 'erreur' && (
                    <div className="gen-error-container">
                        <div className="gen-error-card">
                            <h3>❌ Erreur</h3>
                            <p>{erreur || 'Une erreur est survenue'}</p>
                            <div className="error-actions">
                                <button className="btn-retry" onClick={() => window.location.reload()}>
                                    🔄 Réessayer
                                </button>
                                <button className="btn-back" onClick={() => navigate('/nouveau-projet')}>
                                    ← Retour
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GenerationPage;
