// components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useState, useEffect } from 'react';

function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Fermer le menu quand on change de page
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    // Empêcher le scroll quand le menu est ouvert
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <div className="logo-icon">📄</div>
                        <div className="logo-text">
                            <span className="logo-cdc">CDC</span>
                            <span className="logo-eps">EPS</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="navbar-links">
                        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                            Accueil
                        </Link>
                        <Link to="/nouveau-projet" className={`nav-link ${location.pathname === '/nouveau-projet' ? 'active' : ''}`}>
                            Nouveau projet
                        </Link>
                        
                        <button onClick={toggleTheme} className="nav-theme-toggle">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                    </div>

                    {/* Burger Menu Button */}
                    <button 
                        className={`burger-menu ${isMenuOpen ? 'open' : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Menu"
                    >
                        <span className="burger-line"></span>
                        <span className="burger-line"></span>
                        <span className="burger-line"></span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
                <div className="mobile-menu-inner">
                    <div className="mobile-menu-header">
                        <div className="mobile-logo">
                            <div className="logo-icon">📄</div>
                            <div className="logo-text">
                                <span className="logo-cdc">CDC</span>
                                <span className="logo-eps">EPS</span>
                            </div>
                        </div>
                        <button 
                            className="mobile-close"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mobile-menu-links">
                        <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                            <span className="mobile-nav-icon">🏠</span>
                            Accueil
                            <span className="mobile-nav-arrow">→</span>
                        </Link>
                        <Link to="/nouveau-projet" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                            <span className="mobile-nav-icon">✨</span>
                            Nouveau projet
                            <span className="mobile-nav-arrow">→</span>
                        </Link>
                        
                        <div className="mobile-divider"></div>
                        
                        <Link to="/nouveau-projet" className="mobile-cta" onClick={() => setIsMenuOpen(false)}>
                            <span>✨</span>
                            Générer un cahier des charges
                            <span className="mobile-cta-arrow">→</span>
                        </Link>

                        <div className="mobile-theme">
                            <span className="mobile-theme-label">
                                {theme === 'dark' ? '🌙 Mode sombre' : '☀️ Mode clair'}
                            </span>
                            <button onClick={toggleTheme} className="mobile-theme-toggle">
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>
                        </div>
                    </div>

                    <div className="mobile-menu-footer">
                        <div className="mobile-stats">
                            <div className="mobile-stat">
                                <span className="stat-value">4</span>
                                <span className="stat-label">Agents IA</span>
                            </div>
                            <div className="mobile-stat">
                                <span className="stat-value">500+</span>
                                <span className="stat-label">CDC générés</span>
                            </div>
                            <div className="mobile-stat">
                                <span className="stat-value">98%</span>
                                <span className="stat-label">Satisfaction</span>
                            </div>
                        </div>
                        <div className="mobile-version">
                            CDCEPS v2.0.0
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Navbar;