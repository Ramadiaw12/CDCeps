import pool from './database/postgres.js';

console.log('🧪 Test de connexion PostgreSQL...\n');

try {
    const client = await pool.connect();
    console.log('✅ Connexion PostgreSQL réussie !');
    
    const result = await client.query('SELECT version()');
    console.log('📦 Version:', result.rows[0].version);
    
    const dbResult = await client.query('SELECT current_database()');
    console.log('📁 Base de données:', dbResult.rows[0].current_database);
    
    const userResult = await client.query('SELECT current_user');
    console.log('👤 Utilisateur:', userResult.rows[0].current_user);
    
    client.release();
    await pool.end();
    console.log('\n✅ Test terminé avec succès');
} catch (err) {
    console.error('❌ Erreur de connexion:', err.message);
    console.error('🔍 Détails:', err);
}
