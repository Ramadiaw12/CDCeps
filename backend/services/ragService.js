// ============================================================
// services/ragService.js
// Module RAG (Retrieval Augmented Generation)
// Recherche les anciens CDC similaires pour enrichir
// la génération de nouveaux CDC
// 

// services/ragService.js
import pool from '../database/postgres.js';
import { genererEmbedding } from './openaiService.js';

export const rechercherDocumentsSimilaires = async (
    description, 
    typeProjet = null, 
    nbResultats = 3,
    seuilSimilarite = 0.5
) => {
    try {
        console.log(`RAG : Recherche de documents similaires...`);
        
        const embeddingRequete = await genererEmbedding(description);
        
        if (!embeddingRequete) {
            console.warn(' RAG : Impossible de générer l\'embedding');
            return [];
        }

        console.log(` Embedding généré (${embeddingRequete.length} dimensions)`);

        let sql = `
            SELECT 
                d.id,
                d.title as titre,
                d.content as contenu,
                d.type_projet,
                d.secteur,
                d.mots_cles,
                d.metadata,
                d.created_at,
                1 - (de.embedding <=> $1::vector) AS score_similarite
            FROM document_embeddings de
            JOIN documents d ON d.id = de.document_id
            WHERE d.actif = TRUE
        `;

        const params = [JSON.stringify(embeddingRequete)];

        if (typeProjet) {
            sql += ` AND (d.type_projet = $2 OR d.type_projet = 'autre')`;
            params.push(typeProjet);
        }

        sql += `
            ORDER BY de.embedding <=> $1::vector
            LIMIT $${params.length + 1}
        `;
        params.push(nbResultats * 2);

        const result = await pool.query(sql, params);
        
        const documents = result.rows
            .filter(doc => doc.score_similarite >= seuilSimilarite)
            .slice(0, nbResultats)
            .map(doc => ({
                id: doc.id,
                titre: doc.titre || doc.title,
                contenu: doc.contenu || doc.content,
                type_projet: doc.type_projet,
                secteur: doc.secteur,
                mots_cles: doc.mots_cles,
                metadata: doc.metadata,
                score: parseFloat(doc.score_similarite)
            }));

        console.log(` RAG : ${documents.length} document(s) similaire(s) trouvé(s)`);
        
        return documents;

    } catch (error) {
        console.error(' Erreur RAG :', error.message);
        return [];
    }
};

export const indexerDocument = async ({
    titre,
    contenu,
    type_projet = 'autre',
    secteur = null,
    mots_cles = [],
    metadata = {}
}) => {
    const client = await pool.connect();
    
    try {
        console.log(` Indexation du document : ${titre}`);
        
        if (!contenu || contenu.length < 10) {
            throw new Error('Le contenu du document est trop court');
        }

        const contenuTronque = contenu.substring(0, 8000);
        const embedding = await genererEmbedding(contenuTronque);
        
        if (!embedding) {
            throw new Error('Impossible de générer l\'embedding');
        }

        console.log(` Embedding généré (${embedding.length} dimensions)`);

        await client.query('BEGIN');

        // Utiliser "title" et "content" au lieu de "titre" et "contenu"
        const docResult = await client.query(
            `INSERT INTO documents (
                title, 
                content, 
                type_projet, 
                secteur, 
                mots_cles, 
                metadata,
                actif
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id`,
            [
                titre,
                contenu,
                type_projet,
                secteur,
                JSON.stringify(mots_cles),
                JSON.stringify(metadata),
                true
            ]
        );

        const documentId = docResult.rows[0].id;

        await client.query(
            `INSERT INTO document_embeddings (document_id, embedding)
             VALUES ($1, $2)`,
            [documentId, JSON.stringify(embedding)]
        );

        await client.query('COMMIT');
        
        console.log(` Document indexé avec succès : ${titre} (ID: ${documentId})`);
        return documentId;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(` Erreur indexation : ${error.message}`);
        throw new Error(`Erreur indexation document : ${error.message}`);
    } finally {
        client.release();
    }
};

export const formaterContexteRAG = (documents, maxCaracteres = 1500) => {
    if (!documents || documents.length === 0) {
        return '';
    }

    let contexte = '=== ANCIENS CDC SIMILAIRES (référence) ===\n\n';

    documents.forEach((doc, index) => {
        const score = doc.score ? ` (similarité: ${(doc.score * 100).toFixed(1)}%)` : '';
        contexte += `--- Document ${index + 1} : ${doc.titre}${score} ---\n`;
        
        const contenuTronque = doc.contenu.length > maxCaracteres 
            ? doc.contenu.substring(0, maxCaracteres) + '...'
            : doc.contenu;
        
        contexte += contenuTronque;
        contexte += '\n\n';
    });

    contexte += '=== FIN DES RÉFÉRENCES ===\n\n';

    return contexte;
};

export const getDocumentById = async (id) => {
    try {
        const result = await pool.query(
            `SELECT 
                d.id,
                d.title as titre,
                d.content as contenu,
                d.type_projet,
                d.secteur,
                d.mots_cles,
                d.metadata,
                d.created_at,
                d.updated_at
             FROM documents d
             WHERE d.id = $1 AND d.actif = TRUE`,
            [id]
        );
        
        if (result.rows.length === 0) return null;
        
        const doc = result.rows[0];
        return {
            ...doc,
            mots_cles: doc.mots_cles || [],
            metadata: doc.metadata || {}
        };
    } catch (error) {
        console.error('Erreur getDocumentById:', error.message);
        return null;
    }
};

export const supprimerDocument = async (id) => {
    try {
        await pool.query(
            'UPDATE documents SET actif = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
        console.log(`Document ${id} supprimé (soft delete)`);
        return true;
    } catch (error) {
        console.error('Erreur supprimerDocument:', error.message);
        return false;
    }
};

export const listerDocuments = async (filters = {}) => {
    try {
        let sql = `
            SELECT 
                d.id,
                d.title as titre,
                d.type_projet,
                d.secteur,
                d.mots_cles,
                d.metadata,
                d.created_at,
                d.updated_at,
                LENGTH(d.content) AS taille_contenu
            FROM documents d
            WHERE d.actif = TRUE
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (filters.type_projet) {
            sql += ` AND d.type_projet = $${paramCount}`;
            params.push(filters.type_projet);
            paramCount++;
        }
        
        if (filters.secteur) {
            sql += ` AND d.secteur = $${paramCount}`;
            params.push(filters.secteur);
            paramCount++;
        }
        
        sql += ` ORDER BY d.created_at DESC`;
        
        const result = await pool.query(sql, params);
        
        return result.rows.map(doc => ({
            ...doc,
            mots_cles: doc.mots_cles || [],
            metadata: doc.metadata || {}
        }));
    } catch (error) {
        console.error('Erreur listerDocuments:', error.message);
        return [];
    }
};

export default {
    rechercherDocumentsSimilaires,
    indexerDocument,
    formaterContexteRAG,
    getDocumentById,
    supprimerDocument,
    listerDocuments
};