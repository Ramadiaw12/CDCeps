// ============================================================
// pages/LandingPage.jsx - Version refondue sans répétition
// ============================================================

import { Link } from 'react-router-dom';
import { useState } from 'react';  
import Documentation from "../components/Documentation";

function LandingPage() {
    const [showDoc, setShowDoc] = useState(false);
    
    return (
        <div className="page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="hero-badge-dot"></span>
                            Système Multi-Agents IA
                        </div>

                        <h1 className="hero-title">
                            Générez vos cahiers des charges
                            <span className="hero-title-gradient"> en quelques minutes</span>
                        </h1>

                        <p className="hero-description">
                            CDCEPS automatise l'analyse des besoins clients et génère
                            des cahiers des charges préliminaires professionnels grâce
                            à l'intelligence artificielle et au système multi-agents.
                        </p>

                        <div className="hero-buttons">
                            <Link to="/nouveau-projet" className="btn btn-primary hero-btn-primary">
                                ✨ Générer un CDC maintenant
                                <span className="hero-btn-arrow">→</span>
                            </Link>
                            <button className="btn hero-btn-secondary">
                                🎥 Voir la démo
                            </button>
                        </div>

                        <div className="hero-stats">
                            <div className="hero-stat">
                                <div className="hero-stat-number">500+</div>
                                <div className="hero-stat-label">CDC générés</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-number">98%</div>
                                <div className="hero-stat-label">Satisfaction</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-number">10min</div>
                                <div className="hero-stat-label">Gain de temps</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-orb hero-orb-1"></div>
                <div className="hero-orb hero-orb-2"></div>
                <div className="hero-orb hero-orb-3"></div>
                <div className="hero-orb hero-orb-4"></div>
                <div className="hero-wave">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="currentColor" opacity="0.05"></path>
                    </svg>
                </div>
            </section>

            

            {/* SECTION 2 : Architecture des agents */}
            <section className="section-alt agents-architecture">
                <div className="container">
                    <h2 className="section-title">Architecture multi-agents</h2>
                    <p className="section-subtitle">
                        Quatre agents IA spécialisés travaillent en orchestration pour garantir la qualité
                    </p>

                    <div className="agents-visual">
                        <div className="agents-grid-full">
                            {agents.map((agent, index) => (
                                <div key={index} className="agent-card-detailed">
                                    <div className="agent-header">
                                        <div className="agent-badge" style={{ backgroundColor: agent.couleur }}>
                                            Agent {index + 1}
                                        </div>
                                        <div className="agent-icon">{agent.icone}</div>
                                    </div>
                                    <h3 className="agent-name-detailed">{agent.nom}</h3>
                                    <p className="agent-role-detailed">{agent.role}</p>
                                    <div className="agent-skills">
                                        {agent.skills.map((skill, i) => (
                                            <span key={i} className="agent-skill">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="agents-communication">
                        <div className="comm-title">🔄 Orchestration des agents</div>
                        <div className="comm-flow">
                            <span className="comm-node">Collecte</span>
                            <span className="comm-arrow">→</span>
                            <span className="comm-node">Analyse</span>
                            <span className="comm-arrow">→</span>
                            <span className="comm-node">Génération</span>
                            <span className="comm-arrow">→</span>
                            <span className="comm-node">Validation</span>
                        </div>
                        <p className="comm-desc">
                            Pipeline séquentiel avec boucle de rétroaction pour optimisation continue
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION : Bénéfices pour l'équipe */}
            
            {/* CTA Final */}
            <section className="cta-engineering-section">
    <div className="container">
        <div className="cta-engineering-card">
            <div className="cta-engineering-badge">
                <span className="badge-icon">⚙️</span>
                <span>Pensé pour les chefs de projet</span>
            </div>
            <h2 className="cta-engineering-title">
                Un CDC professionnel, 
                <span className="title-highlight"> pas une nuit blanche</span>
            </h2>
            <p className="cta-engineering-description">
                Vous connaissez le projet, vous connaissez le client — laissez CDCEPS
                structurer, rédiger et vérifier le document. Vous gardez la main sur
                le fond, vous gagnez des heures sur la forme.
            </p>
            <div className="cta-engineering-buttons">
                <Link to="/nouveau-projet" className="cta-primary-btn">
                    <span>⚡</span>
                    Générer mon premier CDC
                    <span className="btn-arrow">→</span>
                </Link>
                <button 
                    className="cta-secondary-btn" 
                    onClick={() => setShowDoc(true)}
                >
                    <span>📖</span>
                    Voir la documentation technique
                </button>
            </div>
            <div className="cta-engineering-features">
                <div className="feature-item">
                    <span className="feature-check">✓</span>
                    <span>Un CDC prêt à présenter, projet après projet</span>
                </div>
                <div className="feature-item">
                    <span className="feature-check">✓</span>
                    <span>Export PDF/Markdown, prêt à envoyer au client</span>
                </div>
                <div className="feature-item">
                    <span className="feature-check">✓</span>
                    <span>Un agent dédié relit et valide avant vous</span>
                </div>
            </div>
        </div>
    </div>
</section>
            {/* Documentation Modal */}
            <Documentation isOpen={showDoc} onClose={() => setShowDoc(false)} />
        </div>
    );
}

// Données du pipeline
const pipeline = [
    {
        icone: '',
        titre: 'Saisie intuitive',
        description: 'Remplissez un formulaire simple avec la description de votre projet et vos contraintes.'
    },
    {
        icone: '',
        titre: 'Analyse sémantique',
        description: 'L\'IA extrait les besoins, les contraintes et les objectifs de votre description.'
    },
    {
        icone: '',
        titre: 'Orchestration agents',
        description: 'Les 4 agents travaillent en synergie pour structurer et enrichir le contenu.'
    },
    {
        icone: '',
        titre: 'Génération finale',
        description: 'Production d\'un cahier des charges professionnel prêt à être exporté.'
    }
];

// Données des agents
const agents = [
    {
        icone: '',
        nom: 'Agent Collecte',
        role: 'Extrait et structure les besoins depuis la description brute du client.',
        couleur: '#3b82f6',
        skills: ['NLP', 'Extraction', 'Structuration']
    },
    {
        icone: '',
        nom: 'Agent Analyse',
        role: 'Classifie les besoins par priorité et identifie les risques du projet.',
        couleur: '#8b5cf6',
        skills: ['Priorisation', 'Risques', 'Dépendances']
    },
    {
        icone: '',
        nom: 'Agent Génération',
        role: 'Génère le CDC complet en Markdown en s\'appuyant sur les anciens CDC.',
        couleur: '#10b981',
        skills: ['Markdown', 'Templates RAG', 'Contenu']
    },
    {
        icone: '',
        nom: 'Agent Validation',
        role: 'Vérifie la cohérence du CDC et calcule un score de complétude.',
        couleur: '#f59e0b',
        skills: ['Validation', 'Score', 'Cohérence']
    }
];

export default LandingPage;