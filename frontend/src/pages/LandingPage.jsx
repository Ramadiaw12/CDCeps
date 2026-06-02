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
                <div className="container">
                    <div style={styles.heroContent}>
                        <div style={styles.badge}>
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
                            <Link to="/nouveau-projet" className="btn btn-primary">
                             Générer un CDC maintenant
                            </Link>
                        </div>
                    </div>
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
            <section style={{ ...styles.section, backgroundColor: '#f1f5f9' }}>
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
    }
};

export default LandingPage;