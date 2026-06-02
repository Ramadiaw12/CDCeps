// ============================================================
// pages/LandingPage.jsx - Version refondue sans répétition
// ============================================================

import { Link } from 'react-router-dom';
// import { useState, useEffect, useRef } from 'react';





function LandingPage() {
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

            {/* SECTION 1 : Pipeline de traitement (remplace les étapes) */}
            <section className="section pipeline-section">
                <div className="container">
                    <h2 className="section-title">Comment ça fonctionne ?</h2>
                    <p className="section-subtitle">
                        Un pipeline intelligent en 4 étapes qui transforme votre description en CDC professionnel
                    </p>

                    <div className="pipeline">
                        {pipeline.map((step, index) => (
                            <div key={index} className="pipeline-step">
                                <div className="pipeline-connector">
                                    <div className="pipeline-number">{index + 1}</div>
                                    {index < pipeline.length - 1 && <div className="pipeline-line"></div>}
                                </div>
                                <div className="pipeline-content">
                                    <div className="pipeline-icon">{step.icone}</div>
                                    <h3 className="pipeline-title">{step.titre}</h3>
                                    <p className="pipeline-desc">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 2 : Architecture des agents (visuel + détails techniques) */}
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

                    {/* Schéma de communication entre agents */}
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
            <section className="benefits-section">
                <div className="container">
                    <div className="benefits-header">
                        <div className="benefits-badge">
                            <span>✨</span>
                            <span>Pourquoi c'est utile</span>
                        </div>
                        <h2 className="benefits-title">
                            Ce que <span>CDCEPS</span> apporte à l'équipe
                        </h2>
                        <p className="benefits-subtitle">
                            Des bénéfices concrets pour les ingénieurs et chefs de projet
                        </p>
                    </div>

                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <div className="benefit-icon-wrapper">
                                <div className="benefit-icon">⚡</div>
                            </div>
                            <h3>Gain de temps</h3>
                            <p>Rédigez vos cahiers des charges en 10 minutes au lieu de plusieurs heures.</p>
                            <div className="benefit-link">
                                En savoir plus <span>→</span>
                            </div>
                        </div>

                        <div className="benefit-card">
                            <div className="benefit-icon-wrapper">
                                <div className="benefit-icon">🎯</div>
                            </div>
                            <h3>Précision améliorée</h3>
                            <p>Réduction des oublis et incohérences grâce à l'analyse structurée.</p>
                            <div className="benefit-link">
                                En savoir plus <span>→</span>
                            </div>
                        </div>

                        <div className="benefit-card">
                            <div className="benefit-icon-wrapper">
                                <div className="benefit-icon">📐</div>
                            </div>
                            <h3>Standardisation</h3>
                            <p>Homogénéisez la qualité de tous vos documents projets.</p>
                            <div className="benefit-link">
                                En savoir plus <span>→</span>
                            </div>
                        </div>

                        <div className="benefit-card">
                            <div className="benefit-icon-wrapper">
                                <div className="benefit-icon">📚</div>
                            </div>
                            <h3>Traçabilité</h3>
                            <p>Gardez l'historique complet de tous vos CDC avec versionnement.</p>
                            <div className="benefit-link">
                                En savoir plus <span>→</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION : KPIs après déploiement */}
            <section className="section-alt kpi-section">
                <div className="container">
                    <h2 className="section-title">Impact mesuré</h2>
                    <p className="section-subtitle">
                        Résultats observés après 3 mois d'utilisation en interne
                    </p>

                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <div className="kpi-value">-65%</div>
                            <div className="kpi-label">Temps de rédaction</div>
                            <div className="kpi-desc">Comparé à la méthode manuelle</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-value">+40%</div>
                            <div className="kpi-label">Complétude des CDC</div>
                            <div className="kpi-desc">Moins d'oublis dans les spécifications</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-value">12</div>
                            <div className="kpi-label">Projets traités</div>
                            <div className="kpi-desc">Depuis le lancement du pilote</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-value">100%</div>
                            <div className="kpi-label">Satisfaction interne</div>
                            <div className="kpi-desc">Des équipes utilisatrices</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="cta-engineering-section">
                <div className="container">
                    <div className="cta-engineering-card">
                        <div className="cta-engineering-badge">
                            <span className="badge-icon"></span>
                            <span>Testez en moins de 2 minutes</span>
                        </div>
                        
                        <h2 className="cta-engineering-title">
                            Prêt à automatiser vos 
                            <span className="title-highlight"> cahiers des charges ?</span>
                        </h2>
                        
                        <p className="cta-engineering-description">
                            Gagnez en productivité et standardisez vos livrables techniques.
                            Aucune installation requise, lancez-vous immédiatement.
                        </p>
                        
                        <div className="cta-engineering-buttons">
                            <Link to="/nouveau-projet" className="cta-primary-btn">
                                <span>✨</span>
                                Générer mon premier CDC
                                <span className="btn-arrow">→</span>
                            </Link>
                            <button className="cta-secondary-btn">
                                <span>📖</span>
                                Voir la documentation
                            </button>
                        </div>
                        
                        <div className="cta-engineering-features">
                            <div className="feature-item">
                                <span className="feature-check">✓</span>
                                <span>Gratuit pour les tests</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-check">✓</span>
                                <span>Export PDF/Markdown</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-check">✓</span>
                                <span>Support technique inclus</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Données du pipeline (remplace les anciennes étapes)
const pipeline = [
    {
        icone: '📝',
        titre: 'Saisie intuitive',
        description: 'Remplissez un formulaire simple avec la description de votre projet et vos contraintes.'
    },
    {
        icone: '🧠',
        titre: 'Analyse sémantique',
        description: 'L\'IA extrait les besoins, les contraintes et les objectifs de votre description.'
    },
    {
        icone: '🤝',
        titre: 'Orchestration agents',
        description: 'Les 4 agents travaillent en synergie pour structurer et enrichir le contenu.'
    },
    {
        icone: '📄',
        titre: 'Génération finale',
        description: 'Production d\'un cahier des charges professionnel prêt à être exporté.'
    }
];

// Données des agents (version enrichie)
const agents = [
    {
        icone: '🔍',
        nom: 'Agent Collecte',
        role: 'Extrait et structure les besoins depuis la description brute du client.',
        couleur: '#3b82f6',
        skills: ['NLP', 'Extraction', 'Structuration']
    },
    {
        icone: '📊',
        nom: 'Agent Analyse',
        role: 'Classifie les besoins par priorité et identifie les risques du projet.',
        couleur: '#8b5cf6',
        skills: ['Priorisation', 'Risques', 'Dépendances']
    },
    {
        icone: '✍️',
        nom: 'Agent Génération',
        role: 'Génère le CDC complet en Markdown en s\'appuyant sur les anciens CDC.',
        couleur: '#10b981',
        skills: ['Markdown', 'Templates RAG', 'Contenu']
    },
    {
        icone: '✅',
        nom: 'Agent Validation',
        role: 'Vérifie la cohérence du CDC et calcule un score de complétude.',
        couleur: '#f59e0b',
        skills: ['Validation', 'Score', 'Cohérence']
    }
];

// Données des avantages
const benefits = [
    {
        icone: '⚡',
        titre: 'Gain de temps',
        description: 'Rédigez vos cahiers des charges en 10 minutes au lieu de plusieurs jours.'
    },
    {
        icone: '🎯',
        titre: 'Précision améliorée',
        description: 'Réduction des oublis et des incohérences grâce à l\'analyse structurée.'
    },
    {
        icone: '🔄',
        titre: 'Standardisation',
        description: 'Homogénéisez la qualité de tous vos documents projets.'
    },
    {
        icone: '📈',
        titre: 'Traçabilité',
        description: 'Gardez l\'historique de tous vos CDC avec versionnement.'
    }
];

// Données des témoignages
const testimonials = [
    {
        text: 'CDCEPS nous a fait gagner un temps précieux sur la rédaction des spécifications. La qualité est constante et professionnelle.',
        name: 'Ahmed Benali',
        role: 'Chef de projet technique',
        avatar: 'AB'
    },
    {
        text: 'Les agents IA sont impressionnants. L\'analyse des risques nous a permis d\'anticiper des problèmes majeurs sur nos projets.',
        name: 'Sarah Mansouri',
        role: 'Directrice technique',
        avatar: 'SM'
    },
    {
        text: 'Un outil indispensable pour toute équipe qui veut standardiser ses processus de spécification.',
        name: 'Karim Hadj',
        role: 'Consultant IT',
        avatar: 'KH'
    }
];

export default LandingPage;