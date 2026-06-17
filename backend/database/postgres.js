// ============================================================
// database/postgres.js
// Gestion de la connexion à PostgreSQL avec pgvector
// ============================================================

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
// Crée un pool de connexions PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    // Nombre maximum de connexions
    max: 10,
    
    // Temps d'inactivité avant fermeture (ms)
    idleTimeoutMillis: 30000,
    
    // Temps d'attente max pour une connexion
    connectionTimeoutMillis: 2000,
});

// Fonction de test de connexion
export const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Connexion PostgreSQL établie avec succès');
        
        // Vérifie que pgvector est installé
        const result = await client.query(
            "SELECT * FROM pg_extension WHERE extname = 'vector'"
        );
        
        if (result.rows.length === 0) {
            console.warn('pgvector n\'est pas installé !');
        } else {
            console.log('pgvector est installé');
        }
        
        client.release();
        return true;
    } catch (error) {
        console.error('Erreur de connexion PostgreSQL :', error.message);
        return false;
    }
};

// ============================================================
// FONCTIONS POUR LE RAG
// ============================================================

// 1. Insérer un document avec son embedding
export const insertDocumentWithEmbedding = async (title, content, embedding, metadata = {}) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Insérer le document
        const docResult = await client.query(
            `INSERT INTO documents (title, content, metadata) 
             VALUES ($1, $2, $3) 
             RETURNING id`,
            [title, content, metadata]
        );
        
        const documentId = docResult.rows[0].id;
        
        // Insérer l'embedding (table document_embeddings)
        await client.query(
            `INSERT INTO document_embeddings (document_id, embedding) 
             VALUES ($1, $2)`,
            [documentId, JSON.stringify(embedding)]
        );
        
        await client.query('COMMIT');
        return documentId;
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// 2. Recherche sémantique (recherche par similarité de vecteurs)
export const semanticSearch = async (queryEmbedding, limit = 5) => {
    const query = `
        SELECT 
            d.id,
            d.title,
            d.content,
            d.metadata,
            1 - (de.embedding <=> $1::vector) AS similarity
        FROM document_embeddings de
        JOIN documents d ON d.id = de.document_id
        ORDER BY de.embedding <=> $1::vector
        LIMIT $2
    `;
    
    const result = await pool.query(query, [JSON.stringify(queryEmbedding), limit]);
    return result.rows;
};

// 3. Recherche hybride (sémantique + mots-clés)
export const hybridSearch = async (queryText, queryEmbedding, limit = 5) => {
    const query = `
        WITH semantic_results AS (
            SELECT 
                d.id,
                d.title,
                d.content,
                d.metadata,
                1 - (de.embedding <=> $1::vector) AS semantic_score
            FROM document_embeddings de
            JOIN documents d ON d.id = de.document_id
            ORDER BY de.embedding <=> $1::vector
            LIMIT $2 * 2
        ),
        keyword_results AS (
            SELECT 
                d.id,
                ts_rank(to_tsvector('french', d.content), plainto_tsquery('french', $3)) AS keyword_score
            FROM documents d
            WHERE to_tsvector('french', d.content) @@ plainto_tsquery('french', $3)
        )
        SELECT 
            s.id,
            s.title,
            s.content,
            s.metadata,
            (s.semantic_score * 0.7 + COALESCE(k.keyword_score, 0) * 0.3) AS combined_score
        FROM semantic_results s
        LEFT JOIN keyword_results k ON k.id = s.id
        ORDER BY combined_score DESC
        LIMIT $2
    `;
    
    const result = await pool.query(query, [JSON.stringify(queryEmbedding), limit, queryText]);
    return result.rows;
};

// 4. Récupérer un document par ID
export const getDocumentById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM documents WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
};

// 5. Récupérer tous les documents
export const getAllDocuments = async () => {
    const result = await pool.query(
        'SELECT id, title, content, metadata, created_at FROM documents ORDER BY id'
    );
    return result.rows;
};

// 6. Supprimer un document et son embedding
export const deleteDocument = async (id) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Supprimer l'embedding
        await client.query(
            'DELETE FROM document_embeddings WHERE document_id = $1',
            [id]
        );
        
        // Supprimer le document
        await client.query(
            'DELETE FROM documents WHERE id = $1',
            [id]
        );
        
        await client.query('COMMIT');
        return true;
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Export du pool par défaut
export default pool;