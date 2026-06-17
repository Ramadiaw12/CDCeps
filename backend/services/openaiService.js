// ============================================================
// services/openaiService.js
// Service centralisé pour communiquer avec les LLM
// Tous les agents utilisent ce service pour appeler le LLM
// 
// MIGRATION : Utilise désormais Google Gemini
// ============================================================

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

// services/openaiService.js - Version corrigée

import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

if (!API_KEY) {
    console.error('❌ GOOGLE_API_KEY non définie dans .env');
}

// ✅ Modèles corrects pour l'API v1beta
const DEFAULT_MODEL = 'gemini-1.5-flash';
const EMBEDDING_MODEL = 'embedding-001';

// ============================================================
// 1. GÉNÉRATION D'EMBEDDINGS AVEC L'API REST
// ============================================================

export const genererEmbedding = async (texte) => {
    try {
        if (!texte || texte.length < 3) {
            console.warn('⚠️ Texte trop court');
            return new Array(768).fill(0);
        }

        const texteTronque = texte.substring(0, 8000);
        
        // ✅ Utiliser l'API REST directement
        const response = await fetch(
            `${BASE_URL}/models/${EMBEDDING_MODEL}:embedContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: `models/${EMBEDDING_MODEL}`,
                    content: {
                        parts: [{ text: texteTronque }]
                    }
                })
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ HTTP ${response.status}:`, errorText);
            return new Array(768).fill(0);
        }
        
        const data = await response.json();
        const embedding = data.embedding.values;
        
        console.log(`✅ Embedding généré (${embedding.length} dimensions)`);
        return embedding;

    } catch (error) {
        console.error('❌ Erreur embedding Gemini:', error.message);
        return new Array(768).fill(0);
    }
};

// ============================================================
// 2. APPEL LLM AVEC L'API REST
// ============================================================

export const appelLLM = async (messages, options = {}) => {
    try {
        const model = options.model || DEFAULT_MODEL;
        const temperature = options.temperature || 0.8;
        
        console.log(`🤖 Appel LLM (${model})`);

        let prompt = '';
        for (const msg of messages) {
            if (msg.role === 'user') {
                prompt += `Utilisateur: ${msg.content}\n`;
            } else if (msg.role === 'assistant') {
                prompt += `Assistant: ${msg.content}\n`;
            } else if (msg.role === 'system') {
                prompt = `${msg.content}\n\n${prompt}`;
            }
        }

        const response = await fetch(
            `${BASE_URL}/models/${model}:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: temperature,
                        maxOutputTokens: options.maxTokens || 2000,
                    }
                })
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error('❌ Erreur Gemini:', error.message);
        throw new Error(`Erreur Gemini : ${error.message}`);
    }
};

// ============================================================
// 3. AUTRES FONCTIONS
// ============================================================

export const genererReponseRAG = async (query, documents, options = {}) => {
    let contexte = '';
    if (documents && documents.length > 0) {
        contexte = '\n\n=== DOCUMENTS DE RÉFÉRENCE ===\n';
        documents.forEach((doc, i) => {
            const score = doc.score ? ` (similarité: ${(doc.score * 100).toFixed(1)}%)` : '';
            contexte += `\nDocument ${i + 1}: ${doc.titre}${score}\n`;
            contexte += `${doc.contenu.substring(0, 1500)}\n`;
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
            ${contexte}`
        },
        {
            role: 'user',
            content: query
        }
    ];

    return appelLLM(messages, options);
};

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

export default {
    appelLLM,
    genererEmbedding,
    genererReponseRAG,
    creerPromptCDC
};