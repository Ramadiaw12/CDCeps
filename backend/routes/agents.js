// ============================================================
// routes/agents.js
// Endpoints pour déclencher et suivre le pipeline multi-agents
//
// POST /api/agents/generer/:projetId = Lance le pipeline
// GET  /api/agents/session/:uuid     = Statut d'une session
// GET  /api/agents/sessions/:projetId = Historique sessions
// 

import express from 'express';
import pool from '../database/postgres.js';
import Orchestrateur from '../services/orchestrateur.js';

const router = express.Router();

// Instance unique de l'orchestrateur
const orchestrateur = new Orchestrateur();

// 
// POST /api/agents/generer/:projetId
// 
router.post('/generer/:projetId', async (req, res) => {
    const { projetId } = req.params;

    try {
        // PostgreSQL : $1 au lieu de ?, result.rows au lieu de [rows]
        const result = await pool.query(
            `SELECT p.*, c.nom, c.prenom, c.email, c.entreprise
             FROM projets p
             JOIN clients c ON p.client_id = c.id
             WHERE p.id = $1`,
            [projetId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'Projet introuvable'
            });
        }

        const projet = result.rows[0];

        const io = req.app.get('io');

        const donneesProjet = {
            description_brute:        projet.description_brute,
            type_projet:              projet.type_projet,
            budget_estime:            projet.budget_estime,
            delai_souhaite:           projet.delai_souhaite,
            technologies_souhaitees:  projet.technologies_souhaitees
        };

        // Lance le pipeline en arrière-plan
        const pipelinePromise = orchestrateur.lancerPipeline(
            projetId,
            donneesProjet,
            io
        );

        pipelinePromise.then(resultat => {
            console.log(`Pipeline terminé - CDC ID: ${resultat.cdcId}`);
        }).catch(error => {
            console.error('Erreur pipeline :', error.message);
        });

        //  PostgreSQL : $1, result.rows
        const sessionsResult = await pool.query(
            `SELECT session_uuid FROM sessions_agents
             WHERE projet_id = $1
             ORDER BY started_at DESC
             LIMIT 1`,
            [projetId]
        );

        // Petite attente pour que la session soit créée
        await new Promise(resolve => setTimeout(resolve, 500));

        const sessionsApresResult = await pool.query(
            `SELECT session_uuid FROM sessions_agents
             WHERE projet_id = $1
             ORDER BY started_at DESC
             LIMIT 1`,
            [projetId]
        );

        return res.status(202).json({
            succes: true,
            message: 'Pipeline démarré - suivez la progression via Socket.io',
            data: {
                projetId: parseInt(projetId),
                statut: 'en_cours'
            }
        });

    } catch (error) {
        console.error('Erreur démarrage pipeline :', error.message);

        return res.status(500).json({
            succes: false,
            message: 'Erreur démarrage pipeline',
            erreur: error.message
        });
    }
});

// 
// GET /api/agents/session/:uuid
// 
router.get('/session/:uuid', async (req, res) => {
    try {
        // PostgreSQL : $1 au lieu de ?
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

// 
// GET /api/agents/sessions/:projetId
// 
router.get('/sessions/:projetId', async (req, res) => {
    try {
        // PostgreSQL : $1 au lieu de ?
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