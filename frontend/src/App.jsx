// ============================================================
// App.jsx
// Routeur principal de l'application React
// Définit toutes les routes et pages de l'application
// ============================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import LandingPage     from './pages/LandingPage.jsx';
import Layout from './components/Layout';
import FormulairePage  from './pages/FormulairePage.jsx';
import GenerationPage  from './pages/GenerationPage.jsx';
import ResultatPage    from './pages/ResultatPage.jsx';
import Navbar          from './components/Navbar.jsx';
import Footer         from './components/Footer.jsx';
import './styles/global.css';


function App() {
    return (
        // ThemeProvider enveloppe tout
        // pour que le thème soit accessible partout
        <ThemeProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Layout />}>
                        {/* Page d'accueil */}
                        <Route path="/" element={<LandingPage />} />
                        {/* Formulaire de saisie du projet */}
                        <Route path="/nouveau-projet" element={<FormulairePage />} />
                        {/* Page de génération en temps réel */}
                        {/* :projetId = l'id du projet créé */}
                        <Route path="/generation/:projetId" element={<GenerationPage />} />
                        {/* Page de résultat avec le CDC généré */}
                        {/* :cdcId = l'id du CDC généré */}
                        <Route path="/resultat/:cdcId" element={<ResultatPage />} />
                    </Route>
                </Routes>
                <Footer />
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;


