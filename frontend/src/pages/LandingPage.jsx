// ============================================================
// pages/LandingPage.jsx
// Page d'accueil de l'application CDCEPS
// Présente le système et ses fonctionnalités
// ============================================================

import { Link } from 'react-router-dom';

function LandingPage() {
    return (
        <div className="page">
            {/* Hero Section - Design animé attractif */}
            <section className="hero">
                <div className="container hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="hero-badge-dot"></span>
                            🤖 Système Multi-Agents IA
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

                        {/* Statistiques */}
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <div className="hero-stat-number">500+</div>
                                <div className="hero-stat-label">CDG générés</div>
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

                {/* Éléments décoratifs animés */}
                <div className="hero-orb hero-orb-1"></div>
                <div className="hero-orb hero-orb-2"></div>
                <div className="hero-orb hero-orb-3"></div>
                <div className="hero-orb hero-orb-4"></div>
                
                {/* Vague décorative */}
                <div className="hero-wave">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="currentColor" opacity="0.05"></path>
                    </svg>
                </div>
            </section>

            {/* Comment ça marche */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Comment ça marche ?</h2>
                    <p className="section-subtitle">
                        Un processus simple et rapide en 4 étapes
                    </p>

                    <div className="steps-grid">
                        {etapes.map((etape, index) => (
                            <div key={index} className="card step-card">
                                <div className="step-number">{index + 1}</div>
                                <div className="step-icon">{etape.icone}</div>
                                <h3 className="step-title">{etape.titre}</h3>
                                <p className="step-description">{etape.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Les 4 Agents */}
            <section className="section section-alt">
                <div className="container">
                    <h2 className="section-title">Les 4 agents IA</h2>
                    <p className="section-subtitle">
                        Chaque agent est spécialisé dans une tâche précise
                        et travaille en pipeline pour produire un CDC de qualité.
                    </p>

                    <div className="agents-grid">
                        {agents.map((agent, index) => (
                            <div key={index} className="card agent-card">
                                <div 
                                    className="agent-number"
                                    style={{ backgroundColor: agent.couleur }}
                                >
                                    {index + 1}
                                </div>
                                <h3 className="agent-name">{agent.nom}</h3>
                                <p className="agent-role">{agent.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <div className="cta-text">
                            <h2 className="cta-title">Prêt à générer votre premier CDC ?</h2>
                            <p className="cta-description">
                                Rejoignez les centaines d'entreprises qui utilisent CDCEPS
                            </p>
                        </div>
                        <Link to="/nouveau-projet" className="btn btn-primary cta-button">
                            🚀 Commencer maintenant
                            <span className="cta-arrow">→</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Données
const etapes = [
    {
        icone: '📝',
        titre: 'Décrivez votre projet',
        description: 'Remplissez le formulaire avec les informations de base de votre projet client.'
    },
    {
        icone: '🤖',
        titre: 'Les agents analysent',
        description: '4 agents IA spécialisés analysent, structurent et enrichissent vos besoins.'
    },
    {
        icone: '📄',
        titre: 'CDC généré',
        description: 'Un cahier des charges complet et professionnel est généré en quelques minutes.'
    },
    {
        icone: '⬇️',
        titre: 'Exportez',
        description: 'Téléchargez votre CDC en PDF ou Markdown, prêt à soumettre au client.'
    }
];

const agents = [
    {
        nom: 'Agent Collecte',
        role: 'Extrait et structure les besoins depuis la description brute du client.',
        couleur: '#3b82f6'
    },
    {
        nom: 'Agent Analyse',
        role: 'Classifie les besoins par priorité et identifie les risques du projet.',
        couleur: '#8b5cf6'
    },
    {
        nom: 'Agent Génération',
        role: 'Génère le CDC complet en Markdown en s\'appuyant sur les anciens CDC.',
        couleur: '#10b981'
    },
    {
        nom: 'Agent Validation',
        role: 'Vérifie la cohérence du CDC et calcule un score de complétude.',
        couleur: '#f59e0b'
    }
];

export default LandingPage;