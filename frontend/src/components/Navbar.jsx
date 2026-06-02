// ============================================================
// components/Navbar.jsx
// Barre de navigation responsive avec menu burger
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Gestion du body scroll
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isMenuOpen]);

    const navLinks = [
        { path: '/', label: 'Accueil', icon: '🏠' },
        { path: '/nouveau-projet', label: 'Nouveau projet', icon: '✨' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">
                        <div className="logo-icon">📄</div>
                        <div className="logo-text">
                            <span className="logo-cdc">CDC</span>
                            <span className="logo-eps">EPS</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="navbar-links">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{link.icon}</span>
                                <span>{link.label}</span>
                            </Link>
                        ))}
                        
                        <Link to="/nouveau-projet" className="nav-cta">
                            <span>+</span>
                            <span>Générer un CDC</span>
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
                    </div>

                    <div className="mobile-menu-links">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="mobile-nav-icon">{link.icon}</span>
                                <span>{link.label}</span>
                                <span className="mobile-nav-arrow">→</span>
                            </Link>
                        ))}
                        
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