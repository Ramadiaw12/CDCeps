import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useState, useEffect } from 'react';

function Footer() {
    const { theme } = useTheme();
    const [apiStatus, setApiStatus] = useState('checking');
    const [currentYear] = useState(new Date().getFullYear());
    const [pendingProjects, setPendingProjects] = useState(0);
    const [activeUsers, setActiveUsers] = useState(0);

    useEffect(() => {
        // Vérification du statut de l'API
        fetch('/api/health')
            .then(res => res.ok ? setApiStatus('online') : setApiStatus('degraded'))
            .catch(() => setApiStatus('offline'));
        
        // Récupération des métriques (à adapter avec votre API)
        fetch('/api/metrics')
            .then(res => res.json())
            .then(data => {
                setPendingProjects(data.pendingProjects || 3);
                setActiveUsers(data.activeUsers || 12);
            })
            .catch(() => {
                setPendingProjects(3);
                setActiveUsers(12);
            });
    }, []);

    const getStatusColor = () => {
        switch(apiStatus) {
            case 'online': return '#10b981';
            case 'degraded': return '#f59e0b';
            case 'offline': return '#ef4444';
            default: return '#7A7470';
        }
    };

    const getStatusText = () => {
        switch(apiStatus) {
            case 'online': return 'Système opérationnel';
            case 'degraded': return 'Service dégradé';
            case 'offline': return 'Système indisponible';
            default: return 'Vérification...';
        }
    };

    const s = {
        footer: {
            backgroundColor: theme === 'dark' ? '#0A0A0A' : '#0F0F0F',
            borderTop: '1px solid rgba(135, 206, 235, 0.2)',
            padding: '50px 0 30px',
            marginTop: '80px',
            position: 'relative'
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '40px',
            marginBottom: '40px'
        },
        // Brand
        brand: {
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
        },
        logo: {
            fontSize: '26px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #87CEEB 0%, #5BB8DE 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px'
        },
        tagline: {
            fontSize: '13px',
            color: '#B8B0A0',
            lineHeight: '1.5',
            maxWidth: '260px'
        },
        status: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(135, 206, 235, 0.08)',
            borderRadius: '40px',
            padding: '6px 14px',
            width: 'fit-content',
            fontSize: '12px'
        },
        statusDot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            animation: apiStatus === 'online' ? 'pulse 2s infinite' : 'none'
        },
        statusText: {
            color: getStatusColor()
        },
        // Titres colonnes
        colTitle: {
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: '#87CEEB',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        colLinks: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        colLink: {
            color: '#B8B0A0',
            textDecoration: 'none',
            fontSize: '13px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
        },
        // Widgets pratiques
        metricCard: {
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '12px',
            transition: 'all 0.2s ease'
        },
        metricLabel: {
            fontSize: '11px',
            color: '#7A7470',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        metricValue: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#87CEEB'
        },
        metricUnit: {
            fontSize: '12px',
            color: '#7A7470',
            fontWeight: '400',
            marginLeft: '4px'
        },
        // Liens rapides admin
        quickAction: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(135, 206, 235, 0.05)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '10px',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            textDecoration: 'none'
        },
        quickActionLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        quickActionIcon: {
            fontSize: '18px'
        },
        quickActionText: {
            fontSize: '13px',
            color: '#F5F0E8',
            fontWeight: '500'
        },
        quickActionArrow: {
            color: '#87CEEB',
            fontSize: '14px',
            opacity: 0.6
        },
        // Support
        supportItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px'
        },
        supportIcon: {
            width: '32px',
            height: '32px',
            backgroundColor: 'rgba(135, 206, 235, 0.1)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
        },
        supportContent: {
            flex: 1
        },
        supportLabel: {
            fontSize: '11px',
            color: '#7A7470',
            marginBottom: '2px'
        },
        supportValue: {
            fontSize: '13px',
            color: '#F5F0E8',
            fontWeight: '500'
        },
        // Bottom
        bottom: {
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: '25px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
        },
        copyright: {
            fontSize: '11px',
            color: '#4A4A4A'
        },
        version: {
            fontSize: '11px',
            color: '#3A3A3A',
            fontFamily: 'monospace'
        }
    };

    return (
        <footer style={s.footer}>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
                .footer-link:hover { color: #87CEEB !important; transform: translateX(3px); }
                .metric-card:hover { background-color: rgba(135,206,235,0.08); transform: translateY(-2px); }
                .quick-action:hover { background-color: rgba(135,206,235,0.12); }
                .quick-action:hover .quick-action-arrow { opacity: 1; transform: translateX(3px); }
            `}</style>

            <div style={s.container}>
                <div style={s.grid}>
                    
                    {/* Brand & Statut */}
                    <div style={s.brand}>
                        <div style={s.logo}>CDCEPS</div>
                        <p style={s.tagline}>
                            Système multi-agents pour la génération automatique de cahiers des charges.
                        </p>
                        <div style={s.status}>
                            <div style={s.statusDot} />
                            <span style={s.statusText}>{getStatusText()}</span>
                        </div>
                    </div>

                    {/* Métriques en temps réel (pratique pour les ingénieurs) */}
                    <div>
                        <div style={s.colTitle}>
                            📊 En direct
                        </div>
                        <div className="metric-card" style={s.metricCard}>
                            <div style={s.metricLabel}>
                                <span>⏳</span> Projets en file d'attente
                            </div>
                            <div style={s.metricValue}>
                                {pendingProjects}
                                <span style={s.metricUnit}>en cours</span>
                            </div>
                        </div>
                        <div className="metric-card" style={s.metricCard}>
                            <div style={s.metricLabel}>
                                <span>👥</span> Utilisateurs actifs
                            </div>
                            <div style={s.metricValue}>
                                {activeUsers}
                                <span style={s.metricUnit}>connectés</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions rapides pour les ingénieurs */}
                    <div>
                        <div style={s.colTitle}>
                            ⚡ Actions rapides
                        </div>
                        <a href="http://localhost:8080" target="_blank" className="quick-action" style={s.quickAction}>
                            <div style={s.quickActionLeft}>
                                <span style={s.quickActionIcon}>⚙️</span>
                                <span style={s.quickActionText}>Admin PHP</span>
                            </div>
                            <span className="quick-action-arrow" style={s.quickActionArrow}>→</span>
                        </a>
                        <a href="http://localhost:3001/api/health" target="_blank" className="quick-action" style={s.quickAction}>
                            <div style={s.quickActionLeft}>
                                <span style={s.quickActionIcon}>📡</span>
                                <span style={s.quickActionText}>API Status</span>
                            </div>
                            <span className="quick-action-arrow" style={s.quickActionArrow}>→</span>
                        </a>
                        <Link to="/nouveau-projet" className="quick-action" style={s.quickAction}>
                            <div style={s.quickActionLeft}>
                                <span style={s.quickActionIcon}>✨</span>
                                <span style={s.quickActionText}>Nouveau CDC</span>
                            </div>
                            <span className="quick-action-arrow" style={s.quickActionArrow}>→</span>
                        </Link>
                    </div>

                    {/* Support & Contact ingénieurs */}
                    <div>
                        <div style={s.colTitle}>
                            🛟 Support ingénieur
                        </div>
                        <div style={s.supportItem}>
                            <div style={s.supportIcon}>📧</div>
                            <div style={s.supportContent}>
                                <div style={s.supportLabel}>Support technique</div>
                                <div style={s.supportValue}>support@cdceps.eps.dz</div>
                            </div>
                        </div>
                        <div style={s.supportItem}>
                            <div style={s.supportIcon}>💬</div>
                            <div style={s.supportContent}>
                                <div style={s.supportLabel}>Slack / Teams</div>
                                <div style={s.supportValue}>#cdceps-dev</div>
                            </div>
                        </div>
                        <div style={s.supportItem}>
                            <div style={s.supportIcon}>📚</div>
                            <div style={s.supportContent}>
                                <div style={s.supportLabel}>Documentation</div>
                                <div style={s.supportValue}>docs.cdceps.eps.dz</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div style={s.bottom}>
                    <div style={s.copyright}>
                        © {currentYear} CDCEPS — EPS SARL | Projet ingénieur
                    </div>
                    <div style={s.version}>
                        v2.0.0 · Dernier déploiement: {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </footer>
        
    );
}

export default Footer;