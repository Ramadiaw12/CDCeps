// ============================================================
// components/AgentProgressBar.jsx
// Affiche la progression des 4 agents en temps réel
// Reçoit les événements Socket.io et met à jour l'interface
// ============================================================

function AgentProgressBar({ agents, agentActif, messages }) {

    // Définition des 4 agents avec leurs infos d'affichage
    const agentsConfig = [
        {
            id: 'CollecteAgent',
            nom: 'Agent Collecte',
            description: 'Extraction des besoins',
            icone: '🔍'
        },
        {
            id: 'AnalyseAgent',
            nom: 'Agent Analyse',
            description: 'Classification & RAG',
            icone: '🔎'
        },
        {
            id: 'GenerationAgent',
            nom: 'Agent Génération',
            description: 'Rédaction du CDC',
            icone: '📝'
        },
        {
            id: 'ValidationAgent',
            nom: 'Agent Validation',
            description: 'Contrôle qualité',
            icone: '✅'
        }
    ];

    // Détermine le statut visuel de chaque agent
    const getStatut = (agentId) => {
        if (agents[agentId] === 'done')    return 'done';
        if (agents[agentId] === 'error')   return 'error';
        if (agentActif === agentId)        return 'running';
        return 'pending';
    };

    return (
        <div style={styles.container}>
            {/* ── Pipeline des agents ──────────────────────── */}
            <div style={styles.pipeline}>
                {agentsConfig.map((agent, index) => {
                    const statut = getStatut(agent.id);

                    return (
                        <div key={agent.id} style={styles.agentWrapper}>
                            {/* Carte agent */}
                            <div style={{
                                ...styles.agentCard,
                                ...styles[`card_${statut}`]
                            }}>
                                {/* Icône avec animation si en cours */}
                                <div style={{
                                    ...styles.icone,
                                    ...(statut === 'running' ? styles.iconeRunning : {})
                                }}>
                                    {statut === 'done'    ? '✅' :
                                     statut === 'error'   ? '❌' :
                                     statut === 'running' ? '⚙️' :
                                     agent.icone}
                                </div>

                                <div style={styles.agentInfo}>
                                    <div style={styles.agentNom}>{agent.nom}</div>
                                    <div style={styles.agentDesc}>{agent.description}</div>
                                </div>

                                {/* Badge de statut */}
                                <div style={{
                                    ...styles.badge,
                                    ...styles[`badge_${statut}`]
                                }}>
                                    {statut === 'done'    ? 'Terminé'   :
                                     statut === 'error'   ? 'Erreur'    :
                                     statut === 'running' ? 'En cours'  :
                                     'En attente'}
                                </div>
                            </div>

                            {/* Flèche entre les agents (sauf le dernier) */}
                            {index < agentsConfig.length - 1 && (
                                <div style={styles.fleche}>→</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Journal des messages en temps réel ──────── */}
            {messages.length > 0 && (
                <div style={styles.journal}>
                    <div style={styles.journalTitre}>
                        📡 Journal en temps réel
                    </div>
                    <div style={styles.journalMessages}>
                        {messages.map((msg, index) => (
                            <div key={index} style={styles.journalMessage}>
                                <span style={styles.journalHeure}>
                                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR')}
                                </span>
                                <span>{msg.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Styles ───────────────────────────────────────────────────
const styles = {
    container: {
        width: '100%'
    },
    pipeline: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '24px'
    },
    agentWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
        minWidth: '180px'
    },
    agentCard: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        transition: 'all 0.3s'
    },
    // Styles selon le statut
    card_pending: {
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        opacity: 0.6
    },
    card_running: {
        backgroundColor: '#eff6ff',
        border: '2px solid #2563eb',
        boxShadow: '0 0 0 3px rgba(37,99,235,0.1)'
    },
    card_done: {
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac'
    },
    card_error: {
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5'
    },
    icone: {
        fontSize: '22px',
        minWidth: '28px',
        textAlign: 'center'
    },
    iconeRunning: {
        animation: 'spin 1s linear infinite'
    },
    agentInfo: {
        flex: 1,
        minWidth: 0
    },
    agentNom: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#0f172a'
    },
    agentDesc: {
        fontSize: '11px',
        color: '#64748b',
        marginTop: '2px'
    },
    badge: {
        fontSize: '11px',
        padding: '3px 8px',
        borderRadius: '12px',
        fontWeight: '500',
        whiteSpace: 'nowrap'
    },
    badge_pending: {
        backgroundColor: '#f1f5f9',
        color: '#64748b'
    },
    badge_running: {
        backgroundColor: '#dbeafe',
        color: '#1e40af'
    },
    badge_done: {
        backgroundColor: '#dcfce7',
        color: '#166534'
    },
    badge_error: {
        backgroundColor: '#fee2e2',
        color: '#991b1b'
    },
    fleche: {
        color: '#94a3b8',
        fontSize: '18px',
        fontWeight: '300'
    },
    journal: {
        backgroundColor: '#0f172a',
        borderRadius: '10px',
        padding: '16px',
        marginTop: '8px'
    },
    journalTitre: {
        color: '#94a3b8',
        fontSize: '12px',
        fontWeight: '500',
        marginBottom: '10px'
    },
    journalMessages: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        maxHeight: '200px',
        overflowY: 'auto'
    },
    journalMessage: {
        display: 'flex',
        gap: '10px',
        fontSize: '12px',
        color: '#e2e8f0',
        lineHeight: '1.5'
    },
    journalHeure: {
        color: '#64748b',
        minWidth: '70px',
        fontFamily: 'monospace'
    }
};

export default AgentProgressBar;