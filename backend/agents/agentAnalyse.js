// ============================================================
// agents/agentAnalyse.js
// Cet agent prend le résultat structuré de l'Agent collecte et fait une analyse approfondie — il classe les besoins par priorité, détecte les risques, et enrichit le contexte avec les documents RAG.
// Agent 2 : Analyse et classification des besoins
// Prend le résultat de l'Agent 1 et produit une analyse
// approfondie enrichie par le module RAG
// ============================================================

import BaseAgent from './baseAgent.js';
import {
    rechercherDocumentsSimilaires, 
    formaterContexteRAG 
} from '../services/ragService.js';

class AgentAnalyse extends BaseAgent {
    constructor() {
        super(
            'AnalyseAgent',
            `Tu es un architecte logiciel senior chez EPS SARL
            avec 10 ans d'expérience dans l'analyse de projets IT.
            
            Ton rôle est d'analyser en profondeur les besoins extraits
            et de produire une analyse structurée qui servira de base
            à la génération du cahier des charges.
            
            Tu dois TOUJOURS répondre en JSON valide et rien d'autre.
            
            Structure de ta réponse :
            {
                "analyse_besoins": {
                    "besoins_critiques": ["besoin prioritaire 1"],
                    "besoins_importants": ["besoin important 1"],
                    "besoins_optionnels": ["besoin optionnel 1"]
                },
                "architecture_recommandee": {
                    "type": "monolithique|microservices|serverless",
                    "justification": "pourquoi ce choix",
                    "composants_principaux": ["composant 1"]
                },
                "risques_identifies": [
                    {
                        "risque": "description du risque",
                        "niveau": "faible|moyen|élevé",
                        "mitigation": "comment atténuer ce risque"
                    }
                ],
                "estimations": {
                    "complexite": "faible|moyenne|élevée",
                    "duree_estimee": "X mois",
                    "equipe_recommandee": ["rôle 1", "rôle 2"]
                },
                "points_attention": ["point important 1"],
                "recommandations_techniques": ["recommandation 1"]
            }
            `
        );
    }

    async executer(donnees, sessionId, io, sessionUuid) {
        try {
            this.notifierProgression(
                io, sessionUuid,
                '🔎 Analyse approfondie des besoins en cours...'
            );

            await this.mettreAJourStatut(sessionId, 'running');

            // ── Étape RAG ────────────────────────────────────
            // Recherche les anciens CDC similaires avant
            // de lancer l'analyse — ça enrichit le contexte
            this.notifierProgression(
                io, sessionUuid,
                '📚 Recherche de projets similaires dans la base...'
            );

            const documentsSimilaires = await rechercherDocumentsSimilaires(
                // On cherche sur la base de la description
                // et du type de projet détecté par l'Agent 1
                donnees.collecte.objectif_principal,
                donnees.collecte.type_projet
            );

            // Formate les documents trouvés en texte
            // pour les injecter dans le prompt
            const contexteRAG = formaterContexteRAG(documentsSimilaires);

            // Prépare le message avec le contexte RAG
            const messageUtilisateur = `
                ${contexteRAG}
                
                Analyse ces besoins extraits du projet client :
                
                INFORMATIONS DU PROJET :
                - Titre : ${donnees.collecte.titre_projet}
                - Type : ${donnees.collecte.type_projet}
                - Secteur : ${donnees.collecte.secteur_activite}
                - Objectif : ${donnees.collecte.objectif_principal}
                
                BESOINS FONCTIONNELS :
                ${donnees.collecte.besoins_fonctionnels?.join('\n') || 'Non définis'}
                
                BESOINS NON FONCTIONNELS :
                ${donnees.collecte.besoins_non_fonctionnels?.join('\n') || 'Non définis'}
                
                CONTRAINTES :
                ${donnees.collecte.contraintes?.join('\n') || 'Aucune contrainte mentionnée'}
                
                TECHNOLOGIES SOUHAITÉES :
                ${donnees.collecte.technologies_mentionnees?.join(', ') || 'Non précisé'}
                
                BUDGET : ${donnees.collecte.budget_detecte || 'Non précisé'}
                DÉLAI : ${donnees.collecte.delai_detecte || 'Non précisé'}
                
                ${documentsSimilaires.length > 0 
                    ? `Tu as accès à ${documentsSimilaires.length} projet(s) similaire(s) 
                       comme référence. Utilise-les pour enrichir ton analyse.`
                    : ''
                }
                
                Retourne UNIQUEMENT le JSON d'analyse.
            `;

            const reponse = await this.appelerLLM(messageUtilisateur, {
                temperature: 0.3,
                maxTokens: 2000
            });

            const reponseNettoyee = reponse
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            const resultat = JSON.parse(reponseNettoyee);

            // Ajoute les documents RAG au résultat
            // pour que l'Agent 3 puisse aussi les utiliser
            resultat.documents_rag = documentsSimilaires;

            this.notifierProgression(
                io, sessionUuid,
                `✅ Analyse terminée — complexité : ${resultat.estimations?.complexite}`
            );

            await this.mettreAJourStatut(sessionId, 'done');

            return resultat;

        } catch (error) {
            await this.mettreAJourStatut(sessionId, 'error');

            this.notifierProgression(
                io, sessionUuid,
                `❌ Erreur analyse : ${error.message}`
            );

            throw new Error(`AgentAnalyse : ${error.message}`);
        }
    }
}

export default AgentAnalyse;