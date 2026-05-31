// ============================================================
// routes/projets.js
// Endpoints REST pour la gestion des projets et clients
// 
// POST /api/projets          → Crée un client + projet
// GET  /api/projets          → Liste tous les projets
// GET  /api/projets/:id      → Détail d'un projet
// PUT  /api/projets/:id      → Met à jour un projet
// ============================================================

import express from 'express';
import pool from '../database/mysql.js';

const router = express.Router();

// POST /api/projets
// Reçoit les données du formulaire React et crée
// le client + projet en base de données
router.post('/', async (req, res) => {
    // Récupère toutes les données du formulaire
    const {
        // Données client
        nom,
        prenom,
        email,
        telephone,
        entreprise,
        secteur,

        // Données projet
        titre,
        description_brute,
        type_projet,
        budget_estime,
        delai_souhaite,
        technologies_souhaitees
    } = req.body;

    // Validation des champs obligatoires
    if (!nom || !prenom || !email || !titre || !description_brute) {
        return res.status(400).json({
            succes: false,
            message: 'Champs obligatoires manquants : nom, prenom, email, titre, description_brute'
        });
    }

    // Utilise une connexion dédiée pour la transaction
    // Une transaction garantit que les deux insertions
    // (client + projet) réussissent ensemble ou échouent ensemble
    const connection = await pool.getConnection();

    try {
        // Démarre la transaction
        await connection.beginTransaction();

        // Étape 1 : Crée ou récupère le client
        // ON DUPLICATE KEY UPDATE permet de ne pas créer
        // de doublon si l'email existe déjà
        const [clientResult] = await connection.execute(
            `INSERT INTO clients 
             (nom, prenom, email, telephone, entreprise, secteur)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             nom = VALUES(nom),
             prenom = VALUES(prenom),
             telephone = VALUES(telephone),
             entreprise = VALUES(entreprise)`,
            [nom, prenom, email, telephone || null,
             entreprise || null, secteur || 'autre']
        );

        // Récupère l'id du client créé ou existant
        let clientId;
        if (clientResult.insertId > 0) {
            clientId = clientResult.insertId;
        } else {
            // L'email existait déjà — récupère son id
            const [existing] = await connection.execute(
                'SELECT id FROM clients WHERE email = ?',
                [email]
            );
            clientId = existing[0].id;
        }

        // Étape 2 : Crée le projet
        const [projetResult] = await connection.execute(
            `INSERT INTO projets
             (client_id, titre, description_brute, type_projet,
              budget_estime, delai_souhaite, technologies_souhaitees)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                clientId,
                titre,
                description_brute,
                type_projet || 'autre',
                budget_estime || null,
                delai_souhaite || null,
                technologies_souhaitees || null
            ]
        );

        const projetId = projetResult.insertId;

        // Valide la transaction — tout s'est bien passé
        await connection.commit();

        // Retourne les IDs créés au frontend
        return res.status(201).json({
            succes: true,
            message: 'Projet créé avec succès',
            data: {
                clientId,
                projetId
            }
        });

    } catch (error) {
        // Annule tout si une erreur survient
        await connection.rollback();

        console.error('Erreur création projet :', error.message);

        return res.status(500).json({
            succes: false,
            message: 'Erreur lors de la création du projet',
            erreur: error.message
        });

    } finally {
        // Libère toujours la connexion
        connection.release();
    }
});

// GET /api/projets 
// Retourne la liste de tous les projets avec
// les infos client associées
router.get('/', async (req, res) => {
    try {
        const [projets] = await pool.execute(
            `SELECT p.id, p.titre, p.type_projet, p.statut,
                    p.budget_estime, p.delai_souhaite,
                    p.created_at,
                    c.nom, c.prenom, c.email, c.entreprise,
                    -- Vérifie si un CDC a été généré pour ce projet
                    COUNT(cdc.id) as nb_cdc
             FROM projets p
             JOIN clients c ON p.client_id = c.id
             LEFT JOIN cahiers_des_charges cdc ON p.id = cdc.projet_id
             GROUP BY p.id
             ORDER BY p.created_at DESC`
        );

        return res.json({
            succes: true,
            data: projets
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: 'Erreur récupération projets',
            erreur: error.message
        });
    }
});

// GET /api/projets/:id 
// Retourne le détail complet d'un projet
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT p.*,
                    c.nom, c.prenom, c.email,
                    c.telephone, c.entreprise, c.secteur
             FROM projets p
             JOIN clients c ON p.client_id = c.id
             WHERE p.id = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'Projet introuvable'
            });
        }

        return res.json({
            succes: true,
            data: rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: 'Erreur récupération projet',
            erreur: error.message
        });
    }
});

// PUT /api/projets/:id
// Met à jour le statut ou les infos d'un projet
router.put('/:id', async (req, res) => {
    try {
        const { statut, titre, description_brute } = req.body;

        await pool.execute(
            `UPDATE projets 
             SET statut = COALESCE(?, statut),
                 titre = COALESCE(?, titre),
                 description_brute = COALESCE(?, description_brute)
             WHERE id = ?`,
            [statut || null, titre || null,
             description_brute || null, req.params.id]
        );

        return res.json({
            succes: true,
            message: 'Projet mis à jour'
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: 'Erreur mise à jour projet',
            erreur: error.message
        });
    }
});

export default router;