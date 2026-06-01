import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

function Navbar() {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    const estActif = (chemin) => location.pathname === chemin;

    // Les styles sont DANS le composant pour accéder à theme
    const styles = {
        nav: {
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            transition: 'background-color 0.3s',
            backgroundColor: theme === 'dark' ? '#141414' : '#FAFAF7',
            borderBottom: `1px solid ${theme === 'dark' ? '#2A2A2A' : '#D4C9B0'}`
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
            transition: 'color 0.3s',
            color: theme === 'dark' ? '#F5F0E8' : '#0A0A0A'
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
            gap: '6px',
            backgroundColor: theme === 'dark' ? '#1E1E1E' : '#D6EFFA',
            color: theme === 'dark' ? '#87CEEB' : '#0A0A0A',
            border: `1px solid ${theme === 'dark' ? '#2A2A2A' : '#87CEEB'}`
        },
        btnNav: {
            backgroundColor: '#87CEEB',
            color: '#0A0A0A',
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600'
        },
        logoText: {
            display: 'flex',
            alignItems: 'baseline',
            gap: '1px',
            letterSpacing: '-1px'
        },
        logoCDC: {
            fontFamily: "'Georgia', serif",
            fontSize: '22px',
            fontWeight: '900',
            color: '#87CEEB',
            textTransform: 'uppercase',
            letterSpacing: '2px'
        },
        logoEPS: {
            fontFamily: "'Georgia', serif",
            fontSize: '18px',
            fontWeight: '400',
            color: theme === 'dark' ? '#F5F0E8' : '#0A0A0A',
            letterSpacing: '3px',
            fontStyle: 'italic'
        },
        logoDot: {
            fontSize: '28px',
            color: '#87CEEB',
            fontWeight: '900',
            lineHeight: '1'
        }
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>
                    <span style={styles.logoIcon}>📋</span>
                    <span style={styles.logoText}>
                        <span style={styles.logoCDC}>CDC</span>
                        <span style={styles.logoEPS}>EPS</span>
                        <span style={styles.logoDot}>.</span>
                    </span>
                </Link>

                <div style={styles.liens}>
                    <Link
                        to="/"
                        style={{
                            ...styles.lien,
                            color: estActif('/')
                                ? '#87CEEB'
                                : theme === 'dark' ? '#B8B0A0' : '#4A4A4A'
                        }}
                    >
                        Accueil
                    </Link>

                    <Link
                        to="/nouveau-projet"
                        style={{
                            ...styles.lien,
                            color: estActif('/nouveau-projet')
                                ? '#87CEEB'
                                : theme === 'dark' ? '#B8B0A0' : '#4A4A4A'
                        }}
                    >
                        Nouveau projet
                    </Link>

                    <button
                        onClick={toggleTheme}
                        style={styles.btnTheme}
                        title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                    >
                        {theme === 'dark' ? '☀️ Clair' : '🌙 Sombre'}
                    </button>

                    <Link to="/nouveau-projet" style={styles.btnNav}>
                        + Générer un CDC
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;