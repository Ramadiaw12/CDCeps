// ============================================================
// agents/agentGeneration.js
// Agent 3 : Génération du CDC
// Version optimisée pour réduire les tokens
// ============================================================

import BaseAgent from './baseAgent.js';
import pool from '../database/postgres.js';

class AgentGeneration extends BaseAgent {
    constructor() {
        super(
            'GenerationAgent',
            `Rédige un CDC structuré en Markdown avec :
            1. Présentation
            2. Objectifs
            3. Fonctionnalités
            4. Contraintes
            5. Planning
            6. Budget
            Sois CONCIS et professionnel.`
        );
    }

    async executer(donnees, sessionId, io, sessionUuid) {
        try {
            this.notifierProgression(io, sessionUuid, 'Rédaction du CDC en cours...');
            await this.mettreAJourStatut(sessionId, 'running');

            // Résumer les données (max 3000 caractères)
            const messageUtilisateur = `
            Génère un CDC avec ces données (résumé) :
            Collecte: ${JSON.stringify(donnees.collecte).substring(0, 1500)}
            Analyse: ${JSON.stringify(donnees.analyse).substring(0, 1500)}
            `;

            const reponse = await this.appelerLLM(messageUtilisateur, {
                temperature: 0.7,
                maxTokens: 4096  // Limité à 4096 tokens
            });

            // Nettoyer la réponse
            const contenu = reponse.replace(/```markdown/g, '').replace(/```/g, '').trim();

            await this.mettreAJourStatut(sessionId, 'done');
            this.notifierProgression(io, sessionUuid, 'CDC généré avec succès');

            return { contenu_markdown: contenu };

        } catch (error) {
            await this.mettreAJourStatut(sessionId, 'error');
            this.notifierProgression(io, sessionUuid, `❌ Erreur génération : ${error.message}`);
            throw new Error(`AgentGeneration : ${error.message}`);
        }
    }
}

export default AgentGeneration;
