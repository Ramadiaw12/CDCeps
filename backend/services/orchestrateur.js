// ============================================================
// services/orchestrateur.js
// Orchestrateur principal du système multi-agents
// Coordonne l'exécution des 4 agents dans l'ordre
// et gère toute la session de génération
// 

// ============================================================
// services/orchestrateur.js
// Orchestrateur principal du système multi-agents
// ============================================================

import pool from '../database/postgres.js';
import AgentCollecte from '../agents/agentCollecte.js';
import AgentAnalyse from '../agents/agentAnalyse.js';
import AgentGeneration from '../agents/agentGeneration.js';
import AgentValidation from '../agents/agentValidation.js';

class Orchestrateur {
    constructor() {
        this.agentCollecte = new AgentCollecte();
        this.agentAnalyse = new AgentAnalyse();
        this.agentGeneration = new AgentGeneration();
        this.agentValidation = new AgentValidation();
    }

    // 
    // LANCEMENT DU PIPELINE COMPLET
    // 
    async lancerPipeline(projetId, sessionId, sessionUuid, donneesProjet, io) {
        console.log(`Pipeline démarré pour le projet ${projetId}`);
        console.log(`Session: ${sessionUuid}`);

        try {
            // Notifier le début
            io.to(sessionUuid).emit('pipeline_demarre', {
                message: 'Pipeline multi-agents démarré',
                projetId,
                sessionUuid
            });

            // 
            // ÉTAPE 1 : AGENT COLLECTE
            // 
            io.to(sessionUuid).emit('agent_actif', {
                agent: 'CollecteAgent',
                numero: 1,
                nom: 'Agent Collecte'
            });

            const resultatsCollecte = await this.agentCollecte.executer(
                donneesProjet,
                sessionId,
                io,
                sessionUuid
            );

            await this.sauvegarderResultat(sessionId, 'collecte', resultatsCollecte);
            // Pause pour éviter le rate limit
            await new Promise(resolve => setTimeout(resolve, 3000));
            // 
            // ÉTAPE 2 : AGENT ANALYSE (avec RAG)
            // 
            io.to(sessionUuid).emit('agent_actif', {
                agent: 'AnalyseAgent',
                numero: 2,
                nom: 'Agent Analyse'
            });

            const resultatsAnalyse = await this.agentAnalyse.executer(
                { collecte: resultatsCollecte },
                sessionId,
                io,
                sessionUuid
            );

            await this.sauvegarderResultat(sessionId, 'analyse', resultatsAnalyse);

            // 
            // ÉTAPE 3 : AGENT GÉNÉRATION
            // 
            io.to(sessionUuid).emit('agent_actif', {
                agent: 'GenerationAgent',
                numero: 3,
                nom: 'Agent Génération'
            });

            const resultatsGeneration = await this.agentGeneration.executer(
                {
                    collecte: resultatsCollecte,
                    analyse: resultatsAnalyse
                },
                sessionId,
                io,
                sessionUuid
            );

            await this.sauvegarderResultat(sessionId, 'generation', resultatsGeneration);

            // 
            // ÉTAPE 4 : AGENT VALIDATION
            // 
            io.to(sessionUuid).emit('agent_actif', {
                agent: 'ValidationAgent',
                numero: 4,
                nom: 'Agent Validation'
            });

            const resultatsValidation = await this.agentValidation.executer(
                {
                    collecte: resultatsCollecte,
                    analyse: resultatsAnalyse,
                    generation: resultatsGeneration
                },
                sessionId,
                io,
                sessionUuid
            );

            await this.sauvegarderResultat(sessionId, 'validation', resultatsValidation);

            // 
            // SAUVEGARDE DU CDC
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
                    resultatsValidation.score_completude || 0,
                    JSON.stringify(resultatsValidation.sections_manquantes || [])
                ]
            );

            const cdcId = cdcResult.rows[0].id;

            // Mettre à jour le statut du projet
            await pool.query(
                `UPDATE projets SET statut = 'cdc_genere' WHERE id = $1`,
                [projetId]
            );

            // Mettre à jour la session
            await pool.query(
                `UPDATE sessions_agents 
                 SET statut_global = 'termine', finished_at = NOW()
                 WHERE id = $1`,
                [sessionId]
            );

            // 
            // NOTIFICATION FINALE
            // 
            const resultatFinal = {
                cdcId,
                sessionUuid,
                score: resultatsValidation.score_completude || 0,
                verdict: resultatsValidation.verdict || 'CDC généré avec succès',
                collecte: resultatsCollecte,
                analyse: resultatsAnalyse,
                generation: resultatsGeneration,
                validation: resultatsValidation
            };

            io.to(sessionUuid).emit('pipeline_termine', {
                message: 'CDC généré avec succès',
                cdcId,
                score: resultatsValidation.score_completude || 0,
                verdict: resultatsValidation.verdict || 'CDC généré avec succès'
            });

            console.log(`Pipeline terminé pour le projet ${projetId}`);
            console.log(`CDC ID: ${cdcId}`);

            return resultatFinal;

        } catch (error) {
            console.error('❌ Erreur pipeline:', error.message);

            // Mettre à jour la session en erreur
            await pool.query(
                `UPDATE sessions_agents
                 SET statut_global = 'erreur',
                     message_erreur = $1,
                     finished_at = NOW()
                 WHERE id = $2`,
                [error.message, sessionId]
            );

            io.to(sessionUuid).emit('pipeline_erreur', {
                message: error.message
            });

            throw error;
        }
    }

    // 
    // SAUVEGARDE DES RÉSULTATS
    // 
    async sauvegarderResultat(sessionId, etape, resultat) {
        const colonne = `resultats_${etape}`;
        await pool.query(
            `UPDATE sessions_agents 
             SET ${colonne} = $1 
             WHERE id = $2`,
            [JSON.stringify(resultat), sessionId]
        );
    }
}

export default Orchestrateur;