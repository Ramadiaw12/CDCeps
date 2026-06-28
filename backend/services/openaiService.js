// ============================================================
// services/openaiService.js
// Service centralisé pour communiquer avec OpenAI
// Tous les agents utilisent ce service pour appeler le LLM
// ============================================================

import dotenv from 'dotenv';
import OpenAI from 'openai';

// Charger les variables d'environnement
dotenv.config();

// ============================================================
// 1. INITIALISATION D'OPENAI
// ============================================================

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY non définie dans .env');
}

// Modèles OpenAI disponibles
const MODELS = [
    'gpt-4o',           // Le plus récent et performant
    'gpt-4-turbo',      // Bon compromis
    'gpt-3.5-turbo',    // Rapide et économique
];

// Modèle par défaut
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
const EMBEDDING_MODEL = 'text-embedding-3-small';

// Variable pour stocker le modèle actif
let activeModel = null;

// 
// 2. FONCTION POUR TROUVER UN MODÈLE DISPONIBLE
// 

const findAvailableModel = async () => {
    if (activeModel) return activeModel;

    console.log('Recherche d\'un modèle OpenAI disponible...');

    for (const model of MODELS) {
        try {
            console.log(`Test de ${model}...`);
            const response = await openai.chat.completions.create({
                model: model,
                messages: [{ role: 'user', content: 'Test' }],
                max_tokens: 5,
            });
            if (response.choices && response.choices.length > 0) {
                console.log(`Modèle ${model} disponible !`);
                activeModel = model;
                return model;
            }
        } catch (error) {
            console.log(`❌ ${model} non disponible: ${error.message}`);
        }
    }

    console.warn('Aucun modèle trouvé, utilisation du modèle par défaut');
    return DEFAULT_MODEL;
};

// 
// 3. FONCTION PRINCIPALE - APPEL LLM
// 

/**
 * Appelle le LLM (OpenAI) avec une conversation
 * @param {Array} messages - Tableau de messages {role, content}
 * @param {Object} options - Options de génération
 * @param {string} options.model - Modèle à utiliser (optionnel)
 * @param {number} options.temperature - Créativité (0-1)
 * @param {number} options.maxTokens - Longueur max de la réponse
 * @returns {Promise<string>} Réponse du LLM
 */
export const appelLLM = async (messages, options = {}) => {
    const maxRetries = 3;
    let retryCount = 0;
    let retryDelay = 2000;

    while (retryCount <= maxRetries) {
        try {
            const temperature = options.temperature || 0.8;
            const maxTokens = options.maxTokens || 4096;

            const modelName = options.model || await findAvailableModel() || DEFAULT_MODEL;

            console.log(`Appel OpenAI (${modelName}) avec ${messages.length} messages`);

            const response = await openai.chat.completions.create({
                model: modelName,
                messages: messages,
                temperature: temperature,
                max_tokens: maxTokens,
            });

            const content = response.choices[0]?.message?.content || '';
            console.log(`Réponse reçue (${content.length} caractères)`);
            return content;

        } catch (error) {
            console.error(`❌ Erreur OpenAI (tentative ${retryCount + 1}):`, error.message);

            // Gestion des erreurs de quota
            if (error.message.includes('quota') || error.message.includes('429') || error.message.includes('rate_limit')) {
                retryCount++;
                if (retryCount <= maxRetries) {
                    const waitTime = retryDelay * Math.pow(2, retryCount - 1);
                    console.log(`Quota atteint, attente de ${waitTime/1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    activeModel = null;
                    continue;
                }
                throw new Error('❌ Quota OpenAI dépassé - attendez avant de réessayer');
            }

            // Gestion des erreurs de clé API
            if (error.message.includes('API key') || error.message.includes('authentication')) {
                throw new Error('❌ Clé API OpenAI invalide - vérifiez votre .env');
            }

            throw new Error(`❌ Erreur OpenAI : ${error.message}`);
        }
    }
};

// 
// 4. GÉNÉRATION D'EMBEDDINGS
// 

/**
 * Génère un embedding (vecteur) pour un texte avec OpenAI
 * @param {string} texte - Texte à vectoriser
 * @returns {Promise<Array<number>>} Vecteur de 1536 dimensions
 */
export const genererEmbedding = async (texte) => {
    try {
        if (!texte || texte.length < 3) {
            console.warn('Texte trop court pour générer un embedding');
            return new Array(1536).fill(0);
        }

        const response = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: texte.substring(0, 8000),
        });

        const embedding = response.data[0].embedding;
        console.log(`Embedding généré (${embedding.length} dimensions)`);
        return embedding;

    } catch (error) {
        console.error('❌ Erreur embedding OpenAI:', error.message);
        return new Array(1536).fill(0).map(() => Math.random() * 0.1);
    }
};

// 
// 5. FONCTIONS UTILITAIRES
// 

/**
 * Génère une réponse RAG avec contexte
 * @param {string} query - Question de l'utilisateur
 * @param {Array} documents - Documents similaires trouvés par RAG
 * @param {Object} options - Options de génération
 * @returns {Promise<string>} Réponse générée
 */
export const genererReponseRAG = async (query, documents, options = {}) => {
    try {
        let contexte = '';
        if (documents && documents.length > 0) {
            contexte = '\n\n=== DOCUMENTS DE RÉFÉRENCE ===\n';
            documents.forEach((doc, i) => {
                const score = doc.score ? ` (similarité: ${(doc.score * 100).toFixed(1)}%)` : '';
                contexte += `\nDocument ${i + 1}: ${doc.titre || 'Sans titre'}${score}\n`;
                contexte += `${(doc.contenu || '').substring(0, 1500)}\n`;
                contexte += '---\n';
            });
            contexte += '\n=== FIN DES RÉFÉRENCES ===\n';
        }

        const messages = [
            {
                role: 'system',
                content: `Tu es un assistant expert en rédaction de Cahiers des Charges (CDC).
                Réponds UNIQUEMENT en te basant sur les documents fournis.
                Si la réponse n'est pas dans les documents, dis-le clairement.
                Sois précis, structuré et professionnel.
                ${contexte}`
            },
            {
                role: 'user',
                content: query
            }
        ];

        const response = await appelLLM(messages, options);
        return response;

    } catch (error) {
        console.error('❌ Erreur génération RAG:', error.message);
        throw error;
    }
};

/**
 * Crée un prompt structuré pour un CDC
 * @param {Object} data - Données pour le CDC
 * @param {string} data.projet - Description du projet
 * @param {string} data.type - Type de projet
 * @param {string} data.contexte - Contexte additionnel
 * @returns {Array} Messages formatés
 */
export const creerPromptCDC = (data) => {
    const { projet, type, contexte = '' } = data;

    const systemPrompt = `Tu es un expert en rédaction de Cahiers des Charges (CDC).
Tu dois rédiger un CDC professionnel, structuré et complet.
Le CDC doit contenir : 
1. Présentation du projet
2. Objectifs
3. Fonctionnalités détaillées
4. Contraintes techniques
5. Planning indicatif
6. Budget estimatif`;

    const userPrompt = `Rédige un CDC pour : ${projet}
Type de projet : ${type}
${contexte ? `Contexte supplémentaire : ${contexte}` : ''}`;

    return [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];
};

// 
// 6. EXPORT
// 

export default {
    appelLLM,
    genererEmbedding,
    genererReponseRAG,
    creerPromptCDC
};