import dotenv from 'dotenv';
dotenv.config();

import pool from './database/postgres.js';
import Orchestrateur from './services/orchestrateur.js';

async function testOrchestrateur() {
    try {
        console.log('🔍 Test de l\'orchestrateur...');
        
        // Vérifier la connexion
        const test = await pool.query('SELECT 1 as test');
        console.log('✅ Pool fonctionne');
        
        // Créer une instance
        const orchestrateur = new Orchestrateur();
        console.log('✅ Orchestrateur créé');
        
        // Vérifier les méthodes
        console.log('📋 Méthodes disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(orchestrateur)));
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error('Stack:', error.stack);
    }
}

testOrchestrateur();
