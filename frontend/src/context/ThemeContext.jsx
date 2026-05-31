// ============================================================
// context/ThemeContext.jsx
// Gestion globale du thème clair/sombre
// Le thème est accessible depuis n'importe quel composant
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';

// Crée le contexte
const ThemeContext = createContext();

// Provider — enveloppe toute l'application
export function ThemeProvider({ children }) {
    // Récupère le thème sauvegardé ou utilise 'light' par défaut
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('cdceps-theme') || 'light';
    });

    // Applique le thème sur le body à chaque changement
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('cdceps-theme', theme);
    }, [theme]);

    // Bascule entre light et dark
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Hook personnalisé pour utiliser le thème facilement
export const useTheme = () => useContext(ThemeContext);