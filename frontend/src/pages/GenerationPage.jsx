// ============================================================
// pages/GenerationPage.jsx
// Page de génération du CDC avec suivi en temps réel
// Design moderne, animations, feedback visuel
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjetStatus, getProjetResultat } from '../services/api.js';
import io from 'socket.io-client';

function GenerationPage() {
    const { projetId } = useParams();
    const navigate = useNavigate();
    const [statut, setStatut] = useState('initialisation');
    const [progression, setProgression] = useState(0);
    const [agents, setAgents] = useState([
        { id: 'collecte', nom: 'Agent Collecte', role: 'Extraction des besoins', status: 'pending', icone: '🔍' },
        { id: 'analyse', nom: 'Agent Analyse', role: 'Classification & RAG', status: 'pending', icone: '📊' },
        { id: 'generation', nom: 'Agent Génération', role: 'Rédaction du CDC', status: 'pending', icone: '✍️' },
        { id: 'validation', nom: 'Agent Validation', role: 'Contrôle qualité', status: 'pending', icone: '✅' }
    ]);
    const [logs, setLogs] = useState([]);
    const [erreur, setErreur] = useState(null);
    const [tempsEstime, setTempsEstime] = useState(45);

    useEffect(() => {
        const socket = io('http://localhost:3001');

        socket.on('connect', () => {
            socket.emit('join-projet', projetId);
            addLog('🔌 Connexion établie avec le serveur', 'info');
        });

        socket.on('progression', (data) => {
            setProgression(data.pourcentage);
            setTempsEstime(data.tempsRestant || Math.max(5, Math.floor(45 - (data.pourcentage / 100) * 40)));
            
            // Mettre à jour le statut des agents
            if (data.agentActif) {
                setAgents(prev => prev.map(agent => 
                    agent.id === data.agentActif 
                        ? { ...agent, status: 'active' }
                        : agent.status === 'active' && agent.id !== data.agentActif
                            ? { ...agent, status: 'completed' }
                            : agent
                ));
            }
        });

        socket.on('agent-status', (data) => {
            setAgents(prev => prev.map(agent =>
                agent.id === data.agentId
                    ? { ...agent, status: data.status, message: data.message }
                    : agent
            ));
            
            if (data.message) {
                addLog(`🤖 ${agent.nom}: ${data.message}`, 'agent');
            }
        });

        socket.on('log', (data) => {
            addLog(data.message, data.type || 'info');
        });

        socket.on('completion', (data) => {
            setStatut('complet');
            setProgression(100);
            addLog('🎉 Génération terminée avec succès ! Redirection en cours...', 'success');
            setTimeout(() => {
                navigate(`/resultat/${projetId}`);
            }, 2000);
        });

        socket.on('error', (data) => {
            setErreur(data.message);
            setStatut('erreur');
            addLog(`❌ Erreur: ${data.message}`, 'error');
        });

        return () => {
            socket.disconnect();
        };
    }, [projetId, navigate]);

    const addLog = (message, type) => {
        setLogs(prev => [...prev, { message, type, timestamp: new Date() }]);
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'completed': return '✅';
            case 'active': return '⚡';
            case 'pending': return '⏳';
            default: return '○';
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'completed': return 'completed';
            case 'active': return 'active';
            default: return 'pending';
        }
    };

    return (
        <div className="generation-page">
            <div className="container">
                {/* Header */}
                <div className="gen-header">
                    <div className="gen-header-icon">🤖</div>
                    <h1 className="gen-title">Génération en cours...</h1>
                    <p className="gen-subtitle">
                        Les agents IA analysent votre projet et rédigent votre cahier des charges
                    </p>
                </div>

                {/* Barre de progression principale */}
                <div className="gen-progress-container">
                    <div className="gen-progress-header">
                        <span className="gen-progress-label">Progression globale</span>
                        <span className="gen-progress-value">{progression}%</span>
                    </div>
                    <div className="gen-progress-bar">
                        <div 
                            className="gen-progress-fill" 
                            style={{ width: `${progression}%` }}
                        >
                            <div className="gen-progress-glow"></div>
                        </div>
                    </div>
                    <div className="gen-progress-info">
                        <span className="gen-time-estimate">
                            ⏱️ Temps estimé restant: ~{tempsEstime} secondes
                        </span>
                    </div>
                </div>

                {/* Grille des agents */}
                <div className="gen-agents-grid">
                    {agents.map((agent) => (
                        <div key={agent.id} className={`gen-agent-card ${getStatusClass(agent.status)}`}>
                            <div className="gen-agent-header">
                                <div className="gen-agent-icon">{agent.icone}</div>
                                <div className="gen-agent-status-icon">{getStatusIcon(agent.status)}</div>
                            </div>
                            <h3 className="gen-agent-name">{agent.nom}</h3>
                            <p className="gen-agent-role">{agent.role}</p>
                            <div className="gen-agent-progress">
                                <div className={`gen-agent-progress-bar ${getStatusClass(agent.status)}`}>
                                    {agent.status === 'active' && (
                                        <div className="gen-agent-pulse"></div>
                                    )}
                                </div>
                            </div>
                            {agent.message && (
                                <p className="gen-agent-message">{agent.message}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Logs en temps réel */}
                <div className="gen-logs-container">
                    <div className="gen-logs-header">
                        <span className="gen-logs-title">📋 Console de suivi</span>
                        <span className="gen-logs-count">{logs.length} événements</span>
                    </div>
                    <div className="gen-logs-list">
                        {logs.length === 0 ? (
                            <div className="gen-logs-empty">
                                <span>🔄</span>
                                <p>Initialisation des agents...</p>
                            </div>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className={`gen-log-item ${log.type}`}>
                                    <span className="gen-log-time">
                                        {log.timestamp.toLocaleTimeString()}
                                    </span>
                                    <span className="gen-log-message">{log.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Message d'erreur */}
                {erreur && (
                    <div className="gen-error-container">
                        <div className="gen-error-card">
                            <span className="gen-error-icon">⚠️</span>
                            <div className="gen-error-content">
                                <h3>Une erreur est survenue</h3>
                                <p>{erreur}</p>
                                <button 
                                    className="gen-retry-btn"
                                    onClick={() => window.location.reload()}
                                >
                                    🔄 Réessayer
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