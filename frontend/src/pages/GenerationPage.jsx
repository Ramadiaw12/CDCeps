// ============================================================
// pages/GenerationPage.jsx
// Page de génération en temps réel
// Se connecte via Socket.io et affiche la progression
// des 4 agents jusqu'à la fin de la génération
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgentProgressBar from '../components/AgentProgressBar.jsx';
import { getProjet } from '../services/api.js';
import {
    rejoindreSession,
    quitterSession,
    ecouterEvenement,
    arreterEcoute
} from '../services/socket.js';

function GenerationPage() {
    const { projetId } = useParams();
    const navigate = useNavigate();

    // États 
    const [projet, setProjet]           = useState(null);
    const [sessionUuid, setSessionUuid] = useState(null);
    const [agentActif, setAgentActif]   = useState(null);
    const [messages, setMessages]       = useState([]);
    const [statut, setStatut]           = useState('connexion');
    // statut : connexion | en_cours | termine | erreur

    const [agentsStatuts, setAgentsStatuts] = useState({
        CollecteAgent:    'pending',
        AnalyseAgent:     'pending',
        GenerationAgent:  'pending',
        ValidationAgent:  'pending'
    });

    const [resultatFinal, setResultatFinal] = useState(null);
    const messagesEndRef = useRef(null);

    // Scroll automatique vers le bas du journal
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Chargement du projet et connexion Socket.io 
    useEffect(() => {
        const initialiser = async () => {
            try {
                // Récupère les infos du projet
                const reponse = await getProjet(projetId);
                setProjet(reponse.data);

                // Récupère le sessionUuid depuis la base
                // On attend un peu que le pipeline démarre
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Importe dynamiquement pool pour récupérer la session
                const sessionReponse = await fetch(
                    `http://localhost:3001/api/agents/sessions/${projetId}`
                );
                const sessionData = await sessionReponse.json();

                if (sessionData.data && sessionData.data.length > 0) {
                    const uuid = sessionData.data[0].session_uuid;
                    setSessionUuid(uuid);

                    // Se connecte et rejoint la session Socket.io
                    rejoindreSession(uuid);
                    setStatut('en_cours');

                    // Écoute les événements du pipeline
                    configurerEvenements();
                }

            } catch (error) {
                console.error('Erreur initialisation :', error);
                setStatut('erreur');
            }
        };

        initialiser();

        // Nettoyage : déconnecte le socket quand on quitte la page
        return () => {
            arreterEcoute('progression_agent');
            arreterEcoute('agent_actif');
            arreterEcoute('pipeline_termine');
            arreterEcoute('pipeline_erreur');
            quitterSession();
        };
    }, [projetId]);

    //Configuration des événements Socket.io 
    const configurerEvenements = () => {

        // Reçoit les messages de progression des agents
        ecouterEvenement('progression_agent', (data) => {
            setMessages(prev => [...prev, {
                message: data.message,
                timestamp: data.timestamp,
                agent: data.agent
            }]);

            // Met à jour le statut de l'agent concerné
            if (data.message.includes('✅')) {
                setAgentsStatuts(prev => ({
                    ...prev,
                    [data.agent]: 'done'
                }));
            }
            if (data.message.includes('❌')) {
                setAgentsStatuts(prev => ({
                    ...prev,
                    [data.agent]: 'error'
                }));
            }
        });

        // Reçoit l'agent actuellement actif
        ecouterEvenement('agent_actif', (data) => {
            setAgentActif(data.agent);
            setAgentsStatuts(prev => ({
                ...prev,
                [data.agent]: 'running'
            }));
        });

        // Pipeline terminé avec succès
        ecouterEvenement('pipeline_termine', (data) => {
            setStatut('termine');
            setAgentActif(null);
            setResultatFinal(data);

            // Ajoute un message final dans le journal
            setMessages(prev => [...prev, {
                message: `🎉 CDC généré avec succès — Score : ${data.score}/100`,
                timestamp: new Date().toISOString(),
                agent: 'Système'
            }]);
        });

        // Pipeline en erreur
        ecouterEvenement('pipeline_erreur', (data) => {
            setStatut('erreur');
            setMessages(prev => [...prev, {
                message: data.message,
                timestamp: new Date().toISOString(),
                agent: 'Système'
            }]);
        });
    };

    //  Rendu 
    return (
        <div className="page">
            <div className="container">

                {/* En-tête */}
                <div style={styles.header}>
                    <h1 style={styles.titre}>
                        {statut === 'termine'
                            ? 'CDC généré avec succès'
                            : 'Génération en cours...'}
                    </h1>
                    {projet && (
                        <p style={styles.sousTitre}>
                            Projet : <strong>{projet.titre}</strong>
                        </p>
                    )}
                </div>

                {/* Barre de progression globale */}
                <div className="card" style={styles.card}>
                    <AgentProgressBar
                        agents={agentsStatuts}
                        agentActif={agentActif}
                        messages={messages}
                    />
                    <div ref={messagesEndRef} />
                </div>

                {/* Résultat final */}
                {statut === 'termine' && resultatFinal && (
                    <div className="card" style={styles.resultatCard}>
                        <h2 style={styles.resultatTitre}>
                            ✅ Génération terminée
                        </h2>

                        {/* Score de complétude */}
                        <div style={styles.scoreWrapper}>
                            <div style={styles.scoreLabel}>
                                Score de complétude
                            </div>
                            <div style={styles.scoreBarre}>
                                <div style={{
                                    ...styles.scoreRemplissage,
                                    width: `${resultatFinal.score}%`,
                                    backgroundColor:
                                        resultatFinal.score >= 80 ? '#10b981' :
                                        resultatFinal.score >= 60 ? '#f59e0b' :
                                        '#ef4444'
                                }} />
                            </div>
                            <div style={styles.scoreValeur}>
                                {resultatFinal.score}/100
                            </div>
                        </div>

                        {/* Verdict */}
                        <div style={styles.verdict}>
                            Verdict : <strong>{resultatFinal.verdict}</strong>
                        </div>

                        {/* Bouton vers le résultat */}
                        <button
                            className="btn btn-primary"
                            style={styles.btnResultat}
                            onClick={() => navigate(`/resultat/${resultatFinal.cdcId}`)}
                        >
                             Voir le CDC généré →
                        </button>
                    </div>
                )}

                {/* Message d'erreur */}
                {statut === 'erreur' && (
                    <div style={styles.erreur}>
                        <h3>Une erreur est survenue</h3>
                        <p>Vérifiez votre clé API OpenAI et réessayez.</p>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/nouveau-projet')}
                            style={{ marginTop: '16px' }}
                        >
                            ← Retour au formulaire
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Styles ───────────────────────────────────────────────────
const styles = {
    header: {
        marginBottom: '32px'
    },
    titre: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#0f172a'
    },
    sousTitre: {
        color: '#64748b',
        marginTop: '8px'
    },
    card: {
        padding: '28px',
        marginBottom: '24px'
    },
    resultatCard: {
        padding: '28px',
        borderColor: '#86efac',
        backgroundColor: '#f0fdf4'
    },
    resultatTitre: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#166534',
        marginBottom: '24px'
    },
    scoreWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '16px'
    },
    scoreLabel: {
        fontSize: '14px',
        color: '#64748b',
        minWidth: '140px'
    },
    scoreBarre: {
        flex: 1,
        height: '10px',
        backgroundColor: '#e2e8f0',
        borderRadius: '5px',
        overflow: 'hidden'
    },
    scoreRemplissage: {
        height: '100%',
        borderRadius: '5px',
        transition: 'width 0.5s ease'
    },
    scoreValeur: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#0f172a',
        minWidth: '60px'
    },
    verdict: {
        fontSize: '14px',
        color: '#64748b',
        marginBottom: '24px'
    },
    btnResultat: {
        width: '100%',
        justifyContent: 'center',
        padding: '14px'
    },
    erreur: {
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5',
        borderRadius: '10px',
        padding: '24px',
        textAlign: 'center',
        color: '#991b1b'
    }
};

export default GenerationPage;