// ============================================================
// services/openaiService.js
// Service centralisé pour communiquer avec l'API OpenAI
// Tous les agents utilisent ce service pour appeler le LLM
// ============================================================

// import OpenAI from 'openai';
// import dotenv from 'dotenv';
// dotenv.config();
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const openai = new Groq({
    apiKey: process.env.GROQ_API_KEY
});




// Initialise le client Grok avec la clé du .env
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// });

// Fonction principale

// Cette fonction est appelée par chaque agent
// Elle prend un tableau de messages (conversation) et
// retourne la réponse du LLM sous forme de texte
export const appelLLM = async (messages, options = {}) => {
    try {
        const response = await openai.chat.completions.create({
            // Le modèle à utiliser
            model: options.model || 'llama-3.3-70b-versatile',

            // Les messages de la conversation
            // Chaque message a un "role" : system, user, ou assistant
            // - system  : instructions de comportement de l'agent
            // - user    : ce que l'utilisateur envoie
            // - assistant : réponse précédente du LLM (pour le contexte)
            messages: messages,

            // Longueur maximale de la réponse en tokens
            // 1 token ≈ 0.75 mot en français
            max_tokens: options.maxTokens || 2000,

            // Créativité de la réponse (0 = déterministe, 1 = créatif)
            // Pour les CDC on veut quelque chose de précis : 0.8
            temperature: options.temperature || 0.8,
        });

        // Extrait le texte de la réponse
        return response.choices[0].message.content;

    } catch (error) {
        if (error.status === 401) {
            throw new Error('Clé API Groq invalide — vérifiez votre .env');
        }
        if (error.status === 429) {
            throw new Error('Quota Groq dépassé — attendez avant de réessayer');
        }
        if (error.status === 500) {
            throw new Error('Erreur serveur Groq — réessayez dans quelques instants');
        }
        throw new Error(`Erreur Groq : ${error.message}`);
    }
};

// Fonction pour générer les embeddings 

// Les embeddings sont des représentations numériques (vecteurs)
// d'un texte. Deux textes similaires auront des vecteurs proches.
// Le module RAG utilise ça pour trouver les anciens CDC
// similaires au projet en cours.
export const genererEmbedding = async (texte) => {
    // Groq ne supporte pas les embeddings natifs
    // On génère un vecteur basé sur les caractères du texte
    // comme fallback simple
    const vecteur = new Array(384).fill(0).map((_, i) => {
        const char = texte.charCodeAt(i % texte.length) || 0;
        return (char / 127) * (i % 2 === 0 ? 1 : -1);
    });
    return vecteur;
};