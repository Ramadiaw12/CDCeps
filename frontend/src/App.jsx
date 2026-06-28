import ScrollToTop from './components/ScrollToTop';
// ============================================================
// App.jsx - VERSION CORRIGÉE
// ============================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage.jsx';
import FormulairePage from './pages/FormulairePage.jsx';
import GenerationPage from './pages/GenerationPage.jsx';
import ResultatPage from './pages/ResultatPage.jsx';
import './styles/global.css';

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
    <ScrollToTop />
                <Routes>
                    {/* Layout contient déjà la Navbar et le Footer */}
                    <Route path="/" element={<Layout />}>
                        <Route index element={<LandingPage />} />
                        <Route path="nouveau-projet" element={<FormulairePage />} />
                        <Route path="generation/:projetId" element={<GenerationPage />} />
                        <Route path="resultat/:cdcId" element={<ResultatPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;