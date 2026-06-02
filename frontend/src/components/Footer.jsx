// components/Footer.jsx
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useState, useEffect } from 'react';

function Footer() {
    const { theme } = useTheme();
    const [apiStatus, setApiStatus] = useState('checking');
    const [currentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetch('/api/health')
            .then(res => res.ok ? setApiStatus('online') : setApiStatus('degraded'))
            .catch(() => setApiStatus('offline'));
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

    return (
        <footer className="footer-responsive">
            <div className="footer-container">
                {/* Top section - Grid responsive */}
                <div className="footer-grid">
                    
                    {/* Brand & Status */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <span className="footer-logo-cdc">CDC</span>
                            <span className="footer-logo-eps">EPS</span>
                        </div>
                        <p className="footer-tagline">
                            Système multi-agents pour la génération automatique de cahiers des charges.
                        </p>
                        <div className="footer-status">
                            <span className="footer-status-dot" style={{ backgroundColor: getStatusColor() }}></span>
                            <span className="footer-status-text" style={{ color: getStatusColor() }}>{getStatusText()}</span>
                        </div>
                    </div>

                    {/* Metrics - En direct */}
                    <div className="footer-metrics">
                        <h4 className="footer-title">📊 En direct</h4>
                        <div className="footer-metrics-grid">
                            <div className="footer-metric">
                                <span className="footer-metric-value">3</span>
                                <span className="footer-metric-label">Projets en file d'attente</span>
                            </div>
                            <div className="footer-metric">
                                <span className="footer-metric-value">12</span>
                                <span className="footer-metric-label">Utilisateurs actifs</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="footer-actions">
                        <h4 className="footer-title">⚡ Actions rapides</h4>
                        <div className="footer-actions-list">
                            <a href="http://localhost:8080" target="_blank" className="footer-action">
                                <span>⚙️</span> Admin PHP
                                <span className="footer-action-arrow">→</span>
                            </a>
                            <a href="http://localhost:3001/api/health" target="_blank" className="footer-action">
                                <span>📡</span> API Status
                                <span className="footer-action-arrow">→</span>
                            </a>
                            <Link to="/nouveau-projet" className="footer-action">
                                <span>✨</span> Nouveau CDC
                                <span className="footer-action-arrow">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Support */}
                    <div className="footer-support">
                        <h4 className="footer-title">🛟 Support ingénieur</h4>
                        <div className="footer-support-list">
                            <div className="footer-support-item">
                                <span className="footer-support-icon">📧</span>
                                <div>
                                    <div className="footer-support-label">Support technique</div>
                                    <div className="footer-support-value">support@cdceps.eps.dz</div>
                                </div>
                            </div>
                            <div className="footer-support-item">
                                <span className="footer-support-icon">💬</span>
                                <div>
                                    <div className="footer-support-label">Slack / Teams</div>
                                    <div className="footer-support-value">#cdceps-dev</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom section - Copyright et version */}
                <div className="footer-bottom">
                    <div className="footer-copyright">
                        © {currentYear} CDCEPS — EPS SARL | Projet ingénieur
                    </div>
                    <div className="footer-version">
                        v2.0.0 · Dernier déploiement: {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;