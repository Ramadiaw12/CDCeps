// ============================================================
// components/Navbar.jsx
// Barre de navigation présente sur toutes les pages
// ============================================================

import { Link, useLocation } from 'react-router-dom';

function Navbar() {
    // Récupère l'URL actuelle pour mettre en évidence
    // le lien de la page active
    const location = useLocation();

    const estActif = (chemin) => location.pathname === chemin;

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                {/* Logo / Nom de l'application */}
                <Link to="/" style={styles.logo}>
                    <span style={styles.logoIcon}>📋</span>
                    <span>CDC<strong>EPS</strong></span>
                </Link>

                {/* Liens de navigation */}
                <div style={styles.liens}>
                    <Link
                        to="/"
                        style={{
                            ...styles.lien,
                            ...(estActif('/') ? styles.lienActif : {})
                        }}
                    >
                        Accueil
                    </Link>

                    <Link
                        to="/nouveau-projet"
                        style={{
                            ...styles.lien,
                            ...(estActif('/nouveau-projet') ? styles.lienActif : {})
                        }}
                    >
                        Nouveau projet
                    </Link>

                    {/* Bouton principal */}
                    <Link to="/nouveau-projet" style={styles.btnNav}>
                        + Générer un CDC
                    </Link>
                </div>
            </div>
        </nav>
    );
}

// Styles inline pour la navbar
const styles = {
    nav: {
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
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
        color: '#1e293b',
        textDecoration: 'none',
        fontWeight: '400'
    },
    logoIcon: {
        fontSize: '22px'
    },
    liens: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
    },
    lien: {
        color: '#64748b',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'color 0.2s'
    },
    lienActif: {
        color: '#2563eb'
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