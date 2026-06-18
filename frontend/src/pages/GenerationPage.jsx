// ============================================================
// pages/GenerationPage.jsx
// Page de génération en temps réel avec design moderne
// Suivi interactif des agents, animations et feedback visuel
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjet } from '../services/api.js';
import {
    rejoindreSession,
    quitterSession,
    ecouterEvenement,
    arreterEcoute,
    estConnecte,
    envoyerEvenement
} from '../services/socket.js';

function GenerationPage() {
    const { projetId } = useParams();
    const navigate = useNavigate();

    const [projet, setProjet] = useState(null);
    const [sessionUuid, setSessionUuid] = useState(null);
    const [agentActif, setAgentActif] = useState(null);
    const [messages, setMessages] = useState([]);
    const [statut, setStatut] = useState('connexion');
    const [progressionGlobale, setProgressionGlobale] = useState(0);
    const [tempsEstime, setTempsEstime] = useState(45);
    const [resultatFinal, setResultatFinal] = useState(null);
    const [erreur, setErreur] = useState(null);
    
    const [agentsStatuts, setAgentsStatuts] = useState({
        CollecteAgent: { status: 'pending', progress: 0, message: '' },
        AnalyseAgent: { status: 'pending', progress: 0, message: '' },
        GenerationAgent: { status: 'pending', progress: 0, message: '' },
        ValidationAgent: { status: 'pending', progress: 0, message: '' }
    });

    const messagesEndRef = useRef(null);

    const agentsConfig = {
        CollecteAgent: { nom: 'Agent Collecte', role: 'Extraction des besoins', icone: '🔍', couleur: '#3b82f6', ordre: 1 },
        AnalyseAgent: { nom: 'Agent Analyse', role: 'Classification & RAG', icone: '📊', couleur: '#8b5cf6', ordre: 2 },
        GenerationAgent: { nom: 'Agent Génération', role: 'Rédaction du CDC', icone: '✍️', couleur: '#10b981', ordre: 3 },
        ValidationAgent: { nom: 'Agent Validation', role: 'Contrôle qualité', icone: '✅', couleur: '#f59e0b', ordre: 4 }
    };

    // Scroll automatique vers les nouveaux messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Calcul progression globale
    useEffect(() => {
        const totalProgress = Object.values(agentsStatuts).reduce((acc, agent) => acc + agent.progress, 0);
        const globalProgress = Math.floor(totalProgress / 4);
        setProgressionGlobale(globalProgress);
        
        if (globalProgress < 100 && globalProgress > 0) {
            const remaining = Math.max(5, Math.floor(45 * (1 - globalProgress / 100)));
            setTempsEstime(remaining);
        }
    }, [agentsStatuts]);

    // ============================================================
    // INITIALISATION
    // ============================================================
    useEffect(() => {
        const initialiser = async () => {
            try {
                // 1. Récupérer les infos du projet
                const reponse = await getProjet(projetId);
                setProjet(reponse.data);
                addMessage(`📁 Projet: ${reponse.data.titre}`, 'info');

                // 2. Récupérer la session active
                const sessionReponse = await fetch(
                    `http://localhost:3001/api/agents/sessions/${projetId}`
                );
                const sessionData = await sessionReponse.json();

                if (sessionData.data && sessionData.data.length > 0) {
                    const uuid = sessionData.data[0].session_uuid;
                    setSessionUuid(uuid);
                    
                    // 3. Rejoindre la session Socket.IO
                    rejoindreSession(uuid);
                    setStatut('en_cours');
                    addMessage('🚀 Pipeline lancé - Génération du cahier des charges en cours', 'info');
                } else {
                    setStatut('erreur');
                    addMessage('❌ Aucune session de génération trouvée', 'error');
                }
            } catch (error) {
                console.error('❌ Erreur initialisation :', error);
                setStatut('erreur');
                addMessage(`❌ Erreur de connexion: ${error.message}`, 'error');
            }
        };

        initialiser();

        // ============================================================
        // ÉCOUTE DES ÉVÉNEMENTS SOCKET.IO
        // ============================================================
        
        // ✅ Événement: agent_etape (le backend envoie ça)
        ecouterEvenement('agent_etape', (data) => {
            console.log('📌 agent_etape:', data);
            addMessage(`🤖 ${data.agent}: ${data.message}`, 'agent');
            
            const agentKey = data.agent;
            if (agentsConfig[agentKey]) {
                setAgentsStatuts(prev => ({
                    ...prev,
                    [agentKey]: {
                        ...prev[agentKey],
                        status: 'active',
                        message: data.message,
                        progress: Math.min((prev[agentKey]?.progress || 0) + 10, 95)
                    }
                }));
            }
        });

        // ✅ Événement: agent_actif (quand un agent commence)
        ecouterEvenement('agent_actif', (data) => {
            console.log('🤖 agent_actif:', data);
            const agentKey = data.agent;
            setAgentActif(agentKey);
            
            addMessage(`🔍 Démarrage de ${agentsConfig[agentKey]?.nom || agentKey}`, 'info');
            
            setAgentsStatuts(prev => ({
                ...prev,
                [agentKey]: {
                    ...prev[agentKey],
                    status: 'active',
                    progress: 10,
                    message: 'Démarrage...'
                }
            }));
        });

        // ✅ Événement: pipeline_demarre
        ecouterEvenement('pipeline_demarre', (data) => {
            console.log('🚀 pipeline_demarre:', data);
            setStatut('en_cours');
            addMessage(`🚀 ${data.message || 'Pipeline démarré'}`, 'info');
        });

        // ✅ Événement: pipeline_termine
        ecouterEvenement('pipeline_termine', (data) => {
            console.log('✅ pipeline_termine:', data);
            setStatut('termine');
            setAgentActif(null);
            setResultatFinal(data);
            setProgressionGlobale(100);
            
            // Marquer tous les agents comme complétés
            const completedAgents = {};
            Object.keys(agentsStatuts).forEach(key => {
                completedAgents[key] = {
                    ...agentsStatuts[key],
                    status: 'completed',
                    progress: 100,
                    message: '✅ Terminé'
                };
            });
            setAgentsStatuts(completedAgents);
            
            addMessage(`🎉 Félicitations ! CDC généré avec succès - Score: ${data.score}/100`, 'success');
            if (data.verdict) {
                addMessage(`📊 Verdict: ${data.verdict}`, 'success');
            }
        });

        // ✅ Événement: pipeline_erreur
        ecouterEvenement('pipeline_erreur', (data) => {
            console.log('❌ pipeline_erreur:', data);
            setStatut('erreur');
            setErreur(data.message);
            addMessage(`❌ Erreur: ${data.message}`, 'error');
        });

        // ✅ Événement: progression (si envoyé par le backend)
        ecouterEvenement('progres', (data) => {
            console.log('📊 progres:', data);
            if (data.agent && agentsConfig[data.agent]) {
                setAgentsStatuts(prev => ({
                    ...prev,
                    [data.agent]: {
                        ...prev[data.agent],
                        progress: data.pourcentage || Math.min((prev[data.agent]?.progress || 0) + 5, 100)
                    }
                }));
            }
        });

        // ✅ Événement: connect_confirme (Socket.IO)
        ecouterEvenement('connect_confirme', (data) => {
            console.log('📩 connect_confirme:', data);
            addMessage('✅ Connexion Socket.IO établie', 'success');
        });

        // ✅ Événement: session_jointe
        ecouterEvenement('session_jointe', (data) => {
            console.log('📌 session_jointe:', data);
            addMessage(`📌 Session rejointe: ${data.sessionUuid}`, 'info');
        });

        // ============================================================
        // NETTOYAGE
        // ============================================================
        return () => {
            console.log('🧹 Nettoyage des écoutes...');
            arreterEcoute('agent_etape');
            arreterEcoute('agent_actif');
            arreterEcoute('pipeline_demarre');
            arreterEcoute('pipeline_termine');
            arreterEcoute('pipeline_erreur');
            arreterEcoute('progres');
            arreterEcoute('connect_confirme');
            arreterEcoute('session_jointe');
            quitterSession();
        };
    }, [projetId]);

    // ============================================================
    // FONCTIONS UTILITAIRES
    // ============================================================
    
    const addMessage = (message, type = 'info') => {
        setMessages(prev => [...prev, {
            message,
            type,
            timestamp: new Date(),
            agent: 'Système'
        }]);
    };

    // ✅ Fonction pour lancer le pipeline manuellement
    const lancerPipeline = () => {
        if (!sessionUuid) {
            addMessage('❌ Aucune session disponible', 'error');
            return;
        }
        
        if (!estConnecte()) {
            addMessage('❌ Socket non connecté', 'error');
            return;
        }
        
        addMessage('🚀 Lancement du pipeline...', 'info');
        envoyerEvenement('lancer_pipeline', { 
            projetId, 
            sessionUuid 
        });
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'completed': return '✅';
            case 'active': return '⚡';
            case 'error': return '❌';
            default: return '⏳';
        }
    };

    // ============================================================
    // RENDU
    // ============================================================
    
    return (
        <div className="generation-page">
            <div className="container">
                
                {/* Header animé */}
                <div className="gen-header">
                    <div className="gen-header-icon">
                        {statut === 'termine' ? '🎉' : statut === 'erreur' ? '😰' : '🧠'}
                    </div>
                    <h1 className="gen-title">
                        {statut === 'termine' && 'CDC généré avec succès !'}
                        {statut === 'erreur' && 'Une erreur est survenue'}
                        {statut === 'connexion' && 'Connexion au pipeline...'}
                        {statut === 'en_cours' && 'Génération en cours...'}
                    </h1>
                    {projet && (
                        <div className="gen-project-badge">
                            <span className="project-icon">📁</span>
                            <span className="project-name">{projet.titre}</span>
                        </div>
                    )}
                </div>

                {/* Status Socket */}
                <div style={{ 
                    textAlign: 'center', 
                    marginBottom: '20px',
                    fontSize: '14px',
                    color: estConnecte() ? '#10b981' : '#ef4444'
                }}>
                    {estConnecte() ? '🟢 Socket connecté' : '🔴 Socket déconnecté'}
                    {sessionUuid && ` | Session: ${sessionUuid.substring(0, 8)}...`}
                </div>

                {/* Barre de progression globale */}
                {statut === 'en_cours' && (
                    <div className="gen-global-progress">
                        <div className="gen-global-progress-header">
                            <span className="progress-label">Progression globale</span>
                            <span className="progress-percent">{progressionGlobale}%</span>
                        </div>
                        <div className="gen-global-progress-bar">
                            <div className="gen-global-progress-fill" style={{ width: `${progressionGlobale}%` }}>
                                <div className="progress-glow"></div>
                            </div>
                        </div>
                        <div className="gen-global-progress-info">
                            <span className="time-estimate">⏱️ Temps estimé restant: ~{tempsEstime} secondes</span>
                        </div>
                    </div>
                )}

                {/* Grille des agents */}
                <div className="gen-agents-grid">
                    {Object.entries(agentsConfig).map(([key, config]) => {
                        const agentStatus = agentsStatuts[key];
                        return (
                            <div key={key} className={`gen-agent-card ${agentStatus?.status || 'pending'}`}>
                                <div className="gen-agent-header">
                                    <div className="gen-agent-icon" style={{ backgroundColor: `${config.couleur}15` }}>
                                        <span>{config.icone}</span>
                                    </div>
                                    <div className="gen-agent-status">
                                        <span className={`status-dot ${agentStatus?.status}`}></span>
                                        <span className="status-text">
                                            {agentStatus?.status === 'completed' && 'Terminé'}
                                            {agentStatus?.status === 'active' && 'En cours'}
                                            {agentStatus?.status === 'error' && 'Erreur'}
                                            {agentStatus?.status === 'pending' && 'En attente'}
                                        </span>
                                    </div>
                                </div>
                                
                                <h3 className="gen-agent-name">{config.nom}</h3>
                                <p className="gen-agent-role">{config.role}</p>
                                
                                {agentStatus?.status !== 'pending' && (
                                    <div className="gen-agent-progress">
                                        <div className="agent-progress-bar">
                                            <div 
                                                className="agent-progress-fill" 
                                                style={{ 
                                                    width: `${agentStatus?.progress || 0}%`,
                                                    backgroundColor: config.couleur
                                                }}
                                            />
                                        </div>
                                        <span className="agent-progress-value">{agentStatus?.progress || 0}%</span>
                                    </div>
                                )}
                                
                                {agentStatus?.message && agentStatus.status === 'active' && (
                                    <p className="gen-agent-message">{agentStatus.message}</p>
                                )}
                                
                                {agentStatus?.status === 'active' && (
                                    <div className="agent-pulse-wave">
                                        <div className="wave"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Console de logs */}
                <div className="gen-logs-container">
                    <div className="gen-logs-header">
                        <div className="logs-title">
                            <span className="logs-icon">📋</span>
                            <span>Console de suivi temps réel</span>
                        </div>
                        <div className="logs-count">{messages.length} événements</div>
                    </div>
                    <div className="gen-logs-list">
                        {messages.length === 0 ? (
                            <div className="logs-empty">
                                <div className="empty-animation">⚡</div>
                                <p>En attente des événements du pipeline...</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`gen-log-item ${msg.type}`}>
                                    <span className="log-time">
                                        {msg.timestamp.toLocaleTimeString()}
                                    </span>
                                    <span className="log-message">
                                        {msg.message}
                                    </span>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Résultat final */}
                {statut === 'termine' && resultatFinal && (
                    <div className="gen-result-container">
                        <div className="gen-result-card">
                            <div className="result-header">
                                <span className="result-icon">🏆</span>
                                <h2>Génération terminée avec succès</h2>
                            </div>
                            
                            <div className="result-score">
                                <div className="score-label">Score de complétude</div>
                                <div className="score-bar-container">
                                    <div 
                                        className="score-bar" 
                                        style={{ 
                                            width: `${resultatFinal.score}%`,
                                            background: `linear-gradient(90deg, 
                                                ${resultatFinal.score >= 80 ? '#10b981' : 
                                                  resultatFinal.score >= 60 ? '#f59e0b' : '#ef4444'} 0%,
                                                ${resultatFinal.score >= 80 ? '#34d399' : 
                                                  resultatFinal.score >= 60 ? '#fbbf24' : '#f87171'} 100%)`
                                        }}
                                    />
                                </div>
                                <div className="score-value">
                                    <span className="score-number">{resultatFinal.score}</span>
                                    <span className="score-max">/100</span>
                                </div>
                            </div>
                            
                            <div className="result-verdict">
                                <span className="verdict-badge">
                                    {resultatFinal.score >= 80 ? '🌟 Excellent' :
                                     resultatFinal.score >= 60 ? '👍 Satisfaisant' :
                                     '⚠️ À améliorer'}
                                </span>
                                <p>{resultatFinal.verdict || 'CDC généré avec succès'}</p>
                            </div>
                            
                            <div className="result-actions">
                                <button
                                    className="btn-resultat"
                                    onClick={() => navigate(`/resultat/${resultatFinal.cdcId}`)}
                                >
                                    📄 Voir le CDC généré
                                    <span className="btn-arrow">→</span>
                                </button>
                                <button
                                    className="btn-secondary-resultat"
                                    onClick={() => navigate('/nouveau-projet')}
                                >
                                    ✨ Nouveau projet
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message d'erreur */}
                {statut === 'erreur' && (
                    <div className="gen-error-container">
                        <div className="gen-error-card">
                            <span className="error-icon"></span>
                            <div className="error-content">
                                <h3>Erreur de génération</h3>
                                <p>{erreur || 'Une erreur s\'est produite lors de la génération du CDC.'}</p>
                                <p className="error-hint">Vérifiez votre connexion et votre configuration.</p>
                                <div className="error-actions">
                                    <button 
                                        className="btn-retry"
                                        onClick={() => window.location.reload()}
                                    >
                                         Réessayer
                                    </button>
                                    <button 
                                        className="btn-back"
                                        onClick={() => navigate('/nouveau-projet')}
                                    >
                                        ← Retour au formulaire
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bouton pour lancer manuellement */}
                {statut === 'connexion' && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button 
                            onClick={lancerPipeline}
                            className="btn-primary"
                            style={{ padding: '12px 30px', fontSize: '16px' }}
                        >
                             Lancer la génération
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GenerationPage;