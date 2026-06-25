// ============================================================
// agents/agentGeneration.js
// Agent 3 : Génération du cahier des charges
// ============================================================

import BaseAgent from './baseAgent.js';
import { formaterContexteRAG } from '../services/ragService.js';

class AgentGeneration extends BaseAgent {
    constructor() {
        super(
            'GenerationAgent',
            `Tu es un expert en rédaction de cahiers des charges
chez EPS SARL.

Ton rôle est de générer des cahiers des charges
préliminaires professionnels, complets et structurés.

Règles importantes :
- Utilise un langage professionnel et précis
- Structure le document avec des titres Markdown clairs
- Chaque section doit être détaillée et exploitable
- Adapte le contenu au contexte spécifique du projet
- Ne laisse aucune section vide
- Le document doit être directement utilisable par EPS SARL`
        );
    }

    async executer(donnees, sessionId, io, sessionUuid) {
        try {
            this.notifierProgression(
                io,
                sessionUuid,
                'Génération du cahier des charges en cours...'
            );

            await this.mettreAJourStatut(sessionId, 'running');

            console.log('=== DONNEES RECUES PAR GENERATION AGENT ===');
            console.log(JSON.stringify(donnees, null, 2));

            // Sections standards du CDC
            const sections = [
                { nom: 'Introduction' },
                { nom: 'Contexte du projet' },
                { nom: 'Objectifs du projet' },
                { nom: 'Périmètre fonctionnel' },
                { nom: 'Exigences fonctionnelles' },
                { nom: 'Exigences non fonctionnelles' },
                { nom: 'Architecture technique' },
                { nom: 'Planning prévisionnel' },
                { nom: 'Risques et contraintes' },
                { nom: 'Critères de validation' },
                { nom: 'Livrables attendus' }
            ];

            const contexteRAG = formaterContexteRAG(
                donnees?.analyse?.documents_rag || []
            );

            const messageUtilisateur = `
${contexteRAG}

Génère un cahier des charges préliminaire COMPLET
en Markdown pour ce projet.

═══════════════════════════════════════
INFORMATIONS CLIENT
═══════════════════════════════════════

Titre du projet :
${donnees?.collecte?.titre_projet || 'Non renseigné'}

Type :
${donnees?.collecte?.type_projet || 'Non renseigné'}

Secteur :
${donnees?.collecte?.secteur_activite || 'Non renseigné'}

Objectif principal :
${donnees?.collecte?.objectif_principal || 'Non renseigné'}

Budget :
${donnees?.collecte?.budget_detecte || 'À définir'}

Délai :
${donnees?.collecte?.delai_detecte || 'À définir'}

═══════════════════════════════════════
BESOINS IDENTIFIÉS
═══════════════════════════════════════

Besoins critiques :

${
    donnees?.analyse?.analyse_besoins?.besoins_critiques?.join('\n')
    || 'Aucun besoin critique identifié'
}

Besoins importants :

${
    donnees?.analyse?.analyse_besoins?.besoins_importants?.join('\n')
    || 'Aucun besoin important identifié'
}

Besoins optionnels :

${
    donnees?.analyse?.analyse_besoins?.besoins_optionnels?.join('\n')
    || 'Aucun besoin optionnel identifié'
}

Besoins non fonctionnels :

${
    donnees?.collecte?.besoins_non_fonctionnels?.join('\n')
    || 'Aucun besoin non fonctionnel renseigné'
}

═══════════════════════════════════════
ANALYSE TECHNIQUE
═══════════════════════════════════════

Architecture recommandée :
${donnees?.analyse?.architecture_recommandee?.type || 'À définir'}

Justification :
${donnees?.analyse?.architecture_recommandee?.justification || 'À définir'}

Complexité :
${donnees?.analyse?.estimations?.complexite || 'À définir'}

Durée estimée :
${donnees?.analyse?.estimations?.duree_estimee || 'À définir'}

Équipe recommandée :

${
    donnees?.analyse?.estimations?.equipe_recommandee?.join(', ')
    || 'À définir'
}

═══════════════════════════════════════
RISQUES IDENTIFIÉS
═══════════════════════════════════════

${
    donnees?.analyse?.risques_identifies?.length
        ? donnees.analyse.risques_identifies
            .map(
                r =>
                    `- ${r.risque || 'Risque'} (niveau : ${
                        r.niveau || 'inconnu'
                    })`
            )
            .join('\n')
        : 'Aucun risque identifié'
}

═══════════════════════════════════════
CONTRAINTES
═══════════════════════════════════════

${
    donnees?.collecte?.contraintes?.join('\n')
    || 'Aucune contrainte renseignée'
}

═══════════════════════════════════════
TECHNOLOGIES SOUHAITÉES
═══════════════════════════════════════

${
    donnees?.collecte?.technologies_mentionnees?.join(', ')
    || 'Non spécifiées'
}

═══════════════════════════════════════
SECTIONS OBLIGATOIRES
═══════════════════════════════════════

${sections.map(s => `- ${s.nom}`).join('\n')}

═══════════════════════════════════════
FORMAT ATTENDU
═══════════════════════════════════════

Commence directement par :

# Cahier des Charges Préliminaire

## ${donnees?.collecte?.titre_projet || 'Projet'}

Le document doit :

- être rédigé en Markdown
- être professionnel
- inclure toutes les sections demandées
- utiliser des tableaux lorsque pertinent
- dépasser 1000 mots
`;

            const cdcMarkdown = await this.appelerLLM(
                messageUtilisateur,
                {
                    temperature: 0.8,
                    maxTokens: 4096
                }
            );

            this.notifierProgression(
                io,
                sessionUuid,
                'Cahier des charges généré avec succès'
            );

            await this.mettreAJourStatut(sessionId, 'done');

            return {
                contenu_markdown: cdcMarkdown,
                sections_generees: sections.map(s => s.nom)
            };
        } catch (error) {
            console.error('ERREUR GENERATION AGENT :', error);

            await this.mettreAJourStatut(
                sessionId,
                'error'
            );

            this.notifierProgression(
                io,
                sessionUuid,
                `Erreur génération : ${error.message}`
            );

            throw new Error(
                `AgentGeneration : ${error.message}`
            );
        }
    }
}

export default AgentGeneration;