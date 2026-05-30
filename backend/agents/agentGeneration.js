// ============================================================
// agents/agentGeneration.js
// Agent 3 : Génération du cahier des charges
// Prend les résultats des Agents 1 et 2 et génère like agent collecte and agent analyse
// le CDC complet en Markdown professionnel
// ============================================================

import BaseAgent from './baseAgent.js';
import pool from '../database/mysql.js';
import { formaterContexteRAG } from '../services/ragService.js';

class AgentGeneration extends BaseAgent {
    constructor() {
        super(
            'GenerationAgent',
            `Tu es un expert en rédaction de cahiers des charges
            chez EPS SARL, une société de services informatiques.
            
            Ton rôle est de générer des cahiers des charges
            préliminaires professionnels, complets et structurés avec des titres en gras 
            aux formats Markdown.
            
            Règles importantes :
            - Utilise un langage professionnel et précis
            - Structure le document avec des titres Markdown clairs et un grand trait pour séparer les différents titres
            - Chaque section doit être détaillée et exploitable
            - Adapte le contenu au contexte spécifique du projet
            - Ne laisse aucune section vide
            - Le document doit être directement utilisable par EPS SARL
            `
        );
    }

    async executer(donnees, sessionId, io, sessionUuid) {
        try {
            this.notifierProgression(
                io, sessionUuid,
                'Génération du cahier des charges en cours...'
            );

            await this.mettreAJourStatut(sessionId, 'running');

            // Récupère les sections standards depuis la base
            // Ces sections définissent la structure du CDC
            const [sections] = await pool.execute(
                `SELECT nom, description, prompt_template
                 FROM sections_cdc
                 WHERE actif = TRUE
                 ORDER BY ordre ASC`
            );

            // Récupère le contexte RAG des agents précédents
            const contexteRAG = formaterContexteRAG(
                donnees.analyse.documents_rag || []
            );

            // Prépare le message de génération
            const messageUtilisateur = `
                ${contexteRAG}
                
                Génère un cahier des charges préliminaire COMPLET
                en Markdown pour ce projet :
                
                ═══════════════════════════════════════
                INFORMATIONS CLIENT
                ═══════════════════════════════════════
                Titre du projet : ${donnees.collecte.titre_projet}
                Type : ${donnees.collecte.type_projet}
                Secteur : ${donnees.collecte.secteur_activite}
                Objectif : ${donnees.collecte.objectif_principal}
                Budget : ${donnees.collecte.budget_detecte || 'À définir'}
                Délai : ${donnees.collecte.delai_detecte || 'À définir'}
                
                ═══════════════════════════════════════
                BESOINS IDENTIFIÉS
                ═══════════════════════════════════════
                Besoins fonctionnels critiques :
                ${donnees.analyse.analyse_besoins?.besoins_critiques?.join('\n') || ''}
                
                Besoins fonctionnels importants :
                ${donnees.analyse.analyse_besoins?.besoins_importants?.join('\n') || ''}
                
                Besoins optionnels :
                ${donnees.analyse.analyse_besoins?.besoins_optionnels?.join('\n') || ''}
                
                Besoins non fonctionnels :
                ${donnees.collecte.besoins_non_fonctionnels?.join('\n') || ''}
                
                ═══════════════════════════════════════
                ANALYSE TECHNIQUE
                ═══════════════════════════════════════
                Architecture recommandée : ${donnees.analyse.architecture_recommandee?.type}
                Justification : ${donnees.analyse.architecture_recommandee?.justification}
                Complexité : ${donnees.analyse.estimations?.complexite}
                Durée estimée : ${donnees.analyse.estimations?.duree_estimee}
                Équipe recommandée : ${donnees.analyse.estimations?.equipe_recommandee?.join(', ')}
                
                Risques identifiés :
                ${donnees.analyse.risques_identifies?.map(r => 
                    `- ${r.risque} (niveau: ${r.niveau})`
                ).join('\n') || ''}
                
                Contraintes :
                ${donnees.collecte.contraintes?.join('\n') || ''}
                
                Technologies souhaitées :
                ${donnees.collecte.technologies_mentionnees?.join(', ') || ''}
                
                ═══════════════════════════════════════
                SECTIONS À INCLURE OBLIGATOIREMENT
                ═══════════════════════════════════════
                ${sections.map(s => `- ${s.nom}`).join('\n')}
                
                ═══════════════════════════════════════
                FORMAT ATTENDU
                ═══════════════════════════════════════
                Commence directement par :
                # Cahier des Charges Préliminaire
                ## ${donnees.collecte.titre_projet}
                
                Ensuite inclus toutes les sections listées ci-dessus.
                Utilise des tableaux Markdown quand c'est pertinent.
                Utilise des listes à puces pour les énumérations.
                Le document doit faire au minimum 1000 mots.
            `;

            // Génère le CDC on augmente les tokens
            // car le document doit être long et complet
            const cdcMarkdown = await this.appelerLLM(messageUtilisateur, {
                temperature: 0.8,
                maxTokens: 4000
            });

            this.notifierProgression(
                io, sessionUuid,
                '✅ Cahier des charges généré avec succès'
            );

            await this.mettreAJourStatut(sessionId, 'done');

            return {
                contenu_markdown: cdcMarkdown,
                sections_generees: sections.map(s => s.nom)
            };

        } catch (error) {
            await this.mettreAJourStatut(sessionId, 'error');

            this.notifierProgression(
                io, sessionUuid,
                `Erreur génération : ${error.message}`
            );

            throw new Error(`AgentGeneration : ${error.message}`);
        }
    }
}

export default AgentGeneration;