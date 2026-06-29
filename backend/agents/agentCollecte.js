// ============================================================
// Cet agent reçoit la description brute du client et extrait toutes les informations importantes de façon structurée. Il retourne un JSON propre que l'Agent 2 va utiliser.
// agents/agentCollecte.js
// Agent 1 : Collecte et extraction des besoins
// Reçoit la description brute du client et extrait les informations clés sous forme structurée
// ============================================================

import BaseAgent from './baseAgent.js';

class AgentCollecte extends BaseAgent {
    constructor() {
        // Définit le prompt système de cet agent
        // C'est ce qui lui donne son comportement spécifique
        super(
            'CollecteAgent',
            `Tu es un consultant IT senior expert en analyse de besoins.

            OBJECTIF : Extraire TOUTES les informations pertinentes de la description du projet.

            STRUCTURE DE RÉPONSE (JSON UNIQUEMENT) :

            {
                "titre_projet": "Titre court et impactant",
                "type_projet": "application_web|application_mobile|erp|ecommerce|api|infrastructure|autre",
                "secteur_activite": "Secteur métier du client",
                "objectif_principal": "Objectif en une phrase claire",
                "objectifs_secondaires": ["Objectif 1", "Objectif 2"],
                "besoins_fonctionnels": [
                    {"description": "besoin 1", "priorite": "critique|important|optionnel"},
                    {"description": "besoin 2", "priorite": "critique|important|optionnel"}
                ],
                "besoins_non_fonctionnels": [
                    {"description": "Performance", "niveau": "élevé|moyen|faible"},
                    {"description": "Sécurité", "niveau": "élevé|moyen|faible"}
                ],
                "contraintes": [
                    {"description": "contrainte 1", "type": "technique|budgetaire|delai|reglementaire"}
                ],
                "technologies_mentionnees": ["tech1", "tech2"],
                "budget_detecte": 250000,
                "delai_detecte": "3 mois",
                "informations_manquantes": [
                    "information manquante 1",
                    "information manquante 2"
                ],
                "score_completude": 75,
                "recommandations": [
                    "recommandation 1 pour améliorer le projet",
                    "recommandation 2"
                ]
            }

            RÈGLES :
            - Réponds UNIQUEMENT en JSON valide
            - Ne laisse aucun champ vide (utilise null si besoin)
            - Priorise les besoins critiques
            - Le score_completude reflète la qualité des informations
            - Propose des recommandations pour améliorer le projet
            `
        );
    }

    //  Méthode principale 
    async executer(donnees, sessionId, io, sessionUuid) {
        try {
            // Notifie le frontend que l'agent a démarré
            this.notifierProgression(
                io, sessionUuid,
                ' Analyse de la description du projet en cours...'
            );

            // Met à jour le statut en base : "running"
            await this.mettreAJourStatut(sessionId, 'running');

            // Prépare le message à envoyer au LLM
            // On lui donne toutes les infos disponibles
            const messageUtilisateur = `
                Analyse cette demande client et extrais les informations :
                
                DESCRIPTION DU PROJET :
                ${donnees.description_brute}
                
                INFORMATIONS COMPLÉMENTAIRES :
                - Type de projet mentionné : ${donnees.type_projet || 'non précisé'}
                - Budget mentionné : ${donnees.budget_estime || 'non précisé'}
                - Délai mentionné : ${donnees.delai_souhaite || 'non précisé'}
                - Technologies souhaitées : ${donnees.technologies_souhaitees || 'non précisé'}
                
                Retourne UNIQUEMENT le JSON structuré.
            `;

            // Appelle le LLM via la classe parente
            const reponse = await this.appelerLLM(messageUtilisateur, {
                temperature: 0.2, // Très déterministe pour l'extraction
                maxTokens: 4096
            });

            // Parse la réponse JSON du LLM
            // On nettoie d'abord les éventuels backticks
            // que le LLM pourrait ajouter malgré les instructions
            const reponseNettoyee = reponse
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            const resultat = JSON.parse(reponseNettoyee);

            // Notifie le frontend que l'agent a terminé
            this.notifierProgression(
                io, sessionUuid,
                `Collecte terminée — ${resultat.besoins_fonctionnels?.length || 0} besoins identifiés`
            );

            // Met à jour le statut en base : "done"
            await this.mettreAJourStatut(sessionId, 'done');

            return resultat;

        } catch (error) {
            // En cas d'erreur, met à jour le statut
            await this.mettreAJourStatut(sessionId, 'error');

            this.notifierProgression(
                io, sessionUuid,
                ` Erreur collecte : ${error.message}`
            );

            throw new Error(`AgentCollecte : ${error.message}`);
        }
    }
}

export default AgentCollecte;