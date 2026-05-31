// ============================================================
// routes/agents.js
// Endpoints pour déclencher et suivre le pipeline multi-agents
//
// POST /api/agents/generer/:projetId = Lance le pipeline
// GET  /api/agents/session/:uuid     = Statut d'une session
// GET  /api/agents/sessions/:projetId = Historique sessions
// ============================================================

import express from 'express';
import pool from '../database/mysql.js';
import Orchestrateur from '../services/orchestrateur.js';

const router = express.Router();

// Instance unique de l'orchestrateur
// On la crée une fois et on la réutilise
const orchestrateur = new Orchestrateur();

// POST /api/agents/generer/:projetId
// Déclenche le pipeline complet des 4 agents
// C'est l'endpoint le plus important du système
router.post('/generer/:projetId', async (req, res) => {
    const { projetId } = req.params;

    try {
        // Vérifie que le projet existe en base
        const [projets] = await pool.execute(
            `SELECT p.*, c.nom, c.prenom, c.email, c.entreprise
             FROM projets p
             JOIN clients c ON p.client_id = c.id
             WHERE p.id = ?`,
            [projetId]
        );

        if (projets.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'Projet introuvable'
            });
        }

        const projet = projets[0];

        // Récupère l'instance Socket.io
        // pour envoyer les mises à jour en temps réel
        const io = req.app.get('io');

        // Prépare les données à envoyer aux agents
        const donneesProjet = {
            description_brute:        projet.description_brute,
            type_projet:              projet.type_projet,
            budget_estime:            projet.budget_estime,
            delai_souhaite:           projet.delai_souhaite,
            technologies_souhaitees:  projet.technologies_souhaitees
        };

        // IMPORTANT : On répond immédiatement au frontend
        // avec le sessionUuid AVANT de lancer le pipeline
        // Le pipeline tourne en arrière-plan
        // Le frontend suit la progression via Socket.io
        
        // Lance le pipeline en arrière-plan (sans await)
        // comme ça la réponse HTTP n'attend pas la fin
        const pipelinePromise = orchestrateur.lancerPipeline(
            projetId,
            donneesProjet,
            io
        );

        // Génère le sessionUuid avant le pipeline
        // On le récupère depuis la promesse
        // mais on répond d'abord au frontend
        pipelinePromise.then(resultat => {
            console.log(`Pipeline terminé - CDC ID: ${resultat.cdcId}`);
        }).catch(error => {
            console.error(' Erreur pipeline :', error.message);
        });

        // Récupère le sessionUuid créé par l'orchestrateur
        // On attend juste la création de la session (rapide)
        // puis on répond au frontend
        const [sessions] = await pool.execute(
            `SELECT session_uuid FROM sessions_agents
             WHERE projet_id = ?
             ORDER BY started_at DESC
             LIMIT 1`,
            [projetId]
        );

        // Petite attente pour que la session soit créée
        await new Promise(resolve => setTimeout(resolve, 500));

        const [sessionsApres] = await pool.execute(
            `SELECT session_uuid FROM sessions_agents
             WHERE projet_id = ?
             ORDER BY started_at DESC
             LIMIT 1`,
            [projetId]
        );

        return res.status(202).json({
            succes: true,
            message: 'Pipeline démarré - suivez la progression via Socket.io',
            data: {
                projetId: parseInt(projetId),
                // 202 Accepted = requête acceptée mais pas encore terminée
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

// GET /api/agents/session/:uuid
// Retourne le statut détaillé d'une session
// Utilisé par le frontend pour afficher la progression
router.get('/session/:uuid', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT sa.*,
                    cdc.id as cdc_id,
                    cdc.score_completude,
                    cdc.statut as cdc_statut
             FROM sessions_agents sa
             LEFT JOIN cahiers_des_charges cdc ON sa.id = cdc.session_id
             WHERE sa.session_uuid = ?`,
            [req.params.uuid]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'Session introuvable'
            });
        }

        return res.json({
            succes: true,
            data: rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: 'Erreur récupération session',
            erreur: error.message
        });
    }
});

// GET /api/agents/sessions/:projetId
// Retourne l'historique de toutes les sessions
// d'un projet - utile pour voir les tentatives précédentes
router.get('/sessions/:projetId', async (req, res) => {
    try {
        const [sessions] = await pool.execute(
            `SELECT sa.*,
                    cdc.id as cdc_id,
                    cdc.score_completude
             FROM sessions_agents sa
             LEFT JOIN cahiers_des_charges cdc ON sa.id = cdc.session_id
             WHERE sa.projet_id = ?
             ORDER BY sa.started_at DESC`,
            [req.params.projetId]
        );

        return res.json({
            succes: true,
            data: sessions
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