// ============================================================
// pages/LandingPage.jsx
// Page d'accueil de l'application CDCEPS
// Présente le système et ses fonctionnalités
// ============================================================

import { Link } from 'react-router-dom';

function LandingPage() {
    return (
        <div className="page">
            {/*  Hero Section  */}
            <section style={styles.hero}>
                <div className="container" style={styles.container}>
                    <div style={styles.heroContent}>
                    <div style={styles.badge}>
                        <span style={styles.badgeDot}></span>
                        Système Multi-Agents IA
                    </div>

                    <h1 style={styles.titre}>
                        Générez vos cahiers des charges
                        <span style={styles.titreBleu}> en quelques minutes</span>
                    </h1>

                    <p style={styles.description}>
                        CDCEPS automatise l'analyse des besoins clients et génère
                        des cahiers des charges préliminaires professionnels grâce
                        à l'intelligence artificielle et au système multi-agents.
                    </p>

                    <div style={styles.heroBtns}>
                        <Link to="/nouveau-projet" style={styles.btnPrimary}>
                        ✨ Générer un CDC maintenant
                        <span style={styles.btnArrow}>→</span>
                        </Link>
                        <button style={styles.btnSecondary}>
                        🎥 Voir la démo
                        </button>
                    </div>

                    {/* Éléments décoratifs animés */}
                    <div style={styles.floatingOrb1}></div>
                    <div style={styles.floatingOrb2}></div>
                    <div style={styles.floatingOrb3}></div>
                    </div>
                </div>

                {/* Vagues décoratives */}
                <div style={styles.wave}>
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="rgba(255,255,255,0.05)"></path>
                    </svg>
                </div>
            </section>

            {/*  Comment ça marche  */}
            <section style={styles.section}>
                <div className="container">
                    <h2 style={styles.sectionTitre}>Comment ça marche ?</h2>

                    <div style={styles.etapesGrid}>
                        {etapes.map((etape, index) => (
                            <div key={index} className="card" style={styles.etapeCard}>
                                <div style={styles.etapeNumero}>{index + 1}</div>
                                <div style={styles.etapeIcone}>{etape.icone}</div>
                                <h3 style={styles.etapeTitre}>{etape.titre}</h3>
                                <p style={styles.etapeDesc}>{etape.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/*  Les 4 Agents  */}
            <section style={{ ...styles.section}}>
                <div className="container">
                    <h2 style={styles.sectionTitre}>Les 4 agents IA</h2>
                    <p style={styles.sectionDesc}>
                        Chaque agent est spécialisé dans une tâche précise
                        et travaille en pipeline pour produire un CDC de qualité.
                    </p>

                    <div style={styles.agentsGrid}>
                        {agents.map((agent, index) => (
                            <div key={index} className="card" style={styles.agentCard}>
                                <div style={{
                                    ...styles.agentNumero,
                                    backgroundColor: agent.couleur
                                }}>
                                    {index + 1}
                                </div>
                                <h3 style={styles.agentNom}>{agent.nom}</h3>
                                <p style={styles.agentRole}>{agent.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/*  CTA Final  */}
            
        </div>
    );
}

//  Données 

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

//  Styles 

const styles = {
    hero: {
        backgroundColor: 'var(--surface)',
        padding: '80px 0',
        borderBottom: '1px solid var(--border)'
    },
    heroContent: {
        maxWidth: '700px'
    },
    badge: {
        display: 'inline-block',
        backgroundColor: 'var(--primary-light)',
        color: 'var(--primary)',
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '500',
        marginBottom: '24px'
    },
    titre: {
        fontSize: '42px',
        fontWeight: '700',
        lineHeight: '1.2',
        marginBottom: '20px',
        color: 'var(--text)'
    },
    titreBleu: {
        color: 'var(--primary)'
    },
    description: {
        fontSize: '17px',
        color: 'var(--text-muted)',
        marginBottom: '32px',
        lineHeight: '1.7'
    },
    heroBtns: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },
    section: {
        padding: '70px 0'
    },
    sectionTitre: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text)',
        marginBottom: '12px',
        textAlign: 'center'
    },
    sectionDesc: {
        color: 'var(--text-muted)',
        textAlign: 'center',
        marginBottom: '40px',
        fontSize: '15px'
    },
    etapesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        marginTop: '40px'
    },
    etapeCard: {
        textAlign: 'center',
        padding: '32px 24px'
    },
    etapeNumero: {
        width: '32px',
        height: '32px',
        backgroundColor: 'var(--primary-light)',
        color: 'var(--primary)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '14px',
        margin: '0 auto 12px'
    },
    etapeIcone: {
        fontSize: '36px',
        marginBottom: '16px'
    },
    etapeTitre: {
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '10px',
        color: 'var(--text)'
    },
    etapeDesc: {
        fontSize: '14px',
        color: 'var(--text-muted)',
        lineHeight: '1.6'
    },
    agentsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
    },
    agentCard: {
        padding: '24px'
    },
    agentNumero: {
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '700',
        fontSize: '16px',
        marginBottom: '14px'
    },
    agentNom: {
        fontSize: '15px',
        fontWeight: '600',
        color: 'var(--text)',
        marginBottom: '8px'
    },
    agentRole: {
        fontSize: '13px',
        color: 'var(--text-muted)',
        lineHeight: '1.6'
    },
    cta: {
        backgroundColor: '#87CEEB',
        padding: '60px 0'
    },
    ctaContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px'
    },
    ctaTitre: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#0A0A0A'
    },
 hero: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    position: 'relative',
    zIndex: 2,
  },
  heroContent: {
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    padding: '8px 20px',
    borderRadius: '40px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#a78bfa',
    marginBottom: '30px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  badgeDot: {
    width: '8px',
    height: '8px',
    background: '#a78bfa',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  titre: {
    fontSize: '56px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '24px',
    lineHeight: '1.2',
  },
  titreBleu: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  description: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '1.6',
    marginBottom: '40px',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  heroBtns: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '40px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  btnArrow: {
    transition: 'transform 0.3s ease',
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '40px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  floatingOrb1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(102,126,234,0.3) 0%, rgba(102,126,234,0) 70%)',
    borderRadius: '50%',
    top: '10%',
    left: '-100px',
    animation: 'float 6s ease-in-out infinite',
  },
  floatingOrb2: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(118,75,162,0.3) 0%, rgba(118,75,162,0) 70%)',
    borderRadius: '50%',
    bottom: '10%',
    right: '-50px',
    animation: 'floatReverse 8s ease-in-out infinite',
  },
  floatingOrb3: {
    position: 'absolute',
    width: '150px',
    height: '150px',
    background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, rgba(167,139,250,0) 70%)',
    borderRadius: '50%',
    bottom: '30%',
    left: '20%',
    animation: 'float 10s ease-in-out infinite',
  },
  wave: {
    position: 'absolute',
    bottom: '-10px',
    left: 0,
    width: '100%',
    overflow: 'hidden',
    lineHeight: 0,
  },
};

export default LandingPage;