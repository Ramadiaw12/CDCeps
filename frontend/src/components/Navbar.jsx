// components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    return (
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

                {/* Navigation Links */}
                <div className="navbar-links">
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                        Accueil
                    </Link>
                    <Link to="/nouveau-projet" className={`nav-link ${location.pathname === '/nouveau-projet' ? 'active' : ''}`}>
                        Nouveau projet
                    </Link>
                    <Link to="/nouveau-projet" className="nav-cta">
                        ✨ Générer un CDC
                    </Link>
                    
                    {/* Dark/Light Mode Toggle */}
                    <button onClick={toggleTheme} className="nav-theme-toggle">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>

                {/* Burger Menu (mobile) */}
                <button className="burger-menu">
                    <span className="burger-line"></span>
                    <span className="burger-line"></span>
                    <span className="burger-line"></span>
                </button>
            </div>
        </nav>
    );
}

export default Navbar;