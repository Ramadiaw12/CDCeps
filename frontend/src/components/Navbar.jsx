// ============================================================
// components/Navbar.jsx
// Barre de navigation avec bouton dark/light mode
// ============================================================

import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

function Navbar() {
    const location  = useLocation();
    const { theme, toggleTheme } = useTheme();

    const estActif = (chemin) => location.pathname === chemin;

    return (
        <nav style={{
            ...styles.nav,
            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
            borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`
        }}>
            <div style={styles.container}>
                {/* Logo */}
                <Link to="/" style={{
                    ...styles.logo,
                    color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
                }}>
                    <span style={styles.logoIcon}>📋</span>
                    <span>CDC<strong>EPS</strong></span>
                </Link>

                {/* Liens de navigation */}
                <div style={styles.liens}>
                    <Link
                        to="/"
                        style={{
                            ...styles.lien,
                            color: estActif('/')
                                ? '#2563eb'
                                : theme === 'dark' ? '#94a3b8' : '#64748b'
                        }}
                    >
                        Accueil
                    </Link>

                    <Link
                        to="/nouveau-projet"
                        style={{
                            ...styles.lien,
                            color: estActif('/nouveau-projet')
                                ? '#2563eb'
                                : theme === 'dark' ? '#94a3b8' : '#64748b'
                        }}
                    >
                        Nouveau projet
                    </Link>

                    {/* Bouton dark/light mode */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            ...styles.btnTheme,
                            backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9',
                            color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
                            border: `1px solid ${theme === 'dark' ? '#475569' : '#e2e8f0'}`
                        }}
                        title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                    >
                        {theme === 'dark' ? '☀️ Clair' : '🌙 Sombre'}
                    </button>

                    {/* Bouton principal */}
                    <Link to="/nouveau-projet" style={styles.btnNav}>
                        + Générer un CDC
                    </Link>
                </div>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'background-color 0.3s'
    },
    container: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '18px',
        textDecoration: 'none',
        fontWeight: '400',
        transition: 'color 0.3s'
    },
    logoIcon: {
        fontSize: '22px'
    },
    liens: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    lien: {
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'color 0.2s'
    },
    btnTheme: {
        padding: '7px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    btnNav: {
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500'
    }
};

export default Navbar;