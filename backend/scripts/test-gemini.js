// scripts/test-gemini.js
import dotenv from 'dotenv';
import { generateEmbedding, chatWithGemini } from '../services/gemini.js';

dotenv.config();

async function testGemini() {
    console.log(' Test de Gemini\n');
    console.log('=' .repeat(50));
    
    // 1. Tester l'embedding
    console.log('\n 1. Test embedding...');
    const embedding = await generateEmbedding('Bonjour, ceci est un test');
    
    if (embedding) {
        console.log(`✅ Embedding généré: ${embedding.length} dimensions`);
        console.log(`   Premieres valeurs: ${embedding.slice(0, 5).join(', ')}...`);
    } else {
        console.log('❌ Échec de l\'embedding');
    }
    
    // 2. Tester le chat
    console.log('\n📌 2. Test chat...');
    const response = await chatWithGemini('Dis-moi bonjour en français');
    
    if (response) {
        console.log('✅ Réponse reçue:');
        console.log(`   "${response}"`);
    } else {
        console.log('❌ Échec du chat');
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Test terminé');
}

testGemini()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });