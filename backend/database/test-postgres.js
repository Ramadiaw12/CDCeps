import pool, { 
    testConnection, 
    insertDocumentWithEmbedding, 
    semanticSearch,
    getAllDocuments 
} from './postgres.js';

async function test() {
    console.log('Test du module PostgreSQL avec pgvector\n');
    
    // 1. Tester la connexion
    const connected = await testConnection();
    if (!connected) {
        console.log('❌ Arrêt du test');
        return;
    }
    
    // 2. Simuler un embedding (vecteur de 384 dimensions pour MiniLM)
    const mockEmbedding = new Array(384).fill(0).map(() => Math.random() * 0.1);
    
    // 3. Insérer un document test
    try {
        const id = await insertDocumentWithEmbedding(
            'Mon premier document RAG',
            'Ceci est le contenu de mon premier document pour tester le RAG avec PostgreSQL et pgvector.',
            mockEmbedding,
            { category: 'test', author: 'superrama' }
        );
        console.log(`✅ Document inséré avec l'ID: ${id}`);
    } catch (error) {
        console.error('❌ Erreur insertion:', error.message);
    }
    
    // 4. Recherche sémantique
    try {
        const results = await semanticSearch(mockEmbedding, 5);
        console.log('\n📊 Résultats de la recherche sémantique:');
        results.forEach((r, i) => {
            console.log(`  ${i+1}. ${r.title} (similarité: ${r.similarity?.toFixed(4) || 'N/A'})`);
        });
    } catch (error) {
        console.error('❌ Erreur recherche:', error.message);
    }
    
    // 5. Lister tous les documents
    try {
        const docs = await getAllDocuments();
        console.log(`\n📚 Total documents: ${docs.length}`);
        docs.forEach(d => {
            console.log(`  - ${d.id}: ${d.title}`);
        });
    } catch (error) {
        console.error('❌ Erreur liste:', error.message);
    }
    
    // Fermer le pool
    await pool.end();
    console.log('\n✅ Test terminé');
}

test();