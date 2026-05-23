// ============================================================
// pages/ResultatPage.jsx
// Affiche le CDC généré avec options d'export
// PDF et Markdown
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CDCViewer from '../components/CDCViewer.jsx';
import {
    getCDC,
    telechargerMarkdown,
    telechargerPDF
} from '../services/api.js';

function ResultatPage() {
    const { cdcId }  = useParams();
    const navigate   = useNavigate();

    const [cdc, setCdc]               = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur]         = useState(null);
    const [exportPDF, setExportPDF]   = useState(false);

    // ── Chargement du CDC ────────────────────────────────────
    useEffect(() => {
        const chargerCDC = async () => {
            try {
                const reponse = await getCDC(cdcId);
                setCdc(reponse.data);
            } catch (error) {
                setErreur('CDC introuvable');
            } finally {
                setChargement(false);
            }
        };

        chargerCDC();
    }, [cdcId]);

    // ── Export PDF ───────────────────────────────────────────
    const handleExportPDF = async () => {
        setExportPDF(true);
        try {
            telechargerPDF(cdcId);
        } finally {
            // Laisse le temps au téléchargement de démarrer
            setTimeout(() => setExportPDF(false), 2000);
        }
    };

    // ── Chargement ───────────────────────────────────────────
    if (chargement) {
        return (
            <div className="page">
                <div className="container" style={styles.centrer}>
                    <div className="spinner" style={{ width: 40, height: 40 }} />
                    <p style={{ marginTop: 16, color: '#64748b' }}>
                        Chargement du CDC...
                    </p>
                </div>
            </div>
        );
    }

    // ── Erreur ───────────────────────────────────────────────
    if (erreur || !cdc) {
        return (
            <div className="page">
                <div className="container">
                    <div style={styles.erreur}>
                        <h3>❌ {erreur || 'CDC introuvable'}</h3>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/')}
                            style={{ marginTop: 16 }}
                        >
                            ← Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Rendu principal ──────────────────────────────────────
    return (
        <div className="page">
            <div className="container">

                {/* ── En-tête avec actions ─────────────────── */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.titre}>
                            📄 {cdc.projet_titre}
                        </h1>
                        <p style={styles.sousTitre}>
                            Client : <strong>{cdc.prenom} {cdc.nom}</strong>
                            {cdc.entreprise && ` — ${cdc.entreprise}`}
                        </p>
                    </div>

                    {/* Boutons d'export */}
                    <div style={styles.actions}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => telechargerMarkdown(cdcId)}
                        >
                            ⬇️ Markdown
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={handleExportPDF}
                            disabled={exportPDF}
                        >
                            {exportPDF ? (
                                <>
                                    <div className="spinner" />
                                    Génération PDF...
                                </>
                            ) : (
                                '📥 Télécharger PDF'
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Métadonnées du CDC ───────────────────── */}
                <div style={styles.metaGrid}>
                    <div className="card" style={styles.metaCard}>
                        <div style={styles.metaLabel}>Score de complétude</div>
                        <div style={styles.metaValeur}>
                            <span style={{
                                color: cdc.score_completude >= 80 ? '#10b981' :
                                       cdc.score_completude >= 60 ? '#f59e0b' :
                                       '#ef4444',
                                fontSize: '24px',
                                fontWeight: '700'
                            }}>
                                {cdc.score_completude}
                            </span>
                            <span style={{ color: '#94a3b8' }}>/100</span>
                        </div>
                    </div>

                    <div className="card" style={styles.metaCard}>
                        <div style={styles.metaLabel}>Type de projet</div>
                        <div style={styles.metaValeur}>
                            <span className="badge badge-primary">
                                {cdc.type_projet?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <div className="card" style={styles.metaCard}>
                        <div style={styles.metaLabel}>Statut</div>
                        <div style={styles.metaValeur}>
                            <span className={`badge badge-${
                                cdc.statut === 'finalise' ? 'success' : 'warning'
                            }`}>
                                {cdc.statut}
                            </span>
                        </div>
                    </div>

                    <div className="card" style={styles.metaCard}>
                        <div style={styles.metaLabel}>Généré le</div>
                        <div style={styles.metaValeur}>
                            {new Date(cdc.created_at).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                </div>

                {/* ── Sections manquantes ──────────────────── */}
                {cdc.sections_manquantes?.length > 0 && (
                    <div style={styles.avertissement}>
                        <strong>⚠️ Sections à compléter :</strong>
                        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                            {cdc.sections_manquantes.map((section, i) => (
                                <li key={i} style={{ fontSize: 13 }}>
                                    {section}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ── Contenu du CDC ───────────────────────── */}
                <div className="card" style={styles.cdcCard}>
                    <CDCViewer contenu={cdc.contenu_markdown} />
                </div>

                {/* ── Actions bas de page ──────────────────── */}
                <div style={styles.actionsBottom}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/nouveau-projet')}
                    >
                        + Nouveau projet
                    </button>

                    <button
                        className="btn btn-primary"
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

// ── Styles ───────────────────────────────────────────────────
const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
    },
    titre: {
        fontSize: '26px',
        fontWeight: '700',
        color: '#0f172a'
    },
    sousTitre: {
        color: '#64748b',
        marginTop: '6px',
        fontSize: '14px'
    },
    actions: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },
    metaGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    },
    metaCard: {
        padding: '16px',
        textAlign: 'center'
    },
    metaLabel: {
        fontSize: '12px',
        color: '#64748b',
        marginBottom: '8px',
        fontWeight: '500'
    },
    metaValeur: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#0f172a'
    },
    avertissement: {
        backgroundColor: '#fef3c7',
        border: '1px solid #fcd34d',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        fontSize: '14px',
        color: '#92400e'
    },
    cdcCard: {
        padding: '40px',
        marginBottom: '24px'
    },
    actionsBottom: {
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '40px'
    },
    erreur: {
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5',
        borderRadius: '10px',
        padding: '32px',
        textAlign: 'center',
        color: '#991b1b'
    },
    centrer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px'
    }
};

export default ResultatPage;