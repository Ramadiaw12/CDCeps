// ============================================================
// agents/agentValidation.js
// Agent 4 : Validation du CDC généré
// Version ultra-légère pour éviter le rate limit
// ============================================================

import BaseAgent from './baseAgent.js';

class AgentValidation extends BaseAgent {
    constructor() {
        super(
            'ValidationAgent',
            `Tu es un expert en qualité et validation de Cahiers des Charges.

            OBJECTIF : Évaluer la qualité et la complétude du CDC généré.

            STRUCTURE DE RÉPONSE (JSON UNIQUEMENT) :

            {
                "score_completude": 85,
                "sections_manquantes": ["section1", "section2"],
                "sections_a_ameliorer": [
                    {"section": "section", "commentaire": "à améliorer car..."}
                ],
                "verdict": "CDC de bonne qualité, mais quelques manques",
                "recommandations": [
                    "recommandation 1 pour améliorer",
                    "recommandation 2"
                ],
                "qualite_globale": "excellent|bon|moyen|faible"
            }

             RÈGLES :
            - Réponds UNIQUEMENT en JSON valide
            - Évalue chaque section du CDC
            - Propose des recommandations concrètes
            - Le score doit refléter la qualité réelle
            `
        );
    }

    async executer(donnees, sessionId, io, sessionUuid) {
        try {
            this.notifierProgression(io, sessionUuid, 'Validation du CDC en cours...');
            await this.mettreAJourStatut(sessionId, 'running');

            // ⚠️ ENVOYER UNIQUEMENT L'ESSENTIEL (résumé du CDC)
            const messageUtilisateur = `
            CDC à valider (extrait - 2000 caractères max) :
            ${donnees.generation.contenu_markdown.substring(0, 2000)}
            
            Objectif initial : ${donnees.collecte.objectif_principal || ''}
            `;

            const reponse = await this.appelerLLM(messageUtilisateur, {
                temperature: 0.3,
                maxTokens: 1024  // ✅ Limité à 1024 tokens pour la validation
            });

            const reponseNettoyee = reponse
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            const resultat = JSON.parse(reponseNettoyee);

            this.notifierProgression(io, sessionUuid, `Validation terminée - Score: ${resultat.score}/100`);
            await this.mettreAJourStatut(sessionId, 'done');

            return resultat;

        } catch (error) {
            await this.mettreAJourStatut(sessionId, 'error');
            this.notifierProgression(io, sessionUuid, `❌ Erreur validation : ${error.message}`);
            throw new Error(`AgentValidation : ${error.message}`);
        }
    }
}

export default AgentValidation;
