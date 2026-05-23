// ============================================================
// pages/FormulairePage.jsx
// Formulaire de saisie des informations du projet client
// Envoie les données à l'API puis redirige vers
// la page de génération
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { creerProjet, lancerGeneration } from '../services/api.js';

function FormulairePage() {
    const navigate = useNavigate();

    // État du formulaire — toutes les valeurs des champs
    const [formulaire, setFormulaire] = useState({
        // Informations client
        nom:            '',
        prenom:         '',
        email:          '',
        telephone:      '',
        entreprise:     '',
        secteur:        'informatique',

        // Informations projet
        titre:                    '',
        description_brute:        '',
        type_projet:              'application_web',
        budget_estime:            '',
        delai_souhaite:           '',
        technologies_souhaitees:  ''
    });

    // États de l'interface
    const [erreurs, setErreurs]       = useState({});
    const [chargement, setChargement] = useState(false);
    const [etape, setEtape]           = useState(1); // 1 = client, 2 = projet

    // ── Mise à jour des champs ───────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormulaire(prev => ({ ...prev, [name]: value }));

        // Efface l'erreur du champ modifié
        if (erreurs[name]) {
            setErreurs(prev => ({ ...prev, [name]: '' }));
        }
    };

    // ── Validation ───────────────────────────────────────────
    const validerEtape1 = () => {
        const nouvellesErreurs = {};

        if (!formulaire.nom.trim())
            nouvellesErreurs.nom = 'Le nom est obligatoire';
        if (!formulaire.prenom.trim())
            nouvellesErreurs.prenom = 'Le prénom est obligatoire';
        if (!formulaire.email.trim())
            nouvellesErreurs.email = 'L\'email est obligatoire';
        if (formulaire.email && !/\S+@\S+\.\S+/.test(formulaire.email))
            nouvellesErreurs.email = 'Email invalide';

        setErreurs(nouvellesErreurs);
        return Object.keys(nouvellesErreurs).length === 0;
    };

    const validerEtape2 = () => {
        const nouvellesErreurs = {};

        if (!formulaire.titre.trim())
            nouvellesErreurs.titre = 'Le titre est obligatoire';
        if (!formulaire.description_brute.trim())
            nouvellesErreurs.description_brute = 'La description est obligatoire';
        if (formulaire.description_brute.trim().length < 50)
            nouvellesErreurs.description_brute = 'Description trop courte (minimum 50 caractères)';

        setErreurs(nouvellesErreurs);
        return Object.keys(nouvellesErreurs).length === 0;
    };

    // ── Navigation entre étapes ──────────────────────────────
    const etapeSuivante = () => {
        if (validerEtape1()) setEtape(2);
    };

    const etapePrecedente = () => setEtape(1);

    // ── Soumission du formulaire ─────────────────────────────
    const handleSubmit = async () => {
        if (!validerEtape2()) return;

        setChargement(true);

        try {
            // Étape 1 : Crée le client + projet en base
            const reponseProjet = await creerProjet({
                ...formulaire,
                budget_estime: formulaire.budget_estime
                    ? parseFloat(formulaire.budget_estime)
                    : null
            });

            const projetId = reponseProjet.data.projetId;

            // Étape 2 : Lance le pipeline multi-agents
            await lancerGeneration(projetId);

            // Étape 3 : Redirige vers la page de génération
            // Le frontend va suivre la progression via Socket.io
            navigate(`/generation/${projetId}`);

        } catch (error) {
            setErreurs({
                global: error.response?.data?.message || 'Erreur lors de la création du projet'
            });
        } finally {
            setChargement(false);
        }
    };

    // ── Rendu ────────────────────────────────────────────────
    return (
        <div className="page">
            <div className="container">
                <div style={styles.wrapper}>

                    {/* En-tête */}
                    <div style={styles.header}>
                        <h1 style={styles.titre}>Nouveau projet</h1>
                        <p style={styles.sousTitre}>
                            Renseignez les informations pour générer votre CDC
                        </p>
                    </div>

                    {/* Indicateur d'étapes */}
                    <div style={styles.etapes}>
                        <div style={{
                            ...styles.etapeIndicateur,
                            ...(etape >= 1 ? styles.etapeActive : {})
                        }}>
                            <span style={styles.etapeNum}>1</span>
                            <span>Informations client</span>
                        </div>
                        <div style={styles.etapeLigne} />
                        <div style={{
                            ...styles.etapeIndicateur,
                            ...(etape >= 2 ? styles.etapeActive : {})
                        }}>
                            <span style={styles.etapeNum}>2</span>
                            <span>Description du projet</span>
                        </div>
                    </div>

                    {/* Erreur globale */}
                    {erreurs.global && (
                        <div style={styles.erreurGlobale}>
                            ⚠️ {erreurs.global}
                        </div>
                    )}

                    <div className="card" style={styles.card}>

                        {/* ── Étape 1 : Informations client ── */}
                        {etape === 1 && (
                            <div>
                                <h2 style={styles.sectionTitre}>
                                    👤 Informations client
                                </h2>

                                <div style={styles.grille2}>
                                    <div className="form-group">
                                        <label>Nom *</label>
                                        <input
                                            type="text"
                                            name="nom"
                                            value={formulaire.nom}
                                            onChange={handleChange}
                                            placeholder="Ex: Benali"
                                        />
                                        {erreurs.nom && (
                                            <span className="error-message">
                                                {erreurs.nom}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Prénom *</label>
                                        <input
                                            type="text"
                                            name="prenom"
                                            value={formulaire.prenom}
                                            onChange={handleChange}
                                            placeholder="Ex: Karim"
                                        />
                                        {erreurs.prenom && (
                                            <span className="error-message">
                                                {erreurs.prenom}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formulaire.email}
                                        onChange={handleChange}
                                        placeholder="Ex: karim@entreprise.com"
                                    />
                                    {erreurs.email && (
                                        <span className="error-message">
                                            {erreurs.email}
                                        </span>
                                    )}
                                </div>

                                <div style={styles.grille2}>
                                    <div className="form-group">
                                        <label>Téléphone</label>
                                        <input
                                            type="tel"
                                            name="telephone"
                                            value={formulaire.telephone}
                                            onChange={handleChange}
                                            placeholder="Ex: 0555 123 456"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Entreprise</label>
                                        <input
                                            type="text"
                                            name="entreprise"
                                            value={formulaire.entreprise}
                                            onChange={handleChange}
                                            placeholder="Ex: Tech DZ SARL"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Secteur d'activité</label>
                                    <select
                                        name="secteur"
                                        value={formulaire.secteur}
                                        onChange={handleChange}
                                    >
                                        <option value="informatique">Informatique</option>
                                        <option value="commerce">Commerce</option>
                                        <option value="industrie">Industrie</option>
                                        <option value="sante">Santé</option>
                                        <option value="education">Éducation</option>
                                        <option value="finance">Finance</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>

                                <div style={styles.btnGroupe}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={etapeSuivante}
                                    >
                                        Suivant →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Étape 2 : Description projet ── */}
                        {etape === 2 && (
                            <div>
                                <h2 style={styles.sectionTitre}>
                                    🚀 Description du projet
                                </h2>

                                <div className="form-group">
                                    <label>Titre du projet *</label>
                                    <input
                                        type="text"
                                        name="titre"
                                        value={formulaire.titre}
                                        onChange={handleChange}
                                        placeholder="Ex: Application de gestion RH"
                                    />
                                    {erreurs.titre && (
                                        <span className="error-message">
                                            {erreurs.titre}
                                        </span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Description du projet *</label>
                                    <textarea
                                        name="description_brute"
                                        value={formulaire.description_brute}
                                        onChange={handleChange}
                                        placeholder="Décrivez votre projet en détail : objectifs, fonctionnalités souhaitées, contexte métier, utilisateurs cibles..."
                                        style={{ minHeight: '160px' }}
                                    />
                                    <span style={styles.compteur}>
                                        {formulaire.description_brute.length} caractères
                                        {formulaire.description_brute.length < 50 &&
                                            ' (minimum 50)'}
                                    </span>
                                    {erreurs.description_brute && (
                                        <span className="error-message">
                                            {erreurs.description_brute}
                                        </span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Type de projet</label>
                                    <select
                                        name="type_projet"
                                        value={formulaire.type_projet}
                                        onChange={handleChange}
                                    >
                                        <option value="application_web">Application Web</option>
                                        <option value="application_mobile">Application Mobile</option>
                                        <option value="erp">ERP / Système de gestion</option>
                                        <option value="ecommerce">E-commerce</option>
                                        <option value="api">API / Backend</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>

                                <div style={styles.grille2}>
                                    <div className="form-group">
                                        <label>Budget estimé (DZD)</label>
                                        <input
                                            type="number"
                                            name="budget_estime"
                                            value={formulaire.budget_estime}
                                            onChange={handleChange}
                                            placeholder="Ex: 500000"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Délai souhaité</label>
                                        <input
                                            type="text"
                                            name="delai_souhaite"
                                            value={formulaire.delai_souhaite}
                                            onChange={handleChange}
                                            placeholder="Ex: 3 mois"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Technologies souhaitées</label>
                                    <input
                                        type="text"
                                        name="technologies_souhaitees"
                                        value={formulaire.technologies_souhaitees}
                                        onChange={handleChange}
                                        placeholder="Ex: React, Node.js, MySQL"
                                    />
                                </div>

                                <div style={styles.btnGroupe}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={etapePrecedente}
                                    >
                                        ← Retour
                                    </button>

                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSubmit}
                                        disabled={chargement}
                                    >
                                        {chargement ? (
                                            <>
                                                <div className="spinner" />
                                                Création en cours...
                                            </>
                                        ) : (
                                            '🚀 Générer le CDC'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Styles ───────────────────────────────────────────────────
const styles = {
    wrapper: {
        maxWidth: '680px',
        margin: '0 auto'
    },
    header: {
        marginBottom: '32px'
    },
    titre: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#0f172a'
    },
    sousTitre: {
        color: '#64748b',
        marginTop: '8px'
    },
    etapes: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '32px'
    },
    etapeIndicateur: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#94a3b8',
        fontWeight: '500'
    },
    etapeActive: {
        color: '#2563eb'
    },
    etapeNum: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: '#dbeafe',
        color: '#2563eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: '700'
    },
    etapeLigne: {
        flex: 1,
        height: '1px',
        backgroundColor: '#e2e8f0',
        margin: '0 16px'
    },
    erreurGlobale: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px'
    },
    card: {
        padding: '32px'
    },
    sectionTitre: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '24px',
        color: '#0f172a'
    },
    grille2: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
    },
    btnGroupe: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px'
    },
    compteur: {
        fontSize: '12px',
        color: '#94a3b8',
        marginTop: '4px',
        display: 'block'
    }
};

export default FormulairePage;