// ============================================================
// services/orchestrateur.js
// Orchestrateur principal du système multi-agents
// Coordonne l'exécution des 4 agents dans l'ordre
// et gère toute la session de génération
// 

import { v4 as uuidv4 } from 'uuid';

import pool from '../database/postgres.js';
import AgentCollecte    from '../agents/agentCollecte.js';
import AgentAnalyse     from '../agents/agentAnalyse.js';
import AgentGeneration  from '../agents/agentGeneration.js';
import AgentValidation  from '../agents/agentValidation.js';

class Orchestrateur {
    constructor() {
        // Instancie les 4 agents une seule fois
        this.agentCollecte   = new AgentCollecte();
        this.agentAnalyse    = new AgentAnalyse();
        this.agentGeneration = new AgentGeneration();
        this.agentValidation = new AgentValidation();
    }

    // 
    // Lancement du pipeline complet
    // C'est la méthode principale appelée par la route API
    // Elle reçoit les données du projet et retourne le CDC
    // 
    async lancerPipeline(projetId, donneesProjet, io) {
        
        // Génère un UUID unique pour cette session
        const sessionUuid = uuidv4();
        let sessionId = null;

        try {
            // Étape 0 : Création de la session
            // PostgreSQL : $1, $2... au lieu de ?
            // PostgreSQL : RETURNING id au lieu de insertId
            const sessionResult = await pool.query(
                `INSERT INTO sessions_agents 
                 (projet_id, session_uuid, statut_global)
                 VALUES ($1, $2, 'en_cours')
                 RETURNING id`,
                [projetId, sessionUuid]
            );
            sessionId = sessionResult.rows[0].id;

            // Notifie le frontend que le pipeline a démarré
            io.to(sessionUuid).emit('pipeline_demarre', {
                sessionUuid,
                message: 'Pipeline multi-agents démarré'
            });

            // 
            // Étape 1 : Agent Collecte 
            // 
            io.to(sessionUuid).emit('agent_actif', {
                agent: 'CollecteAgent',
                numero: 1
            });

            const resultatsCollecte = await this.agentCollecte.executer(
                donneesProjet,
                sessionId,
                io,
                sessionUuid
            );

            // 
            // Étape 2 : Agent Analyse
            // 
            io.to(sessionUuid).emit('agent_actif', {
                agent: 'AnalyseAgent',
                numero: 2
            });

            const resultatsAnalyse = await this.agentAnalyse.executer(
                { collecte: resultatsCollecte },
                sessionId,
                io,
                sessionUuid
            );

            // 
            // Étape 3 : Agent Génération
            // 
            io.to(sessionUuid).emit('agent_actif', {
                agent: 'GenerationAgent',
                numero: 3
            });

            const resultatsGeneration = await this.agentGeneration.executer(
                {
                    collecte: resultatsCollecte,
                    analyse:  resultatsAnalyse
                },
                sessionId,
                io,
                sessionUuid
            );

            // 
            // Étape 4 : Agent Validation
            // 
            io.to(sessionUuid).emit('agent_actif', {
                agent: 'ValidationAgent',
                numero: 4
            });

            const resultatsValidation = await this.agentValidation.executer(
                {
                    collecte:   resultatsCollecte,
                    analyse:    resultatsAnalyse,
                    generation: resultatsGeneration
                },
                sessionId,
                io,
                sessionUuid
            );

            // 
            // Étape 5 : Sauvegarde du CDC en base
            // PostgreSQL : $1, $2... au lieu de ?
            // PostgreSQL : RETURNING id au lieu de insertId
            // 
            const cdcResult = await pool.query(
                `INSERT INTO cahiers_des_charges
                 (projet_id, session_id, contenu_markdown, 
                  score_completude, sections_manquantes, statut)
                 VALUES ($1, $2, $3, $4, $5, 'brouillon')
                 RETURNING id`,
                [
                    projetId,
                    sessionId,
                    resultatsGeneration.contenu_markdown,
                    resultatsValidation.score_completude,
                    JSON.stringify(resultatsValidation.sections_manquantes || [])
                ]
            );

            const cdcId = cdcResult.rows[0].id;

            // PostgreSQL : $1 au lieu de ?
            await pool.query(
                `UPDATE projets SET statut = 'cdc_genere' WHERE id = $1`,
                [projetId]
            );

            // PostgreSQL : $1, $2... au lieu de ?
            await pool.query(
                `UPDATE sessions_agents 
                 SET statut_global = 'termine', finished_at = NOW()
                 WHERE id = $1`,
                [sessionId]
            );

            // Résultat final complet
            const resultatFinal = {
                sessionUuid,
                cdcId,
                collecte:   resultatsCollecte,
                analyse:    resultatsAnalyse,
                generation: resultatsGeneration,
                validation: resultatsValidation
            };

            // Notifie le frontend que tout est terminé
            io.to(sessionUuid).emit('pipeline_termine', {
                message: 'CDC généré avec succès',
                cdcId,
                score: resultatsValidation.score_completude,
                verdict: resultatsValidation.verdict
            });

            return resultatFinal;

        } catch (error) {
            // En cas d'erreur, met à jour la session
            if (sessionId) {
                // PostgreSQL : $1, $2... au lieu de ?
                await pool.query(
                    `UPDATE sessions_agents
                     SET statut_global = 'erreur',
                         message_erreur = $1,
                         finished_at = NOW()
                     WHERE id = $2`,
                    [error.message, sessionId]
                );
            }

            // Notifie le frontend de l'erreur
            if (sessionUuid) {
                io.to(sessionUuid).emit('pipeline_erreur', {
                    message: `Erreur : ${error.message}`
                });
            }

            throw error;
        }
    }

    // 
    // Récupération d'un CDC existant
    // Utilisée par la route GET /api/cdc/:id
    // 
    async recupererCDC(cdcId) {
        // PostgreSQL : $1 au lieu de ?
        const result = await pool.query(
            `SELECT c.*, p.titre as projet_titre, p.type_projet,
                    cl.nom, cl.prenom, cl.entreprise
             FROM cahiers_des_charges c
             JOIN projets p ON c.projet_id = p.id
             JOIN clients cl ON p.client_id = cl.id
             WHERE c.id = $1`,
            [cdcId]
        );

        if (result.rows.length === 0) {
            throw new Error('CDC introuvable');
        }

        return result.rows[0];
    }
}

export default Orchestrateur;