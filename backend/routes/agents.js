// ============================================================
// routes/agents.js
// Endpoints pour déclencher et suivre le pipeline multi-agents
//
// POST /api/agents/generer/:projetId = Lance le pipeline
// GET  /api/agents/session/:uuid     = Statut d'une session
// GET  /api/agents/sessions/:projetId = Historique sessions
// 

// ============================================================
// routes/agents.js
// Endpoints pour le pipeline multi-agents
// ============================================================

import express from 'express';
import pool from '../database/postgres.js';
import Orchestrateur from '../services/orchestrateur.js';

const router = express.Router();

// ============================================================
// POST /api/agents/generer/:projetId
// Lance le pipeline complet
// ============================================================
router.post('/generer/:projetId', async (req, res) => {
    const { projetId } = req.params;
    const { sessionUuid: clientSessionUuid } = req.body;

    try {
        // 1. Vérifier que le projet existe
        const projetResult = await pool.query(
            `SELECT p.*, c.nom, c.prenom, c.email, c.entreprise
             FROM projets p
             JOIN clients c ON p.client_id = c.id
             WHERE p.id = $1`,
            [projetId]
        );

        if (projetResult.rows.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'Projet introuvable'
            });
        }

        const projet = projetResult.rows[0];
        const io = req.app.get('io');

        // 2. Générer un UUID de session si non fourni
        const sessionUuid = clientSessionUuid || crypto.randomUUID();

        // 3. Créer la session en base
        const sessionResult = await pool.query(
            `INSERT INTO sessions_agents 
             (projet_id, session_uuid, statut_global)
             VALUES ($1, $2, 'en_cours')
             RETURNING id`,
            [projetId, sessionUuid]
        );
        const sessionId = sessionResult.rows[0].id;

        // 4. Préparer les données du projet
        const donneesProjet = {
            description_brute: projet.description_brute,
            type_projet: projet.type_projet,
            budget_estime: projet.budget_estime,
            delai_souhaite: projet.delai_souhaite,
            technologies_souhaitees: projet.technologies_souhaitees
        };

        // 5. Lancer le pipeline en arrière-plan (async)
        const orchestrateur = new Orchestrateur();
        
        // Ne pas attendre la fin du pipeline pour répondre
        orchestrateur.lancerPipeline(
            projetId,
            sessionId,
            sessionUuid,
            donneesProjet,
            io
        ).catch(error => {
            console.error('❌ Erreur pipeline:', error.message);
            io.to(sessionUuid).emit('pipeline_erreur', {
                message: error.message
            });
        });

        // 6. Répondre immédiatement avec la session UUID
        return res.status(202).json({
            succes: true,
            message: 'Pipeline démarré avec succès',
            data: {
                sessionUuid,
                projetId: parseInt(projetId),
                statut: 'en_cours'
            }
        });

    } catch (error) {
        console.error('❌ Erreur démarrage pipeline:', error.message);
        return res.status(500).json({
            succes: false,
            message: 'Erreur démarrage pipeline',
            erreur: error.message
        });
    }
});

// ============================================================
// GET /api/agents/session/:uuid
// Récupère le statut d'une session
// ============================================================
router.get('/session/:uuid', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT sa.*,
                    cdc.id as cdc_id,
                    cdc.score_completude,
                    cdc.statut as cdc_statut
             FROM sessions_agents sa
             LEFT JOIN cahiers_des_charges cdc ON sa.id = cdc.session_id
             WHERE sa.session_uuid = $1`,
            [req.params.uuid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'Session introuvable'
            });
        }

        return res.json({
            succes: true,
            data: result.rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: 'Erreur récupération session',
            erreur: error.message
        });
    }
});

// ============================================================
// GET /api/agents/sessions/:projetId
// Récupère l'historique des sessions
// ============================================================
router.get('/sessions/:projetId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT sa.*,
                    cdc.id as cdc_id,
                    cdc.score_completude
             FROM sessions_agents sa
             LEFT JOIN cahiers_des_charges cdc ON sa.id = cdc.session_id
             WHERE sa.projet_id = $1
             ORDER BY sa.started_at DESC`,
            [req.params.projetId]
        );

        return res.json({
            succes: true,
            data: result.rows
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: 'Erreur récupération sessions',
            erreur: error.message
        });
    }
});

export default router;