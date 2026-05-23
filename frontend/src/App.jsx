// ============================================================
// App.jsx
// Routeur principal de l'application React
// Définit toutes les routes et pages de l'application
// ============================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage     from './pages/LandingPage.jsx';
import FormulairePage  from './pages/FormulairePage.jsx';
import GenerationPage  from './pages/GenerationPage.jsx';
import ResultatPage    from './pages/ResultatPage.jsx';
import Navbar          from './components/Navbar.jsx';
import './styles/global.css';

function App() {
    return (
        <BrowserRouter>
            {/* Navbar présente sur toutes les pages */}
            <Navbar />

            <Routes>
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
            </Routes>
        </BrowserRouter>
    );
}

export default App;