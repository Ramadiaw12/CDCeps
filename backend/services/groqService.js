// ============================================================
// services/groqService.js
// Service LLM utilisant Groq Cloud (Llama gratuit)
// ============================================================

import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

// 
// 1. INITIALISATION GROQ
// 

const groq = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
});

if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY non définie dans .env');
}

// Modèles Groq disponibles (tous gratuits)
const MODELS = [
    'llama-3.1-8b-instant',      // Rapide (gratuit)
    'mixtral-8x7b-32768',        // Bon compromis (gratuit)
    'gemma2-9b-it',              // Léger (gratuit)
];

// Modèle par défaut
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

let activeModel = null;

// 
// 2. FONCTION POUR TROUVER UN MODÈLE DISPONIBLE
// 

const findAvailableModel = async () => {
    if (activeModel) return activeModel;

    console.log('Recherche d\'un modèle Groq disponible...');

    for (const model of MODELS) {
        try {
            console.log(`Test de ${model}...`);
            const response = await groq.chat.completions.create({
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

export const appelLLM = async (messages, options = {}) => {
    const maxRetries = 3;
    let retryCount = 0;
    let retryDelay = 2000;

    while (retryCount <= maxRetries) {
        try {
            const temperature = options.temperature || 0.8;
            const maxTokens = options.maxTokens || 4096;

            const modelName = options.model || await findAvailableModel() || DEFAULT_MODEL;

            console.log(`Appel Groq (${modelName}) avec ${messages.length} messages`);

            const response = await groq.chat.completions.create({
                model: modelName,
                messages: messages,
                temperature: temperature,
                max_tokens: maxTokens,
            });

            const content = response.choices[0]?.message?.content || '';
            console.log(`Réponse reçue (${content.length} caractères)`);
            return content;

        } catch (error) {
            console.error(`❌ Erreur Groq (tentative ${retryCount + 1}):`, error.message);

            if (error.message.includes('quota') || error.message.includes('429') || error.message.includes('rate_limit')) {
                retryCount++;
                if (retryCount <= maxRetries) {
                    const waitTime = retryDelay * Math.pow(2, retryCount - 1);
                    console.log(`Limite atteinte, attente de ${waitTime/1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    activeModel = null;
                    continue;
                }
                throw new Error('❌ Limite Groq dépassée - attendez avant de réessayer');
            }

            if (error.message.includes('API key') || error.message.includes('authentication')) {
                throw new Error('❌ Clé API Groq invalide - vérifiez votre .env');
            }

            throw new Error(`❌ Erreur Groq : ${error.message}`);
        }
    }
};

// 
// 4. GÉNÉRATION D'EMBEDDING (Mock - Groq ne fournit pas d'embedding)
// 

export const genererEmbedding = async (texte) => {
    console.warn('Embedding simulé (Groq ne fournit pas d\'embedding)');
    return new Array(1536).fill(0).map(() => Math.random() * 0.1);
};

// 
// 5. FONCTIONS UTILITAIRES
// 

export const genererReponseRAG = async (query, documents, options = {}) => {
    try {
        let contexte = '';
        if (documents && documents.length > 0) {
            contexte = '\n\n=== DOCUMENTS DE RÉFÉRENCE ===\n';
            documents.forEach((doc, i) => {
                contexte += `\nDocument ${i + 1}: ${doc.titre || 'Sans titre'}\n`;
                contexte += `${(doc.contenu || '').substring(0, 1500)}\n---\n`;
            });
        }

        const messages = [
            {
                role: 'system',
                content: `Tu es un expert en rédaction de CDC. Réponds UNIQUEMENT en te basant sur les documents fournis.${contexte}`
            },
            {
                role: 'user',
                content: query
            }
        ];

        return await appelLLM(messages, options);
    } catch (error) {
        console.error('❌ Erreur RAG:', error.message);
        throw error;
    }
};

export const creerPromptCDC = (data) => {
    const { projet, type, contexte = '' } = data;
    return [
        { role: 'system', content: 'Tu es un expert en rédaction de CDC.' },
        { role: 'user', content: `Rédige un CDC pour: ${projet}\nType: ${type}\n${contexte}` }
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
