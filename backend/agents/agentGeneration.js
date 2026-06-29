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
            `Tu es un expert en rédaction de Cahiers des Charges (CDC) de niveau ingénieur senior.
            Tu dois rédiger un CDC professionnel, exhaustif et structuré en Markdown.

            OBJECTIF : Produire un CDC de qualité professionnelle qui couvre TOUS les aspects du projet.

             STRUCTURE OBLIGATOIRE (dans l'ordre) :

            1. PRÉSENTATION DU PROJET
            - Contexte et justification du projet
            - Objectif principal et objectifs secondaires
            - Périmètre du projet (ce qui est inclus/exclu)

            2. DESCRIPTION DES BESOINS
            - Description détaillée des besoins fonctionnels
            - Description des besoins non fonctionnels (performance, sécurité, disponibilité)
            - Contraintes techniques et réglementaires

            3. ARCHITECTURE TECHNIQUE RECOMMANDÉE
            - Stack technologique proposée
            - Justification des choix techniques
            - Schéma d'architecture (description textuelle)
            - Composants principaux

            4. FONCTIONNALITÉS DÉTAILLÉES
            - Liste exhaustive des fonctionnalités
            - Priorisation (critique/important/optionnel)
            - Description de chaque fonctionnalité

            5. PLANIFICATION ET ESTIMATION
            - Estimation de la complexité (facile/moyen/complexe)
            - Durée estimée en mois/semaines
            - Équipe recommandée (rôles et compétences)
            - Phases du projet (analyse, conception, développement, tests, déploiement)

            6.  BUDGET ESTIMATIF
            - Estimation des coûts (développement, infrastructure, maintenance)
            - Hypothèses de calcul

            7.  RISQUES ET MITIGATIONS
            - Identification des risques techniques
            - Niveau de risque (faible/moyen/élevé)
            - Plan de mitigation pour chaque risque

            8.  CRITÈRES DE SUCCÈS
            - Indicateurs de performance (KPIs)
            - Conditions de validation

            9. ANNEXES
            - Glossaire des termes techniques
            - Références utiles

             INSTRUCTIONS :
            - Utilise le format Markdown pour la mise en forme
            - Sois précis, concret et professionnel
            - Utilise TOUTES les données fournies (collecte + analyse)
            - Si une section est manquante, mentionne-le clairement
            - Propose des recommandations pertinentes et justifiées

             RÉPONSE UNIQUEMENT EN MARKDOWN.
            `
        );
    }

    async executer(donnees, sessionId, io, sessionUuid) {
            try {
                this.notifierProgression(io, sessionUuid, 'Rédaction du CDC en cours...');
                await this.mettreAJourStatut(sessionId, 'running');

                // Structurer les données pour le LLM
                const collecte = donnees.collecte;
                const analyse = donnees.analyse;

                const messageUtilisateur = `
                ## 📋 DONNÉES DE COLLECTE
                ${JSON.stringify(collecte, null, 2)}

                ## 📊 DONNÉES DE L'ANALYSE
                ${JSON.stringify(analyse, null, 2)}

                ## 🎯 INSTRUCTIONS
                À partir de ces données, rédige un Cahier des Charges complet et structuré.
                Le CDC doit couvrir TOUTES les sections mentionnées dans le prompt système.
                Sois exhaustif : n'hésite pas à développer chaque section.

                🔴 POINTS D'ATTENTION :
                1. Si des données sont manquantes, propose des recommandations
                2. Utilise les recommandations techniques de l'analyse
                3. Intègre les risques identifiés dans la section dédiée
                4. Utilise les estimations fournies dans la planification
                5. Si un budget est mentionné, inclue-le dans la section budget

                📝 RÉPONSE EN MARKDOWN :
                `;

                const reponse = await this.appelerLLM(messageUtilisateur, {
                    temperature: 0.6,  // Légèrement créatif mais structuré
                    maxTokens: 8192    // Augmenté pour des CDC plus longs
                });

                // Nettoyer la réponse
                const contenu = reponse
                    .replace(/```markdown/g, '')
                    .replace(/```/g, '')
                    .trim();

                // Sauvegarder le résultat
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
