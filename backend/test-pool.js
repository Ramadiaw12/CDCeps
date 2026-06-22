import pool from './database/postgres.js';

async function testConnexion() {
    try {
        console.log('🔍 Test de connexion...');
        const result = await pool.query('SELECT NOW() as time, current_user as user, current_database() as db');
        console.log('✅ Connexion réussie !');
        console.log('   Heure:', result.rows[0].time);
        console.log('   Utilisateur:', result.rows[0].user);
        console.log('   Base:', result.rows[0].db);
        
        // Tester une table
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('   Tables:', tables.rows.map(r => r.table_name).join(', '));
        
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        console.error('   Détails:', error.stack);
    }
}

testConnexion();