// scripts/test-openai.js
import dotenv from 'dotenv';
import { appelLLM, genererEmbedding, genererReponseRAG } from '../services/openaiService.js';

dotenv.config();

async function testService() {
    console.log('Test du service LLM (Gemini)\n');
    console.log('=' .repeat(50));
    
    // 1. Tester l'embedding
    console.log('\n 1. Test embedding...');
    const embedding = await genererEmbedding('Bonjour, ceci est un test');
    console.log(` Embedding: ${embedding.length} dimensions`);
    console.log(`   Premières valeurs: ${embedding.slice(0, 5).join(', ')}`);
    
    // 2. Tester le chat simple
    console.log('\n 2. Test chat simple...');
    const response = await appelLLM([
        { role: 'user', content: 'Dis-moi bonjour en français' }
    ]);
    console.log(`Réponse: "${response}"`);
    
    // 3. Tester le RAG
    console.log('\n 3. Test génération RAG...');
    const documents = [
        {
            titre: 'CDC Application Web',
            contenu: 'Application web de gestion des RH. Fonctionnalités : employés, congés, formations.',
            score: 0.95
        }
    ];
    const ragResponse = await genererReponseRAG(
        'Quelles fonctionnalités doit contenir une application RH ?',
        documents
    );
    console.log(` Réponse RAG: "${ragResponse.substring(0, 200)}..."`);
    
    console.log('\n' + '=' .repeat(50));
    console.log(' Tests terminés');
}

testService()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(' Erreur:', error);
        process.exit(1);
    });