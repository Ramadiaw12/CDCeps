// scripts/search-rag.js
// Recherche RAG avec Gemini

import dotenv from 'dotenv';
import { semanticSearch, getAllDocuments } from '../database/postgres.js';
import { generateEmbedding, generateRAGResponse } from '../services/gemini.js';
import pool from '../database/postgres.js';

dotenv.config();

async function searchRAG(query, topK = 3) {
    console.log(`🔍 Recherche: "${query}"\n`);
    console.log('=' .repeat(50));
    
    // 1. Générer l'embedding de la requête
    console.log('🔄 Génération de l\'embedding...');
    const queryEmbedding = await generateEmbedding(query);
    
    if (!queryEmbedding) {
        console.log('❌ Erreur: impossible de générer l\'embedding');
        return;
    }
    
    console.log(`✅ Embedding généré (${queryEmbedding.length} dimensions)\n`);
    
    // 2. Recherche sémantique
    console.log(`🔎 Recherche des ${topK} documents similaires...`);
    const results = await semanticSearch(queryEmbedding, topK);
    
    if (results.length === 0) {
        console.log('❌ Aucun document trouvé');
        return;
    }
    
    console.log(`✅ ${results.length} documents trouvés\n`);
    
    // 3. Afficher les résultats
    results.forEach((doc, i) => {
        const sim = (doc.similarity * 100).toFixed(2);
        console.log(`📄 ${i + 1}. ${doc.title}`);
        console.log(`   Similarité: ${sim}%`);
        console.log(`   ${doc.content.substring(0, 200)}...`);
        console.log('');
    });
    
    // 4. Générer une réponse avec Gemini
    console.log('🤖 Génération de la réponse avec Gemini...\n');
    const response = await generateRAGResponse(query, results);
    
    if (response) {
        console.log('📝 RÉPONSE:');
        console.log('─'.repeat(50));
        console.log(response);
        console.log('─'.repeat(50));
    }
    
    return results;
}

// Lire la requête depuis la ligne de commande
const query = process.argv[2] || 'Qu\'est-ce que le RAG ?';
const topK = parseInt(process.argv[3]) || 3;

searchRAG(query, topK)
    .then(() => {
        console.log('\n✅ Recherche terminée');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });