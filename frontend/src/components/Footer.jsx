import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

function Footer() {
    const { theme } = useTheme();

    const s = {
        footer: {
            backgroundColor: theme === 'dark' ? '#0A0A0A' : '#0A0A0A',
            borderTop: '1px solid #87CEEB',
            padding: '48px 0 24px',
            marginTop: '80px'
        },
        container: {
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 24px'
        },
        top: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '48px',
            marginBottom: '40px'
        },
        brand: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        brandName: {
            fontFamily: "'Georgia', serif",
            fontSize: '28px',
            fontWeight: '900',
            letterSpacing: '-1px',
            lineHeight: '1'
        },
        brandCDC: {
            color: '#87CEEB',
            letterSpacing: '2px'
        },
        brandEPS: {
            color: '#F5F0E8',
            fontStyle: 'italic',
            fontWeight: '400',
            letterSpacing: '3px'
        },
        brandDesc: {
            fontSize: '13px',
            color: '#7A7470',
            lineHeight: '1.7',
            maxWidth: '280px'
        },
        colTitle: {
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#87CEEB',
            marginBottom: '16px'
        },
        colLinks: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        colLink: {
            color: '#B8B0A0',
            textDecoration: 'none',
            fontSize: '13px',
            transition: 'color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        divider: {
            borderTop: '1px solid #1E1E1E',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
        },
        copy: {
            fontSize: '12px',
            color: '#4A4A4A'
        },
        pills: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
        },
        pill: {
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '500',
            border: '1px solid #2A2A2A',
            color: '#7A7470'
        },
        pillBlue: {
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '500',
            border: '1px solid #87CEEB',
            color: '#87CEEB'
        },
        badge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#0D2A36',
            border: '1px solid #87CEEB',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '12px',
            color: '#87CEEB',
            marginTop: '16px',
            width: 'fit-content'
        },
        dot: {
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#87CEEB',
            animation: 'pulse 2s infinite'
        }
    };

    return (
        <footer style={s.footer}>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
                .footer-link:hover { color: #87CEEB !important; }
            `}</style>

            <div style={s.container}>
                <div style={s.top}>

                    {/* ── Brand ── */}
                    <div style={s.brand}>
                        <div style={s.brandName}>
                            <span style={s.brandCDC}>CDC</span>
                            <span style={s.brandEPS}>EPS</span>
                            <span style={{ color: '#87CEEB', fontSize: '32px' }}>.</span>
                        </div>
                        <p style={s.brandDesc}>
                            Système multi-agents pour la génération automatique
                            de cahiers des charges. Propulsé par l'IA et le module RAG.
                        </p>
                        <div style={s.badge}>
                            <div style={s.dot} />
                            Système opérationnel
                        </div>
                    </div>

                    {/* ── Navigation ── */}
                    <div>
                        <p style={s.colTitle}>Navigation</p>
                        <div style={s.colLinks}>
                            <Link to="/" className="footer-link" style={s.colLink}>
                                → Accueil
                            </Link>
                            <Link to="/nouveau-projet" className="footer-link" style={s.colLink}>
                                → Nouveau projet
                            </Link>
                            <a href="http://localhost:8080" target="_blank" className="footer-link" style={s.colLink}>
                                → Admin PHP
                            </a>
                            <a href="http://localhost:3001/api/health" target="_blank" className="footer-link" style={s.colLink}>
                                → API Status
                            </a>
                        </div>
                    </div>

                    {/* ── Stack technique ── */}
                    <div>
                        <p style={s.colTitle}>Stack technique</p>
                        <div style={s.colLinks}>
                            {['React + Vite', 'Node.js + Express', 'PHP Admin', 'MySQL', 'OpenAI GPT-4o', 'RAG + Embeddings'].map(tech => (
                                <span key={tech} style={{ ...s.colLink, cursor: 'default' }}>
                                    · {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Bas du footer ── */}
                <div style={s.divider}>
                    <span style={s.copy}>
                        © {new Date().getFullYear()} CDCEPS — EPS SARL. Projet de stage ingénieur.
                    </span>
                    <div style={s.pills}>
                        <span style={s.pill}>Node.js</span>
                        <span style={s.pill}>React</span>
                        <span style={s.pill}>PHP</span>
                        <span style={s.pillBlue}>IA Multi-Agents</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;