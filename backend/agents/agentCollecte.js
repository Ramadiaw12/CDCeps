// ============================================================
// Cet agent reçoit la description brute du client et extrait toutes les informations importantes de façon structurée. Il retourne un JSON propre que l'Agent 2 va utiliser.
// agents/agentCollecte.js
// Agent 1 : Collecte et extraction des besoins
// Reçoit la description brute du client et extrait
// les informations clés sous forme structurée
// ============================================================

import BaseAgent from './baseAgent.js';

class AgentCollecte extends BaseAgent {
    constructor() {
        // Définit le prompt système de cet agent
        // C'est ce qui lui donne son comportement spécifique
        super(
            'CollecteAgent',
            `Tu es un consultant IT senior chez EPS SARL, 
            spécialisé dans l'analyse des besoins clients.
            
            Ton rôle est d'analyser la description brute d'un projet
            et d'en extraire toutes les informations pertinentes.
            
            Tu dois TOUJOURS répondre en JSON valide et rien d'autre.
            Pas d'explication, pas de texte avant ou après le JSON.
            
            Structure de ta réponse :
            {
                "titre_projet": "titre court et clair du projet",
                "type_projet": "application_web|application_mobile|erp|ecommerce|api|autre",
                "secteur_activite": "secteur métier du client",
                "objectif_principal": "objectif en une phrase claire",
                "besoins_fonctionnels": [
                    "besoin 1",
                    "besoin 2"
                ],
                "besoins_non_fonctionnels": [
                    "performance",
                    "sécurité"
                ],
                "contraintes": [
                    "contrainte 1"
                ],
                "technologies_mentionnees": [
                    "tech 1"
                ],
                "budget_detecte": "budget mentionné ou null",
                "delai_detecte": "délai mentionné ou null",
                "informations_manquantes": [
                    "information manquante 1"
                ],
                "score_completude": 75
            }
            
            Le score_completude est entre 0 et 100.
            Il représente la complétude des informations fournies.
            `
        );
    }

    // ── Méthode principale ───────────────────────────────────
    async executer(donnees, sessionId, io, sessionUuid) {
        try {
            // Notifie le frontend que l'agent a démarré
            this.notifierProgression(
                io, sessionUuid,
                '🔍 Analyse de la description du projet en cours...'
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
                maxTokens: 1500
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
                `✅ Collecte terminée — ${resultat.besoins_fonctionnels?.length || 0} besoins identifiés`
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