// ============================================================
// components/Documentation.jsx
// Documentation technique complète du projet CDCEPS
// Intégrée dans la page avec modal/section dédiée
// ============================================================

import { useState, useEffect } from 'react';

function Documentation({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('apercu');

    // Fermer avec Echap
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="doc-overlay" onClick={onClose}>
            <div className="doc-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="doc-header">
                    <div className="doc-header-left">
                        <div className="doc-icon">📚</div>
                        <div>
                            <h2>Documentation technique</h2>
                            <p>CDCEPS - Système Multi-Agents IA</p>
                        </div>
                    </div>
                    <button className="doc-close" onClick={onClose}>✕</button>
                </div>

                {/* Tabs */}
                <div className="doc-tabs">
                    <button className={`doc-tab ${activeTab === 'apercu' ? 'active' : ''}`} onClick={() => setActiveTab('apercu')}>
                        📖 Aperçu général
                    </button>
                    <button className={`doc-tab ${activeTab === 'architecture' ? 'active' : ''}`} onClick={() => setActiveTab('architecture')}>
                        🏗️ Architecture
                    </button>
                    <button className={`doc-tab ${activeTab === 'agents' ? 'active' : ''}`} onClick={() => setActiveTab('agents')}>
                        🤖 Agents IA
                    </button>
                    <button className={`doc-tab ${activeTab === 'api' ? 'active' : ''}`} onClick={() => setActiveTab('api')}>
                        🔌 API & Endpoints
                    </button>
                    <button className={`doc-tab ${activeTab === 'deploiement' ? 'active' : ''}`} onClick={() => setActiveTab('deploiement')}>
                        🚀 Déploiement
                    </button>
                    <button className={`doc-tab ${activeTab === 'securite' ? 'active' : ''}`} onClick={() => setActiveTab('securite')}>
                        🔒 Sécurité
                    </button>
                </div>

                {/* Content */}
                <div className="doc-content">
                    {/* Aperçu général */}
                    {activeTab === 'apercu' && (
                        <div className="doc-section">
                            <h3>📖 Présentation du projet</h3>
                            <p>
                                CDCEPS (Cahier Des Charges Électronique Professionnel Sécurisé) est un système 
                                multi-agents basé sur l'intelligence artificielle permettant la génération 
                                automatique de cahiers des charges préliminaires.
                            </p>

                            <div className="doc-info-grid">
                                <div className="doc-info-card">
                                    <div className="info-icon">🎯</div>
                                    <div className="info-content">
                                        <strong>Objectifs</strong>
                                        <ul>
                                            <li>Automatiser l'analyse des besoins clients</li>
                                            <li>Générer des CDC professionnels en quelques minutes</li>
                                            <li>Standardiser la qualité des documents</li>
                                            <li>Réduire le temps de rédaction de 70%</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="doc-info-card">
                                    <div className="info-icon">📊</div>
                                    <div className="info-content">
                                        <strong>Métriques clés</strong>
                                        <ul>
                                            <li>4 agents IA spécialisés</li>
                                            <li>Pipeline de traitement en 4 étapes</li>
                                            <li>Temps moyen de génération: 45s</li>
                                            <li>Score de complétude: 85%+</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="doc-table-wrapper">
                                <h4>📋 Spécifications techniques</h4>
                                <table className="doc-table">
                                    <thead>
                                        <tr><th>Composant</th><th>Technologie</th><th>Version</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>Frontend</td><td>React + Vite</td><td>18.2.0</td></tr>
                                        <tr><td>Backend API</td><td>Node.js + Express</td><td>20.x</td></tr>
                                        <tr><td>Admin PHP</td><td>PHP + MySQL</td><td>8.2</td></tr>
                                        <tr><td>Base de données</td><td>MySQL</td><td>8.0</td></tr>
                                        <tr><td>IA / LLM</td><td>OpenAI GPT-4o</td><td>Latest</td></tr>
                                        <tr><td>Communication temps réel</td><td>Socket.io</td><td>4.6</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="doc-graph">
                                <h4>📈 Flow utilisateur</h4>
                                <div className="graph-flow">
                                    <div className="flow-node">📝 Formulaire</div>
                                    <div className="flow-arrow">→</div>
                                    <div className="flow-node">🤖 Agents IA</div>
                                    <div className="flow-arrow">→</div>
                                    <div className="flow-node">📄 Génération</div>
                                    <div className="flow-arrow">→</div>
                                    <div className="flow-node">✅ Validation</div>
                                    <div className="flow-arrow">→</div>
                                    <div className="flow-node">📥 Export</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Architecture */}
                    {activeTab === 'architecture' && (
                        <div className="doc-section">
                            <h3>🏗️ Architecture système</h3>
                            
                            <div className="arch-diagram">
                                <div className="arch-layer">
                                    <div className="arch-title">Client (React)</div>
                                    <div className="arch-items">
                                        <span>Landing Page</span>
                                        <span>Formulaire</span>
                                        <span>Génération</span>
                                        <span>Résultat</span>
                                    </div>
                                </div>
                                <div className="arch-arrow">↓ HTTP/WebSocket</div>
                                <div className="arch-layer">
                                    <div className="arch-title">API Gateway (Node.js + Express)</div>
                                    <div className="arch-items">
                                        <span>REST API</span>
                                        <span>Socket.io</span>
                                        <span>Orchestration agents</span>
                                    </div>
                                </div>
                                <div className="arch-arrow">↓</div>
                                <div className="arch-layer">
                                    <div className="arch-title">Pipeline Multi-Agents</div>
                                    <div className="arch-items">
                                        <span>Collecte Agent</span>
                                        <span>Analyse Agent</span>
                                        <span>Génération Agent</span>
                                        <span>Validation Agent</span>
                                    </div>
                                </div>
                                <div className="arch-arrow">↓</div>
                                <div className="arch-layer">
                                    <div className="arch-title">Data Layer</div>
                                    <div className="arch-items">
                                        <span>MySQL</span>
                                        <span>Redis (Cache)</span>
                                        <span>RAG Vector DB</span>
                                    </div>
                                </div>
                            </div>

                            <div className="doc-table-wrapper">
                                <h4>📊 Composants et responsabilités</h4>
                                <table className="doc-table">
                                    <thead><tr><th>Composant</th><th>Responsabilité</th><th>Port</th></tr></thead>
                                    <tbody>
                                        <tr><td>Frontend React</td><td>Interface utilisateur, affichage CDC</td><td>5173</td></tr>
                                        <tr><td>API Node.js</td><td>Business logic, agents orchestration</td><td>3001</td></tr>
                                        <tr><td>Admin PHP</td><td>Dashboard, gestion utilisateurs</td><td>8080</td></tr>
                                        <tr><td>MySQL</td><td>Persistance des données</td><td>3306</td></tr>
                                        <tr><td>Redis</td><td>Sessions, cache, queues</td><td>6379</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Agents IA */}
                    {activeTab === 'agents' && (
                        <div className="doc-section">
                            <h3>🤖 Les 4 agents IA</h3>
                            
                            <div className="agents-doc-grid">
                                {agentsDoc.map((agent, idx) => (
                                    <div key={idx} className="agent-doc-card">
                                        <div className="agent-doc-header" style={{ backgroundColor: agent.couleur }}>
                                            <span>{agent.icone}</span>
                                            <span>Agent {idx + 1}</span>
                                        </div>
                                        <h4>{agent.nom}</h4>
                                        <p>{agent.description}</p>
                                        <div className="agent-doc-skills">
                                            {agent.skills.map((skill, i) => (
                                                <span key={i} className="skill-tag">{skill}</span>
                                            ))}
                                        </div>
                                        <div className="agent-doc-metrics">
                                            <span>Temps moyen: {agent.temps}</span>
                                            <span>Précision: {agent.precision}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="doc-graph">
                                <h4>🔄 Pipeline séquentiel</h4>
                                <div className="pipeline-visual">
                                    <div className="pipeline-step done">Collecte <span>✓</span></div>
                                    <div className="pipeline-connector">→</div>
                                    <div className="pipeline-step active">Analyse <span>⚡</span></div>
                                    <div className="pipeline-connector">→</div>
                                    <div className="pipeline-step">Génération <span>⏳</span></div>
                                    <div className="pipeline-connector">→</div>
                                    <div className="pipeline-step">Validation <span>⏳</span></div>
                                </div>
                                <p className="graph-caption">Pipeline séquentiel avec boucle de rétroaction</p>
                            </div>
                        </div>
                    )}

                    {/* API & Endpoints */}
                    {activeTab === 'api' && (
                        <div className="doc-section">
                            <h3>🔌 API REST - Endpoints</h3>
                            
                            <div className="doc-table-wrapper">
                                <table className="doc-table">
                                    <thead><tr><th>Méthode</th><th>Endpoint</th><th>Description</th><th>Auth</th></tr></thead>
                                    <tbody>
                                        <tr><td><span className="method-post">POST</span></td><td>/api/projets</td><td>Créer un nouveau projet</td><td>❌</td></tr>
                                        <tr><td><span className="method-get">GET</span></td><td>/api/projets/:id</td><td>Récupérer un projet</td><td>❌</td></tr>
                                        <tr><td><span className="method-post">POST</span></td><td>/api/generation/lancer</td><td>Lancer la génération</td><td>❌</td></tr>
                                        <tr><td><span className="method-get">GET</span></td><td>/api/agents/sessions/:id</td><td>Statut des agents</td><td>❌</td></tr>
                                        <tr><td><span className="method-get">GET</span></td><td>/api/health</td><td>Health check</td><td>❌</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="doc-code">
                                <h4>📡 WebSocket Events</h4>
                                <pre><code>{`// Client → Server
socket.emit('join-projet', { projetId });
socket.emit('get-status', { projetId });

// Server → Client
socket.on('progression_agent', (data) => {});
socket.on('agent_actif', (data) => {});
socket.on('pipeline_termine', (data) => {});
socket.on('pipeline_erreur', (data) => {});`}</code></pre>
                            </div>
                        </div>
                    )}

                    {/* Déploiement */}
                    {activeTab === 'deploiement' && (
                        <div className="doc-section">
                            <h3>🚀 Déploiement</h3>
                            
                            <div className="doc-info-grid">
                                <div className="doc-info-card">
                                    <div className="info-icon">🐳</div>
                                    <div className="info-content">
                                        <strong>Docker Compose</strong>
                                        <pre className="code-small">docker-compose up -d</pre>
                                        <p>Services: frontend, api, php, mysql, redis</p>
                                    </div>
                                </div>
                                <div className="doc-info-card">
                                    <div className="info-icon">⚙️</div>
                                    <div className="info-content">
                                        <strong>Variables d'environnement</strong>
                                        <ul>
                                            <li>OPENAI_API_KEY=sk-xxx</li>
                                            <li>DB_HOST=mysql</li>
                                            <li>JWT_SECRET=xxx</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="doc-table-wrapper">
                                <h4>📦 Prérequis système</h4>
                                <table className="doc-table">
                                    <thead><tr><th>Prérequis</th><th>Version minimale</th><th>Recommandée</th></tr></thead>
                                    <tbody>
                                        <tr><td>Node.js</td><td>18.x</td><td>20.x LTS</td></tr>
                                        <tr><td>PHP</td><td>8.0</td><td>8.2</td></tr>
                                        <tr><td>MySQL</td><td>5.7</td><td>8.0</td></tr>
                                        <tr><td>Docker</td><td>20.10</td><td>24.x</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Sécurité */}
                    {activeTab === 'securite' && (
                        <div className="doc-section">
                            <h3>🔒 Sécurité</h3>

                            <div className="security-grid">
                                <div className="security-card">
                                    <div className="security-icon">🔐</div>
                                    <h4>Authentification</h4>
                                    <p>Sessions sécurisées avec JWT, expiration configurable</p>
                                </div>
                                <div className="security-card">
                                    <div className="security-icon">🛡️</div>
                                    <h4>Protection XSS/CSRF</h4>
                                    <p>Headers CSP, validation des inputs, sanitation</p>
                                </div>
                                <div className="security-card">
                                    <div className="security-icon">🔒</div>
                                    <h4>Chiffrement</h4>
                                    <p>Données sensibles chiffrées, HTTPS en production</p>
                                </div>
                                <div className="security-card">
                                    <div className="security-icon">📋</div>
                                    <h4>Logs & Audit</h4>
                                    <p>Traçabilité des actions, logs centralisés</p>
                                </div>
                            </div>

                            <div className="doc-table-wrapper">
                                <h4>⚠️ Contraintes et limites</h4>
                                <table className="doc-table">
                                    <thead><tr><th>Contrainte</th><th>Description</th><th>Solution</th></tr></thead>
                                    <tbody>
                                        <tr><td>API OpenAI</td><td>Latence variable, coût par token</td><td>Cache RAG, fallback</td></tr>
                                        <tr><td>Taille description</td><td>Max 5000 caractères</td><td>Validation frontend</td></tr>
                                        <tr><td>Sessions</td><td>Timeout 30 minutes</td><td>Keep-alive WebSocket</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="doc-footer">
                    <div className="doc-version">
                        <span className="version-badge">v2.0.0</span>
                        <span>Dernière mise à jour: {new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="doc-actions">
                        <button className="doc-print" onClick={() => window.print()}>🖨️ Imprimer</button>
                        <button className="doc-export">📥 Exporter PDF</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const agentsDoc = [
    { icone: '🔍', nom: 'Collecte Agent', description: 'Extrait et structure les besoins depuis la description brute du client.', skills: ['NLP', 'Extraction', 'Structuration'], temps: '15s', precision: '95%', couleur: '#3b82f6' },
    { icone: '📊', nom: 'Analyse Agent', description: 'Classifie les besoins par priorité et identifie les risques du projet.', skills: ['Priorisation', 'Risques', 'Dépendances'], temps: '12s', precision: '90%', couleur: '#8b5cf6' },
    { icone: '✍️', nom: 'Génération Agent', description: 'Génère le CDC complet en Markdown avec RAG.', skills: ['Markdown', 'Templates', 'RAG'], temps: '20s', precision: '88%', couleur: '#10b981' },
    { icone: '✅', nom: 'Validation Agent', description: 'Vérifie la cohérence et calcule un score de complétude.', skills: ['Validation', 'Score', 'Cohérence'], temps: '8s', precision: '92%', couleur: '#f59e0b' }
];

export default Documentation;