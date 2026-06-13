// ============================================================
// services/openaiService.js
// Service centralisé pour communiquer avec l'API OpenAI
// Tous les agents utilisent ce service pour appeler le LLM
// ============================================================

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialise le client Grok avec la clé du .env
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Fonction principale

// Cette fonction est appelée par chaque agent
// Elle prend un tableau de messages (conversation) et
// retourne la réponse du LLM sous forme de texte
export const appelLLM = async (messages, options = {}) => {
    try {
        const response = await openai.chat.completions.create({
            // Le modèle à utiliser
            model: options.model || 'gpt-4o-mini',

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
            // Pour les CDC on veut quelque chose de précis : 0.3
            temperature: options.temperature || 0.3,
        });

        // Extrait le texte de la réponse
        return response.choices[0].message.content;

    } catch (error) {
        // Gestion des erreurs spécifiques à OpenAI
        if (error.status === 401) {
            throw new Error('Clé API OpenAI invalide — vérifiez votre .env');
        }
        if (error.status === 429) {
            throw new Error('Quota OpenAI dépassé — attendez avant de réessayer');
        }
        if (error.status === 500) {
            throw new Error('Erreur serveur OpenAI — réessayez dans quelques instants');
        }
        throw new Error(`Erreur OpenAI : ${error.message}`);
    }
};

// Fonction pour générer les embeddings 

// Les embeddings sont des représentations numériques (vecteurs)
// d'un texte. Deux textes similaires auront des vecteurs proches.
// Le module RAG utilise ça pour trouver les anciens CDC
// similaires au projet en cours.
export const genererEmbedding = async (texte) => {
    try {
        const response = await openai.embeddings.create({
            // Modèle d'embedding d'OpenAI
            model: 'text-embedding-3-small',

            // Le texte à convertir en vecteur numérique
            input: texte,
        });

        // Retourne le tableau de nombres (vecteur)
        return response.data[0].embedding;

    } catch (error) {
        throw new Error(`Erreur génération embedding : ${error.message}`);
    }
};