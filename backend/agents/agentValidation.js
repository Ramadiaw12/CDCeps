// ============================================================
// agents/agentValidation.js
// Agent 4 : Validation et contrôle qualité du CDC
// Vérifie la cohérence, complétude et qualité du CDC
// généré par l'Agent 3 et propose des améliorations
// ============================================================

import BaseAgent from './baseAgent.js';

class AgentValidation extends BaseAgent {
    constructor() {
        super(
            'ValidationAgent',
            `Tu es un expert en validation de CDC. Analyse la qualité du CDC généré et retourne UNIQUEMENT du JSON valide.

        Structure JSON :
        {
            "score_completude": 85,
            "sections_manquantes": ["section1"],
            "verdict": "CDC de bonne qualité",
            "recommandations": ["recommandation1"],
            "qualite_globale": "bon"
        }

        Sois CONCIS dans tes commentaires.`
        );
    }

    async executer(donnees, sessionId, io, sessionUuid) {
        try {
            this.notifierProgression(
                io, sessionUuid,
                'Validation et contrôle qualité du CDC...'
            );

            await this.mettreAJourStatut(sessionId, 'running');

            const messageUtilisateur = `
                Valide ce cahier des charges et évalue sa qualité :
                
                ═══════════════════════════════════════
                CONTEXTE DU PROJET
                ═══════════════════════════════════════
                Titre : ${donnees.collecte.titre_projet}
                Type : ${donnees.collecte.type_projet}
                Objectif : ${donnees.collecte.objectif_principal}
                
                Sections obligatoires à vérifier :
                - Contexte et présentation du projet
                - Objectifs du projet
                - Périmètre fonctionnel
                - Besoins fonctionnels
                - Besoins non fonctionnels
                - Contraintes techniques
                - Livrables attendus
                - Planning prévisionnel
                - Budget prévisionnel
                
                ═══════════════════════════════════════
                CDC À VALIDER
                ═══════════════════════════════════════
                ${donnees.generation.contenu_markdown}
                
                Retourne UNIQUEMENT le JSON de validation.
            `;

            const reponse = await this.appelerLLM(messageUtilisateur, {
                // Température plus élevée pour une évaluation
                // plus nuancée et moins mécanique
                temperature: 0.4,
                maxTokens: 4096
            });

            const reponseNettoyee = reponse
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            const resultat = JSON.parse(reponseNettoyee);

            // Notifie avec le score obtenu
            this.notifierProgression(
                io, sessionUuid,
                `Validation terminée — score : ${resultat.score_completude}/100 — ${resultat.verdict}`
            );

            await this.mettreAJourStatut(sessionId, 'done');

            return resultat;

        } catch (error) {
            await this.mettreAJourStatut(sessionId, 'error');

            this.notifierProgression(
                io, sessionUuid,
                `Erreur validation : ${error.message}`
            );

            throw new Error(`AgentValidation : ${error.message}`);
        }
    }
}

export default AgentValidation;