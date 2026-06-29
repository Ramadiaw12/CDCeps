// ============================================================
// pages/ResultatPage.jsx
// Affiche le CDC généré avec options d'export PDF et Markdown
// Design repensé : animations, dark/light mode, score animé
// ============================================================
import './ResultatPage.css';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CDCViewer from '../components/CDCViewer.jsx';
import { getCDC, telechargerMarkdown, telechargerPDF } from '../services/api.js';

// Composant arc animé pour le score
function ScoreArc({ score }) {
    const circumference = 220;
    const [displayed, setDisplayed] = useState(0);
    const [offset, setOffset] = useState(circumference);

    const color =
        score >= 80 ? 'var(--fill-success)' :
        score >= 60 ? 'var(--fill-warning)' :
                      'var(--fill-danger)';

    useEffect(() => {
        const target = circumference - (score / 100) * circumference;
        const timer = setTimeout(() => setOffset(target), 100);

        let start = null;
        const duration = 1200;
        const animate = (ts) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(Math.round(eased * score));
            if (progress < 1) requestAnimationFrame(animate);
        };
        const animTimer = setTimeout(() => requestAnimationFrame(animate), 150);
        return () => { clearTimeout(timer); clearTimeout(animTimer); };
    }, [score]);

    return (
        <div className="rp-score-wrap">
            <svg className="rp-score-svg" width="80" height="80" viewBox="0 0 80 80">
                <circle className="rp-score-track" cx="40" cy="40" r="35" />
                <circle
                    className="rp-score-bar"
                    cx="40" cy="40" r="35"
                    style={{ stroke: color, strokeDashoffset: offset }}
                />
            </svg>
            <div className="rp-score-num">
                <span>{displayed}</span>
                <span className="rp-score-label">/ 100</span>
            </div>
        </div>
    );
}

function ResultatPage() {
    const { cdcId }  = useParams();
    const navigate   = useNavigate();

    const [cdc, setCdc]               = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur]         = useState(null);
    const [exportPDF, setExportPDF]   = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const chargerCDC = async () => {
            try {
                const reponse = await getCDC(cdcId);
                setCdc(reponse.data);
            } catch {
                setErreur('CDC introuvable');
            } finally {
                setChargement(false);
            }
        };
        chargerCDC();
    }, [cdcId]);

    const handleExportPDF = async () => {
        setExportPDF(true);
        try { telechargerPDF(cdcId); }
        finally { setTimeout(() => setExportPDF(false), 2000); }
    };

    //  Chargement 
    if (chargement) {
        return (
            <div className="rp-page">
                <div className="rp-container rp-center">
                    <div className="rp-spinner" />
                    <p className="rp-loading-text">Chargement du CDC…</p>
                </div>
            </div>
        );
    }

    //  Erreur 
    if (erreur || !cdc) {
        return (
            <div className="rp-page">
                <div className="rp-container">
                    <div className="rp-error-card">
                        <i className="rp-error-icon">⚠️</i>
                        <h3 className="rp-error-title">{erreur || 'CDC introuvable'}</h3>
                        <p className="rp-error-body">Ce document n'existe pas ou a été supprimé.</p>
                        <button className="rp-btn" onClick={() => navigate('/')}>
                            ← Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const statutClass = cdc.statut === 'finalise' ? 'success' : 'warning';

    //  Rendu principal 
    return (
        <div className="rp-page">
            <div className="rp-container">

                {/*  Hero  */}
                <div className="rp-hero rp-anim-1">
                    <div className="rp-hero-bar" />
                    <div className="rp-hero-top">
                        <div>
                            <div className="rp-eyebrow">
                                <span className="rp-eyebrow-dot" />
                                Cahier des charges généré
                            </div>
                            <h1 className="rp-title">
                                {cdc.projet_titre}
                            </h1>
                            <p className="rp-subtitle">
                                Client : <strong>{cdc.prenom} {cdc.nom}</strong>
                                {cdc.entreprise && ` — ${cdc.entreprise}`}
                            </p>
                        </div>
                        <div className="rp-actions">
                            <button
                                className="rp-btn"
                                onClick={() => telechargerMarkdown(cdcId)}
                            >
                                ⬇ Markdown
                            </button>
                            <button
                                className="rp-btn rp-btn-primary"
                                onClick={handleExportPDF}
                                disabled={exportPDF}
                            >
                                {exportPDF ? (
                                    <><span className="rp-spinner rp-spinner-sm" /> Génération…</>
                                ) : (
                                    '📥 Télécharger PDF'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/*  Méta-stats  */}
                <div className="rp-stats rp-anim-2">
                    {/* Score */}
                    <div className="rp-stat">
                        <ScoreArc score={cdc.score_completude} />
                        <span className="rp-stat-label">Complétude</span>
                    </div>

                    {/* Type projet */}
                    <div className="rp-stat">
                        <span className="rp-stat-icon">🗂</span>
                        <span className={`rp-badge rp-badge-accent`}>
                            {cdc.type_projet?.replace('_', ' ')}
                        </span>
                        <span className="rp-stat-label">Type de projet</span>
                    </div>

                    {/* Statut */}
                    <div className="rp-stat">
                        <span className="rp-stat-icon">
                            {cdc.statut === 'finalise' ? '✅' : '⏳'}
                        </span>
                        <span className={`rp-badge rp-badge-${statutClass}`}>
                            {cdc.statut}
                        </span>
                        <span className="rp-stat-label">Statut</span>
                    </div>

                    {/* Date */}
                    <div className="rp-stat">
                        <span className="rp-stat-icon">📅</span>
                        <span className="rp-stat-value">
                            {new Date(cdc.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="rp-stat-label">Généré le</span>
                    </div>
                </div>

                {/*  Sections manquantes  */}
                {cdc.sections_manquantes?.length > 0 && (
                    <div className="rp-warn rp-anim-3">
                        <div className="rp-warn-icon">⚠️</div>
                        <div className="rp-warn-body">
                            <div className="rp-warn-title">Sections à compléter</div>
                            <ul className="rp-warn-list">
                                {cdc.sections_manquantes.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Document CDC  */}
                <div className="rp-doc rp-anim-4">
                    <div className="rp-doc-toolbar">
                        <div className="rp-doc-dots">
                            <span className="rp-dot rp-dot-red" />
                            <span className="rp-dot rp-dot-yellow" />
                            <span className="rp-dot rp-dot-green" />
                        </div>
                        <span className="rp-doc-filename">cahier-des-charges.md</span>
                        <span />
                    </div>
                    <div className="rp-doc-content">
                        <CDCViewer contenu={cdc.contenu_markdown} />
                    </div>
                </div>

                {/*  Footer  */}
                <div className="rp-footer rp-anim-5">
                    <button
                        className="rp-back-link"
                        onClick={() => navigate('/nouveau-projet')}
                    >
                        + Nouveau projet
                    </button>
                    <button
                        className="rp-btn rp-btn-primary"
                        onClick={handleExportPDF}
                        disabled={exportPDF}
                    >
                        📥 Télécharger en PDF
                    </button>
                </div>

            </div>
        </div>
    );
}

export default ResultatPage;