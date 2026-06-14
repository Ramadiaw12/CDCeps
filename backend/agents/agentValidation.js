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
            `Tu es un directeur qualité chez EPS SARL,
            responsable de la validation des cahiers des charges.
            
            Ton rôle est d'analyser un CDC généré et de :
            1. Vérifier que toutes les sections obligatoires sont présentes
            2. Évaluer la qualité et la complétude de chaque section
            3. Détecter les incohérences ou contradictions
            4. Calculer un score de complétude global
            5. Suggérer des améliorations concrètes
            
            Tu dois TOUJOURS répondre en JSON valide et rien d'autre.
            
            Structure de ta réponse :
            {
                "score_completude": 85,
                "validation_sections": [
                    {
                        "section": "nom de la section",
                        "presente": true,
                        "qualite": "bonne|moyenne|insuffisante",
                        "commentaire": "commentaire sur cette section"
                    }
                ],
                "incoherences": [
                    "description de l'incohérence détectée"
                ],
                "sections_manquantes": [
                    "section manquante 1"
                ],
                "suggestions_amelioration": [
                    "suggestion concrète 1"
                ],
                "points_forts": [
                    "point fort du CDC"
                ],
                "verdict": "approuvé|à réviser|insuffisant",
                "commentaire_global": "commentaire général sur le CDC"
            }
            
            Calcul du score_completude :
            - 90-100 : CDC excellent, prêt à soumettre
            - 70-89  : CDC bon, quelques améliorations mineures
            - 50-69  : CDC moyen, révisions nécessaires
            - 0-49   : CDC insuffisant, refaire
            `
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
                maxTokens: 2000
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