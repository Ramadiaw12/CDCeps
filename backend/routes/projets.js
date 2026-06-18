// ============================================================
// routes/projets.js
// Endpoints REST pour la gestion des projets et clients
// 
// POST /api/projets          Crée un client + projet
// GET  /api/projets          Liste tous les projets
// GET  /api/projets/:id      Détail d'un projet
// PUT  /api/projets/:id      Met à jour un projet
// 

import express from 'express';

import pool from '../database/postgres.js';

const router = express.Router();

// 
// POST /api/projets
// Reçoit les données du formulaire React et crée
// le client + projet en base de données
// 
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

    // PostgreSQL : On utilise pool.connect() pour les transactions
    // En PostgreSQL, on utilise un client dédié pour la transaction
    const client = await pool.connect();

    try {
        // PostgreSQL : BEGIN au lieu de beginTransaction()
        await client.query('BEGIN');

        // Étape 1 : Crée ou récupère le client
        // PostgreSQL : ON CONFLICT (email) DO UPDATE au lieu de ON DUPLICATE KEY UPDATE
        // PostgreSQL : $1, $2... au lieu de ?
        // PostgreSQL : RETURNING id au lieu de insertId
        const clientResult = await client.query(
            `INSERT INTO clients 
             (nom, prenom, email, telephone, entreprise, secteur)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (email) DO UPDATE SET
             nom = EXCLUDED.nom,
             prenom = EXCLUDED.prenom,
             telephone = EXCLUDED.telephone,
             entreprise = EXCLUDED.entreprise
             RETURNING id`,
            [nom, prenom, email, telephone || null,
             entreprise || null, secteur || 'autre']
        );

        // PostgreSQL : Le résultat est dans clientResult.rows[0].id
        let clientId = clientResult.rows[0].id;

        // Étape 2 : Crée le projet
        // PostgreSQL : $1, $2... au lieu de ?
        // PostgreSQL : RETURNING id au lieu de insertId
        const projetResult = await client.query(
            `INSERT INTO projets
             (client_id, titre, description_brute, type_projet,
              budget_estime, delai_souhaite, technologies_souhaitees)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
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

        const projetId = projetResult.rows[0].id;

        // PostgreSQL : COMMIT au lieu de commit()
        await client.query('COMMIT');

        return res.status(201).json({
            succes: true,
            message: 'Projet créé avec succès',
            data: {
                clientId,
                projetId
            }
        });

    } catch (error) {
        // PostgreSQL : ROLLBACK au lieu de rollback()
        await client.query('ROLLBACK');

        console.error('Erreur création projet :', error.message);

        return res.status(500).json({
            succes: false,
            message: 'Erreur lors de la création du projet',
            erreur: error.message
        });

    } finally {
        // PostgreSQL : release() au lieu de release()
        client.release();
    }
});

// 
// GET /api/projets 
// Retourne la liste de tous les projets avec
// les infos client associées
// 
router.get('/', async (req, res) => {
    try {
        // PostgreSQL : pool.query() au lieu de pool.execute()
        // PostgreSQL : $1, $2... au lieu de ?
        // PostgreSQL : result.rows au lieu de [rows]
        const result = await pool.query(
            `SELECT p.id, p.titre, p.type_projet, p.statut,
                    p.budget_estime, p.delai_souhaite,
                    p.created_at,
                    c.nom, c.prenom, c.email, c.entreprise,
                    COUNT(cdc.id) as nb_cdc
             FROM projets p
             JOIN clients c ON p.client_id = c.id
             LEFT JOIN cahiers_des_charges cdc ON p.id = cdc.projet_id
             GROUP BY p.id, c.id
             ORDER BY p.created_at DESC`
        );

        return res.json({
            succes: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Erreur récupération projets:', error.message);
        return res.status(500).json({
            succes: false,
            message: 'Erreur récupération projets',
            erreur: error.message
        });
    }
});

// 
// GET /api/projets/:id 
// Retourne le détail complet d'un projet
// 
router.get('/:id', async (req, res) => {
    try {
        // PostgreSQL : $1 au lieu de ?
        const result = await pool.query(
            `SELECT p.*,
                    c.nom, c.prenom, c.email,
                    c.telephone, c.entreprise, c.secteur
             FROM projets p
             JOIN clients c ON p.client_id = c.id
             WHERE p.id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'Projet introuvable'
            });
        }

        return res.json({
            succes: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Erreur récupération projet:', error.message);
        return res.status(500).json({
            succes: false,
            message: 'Erreur récupération projet',
            erreur: error.message
        });
    }
});

// 
// PUT /api/projets/:id
// Met à jour le statut ou les infos d'un projet
// 
router.put('/:id', async (req, res) => {
    try {
        const { statut, titre, description_brute } = req.body;

        // PostgreSQL : $1, $2... au lieu de ?
        // PostgreSQL : COALESCE fonctionne pareil
        // PostgreSQL : result.rows pour vérifier si mis à jour
        const result = await pool.query(
            `UPDATE projets 
             SET statut = COALESCE($1, statut),
                 titre = COALESCE($2, titre),
                 description_brute = COALESCE($3, description_brute)
             WHERE id = $4
             RETURNING id`,
            [statut || null, titre || null,
             description_brute || null, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'Projet introuvable'
            });
        }

        return res.json({
            succes: true,
            message: 'Projet mis à jour'
        });

    } catch (error) {
        console.error('Erreur mise à jour projet:', error.message);
        return res.status(500).json({
            succes: false,
            message: 'Erreur mise à jour projet',
            erreur: error.message
        });
    }
});

export default router;