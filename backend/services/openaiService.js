// ============================================================
// services/openaiService.js
// Service centralisé pour communiquer avec les LLM
// Tous les agents utilisent ce service pour appeler le LLM
// 
// MIGRATION : Utilise désormais Google Gemini
// ============================================================

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Charger les variables d'environnement
dotenv.config();

// ============================================================
// 1. INITIALISATION DE GEMINI
// ============================================================

// Initialiser le client Gemini avec la clé API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Vérifier que la clé est définie
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY non définie dans .env');
}

// MODÈLES GEMINI CORRECTS
// gemini-1.5-pro : Le plus récent et le plus performant (recommandé)
// gemini-2.0-flash-exp : Modèle expérimental rapide
// gemini-1.5-flash : Modèle rapide et économique
// gemini-pro : Ancien modèle (peut ne plus être disponible)
const DEFAULT_MODEL = 'gemini-1.5-pro';    // Modèle par défaut
const EMBEDDING_MODEL = 'embedding-001';   // Modèle d'embedding

// Liste des modèles de fallback si le modèle par défaut échoue
const MODEL_FALLBACKS = [
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-pro'
];

// ============================================================
// 2. FONCTION PRINCIPALE - APPEL LLM
// ============================================================

/**
 * Appelle le LLM (Gemini) avec une conversation
 * @param {Array} messages - Tableau de messages {role, content}
 * @param {Object} options - Options de génération
 * @param {string} options.model - Modèle à utiliser
 * @param {number} options.temperature - Créativité (0-1)
 * @param {number} options.maxTokens - Longueur max de la réponse
 * @returns {Promise<string>} Réponse du LLM
 */
export const appelLLM = async (messages, options = {}) => {
    try {
        // Extraire les options avec des valeurs par défaut
        let model = options.model || DEFAULT_MODEL;
        const temperature = options.temperature || 0.8;
        const maxTokens = options.maxTokens || 2000;

        console.log(`🔮 Appel LLM (${model}) avec ${messages.length} messages`);

        // Vérifier si le modèle est disponible, sinon utiliser un fallback
        let modelDisponible = false;
        for (const fallback of MODEL_FALLBACKS) {
            try {
                const testModel = genAI.getGenerativeModel({ model: fallback });
                // Test rapide pour vérifier si le modèle existe
                await testModel.generateContent('test');
                if (fallback !== model) {
                    console.log(`⚠️ Modèle ${model} non disponible, utilisation de ${fallback} à la place`);
                    model = fallback;
                }
                modelDisponible = true;
                break;
            } catch (error) {
                // Ignorer l'erreur, essayer le modèle suivant
            }
        }

        // Si aucun modèle n'est disponible, lancer une erreur
        if (!modelDisponible) {
            throw new Error('Aucun modèle Gemini disponible. Vérifiez votre clé API.');
        }

        // Construire le prompt à partir des messages
        let prompt = '';
        let systemInstruction = '';

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemInstruction = msg.content;
            } else if (msg.role === 'user') {
                prompt += `Utilisateur: ${msg.content}\n`;
            } else if (msg.role === 'assistant') {
                prompt += `Assistant: ${msg.content}\n`;
            }
        }

        // Préparer le contenu final
        const fullPrompt = systemInstruction 
            ? `${systemInstruction}\n\n${prompt}Assistant: `
            : `${prompt}Assistant: `;

        // Appeler Gemini avec le bon modèle
        const generativeModel = genAI.getGenerativeModel({
            model: model,
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: maxTokens,
            }
        });

        // Générer la réponse
        const result = await generativeModel.generateContent(fullPrompt);
        const response = result.response.text();

        console.log(`✅ Réponse reçue (${response.length} caractères)`);
        return response;

    } catch (error) {
        console.error('❌ Erreur Gemini:', error.message);
        
        // Gestion des erreurs spécifiques
        if (error.message.includes('API key')) {
            throw new Error('❌ Clé API Gemini invalide - vérifiez votre .env');
        }
        if (error.message.includes('quota')) {
            throw new Error('❌ Quota Gemini dépassé - attendez avant de réessayer');
        }
        if (error.message.includes('429')) {
            throw new Error('❌ Trop de requêtes - attendez quelques instants');
        }
        if (error.message.includes('not found')) {
            throw new Error('❌ Modèle Gemini non disponible - vérifiez le nom du modèle');
        }
        
        throw new Error(`❌ Erreur Gemini : ${error.message}`);
    }
};

// ============================================================
// 3. GÉNÉRATION D'EMBEDDINGS AVEC GEMINI
// ============================================================

/**
 * Génère un embedding (vecteur) pour un texte avec Gemini
 * @param {string} texte - Texte à vectoriser
 * @returns {Promise<Array<number>>} Vecteur de 768 dimensions
 */
export const genererEmbedding = async (texte) => {
    try {
        // Vérifier que le texte est valide
        if (!texte || texte.length < 3) {
            console.warn('⚠️ Texte trop court pour générer un embedding');
            return new Array(768).fill(0);
        }

        // Tronquer le texte si trop long (limite Gemini)
        const texteTronque = texte.substring(0, 8000);
        
        // Utiliser le modèle d'embedding
        const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
        const result = await model.embedContent(texteTronque);
        
        // Gemini retourne un objet avec la propriété 'embedding'
        const embedding = result.embedding.values;
        
        console.log(`✅ Embedding généré (${embedding.length} dimensions)`);
        return embedding;

    } catch (error) {
        console.error('❌ Erreur embedding Gemini:', error.message);
        
        // Fallback : retourner un embedding aléatoire pour ne pas bloquer
        console.warn('⚠️ Utilisation d\'un embedding aléatoire comme fallback');
        return new Array(768).fill(0).map(() => Math.random() * 0.1);
    }
};

// ============================================================
// 4. FONCTIONS UTILITAIRES
// ============================================================

/**
 * Génère une réponse RAG avec contexte
 * @param {string} query - Question de l'utilisateur
 * @param {Array} documents - Documents similaires trouvés par RAG
 * @param {Object} options - Options de génération
 * @returns {Promise<string>} Réponse générée
 */
export const genererReponseRAG = async (query, documents, options = {}) => {
    try {
        // Construire le contexte à partir des documents
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

        // Construire les messages
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

        // Appeler le LLM
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

// ============================================================
// 5. EXPORT
// ============================================================

export default {
    appelLLM,
    genererEmbedding,
    genererReponseRAG,
    creerPromptCDC
};