import dotenv from 'dotenv';
dotenv.config();

import { appelLLM } from './services/groqService.js';

async function test() {
    try {
        console.log('🔍 Test de Groq/Llama...');
        const response = await appelLLM([
            { role: 'user', content: 'Dis bonjour en un mot' }
        ]);
        console.log('✅ Réponse:', response);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

test();
