// ============================================================
// pages/FormulairePage.jsx
// Formulaire de saisie des informations du projet client
// Design moderne, animations, contours élégants
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { creerProjet, lancerGeneration } from '../services/api.js';

function FormulairePage() {
    const navigate = useNavigate();

    const [formulaire, setFormulaire] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        entreprise: '',
        secteur: 'informatique',
        titre: '',
        description_brute: '',
        type_projet: 'application_web',
        budget_estime: '',
        delai_souhaite: '',
        technologies_souhaitees: ''
    });

    const [erreurs, setErreurs] = useState({});
    const [chargement, setChargement] = useState(false);
    const [etape, setEtape] = useState(1);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormulaire(prev => ({ ...prev, [name]: value }));
        if (erreurs[name]) {
            setErreurs(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validerEtape1 = () => {
        const nouvellesErreurs = {};
        if (!formulaire.nom.trim()) nouvellesErreurs.nom = 'Le nom est obligatoire';
        if (!formulaire.prenom.trim()) nouvellesErreurs.prenom = 'Le prénom est obligatoire';
        if (!formulaire.email.trim()) nouvellesErreurs.email = 'L\'email est obligatoire';
        if (formulaire.email && !/\S+@\S+\.\S+/.test(formulaire.email))
            nouvellesErreurs.email = 'Email invalide';
        setErreurs(nouvellesErreurs);
        return Object.keys(nouvellesErreurs).length === 0;
    };

    const validerEtape2 = () => {
        const nouvellesErreurs = {};
        if (!formulaire.titre.trim()) nouvellesErreurs.titre = 'Le titre est obligatoire';
        if (!formulaire.description_brute.trim())
            nouvellesErreurs.description_brute = 'La description est obligatoire';
        if (formulaire.description_brute.trim().length < 50)
            nouvellesErreurs.description_brute = 'Description trop courte (minimum 50 caractères)';
        setErreurs(nouvellesErreurs);
        return Object.keys(nouvellesErreurs).length === 0;
    };

    const etapeSuivante = () => {
        if (validerEtape1()) setEtape(2);
    };

    const etapePrecedente = () => setEtape(1);

    const handleSubmit = async () => {
        if (!validerEtape2()) return;
        setChargement(true);
        try {
            const reponseProjet = await creerProjet({
                ...formulaire,
                budget_estime: formulaire.budget_estime ? parseFloat(formulaire.budget_estime) : null
            });
            const projetId = reponseProjet.data.projetId;
            await lancerGeneration(projetId);
            navigate(`/generation/${projetId}`);
        } catch (error) {
            setErreurs({
                global: error.response?.data?.message || 'Erreur lors de la création du projet'
            });
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="page formulaire-page">
            <div className="container">
                <div className="formulaire-wrapper">

                    {/* En-tête avec animation */}
                    <div className="formulaire-header">
                        <div className="formulaire-icon">✨</div>
                        <h1 className="formulaire-title">Nouveau projet</h1>
                        <p className="formulaire-subtitle">
                            Renseignez les informations pour générer votre cahier des charges
                        </p>
                    </div>

                    {/* Indicateur d'étapes animé */}
                    <div className="formulaire-steps">
                        <div className={`form-step-item ${etape >= 1 ? 'active' : ''}`}>
                            <div className="form-step-number">1</div>
                            <div className="form-step-label">Informations client</div>
                        </div>
                        <div className="form-step-line">
                            <div className="form-step-line-fill" style={{ width: etape === 2 ? '100%' : '0%' }}></div>
                        </div>
                        <div className={`form-step-item ${etape >= 2 ? 'active' : ''}`}>
                            <div className="form-step-number">2</div>
                            <div className="form-step-label">Description du projet</div>
                        </div>
                    </div>

                    {/* Erreur globale */}
                    {erreurs.global && (
                        <div className="formulaire-error-global">
                            <span>⚠️</span> {erreurs.global}
                        </div>
                    )}

                    {/* Formulaire Card avec effet glassmorphism */}
                    <div className="formulaire-card">
                        
                        {/* Étape 1 */}
                        {etape === 1 && (
                            <div className="formulaire-step-content">
                                <div className="form-step-header">
                                    <div className="form-step-header-icon">👤</div>
                                    <h2>Informations client</h2>
                                </div>

                                <div className="form-grid-2">
                                    <div className="form-group animated-group">
                                        <label>Nom complet *</label>
                                        <input
                                            type="text"
                                            name="nom"
                                            value={formulaire.nom}
                                            onChange={handleChange}
                                            placeholder="Benali"
                                            className={erreurs.nom ? 'error' : ''}
                                        />
                                        {erreurs.nom && <span className="error-message">{erreurs.nom}</span>}
                                    </div>

                                    <div className="form-group animated-group">
                                        <label>Prénom *</label>
                                        <input
                                            type="text"
                                            name="prenom"
                                            value={formulaire.prenom}
                                            onChange={handleChange}
                                            placeholder="Karim"
                                            className={erreurs.prenom ? 'error' : ''}
                                        />
                                        {erreurs.prenom && <span className="error-message">{erreurs.prenom}</span>}
                                    </div>
                                </div>

                                <div className="form-group animated-group">
                                    <label>Adresse email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formulaire.email}
                                        onChange={handleChange}
                                        placeholder="karim@entreprise.com"
                                        className={erreurs.email ? 'error' : ''}
                                    />
                                    {erreurs.email && <span className="error-message">{erreurs.email}</span>}
                                </div>

                                <div className="form-grid-2">
                                    <div className="form-group animated-group">
                                        <label>Téléphone</label>
                                        <input
                                            type="tel"
                                            name="telephone"
                                            value={formulaire.telephone}
                                            onChange={handleChange}
                                            placeholder="0555 123 456"
                                        />
                                    </div>

                                    <div className="form-group animated-group">
                                        <label>Entreprise</label>
                                        <input
                                            type="text"
                                            name="entreprise"
                                            value={formulaire.entreprise}
                                            onChange={handleChange}
                                            placeholder="Tech DZ SARL"
                                        />
                                    </div>
                                </div>

                                <div className="form-group animated-group">
                                    <label>Secteur d'activité</label>
                                    <select name="secteur" value={formulaire.secteur} onChange={handleChange}>
                                        <option value="informatique">💻 Informatique & Tech</option>
                                        <option value="commerce">🛍️ Commerce & Distribution</option>
                                        <option value="industrie">🏭 Industrie & Manufacturing</option>
                                        <option value="sante">🏥 Santé & Médical</option>
                                        <option value="education">📚 Éducation & Formation</option>
                                        <option value="finance">💰 Finance & Assurance</option>
                                        <option value="autre">🌐 Autre secteur</option>
                                    </select>
                                </div>

                                <div className="formulaire-buttons">
                                    <button className="btn btn-primary next-btn" onClick={etapeSuivante}>
                                        Étape suivante
                                        <span className="form-btn-arrow">→</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Étape 2 */}
                        {etape === 2 && (
                            <div className="formulaire-step-content">
                                <div className="form-step-header">
                                    <div className="form-step-header-icon">📋</div>
                                    <h2>Description du projet</h2>
                                </div>

                                <div className="form-group animated-group">
                                    <label>Titre du projet *</label>
                                    <input
                                        type="text"
                                        name="titre"
                                        value={formulaire.titre}
                                        onChange={handleChange}
                                        placeholder="Application de gestion RH"
                                        className={erreurs.titre ? 'error' : ''}
                                    />
                                    {erreurs.titre && <span className="error-message">{erreurs.titre}</span>}
                                </div>

                                <div className="form-group animated-group">
                                    <label>Description détaillée *</label>
                                    <textarea
                                        name="description_brute"
                                        value={formulaire.description_brute}
                                        onChange={handleChange}
                                        placeholder="Décrivez votre projet en détail : objectifs, fonctionnalités souhaitées, contexte métier, utilisateurs cibles..."
                                        className={erreurs.description_brute ? 'error' : ''}
                                    />
                                    <div className="textarea-footer">
                                        <span className={`char-count ${formulaire.description_brute.length < 50 ? 'warning' : 'ok'}`}>
                                            {formulaire.description_brute.length} / 50+ caractères
                                        </span>
                                    </div>
                                    {erreurs.description_brute && <span className="error-message">{erreurs.description_brute}</span>}
                                </div>

                                <div className="form-group animated-group">
                                    <label>Type de projet</label>
                                    <select name="type_projet" value={formulaire.type_projet} onChange={handleChange}>
                                        <option value="application_web">🌐 Application Web</option>
                                        <option value="application_mobile">📱 Application Mobile</option>
                                        <option value="erp">🏢 ERP / Système de gestion</option>
                                        <option value="ecommerce">🛒 E-commerce / Boutique en ligne</option>
                                        <option value="api">🔌 API / Backend</option>
                                        <option value="autre">🎯 Autre type</option>
                                    </select>
                                </div>

                                <div className="form-grid-2">
                                    <div className="form-group animated-group">
                                        <label>Budget estimé (DZD)</label>
                                        <input
                                            type="number"
                                            name="budget_estime"
                                            value={formulaire.budget_estime}
                                            onChange={handleChange}
                                            placeholder="500 000"
                                        />
                                    </div>

                                    <div className="form-group animated-group">
                                        <label>Délai souhaité</label>
                                        <input
                                            type="text"
                                            name="delai_souhaite"
                                            value={formulaire.delai_souhaite}
                                            onChange={handleChange}
                                            placeholder="3 mois"
                                        />
                                    </div>
                                </div>

                                <div className="form-group animated-group">
                                    <label>Technologies souhaitées</label>
                                    <input
                                        type="text"
                                        name="technologies_souhaitees"
                                        value={formulaire.technologies_souhaitees}
                                        onChange={handleChange}
                                        placeholder="React, Node.js, MySQL, Docker..."
                                    />
                                </div>

                                <div className="formulaire-buttons double">
                                    <button className="btn btn-secondary back-btn" onClick={etapePrecedente}>
                                        ← Retour
                                    </button>
                                    <button className="btn btn-primary submit-btn" onClick={handleSubmit} disabled={chargement}>
                                        {chargement ? (
                                            <>
                                                <div className="spinner"></div>
                                                Génération en cours...
                                            </>
                                        ) : (
                                            <>
                                                ✨ Générer le CDC
                                                <span className="form-btn-arrow">→</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Éléments décoratifs */}
                    <div className="formulaire-orb-1"></div>
                    <div className="formulaire-orb-2"></div>
                </div>
            </div>
        </div>
    );
}

export default FormulairePage;